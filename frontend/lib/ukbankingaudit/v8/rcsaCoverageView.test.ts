import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mockDataV8 from "../mockDataV8";
import { buildMajorGaps, rcsaCycleNote } from "./rcsaCoverageView";
import { buildSmfRiskView } from "./reasonableStepsView";

type Input = Parameters<typeof buildMajorGaps>;
const { obligations, smfHolders } = mockDataV8 as unknown as { obligations: Input[0]; smfHolders: Input[1] };
const rows = buildMajorGaps(obligations, smfHolders);

describe("RCSA coverage", () => {
  it("states the refresh cycle", () => {
    assert.equal(rcsaCycleNote(), "Mapping refreshed on the RCSA cycle · last: 30 Jun 2026 · next: 31 Dec 2026");
  });

  it("tracks the 8 obligations not fully covered, uncovered first", () => {
    assert.equal(rows.length, 8);
    assert.deepEqual(rows.slice(0, 3).map((r) => r.citation).sort(), ["DISP 1.6", "PRIN 12", "SS1/23"]);
    assert.ok(rows.slice(0, 3).every((r) => r.coverage === "Uncovered"));
    assert.ok(rows.slice(3).every((r) => r.coverage === "Thinly covered"));
    assert.deepEqual(rows.slice(3).map((r) => r.citation).sort(), ["POCA s.330", "PS23/3", "Reg 35", "SAMLA/ECTEA", "SS2/21"]);
  });

  it("gives every gap an owner, action, target and status", () => {
    for (const row of rows) {
      assert.notEqual(row.owner, "Not allocated", row.citation);
      assert.ok(row.action && row.targetDate && row.status, row.citation);
      assert.ok(row.targetDate > "2026-11-05", row.citation);
    }
  });

  it("gives mapped controls their test status for the obligation drawer", () => {
    const reg28 = (obligations as unknown as { id: string; linkedControlIds: string[] }[]).find((o) => o.id === "OBL-MLR-006");
    assert.ok(reg28);
    const controls = buildSmfRiskView("", reg28.linkedControlIds).controls;
    assert.equal(controls.length, reg28.linkedControlIds.length);
    assert.ok(controls.every((c) => c.lastTested && c.nextDue && c.result));
  });
});
