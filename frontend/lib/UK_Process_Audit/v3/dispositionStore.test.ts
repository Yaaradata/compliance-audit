/**
 * Disposition actorId contract + system-actor ban.
 * Run: npx tsx --test lib/UK_Process_Audit/v3/dispositionStore.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DispositionValidationError,
  applyDisposition,
  assertHumanActorId,
} from "./dispositionStore";

describe("applyDisposition actorId", () => {
  it("writes { actorId, reason, ts } with non-nullable actorId", () => {
    const d = applyDisposition({
      signalId: "silence-FC-07",
      status: "ACCEPTED_EXCEPTION",
      reason: "Temporary acceptance pending pack",
      expiry: "2026-08-31",
      actorId: "actor:cco-1",
      persona: "chief-compliance-officer",
    });
    assert.equal(typeof d.actorId, "string");
    assert.ok(d.actorId.length > 0);
    assert.equal(typeof d.reason, "string");
    assert.ok(d.reason.length > 0);
    assert.equal(typeof d.ts, "string");
    assert.ok(d.ts.length > 0);
    assert.equal("actor" in d, false);
    assert.equal("at" in d, false);
  });

  it("rejects empty actorId", () => {
    assert.throws(
      () =>
        applyDisposition({
          signalId: "silence-FC-07",
          status: "CONFIRMED_ISSUE",
          reason: "Promote",
          expiry: null,
          actorId: "   ",
          persona: "chief-compliance-officer",
        }),
      DispositionValidationError,
    );
  });

  it("rejects system actor", () => {
    assert.throws(() => assertHumanActorId("system"), /No system actor/);
    assert.throws(
      () =>
        applyDisposition({
          signalId: "silence-FC-07",
          status: "CONFIRMED_ISSUE",
          reason: "Promote",
          expiry: null,
          actorId: "system",
          persona: "chief-compliance-officer",
        }),
      /No system actor/,
    );
  });
});
