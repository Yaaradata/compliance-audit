from uuid import UUID
import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission
from ..models.framework import CanonicalEvidenceItem
from ..schemas.evidence import (
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    SubmissionOut,
    EvaluateEvidenceRequest,
    EvaluateEvidenceResponse,
    AiCriterionResultOut,
)

router = APIRouter()


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
    return q.order_by(EvidenceSubmission.created_at.desc()).all()


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
    return sub


@router.get("/assessments/{cycle_id}/evidence/{sub_id}", response_model=SubmissionOut)
def get_evidence(cycle_id: UUID, sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id, EvidenceSubmission.cycle_id == cycle_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


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
    return sub


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


@router.post("/assessments/{cycle_id}/evidence/evaluate", response_model=EvaluateEvidenceResponse)
def evaluate_evidence(
    cycle_id: UUID,
    req: EvaluateEvidenceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Placeholder: AI reads Evidence Description, Sufficiency Definition, Evaluation Criteria + submission and returns sufficiency_results (ticked when met) and criteria (tick or missing reason). Replace with real AI call when integrated."""
    canonical = db.query(CanonicalEvidenceItem).filter(CanonicalEvidenceItem.id == req.evidence_item_id).first()
    sufficiency_items = _parse_numbered_json(getattr(canonical, "sufficiency_definition", None)) if canonical else []
    criteria_items = _parse_numbered_json(getattr(canonical, "evaluation_criteria", None)) if canonical else []

    # Placeholder: mark first 3 sufficiency as met, rest not met; first 2 criteria met, rest not met with description
    sufficiency_results = [
        AiCriterionResultOut(id=id_, label=label, met=(i < 3), description=None if i < 3 else "Evidence does not yet demonstrate this requirement.")
        for i, (id_, label) in enumerate(sufficiency_items)
    ]
    criteria_results = [
        AiCriterionResultOut(
            id=id_,
            label=label,
            met=(i < 2),
            description=None if i < 2 else "AI: Evidence does not clearly address this check. Provide explicit confirmation or supporting detail.",
        )
        for i, (id_, label) in enumerate(criteria_items)
    ]
    if not criteria_results and not sufficiency_results:
        criteria_results = [
            AiCriterionResultOut(id="1", label="Criterion 1 (placeholder)", met=True, description=None),
            AiCriterionResultOut(id="2", label="Criterion 2 (placeholder)", met=False, description="Placeholder: integrate AI to evaluate evidence against criteria."),
        ]

    return EvaluateEvidenceResponse(
        evidence_item_id=req.evidence_item_id,
        overall_met=all(c.met for c in criteria_results) and all(s.met for s in sufficiency_results),
        sufficiency_results=sufficiency_results,
        criteria=criteria_results,
        summary="Placeholder: integrate AI to evaluate evidence against Sufficiency Definition and Evaluation Criteria.",
    )
