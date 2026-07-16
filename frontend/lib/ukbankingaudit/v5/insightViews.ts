/**
 * Persona- and screen-owned insight selection for v5.
 *
 * Rules:
 *  1. An insight is shown to a persona only when personaRelevance intersects
 *     that persona's relevance tags.
 *  2. Each insight has exactly one owningScreen — it must not reappear on
 *     other screens.
 *  3. Within a view, insights are deduplicated by a stable fingerprint.
 */
import type { AIInsightV5 } from "./aiContract";

export type UkbaPersonaId = "cro" | "head_of_erm" | "smf16" | "smf17";

export type InsightScreenId =
  | "aiInsights"
  | "croBoardView"
  | "controlUniverse"
  | "smcrWorkspace"
  | "coverageMap"
  | "riskPosture";

/** Tags accepted from legacy mock + board-signal accountability mapping. */
/**
 * Tags this persona owns. Legacy "leadership" maps only to Head of ERM so the
 * same card is not cloned onto SMF16's explorer.
 */
export const PERSONA_RELEVANCE_TAGS: Record<UkbaPersonaId, readonly string[]> = {
  cro: ["cro"],
  head_of_erm: ["head_of_erm", "leadership"],
  smf16: ["smf16"],
  smf17: ["smf17", "doer"],
};

const SEVERITY_RANK: Record<AIInsightV5["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export type InsightViewContext = {
  persona: UkbaPersonaId | string;
  screen: InsightScreenId | string;
};

function normalizeScreen(screen: string): string {
  if (screen === "riskPosture") return "croBoardView";
  return screen;
}

function isUkbaPersona(persona: string): persona is UkbaPersonaId {
  return persona === "cro" || persona === "head_of_erm" || persona === "smf16" || persona === "smf17";
}

export function personaTagsFor(persona: string): readonly string[] {
  if (isUkbaPersona(persona)) return PERSONA_RELEVANCE_TAGS[persona];
  return [persona];
}

/**
 * Persona ownership uses the primary relevance tag (first entry).
 * Secondary tags (e.g. cro on an SMF17 signal) do not steal the insight
 * into another persona's explorer — each card appears once.
 */
export function insightMatchesPersona(insight: AIInsightV5, persona: string): boolean {
  const tags = personaTagsFor(persona);
  const relevance = insight.personaRelevance ?? [];
  if (relevance.length === 0) return persona === "cro";
  return tags.includes(relevance[0]);
}

/**
 * Exclusive owning screen for an insight.
 *
 *  - Board detector signals: CRO-primary → Board View; other primary persona → AI Insights.
 *  - Legacy insights that list aiInsights: the explorer owns them (so they don't also
 *    reappear as board/catalogue noise). Insights that never list aiInsights keep their
 *    sole home screen (e.g. riskPosture-only).
 */
export function owningScreen(insight: AIInsightV5): string {
  if (insight.type === "signal") {
    const primary = insight.personaRelevance[0] ?? "cro";
    return primary === "cro" ? "croBoardView" : "aiInsights";
  }

  const screens = insight.screenRelevance ?? [];
  if (screens.includes("aiInsights")) return "aiInsights";
  if (screens.includes("controlUniverse")) return "controlUniverse";
  if (screens.includes("smcrWorkspace")) return "smcrWorkspace";
  if (screens.includes("coverageMap")) return "coverageMap";
  if (screens.includes("riskPosture") || screens.includes("croBoardView")) return "croBoardView";
  return normalizeScreen(screens[0] ?? "aiInsights");
}

/** Stable uniqueness key — same claim on same entity counts once. */
export function insightFingerprint(insight: AIInsightV5): string {
  const related = (insight.relatedEntityIds ?? [])
    .map((r) => `${r.type}:${r.id}`)
    .sort()
    .join(",");
  // Prefer semantic subject over opaque record id so clones with new ids still collapse.
  const subject =
    insight.boardSignalId ??
    (related || `${insight.summary.slice(0, 80)}`);
  return `${insight.type}|${insight.title}|${insight.modelId}|${subject}`;
}

function sortInsights(a: AIInsightV5, b: AIInsightV5): number {
  const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (bySeverity !== 0) return bySeverity;
  const byConf =
    SEVERITY_RANK[a.confidenceBand] - SEVERITY_RANK[b.confidenceBand];
  if (byConf !== 0) return byConf;
  return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

/**
 * Persona + screen filtered, ownership-exclusive, deduplicated insight list.
 */
export function selectInsightsForView(
  insights: AIInsightV5[],
  ctx: InsightViewContext,
): AIInsightV5[] {
  const screen = normalizeScreen(ctx.screen);
  const seen = new Set<string>();
  const out: AIInsightV5[] = [];

  for (const insight of [...insights].sort(sortInsights)) {
    if (!insightMatchesPersona(insight, ctx.persona)) continue;
    if (owningScreen(insight) !== screen) continue;
    const fp = insightFingerprint(insight);
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(insight);
  }
  return out;
}

/** Group selected insights by type for a structured explorer layout. */
export function groupInsightsByType(
  insights: AIInsightV5[],
): { type: string; items: AIInsightV5[] }[] {
  const order: string[] = [];
  const map = new Map<string, AIInsightV5[]>();
  for (const insight of insights) {
    if (!map.has(insight.type)) {
      map.set(insight.type, []);
      order.push(insight.type);
    }
    map.get(insight.type)!.push(insight);
  }
  return order.map((type) => ({ type, items: map.get(type)! }));
}

export function personaLabel(persona: string): string {
  switch (persona) {
    case "cro":
      return "CRO (SMF4)";
    case "head_of_erm":
      return "Head of ERM";
    case "smf16":
      return "Head of Compliance Monitoring (SMF16)";
    case "smf17":
      return "MLRO (SMF17)";
    default:
      return persona;
  }
}
