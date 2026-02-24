from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.approval import ApprovalGate
from ..schemas.approval import GateOut, ApproveGateRequest

router = APIRouter()


@router.get("/assessments/{cycle_id}/approval", response_model=list[GateOut])
def get_approval_status(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    gates = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).order_by(ApprovalGate.created_at).all()
    return gates


@router.post("/assessments/{cycle_id}/approval/{gate_type}/approve", response_model=GateOut)
def approve_gate(
    cycle_id: UUID,
    gate_type: str,
    req: ApproveGateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    gate = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id, ApprovalGate.gate == gate_type).first()
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    if gate.status == "approved":
        raise HTTPException(status_code=400, detail="Gate already approved")

    gate.status = "approved"
    gate.approved_by = user.id
    gate.approved_at = datetime.now(timezone.utc)
    gate.notes = req.notes
    if gate_type == "final_attestation" and req.mfa_token:
        gate.mfa_verified = True

    db.commit()
    db.refresh(gate)
    return gate
