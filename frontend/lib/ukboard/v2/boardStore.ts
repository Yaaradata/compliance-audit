/**
 * UK Board v2 — one source of truth for every board figure, built around the board's risk appetite:
 * strategic objectives → risk appetite statement → 12 board measures (Level 1) → Level 2 metrics →
 * Level 3 controls. Three tiers: Top risks · Emerging risks · Obligatory risks (Level 0, zero appetite).
 * Counts, percentages, headroom, posture, objective status and every roll-up are computed here.
 * validateBoardStore() fails loudly if a cross-check breaks (development and tests).
 *
 * Pass 0 decisions: Heading for amber counts as On track for objectives; D2 headroom computed
 * (£176m at 22%); high-LTV ▲ 0.3 pts vs Q2 (▲ 1.5 pts since Q2 2025 in the drawer); cyber 2 of 146
 * moved to Level 2; attestation 8 · 3 due · 1 unconfirmed; detection-time series seeded.
 */
import { CAPACITY, EVENTS, FIRM, HORIZON, KRI_DETAIL, PACK_ITEMS, PEOPLE, RESTRICTION, ROUTES, SERIES, THRESHOLDS } from "../v1/data";
import { AGENTS, FINDINGS, QUEUE, totalChecks } from "./agentsData";
import { ISSUES_FOUND, JOURNEYS, SIGNOFF_HISTORY, type SignOffMark } from "./boardMemberData";

/* ── Number formats ──────────────────────────────────────────────────── */

export const fmt = {
  n: (v: number) => v.toLocaleString("en-GB"),
  pct: (v: number, dp = 0) => `${v.toFixed(dp)}%`,
  pts: (v: number, dp = 1) => `${Math.abs(v).toFixed(dp)} pts`,
  gbpM: (m: number) => (m >= 1000 ? `£${(m / 1000).toFixed(1)}bn` : m < 1 ? `£${m.toFixed(1)}m` : `£${Math.round(m)}m`),
  gbpBn: (bn: number) => `£${bn.toFixed(1)}bn`,
  gbpK: (k: number) => `£${k}k`,
  nOfM: (n: number, m: number) => `${fmt.n(n)} of ${fmt.n(m)}`,
  share: (n: number, m: number) => `${Math.round((n / m) * 100)}%`,
};

/* ── Types ───────────────────────────────────────────────────────────── */

export type MeasureStatus = "red" | "amber" | "projected" | "within" | "unconfirmed";
export type Tier = "top" | "emerging" | "obligatory";
export type ObjId = "O1" | "O2" | "O3" | "O4";
export type Stance = "tighten" | "hold" | "loosen" | "new";
export type AttestState = "attested" | "due" | "unconfirmed";

export interface Delta {
  value: number;
  unit: "pts" | "days" | "";
  worse: boolean;
  dp?: number;
}

/** Level 2 metric under a board measure. */
export interface L2 {
  name: string;
  value: string;
  threshold: string;
  status: MeasureStatus;
}

/** Level 3 controls: the count tested, and the reds named. */
export interface L3 {
  count: number;
  reds: { name: string; owner: string; lastTested: string }[];
}

export interface Measure {
  id: string;
  num: number;
  name: string;
  tier: Tier;
  category: string;
  type: "leading" | "lagging";
  direction: "higherIsWorse" | "lowerIsWorse" | "status";
  value: string;
  short?: string;
  comparator: string;
  actual?: number;
  amber?: number;
  limit?: number;
  unit?: string;
  status: MeasureStatus;
  projection?: string;
  quartersToAmber?: number;
  delta?: Delta;
  /** Risk owner (end to end). */
  owner: string;
  objectives: ObjId[];
  /** Primary objective (first linked), kept for the derived board metrics. */
  objectiveId?: ObjId;
  /** Risk appetite statement, at most 12 words. */
  statement: string;
  stance: Stance;
  proposal?: { stance: "tighten" | "loosen" | "set"; text: string; proposer: string; ai?: boolean };
  l2: L2[];
  l3: L3;
  linkage: { tested: string; result: "linked" | "gap"; note?: string };
  attest: { state: AttestState; date?: string };
  isNew?: boolean;
}

/* ── The 12 board measures ───────────────────────────────────────────── */

const t = THRESHOLDS;
const hltvSeries = SERIES["u-hltv"];
const hltvNow = hltvSeries[hltvSeries.length - 1].value;
const hltvQ2 = hltvSeries[hltvSeries.length - 2].value;
const handlersNow = CAPACITY.handlers[CAPACITY.handlers.length - 1];
const LINKED = { tested: "30 Sep", result: "linked" as const };

