/**
 * Resolve a detector signal by id for the v3 investigation route.
 * Same asOf / periods as liveIntel — deterministic.
 */
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import {
  UK_PRECEDENTS,
  buildDetectorSnapshot,
  runAllDetectors,
  type UkEvidenceArtefact,
  type UkPrecedent,
  type UkSignal,
} from "@/lib/UK_Process_Audit/signals";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";

const AS_OF = "2026-06-30";
const PERIODS = 12;

export type UkSignalInvestigationBundle = {
  signal: UkSignal;
  control: UkAuditControl;
  precedent: UkPrecedent | null;
  artefacts: UkEvidenceArtefact[];
};

let cached: {
  signals: UkSignal[];
  controls: UkAuditControl[];
  artefactsById: Record<string, UkEvidenceArtefact[]>;
} | null = null;

function loadBundle() {
  if (cached) return cached;
  const data = getUkProcessAuditData();
  const controls = Object.values(data.controlsByDomain).flat();
  const snapshot = buildDetectorSnapshot(controls, { asOf: AS_OF, periods: PERIODS });
  cached = {
    signals: runAllDetectors(snapshot),
    controls,
    artefactsById: snapshot.artefactsByControlId,
  };
  return cached;
}

export function getUkSignalInvestigation(id: string): UkSignalInvestigationBundle | null {
  const { signals, controls, artefactsById } = loadBundle();
  const decoded = decodeURIComponent(id);
  const signal = signals.find((s) => s.id === decoded);
  if (!signal) return null;
  const control = controls.find((c) => c.controlId === signal.controlId);
  if (!control) return null;
  const precedent = signal.precedentId
    ? (UK_PRECEDENTS.find((p) => p.id === signal.precedentId) ?? null)
    : null;
  return {
    signal,
    control,
    precedent,
    artefacts: artefactsById[signal.controlId] ?? [],
  };
}

export function listUkSignalIds(): string[] {
  return loadBundle().signals.map((s) => s.id);
}
