# AWS Integration — Done So Far (Checklist)

Bullet-point checklist of everything implemented for AWS in the SWIFT AWS Evidence Test project.

---

## Project & scope

- [ ] End-to-end flow: **collectors → JSON → SHA256 → S3 → PostgreSQL (GCP) → FastAPI → React**
- [ ] Single AWS account, single region (configurable via `.env`)
- [ ] SWIFT CSCF **2026** framework (schema `swift_2026`; no 2025 references)
- [ ] Evidence aligned to SWIFT–AWS evidence sheet (evidence item → AWS APIs → controls)

---

## Configuration (`.env`)

- [ ] **AWS_ACCESS_KEY_ID** — used for boto3 clients (collectors + S3)
- [ ] **AWS_SECRET_ACCESS_KEY**
- [ ] **AWS_DEFAULT_REGION** — e.g. `ap-south-1` (collectors and S3 bucket region)
- [ ] **AWS_ACCOUNT_ID** — 12-digit ID (S3 key path and metadata)
- [ ] **S3_BUCKET_NAME** — evidence bucket (default `swift-evidence`)
- [ ] Config loaded from `backend/.env` or `swift_aws_evidence_test/backend/.env` (parent wins if present)

---

## GCP (Cloud SQL / PostgreSQL)

- [ ] **Schema `swift_2026`** — all tables live in this schema
- [ ] **Table `swift_2026.collector_runs`** — run_id, collector_name, cloud_provider (`aws`), execution_time, ended_at, status, trigger_type
- [ ] **Table `swift_2026.evidence`** — evidence_id, run_id, item_code, control_id, evidence_type, source_system, storage_uri (S3), file_hash, collected_at
- [ ] **Table `swift_2026.evidence_sufficiency_matrix`** — item_code, control_id, evidence_item_name, control_name, ma, cscf_version (`2026`), seed rows for A2, B1, B2, C1, D1, E1
- [ ] **Startup migration** — on backend startup, `ensure_schema()` runs `01_swift_2026_schema.sql` and `02_add_ended_at.sql` so tables exist in GCP without manual SQL
- [ ] **Manual option** — `python scripts/run_schema.py` or psql with `01_swift_2026_schema.sql` + `02_add_ended_at.sql`

---

## AWS S3

- [ ] **Evidence bucket** — `ensure_bucket()` on backend startup creates bucket in configured region if it does not exist (no failure if AWS unreachable)
- [ ] **Upload path** — `aws/<account-id>/<collector_name>/<date>.json` (e.g. `aws/123456789012/vpc_network/2026-03-14.json`)
- [ ] **Manual evidence path** — `manual/<control_id>/<item_code>/<evidence_id>.json`
- [ ] **Upload** — `upload_evidence_file(local_path, collector_name, ts)` and `upload_evidence_bytes(body, key)`; return `(s3_uri, file_hash)`
- [ ] **Download** — `get_evidence_content(storage_uri)` used by API to serve evidence JSON to UI
- [ ] **S3 client** — boto3 client with region and credentials from config

---

## Evidence integrity (hashing)

- [ ] **SHA256 per file** — `sha256_file(path)` before upload; stored in `evidence.file_hash`
- [ ] **SHA256 for manual** — `sha256_bytes(body)` for manual evidence uploads
- [ ] Hash stored in DB only (not exposed in UI per earlier polish)

---

## Collectors (14 total, boto3)

- [ ] **iam** — ListUsers, ListRoles, ListAttachedUserPolicies, ListAttachedRolePolicies
- [ ] **ec2** — DescribeInstances, DescribeSecurityGroups, DescribeReservations
- [ ] **cloudtrail** — DescribeTrails, GetTrailStatus
- [ ] **config** — DescribeConfigurationRecorders, DescribeConfigurationRecorderStatus
- [ ] **ssm_patch** — DescribeInstancePatchStates, DescribePatchBaselines, DescribeMaintenanceWindowExecutions (+ EC2 instances)
- [ ] **vpc_network** — VPCs, subnets, route tables, IGWs, NAT gateways, flow logs, security groups, NACLs, peering, VPN (direct call, not paginated), VPC endpoints
- [ ] **encryption** — KMS keys/rotation, ACM certificates, ELBv2 listeners/SSL, RDS instances
- [ ] **iam_mfa_password** — GetAccountPasswordPolicy, ListMFADevices, ListUsers, GetAccountSummary
- [ ] **backup** — ListBackupPlans, GetBackupPlan, DescribeBackupVault, RDS, EC2 snapshots
- [ ] **guardduty** — ListDetectors, GetDetector, GetFindingsStatistics, GetMalwareProtectionPlan
- [ ] **inspector** — inspector2 ListFindingAggregations, ListFindings
- [ ] **logging** — CloudTrail trails/status, logs DescribeLogGroups, EC2 DescribeFlowLogs
- [ ] **access_credential** — ListUsers + attached policies, GenerateCredentialReport + GetCredentialReport (base64 padding fix), ListRoles, ListAccessKeys + GetAccessKeyLastUsed, ACM certificates, Secrets Manager list
- [ ] Each collector returns `list of (local_path, item_code, control_id, evidence_type, source_system)`; output written to `evidence_out/` then uploaded to S3

