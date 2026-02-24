"""Tenant scoping helpers for database sessions."""

from sqlalchemy.orm import Session


def set_tenant_context(db: Session, tenant_id: str | None, is_admin: bool = False):
    """Set RLS variables on the DB session for row-level security policies."""
    if tenant_id:
        db.execute(f"SET LOCAL app.current_tenant_id = '{tenant_id}'")
    if is_admin:
        db.execute("SET LOCAL app.is_admin = 'true'")
