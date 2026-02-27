from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..constants import PLATFORM_ADMIN_ROLES
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, ControlApplicability
from ..models.framework import Control, ItemControlMapping
from ..models.sufficiency import SufficiencyScore
from ..schemas.assessment import ControlScore

router = APIRouter()


def _require_cycle_access(cycle: AssessmentCycle | None, user: User) -> None:
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")


@router.get("/assessments/{cycle_id}/controls", response_model=list[ControlScore])
def list_controls(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    result = []
    for ca in cas:
        ctrl = db.query(Control).filter(Control.id == ca.control_id).first()
        suf = (
            db.query(SufficiencyScore)
            .filter(
                SufficiencyScore.cycle_id == cycle_id,
                SufficiencyScore.control_id == ca.control_id,
            )
            .first()
        )
        score_val = (suf.overall_score if suf else ca.score) if (suf or ca) else 0
        score = float(score_val) if score_val is not None else 0.0
        status = (suf.status if suf else ca.status) or "not_started"
        result.append(ControlScore(
            id=ca.control_id or "",
            name=(ctrl.name if ctrl else ca.control_id) or ca.control_id or "",
            type="M" if (ca.applicability or "").lower() == "mandatory" else "A",
            score=score,
            status=status,
            evidence_count=ca.evidence_count if ca.evidence_count is not None else 0,
        ))
    return result


@router.get("/assessments/{cycle_id}/control-matrix")
def control_matrix(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    result = []
    for ca in cas:
        ctrl = db.query(Control).filter(Control.id == ca.control_id).first()
        mappings = db.query(ItemControlMapping).filter(ItemControlMapping.control_id == ca.control_id).all()
        result.append({
            "control_id": ca.control_id,
            "name": ctrl.name if ctrl else ca.control_id,
            "type": "M" if ca.applicability == "mandatory" else "A",
            "score": float(ca.score or 0),
            "evidence_items": [m.evidence_item_id for m in mappings],
        })
    return result
