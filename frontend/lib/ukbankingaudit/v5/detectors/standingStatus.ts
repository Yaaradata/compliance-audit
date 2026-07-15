/**
 * standingStatus — derivation "RULE".
 *
 * Fires when a domain has held the same non-GREEN status for >= 3 consecutive
 * board cycles (from DOMAIN_HISTORY, newest last). The point: v4's `delta: 0`
 * reads as "nothing changed" — and nothing changing IS the finding.
 */
import { DOMAIN_HISTORY } from "../riskDomainsV5";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal, RagStatus } from "../types";
import {
  EVALUATED_AT,
  accountabilityFor,
  domainName,
  findDomain,
  precedentFields,
} from "./_shared";

export const STANDING_STATUS_TITLE = "Standing Status" as const;

const ALTERNATIVE_EXPLANATION =
  "A stable amber may reflect a deliberate, still-valid risk acceptance. Check the " +
  "acceptance record and its approved duration before escalating — see Tolerance Expiry.";

const PRECEDENT_ID = "uk-nationwide-2025";
const MIN_RUN = 3;

/** Length of the trailing run of identical status (from the newest cycle backwards). */
function trailingRun(cycles: { status: RagStatus }[]): { status: RagStatus; run: number } | null {
  if (cycles.length === 0) return null;
  const status = cycles[cycles.length - 1].status;
  let run = 0;
  for (let i = cycles.length - 1; i >= 0 && cycles[i].status === status; i--) run++;
  return { status, run };
}

export function detectStandingStatus(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const history of DOMAIN_HISTORY) {
    const trailing = trailingRun(history.cycles);
    if (!trailing) continue;
    if (trailing.status === "GREEN") continue;
    if (trailing.run < MIN_RUN) continue;

    const domain = findDomain(history.domainId);
    const trend = domain?.trend ?? "stable";
    const delta = domain?.delta ?? 0;
    const name = domainName(history.domainId);

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `standing-status-${history.domainId}`,
      title: STANDING_STATUS_TITLE,
      mechanism: "risk-tolerated-past-expiry",
      severity: trailing.status === "RED" ? "S1" : "S2",
      status: "DETECTED_SIGNAL",
      domainId: history.domainId,
      domainName: name,
      signalObserved: `${trailing.status} held for ${trailing.run} consecutive board cycles`,
      soWhat: `${name} has been ${trailing.status} for ${trailing.run} consecutive board cycles. Trend: ${trend}. Delta: ${delta}.`,
      primaryMetric: { value: trailing.run, label: "consecutive cycles in status" },
      expected: "A status change, or a current, in-date risk acceptance explaining the hold",
      observed: `${trailing.status} unchanged across ${trailing.run} cycles (trend ${trend}, delta ${delta})`,
      evidenceRefs: [],
      missingEvidence: [`evidence of remediation movement across ${trailing.run} cycles`],
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: `${trailing.run} consecutive cycles in DOMAIN_HISTORY`,
      },
      detectionVersion: "standing-status@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(history.domainId),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: "consecutive non-GREEN cycles >= 3 in DOMAIN_HISTORY",
    });
  }

  return signals;
}
