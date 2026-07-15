import type { UkAuditControl } from "../../types";
import type { UkEvidenceArtefact, UkExpectedOperation, UkRemediationItem, UkSignal } from "../types";

/** Input contract for every detector — pure functions over this snapshot. */
export interface UkDetectorSnapshot {
  /** ISO date (YYYY-MM-DD) evaluation point */
  asOf: string;
  controls: UkAuditControl[];
  expectedOpsByControlId: Record<string, UkExpectedOperation[]>;
  artefactsByControlId: Record<string, UkEvidenceArtefact[]>;
  /** Free-prose packs used by assertionDenominator (mgmtResponse / auditorNote). */
  proseByControlId: Record<string, { mgmtResponse: string; auditorNote: string }>;
  remediationItems: UkRemediationItem[];
}

export type DetectorFn = (snapshot: UkDetectorSnapshot) => UkSignal[];

export function parseIsoDate(iso: string): Date {
  const day = iso.slice(0, 10);
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function daysBetween(earlierIso: string, laterIso: string): number {
  const a = parseIsoDate(earlierIso).getTime();
  const b = parseIsoDate(laterIso).getTime();
  return Math.floor((b - a) / 86_400_000);
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function controlById(
  snapshot: UkDetectorSnapshot,
  controlId: string,
): UkAuditControl | undefined {
  return snapshot.controls.find((c) => c.controlId === controlId);
}
