from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..constants import PLATFORM_ADMIN_ROLES
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, ControlApplicability, EvidenceSubmission
from ..models.approval import ApprovalGate
from ..models.framework import Control, EvidenceDomain, CanonicalEvidenceItem, AuditFramework
from ..schemas.assessment import (
    CreateCycleRequest, UpdateCycleRequest, CycleOut,
    DashboardResponse, DomainScore, ControlScore,
)

router = APIRouter(prefix="/assessments")

GATE_TYPES = ["evidence_complete", "internal_review", "assessment_complete", "final_attestation"]


@router.get("", response_model=list[CycleOut])
def list_cycles(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(AssessmentCycle)
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        q = q.filter(AssessmentCycle.tenant_id == user.tenant_id)
    return q.order_by(AssessmentCycle.created_at.desc()).all()


@router.post("", response_model=CycleOut, status_code=201)
def create_cycle(req: CreateCycleRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.tenant_id is None:
        raise HTTPException(
            status_code=403,
            detail="Only tenant users can create assessment cycles. Platform admins manage tenants from the admin area.",
        )
    framework_id = req.framework_id
    if not framework_id:
        fw = db.query(AuditFramework).filter(AuditFramework.code == "SWIFT_CSCF").first()
        if fw:
            framework_id = fw.id

    cycle = AssessmentCycle(
        tenant_id=user.tenant_id,
        framework_id=framework_id,
        label=req.label,
        cycle_year=req.cycle_year,
        start_date=req.start_date,
        target_submission_date=req.target_submission_date,
        created_by=user.id,
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


def _require_cycle_access(cycle: AssessmentCycle | None, user: User) -> None:
    """Raise 404 if cycle missing, 403 if user may not access."""
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")


@router.get("/{cycle_id}", response_model=CycleOut)
def get_cycle(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)
    return cycle


@router.delete("/{cycle_id}", status_code=204)
def delete_cycle(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Delete an assessment cycle and all data tied to it.
    Cascades: evidence submissions, attachments, control applicability, approval gates,
    vendors, sufficiency scores, reports, reviews, etc.
    Any cycle that references this one as previous_cycle_id will have that reference cleared.
    """
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    # Clear references from other cycles so FK does not block delete
    db.query(AssessmentCycle).filter(AssessmentCycle.previous_cycle_id == cycle_id).update(
        {AssessmentCycle.previous_cycle_id: None}
    )
    db.delete(cycle)
    db.commit()
    return None


@router.put("/{cycle_id}", response_model=CycleOut)
def update_cycle(cycle_id: UUID, req: UpdateCycleRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    if req.architecture_type and not cycle.architecture_type:
        cycle.architecture_type = req.architecture_type
        _generate_control_applicability(db, cycle)
        _generate_approval_gates(db, cycle)
        cycle.phase = "collection"

    if req.label:
        cycle.label = req.label
    if req.target_submission_date:
        cycle.target_submission_date = req.target_submission_date

    db.commit()
    db.refresh(cycle)
    return cycle


@router.post("/{cycle_id}/advance-phase", response_model=CycleOut)
def advance_phase(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    phases = ["setup", "collection", "review", "approval", "reporting", "submitted", "archived"]
    idx = phases.index(cycle.phase)
    if idx >= len(phases) - 1:
        raise HTTPException(status_code=400, detail="Already at final phase")

    cycle.phase = phases[idx + 1]
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/{cycle_id}/dashboard", response_model=DashboardResponse)
def dashboard(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user)

    domains = db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()
    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    submissions = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()

    sub_by_domain: dict[str, int] = {}
    for s in submissions:
        domain_id = s.evidence_item_id[0] if s.evidence_item_id else ""
        if s.status in ("approved", "submitted"):
            sub_by_domain[domain_id] = sub_by_domain.get(domain_id, 0) + 1

    domain_scores = []
    for d in domains:
        completed = sub_by_domain.get(d.id, 0)
        total = d.item_count if d.item_count is not None else 0
        score = round((completed / total * 100) if total > 0 else 0, 1)
        domain_scores.append(DomainScore(id=d.id or "", name=d.name or "", completed=completed, total=total, score=score))

    control_scores = []
    mandatory_count = 0
    gaps = []
    for ca in cas:
        control = db.query(Control).filter(Control.id == ca.control_id).first()
        cname = (control.name if control else ca.control_id) or ca.control_id or ""
        applicability = (ca.applicability or "").lower()
        ctype = "M" if applicability == "mandatory" else "A"
        if applicability == "mandatory":
            mandatory_count += 1
        score_val = float(ca.score) if ca.score is not None else 0.0
        status = ca.status or "not_started"
        evidence_count = ca.evidence_count if ca.evidence_count is not None else 0
        control_scores.append(ControlScore(id=ca.control_id or "", name=cname, type=ctype, score=score_val, status=status, evidence_count=evidence_count))
        if score_val < 50 and applicability == "mandatory":
            gaps.append({"control_id": ca.control_id, "name": cname, "score": score_val})

    total_evidence = sum((d.item_count or 0) for d in domains)
    completed_evidence = sum(1 for s in submissions if s.status in ("approved", "submitted"))
    overall = round((sum(float(ca.score or 0) for ca in cas) / len(cas)) if cas else 0, 1)

    return DashboardResponse(
        overall_score=overall,
        mandatory_controls=mandatory_count,
        total_controls=len(cas),
        evidence_items=completed_evidence,
        total_evidence_items=total_evidence,
        gaps_identified=len(gaps),
        domain_scores=domain_scores,
        control_scores=control_scores,
        gaps=gaps,
        suggestions=[],
    )


def _generate_control_applicability(db: Session, cycle: AssessmentCycle):
    """Auto-generate control_applicability rows based on architecture type."""
    controls = db.query(Control).all()
    arch = cycle.architecture_type

    for ctrl in controls:
        applicability_list = ctrl.architecture_applicability or []
        if arch in applicability_list:
            app_type = ctrl.control_type
        else:
            continue

        ca = ControlApplicability(
            cycle_id=cycle.id,
            control_id=ctrl.id,
            applicability=app_type,
        )
        db.add(ca)

    db.flush()


def _generate_approval_gates(db: Session, cycle: AssessmentCycle):
    """Auto-generate the 4 approval gates for a cycle."""
    for gate_type in GATE_TYPES:
        gate = ApprovalGate(cycle_id=cycle.id, gate=gate_type)
        db.add(gate)
    db.flush()
