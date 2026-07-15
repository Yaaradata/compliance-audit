/**
 * SYNTHETIC DEMO DATA — labelled.
 *
 * Converts testingFrequency from a display string into a queryable calendar of
 * UkExpectedOperation rows. "A control that never ran" becomes a LEFT JOIN.
 *
 * CONFIRMED_CADENCE (62/104) is synthetic: realistic UK names + 2026 dates.
 * The remaining 42 are UNARMED (cadenceSource "register") — hatched, never red.
 * Unknown and failed are different states.
 *
 * Deliberate stable evidence gaps (hardcoded):
 *   - FC-07 (sanctions screening): last FOUR expected operations have no artefacts
 *   - DEP-05 (interest/fee): middle TWO expected operations have no artefacts
 *   - all other controls: fully evidenced (1 artefact per expected operation)
 */
import type { UkAuditControl, UkRawControlRow } from "../types";
import { hashString, makeRng } from "./rng";
import type { UkEvidenceArtefact, UkExpectedOperation } from "./types";

export type CadenceSpec = { days: number; graceDays: number };

/**
 * Parse a testing-frequency label into calendar days.
 * Event-driven / Ad-hoc return null — no expected cadence, never silence.
 */
export function parseCadence(testingFrequency: string): CadenceSpec | null {
  const f = testingFrequency.trim().toLowerCase();
  if (!f) return null;
  if (f.includes("event") || f.includes("ad-hoc") || f.includes("adhoc")) return null;
  if (f.includes("continuous")) return { days: 1, graceDays: 0 };
  if (f.includes("daily") || f.includes("day")) return { days: 1, graceDays: 0 };
  if (f.includes("week")) return { days: 7, graceDays: 1 };
  if (f.includes("month")) return { days: 30, graceDays: 5 };
  if (f.includes("quarter")) return { days: 91, graceDays: 10 };
  if (f.includes("semi-annual") || f.includes("semiannual") || f.includes("half")) {
    return { days: 182, graceDays: 14 };
  }
  if (f.includes("annual") || f.includes("year")) return { days: 365, graceDays: 21 };
  return null;
}

/**
 * ~60 of 104 controls with human-confirmed cadence.
 * Synthetic demo data — not real attestations.
 */
