import type { UkAuditControl } from "../types";
import { seededInt, seededUnit } from "./cadence";
import type { UkPopulationCoverageCheck } from "./types";

/**
 * Synthesise a management coverage claim and compare it to observed population math.
 * Labels every row as synthetic. Surfaces EVIDENCE_GAP_OBSERVED when claimed ≫ observed.
 *
 * Grounded in the Nationwide pattern: uplift claimed as "enhanced" while coverage was ~4.9%.
 */
export function evaluatePopulationClaim(control: UkAuditControl): UkPopulationCoverageCheck {
  const population = control.population;
  // Observed: sample / population as a crude coverage proxy for the demo.
  const observedCoveragePct = Number(
    Math.max(0.1, Math.min(100, (control.sample / Math.max(population, 1)) * 100)).toFixed(2),
  );

  // Claimed: often inflated relative to observed (seeded).
  const inflate = 8 + seededUnit(control.controlId, "claimInflate") * 40;
  const claimedCoveragePct = Number(
    Math.min(99.5, Math.max(observedCoveragePct + 2, observedCoveragePct * inflate)).toFixed(2),
  );

  const covered = Math.round((observedCoveragePct / 100) * population);
  const gap = Math.max(0, population - covered);

  const claimText = buildClaimText(control, claimedCoveragePct);
  const gapRatio = claimedCoveragePct - observedCoveragePct;
  const predicate =
    gapRatio >= 15 || (claimedCoveragePct >= 50 && observedCoveragePct < 10)
      ? ("EVIDENCE_GAP_OBSERVED" as const)
      : null;

  // Ensure determinism uses salt even when predicate is null.
  void seededInt(control.controlId, "claimSalt", 0, 3);

  return {
    controlId: control.controlId,
    domainId: control.domainCode,
    claimedCoveragePct,
    observedCoveragePct,
    population,
    covered,
    gap,
    claimText,
    synthetic: true,
    predicate,
  };
}

function buildClaimText(control: UkAuditControl, claimedPct: number): string {
  const role = control.controlOwnerRole;
  return `${role} states that ${control.controlId} coverage has been enhanced to ${claimedPct.toFixed(1)}% of the in-scope population for "${control.sopStep}".`;
}

export function evaluatePopulationClaims(controls: UkAuditControl[]): UkPopulationCoverageCheck[] {
  return controls.map(evaluatePopulationClaim);
}
