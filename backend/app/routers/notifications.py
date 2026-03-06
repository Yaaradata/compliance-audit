from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user, SCHEMA_2025, SCHEMA_2026
from ..models.tenant import User
from ..models.notes import Notification
from ..schemas.notes import NotificationOut

router = APIRouter(prefix="/notifications")


def _notifications_from_both_schemas(db: Session, user_id: UUID, unread_only: bool):
    """Query notifications for user from swift_2025 and swift_2026, merge and sort by created_at desc."""
    all_rows = []
    for schema in (SCHEMA_2025, SCHEMA_2026):
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        q = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            q = q.filter(Notification.read_at.is_(None))
        all_rows.extend(q.all())
    all_rows.sort(key=lambda n: n.created_at, reverse=True)
    return all_rows[:100]


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
    """List notifications from both swift_2025 and swift_2026 (notes/returns can create in either schema)."""
    notifications = _notifications_from_both_schemas(db, user.id, unread_only)
    return [NotificationOut.model_validate(n) for n in notifications]


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Count unread notifications in both schemas."""
    total = 0
    for schema in (SCHEMA_2025, SCHEMA_2026):
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        total += (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.read_at.is_(None))
            .count()
        )
    return {"count": total}


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark one notification as read; look in both schemas."""
    now = datetime.now(timezone.utc)
    for schema in (SCHEMA_2025, SCHEMA_2026):
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        n = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        ).first()
        if n:
            n.read_at = now
            db.commit()
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Notification not found")


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark all unread notifications as read in both schemas."""
    now = datetime.now(timezone.utc)
    for schema in (SCHEMA_2025, SCHEMA_2026):
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.read_at.is_(None),
        ).update({Notification.read_at: now})
    db.commit()
    return {"ok": True}
