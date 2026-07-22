/**
 * Exposure lens + Path-to-Green regression tests (v6 only).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { getDomainExposure } from "./exposureData";
import { getPathToGreen } from "./pathToGreen";

const CONNECTED = ["fincrime", "credit", "liquidity", "conduct", "opsres", "market", "climate"] as const;
const PREVIEW_ONLY = ["cyber", "regulatory"] as const;

test("fincrime exposure distribution is OVER appetite", () => {
  const exposure = getDomainExposure("fincrime");
  assert.ok(exposure);
  assert.equal(exposure.distribution.status, "OVER");
  assert.equal(exposure.dataAvailable, true);
});

test("six newly-connected domains are live with non-empty bands/counts/exits", () => {
  for (const domainId of ["credit", "liquidity", "conduct", "opsres", "market", "climate"] as const) {
    const exposure = getDomainExposure(domainId);
    assert.ok(exposure, domainId);
    assert.equal(exposure.dataAvailable, true, domainId);
    assert.ok(exposure.distribution.bands.length >= 3, `${domainId} bands`);
    assert.ok(exposure.counts.length > 0, `${domainId} counts`);
    assert.ok(exposure.exitCandidates.length > 0, `${domainId} exits`);
    for (const count of exposure.counts) {
      assert.ok(count.sourceLabel.length > 0, `${domainId}/${count.id} sourceLabel`);
    }
  }
});

test("liquidity shows LCR/NSFR WITHIN and depositor/cliff OVER", () => {
  const exposure = getDomainExposure("liquidity");
  assert.ok(exposure && exposure.dataAvailable);
  const byId = Object.fromEntries(exposure.counts.map((c) => [c.id, c]));
  assert.equal(byId.lcr?.status, "WITHIN");
  assert.equal(byId.lcr?.value, 142);
  assert.equal(byId.nsfr?.status, "WITHIN");
  assert.equal(byId.nsfr?.value, 118);
  assert.equal(byId["top-10-depositors"]?.status, "OVER");
  assert.equal(byId["maturity-cliff-30d"]?.status, "OVER");
});

test("conduct shows vulnerable-outcome 47% vs 90% appetite OVER", () => {
  const exposure = getDomainExposure("conduct");
  assert.ok(exposure && exposure.dataAvailable);
  const vuln = exposure.counts.find((c) => c.id === "vulnerable-good-outcome-rate");
  assert.ok(vuln);
  assert.equal(vuln.value, 47);
  assert.equal(vuln.appetite, 90);
  assert.equal(vuln.status, "OVER");
});

test("opsres shows 6 IBS on most-concentrated provider", () => {
  const exposure = getDomainExposure("opsres");
  assert.ok(exposure && exposure.dataAvailable);
  const ibs = exposure.counts.find((c) => c.id === "ibs-most-concentrated-provider");
  assert.ok(ibs);
  assert.equal(ibs.value, 6);
  assert.equal(ibs.status, "OVER");
});

test("climate high-band is WITHIN appetite (not everything is red)", () => {
  const exposure = getDomainExposure("climate");
  assert.ok(exposure && exposure.dataAvailable);
  assert.equal(exposure.distribution.status, "WITHIN");
  const high = exposure.distribution.bands.find((b) => b.band === "high");
  assert.ok(high);
  assert.equal(high.pctOfBook, 6.8);
  assert.equal(exposure.distribution.appetitePctHigh, 8.0);
});

test("every live ExposureCount carries provenance", () => {
  for (const domainId of CONNECTED) {
    const exposure = getDomainExposure(domainId);
    assert.ok(exposure && exposure.dataAvailable);
    for (const count of exposure.counts) {
      assert.ok(count.sourceLabel && count.sourceLabel.length > 0, `${count.id} missing sourceLabel`);
    }
  }
});

test("cyber and regulatory remain honest previews", () => {
  for (const domainId of PREVIEW_ONLY) {
    const exposure = getDomainExposure(domainId);
    assert.ok(exposure);
    assert.equal(exposure.dataAvailable, false);
    assert.equal(exposure.distribution.bands.length, 0);
    assert.equal(exposure.counts.length, 0);
    assert.equal(exposure.exitCandidates.length, 0);
  }
});

test("path-to-green for the KYC backlog KRI has a non-null owner", () => {
  const path = getPathToGreen("KYC Periodic Review Backlog");
  assert.ok(path);
  assert.ok(path.owner);
  assert.equal(path.owner, "SMF17 · D. Fairweather");
});

test("path-to-green surfaces both system and email provenance", () => {
  const refs = [
    "KYC Periodic Review Backlog",
    "High-Risk Reviews Overdue",
    "TM Alerts Closed in SLA",
    "EDD Completed on Time",
    "Critical Vulnerabilities Open",
    "Mean Time to Patch (Critical)",
  ];
  const sources = refs.map((ref) => getPathToGreen(ref)?.lastUpdate?.source);
  assert.ok(sources.includes("system"));
  assert.ok(sources.includes("email"));
});

test("unknown domain id returns null", () => {
  assert.equal(getDomainExposure("does-not-exist"), null);
});
