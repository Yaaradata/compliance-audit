/**
 * UK Board v2 — tab content built from the existing data only (no new values).
 * Plain board wording; codes stay in drawer evidence. Agent data lives in agentsData.ts.
 */
import { CAPACITY, PACK_ITEMS, RESTRICTION, ROUTES, SERIES, UNITS } from "../v1/data";
import { CHECK_ORDER } from "../v1/selectors";
import { headlineCounts, METRICS, objectiveMetrics, OBJECTIVES, rowState, verdict, type MetricMeta, type ObjectiveId, type Verdict } from "./board";

export type Persona = "board" | "chair" | "cro";

/* ── Plain words (face and drawer prose; codes only under Evidence) ── */

const PLAIN: [RegExp, string][] = [
  [/\bBRC\b/g, "Risk Committee"],
  [/\bERC\b/g, "Executive Risk Committee"],
  [/\bCDD\b/g, "customer checks"],
  [/\battestations?\b/gi, "sign-off"],
  [/\battesting SMF\b/gi, "signing executive"],
  [/\battest\b/gi, "sign off"],
  [/\bmanifest\b/gi, "board pack"],
  [/\bpopulation test\b/gi, "full customer check"],
  [/\bVREQ\b/g, "voluntary restriction"],
  [/\bSMF\d+\b/g, "senior manager"],
  [/\breconciliation\b/gi, "data check"],
  [/\bfeed\b/gi, "data"],
  [/\bSUP 15\.3\b/g, "FCA rule"],
  [/\bFundamental Rule 7\b/g, "PRA rule"],
  [/\bFR7\b/g, "PRA rule"],
];

export function plain(text: string): string {
  return PLAIN.reduce((t, [re, to]) => t.replace(re, to), text);
}

/* ── Franchises (Overview) ────────────────────────────────────────── */

export interface Franchise {
  id: ObjectiveId;
  name: string;
  verdict: Verdict;
  big: string;
  line: string;
  trend: string;
  trendWorse: boolean;
  /** Draft ids that make up its path to green. */
  pathDrafts: string[];
  spark?: number[];
}

const FRANCHISE_COPY: Record<ObjectiveId, Omit<Franchise, "id" | "verdict">> = {
  O1: { name: "Mortgages", big: "£96m headroom", line: "88% of high-LTV appetite used · amber by Q2 2027", trend: "+1.5 pts vs Q2", trendWorse: false, pathDrafts: [], spark: SERIES["u-hltv"].map((p) => p.value) },
  O2: { name: "Savings & new members", big: "2 of 3 limits broken", line: "Customers transacting before checks", trend: "members +31%, handlers +9%", trendWorse: true, pathDrafts: ["d-t25-choice", "d-t26-redecide", "d-t227-contain"], spark: CAPACITY.queueAge.map((p) => p.value) },
  O3: { name: "Funding & liquidity", big: "NSFR 117%", line: "Reaches amber 115% next quarter", trend: "−8 pts vs Q2", trendWorse: true, pathDrafts: ["d-t212-promo", "d-t24-owner"], spark: SERIES["u-lcr"].map((p) => p.value) },
  O4: { name: "Member protection", big: "2 figures", line: "Monitoring and sanctions coverage not yet confirmed", trend: "—", trendWorse: false, pathDrafts: ["d-t214-remed", "d-t215-sanctions"] },
};

export const FRANCHISES: Franchise[] = OBJECTIVES.map((o) => ({ id: o.id, verdict: verdict(o), ...FRANCHISE_COPY[o.id] }));

export function postureWord(): "RED" | "AMBER" | "GREEN" {
  const v = FRANCHISES.map((f) => f.verdict);
  if (v.includes("fix_first") && v.filter((x) => x === "fix_first").length > 1) return "RED";
  if (v.includes("fix_first") || v.includes("hold") || v.includes("unverified")) return "AMBER";
  return "GREEN";
}

export function postureLine2(): string {
  const c = headlineCounts();
  const heading = METRICS.filter((m) => rowState(m) === "projected").length;
  return `${METRICS.length} board measures: ${c.within_appetite} within appetite (${heading} heading for amber) · ${c.amber} amber · ${c.red} red · ${c.unverified} unconfirmed · 3 decisions for this meeting`;
}

/* ── What changed / not changed (existing deltas) ─────────────────── */

