/**
 * Live intel for UK Process Audit v3 overview / register / drawer.
 * Built from the signals detector layer — not from residual-risk sorts.
 */
import {
  CONFIRMED_CADENCE,
  buildDetectorSnapshot,
  parseCadence,
  runAllDetectors,
  type UkDetectorSnapshot,
  type UkSignal,
} from "@/lib/UK_Process_Audit/signals";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";
import { UK_CONTROL_LIBRARY_SIZE } from "@/lib/UK_Process_Audit/signals";

export type EvidenceAgeKind = "armed-evidenced" | "armed-silent" | "unarmed";

export interface EvidenceAgeCell {
  kind: EvidenceAgeKind;
  /** Days since latest artefact — only for armed-evidenced */
  daysSince: number | null;
  /** True when daysSince > cadence.days */
  overdueCadence: boolean;
  tooltip?: string;
}

export interface MissingEvidenceSection {
  /** Always rendered — never greyed or collapsed. */
  body: string;
}

export interface UkLiveIntel {
  silent: number;
  unarmed: number;
  matches: number;
  totalControls: number;
  signals: UkSignal[];
  evidenceAgeByControlId: Record<string, EvidenceAgeCell>;
  missingEvidenceByControlId: Record<string, MissingEvidenceSection>;
  snapshot: UkDetectorSnapshot;
}

const AS_OF = "2026-06-30";
const PERIODS = 12;

function formatMissingBodyClean(
  control: UkAuditControl,
  missedExpectedBy: string[],
  confirmed: { confirmedBy: string; confirmedAt: string } | undefined,
): string {
  if (missedExpectedBy.length === 0) {
    return "All expected operations evidenced.";
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-").map(Number);
    return `${String(d).padStart(2, "0")} ${months[m! - 1]} ${iso.slice(0, 4)}`;
  };
  const first = missedExpectedBy[0]!;
  const last = missedExpectedBy[missedExpectedBy.length - 1]!;
  const cadenceLine = confirmed
    ? `Cadence: ${control.testingFrequency}, confirmed by ${confirmed.confirmedBy}, ${fmt(confirmed.confirmedAt)}.`
    : `Cadence: ${control.testingFrequency} (register — unconfirmed).`;
  return `No evidence of operation for ${missedExpectedBy.length} expected runs (${fmt(first)} – ${fmt(last)}).\n${cadenceLine}`;
}

export function buildUkLiveIntel(controls: UkAuditControl[]): UkLiveIntel {
  const snapshot = buildDetectorSnapshot(controls, { asOf: AS_OF, periods: PERIODS });
  const signals = runAllDetectors(snapshot);

  const silentControlIds = new Set(
    signals.filter((s) => s.detectionVersion.startsWith("silence-rule")).map((s) => s.controlId),
  );
  const matchControlIds = new Set(
    signals
      .filter((s) => s.detectionVersion.startsWith("precedent-match"))
      .map((s) => s.controlId),
  );

  let unarmed = 0;
  const evidenceAgeByControlId: Record<string, EvidenceAgeCell> = {};
  const missingEvidenceByControlId: Record<string, MissingEvidenceSection> = {};

  for (const control of controls) {
    const ops = snapshot.expectedOpsByControlId[control.controlId] ?? [];
    const arts = snapshot.artefactsByControlId[control.controlId] ?? [];
    const confirmed = CONFIRMED_CADENCE[control.controlId];
    const armed = Boolean(confirmed) && ops.some((o) => o.cadenceSource === "human-confirmed");
    const cadence = parseCadence(control.testingFrequency);

    if (!armed) {
      unarmed += 1;
      evidenceAgeByControlId[control.controlId] = {
        kind: "unarmed",
        daysSince: null,
        overdueCadence: false,
        tooltip: "Cadence unconfirmed",
      };
      missingEvidenceByControlId[control.controlId] = {
        body: "All expected operations evidenced.",
      };
      continue;
    }

    const missed = ops.filter(
      (op) =>
        op.cadenceSource === "human-confirmed" &&
        op.evidenceArtefactIds.length === 0 &&
        AS_OF > op.expectedBy,
    );

    if (missed.length > 0 || silentControlIds.has(control.controlId)) {
      evidenceAgeByControlId[control.controlId] = {
        kind: "armed-silent",
        daysSince: null,
        overdueCadence: true,
      };
    } else {
      const latest = arts.reduce<string | null>((acc, a) => {
        if (!acc || a.ts > acc) return a.ts;
        return acc;
      }, null);
      let daysSince: number | null = null;
      if (latest) {
        const a = new Date(`${latest.slice(0, 10)}T00:00:00.000Z`).getTime();
        const b = new Date(`${AS_OF}T00:00:00.000Z`).getTime();
        daysSince = Math.floor((b - a) / 86_400_000);
      }
      const overdueCadence =
        daysSince != null && cadence != null ? daysSince > cadence.days : false;
      evidenceAgeByControlId[control.controlId] = {
        kind: "armed-evidenced",
        daysSince,
        overdueCadence,
      };
    }

    missingEvidenceByControlId[control.controlId] = {
      body: formatMissingBodyClean(
        control,
        missed.map((m) => m.expectedBy),
        confirmed,
      ),
    };
  }

  // Prefer counting unarmed from CONFIRMED_CADENCE for stable KPI
  unarmed = UK_CONTROL_LIBRARY_SIZE - Object.keys(CONFIRMED_CADENCE).length;

  return {
    silent: silentControlIds.size,
    unarmed,
    matches: matchControlIds.size,
    totalControls: UK_CONTROL_LIBRARY_SIZE,
    signals,
    evidenceAgeByControlId,
    missingEvidenceByControlId,
    snapshot,
  };
}
