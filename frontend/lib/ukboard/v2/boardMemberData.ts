/**
 * UK Board v2 — Board member view: new seed values (see TIEOUT.md, "boardMemberData seed").
 * Everything else on the Board member tabs reads the existing v1/v2 data. Pass 0 fixes applied:
 * £96m is headroom to the 20% appetite limit (not amber); vulnerable-customer amber 14 / red 18;
 * arrears 0.42%; no new red this quarter; pack prepared 15 Oct; sign-off months are the month of
 * the numbers (Oct 2025 – Sep 2026); unverified regulatory dates are not shown.
 */
import type { ObjectiveId } from "./board";

export type Tone = "red" | "amber" | "green" | "grey";

/* ── 5.1 Business lines: growth against plan, risk headroom ─────────── */

export interface LineGrowth {
  id: ObjectiveId;
  growthLabel: string;
  /** Actual and plan on the same scale (drives the progress bar). */
  actual: number;
  plan: number;
  /** Plan pace marker as a share of plan (0–1), where the plan is phased. */
  pace?: number;
  growthStatus: string;
  growthTone: Tone;
  riskLabel: string;
  headroom: string;
  /** Unlock or stopping-us line, at most 10 words. */
  unlock: string;
  unlockKind: "unlock" | "stopping";
}

export const LINE_GROWTH: LineGrowth[] = [
  {
    id: "O1",
    growthLabel: "£2.9bn of £4.0bn lending plan",
    actual: 2.9,
    plan: 4.0,
    pace: 0.75,
    growthStatus: "2 pts behind plan pace",
    growthTone: "amber",
    riskLabel: "88% of appetite used",
    headroom: "£96m",
    unlock: "£96m more high-LTV lending before the appetite limit",
    unlockKind: "unlock",
  },
  {
    id: "O2",
    growthLabel: "+£1.1bn balances vs +£0.8bn plan",
    actual: 1.1,
    plan: 0.8,
    growthStatus: "Ahead of plan",
    growthTone: "green",
    riskLabel: "2 of 3 limits broken",
    headroom: "None",
    unlock: "Restore crime-check capacity (+13 handlers)",
    unlockKind: "stopping",
  },
  {
    id: "O3",
    growthLabel: "Wholesale funding 34% vs 40% ceiling",
    actual: 34,
    plan: 40,
    growthStatus: "6 pts inside ceiling",
    growthTone: "green",
    riskLabel: "NSFR 117% vs amber 115%",
    headroom: "2 pts",
    unlock: "Reprice fixed-term savings before Q1",
    unlockKind: "unlock",
  },
  {
    id: "O4",
    growthLabel: "9 of 12 Consumer Duty measures in tolerance",
    actual: 9,
    plan: 12,
    growthStatus: "3 outside tolerance",
    growthTone: "amber",
    riskLabel: "2 measures unconfirmed",
    headroom: "Unconfirmed",
    unlock: "Re-run data checks before 15 Dec",
    unlockKind: "stopping",
  },
];

export const MORTGAGE_BOOK = "£17.9bn";

/* ── Credit quality and financial strength ──────────────────────────── */

export interface Stat {
  label: string;
  value: string;
  against: string;
  tone: Tone;
}

export const CREDIT_QUALITY: Stat[] = [
  { label: "High-LTV share", value: "17.6%", against: "limit 20%", tone: "green" },
  { label: "Above 4.5× income", value: "9.2%", against: "of new lending · limit 15%", tone: "green" },
  { label: "Arrears 3 months+", value: "0.42%", against: "appetite 1.0% · Q2 0.38%", tone: "green" },
  { label: "Cost of risk", value: "6 bps", against: "Q2 5 bps", tone: "green" },
];

