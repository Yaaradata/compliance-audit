# How to Work on SOC 2 in This Codebase

This app is built to support **multiple compliance frameworks**. Right now it is fully set up for **SWIFT CSCF** (v2025 and v2026). Your friend can add **SOC 2** (Trust Service Criteria) by following the same pattern.

---

## How the app is structured

1. **Frameworks** are registered in `core.audit_frameworks` (code, name, version, **schema_name**).
2. Each framework has its **own DB schema** (e.g. `swift_2025`, `swift_2026`) containing:
   - `evidence_domains` – categories (e.g. A–H for SWIFT)
   - `controls` – control requirements
   - `canonical_evidence_items` – evidence items (e.g. A1, B1, C1)
   - `item_control_mappings` – which evidence supports which controls
   - Plus tables for evidence sufficiency matrix, reviewer checklist, etc.
3. An **assessment cycle** is tied to one framework via `framework_id`. All evidence, reviews, and submissions for that cycle use that framework’s schema.
4. The **UI** (domains, evidence list, uploads, review queue) is largely framework-agnostic. Some screens (e.g. architecture selection, A1/A5 forms) are SWIFT-specific; SOC 2 would use generic or SOC 2–specific forms.

---

## Steps for your friend to add SOC 2

### 1. Create the SOC 2 database schema

- Copy the pattern from `backend/sql/13_swift_2026_schema.sql`:
  - Create a schema, e.g. `soc2`.
  - Create the same set of tables in that schema: `controls`, `evidence_domains`, `canonical_evidence_items`, `item_control_mappings`, `evidence_sufficiency_matrix`, `reviewer_checklist`, etc. (and any other tables the app expects in a framework schema).
- Enums can stay similar; `architecture_type` may be optional or repurposed for SOC 2 (e.g. service type or scope).

### 2. Register the SOC 2 framework in `core.audit_frameworks`

- Insert a row for SOC 2, for example:
  - `code`: `'SOC2'`
  - `name`: `'SOC 2 Trust Services Criteria'`
  - `version`: e.g. `'v2017'` or `'v2022'`
  - `schema_name`: `'soc2'`
  - `is_active`: `true`
- The `schema_name` column is used by the backend to set `search_path` when handling cycles that use this framework (see `backend/app/dependencies.py` → `_resolve_schema_for_cycle`).

### 3. Seed SOC 2 reference data

- **Domains**: Map SOC 2 Trust Service Criteria (CC, A, I, P, availability, etc.) to `evidence_domains` (e.g. one letter/id per category).
- **Controls**: Insert SOC 2 controls into `soc2.controls` (id, name, control_type, objective, etc.).
- **Evidence items**: Define `canonical_evidence_items` that represent the evidence needed (policies, procedures, screenshots, exports, etc.).
- **Mappings**: Populate `item_control_mappings` to link each evidence item to the controls it supports.
- Optionally add `evidence_sufficiency_matrix` and `reviewer_checklist` if the app uses them for SOC 2.

Use `backend/sql/02_seed_reference_data.sql` and the SWIFT seed scripts as a reference; adapt table names and column values for the `soc2` schema.

### 4. Create a cycle that uses SOC 2

- **Backend**: Cycle creation already supports `framework_id` (`backend/app/routers/assessments.py`). If the frontend sends the SOC 2 framework’s id, the cycle will use the SOC 2 schema.
- **Frontend**: Create cycle from the Compliance Officer dashboard (`/dashboard`) via **New Assessment Cycle** (modal uses `GET /ref/frameworks` for the framework dropdown). Once the SOC 2 row exists in `audit_frameworks`, it will appear there. Your friend may want to:
  - Adjust the default selection logic so SOC 2 can be chosen.
  - Derive `cycle_year` (or similar) from the selected framework in a way that makes sense for SOC 2 (e.g. report period).

### 5. Frontend behaviour for SOC 2 (generic structure, no merge conflicts)

