import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildCategoryTiles, buildControlStrip, buildFirmBanner, buildIncidentStrip, buildRiskAppetiteStrip } from "./boardView";
import { buildCroReport, buildTopLineSummary, buildTopLineTiles } from "./croReportView";
import { getDerivation } from "./derivations";
import { v8RefKind } from "./refRouter";
import { getRiskState, linkIncidentToControl, resetRiskStore } from "./riskStore";

const NOV = "2026-11";

afterEach(() => resetRiskStore());

describe("top-line summary", () => {
  const sentences = buildTopLineSummary(NOV);

  it("has 5-6 sentences and no repeats", () => {
    assert.ok(sentences.length >= 5 && sentences.length <= 6, String(sentences.length));
    assert.equal(new Set(sentences.map((s) => s.text)).size, sentences.length);
  });

  it("covers posture, reds, controls, incidents and horizon", () => {
    const all = sentences.map((s) => s.text).join(" ");
    assert.match(all, /Firm risk posture is RED, unchanged from Oct, driven by Cyber & Information Security/);
    assert.match(all, /2 risk appetite metrics are out of tolerance: Critical vulnerabilities open \(3 open vs tolerance 2 open\)/);
    assert.match(all, /Critical controls are 94% effective, down from 96%; the lowest is Fraud & Financial Crime at 85%/);
    assert.match(all, /1 Sev-1 incident and 2 Sev-2 incidents are open or new this month/);
    assert.match(all, /On the horizon: Google Cloud London region outage disrupts banks/);
  });

  it("cites record ids that open real drawer content", () => {
    for (const ref of sentences.flatMap((s) => s.cites)) {
      if (v8RefKind(ref) === "derivation") assert.notEqual(getDerivation(ref).missing, true, ref);
    }
    assert.ok(sentences.filter((s) => s.cites.length > 0).length >= 5);
  });

  it("follows local re-rates", () => {
    linkIncidentToControl({ incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "failed" }, "2026-11-05T10:00:00.000Z");
    const text = buildTopLineSummary(NOV, getRiskState().data).map((s) => s.text).join(" ");
    assert.match(text, /93% effective/);
    assert.match(text, /Fraud & Financial Crime and Cyber|Cyber & Information Security and Fraud/);
  });
});

describe("top-line tiles", () => {
  const tiles = buildTopLineTiles(NOV);
  const tile = (id: string) => {
    const found = tiles.find((t) => t.id === id);
    assert.ok(found, id);
    return found;
  };

  it("shows one figure per tile, matching the Board View", () => {
    assert.deepEqual(tiles.map((t) => t.value), ["RED", "2 metrics", "94%", "1 Sev-1 · 2 Sev-2", "2 industry events"]);
    assert.equal(tile("firm").note, "Same as Oct · Cyber & Information Security");
    assert.equal(tile("appetite").note, "Worst: Critical vulnerabilities open");
    assert.equal(tile("controls").note, "Down from 96%");
    assert.equal(tile("controls").value, `${buildControlStrip(NOV).pct}%`);
  });

  it("keeps each short line short", () => {
    for (const t of tiles) assert.ok(t.note.length <= 60, `${t.id}: ${t.note}`);
  });

  it("gives each tile one destination and keeps the full sentence as detail", () => {
    assert.deepEqual(tile("firm").target, { kind: "category", categoryId: "cyber" });
    assert.deepEqual(tile("appetite").target, { kind: "screen", screen: "riskAppetite" });
    assert.deepEqual(tile("controls").target, { kind: "screen", screen: "controlsIncidents" });
    assert.deepEqual(tile("incidents").target, { kind: "screen", screen: "controlsIncidents" });
    assert.deepEqual(tile("horizon").target, { kind: "evidence", ref: "HZ-IND-001" });
    for (const t of tiles) assert.ok(t.detail.length > 0, t.id);
    assert.match(tile("controls").detail, /Disposition control under capacity stress/);
  });

  it("carries the reference behind each figure", () => {
    assert.deepEqual(tiles.map((t) => t.reference), ["RAM-CY-01", "RAM-CY-01", "AML-C002", "INC-2026-041", "HZ-IND-001"]);
  });

  it("uses status tones from the rating rules", () => {
    assert.deepEqual(tiles.map((t) => t.tone), ["red", "red", "amber", "red", "neutral"]);
  });

  it("follows local re-rates", () => {
    linkIncidentToControl({ incidentId: "INC-2026-040", controlId: "AML-C005", controlWorked: "failed" }, "2026-11-05T10:00:00.000Z");
    const after = buildTopLineTiles(NOV, getRiskState().data);
    assert.equal(after.find((t) => t.id === "controls")?.value, "93%");
    assert.match(after.find((t) => t.id === "firm")?.note ?? "", /2 categories/);
  });
});

describe("CRO report", () => {
  const report = buildCroReport(NOV);

  it("matches the Board View numbers", () => {
    const banner = buildFirmBanner(NOV);
    assert.equal(report.firmColour, banner.colour);
    assert.equal(report.firmRule, banner.ruleDescription);
    assert.equal(report.assurance, banner.assuranceText);
    const strip = buildRiskAppetiteStrip(NOV);
    assert.deepEqual(report.appetiteTotals, { green: strip.green, amber: strip.amber, red: strip.red, total: strip.total });
    const controls = buildControlStrip(NOV);
    assert.equal(report.controlsPct, controls.pct);
    assert.equal(report.controlsPrevPct, controls.prevPct);
    const incidents = buildIncidentStrip(NOV);
    assert.equal(report.incidents.length, incidents.sevOne + incidents.sevTwo);
    const tiles = buildCategoryTiles(NOV);
    for (const row of report.ratings) {
      const tile = tiles.find((t) => t.categoryId === row.id);
      assert.equal(row.colour, tile?.colour, row.id);
      assert.equal(row.why, tile?.why, row.id);
    }
    for (const row of report.controlCategories) {
      assert.equal(row.pct, tiles.find((t) => t.categoryId === row.id)?.criticalPct, row.id);
    }
  });

  it("lists every red and amber metric with its governance", () => {
    assert.equal(report.appetite.length, 8);
    assert.equal(report.appetite[0].colour, "red");
    const kyc = report.appetite.find((a) => a.id === "RAM-FC-02");
    assert.equal(kyc?.path, "31 Oct 2026 (overdue)");
    assert.equal(kyc?.committee, "Delay accepted by Board Risk Committee, 12 Oct 2026");
  });

  it("has the reporting period and date for the footer", () => {
    assert.equal(report.periodText, "Nov 2026");
    assert.equal(report.asOfText, "5 Nov 2026");
  });

  it("shows all three horizon groups and no Sev-3 or unverified item", () => {
    assert.equal(report.horizon.regulatory.length, 2);
    assert.equal(report.horizon.industry.length, 2);
    assert.equal(report.horizon.emerging.length, 2);
    assert.ok(!report.incidents.some((i) => i.severity === "Sev3"));
    assert.doesNotMatch(JSON.stringify(report.horizon), /Metro/);
  });
});