---

## Collector fixes applied

- [ ] **VPN connections** — `describe_vpn_connections` called directly (not paginated)
- [ ] **Credential report** — base64 padding + strip non-base64 chars + truncate if len ≡ 1 (mod 4) to avoid decode error

---

## AWS API catalog & evidence mapping

- [ ] **aws_api_catalog.py** — `COLLECTOR_AWS_APIS` per collector; `get_apis_for_run(run_collector_name)` for run-detail “AWS calls” in UI
- [ ] **evidence_mapping.py** — `EVIDENCE_REGISTRY`: evidence items A1–H with aws_services, apis, control_ids; `get_apis_for_control(item_codes)` for “AWS calls for this control” in Control View
- [ ] **get_control** API returns `aws_calls`: `{ aws_apis: [...], by_evidence_item: [...] }` for selected control

---

## Collector orchestration

- [ ] **collector_service.run_all_collectors(trigger_type)** — creates run, runs all 14 collectors in order, uploads each unique file to S3 once, inserts evidence rows with storage_uri and file_hash, sets run status success/failed and ended_at
- [ ] **Runner** — `python -m runner.run_collector` from backend dir; prints run_id on success
- [ ] **Region/account** — from config `AWS_DEFAULT_REGION`, `AWS_ACCOUNT_ID`; output_dir `evidence_out/`

---

## Backend API (FastAPI)

- [ ] **POST /runs/collect** — triggers `run_all_collectors(trigger_type="manual")`; returns run_id (timeout 120s for frontend)
- [ ] **GET /runs** — list runs with evidence_count (batch query); in_time, out_time, status, trigger_type
- [ ] **GET /runs/{run_id}** — run detail + evidence_count + `aws_calls` (APIs per collector from catalog)
- [ ] **GET /evidence** — list evidence (no file_hash/storage_uri in response)
- [ ] **GET /evidence/{id}** — single evidence metadata (no file_hash/storage_uri)
- [ ] **GET /evidence/{id}/content** — fetches JSON from S3 via storage_uri, returns body to UI
- [ ] **POST /evidence** — manual evidence: JSON body → upload bytes to S3, insert evidence row
- [ ] **GET /controls** — list controls (from swift_2026 ESM or USE_SWIFT_2026)
- [ ] **GET /control/{control_id}** — control info, required_evidence_items, collected_evidence (no hash/uri), aws_calls for that control
- [ ] **GET /controls/coverage** — control_ids that have at least one evidence
- [ ] **CORS** — allowed origins include localhost:5173, 5174, 3000, 127.0.0.1:5173, 5174

---

## Frontend (React + Vite)

- [ ] **Dashboard** — hero “Fetch AWS evidence” button (calls POST /runs/collect), KPIs (runs, evidence count, success rate, controls with evidence), recent runs list, quick links to Evidence and Controls, full run history table with expand for AWS API calls
- [ ] **Control View** — control chips, “Fetch AWS evidence” button, required evidence items, collected evidence table (item, source, collected, View), “AWS calls for this control” (tags + by evidence item details), add manual evidence form, evidence content modal (JSON from S3)
- [ ] **Evidence list** — table: item, control, source, collected, View; modal for evidence content from S3
- [ ] **API client** — `fetchAwsEvidence()` → POST /runs/collect; `getEvidenceContent(id)` → GET /evidence/{id}/content
- [ ] **UI polish** — no file_hash/storage_uri/run_id in tables; essential columns only; design system (tokens, Plus Jakarta Sans)

---

## Documentation & setup

- [ ] **README.md** — architecture (S3 path, schema swift_2026), .env table, GCP DB auto-migration on startup, S3 bucket created on startup, setup steps, API table, folder structure, control-wise view, evidence mapping + AWS_SETUP reference
- [ ] **AWS_SETUP.md** — services to enable (Config, GuardDuty, Security Hub, Inspector, Access Analyzer, Backup, CloudTrail, VPC Flow Logs, etc.), IAM policy JSON for collector + S3, notes on Fetch AWS evidence

---

## Summary counts

- **14** AWS collectors
- **1** S3 bucket (configurable name), auto-created if missing
- **3** main DB tables in `swift_2026` (collector_runs, evidence, evidence_sufficiency_matrix)
- **2** SQL migrations run on startup (01 schema + 02 ended_at)
- **1** runner entrypoint: `python -m runner.run_collector`
- **1** HTTP trigger: POST /runs/collect (used by “Fetch AWS evidence” in UI)

Use this checklist to track what’s done and what to do next (e.g. multi-region, scheduled runs, more collectors, S3 encryption, IAM doc).
