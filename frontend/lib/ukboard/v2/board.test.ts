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

import { CHANGES, FRANCHISES, owners, signOffBuckets, plain } from "./boardTabs";
import { AGENTS, QUEUE, totalChecks, TUNING } from "./agentsData";

test("franchise verdicts and posture inputs", () => {
  assert.deepEqual(FRANCHISES.map((f) => f.verdict), ["room_to_grow", "fix_first", "hold", "unverified"]);
  assert.equal(CHANGES.length, 6);
});

test("sign-off buckets add up to 12: 10 signed, 1 due, 1 unconfirmed", () => {
  const b = signOffBuckets();
  assert.deepEqual([b.signed.length, b.due.length, b.unconfirmed.length], [10, 1, 1]);
});

test("owner cards use completed sign-offs only", () => {
  const o = owners({});
  assert.equal(o.find((x) => x.role === "Head of Financial Crime")?.lastSignOff, "26 October 2026");
  assert.equal(o.find((x) => x.role === "Data owner (payments)")?.lastSignOff, "Unconfirmed");
});

test("agent data ties out", () => {
  assert.equal(AGENTS.length, 7);
  assert.equal(totalChecks(), 41);
  assert.equal(QUEUE.length, 5);
  assert.equal(((2100 / TUNING.alertsPerMonth) * 100).toFixed(1), "5.4");
  assert.equal(((900 / TUNING.alertsPerMonth) * 100).toFixed(1), "2.3");
  assert.ok(TUNING.options.every((o) => o.caught <= TUNING.breaches));
});

test("plain words replace board jargon", () => {
  assert.equal(plain("BRC and ERC review CDD attestation"), "Risk Committee and Executive Risk Committee review customer checks sign-off");
});

import { PERSONA_VIEWS, sectionsOf } from "./personaViews";

test("board has 7 tabs, chair and CRO 5; no section repeats within a persona", () => {
  for (const [id, v] of Object.entries(PERSONA_VIEWS)) {
    assert.equal(v.tabs.length, id === "board" ? 7 : 5, id);
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
