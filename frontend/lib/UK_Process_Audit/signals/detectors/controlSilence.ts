import type { UkExpectedOperation, UkSignal } from "../types";
import { renderCardCopy } from "../copy";
import { addDaysIso, type DetectorFn, type UkDetectorSnapshot, parseIsoDate } from "./types";

/** Hand-authored — never generate at runtime. */
export const SILENCE_ALTERNATIVE_EXPLANATION =
  "Evidence may have been filed against the parent control, or the control was decommissioned without updating the register. Both are testable from the evidence store.";

const NATIONWIDE_PRECEDENT_ID = "nationwide-2025-12-11";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function monthLabel(iso: string): string {
  const d = parseIsoDate(iso);
  return MONTHS[d.getUTCMonth()]!;
}

function cadenceAdjective(testingFrequency: string): string {
  const f = testingFrequency.toLowerCase();
  if (f.includes("month")) return "monthly";
  if (f.includes("quarter")) return "quarterly";
  if (f.includes("week")) return "weekly";
  if (f.includes("annual") || f.includes("year")) return "annual";
  if (f.includes("continuous") || f.includes("daily")) return "daily";
  return "scheduled";
}

function formatExpectedWindow(misses: UkExpectedOperation[], testingFrequency: string): string {
  const n = misses.length;
  const adj = cadenceAdjective(testingFrequency);
  const first = misses[0]!;
  const last = misses[misses.length - 1]!;
  const y1 = first.expectedBy.slice(0, 4);
  const y2 = last.expectedBy.slice(0, 4);
  const range =
    y1 === y2
      ? `${monthLabel(first.expectedBy)}–${monthLabel(last.expectedBy)} ${y1}`
      : `${monthLabel(first.expectedBy)} ${y1}–${monthLabel(last.expectedBy)} ${y2}`;
  return `${n} ${adj} operations, ${range}`;
}

function isOverdueSilence(op: UkExpectedOperation, asOf: string): boolean {
  if (op.cadenceSource !== "human-confirmed") return false;
  if (op.evidenceArtefactIds.length !== 0) return false;
  const due = addDaysIso(op.expectedBy, op.graceDays);
  return asOf > due;
}

function maxConsecutive(flags: boolean[]): number {
  let best = 0;
  let cur = 0;
  for (const f of flags) {
    if (f) {
      cur += 1;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}

/**
 * RULE detector: armed expected operations past grace with no evidence artefacts.
 * NEVER fires on unarmed controls (cadenceSource !== "human-confirmed").
 */
export const detectControlSilence: DetectorFn = (snapshot: UkDetectorSnapshot): UkSignal[] => {
  const signals: UkSignal[] = [];

  for (const control of snapshot.controls) {
    const ops = snapshot.expectedOpsByControlId[control.controlId] ?? [];
    const misses = ops.filter((op) => isOverdueSilence(op, snapshot.asOf));
    if (misses.length === 0) continue;

    // Guard: every miss must be human-confirmed (unarmed never reaches here).
    if (misses.some((m) => m.cadenceSource !== "human-confirmed")) continue;

    const overdueFlags = ops.map((op) => isOverdueSilence(op, snapshot.asOf));
    const consecutive = maxConsecutive(overdueFlags);
    const severity =
      control.domainCode === "FC" && consecutive >= 2 ? ("S1" as const) : ("S2" as const);

    const copy = renderCardCopy("SIGNAL_FIRED", {
      controlId: control.controlId,
      missedPeriods: misses.length,
    });

    signals.push({
      id: `silence-${control.controlId}`,
      mechanism: "periodic-review-absent",
      severity,
      status: "DETECTED_SIGNAL",
      controlId: control.controlId,
      domainCode: control.domainCode,
      predicate: copy.predicate,
      signalObserved: copy.signalObserved,
      soWhat: copy.soWhat,
      primaryMetric: { value: misses.length, label: "missed periods" },
      expected: formatExpectedWindow(misses, control.testingFrequency),
      observed: "0 evidence artefacts",
      evidenceRefs: [],
      missingEvidence: misses.map((m) => `Evidence pack due ${m.expectedBy}`),
      precedentId: NATIONWIDE_PRECEDENT_ID,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "armed cadence + empty evidenceArtefactIds past grace",
      },
      detectionVersion: "silence-rule@1.0.0",
      evaluatedAt: `${snapshot.asOf}T00:00:00.000Z`,
      owner: control.controlOwnerRole,
      alternativeExplanation: SILENCE_ALTERNATIVE_EXPLANATION,
      humanActions: ["OPEN_EVIDENCE", "ACCEPT", "ESCALATE"],
    });
  }

  return signals;
};
