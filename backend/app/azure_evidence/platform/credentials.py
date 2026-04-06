"""Resolve Azure credentials: per-cycle SP, then env AZURE_* , then DefaultAzureCredential."""
from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.services.cycle_user_azure_config import decrypt_stored_client_secret, get_row


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

    secret = decrypt_stored_client_secret(row)
    client_id = (row.azure_client_id or "").strip()

    if client_id and secret:
        from azure.identity import ClientSecretCredential

        return ClientSecretCredential(tenant_id=dir_tenant, client_id=client_id, client_secret=secret), sub, dir_tenant

    env_tid = (getattr(settings, "AZURE_TENANT_ID", None) or "").strip()
    env_cid = (getattr(settings, "AZURE_CLIENT_ID", None) or "").strip()
    env_sec = (getattr(settings, "AZURE_CLIENT_SECRET", None) or "").strip()
    if env_tid and env_cid and env_sec:
        from azure.identity import ClientSecretCredential

        return ClientSecretCredential(tenant_id=env_tid, client_id=env_cid, client_secret=env_sec), sub, env_tid or dir_tenant

    from azure.identity import DefaultAzureCredential

    cred = DefaultAzureCredential(
        exclude_interactive_browser_credential=True,
        additionally_allowed_tenants=["*"],
    )
    return cred, sub, dir_tenant
