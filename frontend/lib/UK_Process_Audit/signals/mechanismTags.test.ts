/**
 * Tests for mechanism tag map.
 * Run: npx tsx --test lib/UK_Process_Audit/signals/mechanismTags.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUkControlRows } from "../parseControls";
import {
  MECHANISM_TAGS_BY_CONTROL,
  MECHANISM_TAGS_TAGGED_COUNT,
  MECHANISM_TAGS_UNTAGGED_COUNT,
  UK_CONTROL_LIBRARY_SIZE,
} from "./mechanismTags";

describe("MECHANISM_TAGS_BY_CONTROL", () => {
  it("every key exists in the parsed CSV (no orphan ids)", () => {
    const ids = new Set(parseUkControlRows().map((r) => r.controlId));
    for (const controlId of Object.keys(MECHANISM_TAGS_BY_CONTROL)) {
      assert.ok(ids.has(controlId), `orphan controlId in tag map: ${controlId}`);
    }
  });

  it('at least one FC control tags to "alert-suppression"', () => {
    const fcWithAlert = Object.entries(MECHANISM_TAGS_BY_CONTROL).filter(
      ([id, tags]) => id.startsWith("FC-") && tags.includes("alert-suppression"),
    );
    assert.ok(fcWithAlert.length >= 1, "expected an FC control with alert-suppression");
  });

  it("reports tagged/untagged split against the 104-control library", () => {
    assert.equal(UK_CONTROL_LIBRARY_SIZE, 104);
    assert.equal(MECHANISM_TAGS_TAGGED_COUNT + MECHANISM_TAGS_UNTAGGED_COUNT, 104);
    assert.equal(MECHANISM_TAGS_TAGGED_COUNT, Object.keys(MECHANISM_TAGS_BY_CONTROL).length);
    assert.ok(MECHANISM_TAGS_TAGGED_COUNT > 0);
    assert.ok(MECHANISM_TAGS_UNTAGGED_COUNT > 0);
  });

  it("parseUkControlRows attaches tags from the map (and [] when absent)", () => {
    const rows = parseUkControlRows();
    const fc05 = rows.find((r) => r.controlId === "FC-05");
    assert.ok(fc05);
    assert.deepEqual(fc05.failureMechanismTags, [
      "tm-scope-gap",
      "tm-ingestion-gap",
      "alert-suppression",
    ]);

    const untagged = rows.find((r) => r.controlId === "PAY-01");
    assert.ok(untagged);
    assert.deepEqual(untagged.failureMechanismTags, []);
  });
});
