/**
 * Keystone derivations (Section 7.5 §C.3, D1–D10).
 *
 * Every derived domain value lives here as a pure function. Components consume
 * these selectors; they NEVER recompute a derived value inline. Each function
 * reads only from the store data shape (KeystoneData).
 */
import type {
  CommitteeRollupItem,
  Control,
  EvidencePack,
  GateState,
  KeystoneData,
  Money,
  PostureCell,
  PostureStatus,
  Range,
  ReconStream,
  Regulator,
  TaggedRange,
} from "./types";

// ── Lookups ────────────────────────────────────────────────────────────────

export function getStream(data: KeystoneData, key: string): ReconStream | undefined {
  return data.reconciliation.streams.find((s) => s.key === key);
}

export function getRegulator(data: KeystoneData, id: string): Regulator | undefined {
  return data.regulators.find((r) => r.id === id);
}

export function getControl(data: KeystoneData, id: string): Control | undefined {
  return data.controls.find((c) => c.id === id);
}

export function getPostureCell(
  data: KeystoneData,
  regulatorId: string,
  controlId: string,
): PostureCell | undefined {
  return data.postureGrid.find(
    (c) => c.regulatorId === regulatorId && c.controlId === controlId,
  );
}

export function getEvidencePack(
  data: KeystoneData,
  regulatorId: string,
): EvidencePack | undefined {
  return data.evidencePacks.find((p) => p.regulatorId === regulatorId);
}

// ── D1 — variance amount = unaccountedUnits × dutyRatePerUnit (T2) ──────────

export function d1VarianceAmount(data: KeystoneData): Money {
  const units = data.reconciliation.variance.unaccountedUnits;
  const rate = data.assumptions.dutyRatePerUnit.value;
  return { amount: units * rate.amount, currency: rate.currency };
}

// ── D2 — expectedDuty = packagedVolume × dutyRatePerUnit ────────────────────

export function d2ExpectedDuty(data: KeystoneData): Money {
  const packaged = getStream(data, "packagedVolume")?.value.value ?? 0;
  const rate = data.assumptions.dutyRatePerUnit.value;
  return { amount: packaged * rate.amount, currency: rate.currency };
}

// ── D3 — exposureBand range = exciseBase × discrepancyRate.{low,high} (T1) ──

export function d3ExposureBand(data: KeystoneData): Range {
  const base = data.company.exciseBase.value.amount;
  const rate = data.assumptions.discrepancyRate.range;
  return { low: base * rate.low, high: base * rate.high };
}

// ── D4 — unaccountedUnits = packagedVolume − stickersConsumed (T3) ──────────

export function d4UnaccountedUnits(data: KeystoneData): number {
  const packaged = getStream(data, "packagedVolume")?.value.value ?? 0;
  const stickers = getStream(data, "stickersConsumed")?.value.value ?? 0;
  return packaged - stickers;
}

// ── D5 — abv reconciled iff every delta within tolerance (T4) ───────────────

export function d5AbvReconciled(data: KeystoneData): {
  reconciled: boolean;
  mismatchDelta: number;
} {
  const { lab, label, excise } = data.batch.abv;
  const tol = data.assumptions.abvTolerancePct.value;
  const dLabel = Math.abs(lab.value - label.value);
  const dExcise = Math.abs(lab.value - excise.value);
  const mismatchDelta = Math.max(dLabel, dExcise);
  return { reconciled: dLabel <= tol && dExcise <= tol, mismatchDelta };
}

// ── D6 — gateState = HELD unless ABV reconciled (T5) ────────────────────────

export function d6GateState(data: KeystoneData): GateState {
  return d5AbvReconciled(data).reconciled ? "RELEASED" : "HELD";
}

// ── D7 — detection latency is visible once the node reconciles ──────────────

export function d7DetectionLatencyVisible(data: KeystoneData): boolean {
  return data.reconciliation.nodeState === "RECONCILED";
}

// ── D8 — EXCISE × DUTY posture = ATTENTION iff nodeState AT_RISK (T6) ────────

export function d8ExciseDutyPosture(data: KeystoneData): PostureStatus {
  return data.reconciliation.nodeState === "AT_RISK" ? "ATTENTION" : "OK";
}

// ── D9 — committee rollup = HIGH-severity posture items (T7) ─────────────────

export interface ResolvedRollupItem extends CommitteeRollupItem {
  cell?: PostureCell;
  regulator?: Regulator;
  control?: Control;
}

export function d9CommitteeRollup(data: KeystoneData): ResolvedRollupItem[] {
  return data.committeeRollup.items.map((item) => {
    const cell = data.postureGrid.find((c) => c.id === item.postureCellId);
    return {
      ...item,
      cell,
      regulator: cell ? getRegulator(data, cell.regulatorId) : undefined,
      control: cell ? getControl(data, cell.controlId) : undefined,
    };
  });
}

// ── D10 — headline exposure references company.exposureBand (single source) ─

export function d10HeadlineExposure(data: KeystoneData): TaggedRange {
  return data.company.exposureBand;
}

// ── Aggregate posture helpers (C5) ──────────────────────────────────────────

export function countPostureByStatus(
  data: KeystoneData,
  status: PostureStatus,
): number {
  return data.postureGrid.filter((c) => c.status === status).length;
}
