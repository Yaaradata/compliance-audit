/**
 * Disposition guardrails: every disposition attaches to a named human actor, the
 * third line may never disposition, and a system actor is always refused.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isSystemActor, recordAcknowledgement, recordDisposition, type DispositionInput } from "./dispositions";

const base: DispositionInput = {
  role: "second-line",
  actorId: "a.whitfield",
  kind: "reject",
  signalId: "sig-1",
  reason: "Reviewed against evidence store; no gap on this control.",
};

test("internal audit (third line) is refused at the data layer", () => {
  const result = recordDisposition({ ...base, role: "internal-audit" });
  assert.equal(result.ok, false);
});

test("a system actor may never disposition", () => {
  assert.equal(isSystemActor("system"), true);
  assert.equal(isSystemActor("svc-batch"), true);
  assert.equal(isSystemActor("a.whitfield"), false);
  const result = recordDisposition({ ...base, actorId: "system" });
  assert.equal(result.ok, false);
});

test("a valid disposition writes { actorId, reason, ts }", () => {
  const result = recordDisposition(base);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.entry.actorId, "a.whitfield");
    assert.ok(result.entry.reason.length > 0);
    assert.ok(result.entry.ts.length > 0);
  }
});

test("accept requires both a reason and an expiry", () => {
  assert.equal(recordDisposition({ ...base, kind: "accept", expiry: "" }).ok, false);
  assert.equal(recordDisposition({ ...base, kind: "accept", expiry: "2026-12-31" }).ok, true);
});

test("internal audit may never acknowledge", () => {
  const result = recordAcknowledgement({
    role: "internal-audit",
    actorId: "a.whitfield",
    reason: "Reviewed Final Notice against accountable controls.",
    precedentId: "uk-nationwide-2024",
  });
  assert.equal(result.ok, false);
});

test("a valid acknowledgement writes { actorId, reason, ts }", () => {
  const result = recordAcknowledgement({
    role: "second-line",
    actorId: "SMF16-JAMES-OKONKWO",
    reason: "Accountable controls mapped; reasonable steps documented.",
    precedentId: "uk-nationwide-2024",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.entry.actorId, "SMF16-JAMES-OKONKWO");
    assert.ok(result.entry.reason.length > 0);
    assert.ok(result.entry.ts.length > 0);
    assert.equal(result.entry.precedentId, "uk-nationwide-2024");
  }
});

test("a system actor may never acknowledge", () => {
  const result = recordAcknowledgement({
    role: "second-line",
    actorId: "system",
    reason: "Auto-ack",
    precedentId: "uk-nationwide-2024",
  });
  assert.equal(result.ok, false);
});
