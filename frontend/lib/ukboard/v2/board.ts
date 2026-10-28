/**
 * UK Board v2 — one-page board model. Reads the v1 data module read-only and adds
 * metadata only (tier, indicator type, direction, objective, short face names). No new values.
 * Verdicts and the off-track list are computed here, never hard-coded in components.
 */
import { FIRM, SERIES, THRESHOLDS } from "../v1/data";
import { projectedCrossing } from "../v1/selectors";
import type { Status } from "../v1/types";
import { deltaText, MEASURES, measure, mortgageHeadroomM, postureCounts, type Measure } from "./boardStore";

export type Tier = "obligatory" | "top" | "emerging";
export type IndicatorType = "leading" | "lagging";
export type Direction = "higherIsWorse" | "lowerIsWorse";
export type ObjectiveId = "O1" | "O2" | "O3" | "O4";
export type Verdict = "room_to_grow" | "hold" | "fix_first" | "unverified";

export interface Dial {
  min: number;
  max: number;
  amber?: number;
  red?: number;
  actual: number;
  /** Where the straight-line projection crosses amber (hollow tick). */
  projection?: number;
  unit: string;
}

export interface MetricMeta {
  unitId: string;
  /** Face name, at most 4 words. */
  name: string;
  tier: Tier;
  indicatorType: IndicatorType;
  direction: Direction;
  objectiveId?: ObjectiveId;
  /** Value with its denominator, from the existing position fields. */
  value: string;
  denominator: string;
  /** Change against Q2 2026 (or the previous run), from the existing delta fields. */
  delta?: { text: string; worse: boolean };
  dial?: Dial;
  /** Projected to reach amber, in plain words (only where the data holds a projection). */
  projectionText?: string;
  /** Quarters until amber on the straight-line projection; used by the off-track rule. */
  quartersToAmber?: number;
  owner: string;
}

const t = THRESHOLDS;

/** Dial ranges for the compact appetite dials (presentation only; values come from boardStore). */
const DIAL_RANGE: Record<string, { min: number; max: number; unit: string }> = {
  "u-capacity": { min: 0, max: 28, unit: " days" },
  "u-lcr": { min: 110, max: 190, unit: "%" },
  "u-nsfr": { min: 95, max: 135, unit: "%" },
  "u-hltv": { min: 10, max: 22, unit: "%" },
  "u-wholesale": { min: 0, max: 50, unit: "%" },
  "u-cet1": { min: 10, max: 20, unit: "%" },
  "u-ibs": { min: 0, max: 100, unit: "%" },
  "u-climate": { min: 0, max: 14, unit: "%" },
};

const toMeta = (m: Measure): MetricMeta => {
  const r = DIAL_RANGE[m.id];
  const dial: Dial | undefined =
    r && m.actual !== undefined
      ? { ...r, amber: m.amber, red: m.limit, actual: m.actual, projection: m.projection && m.quartersToAmber !== undefined ? m.amber : undefined }
      : undefined;
  return {
    unitId: m.id,
    name: m.name,
    tier: m.tier,
    indicatorType: m.type === "early_warning" ? "leading" : "lagging",
    direction: m.direction === "lowerIsWorse" ? "lowerIsWorse" : "higherIsWorse",
    objectiveId: m.objectiveId,
    value: m.value,
    denominator: m.comparator,
    delta: m.delta ? { text: deltaText(m.delta), worse: m.delta.worse } : undefined,
    dial,
    projectionText: m.projection,
    quartersToAmber: m.quartersToAmber,
    owner: m.owner,
  };
};

/** The 12 board headlines, read from the one store (boardStore.ts). */
export const METRICS: MetricMeta[] = MEASURES.map(toMeta);

/** Emerging-tier rows: registered risks with no metric (not one of the 12 headlines). */
export const EMERGING = [{ unitId: "u-horizon", name: "AI impersonation fraud", owner: "Head of Financial Crime" }];

export const HEADLINE_COUNT = METRICS.length;

const TO_STATUS = { red: "red", amber: "amber", unconfirmed: "unverified", within: "within_appetite", projected: "within_appetite" } as const;

export function metricStatus(m: MetricMeta): Status {
  return TO_STATUS[measure(m.unitId).status];
}

const ORDER: Record<string, number> = { red: 0, unverified: 1, amber: 2, projected: 3, within_appetite: 4, not_assessed: 5 };

/** "projected" = within appetite now, reaching amber within 2 quarters on the straight line. */
export function rowState(m: MetricMeta): Status | "projected" {
  return measure(m.unitId).status === "projected" ? "projected" : metricStatus(m);
}

