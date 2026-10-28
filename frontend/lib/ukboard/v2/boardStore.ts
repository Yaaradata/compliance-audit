/**
 * UK Board v2 — one source of truth for every board figure. Each figure is held once here (or
 * read from the v1 data module / boardMemberData / agentsData); counts, percentages, headroom,
 * posture and every "n of m" are computed by selectors. Components read numbers only from here.
 * validateBoardStore() fails loudly if any cross-check breaks (run in development and in tests).
 *
 * Pass 0 decisions applied: Consumer Duty amber (2 of 4 outcomes; 9 of 12 measures); £96m is
 * headroom to the 20% appetite limit; high-LTV ▲ 0.3 pts vs Q2 (17.3% → 17.6%); arrears 0.42%;
 * evidence to 26 Oct, measures as at 30 Sep; existing vs-Q2 deltas kept; low-EPC in Emerging.
 */
import { CAPACITY, EVENTS, HORIZON, KRI_DETAIL, PACK_ITEMS, RESTRICTION, ROUTES, SERIES, THRESHOLDS } from "../v1/data";
import { AGENTS, FINDINGS, QUEUE, totalChecks } from "./agentsData";
import { ISSUES_FOUND, JOURNEYS, SIGNOFF_HISTORY, type SignOffMark } from "./boardMemberData";

/* ── Number formats (R5) ─────────────────────────────────────────────── */

export const fmt = {
  /** Thousands separators: 9,400 · 26,900. */
  n: (v: number) => v.toLocaleString("en-GB"),
  /** Percentage as stored: 1 decimal only when given. */
  pct: (v: number, dp = 0) => `${v.toFixed(dp)}%`,
  pts: (v: number, dp = 1) => `${Math.abs(v).toFixed(dp)} pts`,
  /** £96m · £2.9bn · £0.8m. */
  gbpM: (m: number) => (m >= 1000 ? `£${(m / 1000).toFixed(1)}bn` : m < 1 ? `£${m.toFixed(1)}m` : `£${Math.round(m)}m`),
  gbpBn: (bn: number) => `£${bn.toFixed(1)}bn`,
  gbpK: (k: number) => `£${k}k`,
  nOfM: (n: number, m: number) => `${fmt.n(n)} of ${fmt.n(m)}`,
  share: (n: number, m: number) => `${Math.round((n / m) * 100)}%`,
};

/* ── The 12 board measures ───────────────────────────────────────────── */

export type MeasureStatus = "red" | "amber" | "projected" | "within" | "unconfirmed";
export type Tier = "obligatory" | "top" | "emerging";
export type HomeTab = "briefing" | "growth" | "customers" | "decisions" | "regulator" | "ownership" | "ai";

export interface Delta {
  value: number;
  unit: "pts" | "days" | "";
  worse: boolean;
  dp?: number;
}

export interface Measure {
  id: string;
  name: string;
  tier: Tier;
  type: "outcome" | "early_warning";
  direction: "higherIsWorse" | "lowerIsWorse" | "status";
  /** Display value and comparator, written once. */
  value: string;
  comparator: string;
  /** Numeric position for the appetite chart (unconfirmed and status-only measures have none). */
  actual?: number;
  amber?: number;
  limit?: number;
  status: MeasureStatus;
  projection?: string;
  /** Quarters to amber on the straight-line projection. */
  quartersToAmber?: number;
  delta?: Delta;
  owner: string;
  home: HomeTab;
  /** Objective (business line) the measure belongs to. */
  objectiveId?: "O1" | "O2" | "O3" | "O4";
}

const t = THRESHOLDS;
const hltvSeries = SERIES["u-hltv"];
const hltvNow = hltvSeries[hltvSeries.length - 1].value;
const hltvQ2 = hltvSeries[hltvSeries.length - 2].value;
const handlersNow = CAPACITY.handlers[CAPACITY.handlers.length - 1];

