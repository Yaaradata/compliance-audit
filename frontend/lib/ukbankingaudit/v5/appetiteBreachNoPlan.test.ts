/**
 * ERM appetite breach + stalled remediation join (fincrime mock anchor).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateAppetiteBreachNoPlan,
  fincrimeAppetiteBreachNoPlan,
  domainsWithAppetiteBreachNoPlan,
} from "./appetiteBreachNoPlan";
import { RISK_DOMAINS_V4 } from "./riskDomainsV5";

test("fincrime fires with KYC backlog and delayed remediation step", () => {
  const signal = fincrimeAppetiteBreachNoPlan();
  assert.ok(signal);
  assert.equal(signal.domainId, "fincrime");
  assert.ok(signal.breachedKris.length >= 2);

  const kyc = signal.breachedKris.find((k) => k.label.includes("KYC"));
  assert.ok(kyc);
  assert.equal(kyc.value, 4210);
  assert.equal(kyc.target, 1000);

  const sla = signal.breachedKris.find((k) => k.label.includes("SLA") || k.label.includes("closure"));
  assert.ok(sla);
  assert.equal(sla.value, 86);
  assert.equal(sla.target, 95);

  assert.match(signal.stalledStepTitle, /medium.*low-risk backlog/i);
  assert.equal(signal.stalledStepStatus, "Delayed");
  assert.equal(signal.stalledStepProgress, 0);
});

test("domainsWithAppetiteBreachNoPlan includes fincrime", () => {
  const all = domainsWithAppetiteBreachNoPlan();
  assert.ok(all.some((s) => s.domainId === "fincrime"));
});

test("green-only domains do not fire", () => {
  const greenOnly = RISK_DOMAINS_V4.filter((d) => d.kris.every((k) => k.status === "GREEN"));
  for (const domain of greenOnly) {
    assert.equal(evaluateAppetiteBreachNoPlan(domain), null);
  }
});
