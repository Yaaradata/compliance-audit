# Framework-specific UI

This folder holds **one subfolder per compliance framework**. The app loads the right components based on the cycle’s `schema_name` from the backend (see `frontend/lib/frameworks/registry.ts`).

## Why it’s structured this way

- **Dashboard, review, and approval** are rendered from shared code:
  - `app/(main)/cycles/[cycleId]/dashboard/page.tsx` → `components/dashboard/`
  - `app/(main)/cycles/[cycleId]/review/` → `components/review/`
  - `app/(main)/cycles/[cycleId]/approval/page.tsx` → `components/approval/`
- **Domain evidence workspace** (the big form/upload UI per evidence item) is **framework-specific**. The shared layout (`components/domain/dashboard/domain-workspace-layout.tsx`) receives `schemaName` and renders the workspace from:
  - **SWIFT CSCF** → `frameworks/swift-cscf/components/domain/dashboard/evidence-workspace.tsx`
  - **SOC 2** → `frameworks/soc2/components/domain/dashboard/evidence-workspace.tsx`

So:

- **SWIFT** work stays under `swift-cscf/` (A1–H9 forms, SWIFT data).
- **SOC 2** work stays under `soc2/` (generic or SOC 2–specific forms).
- The **only** place that knows about both is `lib/frameworks/registry.ts`. When adding a new framework, add one registration line there and implement the workspace under `frameworks/<name>/`.

## Folders

| Folder        | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| `swift-cscf/` | SWIFT CSCF v2025/v2026. Has **domain/evidence-workspace** (A1–H9) plus **approval**, **dashboard**, **review** (re-exports), **data** (re-exports), **pages** (docs). See `swift-cscf/README.md` for full structure. |
| `soc2/`       | SOC 2: generic evidence workspace (extend with SOC 2–specific forms).     |

Under **swift-cscf**, `components/approval`, `components/dashboard`, and `components/review` re-export the shared components so SWIFT has one entry point; you can replace them with framework-specific implementations later. **data** re-exports domains, architectures, evidence-review-labels, approval-ideology. **pages** documents that cycle routes live in `app/(main)/cycles/`.