export interface ChangeItem {
  text: string;
  tag: string;
  tone: "red" | "amber" | "grey" | "green";
  drawer: string;
  standing?: string;
}

export const CHANGES: ChangeItem[] = [
  { text: "Alert queue age 12 → 19 days (amber 14)", tag: "Savings", tone: "amber", drawer: "metric:u-capacity" },
  { text: "Restriction breaches up 41 to 112", tag: "Savings", tone: "red", drawer: "metric:u-restriction" },
  { text: "Stable funding (NSFR) down 8 points to 117%", tag: "Funding", tone: "amber", drawer: "metric:u-nsfr" },
  { text: "Liquidity (LCR) down 6 points to 162%", tag: "Funding", tone: "amber", drawer: "metric:u-lcr" },
  { text: "Monitoring coverage down 3.1 points to 94.0%", tag: "Member protection", tone: "grey", drawer: "metric:u-tm" },
  { text: "High-LTV appetite used up 1.5 points to 88%", tag: "Mortgages", tone: "green", drawer: "metric:u-hltv" },
];

export const UNCHANGED: ChangeItem[] = [
  { text: "Vulnerable-customer exceptions amber", tag: "Member protection", tone: "amber", drawer: "removed", standing: "Standing 3 quarters" },
  { text: "Check backlog: 31 months to clear vs 12", tag: "Savings", tone: "amber", drawer: "badnews", standing: "Standing 19 months" },
  { text: "3 issues not escalated after 12 months", tag: "Accountability", tone: "amber", drawer: "badnews", standing: "Standing 12+ months" },
  { text: "Sanctions coverage 1.3% (39 of 3,088)", tag: "Member protection", tone: "grey", drawer: "metric:u-sanctions", standing: "Standing 3 weeks" },
];

/* ── Board measures (Growth & Appetite): plain names and tags ─────── */

export const GROWTH_TIER_ORDER = ["top", "emerging", "obligatory"] as const;
export const GROWTH_TIER_LABEL = { top: "Top risks", emerging: "Emerging risks", obligatory: "Obligatory" } as const;

const ORDER: Record<string, number> = { red: 0, unverified: 1, amber: 2, projected: 3, within_appetite: 4 };

export function measuresByTier(includeGreens: boolean) {
  return GROWTH_TIER_ORDER.map((tier) => ({
    tier,
    rows: METRICS.filter((m) => m.tier === tier && (includeGreens || rowState(m) !== "within_appetite"))
      // credit first within Top
      .sort((a, b) => ORDER[rowState(a)] - ORDER[rowState(b)] || Number(b.unitId === "u-hltv") - Number(a.unitId === "u-hltv")),
  }));
}

export function greensCount() {
  return METRICS.filter((m) => rowState(m) === "within_appetite").length;
}

export const indicatorWord = (m: MetricMeta) => (m.indicatorType === "leading" ? "Early warning" : "Outcome");

/* ── Decision history (existing records only) ─────────────────────── */

export const DECISION_HISTORY = [
  { date: "23 Oct 2026", forum: "Head of Compliance", decision: "Mortgage rate error reportable to the FCA", outcome: "Decided", tone: "green" as const },
  { date: "22 Apr 2026", forum: "Board", decision: "Capital plan approved (CET1 limit 13.5%)", outcome: "Within: 16.8%", tone: "green" as const },
  { date: "14 Apr 2026", forum: "Risk Committee", decision: "Savings onboarding trade-off agreed", outcome: "Outside terms: 2 of 3 limits broken", tone: "red" as const },
  { date: "06 Apr 2026", forum: "Risk Committee", decision: "Temporary 25% high-LTV limit for 6 months", outcome: "Expired 06 Oct; register not updated", tone: "amber" as const },
  { date: "11 Mar 2026", forum: "Board", decision: "Wholesale funding ceiling approved (40%)", outcome: "Within: 34%", tone: "green" as const },
  { date: "11 Mar 2026", forum: "Risk Committee", decision: "High-LTV appetite thresholds approved", outcome: "Within; amber by Q2 2027", tone: "green" as const },
];

/* ── Owners (Accountability) ──────────────────────────────────────── */

const SIGNOFF_DATE = /(\d{2} \w+ 2026)/;

export interface Owner {
  role: string;
  measures: MetricMeta[];
  offTrack: number;
  lastSignOff: string;
  draftIds: string[];
  state: "red" | "amber" | "green" | "grey";
}

