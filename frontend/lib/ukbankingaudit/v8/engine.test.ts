import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCategoryRating,
  computeControlEffectiveness,
  computeFirmPosture,
  computeRamStatus,
  computeTrend,
  controlStanding,
  periodLabel,
  previousPeriod,
  selectMaterialItems,
  V8_ENGINE_DATA,
  type EngineData,
} from "./engine";
import type { FirmAggregationRule } from "./config";
import type { Incident, IncidentControlLink, RAM, RAMValue } from "./types";

const NOV = "2026-11";
const OCT = "2026-10";

const higher: RAM = {
  id: "R",
  name: "Higher",
  categoryId: "credit",
  unit: "%",
  limit: 10,
  tolerance: 20,
  direction: "higherIsWorse",
  zeroTolerance: false,
  owner: "Owner",
};
const lower: RAM = { ...higher, limit: 95, tolerance: 85, direction: "lowerIsWorse" };

function withRule(rule: FirmAggregationRule, base: EngineData = V8_ENGINE_DATA): EngineData {
  return { ...base, config: { ...base.config, firmAggregationRule: rule } };
}

function withLink(link: IncidentControlLink, base: EngineData = V8_ENGINE_DATA): EngineData {
  const links = base.links.filter(
    (l) => !(l.incidentId === link.incidentId && l.controlId === link.controlId),
  );
  return { ...base, links: [...links, link] };
}

/** Forces every RAM in the given categories to a value at the chosen colour. */
function withCategoryColour(colours: Record<string, "red" | "amber">): EngineData {
  const ramValues: RAMValue[] = V8_ENGINE_DATA.ramValues.map((row) => {
    if (row.period !== NOV) return row;
    const ram = V8_ENGINE_DATA.rams.find((r) => r.id === row.ramId)!;
    const colour = colours[ram.categoryId];
    if (!colour) return row;
    // A zero tolerance metric has no amber: any non-zero value is red.
    if (ram.zeroTolerance && colour === "amber") return { ...row, value: 0 };
    const step = ram.direction === "higherIsWorse" ? 1 : -1;
    const value = colour === "red" ? ram.tolerance + step : ram.limit + step * 0.001;
    return { ...row, value };
  });
  return { ...V8_ENGINE_DATA, ramValues, incidents: [], links: [] };
}

describe("computeRamStatus", () => {
  it("handles higherIsWorse at and beyond each threshold", () => {
    assert.equal(computeRamStatus(higher, 10), "green");
    assert.equal(computeRamStatus(higher, 10.1), "amber");
    assert.equal(computeRamStatus(higher, 20), "amber");
    assert.equal(computeRamStatus(higher, 20.1), "red");
  });

  it("handles lowerIsWorse at and beyond each threshold", () => {
    assert.equal(computeRamStatus(lower, 95), "green");
    assert.equal(computeRamStatus(lower, 94), "amber");
    assert.equal(computeRamStatus(lower, 85), "amber");
    assert.equal(computeRamStatus(lower, 84), "red");
  });

  it("makes a zero tolerance metric red on any non-zero value", () => {
    const zero: RAM = { ...higher, limit: 5, tolerance: 10, zeroTolerance: true };
    assert.equal(computeRamStatus(zero, 0), "green");
    assert.equal(computeRamStatus(zero, 1), "red");
  });
});

describe("computeControlEffectiveness", () => {
  it("gives Financial Crime 85% in November against 90% in October", () => {
    const { pct, prevPct } = computeControlEffectiveness("fincrime", NOV);
    assert.equal(pct, 85);
    assert.equal(prevPct, 90);
  });

  it("lists AML-C002 as the November change, with its reason", () => {
    const { changed } = computeControlEffectiveness("fincrime", NOV);
    assert.equal(changed.length, 1);
    assert.equal(changed[0].controlId, "AML-C002");
    assert.equal(changed[0].from, "effective");
    assert.equal(changed[0].to, "not_effective");
    assert.equal(changed[0].reason, "Disposition control under capacity stress.");
    assert.equal(changed[0].date, "2026-11-03");
  });

  it("counts critical controls only", () => {
    const { pct } = computeControlEffectiveness("conduct", NOV);
    assert.equal(pct, 100, "CD-S001 is secondary and partially effective");
  });

  it("uses the latest test for quarterly controls between test dates", () => {
    assert.equal(controlStanding("AML-C001", NOV)?.date, "2026-09-12");
  });

  it("has no previous figure before the first period", () => {
    assert.equal(computeControlEffectiveness("credit", "2026-06").prevPct, null);
  });
});

