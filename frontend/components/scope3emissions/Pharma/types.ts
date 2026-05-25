export type PersonaId =
  | "procurement_gm"
  | "esg_manager"
  | "supplier_contact"
  | "third_party_auditor"
  | "board_cxo";

export type NavViewId =
  | "executive"
  | "suppliers"
  | "categories"
  | "ghg_gases"
  | "controls_audit"
  | "submitted_evidences"
  | "ai_insights"
  | "reports"
  | "supplier_portal";

/** IPCC AR5–style species buckets used for Scope 3 CO₂e disaggregation (inventory illustrative splits). */
export type GhgGasCode = "CO2" | "CH4" | "N2O" | "HFCS" | "OTHER";

export interface GhgGasSpeciesRollup {
  code: GhgGasCode;
  label: string;
  formula: string;
  tCO2e: number;
  pctOfScope3: number;
  ar5Note: string;
}

export interface GhgGasCategorySlice {
  scope3CategoryId: number;
  tCO2eByGas: Record<GhgGasCode, number>;
}

export interface GhgGasSupplierSlice {
  supplierId: string;
  tCO2eByGas: Record<GhgGasCode, number>;
}

export interface GhgGasNarrativeInsight {
  id: string;
  headline: string;
  body: string;
  gasCodes: GhgGasCode[];
  relatedInsightIds: string[];
  scope3CategoryIds: number[];
}

export interface GhgGasInventoryBlock {
  gwpStandardLabel: string;
  boundaryNote: string;
  speciesRollup: GhgGasSpeciesRollup[];
  categorySlices: GhgGasCategorySlice[];
  supplierSlices: GhgGasSupplierSlice[];
  narrativeInsights: GhgGasNarrativeInsight[];
}

export type DataQualityTier = "Primary" | "Secondary" | "Spend-Based" | "Not Assessed";

export type RiskLevel = "Low" | "Medium" | "High";

/** GHG Protocol Category 1–8 tracking obligation for procurement governance (trigger engine output). */
export type Scope3RequiredLevel = "Yes" | "Partial" | "No";

/** Procurement follow-up intensity for Scope 3 data assurance. */
export type ProcurementPriorityLevel = "High" | "Medium" | "Low";

export type SubmissionStatus = "Verified" | "Submitted" | "Pending" | "Overdue";

export type ControlStatus = "Effective" | "Partially Effective" | "Deficient" | "Not Assessed";

export type CompliancePillStatus = "On Track" | "At Risk" | "Overdue";

export type InsightSeverity = "Critical" | "High" | "Medium" | "Low";

export type InsightCategory =
  | "Supplier Risk"
  | "Data Quality"
  | "Compliance Gap"
  | "Reduction Opportunity"
  | "Anomaly Detection"
  | "Procurement Intelligence";

export type InsightWorkflowState = "Open" | "Acknowledged" | "Assigned" | "Dismissed";

export type ReportStatus = "Ready" | "Incomplete";

export type StreamKind = "Upstream" | "Downstream";

/** Quick navigation from executive compliance widgets (persona-gated in the shell). */
export type ComplianceWorkbenchView = "ai_insights" | "reports" | "controls_audit";

export type ExecutiveQuickNav =
  | { kind: "category"; categoryId: number }
  | { kind: "supplier"; supplierName: string }
  /** Navigate within the Scope 3 shell (persona-gated in dashboard). */
  | { kind: "view"; view: NavViewId };

export interface CompanyProfile {
  legalName: string;
  shortName: string;
  sector: string;
  hq: string;
  /** Primary operating geography for this inventory (illustrative). */
  operatingCountry: string;
  brsrListed: boolean;
  sbtiCommitted: boolean;
  sbtiNearTermYear: number;
  listing: string;
  lastInventoryClose: string;
}

export interface Scope3CategoryRow {
  id: number;
  name: string;
  stream: StreamKind;
  tCO2e: number;
  pctOfTotal: number;
  dataQuality: DataQualityTier;
  supplierCount: number;
  yoyPct: number;
  topSupplier: string;
  methodologyNote: string;
  emissionFactorSummary: string;
  dataSources: string[];
  controlGaps: string[];
  brsrMapping: string;
}