export const MEASURES: Measure[] = [
  {
    id: "u-growth",
    num: 1,
    name: "Lending growth vs plan",
    tier: "top",
    category: "Strategic growth",
    type: "lagging",
    direction: "lowerIsWorse",
    value: "£2.9bn of £4.0bn · 73%",
    short: "73% of plan",
    comparator: "amber < 70% · limit < 65%",
    actual: 73,
    amber: 70,
    limit: 65,
    unit: "%",
    status: "within",
    owner: "Head of Mortgages",
    objectives: ["O1"],
    statement: "Deliver planned growth without breaching any other appetite",
    stance: "hold",
    l2: [
      { name: "New lending vs plan", value: "£2.9bn of £4.0bn", threshold: "plan pace 75%", status: "within" },
      { name: "Mortgage book", value: "£17.9bn", threshold: "plan", status: "within" },
      { name: "Savings balances vs plan", value: "+£1.1bn", threshold: "plan +£0.8bn", status: "within" },
      { name: "Members", value: "1.90m", threshold: "▲ 31%", status: "within" },
    ],
    l3: { count: 8, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "1 Oct" },
  },
  {
    id: "u-hltv",
    num: 2,
    name: "High-LTV share of new lending",
    tier: "top",
    category: "Credit",
    type: "leading",
    direction: "higherIsWorse",
    value: `${hltvNow}%`,
    comparator: `amber ${t["u-hltv"].amber}% · limit ${t["u-hltv"].red}%`,
    actual: hltvNow,
    amber: t["u-hltv"].amber,
    limit: t["u-hltv"].red,
    unit: "%",
    status: "within",
    projection: "amber by Q2 2027",
    delta: { value: Math.round((hltvNow - hltvQ2) * 10) / 10, unit: "pts", worse: true },
    owner: "Chief Credit Officer",
    objectives: ["O1"],
    statement: "Grow first-time-buyer lending within high-LTV and affordability limits",
    stance: "hold",
    proposal: { stance: "loosen", text: "Loosen to 22% for first-time buyers, with income multiple capped at 4.5×", proposer: "Chief Credit Officer", ai: true },
    l2: [
      { name: "Loans above 4.5× income", value: "9.2%", threshold: "limit 15%", status: "within" },
      { name: "Arrears 3 months+", value: "0.42%", threshold: "appetite 1.0%", status: "within" },
      { name: "Cost of risk", value: "6 bps", threshold: "Q2 5 bps", status: "within" },
    ],
    l3: { count: 10, reds: [{ name: "High-LTV limit register not updated after temporary limit expired 6 Oct", owner: "Chief Credit Officer", lastTested: "6 Oct" }] },
    linkage: LINKED,
    attest: { state: "attested", date: "30 Sep" },
  },
  {
    id: "u-lcr",
    num: 3,
    name: "Liquidity coverage (LCR)",
    tier: "top",
    category: "Liquidity & funding",
    type: "leading",
    direction: "lowerIsWorse",
    value: "162%",
    comparator: `amber ${t["u-lcr"].amber}% · limit ${t["u-lcr"].red}%`,
    actual: 162,
    amber: t["u-lcr"].amber,
    limit: t["u-lcr"].red,
    unit: "%",
    status: "projected",
    projection: "amber in about 9 weeks",
    quartersToAmber: 1,
    delta: { value: -6, unit: "pts", worse: true, dp: 0 },
    owner: "Treasurer",
    objectives: ["O1", "O2"],
    statement: "Hold liquidity well above minimums throughout growth",
    stance: "hold",
    l2: [
      { name: "Stable funding (NSFR)", value: "117%", threshold: "amber 115%", status: "projected" },
      { name: "Wholesale funding", value: "34%", threshold: "ceiling 40%", status: "within" },
      { name: "High-quality liquid assets", value: "Within", threshold: "buffer", status: "within" },
    ],
    l3: { count: 8, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "1 Oct" },
  },
  {
    id: "u-cet1",
    num: 4,
    name: "CET1 ratio",
    tier: "top",
    category: "Capital",
    type: "lagging",
    direction: "lowerIsWorse",
    value: "16.8%",
    comparator: `amber ${t["u-cet1"].amber}% · limit ${t["u-cet1"].red}%`,
    actual: 16.8,
    amber: t["u-cet1"].amber,
    limit: t["u-cet1"].red,
    unit: "%",
    status: "within",
    delta: { value: -0.2, unit: "pts", worse: true },
    owner: "Chief Financial Officer",
    objectives: ["O1"],
    statement: "Keep capital at least 3 points above requirement",
    stance: "hold",
    l2: [
      { name: "Leverage ratio", value: "5.9%", threshold: "limit 4.25%", status: "within" },
      { name: "Headroom over limit", value: "3.3 pts", threshold: "at least 3 pts", status: "within" },
      { name: "Risk-weighted assets", value: "Within plan", threshold: "plan", status: "within" },
    ],
    l3: { count: 6, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "2 Oct" },
  },
  {
    id: "u-capacity",
    num: 5,
    name: "Alert queue age",
    tier: "top",
    category: "Financial crime",
    type: "leading",
    direction: "higherIsWorse",
    value: "19 days",
    comparator: `amber ${t["u-capacity"].amber} · limit ${t["u-capacity"].red}`,
    actual: 19,
    amber: t["u-capacity"].amber,
    limit: t["u-capacity"].red,
    unit: " days",
    status: "amber",
    delta: { value: 7, unit: "days", worse: true },
    owner: "Head of Financial Crime",
    objectives: ["O2", "O3"],
    statement: "Grow only as fast as crime checks keep pace",
    stance: "hold",
    proposal: { stance: "tighten", text: "Pace savings growth until handlers are restored", proposer: "Head of Financial Crime" },
    l2: [
      { name: "Members per handler", value: "30,160", threshold: "was 25,000", status: "amber" },
      { name: "Alerts cleared in target", value: "81%", threshold: "target 95%", status: "amber" },
      { name: "Enhanced due diligence in target", value: "92%", threshold: "1,380 of 1,500", status: "within" },
    ],
    l3: { count: 12, reds: [{ name: "Quality-assurance sampling overdue", owner: "Head of Financial Crime Ops", lastTested: "Jul" }] },
    linkage: LINKED,
    attest: { state: "attested", date: "26 Oct" },
  },
  {
    id: "u-secfind",
    num: 6,
    name: "Critical security findings open over 30 days",
    tier: "top",
    category: "Cyber & resilience",
    type: "leading",
    direction: "higherIsWorse",
    value: "1",
    short: "1 open",
    comparator: "amber 1 · limit 2",
    actual: 1,
    amber: 1,
    limit: 2,
    unit: "",
    status: "amber",
    delta: { value: 1, unit: "", worse: true },
    owner: "Chief Information Security Officer",
    objectives: ["O3"],
    statement: "No critical security weakness open beyond 30 days",
    stance: "hold",
    proposal: { stance: "tighten", text: "Limit 2 → 1 after the January red-team exercise", proposer: "Chief Information Security Officer" },
    l2: [
      { name: "Critical patches within 14 days", value: "94%", threshold: "target 98%", status: "amber" },
      { name: "Critical vulnerabilities past target", value: "2 of 146", threshold: "appetite ≤ 5", status: "within" },
      { name: "Service disruption", value: "58%", threshold: "of impact tolerance", status: "within" },
      { name: "Phishing simulation click rate", value: "3.1%", threshold: "of staff tests", status: "within" },
    ],
    l3: { count: 14, reds: [{ name: "Privileged-access review overdue", owner: "Chief Information Security Officer", lastTested: "Jun" }] },
    linkage: LINKED,
    attest: { state: "due" },
  },
  {
    id: "u-detect",
    num: 7,
    name: "Time to detect a coordinated automated attack",
    tier: "emerging",
    category: "Agentic-AI fraud",
    type: "leading",
    direction: "higherIsWorse",
    value: "12 min",
    short: "12 min median",
    comparator: "amber 15 · limit 30",
    actual: 12,
    amber: 15,
    limit: 30,
    unit: " min",
    status: "projected",
    projection: "amber in about 3 months",
    owner: "Head of Fraud",
    objectives: ["O2", "O3"],
    statement: "Detect automated attacks in minutes, not hours",
    stance: "new",
    proposal: { stance: "set", text: "Set the band after the challenger-model trial", proposer: "Head of Fraud" },
    l2: [
      { name: "Bot-driven attempts", value: "▲ 3×", threshold: "since Q2", status: "amber" },
      { name: "Attempts blocked", value: "99.2%", threshold: "of attempts", status: "within" },
      { name: "Agent-initiated payment policy", value: "Not set", threshold: "policy", status: "unconfirmed" },
    ],
    l3: { count: 5, reds: [] },
    linkage: LINKED,
    attest: { state: "due" },
    isNew: true,
  },
  {
    id: "u-climate",
    num: 8,
    name: "Lending to least-efficient homes (EPC F–G)",
    tier: "emerging",
    category: "Climate",
    type: "lagging",
    direction: "higherIsWorse",
    value: "7.4%",
    comparator: "amber 9% · limit 10%",
    actual: 7.4,
    amber: 9,
    limit: 10,
    unit: "%",
    status: "within",
    delta: { value: 0.2, unit: "pts", worse: true },
    owner: "Chief Credit Officer",
    objectives: ["O1"],
    statement: "Limit lending to the least energy-efficient homes",
    stance: "hold",
    l2: [
      { name: "Flood-risk exposure", value: "Within", threshold: "appetite", status: "within" },
      { name: "Transition plan milestones", value: "On track", threshold: "plan", status: "within" },
    ],
    l3: { count: 3, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "2 Oct" },
  },
  {
    id: "u-restriction",
    num: 9,
    name: "Customer restriction breaches",
    tier: "obligatory",
    category: "Financial crime (regulatory)",
    type: "lagging",
    direction: "status",
    value: `${RESTRICTION.breachesAccounts} of ${fmt.n(RESTRICTION.tested)} tested`,
    short: `${RESTRICTION.breachesAccounts} breaches`,
    comparator: "appetite 0",
    status: "red",
    delta: { value: RESTRICTION.breachesAccounts - RESTRICTION.previousRun.breachesAccounts, unit: "", worse: true },
    owner: "Head of Financial Crime",
    objectives: ["O3"],
    statement: "Zero breaches of the voluntary customer restriction",
    stance: "hold",
    l2: [
      { name: "Openings not yet checked", value: "24,000", threshold: "partner channel", status: "red" },
      { name: "Accounts tested", value: fmt.n(RESTRICTION.tested), threshold: `of ${fmt.n(RESTRICTION.inScope)} in scope`, status: "within" },
      { name: "Block in place", value: "Fired 1,208 times", threshold: "direct channel", status: "within" },
    ],
    l3: { count: 4, reds: [{ name: "1 of 4 restriction clauses not supported by the system", owner: "Head of Financial Crime", lastTested: "15 Sep" }] },
    linkage: LINKED,
    attest: { state: "due", date: "8 Nov" },
  },
  {
    id: "u-screening",
    num: 10,
    name: "Monitoring and sanctions screening coverage",
    tier: "obligatory",
    category: "Screening",
    type: "lagging",
    direction: "status",
    value: "Owner confirmation outstanding",
    short: "Not confirmed",
    comparator: "appetite: full coverage",
    status: "unconfirmed",
    owner: "Data owner (payments)",
    objectives: ["O3"],
    statement: "Every transaction and customer screened",
    stance: "hold",
    l2: [
      { name: "Monitoring coverage", value: "94.0%", threshold: "of 2.4m records", status: "unconfirmed" },
      { name: "Sanctions list coverage", value: "1.3%", threshold: "39 of 3,088", status: "unconfirmed" },
    ],
    l3: { count: 7, reds: [{ name: "Monitoring attestation given before the data check finished", owner: "Data owner (payments)", lastTested: "Sep" }] },
    linkage: { tested: "30 Sep", result: "gap", note: "Sanctions rule changes not linked to the coverage measure" },
    attest: { state: "unconfirmed" },
  },
  {
    id: "u-cd",
    num: 11,
    name: "Consumer Duty outcomes",
    tier: "obligatory",
    category: "Conduct",
    type: "lagging",
    direction: "status",
    value: "2 of 4 outcomes amber",
    comparator: "appetite: all within tolerance",
    status: "amber",
    owner: "Chief Customer Officer",
    objectives: ["O4"],
    statement: "Every Consumer Duty outcome within tolerance",
    stance: "hold",
    l2: [
      { name: "Products & services", value: "3 of 3", threshold: "measures in tolerance", status: "within" },
      { name: "Price & value", value: "3 of 3", threshold: "measures in tolerance", status: "within" },
      { name: "Consumer understanding", value: "2 of 3", threshold: "letters 71% · target 80%", status: "amber" },
      { name: "Consumer support", value: "1 of 3", threshold: "vulnerable exceptions 16.9", status: "amber" },
    ],
    l3: { count: 12, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "3 Oct" },
  },
  {
    id: "u-notify",
    num: 12,
    name: "Regulatory notifications on time",
    tier: "obligatory",
    category: "Regulatory",
    type: "leading",
    direction: "status",
    value: "2 events open · 1 of 7 routes decided · 0 missed",
    short: "0 missed · 2 open",
    comparator: "appetite 0 missed",
    status: "amber",
    owner: "Head of Compliance",
    objectives: ["O3"],
    statement: "Every reportable event notified within its deadline",
    stance: "hold",
    l2: [
      { name: "Immediate clocks running", value: "FCA and PRA", threshold: "restriction breach", status: "amber" },
      { name: "Rate-error FCA notification", value: "Decided 23 Oct", threshold: "deadline", status: "within" },
      { name: "Deadlines missed", value: "0", threshold: "appetite 0", status: "within" },
    ],
    l3: { count: 6, reds: [] },
    linkage: LINKED,
    attest: { state: "attested", date: "2 Oct" },
  },
];
for (const m of MEASURES) m.objectiveId = m.objectives[0];

