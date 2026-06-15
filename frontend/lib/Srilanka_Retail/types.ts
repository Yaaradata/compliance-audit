/**
 * Keystone — Lion Brewery (Ceylon) PLC prototype.
 *
 * Section 7.5 §C.1–C.2 type contract. These interfaces are the LOCKED data
 * contract for the demo: every domain value on screen is a `Tagged<T>` or
 * `TaggedRange` so that provenance (sourceTag) and OPEN-ness (range) travel
 * with the value and can never be dropped by a component.
 *
 * Strict types only — no `any`.
 */

// ── §C.1 Provenance + value wrappers ──────────────────────────────────────

/** Provenance registry (§C.4). Drives <SourceChip>; never hardcode the colour. */
export type SourceTag = "SOURCED" | "ASSUMPTION" | "ILLUSTRATIVE" | "OPEN";

export interface Money {
  amount: number;
  currency: string;
}

export interface Range {
  low: number;
  high: number;
}

/** A scalar value carrying its provenance. */
export interface Tagged<T> {
  value: T;
  sourceTag: SourceTag;
}

/** An OPEN value: renders as a range via <RangeValue>, never collapsed to a scalar. */
export interface TaggedRange {
  range: Range;
  sourceTag: SourceTag;
}

// ── LIVE vs PILOT (data state, never per-row styling) ─────────────────────

export type LiveState = "LIVE" | "PILOT_GATED";

export interface LiveRef {
  liveState: LiveState;
  /** Gap reference for pilot-gated affordances (e.g. "A9"). */
  gapRef?: string;
}

// ── §C.2 Entities ─────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  exciseBase: Tagged<Money>;
  dutyPenaltyPct: Tagged<number>;
  capacityHL: TaggedRange;
  posCount: TaggedRange;
  exposureBand: TaggedRange;
}

export interface Assumptions {
  discrepancyRate: TaggedRange;
  dutyRatePerUnit: Tagged<Money>;
  abvTolerancePct: Tagged<number>;
  fteLoadedCost: TaggedRange;
}

export interface Period {
  id: string;
  label: string;
  current: boolean;
}

export type StreamStatus = "AGREE" | "MISMATCH";

export interface ReconStream {
  key: string;
  label: string;
  value: Tagged<number | null>;
  unit: string;
  status: StreamStatus;
  liveSource: string;
}

export type NodeState = "AT_RISK" | "RECONCILED";
export type VarianceStatus = "AT_RISK" | "CLEARED";

export interface Variance {
  amount: Money;
  sourceTag: SourceTag;
  status: VarianceStatus;
  rootCause: string;
  unaccountedUnits: number;
}

export interface Reconciliation {
  periodId: string;
  streams: ReconStream[];
  expectedDuty: Tagged<Money>;
  nodeState: NodeState;
  variance: Variance;
  detectionLatency: Tagged<string>;
}

export type QcStatus = "PASS" | "FAIL";

export interface QcPanelItem {
  key: string;
  label: string;
  status: QcStatus;
}

export interface AbvTriple {
  lab: Tagged<number>;
  label: Tagged<number>;
  excise: Tagged<number>;
  reconciled: boolean;
  mismatchDelta: number;
}

export type GateState = "HELD" | "RELEASED";
export type HeldReason = "ABV_MISMATCH" | "NONE";

export interface Batch {
  id: string;
  qcPanel: QcPanelItem[];
  abv: AbvTriple;
  gateState: GateState;
  heldReason: HeldReason;
  liveState: LiveState;
  releaseEvidenceId: string;
}

export type LicenceStatus = "VALID" | "EXPIRING" | "LAPSED";
export type ChainStatus = "NA" | "LAPSED";

export interface DispatchLoad {
  id: string;
  posRef: string;
  flCategory: string;
  licenceStatus: LicenceStatus;
  sltdaChainStatus: ChainStatus;
  validateAlert: LiveRef;
  autoBlock: LiveRef;
}

export interface Regulator {
  id: string;
  key: string;
  label: string;
}

export interface Control {
  id: string;
  key: string;
  label: string;
}

export type PostureStatus = "OK" | "ATTENTION" | "BREACH";

export interface PostureCell {
  id: string;
  regulatorId: string;
  controlId: string;
  status: PostureStatus;
}

export type EvidenceSource = "C1" | "C2" | "C3";
export type EvidenceItemStatus = "CHECKED" | "PENDING";

export interface EvidencePackItem {
  id: string;
  regulatorId: string;
  label: string;
  derivedFrom: EvidenceSource;
  status: EvidenceItemStatus;
}

export type ReadyState = "READY" | "PREPARING";

export interface EvidencePack {
  regulatorId: string;
  items: EvidencePackItem[];
  readyState: ReadyState;
  prepBaseline: Tagged<string>;
}

export type MetricEmphasis = "PRIMARY" | "SUPPORTING";

export type HeadlineMetricValue = TaggedRange | Tagged<string | number>;

export interface HeadlineMetric {
  key: string;
  label: string;
  value: HeadlineMetricValue;
  emphasis: MetricEmphasis;
}

export type Severity = "HIGH" | "MEDIUM" | "LOW";

export interface CommitteeRollupItem {
  postureCellId: string;
  severity: Severity;
  label: string;
}

export interface CommitteeRollup {
  items: CommitteeRollupItem[];
  routedTo: string;
}

// ── Root dataset / store shape (§C.2) ─────────────────────────────────────

export interface KeystoneData {
  company: Company;
  assumptions: Assumptions;
  periods: Period[];
  reconciliation: Reconciliation;
  batch: Batch;
  dispatchLoads: DispatchLoad[];
  regulators: Regulator[];
  controls: Control[];
  postureGrid: PostureCell[];
  evidencePacks: EvidencePack[];
  headlineMetrics: HeadlineMetric[];
  committeeRollup: CommitteeRollup;
}

/** The single global store: seeded data + the one live action. */
export interface KeystoneStore extends KeystoneData {
  /** Restore the pre-reconcile boot snapshot. */
  resetDemo: () => void;
  /**
   * The one live interaction (§7.5 B.4). Performs EXACTLY the B.4 field
   * mutations and nothing else. exposureBand / headlineMetrics never mutate.
   */
  reconcileVariance: () => void;
}

// ── Type guards ───────────────────────────────────────────────────────────

export function isTaggedRange(v: HeadlineMetricValue): v is TaggedRange {
  return (v as TaggedRange).range !== undefined;
}
