"""Get/set per-tenant AWS credentials (encrypted at rest)."""
import logging
import secrets
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.models.cycle_user_aws_config import CycleUserAwsConfig
from app.models.tenant_aws_config import TenantAwsConfig

logger = logging.getLogger(__name__)


# ─── AssumeRole (IAM Role ARN + External ID) ─────────────────────────────────

def get_platform_external_id() -> str:
    """Fixed External ID for AssumeRole. Set AWS_ASSUME_ROLE_EXTERNAL_ID in env or use default Swift-Audit."""
    return (getattr(settings, "AWS_ASSUME_ROLE_EXTERNAL_ID", None) or "Swift-Audit").strip() or "Swift-Audit"


def validate_aws_connection(role_arn: str, external_id: str) -> tuple[bool, str | None]:
    """
    Validate by calling STS AssumeRole. Uses app-level AWS credentials from env.
    Returns (True, None) on success, (False, error_message) on failure.
    """
    import boto3
    app_creds = _get_app_aws_credentials()
    if not app_creds:
        return False, "Backend AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not set."
    try:
        sts = boto3.client(
            "sts",
            aws_access_key_id=app_creds["access_key_id"],
            aws_secret_access_key=app_creds["secret_access_key"],
            region_name=app_creds.get("region") or "us-east-1",
        )
        sts.assume_role(
            RoleArn=role_arn.strip(),
            RoleSessionName="validate-session",
            ExternalId=external_id.strip(),
        )
        return True, None
    except Exception as e:
        return False, str(e)


def get_aws_session(role_arn: str, external_id: str, region: str = "us-east-1"):
    """
    Assume the customer role and return a boto3 Session with temporary credentials.
    Uses app-level AWS credentials to call AssumeRole.
    """
    import boto3
    app_creds = _get_app_aws_credentials()
    if not app_creds:
        raise ValueError("Backend AWS credentials are not set.")
    sts = boto3.client(
        "sts",
        aws_access_key_id=app_creds["access_key_id"],
        aws_secret_access_key=app_creds["secret_access_key"],
        region_name=app_creds.get("region") or "us-east-1",
    )
    response = sts.assume_role(
        RoleArn=role_arn.strip(),
        RoleSessionName="audit-session",
        ExternalId=external_id.strip(),
    )
    creds = response["Credentials"]
    return boto3.Session(
        aws_access_key_id=creds["AccessKeyId"],
        aws_secret_access_key=creds["SecretAccessKey"],
        aws_session_token=creds["SessionToken"],
        region_name=region,
    )


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


def _account_id_from_role_arn(role_arn: str) -> str | None:
    """Extract account ID from arn:aws:iam::123456789012:role/RoleName."""
    parts = (role_arn or "").split(":")
    if len(parts) >= 5:
        return parts[4]
    return None


