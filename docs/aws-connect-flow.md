# AWS Connect Flow (Account ID + Region)

This document describes the **primary** AWS connection flow: user enters **Account ID** and **Region** on the Connect page; the backend uses **app-level AWS credentials** from the environment to run collectors and fetch AWS security data.

---

## End-to-end flow

1. **Connect (frontend)**  
   User goes to **AWS → Connect**, enters **AWS Account ID** and **AWS Region**, clicks **Connect**.

2. **Backend**  
   `POST /api/v1/aws/context` saves the tenant’s **Account ID** and **Region** in `core.tenant_aws_config` with `connection_type = "context"`. No access keys or secrets are stored.

3. **Dashboard & evidence collection**  
   When the user runs **Collect** from the Dashboard (or triggers collection via API), the backend:
   - Resolves credentials via `get_credentials_for_collect(db, tenant_id)`.
   - For `connection_type = "context"`, it uses **app-level** credentials from the environment:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - Optional: `AWS_DEFAULT_REGION` (tenant’s region is still used for the target).
   - Builds a credential dict with the **tenant’s** `account_id` and `region` and the app’s access key/secret.
   - Runs collectors (IAM, EC2, GuardDuty, Config, etc.) against that account/region and stores evidence.

4. **Test connection**  
   From the Connect page (when connected) or Credentials page, **Test connection** calls `POST /api/v1/aws/credentials/test`, which uses the same credential resolution and calls AWS STS `GetCallerIdentity` to verify connectivity.

---

## Backend configuration

Set in `backend/.env` (or environment):

- **Required for context-only tenants:**  
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`  
  (IAM user or role credentials that can access the target account.)
- **Optional:**  
  `AWS_DEFAULT_REGION` (e.g. `ap-south-1`). The tenant’s chosen region is used for collection; this is only a default when building app creds.)

The IAM identity represented by these credentials must have permission to call the APIs used by the collectors (e.g. IAM, EC2, GuardDuty, Config, CloudTrail, etc.) in the **target** account. If the app runs in the same AWS account as the tenant’s Account ID, the same credentials can be used. For cross-account access, use IAM roles and/or assume-role.

---

## Frontend

- **Connect page** (`/aws`): Account ID + Region form → **Connect** → success state with links to Dashboard, Evidence, Controls and **Test connection**.
- **Dashboard** (`/aws/dashboard`): **Collect** calls `POST /api/v1/aws/runs/collect` (via proxy). On 400 “No AWS connection”, the UI tells the user to go to Connect and enter Account ID and Region.
- **Credentials** (`/aws/credentials`): Optional; users can add explicit access keys or SSO there if they prefer not to rely on app-level env credentials.

---

## Backend API summary

| Method | Path | Purpose |
|--------|------|--------|
| `POST` | `/api/v1/aws/context` | Save Account ID + Region only (context-only connect). |
| `GET`  | `/api/v1/aws/credentials` | Get current config (no secrets); `has_config` true when context or credentials are set. |
| `POST` | `/api/v1/aws/credentials/test` | Test connection (STS GetCallerIdentity). |
| `POST` | `/api/v1/aws/runs/collect` | Run all AWS evidence collectors; uses context or stored credentials. |

---

## Tests

Backend unit tests for the AWS connect (context) flow live in **`backend/tests/test_aws_flow.py`**:

- `_get_app_aws_credentials()`: returns `None` when env is unset; returns creds with correct region when env is set.
- `get_credentials_for_collect()` for `connection_type=context`: returns app creds with tenant’s account_id and region when env is set; returns `None` when app creds are missing or tenant has no account_id.
- `get_config_public()`: `has_config` is true for context when account_id is set.

Run from the backend directory:

```bash
py -m pytest tests/test_aws_flow.py -v
```

---

## Alternative: SSO or access keys

- **SSO:** Use **AWS → Credentials** and the “Connect with AWS SSO” flow; device authorization and refresh token are stored (see `docs/aws-sso-flow.md`).
- **Access keys:** Use **AWS → Credentials** and enter Access Key ID + Secret; they are stored encrypted.  
In both cases, `get_credentials_for_collect` returns tenant-specific credentials instead of app-level env credentials.