export const measure = (id: string) => {
  const m = MEASURES.find((x) => x.id === id);
  if (!m) throw new Error(`boardStore: unknown measure ${id}`);
  return m;
};

/** High-LTV change since Q2 2025 (drawer only; the vs Q2 column shows the Q2 2026 change). */
export const hltvSinceQ2_2025 = () => Math.round((hltvNow - hltvSeries[0].value) * 10) / 10;

export function deltaText(d?: Delta): string {
  if (!d) return "no change";
  const arrow = d.value > 0 ? "▲" : "▼";
  const v = Math.abs(d.value);
  if (d.unit === "pts") return `${arrow} ${v.toFixed(d.dp ?? 1)} ${v === 1 ? "pt" : "pts"}`;
  if (d.unit === "days") return `${arrow} ${v} days`;
  return `${arrow} ${v}`;
}

/** Position on one scale (0–120, share of appetite used; further right is worse). */
export function position(m: Measure): { actual?: number; amber?: number; limit: number; projection?: number } {
  if (m.id === "u-restriction") return { actual: 120, limit: 100 };
  if (m.actual === undefined || m.limit === undefined) return { limit: 100 };
  const ratio = (v: number) => (m.direction === "lowerIsWorse" ? (m.limit! / v) * 100 : (v / m.limit!) * 100);
  return {
    actual: Math.min(120, ratio(m.actual)),
    amber: m.amber !== undefined ? ratio(m.amber) : undefined,
    limit: 100,
    projection: m.projection && m.amber !== undefined ? ratio(m.amber) : undefined,
  };
}

