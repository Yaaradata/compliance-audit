from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission, AssessmentCycle
from ..models.review import ReviewAssignment
from ..models.approval import ApprovalGate
from ..schemas.approval import GateOut, ApproveGateRequest

router = APIRouter()

GATE_ORDER = ["evidence_complete", "review_complete", "gaps_documented", "final_attestation"]

GATE_RENAME = {
    "internal_review": "review_complete",
    "assessment_complete": "gaps_documented",
}


def _ensure_gates_exist(db: Session, cycle_id: UUID):
    """Create all four gates if they don't exist yet. Renames old-format gate names."""
    gates = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).all()
    changed = False
    for g in gates:
        if g.gate in GATE_RENAME:
            g.gate = GATE_RENAME[g.gate]
            changed = True
    if changed:
        db.flush()

    existing = {g.gate for g in gates}
    for gate_name in GATE_ORDER:
        if gate_name not in existing:
            db.add(ApprovalGate(cycle_id=cycle_id, gate=gate_name))
            changed = True
    if changed:
        db.commit()


def _compute_gate_readiness(db: Session, cycle_id: UUID) -> dict[str, dict]:
    """Calculate per-gate readiness with progress percentages and blockers."""
    subs = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()
    total_subs = len(subs)
    approved_subs = [s for s in subs if s.status == "approved"]
    submitted_or_approved = [s for s in subs if s.status in ("submitted", "approved", "in_review")]

    reviews = (
        db.query(ReviewAssignment)
        .filter(ReviewAssignment.submission_id.in_([s.id for s in subs]))
        .all()
    ) if subs else []
    _l1, _l2, _l3 = "l1_completeness", "l2_quality", "l3_assessment"
    l1_approved = sum(1 for r in reviews if r.level == _l1 and r.status == "approved")
    l2_approved = sum(1 for r in reviews if r.level == _l2 and r.status == "approved")
    l3_reviewed = sum(1 for r in reviews if r.level == _l3 and r.status in ("approved", "escalated"))
    l1_total = sum(1 for r in reviews if r.level == _l1)
    l2_total = sum(1 for r in reviews if r.level == _l2)
    l3_total = sum(1 for r in reviews if r.level == _l3)

    gates = {g.gate: g for g in db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).all()}

    evidence_pct = (len(approved_subs) / total_subs * 100) if total_subs > 0 else 0
    evidence_blockers = [s.evidence_item_id for s in subs if s.status != "approved"]

    review_l1_pct = (l1_approved / l1_total * 100) if l1_total > 0 else (100 if total_subs == 0 else 0)
    review_l2_pct = (l2_approved / l2_total * 100) if l2_total > 0 else (100 if total_subs == 0 else 0)
    review_l3_pct = (l3_reviewed / l3_total * 100) if l3_total > 0 else 100
    review_pct = (review_l1_pct + review_l2_pct + review_l3_pct) / 3

    gaps_with_plans = len(approved_subs)
    gaps_pct = (gaps_with_plans / total_subs * 100) if total_subs > 0 else 0

    prev_approved = all(
        gates.get(g, None) and gates[g].status == "approved"
        for g in GATE_ORDER[:3]
    )
    final_pct = 100.0 if prev_approved else 0.0

    return {
        "evidence_complete": {
            "ready": evidence_pct >= 100,
            "progress_pct": round(evidence_pct, 1),
            "blockers": evidence_blockers[:10],
            "detail": f"{len(approved_subs)}/{total_subs} items approved",
        },
        "review_complete": {
            "ready": review_pct >= 100,
            "progress_pct": round(review_pct, 1),
            "blockers": [],
            "detail": f"L1: {l1_approved}/{l1_total}, L2: {l2_approved}/{l2_total}, L3: {l3_reviewed}/{l3_total}",
        },
        "gaps_documented": {
            "ready": gaps_pct >= 100,
            "progress_pct": round(gaps_pct, 1),
            "blockers": [],
            "detail": f"{gaps_with_plans}/{total_subs} items have remediation plans",
        },
        "final_attestation": {
            "ready": prev_approved,
            "progress_pct": final_pct,
            "blockers": [] if prev_approved else ["Previous gates must be approved first"],
            "detail": "All gates approved" if prev_approved else "Waiting for previous gates",
        },
    }


