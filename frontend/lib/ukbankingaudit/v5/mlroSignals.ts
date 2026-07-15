/**
 * v5 MLRO workspace — seeded signals and deterministic detectors.
 * Synthetic overlays only; precedents resolve from precedentCorpus.
 */
import { getPrecedentById } from "./precedentCorpus";
import type { Precedent } from "./types";

export type RuleConfigDirection = "less-sensitive" | "more-sensitive" | "neutral";

/** Seeded TM rule configuration change — product observes, never mutates. */
export type UkRuleConfigChange = {
  ruleId: string;
  ts: string;
  diff: string;
  direction: RuleConfigDirection;
  approver: string;
  rationale: string | null;
  alertBacklogAtChange: {
    atChange: number;
    thirtyDaysPrior: number;
  };
};

export type DispositionReasonWeek = {
  weekLabel: string;
  closed: number;
  reasonCodes: Record<string, number>;
};

export type ScreeningDenominatorClaim = {
  id: string;
  claim: string;
  coveragePct: number | null;
  listName: string | null;
  populationLabel: string | null;
  asOfDate: string;
  populationDefined: boolean;
};

export type CadenceFeasibilityCheck = {
  controlId: string;
  racmRef: string;
  label: string;
  requiredDetectionWindowDays: number;
  substrateRefreshDays: number;
  investigationSlaWorkingDays: number;
  feasible: boolean;
  gapDays: number;
};

/** TM-R17 fires; TM-R42 model uplift does not. */
export const UK_RULE_CONFIG_CHANGES: UkRuleConfigChange[] = [
  {
    ruleId: "TM-R17",
    ts: "2026-03-03T09:41:00Z",
    diff: "threshold £250k → £1m",
    direction: "less-sensitive",
    approver: "A. Whitfield",
    rationale: null,
    alertBacklogAtChange: { atChange: 6880, thirtyDaysPrior: 4120 },
  },
  {
    ruleId: "TM-R42",
    ts: "2026-02-12T14:20:00Z",
    diff: "model uplift v2.3 → v2.4 (quarterly recalibration)",
    direction: "more-sensitive",
    approver: "M. Chen",
    rationale: "Quarterly model recalibration per FCC policy — expected alert volume increase absorbed by L2 capacity plan.",
    alertBacklogAtChange: { atChange: 890, thirtyDaysPrior: 940 },
  },
];

/**
 * Conjunction signal: less-sensitive change while backlog was rising in the prior 30 days.
 * Config changes alone are noise; both conditions must hold.
 */
export function isSuppressionConjunction(change: UkRuleConfigChange): boolean {
  if (change.direction !== "less-sensitive") return false;
  const { atChange, thirtyDaysPrior } = change.alertBacklogAtChange;
  return atChange > thirtyDaysPrior;
}

export function suppressionSignals(): UkRuleConfigChange[] {
  return UK_RULE_CONFIG_CHANGES.filter(isSuppressionConjunction);
}

export function natWestSuppressionPrecedent(): Precedent | undefined {
  return getPrecedentById("uk-natwest-fowler-oldfield-2021");
}

export function nationwideMirrorPrecedent(): Precedent | undefined {
  return getPrecedentById("uk-nationwide-2025");
}

export function starlingScreeningPrecedent(): Precedent | undefined {
  return getPrecedentById("uk-starling-2024");
}

export function nationwideCadencePrecedent(): Precedent | undefined {
  return getPrecedentById("uk-nationwide-2025");
}

/** Weekly disposition reason-code counts — metadata only, no customer content. */
export const DISPOSITION_REASON_WEEKS: DispositionReasonWeek[] = [
  {
    weekLabel: "W-12",
    closed: 1810,
    reasonCodes: { "false-positive": 720, "escalate-l2": 480, "sar-refer": 140, "no-action": 470 },
  },
  {
    weekLabel: "W-10",
    closed: 1840,
    reasonCodes: { "false-positive": 690, "escalate-l2": 510, "sar-refer": 150, "no-action": 490 },
  },
  {
    weekLabel: "W-8",
    closed: 1870,
    reasonCodes: { "false-positive": 640, "escalate-l2": 520, "sar-refer": 160, "no-action": 550 },
  },
  {
    weekLabel: "W-6",
    closed: 1880,
    reasonCodes: { "false-positive": 580, "escalate-l2": 480, "sar-refer": 120, "no-action": 700 },
  },
  {
    weekLabel: "W-4",
    closed: 1885,
    reasonCodes: { "false-positive": 420, "escalate-l2": 310, "sar-refer": 85, "no-action": 1070 },
  },
  {
    weekLabel: "W-2",
    closed: 1895,
    reasonCodes: { "false-positive": 280, "escalate-l2": 140, "sar-refer": 55, "no-action": 1420 },
  },
  {
    weekLabel: "This week",
    closed: 1900,
    reasonCodes: { "false-positive": 210, "escalate-l2": 90, "sar-refer": 30, "no-action": 1570 },
  },
];

