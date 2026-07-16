/**
 * v5 AI insight contract — one citation model for explorer AND board signals.
 * Board signals inherit the explorer shape; confidence is always a band, never a bare %.
 */
import type { Accountability, BoardSignal, Derivation, Precedent } from "./types";
import { DOMAIN_ACCOUNTABILITY } from "./riskDomainsV5";
import { V5_PERSONA_INSIGHTS } from "./personaInsightSeeds";

export type SourceRecordRef = {
  type: string;
  id: string;
  label: string;
};

export type ConfidenceBand = "high" | "medium" | "low";

/** Explorer contract — extends legacy aiInsight with derivation + confidenceBand. */
export type AIInsightV5 = {
  id: string;
  type: string;
  title: string;
  summary: string;
  derivation: Derivation;
  confidenceBand: ConfidenceBand;
  confidenceBasis?: string;
  severity: "high" | "medium" | "low";
  modelId: string;
  modelVersion: string;
  generatedAt: string;
  methodology: string;
  personaRelevance: string[];
  screenRelevance: string[];
  sourceRecordIds: SourceRecordRef[];
  counterfactual?: string | null;
  inputsNotSeen?: string[];
  humanActionStatus?: string;
  independenceLineage?: {
    inputsFromLOD1: boolean;
    inputsFromLOD2: boolean;
    inputsFromLOD3: boolean;
  };
  relatedEntityIds?: { type: string; id: string }[];
  /** Original board signal id when type === "signal". */
  boardSignalId?: string;
};

const SEVERITY_MAP: Record<BoardSignal["severity"], AIInsightV5["severity"]> = {
  S1: "high",
  S2: "medium",
  S3: "low",
};

const CONFIDENCE_BAND_LABEL: Record<ConfidenceBand, string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

export function confidenceBandLabel(band: ConfidenceBand): string {
  return CONFIDENCE_BAND_LABEL[band];
}

/** Make repeated detector families visually unique in the explorer. */
export function boardSignalDisplayTitle(signal: BoardSignal): string {
  const subject = signal.crsaRef ?? signal.subCategory ?? signal.domainName;
  return `${signal.title} · ${subject}`;
}

/** Parse "silence-rule@1.0.0" into modelId + modelVersion. */
export function parseDetectionVersion(detectionVersion: string): {
  modelId: string;
  modelVersion: string;
} {
  const at = detectionVersion.lastIndexOf("@");
  if (at <= 0) return { modelId: detectionVersion, modelVersion: "1.0.0" };
  return {
    modelId: detectionVersion.slice(0, at),
    modelVersion: detectionVersion.slice(at + 1),
  };
}

function inferSourceType(ref: string): string {
  if (ref.startsWith("uk-") || ref.startsWith("us-")) return "precedent";
  if (ref.startsWith("KRI-")) return "kri";
  if (ref.startsWith("EVID-") || ref.startsWith("EV-")) return "evidence";
  if (ref.startsWith("ATT-")) return "attestation";
  if (/^[A-Z]{2,}-C\d+/.test(ref)) return "control";
  if (ref.startsWith("ISS-")) return "issue";
  return "record";
}

function precedentSourceRef(p: Precedent): SourceRecordRef {
  return {
    type: "precedent",
    id: p.id,
    label: `${p.respondent} · ${p.noticeDate}`,
  };
}

/** Persona relevance from DOMAIN_ACCOUNTABILITY — never a free string. */
export function personaRelevanceFromAccountability(
  accountability: Accountability,
): string[] {
  if ("unowned" in accountability && accountability.unowned) {
    return ["cro", "head_of_erm"];
  }
  if (accountability.regime === "UK" && "smf" in accountability) {
    switch (accountability.smf) {
      case "SMF4":
        return ["cro"];
      case "SMF16":
        return ["smf16", "cro"];
      case "SMF17":
        return ["smf17", "cro"];
      case "SMF24":
        return ["head_of_erm", "cro"];
      case "SMF2":
        return ["cro"];
      case "SMF1":
        return ["cro"];
      default:
        return ["cro"];
    }
  }
  return ["cro", "head_of_erm"];
}

export function personaRelevanceForDomain(domainId: string): string[] {
  const accountability = DOMAIN_ACCOUNTABILITY[domainId];
  if (!accountability) return ["cro"];
  return personaRelevanceFromAccountability(accountability);
}

/** Map numeric legacy confidence to band — v5 explorer never shows bare %. */
export function numericConfidenceToBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.75) return "medium";
  return "low";
}

