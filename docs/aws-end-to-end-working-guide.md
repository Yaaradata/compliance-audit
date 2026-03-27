# AWS End-to-End Working Guide (Compliance Audit Platform)

This guide explains the complete AWS integration in this project: how to configure it, connect an account, run evidence collection, validate results, and troubleshoot issues.

It is written for engineers, auditors, and operations teams who need a practical runbook.

---

## 1) What This AWS Module Does

The platform connects to AWS and collects security/compliance evidence for SWIFT CSCF assessments.

Core capabilities:
- Connect AWS tenant context (`account_id`, `region`) without storing tenant long-lived keys.
- Optional secure connection via AWS IAM Identity Center (SSO device flow).
- Optional direct access-key mode.
- Execute collectors (IAM, EC2, GuardDuty, Config, CloudTrail, backup, logging, etc.).
- Persist evidence payloads in database and upload copies to cloud storage.
- Show run history, evidence inventory, and control coverage in UI.

---

## 2) High-Level Architecture

### Frontend
- AWS pages/components under `frontend/components/aws/`.
- Key user flows:
  - Connect (`/aws`)
  - Dashboard and collect (`/aws/dashboard`)
  - Credentials + test connection
  - Run history and evidence views

### Backend API
- Main router: `backend/app/routers/aws.py`
- Important endpoints:
  - `POST /api/v1/aws/context`
  - `POST /api/v1/aws/credentials`
  - `POST /api/v1/aws/credentials/test`
  - `POST /api/v1/aws/auth/oauth/start`
  - `POST /api/v1/aws/auth/oauth/poll`
  - `POST /api/v1/aws/runs/collect`
  - `GET /api/v1/aws/runs`
  - `GET /api/v1/aws/evidence`
  - `GET /api/v1/aws/controls`

### Credential Resolution Layer
- Service: `backend/app/services/tenant_aws_config.py`
- Resolution logic (`get_credentials_for_collect`):
  - `oauth2`: uses SSO refresh token and fetches temporary creds.
  - `assume_role`: assumes role using `role_arn` + `external_id`.
  - `context`: uses app-level env credentials and tenant account/region.
  - `access_key`: decrypts stored tenant key/secret.

### AWS SSO Device Flow
- Service: `backend/app/services/aws_sso_oauth.py`
- Uses `boto3` clients:
  - `sso-oidc`: register client, start device auth, poll/create token
  - `sso`: list accounts/roles, get temporary role credentials
- Stores encrypted refresh token only; temporary credentials are fetched on demand.

### Collectors
- Located in `backend/app/aws_evidence/collectors/`
- Each collector calls specific AWS APIs and stores normalized evidence output.

---

## 3) Prerequisites

1. Backend database is reachable from app.
2. AWS permissions are in place for the chosen connection mode.
3. `backend/.env` is configured with required values.
4. AWS services required by collectors are enabled in target account/region (where applicable).

---

## 4) Environment Configuration

Set these in `backend/.env`.

## Required Core
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## App-Level AWS Credentials (required for context mode)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION` (recommended)
- `AWS_ACCOUNT_ID` (optional helper metadata)

## Token/Encryption Security
- `TENANT_AWS_ENCRYPTION_KEY` (required in environments using encrypted tenant credentials/tokens)

## Storage
- `GCS_BUCKET_NAME` and related storage settings if evidence payload copies are uploaded to GCS.

Note:
- In context mode, tenant only submits `account_id` + `region`.
- Backend uses app-level AWS credentials from env for actual API calls.

---

## 5) Supported Connection Modes

