import logging
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse, Response
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_ref
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
)
from ..schemas.reference import (
    FrameworkOut, DomainOut, ControlOut, EvidenceItemOut,
    EvidenceItemWithControlsOut, MappingOut, ControlRefOut, DependencyOut,
    EvidenceSufficiencyMatrixOut,
)

router = APIRouter(prefix="/ref")


@router.get("/frameworks", response_model=list[FrameworkOut])
def list_frameworks(db: Session = Depends(get_db)):
    return db.query(AuditFramework).filter(AuditFramework.is_active == True).all()


@router.get("/domains", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db_ref)):
    return db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()


@router.get("/domains/{domain_id}")
def get_domain(domain_id: str, db: Session = Depends(get_db_ref)):
    # Normalize: take first char only (handles "A:1" from devtools), uppercase, default to "A"
    raw = (domain_id or "").strip()
    domain_id_clean = (raw.split(":")[0] or raw or "A")[:1].upper() or "A"

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
                ctrl = controls_map.get(m.control_id)
                ma = "M" if ctrl and ctrl.control_type and str(ctrl.control_type).lower() == "mandatory" else "A"
                control_refs.append(ControlRefOut(control_id=m.control_id, ma=ma))

            matrix_rows = matrix_by_item.get(i.id, [])
            matrix = [EvidenceSufficiencyMatrixOut.model_validate(r) for r in matrix_rows]

            base = EvidenceItemOut.model_validate(i).model_dump()
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
def get_evidence_item(item_id: str, db: Session = Depends(get_db_ref)):
    item = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id == item_id).first()
    mappings = db.query(ItemControlMapping).filter(ItemControlMapping.evidence_item_id == item_id).all()
    return {
        "item": EvidenceItemOut.model_validate(item) if item else None,
        "controls": [MappingOut.model_validate(m) for m in mappings],
    }


@router.get("/evidence-items/{item_id}/matrix", response_model=list[EvidenceSufficiencyMatrixOut])
def get_evidence_item_matrix(item_id: str, db: Session = Depends(get_db_ref)):
    """Return all evidence_sufficiency_matrix rows for a given evidence item."""
    rows = db.query(EvidenceSufficiencyMatrix).filter(
        EvidenceSufficiencyMatrix.item_code == item_id
    ).all()
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


@router.get("/diagrams/{filename}/content")
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