export const CONFIRMED_CADENCE: Record<string, { confirmedBy: string; confirmedAt: string }> = {
  "ONB-01": { confirmedBy: "Priya Sharma", confirmedAt: "2026-01-14" },
  "ONB-02": { confirmedBy: "James O'Neill", confirmedAt: "2026-01-16" },
  "ONB-03": { confirmedBy: "Sarah Chen", confirmedAt: "2026-01-20" },
  "ONB-05": { confirmedBy: "David Okonkwo", confirmedAt: "2026-02-03" },
  "ONB-06": { confirmedBy: "Emma Walsh", confirmedAt: "2026-02-05" },
  "ONB-07": { confirmedBy: "Aisha Khan", confirmedAt: "2026-02-10" },
  "ONB-08": { confirmedBy: "Thomas Reid", confirmedAt: "2026-02-12" },
  "ONB-11": { confirmedBy: "Niamh Byrne", confirmedAt: "2026-02-18" },
  "ONB-12": { confirmedBy: "Michael Adeyemi", confirmedAt: "2026-02-20" },
  "DEP-01": { confirmedBy: "Charlotte Hughes", confirmedAt: "2026-01-22" },
  "DEP-02": { confirmedBy: "Oliver Grant", confirmedAt: "2026-01-24" },
  "DEP-05": { confirmedBy: "Fatima Begum", confirmedAt: "2026-02-01" },
  "DEP-07": { confirmedBy: "William Fraser", confirmedAt: "2026-02-04" },
  "DEP-08": { confirmedBy: "Sophie Patel", confirmedAt: "2026-02-08" },
  "DEP-11": { confirmedBy: "Daniel MacLeod", confirmedAt: "2026-02-14" },
  "DEP-13": { confirmedBy: "Hannah Lewis", confirmedAt: "2026-02-16" },
  "DEP-15": { confirmedBy: "Rajesh Gupta", confirmedAt: "2026-02-22" },
  "DEP-16": { confirmedBy: "Catrin Evans", confirmedAt: "2026-02-24" },
  "CMP-01": { confirmedBy: "Benjamin Clarke", confirmedAt: "2026-01-12" },
  "CMP-02": { confirmedBy: "Amelia Scott", confirmedAt: "2026-01-15" },
  "CMP-03": { confirmedBy: "Yusuf Ali", confirmedAt: "2026-01-18" },
  "CMP-05": { confirmedBy: "Grace Murphy", confirmedAt: "2026-01-25" },
  "CMP-06": { confirmedBy: "Lucas Fernandes", confirmedAt: "2026-01-28" },
  "CMP-07": { confirmedBy: "Isla Robertson", confirmedAt: "2026-02-02" },
  "CMP-11": { confirmedBy: "Noah Williams", confirmedAt: "2026-02-09" },
  "FC-01": { confirmedBy: "Olivia Thompson", confirmedAt: "2026-01-08" },
  "FC-03": { confirmedBy: "Ethan Davies", confirmedAt: "2026-01-11" },
  "FC-04": { confirmedBy: "Zara Ahmed", confirmedAt: "2026-01-13" },
  "FC-05": { confirmedBy: "Callum Stewart", confirmedAt: "2026-01-17" },
  "FC-06": { confirmedBy: "Mei Ling", confirmedAt: "2026-01-19" },
  "FC-07": { confirmedBy: "Patrick O'Sullivan", confirmedAt: "2026-01-21" },
  "FC-08": { confirmedBy: "Leila Hassan", confirmedAt: "2026-01-23" },
  "FC-09": { confirmedBy: "George Atkinson", confirmedAt: "2026-01-26" },
  "FC-10": { confirmedBy: "Anita Desai", confirmedAt: "2026-01-29" },
  "FC-12": { confirmedBy: "Harry Campbell", confirmedAt: "2026-02-06" },
  "FRD-02": { confirmedBy: "Chloe Martin", confirmedAt: "2026-01-09" },
  "FRD-03": { confirmedBy: "Joshua King", confirmedAt: "2026-01-12" },
  "FRD-04": { confirmedBy: "Sienna Brooks", confirmedAt: "2026-01-15" },
  "FRD-05": { confirmedBy: "Omar Farouk", confirmedAt: "2026-01-18" },
  "FRD-06": { confirmedBy: "Emily Watson", confirmedAt: "2026-01-22" },
  "FRD-07": { confirmedBy: "Jack Morrison", confirmedAt: "2026-01-27" },
  "FRD-08": { confirmedBy: "Nadia Rahman", confirmedAt: "2026-02-03" },
  "FRD-09": { confirmedBy: "Samuel Wright", confirmedAt: "2026-02-07" },
  "LEN-01": { confirmedBy: "Freya MacDonald", confirmedAt: "2026-01-10" },
  "LEN-03": { confirmedBy: "Adam Singh", confirmedAt: "2026-01-14" },
  "LEN-04": { confirmedBy: "Jessica Taylor", confirmedAt: "2026-01-20" },
  "LEN-05": { confirmedBy: "Kieran Doyle", confirmedAt: "2026-01-24" },
  "LEN-07": { confirmedBy: "Maya Krishnan", confirmedAt: "2026-01-30" },
  "LEN-08": { confirmedBy: "Robert Hughes", confirmedAt: "2026-02-05" },
  "LEN-11": { confirmedBy: "Eleanor Price", confirmedAt: "2026-02-11" },
  "COL-01": { confirmedBy: "Marcus Johnson", confirmedAt: "2026-01-07" },
  "COL-02": { confirmedBy: "Bethan Powell", confirmedAt: "2026-01-13" },
  "COL-03": { confirmedBy: "Ibrahim Yusuf", confirmedAt: "2026-01-16" },
  "COL-04": { confirmedBy: "Lucy Anderson", confirmedAt: "2026-01-21" },
  "COL-05": { confirmedBy: "Connor Gallagher", confirmedAt: "2026-01-25" },
  "COL-07": { confirmedBy: "Aaliyah Brown", confirmedAt: "2026-02-01" },
  "PAY-02": { confirmedBy: "Matthew Quinn", confirmedAt: "2026-01-06" },
  "PAY-03": { confirmedBy: "Sofia Rossi", confirmedAt: "2026-01-09" },
  "PAY-04": { confirmedBy: "Liam Fitzgerald", confirmedAt: "2026-01-14" },
  "PAY-05": { confirmedBy: "Helena Costa", confirmedAt: "2026-01-19" },
  "PAY-08": { confirmedBy: "Ryan Mitchell", confirmedAt: "2026-01-28" },
  "PAY-12": { confirmedBy: "Ananya Iyer", confirmedAt: "2026-02-04" },
};

