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
from .models.review import ReviewAssignment
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


def get_db_for_review(
    review_id: UUID,
    cycle_id: UUID | None = Query(None, description="Optional; when provided (e.g. from review queue context), use this cycle's schema so detail matches list."),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Generator[Session, None, None]:
    """
    Resolve which schema (swift_2025 or swift_2026) contains this review,
    set search_path to that schema, and yield the session. Use for /reviews/{review_id}
    and /reviews/{review_id}/detail. When cycle_id is provided, try that cycle's schema first
    so the same schema as the list endpoint is used.
    Raises 404 if review not found.
    """
    # If caller has cycle context, try that schema first (same as list_reviews)
    schemas_to_try: list[str] = []
    if cycle_id is not None:
        schema = _resolve_schema_for_cycle(db, cycle_id)
        schemas_to_try.append(schema)
    for s in (SCHEMA_2025, SCHEMA_2026):
        if s not in schemas_to_try:
            schemas_to_try.append(s)

    for schema in schemas_to_try:
        # Use literal schema name (we control the value) so search_path sees a proper identifier
        db.execute(text(f"SET search_path TO core, {schema!r}, public"))
        review = db.query(ReviewAssignment).filter(ReviewAssignment.id == review_id).first()
        if review is not None:
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == review.submission_id).first()
            if sub and user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                raise HTTPException(status_code=404, detail="Review not found")
            if cycle_id is not None and sub and str(sub.cycle_id) != str(cycle_id):
                # Caller asked for a specific cycle; this review belongs to another cycle
                raise HTTPException(status_code=404, detail="Review not found")
            yield db
            return
    raise HTTPException(status_code=404, detail="Review not found")


def get_db_for_notes(
    resource_type: str,
    resource_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Generator[Session, None, None]:
    """
    Resolve which schema contains the resource, set search_path, and yield the session.
    Use for notes list/create when resource is evidence_submission or review.
    Raises 404 if resource not found.
    """
    if resource_type == "evidence_submission":
        for schema in (SCHEMA_2025, SCHEMA_2026):
            db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == resource_id).first()
            if sub is not None:
                if user.role != "admin" and user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                    raise HTTPException(status_code=403, detail="Access denied")
                yield db
                return
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource_type == "review":
        for schema in (SCHEMA_2025, SCHEMA_2026):
            db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
            rev = db.query(ReviewAssignment).filter(ReviewAssignment.id == resource_id).first()
            if rev is not None:
                sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == rev.submission_id).first()
                if sub and user.role != "admin" and user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                    raise HTTPException(status_code=404, detail="Resource not found")
                yield db
                return
        raise HTTPException(status_code=404, detail="Resource not found")
    # approval_gate, gap: use default schema
    yield db


def resolve_schema_for_notes_resource(
    db: Session, resource_type: str, resource_id: UUID, user: User
) -> None:
    """
    Set search_path to the schema containing the resource. Call before _check_resource_access
    when resource_type is evidence_submission or review (e.g. in create_note).
    Raises 404 if resource not found, 403 if access denied.
    """
    if resource_type == "evidence_submission":
        for schema in (SCHEMA_2025, SCHEMA_2026):
            db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
            sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == resource_id).first()
            if sub is not None:
                if user.role != "admin" and user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                    raise HTTPException(status_code=403, detail="Access denied")
                return
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource_type == "review":
        for schema in (SCHEMA_2025, SCHEMA_2026):
            db.execute(text("SET search_path TO core, :s, public"), {"s": schema})
            rev = db.query(ReviewAssignment).filter(ReviewAssignment.id == resource_id).first()
            if rev is not None:
                sub = db.query(EvidenceSubmission).filter(EvidenceSubmission.id == rev.submission_id).first()
                if sub and user.role != "admin" and user.tenant_id is not None and sub.tenant_id != user.tenant_id:
                    raise HTTPException(status_code=404, detail="Resource not found")
                return
        raise HTTPException(status_code=404, detail="Resource not found")


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