export const MEASURES: Measure[] = [
  {
    id: "u-restriction",
    name: "Customer restriction",
    tier: "obligatory",
    type: "outcome",
    direction: "status",
    value: `${RESTRICTION.breachesAccounts} breaches · ${fmt.n(RESTRICTION.tested)} tested`,
    comparator: "appetite 0",
    status: "red",
    delta: { value: RESTRICTION.breachesAccounts - RESTRICTION.previousRun.breachesAccounts, unit: "", worse: true },
    owner: "Head of Financial Crime",
    home: "regulator",
    objectiveId: "O2",
  },
  {
    id: "u-tm",
    name: "Monitoring coverage",
    tier: "obligatory",
    type: "outcome",
    direction: "lowerIsWorse",
    value: "94.0% of 2.4m records",
    comparator: "",
    status: "unconfirmed",
    delta: { value: -3.1, unit: "pts", worse: true },
    owner: "Data owner (payments)",
    home: "ownership",
    objectiveId: "O4",
  },
  {
    id: "u-sanctions",
    name: "Sanctions list coverage",
    tier: "obligatory",
    type: "outcome",
    direction: "lowerIsWorse",
    value: `1.3% · ${fmt.nOfM(39, 3088)}`,
    comparator: "",
    status: "unconfirmed",
    owner: "Head of Financial Crime",
    home: "regulator",
    objectiveId: "O4",
  },
  {
    id: "u-cd",
    name: "Consumer Duty outcomes",
    tier: "obligatory",
    type: "outcome",
    direction: "status",
    value: "", // computed below from the outcome detail
    comparator: "tolerance",
    status: "amber",
    owner: "Chief Customer Officer",
    home: "customers",
    objectiveId: "O4",
  },
  {
    id: "u-capacity",
    name: "Alert queue age",
    tier: "top",
    type: "early_warning",
    direction: "higherIsWorse",
    value: "19 days",
    comparator: `amber at ${t["u-capacity"].amber}`,
    actual: 19,
    amber: t["u-capacity"].amber,
    limit: t["u-capacity"].red,
    status: "amber",
    delta: { value: 7, unit: "days", worse: true },
    owner: "Head of Financial Crime",
    home: "growth",
    objectiveId: "O2",
  },
  {
    id: "u-lcr",
    name: "Liquidity (LCR)",
    tier: "top",
    type: "early_warning",
    direction: "lowerIsWorse",
    value: "162%",
    comparator: `amber at ${t["u-lcr"].amber}%`,
    actual: 162,
    amber: t["u-lcr"].amber,
    limit: t["u-lcr"].red,
    status: "projected",
    projection: "amber in about 9 weeks",
    quartersToAmber: 1,
    delta: { value: -6, unit: "pts", worse: true, dp: 0 },
    owner: "Treasurer",
    home: "growth",
    objectiveId: "O3",
  },
  {
    id: "u-nsfr",
    name: "Stable funding (NSFR)",
    tier: "top",
    type: "early_warning",
    direction: "lowerIsWorse",
    value: "117%",
    comparator: `amber at ${t["u-nsfr"].amber}%`,
    actual: 117,
    amber: t["u-nsfr"].amber,
    limit: t["u-nsfr"].red,
    status: "projected",
    projection: "amber next quarter",
    quartersToAmber: 1,
    delta: { value: -8, unit: "pts", worse: true, dp: 0 },
    owner: "Treasurer",
    home: "growth",
    objectiveId: "O3",
  },
  {
    id: "u-hltv",
    name: "High-LTV lending",
    tier: "top",
    type: "early_warning",
    direction: "higherIsWorse",
    value: `${hltvNow}% of new lending`,
    comparator: `amber ${t["u-hltv"].amber}% · limit ${t["u-hltv"].red}%`,
    actual: hltvNow,
    amber: t["u-hltv"].amber,
    limit: t["u-hltv"].red,
    status: "within",
    projection: "amber by Q2 2027",
    delta: { value: Math.round((hltvNow - hltvQ2) * 10) / 10, unit: "pts", worse: true },
    owner: "Chief Credit Officer",
    home: "growth",
    objectiveId: "O1",
  },
  {
    id: "u-wholesale",
    name: "Wholesale funding",
    tier: "top",
    type: "outcome",
    direction: "higherIsWorse",
    value: "34%",
    comparator: `ceiling ${t["u-wholesale"].red}%`,
    actual: 34,
    amber: t["u-wholesale"].amber,
    limit: t["u-wholesale"].red,
    status: "within",
    delta: { value: 1, unit: "pts", worse: true, dp: 0 },
    owner: "Treasurer",
    home: "growth",
    objectiveId: "O3",
  },
  {
    id: "u-cet1",
    name: "Capital (CET1)",
    tier: "top",
    type: "outcome",
    direction: "lowerIsWorse",
    value: "16.8%",
    comparator: `limit ${t["u-cet1"].red}%`,
    actual: 16.8,
    amber: t["u-cet1"].amber,
    limit: t["u-cet1"].red,
    status: "within",
    delta: { value: -0.2, unit: "pts", worse: true },
    owner: "Chief Financial Officer",
    home: "growth",
  },
  {
    id: "u-ibs",
    name: "Service disruption",
    tier: "top",
    type: "outcome",
    direction: "higherIsWorse",
    value: "58% of impact tolerance used",
    comparator: "tolerance 100%",
    actual: 58,
    amber: 75,
    limit: 100,
    status: "within",
    delta: { value: 4, unit: "pts", worse: true, dp: 0 },
    owner: "Chief Operating Officer",
    home: "ownership",
    objectiveId: "O4",
  },
  {
    id: "u-climate",
    name: "Low-EPC lending",
    tier: "emerging",
    type: "outcome",
    direction: "higherIsWorse",
    value: "7.4%",
    comparator: "appetite 10%",
    actual: 7.4,
    limit: 10,
    status: "within",
    delta: { value: 0.2, unit: "pts", worse: true },
    owner: "Chief Credit Officer",
    home: "growth",
    objectiveId: "O1",
  },
];

