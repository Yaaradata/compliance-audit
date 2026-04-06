"""Resolve GCP project id and optional user OAuth credentials for a cycle scope."""
from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.services.cycle_user_gcp_config import decrypt_refresh_token, gcp_oauth_env_configured, get_row
from app.services.gcp_google_oauth import GCP_OAUTH_SCOPES


def oauth_credentials_from_refresh(refresh_token_plain: str) -> Any:
    from google.oauth2.credentials import Credentials

    return Credentials(
        token=None,
        refresh_token=refresh_token_plain,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=(settings.GOOGLE_OAUTH_CLIENT_ID or "").strip(),
        client_secret=(settings.GOOGLE_OAUTH_CLIENT_SECRET or "").strip(),
        scopes=GCP_OAUTH_SCOPES,
    )


def resolve_project_id(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> str:
    row = get_row(db, tenant_id, cycle_id, user_id)
    row_pid = (row.gcp_project_id or "").strip() if row else ""

    if gcp_oauth_env_configured():
        if not row_pid:
            raise HTTPException(
                status_code=503,
                detail="Enter your Google Cloud project ID on GCP Connect, then complete Google sign-in.",
            )
        return row_pid

    if not row_pid:
        raise HTTPException(
            status_code=503,
            detail="Complete GCP Connect for this cycle: save project ID and team email, then run Test connection.",
        )
    return row_pid


def resolve_optional_user_credentials_or_adc(
    db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID
) -> tuple[Any | None, str | None]:
    """
    If Google OAuth is enabled and this cycle has a stored refresh token, return user credentials.
    Otherwise return (None, None) to use Application Default Credentials (e.g. IAM policy read before OAuth completes).
    """
    if not gcp_oauth_env_configured():
        return None, None
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row or not row.encrypted_refresh_token:
        return None, None
    rt = decrypt_refresh_token(row)
    if not rt:
        return None, None
    creds = oauth_credentials_from_refresh(rt)
    qpid = (row.gcp_project_id or "").strip() or None
    return creds, qpid


def resolve_optional_user_credentials(
    db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID
) -> tuple[Any | None, str | None]:
    """
    Returns (credentials, quota_project_id) for google.auth.default override, or (None, None) to use ADC.
    Raises HTTPException if OAuth mode is on but the user has not completed sign-in.
    """
    if not gcp_oauth_env_configured():
        return None, None
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row or not row.encrypted_refresh_token:
        raise HTTPException(
            status_code=403,
            detail="Google account not connected for this cycle. Open GCP Connect and sign in with Google.",
        )
    rt = decrypt_refresh_token(row)
    if not rt:
        raise HTTPException(status_code=403, detail="Stored Google credentials are invalid. Reconnect on GCP Connect.")
    creds = oauth_credentials_from_refresh(rt)
    qpid = (row.gcp_project_id or "").strip() or None
    return creds, qpid
