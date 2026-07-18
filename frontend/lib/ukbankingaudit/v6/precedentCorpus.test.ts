/**
 * Precedent corpus tests. Run:
 *   npx tsx --test lib/ukbankingaudit/v6/precedentCorpus.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Precedent } from "./types";
import { PRECEDENTS, formatConsequence, matchPrecedents } from "./precedentCorpus";

type PostureContract = undefined extends Precedent["admissionPosture"] ? "OPTIONAL" : "REQUIRED";
const POSTURE_CONTRACT: PostureContract = "REQUIRED";

type DomainScopeContract = undefined extends Precedent["domainScope"] ? "OPTIONAL" : "REQUIRED";
const DOMAIN_SCOPE_CONTRACT: DomainScopeContract = "REQUIRED";

const VALID_POSTURES = new Set<Precedent["admissionPosture"]>([
  "admitted",
  "settled-no-admission",
  "alleged",
  "criminal-conviction",
  "guilty-plea",
  "consent-order",
  "undertaking-only",
  "open-investigation",
  "tribunal-varied",
]);

describe("PRECEDENTS admissionPosture", () => {
  it("is required at the type level", () => {
    assert.equal(POSTURE_CONTRACT, "REQUIRED");
  });

  it("is a non-null, valid posture on every record", () => {
    for (const p of PRECEDENTS) {
      assert.notEqual(p.admissionPosture, null);
      assert.notEqual(p.admissionPosture, undefined);
      assert.ok(VALID_POSTURES.has(p.admissionPosture), `${p.id} bad posture`);
    }
  });
});

describe("PRECEDENTS domainScope", () => {
  it("is required at the type level", () => {
    assert.equal(DOMAIN_SCOPE_CONTRACT, "REQUIRED");
  });

  it("is a non-empty array on every record", () => {
    for (const p of PRECEDENTS) {
      assert.ok(Array.isArray(p.domainScope), `${p.id} domainScope missing`);
      assert.ok(p.domainScope.length > 0, `${p.id} domainScope is empty`);
    }
  });
});

describe("formatConsequence", () => {
  it("renders the Wells Fargo asset cap without a number and without £NaN", () => {
    const wells = PRECEDENTS.find((p) => p.id === "us-wells-fargo-2018");
    assert.ok(wells);
    const rendered = formatConsequence(wells);
    assert.match(rendered, /no financial penalty/i);
    assert.doesNotMatch(rendered, /£NaN/);
  });

  it("never emits £NaN for any record", () => {
    for (const p of PRECEDENTS) {
      assert.doesNotMatch(formatConsequence(p), /£NaN/, `${p.id} rendered £NaN`);
    }
  });
});

describe("matchPrecedents", () => {
  it("returns [] for an empty tag list", () => {
    assert.deepEqual(matchPrecedents([], "UK", "fincrime"), []);
    assert.deepEqual(matchPrecedents([], "US", "conduct"), []);
  });

  it("does NOT return Starling for assertion-unevidenced on conduct", () => {
    const matches = matchPrecedents(["assertion-unevidenced"], "UK", "conduct");
    assert.ok(!matches.some((p) => p.id === "uk-starling-2024"));
  });

  it("DOES return Starling for sanctions-screening-misconfigured on fincrime", () => {
    const matches = matchPrecedents(["sanctions-screening-misconfigured"], "UK", "fincrime");
    assert.ok(matches.some((p) => p.id === "uk-starling-2024"));
  });

  it("never surfaces an open investigation", () => {
    const matches = matchPrecedents(["assertion-unevidenced"], "UK", "conduct");
    assert.ok(matches.every((p) => p.admissionPosture !== "open-investigation"));
  });

  it("scopes to jurisdiction and domain", () => {
    const uk = matchPrecedents(["repeat-finding"], "UK", "fincrime");
    const us = matchPrecedents(["repeat-finding"], "US", "conduct");
    assert.ok(uk.every((p) => p.jurisdiction === "UK" && p.domainScope.includes("fincrime")));
    assert.ok(us.every((p) => p.jurisdiction === "US" && p.domainScope.includes("conduct")));
  });
});

describe("naming discipline", () => {
  it("keeps the open-investigation respondent anonymised", () => {
    const watch = PRECEDENTS.find((p) => p.id === "uk-fca-enforcement-watch-1");
    assert.ok(watch);
    assert.equal(watch.respondent, "Firms not named by the FCA");
  });
});
