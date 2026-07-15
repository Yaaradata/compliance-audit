import type { UkAuditControl, UkProcessAuditDomainId } from "../types";
import { hashString, makeRng, randInt } from "./rng";
import type { CadenceStatus, UkCadenceEvaluation, UkCadenceRollup } from "./types";
import { UKPA_V3_AS_OF } from "./types";

/**
 * Parse testingFrequency into a cadence in days.
 * Returns null when the frequency is not a confirmed calendar cadence → UNARMED.
 */
export function parseCadenceDays(frequencyRaw: string): number | null {
  const f = frequencyRaw.trim().toLowerCase();
  if (!f) return null;
  if (f.includes("continuous")) return 1;
  if (f.includes("month")) return 30;
  if (f.includes("quarter")) return 91;
  if (f.includes("annual") || f.includes("year")) return 365;
  // Event-triggered has no calendar cadence — treat as UNARMED for schedule math.
  if (f.includes("event")) return null;
  return null;
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(earlierIso: string, laterIso: string): number {
  const a = parseIso(earlierIso).getTime();
  const b = parseIso(laterIso).getTime();
  return Math.floor((b - a) / 86_400_000);
}

/**
 * Synthesise a real ISO last-tested date from frequency + seeded RNG.
 * Unlike lastTestedLabel(), this is subtractable from asOf.
 */
function synthesiseLastTestedAt(
  controlId: string,
  cadenceDays: number,
  asOf: string,
): string {
  const rng = makeRng(hashString(`${controlId}:lastTestedAt`));
  // Place last test somewhere in [0.4, 1.6] × cadence window before asOf.
  const factor = 0.4 + rng() * 1.2;
  const daysAgo = Math.max(0, Math.round(cadenceDays * factor));
  const asOfDate = parseIso(asOf);
  asOfDate.setUTCDate(asOfDate.getUTCDate() - daysAgo);
  return formatIso(asOfDate);
}

function classifyCadence(
  cadenceDays: number | null,
  daysSinceTest: number | null,
): CadenceStatus {
  if (cadenceDays === null || daysSinceTest === null) return "UNARMED";
  if (daysSinceTest > cadenceDays) return "OVERDUE";
  if (daysSinceTest > cadenceDays * 0.8) return "DUE_SOON";
  return "CURRENT";
}

export function evaluateCadence(
  control: UkAuditControl,
  asOf: string = UKPA_V3_AS_OF,
): UkCadenceEvaluation {
  const cadenceDays = parseCadenceDays(control.testingFrequency);
  if (cadenceDays === null) {
    return {
      controlId: control.controlId,
      domainId: control.domainCode,
      frequencyRaw: control.testingFrequency,
      cadenceDays: null,
      lastTestedAt: null,
      asOf,
      daysSinceTest: null,
      status: "UNARMED",
      synthetic: true,
    };
  }

  const lastTestedAt = synthesiseLastTestedAt(control.controlId, cadenceDays, asOf);
  const daysSinceTest = daysBetween(lastTestedAt, asOf);
  const status = classifyCadence(cadenceDays, daysSinceTest);

  return {
    controlId: control.controlId,
    domainId: control.domainCode,
    frequencyRaw: control.testingFrequency,
    cadenceDays,
    lastTestedAt,
    asOf,
    daysSinceTest,
    status,
    synthetic: true,
  };
}

export function emptyCadenceRollup(): UkCadenceRollup {
  return { total: 0, armed: 0, unarmed: 0, overdue: 0, dueSoon: 0, current: 0 };
}

export function rollupCadence(rows: UkCadenceEvaluation[]): UkCadenceRollup {
  const r = emptyCadenceRollup();
  for (const row of rows) {
    r.total += 1;
    switch (row.status) {
      case "UNARMED":
        r.unarmed += 1;
        break;
      case "OVERDUE":
        r.overdue += 1;
        r.armed += 1;
        break;
      case "DUE_SOON":
        r.dueSoon += 1;
        r.armed += 1;
        break;
      case "CURRENT":
        r.current += 1;
        r.armed += 1;
        break;
      case "ARMED":
        r.armed += 1;
        break;
      default: {
        const _exhaustive: never = row.status;
        void _exhaustive;
        break;
      }
    }
  }
  return r;
}

export function evaluateAllCadence(
  controls: UkAuditControl[],
  asOf: string = UKPA_V3_AS_OF,
): {
  byId: Record<string, UkCadenceEvaluation>;
  rollup: UkCadenceRollup;
  byDomain: Record<UkProcessAuditDomainId, UkCadenceRollup>;
} {
  const byId: Record<string, UkCadenceEvaluation> = {};
  const list: UkCadenceEvaluation[] = [];
  for (const c of controls) {
    const ev = evaluateCadence(c, asOf);
    byId[c.controlId] = ev;
    list.push(ev);
  }

  const domainIds = Array.from(new Set(controls.map((c) => c.domainCode)));
  const byDomain = {} as Record<UkProcessAuditDomainId, UkCadenceRollup>;
  for (const id of domainIds) {
    byDomain[id] = rollupCadence(list.filter((e) => e.domainId === id));
  }

  return { byId, rollup: rollupCadence(list), byDomain };
}

/** Seeded jitter helper retained for population checks. */
export function seededUnit(controlId: string, salt: string): number {
  return makeRng(hashString(`${controlId}:${salt}`))();
}

export function seededInt(controlId: string, salt: string, min: number, max: number): number {
  return randInt(makeRng(hashString(`${controlId}:${salt}`)), min, max);
}
