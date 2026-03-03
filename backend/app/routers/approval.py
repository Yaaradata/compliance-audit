from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.assessment import EvidenceSubmission, AssessmentCycle
from ..models.review import ReviewAssignment
from ..models.approval import ApprovalGate
from ..schemas.approval import GateOut, ApproveGateRequest
from ..services import evidence_status as evidence_status_svc
from ..services.batch_loaders import load_users_by_ids

router = APIRouter()

# DB enum gate_type only allows: evidence_complete, internal_review, assessment_complete, final_attestation
GATE_ORDER_DB = ["evidence_complete", "internal_review", "assessment_complete", "final_attestation"]
# Display/API names for frontend (same order as GATE_ORDER_DB)
GATE_ORDER = ["evidence_complete", "review_complete", "gaps_documented", "final_attestation"]
DB_TO_DISPLAY = {"internal_review": "review_complete", "assessment_complete": "gaps_documented"}
DISPLAY_TO_DB = {"review_complete": "internal_review", "gaps_documented": "assessment_complete"}


def _gate_display(gate_db: str) -> str:
    return DB_TO_DISPLAY.get(gate_db, gate_db)


def _ensure_gates_exist(db: Session, cycle_id: UUID):
    """Create all four gates if they don't exist yet. Uses DB enum values only.
    Normalizes any gates that were stored with display names (e.g. gaps_documented) to DB enum values
    so PostgreSQL enum gate_type is not violated on flush."""
    gates = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).all()
    changed = False
    for g in gates:
        if g.gate in DISPLAY_TO_DB:
            g.gate = DISPLAY_TO_DB[g.gate]
            changed = True
    existing = {g.gate for g in gates}
    for gate_db in GATE_ORDER_DB:
        if gate_db not in existing:
            db.add(ApprovalGate(cycle_id=cycle_id, gate=gate_db))
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

    gates_raw = db.query(ApprovalGate).filter(ApprovalGate.cycle_id == cycle_id).all()
    gates = {_gate_display(g.gate): g for g in gates_raw}

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
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role not in ("admin", "tenant_admin", "approver", "compliance_officer", "internal_reviewer", "external_assessor"):
        raise HTTPException(status_code=403, detail="Not authorized to view approval")
    if user.role != "admin" and user.tenant_id != cycle.tenant_id:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")

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
    review_level_stats = {
        "L1": {"approved": l1_approved, "total": l1_total, "pct": round((l1_approved / l1_total * 100), 1) if l1_total else 100},
        "L2": {"approved": l2_approved, "total": l2_total, "pct": round((l2_approved / l2_total * 100), 1) if l2_total else 100},
        "L3": {"approved": l3_reviewed, "total": l3_total, "pct": round((l3_reviewed / l3_total * 100), 1) if l3_total else 100},
    }
    all_l_cleared = (
        (l1_total == 0 or l1_approved >= l1_total)
        and (l2_total == 0 or l2_approved >= l2_total)
        and (l3_total == 0 or l3_reviewed >= l3_total)
    )

    def _display_status(s: EvidenceSubmission) -> str:
        try:
            return evidence_status_svc.evidence_display_status(s.status or "draft", db, s.id)
        except Exception:
            return s.status or "draft"

    evidence_for_approval = [
        {
            "id": str(s.id),
            "evidence_item_id": s.evidence_item_id or "",
            "status": _display_status(s),
            "submitted_at": str(s.submitted_at) if s.submitted_at else None,
        }
        for s in subs
    ]

    order_index = {name: i for i, name in enumerate(GATE_ORDER)}
    gates_sorted = sorted(gates, key=lambda g: order_index.get(_gate_display(g.gate), 99))

    DB_TO_LEVEL = {"l1_completeness": "L1", "l2_quality": "L2", "l3_assessment": "L3"}
    reviewer_ids = list({r.reviewer_id for r in reviews})
    submitter_ids = list({s.submitted_by for s in subs if s.submitted_by})
    all_user_ids = list(set(reviewer_ids + submitter_ids))
    users_map = load_users_by_ids(db, all_user_ids) if all_user_ids else {}

    reviews_by_sub: dict[str, list] = {}
    for r in reviews:
        key = str(r.submission_id)
        if key not in reviews_by_sub:
            reviews_by_sub[key] = []
        reviewer = users_map.get(r.reviewer_id)
        reviews_by_sub[key].append({
            "level": DB_TO_LEVEL.get(r.level, r.level),
            "status": r.status,
            "decision": r.decision,
            "reviewer_name": reviewer.name if reviewer else None,
            "assigned_at": str(r.assigned_at) if r.assigned_at else None,
            "completed_at": str(r.completed_at) if r.completed_at else None,
        })

    evidence_timeline = []
    for s in subs:
        submitter = users_map.get(s.submitted_by) if s.submitted_by else None
        s_reviews = reviews_by_sub.get(str(s.id), [])
        eval_result = s.evaluation_result or {}
        evidence_timeline.append({
            "id": str(s.id),
            "evidence_item_id": s.evidence_item_id or "",
            "status": _display_status(s),
            "submitted_at": str(s.submitted_at) if s.submitted_at else None,
            "submitter_name": submitter.name if submitter else None,
            "overall_met": eval_result.get("overall_met"),
            "eval_summary": eval_result.get("summary"),
            "reviews": sorted(s_reviews, key=lambda r: {"L1": 0, "L2": 1, "L3": 2}.get(r["level"], 9)),
        })

    return {
        "overall_compliance_pct": overall_pct,
        "total_items": total_items,
        "approved_items": approved_items,
        "review_level_stats": review_level_stats,
        "all_l_cleared": all_l_cleared,
        "evidence_for_approval": evidence_for_approval,
        "evidence_timeline": evidence_timeline,
        "domain_breakdown": domain_breakdown,
        "gates": [
            {
                "gate": _gate_display(g.gate),
                "status": g.status,
                "approved_by": str(g.approved_by) if g.approved_by else None,
                "approved_at": str(g.approved_at) if g.approved_at else None,
                "mfa_verified": g.mfa_verified,
                "notes": g.notes,
                **readiness.get(_gate_display(g.gate), {}),
            }
            for g in gates_sorted
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

    gate_db = DISPLAY_TO_DB.get(gate_type, gate_type)
    _ensure_gates_exist(db, cycle_id)
    gate = (
        db.query(ApprovalGate)
        .filter(ApprovalGate.cycle_id == cycle_id, ApprovalGate.gate == gate_db)
        .first()
    )
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    if gate.status == "approved":
        raise HTTPException(status_code=400, detail="Gate already approved")

    readiness = _compute_gate_readiness(db, cycle_id)
    gate_info = readiness.get(_gate_display(gate.gate), {})
    if not gate_info.get("ready"):
        raise HTTPException(
            status_code=400,
            detail=f"Gate '{gate_type}' is not ready. {gate_info.get('detail', '')}",
        )

    if gate_type == "final_attestation":
        if not req.mfa_token or not req.mfa_token.strip():
            raise HTTPException(
                status_code=400,
                detail="MFA token is required for final attestation (CISO / Head of Compliance sign-off).",
            )
        gate.mfa_verified = True

    gate.status = "approved"
    gate.approved_by = user.id
    gate.approved_at = datetime.now(timezone.utc)
    gate.notes = req.notes

    db.commit()
    db.refresh(gate)
    return gate