/** Gap between amber trigger and appetite limit, as a share of the limit. */
export const bandWidth = (m: Measure) => (m.amber !== undefined && m.limit !== undefined ? Math.abs(m.limit - m.amber) / Math.abs(m.limit) : undefined);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
export function bandMedians() {
  const of = (tier: Tier) => median(MEASURES.filter((m) => m.tier === tier).map(bandWidth).filter((x): x is number => x !== undefined));
  return { top: of("top"), emerging: of("emerging") };
}

/* ── Posture and tiers ───────────────────────────────────────────────── */

export const STATUS_ORDER: MeasureStatus[] = ["red", "amber", "unconfirmed", "projected", "within"];
export const STATUS_WORD: Record<MeasureStatus, string> = { red: "Red", amber: "Amber", unconfirmed: "Unconfirmed", projected: "Heading for amber", within: "Within" };

export function postureCounts() {
  const c = { within: 0, projected: 0, amber: 0, red: 0, unconfirmed: 0 } as Record<MeasureStatus, number>;
  for (const m of MEASURES) c[m.status] += 1;
  return c;
}

export function postureText(): string {
  const c = postureCounts();
  return `${c.within} within · ${c.projected} heading for amber · ${c.amber} amber · ${c.red} red · ${c.unconfirmed} unconfirmed`;
}

export const measuresMoved = () => MEASURES.filter((m) => m.delta && m.delta.value !== 0).length;

export const TIER_INFO: Record<Tier, { label: string; meaning: string }> = {
  top: { label: "Top risks", meaning: "Tier-one risks, tight bands" },
  emerging: { label: "Emerging risks", meaning: "Forward-looking, wider ranges" },
  obligatory: { label: "Obligatory risks · Level 0", meaning: "Zero appetite" },
};

export function measuresByTier() {
  const tiers: Tier[] = ["top", "emerging", "obligatory"];
  return tiers.map((tier) => ({ tier, rows: MEASURES.filter((m) => m.tier === tier).sort((a, b) => a.num - b.num) }));
}

/** Emerging risks in the register with no measure yet (not among the 12). */
export const EMERGING_UNMEASURED: { name: string; why: string; owner: string }[] = [
  { name: "Agent-initiated payments", why: "Liability and policy not set", owner: "Head of Payments (proposed)" },
  { name: "Synthetic-voice impersonation of customers", why: "Defeats voice checks at scale", owner: "Head of Fraud" },
];

/* ── Strategic objectives ────────────────────────────────────────────── */

export type ObjStatus = "on_track" | "at_risk" | "off_track";
/** "At risk" is a banned UK Board phrase (lint guardrail); the middle state reads "Under pressure". */
export const OBJ_WORD: Record<ObjStatus, string> = { on_track: "On track", at_risk: "Under pressure", off_track: "Off track" };

export const OBJECTIVE_LIST: { id: ObjId; name: string; short: string }[] = [
  { id: "O1", name: "Grow mortgage lending to £4.0bn this year", short: "Grow mortgage lending" },
  { id: "O2", name: "Grow savings membership safely", short: "Grow savings safely" },
  { id: "O3", name: "Stay safe to operate", short: "Stay safe to operate" },
  { id: "O4", name: "Good outcomes for every customer", short: "Good customer outcomes" },
];

/** Worst linked measure: Red → Off track; Amber or Unconfirmed → At risk; Heading for amber and Within → On track. */
export function objectiveStatus(id: ObjId): ObjStatus {
  const s = MEASURES.filter((m) => m.objectives.includes(id)).map((m) => m.status);
  if (s.includes("red")) return "off_track";
  if (s.includes("amber") || s.includes("unconfirmed")) return "at_risk";
  return "on_track";
}

/** Objective names keyed by id (kept for the business-line views). */
export const APPETITE_STATEMENTS: Record<ObjId, string> = Object.fromEntries(OBJECTIVE_LIST.map((o) => [o.id, o.name])) as Record<ObjId, string>;

export const OBJECTIVE_REASON: Record<ObjId, string> = {
  O1: "£2.9bn of £4.0bn plan; £96m high-LTV headroom",
  O2: "+£1.1bn vs +£0.8bn plan; crime checks not keeping pace",
  O3: "Restriction breach red; security finding open",
  O4: "2 of 4 Consumer Duty outcomes amber",
};

/* ── Roll-up below the 12 ────────────────────────────────────────────── */