function reasonCodeEntropy(codes: Record<string, number>): number {
  const total = Object.values(codes).reduce((s, n) => s + n, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const n of Object.values(codes)) {
    if (n <= 0) continue;
    const p = n / total;
    h -= p * Math.log2(p);
  }
  return h;
}

export type DispositionDispersionSignal = {
  fires: boolean;
  earlyEntropy: number;
  recentEntropy: number;
  closureDelta: number;
  dominantRecentCode: string;
  dominantRecentShare: number;
  weeks: DispositionReasonWeek[];
};

export function detectDispositionDispersion(
  weeks: DispositionReasonWeek[] = DISPOSITION_REASON_WEEKS,
): DispositionDispersionSignal {
  const early = weeks.slice(0, 3);
  const recent = weeks.slice(-3);
  const earlyEntropy =
    early.reduce((s, w) => s + reasonCodeEntropy(w.reasonCodes), 0) / Math.max(early.length, 1);
  const recentEntropy =
    recent.reduce((s, w) => s + reasonCodeEntropy(w.reasonCodes), 0) / Math.max(recent.length, 1);

  const last = weeks[weeks.length - 1];
  const first = weeks[0];
  const closureDelta = (last?.closed ?? 0) - (first?.closed ?? 0);

  const lastCodes = last?.reasonCodes ?? {};
  const lastTotal = Object.values(lastCodes).reduce((s, n) => s + n, 0) || 1;
  let dominantRecentCode = "no-action";
  let dominantRecentShare = 0;
  for (const [code, count] of Object.entries(lastCodes)) {
    const share = count / lastTotal;
    if (share > dominantRecentShare) {
      dominantRecentShare = share;
      dominantRecentCode = code;
    }
  }

  const fires = recentEntropy < earlyEntropy * 0.75 && closureDelta >= 0 && dominantRecentShare > 0.65;

  return {
    fires,
    earlyEntropy,
    recentEntropy,
    closureDelta,
    dominantRecentCode,
    dominantRecentShare,
    weeks,
  };
}

/** v5 screening claims — denominator named or absence flagged as the finding. */
export const MLRO_SCREENING_CLAIMS: ScreeningDenominatorClaim[] = [
  {
    id: "payments",
    claim: "99.94% of payment messages screened against sanctions lists this period",
    coveragePct: 99.94,
    listName: "HM Treasury Consolidated List (full extract)",
    populationLabel: "1,284,732 outbound and inbound payment messages",
    asOfDate: "2026-04-30",
    populationDefined: true,
  },
  {
    id: "customers-onboarding",
    claim: "Full customer screening at onboarding",
    coveragePct: null,
    listName: null,
    populationLabel: null,
    asOfDate: "2026-04-30",
    populationDefined: false,
  },
  {
    id: "customers-list-update",
    claim: "99.9% of active customers re-screened on list update",
    coveragePct: 99.9,
    listName: "HM Treasury Consolidated List",
    populationLabel: "active customer population",
    asOfDate: "2026-04-30",
    populationDefined: false,
  },
];

/** TM monthly batch + 20 working-day SLA — arithmetic impossibility for in-month detection. */
export const CADENCE_FEASIBILITY_CHECKS: CadenceFeasibilityCheck[] = [
  {
    controlId: "AML-C002",
    racmRef: "AML.01.05.02",
    label: "Transaction monitoring alert disposition",
    requiredDetectionWindowDays: 30,
    substrateRefreshDays: 30,
    investigationSlaWorkingDays: 20,
    feasible: false,
    gapDays: 0,
  },
];

export function workingDaysToCalendar(workingDays: number): number {
  return Math.ceil((workingDays * 7) / 5);
}

export function evaluateCadenceFeasibility(
  check: Omit<CadenceFeasibilityCheck, "feasible" | "gapDays">,
): CadenceFeasibilityCheck {
  const investigationCalendar = workingDaysToCalendar(check.investigationSlaWorkingDays);
  const minimumCycle = check.substrateRefreshDays + investigationCalendar;
  const feasible = check.requiredDetectionWindowDays >= minimumCycle;
  const gapDays = feasible ? 0 : minimumCycle - check.requiredDetectionWindowDays;
  return { ...check, feasible, gapDays };
}

export function cadenceFeasibilityResults(): CadenceFeasibilityCheck[] {
  return CADENCE_FEASIBILITY_CHECKS.map(evaluateCadenceFeasibility);
}

export function infeasibleCadenceChecks(): CadenceFeasibilityCheck[] {
  return cadenceFeasibilityResults().filter((c) => !c.feasible);
}
