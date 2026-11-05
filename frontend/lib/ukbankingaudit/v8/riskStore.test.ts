import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildCategoryTile, buildRedSpotlight } from "./boardView";
import { getDerivation } from "./derivations";
import { buildRamRows } from "./riskAppetiteView";
import { getRiskState, resetRiskStore, savePathToGreen, trailEventsForSave } from "./riskStore";
import type { PathToGreenRecord } from "./types";

const NOV = "2026-11";
const NOW = "2026-11-05T10:00:00.000Z";

function path(id: string): PathToGreenRecord {
  const found = getRiskState().data.pathsToGreen.find((p) => p.id === id);
  assert.ok(found, id);
  return found;
}

afterEach(() => resetRiskStore());

describe("saving a path to green", () => {
  it("updates the tile chip and the Red Spotlight", () => {
    const before = getRiskState().data;
    assert.equal(buildCategoryTile("cyber", NOV, before).path?.secondLine, "challenged");
    savePathToGreen({ ...path("PTG-RAM-CY-02"), secondLineVerdict: "accepted" }, NOW);
    const after = getRiskState().data;
    assert.equal(buildCategoryTile("cyber", NOV, after).path?.secondLine, "pending");
    const row = buildRedSpotlight(NOV, 5, after).find((r) => r.id === "RAM-CY-02");
    assert.equal(row?.secondLine, "2nd line accepted");
  });

  it("adds a path to an item without one", () => {
    const before = getRiskState().data.pathsToGreen.length;
    savePathToGreen({ ...path("PTG-RAM-CY-02"), id: "PTG-RAM-NEW", targetId: "RAM-MK-01" }, NOW);
    assert.equal(getRiskState().data.pathsToGreen.length, before + 1);
  });

  it("writes to the accountable SMF's trail", () => {
    savePathToGreen({ ...path("PTG-RAM-FC-02"), owner: "New owner" }, NOW);
    const [event] = getRiskState().trail;
    assert.equal(event.smf, "SMF17");
    assert.equal(event.eventType, "decision");
    assert.equal(event.evidenceId, "PTG-RAM-FC-02");
    assert.equal(event.timestamp, NOW);
  });

  it("does not mutate the seed", () => {
    savePathToGreen({ ...path("PTG-RAM-CY-02"), secondLineVerdict: "accepted" }, NOW);
    resetRiskStore();
    assert.equal(path("PTG-RAM-CY-02").secondLineVerdict, "challenged");
  });

  it("shows the current path in the trail's evidence link", () => {
    savePathToGreen({ ...path("PTG-RAM-CY-02"), cause: "Updated cause" }, NOW);
    const record = getDerivation("PTG-RAM-CY-02");
    assert.equal(record.missing, undefined);
    assert.equal(record.inputs[0].value, "Updated cause");
  });
});

describe("trail event types", () => {
  const base = (): PathToGreenRecord => path("PTG-RAM-CY-07");

  it("maps a challenge to an escalation", () => {
    const events = trailEventsForSave(base(), { ...base(), secondLineVerdict: "challenged" }, "SMF24", NOW);
    assert.deepEqual(events.map((e) => e.eventType), ["escalation"]);
  });

  it("maps acceptance to an acknowledgement", () => {
    const events = trailEventsForSave(base(), { ...base(), secondLineVerdict: "accepted" }, "SMF24", NOW);
    assert.deepEqual(events.map((e) => e.eventType), ["acknowledgement"]);
  });

  it("maps committee decisions to a decision, and sent back to an escalation", () => {
    const accepted = trailEventsForSave(base(), { ...base(), committeeDecision: "accepted" }, "SMF24", NOW);
    assert.deepEqual(accepted.map((e) => e.eventType), ["decision"]);
    const sentBack = trailEventsForSave(base(), { ...base(), committeeDecision: "sent_back" }, "SMF24", NOW);
    assert.deepEqual(sentBack.map((e) => e.eventType), ["escalation"]);
  });

  it("records both when second line and committee act together", () => {
    const events = trailEventsForSave(
      base(),
      { ...base(), secondLineVerdict: "accepted", committeeDecision: "accepted" },
      "SMF24",
      NOW,
    );
    assert.deepEqual(events.map((e) => e.eventType), ["acknowledgement", "decision"]);
  });
});

describe("risk appetite rows", () => {
  const rows = buildRamRows(NOV);

  it("has all 50 metrics, red first, then amber, then green", () => {
    assert.equal(rows.length, 50);
    const order = rows.map((r) => r.status);
    assert.deepEqual(order.slice(0, 2), ["red", "red"]);
    assert.deepEqual(order.slice(2, 8), Array(6).fill("amber"));
    assert.ok(order.slice(8).every((s) => s === "green"));
  });

  it("shows the value against its limit, with six months of history", () => {
    const row = rows.find((r) => r.id === "RAM-CY-01");
    assert.equal(`${row?.valueText} vs limit ${row?.limitText}`, "3 open vs limit 0");
    assert.equal(row?.toleranceText, "2");
    assert.equal(row?.series.length, 6);
  });

  it("flags only red metrics for the next Board Risk Committee", () => {
    for (const row of rows) assert.equal(row.forNextBoardRiskCommittee, row.status === "red", row.id);
  });

  it("reads trend by the metric's direction", () => {
    assert.equal(rows.find((r) => r.id === "RAM-FC-02")?.trend, "worse");
    assert.equal(rows.find((r) => r.id === "RAM-LQ-01")?.trend, "worse");
    assert.equal(rows.find((r) => r.id === "RAM-CR-01")?.trend, "better");
    assert.equal(rows.find((r) => r.id === "RAM-CY-01")?.trend, "flat");
  });
});
