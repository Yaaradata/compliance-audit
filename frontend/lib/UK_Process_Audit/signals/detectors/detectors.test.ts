/**
 * Acceptance-gate tests for the detector data layer.
 * Run: npx tsx --test lib/UK_Process_Audit/signals/detectors/detectors.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveControlMetrics } from "../../deriveMetrics";
import { parseUkControlRows } from "../../parseControls";
import { UK_PRECEDENTS } from "../precedentCorpus";
import { validateUkSignal } from "../validateSignal";
import {
  buildDetectorSnapshot,
  detectControlSilence,
  runAllDetectors,
  seedCmpRemediationItems,
} from "./index";
import type { UkDetectorSnapshot } from "./types";

function loadControls() {
  return parseUkControlRows().map(deriveControlMetrics);
}

describe("detectors acceptance gate", () => {
  const asOf = "2026-06-30";
  const controls = loadControls();
  const snapshot = buildDetectorSnapshot(controls, { periods: 12, asOf });

  it("controlSilence never fires on cadenceSource !== human-confirmed", () => {
    // Force all ops to register (unarmed) with empty evidence — must not signal.
    const unarmed: UkDetectorSnapshot = {
      ...snapshot,
      expectedOpsByControlId: Object.fromEntries(
        Object.entries(snapshot.expectedOpsByControlId).map(([id, ops]) => [
          id,
          ops.map((op) => ({
            ...op,
            cadenceSource: "register" as const,
            confirmedBy: null,
            confirmedAt: null,
            evidenceArtefactIds: [],
          })),
        ]),
      ),
    };
    const signals = detectControlSilence(unarmed);
    assert.equal(signals.length, 0);
  });

  it("every UkSignal with evidenceRefs: [] has non-empty missingEvidence", () => {
    const signals = runAllDetectors(snapshot);
    assert.ok(signals.length > 0, "expected detectors to fire");
    for (const s of signals) {
      if (s.evidenceRefs.length === 0) {
        assert.ok(
          s.missingEvidence.length > 0,
          `${s.id}: empty evidenceRefs requires missingEvidence`,
        );
      }
      assert.doesNotThrow(() => validateUkSignal(s));
    }
  });

  it("every UkSignal has a non-empty alternativeExplanation", () => {
    for (const s of runAllDetectors(snapshot)) {
      assert.ok(
        typeof s.alternativeExplanation === "string" && s.alternativeExplanation.trim().length > 0,
        `${s.id}: alternativeExplanation must be non-empty`,
      );
    }
  });

  it("every UkSignal with a precedentId resolves to a precedent with non-null admissionPosture", () => {
    const byId = new Map(UK_PRECEDENTS.map((p) => [p.id, p]));
    for (const s of runAllDetectors(snapshot)) {
      if (s.precedentId == null) continue;
      const p = byId.get(s.precedentId);
      assert.ok(p, `${s.id}: unknown precedentId ${s.precedentId}`);
      assert.notEqual(p.admissionPosture, null);
      assert.notEqual(p.admissionPosture, undefined);
    }
  });

  it("runAllDetectors is deterministic across two invocations", () => {
    const a = runAllDetectors(snapshot);
    const b = runAllDetectors(snapshot);
    assert.deepEqual(a, b);
  });

  it("CMP remediation seed: 34 items, 11 closed, 4 closed with zero artefacts, REC-19 leaver", () => {
    const items = seedCmpRemediationItems();
    assert.equal(items.length, 34);
    const closed = items.filter((i) => i.status === "closed");
    assert.equal(closed.length, 11);
    const closedEmpty = closed.filter((i) => i.evidenceArtefactIds.length === 0);
    assert.equal(closedEmpty.length, 4);
    const rec19 = items.find((i) => i.id === "REC-19");
    assert.ok(rec19);
    assert.equal(rec19.status, "closed");
    assert.equal(rec19.evidenceArtefactIds.length, 0);
    assert.equal(rec19.closedByIsLeaver, true);
  });
});
