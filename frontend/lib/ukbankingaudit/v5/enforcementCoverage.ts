/**
 * v5 Obligation Coverage Map — enforcement notice traversal and gap precedent matching.
 * Synthetic applicability overlays; precedents are REAL (precedentCorpus).
 */
import { PRECEDENTS } from "./precedentCorpus";
import { matchPrecedents, formatConsequence } from "./precedentCorpus";
import { CRSA_MECHANISM_TAGS } from "./riskDomainsV5";
import type { FailureMechanism, Precedent } from "./types";
import type { RiskDomainV4 } from "../riskDomainTypes";

export type EnforcementApplicabilityStatus =
  | "completed"
  | "in_progress"
  | "not_assessed";

/** Horizon-shaped enforcement item — same traversal affordance as reg-change rows. */
export type EnforcementNoticeItem = {
  id: string;
  regulatorBody: string;
  citation: string;
  title: string;
  publishedDate: string;
  applicabilityStatus: EnforcementApplicabilityStatus;
  summary: string;
  precedent: Precedent;
  controlCount: number;
  impactedCrsaRefs: string[];
  impactedGsrIds: string[];
  impactedControlIds: string[];
  impactedMechanismTags: FailureMechanism[];
  ageDays: number;
};

export type CoverageGapRow = {
  id: string;
  gapType: string;
  ageDays: number;
  entityId: string;
  recommendedRemediation: string;
  severity: string;
};

const AS_OF_DEFAULT = "2026-04-30";
const TWELVE_MONTHS_MS = 365 * 86_400_000;

/** v5 demo applicability — extends horizon status with not_assessed. */
const ENFORCEMENT_APPLICABILITY: Record<string, EnforcementApplicabilityStatus> = {
  "uk-nationwide-2025": "not_assessed",
  "uk-barclays-2025": "not_assessed",
  "uk-monzo-2025": "in_progress",
  "uk-starling-2024": "not_assessed",
  "uk-metro-2024": "not_assessed",
  "uk-hsbc-2024": "completed",
  "uk-bank-of-ireland-uk-2026": "not_assessed",
};

/** Mechanisms inferred when a GSR ref is not in CRSA_MECHANISM_TAGS. */
const RACm_FALLBACK_MECHANISMS: Record<string, FailureMechanism[]> = {
  "AML.01.13.01": ["periodic-review-absent", "assertion-unevidenced"],
  "AML-C002": ["alert-suppression", "kri-breach-no-plan"],
  "OBL-OFSI-FROZ-001": ["sanctions-screening-misconfigured"],
};

export function crsaRefToDomainId(racmRef: string): RiskDomainV4["id"] {
  if (racmRef.startsWith("AML.") || racmRef.startsWith("SCTN.") || racmRef.startsWith("ABC.") || racmRef.startsWith("FRD.")) {
    return "fincrime";
  }
  if (racmRef.startsWith("CD.")) return "conduct";
  return "regulatory";
}

export function traversePrecedentReach(
  precedent: Precedent,
  groupSetRequirements: Array<{ id: string; racmRef: string; controlIds?: string[] }>,
): {
  crsaRefs: string[];
  gsrIds: string[];
  controlIds: string[];
  domainId: RiskDomainV4["id"];
} {
  const wanted = new Set(precedent.failureMechanismTags);
  const crsaRefs: string[] = [];
  for (const [ref, tags] of Object.entries(CRSA_MECHANISM_TAGS)) {
    if (tags.some((t) => wanted.has(t))) crsaRefs.push(ref);
  }

  const gsrIds: string[] = [];
  const controlIds = new Set<string>();
  for (const gsr of groupSetRequirements) {
    if (crsaRefs.includes(gsr.racmRef)) {
      gsrIds.push(gsr.id);
      for (const cid of gsr.controlIds || []) controlIds.add(cid);
    }
  }

  const domainId = (precedent.domainScope[0] ?? "fincrime") as RiskDomainV4["id"];
  return { crsaRefs, gsrIds, controlIds: [...controlIds], domainId };
}

