from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.sufficiency import SufficiencyEvaluation

router = APIRouter()


@router.post("/evidence/{sub_id}/evaluate")
def evaluate(sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Placeholder: trigger sufficiency evaluation (AI would go here)."""
    return {"detail": "Evaluation queued", "submission_id": str(sub_id), "scores": []}


@router.get("/evidence/{sub_id}/evaluations")
def get_evaluations(sub_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    evals = db.query(SufficiencyEvaluation).filter(SufficiencyEvaluation.submission_id == sub_id).all()
    return [
        {
            "id": str(e.id),
            "dimension_code": e.dimension_code,
            "score": float(e.score),
            "rationale": e.rationale,
            "source": e.source,
            "evaluated_at": str(e.evaluated_at),
        }
        for e in evals
    ]
