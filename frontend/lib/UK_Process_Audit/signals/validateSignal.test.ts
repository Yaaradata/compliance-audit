/**
 * Unit test: empty evidenceRefs + empty missingEvidence must fail validation.
 * Run: npx tsx --test lib/UK_Process_Audit/signals/validateSignal.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderCardCopy } from "./copy";
import type { UkSignal } from "./types";
import { validateUkSignal } from "./validateSignal";

function baseSignal(overrides: Partial<UkSignal>): UkSignal {
  const copy = renderCardCopy("SIGNAL_FIRED", {
    controlId: "ONB-01",
    missedPeriods: 1,
  });
  return {
    id: "sig-test-1",
    mechanism: "periodic-review-absent",
    severity: "S2",
    status: "DETECTED_SIGNAL",
    controlId: "ONB-01",
    domainCode: "ONB",
    predicate: copy.predicate,
    signalObserved: copy.signalObserved,
    soWhat: copy.soWhat,
    primaryMetric: { value: 0, label: "artefacts" },
    expected: "Evidence pack by 2026-06-30",
    observed: "No artefact",
    evidenceRefs: [],
    missingEvidence: ["test workpaper", "exception log"],
    precedentId: null,
    derivation: "RULE",
    confidence: { level: "high", basis: "empty evidenceArtefactIds on armed operation" },
    detectionVersion: "silence-rule@1.0.0",
    evaluatedAt: "2026-06-30T00:00:00.000Z",
    owner: "Onboarding Operations Manager",
    alternativeExplanation: "Evidence filed under a different control id",
    humanActions: ["OPEN_EVIDENCE", "ACCEPT", "ESCALATE"],
    ...overrides,
  };
}

describe("validateUkSignal", () => {
  it("fails when evidenceRefs is empty and missingEvidence is also empty", () => {
    const invalid = baseSignal({ evidenceRefs: [], missingEvidence: [] });
    assert.throws(
      () => validateUkSignal(invalid),
      /absence must always be explained/i,
    );
  });
});
