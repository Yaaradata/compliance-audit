/**
 * deadlineWithoutEvidence — derivation "RULE". THE COUNTER-CASE — keep it.
 *
 * Fires ONLY after a deadline has passed with zero evidence artefacts. It claims
 * NOTHING before the deadline: before it, the only available signal is an
 * internal project RAG status, which this product cannot see and does not claim
 * to. This is the Bank of Ireland (UK) shape.
 *
 * v4's cyber tile carries `deadline: "RED UNTIL 18-JUL"` — a display string that
 * nothing evaluates. Here it is evaluated, honestly: with the evaluation clock at
 * 2026-07-10 the 18-Jul deadline has NOT passed, so this detector is silent. A
 * pack that names its own blind spot is more credible than one that claims to see
 * everything.
 */
import { DOMAIN_EVIDENCE, RISK_DOMAINS_V4 } from "../riskDomainsV6";
import { getPrecedentById } from "../precedentCorpus";
import type { BoardSignal } from "../types";
import {
  EVALUATED_AT,
  NOW_MS,
  accountabilityFor,
  isoDate,
  parseDeadline,
  precedentFields,
} from "./_shared";

export const DEADLINE_WITHOUT_EVIDENCE_TITLE = "Deadline Without Evidence" as const;

const ALTERNATIVE_EXPLANATION =
  "Before the deadline, the only available signal is an internal project RAG status. This " +
  "product cannot see that, and does not claim to.";

const PRECEDENT_ID = "uk-bank-of-ireland-uk-2026";

function hasArtefact(domainId: string): boolean {
  return DOMAIN_EVIDENCE.some((e) => e.domainId === domainId && e.artefactId !== null);
}

export function detectDeadlineWithoutEvidence(): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const domain of RISK_DOMAINS_V4) {
    const deadlineMs = parseDeadline(domain.deadline);
    if (deadlineMs === null) continue;
    // Claims NOTHING before the deadline.
    if (NOW_MS <= deadlineMs) continue;
    // Fires only when the deadline passed with zero artefacts.
    if (hasArtefact(domain.id)) continue;

    const { precedents, primaryPrecedent: primary } = precedentFields(
      [getPrecedentById(PRECEDENT_ID)].filter((p): p is NonNullable<typeof p> => p != null),
    );

    signals.push({
      id: `deadline-without-evidence-${domain.id}`,
      title: DEADLINE_WITHOUT_EVIDENCE_TITLE,
      mechanism: "deadline-missed",
      severity: "S2",
      status: "DETECTED_SIGNAL",
      domainId: domain.id,
      domainName: domain.name,
      signalObserved: `${domain.name} deadline passed with no evidence artefact`,
      soWhat: `${domain.name}'s deadline (${isoDate(deadlineMs)}) has passed with no evidence artefact on record.`,
      primaryMetric: { value: 0, label: "artefacts after deadline" },
      expected: `An evidence artefact by the deadline (${isoDate(deadlineMs)})`,
      observed: "Deadline passed; 0 artefacts on record.",
      evidenceRefs: [],
      missingEvidence: [`an evidence artefact dated on or before ${isoDate(deadlineMs)}`],
      precedents,
      primaryPrecedent: primary,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "deadline in the past with no artefact in the evidence store",
      },
      detectionVersion: "deadline-without-evidence@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(domain.id),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: "now > deadline && artefact count === 0",
    });
  }

  return signals;
}
