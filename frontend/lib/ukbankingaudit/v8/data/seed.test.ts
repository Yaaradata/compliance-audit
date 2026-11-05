/** Pins the v8 seed to the figures the screens will show, and to one another. */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTROLS,
  CONTROL_TESTS,
  HORIZON_ITEMS,
  INCIDENTS,
  INCIDENT_CONTROL_LINKS,
  PATHS_TO_GREEN,
  RAMS,
  RAM_VALUES,
  RATING_SNAPSHOTS,
  V8_CONFIG,
} from "./index";
import { PRECEDENTS } from "../precedentCorpus";
import { DOMAIN_HISTORY, RISK_DOMAINS_V4 } from "../riskDomainsV8";
import { refreshText } from "../dateRefresh";
import { buildEnforcementNotices, daysSince } from "../enforcementCoverage";
import mockDataV8 from "../../mockDataV8";
import type { RAM, RatingColour } from "../types";

const NOV = "2026-11";
const OCT = "2026-10";

function ramColour(ram: RAM, value: number): RatingColour {
  if (ram.zeroTolerance) return value === 0 ? "green" : "red";
  if (ram.direction === "higherIsWorse") {
    if (value > ram.tolerance) return "red";
    return value > ram.limit ? "amber" : "green";
  }
  if (value < ram.tolerance) return "red";
  return value < ram.limit ? "amber" : "green";
}

function colourOf(ramId: string, period: string): RatingColour {
  const ram = RAMS.find((r) => r.id === ramId);
  const row = RAM_VALUES.find((v) => v.ramId === ramId && v.period === period);
  assert.ok(ram && row, `missing ${ramId} at ${period}`);
  return ramColour(ram, row.value);
}

function nonGreen(categoryId: string, period: string): RatingColour[] {
  return RAMS.filter((r) => r.categoryId === categoryId)
    .map((r) => colourOf(r.id, period))
    .filter((c) => c !== "green");
}

function effectivePct(categoryId: string, period: string): number {
  const critical = CONTROLS.filter((c) => c.categoryId === categoryId && c.tier === "critical");
  const effective = critical.filter((control) => {
    const tests = CONTROL_TESTS.filter(
      (t) => t.controlId === control.id && t.date.slice(0, 7) <= period,
    ).sort((a, b) => a.date.localeCompare(b.date));
    return tests.at(-1)?.result === "effective";
  });
  return Math.round((effective.length / critical.length) * 100);
}

describe("v8 config", () => {
  it("has 9 Level-1 risks and the relabelled cyber category", () => {
    assert.equal(V8_CONFIG.riskTaxonomy.length, 9);
    const cyber = V8_CONFIG.riskTaxonomy.find((n) => n.id === "cyber");
    assert.equal(cyber?.label, "Cyber & Information Security");
    assert.ok((cyber?.children?.length ?? 0) > 0);
  });

  it("defaults to the anyRed firm rule and monthly cadence", () => {
    assert.equal(V8_CONFIG.firmAggregationRule, "anyRed");
    assert.equal(V8_CONFIG.reportingCadence, "monthly");
  });
});

describe("v8 RAM seed", () => {
  it("has 5-8 RAMs per category and 6 monthly values for each", () => {
    for (const node of V8_CONFIG.riskTaxonomy) {
      const count = RAMS.filter((r) => r.categoryId === node.id).length;
      assert.ok(count >= 5 && count <= 8, `${node.id} has ${count}`);
    }
    for (const ram of RAMS) {
      assert.equal(RAM_VALUES.filter((v) => v.ramId === ram.id).length, 6, ram.id);
    }
  });

  it("has unique ids", () => {
    assert.equal(new Set(RAMS.map((r) => r.id)).size, RAMS.length);
  });

  it("gives the required November statuses", () => {
    assert.equal(colourOf("RAM-CY-01", NOV), "red");
    assert.equal(colourOf("RAM-FC-02", NOV), "amber");
    assert.equal(colourOf("RAM-FC-01", NOV), "green");
    const backlog = RAM_VALUES.filter((v) => v.ramId === "RAM-FC-02").map((v) => v.value);
    assert.equal(backlog[0], 4210);
    assert.equal(backlog[5], 4380);
    const lcr = RAMS.find((r) => r.id === "RAM-LQ-01");
    assert.equal(lcr?.direction, "lowerIsWorse");
  });

  it("keeps every other category free of red or amber metrics in November", () => {
    for (const { id } of V8_CONFIG.riskTaxonomy) {
      if (id === "cyber" || id === "fincrime") continue;
      assert.deepEqual(nonGreen(id, NOV), [], id);
    }
    assert.ok(!nonGreen("fincrime", NOV).includes("red"));
    assert.ok(nonGreen("cyber", NOV).includes("red"));
  });
});

