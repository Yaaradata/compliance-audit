/**
 * v5 CRSA attestation — assertion denominator, pack construction, line ageing.
 * Synthetic overlays; precedents resolve from precedentCorpus.
 */
import { getPrecedentById } from "./precedentCorpus";

/** LLM extraction vocabulary — exact set per product spec. */
export const COMPLETENESS_CLAIM_TERMS = [
  "enhanced",
  "effective",
  "complete",
  "remediated",
  "comprehensive",
  "fully",
  "within parameters",
  "no incidents",
] as const;

export type AttestationLineShape = {
  id: string;
  cycleId: string;
  groupSetRequirementId: string;
  applicability?: string;
  oneL?: {
    controlActivity?: string;
    executionEvidenceIds?: string[];
    populationSize?: number;
    coverageMode?: string;
  };
  evidenceCompletenessPct?: number;
  evidenceCompletenessBand?: string;
  exceptionFlag?: boolean;
};

export type GsrShape = {
  id: string;
  racmRef: string;
  requirementText: string;
};

export type AssertionDenominatorResult = {
  racmRef: string;
  claimSentence: string;
  extractedTerms: string[];
  coveredCount: number;
  populationCount: number;
  coveragePct: number;
  hasDenominator: boolean;
};

export type LineAgeingRecord = {
  racmRef: string;
  lineId: string;
  consecutiveCycles: number;
  lastArtefactMonthsAgo: number;
  fires: boolean;
};

export type SignedWithoutPackRecord = {
  lineId: string;
  racmRef: string;
  signedBy: string;
  signedAt: string;
  frozenSnapshotRef: string | null;
};

/** Nationwide-shaped denominator seed for AML.01.05.02 demo line. */
export const ATTESTATION_DENOMINATOR_SEEDS: Record<
  string,
  { claimSentence: string; coveredCount: number; populationCount: number; claimTerms: string[] }
> = {
  "AML.01.05.02": {
    claimSentence:
      "MLRO report recorded customer due diligence as enhanced across the in-scope customer population.",
    coveredCount: 888_618,
    populationCount: 18_000_000,
    claimTerms: ["enhanced"],
  },
};

/** AML.01.06.01 — rolled forward unchanged; Nationwide tolerance pattern. */
export const LINE_AGEING_SEEDS: Record<
  string,
  { consecutiveCycles: number; lastArtefactMonthsAgo: number }
> = {
  "AML.01.06.01": { consecutiveCycles: 7, lastArtefactMonthsAgo: 14 },
};

/**
 * Signed attestation lines with no frozen state snapshot — construction trigger.
 * COMPLIANCE NOTE: each record is a personal accountability artefact for a named SM.
 */
export const SIGNED_WITHOUT_PACK: SignedWithoutPackRecord[] = [
  {
    lineId: "LINE-CYC-Q2-2026-AML-06-01",
    racmRef: "AML.01.06.01",
    signedBy: "SMF17-PRIYA-PATEL",
    signedAt: "2026-04-28T16:04:00Z",
    frozenSnapshotRef: null,
  },
];

export type FrozenStatePack = {
  lineId: string;
  racmRef: string;
  signedAt: string;
  signedBy: string;
  /** Seven numbers true at the moment of signing. */
  numbers: {
    cycleCompletionPct: number;
    cycleExceptions: number;
    lineEvidencePct: number;
    alertOpenBacklog: number;
    populationSize: number;
    coveredCount: number | null;
    capacityDemandGap: number;
  };
};

const DEMO_STATE_AT_SIGNING: Omit<FrozenStatePack, "lineId" | "racmRef" | "signedAt" | "signedBy"> = {
  numbers: {
    cycleCompletionPct: 76,
    cycleExceptions: 12,
    lineEvidencePct: 78,
    alertOpenBacklog: 2565,
    populationSize: 12_847,
    coveredCount: null,
    capacityDemandGap: 400,
  },
};

/** LLM step — deterministic phrase match simulating extraction. */
export function extractCompletenessClaimTerms(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const term of COMPLETENESS_CLAIM_TERMS) {
    if (lower.includes(term)) found.push(term);
  }
  return found;
}

export function lineAssertionText(line: AttestationLineShape, gsr: GsrShape | undefined): string {
  const parts = [gsr?.requirementText ?? "", line.oneL?.controlActivity ?? ""].filter(Boolean);
  return parts.join(" ");
}