const off = (s: MeasureStatus) => s === "red" || s === "amber" || s === "projected";
export function rollupOf(m: Measure) {
  const l2Off = m.l2.filter((x) => off(x.status)).length;
  const l2Unconf = m.l2.filter((x) => x.status === "unconfirmed").length;
  return { below: m.l2.length + m.l3.count, l2: m.l2.length, l3: m.l3.count, l2Off, l2Unconf, l3Red: m.l3.reds.length, offTrack: l2Off + m.l3.reds.length };
}
export function rollupTotals() {
  const r = MEASURES.map(rollupOf);
  const sum = (k: keyof ReturnType<typeof rollupOf>) => r.reduce((a, x) => a + x[k], 0);
  return { below: sum("below"), l2: sum("l2"), l3: sum("l3"), offTrack: sum("offTrack"), unconfirmed: sum("l2Unconf"), l3Red: sum("l3Red") };
}

/** Which Level 2 rows a persona sees (§2.2). */
export function l2Visible(m: Measure, persona: string) {
  return persona === "cro" ? m.l2 : m.l2.filter((x) => x.status !== "within");
}
export const l3Visible = (m: Measure) => m.l3.reds;

/* ── Status at the last board ────────────────────────────────────────── */

const STATUS_AT_LAST_BOARD: Record<string, MeasureStatus> = { "u-restriction": "amber", "u-capacity": "within", "u-lcr": "within", "u-secfind": "within" };
export const statusAtLastBoard = (m: Measure): MeasureStatus | "new" => (m.isNew ? "new" : (STATUS_AT_LAST_BOARD[m.id] ?? m.status));
export const statusChanges = () => MEASURES.filter((m) => !m.isNew && statusAtLastBoard(m) !== m.status).map((m) => ({ id: m.id, name: m.name, from: statusAtLastBoard(m), to: m.status }));
export const newMeasures = () => MEASURES.filter((m) => m.isNew);

/* ── Tensions and policy linkage ─────────────────────────────────────── */

export type TensionState = "not_agreed" | "agreed" | "floor";
export const TENSION_LIST: { id: string; a: string; b: string; state: TensionState; note: string; measureId: string }[] = [
  { id: "T1", a: "Savings growth target", b: "Alert queue appetite", state: "not_agreed", note: "Campaign 8 Dec adds load to a queue at amber", measureId: "u-capacity" },
  { id: "T2", a: "Fast digital onboarding", b: "Checks before transacting", state: "floor", note: "Regulatory floor, not tradeable", measureId: "u-restriction" },
  { id: "T3", a: "First-time-buyer growth", b: "High-LTV limit", state: "agreed", note: "Review Q1 2027", measureId: "u-hltv" },
  { id: "T4", a: "Savings campaign change freeze", b: "Critical patching", state: "not_agreed", note: "Freeze from 1 Dec delays 2 critical patches", measureId: "u-secfind" },
];

export const POLICIES = {
  total: 46,
  untracked: [
    "Onboarding policy: source-of-funds clause",
    "Agent-initiated payments (no policy)",
    "Vulnerable-customer policy: exits section",
    "Third-party AI model use",
    "Savings-pot product terms",
  ],
};
export const policiesTracked = () => POLICIES.total - POLICIES.untracked.length;

/* ── Board calls (decisions as dial calls) ───────────────────────────── */

export const FTB = { limitNow: 20, loosenTo: 22, tightenTo: 18 };
export const ftbHeadroomM = (limit: number) => Math.round(((limit - hltvNow) / 100) * 4.0 * 1000);

export const BOARD_CALLS = [
  {
    id: "D1",
    verb: "Tighten or restore?",
    title: "Savings growth vs crime checks",
    decider: "Board",
    due: "8 Dec",
    measureId: "u-capacity",
    options: [
      { option: "Restore capacity", growth: "Campaign goes ahead", risk: "Queue below amber", cost: "+13 handlers · about £0.8m a year", time: "about 10 weeks", recommended: true },
      { option: "Pace growth", growth: "−£300m inflow vs plan", risk: "Queue below amber", cost: "None", time: "about 6 weeks" },
    ],
    effects: ["Restore → capacity lands after the campaign starts", "Pace → savings plan missed by about £300m"],
  },
  {
    id: "D2",
    verb: "Loosen?",
    title: "First-time-buyer high-LTV limit",
    decider: "Board",
    due: "15 Dec",
    measureId: "u-hltv",
    options: [
      { option: `Hold ${FTB.limitNow}%`, growth: "Plan gap −£0.2bn", risk: `£${ftbHeadroomM(FTB.limitNow)}m headroom`, cost: "None", time: "—" },
      { option: `Loosen to ${FTB.loosenTo}% with income cap`, growth: "Plan met", risk: `about £${ftbHeadroomM(FTB.loosenTo)}m headroom`, cost: "Cost of risk +2 bps", time: "Q1 2027", ai: true },
      { option: `Tighten to ${FTB.tightenTo}%`, growth: "Plan gap −£0.5bn", risk: `£${ftbHeadroomM(FTB.tightenTo)}m headroom`, cost: "Cost of risk −1 bp", time: "Immediate" },
    ],
    effects: ["Loosen → arrears +0.03 pts projection", "Loosen → capital −0.1 pts projection"],
  },
  {
    id: "D3",
    verb: "Restore?",
    title: "Item removed from the board pack",
    decider: "Risk Committee Chair",
    due: "15 Dec",
    measureId: "u-cd",
    options: [
      { option: "Remediation with an owner", growth: "None", risk: "About 2 quarters to green", cost: "Owner time", time: "2 quarters", recommended: true },
      { option: "Time-limited waiver", growth: "None", risk: "Stays amber 6 months", cost: "None", time: "6 months" },
      { option: "Recalibrate threshold", growth: "None", risk: "No customer change", cost: "Review", time: "Q1 2027" },
    ],
    effects: ["Waiver → item stays off the agenda until review"],
  },
];

/* ── Reportable-or-not layer ─────────────────────────────────────────── */

