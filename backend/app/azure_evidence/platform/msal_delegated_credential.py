"""TokenCredential backed by MSAL refresh token (delegated user) for ARM / Resource Graph."""
from __future__ import annotations

import time
from typing import Any

from azure.core.credentials import AccessToken, TokenCredential
from azure.core.exceptions import ClientAuthenticationError

from app.config import settings


def _msal_app_for_refresh(directory_tenant_id: str) -> Any:
    import msal

    tid = (directory_tenant_id or "").strip().lower()
    authority = f"https://login.microsoftonline.com/{tid}"
    return msal.ConfidentialClientApplication(
        (settings.AZURE_OAUTH_CLIENT_ID or "").strip(),
        authority=authority,
        client_credential=(settings.AZURE_OAUTH_CLIENT_SECRET or "").strip(),
    )


def _scopes_for_get_token(requested: tuple[str, ...]) -> list[str]:
    if not requested:
        return ["https://management.azure.com/user_impersonation"]
    out: list[str] = []
    for s in requested:
        if s.endswith("/.default"):
            out.append("https://management.azure.com/user_impersonation")
        else:
            out.append(s)
    # dedupe preserving order
    seen: set[str] = set()
    uniq: list[str] = []
    for x in out:
        if x not in seen:
            seen.add(x)
            uniq.append(x)
    return uniq


class MsalDelegatedCredential(TokenCredential):
    """Uses a stored OAuth2 refresh token with the platform Entra app (AZURE_OAUTH_*)."""

    def __init__(self, *, directory_tenant_id: str, refresh_token: str) -> None:
        self._tenant_id = (directory_tenant_id or "").strip().lower()
        self._refresh = (refresh_token or "").strip()
        self._app = _msal_app_for_refresh(self._tenant_id)

    def get_token(self, *scopes: str, **kwargs: Any) -> AccessToken:
        if not self._refresh:
            raise ClientAuthenticationError("Missing Azure OAuth refresh token.")
        use_scopes = _scopes_for_get_token(scopes)
        result = self._app.acquire_token_by_refresh_token(self._refresh, scopes=use_scopes)
        if not result or "access_token" not in result:
            msg = (result or {}).get("error_description") or (result or {}).get("error") or "refresh token failed"
            raise ClientAuthenticationError(msg)
        expires_on = result.get("expires_on")
        if expires_on is None:
            expires_on = int(time.time()) + int(result.get("expires_in", 3600))
        return AccessToken(result["access_token"], int(expires_on))