/** Structured Scope 3 supplier risk / reputation view for procurement and assurance (illustrative scores). */
export interface Scope3SupplierEvaluation {
  vendorScore: number;
  materialScore: number;
  processScore: number;
  impactScore: number;
  /** Single 0–100 index combining dimensions for quick scorecard comparison (deterministic from seed inputs). */
  compositeIndex: number;
  overallRisk: InsightSeverity;
}

export interface SupplierRow {
  id: string;
  name: string;
  segment: string;
  /** Primary goods or services procured from this supplier (SKU family or service line). */
  productPurchased: string;
  annualSpendCr: number;
  scope3ContributionTCO2e: number;
  esgScore: number;
  dataQuality: DataQualityTier;
  submissionStatus: SubmissionStatus;
  brsrMapped: boolean;
  lastAssessed: string;
  risk: RiskLevel;
  primaryCategories: number[];
  dataGaps: string[];
  aiSuggestedActions: string[];
  scope3Required: Scope3RequiredLevel;
  procurementPriority: ProcurementPriorityLevel;
  scope3Evaluation: Scope3SupplierEvaluation;
}

/** Downstream customer / channel partner driving Scope 3 Categories 9–12 (and related) in the inventory (illustrative). */
export interface BuyerRow {
  id: string;
  name: string;
  segment: string;
  /** FY attributed net sales to this buyer (₹ Cr) — illustrative. */
  annualSalesCr: number;
  downstreamScope3TCO2e: number;
  /** How cooperative the buyer is on surveys, TMS samples, and use-phase data (0–100). */
  disclosureCooperationScore: number;
  dataQuality: DataQualityTier;
  collaborationStatus: SubmissionStatus;
  valueChainMapped: boolean;
  lastReviewed: string;
  risk: RiskLevel;
  primaryCategories: number[];
  dataGaps: string[];
  recommendedActions: string[];
}

export interface RfqVendorResponse {
  vendorName: string;
  scope3Score: number;
  dataQuality: DataQualityTier;
  verifiedPct: number;
  /** Supplier has a disclosure-ready evidence pack (BRSR / export consignment / PCF) for evaluation (illustrative). */
  evidencePackReady: boolean;
  notes: string;
}

export interface RfqLive {
  id: string;
  title: string;
  commodity: string;
  dueDate: string;
  responses: RfqVendorResponse[];
}

export interface ControlRegisterRow {
  controlId: string;
  description: string;
  /** GHG Protocol Scope 3 category coverage this control supports (for audit scoping). */
  scope3Categories?: string;
  /** Upstream suppliers in scope for this control (procurement ↔ governance link). */
  linkedSupplierIds?: string[];
  /** Numeric GHG Protocol Scope 3 category ids tied to the control test. */
  linkedCategoryIds?: number[];
  frameworks: string[];
  owner: string;
  frequency: string;
  lastTested: string;
  status: ControlStatus;
  evidenceLink: string;
}

export type EsgDataRequestFieldId = "emissions_data" | "certifications" | "energy_usage" | "lifecycle_data";

/** Buyer-initiated Scope 3 / ESG evidence request routed to supplier portal (workflow template). */
export interface EsgDataRequest {
  id: string;
  supplierId: string;
  supplierName: string;
  requestedFields: EsgDataRequestFieldId[];
  /** Free-text specifics from procurement / ESG (e.g. SKU, site, reporting period, file format). */
  requesterNote?: string;
  status: "Sent" | "Acknowledged" | "Partial response" | "Fulfilled";
  dueBy: string;
  createdAt: string;
}

export interface AuditDimension {
  key: string;
  label: string;
  score: number;
  status: "Strong" | "Adequate" | "Weak";
  missing: string;
  recommendedAction: string;
}

export interface RegulatoryItem {
  code: string;
  label: string;
  deadline: string;
  status: CompliancePillStatus;
  nextAction: string;
}

export interface AiInsight {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  detail: string;
  confidencePct: number;
  recommendedAction: string;
  linkedSupplier?: string;
  linkedCategoryId?: number;
  workflow: InsightWorkflowState;
  assignee?: string;
  dismissReason?: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  status: ReportStatus;
  missingFields?: string[];
  lastGenerated?: string;
  nextDeadline: string;
  previewBullets: string[];
}

export interface ReductionOpportunity {
  id: string;
  title: string;
  categoryId: number;
  estimatedSavingTCO2e: number;
  effort: "Low" | "Medium" | "High";
}

