"""Per-cycle Azure subscription and optional encrypted service principal secret."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models.cycle_user_azure_config import CycleUserAzureConfig
from app.services.tenant_aws_config import _decrypt, _encrypt

_GUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def validate_subscription_id(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        raise ValueError("Azure subscription ID is required.")
    if not _GUID_RE.match(s):
        raise ValueError("Azure subscription ID must be a GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).")
    return s.lower()


def validate_tenant_id(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        raise ValueError("Microsoft Entra tenant (directory) ID is required.")
    if not _GUID_RE.match(s):
        raise ValueError("Tenant ID must be a GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).")
    return s.lower()


def get_row(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> CycleUserAzureConfig | None:
    return (
        db.query(CycleUserAzureConfig)
        .filter(CycleUserAzureConfig.tenant_id == tenant_id)
        .filter(CycleUserAzureConfig.cycle_id == cycle_id)
        .filter(CycleUserAzureConfig.user_id == user_id)
        .first()
    )


def get_or_create_row(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> CycleUserAzureConfig:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if row:
        return row
    row = CycleUserAzureConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def save_azure_context(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID,
    user_id: UUID,
    azure_subscription_id: str,
    azure_tenant_id: str,
    *,
    azure_client_id: str | None = None,
    client_secret: str | None = None,
    set_client_id: bool = False,
    set_client_secret: bool = False,
) -> CycleUserAzureConfig:
    """Persist subscription and tenant. Update app registration fields only when set_client_id / set_client_secret are True."""
    sub = validate_subscription_id(azure_subscription_id)
    ten = validate_tenant_id(azure_tenant_id)
    row = get_or_create_row(db, tenant_id, cycle_id, user_id)
    row.azure_subscription_id = sub
    row.azure_tenant_id = ten
    row.connect_api_test_passed_at = None
    if set_client_id:
        row.azure_client_id = (azure_client_id or "").strip() or None
    if set_client_secret:
        if client_secret is not None and str(client_secret).strip():
            if not settings.TENANT_AWS_ENCRYPTION_KEY:
                raise ValueError("TENANT_AWS_ENCRYPTION_KEY must be set to store an Azure client secret.")
            row.encrypted_client_secret = _encrypt(str(client_secret).strip())
        else:
            row.encrypted_client_secret = None
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


def delete_cycle_user_azure_config(db: Session, tenant_id: UUID, cycle_id: UUID, user_id: UUID) -> bool:
    row = get_row(db, tenant_id, cycle_id, user_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def decrypt_stored_client_secret(row: CycleUserAzureConfig | None) -> str:
    if not row or not row.encrypted_client_secret:
        return ""
    return _decrypt(row.encrypted_client_secret)
