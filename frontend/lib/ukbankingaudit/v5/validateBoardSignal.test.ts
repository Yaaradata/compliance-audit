/**
 * Unit test: a BoardSignal with empty evidenceRefs AND empty missingEvidence
 * must fail validation. Absence must always be explained.
 * Run: npx tsx --test lib/ukbankingaudit/v5/validateBoardSignal.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BoardSignal } from "./types";
import { isBoardSignalValid, validateBoardSignal } from "./validateBoardSignal";

function baseSignal(overrides: Partial<BoardSignal>): BoardSignal {
  return {
    id: "bs-test-1",
    title: "Green Without Evidence",
    mechanism: "sanctions-screening-misconfigured",
    severity: "S1",
    status: "DETECTED_SIGNAL",
    domainId: "fincrime",
    domainName: "Fraud & Financial Crime",
    crsaRef: "SCTN.01.01.01",
    signalObserved: "Sanctions / PEP Screening reported GREEN with no dated artefact",
    soWhat: "The board is being asked to accept a screening assurance that no evidence supports.",
    primaryMetric: { value: 0, label: "artefacts" },
    expected: "Screening coverage attestation dated within 365 days",
    observed: "No artefact on record",
    evidenceRefs: [],
    missingEvidence: ["screening coverage attestation", "list-version reconciliation"],
    precedents: [],
    primaryPrecedent: null,
    derivation: "RULE",
    confidence: { level: "high", basis: "artefactId is null on an armed domain" },
    detectionVersion: "green-without-evidence@1.0.0",
    evaluatedAt: "2026-07-10T00:00:00.000Z",
    accountability: {
      regime: "UK",
      smf: "SMF17",
      holder: "D. Fairweather",
      prescribedResponsibility: "AML/CTF systems and controls (MLR 2017 reg 21 MLRO).",
    },
    alternativeExplanation: "Attestation filed against a different control reference",
    trigger: "status === GREEN && artefactId === null && cadenceSource === human-confirmed",
    ...overrides,
  };
}

describe("validateBoardSignal", () => {
  it("fails when evidenceRefs is empty and missingEvidence is also empty", () => {
    const invalid = baseSignal({ evidenceRefs: [], missingEvidence: [] });
    assert.throws(
      () => validateBoardSignal(invalid),
      /absence must always be explained/i,
    );
    assert.equal(isBoardSignalValid(invalid), false);
  });

  it("passes when absence is explained via missingEvidence", () => {
    const valid = baseSignal({ evidenceRefs: [], missingEvidence: ["screening attestation"] });
    assert.doesNotThrow(() => validateBoardSignal(valid));
    assert.equal(isBoardSignalValid(valid), true);
  });

  it("passes when evidence is present", () => {
    const valid = baseSignal({ evidenceRefs: ["EVID-CREDIT-VALIDATION-2026"], missingEvidence: [] });
    assert.equal(isBoardSignalValid(valid), true);
  });
});