export function daysSince(dateIso: string, asOf = AS_OF_DEFAULT): number {
  const end = Date.parse(`${asOf}T00:00:00.000Z`);
  const start = Date.parse(`${dateIso}T00:00:00.000Z`);
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function buildEnforcementNotices(input: {
  jurisdiction?: "UK" | "US";
  asOf?: string;
  groupSetRequirements: Array<{ id: string; racmRef: string; controlIds?: string[] }>;
}): EnforcementNoticeItem[] {
  const jurisdiction = input.jurisdiction ?? "UK";
  const asOf = input.asOf ?? AS_OF_DEFAULT;
  const cutoff = Date.parse(`${asOf}T00:00:00.000Z`) - TWELVE_MONTHS_MS;

  const items: EnforcementNoticeItem[] = [];
  for (const precedent of PRECEDENTS) {
    if (precedent.jurisdiction !== jurisdiction) continue;
    if (precedent.admissionPosture === "open-investigation") continue;
    if (Date.parse(`${precedent.noticeDate}T00:00:00.000Z`) < cutoff) continue;

    const reach = traversePrecedentReach(precedent, input.groupSetRequirements);
    if (reach.controlIds.length === 0) continue;

    items.push({
      id: precedent.id,
      regulatorBody: precedent.regulator,
      citation: precedent.respondent,
      title: precedent.mechanism.slice(0, 120) + (precedent.mechanism.length > 120 ? "…" : ""),
      publishedDate: precedent.noticeDate,
      applicabilityStatus: ENFORCEMENT_APPLICABILITY[precedent.id] ?? "not_assessed",
      summary: precedent.mechanism,
      precedent,
      controlCount: reach.controlIds.length,
      impactedCrsaRefs: reach.crsaRefs,
      impactedGsrIds: reach.gsrIds,
      impactedControlIds: reach.controlIds,
      impactedMechanismTags: precedent.failureMechanismTags,
      ageDays: daysSince(precedent.noticeDate, asOf),
    });
  }

  return items.sort((a, b) => b.ageDays - a.ageDays);
}

export type UnassessedStripSummary = {
  totalReaching: number;
  unassessedCount: number;
  oldestDays: number;
  items: EnforcementNoticeItem[];
};

export function unassessedNoticeSummary(
  notices: EnforcementNoticeItem[],
): UnassessedStripSummary {
  const unassessed = notices.filter((n) => n.applicabilityStatus === "not_assessed");
  const oldestDays = unassessed.length
    ? Math.max(...unassessed.map((n) => n.ageDays))
    : 0;

  return {
    totalReaching: notices.length,
    unassessedCount: unassessed.length,
    oldestDays: oldestDays || (notices[0]?.ageDays ?? 0),
    items: notices,
  };
}

/** Extract RACm / control token from a coverageGaps entityId. */
export function parseGapEntityId(entityId: string): { racmRef: string | null; controlId: string | null } {
  const parts = entityId.split("/").map((p) => p.trim());
  const racmRef = parts.find((p) => p.includes(".")) ?? null;
  const controlId = parts.find((p) => /^[A-Z]{2,}-/.test(p)) ?? null;
  return { racmRef, controlId };
}

export function gapMechanismTags(gap: CoverageGapRow): FailureMechanism[] {
  const { racmRef, controlId } = parseGapEntityId(gap.entityId);
  if (racmRef && CRSA_MECHANISM_TAGS[racmRef]) return CRSA_MECHANISM_TAGS[racmRef];
  if (racmRef && RACm_FALLBACK_MECHANISMS[racmRef]) return RACm_FALLBACK_MECHANISMS[racmRef];
  if (controlId && RACm_FALLBACK_MECHANISMS[controlId]) return RACm_FALLBACK_MECHANISMS[controlId];
  if (gap.gapType === "thin_control_coverage") return ["periodic-review-absent", "assertion-unevidenced"];
  if (gap.gapType === "evidence_completeness") return ["alert-suppression", "remediation-unevidenced"];
  return ["assertion-unevidenced"];
}

export function resolveGapPrecedent(
  gap: CoverageGapRow,
  jurisdiction: "UK" | "US" = "UK",
): Precedent | undefined {
  const { racmRef } = parseGapEntityId(gap.entityId);
  const domainId = racmRef ? crsaRefToDomainId(racmRef) : "fincrime";
  const tags = gapMechanismTags(gap);
  const matches = matchPrecedents(tags, jurisdiction, domainId);
  if (!matches.length) return undefined;
  return matches.sort((a, b) => (b.penalty ?? 0) - (a.penalty ?? 0))[0];
}

export { formatConsequence };