- **Framework registry**: The app picks which UI to show from `frontend/lib/frameworks/registry.ts` using the cycle’s `schema_name`. **SWIFT** and **SOC 2** each have their own evidence workspace; adding SOC 2 does not require editing SWIFT files.
- **Where things render**:
  - **Dashboard, review, approval** use shared components under `frontend/components/dashboard/`, `frontend/components/review/`, `frontend/components/approval/`. They are framework-agnostic (data comes from the API for the cycle’s schema).
  - **Domain evidence workspace** (forms and uploads per evidence item) is **framework-specific**. The shared layout (`domain-workspace-layout.tsx`) receives `schemaName` and loads the workspace from:
    - `frontend/components/frameworks/swift-cscf/components/domain/dashboard/evidence-workspace.tsx` for SWIFT (swift_2025, swift_2026),
    - `frontend/components/frameworks/soc2/components/domain/dashboard/evidence-workspace.tsx` for SOC 2 (soc2).
- **SOC 2 evidence workspace**: A generic implementation already exists at `frontend/components/frameworks/soc2/components/domain/dashboard/evidence-workspace.tsx`. It provides upload, per-control evidence, evaluation, and notes. Extend this file (or add SOC 2–specific evidence item handling) without touching SWIFT code.
- **Adding a new framework**: In `lib/frameworks/registry.ts` add one line to register your evidence workspace loader; implement the workspace under `components/frameworks/<your-framework>/`. See `components/frameworks/README.md`.
- **Architecture selection**: The “select architecture” step is SWIFT-specific (A1–A4, B). For SOC 2 you can either:
  - Skip this step when the cycle’s framework is SOC 2 (e.g. in `handleOpenCycle` or the route that sends users to `select-architecture`), or
  - Replace it with a SOC 2–specific “scope” or “service type” step if needed.

### 6. Backend behaviour

- **Schema resolution**: `get_db_scoped(cycle_id)` and `get_db_ref(cycle_id=...)` already resolve the framework from the cycle and set `search_path` to that framework’s `schema_name`. No change needed for SOC 2 as long as the schema exists and is registered.
- **Evidence/evaluation**: Evidence submission, evaluation, and review APIs are cycle-scoped and use the same schema resolution. They will work for SOC 2 once the schema and reference data exist.
- **Notifications/reports**: If they reference framework-specific concepts (e.g. SWIFT controls), extend them to handle SOC 2 (e.g. by framework code or schema).

---

## Quick reference: where things live

| What | Where |
|------|--------|
| Framework list (API) | `GET /ref/frameworks` → `backend/app/routers/reference.py` |
| Schema resolution | `backend/app/dependencies.py` → `_resolve_schema_for_cycle`, `get_db_scoped` |
| Cycle creation | `POST /assessments` → `backend/app/routers/assessments.py` (uses `framework_id`) |
| New assessment (UI) | Compliance Officer dashboard modal + `NewAssessmentCycleForm` (framework dropdown) |
| Domain/evidence ref data | Queried from cycle’s schema (e.g. `swift_2025`, `swift_2026`, or `soc2`) |
| SWIFT seed data | `backend/sql/02_seed_reference_data.sql`, `14_seed_swift_2026_*.sql`, etc. |
| Framework registry | `frontend/lib/frameworks/registry.ts` (maps schema_name → evidence workspace) |
| SWIFT evidence workspace | `frontend/components/frameworks/swift-cscf/components/domain/dashboard/evidence-workspace.tsx` |
| SOC 2 evidence workspace | `frontend/components/frameworks/soc2/components/domain/dashboard/evidence-workspace.tsx` |
| Shared domain layout | `frontend/components/domain/dashboard/domain-workspace-layout.tsx` (passes schemaName to workspace) |
| Evidence form data (SWIFT) | `frontend/lib/data/*-evidence.ts` |

---

## Summary

Your friend can work on SOC 2 by:

1. Adding a **soc2** schema and framework tables (mirroring the SWIFT schema).
2. Inserting the **SOC 2 framework** row in `core.audit_frameworks` with `schema_name = 'soc2'`.
3. **Seeding** SOC 2 domains, controls, evidence items, and mappings in the `soc2` schema.
4. **Creating a cycle** with the SOC 2 framework (using the existing framework dropdown once SOC 2 is in the DB).
5. **Adapting the frontend** where necessary: default framework selection, optional architecture step, and SOC 2–specific or generic evidence forms.

The existing evidence collection, review, and approval flows are framework-agnostic and will operate on SOC 2 data once the schema and reference data are in place.
