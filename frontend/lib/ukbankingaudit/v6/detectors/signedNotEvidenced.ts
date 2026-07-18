/**
 * signedNotEvidenced — derivation "RULE".
 *
 * Fires when a remediation step is signed "Complete" but no test artefact is
 * linked in the evidence store (RemediationStep carries no artefact reference,
 * so completion is asserted, not evidenced), while the domain is still open.
 *
 * The v4 mock data contains this: the RED cyber tile reads "Remediation in
 * flight — closure pack signed by Head of InfoSec and CTO. Target: 18-Jul."
 * Signed, in flight, before the target, with no test artefact.
 */
import { RISK_DOMAINS_V4 } from "../riskDomainsV6";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal } from "../types";
import { EVALUATED_AT, accountabilityFor, precedentFields } from "./_shared";

export const SIGNED_NOT_EVIDENCED_TITLE = "Signed, Not Evidenced" as const;

const ALTERNATIVE_EXPLANATION =
  "The test artefact may exist in a system not connected to the evidence store. This is " +
  "the most common true cause — resolve it before re-opening the step.";

const PRECEDENT_ID = "uk-hsbc-2024";

export function detectSignedNotEvidenced(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const domain of RISK_DOMAINS_V4) {
    if (!domain.remediation) continue;
    if (domain.status === "GREEN") continue; // domain already closed — nothing open to over-sign

    const signed = domain.remediation.steps.filter((s) => s.status === "Complete");
    if (signed.length === 0) continue;

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `signed-not-evidenced-${domain.id}`,
      title: SIGNED_NOT_EVIDENCED_TITLE,
      mechanism: "closure-signed-unevidenced",
      severity: domain.status === "RED" ? "S1" : "S2",
      status: "DETECTED_SIGNAL",
      domainId: domain.id,
      domainName: domain.name,
      signalObserved: `${signed.length} remediation step(s) signed Complete with no linked test artefact`,
      soWhat: `${domain.name} has ${signed.length} remediation step(s) signed Complete with no linked test artefact, while the programme is ${domain.remediation.completion}% complete and the domain remains ${domain.status}.`,
      primaryMetric: { value: signed.length, label: "steps signed Complete, 0 artefacts" },
      expected: "A linked, dated test artefact for each step signed Complete",
      observed: `${signed.length} steps signed Complete; 0 linked test artefacts.`,
      evidenceRefs: [],
      missingEvidence: signed.map(
        (s) => `test artefact for "${s.title}" (signed Complete, target ${s.target})`,
      ),
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "medium",
        basis: "steps are Complete in the plan but no artefact is linked in the evidence store",
      },
      detectionVersion: "signed-not-evidenced@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(domain.id),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: 'remediation step status === "Complete" && no linked artefact',
    });
  }

  return signals;
}
