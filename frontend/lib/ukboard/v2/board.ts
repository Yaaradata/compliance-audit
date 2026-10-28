/**
 * UK Board v2 — one-page board model. Reads the v1 data module read-only and adds
 * metadata only (tier, indicator type, direction, objective, short face names). No new values.
 * Verdicts and the off-track list are computed here, never hard-coded in components.
 */
import { FIRM, SERIES, THRESHOLDS, UNITS } from "../v1/data";
import { projectedCrossing, selectStatus, statusCounts } from "../v1/selectors";
import type { ScorecardRow, Status } from "../v1/types";

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

/** The 12 board headlines (NSFR promoted in; critical vulnerabilities rotated to the cyber drawer). */
export const METRICS: MetricMeta[] = [
  {
    unitId: "u-restriction",
    name: "Customer restriction",
    tier: "obligatory",
    indicatorType: "lagging",
    direction: "higherIsWorse",
    objectiveId: "O2",
    value: "112",
    denominator: "/ 9,400 tested",
    delta: { text: "+41", worse: true },
    owner: "Head of Financial Crime",
  },
  {
    unitId: "u-tm",
    name: "Monitoring coverage",
    tier: "obligatory",
    indicatorType: "lagging",
    direction: "lowerIsWorse",
    objectiveId: "O4",
    value: "94.0%",
    denominator: "of 2.4m records",
    delta: { text: "−3.1 pts", worse: true },
    owner: "Feed owner",
  },
  {
    unitId: "u-sanctions",
    name: "Sanctions list cover",
    tier: "obligatory",
    indicatorType: "lagging",
    direction: "lowerIsWorse",
    objectiveId: "O4",
    value: "1.3%",
    denominator: "39 of 3,088 list",
    owner: "Head of Financial Crime",
  },
  {
    unitId: "u-cd",
    name: "Consumer Duty outcomes",
    tier: "obligatory",
    indicatorType: "lagging",
    direction: "lowerIsWorse",
    objectiveId: "O4",
    value: "4 of 4",
    denominator: "within tolerance",
    owner: "Head of Compliance",
  },
  {
    unitId: "u-capacity",
    name: "Alert queue age",
    tier: "top",
    indicatorType: "leading",
    direction: "higherIsWorse",
    objectiveId: "O2",
    value: "19 days",
    denominator: "amber 14",
    delta: { text: "+7 days", worse: true },
    dial: { min: 0, max: 28, amber: t["u-capacity"].amber, red: t["u-capacity"].red, actual: 19, unit: " days" },
    owner: "Head of Financial Crime",
  },
  {
    unitId: "u-lcr",
    name: "Liquidity (LCR)",
    tier: "top",
    indicatorType: "leading",
    direction: "lowerIsWorse",
    objectiveId: "O3",
    value: "162%",
    denominator: "amber 150%",
    delta: { text: "−6 pts", worse: true },
    dial: { min: 110, max: 190, amber: t["u-lcr"].amber, red: t["u-lcr"].red, actual: 162, projection: t["u-lcr"].amber, unit: "%" },
    projectionText: "amber in about 9 weeks",
    quartersToAmber: 1,
    owner: "Treasurer",
  },
  {
    unitId: "u-nsfr",
    name: "Stable funding (NSFR)",
    tier: "top",
    indicatorType: "leading",
    direction: "lowerIsWorse",
    objectiveId: "O3",
    value: "117%",
    denominator: "amber 115%",
    delta: { text: "−8 pts", worse: true },
    dial: { min: 95, max: 135, amber: t["u-nsfr"].amber, red: t["u-nsfr"].red, actual: 117, projection: t["u-nsfr"].amber, unit: "%" },
    projectionText: "amber next quarter",
    quartersToAmber: 1,
    owner: "Treasurer",
  },
  {
    unitId: "u-hltv",
    name: "High-LTV lending",
    tier: "top",
    indicatorType: "leading",
    direction: "higherIsWorse",
    objectiveId: "O1",
    value: "17.6%",
    denominator: "red 20%",
    delta: { text: "+0.3 pts", worse: true },
    dial: { min: 0, max: t["u-hltv"].capacity ?? 24, amber: t["u-hltv"].amber, red: t["u-hltv"].red, actual: 17.6, projection: t["u-hltv"].amber, unit: "%" },
    projectionText: "amber by Q2 2027",
    owner: "Chief Credit Officer",
  },
  {
    unitId: "u-wholesale",
    name: "Wholesale funding",
    tier: "top",
    indicatorType: "lagging",
    direction: "higherIsWorse",
    objectiveId: "O3",
    value: "34%",
    denominator: "ceiling 40%",
    delta: { text: "+1 pt", worse: true },
    dial: { min: 0, max: 50, amber: t["u-wholesale"].amber, red: t["u-wholesale"].red, actual: 34, unit: "%" },
    owner: "CFO",
  },
  {
    unitId: "u-cet1",
    name: "CET1 capital",
    tier: "top",
    indicatorType: "lagging",
    direction: "lowerIsWorse",
    value: "16.8%",
    denominator: "limit 13.5%",
    delta: { text: "−0.2 pts", worse: true },
    dial: { min: 10, max: 20, amber: t["u-cet1"].amber, red: t["u-cet1"].red, actual: 16.8, unit: "%" },
    owner: "CFO",
  },
  {
    unitId: "u-ibs",
    name: "Service disruption",
    tier: "top",
    indicatorType: "lagging",
    direction: "higherIsWorse",
    objectiveId: "O4",
    value: "58%",
    denominator: "of tolerance",
    delta: { text: "+4 pts", worse: true },
    dial: { min: 0, max: 100, amber: 75, red: 100, actual: 58, unit: "%" },
    owner: "COO",
  },
  {
    unitId: "u-climate",
    name: "Low-EPC lending",
    tier: "top",
    indicatorType: "leading",
    direction: "higherIsWorse",
    objectiveId: "O1",
    value: "7.4%",
    denominator: "appetite 10%",
    delta: { text: "+0.2 pts", worse: true },
    dial: { min: 0, max: 14, red: 10, actual: 7.4, unit: "%" },
    owner: "CRO",
  },
];

/** Emerging-tier rows: registered risks with no metric (not one of the 12 headlines). */
export const EMERGING = [{ unitId: "u-horizon", name: "AI impersonation fraud", owner: "Head of Financial Crime" }];

export const HEADLINE_COUNT = METRICS.length;

export function metricStatus(m: MetricMeta): Status {
  return selectStatus(UNITS[m.unitId]);
}

const ORDER: Record<string, number> = { red: 0, unverified: 1, amber: 2, projected: 3, within_appetite: 4, not_assessed: 5 };

/** "projected" = within appetite now, reaching amber within 2 quarters on the straight line. */
export function rowState(m: MetricMeta): Status | "projected" {
  const s = metricStatus(m);
  if (s === "within_appetite" && m.quartersToAmber !== undefined && m.quartersToAmber <= 2) return "projected";
  return s;
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

export function headlineCounts() {
  const rows: ScorecardRow[] = METRICS.map((m) => ({ unitId: m.unitId, name: m.name, domainLabel: "" }));
  return statusCounts(rows, UNITS);
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
  const growText = grow ? ` Room to grow ${grow.name.toLowerCase().replace(" growth", "s")}: £96m.` : "";
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