/** Map a BoardSignal into the shared AI insight contract. */
export function boardSignalToAiInsight(signal: BoardSignal): AIInsightV5 {
  const { modelId, modelVersion } = parseDetectionVersion(signal.detectionVersion);

  const evidenceSources: SourceRecordRef[] = signal.evidenceRefs.map((ref) => ({
    type: inferSourceType(ref),
    id: ref,
    label: ref,
  }));

  const precedentSources = signal.precedents.map(precedentSourceRef);

  const seen = new Set<string>();
  const sourceRecordIds = [...evidenceSources, ...precedentSources].filter((s) => {
    const key = `${s.type}:${s.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const personaRelevance = personaRelevanceFromAccountability(signal.accountability);
  // Exclusive ownership: CRO-primary board signals stay on Board View; otherwise the
  // accountable persona sees them once in AI Insights — never on both surfaces.
  const primaryPersona = personaRelevance[0] ?? "cro";
  const screenRelevance =
    primaryPersona === "cro" ? ["croBoardView", "signal"] : ["aiInsights", "signal"];

  return {
    id: `SIG-INS-${signal.id}`,
    boardSignalId: signal.id,
    type: "signal",
    title: boardSignalDisplayTitle(signal),
    summary: signal.soWhat,
    derivation: signal.derivation,
    confidenceBand: signal.confidence.level,
    confidenceBasis: signal.confidence.basis,
    severity: SEVERITY_MAP[signal.severity],
    modelId,
    modelVersion,
    generatedAt: signal.evaluatedAt,
    methodology: signal.trigger,
    personaRelevance,
    screenRelevance,
    sourceRecordIds,
    counterfactual: signal.alternativeExplanation,
    inputsNotSeen: signal.missingEvidence.length ? signal.missingEvidence : undefined,
    humanActionStatus: "awaiting_acknowledgement",
    independenceLineage: {
      inputsFromLOD1: false,
      inputsFromLOD2: false,
      inputsFromLOD3: false,
    },
    relatedEntityIds: signal.crsaRef
      ? [{ type: "crsaRef", id: signal.crsaRef }]
      : [{ type: "domain", id: signal.domainId }],
  };
}

type LegacyInsight = {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: number;
  modelId: string;
  modelVersion: string;
  generatedAt: string;
  severity: string;
  personaRelevance?: string[];
  screenRelevance?: string[];
  methodology?: string;
  sourceRecordIds?: SourceRecordRef[];
  counterfactual?: string | null;
  inputsNotSeen?: string[];
  humanActionStatus?: string;
  independenceLineage?: AIInsightV5["independenceLineage"];
  relatedEntityIds?: { type: string; id: string }[];
  derivation?: Derivation;
};

/** Normalise legacy mock insights into the v5 contract. */
export function legacyInsightToV5(insight: LegacyInsight): AIInsightV5 {
  return {
    id: insight.id,
    type: insight.type,
    title: insight.title,
    summary: insight.summary,
    derivation: insight.derivation ?? "LLM",
    confidenceBand: numericConfidenceToBand(insight.confidence),
    severity:
      insight.severity === "high" || insight.severity === "medium" || insight.severity === "low"
        ? insight.severity
        : "medium",
    modelId: insight.modelId,
    modelVersion: insight.modelVersion,
    generatedAt: insight.generatedAt,
    methodology: insight.methodology ?? "—",
    personaRelevance: insight.personaRelevance ?? [],
    screenRelevance: insight.screenRelevance ?? ["aiInsights"],
    sourceRecordIds: insight.sourceRecordIds ?? [],
    counterfactual: insight.counterfactual,
    inputsNotSeen: insight.inputsNotSeen,
    humanActionStatus: insight.humanActionStatus,
    independenceLineage: insight.independenceLineage,
    relatedEntityIds: insight.relatedEntityIds,
  };
}

/**
 * Explorer feed — detector signals, legacy records, and v5 persona-owned records.
 * Persona/screen filtering and deduplication are applied by selectInsightsForView.
 */
export function buildExplorerInsights(
  legacyInsights: LegacyInsight[],
  boardSignals: BoardSignal[],
): AIInsightV5[] {
  const base = legacyInsights.map(legacyInsightToV5);
  const signals = boardSignals.map(boardSignalToAiInsight);
  return [...signals, ...V5_PERSONA_INSIGHTS, ...base];
}

export function findExplorerInsight(
  insights: AIInsightV5[],
  entityId: string,
): AIInsightV5 | undefined {
  return (
    insights.find((i) => i.id === entityId) ??
    insights.find((i) => i.boardSignalId === entityId) ??
    insights.find((i) => i.id === `SIG-INS-${entityId}`)
  );
}

/** Resolve an insight for the v5 drawer — legacy id or board signal id. */
export function resolveExplorerInsight(
  legacyInsights: LegacyInsight[],
  boardSignals: BoardSignal[],
  entityId: string,
): AIInsightV5 | undefined {
  const all = buildExplorerInsights(legacyInsights, boardSignals);
  return findExplorerInsight(all, entityId);
}
