import logging
import re
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse, Response
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_ref, get_current_user
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, ControlApplicability
from ..services import storage_service
from ..services.batch_loaders import (
    load_controls_by_ids,
    load_mappings_by_item_ids,
    load_matrix_by_item_ids,
)

logger = logging.getLogger(__name__)
from ..models.framework import (
    AuditFramework, Control, EvidenceDomain, CanonicalEvidenceItem,
    ItemControlMapping, CrossDomainDependency, EvidenceSufficiencyMatrix,
    EvidenceBasedQuestion,
)
from ..schemas.reference import (
    FrameworkOut, DomainOut, ControlOut, EvidenceItemOut,
    EvidenceItemWithControlsOut, MappingOut, ControlRefOut, DependencyOut,
    EvidenceSufficiencyMatrixOut, EvidenceQuestionOut, EvidenceFormMetadataOut,
    ArchitectureTypeOut,
)

router = APIRouter(
    prefix="/ref",
    tags=["reference"],
    dependencies=[Depends(get_current_user)],
)

# No auth: used as <img src="..."> fallback when GCS signing fails; browsers cannot send Bearer tokens.
diagrams_content_router = APIRouter(prefix="/ref/diagrams", tags=["reference"])


def _ensure_ref_cycle_access(cycle_id: UUID | None, user: User, db: Session) -> None:
    """When cycle_id is set, require same access as assessment routes (tenant or cycle assignment)."""
    if cycle_id is None:
        return
    from ..routers.assessments import _require_cycle_access

    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)


# Architecture type metadata (display labels). Control lists and counts come from DB per cycle.
REF_ARCHITECTURE_TYPES: list[dict] = [
    {"id": "A1", "name": "Architecture A1", "subtitle": "Full Local SWIFT Infrastructure", "description": "User owns and operates all SWIFT infrastructure on-premises or in their own data centre."},
    {"id": "A2", "name": "Architecture A2", "subtitle": "Shared SWIFT Infrastructure (Service Bureau Managed)", "description": "User communicates via SWIFT through a service bureau; user has local SWIFT-related components in a secure zone."},
    {"id": "A3", "name": "Architecture A3", "subtitle": "Connector (Alliance Lite2 / Similar)", "description": "User connects using an application-level connector within their secure zone."},
    {"id": "A4", "name": "Architecture A4", "subtitle": "Customer Connector (Middleware / API / File Transfer)", "description": "User operates a customer connector that connects to SWIFT directly or via a service bureau."},
    {"id": "B", "name": "Architecture B", "subtitle": "No Local SWIFT Footprint (GUI Access Only)", "description": "User has no local SWIFT infrastructure. Access is exclusively via a service bureau's GUI with no A2A flows."},
]


@router.get("/architecture-types", response_model=list[ArchitectureTypeOut])
def list_architecture_types():
    """Return architecture type metadata (id, name, subtitle, description). Control counts come from GET /assessments/{cycle_id}/controls."""
    return [ArchitectureTypeOut.model_validate(a) for a in REF_ARCHITECTURE_TYPES]


@router.get("/architecture-types/{architecture_id}", response_model=ArchitectureTypeOut)
def get_architecture_type(architecture_id: str):
    """Return a single architecture type by id (A1, A2, A3, A4, B)."""
    for a in REF_ARCHITECTURE_TYPES:
        if (a.get("id") or "").strip().upper() == (architecture_id or "").strip().upper():
            return ArchitectureTypeOut.model_validate(a)
    raise HTTPException(status_code=404, detail="Architecture type not found")


@router.get("/frameworks", response_model=list[FrameworkOut])
def list_frameworks(db: Session = Depends(get_db)):
    return db.query(AuditFramework).filter(AuditFramework.is_active == True).all()


@router.get("/domains", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db_ref)):
    return db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()


CONTROL_ID_ALL = "ALL"


