# Reviewer checklist table and data

Table **reviewer_checklist** holds L1/L2/L3 reviewer guidance per (evidence item, control), sourced from `Reviewer_doc/Reviewer.xlsx`.

## 1. Create the table

From repo root (or set `PGHOST`, `PGDATABASE`, etc.):

```bash
psql -U postgres -d compliance -f backend/sql/reviewer_checklist_ddl.sql
```

Or run the file in your SQL client. Uses schema **cscf_2025_new** (same as main app).

## 2. Load data from Excel

Generate the data SQL from the XLSX (run from repo root):

```bash
python backend/sql/scripts/load_reviewer_checklist.py
```

This writes **backend/sql/reviewer_checklist_data.sql**.

Then load it:

```bash
psql -U postgres -d compliance -f backend/sql/reviewer_checklist_data.sql
```

**Requirement:** `Reviewer_doc/Reviewer.xlsx` must exist at repo root (same folder as `compliance-audit`).  
**Dependency:** `pip install openpyxl`

## 3. Run DDL + data in one go

```bash
psql -U postgres -d compliance -f backend/sql/reviewer_checklist_ddl.sql -f backend/sql/reviewer_checklist_data.sql
```

## Table columns

| Column                | Type         | Description                                      |
|-----------------------|--------------|--------------------------------------------------|
| id                    | UUID         | Primary key                                      |
| item_code             | VARCHAR(5)   | Evidence item code (e.g. A1)                     |
| evidence_item         | VARCHAR(500) | Evidence item name                               |
| control_id            | VARCHAR(20)  | Control ID (e.g. 1.1)                            |
| control_name          | VARCHAR(500) | Control name                                     |
| mandatory_advisory    | VARCHAR(10)  | M / A                                            |
| l1_check              | TEXT         | L1 completeness check text                       |
| l2_check              | TEXT         | L2 quality check text                            |
| l3_check              | TEXT         | L3 independent assessment text                  |
| cscf_version          | VARCHAR(10)  | Default 2025v                                    |
| created_at, updated_at| TIMESTAMPTZ  | Audit timestamps                                 |
