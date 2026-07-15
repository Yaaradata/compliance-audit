import type { UkSignal } from "./types";

/**
 * Absence must always be explained.
 * A signal with empty evidenceRefs and empty missingEvidence is invalid.
 */
export function validateUkSignal(signal: UkSignal): void {
  if (signal.evidenceRefs.length === 0 && signal.missingEvidence.length === 0) {
    throw new Error(
      `UkSignal ${signal.id}: evidenceRefs is empty but missingEvidence is also empty — absence must always be explained`,
    );
  }
}

export function isUkSignalEvidenceValid(signal: UkSignal): boolean {
  try {
    validateUkSignal(signal);
    return true;
  } catch {
    return false;
  }
}
