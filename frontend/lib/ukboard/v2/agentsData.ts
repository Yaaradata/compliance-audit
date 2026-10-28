/**
 * UK Board v2 — AI agents (new seed data, allowed for the AI Agents tab only).
 * Ties to existing figures: 97 savings-pot breaches, 39,000 alerts a month, 63 handlers,
 * 2 of 9 financial-crime models past validation. Counts are computed, not hard-coded in the UI.
 * Agents watch, draft, test and propose. They never decide, submit or change a live limit.
 */

export type Autonomy = "watch" | "draft" | "propose";
export const AUTONOMY_ORDER: Autonomy[] = ["watch", "draft", "propose"];
export const AUTONOMY_LABEL: Record<Autonomy, string> = { watch: "Watch", draft: "Draft", propose: "Propose" };

export interface Agent {
  id: string;
  name: string;
  does: string;
  status: "running" | "waiting" | "paused";
  checksThisWeek: number;
  quarterCount: string;
  finding: string;
  accountable: string;
  autonomy: Autonomy;
  /** Drafts this agent produced that sit in the approval queue. */
  draftIds: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "appetite",
    name: "Appetite Watch",
    does: "Checks 12 measures daily",
    status: "running",
    checksThisWeek: 12,
    quarterCount: "12 measures watched",
    finding: "Stable funding reaches amber next quarter",
    accountable: "Chief Risk Officer",
    autonomy: "propose",
    draftIds: [],
  },
  {
    id: "pack",
    name: "Board Pack",
    does: "Checks nothing is dropped",
    status: "waiting",
    checksThisWeek: 6,
    quarterCount: "13 qualifying items checked",
    finding: "1 qualifying item removed with no reason",
    accountable: "Company Secretary",
    autonomy: "draft",
    draftIds: ["d-t235-restore", "d-pg5"],
  },
  {
    id: "capacity",
    name: "Growth & Capacity",
    does: "Compares growth with capacity",
    status: "waiting",
    checksThisWeek: 7,
    quarterCount: "6 quarters compared",
    finding: "Campaign in 6 weeks, no resourcing decision",
    accountable: "Head of Financial Crime",
    autonomy: "draft",
    draftIds: ["d-t25-paper"],
  },
  {
    id: "clock",
    name: "Reporting Clock",
    does: "Prepares report-or-not cases",
    status: "running",
    checksThisWeek: 7,
    quarterCount: "2 events, 7 reporting routes",
    finding: "2 events, 1 of 7 routes decided",
    accountable: "Head of Compliance",
    autonomy: "draft",
    draftIds: [],
  },
  {
    id: "readacross",
    name: "Enforcement Read-across",
    does: "Matches fines to our measures",
    status: "running",
    checksThisWeek: 3,
    quarterCount: "3 fines matched",
    finding: "2 fines touch our restriction and monitoring",
    accountable: "Head of Compliance",
    autonomy: "watch",
    draftIds: [],
  },
  {
    id: "tuning",
    name: "Financial-Crime Tuning",
    does: "Tests tighter alert rules",
    status: "waiting",
    checksThisWeek: 6,
    quarterCount: "1 test, 10,000 accounts",
    finding: "Savings pot sits outside the restriction block",
    accountable: "Head of Financial Crime",
    autonomy: "propose",
    draftIds: [],
  },
];

/** Approval queue: existing AI drafts, with board-level copy (title ≤ 8 words, reason ≤ 12 words). */
export const QUEUE: { draftId: string; agentId: string; title: string; reason: string }[] = [
  { draftId: "d-t235-restore", agentId: "pack", title: "Restore the dropped item to the pack", reason: "Qualified, then left with no reason" },
  { draftId: "d-pg5", agentId: "pack", title: "Require a named approver for removals", reason: "Removals need no reason today" },
  { draftId: "d-t236-agenda", agentId: "pack", title: "Agenda item: customer-check backlog review", reason: "Extended 3 times; limit 2" },
  { draftId: "d-t237-review", agentId: "appetite", title: "Review how bad news is escalated", reason: "Median 4.6 months to reach us" },
  { draftId: "d-t25-paper", agentId: "capacity", title: "Resourcing paper for financial crime", reason: "30,160 members per handler, was 25,000" },
];

export const FIXED_RULES = [
  "Never decides",
  "Never sends anything to a regulator",
  "Never changes a live limit or rule",
  "Every action logged and signed off by a named person",
];

export const MODEL_OVERSIGHT = {
  policy: "model risk policy (SS1/23)",
  lastReview: "30 Sep 2026",
  pastValidation: "2 of 9 models past validation",
};

/** Tuning lab: extend the high-risk customer check to the new savings pot (97 breaches). */
export const TUNING = {
  proposal: "Extend the high-risk customer check to the new savings pot",
  breaches: 97,
  test: "4 weeks · two matched groups of 5,000 new accounts",
  alertsPerMonth: 39000,
  handlers: 63,
  options: [
    { id: "A", dial: "Conservative", label: "Tight", caught: 94, extraAlerts: 2100, capacity: "Needs about 3 more handlers", view: "Lowest risk" },
    { id: "B", dial: "Balanced", label: "Balanced", caught: 71, extraAlerts: 900, capacity: "Within current capacity", view: "Recommended" },
    { id: "C", dial: "Growth", label: "Current", caught: 0, extraAlerts: 0, capacity: "—", view: "Breach continues" },
  ],
  recommended: "B",
};

export const ACTIVITY: { type: "CHECK" | "FLAG" | "DRAFT" | "APPROVED" | "REJECTED"; date: string; agentId: string; line: string }[] = [
  { type: "CHECK", date: "27 Oct 2026", agentId: "appetite", line: "NSFR projected to reach amber" },
  { type: "FLAG", date: "26 Oct 2026", agentId: "clock", line: "Restriction breach logged; FCA and PRA opened" },
  { type: "DRAFT", date: "26 Oct 2026", agentId: "clock", line: "Report-or-not cases prepared" },
  { type: "FLAG", date: "25 Oct 2026", agentId: "tuning", line: "97 of 112 breaches via the savings pot" },
  { type: "DRAFT", date: "24 Oct 2026", agentId: "capacity", line: "Resourcing paper drafted" },
  { type: "APPROVED", date: "23 Oct 2026", agentId: "clock", line: "Head of Compliance decided the rate-error case" },
  { type: "FLAG", date: "15 Oct 2026", agentId: "pack", line: "Qualifying item missing from the board pack" },
  { type: "CHECK", date: "14 Oct 2026", agentId: "readacross", line: "3 enforcement cases matched" },
];

export const totalChecks = () => AGENTS.reduce((a, g) => a + g.checksThisWeek, 0);
export const agentName = (id: string) => AGENTS.find((a) => a.id === id)?.name ?? id;
