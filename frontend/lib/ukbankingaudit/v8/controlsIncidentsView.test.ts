import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildCategoryTile, buildControlStrip, buildFirmBanner } from "./boardView";
import {
  buildCategoryEffectiveness,
  buildControlRows,
  buildEvidenceWarnings,
  buildIncidentCounts,
  buildIncidentRows,
  buildOverdueTests,
  buildWhatMoved,
  linkEffectNote,
} from "./controlsIncidentsView";
import { getRiskState, linkIncidentToControl, resetRiskStore } from "./riskStore";

const NOV = "2026-11";
const NOW = "2026-11-05T10:00:00.000Z";

afterEach(() => resetRiskStore());

describe("control effectiveness", () => {
  it("sorts the weakest category first", () => {
    const rows = buildCategoryEffectiveness(NOV);
    assert.equal(rows[0].categoryId, "fincrime");
    assert.deepEqual([rows[0].pct, rows[0].prevPct, rows[0].direction], [85, 90, "down"]);
    assert.equal(rows[1].categoryId, "cyber");
    assert.equal(rows.length, 9);
  });

  it("lists what moved with its reason", () => {
    assert.deepEqual(buildWhatMoved(NOV).map((m) => m.text), [
      "AML-C002 retested 3 Nov 2026: not effective — Disposition control under capacity stress.",
    ]);
  });

  it("orders critical controls first and links incidents", () => {
    const rows = buildControlRows(NOV);
    const firstSecondary = rows.findIndex((r) => r.tier === "secondary");
    assert.equal(rows.filter((r) => r.tier === "critical").length, 67);
    assert.ok(rows.slice(firstSecondary).every((r) => r.tier === "secondary"));
    assert.deepEqual(rows.find((r) => r.id === "CY-C001")?.linkedIncidentIds, ["INC-2026-041"]);
  });

  it("lists overdue tests and the Consumer Duty gap", () => {
    assert.deepEqual(buildOverdueTests().map((t) => t.id).sort(), ["CL-C003", "MK-C004"]);
    assert.deepEqual(buildEvidenceWarnings(NOV), ["Consumer Duty: GREEN with 0 evidence artefacts this cycle"]);
  });
});

describe("incidents", () => {
  it("counts Sev-1 and Sev-2 this period against last", () => {
    const counts = buildIncidentCounts(NOV);
    assert.deepEqual([counts.sevOne, counts.prevSevOne, counts.sevTwo, counts.prevSevTwo], [1, 0, 1, 2]);
  });

  it("hides Sev-3 unless asked", () => {
    assert.equal(buildIncidentRows().length, 4);
    assert.ok(buildIncidentRows().every((i) => i.level <= 2));
    assert.equal(buildIncidentRows(undefined, true).length, 10);
    assert.equal(buildIncidentRows()[0].id, "INC-2026-041");
  });
});

describe("linking an incident to a control", () => {
  it("moves the category, the banner and the strips when a control failed", () => {
    assert.equal(buildCategoryTile("fincrime", NOV, getRiskState().data).colour, "amber");
    assert.equal(buildControlStrip(NOV, getRiskState().data).pct, 94);
    linkIncidentToControl({ incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "failed" }, NOW);
    const { data } = getRiskState();
    const tile = buildCategoryTile("fincrime", NOV, data);
    assert.equal(tile.criticalPct, 80);
    assert.equal(tile.colour, "red");
    assert.equal(buildControlStrip(NOV, data).pct, 93);
    assert.ok(buildFirmBanner(NOV, data).drivingCategories.some((c) => c.categoryId === "fincrime"));
    assert.equal(buildControlRows(NOV, data).find((r) => r.id === "AML-C005")?.reRated, true);
    assert.ok(buildWhatMoved(NOV, data).some((m) => m.text.startsWith("AML-C005 re-rated 4 Nov 2026: not effective")));
  });

  it("re-rates the Sev-1 on another Cyber control in November", () => {
    linkIncidentToControl({ incidentId: "INC-2026-041", controlId: "CY-C002", controlWorked: "failed" }, NOW);
    const { data } = getRiskState();
    assert.equal(buildCategoryTile("cyber", NOV, data).criticalPct, 80);
    assert.equal(linkEffectNote("INC-2026-041", "CY-C002", NOV, data), null);
  });

  it("does not move the rating for worked or partial", () => {
    linkIncidentToControl({ incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "partial" }, NOW);
    assert.equal(buildCategoryTile("fincrime", NOV, getRiskState().data).criticalPct, 85);
  });

  it("explains when a later passing test already cleared the failure", () => {
    linkIncidentToControl({ incidentId: "INC-2026-036", controlId: "OR-C003", controlWorked: "failed" }, NOW);
    const { data } = getRiskState();
    assert.equal(buildCategoryTile("opsres", NOV, data).criticalPct, 100);
    assert.equal(
      linkEffectNote("INC-2026-036", "OR-C003", NOV, data),
      "OR-C003 passed a test on 3 Nov 2026, after this incident, so its current rating does not change.",
    );
  });

  it("records the link on the accountable SMF's trail", () => {
    linkIncidentToControl({ incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "failed" }, NOW);
    const [event] = getRiskState().trail;
    assert.deepEqual([event.smf, event.eventType, event.evidenceId], ["SMF17", "escalation", "INC-2026-040"]);
  });
});
