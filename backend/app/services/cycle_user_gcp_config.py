"""Per-cycle GCP project + Google OAuth tokens (encrypted)."""
from __future__ import annotations

import re
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models.cycle_user_gcp_config import CycleUserGcpConfig
from app.services.tenant_aws_config import _decrypt, _encrypt

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def validate_gcp_project_id(raw: str) -> str:
    s = (raw or "").strip().lower()
    if not s:
        raise ValueError("GCP project ID is required.")
    if len(s) < 6 or len(s) > 30:
        raise ValueError("GCP project ID must be between 6 and 30 characters.")
    if not ("a" <= s[0] <= "z"):
        raise ValueError("GCP project ID must start with a lowercase letter.")
    if s[-1] == "-":
        raise ValueError("GCP project ID must not end with a hyphen.")
    if "--" in s:
        raise ValueError("GCP project ID must not contain consecutive hyphens.")
    for ch in s:
        if ch not in "abcdefghijklmnopqrstuvwxyz0123456789-":
            raise ValueError("GCP project ID may only contain lowercase letters, digits, and hyphens.")
    return s


def validate_access_verification_email(raw: str) -> str:
    s = (raw or "").strip().lower()
    if not s:
        raise ValueError("Team member email is required to verify access to the project.")
    if not _EMAIL_RE.match(s):
        raise ValueError("Enter a valid email address for the team member.")
    return s


def get_row(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> CycleUserGcpConfig | None:
    return (
        db.query(CycleUserGcpConfig)
        .filter(CycleUserGcpConfig.tenant_id == tenant_id)
        .filter(CycleUserGcpConfig.cycle_id == cycle_id)
        .filter(CycleUserGcpConfig.user_id == user_id)
        .first()
    )


def get_or_create_row(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> CycleUserGcpConfig:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if row:
        return row
    row = CycleUserGcpConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def save_gcp_project_id(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID, gcp_project_id: str) -> CycleUserGcpConfig:
    pid = validate_gcp_project_id(gcp_project_id)
    row = get_or_create_row(db, tenant_id, cycle_id, user_id)
    row.gcp_project_id = pid
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def save_gcp_context_with_access_email(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    gcp_project_id: str,
    access_verification_email: str,
) -> CycleUserGcpConfig:
    pid = validate_gcp_project_id(gcp_project_id)
    em = validate_access_verification_email(access_verification_email)
    row = get_or_create_row(db, tenant_id, cycle_id, user_id)
    row.gcp_project_id = pid
    row.access_verification_email = em
    row.iam_access_verified = None
    row.iam_access_checked_at = None
    row.iam_access_detail = None
    row.connect_api_test_passed_at = None
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def mark_connect_api_test_passed(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> None:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row:
        return
    row.connect_api_test_passed_at = datetime.now(timezone.utc)
    row.updated_at = datetime.now(timezone.utc)
    db.commit()


def delete_cycle_user_gcp_config(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> bool:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def store_iam_access_check_result(
    db: Session,
    row: CycleUserGcpConfig,
    *,
    verified: bool,
    detail: str | None,
) -> None:
    row.iam_access_verified = verified
    row.iam_access_detail = (detail or "")[:8000] or None
    row.iam_access_checked_at = datetime.now(timezone.utc)
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)


def begin_oauth_state(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> tuple[CycleUserGcpConfig, str]:
    row = get_or_create_row(db, tenant_id, cycle_id, user_id)
    if not (row.gcp_project_id or "").strip():
        raise ValueError("Save the GCP project ID and team email on the Connect page before signing in with Google.")
    state = secrets.token_urlsafe(48)
    row.oauth_state = state
    row.oauth_state_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row, state


def get_row_by_oauth_state(db: Session, state: str) -> CycleUserGcpConfig | None:
    st = (state or "").strip()
    if not st:
        return None
    row = db.query(CycleUserGcpConfig).filter(CycleUserGcpConfig.oauth_state == st).first()
    if not row:
        return None
    exp = row.oauth_state_expires_at
    if exp and exp < datetime.now(timezone.utc):
        return None
    return row


def complete_oauth(
    db: Session,
    row: CycleUserGcpConfig,
    *,
    refresh_token: str,
    google_user_email: str,
) -> CycleUserGcpConfig:
    row.encrypted_refresh_token = _encrypt((refresh_token or "").strip())
    row.google_user_email = (google_user_email or "").strip().lower() or None
    row.oauth_state = None
    row.oauth_state_expires_at = None
    row.connected_at = datetime.now(timezone.utc)
    row.connect_api_test_passed_at = None
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def clear_oauth_connection(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> None:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row:
        return
    row.encrypted_refresh_token = None
    row.google_user_email = None
    row.connected_at = None
    row.connect_api_test_passed_at = None
    row.oauth_state = None
    row.oauth_state_expires_at = None
    row.updated_at = datetime.now(timezone.utc)
    db.commit()


def decrypt_refresh_token(row: CycleUserGcpConfig) -> str:
    return _decrypt(row.encrypted_refresh_token)


def gcp_oauth_env_configured() -> bool:
    return bool(
        (settings.GOOGLE_OAUTH_CLIENT_ID or "").strip()
        and (settings.GOOGLE_OAUTH_CLIENT_SECRET or "").strip()
        and (settings.GOOGLE_OAUTH_REDIRECT_URI or "").strip()
    )
