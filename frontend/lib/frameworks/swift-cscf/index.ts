/**
 * SWIFT CSCF framework data: single entry point for domains, architectures,
 * approval ideology, evidence-review labels, and swift-systems.
 * Evidence item definitions (A1–H9, A5 criteria) live in ./evidence/*.ts —
 * import from "@/lib/frameworks/swift-cscf/evidence/a1-evidence" etc.
 */

export { DOMAIN_GRADIENTS, getDomainsForArchitecture } from "./domains";

export {
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitecture,
  getDiagramFolder,
  getArchitectureDiagramUrl,
  getArchitectureDiagramPath,
  getArchitectureDiagramUrlAsync,
} from "./architectures";

export { DOMAINS, DOMAIN_APPROVAL_ORDER, APPROVAL_IDEOLOGY_DESCRIPTION } from "./approval-ideology";

export {
  getEvidenceFieldLabel,
  getOrderedEvidenceKeys,
  getEvidenceTableColumnLabels,
} from "./evidence-review-labels";

export {
  SWIFT_SYSTEMS,
  ACCESS_POINTS,
  SWIFT_ZONES,
  REVIEW_QUARTERS,
  VENDORS,
  ARCHITECTURE_TYPES,
} from "./swift-systems";
