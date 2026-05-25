/** Compliance & audit page model — mirrors banking ControlsAuditView for OEM Scope 3. */

export interface AutoAuditFinding {
  id: string;
  source: "Control test" | "Regulatory" | "Evidence" | "Assurance";
  severity: "High" | "Medium" | "Low";
  title: string;
  detail: string;
  owner: string;
  targetDate: string;
  status: "Open" | "In progress" | "Closed";
  linkedControlId?: string;
}

export interface AutoAuditorQuery {
  id: string;
  subject: string;
  askedBy: string;
  assignee: string;
  status: "Open" | "Answered";
  dueDate?: string;
}

export interface AutoComplianceAuditSupplement {
  pcfCoverageLadder: { band: string; pct: number }[];
  openFindings: AutoAuditFinding[];
  auditorQueries: AutoAuditorQuery[];
}

export type ComplianceSupplierStatus = "Verified" | "Partial Data" | "Non-Disclosed" | "Inconsistent";
export type ComplianceDataQualityTier = "High" | "Med" | "Low" | "None";

export interface ComplianceSupplierRow {
  id: string;
  name: string;
  component: string;
  componentTone: "battery" | "metals" | "electronics" | "logistics" | "chemicals" | "default";
  spendINRCr: number;
  scope3EmissionsLabel: string;
  scope3EmissionsTone: "default" | "warn" | "danger";
  sharePct: number | null;
  dataQualityTier: ComplianceDataQualityTier;
  dataQualityScore: number;
  source: string;
  sourceTone: "default" | "danger";
  status: ComplianceSupplierStatus;
  flagged: boolean;
}

export interface ComplianceSupplierSummary {
  verified: number;
  partialEstimated: number;
  nonDisclosed: number;
  total: number;
}

export interface BrsrDisclosureCategoryRow {
  id: string;
  label: string;
  pct: number;
  status: "met" | "partial" | "not_met";
  brsrPrinciple?: string;
  dataOwner?: string;
}

export interface BrsrPriorityActionRow {
  id: string;
  severity: "Critical" | "High" | "Medium";
  title: string;
  detail: string;
  owner?: string;
  targetDate?: string;
}

export interface Scope3ControlChecklistRow {
  id: string;
  categoryLabel: string;
  title: string;
  description: string;
  status: "Effective" | "Needs Review" | "Ineffective";
  owner?: string;
  lastTested?: string;
  linkedControlId?: string;
}

export interface ComplianceAuditLogRow {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  detail: string;
  tag: string;
  tagTone: "blue" | "orange" | "green" | "red";
}

export interface ComplianceExceptionRow {
  id: string;
  issue: string;
  owner: string;
  due: string;
  status: "Critical" | "High" | "In Progress";
  linkedControlId?: string;
  linkedFindingId?: string;
}

export interface DataConfidenceCategoryRow {
  id: string;
  shortLabel: string;
  confidencePct: number;
  barTone: "blue" | "orange" | "red" | "green";
  pcfTierScore?: number;
  categoryCode?: string;
}

export interface CompliancePageKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: "positive" | "negative" | "neutral" | "warn";
}

export interface ComplianceLineageStep {
  step: string;
  source: string;
  owner: string;
  updated: string;
  status: "Verified" | "Estimated" | "Missing" | "Flagged";
}

export interface ComplianceEvidenceArtifact {
  name: string;
  status: "Available" | "In Preparation" | "Missing";
  docType: string;
}

export interface ComplianceSupplierDrill {
  supplierId: string;
  contractType: string;
  validity: string;
  esgRating: string;
  pcfScore: number;
  pcfMethod: string;
  brsrDisclosed: boolean;
  sbtiCommitted: boolean;
  engagement: string;
  redFlags: string;
  attributedTCO2e: number;
  cradleToGateTCO2e: number;
  priorYearAttributed?: number;
  variancePct?: number;
  ratingAgency: string;
  dataLineage: ComplianceLineageStep[];
  evidenceArtifacts: ComplianceEvidenceArtifact[];
  auditNotes: string[];
  remediationSteps: string[];
  linkedControlIds: string[];
  assuranceStatus: string;
}

export interface BrsrCategoryDrill {
  brsrPrinciple: string;
  regulatoryRef: string;
  dataOwner: string;
  completenessPct: number;
  gaps: string[];
  evidenceRequired: string[];
  actions: string[];
  linkedReports: string[];
  assuranceNote: string;
}

export interface ControlChecklistDrill {
  controlObjective: string;
  testProcedure: string;
  lastTested: string;
  tester: string;
  owner: string;
  frameworks: string[];
  findings: string[];
  evidenceLinks: string[];
  remediationPlan: string;
  nextReview: string;
}

export interface AuditLogDrill {
  eventType: string;
  systemRef: string;
  beforeValue?: string;
  afterValue?: string;
  impactedEntities: string[];
  approver?: string;
  relatedControlIds: string[];
  followUpActions: string[];
}

export interface ExceptionDrill {
  rootCause: string;
  impact: string;
  remediationSteps: { step: string; owner: string; due: string; done: boolean }[];
  linkedSupplierIds: string[];
  linkedControlIds: string[];
  escalationPath: string;
  boardVisibility: boolean;
}

export interface DataConfidenceDrill {
  categoryCode: string;
  methodology: string;
  pcfScoreDistribution: { score: number; pct: number }[];
  primaryDataPct: number;
  estimatedPct: number;
  missingPct: number;
  sourceSystems: string[];
  lastRefresh: string;
  versionHistory: { version: string; date: string; change: string }[];
  anomalies: string[];
}

export interface BrsrActionDrill {
  severity: string;
  owner: string;
  targetDate: string;
  regulatoryDriver: string;
  dependencies: string[];
  milestones: { label: string; date: string; status: "Done" | "Pending" | "Overdue" }[];
  linkedExceptions: string[];
}

export interface ComplianceAuditDrills {
  suppliers: Record<string, ComplianceSupplierDrill>;
  brsrCategories: Record<string, BrsrCategoryDrill>;
  controlChecklist: Record<string, ControlChecklistDrill>;
  auditLog: Record<string, AuditLogDrill>;
  exceptions: Record<string, ExceptionDrill>;
  dataConfidence: Record<string, DataConfidenceDrill>;
  brsrActions: Record<string, BrsrActionDrill>;
  pageKpis: Record<string, { summary: string; bullets: string[] }>;
}

export interface AutoComplianceAuditPage {
  pageKpis: CompliancePageKpi[];
  suppliers: ComplianceSupplierRow[];
  supplierSummary: ComplianceSupplierSummary;
  brsrCategories: BrsrDisclosureCategoryRow[];
  brsrOverallScore: number;
  brsrStatusLabel: string;
  brsrSummary: string;
  brsrCounts: { fullyMet: number; partial: number; notMet: number };
  brsrPriorityActions: BrsrPriorityActionRow[];
  controlChecklist: Scope3ControlChecklistRow[];
  controlChecklistSummary: { effective: number; needsReview: number; ineffective: number };
  auditLog: ComplianceAuditLogRow[];
  exceptions: ComplianceExceptionRow[];
  dataConfidence: DataConfidenceCategoryRow[];
  drills: ComplianceAuditDrills;
  openFindingsCount: number;
  openAuditorQueriesCount: number;
  pcfCoverageLadder: { band: string; pct: number }[];
}
