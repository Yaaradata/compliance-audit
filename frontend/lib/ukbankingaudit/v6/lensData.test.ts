/**
 * Ownership / Momentum / Defensibility lens data — regression tests (v6 only).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { RISK_DOMAINS_V4 as BOARD_DOMAINS } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { RISK_DOMAINS_V4 as BASE_DOMAINS } from "@/lib/ukbankingaudit/riskDomainsV4";
import { REVIEW_DATES } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import {
  AS_OF,
  getOwnershipState,
  OWNERSHIP_TRAIL,
} from "@/lib/ukbankingaudit/v6/ownershipData";
import {
  getDefensibility,
  getPackIntegrity,
  OBLIGATION_COVERAGE,
} from "@/lib/ukbankingaudit/v6/defensibilityData";
import {
  getCrossLensFindings,
  getFirmLensPostureLines,
} from "@/lib/ukbankingaudit/v6/lensBoardSummary";
import {
  getDomainMomentum,
  getKriMomentum,
  KRI_HISTORY,
} from "@/lib/ukbankingaudit/v6/momentumData";

test("ownership states at AS_OF match the seeded trail ages", () => {
  assert.equal(AS_OF, "2026-07-23");
  assert.equal(OWNERSHIP_TRAIL.length, 9);

  const expect: Record<string, { state: string; days: number | null }> = {
    credit: { state: "OWNED_CURRENT", days: 35 },
    liquidity: { state: "OWNED_CURRENT", days: 55 },
    conduct: { state: "OWNED_STALE", days: 112 },
    fincrime: { state: "OWNED_CURRENT", days: 14 },
    cyber: { state: "OWNED_CURRENT", days: 9 },
    regulatory: { state: "OWNED_STALE", days: 188 },
    market: { state: "UNALLOCATED", days: null },
    climate: { state: "UNALLOCATED", days: null },
    opsres: { state: "UNALLOCATED", days: null },
  };

  let failCount = 0;
  for (const [domainId, exp] of Object.entries(expect)) {
    const got = getOwnershipState(domainId);
    assert.equal(got.state, exp.state, domainId);
    assert.equal(got.trailAgeDays, exp.days, `${domainId} trailAgeDays`);
    if (got.state !== "OWNED_CURRENT") failCount += 1;
  }
  assert.equal(failCount, 5, "3 unallocated + 2 stale = 5 domains fail Ownership");
});

test("every KRI history last value equals riskDomainsV4 current value", () => {
  for (const h of KRI_HISTORY) {
    assert.equal(h.values.length, REVIEW_DATES.length, `${h.domainId}/${h.kriLabel} length`);
    const domain = BASE_DOMAINS.find((d) => d.id === h.domainId);
    assert.ok(domain, h.domainId);
    const kri = domain.kris.find((k) => k.label === h.kriLabel);
    assert.ok(kri, `${h.domainId}/${h.kriLabel} missing on riskDomainsV4`);
    assert.equal(
      h.values[h.values.length - 1],
      kri.value,
      `${h.domainId}/${h.kriLabel} last history ≠ current value`,
    );
  }
});

test("domain momentum states match the seeded demo cards", () => {
  assert.equal(getDomainMomentum("climate").state, "PROJECTED_BREACH_RED");
  assert.equal(getDomainMomentum("climate").worstKri, "High-Carbon Sector Exposure");
  const climateDays = getDomainMomentum("climate").daysToBreach;
  assert.ok(climateDays !== null && climateDays <= 90, `climate days=${climateDays}`);

  assert.equal(getDomainMomentum("conduct").state, "PROJECTED_BREACH_AMBER");
  assert.equal(getDomainMomentum("conduct").worstKri, "Complaints per 1k Customers");
  const conductDays = getDomainMomentum("conduct").daysToBreach;
  assert.ok(
    conductDays !== null && conductDays > 90 && conductDays <= 180,
    `conduct days=${conductDays}`,
  );

  assert.equal(getDomainMomentum("cyber").state, "ALREADY_BREACHED");
  assert.equal(getDomainMomentum("cyber").worstKri, "Critical Vulnerabilities Open");
  const mfa = getKriMomentum("cyber", "MFA Coverage");
  assert.ok(
    mfa.state === "PROJECTED_BREACH_AMBER" || mfa.daysToBreach !== null,
    "MFA projects toward breach on amber horizon",
  );
  if (mfa.daysToBreach !== null) {
    assert.ok(mfa.daysToBreach > 90 && mfa.daysToBreach <= 180, `MFA days=${mfa.daysToBreach}`);
  }

  assert.equal(getDomainMomentum("fincrime").state, "ALREADY_BREACHED");
  assert.equal(getDomainMomentum("fincrime").worstKri, "KYC Periodic Review Backlog");

  for (const id of ["credit", "market", "liquidity", "opsres"] as const) {
    assert.equal(getDomainMomentum(id).state, "STABLE", id);
  }
  assert.equal(getDomainMomentum("regulatory").state, "AT_TARGET_NO_HEADROOM");
});

test("defensibility states and pack integrity match the seeded demo", () => {
  const totalObligations = OBLIGATION_COVERAGE.reduce((s, r) => s + r.totalObligations, 0);
  const mapped = OBLIGATION_COVERAGE.reduce((s, r) => s + r.mappedToControl, 0);
  const unmapped = OBLIGATION_COVERAGE.reduce((s, r) => s + r.unmappedRefs.length, 0);
  assert.equal(totalObligations, 312);
  assert.equal(mapped, 293);
  assert.equal(unmapped, 19);

  const conduct = getDefensibility("conduct");
  assert.equal(conduct.state, "INDEFENSIBLE");
  assert.equal(conduct.obligationGaps, 7);
  assert.equal(conduct.retrievabilityPct, 76);
  assert.equal(conduct.feedState, "STALE");
  assert.equal(conduct.feedAgeDays, 41);

  const climate = getDefensibility("climate");
  assert.equal(climate.state, "INDEFENSIBLE");
  assert.equal(climate.obligationGaps, 3);
  assert.equal(climate.retrievabilityPct, 82);
  assert.equal(climate.feedState, "UNATTRIBUTED");

  const fincrime = getDefensibility("fincrime");
  assert.equal(fincrime.state, "INDEFENSIBLE");
  assert.equal(fincrime.obligationGaps, 5);
  assert.equal(fincrime.retrievabilityPct, 87);

  for (const id of ["credit", "opsres", "cyber", "regulatory"] as const) {
    assert.equal(getDefensibility(id).state, "AT_RISK", id);
  }
  for (const id of ["market", "liquidity"] as const) {
    assert.equal(getDefensibility(id).state, "DEFENSIBLE", id);
  }

  const pack = getPackIntegrity();
  assert.equal(pack.withinCadence, 7);
  assert.equal(pack.total, 9);
  assert.equal(pack.pct, 78);
});

test("climate is green on the board and fails all three new lenses", () => {
  const climate = BOARD_DOMAINS.find((d) => d.id === "climate");
  assert.ok(climate);
  assert.equal(climate.status, "GREEN");
  assert.equal(getOwnershipState("climate").state, "UNALLOCATED");
  assert.equal(getDomainMomentum("climate").state, "PROJECTED_BREACH_RED");
  assert.equal(getDefensibility("climate").state, "INDEFENSIBLE");
});

test("KRI_HISTORY covers 20 KRIs and last value matches riskDomainsV4", () => {
  assert.equal(KRI_HISTORY.length, 20);
  for (const h of KRI_HISTORY) {
    const domain = BASE_DOMAINS.find((d) => d.id === h.domainId);
    const kri = domain?.kris.find((k) => k.label === h.kriLabel);
    assert.ok(kri, h.kriLabel);
    assert.equal(h.values[h.values.length - 1], kri.value);
  }
});

test("every unmapped obligation ref is a non-empty string", () => {
  for (const row of OBLIGATION_COVERAGE) {
    for (const ref of row.unmappedRefs) {
      assert.equal(typeof ref, "string");
      assert.ok(ref.trim().length > 0, `${row.domainId} empty unmappedRef`);
    }
  }
});

test("getDefensibility returns DEFENSIBLE for at least one domain", () => {
  const defensible = BOARD_DOMAINS.filter((d) => getDefensibility(d.id).state === "DEFENSIBLE");
  assert.ok(defensible.length >= 1, "lens must measure, not only alarm");
});

test("getDomainMomentum returns STABLE for at least three domains", () => {
  const stable = BOARD_DOMAINS.filter((d) => getDomainMomentum(d.id).state === "STABLE");
  assert.ok(stable.length >= 3, `stable=${stable.length}`);
});

test("cross-lens alert fires for climate and for no other domain", () => {
  const findings = getCrossLensFindings();
  assert.equal(findings.length, 1);
  assert.equal(findings[0]!.domainId, "climate");
  assert.ok(findings[0]!.failCount >= 2);
  assert.ok(findings[0]!.lines.length >= 3);
  assert.match(findings[0]!.lines[0]!, /GREEN/i);
});

test("firm lens posture lines are computed (not empty literals)", () => {
  const lines = getFirmLensPostureLines();
  assert.match(lines.ownershipLine, /3 of 9 domains have no named Senior Manager/);
  assert.match(lines.ownershipLine, /2 more have no recorded step in 90 days/);
  assert.match(lines.momentumLine, /1 green domain is projected to breach risk appetite within 90 days/);
  assert.match(lines.defensibilityLine, /78% of this pack is within data cadence/);
  assert.match(lines.defensibilityLine, /19 obligations map to no control/);
});

test("all nine domains have ownership, momentum, and defensibility results", () => {
  for (const d of BOARD_DOMAINS) {
    assert.ok(getOwnershipState(d.id).state);
    assert.ok(getDomainMomentum(d.id).state);
    assert.ok(getDefensibility(d.id).state);
  }
  assert.equal(BOARD_DOMAINS.length, 9);
});
