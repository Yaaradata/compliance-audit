"""
Segregation of Duties and assignment constraint validation for cycle role assignments.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from ..models.tenant import User
from ..models.assessment import CycleRoleAssignment


CYCLE_ROLES = ("it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor")


def _user_ids_from_assignments(db: Session, cycle_id: UUID, assignments: list[dict]) -> dict[str, list[str]]:
    """
    Map role -> list of user_ids that have that role for this cycle.
    For group assignments: expand to all users in that group (group_name on users).
    For user assignments: add that user_id.
    """
    role_to_uids: dict[str, list[str]] = {r: [] for r in CYCLE_ROLES}
    tenant_id = None

    for a in assignments:
        role = (a.get("role") or "").strip()
        if role not in CYCLE_ROLES:
            continue
        atype = (a.get("assignment_type") or "").strip()
        group_name = (a.get("group_name") or "").strip() or None
        user_id = a.get("user_id")

        if atype == "group" and group_name:
            users_in_group = (
                db.query(User)
                .filter(User.group_name == group_name)
                .all()
            )
            for u in users_in_group:
                if tenant_id is None and u.tenant_id:
                    tenant_id = u.tenant_id
                role_to_uids[role].append(str(u.id))
        elif atype == "user" and user_id:
            u = db.query(User).filter(User.id == user_id).first()
            if u:
                if tenant_id is None and u.tenant_id:
                    tenant_id = u.tenant_id
                role_to_uids[role].append(str(u.id))

    return role_to_uids


def detect_conflicts(
    db: Session,
    cycle_id: UUID,
    assignments: list[dict],
) -> list[dict]:
    """
    Detect Segregation of Duties violations.
    Returns list of {uid, name, roles, msg}.
    """
    role_to_uids = _user_ids_from_assignments(db, cycle_id, assignments)
    uid_to_roles: dict[str, list[str]] = {}
    uid_to_name: dict[str, str] = {}

    for role, uids in role_to_uids.items():
        for uid in uids:
            if uid not in uid_to_roles:
                uid_to_roles[uid] = []
                u = db.query(User).filter(User.id == uid).first()
                uid_to_name[uid] = (u.name or u.email or uid) if u else uid
            if role not in uid_to_roles[uid]:
                uid_to_roles[uid].append(role)

    conflicts = []
    for uid, roles in uid_to_roles.items():
        if len(roles) > 1:
            role_labels = {"it_sme": "IT Expert", "internal_reviewer_l1": "L1", "internal_reviewer_l2": "L2", "external_assessor": "Approver"}
            labels = [role_labels.get(r, r) for r in roles]
            conflicts.append({
                "uid": uid,
                "name": uid_to_name.get(uid, uid),
                "roles": roles,
                "msg": f"{uid_to_name.get(uid, uid)} appears in multiple roles: {', '.join(labels)}",
            })

    # L3: internal staff assigned as external assessor
    for a in assignments:
        if (a.get("role") or "").strip() != "external_assessor":
            continue
        if (a.get("assignment_type") or "").strip() != "user":
            continue
        user_id = a.get("user_id")
        if not user_id:
            continue
        u = db.query(User).filter(User.id == user_id).first()
        if u and not getattr(u, "is_external", False):
            conflicts.append({
                "uid": str(u.id),
                "name": u.name or u.email,
                "roles": ["external_assessor"],
                "msg": f"{u.name or u.email} is internal staff but assigned as L3 External Assessor. Only external users are eligible.",
            })

    return conflicts


def validate_l3_external(db: Session, user_id: UUID) -> bool:
    """Return True if user is external (eligible for L3)."""
    u = db.query(User).filter(User.id == user_id).first()
    return bool(u and getattr(u, "is_external", False))


def get_user_cycle_role(db: Session, user_id: UUID, cycle_id: UUID) -> str | None:
    """
    Return the user's effective role for this cycle, or None if no access.
    Checks cycle_role_assignments first (group + user), then cycle_user_assignments (legacy).
    """
    from ..models.assessment import CycleUserAssignment

    # 1. Check cycle_role_assignments (group-based or direct user)
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for r in db.query(CycleRoleAssignment).filter(
            CycleRoleAssignment.cycle_id == cycle_id,
        ).all():
            if r.assignment_type == "user" and r.user_id == user_id:
                return r.role
            if r.assignment_type == "group" and r.group_name and user.group_name == r.group_name:
                return r.role

    # 2. Fallback: cycle_user_assignments (legacy)
    a = (
        db.query(CycleUserAssignment)
        .filter(CycleUserAssignment.cycle_id == cycle_id, CycleUserAssignment.user_id == user_id)
        .first()
    )
    return a.role if a else None


def get_user_cycle_ids(db: Session, user_id: UUID) -> list[UUID]:
    """
    Return cycle_ids the user has access to (from cycle_role_assignments or cycle_user_assignments).
    """
    from ..models.assessment import CycleUserAssignment

    cycle_ids = set()

    # From cycle_user_assignments (legacy)
    for a in db.query(CycleUserAssignment).filter(CycleUserAssignment.user_id == user_id).all():
        cycle_ids.add(a.cycle_id)

    # From cycle_role_assignments (group + user)
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for r in db.query(CycleRoleAssignment).filter(
            CycleRoleAssignment.assignment_type == "user",
            CycleRoleAssignment.user_id == user_id,
        ).all():
            cycle_ids.add(r.cycle_id)
        if user.group_name:
            for r in db.query(CycleRoleAssignment).filter(
                CycleRoleAssignment.assignment_type == "group",
                CycleRoleAssignment.group_name == user.group_name,
            ).all():
                cycle_ids.add(r.cycle_id)

    return list(cycle_ids)


def get_sme_user_ids(db: Session, cycle_id: UUID) -> set[str]:
    """Return set of user_ids that are assigned as IT Expert for this cycle (from cycle_role_assignments)."""
    uids = set()
    rows = (
        db.query(CycleRoleAssignment)
        .filter(CycleRoleAssignment.cycle_id == cycle_id, CycleRoleAssignment.role == "it_sme")
        .all()
    )
    for r in rows:
        if r.assignment_type == "group" and r.group_name:
            users = db.query(User).filter(User.group_name == r.group_name).all()
            for u in users:
                uids.add(str(u.id))
        elif r.assignment_type == "user" and r.user_id:
            uids.add(str(r.user_id))
    return uids


def get_user_assigned_evidence_items(db: Session, cycle_id: UUID, user_id: UUID) -> set[str] | None:
    """
    Return evidence_item_ids the user is assigned to for this cycle, or None if no assignments exist.
    None means all IT Experts can upload (plan option a).
    """
    from ..models.assessment import CycleEvidenceAssignment

    rows = (
        db.query(CycleEvidenceAssignment)
        .filter(CycleEvidenceAssignment.cycle_id == cycle_id)
        .all()
    )
    if not rows:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return set()

    assigned = set()
    for r in rows:
        if r.assignment_type == "group" and r.group_name and user.group_name == r.group_name:
            assigned.add((r.evidence_item_id or "").strip().upper())
        elif r.assignment_type == "user" and r.user_id == user_id:
            assigned.add((r.evidence_item_id or "").strip().upper())
    return assigned
