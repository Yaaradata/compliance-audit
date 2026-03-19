import logging
from uuid import UUID
import uuid as uuid_lib
from datetime import datetime, timezone, time

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_scoped, get_current_user, _resolve_schema_for_cycle
from ..constants import PLATFORM_ADMIN_ROLES, CYCLE_SCOPED_ROLES, is_cycle_scoped
from ..middleware.auth import hash_password
from ..models.tenant import User
from ..models.assessment import AssessmentCycle, CyclePhaseDeadline, ControlApplicability, EvidenceSubmission, CycleUserAssignment
from ..models.approval import ApprovalGate
from ..models.framework import Control, EvidenceDomain, CanonicalEvidenceItem, AuditFramework
from ..models.sufficiency import SufficiencyScore
from ..schemas.assessment import (
    CreateCycleRequest, UpdateCycleRequest, CycleOut,
    PhaseDeadlineOut,
    CycleTeamCreate, CycleTeamUserCreate,
    ROLE_TO_PHASE,
    DashboardResponse, DomainScore, ControlScore,
    ControlScopingItem, ControlScopingUpdateRequest,
    TIMELINE_PHASES,
)
from ..services.cycle_cleanup import delete_cycle_evidence_and_related
from ..services.assignment_constraints import get_user_cycle_ids, get_user_cycle_role
from ..services.batch_loaders import load_controls_by_ids
from ..services import storage_service
from . import controls as controls_router

router = APIRouter(prefix="/assessments")

GATE_TYPES = ["evidence_complete", "internal_review", "assessment_complete", "final_attestation"]
# Synthetic control used only for ESM/scoping (e.g. A5). Excluded from dashboard and control lists like v2025.
CONTROL_ID_ALL = "ALL"


def _attach_schema_name(cycle: AssessmentCycle, db: Session) -> None:
    """Attach schema_name (swift_2025 or swift_2026) from framework so frontend shows correct version and uses correct diagram/ref data."""
    from ..dependencies import _normalize_schema_name
    if cycle.framework_id:
        fw = db.query(AuditFramework).filter(AuditFramework.id == cycle.framework_id).first()
        raw = getattr(fw, "schema_name", None) if fw else None
        setattr(cycle, "schema_name", _normalize_schema_name(raw))
    else:
        setattr(cycle, "schema_name", "swift_2025")


@router.get("", response_model=list[CycleOut])
def list_cycles(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(AssessmentCycle)
    if is_cycle_scoped(user.role):
        # Cycle-scoped: only cycles they are assigned to (cycle_user_assignments or cycle_role_assignments)
        cycle_ids = get_user_cycle_ids(db, user.id)
        if not cycle_ids:
            return []
        q = q.filter(AssessmentCycle.id.in_(cycle_ids))
    elif user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        q = q.filter(AssessmentCycle.tenant_id == user.tenant_id)
    cycles = q.order_by(AssessmentCycle.created_at.desc()).all()
    for c in cycles:
        _attach_schema_name(c, db)
        schema = _resolve_schema_for_cycle(db, c.id)
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        deadlines = db.query(CyclePhaseDeadline).filter(CyclePhaseDeadline.cycle_id == c.id).all()
        setattr(c, "phase_deadlines", deadlines)
    return cycles


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
        end_date=req.end_date,
        target_submission_date=req.target_submission_date,
        created_by=user.id,
    )
    db.add(cycle)
    db.flush()
    if req.phase_deadlines:
        schema = _resolve_schema_for_cycle(db, cycle.id)
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        for phase in TIMELINE_PHASES:
            if phase not in req.phase_deadlines:
                continue
            pd_in = req.phase_deadlines[phase]
            db.add(CyclePhaseDeadline(
                cycle_id=cycle.id,
                phase=phase,
                start_at=pd_in.start_at,
                end_at=pd_in.end_at,
            ))
    db.commit()
    db.refresh(cycle)
    schema = _resolve_schema_for_cycle(db, cycle.id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    deadlines = db.query(CyclePhaseDeadline).filter(CyclePhaseDeadline.cycle_id == cycle.id).all()
    setattr(cycle, "phase_deadlines", deadlines)
    _attach_schema_name(cycle, db)
    return CycleOut.model_validate(cycle)


def _require_cycle_access(cycle: AssessmentCycle | None, user: User, db: Session | None = None) -> None:
    """Raise 404 if cycle missing, 403 if user may not access."""
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if is_cycle_scoped(user.role):
        if not db:
            raise HTTPException(status_code=500, detail="Database session required for cycle access check")
        cycle_ids = get_user_cycle_ids(db, user.id)
        if cycle.id not in cycle_ids:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if cycle.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")


def _require_compliance_officer_or_admin(user: User) -> None:
    """Only compliance officer or platform admin can create cycle team users."""
    if user.role not in ("compliance_officer",) and user.role not in PLATFORM_ADMIN_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Only Compliance Officer or Platform Administrator can create team accounts for this cycle.",
        )