/** All four are existing values (u-cet1, u-lcr, u-nsfr, u-wholesale). */
export const FINANCIAL_STRENGTH: (Stat & { unitId: string })[] = [
  { unitId: "u-cet1", label: "Capital (CET1)", value: "16.8%", against: "limit 13.5%", tone: "green" },
  { unitId: "u-lcr", label: "Liquidity (LCR)", value: "162%", against: "amber 150% · ~9 weeks", tone: "amber" },
  { unitId: "u-nsfr", label: "Stable funding (NSFR)", value: "117%", against: "amber 115% · next quarter", tone: "amber" },
  { unitId: "u-wholesale", label: "Wholesale funding", value: "34%", against: "ceiling 40%", tone: "green" },
];

/** Leading indicators sorted by time to threshold. */
export const EARLY_WARNINGS: { name: string; when: string; unitId: string; tone: Tone }[] = [
  { name: "Alert queue age", when: "Past amber since August", unitId: "u-capacity", tone: "amber" },
  { name: "Liquidity (LCR)", when: "Amber in about 9 weeks", unitId: "u-lcr", tone: "amber" },
  { name: "Stable funding (NSFR)", when: "Amber next quarter", unitId: "u-nsfr", tone: "amber" },
  { name: "High-LTV share", when: "Amber by Q2 2027", unitId: "u-hltv", tone: "amber" },
];

/* ── Risk tiers (3 each) ────────────────────────────────────────────── */

export const RISK_TIERS: { tier: "Top" | "Emerging" | "Obligatory"; items: { name: string; status: string; tone: Tone; trend: "up" | "down" | "flat" | "none"; owner: string; drawer: string }[] }[] = [
  {
    tier: "Top",
    items: [
      { name: "Savings growth vs crime-check capacity", status: "Amber", tone: "amber", trend: "up", owner: "Head of Financial Crime", drawer: "metric:u-capacity" },
      { name: "Liquidity and funding headroom narrowing", status: "Amber soon", tone: "amber", trend: "down", owner: "Treasurer", drawer: "metric:u-nsfr" },
      { name: "High-LTV mortgage concentration", status: "Within", tone: "green", trend: "up", owner: "Chief Credit Officer", drawer: "metric:u-hltv" },
    ],
  },
  {
    tier: "Emerging",
    items: [
      { name: "AI impersonation fraud", status: "Not measured", tone: "grey", trend: "none", owner: "Head of Financial Crime", drawer: "horizon" },
      { name: "Agent-initiated payments", status: "Watching", tone: "grey", trend: "none", owner: "Owner not named", drawer: "horizon" },
      { name: "New incident-reporting rules", status: "18 Mar 2027", tone: "grey", trend: "none", owner: "Chief Operating Officer", drawer: "horizon" },
    ],
  },
  {
    tier: "Obligatory",
    items: [
      { name: "Customer restriction", status: "Red", tone: "red", trend: "up", owner: "Head of Financial Crime", drawer: "metric:u-restriction" },
      { name: "Monitoring coverage", status: "Unconfirmed", tone: "grey", trend: "down", owner: "Head of Financial Crime", drawer: "metric:u-tm" },
      { name: "Sanctions list coverage", status: "Unconfirmed", tone: "grey", trend: "flat", owner: "Head of Financial Crime", drawer: "metric:u-sanctions" },
    ],
  },
];

/* ── 5.3 Customers ──────────────────────────────────────────────────── */

/** All four outcomes are within tolerance (existing headline u-cd: 4 of 4); two key measures are amber. */
export const DUTY_OUTCOMES: { outcome: string; tone: Tone; status: string; measure: string; measureTone: Tone; against: string; trend: string; owner: string }[] = [
  { outcome: "Products & services", tone: "green", status: "Within", measure: "14 of 14", measureTone: "green", against: "product reviews done", trend: "No change", owner: "Chief Customer Officer" },
  { outcome: "Price & value", tone: "green", status: "Within", measure: "Reviewed", measureTone: "green", against: "savings rates vs fair value", trend: "No change", owner: "Head of Savings" },
  { outcome: "Consumer understanding", tone: "green", status: "Within", measure: "71%", measureTone: "amber", against: "letters understood · target 80%", trend: "Measure below target", owner: "Chief Customer Officer" },
  { outcome: "Consumer support", tone: "green", status: "Within", measure: "16.9", measureTone: "amber", against: "vulnerable exceptions per 10,000 · amber 14", trend: "Measure amber 3 quarters", owner: "Chief Customer Officer" },
];

