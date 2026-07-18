import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildEnforcementNotices,
  resolveGapPrecedent,
  unassessedNoticeSummary,
} from "./enforcementCoverage.ts";

const MOCK_GSRS = [
  { id: "GSR-AML-05-02", racmRef: "AML.01.05.02", controlIds: ["AML-C002"] },
  { id: "GSR-AML-06-01", racmRef: "AML.01.06.01", controlIds: ["AML-C002"] },
  { id: "GSR-AML-08-01", racmRef: "AML.01.08.01", controlIds: ["AML-C002"] },
  { id: "GSR-SCTN-01-01", racmRef: "SCTN.01.01.01", controlIds: ["WP-C002"] },
];

describe("enforcementCoverage", () => {
  it("excludes open-investigation precedents", () => {
    const notices = buildEnforcementNotices({ groupSetRequirements: MOCK_GSRS });
    assert.ok(!notices.some((n) => n.id === "uk-fca-enforcement-watch-1"));
  });

  it("traverses precedent to controls via CRSA mechanism tags", () => {
    const notices = buildEnforcementNotices({ groupSetRequirements: MOCK_GSRS });
    const nationwide = notices.find((n) => n.id === "uk-nationwide-2025");
    assert.ok(nationwide);
    assert.ok(nationwide.controlCount > 0);
    assert.ok(nationwide.impactedCrsaRefs.includes("AML.01.05.02"));
  });

  it("summarises unassessed enforcement queue", () => {
    const notices = buildEnforcementNotices({ groupSetRequirements: MOCK_GSRS });
    const summary = unassessedNoticeSummary(notices);
    assert.ok(summary.totalReaching > 0);
    assert.ok(summary.unassessedCount > 0);
  });

  it("resolves gap precedent without silently replacing firm severity", () => {
    const gap = {
      id: "GAP-AML-01-13-01",
      gapType: "thin_control_coverage",
      ageDays: 3,
      entityId: "AML.01.13.01 / AML-C006",
      recommendedRemediation: "Supplemental control design in flight.",
      severity: "medium",
    };
    const precedent = resolveGapPrecedent(gap);
    assert.ok(precedent);
    assert.equal(precedent.id, "uk-nationwide-2025");
  });
});