const OWNER_ROLES: { role: string; match: (m: MetricMeta) => boolean; targets: string[] }[] = [
  { role: "Head of Financial Crime", match: (m) => m.owner === "Head of Financial Crime", targets: ["Head of Financial Crime"] },
  { role: "Treasurer", match: (m) => m.owner === "Treasurer", targets: ["Treasurer"] },
  { role: "Chief Credit Officer", match: (m) => m.owner === "Chief Credit Officer", targets: ["Chief Credit Officer"] },
  { role: "Head of Compliance", match: (m) => m.owner === "Head of Compliance", targets: ["Head of Compliance"] },
  { role: "Data owner (payments)", match: (m) => m.owner === "Data owner (payments)", targets: ["Feed owner"] },
];

export function owners(draftTargets: Record<string, string>): Owner[] {
  return OWNER_ROLES.map((o) => {
    const ms = METRICS.filter(o.match);
    const states = ms.map(rowState);
    // Completed sign-offs only: skip pending or due dates and failed sign-offs.
    const dates = ms
      .map((m) => UNITS[m.unitId].integrity.attestation)
      .filter((at) => at.pass && !/pending|due/i.test(at.evidence))
      .map((at) => SIGNOFF_DATE.exec(at.evidence)?.[1])
      .filter(Boolean) as string[];
    const draftIds = Object.entries(draftTargets)
      .filter(([, t]) => o.targets.some((x) => t.startsWith(x)))
      .map(([id]) => id);
    const state = states.includes("red") ? "red" : states.includes("unverified") ? "grey" : states.includes("amber") || states.includes("projected") ? "amber" : "green";
    return { role: o.role, measures: ms, offTrack: states.filter((s) => s !== "within_appetite").length, lastSignOff: dates.sort((x, y) => Date.parse(y) - Date.parse(x))[0] ?? "Unconfirmed", draftIds, state };
  });
}

/** Sign-off buckets over the 12 measures (from each measure's existing sign-off check). */
export function signOffBuckets() {
  const signed: MetricMeta[] = [];
  const due: MetricMeta[] = [];
  const unconfirmed: MetricMeta[] = [];
  for (const m of METRICS) {
    const a = UNITS[m.unitId].integrity.attestation;
    if (!a.pass) unconfirmed.push(m);
    else if (/pending|due/i.test(a.evidence)) due.push(m);
    else signed.push(m);
  }
  return { signed, due, unconfirmed };
}

export const allChecksPass = (unitId: string) => CHECK_ORDER.every((k) => UNITS[unitId].integrity[k].pass);

/* ── Regulatory ───────────────────────────────────────────────────── */

export const ROUTE_PLAIN: Record<string, string> = {
  "rt-r03-sup153": "FCA",
  "rt-r03-fr7": "PRA",
  "rt-r03-sar": "Suspicious activity question",
  "rt-117-sup153": "FCA",
  "rt-117-fr7": "PRA",
  "rt-117-sup1511": "FCA conduct rules",
  "rt-117-sar": "Suspicious activity question",
};

export const EVENT_PLAIN: Record<string, string> = {
  "e-r03": "Restriction breached",
  "e-117": "Mortgage rate error affecting 2,300 customers",
};

export function routesFor(eventId: string) {
  return ROUTES.filter((r) => r.eventId === eventId);
}

export const RESTRICTION_ROUTES = RESTRICTION.byRoute.map((b) => ({
  label: b.lane === "product" ? "New savings pot" : b.lane === "migration" ? "Group migration" : "Branch override",
  accounts: b.accounts,
}));

export const ENFORCEMENT_LESSONS = [
  { id: "uk-starling-2024", what: "Opened accounts for high-risk customers despite its own restriction", touches: "Customer restriction", unitId: "u-restriction" },
  { id: "uk-monzo-2025", what: "Controls did not keep pace with rapid customer growth", touches: "Alert queue age", unitId: "u-capacity" },
  { id: "uk-metro-2024", what: "Day-one transactions never reached monitoring", touches: "Monitoring coverage", unitId: "u-tm" },
];

/* ── Pack items for Accountability ────────────────────────────────── */

export const REMOVED_ITEMS = PACK_ITEMS.filter((p) => p.removal);

export function franchiseMetrics(id: ObjectiveId) {
  return objectiveMetrics(id);
}