def _applicable_control_ids_for_cycle(db: Session, cycle_id: UUID) -> set[str]:
    """Return set of control_id that are in scope (scoping_decision == 'applicable') for this cycle."""
    applicable = set()
    for ca in db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all():
        if (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        if (getattr(ca, "scoping_decision", None) or "applicable") != "applicable":
            continue
        applicable.add(ca.control_id or "")
    return applicable


@router.get("/domains/{domain_id}")
def get_domain(
    domain_id: str,
    cycle_id: UUID | None = Query(None, description="When set, only controls in scope (applicable) for this cycle are returned."),
    db: Session = Depends(get_db_ref),
    user: User = Depends(get_current_user),
):
    _ensure_ref_cycle_access(cycle_id, user, db)
    # Normalize: take first char only (handles "A:1" from devtools), uppercase, default to "A"
    raw = (domain_id or "").strip()
    domain_id_clean = (raw.split(":")[0] or raw or "A")[:1].upper() or "A"

    applicable_control_ids: set[str] | None = None
    if cycle_id is not None:
        applicable_control_ids = _applicable_control_ids_for_cycle(db, cycle_id)

    try:
        domain = db.query(EvidenceDomain).filter(EvidenceDomain.id == domain_id_clean).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error loading domain: {str(e)}")

    if not domain:
        return {"domain": None, "evidence_items": []}

    try:
        items = db.query(CanonicalEvidenceItem).filter(
            CanonicalEvidenceItem.domain_id == domain_id_clean
        ).order_by(CanonicalEvidenceItem.sort_order).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error loading evidence items: {str(e)}")

    item_ids = [i.id for i in items]

    mappings_by_item = load_mappings_by_item_ids(db, item_ids)
    all_control_ids = list({
        m.control_id
        for ms in mappings_by_item.values()
        for m in ms
    })
    controls_map = load_controls_by_ids(db, all_control_ids)
    matrix_by_item = load_matrix_by_item_ids(db, item_ids)

    evidence_with_controls = []
    for i in items:
        try:
            item_mappings = mappings_by_item.get(i.id, [])
            control_refs = []
            for m in item_mappings:
                if applicable_control_ids is not None and m.control_id not in applicable_control_ids:
                    continue
                ctrl = controls_map.get(m.control_id)
                ma = "M" if ctrl and ctrl.control_type and str(ctrl.control_type).lower() == "mandatory" else "A"
                control_refs.append(ControlRefOut(control_id=m.control_id, ma=ma))

            matrix_rows = matrix_by_item.get(i.id, [])
            if applicable_control_ids is not None:
                matrix_rows = [r for r in matrix_rows if r.control_id in applicable_control_ids]
                # A5 "All 32 controls (scoping)": always include ALL row when present so Per-Control tab can show criteria
                if i.id == "A5":
                    all_row = next((r for r in matrix_by_item.get(i.id, []) if r.control_id == "ALL"), None)
                    if all_row and not any(r.control_id == "ALL" for r in matrix_rows):
                        matrix_rows = [all_row] + matrix_rows
            matrix = [EvidenceSufficiencyMatrixOut.model_validate(r) for r in matrix_rows]

            base = EvidenceItemOut.model_validate(i).model_dump()
            # Count must match the controls list (applicable-only when cycle_id set) so list shows same number as Per-Control.
            base["control_count"] = len(control_refs)
            evidence_with_controls.append(
                EvidenceItemWithControlsOut(**base, controls=control_refs, matrix=matrix)
            )
        except Exception as e:
            logger.exception("Error processing evidence item %s", getattr(i, "id", "?"))
            continue

    try:
        return {
            "domain": DomainOut.model_validate(domain),
            "evidence_items": evidence_with_controls,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Serialization error: {str(e)}")


@router.get("/controls", response_model=list[ControlOut])
def list_controls(db: Session = Depends(get_db_ref)):
    return db.query(Control).order_by(Control.id).all()


@router.get("/controls/{control_id}")
def get_control(control_id: str, db: Session = Depends(get_db_ref)):
    ctrl = db.query(Control).filter(Control.id == control_id).first()
    mappings = db.query(ItemControlMapping).filter(ItemControlMapping.control_id == control_id).all()
    return {
        "control": ControlOut.model_validate(ctrl) if ctrl else None,
        "evidence_items": [m.evidence_item_id for m in mappings],
    }


@router.get("/evidence-items", response_model=list[EvidenceItemOut])
def list_evidence_items(db: Session = Depends(get_db_ref)):
    return db.query(CanonicalEvidenceItem).order_by(CanonicalEvidenceItem.domain_id, CanonicalEvidenceItem.sort_order).all()


@router.get("/evidence-items/{item_id}")
def get_evidence_item(
    item_id: str,
    cycle_id: UUID | None = Query(None, description="When set, only controls in scope (applicable) for this cycle are returned."),
    db: Session = Depends(get_db_ref),
    user: User = Depends(get_current_user),
):
    _ensure_ref_cycle_access(cycle_id, user, db)
    item = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id == item_id).first()
    if not item:
        return {"item": None, "controls": []}
    mappings = db.query(ItemControlMapping).filter(ItemControlMapping.evidence_item_id == item_id).all()
    if cycle_id is not None:
        applicable = _applicable_control_ids_for_cycle(db, cycle_id)
        mappings = [m for m in mappings if (m.control_id or "") in applicable]
    item_out = EvidenceItemOut.model_validate(item)
    item_out.control_count = len(mappings)
    return {
        "item": item_out,
        "controls": [MappingOut.model_validate(m) for m in mappings],
    }


@router.get("/evidence-items/{item_id}/questions", response_model=list[EvidenceQuestionOut])
def get_evidence_item_questions(
    item_id: str,
    cycle_id: UUID = Query(..., description="Required to resolve schema (swift_2025 or swift_2026) for questions."),
    db: Session = Depends(get_db_ref),
    user: User = Depends(get_current_user),
):
    """Return evidence_based_questions for this evidence item. Schema resolved from cycle_id."""
    _ensure_ref_cycle_access(cycle_id, user, db)
    questions = (
        db.query(EvidenceBasedQuestion)
        .filter(EvidenceBasedQuestion.evidence_item_id == item_id.upper())
        .order_by(EvidenceBasedQuestion.sort_order, EvidenceBasedQuestion.question_key)
        .all()
    )
    return [EvidenceQuestionOut.model_validate(q) for q in questions]


@router.get("/evidence-items/{item_id}/form-metadata", response_model=EvidenceFormMetadataOut)
def get_evidence_item_form_metadata(
    item_id: str,
    cycle_id: UUID = Query(..., description="Required to resolve schema for questions."),
    db: Session = Depends(get_db_ref),
    user: User = Depends(get_current_user),
):
    """Return form metadata (labels, key order, spreadsheet column labels) from evidence_based_questions."""
    _ensure_ref_cycle_access(cycle_id, user, db)
    questions = (
        db.query(EvidenceBasedQuestion)
        .filter(EvidenceBasedQuestion.evidence_item_id == item_id.upper())
        .order_by(EvidenceBasedQuestion.sort_order, EvidenceBasedQuestion.question_key)
        .all()
    )
    field_labels: dict[str, str] = {}
    key_order: list[str] = []
    table_column_labels: dict[str, dict[str, str]] = {}
    for q in questions:
        field_labels[q.question_key] = q.label
        key_order.append(q.question_key)
        if q.question_type == "spreadsheet" and q.options:
            for opt in q.options:
                if isinstance(opt, dict) and "key" in opt and "label" in opt:
                    table_column_labels.setdefault(q.question_key, {})[opt["key"]] = opt["label"]
    return EvidenceFormMetadataOut(
        field_labels=field_labels,
        key_order=key_order,
        table_column_labels=table_column_labels,
    )


@router.get("/evidence-items/{item_id}/matrix", response_model=list[EvidenceSufficiencyMatrixOut])
def get_evidence_item_matrix(
    item_id: str,
    cycle_id: UUID | None = Query(None, description="When set, only rows for controls in scope (applicable) for this cycle are returned."),
    db: Session = Depends(get_db_ref),
    user: User = Depends(get_current_user),
):
    """Return evidence_sufficiency_matrix rows for this evidence item. With cycle_id, only applicable controls (same as Per-Control tab)."""
    _ensure_ref_cycle_access(cycle_id, user, db)
    rows = db.query(EvidenceSufficiencyMatrix).filter(
        EvidenceSufficiencyMatrix.item_code == item_id
    ).all()
    if cycle_id is not None:
        applicable = _applicable_control_ids_for_cycle(db, cycle_id)
        rows = [r for r in rows if (r.control_id or "") in applicable]
    return [EvidenceSufficiencyMatrixOut.model_validate(r) for r in rows]


def _validate_diagram_filename(filename: str) -> None:
    if not re.match(r"^[A-Za-z0-9_\-\.]+\.\w+$", filename):
        raise HTTPException(status_code=400, detail="Invalid filename")


@router.get("/diagrams/{filename}")
def get_diagram_url(
    filename: str,
    version: str | None = Query(None, description="2025 or 2026 for diagram folder"),
):
    """Return a signed URL (or backend stream URL when signing fails) for an architecture diagram."""
    _validate_diagram_filename(filename)
    url = storage_service.get_diagram_url(filename, expiry_minutes=60, version=version)
    return {"url": url, "filename": filename}


@diagrams_content_router.get("/{filename}/content")
def stream_diagram_content(
    filename: str,
    version: str | None = Query(None, description="swift_2025 or swift_2026 for diagram folder"),
):
    """Stream diagram image bytes. Used when GCS signed URL cannot be generated (e.g. user credentials without private key)."""
    _validate_diagram_filename(filename)
    try:
        data = storage_service.get_diagram_bytes(filename, version=version)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail="Diagram not found") from e
    # Prefer image/png for .png; default to application/octet-stream
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    media_type = "image/png" if ext == "png" else "image/jpeg" if ext in ("jpg", "jpeg") else "application/octet-stream"
    return Response(content=data, media_type=media_type)


@router.get("/dependencies", response_model=list[DependencyOut])
def list_dependencies(db: Session = Depends(get_db)):
    return db.query(CrossDomainDependency).all()
