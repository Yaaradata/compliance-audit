# AWS Section — End-to-End Construction (Prompt for Improvements)

Use this as the context prompt when asking Claude (or another AI) to improve the AWS pages. It describes how the AWS section is fully constructed end-to-end.

---

## 1. Purpose and scope

The **AWS section** is a multi-tenant area of a SWIFT compliance audit app. It lets tenant users (roles: `it_sme`, `tenant_admin`, `compliance_officer`) **connect their AWS account** via an IAM Role ARN + Region, then **run read-only evidence collection** and **view evidence and controls**. All data is scoped by **tenant**: backend resolves tenant from the current user (or from `?tenant_id=` for platform admins).

---

## 2. Frontend structure

### 2.1 Routes (Next.js App Router)

- **`/aws`** — **Connect** page (root). User enters Role ARN + Region; backend validates with STS AssumeRole and saves connection. If not connected, this is the only page shown (no nav).
- **`/aws/dashboard`** — Main dashboard: KPIs (runs, evidence count, controls with evidence), “Fetch AWS evidence” button, run history, quick links to Evidence/Controls.
- **`/aws/evidence`** — Table of collected evidence rows; view JSON content in a modal; optional Refresh; listens for `aws-collection-completed` to auto-refresh.
- **`/aws/controls`** — List of controls (from evidence sufficiency matrix). Uses `AwsControlView` which can show control detail when a control is selected.
- **`/aws/controls/[controlId]`** — Control detail page (control, required evidence items, collected evidence, AWS APIs, manual evidence form, “Fetch AWS evidence” from here too).

### 2.2 Layout and nav

- **Layout** (`app/(main)/aws/layout.tsx`):
  - Uses `usePathname()` and `getAwsCredentials()` to know if user is on Connect and if they have a connection (`has_config`).
  - **Nav visibility**: Nav (Connect, Dashboard, Evidence, Controls) is **hidden** on `/aws` until the user is connected (`showNav = !isConnectPage || hasConfig === true`). After connect, the page dispatches `aws-connection-changed` so the layout re-fetches and shows the nav without a full reload.
  - Access: only users with roles `it_sme`, `tenant_admin`, `compliance_officer` see AWS content; others see “You do not have access to AWS evidence.”
  - When nav is hidden, layout is centered and minimal; when shown, standard flex layout with padding.

- **Nav** (`components/aws/aws-nav.tsx`):
  - Links: Connect, Dashboard, Evidence, Controls (no Credentials page).
  - Active state by pathname; uses CSS variables (`var(--primary)`, `var(--foreground-muted)`).

### 2.3 Key pages (summary)

- **Connect (`/aws/page.tsx`)**:
  - Loads `getAwsCredentials()`. If `has_config`: shows “Connected” card (role/account, region, links to Dashboard/Evidence/Controls, Test connection, Disconnect & delete all evidence). If not: shows form (Role ARN input, AWS Region dropdown from `AWS_REGIONS`), “Validate & Connect” button.
  - On submit: `saveAwsConnect({ role_arn, region })` (no External ID in UI; backend uses fixed External ID e.g. Swift-Audit). On success: `load()`, dispatch `aws-connection-changed`.
  - Disconnect: `deleteAwsConnect()` then `load()`; confirmation required.

- **Dashboard (`/aws/dashboard/page.tsx`)**:
  - Initial load: `getRuns(50)`, `getEvidence(500)` (count), `getControlsCoverage()` → sets runs, evidenceCount, controlIdsWithEvidence.
  - “Fetch AWS evidence”: `fetchAwsEvidence()` (POST `/aws/runs/collect`, 120s timeout). On success: gets `run_id`, polls `getRunDetail(runId)` every 4s until status is success/partial/failed, then `load()` and dispatch `aws-collection-completed`. On timeout/5xx: shows message “Checking for new data…”, starts a 6s-interval poll (up to 3 min) that fetches runs/evidence/coverage and updates state; when the most recent run is completed (recent `ended_at`), clears the error and dispatches `aws-collection-completed`.
  - Renders `AwsDashboard` with runs, evidenceCount, controlIdsWithEvidence, onFetchEvidence, onRunDeleted (→ load), fetching, fetchError. Also Account link and Refresh button that call `load()`.

- **Evidence (`/aws/evidence/page.tsx`)**:
  - Loads `getEvidence(200)`, shows `AwsEvidenceTable`, “Updated &lt;time&gt;” and Refresh. Listens for `aws-collection-completed` and for “recent run in progress” (polls runs every 5s) to auto-refresh evidence when a run finishes.

- **Controls**: `controls/page.tsx` renders `AwsControlView`; `controls/[controlId]/page.tsx` is the detail view. `AwsControlView` lists controls, shows control detail and evidence, “Fetch AWS evidence”, manual evidence form; listens for `aws-collection-completed` to refresh coverage and selected control.

### 2.4 Shared components (under `components/aws/`)

- **aws-nav.tsx** — Top tab nav (Connect, Dashboard, Evidence, Controls).
- **aws-dashboard.tsx** — Hero card (“Compliance evidence at a glance”), “Fetch AWS evidence” button, “Run in progress…” text when fetching, error banner, KPI cards (runs, evidence count, controls with evidence), recent runs list, link to full run history.
- **aws-dashboard-skeleton.tsx** — Loading skeleton for dashboard.
- **aws-kpi-cards.tsx** — Cards for runs count, evidence count, controls with evidence.
- **aws-quick-links.tsx** — Links to Evidence, Controls.
- **aws-run-history.tsx** — Table of runs (time uses `ended_at ?? in_time ?? execution_time`), expand for details, delete run.
- **aws-evidence-table.tsx** — Table of evidence rows; “View content” opens modal.
- **aws-evidence-content-modal.tsx** — Modal showing evidence JSON content.
- **aws-control-view.tsx** — Controls list, control detail, evidence, fetch evidence, manual evidence; listens for `aws-collection-completed`.

