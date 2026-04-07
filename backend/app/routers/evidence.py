from uuid import UUID
import json
import logging
from datetime import datetime, timezone
from collections import Counter
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_scoped, get_current_user, _resolve_schema_for_cycle
from ..constants import CYCLE_SCOPED_ROLES, PLATFORM_ADMIN_ROLES, is_cycle_scoped
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, EvidenceSubmission, EvidenceAttachment, EvidenceSubmissionHistory, ControlApplicability
from ..models.framework import CanonicalEvidenceItem, ItemControlMapping, EvidenceSufficiencyMatrix, EvidenceBasedQuestion
from ..models.sufficiency import SufficiencyEvaluation, SufficiencyScore
from ..schemas.evidence import (
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    SubmissionOut,
    EvidenceHistoryEntryOut,
    EvaluateEvidenceRequest,
    EvaluateEvidenceResponse,
    AiCriterionResultOut,
    AwsEvidenceSuggestResponse,
)
from app.config import settings
from app.aws_evidence.core.db import ensure_schema as ensure_aws_schema, get_swift_evidence_db
from app.aws_evidence.services import evidence_service as aws_evidence_service
from ..services import ai_service
from ..services import artifact_registry_service
from ..services.assignment_constraints import get_user_cycle_ids, get_user_cycle_role, get_user_assigned_evidence_items
from ..services.ai_service import _eval_criteria_pass_if_only, _parse_numbered_criteria as _parse_criteria_ai
from ..services import evidence_status as evidence_status_svc
from ..services.batch_loaders import (
    load_mappings_by_control_ids,
    load_submissions_by_cycle_and_items,
)

logger = logging.getLogger(__name__)

router = APIRouter()

_CONTROL_ID_ALL = "ALL"

_AWS_LLM_FILL_TYPES = frozenset({"text", "textarea", "select", "date", "checkbox", "multiselect", "spreadsheet"})


def _source_tokens(evidence_source: str | None) -> list[str]:
    raw = (evidence_source or "").strip().lower()
    if not raw:
        return []
    normalized = raw.replace(" and ", ",").replace("/", ",").replace("|", ",").replace(";", ",")
    return [p.strip() for p in normalized.split(",") if p.strip()]


def _evidence_source_allows_cloud_llm(evidence_source: str | None, cloud_provider: str) -> bool:
    """True when source is provider-only or provider+human (excludes human-only)."""
    tokens = _source_tokens(" ".join((evidence_source or "").split()))
    provider = (cloud_provider or "").strip().lower()
    if provider not in {"aws", "gcp", "azure"}:
        return False
    if provider == "aws":
        aliases = ["aws"]
    elif provider == "azure":
        aliases = ["azure"]
    else:
        aliases = ["gcp", "gcs"]
    if not tokens:
        return False
    for token in tokens:
        if any(token == alias for alias in aliases):
            return True
        if any(token.startswith(alias) for alias in aliases) and "human" in token:
            return True
    return False


def _build_llm_question_payload(q: EvidenceBasedQuestion, cloud_provider: str) -> dict[str, Any]:
    """Shape sent to Vertex: form fields plus DB mapping columns for the active provider (AWS vs GCP)."""
    qtype = (q.question_type or "").strip().lower()
    opts = q.options if isinstance(q.options, list) else []
    if qtype == "spreadsheet":
        payload_opts = opts
    elif opts and qtype in ("select", "multiselect"):
        payload_opts = [str(x) for x in opts]
    else:
        payload_opts = []
    out: dict[str, Any] = {
        "question_key": q.question_key,
        "label": q.label,
        "question_type": q.question_type,
        "options": payload_opts,
        "guide": (q.guide or "")[:4000],
        "evidence_source": (getattr(q, "evidence_source", None) or "").strip(),
        "collection_method": ((getattr(q, "collection_method", None) or "").strip())[:2000],
        "evidence_required_raw": ((getattr(q, "evidence_required_raw", None) or "").strip())[:4000],
        "reason_rationale": ((getattr(q, "reason_rationale", None) or "").strip())[:4000],
    }
    if cloud_provider == "aws":
        out["aws_auto_level"] = (getattr(q, "aws_auto_level", None) or "").strip()
        out["aws_services"] = (getattr(q, "aws_services", None) or "").strip()
        out["question_level_aws_sources"] = (getattr(q, "question_level_aws_sources", None) or "").strip()
    elif cloud_provider == "azure":
        out["azure_auto_level"] = (getattr(q, "azure_auto_level", None) or "").strip()
        out["azure_services"] = (getattr(q, "azure_services", None) or "").strip()
        out["question_level_azure_sources"] = (getattr(q, "question_level_azure_sources", None) or "").strip()
    else:
        out["gcs_auto_level"] = (getattr(q, "gcs_auto_level", None) or "").strip()
        out["gcs_services"] = (getattr(q, "gcs_services", None) or "").strip()
        out["question_level_gcs_sources"] = (getattr(q, "question_level_gcs_sources", None) or "").strip()
    return out


def _question_has_provider_mapping(q: EvidenceBasedQuestion, cloud_provider: str) -> bool:
    provider = (cloud_provider or "").strip().lower()
    if provider == "aws":
        vals = (
            getattr(q, "aws_auto_level", None),
            getattr(q, "aws_services", None),
            getattr(q, "question_level_aws_sources", None),
        )
    elif provider == "gcp":
        vals = (
            getattr(q, "gcs_auto_level", None),
            getattr(q, "gcs_services", None),
            getattr(q, "question_level_gcs_sources", None),
        )
    elif provider == "azure":
        vals = (
            getattr(q, "azure_auto_level", None),
            getattr(q, "azure_services", None),
            getattr(q, "question_level_azure_sources", None),
        )
    else:
        return False
    return any(str(v or "").strip() for v in vals)


def _extract_cloud_error_summary(rows: list, cloud_provider: str) -> str | None:
    """Return a short summary when all provider evidence rows are collector-error payloads."""
    if not rows:
        return None
    errors: list[str] = []
    collectors: list[str] = []
    for r in rows:
        payload = getattr(r, "response_json", None)
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {}
        if not isinstance(payload, dict):
            continue
        err = str(payload.get("error") or "").strip()
        if err:
            errors.append(err)
            collectors.append(str(payload.get("collector") or getattr(r, "source_system", "") or "unknown"))
    if not errors or len(errors) != len(rows):
        return None
    collector_counts = Counter([c for c in collectors if c])
    top_collectors = ", ".join([f"{name} ({count})" for name, count in collector_counts.most_common(3)])
    joined = " ".join(errors).lower()
    if "service_disabled" in joined or "has not been used in project" in joined or "enable it by visiting" in joined:
        return (
            f"All {cloud_provider.upper()} evidence rows for this item are collector errors (likely API(s) disabled). "
            f"Top failing collectors: {top_collectors or 'unknown'}. Enable required GCP APIs and rerun collection."
        )
    if "permission denied" in joined or "403" in joined:
        return (
            f"All {cloud_provider.upper()} evidence rows for this item are collector errors (permission denied). "
            f"Top failing collectors: {top_collectors or 'unknown'}. Grant collector IAM roles and rerun collection."
        )
    return (
        f"All {cloud_provider.upper()} evidence rows for this item are collector errors. "
        f"Top failing collectors: {top_collectors or 'unknown'}. Rerun collection after fixing collector errors."
    )


