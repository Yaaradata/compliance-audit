import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildExplorerInsights,
  boardSignalToAiInsight,
} from "./aiContract.ts";
import { runBoardDetectors } from "./detectors/index.ts";
import mockDataV2 from "../mockDataV2.ts";
import { PERSONA_INSIGHT_MINIMUM } from "./personaInsightSeeds.ts";
import {
  groupInsightsByType,
  insightFingerprint,
  owningScreen,
  selectInsightsForView,
} from "./insightViews.ts";

const LEGACY = [
  {
    id: "AI-INS-001",
    type: "anomaly",
    title: "AML alert backlog acceleration outside seasonal pattern",
    summary: "Backlog growth rate…",
    confidence: 0.97,
    modelId: "anomaly-detector-v3",
    modelVersion: "3.2.1",
    generatedAt: "2026-07-10T00:00:00.000Z",
    severity: "high",
    personaRelevance: ["cro", "leadership"],
    screenRelevance: ["riskPosture", "aiInsights"],
  },
  {
    id: "AI-INS-003",
    type: "what_changed",
    title: "Week of 2026-04-26: Risk exposure rose 6 points",
    summary: "Enterprise RES rose…",
    confidence: 0.99,
    modelId: "narrative-generator-v4",
    modelVersion: "4.1.0",
    generatedAt: "2026-07-10T00:00:00.000Z",
    severity: "high",
    personaRelevance: ["cro"],
    screenRelevance: ["riskPosture"],
  },
  {
    id: "AI-INS-002",
    type: "evidence_pattern",
    title: "Wire callback evidence completeness pattern",
    summary: "Pattern detected…",
    confidence: 0.94,
    modelId: "evidence-quality-detector-v2",
    modelVersion: "2.4.0",
    generatedAt: "2026-07-10T00:00:00.000Z",
    severity: "medium",
    personaRelevance: ["leadership", "doer"],
    screenRelevance: ["controlUniverse", "aiInsights"],
  },
];

describe("insightViews", () => {
  it("assigns exclusive owning screens so CRO board signals are not AI Insights duplicates", () => {
    const signals = runBoardDetectors("UK").map(boardSignalToAiInsight);
    const croOwned = signals.filter((s) => owningScreen(s) === "croBoardView");
    const explorerOwned = signals.filter((s) => owningScreen(s) === "aiInsights");
    assert.ok(croOwned.length > 0);
    assert.ok(explorerOwned.length > 0);
    for (const s of croOwned) {
      assert.equal(s.personaRelevance[0], "cro");
      assert.ok(!s.screenRelevance.includes("aiInsights"));
    }
    for (const s of explorerOwned) {
      assert.notEqual(s.personaRelevance[0], "cro");
      assert.ok(s.screenRelevance.includes("aiInsights"));
    }
  });

  it("selectInsightsForView is persona-scoped and screen-exclusive", () => {
    const all = buildExplorerInsights(LEGACY, runBoardDetectors("UK"));

    const croAi = selectInsightsForView(all, { persona: "cro", screen: "aiInsights" });
    assert.ok(croAi.every((i) => owningScreen(i) === "aiInsights"));
    assert.ok(croAi.every((i) => i.personaRelevance[0] === "cro"));
    assert.ok(!croAi.some((i) => i.type === "signal")); // CRO-primary signals own Board View
    assert.ok(croAi.some((i) => i.id === "AI-INS-001"));
    assert.ok(!croAi.some((i) => i.id === "AI-INS-003")); // riskPosture-only
    assert.ok(!croAi.some((i) => i.id === "AI-INS-002")); // primary leadership → not cro

    const mlroAi = selectInsightsForView(all, { persona: "smf17", screen: "aiInsights" });
    assert.ok(mlroAi.every((i) => i.personaRelevance[0] === "smf17" || i.personaRelevance[0] === "doer"));
    assert.ok(mlroAi.some((i) => i.type === "signal")); // fincrime SMF17-primary
    assert.ok(mlroAi.every((i) => owningScreen(i) === "aiInsights"));
    assert.ok(!mlroAi.some((i) => i.id === "AI-INS-002")); // primary leadership → SMF16/ERM

    const ermAi = selectInsightsForView(all, { persona: "head_of_erm", screen: "aiInsights" });
    assert.ok(ermAi.some((i) => i.id === "AI-INS-002")); // primary leadership → ERM

    const complianceAi = selectInsightsForView(all, { persona: "smf16", screen: "aiInsights" });
    assert.ok(!complianceAi.some((i) => i.id === "AI-INS-002"));
    assert.ok(complianceAi.every((i) => i.personaRelevance[0] === "smf16"));

    const croBoard = selectInsightsForView(all, { persona: "cro", screen: "croBoardView" });
    assert.ok(croBoard.every((i) => owningScreen(i) === "croBoardView"));
    assert.ok(croBoard.every((i) => i.personaRelevance[0] === "cro"));
  });

  it("deduplicates identical fingerprints within a view", () => {
    const base = buildExplorerInsights(LEGACY, []).find((i) => i.id === "AI-INS-001")!;
    const clone = { ...base, id: "AI-INS-001-DUP" };
    const selected = selectInsightsForView([base, clone], {
      persona: "cro",
      screen: "aiInsights",
    });
    assert.equal(selected.length, 1);
    assert.equal(insightFingerprint(base), insightFingerprint(clone));
  });

  it("groups insights by type for structured rendering", () => {
    const all = buildExplorerInsights(LEGACY, runBoardDetectors("UK").slice(0, 3));
    const croAi = selectInsightsForView(all, { persona: "cro", screen: "aiInsights" });
    const groups = groupInsightsByType(croAi);
    assert.ok(groups.length >= 1);
    assert.equal(
      groups.reduce((n, g) => n + g.items.length, 0),
      croAi.length,
    );
  });

  it("gives every persona at least five unique AI Insights", () => {
    const all = buildExplorerInsights(
      mockDataV2.aiInsights ?? [],
      runBoardDetectors("UK"),
    );
    const personas = ["cro", "smf16", "smf17", "head_of_erm"] as const;

    for (const persona of personas) {
      const selected = selectInsightsForView(all, {
        persona,
        screen: "aiInsights",
      });
      const fingerprints = selected.map(insightFingerprint);
      assert.ok(
        selected.length >= PERSONA_INSIGHT_MINIMUM,
        `${persona} has ${selected.length}; expected at least ${PERSONA_INSIGHT_MINIMUM}`,
      );
      assert.equal(
        new Set(fingerprints).size,
        fingerprints.length,
        `${persona} contains duplicate insight fingerprints`,
      );
    }
  });

  it("does not assign the same AI Insight to two personas", () => {
    const all = buildExplorerInsights(
      mockDataV2.aiInsights ?? [],
      runBoardDetectors("UK"),
    );
    const personas = ["cro", "smf16", "smf17", "head_of_erm"] as const;
    const ownerByFingerprint = new Map<string, string>();

    for (const persona of personas) {
      const selected = selectInsightsForView(all, {
        persona,
        screen: "aiInsights",
      });
      for (const insight of selected) {
        const fingerprint = insightFingerprint(insight);
        const previousOwner = ownerByFingerprint.get(fingerprint);
        assert.equal(
          previousOwner,
          undefined,
          `${insight.id} is assigned to both ${previousOwner} and ${persona}`,
        );
        ownerByFingerprint.set(fingerprint, persona);
      }
    }
  });
});
