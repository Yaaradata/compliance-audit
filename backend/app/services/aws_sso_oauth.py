"""
AWS IAM Identity Center (SSO) OAuth2 device authorization flow.
Uses sso-oidc (RegisterClient, StartDeviceAuthorization, CreateToken) and
sso Portal API (ListAccounts, ListAccountRoles, GetRoleCredentials) to obtain
temporary AWS credentials without storing long-lived access keys.
"""
import logging
import time
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.cycle_user_aws_config import CycleUserAwsConfig
from app.services.tenant_aws_config import get_config, _encrypt, _decrypt

logger = logging.getLogger(__name__)


def get_credentials_via_sso(
    db: Session,
    tenant_id: uuid.UUID,
    cycle_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict | None:
    """
    Resolve temporary AWS credentials via SSO refresh token (ListAccountRoles + GetRoleCredentials).
    Returns dict with access_key_id, secret_access_key, region, account_id for use by collectors.
    """
    import boto3
    from botocore.exceptions import ClientError

    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row or getattr(row, "connection_type", None) != "oauth2":
        return None
    refresh_token_enc = getattr(row, "encrypted_refresh_token", None)
    if not refresh_token_enc:
        return None
    refresh_token = _decrypt(refresh_token_enc)
    if not refresh_token:
        return None
    start_url = getattr(row, "sso_start_url", None) or ""
    sso_region = (getattr(row, "sso_region", None) or "us-east-1").strip() or "us-east-1"
    account_id = getattr(row, "sso_account_id", None) or row.aws_account_id
    role_name = getattr(row, "sso_role_name", None)
    if not account_id or not role_name:
        return None

    issuer_url = start_url.rstrip("/").replace("/start", "") if start_url and "/start" in start_url else (start_url.rstrip("/") if start_url else "")
    if not issuer_url:
        return None

    sso_oidc = boto3.client("sso-oidc", region_name=sso_region)
    try:
        reg = sso_oidc.register_client(
            clientName="compliance-audit-aws-evidence",
            clientType="public",
            grantTypes=["refresh_token"],
            issuerUrl=issuer_url,
        )
    except ClientError as e:
        logger.warning("SSO RegisterClient failed for tenant %s: %s", tenant_id, e)
        return None

    client_id = reg.get("clientId")
    client_secret = reg.get("clientSecret")
    if not client_id or not client_secret:
        return None

    try:
        token_resp = sso_oidc.create_token(
            clientId=client_id,
            clientSecret=client_secret,
            grantType="refresh_token",
            refreshToken=refresh_token,
        )
    except ClientError as e:
        logger.warning("SSO CreateToken (refresh) failed for tenant %s: %s", tenant_id, e)
        return None

    access_token = token_resp.get("accessToken")
    if not access_token:
        return None

    sso = boto3.client("sso", region_name=sso_region)
    try:
        creds_resp = sso.get_role_credentials(
            accessToken=access_token,
            accountId=account_id,
            roleName=role_name,
        )
    except ClientError as e:
        logger.warning("SSO GetRoleCredentials failed for tenant %s: %s", tenant_id, e)
        return None

    role_creds = creds_resp.get("roleCredentials", {})
    access_key = role_creds.get("accessKeyId")
    secret_key = role_creds.get("secretAccessKey")
    session_token = role_creds.get("sessionToken")
    if not access_key or not secret_key:
        return None

    # Collectors expect access_key_id, secret_access_key, region, account_id.
    # Session token is required for temporary creds; we pass it if the collector uses it.
    return {
        "access_key_id": access_key,
        "secret_access_key": secret_key,
        "session_token": session_token,
        "region": sso_region,
        "account_id": account_id,
    }


# In-memory cache for device flow: device_code -> scope + OIDC client/session metadata.
# Entries expire after 10 minutes; cleaned on access. last_poll_at used to respect recommended poll interval.
_DEVICE_CACHE: dict[str, dict] = {}
_CACHE_TTL_SEC = 600


def _cache_clean():
    """Remove expired entries (call occasionally)."""
    now = time.time()
    expired = [k for k, v in _DEVICE_CACHE.items() if (v.get("expires_at") or 0) < now]
    for k in expired:
        _DEVICE_CACHE.pop(k, None)


def start_device_authorization(
    tenant_id: uuid.UUID,
    cycle_id: uuid.UUID,
    user_id: uuid.UUID,
    sso_start_url: str,
    sso_region: str = "us-east-1",
) -> dict:
    """
    Start AWS SSO device authorization. Returns verification_uri_complete, user_code, device_code, interval, expires_in.
    Caller must store device_code to poll for token.
    """
    import boto3
    from botocore.exceptions import ClientError

    start_url = (sso_start_url or "").strip()
    if not start_url:
        raise ValueError("sso_start_url is required")
    region = (sso_region or "us-east-1").strip() or "us-east-1"

    # Issuer URL: IAM Identity Center uses the start URL base; some docs use start_url as issuer
    issuer_url = start_url.rstrip("/").replace("/start", "") if "/start" in start_url else start_url.rstrip("/")

    sso_oidc = boto3.client("sso-oidc", region_name=region)
    try:
        reg = sso_oidc.register_client(
            clientName="compliance-audit-aws-evidence",
            clientType="public",
            grantTypes=["urn:ietf:params:oauth:grant-type:device_code", "refresh_token"],
            issuerUrl=issuer_url,
        )
    except ClientError as e:
        logger.exception("RegisterClient failed: %s", e)
        raise ValueError(f"AWS SSO registration failed: {e}") from e

    client_id = reg.get("clientId")
    client_secret = reg.get("clientSecret")
    if not client_id or not client_secret:
        raise ValueError("RegisterClient did not return clientId/clientSecret")

    try:
        auth = sso_oidc.start_device_authorization(
            clientId=client_id,
            clientSecret=client_secret,
            startUrl=start_url,
        )
    except ClientError as e:
        logger.exception("StartDeviceAuthorization failed: %s", e)
        raise ValueError(f"AWS SSO device auth start failed: {e}") from e

    device_code = auth.get("deviceCode")
    if not device_code:
        raise ValueError("StartDeviceAuthorization did not return deviceCode")

    _cache_clean()
    expires_in = int(auth.get("expiresIn", 600))
    _DEVICE_CACHE[device_code] = {
        "tenant_id": str(tenant_id),
        "cycle_id": str(cycle_id),
        "user_id": str(user_id),
        "client_id": client_id,
        "client_secret": client_secret,
        "start_url": start_url,
        "sso_region": region,
        "expires_at": time.time() + min(expires_in, _CACHE_TTL_SEC),
        "interval": max(int(auth.get("interval", 5)), 2),
        "last_poll_at": 0,
    }

    return {
        "verification_uri": auth.get("verificationUri"),
        "verification_uri_complete": auth.get("verificationUriComplete"),
        "user_code": auth.get("userCode"),
        "device_code": device_code,
        "expires_in": expires_in,
        "interval": int(auth.get("interval", 5)),
    }


def poll_device_token(device_code: str, db: Session) -> dict:
    """
    Exchange device_code for tokens (poll once). Raises ValueError if pending/expired.
    On success: saves encrypted refresh_token only (no long-lived access keys); fetches temp creds on demand.
    Returns { "ok": True, "account_id", "account_name", "role_name" }.
    """
    import boto3
    from botocore.exceptions import ClientError

    _cache_clean()
    entry = _DEVICE_CACHE.get(device_code)
    if not entry:
        raise ValueError("Device code expired or invalid. Please start sign-in again.")
    if (entry.get("expires_at") or 0) < time.time():
        _DEVICE_CACHE.pop(device_code, None)
        raise ValueError("Device code expired. Please start sign-in again.")

    # Respect recommended poll interval to avoid SlowDownException
    interval = max(int(entry.get("interval", 5)), 2)
    last_poll = entry.get("last_poll_at") or 0
    if time.time() - last_poll < interval:
        raise ValueError("Waiting for you to authorize in the browser. Please open the link and enter the code.") from None
    entry["last_poll_at"] = time.time()

    tenant_id = uuid.UUID(entry["tenant_id"])
    cycle_id = uuid.UUID(entry["cycle_id"])
    user_id = uuid.UUID(entry["user_id"])
    client_id = entry["client_id"]
    client_secret = entry["client_secret"]
    start_url = entry["start_url"]
    sso_region = entry["sso_region"]

    sso_oidc = boto3.client("sso-oidc", region_name=sso_region)
    try:
        token_resp = sso_oidc.create_token(
            clientId=client_id,
            clientSecret=client_secret,
            grantType="urn:ietf:params:oauth:grant-type:device_code",
            deviceCode=device_code,
        )
    except ClientError as e:
        err = e.response.get("Error", {}).get("Code", "")
        if err == "AuthorizationPendingException":
            raise ValueError("Waiting for you to authorize in the browser. Please open the link and enter the code.") from e
        if err == "SlowDownException":
            raise ValueError("Polling too fast. Wait a moment and try again.") from e
        if err == "ExpiredTokenException":
            _DEVICE_CACHE.pop(device_code, None)
            raise ValueError("Authorization expired. Please start sign-in again.") from e
        if err == "AccessDeniedException":
            _DEVICE_CACHE.pop(device_code, None)
            raise ValueError("Access was denied. Please try again.") from e
        logger.exception("CreateToken failed: %s", e)
        raise ValueError(f"Token exchange failed: {e}") from e

    access_token = token_resp.get("accessToken")
    refresh_token = token_resp.get("refreshToken")
    if not refresh_token:
        raise ValueError("No refresh token returned by AWS SSO.")

    # Get first account and role using Portal API
    sso = boto3.client("sso", region_name=sso_region)
    try:
        accounts = sso.list_accounts(accessToken=access_token)
    except ClientError as e:
        logger.exception("ListAccounts failed: %s", e)
        raise ValueError(f"Failed to list AWS accounts: {e}") from e

    account_list = accounts.get("accountList", [])
    if not account_list:
        _DEVICE_CACHE.pop(device_code, None)
        raise ValueError("No AWS accounts found for this SSO user.")

    account_id = account_list[0].get("accountId")
    account_name = account_list[0].get("accountName", "")
    try:
        roles = sso.list_account_roles(accessToken=access_token, accountId=account_id)
    except ClientError as e:
        logger.exception("ListAccountRoles failed: %s", e)
        raise ValueError(f"Failed to list roles for account: {e}") from e

    role_list = roles.get("roleList", [])
    if not role_list:
        _DEVICE_CACHE.pop(device_code, None)
        raise ValueError("No roles found for this account. Assign a permission set in IAM Identity Center.")

    role_name = role_list[0].get("roleName", "")

    # Persist to tenant_aws_config
    row = get_config(db, tenant_id, cycle_id, user_id)
    if not row:
        row = CycleUserAwsConfig(tenant_id=tenant_id, cycle_id=cycle_id, user_id=user_id)
        db.add(row)
    row.connection_type = "oauth2"
    row.sso_start_url = start_url
    row.sso_region = sso_region
    row.encrypted_refresh_token = _encrypt(refresh_token)
    row.sso_account_id = account_id
    row.sso_role_name = role_name
    row.aws_account_id = account_id
    row.aws_region = sso_region
    row.is_active = True
    now = datetime.now(timezone.utc)
    row.updated_at = now
    if getattr(row, "connected_at", None) is None:
        row.connected_at = now
    # Clear access-key fields when switching to oauth2
    row.encrypted_access_key_id = None
    row.encrypted_secret_access_key = None
    db.commit()

    _DEVICE_CACHE.pop(device_code, None)
    return {
        "ok": True,
        "account_id": account_id,
        "account_name": account_name,
        "role_name": role_name,
    }