export const REPORTABLE_EVENTS = [
  { id: "e-r03", event: "Restriction breach", found: "26 Oct", measureId: "u-restriction", breached: true, classification: "Reportable", rule: "Pre-defined: reportable unless escalated", clock: "Immediate", decider: "Head of Compliance", forum: "Executive Risk Committee", readAcross: "Not started" as const },
  { id: "e-117", event: "Mortgage rate error, 2,300 customers", found: "15 Oct", measureId: "u-cd", breached: true, classification: "Reportable", rule: "Judgement: escalate to decider", clock: "Reporting period", decider: "Head of Compliance", forum: "Board Risk Committee", readAcross: "Done" as const },
];

export function reportingEvents() {
  return EVENTS.map((e) => {
    const rs = ROUTES.filter((r) => r.eventId === e.eventId);
    return { id: e.eventId, day: e.dayN, decided: rs.filter((r) => r.status === "decided").length, routes: rs.length };
  });
}
export const routesDecided = () => ({ decided: ROUTES.filter((r) => r.status === "decided").length, total: ROUTES.length });

/* ── Accountability ──────────────────────────────────────────────────── */

export const LINE_OF_SIGHT: Record<string, [boolean, boolean, boolean]> = {
  "Open a savings account": [false, true, false],
  "Mortgage rate change": [true, true, true],
  "Vulnerable customer support": [true, false, true],
  Payments: [false, true, false],
};
export const SMF_CERT = { next: "31 Jan 2027", smfs: 9, evidence: 6 };
export const CYBER_EXERCISES = [
  { label: "Last red-team exercise", value: "Sep 2026", note: "3 findings · 1 critical open 34 days" },
  { label: "Blue-team detection", value: "7 of 9", note: "attack scenarios detected" },
  { label: "Next exercise", value: "Jan 2027", note: "red team" },
  { label: "Last board cyber session", value: "Jun 2026", note: "board" },
];
export const ATTACK_SIGNALS = [
  { label: "Bot-driven attempts", value: "▲ 3×", note: "since Q2" },
  { label: "Attempts blocked", value: "99.2%", note: "login and payment" },
  { label: "Challenger model median", value: "40 sec", note: "vs 12 min today" },
  { label: "Challenger false alerts", value: "+6%", note: "parallel cohort" },
];
/** Seeded monthly median detection time (minutes), rising towards the 15-minute amber trigger. */
export const DETECTION_SERIES = [
  { label: "May", value: 7 },
  { label: "Jun", value: 8 },
  { label: "Jul", value: 8 },
  { label: "Aug", value: 9 },
  { label: "Sep", value: 11 },
  { label: "Oct", value: 12 },
];

/* ── Other canonical figures ─────────────────────────────────────────── */

const MEMBERS = CAPACITY.membersM[CAPACITY.membersM.length - 1] * 1_000_000;
const PER_HANDLER_WAS = 25_000;

export const FIG = {
  dates: { asAt: "30 Sep 2026", evidenceTo: "26 Oct 2026", restrictionSignOff: "8 Nov", campaign: "8 Dec", brc: "15 Dec", incidentRules: HORIZON.incidentRulesDate.replace("March", "Mar") },
  mortgages: { lentBn: 2.9, planBn: 4.0, pace: 0.75, bookBn: 17.9 },
  savings: { balancesBn: 1.1, planBn: 0.8, membersM: CAPACITY.membersM[CAPACITY.membersM.length - 1], membersGrowthPct: 31, limitsBroken: 2, limits: 3 },
  capacity: {
    handlers: handlersNow,
    perHandlerWas: PER_HANDLER_WAS,
    perHandler: Math.round(MEMBERS / handlersNow / 10) * 10,
    restoreNeeded: Math.round(MEMBERS / PER_HANDLER_WAS) - handlersNow,
    cleared: 31_600,
    alerts: 39_000,
    restoreCostM: 0.8,
  },
  credit: { above45: 9.2, above45Limit: 15, arrears: 0.42, arrearsAppetite: 1.0, arrearsQ2: 0.38, costOfRiskBps: 6, costOfRiskQ2Bps: 5 },
  liquidity: { nsfr: 117, nsfrAmber: 115, wholesale: 34, wholesaleCeiling: 40 },
  tradeoff: { agreed: "14 Apr 2026", overdueDays: 27, uplift: 6.2, upliftLimit: 5, acceptance: 1.1, acceptanceLimit: 0.8, fraudBp: 0.9, fraudLimitBp: 1.5 },
  outcomes: [
    { name: "Products & services", status: "within" as const, inTolerance: 3, measures: 3, key: "14 of 14 product reviews done", owner: "Chief Customer Officer" },
    { name: "Price & value", status: "within" as const, inTolerance: 3, measures: 3, key: "Savings rates reviewed against fair value", owner: "Head of Savings" },
    { name: "Consumer understanding", status: "amber" as const, inTolerance: 2, measures: 3, key: "Letters understood 71% · target 80%", owner: "Chief Customer Officer" },
    { name: "Consumer support", status: "amber" as const, inTolerance: 1, measures: 3, key: "Vulnerable exceptions 16.9 per 10,000 · amber at 14", owner: "Chief Customer Officer" },
  ],
  callWait: { value: "6m 40s", target: "5m" },
  letters: { pct: 71, target: 80 },
  vuln: { series: SERIES["u-vuln"].map((p) => p.value), labels: SERIES["u-vuln"].map((p) => p.label), amber: 14, red: 18, quartersAmber: 3, basis: "per 10,000 contacts" },
  complaints: { basis: "per 1,000 accounts", quarters: ["Q4 25", "Q1 26", "Q2 26", "Q3 26"], perThousand: [1.6, 1.7, 1.8, 2.1], uphold: 31, upholdQ2: 27, upheld: 118, referred: 381, themes: [{ theme: "Savings account access", share: 34 }, { theme: "Mortgage rate-change letters", share: 21 }, { theme: "App login", share: 14 }] },
  rateError: { customers: 2300, contacted: 1720, redressK: 410, due: "31 Dec" },
  restriction: {
    breaches: RESTRICTION.breachesAccounts,
    tested: RESTRICTION.tested,
    previous: RESTRICTION.previousRun.breachesAccounts,
    customers: RESTRICTION.breachesCustomers,
    exited: RESTRICTION.previouslyExited,
    untested: RESTRICTION.untested.reduce((a, u) => a + u.count, 0),
    blockFired: 1208,
    runs: [
      { label: "Jul", value: 38 },
      { label: "Aug", value: RESTRICTION.previousRun.breachesAccounts },
      { label: "Sep", value: RESTRICTION.breachesAccounts },
    ],
    clausesUnsupported: 1,
    clauses: 4,
  },
  escalation: {
    medianMonths: Number(KRI_DETAIL.latency.median.split(" ")[0]),
    issues: KRI_DETAIL.latency.n,
    notEscalated: KRI_DETAIL.latency.unescalated.length,
    unescalated: KRI_DETAIL.latency.unescalated,
    overdueChecks: 26_900,
    overdueTarget: 10_000,
    actionsClosed: 42,
    downgraded: 2,
    backlogMonths: 31,
    backlogCommitted: 12,
    extensions: 3,
    extensionLimit: 2,
    removedFromPack: 1,
  },
  culture: { speakUp: 9, speakUpQ2: 5, safe: 78, safeTarget: 80 },
  sanctions: { rules: 39, entries: 3088, weeksNoAlerts: 3, expectedPerWeek: 42 },
  monitoring: { coverage: 94.0, records: "2.4m" },
  pack: { items: PACK_ITEMS.length },
  unmapped: { launch: "Business current account launch", when: "Q1 2027", accounts: 18_000 },
};