describe("incident re-rating", () => {
  const failedOnConduct: IncidentControlLink = {
    incidentId: "INC-2026-040",
    controlId: "CD-C003",
    controlWorked: "failed",
  };

  it("treats a failed control as not effective from the incident date", () => {
    const data = withLink(failedOnConduct);
    const standing = controlStanding("CD-C003", NOV, data);
    assert.equal(standing?.result, "not_effective");
    assert.equal(standing?.incidentId, "INC-2026-040");
    assert.equal(controlStanding("CD-C003", OCT, data)?.result, "effective");
  });

  it("re-rates a partially effective control, but keeps a failed test's own reason", () => {
    const data = withLink({ incidentId: "INC-2026-040", controlId: "AML-C003", controlWorked: "failed" });
    assert.equal(controlStanding("AML-C003", NOV)?.result, "partially_effective");
    assert.equal(controlStanding("AML-C003", NOV, data)?.result, "not_effective");
    const seeded = controlStanding("AML-C002", NOV);
    assert.equal(seeded?.reason, "Disposition control under capacity stress.");
    assert.equal(seeded?.incidentId, null);
  });

  it("clears the re-rating at the next passing test", () => {
    const data = withLink({ incidentId: "INC-2026-036", controlId: "OR-C003", controlWorked: "failed" });
    assert.equal(controlStanding("OR-C003", OCT, data)?.result, "not_effective");
    assert.equal(controlStanding("OR-C003", NOV, data)?.result, "effective");
  });

  it("ignores links marked worked or partial", () => {
    assert.equal(controlStanding("OR-C003", OCT)?.result, "effective");
    assert.equal(controlStanding("CY-C004", NOV)?.result, "effective");
  });

  it("moves the control %, category colour and firm posture together", () => {
    const data = withLink(failedOnConduct);
    assert.equal(computeControlEffectiveness("conduct", NOV).pct, 100);
    assert.equal(computeControlEffectiveness("conduct", NOV, data).pct, 83);
    assert.equal(computeCategoryRating("conduct", NOV).colour, "green");
    assert.equal(computeCategoryRating("conduct", NOV, data).colour, "red");
    const firm = computeFirmPosture(NOV, data);
    assert.ok(firm.drivingCategories.some((c) => c.categoryId === "conduct"));
  });
});

