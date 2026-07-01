export type V5SourceTag =
  | "SOURCED"
  | "VERIFIED"
  | "ILLUSTRATIVE"
  | "ASSUMPTION"
  | "LION_VALIDATE"
  | "OPEN"
  | "PXTY";

export type V5ScreenId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

export type StreamStatus = "AGREE" | "MISMATCH";
export type NodeState = "AT_RISK" | "RECONCILED";
export type VarianceStatus = "AT_RISK" | "CLEARED";
export type QcStatus = "PASS" | "FAIL";
export type LicenceStatus = "VALID" | "EXPIRING" | "LAPSED";
export type LoadState = "CLEAR" | "FLAGGED" | "BLOCKED";
export type PostureStatus = "OK" | "ATTENTION" | "BREACH" | "NA";
export type RiskLevel = "HIGH" | "MED" | "LOW";
export type RiskTrend = "IMPROVING" | "WORSENING" | "STABLE";
export type KriStatus = "OK" | "WATCH";
export type ExceptionStatus = "OPEN" | "CURED";
export type EvidenceItemStatus = "CHECKED" | "PENDING";
export type AgeingSeverity = "LOW" | "MED" | "HIGH";

export interface KeystonePalette {
  bg: string;
  bgGrad: string;
  panel: string;
  panelAlt: string;
  raise: string;
  border: string;
  borderSoft: string;
  text: string;
  dim: string;
  faint: string;
  open: string;
  green: string;
  greenDim: string;
  greenEdge: string;
  amber: string;
  amberDim: string;
  amberEdge: string;
  red: string;
  redDim: string;
  redEdge: string;
  accent: string;
  accentDim: string;
  accentEdge: string;
  chipBg: string;
  onAccent: string;
}

export interface ReconStream {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  status: StreamStatus;
  src: string;
}

export interface AgeingBucket {
  bucket: string;
  amt: number;
  pct: number;
  sev: AgeingSeverity;
}

export interface DispatchLoad {
  id: string;
  date: string;
  value: number;
  pos: string;
  fl: string;
  status: LicenceStatus;
  state: LoadState;
  sltda: "NA" | "LAPSED";
}

export interface EvidencePackItem {
  id: string;
  label: string;
  from: V5ScreenId;
  status: EvidenceItemStatus;
  signedBy: string;
  ts: string;
  records: string[];
}

export interface RiskMatrixRow {
  id: string;
  category: string;
  catTag: V5SourceTag;
  domain: string;
  inherent: { i: RiskLevel; l: RiskLevel };
  control: string | null;
  residual: RiskLevel;
  mitigation: string;
  kri: {
    label: string;
    value: string;
    tag: V5SourceTag;
    status: KriStatus;
  } | null;
  trend: RiskTrend;
}

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
  tag: V5SourceTag;
}

export interface HeadlineMetric {
  key: string;
  label: string;
  value: string;
  tag: V5SourceTag;
  emphasis: "PRIMARY" | "SUPPORTING";
  note?: string;
}

export interface RollupItem {
  cell: string;
  label: string;
  severity: "HIGH" | "MED";
}

export interface KeystoneDataV5 {
  company: {
    exciseBase: { amount: number; unit: string; tag: V5SourceTag };
    penaltyPct: { value: number; tag: V5SourceTag };
    totalTaxes: { amount: number; unit: string; tag: V5SourceTag };
    fy2026Revenue: { amount: number; unit: string; tag: V5SourceTag };
    capacityHL: { low: number; high: number; unit: string; tag: V5SourceTag };
    exposureBand: { low: number; high: number; unit: string; tag: V5SourceTag };
  };
  reconciliation: {
    streams: ReconStream[];
    nodeState: NodeState;
    expectedDuty: number;
    variance: {
      amount: number;
      unit: string;
      status: VarianceStatus;
      unaccounted: number;
      tag: V5SourceTag;
      rootCause: string;
    };
    detection: { value: string; tag: V5SourceTag };
  };
  batch: {
    id: string;
    src: string;
    panel: [string, QcStatus][];
    abv: { lab: number; label: number; excise: number; delta: number; tag: V5SourceTag };
    dutyAtStake: { amount: number; unit: string; tag: V5SourceTag; basis: string };
  };
  receivables: {
    fy2025: number;
    fy2026: number;
    trend: "IMPROVING";
    yoyPct: number;
    badDebt: number;
    badDebtPctOfBook: number;
    creditDays: number | null;
    eclAgeing: V5SourceTag;
    distributorPoints: { low: number; high: number; tag: V5SourceTag };
    ageing: AgeingBucket[];
    src: string;
  };
  loads: DispatchLoad[];
  riskMatrix: {
    rows: RiskMatrixRow[];
    escalation: { steps: string[]; tag: V5SourceTag };
  };
  complianceExceptions: ComplianceException[];
  boardReport: {
    sectionOrder: string[];
    committees: {
      id: string;
      name: string;
      remit: string;
      remitTag: V5SourceTag;
      composition: string[];
      meetingCount: null;
    }[];
    complianceTable: { ruleRef: string; requirement: string; exceptionRef: string }[];
    assurance: { companiesAct: string; thanks: string; tag: V5SourceTag };
  };
  evidence: Record<string, EvidencePackItem[]>;
  posture: Record<string, PostureStatus>;
  headlineMetrics: HeadlineMetric[];
}
