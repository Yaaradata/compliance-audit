import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardSubtitle,
  buildCategoryTile,
  buildCategoryTiles,
  buildControlStrip,
  buildFirmBanner,
  buildIncidentStrip,
  buildRedSpotlight,
  buildRiskAppetiteStrip,
  buildWhatChanged,
  buildWhatHasNotChanged,
} from "./boardView";
import { getDerivation } from "./derivations";
import { HORIZON_ITEMS } from "./data/horizon";
import { horizonItemToSignal } from "./horizonSignals";
import { isBoardSignalValid } from "./validateBoardSignal";
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

describe("risk at a glance", () => {
  it("adds up to the tiles and the metric count", () => {
    const strip = buildRiskAppetiteStrip(NOV);
    assert.deepEqual([strip.green, strip.amber, strip.red, strip.total], [42, 6, 2, 50]);
    const tiles = buildCategoryTiles(NOV);
    for (const row of strip.byCategory) {
      const tile = tiles.find((t) => t.categoryId === row.categoryId);
      assert.equal(row.red, tile?.ramRed, row.categoryId);
      assert.equal(row.amber, tile?.ramAmber, row.categoryId);
    }
    assert.equal(strip.focusCategoryId, "cyber");
  });

  it("reports firm-wide control effectiveness and the lowest category", () => {
    const strip = buildControlStrip(NOV);
    assert.equal(strip.pct, 94);
    assert.equal(strip.prevPct, 96);
    assert.equal(strip.direction, "down");
    assert.equal(strip.worstCategoryId, "fincrime");
    assert.equal(strip.worstPct, buildCategoryTile("fincrime", NOV).criticalPct);
  });

  it("counts the same incidents as the tiles, excluding Sev-3", () => {
    const strip = buildIncidentStrip(NOV);
    const tileTotal = buildCategoryTiles(NOV).reduce((n, t) => n + t.sevOneTwo, 0);
    assert.equal(strip.sevOne + strip.sevTwo, tileTotal);
    assert.deepEqual([strip.sevOne, strip.sevTwo, strip.cadenceWord], [1, 2, "month"]);
    assert.equal(strip.topId, "INC-2026-041");
  });
});

describe("red spotlight", () => {
  it("lists the 5 most material items with owner, dates and governance", () => {
    const rows = buildRedSpotlight(NOV);
    assert.deepEqual(rows.map((r) => r.id), ["RAM-CY-01", "RAM-CY-02", "AML-C002", "CY-C001", "INC-2026-041"]);
    assert.equal(rows[0].measure, "3 open vs tolerance 2 open");
    assert.equal(rows[0].targetDate, "2026-11-13");
    assert.equal(rows[0].secondLine, "2nd line accepted");
    assert.equal(rows[0].committee, "Accepted by Board Risk Committee, 12 Oct 2026");
    assert.equal(rows[2].measure, "Test result: not effective, 3 Nov 2026");
    assert.equal(rows[4].measure, "Sev1 · open");
  });

  it("flags a missing path to green", () => {
    const rows = buildRedSpotlight(NOV, 5, { ...V8_ENGINE_DATA, pathsToGreen: [] });
    assert.ok(rows.every((r) => !r.hasPath && r.committee === null));
  });
});

describe("what changed", () => {
  const rows = buildWhatChanged(NOV);

  it("has at most 6 lines and no repeated sentences", () => {
    assert.ok(rows.length <= 6);
    assert.equal(new Set(rows.map((r) => r.text)).size, rows.length);
  });

  it("lists exactly what moved, most material first", () => {
    assert.deepEqual(rows.map((r) => r.text), [
      "New Sev1: Exploit attempt on unpatched perimeter vulnerability",
      "Closure pack signed; 3 critical vulnerabilities still open",
      "AML-C002 retested 3 Nov 2026: not effective. Disposition control under capacity stress.",
      "New Sev2: Cross-border structuring alerts past disposition SLA",
      "Credit Risk AMBER → GREEN: Portfolio delinquency 2.3% vs limit 2.5%",
    ]);
  });

  it("gives every line an evidence reference that opens a drawer entry", () => {
    for (const row of rows) {
      assert.ok(row.evidenceRef, row.id);
      if (row.id === "cyber-closure") continue;
      assert.notEqual(getDerivation(row.evidenceRef).missing, true, row.evidenceRef);
    }
  });

  it("never lists a Sev-3 incident", () => {
    assert.ok(!rows.some((r) => /Sev3/.test(r.text)));
  });
});

describe("what has not changed", () => {
  const rows = buildWhatHasNotChanged(NOV);

  it("keeps the three standing items, longest first", () => {
    assert.deepEqual(rows.map((r) => r.id), [
      "standing-fincrime",
      "tolerance-RA-FINCRIME-2025-004",
      "standing-cyber",
    ]);
    assert.ok(rows[2].text.startsWith("Cyber & Information Security"));
  });

  it("shows target, overdue flag and committee decision", () => {
    assert.equal(rows[0].targetDate, "2026-10-31");
    assert.equal(rows[0].overdue, true);
    assert.equal(rows[0].committee, "Delay accepted by Board Risk Committee, 12 Oct 2026");
    assert.equal(rows[2].targetDate, "2026-11-13");
    assert.equal(rows[2].overdue, false);
  });
});

describe("horizon scanning data", () => {
  it("moves the Consumer Duty gap under the control strip", () => {
    assert.deepEqual(buildControlStrip(NOV).evidenceWarnings, [
      "Consumer Duty: GREEN with 0 evidence artefacts this cycle",
    ]);
  });

  it("adapts industry, emerging and queue items to the investigation drawer", () => {
    const industry = HORIZON_ITEMS.find((h) => h.type === "industry");
    const emerging = HORIZON_ITEMS.find((h) => h.type === "emerging");
    assert.ok(industry && emerging);
    assert.equal(horizonItemToSignal(industry).title, "Industry Event");
    assert.equal(horizonItemToSignal(emerging).title, "Emerging Risk");
    for (const signal of [horizonItemToSignal(industry), horizonItemToSignal(emerging)]) {
      assert.equal(isBoardSignalValid(signal), true);
    }
  });
});
