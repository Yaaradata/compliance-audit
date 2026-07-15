/**
 * Tests for the UK enforcement precedent corpus.
 * Run: npx tsx --test lib/UK_Process_Audit/signals/precedentCorpus.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UkRawControlRow } from "../types";
import {
  UK_PRECEDENTS,
  assertPrecedentsHaveAdmissionPosture,
  formatPenalty,
  matchPrecedents,
} from "./precedentCorpus";

describe("UK_PRECEDENTS corpus", () => {
  it("has exactly twelve records", () => {
    assert.equal(UK_PRECEDENTS.length, 12);
  });

  it("every record has a non-null admissionPosture (runtime)", () => {
    assert.doesNotThrow(() => assertPrecedentsHaveAdmissionPosture());
    for (const p of UK_PRECEDENTS) {
      assert.notEqual(p.admissionPosture, null);
      assert.notEqual(p.admissionPosture, undefined);
      assert.ok(typeof p.admissionPosture === "string" && p.admissionPosture.length > 0);
    }
  });

  it("formatPenalty(#11 Bank of Ireland) contains both 3,779,300 and 5,427,600", () => {
    const boi = UK_PRECEDENTS.find((p) => p.id === "boi-cop-2026-02-19");
    assert.ok(boi);
    const formatted = formatPenalty(boi);
    assert.match(formatted, /3,779,300/);
    assert.match(formatted, /5,427,600/);
  });

  it("matchPrecedents on an untagged control returns []", () => {
    const untagged = {
      failureMechanismTags: [],
    } as unknown as UkRawControlRow;
    assert.deepEqual(matchPrecedents(untagged), []);
  });

  it("record #12 respondent is the literal unnamed-firms string", () => {
    const watch = UK_PRECEDENTS.find((p) => p.id === "fca-enforcement-watch-1-2026-01-28");
    assert.ok(watch);
    assert.equal(watch.respondent, "Firms not named by the FCA");
  });
});
