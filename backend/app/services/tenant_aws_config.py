"""Get/set per-tenant AWS credentials (encrypted at rest)."""
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models.tenant_aws_config import TenantAwsConfig

logger = logging.getLogger(__name__)


def _get_fernet():
    """Lazy Fernet instance; requires TENANT_AWS_ENCRYPTION_KEY (32-byte base64)."""
    key = (settings.TENANT_AWS_ENCRYPTION_KEY or "").strip()
    if not key:
        raise ValueError(
            "TENANT_AWS_ENCRYPTION_KEY is required to store tenant AWS credentials. "
            "Generate with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    try:
        from cryptography.fernet import Fernet

        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception as e:
        raise ValueError(f"Invalid TENANT_AWS_ENCRYPTION_KEY: {e}") from e


def _encrypt(plain: str) -> str:
    if not plain:
        return ""
    f = _get_fernet()
    return f.encrypt(plain.encode("utf-8")).decode("ascii")


def _decrypt(cipher: str | None) -> str:
    if not cipher:
        return ""
    try:
        f = _get_fernet()
        return f.decrypt(cipher.encode("ascii")).decode("utf-8")
    except Exception as e:
        logger.warning("Failed to decrypt tenant AWS secret: %s", e)
        return ""


def get_config(db: Session, tenant_id: UUID) -> TenantAwsConfig | None:
    return db.query(TenantAwsConfig).filter(TenantAwsConfig.tenant_id == tenant_id).first()


def get_config_public(db: Session, tenant_id: UUID) -> dict:
    """Return non-sensitive config for UI (no secrets). Never return decrypted secret."""
    row = get_config(db, tenant_id)
    if not row:
        return {
            "has_config": False,
            "aws_region": "us-east-1",
            "aws_account_id": None,
            "connection_type": "access_key",
            "connected_at": None,
        }
    access_key_ok = bool(row.encrypted_access_key_id and row.encrypted_secret_access_key)
    oauth2_ok = (
        (getattr(row, "connection_type", None) == "oauth2")
        and getattr(row, "encrypted_refresh_token", None)
    )
    return {
        "has_config": access_key_ok or bool(oauth2_ok),
        "aws_region": row.aws_region or "us-east-1",
        "aws_account_id": row.aws_account_id,
        "connection_type": getattr(row, "connection_type", None) or "access_key",
        "is_active": row.is_active,
        "connected_at": row.connected_at.isoformat() if getattr(row, "connected_at", None) else None,
    }


def get_credentials_for_collect(db: Session, tenant_id: UUID) -> dict | None:
    """
    Return decrypted credentials for running collectors.
    Supports access_key and oauth2 (SSO); returns dict with access_key_id, secret_access_key, region, account_id.
    """
    row = get_config(db, tenant_id)
    if not row or not row.is_active:
        return None
    ctype = getattr(row, "connection_type", None) or "access_key"
    if ctype == "oauth2":
        from app.services.aws_sso_oauth import get_credentials_via_sso
        return get_credentials_via_sso(db, tenant_id)
    if not row.encrypted_access_key_id or not row.encrypted_secret_access_key:
        return None
    access_key = _decrypt(row.encrypted_access_key_id)
    secret_key = _decrypt(row.encrypted_secret_access_key)
    if not access_key or not secret_key:
        return None
    return {
        "access_key_id": access_key,
        "secret_access_key": secret_key,
        "region": row.aws_region or "us-east-1",
        "account_id": (row.aws_account_id or "").strip() or None,
    }


def save_config(
    db: Session,
    tenant_id: UUID,
    *,
    access_key_id: str,
    secret_access_key: str,
    aws_region: str = "us-east-1",
    aws_account_id: str | None = None,
) -> None:
    """Encrypt and store config; create or update."""
    _get_fernet()  # validate key before saving
    row = get_config(db, tenant_id)
    if not row:
        row = TenantAwsConfig(tenant_id=tenant_id)
        db.add(row)
    row.aws_region = (aws_region or "us-east-1").strip() or "us-east-1"
    row.aws_account_id = (aws_account_id or "").strip() or None
    row.encrypted_access_key_id = _encrypt((access_key_id or "").strip())
    row.encrypted_secret_access_key = _encrypt((secret_access_key or "").strip())
    row.connection_type = getattr(row, "connection_type", None) or "access_key"
    row.is_active = True
    now = datetime.now(timezone.utc)
    row.updated_at = now
    if getattr(row, "connected_at", None) is None:
        row.connected_at = now
    db.commit()


def test_connection(db: Session, tenant_id: UUID) -> dict:
    """
    Test tenant AWS credentials by calling STS GetCallerIdentity.
    Returns {"ok": True, "account_id": "...", "user_id": "...", "arn": "..."} or raises ValueError.
    """
    creds = get_credentials_for_collect(db, tenant_id)
    if not creds:
        raise ValueError("No AWS credentials configured for this tenant.")
    try:
        import boto3

        kwargs = {
            "aws_access_key_id": creds["access_key_id"],
            "aws_secret_access_key": creds["secret_access_key"],
            "region_name": creds.get("region") or "us-east-1",
        }
        if creds.get("session_token"):
            kwargs["aws_session_token"] = creds["session_token"]
        session = boto3.Session(**kwargs)
        sts = session.client("sts")
        resp = sts.get_caller_identity()
        return {
            "ok": True,
            "account_id": resp.get("Account"),
            "user_id": resp.get("UserId"),
            "arn": resp.get("Arn"),
        }
    except Exception as e:
        raise ValueError(f"AWS connection failed: {e}") from e
