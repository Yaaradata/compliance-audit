import type { LucideIcon } from "lucide-react";
import type { FailureMechanism } from "./signals/types";

/** Domain codes as they appear in the source CSV (Domain_Code column). */
export type UkProcessAuditDomainId =
  | "ONB"
  | "DEP"
  | "CMP"
  | "FC"
  | "FRD"
  | "LEN"
  | "COL"
  | "PAY";

export type UkProcessAuditTabId = "overview" | UkProcessAuditDomainId;

export type UkControlNature = "Preventive" | "Detective" | "Corrective";
export type UkControlSource = "Internal" | "External";
export type UkAutomationLevel = "Automated" | "Semi-automated" | "Manual";
export type UkControlStatus = "effective" | "needs-attention" | "deficient" | "not-tested";
export type UkResidualRisk = "Critical" | "High" | "Medium" | "Low";

/** One row of the source CSV, typed. */
export interface UkRawControlRow {
  domain: string;
  domainCode: UkProcessAuditDomainId;
  stepNo: number;
  sopStep: string;
  riskId: string;
  riskStatement: string;
  controlId: string;
  controlDescription: string;
  controlNature: UkControlNature;
  controlSource: UkControlSource;
  automationLevel: UkAutomationLevel;
  primaryObligation: string;
  issuingBody: string;
  evidenceType: string;
  evidenceSourceSystem: string;
  testingFrequency: string;
  controlOwnerRole: string;
  failureMechanismTags: FailureMechanism[];
}

/** CSV row enriched with the derived audit-test metrics used by the dashboard. */
export interface UkAuditControl extends UkRawControlRow {
  population: number;
  sample: number;
  exceptions: number;
  violations: number;
  compliance: number;
  status: UkControlStatus;
  residualRisk: UkResidualRisk;
  lastTested: string;
  tester: string;
}

export interface UkProcessAuditDomainDef {
  id: UkProcessAuditTabId;
  label: string;
  icon: LucideIcon;
  color: string;
}

/** Per-domain roll-up powering the overview risk cards. */
export interface UkDomainAuditCard {
  id: UkProcessAuditDomainId;
  domain: string;
  owner: string;
  controls: number;
  tested: number;
  compliance: number;
  exceptions: number;
  violations: number;
  overdueRemediation: number;
  residualRisk: UkResidualRisk;
  topIssue: string;
  action: string;
}

/** SOP step + the control that mitigates it (1:1 in this dataset). */
export interface UkSopStep {
  stepNo: number;
  sopStep: string;
  control: UkAuditControl;
}

// ---------------------------------------------------------------------------
// Journey / process-flow model (mirrors Indian Process Audit v3 domain screens)
// ---------------------------------------------------------------------------

export interface UkStageOwner {
  role: string;
  team: string;
  submits: string;
}

export interface UkSopStageDef {
  id: string;
  no: number;
  name: string;
  description: string;
  header: string;
  owner: UkStageOwner;
  controlIds: string[];
}

export interface UkDomainSop {
  name: string;
  purpose: string;
  stages: UkSopStageDef[];
}

export type UkTrailStatus = "accepted" | "rejected" | "pending" | "blocked";
export type UkControlResult = "pass" | "fail" | "pending" | "not-started";
export type UkCaseOverall = "compliant" | "pending" | "failure";

export interface UkSubmitter {
  name: string;
  empId: string;
}

export interface UkEvidenceItem {
  name: string;
  type: string;
}

export interface UkCaseTrailItem {
  stage: UkSopStageDef;
  status: UkTrailStatus;
  submittedBy: UkSubmitter | null;
  submittedAt: string | null;
  evidenceItems: UkEvidenceItem[];
  controlResults: Record<string, UkControlResult>;
}

export interface UkJourneyCase {
  id: string;
  subject: string;
  segment: string;
  opened: string;
  overallStatus: UkCaseOverall;
  journeyException: string | null;
  failControlId: string | null;
  trail: UkCaseTrailItem[];
}

export interface UkDomainEntity {
  singular: string;
  plural: string;
  entity: string;
}

// ---------------------------------------------------------------------------
// Evidence pack (drawer)
// ---------------------------------------------------------------------------

export interface UkEvidenceExceptionRow {
  ref: string;
  detail: string;
  severity: UkResidualRisk;
  sla: "Within SLA" | "Breached";
  action: string;
}

export interface UkEvidenceSourceSystem {
  name: string;
  record: string;
}

export interface UkEvidenceDocument {
  name: string;
  type: string;
  size: string;
}

export interface UkEvidenceStageSubmitter {
  sopName: string;
  stage: UkSopStageDef;
}

export interface UkEvidenceCaseTrail {
  kase: UkJourneyCase;
  hit: UkCaseTrailItem;
}

export interface UkEvidencePack {
  control: UkAuditControl;
  domainLabel: string;
  lastTested: string;
  tester: string;
  testingSteps: string[];
  exceptionLog: UkEvidenceExceptionRow[];
  sourceSystems: UkEvidenceSourceSystem[];
  documents: UkEvidenceDocument[];
  auditorNote: string;
  mgmtResponse: string;
  stageSubmitters: UkEvidenceStageSubmitter[];
  sampleCaseTrails: UkEvidenceCaseTrail[];
}

export interface UkProcessAuditOverview {
  totalControls: number;
  totalDomains: number;
  avgCompliance: number;
  openExceptions: number;
  criticalFindings: number;
  automatedPct: number;
  preventivePct: number;
  lastAuditCycle: string;
  posture: UkResidualRisk;
}

export interface UkProcessAuditSnapshot {
  overview: UkProcessAuditOverview;
  /** Includes the synthetic "overview" tab as the first entry. */
  domains: UkProcessAuditDomainDef[];
  domainMeta: Record<UkProcessAuditDomainId, UkProcessAuditDomainDef>;
  controlsByDomain: Record<UkProcessAuditDomainId, UkAuditControl[]>;
  sopByDomain: Record<UkProcessAuditDomainId, UkDomainSop>;
  casesByDomain: Record<UkProcessAuditDomainId, UkJourneyCase[]>;
  entityByDomain: Record<UkProcessAuditDomainId, UkDomainEntity>;
  journeyTitleByDomain: Record<UkProcessAuditDomainId, string>;
  controlExceptionLabelById: Record<string, string>;
  domainCards: UkDomainAuditCard[];
}
