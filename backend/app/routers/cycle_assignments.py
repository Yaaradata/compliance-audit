"""
Cycle role and evidence assignment APIs.
Compliance officer assigns groups/users to roles and evidence items per cycle.
"""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_db_scoped, get_current_user, _resolve_schema_for_cycle
from ..models.tenant import User
from ..models.assessment import (
    AssessmentCycle,
    CycleRoleAssignment,
    CycleEvidenceAssignment,
)
from ..models.framework import CanonicalEvidenceItem
from ..schemas.cycle_assignments import (
    RoleAssignmentsPut,
    EvidenceAssignmentsPut,
    ConflictOut,
)
from ..services.assignment_constraints import detect_conflicts, get_sme_user_ids, validate_l3_external

router = APIRouter(prefix="/assessments", tags=["cycle-assignments"])

COMPLIANCE_MANAGER_ROLES = ("compliance_officer", "tenant_admin")


def _require_compliance_manager(user: User) -> None:
    if user.role not in COMPLIANCE_MANAGER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Only Compliance Officer or Tenant Administrator can manage cycle assignments.",
        )


def _require_cycle_access(cycle: AssessmentCycle | None, user: User, db: Session) -> None:
    if not cycle:
        raise HTTPException(status_code=404, detail="Assessment cycle not found")
    if user.tenant_id != cycle.tenant_id:
        raise HTTPException(status_code=403, detail="Access denied")


def _effective_role_dates(
    start: date | None,
    end: date | None,
    cycle: AssessmentCycle,
    apply_cycle_if_missing: bool,
) -> tuple[date | None, date | None]:
    """Match chk_role_assignment_date_range: both NULL or both set with end >= start."""
    s, e = start, end
    if apply_cycle_if_missing and (s is None or e is None):
        s = s or cycle.start_date
        e = e or cycle.end_date
    if s is not None and e is None:
        e = cycle.end_date
    if e is not None and s is None:
        s = cycle.start_date
    if (s is None) ^ (e is None):
        raise HTTPException(
            status_code=400,
            detail=(
                "Each role assignment needs both role_start_date and role_end_date, or both omitted. "
                "If you send only one, the assessment cycle must have the other date set "
                "(cycle start_date / end_date), or enable apply_cycle_dates_if_missing."
            ),
        )
    if s is not None and e is not None and e < s:
        raise HTTPException(
            status_code=400,
            detail="role_end_date must be on or after role_start_date.",
        )
    return s, e


@router.get("/{cycle_id}/role-assignments")
def get_role_assignments(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List role assignments (groups/users per role) for this cycle."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    rows = (
        db.query(CycleRoleAssignment)
        .filter(CycleRoleAssignment.cycle_id == cycle_id)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "role": r.role,
            "assignment_type": r.assignment_type,
            "group_name": r.group_name,
            "user_id": str(r.user_id) if r.user_id else None,
            "role_start_date": r.role_start_date.isoformat() if r.role_start_date else None,
            "role_end_date": r.role_end_date.isoformat() if r.role_end_date else None,
        }
        for r in rows
    ]


