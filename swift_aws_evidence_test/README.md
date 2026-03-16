# SWIFT AWS Evidence Test

End-to-end system that collects AWS security configuration evidence for **SWIFT CSCF compliance**: collectors → JSON → SHA256 → S3 → PostgreSQL (Cloud SQL) → FastAPI → React dashboard.

## Architecture

- **Evidence collection**: Python + boto3 — **14 collectors** aligned to the SWIFT–AWS evidence sheet (VPC/Network, IAM, EC2, CloudTrail, Config, SSM, Encryption, MFA/Password, Backup, GuardDuty, Inspector, Logging, Access/Credential)
- **Storage**: Amazon S3 (`s3://swift-evidence/aws/<account-id>/<collector>/<date>.json`)
- **Metadata DB**: PostgreSQL (Google Cloud SQL), schema `swift_2026`
- **Backend**: FastAPI
- **Frontend**: React + Vite
- **Hashing**: SHA256 on every evidence file (stored in `evidence.file_hash`)

## Required `.env` (backend)

Use the main project `backend/.env` or copy to `swift_aws_evidence_test/backend/.env`. Required variables:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host (e.g. 127.0.0.1 or Cloud SQL proxy) |
| `DB_PORT` | 5432 |
| `DB_NAME` | Database name (e.g. compliance) |
| `DB_USER` | DB user |
| `DB_PASSWORD` | DB password |
| `DB_SSL` | false for local/proxy; true for direct Cloud SQL |
| `AWS_ACCESS_KEY_ID` | AWS credentials for collectors + S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret |
| `AWS_DEFAULT_REGION` | e.g. ap-south-1 |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `S3_BUCKET_NAME` | Evidence bucket (e.g. swift-evidence). Created in AWS on first startup if missing. |
| `SWIFT_SCHEMA` | Schema for evidence tables (default swift_2026) |
| `USE_SWIFT_2026` | If true, Control View reads controls/ESM from **swift_2026** (same DB) so data is shown **control-wise** per the real SWIFT 2026 framework |

## Setup

### 1. Database (GCP Cloud SQL)

On **first startup**, the backend runs migrations and creates the **swift_2026** schema and tables in PostgreSQL (GCP Cloud SQL or local). Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env` (use Cloud SQL Proxy or direct host for GCP). No manual SQL run is required unless you prefer:

```bash
cd swift_aws_evidence_test/backend
python scripts/run_schema.py
# or: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f sql/01_swift_2026_schema.sql
```

### 2. Backend

```bash
cd swift_aws_evidence_test/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd swift_aws_evidence_test/frontend
npm install
npm run dev
```

UI: http://localhost:5173

### 4. Run collectors (evidence collection)

From backend directory:

```bash
cd swift_aws_evidence_test/backend
python -m runner.run_collector
```

This creates a `collector_runs` record, runs all AWS collectors, uploads JSON to S3, and inserts evidence metadata into PostgreSQL.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /runs | Collector execution history |
| GET | /evidence | Evidence metadata list |
| GET | /evidence/{id} | Single evidence details |
| GET | /controls | SWIFT controls (from matrix) |
| GET | /control/{control_id} | Evidence linked to control |

## Folder structure

```
swift_aws_evidence_test/
├── backend/
│   ├── collectors/     # IAM, EC2, CloudTrail, Config, SSM Patch
│   ├── core/           # db, s3_storage, hash_utils, config
│   ├── models/         # collector_runs, evidence, evidence_matrix
│   ├── services/       # collector_service, evidence_service
│   ├── api/            # routes_runs, routes_evidence, routes_controls
│   ├── runner/         # run_collector.py
│   ├── sql/            # 01_swift_2026_schema.sql
│   └── main.py
└── frontend/
    └── src/
        ├── pages/      # Dashboard, EvidenceList, ControlView
        ├── components/ # EvidenceTable, RunHistory
        └── api/        # api.js (Axios)
```

## Control-wise view

Data is shown **control-wise**: in the Control View you select a control (e.g. 1.1, 6.4) and see:

- **Required evidence items** — from the framework (CEI → control mapping).
- **Collected evidence** — AWS evidence stored for that `control_id`.

Evidence and collector runs are stored in **swift_2026**. If your database already has a full **swift_2026** framework (same compliance DB), set **`USE_SWIFT_2026=true`** in `.env`. The backend will then read controls and the evidence sufficiency matrix from **swift_2026**, so the Control View lists the real SWIFT 2026 controls (e.g. 1.1, 1.2, … 7.4A) and their required CEI. Collected AWS evidence (in `swift_2026.evidence`) is shown under the matching `control_id`.

## Getting all evidence (SWIFT–AWS sheet)

The **SWIFT Domain → Evidence Item → AWS Asset** mapping from your sheet is implemented as:

- **`backend/collectors/evidence_mapping.py`** — registry of evidence items (A1, A2, B1, B3, …) with AWS APIs and control mappings.
- **`backend/collectors/AWS_SETUP.md`** — **required AWS setup**: enable Config, GuardDuty, Security Hub, Inspector, Access Analyzer, Backup, etc., and the IAM policy for the collector. After enabling these and running **Fetch AWS evidence**, many more controls will receive automated evidence.

Collectors run only in the region in `.env` (`AWS_DEFAULT_REGION`). For multi-region evidence, run the collector (or add multi-region support) per region.

## Evidence → CEI mapping (examples)

| Collector | item_code | control_id |
|-----------|-----------|------------|
| IAM | A2 | 1.1 |
| EC2 | B1 | 2.1 |
| CloudTrail | C1 | 3.1 / 6.4 (2026: Logging) |
| Config | D1 | 4.1 |
| SSM Patch | E1 | 5.1 |
