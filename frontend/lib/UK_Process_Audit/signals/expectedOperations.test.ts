/**
 * Tests for expected-operations calendar.
 * Run: npx tsx --test lib/UK_Process_Audit/signals/expectedOperations.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONFIRMED_CADENCE,
  SILENCE_FC_SANCTIONS_CONTROL_ID,
  buildEvidenceArtefacts,
  buildExpectedOperations,
  parseCadence,
} from "./expectedOperations";

describe("expectedOperations", () => {
  it('parseCadence("Event-driven") === null', () => {
    assert.equal(parseCadence("Event-driven"), null);
    assert.equal(parseCadence("Event-triggered"), null);
    assert.equal(parseCadence("Ad-hoc"), null);
  });

  it("buildExpectedOperations for Monthly over 12 periods returns 12 rows with expectedBy strictly increasing", () => {
    const asOf = new Date(Date.UTC(2026, 5, 30)); // 2026-06-30
    const ops = buildExpectedOperations(
      { controlId: "CMP-01", testingFrequency: "Monthly" },
      { periods: 12, asOf },
    );
    assert.equal(ops.length, 12);
    for (let i = 1; i < ops.length; i++) {
      assert.ok(
        ops[i]!.expectedBy > ops[i - 1]!.expectedBy,
        `expectedBy not increasing at ${i}: ${ops[i - 1]!.expectedBy} -> ${ops[i]!.expectedBy}`,
      );
    }
  });

  it("FC-07 has exactly 4 trailing operations with evidenceArtefactIds: []", () => {
    const asOf = new Date(Date.UTC(2026, 5, 30));
    const ops = buildExpectedOperations(
      { controlId: SILENCE_FC_SANCTIONS_CONTROL_ID, testingFrequency: "Monthly" },
      { periods: 12, asOf },
    );
    buildEvidenceArtefacts(
      {
        controlId: SILENCE_FC_SANCTIONS_CONTROL_ID,
        evidenceType: "Regulatory Filing Copy",
        evidenceSourceSystem: "Screening tool; case management",
      },
      ops,
    );
    const trailing = ops.slice(-4);
    assert.equal(trailing.length, 4);
    for (const op of trailing) {
      assert.deepEqual(op.evidenceArtefactIds, []);
    }
    // Earlier ops are evidenced
    for (const op of ops.slice(0, -4)) {
      assert.equal(op.evidenceArtefactIds.length, 1);
    }
  });

  it("re-running the builder twice returns deep-equal output (determinism)", () => {
    const asOf = new Date(Date.UTC(2026, 5, 30));
    const control = { controlId: "ONB-05", testingFrequency: "Monthly" };
    const meta = {
      controlId: "ONB-05",
      evidenceType: "Exception Report",
      evidenceSourceSystem: "Name-screening/watchlist tool",
    };

    const a = buildExpectedOperations(control, { periods: 6, asOf });
    const artsA = buildEvidenceArtefacts(meta, a);

    const b = buildExpectedOperations(control, { periods: 6, asOf });
    const artsB = buildEvidenceArtefacts(meta, b);

    assert.deepEqual(a, b);
    assert.deepEqual(artsA, artsB);
  });

  it("CONFIRMED_CADENCE covers ~60 controls (armed); remainder stay unarmed", () => {
    const n = Object.keys(CONFIRMED_CADENCE).length;
    assert.ok(n >= 55 && n <= 65, `expected ~60 confirmed, got ${n}`);
    const armed = buildExpectedOperations(
      { controlId: "FC-07", testingFrequency: "Monthly" },
      { periods: 3, asOf: new Date(Date.UTC(2026, 5, 30)) },
    );
    assert.equal(armed[0]?.cadenceSource, "human-confirmed");
    const unarmed = buildExpectedOperations(
      { controlId: "ONB-10", testingFrequency: "Annual" },
      { periods: 3, asOf: new Date(Date.UTC(2026, 5, 30)) },
    );
    assert.equal(unarmed[0]?.cadenceSource, "register");
  });
});
