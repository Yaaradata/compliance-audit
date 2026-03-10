# Pages (SWIFT CSCF)

Cycle pages (dashboard, domains, review, approval) live in the app router:

- `app/(main)/cycles/[cycleId]/dashboard/page.tsx`
- `app/(main)/cycles/[cycleId]/domains/[domainId]/page.tsx`
- `app/(main)/cycles/[cycleId]/review/page.tsx`
- `app/(main)/cycles/[cycleId]/approval/page.tsx`

They are shared across frameworks and use the cycle’s `schema_name` to load the correct evidence workspace. Framework-specific page wrappers or layout overrides can be added in this folder if needed (e.g. a SWIFT-only step or redirect).
