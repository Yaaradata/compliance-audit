# SWIFT CSCF Framework

UI and data for **SWIFT Customer Security Control Framework** (v2025, v2026). Used when the assessment cycle’s `schema_name` is `swift_2025` or `swift_2026`.

## File structure

```
swift-cscf/
├── README.md                           (this file)
├── index.ts                            (main entry: EvidenceWorkspace + re-exports)
├── components/
│   ├── approval/
│   │   └── index.ts                    (re-exports: ApprovalEvidenceViewer, ApprovalJourneyTimeline)
│   ├── dashboard/
│   │   └── index.ts                    (re-exports: DomainCard, OverallProgress, ControlHeatmap)
│   ├── domain/
│   │   └── dashboard/
│   │       └── evidence-workspace.tsx   (SWIFT-specific: A1–H9 forms, uploads, evaluation)
│   └── review/
│       └── index.ts                    (re-exports: EvidenceDetailModal, ReviewTable, ReviewPreview)
├── data/
│   └── index.ts                        (re-exports: domains, architectures, evidence-review-labels, approval-ideology)
└── pages/
    └── README.md                       (doc: cycle pages live in app/(main)/cycles/...)
```

## What lives where

| Folder / file | Purpose |
|----------------|--------|
| **components/domain/dashboard/evidence-workspace.tsx** | Only SWIFT-specific implementation here. Renders A1, A5, B1–B8, C1–H9 evidence forms and per-control evidence. Loaded by the framework registry when `schema_name` is swift_2025/swift_2026. |
| **components/approval/** | Re-exports shared approval components. Override with SWIFT-specific approval UI here if needed. |
| **components/dashboard/** | Re-exports shared dashboard components (domain cards, progress, heatmap). Override here if needed. |
| **components/review/** | Re-exports shared review components (evidence viewer, review table). Override here if needed. |
| **data/** | Re-exports SWIFT domains, architectures, evidence-review labels, approval ideology from `@/lib/data`. Evidence item definitions (a1-evidence.ts, b1-evidence.ts, …) stay in `@/lib/data` and are used by the evidence workspace. |
| **pages/** | Cycle routes live in `app/(main)/cycles/`. This folder is for future SWIFT-specific page wrappers or docs. |

## Importing

- **Evidence workspace**: Loaded via `lib/frameworks/registry.ts` by schema; pages don’t import it directly.
- **Approval / dashboard / review**: Use `@/components/frameworks/swift-cscf` for a single SWIFT entry point, or keep using `@/components/approval`, `@/components/dashboard`, `@/components/review` (same components).

Example:

```ts
import { DomainCard, OverallProgress } from "@/components/frameworks/swift-cscf/components/dashboard";
import { DOMAINS, getDomainsForArchitecture } from "@/components/frameworks/swift-cscf/data";
```
