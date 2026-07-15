import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractCompletenessClaimTerms,
  computeAssertionDenominator,
  hasCompletenessClaim,
  resolveLineAgeing,
  signedLinesWithoutPack,
  buildFrozenStatePack,
  formatAgeingCopy,
} from "./crsaAttestation.ts";

const AML_05_02_LINE = {
  id: "LINE-CYC-Q2-2026-AML-05-02",
  cycleId: "CYC-Q2-2026-AML",
  groupSetRequirementId: "GSR-AML-05-02",
  oneL: {
    controlActivity:
      "MRLO/NO prepares quarterly reports for senior management; reports include AML-C002 disposition metrics.",
    populationSize: 12847,
  },
  evidenceCompletenessPct: 58,
  evidenceCompletenessBand: "red",
  exceptionFlag: true,
};

const AML_05_02_GSR = {
  id: "GSR-AML-05-02",
  racmRef: "AML.01.05.02",
  requirementText:
    "MRLO/NO prepares reports for senior management [Detail which reports are produced, and their coverage, in the Execution Evidence column]",
};

const AML_06_01_LINE = {
  id: "LINE-CYC-Q2-2026-AML-06-01",
  cycleId: "CYC-Q2-2026-AML",
  groupSetRequirementId: "GSR-AML-06-01",
  evidenceCompletenessPct: 78,
  evidenceCompletenessBand: "amber",
};

const AML_06_01_GSR = {
  id: "GSR-AML-06-01",
  racmRef: "AML.01.06.01",
  requirementText: "AML/CTF Risk Assessments have been completed and ratified",
};

describe("crsaAttestation — assertion denominator", () => {
  it("extracts exact completeness claim term set", () => {
    const terms = extractCompletenessClaimTerms("CDD has been enhanced and fully remediated within parameters");
    assert.ok(terms.includes("enhanced"));
    assert.ok(terms.includes("fully"));
    assert.ok(terms.includes("remediated"));
    assert.ok(terms.includes("within parameters"));
  });

  it("seeds AML.01.05.02 at 888,618 / 18,000,000 = 4.9%", () => {
    assert.equal(hasCompletenessClaim(AML_05_02_LINE, AML_05_02_GSR), true);
    const denom = computeAssertionDenominator(AML_05_02_LINE, AML_05_02_GSR);
    assert.ok(denom);
    assert.equal(denom.coveredCount, 888_618);
    assert.equal(denom.populationCount, 18_000_000);
    assert.ok(Math.abs(denom.coveragePct - 4.9) < 0.1);
  });
});

describe("crsaAttestation — line ageing", () => {
  it("fires AML.01.06.01 with 7 cycles and 14 month artefact gap", () => {
    const ageing = resolveLineAgeing(AML_06_01_LINE, AML_06_01_GSR);
    assert.ok(ageing?.fires);
    assert.equal(ageing.consecutiveCycles, 7);
    assert.equal(ageing.lastArtefactMonthsAgo, 14);
    assert.match(formatAgeingCopy(ageing), /AML\.01\.06\.01/);
  });
});

describe("crsaAttestation — attestation without pack", () => {
  it("constructs seven-number frozen pack for signed line without snapshot", () => {
    const records = signedLinesWithoutPack([AML_06_01_LINE], {
      "GSR-AML-06-01": AML_06_01_GSR,
    });
    assert.equal(records.length, 1);
    const pack = buildFrozenStatePack(records[0], AML_06_01_LINE);
    assert.equal(pack.numbers.cycleCompletionPct, 76);
    assert.equal(pack.numbers.lineEvidencePct, 78);
    assert.equal(pack.numbers.alertOpenBacklog, 2565);
    assert.equal(Object.keys(pack.numbers).length, 7);
  });
});
