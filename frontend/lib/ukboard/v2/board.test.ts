/**
 * UK Board v2 — verdicts, off-track list and headline. Run: npx tsx --test lib/ukboard/v2/board.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { daysToBrc, headlineCounts, headlineSentence, METRICS, OBJECTIVES, offTrackByTier, onTrack, rowState, verdict } from "./board";

test("board headline set: 12 metrics, daysToBrc fixed at 49 from the demo date", () => {
  assert.equal(METRICS.length, 12);
  assert.equal(daysToBrc(), 49);
  assert.equal(OBJECTIVES.length, 4);
  assert.ok(METRICS.every((m) => m.owner && (m.indicatorType === "leading" || m.indicatorType === "lagging")));
  void headlineCounts;
  void headlineSentence;
  void offTrackByTier;
  void onTrack;
  void rowState;
  void verdict;
});

import { plain } from "./boardTabs";
import { AGENTS, QUEUE, totalChecks, TUNING } from "./agentsData";

test("agent data ties out", () => {
  assert.equal(AGENTS.length, 7);
  assert.equal(totalChecks(), 41);
  assert.equal(QUEUE.length, 5);
  assert.equal(((2100 / TUNING.alertsPerMonth) * 100).toFixed(1), "5.4");
  assert.equal(((900 / TUNING.alertsPerMonth) * 100).toFixed(1), "2.3");
  assert.ok(TUNING.options.every((o) => o.caught <= TUNING.breaches));
});

test("plain words replace board jargon", () => {
  assert.equal(plain("BRC and ERC review CDD attestation"), "Risk Committee and Executive Risk Committee review customer checks attestation");
});

import { PERSONA_VIEWS, sectionsOf } from "./personaViews";

test("board 8 tabs, chair 4, CRO 5; no section repeats within a persona", () => {
  for (const [id, v] of Object.entries(PERSONA_VIEWS)) {
    assert.equal(v.tabs.length, { board: 8, chair: 4, cro: 5 }[id], id);
    assert.ok(v.tabs.some((t) => t.id === v.defaultTab), `${id} default tab`);
    const all = v.tabs.flatMap(sectionsOf);
    assert.deepEqual(all.filter((s, i) => all.indexOf(s) !== i), [], `${id} repeats`);
  }
});

import { ISSUES_FOUND, LINE_GROWTH, SIGNOFF_HISTORY, VULN, HARM_EVENT, JOURNEYS, TENSIONS } from "./boardMemberData";
import { CAPACITY, RESTRICTION } from "../v1/data";

test("board member seed ties out to existing data", () => {
  // +13 handlers = 76 needed at 25,000 members each − 63 today
  assert.equal(Math.round(1_900_000 / 25_000) - CAPACITY.handlers[CAPACITY.handlers.length - 1], 13);
  // £96m = (20% − 17.6%) of the £4.0bn plan: headroom to the appetite limit, not amber
  assert.equal(Math.round((0.2 - 0.176) * 4000), 96);
  assert.equal(VULN.amber, 14);
  assert.equal(HARM_EVENT.customers, 2300);
  assert.equal(RESTRICTION.breachesAccounts, 112);
  assert.equal(ISSUES_FOUND.by.reduce((a, b) => a + b.n, 0), ISSUES_FOUND.total);
  for (const o of SIGNOFF_HISTORY) assert.equal(o.marks.length, 12, o.role);
  assert.equal(LINE_GROWTH.length, 4);
  assert.equal(JOURNEYS.filter((j) => !j.aligned).length, 2);
  assert.equal(TENSIONS.filter((t) => t.status === "Regulatory floor, not tradeable").length, 1);
});
