/**
 * SWIFT CSCF framework: domain evidence workspace and re-exports for approval, dashboard, review, data.
 * Used when cycle schema_name is swift_2025 or swift_2026.
 * Do not add SOC 2–specific code here to avoid merge conflicts.
 */

export { EvidenceWorkspace } from "./components/domain/dashboard/evidence-workspace";

export {
  ApprovalEvidenceViewer,
  ApprovalJourneyTimeline,
  type TimelineStepState,
  type ApprovalJourneyStep,
} from "./components/approval";

export { DomainCard, OverallProgress, ControlHeatmap } from "./components/dashboard";

export { InlineEvidenceDetail, EvidenceDetailModal, ReviewTable, ReviewPreview } from "./components/review";

export {
  DOMAINS,
  DOMAIN_GRADIENTS,
  getDomainsForArchitecture,
  ARCHITECTURES,
  ARCHITECTURE_DIAGRAMS,
  getArchitecture,
  getDiagramFolder,
  getArchitectureDiagramUrl,
  getArchitectureDiagramPath,
  getArchitectureDiagramUrlAsync,
  getEvidenceFieldLabel,
  getOrderedEvidenceKeys,
  getEvidenceTableColumnLabels,
  DOMAIN_APPROVAL_ORDER,
  APPROVAL_IDEOLOGY_DESCRIPTION,
} from "./data";
