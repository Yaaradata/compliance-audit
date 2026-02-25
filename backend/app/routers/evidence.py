from uuid import UUID
import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission, EvidenceAttachment
from ..models.framework import CanonicalEvidenceItem, ItemControlMapping
from ..models.sufficiency import SufficiencyEvaluation, SufficiencyScore
from ..schemas.evidence import (
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    SubmissionOut,
    EvaluateEvidenceRequest,
    EvaluateEvidenceResponse,
    AiCriterionResultOut,
)
from ..services import ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _submission_to_out(sub: EvidenceSubmission) -> SubmissionOut:
    """Build SubmissionOut with last_evaluation from stored evaluation_result."""
    last_evaluation = None
    if getattr(sub, "evaluation_result", None):
        try:
            last_evaluation = EvaluateEvidenceResponse.model_validate(sub.evaluation_result)
        except Exception:
            pass
    return SubmissionOut(
        id=sub.id,
        cycle_id=sub.cycle_id,
        evidence_item_id=sub.evidence_item_id,
        submitted_by=sub.submitted_by,
        status=sub.status,
        scope_key=sub.scope_key,
        form_data=sub.form_data or {},
        completion_pct=float(sub.completion_pct or 0),
        version=sub.version,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
        last_evaluation=last_evaluation,
    )


@router.get("/assessments/{cycle_id}/evidence", response_model=list[SubmissionOut])
def list_evidence(
    cycle_id: UUID,
    domain: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id)
    if user.role != "admin":
        q = q.filter(EvidenceSubmission.tenant_id == user.tenant_id)
    if domain:
        q = q.filter(EvidenceSubmission.evidence_item_id.like(f"{domain}%"))
    if status:
        q = q.filter(EvidenceSubmission.status == status)
    subs = q.order_by(EvidenceSubmission.created_at.desc()).all()
    return [_submission_to_out(s) for s in subs]


@router.post("/assessments/{cycle_id}/evidence", response_model=SubmissionOut, status_code=201)
def create_evidence(cycle_id: UUID, req: CreateSubmissionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = EvidenceSubmission(
        cycle_id=cycle_id,
        tenant_id=user.tenant_id,
        evidence_item_id=req.evidence_item_id,
        submitted_by=user.id,
        scope_key=req.scope_key,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _submission_to_out(sub)


@router.get("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def get_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _submission_to_out(sub)


@router.put("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def update_evidence(cycle_id: UUID, sub_id: UUID, req: UpdateSubmissionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if req.status:
        sub.status = req.status
    if req.form_data is not None:
        sub.form_data = req.form_data

    db.commit()
    db.refresh(sub)
    return _submission_to_out(sub)


@router.delete("/assessments/{cycle_id}/evidence/{sub_id}", status_code=204)
def delete_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
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
    submission.completion_pct = result.get("overall_score", 0)
    # Persist full evaluation so tick/cross status shows when user revisits
    submission.evaluation_result = {
        "evidence_item_id": submission.evidence_item_id,
        "overall_met": result.get("overall_met", False),
        "sufficiency_results": result.get("sufficiency_results", []),
        "criteria": result.get("criteria", []),
        "summary": result.get("summary"),
    }


def _recalculate_control_sufficiency(
    db: Session,
    cycle_id: UUID,
    evidence_item_id: str,
) -> None:
    """Step 4: aggregate all evidence submissions' scores per control."""
    mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == evidence_item_id)
        .all()
    )

    affected_control_ids = {m.control_id for m in mappings}

    for control_id in affected_control_ids:
        all_mappings = (
            db.query(ItemControlMapping)
            .filter(ItemControlMapping.control_id == control_id)
            .all()
        )

        weighted_sum = 0.0
        weight_total = 0.0
        for m in all_mappings:
            sub = (
                db.query(EvidenceSubmission)
                .filter(
                    EvidenceSubmission.cycle_id == cycle_id,
                    EvidenceSubmission.evidence_item_id == m.evidence_item_id,
                )
                .first()
            )
            if sub and float(sub.completion_pct or 0) > 0:
                weighted_sum += float(sub.completion_pct) * float(m.weight)
                weight_total += float(m.weight)

        score = weighted_sum / weight_total if weight_total > 0 else 0
        if score == 0:
            status = "not_started"
        elif score < 40:
            status = "insufficient"
        elif score < 80:
            status = "partial"
        else:
            status = "sufficient"

        existing = (
            db.query(SufficiencyScore)
            .filter(
                SufficiencyScore.cycle_id == cycle_id,
                SufficiencyScore.control_id == control_id,
            )
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


@router.post("/assessments/{cycle_id}/evidence/evaluate", response_model=EvaluateEvidenceResponse)
def evaluate_evidence(
    cycle_id: UUID,
    req: EvaluateEvidenceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Evaluate uploaded evidence files against canonical criteria using Vertex AI.

    When *submission_id* is provided the backend loads the associated file
    attachments from disk and sends them alongside the canonical evidence
    description / sufficiency definition / evaluation criteria to the AI model.
    Falls back to a lightweight placeholder when no files are available.
    """
    canonical = (
        db.query(CanonicalEvidenceItem)
        .filter(CanonicalEvidenceItem.id == req.evidence_item_id)
        .first()
    )
    if not canonical:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    control_mappings = (
        db.query(ItemControlMapping)
        .filter(ItemControlMapping.evidence_item_id == req.evidence_item_id)
        .all()
    )

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

    if attachments:
        import os

        file_parts = []
        for att in attachments:
            if not os.path.exists(att.storage_path):
                logger.warning("Attachment file missing: %s", att.storage_path)
                continue
            file_parts.append(ai_service.prepare_file_part(att.storage_path, att.file_type))

        if not file_parts:
            raise HTTPException(status_code=400, detail="No readable attachment files found on disk")

        try:
            result = ai_service.evaluate_evidence(file_parts, canonical, control_mappings)
        except Exception as exc:
            logger.exception("AI evaluation failed")
            raise HTTPException(status_code=502, detail=f"AI evaluation error: {exc}") from exc

        sufficiency_results = [
            AiCriterionResultOut(
                id=s.get("id", str(i + 1)),
                label=s.get("label", f"Sufficiency {i + 1}"),
                met=s.get("met", False),
                description=s.get("description"),
            )
            for i, s in enumerate(result.get("sufficiency_results", []))
        ]
        criteria_results = [
            AiCriterionResultOut(
                id=c.get("id", str(i + 1)),
                label=c.get("label", f"Criterion {i + 1}"),
                met=c.get("met", False),
                description=c.get("description"),
            )
            for i, c in enumerate(result.get("criteria", []))
        ]

        # Persist results (Steps 3 & 4)
        if submission:
            _persist_ai_results(db, submission, result, user.id)
            _recalculate_control_sufficiency(db, cycle_id, req.evidence_item_id)
            db.commit()

        return EvaluateEvidenceResponse(
            evidence_item_id=req.evidence_item_id,
            overall_met=result.get("overall_met", False),
            sufficiency_results=sufficiency_results,
            criteria=criteria_results,
            summary=result.get("summary"),
        )

    # --- Fallback: placeholder when no files uploaded yet ---
    sufficiency_items = _parse_numbered_json(getattr(canonical, "sufficiency_definition", None))
    criteria_items = _parse_numbered_json(getattr(canonical, "evaluation_criteria", None))

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
