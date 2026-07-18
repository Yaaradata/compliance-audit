/**
 * toleranceExpiry — derivation "RULE".
 *
 * Fires when an approved risk acceptance is past its approved duration.
 *
 * HONEST NAMING, NON-NEGOTIABLE: this card DETECTS NOTHING. Everything it
 * surfaces was minuted by the board itself — it is GOVERNANCE VISIBILITY, not
 * detection. The title, tooltip and docs must all say so. Its signals carry
 * status "ACCEPTED_EXCEPTION", never "DETECTED_SIGNAL".
 */
import { RISK_ACCEPTANCES, acceptanceElapsedDays } from "../riskDomainsV6";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal } from "../types";
import {
  DAY_MS,
  EVALUATED_AT,
  NOW_MS,
  accountabilityFor,
  domainName,
  isoDate,
  precedentFields,
} from "./_shared";

export const TOLERANCE_EXPIRY_TITLE = "Tolerance Expiry" as const;

const ALTERNATIVE_EXPLANATION =
  "The board may have re-approved this acceptance in a minute not yet linked to the " +
  "register. Confirm the latest committee decision before treating the expiry as live.";

const PRECEDENT_ID = "uk-nationwide-2025";

export function detectToleranceExpiry(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const acc of RISK_ACCEPTANCES) {
    const expiryMs = Date.parse(`${acc.acceptedAt}T00:00:00.000Z`) + acc.approvedDurationDays * DAY_MS;
    if (NOW_MS <= expiryMs) continue;

    const elapsed = acceptanceElapsedDays(acc, EVALUATED_AT);
    const name = domainName(acc.domainId);

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `tolerance-expiry-${acc.id}`,
      title: TOLERANCE_EXPIRY_TITLE,
      mechanism: "risk-tolerated-past-expiry",
      severity: "S1",
      // Governance visibility: this is an exception the board already accepted.
      status: "ACCEPTED_EXCEPTION",
      domainId: acc.domainId,
      domainName: name,
      signalObserved: "Governance visibility — an approved risk acceptance is past its approved duration",
      soWhat: `The ${acc.committee} approved this risk for ${acc.approvedDurationDays} days. That was ${elapsed} days ago.`,
      primaryMetric: { value: elapsed, label: `days elapsed vs ${acc.approvedDurationDays} approved` },
      expected: `Re-approval or closure by ${isoDate(expiryMs)}`,
      observed: `Still open ${elapsed} days after acceptance; approved for ${acc.approvedDurationDays}.`,
      // The board minute IS the evidence — this card asserts nothing new.
      evidenceRefs: [acc.id, acc.linkedFindingRef],
      missingEvidence: [],
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "acceptedAt + approvedDurationDays is in the past (governance record, not a detection)",
      },
      detectionVersion: "tolerance-expiry@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(acc.domainId),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: "now > acceptedAt + approvedDurationDays",
    });
  }

  return signals;
}
