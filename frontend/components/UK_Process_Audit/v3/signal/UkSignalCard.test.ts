/**
 * Runtime proof that stripped admissionPosture does not render.
 * Run: npx tsx --test components/UK_Process_Audit/v3/signal/UkSignalCard.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderCardCopy } from "@/lib/UK_Process_Audit/signals/copy";
import type { UkPrecedent, UkSignal } from "@/lib/UK_Process_Audit/signals";

function hasAdmissionPosture(
  precedent: UkPrecedent | null | undefined,
): boolean {
  return precedent != null && precedent.admissionPosture != null;
}

/** Mirrors UkSignalCard gate (without React). */
function shouldRenderCard(signal: UkSignal, precedent: UkPrecedent | null): boolean {
  if (precedent != null && !hasAdmissionPosture(precedent)) return false;
  if (signal.precedentId != null && precedent == null) return false;
  return true;
}

const copy = renderCardCopy("SIGNAL_FIRED", {
  controlId: "FC-07",
  missedPeriods: 4,
});

const baseSignal: UkSignal = {
  id: "sig-test",
  mechanism: "periodic-review-absent",
  severity: "S2",
  status: "DETECTED_SIGNAL",
  controlId: "FC-07",
  domainCode: "FC",
  predicate: copy.predicate,
  signalObserved: copy.signalObserved,
  soWhat: copy.soWhat,
  primaryMetric: { value: 4, label: "missed periods" },
  expected: "4 monthly operations",
  observed: "0 evidence artefacts",
  evidenceRefs: [],
  missingEvidence: ["Evidence pack due 2026-06-30"],
  precedentId: "nationwide-2025-12-11",
  derivation: "RULE",
  confidence: { level: "high", basis: "test" },
  detectionVersion: "silence-rule@1.0.0",
  evaluatedAt: "2026-06-30T00:00:00.000Z",
  owner: "Sanctions Operations Manager",
  alternativeExplanation: "Evidence may have been filed against the parent control.",
  humanActions: ["OPEN_EVIDENCE", "ACCEPT"],
};

describe("UkSignalCard admissionPosture gate", () => {
  it("does not render when admissionPosture is stripped", () => {
    const stripped = {
      id: "nationwide-2025-12-11",
      regulator: "FCA",
      noticeDate: "2025-12-11",
      respondent: "Nationwide Building Society",
      penalty: 44078500,
      penaltyPreDiscount: 62969297,
      tribunalReducedTo: null,
      instrument: ["PRIN 3"],
      admissionPosture: undefined,
      failureMechanismTags: [],
      sourceUrl: "",
      confidence: "verified",
    } as unknown as UkPrecedent;

    assert.equal(shouldRenderCard(baseSignal, stripped), false);
  });

  it("renders when admissionPosture is present", () => {
    const ok = {
      id: "nationwide-2025-12-11",
      regulator: "FCA" as const,
      noticeDate: "2025-12-11",
      respondent: "Nationwide Building Society",
      penalty: 44078500,
      penaltyPreDiscount: 62969297,
      tribunalReducedTo: null,
      instrument: ["PRIN 3"],
      admissionPosture: "settled-no-admission" as const,
      failureMechanismTags: [],
      sourceUrl: "",
      confidence: "verified" as const,
    };
    assert.equal(shouldRenderCard(baseSignal, ok), true);
  });
});
