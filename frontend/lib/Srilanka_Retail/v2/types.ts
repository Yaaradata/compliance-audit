/**
 * Keystone v2 — Lion Brewery (Ceylon) PLC.
 * Extends the v1 contract with receivables, risk matrix, compliance exceptions,
 * and board-report data. Every scalar carries provenance via sourceTag.
 */

import type {
  Batch,
  CommitteeRollup,
  Control,
  DispatchLoad,
  EvidencePack,
  HeadlineMetric,
  Money,
  Range,
  Reconciliation,
  Regulator,
  Tagged,
  TaggedRange,
} from "../types";

export type V2SourceTag =
  | "SOURCED"
  | "VERIFIED"
  | "ILLUSTRATIVE"
  | "ASSUMPTION"
  | "LION_VALIDATE"
  | "OPEN"
  | "PXTY";

export interface V2Company {
  id: string;
  name: string;
  exciseBase: Tagged<Money>;
  dutyPenaltyPct: Tagged<number>;
  totalTaxes: Tagged<Money>;
  fy2026Revenue: Tagged<Money>;
  capacityHL: TaggedRange;
  posCount: TaggedRange;
  exposureBand: TaggedRange;
}

export interface DataSource {
  label: string;
  state: string;
  managed: boolean;
}

export interface Receivables {
  fy2025: number;
  fy2026: number;
  trend: "IMPROVING" | "WORSENING" | "STABLE";
  badDebt: number;
  creditDays: number | null;
  eclAgeing: V2SourceTag;
  distributorPoints: TaggedRange;
  src: string;
}

export type RiskLevel = "HIGH" | "MED" | "LOW";
export type KriStatus = "OK" | "WATCH";
export type RiskTrend = "IMPROVING" | "WORSENING" | "STABLE";

export interface RiskKri {
  label: string;
  value: string;
  tag: V2SourceTag;
  status: KriStatus;
}

export interface RiskMatrixRow {
  id: string;
  category: string;
  catTag: V2SourceTag;
  domain: string;
  inherent: { i: RiskLevel; l: RiskLevel };
  control: string | null;
  residual: RiskLevel;
  mitigation: string;
  kri: RiskKri | null;
  trend: RiskTrend;
}

export interface RiskMatrix {
  rows: RiskMatrixRow[];
  escalation: { steps: string[]; tag: V2SourceTag };
}

export type ExceptionStatus = "OPEN" | "CURED";

export interface ComplianceException {
  id: string;
  ruleRef: string;
  title: string;
  gap: string;
  disclosureRef: string;
  cure: string;
  status: ExceptionStatus;
  raisedOn: string;
  curedOn: string;
  tag: V2SourceTag;
}

export interface BoardCommittee {
  id: string;
  name: string;
  remit: string;
  remitTag: V2SourceTag;
  composition: string[];
  meetingCount: number | null;
}

export interface BoardReport {
  sectionOrder: string[];
  committees: BoardCommittee[];
  complianceTable: { ruleRef: string; requirement: string; exceptionRef: string }[];
  assurance: { companiesAct: string; thanks: string; tag: V2SourceTag };
}

export type PostureStatusV2 = "OK" | "ATTENTION" | "BREACH" | "NA";

export interface PostureCellV2 {
  id: string;
  regulatorId: string;
  controlId: string;
  status: PostureStatusV2;
}

export interface V2Batch extends Batch {
  dataSource: string;
}

export interface KeystoneDataV2 {
  company: V2Company;
  periods: { id: string; label: string; current: boolean }[];
  reconciliation: Reconciliation;
  batch: V2Batch;
  dispatchLoads: DispatchLoad[];
  regulators: Regulator[];
  controls: Control[];
  postureGrid: PostureCellV2[];
  evidencePacks: EvidencePack[];
  headlineMetrics: HeadlineMetric[];
  committeeRollup: CommitteeRollup;
  dataSources: Record<string, DataSource>;
  receivables: Receivables;
  riskMatrix: RiskMatrix;
  complianceExceptions: ComplianceException[];
  boardReport: BoardReport;
}

export interface KeystoneStoreV2 extends KeystoneDataV2 {
  resetDemo: () => void;
  reconcileVariance: () => void;
}

export type KeystoneScreenIdV2 = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

export function isTaggedRange(
  v: HeadlineMetric["value"],
): v is TaggedRange {
  return (v as TaggedRange).range !== undefined;
}
