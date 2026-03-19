"""
Compliance officer–only API for user and group management.

Groups are not a separate table: they are stored as group_name on core.users.
- No dedicated group CRUD APIs (no GET/POST/PATCH/DELETE /groups).
- Create group: assign users to a group name via PATCH /compliance/users/:id { group_name }.
- Read groups: derive from GET /compliance/users (distinct group_name values).
- Update group (rename): PATCH each user in the group to the new group_name.
- Delete group: PATCH each user in the group to group_name: null (users stay; only unassigned).
All of the above persist in the DB (core.users.group_name).
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..middleware.auth import hash_password
from ..models.tenant import User
from ..services.user_deletion import delete_user_cascade
from ..schemas.compliance import (
    ComplianceUserOut,
    ComplianceUserCreate,
    ComplianceUserUpdateGroup,
)

router = APIRouter(prefix="/compliance", tags=["compliance"])

COMPLIANCE_MANAGER_ROLES = ("compliance_officer", "tenant_admin")


def _require_compliance_manager(user: User) -> None:
    """Only compliance officer or tenant admin can manage users and groups."""
    if user.role not in COMPLIANCE_MANAGER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Only Compliance Officer or Tenant Administrator can manage users and groups.",
        )


def _require_tenant(user: User) -> None:
    """User must belong to a tenant (not platform admin without tenant)."""
    if user.tenant_id is None:
        raise HTTPException(
            status_code=403,
            detail="Tenant context required. Platform admins manage users from the admin area.",
        )


def _user_to_out(u: User) -> ComplianceUserOut:
    return ComplianceUserOut(
        id=u.id,
        email=u.email,
        name=u.name,
        role=u.role,
        group_name=getattr(u, "group_name", None),
        is_external=getattr(u, "is_external", False),
    )


@router.get("/users", response_model=list[ComplianceUserOut])
def list_tenant_users(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    List all users in the compliance officer's tenant.
    Includes group_name (null = individual). Compliance officer or tenant admin only.
    """
    _require_compliance_manager(user)
    _require_tenant(user)
    rows = (
        db.query(User)
        .filter(User.tenant_id == user.tenant_id)
        .order_by(User.name, User.email)
        .all()
    )
    return [_user_to_out(u) for u in rows]


@router.post("/users/{user_id}/delete", status_code=204, response_class=Response)
def delete_tenant_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Delete a user from the tenant and all related assignments across cycles.
    """
    _require_compliance_manager(user)
    _require_tenant(user)
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.tenant_id != user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot delete users from another tenant.")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")
    db.expire(target)  # Avoid session refresh of deleted row
    try:
        delete_user_cascade(db, user_id)
        db.commit()
        return Response(status_code=204)
    except Exception:
        db.rollback()
        raise


@router.post("/users", response_model=ComplianceUserOut, status_code=201)
def create_tenant_user(
    req: ComplianceUserCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Create a user in the officer's tenant with name, email, password.
    Optionally assign to a group (group_name) or leave null for individual.
    Compliance officer or tenant admin only.
    """
    _require_compliance_manager(user)
    _require_tenant(user)
    existing = db.query(User).filter(
        User.email == req.email.strip().lower(),
        User.tenant_id == user.tenant_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"User with email {req.email} already exists in this tenant.",
        )
    name = (req.name or req.email or "").strip() or req.email
    new_user = User(
        email=req.email.strip().lower(),
        name=name,
        password_hash=hash_password(req.password),
        role=None,
        is_external=req.is_external,
        tenant_id=user.tenant_id,
        group_name=(req.group_name.strip() or None) if req.group_name else None,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        err = str(e.orig) if getattr(e, "orig", None) else str(e)
        if "null value" in err.lower() or "not null" in err.lower() or "violates not-null" in err.lower():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Database still requires a non-null user role. Restart the API (applies auto-migration) or run "
                    "backend/sql/35_user_role_nullable.sql on your database."
                ),
            ) from e
        raise HTTPException(status_code=400, detail="Could not create user.") from e
    db.refresh(new_user)
    return _user_to_out(new_user)


@router.patch("/users/{user_id}", response_model=ComplianceUserOut)
def update_user_group(
    user_id: UUID,
    req: ComplianceUserUpdateGroup,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Assign a user to a group or set as individual (group_name = null).
    Only compliance officer or tenant admin; only for users in the same tenant.
    """
    _require_compliance_manager(user)
    _require_tenant(user)
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.tenant_id != user.tenant_id:
        raise HTTPException(status_code=403, detail="Cannot update users from another tenant.")
    if req.group_name is not None:
        target.group_name = (req.group_name.strip() or None) if req.group_name else None
    if req.is_external is not None:
        target.is_external = req.is_external
    db.commit()
    db.refresh(target)
    return _user_to_out(target)