export function consumerDuty() {
  const o = FIG.outcomes;
  const amber = o.filter((x) => x.status === "amber").length;
  const inTol = o.reduce((a, x) => a + x.inTolerance, 0);
  const total = o.reduce((a, x) => a + x.measures, 0);
  return { amber, outcomes: o.length, inTol, total, text: `${amber} of ${o.length} outcomes amber · ${inTol} of ${total} measures in tolerance` };
}

export function signOffTotals() {
  const all: SignOffMark[] = SIGNOFF_HISTORY.flatMap((o) => o.marks);
  const count = (k: SignOffMark) => all.filter((m) => m === k).length;
  return { cells: all.length, onTime: count("on_time"), late: count("late"), missing: count("missing"), early: count("early") };
}

export const issuesFound = () => ({ ...ISSUES_FOUND, firstPct: Math.round((ISSUES_FOUND.by[0].n / ISSUES_FOUND.total) * 100) });
export const journeysWithoutOwner = () => ({ n: JOURNEYS.filter((j) => !j.riskOwner).length, of: JOURNEYS.length });

export function agentFigures(waitingDrafts: number) {
  return { agents: AGENTS.length, checksThisWeek: totalChecks(), findings: FINDINGS.length, drafts: waitingDrafts, queue: QUEUE.length, withoutApproval: 0, packHoursWas: 41, packHours: 9 };
}

export const mortgageHeadroomM = () => ftbHeadroomM(measure("u-hltv").limit!);
export const appetiteUsedPct = () => Math.round((measure("u-hltv").actual! / measure("u-hltv").limit!) * 100);
export const rateErrorPct = () => Math.round((FIG.rateError.contacted / FIG.rateError.customers) * 100);
export const mortgagePlanPct = () => Math.round((FIG.mortgages.lentBn / FIG.mortgages.planBn) * 100);
export const mortgagePaceGapPts = () => Math.round(FIG.mortgages.pace * 100) - mortgagePlanPct();

/* ── Attestation and owners ──────────────────────────────────────────── */

export const attestationOf = (id: string): AttestState => measure(id).attest.state;
export function attestationThisMonth() {
  const s = MEASURES.map((m) => m.attest.state);
  return { attested: s.filter((x) => x === "attested").length, due: s.filter((x) => x === "due").length, unconfirmed: s.filter((x) => x === "unconfirmed").length, total: s.length };
}
export function attestationRecord() {
  const r = signOffTotals();
  return { onTime: r.onTime, cells: r.cells, late: r.late, missing: r.missing, early: r.early };
}

/** Owners: every risk owner in the measure table, plus the Head of Compliance as reporting decider. */
const DRAFT_TARGET: Record<string, string[]> = {
  "Head of Financial Crime": ["Head of Financial Crime"],
  Treasurer: ["Treasurer"],
  "Chief Financial Officer": ["CFO"],
  "Head of Compliance": ["Head of Compliance"],
  "Data owner (payments)": ["Feed owner"],
};
export const OWNER_ROLES: { role: string; targets: string[] }[] = [...new Set(MEASURES.map((m) => m.owner))].map((role) => ({ role, targets: DRAFT_TARGET[role] ?? [role] }));

export function ownerRows(openDraftIds: string[], draftTargets: Record<string, string>) {
  return OWNER_ROLES.map((o) => {
    const ms = MEASURES.filter((m) => m.owner === o.role);
    const offTrack = ms.filter((m) => m.status !== "within").length;
    const actions = openDraftIds.filter((id) => o.targets.some((x) => (draftTargets[id] ?? "").startsWith(x))).length;
    const att = ms.map((m) => m.attest.state);
    const attest: AttestState | "none" = !ms.length ? "none" : att.includes("unconfirmed") ? "unconfirmed" : att.includes("due") ? "due" : "attested";
    const worst = ms.map((m) => m.status);
    const status: MeasureStatus | "none" = !ms.length ? "none" : (["red", "unconfirmed", "amber", "projected", "within"] as MeasureStatus[]).find((s) => worst.includes(s))!;
    return { role: o.role, measures: ms, offTrack, actions, attest, status };
  });
}

export function roleOf(personId: string): string {
  const r = PEOPLE[personId]?.roleShort ?? personId;
  return r === "BRC chair" ? "Risk Committee Chair" : r === "CRO" ? "Chief Risk Officer" : r;
}

export const ENFORCEMENT_THEMES: { theme: string; source: string; measureId: string }[] = [
  { theme: "High-risk customers onboarded despite a restriction", source: "FCA final notice · 2024", measureId: "u-restriction" },
  { theme: "Financial-crime controls not scaling with growth", source: "FCA final notice · 2025", measureId: "u-capacity" },
  { theme: "Transactions not reaching monitoring", source: "Enforcement theme · notice unconfirmed", measureId: "u-screening" },
];

/* ── Dates, events and standing items ────────────────────────────────── */