export function hasCompletenessClaim(line: AttestationLineShape, gsr: GsrShape | undefined): boolean {
  const seed = gsr ? ATTESTATION_DENOMINATOR_SEEDS[gsr.racmRef] : undefined;
  if (seed) return true;
  return extractCompletenessClaimTerms(lineAssertionText(line, gsr)).length > 0;
}

/** RULE step — coveredCount / populationCount where a denominator exists. */
export function computeAssertionDenominator(
  line: AttestationLineShape,
  gsr: GsrShape | undefined,
): AssertionDenominatorResult | null {
  if (!gsr) return null;

  const seed = ATTESTATION_DENOMINATOR_SEEDS[gsr.racmRef];
  const extractedFromText = extractCompletenessClaimTerms(lineAssertionText(line, gsr));

  if (!seed && extractedFromText.length === 0) return null;

  const claimSentence = seed?.claimSentence ?? lineAssertionText(line, gsr);
  const extractedTerms = seed?.claimTerms ?? extractedFromText;
  const populationCount = seed?.populationCount ?? line.oneL?.populationSize ?? 0;
  const coveredCount = seed?.coveredCount ?? populationCount;
  const hasDenominator = populationCount > 0 && (seed != null || extractedFromText.length > 0);

  if (!hasDenominator) return null;

  const coveragePct = populationCount > 0 ? (coveredCount / populationCount) * 100 : 0;

  return {
    racmRef: gsr.racmRef,
    claimSentence,
    extractedTerms,
    coveredCount,
    populationCount,
    coveragePct,
    hasDenominator,
  };
}

export function nationwideAssertionPrecedent() {
  return getPrecedentById("uk-nationwide-2025");
}

export function resolveLineAgeing(
  line: AttestationLineShape,
  gsr: GsrShape | undefined,
): LineAgeingRecord | null {
  if (!gsr) return null;
  const seed = LINE_AGEING_SEEDS[gsr.racmRef];
  if (!seed) return null;
  return {
    racmRef: gsr.racmRef,
    lineId: line.id,
    consecutiveCycles: seed.consecutiveCycles,
    lastArtefactMonthsAgo: seed.lastArtefactMonthsAgo,
    fires: seed.consecutiveCycles >= 3,
  };
}

export function lineAgeingForCycle(
  lines: AttestationLineShape[],
  gsrById: Record<string, GsrShape>,
): LineAgeingRecord[] {
  const records: LineAgeingRecord[] = [];
  for (const line of lines) {
    const gsr = gsrById[line.groupSetRequirementId];
    const ageing = resolveLineAgeing(line, gsr);
    if (ageing?.fires) records.push(ageing);
  }
  return records.sort((a, b) => b.consecutiveCycles - a.consecutiveCycles);
}

export function signedLinesWithoutPack(
  lines: AttestationLineShape[],
  gsrById: Record<string, GsrShape>,
): SignedWithoutPackRecord[] {
  const lineIds = new Set(lines.map((l) => l.id));
  return SIGNED_WITHOUT_PACK.filter((r) => lineIds.has(r.lineId)).map((r) => ({
    ...r,
    racmRef: r.racmRef || gsrById[lines.find((l) => l.id === r.lineId)?.groupSetRequirementId ?? ""]?.racmRef || r.racmRef,
  }));
}

/** CONSTRUCTION — rebuild the pack that should have accompanied the signature. */
export function buildFrozenStatePack(record: SignedWithoutPackRecord, line: AttestationLineShape): FrozenStatePack {
  const seed = ATTESTATION_DENOMINATOR_SEEDS[record.racmRef];
  return {
    lineId: record.lineId,
    racmRef: record.racmRef,
    signedAt: record.signedAt,
    signedBy: record.signedBy,
    numbers: {
      ...DEMO_STATE_AT_SIGNING.numbers,
      lineEvidencePct: line.evidenceCompletenessPct ?? DEMO_STATE_AT_SIGNING.numbers.lineEvidencePct,
      coveredCount: seed?.coveredCount ?? null,
      populationSize: seed?.populationCount ?? line.oneL?.populationSize ?? DEMO_STATE_AT_SIGNING.numbers.populationSize,
    },
  };
}

export function formatAgeingCopy(record: LineAgeingRecord): string {
  return `${record.racmRef} — attested unchanged for ${record.consecutiveCycles} consecutive cycle${record.consecutiveCycles === 1 ? "" : "s"}. Last supporting artefact: ${record.lastArtefactMonthsAgo} months ago.`;
}
