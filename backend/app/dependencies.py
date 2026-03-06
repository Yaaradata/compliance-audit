from typing import Generator
from uuid import UUID

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import SessionLocal
from .middleware.auth import decode_access_token
from .models.tenant import User
from .models.assessment import AssessmentCycle, EvidenceSubmission
from .models.framework import AuditFramework
from .constants import PLATFORM_ADMIN_ROLES

security = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Schema names for framework versions: 2025 -> swift_2025, 2026 -> swift_2026.
# All cycle-scoped queries use one of these so domains, controls, evidence_submissions match the selected framework.
SCHEMA_2025 = "swift_2025"
SCHEMA_2026 = "swift_2026"


def _normalize_schema_name(raw: str | None) -> str:
    """Return swift_2025 or swift_2026. If framework is 2026 (version/v2026/schema swift_2026), return swift_2026."""
    if not raw:
        return SCHEMA_2025
    v = str(raw).strip().lower()
    if v in ("swift_2026", "2026", "v2026"):
        return SCHEMA_2026
    return SCHEMA_2025


def _resolve_schema_for_cycle(db: Session, cycle_id: UUID) -> str:
    """Return framework schema for cycle: swift_2025 (2025) or swift_2026 (2026). Drives search_path for all cycle-scoped data."""
    cycle = db.query(AssessmentCycle).filter(AssessmentCycle.id == cycle_id).first()
    if cycle and cycle.framework_id:
        framework = db.query(AuditFramework).filter(AuditFramework.id == cycle.framework_id).first()
        if framework:
            return _normalize_schema_name(getattr(framework, "schema_name", None))
    return SCHEMA_2025


def get_db_scoped(cycle_id: UUID, db: Session = Depends(get_db)) -> Generator[Session, None, None]:
    """
    Set search_path to core, <framework_schema>, public for this request so queries see the correct framework tables.
    Use in routes that have cycle_id in path. Resolves schema from cycle -> audit_frameworks.schema_name.
    """
    schema = _resolve_schema_for_cycle(db, cycle_id)
    db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    yield db


def get_db_ref(
    cycle_id: UUID | None = Query(None, description="Optional; when set, ref data from this cycle's schema (2025/2026)"),
    db: Session = Depends(get_db),
) -> Generator[Session, None, None]:
    """
    For reference routes: when cycle_id is provided (e.g. via Query), set search_path to that cycle's schema
    so framework-specific data (domains, controls, evidence items, matrix) matches the cycle's year (2025/2026).
    """
    if cycle_id is not None:
        schema = _resolve_schema_for_cycle(db, cycle_id)
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
    yield db


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


def get_db_for_submission(
    sub_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Generator[Session, None, None]:
    """
    Resolve which schema (swift_2025 or swift_2026) contains this evidence submission,
    set search_path to that schema, and yield the session. Use for file upload/list/delete
    so evidence_attachments and evidence_submissions are in the same schema (avoids FK violation).
    Raises 404 if submission not found, 403 if user has no access to that tenant.
    """
    for schema in (SCHEMA_2025, SCHEMA_2026):
        db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
        sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == sub_id).first()
        if sub is not None:
            if user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                raise HTTPException(status_code=403, detail="Access denied to this evidence submission")
            yield db
            return
    raise HTTPException(status_code=404, detail="Evidence submission not found")


def role_required(*roles: str):
    def checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Role '{user.role}' not authorized")
        return user
    return checker


def get_platform_admin(user: User = Depends(get_current_user)) -> User:
    """Require platform admin (no tenant). Use for tenant management, adding users, etc."""
    if user.tenant_id is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin access required")
    if user.role not in PLATFORM_ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin access required")
    return user
