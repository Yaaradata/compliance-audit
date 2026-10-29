/**
 * UK Board v2 — one source of truth, built around the risk appetite. Run: npx tsx --test lib/ukboard/v2/boardStore.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  attestationThisMonth,
  bandMedians,
  BOARD_CALLS,
  consumerDuty,
  daysToCommittee,
  deltaText,
  ENFORCEMENT_THEMES,
  ftbHeadroomM,
  hltvSinceQ2_2025,
  measure,
  MEASURES,
  mortgageHeadroomM,
  newMeasures,
  objectiveStatus,
  ownerRows,
  policiesTracked,
  postureCounts,
  roleOf,
  rollupTotals,
  routesDecided,
  statusChanges,
  validateBoardStore,
} from "./boardStore";

test("validateBoardStore passes", () => {
  assert.deepEqual(validateBoardStore(), []);
});

test("12 measures, one tier each; posture 4 / 2 / 4 / 1 / 1", () => {
  assert.equal(MEASURES.length, 12);
  assert.deepEqual(postureCounts(), { within: 4, projected: 2, amber: 4, red: 1, unconfirmed: 1 });
  assert.deepEqual(
    ["top", "emerging", "obligatory"].map((t) => MEASURES.filter((m) => m.tier === t).length),
    [6, 2, 4],
  );
});

test("roll-up below the 12: 132 · 14 off track · 3 unconfirmed", () => {
  assert.deepEqual(rollupTotals(), { below: 132, l2: 37, l3: 95, offTrack: 14, unconfirmed: 3, l3Red: 5 });
});

test("top-risk bands are tighter than emerging-risk bands", () => {
  const b = bandMedians();
  assert.ok(b.top <= b.emerging);
  assert.equal(Math.round(b.top * 100), 12);
  assert.equal(Math.round(b.emerging * 100), 30);
});

test("objectives: O1 on track, O2 at risk, O3 off track, O4 at risk", () => {
  assert.deepEqual(["O1", "O2", "O3", "O4"].map((o) => objectiveStatus(o as "O1")), ["on_track", "at_risk", "off_track", "at_risk"]);
});

test("attestation, routes, policies, status changes", () => {
  assert.deepEqual(attestationThisMonth(), { attested: 8, due: 3, unconfirmed: 1, total: 12 });
  assert.deepEqual(routesDecided(), { decided: 1, total: 7 });
  assert.equal(policiesTracked(), 41);
  assert.equal(statusChanges().length, 4);
  assert.equal(newMeasures()[0].id, "u-detect");
});

test("figures compute from the data", () => {
  assert.equal(mortgageHeadroomM(), 96);
  assert.equal(ftbHeadroomM(22), 176);
  assert.equal(deltaText(measure("u-hltv").delta), "▲ 1.5 pts");
  assert.equal(hltvSinceQ2_2025(), 1.5);
  assert.equal(consumerDuty().text, "2 of 4 outcomes amber · 9 of 12 measures in tolerance");
  assert.equal(BOARD_CALLS.length, 3);
  assert.equal(daysToCommittee(new Date(2026, 9, 28)), 48);
});

test("owners from the measure table; roles only; no firm names", () => {
  const rows = ownerRows([], {});
  assert.equal(rows.reduce((a, r) => a + r.measures.length, 0), 12);
  assert.ok(rows.some((r) => r.role === "Chief Information Security Officer"));
  assert.equal(roleOf("smf16"), "Head of Compliance");
  assert.ok(ENFORCEMENT_THEMES.every((t) => !/Starling|Monzo|Metro|Bank/.test(t.theme + t.source)));
  for (const m of MEASURES) assert.ok(m.statement.split(" ").length <= 12, m.id);
});
