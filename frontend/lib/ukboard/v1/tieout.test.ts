/**
 * UK Board v1 — tie-out checks (TIEOUT.md). Numbers must agree across S1–S4.
 * Run: npx tsx --test lib/ukboard/v1/tieout.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAPACITY,
  DRAFTS,
  EVENTS,
  MANIFEST_VERSIONS,
  PACK_ITEMS,
  RESTRICTION,
  ROUTES,
  SCORECARD,
  SERIES,
  THRESHOLDS,
  TM_COHORTS,
  TM_RUNS,
  UNITS,
} from "./data";
import { projectedCrossing, rankScorecard, routesDecided, selectStatus, statusCounts, verifiedCount } from "./selectors";

test("S1 scorecard mix: 8 within, 1 amber, 1 red, 2 unverified; 10 of 12 verified", () => {
  const c = statusCounts(SCORECARD, UNITS);
  assert.equal(SCORECARD.length, 12);
  assert.equal(c.within_appetite, 8);
  assert.equal(c.amber, 1);
  assert.equal(c.red, 1);
  assert.equal(c.unverified, 2);
  assert.equal(verifiedCount(SCORECARD, UNITS), 10);
});

test("scorecard first 4 rows are the urgent set: red, unverified, unverified, amber", () => {
  const ranked = rankScorecard(SCORECARD, UNITS).slice(0, 4).map((r) => selectStatus(UNITS[r.unitId]));
  assert.deepEqual(ranked, ["red", "unverified", "unverified", "amber"]);
});

test("integrity overrides status: unverified units never read as RAG", () => {
  assert.equal(UNITS["u-tm"].rawStatus, "within_appetite");
  assert.equal(selectStatus(UNITS["u-tm"]), "unverified");
  assert.equal(selectStatus(UNITS["u-sanctions"]), "unverified");
});

test("T2-1: 17.6 of 20 is 88%; 2.4 pts of £4.0bn is £96m; amber Q2 2027", () => {
  assert.equal(Math.round((17.6 / 20) * 100), 88);
  assert.equal(Math.round(0.024 * 4000), 96);
  const t = THRESHOLDS["u-hltv"];
  assert.ok(t.amber > 17.6 && t.amber < 20, "TC-2: amber sits between 17.6% and 20%");
  assert.equal(projectedCrossing(SERIES["u-hltv"], t.amber), "Q2 2027");
});

test("T2-34: red projected in 2 quarters", () => {
  assert.equal(projectedCrossing(SERIES["u-vuln"], 18), "Q1 2027");
});

test("T2-5: members per handler 25,000 → 30,160; +31% and +9%", () => {
  const m = CAPACITY.membersM;
  const h = CAPACITY.handlers;
  assert.equal(Math.round((m[0] * 1e6) / h[0]), 25000);
  assert.equal(Math.round((m[m.length - 1] * 1e6) / h[h.length - 1] / 10) * 10, 30160);
  assert.equal(Math.round((m[m.length - 1] / m[0] - 1) * 100), 31);
  assert.equal(Math.round((h[h.length - 1] / h[0] - 1) * 100), 9);
});

test("TC-3: T2-14 cohorts sum to the 26 October run", () => {
  const run = TM_RUNS[TM_RUNS.length - 1];
  assert.equal(run.source, 2400000);
  assert.equal(run.reconciled, 2256000);
  assert.equal(TM_COHORTS.reduce((a, c) => a + c.records, 0), run.source);
  assert.equal(TM_COHORTS.reduce((a, c) => a + c.reconciled, 0), run.reconciled);
  assert.equal(((run.reconciled / run.source) * 100).toFixed(1), "94.0");
});

test("TC-5: restriction routes sum to 112; in scope = tested + untested", () => {
  const r = RESTRICTION;
  assert.equal(r.byRoute.reduce((a, b) => a + b.accounts, 0), r.breachesAccounts);
  assert.equal(r.breachesAccounts, 112);
  assert.equal(r.byRoute.find((b) => b.lane === "product")?.accounts, 97);
  assert.equal(r.tested + r.untested.reduce((a, u) => a + u.count, 0), r.inScope);
  assert.ok(r.previouslyExited <= r.breachesCustomers);
  const supported = r.clauses.filter((c) => c.verdict === "supported").length;
  assert.equal(supported, 3);
});

test("TC-6/TC-7: two ledger events; event 2 is 1 of 4 routes decided on day 13; gap 54 days", () => {
  assert.equal(EVENTS.length, 2);
  assert.deepEqual(routesDecided("e-117", ROUTES), { decided: 1, total: 4 });
  const e2 = EVENTS.find((e) => e.eventId === "e-117");
  assert.equal(e2?.dayN, 13);
  const days = (Date.UTC(2026, 9, 14) - Date.UTC(2026, 7, 21)) / 86400000;
  assert.equal(days, 54);
  assert.equal(e2?.awarenessGap?.gapDays, 54);
});

test("TC-10: 13 items qualify, 12 in the locked pack, 1 removed with no reason", () => {
  assert.equal(PACK_ITEMS.length, 13);
  const locked = MANIFEST_VERSIONS.find((v) => v.state === "locked");
  assert.equal(locked?.itemIds.length, 12);
  const removed = PACK_ITEMS.filter((i) => i.removal);
  assert.equal(removed.length, 1);
  assert.equal(removed[0].removal?.reason, null);
  assert.equal(removed[0].removal?.on, "14 October 2026");
});

test("HF-8: every draft uses the closed verb set and no forbidden wording", () => {
  const allowed = new Set(["prepare", "propose", "draft", "send_to_owner"]);
  const forbidden = /\b(file|filed|notify now|submit|complete now|approve and send|forecast)\b/i;
  for (const d of Object.values(DRAFTS)) {
    assert.ok(allowed.has(d.verb), d.draftId);
    assert.ok(!forbidden.test(`${d.title} ${d.faceAfter}`), d.draftId);
  }
});

test("T2-5 offers exactly two options (HF-7); T2-29 cases propose no default", () => {
  assert.equal(DRAFTS["d-t25-choice"].options?.length, 2);
  for (const r of ROUTES.filter((r) => r.caseDraftId)) {
    assert.ok(!DRAFTS[r.caseDraftId!].options, "case drafts carry no pre-selected answer");
  }
});
