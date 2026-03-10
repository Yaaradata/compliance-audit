/**
 * SWIFT CSCF reference data. Re-exports from @/lib/data so all SWIFT data has a single entry point.
 * Evidence item definitions (a1-evidence, b1-evidence, c1-evidence, ... h9-evidence, a5-criteria)
 * and related files remain in @/lib/data and are used by the SWIFT evidence workspace.
 */

export {
  DOMAINS,
  DOMAIN_GRADIENTS,
  getDomainsForArchitecture,
} from "@/lib/data/domains";

export {
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitecture,
  getDiagramFolder,
  getArchitectureDiagramUrl,
  getArchitectureDiagramPath,
  getArchitectureDiagramUrlAsync,
} from "@/lib/data/architectures";

export {
  getEvidenceFieldLabel,
  getOrderedEvidenceKeys,
  getEvidenceTableColumnLabels,
} from "@/lib/data/evidence-review-labels";

export {
  DOMAIN_APPROVAL_ORDER,
  APPROVAL_IDEOLOGY_DESCRIPTION,
} from "@/lib/data/approval-ideology";
