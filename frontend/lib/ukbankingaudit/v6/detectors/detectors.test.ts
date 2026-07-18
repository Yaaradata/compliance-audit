/**

 * Board detector acceptance gate. Run:

 *   npx tsx --test lib/ukbankingaudit/v6/detectors/detectors.test.ts

 */

import assert from "node:assert/strict";

import { describe, it } from "node:test";

import { DOMAIN_EVIDENCE } from "../riskDomainsV6";

import { BOARD_SIGNAL_TITLES } from "../types";

import { detectGreenWithoutEvidence, runBoardDetectors } from "./index";



const UK_SIGNALS = runBoardDetectors("UK");

const US_SIGNALS = runBoardDetectors("US");

const ALL_SIGNALS = [...UK_SIGNALS, ...US_SIGNALS];



const UNARMED_DOMAINS = DOMAIN_EVIDENCE.filter((e) => e.cadenceSource !== "human-confirmed").map(

  (e) => e.domainId,

);



const TITLE_SET = new Set<string>(BOARD_SIGNAL_TITLES);



describe("greenWithoutEvidence arming", () => {

  it("never fires on a domain whose evidence is not human-confirmed", () => {

    const signals = detectGreenWithoutEvidence();

    for (const s of signals) {

      assert.ok(!UNARMED_DOMAINS.includes(s.domainId), `${s.id} fired on unarmed ${s.domainId}`);

      const evidence = DOMAIN_EVIDENCE.find(

        (e) =>

          e.domainId === s.domainId &&

          (s.subCategory == null || e.subCategory === s.subCategory),

      );

      assert.ok(evidence, `${s.id} has no backing evidence entry`);

      assert.equal(evidence.cadenceSource, "human-confirmed");

    }

  });



  it("fires the flagship fincrime sanctions card and the conduct card", () => {

    const ids = detectGreenWithoutEvidence().map((s) => s.id);

    assert.ok(ids.some((id) => id.startsWith("green-without-evidence-fincrime")));

    assert.ok(ids.some((id) => id.startsWith("green-without-evidence-conduct")));

  });

});



describe("absence is always explained", () => {

  it("every signal with empty evidenceRefs has non-empty missingEvidence", () => {

    for (const s of ALL_SIGNALS) {

      if (s.evidenceRefs.length === 0) {

        assert.ok(s.missingEvidence.length > 0, `${s.id} has empty evidenceRefs and empty missingEvidence`);

      }

    }

  });

});



describe("alternativeExplanation", () => {

  it("is non-empty on every signal", () => {

    for (const s of ALL_SIGNALS) {

      assert.ok(s.alternativeExplanation.trim().length > 0, `${s.id} empty alternativeExplanation`);

    }

  });

});



describe("precedent linkage", () => {

  it("every precedent carries a non-null admissionPosture", () => {

    for (const s of ALL_SIGNALS) {

      for (const p of s.precedents) {

        assert.notEqual(p.admissionPosture, null);

        assert.notEqual(p.admissionPosture, undefined);

      }

      if (s.primaryPrecedent) {

        assert.equal(s.primaryPrecedent.id, s.precedents[0]?.id);

      }

    }

  });

});



describe("signal titles", () => {

  it("every BoardSignal.title is one of the eight literals", () => {

    for (const s of ALL_SIGNALS) {

      assert.ok(TITLE_SET.has(s.title), `${s.id} has invalid title: ${s.title}`);

    }

  });

});



describe("dedupe", () => {

  it("no two signals share the same crsaRef", () => {

    const refs = UK_SIGNALS.map((s) => s.crsaRef).filter((r): r is string => r != null);

    assert.equal(new Set(refs).size, refs.length);

  });



  it("Consumer Duty matches HSBC not Starling", () => {

    const conduct = UK_SIGNALS.find((s) => s.id.includes("conduct") && s.title === "Green Without Evidence");

    assert.ok(conduct, "expected conduct green-without-evidence signal");

    assert.ok(conduct.precedents.some((p) => p.id === "uk-hsbc-2024"));

    assert.ok(!conduct.precedents.some((p) => p.id === "uk-starling-2024"));

  });



  it("Sanctions screening still matches Starling", () => {

    const fincrime = UK_SIGNALS.find(

      (s) => s.id.includes("fincrime") && s.title === "Green Without Evidence",

    );

    assert.ok(fincrime, "expected fincrime green-without-evidence signal");

    assert.ok(fincrime.precedents.some((p) => p.id === "uk-starling-2024"));

  });



  it("AML.01.05.02 emits one Precedent Match card with Nationwide primary", () => {

    const crsa = UK_SIGNALS.filter((s) => s.crsaRef === "AML.01.05.02");

    assert.equal(crsa.length, 1);

    assert.equal(crsa[0].title, "Precedent Match");

    assert.equal(crsa[0].primaryPrecedent?.id, "uk-nationwide-2025");

  });

});



describe("confidence shape", () => {

  it("is never a bare number — always { level, basis }", () => {

    for (const s of ALL_SIGNALS) {

      assert.equal(typeof s.confidence, "object");

      assert.ok(["high", "medium", "low"].includes(s.confidence.level));

      assert.ok(s.confidence.basis.trim().length > 0);

    }

  });

});



describe("runBoardDetectors determinism & ordering", () => {

  it("returns identical output across invocations", () => {

    assert.deepEqual(runBoardDetectors("UK"), runBoardDetectors("UK"));

    assert.deepEqual(runBoardDetectors("US"), runBoardDetectors("US"));

  });



  it("orders S1 before S2 before S3", () => {

    const rank = { S1: 0, S2: 1, S3: 2 } as const;

    for (let i = 1; i < UK_SIGNALS.length; i++) {

      assert.ok(rank[UK_SIGNALS[i - 1].severity] <= rank[UK_SIGNALS[i].severity]);

    }

  });

});