def _require_cycle_access(cycle: AssessmentCycle | None, user: User, db: Session) -> None:
    """Raise 404 if cycle missing, 403 if user may not access."""
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if is_cycle_scoped(user.role):
        cycle_ids = get_user_cycle_ids(db, user.id)
        if cycle.id not in cycle_ids:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")


def _applicable_control_ids_for_cycle(db: Session, cycle_id: UUID) -> set[str]:
    """Return set of control_id in scope (scoping_decision == 'applicable') for this cycle. Same logic as ref/domains cycle filter."""
    applicable = set()
    for ca in db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all():
        if (ca.control_id or "").strip().upper() == _CONTROL_ID_ALL:
            continue
        if (getattr(ca, "scoping_decision", None) or "applicable") != "applicable":
            continue
        applicable.add(ca.control_id or "")
    return applicable


def _submitter_name_map(db: Session, subs: list[EvidenceSubmission]) -> dict[UUID, str]:
    """Batch-load display names for submission submitters."""
    ids = {s.submitted_by for s in subs if s.submitted_by}
    if not ids:
        return {}
    out: dict[UUID, str] = {}
    for u in db.query(User).filter(User.id.in_(ids)).all():
        label = (u.name or "").strip() or (u.email or "").strip()
        if label:
            out[u.id] = label
    return out


def _resolve_submitter_name(
    submitted_by: UUID | None,
    db: Session | None,
    submitter_names: dict[UUID, str] | None,
) -> str | None:
    if not submitted_by:
        return None
    if submitter_names is not None and submitted_by in submitter_names:
        return submitter_names[submitted_by]
    if db:
        u = db.query(User).filter(User.id == submitted_by).first()
        if u:
            return (u.name or "").strip() or (u.email or "").strip() or None
    return None


def _submission_to_out(
    sub: EvidenceSubmission,
    db: Session | None = None,
    submitter_names: dict[UUID, str] | None = None,
) -> SubmissionOut:
    """Build SubmissionOut with last_evaluation from stored evaluation_result.
    If db is provided, status is returned as display value (e.g. in_review_L2) for API."""
    last_evaluation = None
    if getattr(sub, "evaluation_result", None):
        try:
            last_evaluation = EvaluateEvidenceResponse.model_validate(sub.evaluation_result)
            remediation_col = getattr(sub, "evaluation_remediation", None)
            if last_evaluation.remediation is None and remediation_col:
                last_evaluation = last_evaluation.model_copy(update={"remediation": remediation_col})
        except Exception:
            pass
    status_val = (
        evidence_status_svc.evidence_display_status(sub.status, db, sub.id)
        if db
        else sub.status
    )
    evaluation_edits = getattr(sub, "evaluation_edits", None) or {}
    submitter_name = _resolve_submitter_name(sub.submitted_by, db, submitter_names)
    return SubmissionOut(
        id=sub.id,
        cycle_id=sub.cycle_id,
        evidence_item_id=sub.evidence_item_id,
        submitted_by=sub.submitted_by,
        submitted_at=sub.submitted_at,
        submitted_by_name=submitter_name,
        status=status_val,
        scope_key=sub.scope_key,
        form_data=sub.form_data or {},
        completion_pct=float(sub.completion_pct or 0),
        version=sub.version,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        last_evaluation=last_evaluation,
        evaluation_edits=evaluation_edits,
    )


@router.get("/assessments/{cycle_id}/evidence", response_model=list[SubmissionOut])
def list_evidence(
    cycle_id: UUID,
    domain: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    q = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id)
    if user.role != "admin":
        q = q.filter(EvidenceSubmission.tenant_id == user.tenant_id)
    if domain:
        q = q.filter(EvidenceSubmission.evidence_item_id.like(f"{domain}%"))
    if status:
        q = q.filter(EvidenceSubmission.status == evidence_status_svc.evidence_status_to_db(status))
    subs = q.order_by(EvidenceSubmission.created_at.desc()).all()

    # For cycle-scoped IT Experts: filter by assigned evidence items when assignments exist
    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    if effective_role == "it_sme":
        assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
        if assigned is not None and assigned:
            subs = [s for s in subs if (s.evidence_item_id or "").strip().upper() in assigned]

    names = _submitter_name_map(db, subs)
    return [_submission_to_out(s, db, names) for s in subs]


EVIDENCE_WRITE_ROLES = ("compliance_officer", "it_sme", "admin", "tenant_admin")


def _submission_snapshot(sub: EvidenceSubmission) -> dict:
    return {
        "status": sub.status,
        "form_data": sub.form_data or {},
        "evaluation_result": sub.evaluation_result,
        "evaluation_edits": getattr(sub, "evaluation_edits", None) or {},
    }


