from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..constants import PLATFORM_ADMIN_ROLES
from ..models.tenant import User
from ..schemas.auth import UserOut

router = APIRouter(prefix="/users")


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(User)
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        q = q.filter(User.tenant_id == user.tenant_id)
    return q.order_by(User.created_at.desc()).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if target.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    return target


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: UUID, updates: dict, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role not in PLATFORM_ADMIN_ROLES or user.tenant_id is not None:
        if target.tenant_id != user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")

    allowed = {"name", "role", "is_active"}
    for k, v in updates.items():
        if k in allowed:
            setattr(target, k, v)

    db.commit()
    db.refresh(target)
    return target
