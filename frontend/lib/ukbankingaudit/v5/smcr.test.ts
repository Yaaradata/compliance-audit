import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { precedentsSinceAttestation, unacknowledgedPrecedentRows } from "./smcrPrecedentAwareness.ts";
import { standingAwarenessGaps } from "./smcrStanding.ts";
import { rssEvidenceState } from "./smcrEvidence.ts";

describe("smcrEvidence", () => {
  it("seeds attestationFreshness and issueAwareness as hollow", () => {
    assert.equal(rssEvidenceState("attestationFreshness"), "hollow");
    assert.equal(rssEvidenceState("issueAwareness"), "hollow");
    assert.equal(rssEvidenceState("oversightCadenceEvidence"), "filled");
  });
});

describe("smcrPrecedentAwareness", () => {
  it("returns countable Final Notices for CRO demo SMF", () => {
    const rows = precedentsSinceAttestation({
      smfId: "SMF4-MARK-X",
      smfFunction: "SMF4",
      lastAttestationDate: "2026-04-23",
      accountableControlIds: [],
    });
    assert.ok(rows.length >= 4);
    assert.equal(unacknowledgedPrecedentRows(rows, []).length, rows.length);
  });
});

describe("smcrStanding", () => {
  it("surfaces ISS-2026-009 gap for MLRO with Nationwide precedent note", () => {
    const gaps = standingAwarenessGaps({
      smfId: "SMF17-PRIYA-PATEL",
      smfFunction: "SMF17",
      lastAttestationDate: "2026-03-31",
      nextAttestationDue: "2026-06-29",
      trail: [],
      issues: [
        {
          id: "ISS-2026-009",
          accountableSMFId: "SMF17-PRIYA-PATEL",
          daysOpen: 82,
          status: "in_remediation",
          title: "AML alert backlog exceeds appetite",
        },
      ],
      findings: [],
    });
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].daysOpen, 214);
    assert.ok(gaps[0].precedentNote?.includes("Nationwide"));
  });
});
