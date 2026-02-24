from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
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
    if user.role != "admin":
        q = q.filter(AssessmentCycle.tenant_id == user.tenant_id)
    return q.order_by(AssessmentCycle.created_at.desc()).all()


@router.post("", response_model=CycleOut, status_code=201)
def create_cycle(req: CreateCycleRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
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


@router.get("/{cycle_id}", response_model=CycleOut)
def get_cycle(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role != "admin" and cycle.tenant_id != user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return cycle


@router.put("/{cycle_id}", response_model=CycleOut)
def update_cycle(cycle_id: UUID, req: UpdateCycleRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.role != "admin" and cycle.tenant_id != user.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")

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
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")

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
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")

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
        total = d.item_count
        score = round((completed / total * 100) if total > 0 else 0, 1)
        domain_scores.append(DomainScore(id=d.id, name=d.name, completed=completed, total=total, score=score))

    control_scores = []
    mandatory_count = 0
    gaps = []
    for ca in cas:
        control = db.query(Control).filter(Control.id == ca.control_id).first()
        cname = control.name if control else ca.control_id
        ctype = "M" if ca.applicability == "mandatory" else "A"
        if ca.applicability == "mandatory":
            mandatory_count += 1
        control_scores.append(ControlScore(id=ca.control_id, name=cname, type=ctype, score=float(ca.score or 0), status=ca.status, evidence_count=ca.evidence_count))
        if float(ca.score or 0) < 50 and ca.applicability == "mandatory":
            gaps.append({"control_id": ca.control_id, "name": cname, "score": float(ca.score or 0)})

    total_evidence = sum(d.item_count for d in domains)
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
