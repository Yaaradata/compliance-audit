import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { buildEnforcementNotices } from "./enforcementCoverage";
import { readAcrossPrecedents } from "./horizonSignals";
import mockDataV8 from "../mockDataV8";
import { buildRssTrend, buildSmfRiskView, ramForAppetiteBreach } from "./reasonableStepsView";
import { getRiskState, linkIncidentToControl, resetRiskStore, savePathToGreen } from "./riskStore";

type SmfRecord = { smfFunction: string; accountableControlIds: string[]; rss: { score: number } };
const holders = (mockDataV8 as unknown as { smfHolders: SmfRecord[] }).smfHolders;
const holdersForReadAcross = (
  mockDataV8 as unknown as {
    smfHolders: { id: string; smfFunction: string; lastAttestationDate: string; accountableControlIds: string[] }[];
  }
).smfHolders;
const smf = (fn: string) => {
  const found = holders.find((h) => h.smfFunction === fn);
  assert.ok(found, fn);
  return found;
};

afterEach(() => resetRiskStore());

describe("RSS trend", () => {
  it("shows the SMF17 fall as the brief words it", () => {
    assert.deepEqual(buildRssTrend("SMF17", smf("SMF17").rss.score), {
      direction: "worse",
      arrow: "▼",
      text: "▼ was 71 in Oct",
    });
  });

  it("covers every SMF in the switcher", () => {
    for (const holder of holders) assert.ok(buildRssTrend(holder.smfFunction, holder.rss.score), holder.smfFunction);
    assert.equal(buildRssTrend("SMF5", 84)?.direction, "flat");
    assert.equal(buildRssTrend("SMF99", 50), null);
  });
});

describe("SMF risk view", () => {
  it("gives SMF17 its metrics, 9 controls and incidents", () => {
    const view = buildSmfRiskView("SMF17", smf("SMF17").accountableControlIds);
    assert.equal(view.rams.length, 8);
    assert.equal(view.rams[0].status, "amber");
    assert.equal(view.controls.length, 9);
    assert.ok(view.controls.every((c) => c.tier === "critical"));
    assert.equal(view.controls.find((c) => c.id === "AML-C002")?.result, "not_effective");
    assert.deepEqual(view.incidents.map((i) => i.id), ["INC-2026-040"]);
    assert.deepEqual(view.incidents[0].controls, [{ controlId: "AML-C002", worked: "failed" }]);
  });

  it("gives SMF24 its cyber metrics and incidents", () => {
    const view = buildSmfRiskView("SMF24", smf("SMF24").accountableControlIds);
    assert.equal(view.rams.filter((r) => r.status === "red").length, 2);
    assert.deepEqual(view.controls.map((c) => c.id).sort(), ["VO-C005", "WP-C001", "WP-C003"]);
    assert.deepEqual(view.incidents.map((i) => i.id), ["INC-2026-041", "INC-2026-038"]);
  });

  it("gives SMF4 and SMF16 only what exists, and invents nothing for SMF5", () => {
    assert.ok(buildSmfRiskView("SMF4", []).rams.length > 0);
    assert.ok(buildSmfRiskView("SMF16", []).rams.length > 0);
    assert.deepEqual(buildSmfRiskView("SMF5", smf("SMF5").accountableControlIds), {
      rams: [],
      controls: [],
      incidents: [],
    });
  });

  it("updates when a new failed link reaches an owned control", () => {
    linkIncidentToControl(
      { incidentId: "INC-2026-041", controlId: "AML-C005", controlWorked: "failed" },
      "2026-11-05T10:00:00.000Z",
    );
    const view = buildSmfRiskView("SMF17", smf("SMF17").accountableControlIds, "2026-11", getRiskState().data);
    assert.equal(view.controls.find((c) => c.id === "AML-C005")?.result, "not_effective");
    assert.ok(view.incidents.some((i) => i.id === "INC-2026-041"));
  });
});

describe("appetite breach capture", () => {
  it("maps APP-FC-002 to its metric, and a save lands on the SMF17 trail", () => {
    const ramId = ramForAppetiteBreach("APP-FC-002");
    assert.equal(ramId, "RAM-FC-03");
    const path = getRiskState().data.pathsToGreen.find((p) => p.targetId === ramId);
    assert.ok(path);
    savePathToGreen({ ...path, committeeDecision: "accepted" }, "2026-11-05T10:00:00.000Z");
    const [event] = getRiskState().trail;
    assert.deepEqual([event.smf, event.eventType], ["SMF17", "decision"]);
  });

  it("files a control path under the control's own SMF", () => {
    const path = getRiskState().data.pathsToGreen.find((p) => p.targetId === "WP-C003");
    assert.ok(path);
    savePathToGreen({ ...path, owner: "Changed" }, "2026-11-05T10:00:00.000Z");
    assert.equal(getRiskState().trail[0].smf, "SMF24");
  });
});

describe("enforcement read-across", () => {
  it("includes every read-across notice in the Horizon Scanning queue source", () => {
    const { groupSetRequirements } = mockDataV8 as unknown as {
      groupSetRequirements: Parameters<typeof buildEnforcementNotices>[0]["groupSetRequirements"];
    };
    const queue = buildEnforcementNotices({ groupSetRequirements }).filter((n) => n.applicabilityStatus !== "completed");
    const queued = new Set(queue.map((n) => n.id));
    const readAcross = readAcrossPrecedents(holdersForReadAcross, queued).map((p) => p.id);
    for (const id of ["uk-nationwide-2025", "uk-barclays-2025", "uk-monzo-2025"]) {
      assert.ok(queued.has(id) || readAcross.includes(id), id);
    }
    assert.ok(!readAcross.some((id) => queued.has(id)), "no notice appears twice");
    assert.ok(!readAcross.includes("uk-metro-2024"), "unverified notices stay off the screen");
  });
});
