# Agent instructions

For callers / callees / symbols: use CodeGraph MCP with `limit: 100`. No grep before or after.
Example: `codegraph_callers` with `{ "symbol": "crew", "limit": 100 }`.

## Cursor Cloud specific instructions

Primary product: **YaaraLabs SWIFT Compliance Platform**. Minimal end-to-end stack is three services: PostgreSQL + FastAPI backend (`backend/`, port 8000) + Next.js frontend (`frontend/`, port 3000). The frontend proxies `/api/v1/*` to the backend (see `frontend/next.config.ts`), so browse the app at `http://localhost:3000`. AI (Vertex/OpenAI), GCS storage, and AWS/GCP/Azure cloud-evidence collection are all optional and need external credentials; the core assessment workflow runs without them.

The update script only refreshes deps (Python venv at `backend/venv`, frontend `node_modules`). PostgreSQL, the `compliance` database, and all applied SQL migrations persist in the VM snapshot — they are not re-created on boot.

Starting the services (none auto-start on boot):
- PostgreSQL: `sudo pg_ctlcluster 16 main start` (local superuser is `postgres`/`postgres`).
- Backend: `backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000` (run from `backend/`).
- Frontend: `npm --prefix frontend run dev` (dev mode; `next build`/`start` are prod).

Non-obvious caveats:
- `.env` files are gitignored and there is no `.env.example`. `backend/.env` must set DB_* (host `127.0.0.1`, db `compliance`, user/pass `postgres`/`postgres`), a `JWT_SECRET_KEY` of ≥32 chars, and `STORAGE_BACKEND=local` (default is `gcs`, which needs a bucket). `frontend/.env` must set `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000` — the frontend throws at startup if it is missing.
- No login users are seeded. Create a platform admin via `POST /api/v1/auth/signup` with `{"role":"admin"}` (platform admins have no tenant), then onboard tenants/users from the `/admin` page.
- Rebuilding the DB from scratch (only if needed): the documented `backend/scripts/run_schema_migration.py` is incomplete. Before it, create the reviewer checklist table with `backend/sql/reviewer_checklist_ddl.sql`, and load `backend/sql/reviewer_checklist_data.sql` with `PGOPTIONS='-c search_path=swift_2025,public'` (the data file sets no schema). SWIFT 2025 seeds fully; several SWIFT 2026 seeds (migrations 16/21/25/26) fail on a pre-existing control-id mismatch (`2.4A` exists in swift_2025 but swift_2026 uses `2.4`) — 2025 cycles are fully functional.
- `ensure_aws_evidence_schema()` (backend startup) has a path bug: `_SQL_DIR` in `backend/app/aws_evidence/core/db.py` resolves to `app/sql` instead of `app/aws_evidence/sql`, so the `swift_2026.collector_runs`/`evidence` tables are never auto-created and startup migrations log a failure (non-fatal; only optional cloud-evidence features are affected). Create them once by applying `backend/app/aws_evidence/sql/*.sql` (01→07) via psql.
- Frontend test scripts (`test:ukba-v5`, `test:ukba-v6`, `test:ukpa-signals`) use `tsx`, which is not declared in `package.json`; run them with `npx tsx --test <glob>`.
- `npm run lint` works but reports many pre-existing errors/warnings in the prototype audit code (`lib/**`); this is the repo's existing state, not an environment problem.
- Backend tests: `backend/venv/bin/python -m pytest`.
