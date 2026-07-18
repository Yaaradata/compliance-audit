import { CRSA_MECHANISM_TAGS } from "./riskDomainsV6";
import { PRECEDENTS } from "./precedentCorpus";
import { DOMAIN_ACCOUNTABILITY } from "./riskDomainsV6";
import type { Precedent } from "./types";

export type SmcrTrailEvent = {
  timestamp: string;
  eventType: string;
  label: string;
  evidenceId: string | null;
  precedentId?: string;
};

export type PrecedentAwarenessRow = {
  precedent: Precedent;
  matchedRef: string;
  matchedRefKind: "crsa" | "control";
  evidenceRef: string;
};

/**
 * v6-only attestation cutoff for the closed Final Notice population.
 * Mock lastAttestationDate values are recent (7–45 days); this floor keeps the
 * CRO demo population countable without editing mockDataV2.
 */
export const SMCR_AWARENESS_ATTESTATION_FLOOR: Record<string, string> = {
  "SMF4-MARK-X": "2025-01-01",
  "SMF17-PRIYA-PATEL": "2025-03-01",
};

function domainsForSmf(smfFunction: string, smfId: string): string[] {
  if (smfFunction === "SMF4") {
    return Object.keys(DOMAIN_ACCOUNTABILITY);
  }
  return Object.entries(DOMAIN_ACCOUNTABILITY)
    .filter(([, acc]) => "smf" in acc && acc.smf === smfFunction)
    .map(([domainId]) => domainId);
}

function bestCrsaRef(precedent: Precedent): string | null {
  const wanted = new Set(precedent.failureMechanismTags);
  let best: string | null = null;
  let bestOverlap = 0;
  for (const [ref, tags] of Object.entries(CRSA_MECHANISM_TAGS)) {
    const overlap = tags.filter((t) => wanted.has(t)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = ref;
    }
  }
  return best;
}

function matchRef(
  precedent: Precedent,
  accountableControlIds: string[],
  ownedDomains: Set<string>,
): { ref: string; kind: "crsa" | "control" } | null {
  const crsa = bestCrsaRef(precedent);
  if (crsa) return { ref: crsa, kind: "crsa" };
  if (accountableControlIds.length > 0) {
    return { ref: accountableControlIds[0], kind: "control" };
  }
  const domain = precedent.domainScope.find((d) => ownedDomains.has(d));
  if (domain) return { ref: domain, kind: "control" };
  return null;
}

export function attestationCutoffForSmf(smfId: string, lastAttestationDate: string): string {
  const floor = SMCR_AWARENESS_ATTESTATION_FLOOR[smfId];
  if (!floor) return lastAttestationDate;
  // v6 demo: when mock lastAttestation is recent, extend the closed population back to floor.
  return floor < lastAttestationDate ? floor : lastAttestationDate;
}

export function precedentsSinceAttestation(input: {
  smfId: string;
  smfFunction: string;
  lastAttestationDate: string;
  accountableControlIds: string[];
  jurisdiction?: "UK" | "US";
}): PrecedentAwarenessRow[] {
  const cutoff = attestationCutoffForSmf(input.smfId, input.lastAttestationDate);
  const domains = new Set(domainsForSmf(input.smfFunction, input.smfId));
  const jurisdiction = input.jurisdiction ?? "UK";

  const rows: PrecedentAwarenessRow[] = [];
  for (const precedent of PRECEDENTS) {
    if (precedent.jurisdiction !== jurisdiction) continue;
    if (precedent.noticeDate <= cutoff) continue;
    if (precedent.admissionPosture === "open-investigation") continue;
    if (!precedent.domainScope.some((d) => domains.has(d))) continue;

    const matched = matchRef(precedent, input.accountableControlIds, domains);
    if (!matched) continue;

    rows.push({
      precedent,
      matchedRef: matched.ref,
      matchedRefKind: matched.kind,
      evidenceRef: `PREC-${precedent.id}`,
    });
  }

  return rows.sort((a, b) => b.precedent.noticeDate.localeCompare(a.precedent.noticeDate));
}

export function isPrecedentAcknowledged(
  precedentId: string,
  trail: SmcrTrailEvent[],
): boolean {
  return trail.some(
    (t) =>
      t.eventType === "awareness" &&
      (t.precedentId === precedentId ||
        t.label.includes(precedentId) ||
        t.evidenceId === `PREC-${precedentId}`),
  );
}

export function unacknowledgedPrecedentRows(
  rows: PrecedentAwarenessRow[],
  trail: SmcrTrailEvent[],
): PrecedentAwarenessRow[] {
  return rows.filter((r) => !isPrecedentAcknowledged(r.precedent.id, trail));
}
