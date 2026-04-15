"""Microsoft Entra ID OAuth2 authorization code flow (delegated ARM / Resource Graph access)."""
from __future__ import annotations

import logging
import re
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

_GUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)

# Delegated permissions for ARM. MSAL adds OIDC reserved scopes internally.
AZURE_DELEGATED_SCOPES = [
    "https://management.azure.com/user_impersonation",
]


def azure_oauth_env_configured() -> bool:
    return bool(
        (getattr(settings, "AZURE_OAUTH_CLIENT_ID", None) or "").strip()
        and (getattr(settings, "AZURE_OAUTH_CLIENT_SECRET", None) or "").strip()
        and (getattr(settings, "AZURE_OAUTH_REDIRECT_URI", None) or "").strip()
    )


def oauth_authority_tenant_segment(*, saved_directory_tenant_id: str = "", settings_login_tenant: str = "") -> str:
    """
    MSAL login authority segment: a directory GUID, or 'organizations'.
    Prefer Connect-saved tenant (optional manual hint) or AZURE_OAUTH_LOGIN_TENANT for single-tenant *app registrations*;
    else organizations. Customer tenants are not required in server env — they are discovered after sign-in.
    """
    for cand in ((saved_directory_tenant_id or "").strip().lower(), (settings_login_tenant or "").strip().lower()):
        if cand and _GUID_RE.match(cand):
            return cand
    return "organizations"


def _build_msal_app(authority_tenant_segment: str) -> Any:
    import msal

    seg = (authority_tenant_segment or "organizations").strip().lower()
    if seg not in ("organizations", "common", "consumers") and not _GUID_RE.match(seg):
        raise ValueError(f"Invalid OAuth authority segment: {seg!r}. Use a tenant GUID, organizations, or common.")
    authority = f"https://login.microsoftonline.com/{seg}"
    cid = (settings.AZURE_OAUTH_CLIENT_ID or "").strip()
    secret = (settings.AZURE_OAUTH_CLIENT_SECRET or "").strip()
    return msal.ConfidentialClientApplication(
        cid,
        authority=authority,
        client_credential=secret,
    )


def build_authorization_url(*, state: str, authority_tenant_segment: str) -> str:
    redirect = (settings.AZURE_OAUTH_REDIRECT_URI or "").strip()
    if not redirect:
        raise ValueError("AZURE_OAUTH_REDIRECT_URI is not set.")
    app = _build_msal_app(authority_tenant_segment)
    return app.get_authorization_request_url(
        AZURE_DELEGATED_SCOPES,
        state=state,
        redirect_uri=redirect,
        prompt="consent",
    )


def exchange_code_for_token_result(*, code: str, authority_tenant_segment: str) -> dict[str, Any]:
    redirect = (settings.AZURE_OAUTH_REDIRECT_URI or "").strip()
    app = _build_msal_app(authority_tenant_segment)
    result = app.acquire_token_by_authorization_code(
        (code or "").strip(),
        scopes=AZURE_DELEGATED_SCOPES,
        redirect_uri=redirect,
    )
    if result is None or result.get("error"):
        msg = (result or {}).get("error_description") or (result or {}).get("error") or "token exchange failed"
        raise ValueError(msg)
    return result


def display_name_from_token_result(result: dict[str, Any]) -> str:
    claims = result.get("id_token_claims") or {}
    return (
        (claims.get("preferred_username") or claims.get("email") or claims.get("upn") or "") or ""
    ).strip()