describe("computeCategoryRating", () => {
  it("rates the seed as the brief requires", () => {
    assert.equal(computeCategoryRating("cyber", NOV).colour, "red");
    assert.equal(computeCategoryRating("fincrime", NOV).colour, "amber");
    for (const id of ["credit", "market", "liquidity", "conduct", "climate", "opsres", "regulatory"]) {
      assert.equal(computeCategoryRating(id, NOV).colour, "green", id);
    }
  });

  it("explains red in one sentence", () => {
    assert.equal(
      computeCategoryRating("cyber", NOV).why,
      "Red because 2 RAMs out of tolerance · 1 critical control failed · 1 Sev-1 incident",
    );
  });

  it("explains amber with several drivers and with a single metric", () => {
    assert.equal(
      computeCategoryRating("fincrime", NOV).why,
      "Amber because 5 RAMs above limit · critical controls 85% effective · 1 Sev-2 incident",
    );
    assert.equal(computeCategoryRating("credit", OCT).why, "Amber: Portfolio delinquency 2.6% vs limit 2.5%");
  });

  it("explains green", () => {
    assert.equal(computeCategoryRating("market", NOV).why, "Within appetite · critical controls 100% effective");
  });

  it("names its drivers by type", () => {
    const types = computeCategoryRating("cyber", NOV).drivers.map((d) => `${d.type}:${d.id}`);
    assert.deepEqual(types, ["ram:RAM-CY-01", "ram:RAM-CY-02", "control:CY-C001", "incident:INC-2026-041"]);
  });

  it("goes red on an open Sev-1 alone and amber on an open Sev-2 alone", () => {
    const base: Incident = {
      id: "X",
      date: "2026-11-01",
      title: "Test",
      severity: "Sev1",
      level: 1,
      categoryId: "market",
      impact: "None",
      owner: "Owner",
      status: "open",
    };
    const sev1 = { ...V8_ENGINE_DATA, incidents: [base] };
    assert.equal(computeCategoryRating("market", NOV, sev1).colour, "red");
    const sev2 = { ...V8_ENGINE_DATA, incidents: [{ ...base, level: 2 as const, severity: "Sev2" }] };
    assert.equal(computeCategoryRating("market", NOV, sev2).colour, "amber");
    const closed = { ...V8_ENGINE_DATA, incidents: [{ ...base, status: "closed" as const }] };
    assert.equal(computeCategoryRating("market", NOV, closed).colour, "green");
  });

  it("treats 85% as amber and below it as red", () => {
    const thresholds = V8_ENGINE_DATA.config.categoryRatingRule;
    assert.equal(thresholds.redThreshold, 85);
    assert.equal(thresholds.amberThreshold, 95);
    const onlyControls = { ...V8_ENGINE_DATA, rams: [], incidents: [], links: [] };
    assert.equal(computeControlEffectiveness("fincrime", NOV, onlyControls).pct, 85);
    assert.equal(computeCategoryRating("fincrime", NOV, onlyControls).colour, "amber");
    const lowered = withLink(
      { incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "failed" },
      onlyControls,
    );
    const withIncident = { ...lowered, incidents: V8_ENGINE_DATA.incidents.filter((i) => i.level === 3 || i.id === "INC-2026-040").map((i) => ({ ...i, status: "closed" as const })) };
    assert.equal(computeControlEffectiveness("fincrime", NOV, withIncident).pct, 80);
    assert.equal(computeCategoryRating("fincrime", NOV, withIncident).colour, "red");
  });

  it("agrees with every recorded rating snapshot", () => {
    for (const snapshot of V8_ENGINE_DATA.snapshots) {
      if (snapshot.entity === "firm") continue;
      assert.equal(
        computeCategoryRating(snapshot.entity, snapshot.period).colour,
        snapshot.colour,
        `${snapshot.entity} ${snapshot.period}`,
      );
    }
  });
});

describe("computeFirmPosture", () => {
  it("gives Firm red on the default anyRed rule, driven by Cyber", () => {
    const firm = computeFirmPosture(NOV);
    assert.equal(firm.colour, "red");
    assert.equal(firm.ruleDescription, "Any Level-1 risk red makes the firm red");
    assert.deepEqual(firm.drivingCategories, [
      { categoryId: "cyber", label: "Cyber & Information Security", colour: "red" },
    ]);
  });

  it("anyRed: amber when only ambers exist, green when all are green", () => {
    assert.equal(computeFirmPosture(NOV, withCategoryColour({ cyber: "amber" })).colour, "amber");
    const allGreen = {
      ...V8_ENGINE_DATA,
      ramValues: V8_ENGINE_DATA.ramValues.filter((v) => v.period !== NOV),
      controlTests: V8_ENGINE_DATA.controlTests.map((t) => ({ ...t, result: "effective" as const })),
      incidents: [],
      links: [],
    };
    assert.equal(computeFirmPosture(NOV, allGreen).colour, "green");
    assert.deepEqual(computeFirmPosture(NOV, allGreen).drivingCategories, []);
  });

  it("twoReds: one red gives amber, two reds give red", () => {
    const one = computeFirmPosture(NOV, withRule("twoReds"));
    assert.equal(one.colour, "amber");
    assert.equal(one.ruleDescription, "Two or more Level-1 risks red make the firm red");
    assert.deepEqual(one.drivingCategories.map((c) => c.categoryId).sort(), ["cyber", "fincrime"]);

    const two = computeFirmPosture(NOV, withRule("twoReds", withCategoryColour({ cyber: "red", market: "red" })));
    assert.equal(two.colour, "red");
    assert.ok(two.drivingCategories.every((c) => c.colour === "red"));
  });

  it("threeAmbersOrOneRed: one red, or three ambers, gives red; two ambers give amber", () => {
    assert.equal(computeFirmPosture(NOV, withRule("threeAmbersOrOneRed")).colour, "red");
    const noRed = (colours: Record<string, "amber">) =>
      computeFirmPosture(NOV, withRule("threeAmbersOrOneRed", withCategoryColour(colours)));
    const fixControls = { cyber: "amber", fincrime: "amber" } as const;
    assert.equal(noRed(fixControls).colour, "amber");
    const three = noRed({ ...fixControls, market: "amber" });
    assert.equal(three.colour, "red");
    assert.equal(three.drivingCategories.length, 3);
    assert.ok(three.drivingCategories.every((c) => c.colour === "amber"));
  });
});

