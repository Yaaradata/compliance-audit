import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCategoryTile } from "./boardView";
import { buildCategoryDrill, controlSchedule, pathSummaryText } from "./categoryDrillView";
import { V8_ENGINE_DATA } from "./engine";

const NOV = "2026-11";

describe("category drill", () => {
  it("has the same figures as the tile", () => {
    for (const { id } of V8_ENGINE_DATA.config.riskTaxonomy) {
      const drill = buildCategoryDrill(id, NOV);
      const tile = buildCategoryTile(id, NOV);
      assert.equal(drill.tile.colour, tile.colour, id);
      assert.equal(drill.effectivePct, tile.criticalPct, id);
      assert.equal(drill.incidents.length, tile.sevOneTwo, id);
      assert.equal(drill.rams.filter((r) => r.status === "red").length, tile.ramRed, id);
      assert.equal(drill.rams.filter((r) => r.status === "amber").length, tile.ramAmber, id);
    }
  });

  it("lists weak controls with last test date and reason", () => {
    const drill = buildCategoryDrill("fincrime", NOV);
    assert.equal(drill.effectivePct, 85);
    assert.equal(drill.previousEffectivePct, 90);
    assert.deepEqual(drill.weakControls.map((c) => c.id), ["AML-C002", "AML-C003", "WP-C003"]);
    assert.equal(drill.weakControls[0].lastTested, "2026-11-03");
    assert.equal(drill.weakControls[0].reason, "Disposition control under capacity stress.");
  });

  it("flags overdue tests and evidence gaps", () => {
    assert.deepEqual(buildCategoryDrill("market", NOV).tests.overdue, [
      { id: "MK-C004", name: "IRRBB Stress Testing", dueDate: "2026-09-12" },
    ]);
    const conduct = buildCategoryDrill("conduct", NOV).tests;
    assert.deepEqual(conduct.withoutEvidence.map((c) => c.id), ["CD-C001", "CD-C002"]);
    assert.equal(conduct.overdue.length, 0);
  });

  it("shows three periods of rating history", () => {
    assert.deepEqual(
      buildCategoryDrill("credit", NOV).history.map((h) => `${h.label}:${h.colour}`),
      ["Sep:green", "Oct:amber", "Nov:green"],
    );
  });

  it("names the cause of a move", () => {
    assert.match(buildCategoryDrill("credit", NOV).trendCause, /^Better than Oct \(AMBER\)/);
    assert.match(buildCategoryDrill("cyber", NOV).trendCause, /^No rating change from Oct/);
  });

  it("never words an early warning as a prediction", () => {
    for (const { id } of V8_ENGINE_DATA.config.riskTaxonomy) {
      const text = buildCategoryDrill(id, NOV).earlyWarning.text;
      assert.doesNotMatch(text, /predict|forecast|will breach/i, id);
    }
  });

  it("bases early warnings on the metrics shown in the table", () => {
    const cyber = buildCategoryDrill("cyber", NOV).earlyWarning;
    assert.equal(cyber.flagged, true);
    assert.match(cyber.text, /Critical vulnerabilities open is already beyond its limit/);
    const conduct = buildCategoryDrill("conduct", NOV).earlyWarning;
    assert.equal(conduct.flagged, false, "complaints are falling in the RAM data");
  });

  it("flags a green metric heading for its limit", () => {
    const { earlyWarning } = buildCategoryDrill("credit", NOV);
    assert.equal(earlyWarning.flagged, true);
    assert.match(earlyWarning.text, /Portfolio delinquency is inside appetite today/);
  });

  it("links incidents to controls with whether they worked", () => {
    const [first] = buildCategoryDrill("cyber", NOV).incidents;
    assert.equal(first.id, "INC-2026-041");
    assert.deepEqual(first.links.map((l) => `${l.controlId}:${l.worked}`), ["CY-C001:failed", "CY-C006:worked"]);
  });

  it("summarises the remediation path in one line", () => {
    const { nextPath } = buildCategoryDrill("cyber", NOV);
    assert.ok(nextPath);
    assert.equal(
      pathSummaryText(nextPath),
      "Vendor patch for the perimeter security stack needs phased rollout across production. · Head of Information Security · 13 Nov 2026 · 2nd line accepted",
    );
  });
});

describe("control schedule", () => {
  const control = (id: string) => {
    const found = V8_ENGINE_DATA.controls.find((c) => c.id === id);
    assert.ok(found, id);
    return found;
  };

  it("adds one month to a monthly test and three to a quarterly one", () => {
    assert.deepEqual(controlSchedule(control("AML-C002")), { lastTested: "2026-11-03", nextDue: "2026-12-03", overdue: false });
    assert.deepEqual(controlSchedule(control("AML-C001")), { lastTested: "2026-09-12", nextDue: "2026-12-12", overdue: false });
  });

  it("marks a missed test overdue", () => {
    assert.deepEqual(controlSchedule(control("CL-C003")), { lastTested: "2026-06-12", nextDue: "2026-09-12", overdue: true });
  });
});
