import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  UK_RULE_CONFIG_CHANGES,
  isSuppressionConjunction,
  suppressionSignals,
  detectDispositionDispersion,
  cadenceFeasibilityResults,
  infeasibleCadenceChecks,
  evaluateCadenceFeasibility,
} from "./mlroSignals.ts";

describe("mlroSignals — suppression ledger", () => {
  it("fires only on less-sensitive + rising backlog conjunction", () => {
    const firing = UK_RULE_CONFIG_CHANGES.find((c) => c.ruleId === "TM-R17");
    const benign = UK_RULE_CONFIG_CHANGES.find((c) => c.ruleId === "TM-R42");
    assert.ok(firing);
    assert.ok(benign);
    assert.equal(isSuppressionConjunction(firing!), true);
    assert.equal(isSuppressionConjunction(benign!), false);
    assert.equal(suppressionSignals().length, 1);
    assert.equal(suppressionSignals()[0].ruleId, "TM-R17");
  });
});

describe("mlroSignals — disposition dispersion", () => {
  it("detects collapsing reason-code spread while closures rise", () => {
    const signal = detectDispositionDispersion();
    assert.equal(signal.fires, true);
    assert.ok(signal.dominantRecentShare > 0.65);
    assert.ok(signal.closureDelta >= 0);
  });
});

describe("mlroSignals — cadence feasibility", () => {
  it("flags arithmetic impossibility for monthly TM + 20wd SLA", () => {
    const infeasible = infeasibleCadenceChecks();
    assert.equal(infeasible.length, 1);
    assert.equal(infeasible[0].controlId, "AML-C002");
    assert.equal(infeasible[0].feasible, false);
    assert.ok(infeasible[0].gapDays > 0);
  });

  it("passes when detection window covers substrate + SLA", () => {
    const ok = evaluateCadenceFeasibility({
      controlId: "AML-C001",
      racmRef: "AML.01.01.01",
      label: "Wide window control",
      requiredDetectionWindowDays: 90,
      substrateRefreshDays: 30,
      investigationSlaWorkingDays: 20,
    });
    assert.equal(ok.feasible, true);
    assert.equal(ok.gapDays, 0);
  });
});