describe("computeTrend", () => {
  it("is flat for Firm, Cyber and Financial Crime against October", () => {
    for (const entity of ["firm", "cyber", "fincrime"]) {
      assert.equal(computeTrend(entity, NOV).direction, "flat", entity);
    }
    assert.equal(computeTrend("firm", NOV).prevColour, "red");
    assert.equal(computeTrend("firm", NOV).prevPeriodLabel, "Oct");
  });

  it("is better for Credit in November and worse for Credit in October", () => {
    assert.deepEqual(computeTrend("credit", NOV), { direction: "better", prevColour: "amber", prevPeriodLabel: "Oct" });
    assert.equal(computeTrend("credit", OCT).direction, "worse");
  });

  it("reflects a local re-rate against the recorded previous period", () => {
    const data = withLink({ incidentId: "INC-2026-040", controlId: "CD-C003", controlWorked: "failed" });
    assert.equal(computeTrend("conduct", NOV, data).direction, "worse");
  });

  it("compares quarter on quarter at quarterly cadence", () => {
    const quarterly = { ...V8_ENGINE_DATA, config: { ...V8_ENGINE_DATA.config, reportingCadence: "quarterly" as const } };
    assert.equal(previousPeriod(NOV, quarterly.config), "2026-08");
    assert.equal(computeTrend("credit", NOV, quarterly).prevPeriodLabel, "Aug");
    assert.equal(computeTrend("credit", NOV, quarterly).direction, "flat");
  });

  it("is flat with no previous colour before the first period", () => {
    const trend = computeTrend("credit", "2026-06");
    assert.equal(trend.direction, "flat");
    assert.equal(trend.prevColour, null);
  });

  it("handles a year boundary in period helpers", () => {
    assert.equal(previousPeriod("2027-01"), "2026-12");
    assert.equal(periodLabel("2026-12"), "Dec");
  });
});

describe("selectMaterialItems", () => {
  it("ranks red RAMs by distance beyond tolerance, then controls, then Sev-1", () => {
    const ids = selectMaterialItems(NOV).map((item) => item.id);
    assert.deepEqual(ids, ["RAM-CY-01", "RAM-CY-02", "AML-C002", "CY-C001", "INC-2026-041"]);
  });

  it("continues with Sev-2 incidents and then rating moves", () => {
    const rest = selectMaterialItems(NOV, 20).map((item) => item.id).slice(5);
    assert.deepEqual(rest, ["INC-2026-040", "INC-2026-038", "MOVE-credit"]);
  });

  it("never includes a Sev-3 incident", () => {
    const sev3 = new Set(V8_ENGINE_DATA.incidents.filter((i) => i.level === 3).map((i) => i.id));
    for (const item of selectMaterialItems(NOV, 50)) assert.ok(!sev3.has(item.id), item.id);
  });

  it("respects the limit, defaulting to 5", () => {
    assert.equal(selectMaterialItems(NOV).length, 5);
    assert.equal(selectMaterialItems(NOV, 2).length, 2);
  });

  it("carries a path to green where one exists, and a readable detail", () => {
    const [first] = selectMaterialItems(NOV);
    assert.equal(first.pathToGreen?.id, "PTG-RAM-CY-01");
    assert.equal(first.detail, "3 open vs tolerance 2 open");
    const move = selectMaterialItems(NOV, 20).find((item) => item.kind === "ratingMove");
    assert.equal(move?.pathToGreen, null);
    assert.equal(move?.detail, "Oct: AMBER → Nov: GREEN");
  });

  it("reports null, not a guess, when an item has no path to green", () => {
    const data = { ...V8_ENGINE_DATA, pathsToGreen: [] };
    assert.ok(selectMaterialItems(NOV, 5, data).every((item) => item.pathToGreen === null));
  });
});
