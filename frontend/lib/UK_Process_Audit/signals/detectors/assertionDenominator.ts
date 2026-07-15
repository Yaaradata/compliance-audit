import { assertionCoveragePct, type UkAssertion, type UkSignal } from "../types";
import { renderCardCopy } from "../copy";
import type { DetectorFn, UkDetectorSnapshot } from "./types";

/** Hand-authored — never generate at runtime. */
export const ASSERTION_ALTERNATIVE_EXPLANATION =
  "The population definition in the claim may be narrower than the register's. Confirm the denominator with the signatory before escalating.";

export const CLAIM_TERMS = [
  "enhanced",
  "effective",
  "complete",
  "remediated",
  "comprehensive",
  "fully",
] as const;

const NATIONWIDE_PRECEDENT_ID = "nationwide-2025-12-11";

/**
 * SYNTHETIC — labelled. Seeded FC assertion whose coverage is 4.9%
 * (888,618 of 18,000,000), mirroring the Nationwide public fact pattern.
 */
export const SYNTHETIC_FC_ASSERTION: UkAssertion = {
  id: "assertion-fc-synthetic-4pct9",
  text: "CDD has been enhanced across the in-scope customer population.",
  claimTerms: ["enhanced"],
  populationDefinition: "All retail and SME customers on the customer master",
  populationCount: 18_000_000,
  coveredCount: 888_618,
  signedBy: "MLRO Delegate (synthetic)",
  signedAt: "2026-03-15",
  controlIds: ["FC-03"],
};

function extractClaimTerms(text: string): string[] {
  const lower = text.toLowerCase();
  return CLAIM_TERMS.filter((t) => lower.includes(t));
}

/**
 * Build assertions from free-prose evidence pack fields + the synthetic FC seed.
 */
export function buildAssertionsFromSnapshot(snapshot: UkDetectorSnapshot): UkAssertion[] {
  const out: UkAssertion[] = [SYNTHETIC_FC_ASSERTION];

  for (const control of snapshot.controls) {
    const prose = snapshot.proseByControlId[control.controlId];
    if (!prose) continue;
    const blob = `${prose.mgmtResponse}\n${prose.auditorNote}`;
    const terms = extractClaimTerms(blob);
    if (terms.length === 0) continue;

    // Deterministic coverage from control sample/population (may be < 100%).
    const populationCount = Math.max(control.population, 1);
    const coveredCount = Math.min(control.sample, populationCount);
    out.push({
      id: `assertion-${control.controlId}`,
      text: prose.mgmtResponse,
      claimTerms: terms,
      populationDefinition: `Register population for ${control.controlId}`,
      populationCount,
      coveredCount,
      signedBy: control.controlOwnerRole,
      signedAt: snapshot.asOf,
      controlIds: [control.controlId],
    });
  }

  return out;
}

/**
 * LLM (claim-term extraction) + RULE (coverage arithmetic).
 * Fires when a completeness claim is present and coverage < 100%.
 */
export const detectAssertionDenominator: DetectorFn = (
  snapshot: UkDetectorSnapshot,
): UkSignal[] => {
  const signals: UkSignal[] = [];
  const assertions = buildAssertionsFromSnapshot(snapshot);

  for (const assertion of assertions) {
    if (assertion.claimTerms.length === 0) continue;
    const coverage = assertionCoveragePct(assertion);
    if (!(coverage < 100)) continue;

    const controlId = assertion.controlIds[0] ?? "FC-03";
    const control = snapshot.controls.find((c) => c.controlId === controlId);
    const domainCode = control?.domainCode ?? "FC";
    const isSynthetic = assertion.id === SYNTHETIC_FC_ASSERTION.id;

    const coverageLabel = isSynthetic ? "4.9%" : `${coverage.toFixed(1)}%`;
    const copy = renderCardCopy("EVIDENCE_GAP_OBSERVED", {
      claimTerms: assertion.claimTerms.join(", "),
      coveragePct: coverageLabel,
      isSynthetic,
    });

    signals.push({
      id: `assertion-denom-${assertion.id}`,
      mechanism: "assertion-unevidenced",
      severity: isSynthetic || coverage < 10 ? "S1" : "S2",
      status: "DETECTED_SIGNAL",
      controlId,
      domainCode,
      predicate: copy.predicate,
      signalObserved: copy.signalObserved,
      soWhat: copy.soWhat,
      primaryMetric: isSynthetic
        ? { value: "4.9%", label: "coverage behind the claim" }
        : { value: `${coverage.toFixed(1)}%`, label: "coverage behind the claim" },
      expected: "coverage across the stated population",
      observed: isSynthetic
        ? "888,618 of 18,000,000 — 4.9%"
        : `${assertion.coveredCount.toLocaleString("en-GB")} of ${assertion.populationCount.toLocaleString("en-GB")} — ${coverage.toFixed(1)}%`,
      evidenceRefs: [],
      missingEvidence: [
        `Population reconciliation for claim "${assertion.claimTerms[0]}"`,
        `Signatory confirmation of denominator (${assertion.signedBy})`,
      ],
      precedentId: NATIONWIDE_PRECEDENT_ID,
      derivation: "LLM",
      confidence: {
        level: isSynthetic ? "high" : "medium",
        basis: "claim-term extraction (LLM) + coverage arithmetic (RULE)",
      },
      detectionVersion: "assertion-denominator@1.0.0",
      evaluatedAt: `${snapshot.asOf}T00:00:00.000Z`,
      owner: control?.controlOwnerRole ?? assertion.signedBy,
      alternativeExplanation: ASSERTION_ALTERNATIVE_EXPLANATION,
      humanActions: ["OPEN_EVIDENCE", "ESCALATE", "OPEN_INVESTIGATION"],
      claimLines: [
        {
          derivation: "LLM",
          text: `Extracted claim terms: ${assertion.claimTerms.join(", ")}`,
        },
        {
          derivation: "RULE",
          text: `coveredCount/populationCount = ${coverage.toFixed(4)} < 1.0`,
        },
      ],
    });
  }

  return signals;
};
