/**
 * accountabilityOrphan — derivation "RULE".
 *
 * Fires when a domain has no accountable owner mapped
 * (DOMAIN_ACCOUNTABILITY[domainId].unowned === true). The Nationwide Final
 * Notice recorded "no clear owner" as a root cause, so an orphan is the point.
 *
 * COMPLIANCE FLAG: the card names the ORPHANED DOMAIN. It never names a person
 * as culpable. There is no `score` field on any actor type anywhere, and this
 * detector introduces none.
 */
import { DOMAIN_ACCOUNTABILITY } from "../riskDomainsV5";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal } from "../types";
import { EVALUATED_AT, domainName, precedentFields } from "./_shared";

export const ACCOUNTABILITY_ORPHAN_TITLE = "Accountability Orphan" as const;

const ALTERNATIVE_EXPLANATION =
  "The owner may be recorded in an HR or SMCR system not linked to this register. Confirm " +
  "the Statement of Responsibilities before treating the domain as unowned.";

const PRECEDENT_ID = "uk-nationwide-2025";

export function detectAccountabilityOrphan(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const [domainId, accountability] of Object.entries(DOMAIN_ACCOUNTABILITY)) {
    if (!("unowned" in accountability) || accountability.unowned !== true) continue;

    const name = domainName(domainId);

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `accountability-orphan-${domainId}`,
      title: ACCOUNTABILITY_ORPHAN_TITLE,
      mechanism: "accountability-orphan",
      severity: "S2",
      status: "DETECTED_SIGNAL",
      domainId,
      domainName: name,
      signalObserved: `${name} has no accountable owner mapped`,
      soWhat: `${name} has no accountable owner mapped. The Nationwide Final Notice recorded "no clear owner" as a root cause.`,
      primaryMetric: { value: 0, label: "accountable owners mapped" },
      expected: "A named SMF (or US three-lines owner) accountable for this domain",
      observed: "No owner mapped in the accountability register.",
      evidenceRefs: [],
      missingEvidence: ["an accountability mapping (SMF prescribed responsibility) for this domain"],
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "DOMAIN_ACCOUNTABILITY entry is unowned",
      },
      detectionVersion: "accountability-orphan@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability,
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: "DOMAIN_ACCOUNTABILITY[domainId].unowned === true",
    });
  }

  return signals;
}