def get_config(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> CycleUserAwsConfig | TenantAwsConfig | None:
    if cycle_id is None or user_id is None:
        return db.query(TenantAwsConfig).filter(TenantAwsConfig.tenant_id == tenant_id).first()
    return (
        db.query(CycleUserAwsConfig)
        .filter(CycleUserAwsConfig.tenant_id == tenant_id)
        .filter(CycleUserAwsConfig.cycle_id == cycle_id)
        .filter(CycleUserAwsConfig.user_id == user_id)
        .first()
    )


def get_config_public(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> dict:
    """Return non-sensitive config for UI (no secrets). Never return decrypted secret."""
    row = get_config(db, tenant_id, cycle_id, user_id)
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
    context_ok = (getattr(row, "connection_type", None) == "context") and bool((row.aws_account_id or "").strip())
    assume_role_ok = (getattr(row, "connection_type", None) == "assume_role") and bool((getattr(row, "role_arn", None) or "").strip())
    return {
        "has_config": access_key_ok or bool(oauth2_ok) or context_ok or assume_role_ok,
        "aws_region": row.aws_region or "us-east-1",
        "aws_account_id": row.aws_account_id,
        "connection_type": getattr(row, "connection_type", None) or "access_key",
        "is_active": row.is_active,
        "connected_at": row.connected_at.isoformat() if getattr(row, "connected_at", None) else None,
        "role_arn": getattr(row, "role_arn", None) if assume_role_ok else None,
    }


def _get_app_aws_credentials() -> dict | None:
    """
    Return app-level AWS credentials from environment (used when tenant has context-only: Account ID + Region).
    Env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY; optional AWS_DEFAULT_REGION.
    """
    import os
    access_key = (os.getenv("AWS_ACCESS_KEY_ID") or "").strip()
    secret_key = (os.getenv("AWS_SECRET_ACCESS_KEY") or "").strip()
    if not access_key or not secret_key:
        return None
    return {
        "access_key_id": access_key,
        "secret_access_key": secret_key,
        "region": (os.getenv("AWS_DEFAULT_REGION") or "us-east-1").strip() or "us-east-1",
    }


def get_credentials_for_collect(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> dict | None:
    """
    Return credentials for running collectors.
    - oauth2: SSO refresh token -> temporary credentials.
    - access_key: decrypted tenant access key + secret.
    - context: tenant has only Account ID + Region; use app-level AWS credentials from env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) with tenant's account_id and region so collection runs against that account.
    Returns dict with access_key_id, secret_access_key, region, account_id (and optional session_token for SSO).
    """
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row or not row.is_active:
        return None
    ctype = getattr(row, "connection_type", None) or "access_key"
    if ctype == "oauth2":
        from app.services.aws_sso_oauth import get_credentials_via_sso
        return get_credentials_via_sso(db, tenant_id, cycle_id, user_id)
    if ctype == "assume_role":
        role_arn = (getattr(row, "role_arn", None) or "").strip()
        external_id = (getattr(row, "external_id", None) or "").strip()
        if not role_arn or not external_id:
            return None
        region = (row.aws_region or "us-east-1").strip() or "us-east-1"
        try:
            session = get_aws_session(role_arn, external_id, region)
            creds = session.get_credentials()
            if not creds or not getattr(creds, "access_key", None):
                return None
            frozen = creds.get_frozen_credentials()
            account_id = _account_id_from_role_arn(role_arn)
            return {
                "access_key_id": frozen.access_key,
                "secret_access_key": frozen.secret_key,
                "session_token": frozen.token,
                "region": region,
                "account_id": account_id,
            }
        except Exception as e:
            logger.warning("AssumeRole failed for tenant %s: %s", tenant_id, e)
            return None
    if ctype == "context":
        app_creds = _get_app_aws_credentials()
        if not app_creds:
            logger.warning("Tenant %s has context-only config but app AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not set.", tenant_id)
            return None
        account_id = (row.aws_account_id or "").strip() or None
        region = (row.aws_region or "us-east-1").strip() or "us-east-1"
        if not account_id:
            return None
        return {
            "access_key_id": app_creds["access_key_id"],
            "secret_access_key": app_creds["secret_access_key"],
            "region": region,
            "account_id": account_id,
        }
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
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    *,
    access_key_id: str,
    secret_access_key: str,
    aws_region: str = "us-east-1",
    aws_account_id: str | None = None,
) -> None:
    """Encrypt and store config; create or update."""
    _get_fernet()  # validate key before saving
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row:
        if cycle_id is None or user_id is None:
            row = TenantAwsConfig(tenant_id=tenant_id)
        else:
            row = CycleUserAwsConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
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


def get_connect_setup(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> dict:
    """
    Return external_id (get or create), trust policy template, and optionally platform_account_id for the Connect UI.
    User puts external_id in the trust policy and creates the IAM role in their account.
    """
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row:
        if cycle_id is None or user_id is None:
            row = TenantAwsConfig(tenant_id=tenant_id)
        else:
            row = CycleUserAwsConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
        db.add(row)
        db.flush()
    external_id = (getattr(row, "external_id", None) or "").strip()
    if not external_id:
        external_id = secrets.token_urlsafe(24)
        row.external_id = external_id
        row.updated_at = datetime.now(timezone.utc)
        db.commit()
    platform_account_id = None
    app_creds = _get_app_aws_credentials()
    if app_creds:
        try:
            import boto3
            sts = boto3.client(
                "sts",
                aws_access_key_id=app_creds["access_key_id"],
                aws_secret_access_key=app_creds["secret_access_key"],
                region_name=app_creds.get("region") or "us-east-1",
            )
            identity = sts.get_caller_identity()
            platform_account_id = identity.get("Account")
        except Exception:
            pass
    return {
        "external_id": external_id,
        "platform_account_id": platform_account_id,
        "trust_policy_template": (
            '{\n'
            '  "Version": "2012-10-17",\n'
            '  "Statement": [\n'
            '    {\n'
            '      "Effect": "Allow",\n'
            '      "Principal": {"AWS": "arn:aws:iam::<PLATFORM_ACCOUNT_ID>:root"},\n'
            '      "Action": "sts:AssumeRole",\n'
            '      "Condition": {"StringEquals": {"sts:ExternalId": "<EXTERNAL_ID>"}}\n'
            '    }\n'
            '  ]\n'
            '}'
        ),
    }


def save_connection_assume_role(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    *,
    role_arn: str,
    region: str = "us-east-1",
    external_id: str | None = None,
) -> None:
    """Validate AssumeRole (using platform External ID if not provided), then save role_arn, external_id, region. Sets connection_type to assume_role."""
    role_arn = (role_arn or "").strip()
    if not role_arn:
        raise ValueError("role_arn is required.")
    external_id = (external_id or "").strip() or get_platform_external_id()
    ok, err = validate_aws_connection(role_arn, external_id)
    if not ok:
        raise ValueError(err or "AssumeRole validation failed.")
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row:
        if cycle_id is None or user_id is None:
            row = TenantAwsConfig(tenant_id=tenant_id)
        else:
            row = CycleUserAwsConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
        db.add(row)
    row.role_arn = role_arn
    row.external_id = external_id
    row.aws_region = (region or "us-east-1").strip() or "us-east-1"
    row.connection_type = "assume_role"
    row.is_active = True
    row.aws_account_id = _account_id_from_role_arn(role_arn)
    row.encrypted_access_key_id = None
    row.encrypted_secret_access_key = None
    row.sso_start_url = None
    row.sso_region = None
    row.encrypted_refresh_token = None
    row.sso_account_id = None
    row.sso_role_name = None
    now = datetime.now(timezone.utc)
    row.updated_at = now
    if getattr(row, "connected_at", None) is None:
        row.connected_at = now
    db.commit()


def delete_connection(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> None:
    """Remove AWS connection config for this tenant+cycle+user scope."""
    row = get_config(db, tenant_id, cycle_id, user_id)
    if row:
        db.delete(row)
        db.commit()


def save_context(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
    *,
    aws_account_id: str,
    aws_region: str = "us-east-1",
) -> None:
    """Save only AWS account ID and region (no credentials). Used for context-only entry to the system."""
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row:
        if cycle_id is None or user_id is None:
            row = TenantAwsConfig(tenant_id=tenant_id)
        else:
            row = CycleUserAwsConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
        db.add(row)
    row.aws_account_id = (aws_account_id or "").strip() or None
    row.aws_region = (aws_region or "us-east-1").strip() or "us-east-1"
    row.connection_type = "context"
    row.is_active = True
    row.encrypted_access_key_id = None
    row.encrypted_secret_access_key = None
    row.sso_start_url = None
    row.sso_region = None
    row.encrypted_refresh_token = None
    row.sso_account_id = None
    row.sso_role_name = None
    now = datetime.now(timezone.utc)
    row.updated_at = now
    if getattr(row, "connected_at", None) is None:
        row.connected_at = now
    db.commit()


def test_connection(
    db: Session,
    tenant_id: UUID,
    cycle_id: UUID | None = None,
    user_id: UUID | None = None,
) -> dict:
    """
    Test tenant AWS credentials by calling STS GetCallerIdentity.
    Returns {"ok": True, "account_id": "...", "user_id": "...", "arn": "..."} or raises ValueError.
    """
    creds = get_credentials_for_collect(db, tenant_id, cycle_id, user_id)
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