## A) Context Mode (recommended operational default)
- User provides only AWS Account ID and Region.
- Backend stores no tenant secrets.
- Runtime credentials come from app env (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`).

Use when:
- Central platform credentials can access target tenant account(s).
- You want low-friction onboarding.

## B) AWS SSO (OAuth2 Device Authorization)
- User signs in through IAM Identity Center.
- Refresh token is encrypted and saved.
- Temporary credentials are fetched during collection.

Use when:
- You want to avoid long-lived access keys.
- IAM Identity Center is available and standardized.

## C) Access Key Mode
- Tenant-provided access key/secret are stored encrypted.

Use when:
- SSO/context patterns are not feasible.

## D) Assume Role Mode
- Backend assumes a role with `role_arn` and `external_id`.

Use when:
- Cross-account trust policies are already established.

---

## 6) End-to-End Runtime Flow

1. User connects account through UI (`/aws`) or API.
2. Backend saves tenant AWS config in DB.
3. User triggers `POST /api/v1/aws/runs/collect`.
4. Backend resolves credentials using `get_credentials_for_collect`.
5. Collector service executes collectors sequentially/managed per implementation.
6. Each collector:
   - calls AWS APIs,
   - builds payload,
   - writes evidence in DB,
   - uploads copy to object storage (if configured).
7. Run status is stored (`success`, `partial`, `failed` patterns depending on collector outcomes).
8. UI surfaces run history, evidence content, and coverage.

Important behavior:
- If one collector fails, run can continue and be marked partial with error details.
- Empty arrays are valid evidence outcomes when service has no data in region/account.

---

## 7) API Runbook

## 7.1 Connect (Context)
Request:
- `POST /api/v1/aws/context`
- Body: `{ "aws_account_id": "123456789012", "aws_region": "ap-south-1" }`

Result:
- Config saved with `connection_type = context`

## 7.2 Test Connection
Request:
- `POST /api/v1/aws/credentials/test`

Behavior:
- Uses resolved credentials.
- Calls AWS STS `GetCallerIdentity`.

Success criteria:
- Returns account/identity details and no auth error.

## 7.3 Trigger Collection
Request:
- `POST /api/v1/aws/runs/collect`

Result:
- Creates a collector run and evidence records.

## 7.4 Inspect Results
- `GET /api/v1/aws/runs`
- `GET /api/v1/aws/runs/{run_id}`
- `GET /api/v1/aws/evidence`
- `GET /api/v1/aws/evidence/{evidence_id}/content`
- `GET /api/v1/aws/controls`
- `GET /api/v1/aws/controls/coverage`

---

## 8) Collector Coverage and Minimum Permissions

From current collector implementation, the IAM principal used by backend should include these capabilities (least privilege policy should scope by account/region/resources where practical):

- IAM: list users/roles, MFA and password policy checks, credential report
- EC2/VPC: instance/network/security topology details
- CloudTrail: trail status and configuration
- AWS Config: recorder status
- SSM Patch: patch state/baseline metadata
- GuardDuty: detectors and finding statistics
- Inspector2: findings and aggregations
- KMS/ACM/ELB/RDS: encryption posture signals
- Backup + snapshots: backup plan and snapshot coverage
- CloudWatch Logs and flow logs for logging controls
- Secrets Manager metadata (where required by access credential checks)

If permissions are missing:
- run may be partial,
- collector payload may contain error indicators,
- specific evidence rows may be empty.

---

## 9) Working Validation Checklist (End-to-End)

Use this checklist to confirm production readiness.

1. **Configuration**
- `backend/.env` has DB and AWS settings.
- Encryption key exists for secret/token encryption.

2. **Connectivity**
- Context or SSO connection is saved successfully.
- `POST /aws/credentials/test` succeeds.

3. **Collection**
- `POST /aws/runs/collect` returns success response.
- New run appears in `GET /aws/runs`.

4. **Evidence Integrity**
- `GET /aws/evidence` returns records for expected collectors.
- `GET /aws/evidence/{id}/content` returns non-empty JSON for enabled services.

5. **Coverage Views**
- `GET /aws/controls` and `/aws/controls/coverage` return expected mappings.

6. **UI Verification**
- Dashboard shows latest run state.
- Run history expansion shows collector-level statuses/errors.

7. **Audit Readiness**
- Evidence payloads are timestamped.
- Control mapping logic is traceable.
- Storage copy exists (if storage backend is enabled).

---

## 10) Operational Procedures

## Daily/Per-Cycle
- Validate AWS connection state before scheduled collection.
- Run evidence collection per cycle or on demand.
- Review partial/failure runs immediately.
- Re-run collection after fixing permissions/config.

## Rotation and Security
- Rotate app-level AWS credentials regularly (if context mode).
- Rotate encryption keys following platform policy (with migration plan).
- Enforce least-privilege IAM on collector role/user.
- Keep SSO roles scoped to read-only evidence APIs where possible.

## Incident Response
- If run failure spikes:
  - check AWS service health and throttling,
  - inspect permission changes in IAM/Organizations/SCP,
  - inspect backend logs for collector error clusters.

---

## 11) Troubleshooting Guide

## Symptom: “No AWS connection configured”
Possible causes:
- tenant config missing/inactive
- context mode saved without account id

Fix:
- reconnect from `/aws` and test connection.

## Symptom: STS test fails
Possible causes:
- wrong key/secret
- invalid session/expired token (SSO)
- region mismatch or account restrictions

Fix:
- re-authenticate SSO or rotate credentials,
- validate IAM permissions and trust policies.

## Symptom: Collect run is partial
Possible causes:
- one or more collectors missing permissions
- service not enabled in region/account
- API throttling/transient AWS error

Fix:
- inspect collector error details in run history,
- grant specific missing permissions,
- retry run.

## Symptom: Empty evidence payloads
Possible causes:
- legitimate no-data condition
- service disabled
- permission denied with fallback empty payload

Fix:
- verify service enablement and policy scope.

## Symptom: SSO poll never completes
Possible causes:
- user did not complete browser authorization
- poll interval not respected
- device code expired

Fix:
- restart device auth flow and authorize immediately.

---

## 12) Recommended Production Hardening

- Use dedicated IAM role/user for collectors; avoid broad admin credentials.
- Prefer SSO or AssumeRole over static long-lived tenant keys.
- Add scheduled health check for:
  - DB connectivity
  - AWS test-credentials endpoint
  - last successful collection run age
- Add alerting for repeated partial/failure runs.
- Track API latency and collector failure rate per service.
- Maintain a runbook for IAM permission drift.

---

## 13) Quick Start (Practical)

1. Set env in `backend/.env` (`DB_*`, `AWS_*`, encryption key).
2. Start backend and frontend.
3. Open AWS Connect page and save account + region (or complete SSO).
4. Run Test Connection.
5. Trigger Collect from AWS Dashboard.
6. Open Run History and inspect collector statuses.
7. Open Evidence table/content and validate payloads.
8. Confirm control coverage endpoints reflect expected mapping.

When all 8 steps pass, the AWS flow is complete and operational end-to-end.