@router.get("/assessments/{cycle_id}/approval", response_model=list[GateOut])
def get_approval_status(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_gates_exist(db, cycle_id)
    gates = (
        db.query(ApprovalGate)
        .filter(ApprovalGate.cycle_id == cycle_id)
        .order_by(ApprovalGate.created_at)
        .all()
    )
    return gates


@router.get("/assessments/{cycle_id}/approval/summary")
def get_approval_summary(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Summary with per-gate progress, readiness, and blockers."""
    _ensure_gates_exist(db, cycle_id)

    gates = (
        db.query(ApprovalGate)
        .filter(ApprovalGate.cycle_id == cycle_id)
        .order_by(ApprovalGate.created_at)
        .all()
    )
    readiness = _compute_gate_readiness(db, cycle_id)

    subs = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()
    domain_breakdown: dict[str, dict] = {}
    for s in subs:
        domain = s.evidence_item_id[0] if s.evidence_item_id else "?"
        if domain not in domain_breakdown:
            domain_breakdown[domain] = {"total": 0, "approved": 0, "submitted": 0, "draft": 0}
        domain_breakdown[domain]["total"] += 1
        if s.status == "approved":
            domain_breakdown[domain]["approved"] += 1
        elif s.status in ("submitted", "in_review"):
            domain_breakdown[domain]["submitted"] += 1
        else:
            domain_breakdown[domain]["draft"] += 1

    total_items = len(subs)
    approved_items = sum(1 for s in subs if s.status == "approved")
    overall_pct = round(approved_items / total_items * 100, 1) if total_items > 0 else 0

    return {
        "overall_compliance_pct": overall_pct,
        "total_items": total_items,
        "approved_items": approved_items,
        "domain_breakdown": domain_breakdown,
        "gates": [
            {
                "gate": g.gate,
                "status": g.status,
                "approved_by": str(g.approved_by) if g.approved_by else None,
                "approved_at": str(g.approved_at) if g.approved_at else None,
                "mfa_verified": g.mfa_verified,
                "notes": g.notes,
                **readiness.get(g.gate, {}),
            }
            for g in gates
        ],
    }


@router.post("/assessments/{cycle_id}/approval/{gate_type}/approve", response_model=GateOut)
def approve_gate(
    cycle_id: UUID,
    gate_type: str,
    req: ApproveGateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("approver", "admin", "compliance_officer"):
        raise HTTPException(status_code=403, detail="Only approvers can approve gates")

    if user.role == "approver" or (gate_type == "final_attestation"):
        if user.role != "approver" and user.role != "admin":
            raise HTTPException(status_code=403, detail="Final attestation requires approver role")

    _ensure_gates_exist(db, cycle_id)
    gate = (
        db.query(ApprovalGate)
        .filter(ApprovalGate.cycle_id == cycle_id, ApprovalGate.gate == gate_type)
        .first()
    )
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    if gate.status == "approved":
        raise HTTPException(status_code=400, detail="Gate already approved")

    readiness = _compute_gate_readiness(db, cycle_id)
    gate_info = readiness.get(gate_type, {})
    if not gate_info.get("ready"):
        raise HTTPException(
            status_code=400,
            detail=f"Gate '{gate_type}' is not ready. {gate_info.get('detail', '')}",
        )

    gate.status = "approved"
    gate.approved_by = user.id
    gate.approved_at = datetime.now(timezone.utc)
    gate.notes = req.notes
    if gate_type == "final_attestation" and req.mfa_token:
        gate.mfa_verified = True

    db.commit()
    db.refresh(gate)
    return gate
