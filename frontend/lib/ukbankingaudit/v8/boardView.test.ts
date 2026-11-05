import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boardSubtitle, buildCategoryTile, buildCategoryTiles, buildFirmBanner } from "./boardView";
import { V8_ENGINE_DATA, type EngineData } from "./engine";
import type { FirmAggregationRule } from "./config";

const NOV = "2026-11";

function withRule(rule: FirmAggregationRule): EngineData {
  return { ...V8_ENGINE_DATA, config: { ...V8_ENGINE_DATA.config, firmAggregationRule: rule } };
}

describe("board subtitle", () => {
  it("states the number of risks and the cadence from config", () => {
    assert.equal(boardSubtitle(), "Firm-level risk posture across your 9 Level-1 risks · monthly review");
    const quarterly: EngineData = {
      ...V8_ENGINE_DATA,
      config: {
        ...V8_ENGINE_DATA.config,
        reportingCadence: "quarterly",
        riskTaxonomy: V8_ENGINE_DATA.config.riskTaxonomy.slice(0, 5),
      },
    };
    assert.equal(boardSubtitle(quarterly), "Firm-level risk posture across your 5 Level-1 risks · quarterly review");
  });
});

describe("firm banner", () => {
  it("shows the colour, rule, trend and driving category", () => {
    const banner = buildFirmBanner(NOV);
    assert.equal(banner.colour, "red");
    assert.equal(banner.ruleDescription, "Any Level-1 risk red makes the firm red");
    assert.equal(banner.trend.direction, "flat");
    assert.equal(banner.trend.chipText, "also RED in Oct");
    assert.deepEqual(banner.drivingCategories.map((c) => c.label), ["Cyber & Information Security"]);
  });

  it("changes colour and rule text when the config rule changes", () => {
    const banner = buildFirmBanner(NOV, withRule("twoReds"));
    assert.equal(banner.colour, "amber");
    assert.equal(banner.ruleDescription, "Two or more Level-1 risks red make the firm red");
    assert.equal(banner.trend.direction, "better");
    assert.equal(banner.trend.chipText, "was RED in Oct");
  });

  it("flags green domains with no test evidence, by category", () => {
    const banner = buildFirmBanner(NOV);
    assert.deepEqual(banner.assuranceGapCategoryIds, ["conduct"]);
    assert.equal(banner.assuranceText, "1 green domain has no test evidence this cycle");
  });

  it("drops the gap once the evidence exists", () => {
    const data: EngineData = {
      ...V8_ENGINE_DATA,
      controlTests: V8_ENGINE_DATA.controlTests.map((t) => ({ ...t, evidenceId: t.evidenceId ?? "EV-X" })),
    };
    const banner = buildFirmBanner(NOV, data);
    assert.deepEqual(banner.assuranceGapCategoryIds, []);
    assert.equal(banner.assuranceText, "0 green domains have no test evidence this cycle");
  });
});

describe("category tiles", () => {
  it("builds one tile per Level-1 risk, labelled from config", () => {
    const tiles = buildCategoryTiles(NOV);
    assert.equal(tiles.length, 9);
    assert.equal(tiles.find((t) => t.categoryId === "cyber")?.label, "Cyber & Information Security");
  });

  it("gives Cyber its counters, sentence and path", () => {
    const tile = buildCategoryTile("cyber", NOV);
    assert.equal(tile.colour, "red");
    assert.equal(tile.ramRed, 2);
    assert.equal(tile.ramAmber, 1);
    assert.equal(tile.criticalPct, 90);
    assert.equal(tile.sevOneTwo, 2);
    assert.equal(tile.why, "Red because 2 RAMs out of tolerance · 1 critical control failed · 1 Sev-1 incident");
    assert.deepEqual(tile.path, {
      targetLabel: "Jan 2027",
      owner: "Head of Information Security",
      secondLine: "challenged",
    });
  });

  it("gives Financial Crime its counters and weakest second-line state", () => {
    const tile = buildCategoryTile("fincrime", NOV);
    assert.equal(tile.colour, "amber");
    assert.equal(tile.ramRed, 0);
    assert.equal(tile.ramAmber, 5);
    assert.equal(tile.criticalPct, 85);
    assert.equal(tile.sevOneTwo, 1);
    assert.equal(tile.path?.targetLabel, "Apr 2027");
    assert.equal(tile.path?.secondLine, "pending");
  });

  it("shows no path on a green tile, and the improved arrow on Credit", () => {
    const tile = buildCategoryTile("credit", NOV);
    assert.equal(tile.colour, "green");
    assert.equal(tile.path, null);
    assert.equal(tile.trend.direction, "better");
    assert.equal(tile.trend.tooltip, "Oct: AMBER → Nov: GREEN");
  });

  it("reports a missing path as null on a non-green tile", () => {
    const tile = buildCategoryTile("cyber", NOV, { ...V8_ENGINE_DATA, pathsToGreen: [] });
    assert.equal(tile.colour, "red");
    assert.equal(tile.path, null);
  });

  it("never counts a Sev-3 incident or a closed October Sev-2 in November", () => {
    assert.equal(buildCategoryTile("opsres", NOV).sevOneTwo, 0);
    assert.equal(buildCategoryTile("credit", NOV).sevOneTwo, 0);
  });

  it("ties tile counters to the firm: 2 red and 6 amber RAMs in total", () => {
    const tiles = buildCategoryTiles(NOV);
    assert.equal(tiles.reduce((n, t) => n + t.ramRed, 0), 2);
    assert.equal(tiles.reduce((n, t) => n + t.ramAmber, 0), 6);
  });
});