@router.post("/assessments/{cycle_id}/evidence", response_model=SubmissionOut, status_code=201)
def create_evidence(cycle_id: UUID, req: CreateSubmissionRequest, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    can_write = user.role in EVIDENCE_WRITE_ROLES or effective_role == "it_sme"
    if not can_write:
        raise HTTPException(status_code=403, detail="Not authorized to create evidence")

    # For IT Experts: respect cycle_evidence_assignments when assignments exist
    if effective_role == "it_sme":
        assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
        if assigned is not None:
            item_upper = (req.evidence_item_id or "").strip().upper()
            if item_upper not in assigned:
                raise HTTPException(
                    status_code=403,
                    detail="You are not assigned to this evidence item. Contact your Compliance Officer.",
                )

    # Get-or-create: avoid duplicate submissions for same (cycle, tenant, evidence_item_id, scope_key)
    q = db.query(EvidenceSubmission).filter(
        EvidenceSubmission.cycle_id == cycle_id,
        EvidenceSubmission.tenant_id == user.tenant_id,
        EvidenceSubmission.evidence_item_id == req.evidence_item_id,
    )
    if req.scope_key is None:
        q = q.filter(EvidenceSubmission.scope_key.is_(None))
    else:
        q = q.filter(EvidenceSubmission.scope_key == req.scope_key)
    existing = q.first()
    if existing:
        return _submission_to_out(existing, db)

    sub = EvidenceSubmission(
        cycle_id=cycle_id,
        tenant_id=user.tenant_id,
        evidence_item_id=req.evidence_item_id,
        submitted_by=user.id,
        scope_key=req.scope_key,
    )
    db.add(sub)
    db.flush()
    hist = EvidenceSubmissionHistory(
        submission_id=sub.id,
        version=1,
        changed_by=user.id,
        change_type="create",
        snapshot_before=None,
        snapshot_after=_submission_snapshot(sub),
        justification=None,
    )
    db.add(hist)
    submission_id = sub.id  # capture before commit; sub is expired after commit
    db.commit()
    # Re-apply search_path then re-query (connection may have been recycled with default path).
    schema = _resolve_schema_for_cycle(db, cycle_id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == submission_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=500, detail="Submission not found after create")
    # Artifact Registry is intentionally not written at create-time.
    # It is created/updated only when submit-for-review is explicitly triggered.
    return _submission_to_out(sub, db)


@router.get("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def get_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _submission_to_out(sub, db)


@router.get("/assessments/{cycle_id}/evidence/{sub_id}/history", response_model=list[EvidenceHistoryEntryOut])
def get_evidence_history(
    cycle_id: UUID,
    sub_id: UUID,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role != "admin" and sub.tenant_id != user.tenant_id:
        raise HTTPException(status_code=404, detail="Submission not found")
    from ..models.tenant import User as U
    entries = (
        db.query(EvidenceSubmissionHistory)
        .filter(EvidenceSubmissionHistory.submission_id == sub_id)
        .order_by(EvidenceSubmissionHistory.changed_at.asc())
        .all()
    )
    user_ids = {e.changed_by for e in entries if e.changed_by}
    users_map = {}
    if user_ids:
        for u in db.query(U).filter(U.id.in_(user_ids)).all():
            users_map[u.id] = u.name
    return [
        EvidenceHistoryEntryOut(
            id=e.id,
            submission_id=e.submission_id,
            version=e.version,
            changed_by=e.changed_by,
            changed_at=e.changed_at,
            change_type=e.change_type,
            snapshot_before=e.snapshot_before,
            snapshot_after=e.snapshot_after,
            justification=e.justification,
            changed_by_name=users_map.get(e.changed_by) if e.changed_by else None,
        )
        for e in entries
    ]


@router.put("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def update_evidence(cycle_id: UUID, sub_id: UUID, req: UpdateSubmissionRequest, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    can_write = user.role in EVIDENCE_WRITE_ROLES or effective_role == "it_sme"
    if not can_write:
        raise HTTPException(status_code=403, detail="Not authorized to update evidence")

    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # For IT Experts: respect evidence assignment
    if effective_role == "it_sme":
        assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
        if assigned is not None:
            item_upper = (sub.evidence_item_id or "").strip().upper()
            if item_upper not in assigned:
                raise HTTPException(status_code=403, detail="Access denied to this evidence submission")

    snapshot_before = _submission_snapshot(sub)
    change_types = []
    if req.status:
        sub.status = evidence_status_svc.evidence_status_to_db(req.status)
        change_types.append("status_change")
        if req.status.lower() in ("submitted", "in_review") and not sub.submitted_by:
            sub.submitted_by = user.id
            if not sub.submitted_at:
                sub.submitted_at = datetime.now(timezone.utc)
    if req.form_data is not None:
        sub.form_data = req.form_data
        change_types.append("form_edit")
    if req.evaluation_result is not None:
        sub.evaluation_result = req.evaluation_result
        change_types.append("evaluation_edit")
    if req.evaluation_edits is not None:
        sub.evaluation_edits = req.evaluation_edits
        if "evaluation_edit" not in change_types:
            change_types.append("evaluation_edit")

    if change_types:
        next_version = (
            db.query(EvidenceSubmissionHistory)
            .filter(EvidenceSubmissionHistory.submission_id == sub.id)
            .count()
        ) + 1
        hist = EvidenceSubmissionHistory(
            submission_id=sub.id,
            version=next_version,
            changed_by=user.id,
            change_type=change_types[0] if len(change_types) == 1 else "update",
            snapshot_before=snapshot_before,
            snapshot_after=_submission_snapshot(sub),
            justification=req.justification,
        )
        db.add(hist)

    db.commit()
    # Re-apply search_path then re-query (connection may have been recycled with default path).
    schema = _resolve_schema_for_cycle(db, cycle_id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=500, detail="Submission not found after update")
    # Artifact Registry is intentionally not written at edit-time.
    # It is created/updated only when submit-for-review is explicitly triggered.
    return _submission_to_out(sub, db)


@router.delete("/assessments/{cycle_id}/evidence/{sub_id}", status_code=204)
def delete_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    can_write = user.role in EVIDENCE_WRITE_ROLES or effective_role == "it_sme"
    if not can_write:
        raise HTTPException(status_code=403, detail="Not authorized to delete evidence")

    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if effective_role == "it_sme":
        assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
        if assigned is not None:
            item_upper = (sub.evidence_item_id or "").strip().upper()
            if item_upper not in assigned:
                raise HTTPException(status_code=403, detail="Access denied to this evidence submission")
    if sub.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft submissions can be deleted")
    db.delete(sub)
    db.commit()


def _parse_numbered_json(value: str | dict | None) -> list[tuple[str, str]]:
    """Return [(id, label), ...] from JSON string or dict. Keys sorted numerically."""
    if value is None:
        return []
    if isinstance(value, dict):
        obj = value
    elif isinstance(value, str):
        value = value.strip()
        if not value:
            return []
        try:
            obj = json.loads(value)
        except Exception:
            return []
    else:
        return []
    if not isinstance(obj, dict):
        return []
    keys = sorted(obj.keys(), key=lambda k: (int(k) if str(k).isdigit() else 999, k))
    return [(k, str(obj[k]).strip()) for k in keys if str(obj[k]).strip()]


def _format_form_field(key: str, label: str, value: str) -> str:
    """Format a single form field with explicit key and label for LLM clarity."""
    val = (value or "Not provided").strip()
    if len(val) > 500:
        val = val[:497] + "..."
    return f"key: {key}\nlabel: {label}\nanswer: {val}"


def _format_file_size(bytes_val: int) -> str:
    """Format file size for display (e.g. 9123 -> 8.9 KB)."""
    if bytes_val < 1024:
        return f"{bytes_val} B"
    if bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    return f"{bytes_val / (1024 * 1024):.1f} MB"


def _spreadsheet_has_meaningful_content(raw: object) -> bool:
    if raw is None:
        return False
    s = str(raw).strip()
    if not s:
        return False
    try:
        rows = json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return False
    if not isinstance(rows, list) or len(rows) == 0:
        return False
    for row in rows:
        if not isinstance(row, dict):
            continue
        for v in row.values():
            if str(v or "").strip():
                return True
    return False


def _is_aws_plus_human_source(evidence_source: object) -> bool:
    if evidence_source is None:
        return False
    s = str(evidence_source).strip().lower()
    return s.startswith("aws") and "human" in s


def _should_merge_ai_twin_field(q: EvidenceBasedQuestion, fd: dict) -> bool:
    """Match frontend: merge when evidence_source says AWS+Human or `__ai` has usable data (DB source often null)."""
    if q.question_type == "file":
        return False
    if _is_aws_plus_human_source(getattr(q, "evidence_source", None)):
        return True
    ai_raw = fd.get(f"{q.question_key}__ai")
    ai = "" if ai_raw is None else str(ai_raw)
    if not ai.strip():
        return False
    if q.question_type == "spreadsheet":
        return _spreadsheet_has_meaningful_content(ai)
    return True


def _parse_spreadsheet_column_dicts(q: EvidenceBasedQuestion) -> list[dict]:
    opts = q.options or []
    return [o for o in opts if isinstance(o, dict) and o.get("key")]


def _spreadsheet_required_keys(q: EvidenceBasedQuestion, cols: list[dict]) -> list[str]:
    explicit = [str(c["key"]) for c in cols if c.get("required") is True]
    if explicit:
        return explicit
    if bool(getattr(q, "required", True)) and cols:
        return [str(c["key"]) for c in cols]
    return []


def _spreadsheet_cell_ok(val: object, col: dict) -> bool:
    t = str(val if val is not None else "").strip()
    if not t:
        return False
    if col.get("type") == "select" and col.get("options"):
        opts = col["options"]
        if isinstance(opts, list) and len(opts) > 0:
            return t in [str(x) for x in opts]
    return True


def _spreadsheet_non_empty_rows(rows: list, cols: list[dict]) -> list[dict]:
    if not cols:
        return [r for r in rows if isinstance(r, dict)]
    keys = [str(c["key"]) for c in cols]
    out: list[dict] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        if any(str(row.get(k) if row.get(k) is not None else "").strip() for k in keys):
            out.append(row)
    return out


def _spreadsheet_validate_error(q: EvidenceBasedQuestion, raw: object) -> str | None:
    cols = _parse_spreadsheet_column_dicts(q)
    req_keys = _spreadsheet_required_keys(q, cols)
    must_validate = bool(getattr(q, "required", True)) or bool(req_keys)
    if not must_validate:
        return None
    s = "" if raw is None else str(raw).strip()
    try:
        rows = json.loads(s) if s else []
    except (json.JSONDecodeError, TypeError):
        return "invalid"
    if not isinstance(rows, list):
        return "invalid"
    keys_to_check = req_keys if req_keys else ([str(c["key"]) for c in cols] if bool(getattr(q, "required", True)) and cols else [])
    if not keys_to_check:
        return None
    data_rows = _spreadsheet_non_empty_rows(rows, cols) if cols else [r for r in rows if isinstance(r, dict)]
    if len(data_rows) == 0:
        return "empty"
    col_by_key = {str(c["key"]): c for c in cols}
    for i, row in enumerate(data_rows):
        for rk in keys_to_check:
            col = col_by_key.get(rk)
            if not col:
                continue
            if not _spreadsheet_cell_ok(row.get(rk), col):
                return f"row{i}"  # marker only; pick logic needs ok/null
    return None


def _non_file_field_filled_simple(q: EvidenceBasedQuestion, raw: object) -> bool:
    t = str(raw if raw is not None else "").strip()
    qt = q.question_type or ""
    if qt == "checkbox":
        return t == "true"
    if qt == "spreadsheet":
        return _spreadsheet_validate_error(q, raw) is None
    if qt == "select":
        if not t:
            return False
        str_opts = [str(x) for x in (q.options or []) if isinstance(x, str)]
        if not str_opts:
            return True
        return t in str_opts
    return len(t) > 0


def _effective_form_answer(q: EvidenceBasedQuestion, fd: dict) -> str:
    """Align with frontend: dual-tab fields use `{question_key}__ai`; merge when human empty/invalid."""
    human_raw = fd.get(q.question_key)
    human = "" if human_raw is None else str(human_raw)
    if q.question_type == "file":
        return human
    if not _should_merge_ai_twin_field(q, fd):
        return human
    ai_raw = fd.get(f"{q.question_key}__ai")
    ai = "" if ai_raw is None else str(ai_raw)
    if q.question_type == "spreadsheet":
        if not _spreadsheet_has_meaningful_content(human):
            return ai
        if _spreadsheet_validate_error(q, human) is None:
            return human
        if _spreadsheet_validate_error(q, ai) is None:
            return ai
        return human
    if q.question_type == "checkbox":
        if human.strip() != "":
            return human
        return ai
    if not human.strip():
        return ai
    if bool(getattr(q, "required", True)) and not _non_file_field_filled_simple(q, human) and _non_file_field_filled_simple(q, ai):
        return ai
    return human


def _build_submission_context(
    db: Session,
    evidence_item_id: str,
    form_data: dict | None,
    attachments: list | None = None,
) -> str | None:
    """Build submission context from evidence_based_questions in DB.
    Fully database-driven: uses question_key and label from the form.
    For file-type questions, uses attachment metadata so LLM can provide field_feedback for evidence_document."""
    questions = (
        db.query(EvidenceBasedQuestion)
        .filter(EvidenceBasedQuestion.evidence_item_id == evidence_item_id.upper())
        .order_by(EvidenceBasedQuestion.sort_order, EvidenceBasedQuestion.question_key)
        .all()
    )
    if not questions:
        return None
    parts: list[str] = []
    fd = form_data or {}
    atts = attachments or []

    for q in questions:
        if q.question_type == "file":
            if atts:
                file_desc = ", ".join(
                    f"{a.file_name} ({_format_file_size(a.file_size_bytes or 0)})"
                    for a in atts
                )
                val = f"Uploaded: {file_desc}"
            else:
                val = "Not uploaded"
            parts.append(_format_form_field(q.question_key, q.label, val))
        else:
            val = _effective_form_answer(q, fd)
            parts.append(_format_form_field(q.question_key, q.label, val))

    return "\n---\n".join(parts) if parts else None


def _split_ai_results(result: dict) -> dict:
    """Post-process AI response: enforce sufficiency items in sufficiency_results,
    evaluation items in criteria. Deduplicate based on ID prefix."""
    all_items: dict[str, dict] = {}
    for item in result.get("sufficiency_results", []) + result.get("criteria", []):
        item_id = item.get("id", "")
        if item_id not in all_items:
            all_items[item_id] = item

    suf: list[dict] = []
    ev: list[dict] = []
    for item_id, item in all_items.items():
        if "_suf_" in item_id:
            suf.append(item)
        else:
            ev.append(item)

    result["sufficiency_results"] = suf
    result["criteria"] = ev
    return result


def _persist_ai_results(
    db: Session,
    submission: EvidenceSubmission,
    result: dict,
    user_id: UUID,
) -> None:
    """Step 3: write sufficiency_evaluations rows, update submission summary, store last evaluation for tick status on revisit."""
    for dim in result.get("dimensions", []):
        db.add(SufficiencyEvaluation(
            submission_id=submission.id,
            dimension_code=dim.get("code", "unknown"),
            score=dim.get("score", 0),
            rationale=dim.get("rationale"),
            source="ai",
            evaluated_by=user_id,
        ))

    submission.ai_summary = result.get("summary")
    submission.ai_confidence = result.get("confidence")
    suf_list = result.get("sufficiency_results", [])
    crit_list = result.get("criteria", [])
    all_criteria = suf_list + crit_list
    total_criteria = len(all_criteria)
    met_criteria = sum(1 for c in all_criteria if c.get("met"))
    submission.completion_pct = round(met_criteria / total_criteria * 100, 1) if total_criteria > 0 else 0
    remediation = _normalize_remediation(result.get("remediation"))
    submission.evaluation_remediation = remediation
    # Persist full evaluation including field_feedback for "AI — needs more info" in UI
    submission.evaluation_result = {
        "evidence_item_id": submission.evidence_item_id,
        "overall_met": result.get("overall_met", False),
        "sufficiency_results": result.get("sufficiency_results", []),
        "criteria": result.get("criteria", []),
        "summary": result.get("summary"),
        "remediation": remediation,
        "field_feedback": result.get("field_feedback") or {},
    }


def _normalize_remediation(value: str | list | None) -> str | None:
    """AI may return remediation as a string or list of strings; coerce to str | None for schema/DB."""
    if value is None:
        return None
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, list):
        parts = [str(x).strip() for x in value if x]
        return "\n".join(parts) if parts else None
    return None


def _score_to_status(score: float) -> str:
    if score == 0:
        return "not_started"
    elif score < 40:
        return "insufficient"
    elif score < 80:
        return "partial"
    return "sufficient"


def _normalize_control_id_for_sufficiency(raw: object) -> str | None:
    """Canonical control_id for sufficiency_scores (AI/JSON may emit 1.1 as float or str)."""
    if raw is None:
        return None
    s = str(raw).strip()
    return s if s else None


def _sync_to_control_applicability(db: Session, cycle_id: UUID, control_id: str, score: float, status: str) -> None:
    """Mirror SufficiencyScore into ControlApplicability so the dashboard picks it up."""
    ca = (
        db.query(ControlApplicability)
        .filter(ControlApplicability.cycle_id == cycle_id, ControlApplicability.control_id == control_id)
        .first()
    )
    if ca:
        ca.score = score
        ca.status = status


def _label_prefix(label: str | None) -> str:
    """Return 'PASS', 'FAIL', 'ONLY_APPLICABLE', or '' from criterion label."""
    if not label or not isinstance(label, str):
        return ""
    u = label.strip().upper()
    if u.startswith("PASS:"):
        return "PASS"
    if u.startswith("FAIL:"):
        return "FAIL"
    if u.startswith("ONLY APPLICABLE:") or u.startswith("ONLY_APPLICABLE:"):
        return "ONLY_APPLICABLE"
    return ""


def _count_pass_fail_for_control(control_id: str, criteria_list: list[dict]) -> tuple[int, int]:
    """Count (pass_count, fail_count) for this control; ONLY APPLICABLE excluded. No prefix -> use met."""
    cid_prefix = f"{control_id}_"
    pass_count = 0
    fail_count = 0
    for c in criteria_list:
        cid = c.get("id", "")
        if not (cid.startswith(cid_prefix) or cid == control_id):
            continue
        label = c.get("label") or ""
        pref = _label_prefix(label)
        if pref == "PASS":
            pass_count += 1
        elif pref == "FAIL":
            fail_count += 1
        elif pref == "ONLY_APPLICABLE":
            continue
        else:
            if c.get("met"):
                pass_count += 1
            else:
                fail_count += 1
    return pass_count, fail_count


def _persist_per_control_scores(
    db: Session,
    cycle_id: UUID,
    controls: list[dict],
    evaluation_result: dict | None = None,
) -> None:
    """Write per-control scores into sufficiency_scores.
    Score = PASS / (PASS + FAIL) * 100; only PASS and FAIL criteria counted (ONLY APPLICABLE excluded)."""
    suf_results = (evaluation_result or {}).get("sufficiency_results", [])
    criteria = (evaluation_result or {}).get("criteria", [])

    # One entry per canonical control_id (AI JSON may mix float/string keys; avoids double INSERT same uq).
    by_control: dict[str, dict] = {}
    for ctrl in controls:
        cid = _normalize_control_id_for_sufficiency(ctrl.get("control_id"))
        if cid:
            by_control[cid] = ctrl

    if not by_control:
        return

    keys = list(by_control.keys())
    existing_map: dict[str, SufficiencyScore] = {
        s.control_id: s
        for s in db.query(SufficiencyScore)
        .filter(SufficiencyScore.cycle_id == cycle_id, SufficiencyScore.control_id.in_(keys))
        .all()
    }

    for ctrl in by_control.values():
        control_id = _normalize_control_id_for_sufficiency(ctrl.get("control_id"))
        if not control_id:
            continue

        pass_count, fail_count = _count_pass_fail_for_control(control_id, suf_results + criteria)
        total_counted = pass_count + fail_count

        if total_counted > 0:
            score = round(pass_count / total_counted * 100, 1)
        else:
            score = float(ctrl.get("score", 0) or 0)

        status = _score_to_status(score)
        existing = existing_map.get(control_id)
        if existing:
            existing.overall_score = score
            existing.status = status
            existing.last_evaluated_at = datetime.utcnow()
        else:
            new_row = SufficiencyScore(
                cycle_id=cycle_id,
                control_id=control_id,
                overall_score=score,
                status=status,
                last_evaluated_at=datetime.utcnow(),
            )
            db.add(new_row)
            db.flush()
            existing_map[control_id] = new_row
        _sync_to_control_applicability(db, cycle_id, control_id, score, status)


def _recalculate_control_sufficiency(
    db: Session,
    cycle_id: UUID,
    evidence_item_id: str,
) -> None:
    """Per item: score = PASS / (PASS + FAIL) * 100. Overall = weighted average by item (1/N).

    Uses batch queries to avoid N+1: loads all mappings and submissions up front.
    """
    trigger_mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == evidence_item_id)
        .all()
    )
    affected_control_ids = list({m.control_id for m in trigger_mappings})
    if not affected_control_ids:
        return

    all_mappings_map = load_mappings_by_control_ids(db, affected_control_ids)

    all_item_ids = list({
        m.evidence_item_id
        for ms in all_mappings_map.values()
        for m in ms
    })
    subs_map = load_submissions_by_cycle_and_items(db, cycle_id, all_item_ids)

    existing_scores = (
        db.query(SufficiencyScore)
        .filter(
            SufficiencyScore.cycle_id == cycle_id,
            SufficiencyScore.control_id.in_(affected_control_ids),
        )
        .all()
    )
    existing_scores_map = {s.control_id: s for s in existing_scores}

    for control_id in affected_control_ids:
        ctrl_mappings = all_mappings_map.get(control_id, [])
        n_items = len(ctrl_mappings)
        weight_per_item = 100.0 / n_items if n_items > 0 else 0
        weighted_sum = 0.0

        for m in ctrl_mappings:
            sub = subs_map.get(m.evidence_item_id)
            if not sub:
                continue
            eval_result = sub.evaluation_result or {}
            suf_results = eval_result.get("sufficiency_results", [])
            criteria = eval_result.get("criteria", [])
            pass_count, fail_count = _count_pass_fail_for_control(control_id, suf_results + criteria)
            total_counted = pass_count + fail_count
            item_score = (pass_count / total_counted * 100.0) if total_counted > 0 else 0.0
            weighted_sum += item_score * weight_per_item / 100.0

        if n_items > 0:
            if weighted_sum > 0:
                score = round(weighted_sum, 1)
            else:
                comp_sum = 0.0
                weight_total = 0.0
                for m in ctrl_mappings:
                    sub = subs_map.get(m.evidence_item_id)
                    if sub and float(sub.completion_pct or 0) > 0:
                        comp_sum += float(sub.completion_pct) * float(m.weight)
                        weight_total += float(m.weight)
                score = round(comp_sum / weight_total, 1) if weight_total > 0 else 0.0
        else:
            score = 0.0

        status = _score_to_status(score)

        existing = existing_scores_map.get(control_id)
        if existing:
            existing.overall_score = score
            existing.status = status
            existing.last_evaluated_at = datetime.utcnow()
        else:
            new_score = SufficiencyScore(
                cycle_id=cycle_id,
                control_id=control_id,
                overall_score=score,
                status=status,
                last_evaluated_at=datetime.utcnow(),
            )
            db.add(new_score)
            db.flush()
            existing_scores_map[control_id] = new_score
        _sync_to_control_applicability(db, cycle_id, control_id, score, status)


def _cloud_autofill_suggest(
    *,
    cycle_id: UUID,
    item_id: str,
    cloud_provider: Literal["aws", "gcp", "azure"],
    db: Session,
    aws_db: Session,
    user: User,
) -> AwsEvidenceSuggestResponse:
    """
    Load `evidence_based_questions` for the item, filter by provider (evidence_source + aws_* / gcs_* / azure_*),
    fetch scoped rows from `swift_2026.evidence` with matching cloud_provider, call Vertex autofill.
    """
    import time as _time
    _t0 = _time.monotonic()
    _tag = f"[cloud-suggest][{cloud_provider.upper()}]"

    logger.info("%s START item=%s cycle=%s user=%s", _tag, item_id, cycle_id, user.email)

    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    can_write = user.role in EVIDENCE_WRITE_ROLES or effective_role == "it_sme"
    if not can_write:
        raise HTTPException(status_code=403, detail="Not authorized")

    item_upper = (item_id or "").strip().upper()
    if effective_role == "it_sme":
        assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
        if assigned is not None and item_upper not in assigned:
            raise HTTPException(status_code=403, detail="You are not assigned to this evidence item.")

    if user.tenant_id is None:
        raise HTTPException(status_code=400, detail="User has no tenant context")

    logger.info("%s step 1/5: loading questions from DB ...", _tag)
    questions_orm = (
        db.query(EvidenceBasedQuestion)
        .filter(EvidenceBasedQuestion.evidence_item_id == item_upper)
        .order_by(EvidenceBasedQuestion.sort_order, EvidenceBasedQuestion.question_key)
        .all()
    )
    eligible_payload: list[dict] = []
    question_sources: dict[str, str] = {}
    for q in questions_orm:
        src_raw = getattr(q, "evidence_source", None) or ""
        source_match = _evidence_source_allows_cloud_llm(src_raw, cloud_provider)
        mapping_match = _question_has_provider_mapping(q, cloud_provider)
        if not source_match and not mapping_match:
            continue
        qtype = (q.question_type or "").strip().lower()
        if qtype not in _AWS_LLM_FILL_TYPES:
            continue
        eligible_payload.append(_build_llm_question_payload(q, cloud_provider))
        question_sources[q.question_key] = src_raw.strip()

    logger.info("%s step 1/5: %d questions total, %d eligible for LLM", _tag, len(questions_orm), len(eligible_payload))

    if not eligible_payload:
        ai_service.log_suggest_from_cloud_skip(
            "no_eligible_questions",
            f"item={item_upper} provider={cloud_provider} (no provider-matching LLM-fillable fields)",
        )
        return AwsEvidenceSuggestResponse(
            suggestions={},
            suggestion_gaps={},
            question_keys_attempted=[],
            question_sources={},
            aws_evidence_bundle_count=0,
            aws_evidence_row_count=0,
            cloud_provider=cloud_provider,
            message=(
                f"No questions eligible for {cloud_provider.upper()} autofill "
                f"(evidence_source / aws_* or gcs_* or azure_* mapping, and LLM-fillable types) for this item."
            ),
        )

    logger.info("%s step 2/5: loading evidence rows from swift_2026.evidence ...", _tag)
    ensure_aws_schema()
    evidence_rows = aws_evidence_service.get_evidence_for_item_code(
        aws_db,
        item_upper,
        tenant_id=user.tenant_id,
        cycle_id=cycle_id,
        user_id=user.id,
        limit=settings.LLM_EVIDENCE_FETCH_LIMIT,
        cloud_provider=cloud_provider,
    )
    logger.info("%s step 2/5: %d evidence rows fetched", _tag, len(evidence_rows))

    logger.info("%s step 3/5: building evidence bundle for LLM ...", _tag)
    bundle = aws_evidence_service.build_aws_evidence_bundle_for_llm(evidence_rows)
    logger.info("%s step 3/5: bundle has %d chunks", _tag, len(bundle))

    if not bundle:
        scoped = aws_evidence_service.scoped_evidence_provider_counts_for_item(
            aws_db,
            item_upper,
            tenant_id=user.tenant_id,
            cycle_id=cycle_id,
            user_id=user.id,
        )
        ai_service.log_suggest_from_cloud_skip(
            "no_evidence_bundle",
            f"item={item_upper} provider={cloud_provider} raw_rows={len(evidence_rows)} scoped_counts={scoped} "
            f"(run {cloud_provider.upper()} collectors for this cycle; if scoped_counts shows rows for another provider, use that provider or re-collect)",
        )
        return AwsEvidenceSuggestResponse(
            suggestions={},
            suggestion_gaps={},
            question_keys_attempted=[p["question_key"] for p in eligible_payload],
            question_sources=question_sources,
            aws_evidence_bundle_count=0,
            aws_evidence_row_count=len(evidence_rows),
            cloud_provider=cloud_provider,
            message=f"No {cloud_provider.upper()} collector evidence found for this cycle and user. Run {cloud_provider.upper()} collection first.",
        )
    collector_warning = _extract_cloud_error_summary(evidence_rows, cloud_provider)
    if collector_warning:
        logger.info(
            "cloud autofill: evidence rows are collector errors but continuing to LLM item=%s provider=%s rows=%s",
            item_upper,
            cloud_provider,
            len(evidence_rows),
        )

    logger.info("%s step 4/5: calling Vertex AI (this may take 1-3 min) ...", _tag)
    try:
        if cloud_provider == "aws":
            llm_out = ai_service.suggest_answers_from_aws_evidence(
                evidence_item_id=item_upper,
                questions=eligible_payload,
                aws_evidence_bundle=bundle,
                collector_warning=collector_warning,
            )
        elif cloud_provider == "azure":
            llm_out = ai_service.suggest_answers_from_azure_evidence(
                evidence_item_id=item_upper,
                questions=eligible_payload,
                azure_evidence_bundle=bundle,
                collector_warning=collector_warning,
            )
        else:
            llm_out = ai_service.suggest_answers_from_gcp_evidence(
                evidence_item_id=item_upper,
                questions=eligible_payload,
                gcp_evidence_bundle=bundle,
                collector_warning=collector_warning,
            )
        suggestions = llm_out.get("suggestions") or {}
        suggestion_gaps = llm_out.get("gaps") or {}
    except ValueError as e:
        logger.error("%s step 4/5: FAILED (ValueError) elapsed=%.1fs — %s", _tag, _time.monotonic() - _t0, e)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("%s step 4/5: FAILED elapsed=%.1fs — %s", _tag, _time.monotonic() - _t0, e)
        raise HTTPException(status_code=502, detail=f"LLM error: {e}") from e

    logger.info(
        "%s step 5/5: DONE elapsed=%.1fs suggestions=%d gaps=%d",
        _tag, _time.monotonic() - _t0, len(suggestions), len(suggestion_gaps),
    )

    return AwsEvidenceSuggestResponse(
        suggestions=suggestions,
        suggestion_gaps=suggestion_gaps if isinstance(suggestion_gaps, dict) else {},
        question_keys_attempted=[p["question_key"] for p in eligible_payload],
        question_sources=question_sources,
        aws_evidence_bundle_count=len(bundle),
        aws_evidence_row_count=len(evidence_rows),
        cloud_provider=cloud_provider,
        message=collector_warning,
    )


@router.post(
    "/assessments/{cycle_id}/evidence-items/{item_id}/suggest-from-aws",
    response_model=AwsEvidenceSuggestResponse,
)
def suggest_evidence_fields_from_aws(
    cycle_id: UUID,
    item_id: str,
    provider: str | None = Query(
        None,
        description="Optional. Default aws. Use gcp for legacy clients; prefer POST .../suggest-from-gcp.",
        pattern="^(aws|gcp)$",
    ),
    db: Session = Depends(get_db_scoped),
    aws_db: Session = Depends(get_swift_evidence_db),
    user: User = Depends(get_current_user),
):
    """
    Autofill from **AWS** collector evidence (`cloud_provider=aws` in `swift_2026.evidence`).
    Question rows use `evidence_source` + `aws_auto_level`, `aws_services`, `question_level_aws_sources`.
    Optional `?provider=gcp` delegates to GCP (legacy); prefer `/suggest-from-gcp`.
    """
    p: Literal["aws", "gcp"] = "gcp" if (provider or "").strip().lower() == "gcp" else "aws"
    return _cloud_autofill_suggest(
        cycle_id=cycle_id,
        item_id=item_id,
        cloud_provider=p,
        db=db,
        aws_db=aws_db,
        user=user,
    )


@router.post(
    "/assessments/{cycle_id}/evidence-items/{item_id}/suggest-from-gcp",
    response_model=AwsEvidenceSuggestResponse,
)
def suggest_evidence_fields_from_gcp(
    cycle_id: UUID,
    item_id: str,
    db: Session = Depends(get_db_scoped),
    aws_db: Session = Depends(get_swift_evidence_db),
    user: User = Depends(get_current_user),
):
    """
    Autofill from **GCP** collector evidence (`cloud_provider=gcp` in `swift_2026.evidence`).
    Question rows use `evidence_source` + `gcs_auto_level`, `gcs_services`, `question_level_gcs_sources`.
    """
    return _cloud_autofill_suggest(
        cycle_id=cycle_id,
        item_id=item_id,
        cloud_provider="gcp",
        db=db,
        aws_db=aws_db,
        user=user,
    )


@router.post(
    "/assessments/{cycle_id}/evidence-items/{item_id}/suggest-from-azure",
    response_model=AwsEvidenceSuggestResponse,
)
def suggest_evidence_fields_from_azure(
    cycle_id: UUID,
    item_id: str,
    db: Session = Depends(get_db_scoped),
    aws_db: Session = Depends(get_swift_evidence_db),
    user: User = Depends(get_current_user),
):
    """
    Autofill from **Azure** collector evidence (`cloud_provider=azure` in `swift_2026.evidence`).
    Question rows use `evidence_source` + `azure_auto_level`, `azure_services`, `question_level_azure_sources`.
    """
    return _cloud_autofill_suggest(
        cycle_id=cycle_id,
        item_id=item_id,
        cloud_provider="azure",
        db=db,
        aws_db=aws_db,
        user=user,
    )


@router.post("/assessments/{cycle_id}/evidence/evaluate", response_model=EvaluateEvidenceResponse)
def evaluate_evidence(
    cycle_id: UUID,
    req: EvaluateEvidenceRequest,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Evaluate evidence for this item using Vertex AI.

    All evidence is passed to the AI:
    - File attachments for the submission (diagrams, configs, etc.)
    - Structured form data (submission_context) when present

    All sufficiency_criteria and evaluation_criteria for this evidence item's
    controls (e.g. all A1 controls from evidence_sufficiency_matrix) are
    included in the prompt as readable numbered lists. Evaluation runs when
    there are uploads and/or form context; otherwise a placeholder response is returned.
    """
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    effective_role = get_user_cycle_role(db, user.id, cycle_id)
    can_write = user.role in EVIDENCE_WRITE_ROLES or effective_role == "it_sme"
    if not can_write:
        raise HTTPException(status_code=403, detail="Not authorized to evaluate evidence")

    # For IT Experts: respect evidence assignment when evaluating (has submission)
    if req.submission_id and effective_role == "it_sme":
        sub = db.query(EvidenceSubmission).filter(
            EvidenceSubmission.id == req.submission_id,
            EvidenceSubmission.cycle_id == cycle_id,
        ).first()
        if sub:
            assigned = get_user_assigned_evidence_items(db, cycle_id, user.id)
            if assigned is not None:
                item_upper = (sub.evidence_item_id or "").strip().upper()
                if item_upper not in assigned:
                    raise HTTPException(status_code=403, detail="Access denied to this evidence submission")

    canonical = (
        db.query(CanonicalEvidenceItem)
        .filter(CanonicalEvidenceItem.id == req.evidence_item_id)
        .first()
    )
    if not canonical:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    # Restrict to controls in scope for this cycle (same set as Per-Control tab and ref matrix with cycle_id)
    applicable_control_ids = _applicable_control_ids_for_cycle(db, cycle_id)

    control_mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == req.evidence_item_id)
        .all()
    )
    if applicable_control_ids:
        control_mappings = [m for m in control_mappings if (m.control_id or "") in applicable_control_ids]

    matrix_rows = (
        db.query(EvidenceSufficiencyMatrix)
        .filter(EvidenceSufficiencyMatrix.item_code == req.evidence_item_id)
        .all()
    )
    if applicable_control_ids:
        matrix_rows = [r for r in matrix_rows if (getattr(r, "control_id", None) or "") in applicable_control_ids]
    # A5 uses canonical item sufficiency/evaluation criteria (single set), not per-control matrix
    if req.evidence_item_id == "A5":
        matrix_rows = []

    # --- If submission_id present, try real AI evaluation ---
    submission: EvidenceSubmission | None = None
    attachments: list = []
    if req.submission_id:
        submission = (
            db.query(EvidenceSubmission)
            .filter(
                EvidenceSubmission.id == req.submission_id,
                EvidenceSubmission.cycle_id == cycle_id,
            )
            .first()
        )
        if submission:
            attachments = (
                db.query(EvidenceAttachment)
                .filter(EvidenceAttachment.submission_id == submission.id)
                .all()
            )

    submission_context: str | None = None
    if submission:
        submission_context = _build_submission_context(
            db, req.evidence_item_id, submission.form_data or {}, attachments=attachments
        )

    from ..services import storage_service

    file_parts: list = []
    if attachments:
        for att in attachments:
            try:
                data = storage_service.download(att.storage_path)
                file_parts.append(ai_service.prepare_file_part(data, att.file_type))
            except Exception:
                logger.warning("Attachment file missing or unreadable: %s", att.storage_path)
                continue

    # Run AI evaluation when we have uploaded files and/or form context; pass all criteria for this item's controls
    # Merge user edits into previous_evaluation so AI sees user corrections
    previous_evaluation = None
    if submission and submission.evaluation_result:
        import copy
        previous_evaluation = copy.deepcopy(submission.evaluation_result)
        edits = getattr(submission, "evaluation_edits", None) or {}
        if edits:
            for section_key in ("sufficiency_results", "criteria"):
                for item in previous_evaluation.get(section_key, []):
                    edit = edits.get(item.get("id", ""))
                    if edit:
                        item["met"] = edit.get("met", item["met"])
                        if edit.get("description") is not None:
                            item["description"] = edit["description"]

    has_evidence = bool(file_parts) or bool(submission_context and submission_context.strip())
    if has_evidence:
        try:
            result = ai_service.evaluate_evidence(
                file_parts,
                canonical,
                control_mappings,
                matrix_rows=matrix_rows or None,
                submission_context=submission_context,
                previous_evaluation=previous_evaluation,
            )
        except Exception as exc:
            logger.exception("AI evaluation failed")
            msg = str(exc)
            # Rate limit / resource exhausted → 503 so client can retry
            if "429" in msg or "rate limit" in msg.lower() or "Resource exhausted" in msg:
                raise HTTPException(
                    status_code=503,
                    detail="AI service is temporarily overloaded. Please try again in a minute.",
                ) from exc
            raise HTTPException(status_code=502, detail=f"AI evaluation error: {exc}") from exc

        result = _split_ai_results(result)

        # Filter field_feedback to only keys that exist in the form (evidence_based_questions)
        field_feedback = result.get("field_feedback")
        if isinstance(field_feedback, dict):
            valid_keys = {
                q.question_key
                for q in db.query(EvidenceBasedQuestion)
                .filter(EvidenceBasedQuestion.evidence_item_id == req.evidence_item_id.upper())
                .all()
            }
            if valid_keys:
                field_feedback = {k: v for k, v in field_feedback.items() if k in valid_keys}
                result["field_feedback"] = field_feedback

        def _coerce_criterion(raw: dict, index: int, prefix: str) -> dict:
            """Ensure met is bool (AI may return null); id/label are strings."""
            met_val = raw.get("met", False)
            return {
                "id": raw.get("id") or str(index + 1),
                "label": raw.get("label") or f"{prefix} {index + 1}",
                "met": bool(met_val) if met_val is not None else False,
                "description": raw.get("description"),
            }

        sufficiency_results = [
            AiCriterionResultOut(**_coerce_criterion(s, i, "Sufficiency"))
            for i, s in enumerate(result.get("sufficiency_results", []))
        ]
        criteria_results = [
            AiCriterionResultOut(**_coerce_criterion(c, i, "Criterion"))
            for i, c in enumerate(result.get("criteria", []))
        ]

        # Persist results (Steps 3 & 4) and per-control scores from AI
        if submission:
            _persist_ai_results(db, submission, result, user.id)
            submission.evaluation_edits = {}
            _persist_per_control_scores(
                db, cycle_id, result.get("controls", []),
                evaluation_result=submission.evaluation_result,
            )
            _recalculate_control_sufficiency(db, cycle_id, req.evidence_item_id)
            db.commit()
            # Do not write Artifact Registry on AI evaluate.
            # Artifact is created/versioned only on explicit submit-for-review.

        field_feedback = result.get("field_feedback") or {}

        return EvaluateEvidenceResponse(
            evidence_item_id=req.evidence_item_id,
            overall_met=result.get("overall_met", False),
            sufficiency_results=sufficiency_results,
            criteria=criteria_results,
            summary=result.get("summary"),
            remediation=_normalize_remediation(result.get("remediation")),
            field_feedback=field_feedback,
        )

    # --- Fallback: placeholder when no files uploaded yet ---
    # Use per-control criteria from evidence_sufficiency_matrix. UI shows only pass_if for evaluation.
    sufficiency_items: list[tuple[str, str]] = []
    criteria_items: list[tuple[str, str]] = []
    for row in matrix_rows:
        prefix = f"[{row.control_id}] "
        for id_, label in _parse_criteria_ai(getattr(row, "sufficiency_criteria", None)):
            sufficiency_items.append((f"{row.control_id}_{id_}", prefix + label))
        for id_, label in _eval_criteria_pass_if_only(getattr(row, "evaluation_criteria", None)):
            criteria_items.append((f"{row.control_id}_{id_}", prefix + label))

    sufficiency_results = [
        AiCriterionResultOut(
            id=id_,
            label=label,
            met=(i < 3),
            description=None if i < 3 else "Evidence does not yet demonstrate this requirement.",
        )
        for i, (id_, label) in enumerate(sufficiency_items)
    ]
    criteria_results = [
        AiCriterionResultOut(
            id=id_,
            label=label,
            met=(i < 2),
            description=None
            if i < 2
            else "AI: Evidence does not clearly address this check. Provide explicit confirmation or supporting detail.",
        )
        for i, (id_, label) in enumerate(criteria_items)
    ]
    if not criteria_results and not sufficiency_results:
        criteria_results = [
            AiCriterionResultOut(id="1", label="Criterion 1 (placeholder)", met=True, description=None),
            AiCriterionResultOut(
                id="2",
                label="Criterion 2 (placeholder)",
                met=False,
                description="Upload evidence files to enable AI evaluation.",
            ),
        ]

    return EvaluateEvidenceResponse(
        evidence_item_id=req.evidence_item_id,
        overall_met=all(c.met for c in criteria_results) and all(s.met for s in sufficiency_results),
        sufficiency_results=sufficiency_results,
        criteria=criteria_results,
        summary="Upload evidence files and re-evaluate to get AI-powered analysis.",
    )
