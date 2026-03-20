from uuid import UUID
import json
import logging
from datetime import datetime, timezone

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
from app.aws_evidence.core.db import get_db as get_aws_db, ensure_schema as ensure_aws_schema
from app.aws_evidence.services import evidence_service as aws_evidence_service
from ..services import ai_service
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


def _evidence_source_allows_aws_llm(evidence_source: str | None) -> bool:
    """True when classification is AWS-only or AWS+Human (excludes Human-only)."""
    s = " ".join((evidence_source or "").split()).strip().lower()
    if not s:
        return False
    if s == "aws":
        return True
    if s.startswith("aws") and "human" in s:
        return True
    return False


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


def _submission_to_out(sub: EvidenceSubmission, db: Session | None = None) -> SubmissionOut:
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
    return SubmissionOut(
        id=sub.id,
        cycle_id=sub.cycle_id,
        evidence_item_id=sub.evidence_item_id,
        submitted_by=sub.submitted_by,
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

    return [_submission_to_out(s, db) for s in subs]


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
            val = fd.get(q.question_key) or ""
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

    by_control: dict[str, dict] = {}
    for ctrl in controls:
        cid = ctrl.get("control_id")
        if cid:
            by_control[cid] = ctrl

    for ctrl in by_control.values():
        control_id = ctrl.get("control_id")
        if not control_id:
            continue

        pass_count, fail_count = _count_pass_fail_for_control(control_id, suf_results + criteria)
        total_counted = pass_count + fail_count

        if total_counted > 0:
            score = round(pass_count / total_counted * 100, 1)
        else:
            score = float(ctrl.get("score", 0) or 0)

        status = _score_to_status(score)
        existing = (
            db.query(SufficiencyScore)
            .filter(SufficiencyScore.cycle_id == cycle_id, SufficiencyScore.control_id == control_id)
            .first()
        )
        if existing:
            existing.overall_score = score
            existing.status = status
            existing.last_evaluated_at = datetime.utcnow()
        else:
            db.add(SufficiencyScore(
                cycle_id=cycle_id,
                control_id=control_id,
                overall_score=score,
                status=status,
                last_evaluated_at=datetime.utcnow(),
            ))
            db.flush()  # so same session sees this row if we process this control again
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


@router.post(
    "/assessments/{cycle_id}/evidence-items/{item_id}/suggest-from-aws",
    response_model=AwsEvidenceSuggestResponse,
)
def suggest_evidence_fields_from_aws(
    cycle_id: UUID,
    item_id: str,
    db: Session = Depends(get_db_scoped),
    aws_db: Session = Depends(get_aws_db),
    user: User = Depends(get_current_user),
):
    """
    For the current user + cycle, load scoped rows from swift_2026.evidence for this evidence item,
    then ask Vertex AI to suggest answers only for form questions whose evidence_source is
    AWS or AWS + Human (excludes file/spreadsheet types).
    """
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
        if not _evidence_source_allows_aws_llm(src_raw):
            continue
        qtype = (q.question_type or "").strip().lower()
        if qtype not in _AWS_LLM_FILL_TYPES:
            continue
        opts = q.options if isinstance(q.options, list) else []
        if qtype == "spreadsheet":
            payload_opts = opts
        elif opts and qtype in ("select", "multiselect"):
            payload_opts = [str(x) for x in opts]
        else:
            payload_opts = []
        eligible_payload.append(
            {
                "question_key": q.question_key,
                "label": q.label,
                "question_type": q.question_type,
                "options": payload_opts,
                "guide": (q.guide or "")[:4000],
            }
        )
        question_sources[q.question_key] = src_raw.strip()

    if not eligible_payload:
        return AwsEvidenceSuggestResponse(
            suggestions={},
            question_keys_attempted=[],
            question_sources={},
            aws_evidence_bundle_count=0,
            aws_evidence_row_count=0,
            message="No questions with evidence_source AWS or AWS + Human (or no LLM-fillable field types) for this item.",
        )

    ensure_aws_schema()
    aws_rows = aws_evidence_service.get_evidence_for_item_code(
        aws_db,
        item_upper,
        tenant_id=user.tenant_id,
        cycle_id=cycle_id,
        user_id=user.id,
        limit=120,
    )
    bundle = aws_evidence_service.build_aws_evidence_bundle_for_llm(aws_rows)
    if not bundle:
        return AwsEvidenceSuggestResponse(
            suggestions={},
            question_keys_attempted=[p["question_key"] for p in eligible_payload],
            question_sources=question_sources,
            aws_evidence_bundle_count=0,
            aws_evidence_row_count=len(aws_rows),
            message="No AWS collector evidence found for this cycle and user. Run AWS collection first.",
        )

    try:
        suggestions = ai_service.suggest_answers_from_aws_evidence(
            evidence_item_id=item_upper,
            questions=eligible_payload,
            aws_evidence_bundle=bundle,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("suggest-from-aws failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}") from e

    return AwsEvidenceSuggestResponse(
        suggestions=suggestions,
        question_keys_attempted=[p["question_key"] for p in eligible_payload],
        question_sources=question_sources,
        aws_evidence_bundle_count=len(bundle),
        aws_evidence_row_count=len(aws_rows),
        message=None,
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