export const measure = (id: string) => {
  const m = MEASURES.find((x) => x.id === id);
  if (!m) throw new Error(`boardStore: unknown measure ${id}`);
  return m;
};

/** "▲ 7 days" / "▼ 8 pts"; colour comes from `worse`, never from the arrow direction. */
export function deltaText(d?: Delta): string {
  if (!d) return "no change";
  const arrow = d.value > 0 ? "▲" : "▼";
  const v = Math.abs(d.value);
  if (d.unit === "pts") return `${arrow} ${v.toFixed(d.dp ?? 1)} pts`;
  if (d.unit === "days") return `${arrow} ${v} days`;
  return `${arrow} ${v}`;
}

/** Appetite position on one scale (0–120, % of appetite used; further right = worse). */
export function position(m: Measure): { actual?: number; amber?: number; limit: number; projection?: number } {
  if (m.id === "u-restriction") return { actual: 120, limit: 100 }; // appetite 0: any breach is past the limit
  if (m.actual === undefined || m.limit === undefined) return { limit: 100 };
  const ratio = (v: number) => (m.direction === "lowerIsWorse" ? (m.limit! / v) * 100 : (v / m.limit!) * 100);
  return {
    actual: Math.min(120, ratio(m.actual)),
    amber: m.amber !== undefined ? ratio(m.amber) : undefined,
    limit: 100,
    projection: m.projection && m.amber !== undefined ? ratio(m.amber) : undefined,
  };
}

/* ── Posture (computed) ──────────────────────────────────────────────── */

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

export function measuresByTier() {
  const tiers: Tier[] = ["obligatory", "top", "emerging"];
  return tiers.map((tier) => ({
    tier,
    rows: MEASURES.filter((m) => m.tier === tier).sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)),
  }));
}

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
  complaints: { quarters: ["Q4 25", "Q1 26", "Q2 26", "Q3 26"], perThousand: [1.6, 1.7, 1.8, 2.1], uphold: 31, upholdQ2: 27, upheld: 118, referred: 381, themes: [{ theme: "Savings account access", share: 34 }, { theme: "Mortgage rate-change letters", share: 21 }, { theme: "App login", share: 14 }] },
  rateError: { customers: 2300, contacted: 1720, redressK: 410, due: "31 Dec" },
  restriction: {
    breaches: RESTRICTION.breachesAccounts,
    tested: RESTRICTION.tested,
    previous: RESTRICTION.previousRun.breachesAccounts,
    customers: RESTRICTION.breachesCustomers,
    exited: RESTRICTION.previouslyExited,
    untested: RESTRICTION.untested.reduce((a, u) => a + u.count, 0),
    blockFired: 1208,
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
  },
  sanctions: { rules: 39, entries: 3088, weeksNoAlerts: 3, expectedPerWeek: 42 },
  monitoring: { coverage: 94.0, records: "2.4m" },
  pack: { items: PACK_ITEMS.length },
  unmapped: { launch: "Business current account launch", when: "Q1 2027", accounts: 18_000 },
};

