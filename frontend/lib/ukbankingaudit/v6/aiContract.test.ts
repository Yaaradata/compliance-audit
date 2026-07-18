import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  boardSignalToAiInsight,
  parseDetectionVersion,
  personaRelevanceForDomain,
  buildExplorerInsights,
  findExplorerInsight,
} from "./aiContract.ts";
import { runBoardDetectors } from "./detectors/index.ts";

describe("aiContract", () => {
  it("parses detectionVersion into modelId and modelVersion", () => {
    assert.deepEqual(parseDetectionVersion("green-without-evidence@1.0.0"), {
      modelId: "green-without-evidence",
      modelVersion: "1.0.0",
    });
  });

  it("maps BoardSignal to signal type with confidence band not number", () => {
    const signals = runBoardDetectors("UK");
    assert.ok(signals.length > 0);
    const mapped = boardSignalToAiInsight(signals[0]);
    assert.equal(mapped.type, "signal");
    assert.ok(["high", "medium", "low"].includes(mapped.confidenceBand));
    assert.equal(typeof (mapped as { confidence?: number }).confidence, "undefined");
    assert.ok(mapped.screenRelevance.includes("signal"));
    // Exclusive ownership: CRO-primary → Board View; other primary → AI Insights.
    if (mapped.personaRelevance[0] === "cro") {
      assert.ok(mapped.screenRelevance.includes("croBoardView"));
      assert.ok(!mapped.screenRelevance.includes("aiInsights"));
    } else {
      assert.ok(mapped.screenRelevance.includes("aiInsights"));
      assert.ok(!mapped.screenRelevance.includes("croBoardView"));
    }
    assert.equal(mapped.derivation, signals[0].derivation);
    assert.ok(mapped.sourceRecordIds.length > 0);
  });

  it("derives personaRelevance from DOMAIN_ACCOUNTABILITY", () => {
    assert.deepEqual(personaRelevanceForDomain("fincrime"), ["smf17", "cro"]);
    assert.deepEqual(personaRelevanceForDomain("market"), ["cro", "head_of_erm"]);
  });

  it("merges board signals with legacy insights for explorer", () => {
    const legacy = [
      {
        id: "AI-INS-TEST",
        type: "anomaly",
        title: "Test",
        summary: "Test summary",
        confidence: 0.97,
        modelId: "test",
        modelVersion: "1.0.0",
        generatedAt: "2026-07-10T00:00:00.000Z",
        severity: "high",
      },
    ];
    const merged = buildExplorerInsights(legacy, runBoardDetectors("UK").slice(0, 2));
    assert.ok(merged.some((i) => i.type === "signal"));
    assert.ok(merged.some((i) => i.type === "anomaly"));
    const signal = merged.find((i) => i.type === "signal");
    assert.ok(signal);
    assert.equal(findExplorerInsight(merged, signal!.boardSignalId!)?.id, signal!.id);
  });
});
