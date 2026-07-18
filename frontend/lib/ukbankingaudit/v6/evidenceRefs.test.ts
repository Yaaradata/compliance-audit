/**
 * Guarantee: every v6 evidenceRef routes to a kind whose resolver finds something.
 * Without this, a new ClaimLine can compile and still dead-end in the drawer.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mockDataV2 from "../mockDataV2.ts";
import { collectV6EvidenceRefs } from "./collectV6EvidenceRefs.ts";
import { v6RefKind } from "./refRouter.ts";
import { resolveV6Entity } from "./resolveV6Entity.ts";

const evidenceById = new Map((mockDataV2.evidenceRecords || []).map((e: { id: string }) => [e.id, e]));
const kriById = new Map((mockDataV2.kris || []).map((k: { id: string }) => [k.id, k]));
const controlById = new Map((mockDataV2.controls || []).map((c: { id: string }) => [c.id, c]));

const deps = {
  getEvidence: (id: string) => evidenceById.get(id) ?? null,
  getKRI: (id: string) => kriById.get(id) ?? null,
  getControl: (id: string) => controlById.get(id) ?? null,
};

describe("v6 evidenceRef resolveEntity", () => {
  it("every collected evidenceRef resolves via v6RefKind + resolveV6Entity", () => {
    const refs = collectV6EvidenceRefs();
    assert.ok(refs.length > 20, "expected a non-trivial ref inventory");

    const failures: string[] = [];
    const audit: { ref: string; kind: string; resolves: boolean }[] = [];

    for (const ref of refs) {
      const kind = v6RefKind(ref);
      const entity = resolveV6Entity(kind, ref, deps);
      const ok = entity != null;
      audit.push({ ref, kind, resolves: ok });
      if (!ok) failures.push(`${ref} → ${kind}`);
    }

    if (failures.length) {
      assert.fail(
        `Unresolved v6 evidenceRefs:\n${failures.join("\n")}\n\nFull audit:\n${audit
          .map((a) => `${a.ref} → ${a.kind} → ${a.resolves ? "y" : "n"}`)
          .join("\n")}`,
      );
    }
  });

  it("never routes a PREC-(uk|us)- notice to aiInsight / derivation", () => {
    assert.equal(v6RefKind("PREC-uk-nationwide-2025"), "precedent");
    assert.equal(v6RefKind("PREC-CORPUS-CLOSED"), "derivation");
    assert.notEqual(v6RefKind("PREC-uk-nationwide-2025"), "derivation");
  });

  it("dead KRI-FC-0417 is not in the inventory; KRI-FC-016 is", () => {
    const refs = collectV6EvidenceRefs();
    assert.ok(!refs.includes("KRI-FC-0417"));
    assert.ok(refs.includes("KRI-FC-016"));
    assert.notEqual(resolveV6Entity(v6RefKind("KRI-FC-016"), "KRI-FC-016", deps), null);
  });
});