/** Consumer Duty headline, computed from the four outcomes. */
export function consumerDuty() {
  const o = FIG.outcomes;
  const amber = o.filter((x) => x.status === "amber").length;
  const inTol = o.reduce((a, x) => a + x.inTolerance, 0);
  const total = o.reduce((a, x) => a + x.measures, 0);
  return { amber, outcomes: o.length, inTol, total, text: `${amber} of ${o.length} outcomes amber · ${inTol} of ${total} measures in tolerance` };
}
measure("u-cd").value = consumerDuty().text;

export function reportingEvents() {
  return EVENTS.map((e) => {
    const rs = ROUTES.filter((r) => r.eventId === e.eventId);
    return { id: e.eventId, day: e.dayN, decided: rs.filter((r) => r.status === "decided").length, routes: rs.length };
  });
}

export const routesDecided = () => ({ decided: ROUTES.filter((r) => r.status === "decided").length, total: ROUTES.length });

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

/** Headroom to the 20% high-LTV appetite limit on the full-year plan, in £m. */
export const mortgageHeadroomM = () => Math.round(((measure("u-hltv").limit! - measure("u-hltv").actual!) / 100) * FIG.mortgages.planBn * 1000);
export const appetiteUsedPct = () => Math.round((measure("u-hltv").actual! / measure("u-hltv").limit!) * 100);
export const rateErrorPct = () => Math.round((FIG.rateError.contacted / FIG.rateError.customers) * 100);
export const mortgagePlanPct = () => Math.round((FIG.mortgages.lentBn / FIG.mortgages.planBn) * 100);
export const mortgagePaceGapPts = () => Math.round(FIG.mortgages.pace * 100) - mortgagePlanPct();

/* ── Consistency checks (§7) ─────────────────────────────────────────── */

export function validateBoardStore(): string[] {
  const errs: string[] = [];
  const c = postureCounts();
  if (MEASURES.length !== 12) errs.push(`expected 12 measures, found ${MEASURES.length}`);
  if (Object.values(c).reduce((a, b) => a + b, 0) !== 12) errs.push("status counts do not sum to 12");
  if (new Set(MEASURES.map((m) => m.id)).size !== MEASURES.length) errs.push("duplicate measure id");
  const cd = consumerDuty();
  if (cd.inTol !== 9 || cd.total !== 12) errs.push(`Consumer Duty measures ${cd.inTol} of ${cd.total}, expected 9 of 12`);
  if (cd.amber !== 2) errs.push(`Consumer Duty amber outcomes ${cd.amber}, expected 2`);
  if (measure("u-cd").status !== (cd.amber ? "amber" : "within")) errs.push("Consumer Duty status does not follow its outcomes");
  if (FIG.capacity.perHandler !== 30_160) errs.push(`members per handler ${FIG.capacity.perHandler}, expected 30,160`);
  if (FIG.capacity.restoreNeeded !== 13) errs.push(`restore handlers ${FIG.capacity.restoreNeeded}, expected 13`);
  const s = signOffTotals();
  if (s.cells !== 60 || s.onTime + s.late + s.missing + s.early !== 60) errs.push("sign-off cells do not sum to 60");
  if (ISSUES_FOUND.by.reduce((a, b) => a + b.n, 0) !== ISSUES_FOUND.total) errs.push("issues found do not sum to the total");
  if (FIG.rateError.contacted > FIG.rateError.customers) errs.push("rate-error contacted exceeds customers");
  if (agentFigures(QUEUE.length).agents !== AGENTS.length) errs.push("agent count differs from roster");
  for (const m of MEASURES) if (!m.home) errs.push(`${m.id} has no home tab`);
  if (mortgageHeadroomM() !== 96) errs.push(`mortgage headroom £${mortgageHeadroomM()}m, expected £96m`);
  return errs;
}

if (process.env.NODE_ENV === "development") {
  const errs = validateBoardStore();
  if (errs.length) throw new Error(`boardStore validation failed:\n- ${errs.join("\n- ")}`);
}