### 2.5 API layer (`lib/aws-api.ts`)

- All requests go to `/api/v1/aws/...` via shared `api` client (auth token, base URL from env).
- **Connection**: `getAwsCredentials()`, `saveAwsConnect({ role_arn, region })`, `deleteAwsConnect()`, `testAwsCredentials()`.
- **Runs**: `getRuns(limit)`, `getRunDetail(runId)`, `deleteRun(runId)`, `fetchAwsEvidence()` (POST via proxy, 120_000 ms timeout).
- **Evidence**: `getEvidence(limit)`, `getEvidenceContent(evidenceId)`.
- **Controls**: `getControls()`, `getControl(controlId)`, `getControlsCoverage()`, `submitManualEvidence(body)`.
- Types: `AwsRun` (run_id, execution_time, in_time, ended_at, status, evidence_count, …), `AwsEvidenceRow`, `AwsControl`, `AwsControlDetail`, `RunDetail`.
- “Last collected” and run list times use **ended_at** when available, else in_time/execution_time.

### 2.6 Cross-page events

- **`aws-connection-changed`** — Dispatched after successful Connect; layout listens and re-fetches `getAwsCredentials()` so nav appears without reload.
- **`aws-collection-completed`** — Dispatched when a collection run reaches a terminal status (or when timeout-recovery sees a recent completed run). Evidence page and Controls (AwsControlView) listen and refresh their data.

### 2.7 Styling

- Uses CSS variables: `--primary`, `--primary-hover`, `--foreground`, `--foreground-muted`, `--border`, `--surface`, `--card`, `--success`, `--danger`, `--warning`, `--muted`.
- No Tailwind theme; inline styles and utility classes. Connect page has a centered card with Cloud/Shield icons and gradient primary button.

---

## 3. Backend (summary)

- **Prefix**: `/aws` (e.g. under `/api/v1/aws`).
- **Auth/tenant**: JWT; tenant from user or `?tenant_id=` for platform admin. Dependency `get_effective_aws_tenant` returns tenant UUID for all AWS routes.
- **Key endpoints**:
  - **POST /aws/connect** — Body: `role_arn`, `region`. Backend uses fixed External ID (env `AWS_ASSUME_ROLE_EXTERNAL_ID`, default Swift-Audit), validates with STS AssumeRole, saves to `tenant_aws_config` (role_arn, external_id, region).
  - **DELETE /aws/connect** — Deletes tenant connection and all evidence/runs for that tenant.
  - **GET /aws/credentials** — Returns connection status (has_config, aws_region, aws_account_id, connection_type, role_arn, etc.) for the tenant.
  - **POST /aws/credentials/test** — Tests connection (GetCallerIdentity).
  - **GET /aws/runs** — List collector runs (ordered by coalesce(ended_at, execution_time) desc), with evidence counts; tenant-scoped.
  - **GET /aws/runs/{run_id}** — Run detail; tenant check.
  - **DELETE /aws/runs/{run_id}** — Delete run and its evidence; tenant check.
  - **POST /aws/runs/collect** — Starts evidence collection (long-running); creates run, runs collectors with tenant’s AssumeRole credentials, returns run_id and status. Often takes longer than client timeout.
  - **GET /aws/evidence** — List evidence rows; tenant-scoped.
  - **GET /aws/evidence/{evidence_id}/content** — Evidence JSON content.
  - **GET /aws/controls** — List controls (from evidence sufficiency matrix).
  - **GET /aws/controls/coverage** — Control IDs that have at least one evidence row.
  - **GET /aws/control/{control_id}** — Control detail with required evidence items, collected evidence, AWS APIs.
  - **POST /aws/evidence** — Create manual evidence (control_id, item_code, content, etc.).

- **Data**: Tenant AWS config (role_arn, external_id, region) and evidence/collector_runs live in DB; collection uses boto3 after AssumeRole with tenant’s saved role_arn and platform External ID.

---

## 4. Behaviors to preserve when improving

- Connect-only flow: Role ARN + Region only; no External ID or Trust Policy in the UI; nav hidden until connected; `aws-connection-changed` for nav update.
- Dashboard: Single “Fetch AWS evidence” action; polling by run_id until terminal status; on timeout, poll runs/evidence every 6s and clear error when a recent completed run appears; “Last collected” and run times use `ended_at` when available.
- Evidence and Controls pages auto-refresh on `aws-collection-completed`; Evidence also polls when a run is in progress so it updates when the run finishes.
- Tenant isolation: all API calls are tenant-scoped; layout and nav are the same for all tenant users; only listed roles can access the section.

---

## 5. What you can ask an AI to do

- Improve **UX/UI** (layout, hierarchy, loading states, empty states, error presentation, accessibility).
- Improve **copy** (labels, messages, tooltips).
- Add **feedback** (toasts, progress, “Last collected” prominence).
- Refine **responsive** behavior and **styling** (keep CSS variables; can suggest design tokens or small component library usage if desired).
- **Performance** (avoid unnecessary refetches, memoization, optimistic updates) without changing the backend contract.
- **Code structure** (extract hooks for polling, shared types, small presentational components) while keeping the same routes, layout, nav, and events.

Give this document plus your specific improvement goals (e.g. “improve the Connect page UX” or “make the Dashboard feel more dynamic”) to Claude so it has full context of how the AWS section is built end-to-end.
