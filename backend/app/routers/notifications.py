from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.tenant import User
from ..models.notes import Notification
from ..schemas.notes import NotificationOut

router = APIRouter(prefix="/notifications")


def create_notification(
    db: Session,
    user_id: UUID,
    resource_type: str,
    resource_id: UUID,
    action: str,
    *,
    actor_id: UUID | None = None,
    title: str | None = None,
    body: str | None = None,
) -> Notification:
    """Create a notification for a user. Call from notes router and reviews router."""
    n = Notification(
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        actor_id=actor_id,
        title=title,
        body=body,
    )
    db.add(n)
    return n


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        q = q.filter(Notification.read_at.is_(None))
    notifications = q.order_by(Notification.created_at.desc()).limit(100).all()
    return [NotificationOut.model_validate(n) for n in notifications]


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read_at.is_(None))
        .count()
    )
    return {"count": count}


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.read_at.is_(None),
    ).update({Notification.read_at: datetime.now(timezone.utc)})
    db.commit()
    return {"ok": True}
