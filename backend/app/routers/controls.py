from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import ControlApplicability
from ..models.framework import Control, ItemControlMapping
from ..schemas.assessment import ControlScore

router = APIRouter()


@router.get("/assessments/{cycle_id}/controls", response_model=list[ControlScore])
def list_controls(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    result = []
    for ca in cas:
        ctrl = db.query(Control).filter(Control.id == ca.control_id).first()
        result.append(ControlScore(
            id=ca.control_id,
            name=ctrl.name if ctrl else ca.control_id,
            type="M" if ca.applicability == "mandatory" else "A",
            score=float(ca.score or 0),
            status=ca.status,
            evidence_count=ca.evidence_count,
        ))
    return result


@router.get("/assessments/{cycle_id}/control-matrix")
def control_matrix(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
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