export interface AnomalyFlag {
  id: string;
  entity: string;
  metric: string;
  zScore: number;
  note: string;
}

export interface LineageStep {
  step: number;
  label: string;
  detail: string;
}

export interface TrendYearPoint {
  year: number;
  scope1: number;
  scope2: number;
  scope3: number;
  sbtiTarget: number;
}

/** Actionable compliance / assurance items surfaced on the executive view. */
export type ComplianceAlertTarget = "category" | "supplier" | "ai" | "reports" | "controls";

export interface ComplianceAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  due?: string;
  actionLabel: string;
  target: ComplianceAlertTarget;
  categoryId?: number;
  supplierName?: string;
}

/** Disclosure / inventory framing (illustrative until API-backed). */
export interface InventoryMeta {
  reportingYearLabel: string;
  methodologyVersion: string;
  organizationalBoundary: string;
  dataFreshnessNote?: string;
}

/** India export consignment queue (illustrative) — embedded emissions and evidence for domestic / export clearances. */
export interface ExportConsignmentRow {
  id: string;
  batchRef: string;
  product: string;
  cnCode: string;
  destination: string;
  status: "Complete" | "Evidence pending" | "Blocked";
  embeddedEmissionsTCO2e?: number;
  due: string;
}

/** How evidence entered the governed inventory (supplier vs internal vs assurance pack). */
export type EvidenceIntakeChannel =
  | "Supplier portal"
  | "Secure SFTP / data room"
  | "Email + checksum registry"
  | "Internal — ESG / Finance"
  | "Assurance PBC bundle";

/** Review status in the company’s evidence index (not the same as supplier ESG score). */
export type EvidenceReviewState =
  | "Indexed — accepted"
  | "Under review"
  | "Clarification requested"
  | "Superseded by resubmission";

export interface SubmittedEvidenceArtifact {
  fileName: string;
  format: "PDF" | "XLSX" | "CSV" | "XML" | "PNG" | "ZIP";
  /** Human-readable size for UI */
  sizeLabel: string;
  /** First 12 hex chars of SHA-256 for integrity cross-checks */
  sha256Prefix: string;
  /** One line on what the file contains (for reviewer triage). */
  contentSummary?: string;
  virusScan?: "Clean" | "Pending" | "N/A";
}

/**
 * A governed evidence package supporting Scope 3 inventory lines — aligned to GHG Protocol
 * data-quality expectations and internal control IDs where applicable.
 */
export interface SubmittedEvidenceRecord {
  id: string;
  title: string;
  submittedAt: string;
  /** When the evidence index recorded receipt (may trail supplier upload). */
  indexedAt: string;
  channel: EvidenceIntakeChannel;
  /** Legal entity that asserted the data (supplier or your org). */
  submitterOrg: string;
  submitterRole?: string;
  supplierId?: string;
  scope3CategoryIds: number[];
  linkedControlIds: string[];
  /** Where this package is cited (BRSR / CDP / internal workbook). */
  disclosureUse: string[];
  /** Highest data-quality tier this package is intended to support (GHG Protocol hierarchy). */
  intendedDataQualityTier: DataQualityTier;
  reviewState: EvidenceReviewState;
  reviewer?: string;
  reportingPeriodLabel: string;
  /** What the submitter claims the evidence demonstrates (one paragraph). */
  assertionSummary: string;
  /** What reviewers test against (sampling, scope, versioning). */
  verificationFocus: string;
  artifacts: SubmittedEvidenceArtifact[];
  /** Optional tie to `lineage` step id in inventory narrative. */
  lineageStep?: number;
  /** Optional link to an open ESG / Scope 3 data request. */
  linkedEsgRequestId?: string;
  /**
   * Deep assurance / inventory linkage — optional on raw payloads; merged in demo data
   * for richer drill-down (activity lines, sampling, retention, regulatory mapping).
   */
  drilldown?: SubmittedEvidenceDrilldown;
}

/** Extended fields for evidence package drill-down (assurance & ITGC style). */
export interface SubmittedEvidenceActivityRef {
  activityClass: string;
  inventoryJobId: string;
  /** Approximate tCO₂e in FY25 model run attributed to lines supported by this package */
  coveredTCO2eApprox?: number;
  gwpSet: string;
  emissionFactorRegistryVersion: string;
}

