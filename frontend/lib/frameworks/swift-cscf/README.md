# SWIFT CSCF — lib data

All SWIFT CSCF–specific reference data lives here. Use it from pages and components via:

- **Single entry:** `import { getDomainsForArchitecture, DOMAINS, getArchitecture } from "@/lib/frameworks/swift-cscf"`
- **Evidence items:** `import { A1_EVIDENCE_ITEM_ID } from "@/lib/frameworks/swift-cscf/evidence/a1-evidence"` (and same for a2–h9, a5-criteria)

## Structure

| File / folder | Purpose |
|---------------|--------|
| `domains.ts` | DOMAINS (A–H), DOMAIN_GRADIENTS, getDomainsForArchitecture |
| `architectures.ts` | ARCHITECTURES, diagram helpers, getArchitecture, getArchitectureDiagramUrl |
| `approval-ideology.ts` | DOMAIN_APPROVAL_ORDER, APPROVAL_IDEOLOGY_DESCRIPTION, re-exports DOMAINS |
| `evidence-review-labels.ts` | getEvidenceFieldLabel, getOrderedEvidenceKeys, getEvidenceTableColumnLabels (uses evidence/a2-evidence) |
| `swift-systems.ts` | SWIFT_SYSTEMS, ACCESS_POINTS, SWIFT_ZONES, VENDORS, ARCHITECTURE_TYPES |
| `evidence/*.ts` | Per–evidence item constants and field definitions (a1-evidence … h9-evidence, a5-criteria) |
| `index.ts` | Re-exports the above (not evidence/*; import those by path) |

Shared app types stay in `@/lib/types`. Roles, controls, report-sections, review-items remain in `@/lib/data` for framework-agnostic use.
