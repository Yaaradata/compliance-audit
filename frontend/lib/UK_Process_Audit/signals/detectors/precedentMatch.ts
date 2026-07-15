import { formatPenalty, matchPrecedents } from "../precedentCorpus";
import { parseCadence } from "../expectedOperations";
import { renderCardCopy } from "../copy";
import type { UkSignal } from "../types";
import { daysBetween, type DetectorFn, type UkDetectorSnapshot } from "./types";

/** Hand-authored — never generate at runtime. */
export const PRECEDENT_MATCH_ALTERNATIVE_EXPLANATION =
  "The mechanism matches nominally but this firm's product set may differ from the respondent's. Confirm the control's scope before commissioning a review.";

function latestArtefactTs(
  snapshot: UkDetectorSnapshot,
  controlId: string,
): string | null {
  const arts = snapshot.artefactsByControlId[controlId] ?? [];
  if (arts.length === 0) return null;
  let latest = arts[0]!.ts;
  for (const a of arts) {
    if (a.ts > latest) latest = a.ts;
  }
  return latest;
}

function monthsAgoLabel(days: number): string {
  const months = Math.max(1, Math.round(days / 30));
  return months === 1 ? "1 month" : `${months} months`;
}

function isSilentControl(snapshot: UkDetectorSnapshot, controlId: string): boolean {
  const ops = snapshot.expectedOpsByControlId[controlId] ?? [];
  return ops.some(
    (op) =>
      op.cadenceSource === "human-confirmed" &&
      op.evidenceArtefactIds.length === 0 &&
      snapshot.asOf > op.expectedBy,
  );
}

/**
 * LLM (mechanism extraction) + RULE (taxonomy match) — two ClaimLines.
 * Fires when precedents match AND latest evidence is older than one cadence window.
 */
export const detectPrecedentMatch: DetectorFn = (snapshot: UkDetectorSnapshot): UkSignal[] => {
  const signals: UkSignal[] = [];

  for (const control of snapshot.controls) {
    const matched = matchPrecedents(control);
    if (matched.length === 0) continue;

    const cadence = parseCadence(control.testingFrequency);
    if (!cadence) continue;

    const latest = latestArtefactTs(snapshot, control.controlId);
    const daysSince = latest == null ? Number.POSITIVE_INFINITY : daysBetween(latest, snapshot.asOf);
    if (!(daysSince > cadence.days)) continue;

    const precedent = matched[0]!;
    const silent = isSilentControl(snapshot, control.controlId);
    const nLabel = latest == null ? "never" : monthsAgoLabel(daysSince);

    const copy = renderCardCopy("PRECEDENT_MATCHED", {
      respondent: precedent.respondent,
      penaltyLabel: formatPenalty(precedent),
      noticeDate: precedent.noticeDate,
      controlId: control.controlId,
      evidenceAgeLabel: nLabel,
    });

    signals.push({
      id: `precedent-${control.controlId}-${precedent.id}`,
      mechanism: precedent.failureMechanismTags[0] ?? "assertion-unevidenced",
      severity: silent ? "S1" : "S2",
      status: "DETECTED_SIGNAL",
      controlId: control.controlId,
      domainCode: control.domainCode,
      predicate: copy.predicate,
      signalObserved: copy.signalObserved,
      soWhat: copy.soWhat,
      primaryMetric: {
        value: latest == null ? "none" : nLabel,
        label: "time since last evidence",
      },
      expected: `Evidence within ${cadence.days}d cadence`,
      observed: latest == null ? "No artefacts on file" : `Latest artefact ${latest.slice(0, 10)}`,
      evidenceRefs: latest ? [(snapshot.artefactsByControlId[control.controlId] ?? []).sort((a, b) => (a.ts < b.ts ? 1 : -1))[0]!.id] : [],
      missingEvidence:
        latest == null
          ? [`Current-period evidence for ${control.controlId}`]
          : [],
      precedentId: precedent.id,
      derivation: "LLM",
      confidence: {
        level: precedent.confidence === "verified" ? "high" : "medium",
        basis: "mechanism taxonomy intersection + stale evidence window",
      },
      detectionVersion: "precedent-match@1.0.0",
      evaluatedAt: `${snapshot.asOf}T00:00:00.000Z`,
      owner: control.controlOwnerRole,
      alternativeExplanation: PRECEDENT_MATCH_ALTERNATIVE_EXPLANATION,
      humanActions: ["OPEN_EVIDENCE", "OPEN_INVESTIGATION", "ESCALATE"],
      claimLines: [
        {
          derivation: "LLM",
          text: `Mechanism extraction from ${precedent.respondent} notice → ${precedent.failureMechanismTags.join(", ")}`,
        },
        {
          derivation: "RULE",
          text: `Taxonomy match: control ${control.controlId} tags ∩ precedent tags is non-empty`,
        },
      ],
    });
  }

  return signals;
};