export function isOffTrack(m: MetricMeta): boolean {
  return rowState(m) !== "within_appetite";
}

export const TIER_ORDER: Tier[] = ["obligatory", "top", "emerging"];
export const TIER_LABEL: Record<Tier, string> = { obligatory: "Obligatory", top: "Top", emerging: "Emerging" };

export function offTrackByTier() {
  return TIER_ORDER.map((tier) => ({
    tier,
    rows: METRICS.filter((m) => m.tier === tier && isOffTrack(m)).sort((a, b) => ORDER[rowState(a)] - ORDER[rowState(b)]),
  }));
}

export function onTrack() {
  return METRICS.filter((m) => !isOffTrack(m));
}

/** Posture counts from the store: within excludes the measures heading for amber. */
export function headlineCounts() {
  const c = postureCounts();
  return { within_appetite: c.within, projected: c.projected, amber: c.amber, red: c.red, unverified: c.unconfirmed, not_assessed: 0 };
}

/* ── Strategy verdicts (computed) ─────────────────────────────────────── */

export interface Objective {
  id: ObjectiveId;
  name: string;
  /** Unit carrying the floor or tension state for the objective, if any. */
  floorBreach?: boolean;
  /** Metric whose dial the tile shows. */
  dialUnitId?: string;
  dialLabel?: string;
  /** Shown instead of a dial. */
  figure?: string;
  line: string;
  drawer: DrawerKey;
}

export const OBJECTIVES: Objective[] = [
  { id: "O1", name: "Mortgage growth", dialUnitId: "u-hltv", dialLabel: "88% used", line: "£96m headroom, until Q2 2027", drawer: "objective:O1" },
  { id: "O2", name: "Savings and onboarding", floorBreach: true, figure: "2 of 3 limits broken", line: "Customers transacting before checks", drawer: "objective:O2" },
  { id: "O3", name: "Funding base", dialUnitId: "u-nsfr", dialLabel: "NSFR 117%", line: "Reaches amber next quarter", drawer: "objective:O3" },
  { id: "O4", name: "Member safety", figure: "2 figures", line: "Not yet verified", drawer: "objective:O4" },
];

export function objectiveMetrics(id: ObjectiveId) {
  return METRICS.filter((m) => m.objectiveId === id);
}

export function verdict(o: Objective): Verdict {
  const ms = objectiveMetrics(o.id);
  const states = ms.map(rowState);
  if (o.floorBreach || states.includes("red")) return "fix_first";
  if (states.includes("unverified")) return "unverified";
  if (states.includes("amber") || states.includes("projected")) return "hold";
  return "room_to_grow";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  room_to_grow: "Room to grow",
  hold: "Hold",
  fix_first: "Fix first",
  unverified: "Unverified",
};

/** Verdict pill colour reuses status tokens; Unverified stays neutral grey. */
export const VERDICT_STATUS: Record<Verdict, Status> = {
  room_to_grow: "within_appetite",
  hold: "amber",
  fix_first: "red",
  unverified: "unverified",
};

/* ── Headline sentence (rule-built, not free AI text) ─────────────────── */

export const DECISION_COUNT = 3;

export function headlineSentence(): string {
  const c = headlineCounts();
  const grow = OBJECTIVES.find((o) => verdict(o) === "room_to_grow");
  const growText = grow ? ` Room to grow ${grow.name.toLowerCase().replace(" growth", "s")}: £${mortgageHeadroomM()}m.` : "";
  return `${c.within_appetite} of ${HEADLINE_COUNT} measures within appetite.${growText} ${DECISION_COUNT} decisions due before the BRC.`;
}

/** Days from the demo's fixed "today" to the next BRC. */
export function daysToBrc(): number {
  const parse = (s: string) => {
    const [d, mon, y] = s.split(" ");
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return Date.UTC(Number(y), months.indexOf(mon), Number(d));
  };
  return Math.round((parse(FIRM.nextBrc) - parse(FIRM.demoToday)) / 86400000);
}

/** Quarters to amber for the high-LTV headline, from the stored series (used only to confirm the tile). */
export function hltvAmberQuarter(): string | null {
  return projectedCrossing(SERIES["u-hltv"], t["u-hltv"].amber);
}

/* ── Drawer keys: every row, tile, card and panel opens one ──────────── */

export type DrawerKey =
  | `metric:${string}`
  | `objective:${ObjectiveId}`
  | "decision:1"
  | "decision:2"
  | "decision:3"
  | "panel:F1"
  | "panel:F2"
  | "panel:F3"
  | "panel:F4"
  | "unmapped"
  | "greens";