export const CALL_WAIT = { value: "6m 40s", target: "5m" };

export const COMPLAINTS = {
  quarters: ["Q4 25", "Q1 26", "Q2 26", "Q3 26"],
  perThousand: [1.6, 1.7, 1.8, 2.1],
  ombudsmanUphold: { now: "31%", detail: "118 of 381", q2: "27%" },
};

export const COMPLAINT_THEMES: { theme: string; share: number }[] = [
  { theme: "Savings account access", share: 34 },
  { theme: "Mortgage rate-change letters", share: 21 },
  { theme: "App login", share: 14 },
];

/** Vulnerable-customer exceptions per 10,000 contacts (existing series u-vuln). */
export const VULN = { series: [14.2, 15.8, 16.9], amber: 14, red: 18, labels: ["Q1 26", "Q2 26", "Q3 26"] };

export const HARM_EVENT = { name: "Mortgage rate error", customers: 2300, contacted: 1720, redress: "£410k", target: "31 Dec" };

export const CULTURE: Stat[] = [
  { label: "Speak-up cases", value: "9", against: "this quarter · Q2 5", tone: "amber" },
  { label: "Days to close", value: "34", against: "median", tone: "grey" },
  { label: "Safe to speak up", value: "78%", against: "of staff · target 80%", tone: "amber" },
  { label: "Retaliation cases", value: "0", against: "this quarter", tone: "green" },
];

/* ── 5.4 Policy tensions (AI-found) ─────────────────────────────────── */

export const TENSIONS: { a: string; b: string; aWants: string; bWants: string; effect: string; status: "Regulatory floor, not tradeable" | "Not agreed" | "Board-agreed trade-off"; tone: Tone; note?: string; drawer: string }[] = [
  {
    a: "Fast digital onboarding",
    b: "Customer checks before transacting",
    aWants: "Open savings accounts in minutes",
    bWants: "No transactions before checks finish",
    effect: "Customers transact before checks finish",
    status: "Regulatory floor, not tradeable",
    tone: "red",
    drawer: "franchise:O2",
  },
  {
    a: "Savings campaign, 8 Dec",
    b: "Alert queue appetite, 14 days",
    aWants: "More new members this winter",
    bWants: "Alerts cleared within 14 days",
    effect: "Campaign adds load to a 19-day queue",
    status: "Not agreed",
    tone: "amber",
    drawer: "decision:1",
  },
  {
    a: "High-LTV first-time buyer target",
    b: "High-LTV appetite, 20%",
    aWants: "More first-time buyer lending",
    bWants: "High-LTV below 20% of new lending",
    effect: "Headroom runs out by Q2 2027 at this pace",
    status: "Board-agreed trade-off",
    tone: "green",
    note: "Review due Q1",
    drawer: "metric:u-hltv",
  },
];

/* ── 5.5 Decision option impacts ────────────────────────────────────── */

export interface OptionImpact {
  option: string;
  growth: string;
  risk: string;
  cost: string;
  toGreen: string;
  recommended?: boolean;
}

export const D1_OPTIONS: OptionImpact[] = [
  { option: "Restore capacity", growth: "Campaign goes ahead · +£300m inflow kept", risk: "Queue below amber", cost: "+13 handlers · ~£0.8m a year", toGreen: "~10 weeks", recommended: true },
  { option: "Pace growth", growth: "Campaign delayed a quarter · −£300m vs plan", risk: "Queue below amber", cost: "None", toGreen: "~6 weeks" },
];

export const D3_OPTIONS: { option: string; impact: string }[] = [
  { option: "Remediation with an owner", impact: "Owner named · ~2 quarters to green" },
  { option: "Time-limited waiver", impact: "6 months · review date set · stays amber" },
  { option: "Recalibration review", impact: "Threshold reviewed · no customer change" },
];

