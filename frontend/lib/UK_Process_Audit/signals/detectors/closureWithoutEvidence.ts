import type { UkRemediationItem, UkSignal } from "../types";
import { renderCardCopy } from "../copy";
import { hashString, makeRng } from "../rng";
import type { DetectorFn, UkDetectorSnapshot } from "./types";

/** Hand-authored — never generate at runtime. */
export const CLOSURE_ALTERNATIVE_EXPLANATION =
  "The artefact may exist in a system not yet connected to the evidence store. This is the most common true cause — resolve it before re-opening the item.";

const HSBC_PRECEDENT_ID = "hsbc-collections-2024-05-23";

const CLOSED_ZERO_EVIDENCE_IDS = ["REC-08", "REC-14", "REC-19", "REC-27"] as const;
const LEAVER_ITEM_ID = "REC-19";
const LEAVER_NAME = "Jordan Blake (leaver)";

/**
 * SYNTHETIC — labelled.
 * 34 CMP remediation items; 11 closed; 4 of those have zero artefacts;
 * REC-19 closedBy a person marked as a leaver.
 */
export function seedCmpRemediationItems(): UkRemediationItem[] {
  const items: UkRemediationItem[] = [];
  const closedIds = new Set([
    "REC-03",
    "REC-05",
    "REC-08",
    "REC-11",
    "REC-14",
    "REC-17",
    "REC-19",
    "REC-22",
    "REC-27",
    "REC-30",
    "REC-33",
  ]);
  const zeroEvidence = new Set<string>(CLOSED_ZERO_EVIDENCE_IDS);

  for (let i = 1; i <= 34; i++) {
    const id = `REC-${String(i).padStart(2, "0")}`;
    const rng = makeRng(hashString(`cmp-remediation:${id}`));
    const closed = closedIds.has(id);
    const noEvidence = closed && zeroEvidence.has(id);
    const isLeaver = id === LEAVER_ITEM_ID;
    const raiseMonth = 1 + Math.floor(rng() * 3); // Jan–Mar
    const raiseDay = 10 + Math.floor(rng() * 18);
    const closeMonth = 4 + Math.floor(rng() * 2); // Apr–May
    const closeDay = 5 + Math.floor(rng() * 20);

    items.push({
      id,
      text: `CMP remediation action ${id}: root-cause fix and outcome QA`,
      raisedAt: `2026-${String(raiseMonth).padStart(2, "0")}-${String(raiseDay).padStart(2, "0")}`,
      cycleDue: "2026-06-30",
      status: closed ? "closed" : "open",
      closedBy: closed ? (isLeaver ? LEAVER_NAME : `CMP Owner ${1 + Math.floor(rng() * 6)}`) : null,
      closedAt: closed
        ? `2026-${String(closeMonth).padStart(2, "0")}-${String(closeDay).padStart(2, "0")}`
        : null,
      evidenceArtefactIds: noEvidence ? [] : closed ? [`${id}-ART-01`] : [],
      closedByIsLeaver: isLeaver ? true : undefined,
      domainCode: "CMP",
    });
  }

  return items;
}

/**
 * RULE detector: closed remediation items with no evidence artefacts.
 */
export const detectClosureWithoutEvidence: DetectorFn = (
  snapshot: UkDetectorSnapshot,
): UkSignal[] => {
  const signals: UkSignal[] = [];
  const cmpControl =
    snapshot.controls.find((c) => c.domainCode === "CMP") ?? snapshot.controls[0];

  for (const item of snapshot.remediationItems) {
    if (item.status !== "closed") continue;
    if (item.evidenceArtefactIds.length !== 0) continue;

    const copy = renderCardCopy("EVIDENCE_GAP_OBSERVED", {
      remediationId: item.id,
      closedBy: item.closedBy ?? undefined,
      isLeaver: Boolean(item.closedByIsLeaver),
    });

    signals.push({
      id: `closure-${item.id}`,
      mechanism: "remediation-unevidenced",
      severity: "S1",
      status: "DETECTED_SIGNAL",
      controlId: cmpControl?.controlId ?? "CMP-06",
      domainCode: item.domainCode,
      predicate: copy.predicate,
      signalObserved: copy.signalObserved,
      soWhat: copy.soWhat,
      primaryMetric: { value: 0, label: "evidence artefacts on closed item" },
      expected: "Closed item with retained evidence pack",
      observed: "status=closed · evidenceArtefactIds=[]",
      evidenceRefs: [],
      missingEvidence: [
        `Closure evidence for ${item.id}`,
        item.closedByIsLeaver
          ? `Re-attestation after leaver closure (${item.closedBy})`
          : `Workpaper or sign-off linked to ${item.id}`,
      ],
      precedentId: HSBC_PRECEDENT_ID,
      derivation: "RULE",
      confidence: {
        level: "high",
        basis: "closed status with empty evidenceArtefactIds",
      },
      detectionVersion: "closure-without-evidence@1.0.0",
      evaluatedAt: `${snapshot.asOf}T00:00:00.000Z`,
      owner: item.closedBy ?? cmpControl?.controlOwnerRole ?? "Complaints Manager",
      alternativeExplanation: CLOSURE_ALTERNATIVE_EXPLANATION,
      humanActions: ["OPEN_EVIDENCE", "REJECT", "ESCALATE"],
    });
  }

  return signals;
};