/** Hardcoded deliberate silence targets (stable demo). */
export const SILENCE_FC_SANCTIONS_CONTROL_ID = "FC-07";
export const SILENCE_DEP_CONTROL_ID = "DEP-05";
export const SILENCE_FC_TRAILING_GAPS = 4;
export const SILENCE_DEP_MIDDLE_GAPS = 2;

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addUtcDays(base: Date, days: number): Date {
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function asUtcDate(asOf: Date): Date {
  return new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
}

type ControlLike = Pick<UkRawControlRow, "controlId" | "testingFrequency">;

/**
 * Materialise the last `periods` expected operations for a control (newest last).
 * Returns [] when cadence cannot be parsed (Event-driven / Ad-hoc) — never silence.
 */
export function buildExpectedOperations(
  control: ControlLike,
  opts: { periods: number; asOf: Date },
): UkExpectedOperation[] {
  const cadence = parseCadence(control.testingFrequency);
  if (!cadence || opts.periods <= 0) return [];

  const confirmed = CONFIRMED_CADENCE[control.controlId];
  const cadenceSource = confirmed ? "human-confirmed" : "register";
  const asOf = asUtcDate(opts.asOf);
  const ops: UkExpectedOperation[] = [];

  for (let i = opts.periods - 1; i >= 0; i--) {
    const expectedByDate = addUtcDays(asOf, -i * cadence.days);
    const periodStartDate = addUtcDays(expectedByDate, -cadence.days);
    ops.push({
      controlId: control.controlId,
      periodStart: toIsoDate(periodStartDate),
      expectedBy: toIsoDate(expectedByDate),
      graceDays: cadence.graceDays,
      evidenceArtefactIds: [],
      cadenceSource,
      confirmedBy: confirmed?.confirmedBy ?? null,
      confirmedAt: confirmed?.confirmedAt ?? null,
    });
  }

  return ops;
}

function syntheticSha256(seed: string): string {
  const rng = makeRng(hashString(seed));
  let hex = "";
  for (let i = 0; i < 8; i++) {
    hex += Math.floor(rng() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  }
  return hex;
}

function shouldSkipEvidence(controlId: string, index: number, total: number): boolean {
  if (controlId === SILENCE_FC_SANCTIONS_CONTROL_ID) {
    // Last FOUR expected operations (newest trailing) — indices total-4 .. total-1
    return index >= total - SILENCE_FC_TRAILING_GAPS;
  }
  if (controlId === SILENCE_DEP_CONTROL_ID) {
    // Middle two — for even length, centre pair; for odd, floor-centre pair
    const mid = Math.floor((total - SILENCE_DEP_MIDDLE_GAPS) / 2);
    return index === mid || index === mid + 1;
  }
  return false;
}

/**
 * Attach 0..1 artefacts per expected operation (mutates evidenceArtefactIds in place).
 * Deliberate gaps are hardcoded for FC-07 (trailing 4) and DEP-05 (middle 2).
 */
export function buildEvidenceArtefacts(
  control: Pick<UkAuditControl, "controlId" | "evidenceType" | "evidenceSourceSystem">,
  expectedOps: UkExpectedOperation[],
): UkEvidenceArtefact[] {
  const artefacts: UkEvidenceArtefact[] = [];
  const total = expectedOps.length;

  for (let i = 0; i < total; i++) {
    const op = expectedOps[i]!;
    if (shouldSkipEvidence(control.controlId, i, total)) {
      op.evidenceArtefactIds = [];
      continue;
    }

    const id = `${control.controlId}-ART-${String(i + 1).padStart(2, "0")}`;
    const artefact: UkEvidenceArtefact = {
      id,
      controlId: control.controlId,
      ts: `${op.expectedBy}T12:00:00.000Z`,
      type: control.evidenceType,
      sourceSystem: control.evidenceSourceSystem.split(";")[0]?.trim() || control.evidenceSourceSystem,
      sha256: syntheticSha256(`${id}:${op.expectedBy}`),
      label: `${control.controlId} evidence · ${op.expectedBy}`,
    };
    artefacts.push(artefact);
    op.evidenceArtefactIds = [id];
  }

  return artefacts;
}
