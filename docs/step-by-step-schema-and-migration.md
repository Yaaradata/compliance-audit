# Step-by-step: Schema and migration (SWIFT 2025/2026)

Follow this order so the app works with `core`, `swift_2025`, and `swift_2026` without "relation does not exist" or ensure_* errors.

---

## 1. Database migrations and data loads (recommended: one script)

From the **project root**, with PostgreSQL running and DB created (e.g. `compliance`), and backend deps installed (`pip install -r backend/requirements.txt`):

```bash
python backend/scripts/run_schema_migration.py
```

This runs, in order:

- All SQL migrations **01 → 14** (using DB settings from `backend/.env` or env vars).
- Data load scripts: **load_2026_cei.py**, **load_2026_esm.py**, **load_2026_reviewer_checklist.py**, **update_swift_2025_esm_json.py**.

Options:

- `--dry-run` — print what would run without executing.
- `--skip-sql` — only run the data load scripts.
- `--skip-loads` — only run SQL migrations.

---

### 1b. Manual migrations (optional)

If you prefer to run SQL and scripts yourself:

From the project root, with PostgreSQL running and DB created (e.g. `compliance`):

```bash
cd backend
psql -U postgres -d compliance -f sql/01_schema_ddl.sql
psql -U postgres -d compliance -f sql/02_seed_reference_data.sql
psql -U postgres -d compliance -f sql/03_add_evidence_columns.sql
psql -U postgres -d compliance -f sql/04_add_cei_description.sql
psql -U postgres -d compliance -f sql/05_update_a5_json_format.sql
psql -U postgres -d compliance -f sql/06_evidence_sufficiency_matrix.sql
psql -U postgres -d compliance -f sql/07_a5_sufficiency_evaluation_criteria.sql
psql -U postgres -d compliance -f sql/08_reviewer_checklist_json_columns.sql
psql -U postgres -d compliance -f sql/09_user_role_l1_l2.sql
psql -U postgres -d compliance -f sql/10_evidence_submission_history.sql
psql -U postgres -d compliance -f sql/11_notes_notifications.sql
psql -U postgres -d compliance -f sql/12_core_schema_and_move_tables.sql
psql -U postgres -d compliance -f sql/12b_audit_log_date_month_swift_2025.sql
psql -U postgres -d compliance -f sql/13_swift_2026_schema.sql
psql -U postgres -d compliance -f sql/14_seed_swift_2026_domains_controls.sql
psql -U postgres -d compliance -f sql/16_seed_swift_2026_evidence_items_mappings.sql
psql -U postgres -d compliance -f sql/17_seed_swift_2026_a7_control.sql
```

- **01–11**: Create `swift_2025` (or the pre-rename schema) and tables; notes/notifications reference tenants/users in that schema.
- **12**: Creates `core`, renames schema to `swift_2025` if needed, moves `tenants`, `users`, `audit_frameworks`, `assessment_cycles` to `core`, adds `schema_name` and seeds the 2026 framework row.
- **12b**: Audit log date/month columns for `swift_2025`.
- **13–14**: Create `swift_2026` and seed its domains/controls.
- **16**: Seed `swift_2026` canonical evidence items, item–control mappings, and evidence sufficiency matrix (same as 2025) so 2026 cycles show controls and evidence items in the domain UI.
- **17**: Seed A7 (Back-office data flow inventory) and its control 2.4 in `swift_2026` so 2026 Domain A shows A7’s control properly.

---

## 2. Backend ensure_* (already fixed)

`backend/app/database.py` is set up so that:

- **Notes and notifications** are created in `swift_2025` with foreign keys to **`core.tenants`** and **`core.users`** (so they work after migration 12).
- **Evidence submission history** uses **`core.users`** for `changed_by`.
- Index names are **not** schema-qualified (e.g. `idx_notes_resource` on `"swift_2025"."notes"`).

No schema name is placed on the index in `CREATE INDEX`; only the table is schema-qualified. If you ever see a startup error like `syntax error at or near "."` in ensure_*, ensure no `"schema"."index_name"` is used.

---

## 3. Data load scripts (2026 and ESM JSON)

If you did **not** use `run_schema_migration.py`, run these manually after the SQL migrations. From the **project root** (with virtualenv active if you use one):

```bash
python backend/sql/scripts/load_2026_cei.py
python backend/sql/scripts/load_2026_esm.py
python backend/sql/scripts/load_2026_reviewer_checklist.py
python backend/sql/scripts/update_swift_2025_esm_json.py
```

Ref files (e.g. `ref-docs/swift/2026/*.xlsx`, `ref-docs/swift/2025/*.xlsx`) must exist; migrations 01–14 must be applied first.

---

## 4. Start the app and verify

1. **Backend**  
   From `backend/`: `uvicorn app.main:app --reload` (or your usual command).  
   - Logs should show: "Notes and notifications tables ensured." and "Evidence submission history table ensured." with no errors.

2. **Frontend**  
   From `frontend/`: `npm run dev`. Create a cycle (choose 2025 or 2026), open a domain, and confirm diagrams and evidence flows work.

3. **Notifications**  
   - `GET /api/v1/notifications` and `GET /api/v1/notifications/unread-count` should return 200.
   - `PATCH /api/v1/notifications/{id}/read` and `PATCH /api/v1/notifications/read-all` should return 200 when the notification(s) exist for the current user.  
   If you get 404, confirm the tables exist in `swift_2025` (either created by migration 11 or by ensure_* on startup).

4. **Notes and evidence history**  
   Use the UI to add a note and to submit/update evidence; confirm no "relation does not exist" errors.

---

## 5. If something is already partially applied

- **Schema still named `cscf_2025_new`**: Migration 12 renames it to `swift_2025`; run 12.
- **Tables already in `core` but notes/notifications missing**: Run 11 against the DB (so notes/notifications are created in `swift_2025` with FKs to the then-existing tenants/users), or rely on the fixed ensure_* on next backend startup (they now reference `core.tenants` / `core.users`).
- **ensure_* failed before**: After the `database.py` fixes (core refs + index names), restart the backend; ensure_* should succeed and create the tables if they don’t exist.

---

## 6. Quick checklist

| Step | Action |
|------|--------|
| 1 | Run `python backend/scripts/run_schema_migration.py` (or run SQL 01→14 + load scripts manually). |
| 2 | Start backend; confirm no ensure_* errors. |
| 3 | Test 2025 and 2026 cycles, diagrams, evidence, notifications, notes. |

This order and the ensure_* fixes should make the app work properly with core, swift_2025, and swift_2026.