export interface SubmittedEvidenceSamplingPlan {
  populationDescription: string;
  sampleSizeRule: string;
  materialityNote?: string;
}

export interface SubmittedEvidenceVersionEvent {
  at: string;
  actor: string;
  event: string;
}

export interface SubmittedEvidenceLegalRetention {
  minRetentionYears: number;
  storageTier: string;
  jurisdictionNote: string;
}

export interface SubmittedEvidenceRegulatoryMap {
  instrument: string;
  clauseOrSection: string;
  relevance: string;
}

export interface SubmittedEvidenceAttestation {
  signerName: string;
  signerTitle: string;
  signedAt: string;
  scopeStatement: string;
}

export interface SubmittedEvidenceTechnicalContact {
  name: string;
  email: string;
  phone?: string;
}

export interface SubmittedEvidenceDrilldown {
  evidencePackageVersion: string;
  inventoryObjectLockId: string;
  calculationEngineJobPath: string;
  gwpStandard: string;
  emissionFactorRegistryVersion: string;
  boundaryAndPeriodNote: string;
  dataQualityRationale: string;
  activityLineRefs: SubmittedEvidenceActivityRef[];
  samplingPlan?: SubmittedEvidenceSamplingPlan;
  regulatoryCrosswalk: SubmittedEvidenceRegulatoryMap[];
  versionHistory: SubmittedEvidenceVersionEvent[];
  legalRetention: SubmittedEvidenceLegalRetention;
  attestations?: SubmittedEvidenceAttestation[];
  clarificationsRaised?: string[];
  /** Export consignment queue ids when evidence supports customs / DGFT pilot */
  relatedExportConsignmentIds?: string[];
  linkedAiInsightIds?: string[];
  relatedComplianceAlertIds?: string[];
  technicalContact?: SubmittedEvidenceTechnicalContact;
  supersededByEvidenceId?: string;
  supersedesEvidenceId?: string;
}

export interface Scope3MockData {
  company: CompanyProfile;
  /** Inventory boundary, methodology label, and demo disclaimer context. */
  inventoryMeta: InventoryMeta;
  executive: {
    totalScope3TCO2e: number;
    yoyScope3Pct: number;
    primaryDataCoveragePct: number;
    brsrReadinessPct: number;
    verifiedSuppliers: number;
    totalSuppliers: number;
    spendEsgCompliantPct: number;
    activeComplianceFlags: number;
  };
  regulatory: RegulatoryItem[];
  trend: TrendYearPoint[];
  scope3Categories: Scope3CategoryRow[];
  suppliers: SupplierRow[];
  buyers: BuyerRow[];
  rfq: RfqLive;
  controls: ControlRegisterRow[];
  auditReadiness: {
    overallPct: number;
    dimensions: AuditDimension[];
    quarterlyTrend: { quarter: string; score: number }[];
    dataTraceabilityPct: number;
    methodologyDocCompletenessPct: number;
  };
  aiInsights: AiInsight[];
  reports: ReportDefinition[];
  reductionOpportunities: ReductionOpportunity[];
  anomalies: AnomalyFlag[];
  lineage: LineageStep[];
  /** Outstanding Scope 3 / ESG data asks from procurement (shown on supplier portal when ids match). */
  pendingEsgRequests: EsgDataRequest[];
  /** Procurement GM–oriented AI signals (merged in AI view for that persona). */
  procurementGmInsights: AiInsight[];
  supplierPortal: {
    /** Portal tenant — aligns with `pendingEsgRequests` routing. */
    supplierId: string;
    supplierName: string;
    openTasks: { id: string; label: string; due: string; status: SubmissionStatus }[];
    recentSubmissions: { id: string; label: string; submittedAt: string; outcome: string }[];
  };
  /** Surfaced on dashboard; count should align with `executive.activeComplianceFlags` for narrative consistency. */
  complianceAlerts: ComplianceAlert[];
  exportConsignmentQueue: ExportConsignmentRow[];
  /** Registered supplier and internal submissions that underpin Scope 3 calculations and disclosures. */
  submittedEvidences: SubmittedEvidenceRecord[];
  /** CO₂e disaggregated by GHG species — reconciled to category lines (demo builder). */
  ghgGasInventory: GhgGasInventoryBlock;
}
