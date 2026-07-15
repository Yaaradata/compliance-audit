import type { UkAuditControl } from "../../types";
import {
  buildEvidenceArtefacts,
  buildExpectedOperations,
} from "../expectedOperations";
import type { UkSignal } from "../types";
import { detectAssertionDenominator } from "./assertionDenominator";
import { detectClosureWithoutEvidence, seedCmpRemediationItems } from "./closureWithoutEvidence";
import { detectControlSilence } from "./controlSilence";
import { detectPrecedentMatch } from "./precedentMatch";
import type { UkDetectorSnapshot } from "./types";

const SEVERITY_RANK: Record<UkSignal["severity"], number> = {
  S1: 0,
  S2: 1,
  S3: 2,
};

/**
 * Run every detector. Sort: severity (S1 first), then evaluatedAt descending.
 * Deterministic — same input, same output, same order.
 */
export function runAllDetectors(snapshot: UkDetectorSnapshot): UkSignal[] {
  const merged = [
    ...detectControlSilence(snapshot),
    ...detectPrecedentMatch(snapshot),
    ...detectAssertionDenominator(snapshot),
    ...detectClosureWithoutEvidence(snapshot),
  ];

  return merged.sort((a, b) => {
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sev !== 0) return sev;
    if (a.evaluatedAt !== b.evaluatedAt) return a.evaluatedAt < b.evaluatedAt ? 1 : -1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/**
 * Build a detector snapshot from controls (expected ops + artefacts + CMP remediation seed).
 * Pure and deterministic for a fixed asOf / periods.
 */
export function buildDetectorSnapshot(
  controls: UkAuditControl[],
  opts: {
    asOf: string;
    periods: number;
    proseByControlId?: UkDetectorSnapshot["proseByControlId"];
  },
): UkDetectorSnapshot {
  const asOfDate = new Date(`${opts.asOf}T00:00:00.000Z`);
  const expectedOpsByControlId: UkDetectorSnapshot["expectedOpsByControlId"] = {};
  const artefactsByControlId: UkDetectorSnapshot["artefactsByControlId"] = {};

  for (const control of controls) {
    const ops = buildExpectedOperations(control, {
      periods: opts.periods,
      asOf: asOfDate,
    });
    const artefacts = buildEvidenceArtefacts(control, ops);
    expectedOpsByControlId[control.controlId] = ops;
    artefactsByControlId[control.controlId] = artefacts;
  }

  return {
    asOf: opts.asOf,
    controls,
    expectedOpsByControlId,
    artefactsByControlId,
    proseByControlId: opts.proseByControlId ?? {},
    remediationItems: seedCmpRemediationItems(),
  };
}

export { detectControlSilence } from "./controlSilence";
export { detectPrecedentMatch } from "./precedentMatch";
export { detectAssertionDenominator, SYNTHETIC_FC_ASSERTION } from "./assertionDenominator";
export { detectClosureWithoutEvidence, seedCmpRemediationItems } from "./closureWithoutEvidence";
export type { UkDetectorSnapshot } from "./types";
