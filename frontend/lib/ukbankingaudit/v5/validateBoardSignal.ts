import type { BoardSignal } from "./types";

/**
 * Absence must always be explained.
 * A BoardSignal with empty evidenceRefs AND empty missingEvidence is invalid:
 * either the status is backed by evidence, or the missing evidence is named.
 */
export function validateBoardSignal(signal: BoardSignal): void {
  if (signal.evidenceRefs.length === 0 && signal.missingEvidence.length === 0) {
    throw new Error(
      `BoardSignal ${signal.id}: evidenceRefs is empty but missingEvidence is also empty — absence must always be explained`,
    );
  }
}

export function isBoardSignalValid(signal: BoardSignal): boolean {
  try {
    validateBoardSignal(signal);
    return true;
  } catch {
    return false;
  }
}
