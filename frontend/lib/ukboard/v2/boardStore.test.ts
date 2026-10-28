/**
 * UK Board v2 — one source of truth. Run: npx tsx --test lib/ukboard/v2/boardStore.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { KRI_DETAIL, RESTRICTION } from "../v1/data";
import { attestationRecord, attestationThisMonth, consumerDuty, daysToCommittee, deltaText, ENFORCEMENT_THEMES, ownerRows, roleOf, statusChanges, FIG, measure, measuresMoved, MEASURES, mortgageHeadroomM, postureCounts, postureText, rateErrorPct, signOffTotals, validateBoardStore } from "./boardStore";

test("validateBoardStore passes", () => {
  assert.deepEqual(validateBoardStore(), []);
});

test("posture is computed from the 12 measures", () => {
  assert.equal(MEASURES.length, 12);
  assert.deepEqual(postureCounts(), { within: 5, projected: 2, amber: 2, red: 1, unconfirmed: 2 });
  assert.equal(postureText(), "5 within · 2 heading for amber · 2 amber · 1 red · 2 unconfirmed");
  assert.equal(measuresMoved(), 10);
});

test("Consumer Duty follows its outcomes", () => {
  const cd = consumerDuty();
  assert.equal(cd.text, "2 of 4 outcomes amber · 9 of 12 measures in tolerance");
  assert.equal(measure("u-cd").status, "amber");
  assert.equal(FIG.vuln.amber, 14);
});

test("store ties to the v1 data", () => {
  assert.equal(FIG.restriction.breaches, RESTRICTION.breachesAccounts);
  assert.equal(FIG.restriction.untested, 24000);
  assert.equal(FIG.escalation.issues, KRI_DETAIL.latency.n);
  assert.equal(FIG.escalation.medianMonths, 4.6);
  assert.equal(mortgageHeadroomM(), 96);
  assert.equal(rateErrorPct(), 75);
  assert.deepEqual(signOffTotals(), { cells: 60, onTime: 54, late: 3, missing: 2, early: 1 });
});

test("high-LTV change is the share change vs Q2 (17.3% → 17.6%)", () => {
  assert.equal(deltaText(measure("u-hltv").delta), "▲ 0.3 pts");
  assert.equal(deltaText(measure("u-nsfr").delta), "▼ 8 pts");
  assert.equal(deltaText(measure("u-capacity").delta), "▲ 7 days");
});

test("redesign: status changes, attestation, owners, roles, countdown", () => {
  assert.equal(statusChanges().length, 4);
  assert.deepEqual(attestationThisMonth(), { attested: 10, due: 1, unconfirmed: 1, total: 12 });
  assert.equal(attestationRecord().onTime, 54);
  const rows = ownerRows([], {});
  assert.equal(rows.length, 8);
  assert.equal(rows.reduce((a, r) => a + r.measures.length, 0), 12);
  assert.equal(roleOf("smf16"), "Head of Compliance");
  assert.equal(daysToCommittee(new Date(2026, 9, 27)), 49);
  assert.equal(daysToCommittee(new Date(2026, 9, 28)), 48);
  assert.ok(ENFORCEMENT_THEMES.every((t) => !/Starling|Monzo|Metro|Bank/.test(t.theme + t.source)));
  assert.equal(measure("u-cd").value, "2 of 4 outcomes amber");
});
