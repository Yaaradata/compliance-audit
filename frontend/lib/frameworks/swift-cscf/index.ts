/**
 * SWIFT CSCF framework data: domains, architectures, approval ideology, swift-systems.
 * Form definitions and labels come from the database (evidence_based_questions, form-metadata API).
 */

export { DOMAIN_GRADIENTS, getDomainsForArchitecture } from "./domains";

export {
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitecture,
  getArchitecturesForSchema,
  getDiagramFolder,
  getArchitectureDiagramUrl,
  getArchitectureDiagramPath,
  getArchitectureDiagramUrlAsync,
} from "./architectures";

export {
  ARCHITECTURE_VARIANTS,
  ARCHITECTURE_VARIANTS_V2025,
  ARCHITECTURE_VARIANTS_V2026,
  getArchitectureVariantsForSchema,
  type ArchitectureVariant,
} from "./architecture-variants";

export { DOMAINS, DOMAIN_APPROVAL_ORDER, APPROVAL_IDEOLOGY_DESCRIPTION } from "./approval-ideology";

export {
  SWIFT_SYSTEMS,
  ACCESS_POINTS,
  SWIFT_ZONES,
  REVIEW_QUARTERS,
  VENDORS,
  ARCHITECTURE_TYPES,
} from "./swift-systems";
