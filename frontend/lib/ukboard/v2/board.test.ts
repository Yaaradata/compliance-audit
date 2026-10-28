/**
 * UK Board v2 — verdicts, off-track list and headline. Run: npx tsx --test lib/ukboard/v2/board.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { daysToBrc, headlineCounts, headlineSentence, METRICS, OBJECTIVES, offTrackByTier, onTrack, rowState, verdict } from "./board";

test("exactly 12 headline metrics; 8 within, 1 amber, 1 red, 2 unverified", () => {
  assert.equal(METRICS.length, 12);
  const c = headlineCounts();
  assert.deepEqual([c.within_appetite, c.amber, c.red, c.unverified], [8, 1, 1, 2]);
});

test("verdicts: mortgage room to grow, savings fix first, funding hold, member safety unverified", () => {
  const v = Object.fromEntries(OBJECTIVES.map((o) => [o.id, verdict(o)]));
  assert.deepEqual(v, { O1: "room_to_grow", O2: "fix_first", O3: "hold", O4: "unverified" });
});

test("off-track list: obligatory → top, ordered red → unverified → amber → projected", () => {
  const groups = offTrackByTier();
  assert.deepEqual(
    groups.find((g) => g.tier === "obligatory")!.rows.map((m) => m.unitId),
    ["u-restriction", "u-tm", "u-sanctions"],
  );
  assert.deepEqual(groups.find((g) => g.tier === "top")!.rows.map((m) => rowState(m)), ["amber", "projected", "projected"]);
  assert.equal(onTrack().length, 6);
});

test("every metric has a denominator, an owner and a lead/lag tag", () => {
  for (const m of METRICS) {
    assert.ok(m.denominator && m.owner && m.indicatorType, m.unitId);
    assert.ok(m.name.split(" ").length <= 4, m.name);
  }
});

test("headline sentence is rule-built and short", () => {
  const s = headlineSentence();
  assert.equal(s, "8 of 12 measures within appetite. Room to grow mortgages: £96m. 3 decisions due before the BRC.");
  assert.ok(s.split(" ").length <= 22);
  assert.equal(daysToBrc(), 49);
});
