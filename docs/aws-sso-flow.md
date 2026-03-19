# AWS IAM Identity Center (SSO) — Device Authorization Flow

This document describes the AWS SSO connection flow used for evidence collection **without storing long-lived access keys**. Credentials are obtained via IAM Identity Center (SSO) device authorization; only an encrypted refresh token is stored. Temporary AWS credentials are fetched on demand when running collectors.

---

## Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant AWS_SSO_OIDC
    participant AWS_SSO_Portal
    participant DB

    User->>Frontend: Enter SSO Start URL + Region
    Frontend->>Frontend: Click "Connect with AWS SSO"
    Frontend->>Backend: POST /api/v1/aws/auth/oauth/start
    Backend->>AWS_SSO_OIDC: RegisterClient (public, device_code + refresh_token)
    AWS_SSO_OIDC-->>Backend: client_id, client_secret
    Backend->>AWS_SSO_OIDC: StartDeviceAuthorization(startUrl)
    AWS_SSO_OIDC-->>Backend: verification_uri, verification_uri_complete, user_code, device_code, interval, expires_in
    Backend->>Backend: Cache device_code (in-memory, TTL 10 min)
    Backend-->>Frontend: verification_uri, verification_uri_complete, user_code, device_code, interval, expires_in

    Frontend->>User: Show verification URL + user code
    User->>User: Open URL in browser, enter code, sign in with AWS

    loop Poll every interval seconds
        Frontend->>Backend: POST /api/v1/aws/auth/oauth/poll { device_code }
        Backend->>Backend: Rate-limit check (interval)
        Backend->>AWS_SSO_OIDC: CreateToken(grant_type=device_code, deviceCode)
        alt Authorization pending
            AWS_SSO_OIDC-->>Backend: AuthorizationPendingException
            Backend-->>Frontend: 400 "Waiting for you to authorize..."
        else Success
            AWS_SSO_OIDC-->>Backend: access_token, refresh_token
            Backend->>AWS_SSO_Portal: ListAccounts(access_token)
            AWS_SSO_Portal-->>Backend: accountList
            Backend->>AWS_SSO_Portal: ListAccountRoles(accountId)
            AWS_SSO_Portal-->>Backend: roleList
            Backend->>Backend: Encrypt refresh_token (Fernet)
            Backend->>DB: Save tenant_aws_config (connection_type=oauth2, encrypted_refresh_token, sso_account_id, sso_role_name)
            Backend->>Backend: Remove device_code from cache
            Backend-->>Frontend: { ok: true, account_id, account_name, role_name }
        end
    end

    Frontend->>User: "Connected as &lt;account&gt; (&lt;role&gt;)"

    Note over Backend,DB: Later: evidence collection
    Backend->>DB: get_config(tenant_id)
    Backend->>Backend: Decrypt refresh_token
    Backend->>AWS_SSO_OIDC: CreateToken(grant_type=refresh_token)
    AWS_SSO_OIDC-->>Backend: access_token
    Backend->>AWS_SSO_Portal: GetRoleCredentials(access_token, accountId, roleName)
    AWS_SSO_Portal-->>Backend: temporary access_key_id, secret_access_key, session_token
    Backend->>Backend: Use temp creds for collectors (never stored)
```

---

## Components

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | SSO Start URL + Region form → "Connect with AWS SSO" → show verification URL + user code → poll `/auth/oauth/poll` until success. Access keys are secondary (collapsible). |
| **Backend APIs** | `POST /aws/auth/oauth/start` (validate URL, start device auth, return URL + code), `POST /aws/auth/oauth/poll` (exchange device code, save encrypted refresh token, return account/role). |
| **Backend service** | `aws_sso_oauth.py`: boto3 `sso-oidc` (RegisterClient, StartDeviceAuthorization, CreateToken) and `sso` (ListAccounts, ListAccountRoles, GetRoleCredentials). Device codes cached in-memory with TTL; poll rate-limited by `interval`. |
| **Storage** | Only **encrypted refresh token** + SSO metadata (start_url, region, account_id, role_name) in `core.tenant_aws_config`. **No long-lived access keys** stored. Temporary credentials are fetched on demand for collectors. |

---

## Security

- **HTTPS only** for SSO start URL validation.
- **Secrets**: Refresh token and client secret are encrypted at rest (Fernet, `TENANT_AWS_ENCRYPTION_KEY`). Device code and client secret are kept in memory only and never logged.
- **Poll rate limiting**: Backend enforces the `interval` returned by AWS to avoid `SlowDownException` and unnecessary token requests.
- **Temporary credentials**: Fetched when running collectors via `get_credentials_via_sso()`; not persisted.

---

## API Reference

### POST `/api/v1/aws/auth/oauth/start`

**Body:** `{ "sso_start_url": "https://my-company.awsapps.com/start", "sso_region": "us-east-1" }`

**Response:**  
`{ "verification_uri", "verification_uri_complete", "user_code", "device_code", "expires_in", "interval" }`

### POST `/api/v1/aws/auth/oauth/poll`

**Body:** `{ "device_code": "<from start response>" }`

**Response (success):**  
`{ "ok": true, "account_id", "account_name", "role_name" }`

**Response (pending):**  
`400` with message like "Waiting for you to authorize in the browser..."

---

## AWS SDK

Backend uses **boto3** (Python):

- `sso-oidc`: `register_client`, `start_device_authorization`, `create_token`
- `sso`: `list_accounts`, `list_account_roles`, `get_role_credentials`

No Node.js SDK on the backend; frontend only calls the app’s REST API.