@router.put("/{cycle_id}/role-assignments")
def put_role_assignments(
    cycle_id: UUID,
    req: RoleAssignmentsPut,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Replace role assignments. Validates conflicts and L3 external constraint."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    # Validate L3: only external users
    for a in req.assignments:
        if a.role == "external_assessor" and a.assignment_type == "user" and a.user_id:
            if not validate_l3_external(db, a.user_id):
                u = db.query(User).filter(User.id == a.user_id).first()
                name = (u.name or u.email or "User") if u else "User"
                raise HTTPException(
                    status_code=400,
                    detail=f"{name} is not marked as external. Only external assessors can be assigned to L3.",
                )

    resolved = [
        (
            a,
            *_effective_role_dates(
                a.role_start_date,
                a.role_end_date,
                cycle,
                req.apply_cycle_dates_if_missing,
            ),
        )
        for a in req.assignments
    ]
    raw = [
        {
            "role": a.role,
            "assignment_type": a.assignment_type,
            "group_name": a.group_name,
            "user_id": a.user_id,
            "role_start_date": eff_start,
            "role_end_date": eff_end,
        }
        for a, eff_start, eff_end in resolved
    ]
    conflicts = detect_conflicts(db, cycle_id, raw)
    if conflicts:
        raise HTTPException(
            status_code=400,
            detail={
                "conflicts": [ConflictOut.model_validate(c).model_dump() for c in conflicts],
                "message": "Segregation of Duties violations. Resolve conflicts before saving.",
            },
        )

    # Replace
    db.query(CycleRoleAssignment).filter(CycleRoleAssignment.cycle_id == cycle_id).delete()
    for a, effective_start_date, effective_end_date in resolved:
        if a.assignment_type == "group" and a.group_name:
            db.add(
                CycleRoleAssignment(
                    cycle_id=cycle_id,
                    role=a.role,
                    assignment_type="group",
                    group_name=a.group_name,
                    user_id=None,
                    role_start_date=effective_start_date,
                    role_end_date=effective_end_date,
                )
            )
        elif a.assignment_type == "user" and a.user_id:
            db.add(
                CycleRoleAssignment(
                    cycle_id=cycle_id,
                    role=a.role,
                    assignment_type="user",
                    group_name=None,
                    user_id=a.user_id,
                    role_start_date=effective_start_date,
                    role_end_date=effective_end_date,
                )
            )
    db.commit()
    return {"ok": True, "count": len(req.assignments)}


@router.get("/{cycle_id}/assignment-conflicts")
def get_assignment_conflicts(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return list of SoD/group conflicts for current role assignments."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    rows = (
        db.query(CycleRoleAssignment)
        .filter(CycleRoleAssignment.cycle_id == cycle_id)
        .all()
    )
    raw = [
        {
            "role": r.role,
            "assignment_type": r.assignment_type,
            "group_name": r.group_name,
            "user_id": r.user_id,
        }
        for r in rows
    ]
    conflicts = detect_conflicts(db, cycle_id, raw)
    return {"conflicts": [ConflictOut.model_validate(c) for c in conflicts]}


@router.get("/{cycle_id}/evidence-assignments")
def get_evidence_assignments(
    cycle_id: UUID,
    db: Session = Depends(get_db_scoped),
    user: User = Depends(get_current_user),
):
    """List evidence item assignments for this cycle."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    rows = (
        db.query(CycleEvidenceAssignment)
        .filter(CycleEvidenceAssignment.cycle_id == cycle_id)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "evidence_item_id": r.evidence_item_id,
            "assignment_type": r.assignment_type,
            "group_name": r.group_name,
            "user_id": str(r.user_id) if r.user_id else None,
            "evidence_start_date": r.evidence_start_date.isoformat() if r.evidence_start_date else None,
            "evidence_end_date": r.evidence_end_date.isoformat() if r.evidence_end_date else None,
        }
        for r in rows
    ]


@router.put("/{cycle_id}/evidence-assignments")
def put_evidence_assignments(
    cycle_id: UUID,
    req: EvidenceAssignmentsPut,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Replace evidence assignments. Only groups/users assigned as IT Expert can be assigned."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    sme_uids = get_sme_user_ids(db, cycle_id)
    sme_groups = set()
    for r in db.query(CycleRoleAssignment).filter(
        CycleRoleAssignment.cycle_id == cycle_id,
        CycleRoleAssignment.role == "it_sme",
    ).all():
        if r.group_name:
            sme_groups.add(r.group_name)

    for a in req.assignments:
        if a.assignment_type == "group" and a.group_name:
            if a.group_name not in sme_groups:
                raise HTTPException(
                    status_code=400,
                    detail=f"Group '{a.group_name}' is not assigned as IT Expert for this cycle. Assign roles first.",
                )
        elif a.assignment_type == "user" and a.user_id:
            if str(a.user_id) not in sme_uids:
                u = db.query(User).filter(User.id == a.user_id).first()
                name = (u.name or u.email or "User") if u else "User"
                raise HTTPException(
                    status_code=400,
                    detail=f"{name} is not assigned as IT Expert for this cycle. Assign roles first.",
                )

    it_sme_start_date = None
    it_sme_end_date = None
    if req.apply_it_expert_dates_if_missing:
        it_sme_rows = (
            db.query(CycleRoleAssignment)
            .filter(
                CycleRoleAssignment.cycle_id == cycle_id,
                CycleRoleAssignment.role == "it_sme",
            )
            .all()
        )
        it_sme_start_date = next((r.role_start_date for r in it_sme_rows if r.role_start_date is not None), None)
        it_sme_end_date = next((r.role_end_date for r in it_sme_rows if r.role_end_date is not None), None)

    db.query(CycleEvidenceAssignment).filter(CycleEvidenceAssignment.cycle_id == cycle_id).delete()
    for a in req.assignments:
        effective_start_date = a.evidence_start_date
        effective_end_date = a.evidence_end_date
        if req.apply_it_expert_dates_if_missing and (effective_start_date is None or effective_end_date is None):
            effective_start_date = it_sme_start_date
            effective_end_date = it_sme_end_date
        if a.assignment_type == "group" and a.group_name:
            db.add(
                CycleEvidenceAssignment(
                    cycle_id=cycle_id,
                    evidence_item_id=a.evidence_item_id.strip().upper(),
                    assignment_type="group",
                    group_name=a.group_name,
                    user_id=None,
                    evidence_start_date=effective_start_date,
                    evidence_end_date=effective_end_date,
                )
            )
        elif a.assignment_type == "user" and a.user_id:
            db.add(
                CycleEvidenceAssignment(
                    cycle_id=cycle_id,
                    evidence_item_id=a.evidence_item_id.strip().upper(),
                    assignment_type="user",
                    group_name=None,
                    user_id=a.user_id,
                    evidence_start_date=effective_start_date,
                    evidence_end_date=effective_end_date,
                )
            )
    db.commit()
    return {"ok": True, "count": len(req.assignments)}


@router.get("/{cycle_id}/evidence-items")
def get_evidence_items_for_cycle(
    cycle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List canonical evidence items for this cycle's framework (for assignment UI)."""
    _require_compliance_manager(user)
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    _require_cycle_access(cycle, user, db)

    schema = _resolve_schema_for_cycle(db, cycle_id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})

    items = (
        db.query(CanonicalEvidenceItem)
        .order_by(CanonicalEvidenceItem.domain_id, CanonicalEvidenceItem.sort_order)
        .all()
    )
    return [
        {
            "id": e.id,
            "domain_id": e.domain_id,
            "name": e.name,
            "priority": e.priority,
        }
        for e in items
    ]
