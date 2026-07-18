/**
 * Exposure lens + Path-to-Green regression tests (v6 only).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { getDomainExposure } from "./exposureData";
import { getPathToGreen } from "./pathToGreen";

test("fincrime exposure distribution is OVER appetite", () => {
  const exposure = getDomainExposure("fincrime");
  assert.ok(exposure);
  assert.equal(exposure.distribution.status, "OVER");
  assert.equal(exposure.dataAvailable, true);
});

test("credit domain has no client-level exposure data", () => {
  const exposure = getDomainExposure("credit");
  assert.ok(exposure);
  assert.equal(exposure.dataAvailable, false);
  assert.equal(exposure.counts.length, 0);
  assert.equal(exposure.exitCandidates.length, 0);
});

test("every ExposureCount carries provenance", () => {
  const exposure = getDomainExposure("fincrime");
  assert.ok(exposure);
  assert.ok(exposure.counts.length > 0);
  for (const count of exposure.counts) {
    assert.ok(count.sourceLabel && count.sourceLabel.length > 0, `${count.id} missing sourceLabel`);
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

test("no dataAvailable:false domain fabricates exposure numbers", () => {
  const unavailableIds = ["credit", "market", "liquidity", "conduct", "climate", "opsres", "cyber", "regulatory"];
  for (const domainId of unavailableIds) {
    const exposure = getDomainExposure(domainId);
    assert.ok(exposure);
    assert.equal(exposure.dataAvailable, false);
    assert.equal(exposure.distribution.bands.length, 0);
    assert.equal(exposure.counts.length, 0);
  }
});

test("unknown domain id returns null", () => {
  assert.equal(getDomainExposure("does-not-exist"), null);
});
