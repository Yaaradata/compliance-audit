/**
 * crsaPrecedentMatch — derivation SPLIT (LLM + RULE). ONE signal per CRSA ref.
 */
import { CRSA_DATA, CRSA_MECHANISM_TAGS, RISK_DOMAINS_V4 } from "../riskDomainsV6";
import { formatConsequence, matchPrecedents } from "../precedentCorpus";
import type { BoardSignal, CrsaControl, FailureMechanism } from "../types";
import { rankPrecedents } from "../precedentRank";
import {
  EVALUATED_AT,
  accountabilityFor,
  domainName,
  precedentFields,
} from "./_shared";

export const CRSA_PRECEDENT_MATCH_TITLE = "Precedent Match" as const;

const ALTERNATIVE_EXPLANATION =
  "The mechanism matches nominally, but this firm's product set may differ from the " +
  "respondent's. Confirm the CRSA control's scope before commissioning a review.";

function locateControl(ref: string): { control: CrsaControl; domainId: string } | null {
  for (const [area, controls] of Object.entries(CRSA_DATA)) {
    const control = controls.find((c) => c.ref === ref);
    if (control) {
      const domain = RISK_DOMAINS_V4.find((d) => d.crsa === area);
      return { control, domainId: domain?.id ?? area };
    }
  }
  return null;
}

export function detectCrsaPrecedentMatch(jurisdiction: "UK" | "US"): BoardSignal[] {
  const signals: BoardSignal[] = [];

  for (const [ref, tags] of Object.entries(CRSA_MECHANISM_TAGS)) {
    const located = locateControl(ref);
    if (!located) continue;
    const { control, domainId } = located;

    const matched = rankPrecedents(
      matchPrecedents(tags as FailureMechanism[], jurisdiction, domainId),
    );
    if (matched.length === 0) continue;

    const primary = matched[0];
    const shared =
      tags.find((t) => primary.failureMechanismTags.includes(t)) ?? tags[0];
    const consequence = formatConsequence(primary);
    const action =
      primary.penalty != null
        ? `The ${primary.regulator} fined ${primary.respondent} ${consequence} on ${primary.noticeDate}`
        : `The ${primary.regulator} imposed ${consequence.toLowerCase()} on ${primary.respondent} on ${primary.noticeDate}`;

    const { precedents, primaryPrecedent: primaryP } = precedentFields(matched);

    signals.push({
      id: `crsa-precedent-${ref}`,
      title: CRSA_PRECEDENT_MATCH_TITLE,
      mechanism: shared as FailureMechanism,
      severity: control.status === "RED" ? "S1" : "S2",
      status: "DETECTED_SIGNAL",
      domainId,
      domainName: domainName(domainId),
      crsaRef: ref,
      signalObserved: `CRSA ${ref} shares a failure mechanism with ${matched.length} enforcement precedent(s)`,
      soWhat: `${action} for the mechanism behind ${ref}, which is ${control.status} on this pack.`,
      primaryMetric: { value: control.status, label: `CRSA ${ref} status` },
      expected: "No overlap between this control's mechanism and a live enforcement precedent",
      observed: `Mechanism "${shared}" is shared with ${primary.respondent} (${primary.admissionPosture})${
        matched.length > 1 ? ` and ${matched.length - 1} other precedent(s)` : ""
      }`,
      evidenceRefs: [...matched.map((p) => p.id), ref],
      missingEvidence: [],
      precedents,
      primaryPrecedent: primaryP,
      derivation: "LLM",
      confidence: {
        level: "medium",
        basis: "mechanism extracted from notice text by LLM; CRSA ref matched by rule",
      },
      detectionVersion: "crsa-precedent-match@1.0.0",
      evaluatedAt: EVALUATED_AT,
      accountability: accountabilityFor(domainId),
      alternativeExplanation: ALTERNATIVE_EXPLANATION,
      trigger: `CRSA_MECHANISM_TAGS[${ref}] ∩ precedent.failureMechanismTags ≠ ∅ (domain-scoped)`,
      claims: [
        {
          derivation: "LLM",
          text: `failure mechanism extracted from the ${primary.regulator} notice of ${primary.noticeDate}`,
          evidenceRef: primary.id,
        },
        {
          derivation: "RULE",
          text: `matched deterministically against CRSA ref ${ref}`,
          evidenceRef: ref,
        },
      ],
    });
  }

  return signals;
}
