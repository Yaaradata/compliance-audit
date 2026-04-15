"""Resolve Azure credentials: OAuth refresh, per-cycle SP, env AZURE_*, then DefaultAzureCredential on Azure hosts."""
from __future__ import annotations

import os
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.services.azure_entra_oauth import azure_oauth_env_configured
from app.services.cycle_user_azure_config import decrypt_oauth_refresh_token, decrypt_stored_client_secret, get_row


def resolve_azure_credential(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
) -> tuple[Any, str, str]:
    """
    Returns (credential, subscription_id, directory_tenant_id).
    subscription_id comes from cycle config; directory tenant from cycle or env.
    """
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row:
        raise ValueError("Save Azure subscription and tenant ID on the Connect page first.")

    sub = (row.azure_subscription_id or "").strip()
    dir_tenant = (row.azure_tenant_id or "").strip()
    if not sub or not dir_tenant:
        raise ValueError("Azure subscription ID and tenant ID are required.")

    oauth_rt = decrypt_oauth_refresh_token(row)
    if oauth_rt:
        if not azure_oauth_env_configured():
            raise ValueError(
                "Microsoft sign-in tokens are saved for this cycle, but AZURE_OAUTH_CLIENT_ID, "
                "AZURE_OAUTH_CLIENT_SECRET, and AZURE_OAUTH_REDIRECT_URI are not set on the API server."
            )
        from app.azure_evidence.platform.msal_delegated_credential import MsalDelegatedCredential

        return MsalDelegatedCredential(directory_tenant_id=dir_tenant, refresh_token=oauth_rt), sub, dir_tenant

    secret = decrypt_stored_client_secret(row)
    client_id = (row.azure_client_id or "").strip()

    if client_id and secret:
        from azure.identity import ClientSecretCredential

        return ClientSecretCredential(tenant_id=dir_tenant, client_id=client_id, client_secret=secret), sub, dir_tenant

    env_tid = (getattr(settings, "AZURE_TENANT_ID", None) or "").strip()
    env_cid = (getattr(settings, "AZURE_CLIENT_ID", None) or "").strip()
    env_sec = (getattr(settings, "AZURE_CLIENT_SECRET", None) or "").strip()
    # Tenant for token requests: explicit env, else the directory ID saved in Connect (same tenant as the subscription).
    token_tenant = env_tid or dir_tenant
    if env_cid and env_sec and token_tenant:
        from azure.identity import ClientSecretCredential

        return ClientSecretCredential(tenant_id=token_tenant, client_id=env_cid, client_secret=env_sec), sub, token_tenant

    if env_cid or env_sec:
        raise ValueError(
            "Incomplete Azure credentials on the API server: set both AZURE_CLIENT_ID and AZURE_CLIENT_SECRET "
            "(e.g. in backend .env). AZURE_TENANT_ID is optional if it matches the Microsoft Entra tenant ID you enter in Connect."
        )

    in_azure_host = bool(
        os.environ.get("WEBSITE_INSTANCE_ID")
        or os.environ.get("IDENTITY_ENDPOINT")
        or os.environ.get("MSI_ENDPOINT")
        or os.environ.get("AZURE_CONTAINER_APP_RESOURCE_ID")
    )
    force_dac = bool(getattr(settings, "AZURE_FORCE_DEFAULT_CREDENTIAL", False))

    if not in_azure_host and not force_dac:
        if azure_oauth_env_configured():
            raise ValueError(
                "Microsoft OAuth is configured on the API, but this cycle has no active sign-in token (or it was cleared). "
                "On Azure → Connect: use Sign in with Microsoft (subscription and tenant are filled in after sign-in), "
                "or save subscription and tenant manually for other credential modes. "
                "Note: saving scope again clears Microsoft sign-in—you must sign in again after each save.\n\n"
                "Alternatively use AZURE_CLIENT_ID + AZURE_CLIENT_SECRET in backend/.env, or "
                "AZURE_FORCE_DEFAULT_CREDENTIAL=true if you use Azure CLI login in the same shell as uvicorn."
            )
        raise ValueError(
            "This API has no Azure credentials configured for local/non-Azure hosting. Do one of the following:\n"
            "• Entra OAuth (recommended for users): set AZURE_OAUTH_CLIENT_ID, AZURE_OAUTH_CLIENT_SECRET, "
            "AZURE_OAUTH_REDIRECT_URI, and TENANT_AWS_ENCRYPTION_KEY; then Azure → Connect → Sign in with Microsoft.\n"
            "• Service principal: set AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in backend/.env "
            "(AZURE_TENANT_ID optional if it matches the tenant ID on Connect).\n"
            "• Azure CLI: set AZURE_FORCE_DEFAULT_CREDENTIAL=true and run az login in the environment that runs uvicorn."
        )

    from azure.identity import DefaultAzureCredential

    cred = DefaultAzureCredential(
        exclude_interactive_browser_credential=True,
        additionally_allowed_tenants=["*"],
    )
    return cred, sub, dir_tenant