describe("v8 control seed", () => {
  it("has 20 critical Financial Crime controls at 90% in October and 85% in November", () => {
    const fc = CONTROLS.filter((c) => c.categoryId === "fincrime" && c.tier === "critical");
    assert.equal(fc.length, 20);
    assert.equal(effectivePct("fincrime", OCT), 90);
    assert.equal(effectivePct("fincrime", NOV), 85);
  });

  it("attributes the November fall to AML-C002", () => {
    const nov = CONTROL_TESTS.find((t) => t.controlId === "AML-C002" && t.date.startsWith(NOV));
    const oct = CONTROL_TESTS.find((t) => t.controlId === "AML-C002" && t.date.startsWith(OCT));
    assert.equal(oct?.result, "effective");
    assert.equal(nov?.result, "not_effective");
    assert.match(nov?.reason ?? "", /capacity stress/);
  });

  it("keeps green categories at or above the 95% threshold", () => {
    for (const { id } of V8_CONFIG.riskTaxonomy) {
      if (id === "cyber" || id === "fincrime") continue;
      assert.ok(effectivePct(id, NOV) >= V8_CONFIG.categoryRatingRule.amberThreshold, id);
    }
  });

  it("dates no test after the reporting date", () => {
    for (const test of CONTROL_TESTS) assert.ok(test.date <= V8_CONFIG.asOf, test.controlId);
  });
});

describe("v8 incident seed", () => {
  it("has 8-12 incidents: 1 Sev-1 in Cyber and 3 Sev-2", () => {
    assert.ok(INCIDENTS.length >= 8 && INCIDENTS.length <= 12);
    const sev1 = INCIDENTS.filter((i) => i.level === 1);
    assert.equal(sev1.length, 1);
    assert.equal(sev1[0].categoryId, "cyber");
    assert.equal(INCIDENTS.filter((i) => i.level === 2).length, 3);
  });

  it("maps each client severity label to its level", () => {
    for (const incident of INCIDENTS) {
      assert.equal(V8_CONFIG.severityLabels[incident.severity], incident.level, incident.id);
    }
  });

  it("links every incident to a known control", () => {
    const ids = new Set(CONTROLS.map((c) => c.id));
    for (const incident of INCIDENTS) {
      const links = INCIDENT_CONTROL_LINKS.filter((l) => l.incidentId === incident.id);
      assert.ok(links.length >= 1, incident.id);
      for (const link of links) assert.ok(ids.has(link.controlId), link.controlId);
    }
  });

  it("leaves no open Sev-1 or Sev-2 outside Cyber and Financial Crime", () => {
    const open = INCIDENTS.filter((i) => i.status === "open" && i.level <= 2);
    for (const incident of open) assert.ok(["cyber", "fincrime"].includes(incident.categoryId), incident.id);
  });

  it("dates no incident after the reporting date", () => {
    for (const incident of INCIDENTS) assert.ok(incident.date <= V8_CONFIG.asOf, incident.id);
  });
});

describe("v8 snapshots", () => {
  const colour = (entity: string, period: string) =>
    RATING_SNAPSHOTS.find((s) => s.entity === entity && s.period === period)?.colour;

  it("covers the firm and every category for the last 3 periods", () => {
    assert.equal(RATING_SNAPSHOTS.length, 30);
  });

  it("gives Firm red, Cyber red, Financial Crime amber and all others green in November", () => {
    assert.equal(colour("firm", NOV), "red");
    assert.equal(colour("cyber", NOV), "red");
    assert.equal(colour("fincrime", NOV), "amber");
    for (const { id } of V8_CONFIG.riskTaxonomy) {
      if (id !== "cyber" && id !== "fincrime") assert.equal(colour(id, NOV), "green", id);
    }
  });

  it("matches the RAM data for the credit move in October", () => {
    assert.equal(colourOf("RAM-CR-01", OCT), "amber");
    assert.equal(colour("credit", OCT), "amber");
    assert.equal(colourOf("RAM-CR-01", NOV), "green");
  });

  it("matches DOMAIN_HISTORY for every domain in September and October", () => {
    for (const history of DOMAIN_HISTORY) {
      const cycle = (reviewDate: string) =>
        history.cycles.find((c) => c.reviewDate === reviewDate)?.status.toLowerCase();
      assert.equal(colour(history.domainId, "2026-09"), cycle("2026-09-30"), history.domainId);
      assert.equal(colour(history.domainId, OCT), cycle("2026-10-31"), history.domainId);
    }
  });
});

