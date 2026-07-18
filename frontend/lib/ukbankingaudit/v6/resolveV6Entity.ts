/**
 * Resolve v6 drawer entities by kind. Used by UKBankingControlTrace.resolveEntity
 * and by the evidence-ref regression test — keep them in lockstep.
 */
import { CRSA_DATA, CRSA_MECHANISM_TAGS, DOMAIN_EVIDENCE } from "./riskDomainsV6";
import { getDerivation, type ResolvedDerivation } from "./derivations";
import { getPrecedentById, PRECEDENTS, formatConsequence } from "./precedentCorpus";
import type { Precedent, StatusEvidence } from "./types";
import { RSS_COMPONENT_EVIDENCE } from "./smcrEvidence";
import type { V6RefKind } from "./refRouter";

export type CrsaRefEntity = {
  ref: string;
  objective: string;
  requirement: string;
  status: string;
  failureMechanismTags: string[];
  matchedPrecedents: Precedent[];
};

/** Synthetic status-evidence rows for hollow RSS assertion refs (EVID-RSS-*). */
const RSS_STATUS_EVIDENCE: StatusEvidence[] = RSS_COMPONENT_EVIDENCE.filter(
  (e) => e.artefactId == null && e.evidenceRef.startsWith("EVID-"),
).map((e) => ({
  domainId: "fincrime",
  subCategory: `RSS · ${e.componentKey}`,
  artefactId: e.evidenceRef,
  artefactTs: null,
  expectedCadenceDays: e.expectedCadenceDays,
  cadenceSource: e.cadenceSource,
  sourceSystem: "SMCR-RSS-assertion",
  sha256: undefined,
  confirmedBy: undefined,
  confirmedAt: undefined,
}));

export function getV6Precedent(id: string): Precedent | undefined {
  if (!id) return undefined;
  const stripped = id.startsWith("PREC-") ? id.slice("PREC-".length) : id;
  const hit = getPrecedentById(stripped) ?? getPrecedentById(id);
  if (!hit) return undefined;
  // Drawer must not render without admissionPosture (enforced on the type; runtime guard).
  if (!hit.admissionPosture) return undefined;
  return hit;
}

export function getStatusEvidenceByArtefactId(id: string): StatusEvidence | undefined {
  const fromDomain = DOMAIN_EVIDENCE.find((e) => e.artefactId === id);
  if (fromDomain) return fromDomain;
  return RSS_STATUS_EVIDENCE.find((e) => e.artefactId === id);
}

export function getCrsaRefEntity(ref: string): CrsaRefEntity | null {
  let found: { ref: string; objective: string; requirement: string; status: string } | undefined;
  for (const domain of Object.values(CRSA_DATA)) {
    const row = domain.find((c) => c.ref === ref);
    if (row) {
      found = row;
      break;
    }
  }
  if (!found) return null;
  const tags = CRSA_MECHANISM_TAGS[ref] ?? [];
  const tagSet = new Set(tags);
  const matchedPrecedents = PRECEDENTS.filter((p) =>
    p.failureMechanismTags.some((t) => tagSet.has(t)),
  );
  return {
    ref: found.ref,
    objective: found.objective,
    requirement: found.requirement,
    status: found.status,
    failureMechanismTags: tags,
    matchedPrecedents,
  };
}

export type ResolveV6Deps = {
  getEvidence?: (id: string) => unknown | null;
  getKRI?: (id: string) => unknown | null;
  getControl?: (id: string) => unknown | null;
};

/**
 * Returns a non-null entity when the kind/id pair can be shown in a drawer.
 * Derivation always resolves (missing entries still open the derivation drawer).
 */
export function resolveV6Entity(
  kind: V6RefKind | string,
  id: string,
  deps: ResolveV6Deps = {},
): unknown | null {
  if (!kind || !id) return null;
  switch (kind) {
    case "precedent":
      return getV6Precedent(id) ?? null;
    case "derivation":
      return getDerivation(id);
    case "statusEvidence":
      return getStatusEvidenceByArtefactId(id) ?? null;
    case "crsaRef":
      return getCrsaRefEntity(id);
    case "evidence":
      return deps.getEvidence?.(id) ?? null;
    case "kri":
      return deps.getKRI?.(id) ?? null;
    case "control":
      return deps.getControl?.(id) ?? null;
    default:
      return null;
  }
}

/** Controls matching a precedent's failureMechanismTags (for the precedent drawer). */
export function crsaControlsMatchingPrecedent(p: Precedent): CrsaRefEntity[] {
  const wanted = new Set(p.failureMechanismTags);
  const out: CrsaRefEntity[] = [];
  for (const ref of Object.keys(CRSA_MECHANISM_TAGS)) {
    const tags = CRSA_MECHANISM_TAGS[ref] ?? [];
    if (!tags.some((t) => wanted.has(t))) continue;
    const entity = getCrsaRefEntity(ref);
    if (entity) out.push(entity);
  }
  return out;
}

export { formatConsequence };
export type { ResolvedDerivation };