@router.post("/{cycle_id}/team", response_model=list[dict], status_code=201)
def create_cycle_team(
    cycle_id: UUID,
    req: CycleTeamCreate,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """
    Create user accounts for this cycle (IT SME, Internal Reviewer L1, Internal Reviewer L2, External Assessor).
    Only compliance officer (or platform admin) with access to the cycle can call this.
    Users are created in the same tenant as the cycle and can log in with the given email/password.
    Each user is assigned to this cycle via cycle_user_assignments for cycle-scoped access.
    """
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
    _require_compliance_officer_or_admin(user)

    tenant_id = cycle.tenant_id
    # Defaults from audit window if per-role dates are not provided
    default_start_dt = (
        datetime.combine(cycle.start_date, time.min).replace(tzinfo=timezone.utc)
        if cycle.start_date
        else None
    )
    default_end_dt = (
        datetime.combine(cycle.end_date, time.max).replace(tzinfo=timezone.utc)
        if cycle.end_date
        else None
    )
    created = []
    for u in req.users:
        if db.query(User).filter(User.email == u.email.strip().lower()).first():
            raise HTTPException(
                status_code=400,
                detail=f"User with email {u.email} already exists. Use a different email.",
            )
        name = (u.name or u.email or "").strip() or u.email
        new_user = User(
            email=u.email.strip().lower(),
            name=name,
            password_hash=hash_password(u.password),
            role=u.role,
            tenant_id=tenant_id,
        )
        db.add(new_user)
        db.flush()
        assignment = CycleUserAssignment(
            cycle_id=cycle_id,
            user_id=new_user.id,
            role=u.role,
        )
        db.add(assignment)
        created.append({"id": str(new_user.id), "email": new_user.email, "role": new_user.role})

        # Upsert phase deadline for this role's phase (evidence_upload, l1_review, etc.).
        # If per-user start/end not provided, fall back to audit cycle start/end dates.
        phase = ROLE_TO_PHASE.get(u.role)
        if phase and (default_start_dt is not None or u.start_at is not None) and (
            default_end_dt is not None or u.end_at is not None
        ):
            effective_start = u.start_at or default_start_dt
            effective_end = u.end_at or default_end_dt
            if effective_start is not None and effective_end is not None:
                schema = _resolve_schema_for_cycle(db, cycle_id)
                db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
                existing = db.query(CyclePhaseDeadline).filter(
                    CyclePhaseDeadline.cycle_id == cycle_id,
                    CyclePhaseDeadline.phase == phase,
                ).first()
                if existing:
                    existing.start_at = effective_start
                    existing.end_at = effective_end
                    existing.updated_at = datetime.now(timezone.utc)
                else:
                    db.add(
                        CyclePhaseDeadline(
                            cycle_id=cycle_id,
                            phase=phase,
                            start_at=effective_start,
                            end_at=effective_end,
                        )
                    )
                db.flush()

    db.commit()
    return created


@router.get("/{cycle_id}", response_model=CycleOut)
def get_cycle(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
    _attach_schema_name(cycle, db)
    schema = _resolve_schema_for_cycle(db, cycle.id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    deadlines = db.query(CyclePhaseDeadline).filter(CyclePhaseDeadline.cycle_id == cycle.id).all()
    setattr(cycle, "phase_deadlines", deadlines)
    return cycle


@router.get("/{cycle_id}/my-role")
def get_my_role(cycle_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Return the effective role for this user in this cycle.

    Priority: cycle_role_assignments > cycle_user_assignments (legacy) > user.role (global).
    This ensures compliance officers get their global role even without a cycle-specific assignment.
    """
    from ..models.assessment import CycleRoleAssignment as CRA

    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    all_role_assignments = db.query(CRA).filter(CRA.cycle_id == cycle_id).all()
    logger.info(
        "my-role DEBUG user=%s (id=%s, group=%s, global_role=%s) cycle=%s role_assignments=%s",
        user.email, user.id, user.group_name, user.role, cycle_id,
        [(r.role, r.assignment_type, r.group_name, str(r.user_id)) for r in all_role_assignments],
    )

    cycle_role = get_user_cycle_role(db, user.id, cycle_id)
    effective_role = cycle_role or user.role
    logger.info(
        "my-role RESULT user=%s cycle_role=%s effective=%s",
        user.email, cycle_role, effective_role,
    )
    return {"role": effective_role}


@router.delete("/{cycle_id}", status_code=204)
def delete_cycle(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    """
    Delete an assessment cycle and all data tied to it.

    - Deletes all evidence files from GCS (or local storage) for submissions in this cycle.
    - Removes evidence attachments, submissions, review assignments/comments,
      sufficiency scores/evaluations, reports, and vendors for this cycle.
    - Clears previous_cycle_id on other cycles, then deletes the cycle (with cascaded
      control applicability and approval gates).
    """
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    # Delete evidence files from storage and all related DB rows (attachments, submissions, reviews, etc.)
    delete_cycle_evidence_and_related(db, cycle_id)

    # Clear references from other cycles so FK does not block delete
    db.query(AssessmentCycle).filter(AssessmentCycle.previous_cycle_id == cycle_id).update(
        {AssessmentCycle.previous_cycle_id: None}
    )
    db.delete(cycle)
    db.commit()
    return None


@router.put("/{cycle_id}", response_model=CycleOut)
def update_cycle(cycle_id: UUID, req: UpdateCycleRequest, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    if req.architecture_type:
        if not cycle.architecture_type:
            cycle.architecture_type = req.architecture_type
            _generate_control_applicability(db, cycle)
            _generate_approval_gates(db, cycle)
            cycle.phase = "collection"
        elif cycle.architecture_type != req.architecture_type:
            # Architecture changed: regenerate control_applicability so only controls for the new arch are in scope (e.g. B must not show 1.1).
            db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).delete(synchronize_session=False)
            cycle.architecture_type = req.architecture_type
            _generate_control_applicability(db, cycle)

    if req.label:
        cycle.label = req.label
    if req.start_date is not None:
        cycle.start_date = req.start_date
    if req.end_date is not None:
        cycle.end_date = req.end_date
    if req.target_submission_date is not None:
        cycle.target_submission_date = req.target_submission_date
    if req.phase_deadlines is not None:
        db.query(CyclePhaseDeadline).filter(CyclePhaseDeadline.cycle_id == cycle_id).delete(synchronize_session=False)
        for phase in TIMELINE_PHASES:
            if phase not in req.phase_deadlines:
                continue
            pd_in = req.phase_deadlines[phase]
            db.add(CyclePhaseDeadline(cycle_id=cycle.id, phase=phase, start_at=pd_in.start_at, end_at=pd_in.end_at))

    db.commit()
    db.refresh(cycle)
    deadlines = db.query(CyclePhaseDeadline).filter(CyclePhaseDeadline.cycle_id == cycle.id).all()
    setattr(cycle, "phase_deadlines", deadlines)
    _attach_schema_name(cycle, db)
    return CycleOut.model_validate(cycle)


@router.get("/{cycle_id}/control-scoping", response_model=list[ControlScopingItem])
def get_control_scoping(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    """List all controls for this cycle with current scoping decision (Applicable / Not applicable / Accept risk)."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).order_by(ControlApplicability.control_id).all()
    # If cycle has architecture but no rows (e.g. old cycle or race), ensure control_applicability is generated
    if not cas and cycle.architecture_type:
        _generate_control_applicability(db, cycle)
        db.commit()
        cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).order_by(ControlApplicability.control_id).all()
    control_ids = [ca.control_id for ca in cas if (ca.control_id or "").strip().upper() != CONTROL_ID_ALL]
    controls_map = load_controls_by_ids(db, control_ids)
    result = []
    for ca in cas:
        if (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        ctrl = controls_map.get(ca.control_id)
        cname = (ctrl.name if ctrl else ca.control_id) or ca.control_id or ""
        ctype = "M" if (ca.applicability or "").lower() == "mandatory" else "A"
        decision = getattr(ca, "scoping_decision", None) or "applicable"
        result.append(ControlScopingItem(
            control_id=ca.control_id or "",
            control_name=cname,
            type=ctype,
            scoping_decision=decision,
            scoping_justification_text=getattr(ca, "scoping_justification_text", None),
            scoping_justification_file_path=getattr(ca, "scoping_justification_file_path", None),
        ))
    return result


def _scoping_decision_applicable(ca: ControlApplicability) -> bool:
    """True if this control is in scope (only 'applicable' counts; not_applicable and risk_accepted are excluded)."""
    decision = getattr(ca, "scoping_decision", None) or "applicable"
    return decision == "applicable"


@router.post("/{cycle_id}/control-scoping/upload-justification")
def upload_scoping_justification(
    cycle_id: UUID,
    file: UploadFile = File(...),
    control_id: str = Form(...),
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Upload a supporting document for control scoping (Not applicable / Accept risk). Returns path to store in PATCH."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
    ca = db.query(ControlApplicability).filter(
        ControlApplicability.cycle_id == cycle_id,
        ControlApplicability.control_id == control_id,
    ).first()
    if not ca or (control_id or "").strip().upper() == CONTROL_ID_ALL:
        raise HTTPException(status_code=404, detail="Control not found in this cycle")
    contents = file.file.read()
    safe_name = (file.filename or "document").replace("..", "").strip() or "document"
    relative_path = f"scoping/{cycle_id}/{control_id}/{uuid_lib.uuid4().hex}_{safe_name}"
    storage_path = storage_service.upload(
        relative_path, contents, file.content_type or "application/octet-stream"
    )
    return {"path": storage_path, "file_name": safe_name}


@router.patch("/{cycle_id}/control-scoping", response_model=list[ControlScopingItem])
def update_control_scoping(
    cycle_id: UUID,
    req: ControlScopingUpdateRequest,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """Update scoping decisions. For Not applicable and Accept risk, both justification text AND file are required."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)
    cas_by_id = {ca.control_id: ca for ca in db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()}
    for item in req.decisions:
        ca = cas_by_id.get(item.control_id)
        if not ca or (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        if item.scoping_decision not in ("applicable", "not_applicable", "risk_accepted"):
            continue
        if item.scoping_decision in ("not_applicable", "risk_accepted"):
            has_text = bool((item.scoping_justification_text or "").strip())
            has_file = bool((item.scoping_justification_file_path or "").strip())
            if not has_text or not has_file:
                raise HTTPException(
                    status_code=400,
                    detail=f"Both justification text and a supporting document are required for control {item.control_id} when decision is Not applicable or Accept risk.",
                )
        if hasattr(ca, "scoping_decision"):
            ca.scoping_decision = item.scoping_decision
        if hasattr(ca, "scoping_justification_text"):
            ca.scoping_justification_text = (item.scoping_justification_text or "").strip() or None
        if hasattr(ca, "scoping_justification_file_path"):
            ca.scoping_justification_file_path = (item.scoping_justification_file_path or "").strip() or None
    db.commit()
    return get_control_scoping(cycle_id, db, user)


@router.post("/{cycle_id}/advance-phase", response_model=CycleOut)
def advance_phase(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    phases = ["setup", "collection", "review", "approval", "reporting", "submitted", "archived"]
    idx = phases.index(cycle.phase)
    if idx >= len(phases) - 1:
        raise HTTPException(status_code=400, detail="Already at final phase")

    cycle.phase = phases[idx + 1]
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/{cycle_id}/controls/sufficiency-detail")
def sufficiency_detail(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Per-control sufficiency detail for tooltips and dashboard."""
    return controls_router.get_sufficiency_detail(cycle_id, db, user)


@router.get("/{cycle_id}/dashboard", response_model=DashboardResponse)
def dashboard(cycle_id: UUID, db: Session = Depends(get_db_scoped), user: User = Depends(get_current_user)):
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    domains = db.query(EvidenceDomain).order_by(EvidenceDomain.sort_order).all()
    cas = db.query(ControlApplicability).filter(ControlApplicability.cycle_id == cycle_id).all()
    submissions = db.query(EvidenceSubmission).filter(EvidenceSubmission.cycle_id == cycle_id).all()

    sub_by_domain: dict[str, int] = {}
    for s in submissions:
        domain_id = s.evidence_item_id[0] if s.evidence_item_id else ""
        if s.status in ("approved", "submitted", "in_review"):
            sub_by_domain[domain_id] = sub_by_domain.get(domain_id, 0) + 1

    domain_scores = []
    for d in domains:
        completed = sub_by_domain.get(d.id, 0)
        total = d.item_count if d.item_count is not None else 0
        score = round((completed / total * 100) if total > 0 else 0, 1)
        domain_scores.append(DomainScore(id=d.id or "", name=d.name or "", completed=completed, total=total, score=score))

    suf_scores: dict[str, SufficiencyScore] = {}
    for ss in db.query(SufficiencyScore).filter(SufficiencyScore.cycle_id == cycle_id).all():
        suf_scores[ss.control_id] = ss

    controls_map = load_controls_by_ids(db, [ca.control_id for ca in cas])

    control_scores = []
    mandatory_count = 0
    gaps = []
    for ca in cas:
        if (ca.control_id or "").strip().upper() == CONTROL_ID_ALL:
            continue
        if not _scoping_decision_applicable(ca):
            continue
        control = controls_map.get(ca.control_id)
        cname = (control.name if control else ca.control_id) or ca.control_id or ""
        applicability = (ca.applicability or "").lower()
        ctype = "M" if applicability == "mandatory" else "A"
        if applicability == "mandatory":
            mandatory_count += 1
        suf = suf_scores.get(ca.control_id)
        score_val = float(suf.overall_score if suf else ca.score) if (suf or ca.score) else 0.0
        status = (suf.status if suf else ca.status) or "not_started"
        evidence_count = ca.evidence_count if ca.evidence_count is not None else 0
        control_scores.append(ControlScore(id=ca.control_id or "", name=cname, type=ctype, score=score_val, status=status, evidence_count=evidence_count))
        if score_val < 50 and applicability == "mandatory":
            gaps.append({"control_id": ca.control_id, "name": cname, "score": score_val})

    total_evidence = sum((d.item_count or 0) for d in domains)
    completed_evidence = sum(1 for s in submissions if s.status in ("approved", "submitted", "in_review"))
    overall = round(
        (sum(cs.score for cs in control_scores) / len(control_scores)) if control_scores else 0, 1
    )

    return DashboardResponse(
        overall_score=overall,
        mandatory_controls=mandatory_count,
        total_controls=len(control_scores),
        evidence_items=completed_evidence,
        total_evidence_items=total_evidence,
        gaps_identified=len(gaps),
        domain_scores=domain_scores,
        control_scores=control_scores,
        gaps=gaps,
        suggestions=[],
    )


def _generate_control_applicability(db: Session, cycle: AssessmentCycle):
    """Auto-generate control_applicability rows based on architecture type. Excludes synthetic 'ALL' (same as v2025)."""
    controls = db.query(Control).all()
    arch = cycle.architecture_type

    for ctrl in controls:
        if (ctrl.id or "").strip().upper() == CONTROL_ID_ALL:
            continue
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