describe("v8 paths to green", () => {
  const hasPath = (targetType: string, targetId: string) =>
    PATHS_TO_GREEN.some((p) => p.targetType === targetType && p.targetId === targetId);

  it("covers every red or amber metric in November", () => {
    for (const ram of RAMS) {
      if (colourOf(ram.id, NOV) !== "green") assert.ok(hasPath("ram", ram.id), ram.id);
    }
  });

  it("covers every critical control not fully effective in November", () => {
    for (const control of CONTROLS.filter((c) => c.tier === "critical")) {
      const latest = CONTROL_TESTS.filter((t) => t.controlId === control.id)
        .sort((a, b) => a.date.localeCompare(b.date))
        .at(-1);
      if (latest?.result !== "effective") assert.ok(hasPath("control", control.id), control.id);
    }
  });

  it("covers every open Sev-1", () => {
    for (const incident of INCIDENTS.filter((i) => i.level === 1 && i.status === "open")) {
      assert.ok(hasPath("incident", incident.id), incident.id);
    }
  });

  it("mixes second-line and committee states", () => {
    const verdicts = PATHS_TO_GREEN.map((p) => p.secondLineVerdict);
    assert.ok(verdicts.includes("accepted"));
    assert.equal(verdicts.filter((v) => v === "challenged").length, 1);
    assert.ok(verdicts.includes("pending"));
    const decisions = new Set(PATHS_TO_GREEN.map((p) => p.committeeDecision));
    for (const d of ["accepted", "pending", "sent_back", "bring_forward"]) assert.ok(decisions.has(d as never), d);
  });

  it("has one overdue path, with the committee decision on record", () => {
    const overdue = PATHS_TO_GREEN.filter((p) => p.targetDate < V8_CONFIG.asOf);
    assert.equal(overdue.length, 1);
    assert.equal(overdue[0].targetId, "RAM-FC-02");
    assert.equal(overdue[0].decisionDate, "2026-10-12");
  });
});

describe("v8 horizon items", () => {
  const ofType = (type: string) => HORIZON_ITEMS.filter((h) => h.type === type);

  it("has 2 sourced industry events and 2 sourced emerging risks", () => {
    assert.equal(ofType("industry").length, 2);
    assert.equal(ofType("emerging").length, 2);
    for (const item of [...ofType("industry"), ...ofType("emerging")]) {
      assert.match(item.sourceUrl, /^https:\/\//, item.id);
      assert.ok(item.source && item.date <= V8_CONFIG.asOf, item.id);
    }
  });

  it("keeps every UK precedent except unverified ones", () => {
    for (const p of PRECEDENTS.filter((x) => x.jurisdiction === "UK")) {
      const present = HORIZON_ITEMS.some((h) => h.id === `HZ-${p.id}`);
      assert.equal(present, p.confidence !== "unverified", p.id);
    }
    assert.ok(!HORIZON_ITEMS.some((h) => /metro/i.test(h.title)));
  });
});

describe("v8 date refresh", () => {
  it("drops the old cyber deadline and leaves no stale deadline text", () => {
    const cyber = RISK_DOMAINS_V4.find((d) => d.id === "cyber");
    assert.equal(cyber?.deadline, undefined);
    assert.doesNotMatch(JSON.stringify(RISK_DOMAINS_V4), /18-Jul|RED UNTIL/i);
  });

  it("moves prose and ISO dates but leaves identifiers alone", () => {
    assert.equal(refreshText("target 18-Jul"), "target 13-Nov");
    assert.equal(refreshText("2026-04-30"), "2026-11-05");
    assert.equal(refreshText("ISS-2026-009"), "ISS-2026-009");
    assert.equal(refreshText("CASE-2026-04-12"), "CASE-2026-04-12");
  });
});

describe("v8 enforcement queue", () => {
  it("keeps Barclays and Nationwide listed on the November clock", () => {
    const { groupSetRequirements } = mockDataV8 as unknown as {
      groupSetRequirements: Parameters<typeof buildEnforcementNotices>[0]["groupSetRequirements"];
    };
    const ids = buildEnforcementNotices({ groupSetRequirements }).map((notice) => notice.id);
    assert.ok(ids.includes("uk-barclays-2025"));
    assert.ok(ids.includes("uk-nationwide-2025"));
    assert.equal(daysSince("2025-07-14"), 479);
    assert.equal(daysSince("2025-12-11"), 329);
  });
});
