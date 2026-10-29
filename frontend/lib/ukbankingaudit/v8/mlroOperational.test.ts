/**
 * v8 MLRO Operational Dashboard — overlay / widget regression tests.
 * Does not touch mockDataV2; asserts the v8 overlay contract.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import mockDataV6 from "@/lib/ukbankingaudit/mockDataV6";
import mockDataV8 from "@/lib/ukbankingaudit/mockDataV8";
import { getFraudPosture } from "./fraudData";
import { getPathToGreen, isRiskAcceptGap } from "./pathToGreen";
import {
  EDD_PAST_DUE_APPETITE,
  FC_TRAINING_POSTURE,
  MLRO_DASHBOARD_LENSES,
  OPERATIONAL_WIDGET_SOURCES,
  buildAmlAlertTiersByWeek,
  eddPastDueBand,
  fcTrainingWidgetBand,
  systemHealthWorstBand,
  TM_SYSTEM_HEALTH,
  TXN_SCREENING_SYSTEM_HEALTH,
  NAME_SCREENING_SYSTEM_HEALTH,
} from "./mlroOperationalData";

test("MLRO has two tabs — Operational Dashboard and Client Risk View — not three", () => {
  assert.equal(MLRO_DASHBOARD_LENSES.length, 2);
  assert.equal(MLRO_DASHBOARD_LENSES[0].id, "assurance");
  assert.equal(MLRO_DASHBOARD_LENSES[0].label, "Operational Dashboard");
  assert.equal(MLRO_DASHBOARD_LENSES[1].id, "exposure");
  assert.equal(MLRO_DASHBOARD_LENSES[1].label, "Client Risk View");
  assert.ok(!MLRO_DASHBOARD_LENSES.some((l) => /fraud/i.test(l.id) || /fraud/i.test(l.label)));
});

test("L1/L2/L3 tier backlogs sum to the original weekly openBacklog and SLA totals", () => {
  const weeks = mockDataV6.amlAlertsByWeek;
  const tiered = buildAmlAlertTiersByWeek(weeks);
  assert.equal(tiered.length, weeks.length);
  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i];
    const t = tiered[i];
    const backlogSum = t.tiers.reduce((s, x) => s + x.backlog, 0);
    const slaSum = t.tiers.reduce((s, x) => s + x.slaBreaches, 0);
    assert.equal(backlogSum, w.openBacklog, `${w.weekLabel} backlog`);
    assert.equal(slaSum, w.slaBreaches, `${w.weekLabel} sla`);
    assert.equal(t.tiers.length, 3);
  }
});

test("every Operational Dashboard widget has a named sourceLabel on the face", () => {
  const sources = Object.values(OPERATIONAL_WIDGET_SOURCES);
  assert.equal(sources.length, 6);
  for (const s of sources) {
    assert.ok(s.length > 0, "empty source");
  }
  assert.match(OPERATIONAL_WIDGET_SOURCES.fraud, /source to confirm/);
  assert.equal(getFraudPosture().sourceLabel, OPERATIONAL_WIDGET_SOURCES.fraud);
  assert.equal(FC_TRAINING_POSTURE.sourceLabel, OPERATIONAL_WIDGET_SOURCES.fcTraining);
  assert.equal(EDD_PAST_DUE_APPETITE.sourceLabel, OPERATIONAL_WIDGET_SOURCES.eddPipeline);
  assert.match(TM_SYSTEM_HEALTH.sourceLabel, /source to confirm/);
  assert.match(TXN_SCREENING_SYSTEM_HEALTH.sourceLabel, /source to confirm/);
  assert.match(NAME_SCREENING_SYSTEM_HEALTH.sourceLabel, /source to confirm/);
});

test("appetite thresholds present on EDD, alert tiers, sanctions hold, training, systems health", () => {
  assert.ok(EDD_PAST_DUE_APPETITE.appetite > 0);
  assert.ok(EDD_PAST_DUE_APPETITE.redThreshold > EDD_PAST_DUE_APPETITE.appetite);
  assert.equal(eddPastDueBand(0), "green");
  assert.equal(eddPastDueBand(5), "amber");
  assert.equal(eddPastDueBand(15), "red");

  const last = buildAmlAlertTiersByWeek(mockDataV6.amlAlertsByWeek).at(-1)!;
  for (const tier of last.tiers) {
    assert.ok(typeof tier.appetite === "number");
    assert.ok(tier.redThreshold > tier.appetite);
  }

  const sanctions = mockDataV8.sanctionsScreeningMetrics;
  assert.ok(sanctions.payments.holdTime.appetiteHours > 0);
  assert.equal(sanctions.reportingStatus.ofsiFreezeReports.appetite, 0);

  assert.ok(FC_TRAINING_POSTURE.overdueAppetitePct > 0);
  assert.equal(FC_TRAINING_POSTURE.overdueAppetiteConfigurable, true);
  assert.ok(fcTrainingWidgetBand() !== "green"); // overdue / high-risk drive amber|red

  assert.equal(systemHealthWorstBand(TM_SYSTEM_HEALTH), "red");
  assert.ok(["amber", "red"].includes(systemHealthWorstBand(TXN_SCREENING_SYSTEM_HEALTH)));
  assert.equal(systemHealthWorstBand(NAME_SCREENING_SYSTEM_HEALTH), "red");
});

test("path-to-green multi-action remediate and risk-accept (named + gap) plans exist", () => {
  const kyc = getPathToGreen("KYC Periodic Review Backlog");
  assert.ok(kyc);
  assert.equal(kyc.disposition, "remediate");
  assert.ok(kyc.actions.length >= 2);
  assert.ok(kyc.combinedExpectedEffect.length > 0);
  assert.ok(kyc.appetiteLine.length > 0);

  const tm = getPathToGreen("TM Alerts Closed in SLA");
  assert.ok(tm);
  assert.equal(tm.disposition, "remediate");
  assert.ok(tm.actions.length >= 2);

  const edd = getPathToGreen("EDD Completed on Time");
  assert.ok(edd);
  assert.equal(edd.disposition, "risk-accept");
  assert.equal(isRiskAcceptGap(edd), false);

  const tmOutage = getPathToGreen("tm-system-health");
  assert.ok(tmOutage);
  assert.equal(tmOutage.disposition, "risk-accept");
  assert.equal(isRiskAcceptGap(tmOutage), true);

  const training = getPathToGreen("AML.01.12.01");
  assert.ok(training);
  assert.equal(training.disposition, "remediate");
  assert.ok(training.actions.length >= 2);
});

test("firm-wide training % matches AP-MLRO-2025 narrative 98.4%", () => {
  assert.equal(FC_TRAINING_POSTURE.trainedPct, 98.4);
  assert.equal(FC_TRAINING_POSTURE.trainedCount / FC_TRAINING_POSTURE.populationInScope, 0.984);
  assert.equal(
    FC_TRAINING_POSTURE.highRisk.overdueCount + FC_TRAINING_POSTURE.otherRoles.overdueCount,
    FC_TRAINING_POSTURE.overdueCount,
  );
  const pack = mockDataV6.auditPacks.find((p: { id: string }) => p.id === "AP-MLRO-2025");
  assert.ok(pack?.generatedNarrative?.includes("98.4%"));
});

test("mockDataV8 overlays do not mutate shared V2 alert weeks", () => {
  const v6Week = mockDataV6.amlAlertsByWeek[0];
  assert.ok(!("tiers" in v6Week));
  assert.ok(mockDataV8.amlAlertTiersByWeek[0].tiers.length === 3);
  assert.ok(mockDataV8.eddPastDueAppetite);
  assert.ok(mockDataV8.fcTrainingPosture);
  assert.ok(mockDataV8.systemHealth.tm);
});
