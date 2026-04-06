"""Google OAuth2 authorization code flow for GCP API access."""
from __future__ import annotations

import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

GCP_OAUTH_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/cloud-platform",
]


def _client_config() -> dict[str, Any]:
    return {
        "web": {
            "client_id": (settings.GOOGLE_OAUTH_CLIENT_ID or "").strip(),
            "client_secret": (settings.GOOGLE_OAUTH_CLIENT_SECRET or "").strip(),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [(settings.GOOGLE_OAUTH_REDIRECT_URI or "").strip()],
        }
    }


def build_flow():
    from google_auth_oauthlib.flow import Flow

    redirect = (settings.GOOGLE_OAUTH_REDIRECT_URI or "").strip()
    if not redirect:
        raise ValueError("GOOGLE_OAUTH_REDIRECT_URI is not set.")
    return Flow.from_client_config(
        _client_config(),
        scopes=GCP_OAUTH_SCOPES,
        redirect_uri=redirect,
    )


def authorization_url(state: str) -> str:
    flow = build_flow()
    url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return url


def exchange_code_for_credentials(code: str) -> Any:
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_config(
        _client_config(),
        scopes=GCP_OAUTH_SCOPES,
        redirect_uri=(settings.GOOGLE_OAUTH_REDIRECT_URI or "").strip(),
    )
    flow.fetch_token(code=(code or "").strip())
    return flow.credentials


def email_from_credentials(creds: Any) -> str:
    token = getattr(creds, "id_token", None)
    if token:
        try:
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token

            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                (settings.GOOGLE_OAUTH_CLIENT_ID or "").strip(),
            )
            em = (info.get("email") or "").strip().lower()
            if em:
                return em
        except Exception as e:
            logger.warning("Could not verify id_token for email: %s", e)
    access = getattr(creds, "token", None)
    if access:
        try:
            import httpx

            r = httpx.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access}"},
                timeout=15.0,
            )
            if r.status_code == 200:
                return (r.json().get("email") or "").strip().lower()
        except Exception as e:
            logger.warning("userinfo fallback failed: %s", e)
    return ""