export const D2_BOARD_ASKS = ["Who decides each route, and by when?", "Why are 24,000 openings still not checked?", "What do we tell the 104 customers?"];

export const DUE_FOR_REVIEW: { item: string; detail: string; tone: Tone; drawer: string }[] = [
  { item: "Temporary 25% high-LTV limit", detail: "expired 06 Oct · register not updated", tone: "red", drawer: "metric:u-hltv" },
  { item: "Savings onboarding trade-off", detail: "review 27 days overdue", tone: "red", drawer: "franchise:O2" },
];

/* ── 5.6 Ownership ──────────────────────────────────────────────────── */

export type SignOffMark = "on_time" | "late" | "missing" | "early";

/** Month of the numbers, Oct 2025 – Sep 2026 (each signed early the following month). */
export const SIGNOFF_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

const strip = (overrides: Record<string, SignOffMark>): SignOffMark[] => SIGNOFF_MONTHS.map((m) => overrides[m] ?? "on_time");

export const SIGNOFF_HISTORY: { role: string; marks: SignOffMark[] }[] = [
  { role: "Head of Financial Crime", marks: strip({ Aug: "late", Sep: "late" }) },
  { role: "Treasurer", marks: strip({}) },
  { role: "Chief Credit Officer", marks: strip({}) },
  { role: "Head of Compliance", marks: strip({ Jul: "late" }) },
  { role: "Data owner (payments)", marks: strip({ Jun: "missing", Jul: "missing", Sep: "early" }) },
];

export const ISSUES_FOUND = {
  total: 42,
  by: [
    { line: "First line", n: 16, color: "bg-indigo-500" },
    { line: "Second line", n: 11, color: "bg-sky-400" },
    { line: "Internal audit", n: 9, color: "bg-violet-400" },
    { line: "Regulator", n: 6, color: "bg-rose-400" },
  ],
};

export const JOURNEYS: { journey: string; riskOwner: string | null; controlOwner: string; aligned: boolean; reason?: string; complaints: number }[] = [
  { journey: "Open a savings account", riskOwner: null, controlOwner: "Head of Financial Crime Ops", aligned: false, reason: "Product owner not accountable for the control", complaints: 412 },
  { journey: "Mortgage rate change", riskOwner: "Head of Mortgages", controlOwner: "Mortgage Operations", aligned: true, complaints: 258 },
  { journey: "Vulnerable customer support", riskOwner: "Chief Customer Officer", controlOwner: "Contact Centre Head", aligned: true, complaints: 97 },
  { journey: "Payments", riskOwner: null, controlOwner: "Payments Operations", aligned: false, reason: "No named risk owner for the journey", complaints: 173 },
];

/* ── Regulator relationship and calendar ────────────────────────────── */

export const REGULATOR_RELATIONSHIP: { label: string; value: string; tone: Tone }[] = [
  { label: "Open regulator requests", value: "2", tone: "amber" },
  { label: "Voluntary restriction", value: "In force", tone: "red" },
  { label: "Skilled person reviews", value: "0", tone: "green" },
  { label: "Last supervisory meeting", value: "18 Sep", tone: "grey" },
];

export const REG_CALENDAR: { date: string; item: string; tone: Tone }[] = [
  { date: "8 Nov 2026", item: "Restriction sign-off", tone: "red" },
  { date: "15 Dec 2026", item: "Board Risk Committee", tone: "amber" },
  { date: "18 Mar 2027", item: "Incident and third-party reporting rules start", tone: "grey" },
  { date: "Jul 2027", item: "Consumer Duty annual board report", tone: "grey" },
];

/* ── Briefing meta ──────────────────────────────────────────────────── */

export const PACK_META = "Board pack for 15 Dec · prepared 15 Oct · 12 measures · 3 decisions";
export const SINCE_LAST_BOARD = "Since last board: 6 moved · 0 new red · restriction breaches up 41";