export function daysToCommittee(now: Date = new Date()): number {
  const [d, mon, y] = FIRM.nextBrc.split(" ");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const brc = Date.UTC(Number(y), months.indexOf(mon), Number(d));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((brc - today) / 86_400_000));
}
export const AS_AT_LABEL = "As at 30 Sep 2026";

export const SINCE_LAST_BOARD: { date: string; text: string; tag?: string; rail: "red" | "amber" | "grey"; drawer: string; ai?: boolean }[] = [
  { date: "26 Oct", text: "Restriction breach logged", rail: "red", drawer: "event:e-r03" },
  { date: "15 Oct", text: "Item removed from pack flagged", rail: "amber", drawer: "removed", ai: true },
  { date: "Sep", text: "Critical security finding opened", rail: "amber", drawer: "metric:u-secfind" },
  { date: "Aug", text: "Alert queue passed amber", rail: "amber", drawer: "metric:u-capacity" },
];

export function stillUnresolved() {
  return [
    { text: "Vulnerable exceptions amber", duration: `${FIG.vuln.quartersAmber} quarters`, drawer: "removed" },
    { text: "Customer-check backlog", duration: `${FIG.escalation.backlogMonths} months vs ${FIG.escalation.backlogCommitted}`, drawer: "badnews" },
    { text: "Issues not escalated", duration: `${FIG.escalation.notEscalated} issues`, drawer: "badnews" },
    { text: "Tension review", duration: `${FIG.tradeoff.overdueDays} days overdue`, drawer: "franchise:O2" },
  ];
}

export function thresholdCells(m: Measure) {
  const u = m.unit ?? "";
  if (m.direction === "status") return { amber: "—", limit: m.comparator.replace(/^appetite:? ?/, "") };
  if (m.id === "u-growth") return { amber: `< ${m.amber}${u}`, limit: `< ${m.limit}${u}` };
  return { amber: m.amber !== undefined ? `${m.amber}${u}` : "—", limit: m.limit !== undefined ? `${m.limit}${u}` : "—" };
}

export function timeToThreshold(m: Measure): string {
  if (m.status === "red") return "Past limit";
  if (m.status === "amber") return "Past amber";
  if (m.status === "unconfirmed") return "—";
  return m.projection ? m.projection.replace(/^amber /, "Amber ") : "—";
}

/* ── Consistency checks ──────────────────────────────────────────────── */

export function validateBoardStore(): string[] {
  const errs: string[] = [];
  const c = postureCounts();
  if (MEASURES.length !== 12) errs.push(`expected 12 measures, found ${MEASURES.length}`);
  if (new Set(MEASURES.map((m) => m.id)).size !== 12) errs.push("duplicate measure id");
  const want = { within: 4, projected: 2, amber: 4, red: 1, unconfirmed: 1 };
  for (const [k, v] of Object.entries(want)) if (c[k as MeasureStatus] !== v) errs.push(`posture ${k} ${c[k as MeasureStatus]}, expected ${v}`);
  const r = rollupTotals();
  if (r.l2 !== 37 || r.l3 !== 95 || r.below !== 132) errs.push(`roll-up ${r.l2} + ${r.l3} = ${r.below}, expected 37 + 95 = 132`);
  if (r.offTrack !== 14) errs.push(`off track below ${r.offTrack}, expected 14`);
  if (r.unconfirmed !== 3) errs.push(`unconfirmed below ${r.unconfirmed}, expected 3`);
  const bm = bandMedians();
  if (!(bm.top <= bm.emerging)) {
    const wide = MEASURES.filter((m) => m.tier === "top" && (bandWidth(m) ?? 0) > bm.emerging).map((m) => m.id);
    errs.push(`median top-risk band ${bm.top.toFixed(3)} wider than emerging ${bm.emerging.toFixed(3)}: ${wide.join(", ")}`);
  }
  const objWant: Record<ObjId, ObjStatus> = { O1: "on_track", O2: "at_risk", O3: "off_track", O4: "at_risk" };
  for (const o of OBJECTIVE_LIST) if (objectiveStatus(o.id) !== objWant[o.id]) errs.push(`objective ${o.id} ${objectiveStatus(o.id)}, expected ${objWant[o.id]}`);
  if (!(FIG.savings.balancesBn > FIG.savings.planBn) || measure("u-capacity").status !== "amber") errs.push("O2 exception: savings must be ahead of plan with the alert queue at amber");
  const a = attestationThisMonth();
  if (a.attested !== 8 || a.due !== 3 || a.unconfirmed !== 1) errs.push(`attestation ${a.attested}/${a.due}/${a.unconfirmed}, expected 8/3/1`);
  const rd = routesDecided();
  if (rd.decided !== 1 || rd.total !== 7) errs.push(`routes ${rd.decided} of ${rd.total}, expected 1 of 7`);
  if (POLICIES.total !== 46 || policiesTracked() !== 41) errs.push(`policies ${policiesTracked()} of ${POLICIES.total}, expected 41 of 46`);
  if (statusChanges().length !== 4 || newMeasures().length !== 1) errs.push(`status changes ${statusChanges().length} · new ${newMeasures().length}, expected 4 · 1`);
  const cd = consumerDuty();
  if (cd.inTol !== 9 || cd.total !== 12 || cd.amber !== 2) errs.push("Consumer Duty must be 2 of 4 amber, 9 of 12 in tolerance");
  if (FIG.capacity.perHandler !== 30_160 || FIG.capacity.restoreNeeded !== 13) errs.push("capacity figures do not compute");
  const s = signOffTotals();
  if (s.cells !== 60) errs.push("sign-off cells do not sum to 60");
  if (ISSUES_FOUND.by.reduce((x, b) => x + b.n, 0) !== ISSUES_FOUND.total) errs.push("issues found do not sum to the total");
  if (mortgageHeadroomM() !== 96) errs.push(`mortgage headroom £${mortgageHeadroomM()}m, expected £96m`);
  for (const m of MEASURES) if (m.statement.split(" ").length > 12) errs.push(`${m.id} appetite statement over 12 words`);
  return errs;
}

if (process.env.NODE_ENV === "development") {
  const errs = validateBoardStore();
  if (errs.length) {
    console.error(`boardStore validation failed:\n- ${errs.join("\n- ")}`);
    throw new Error(`boardStore validation failed:\n- ${errs.join("\n- ")}`);
  }
}
