/**
 * Every evidenceRef that v5 ClaimLines / change rows can surface.
 * Keep in sync when adding a new ClaimLine — the resolve test is the guarantee.
 */
import { ATTESTATION_DENOMINATOR_SEEDS, SIGNED_WITHOUT_PACK } from "./crsaAttestation";
import { CADENCE_FEASIBILITY_CHECKS, MLRO_SCREENING_CLAIMS } from "./mlroSignals";
import { PRECEDENTS } from "./precedentCorpus";
import { DOMAIN_EVIDENCE, CRSA_MECHANISM_TAGS } from "./riskDomainsV5";
import { RSS_COMPONENT_EVIDENCE } from "./smcrEvidence";
import { WHAT_CHANGED_V5 } from "./whatChangedV5";
import { DERIVATION_STATIC_IDS } from "./derivations";

export function collectV5EvidenceRefs(): string[] {
  const refs = new Set<string>();

  for (const row of WHAT_CHANGED_V5) refs.add(row.evidenceRef);

  for (const e of DOMAIN_EVIDENCE) {
    if (e.artefactId) refs.add(e.artefactId);
  }
  for (const e of RSS_COMPONENT_EVIDENCE) refs.add(e.evidenceRef);

  for (const id of DERIVATION_STATIC_IDS) refs.add(id);

  for (const racm of Object.keys(ATTESTATION_DENOMINATOR_SEEDS)) {
    refs.add(`LLM-CLAIM-${racm}`);
    refs.add(`RULE-DENOM-${racm}`);
  }
  for (const pack of SIGNED_WITHOUT_PACK) refs.add(`PACK-${pack.lineId}`);
  for (const check of CADENCE_FEASIBILITY_CHECKS) refs.add(`CADENCE-${check.controlId}`);
  for (const claim of MLRO_SCREENING_CLAIMS) refs.add(`SCR-CLAIM-${claim.id.toUpperCase()}`);

  refs.add("APPETITE-BREACH-FINCRIME");
  refs.add("DISP-REASON-META");
  refs.add("ENF-NOTICE-QUEUE");
  refs.add("PREC-NATIONWIDE-2025");
  refs.add("PREC-STARLING-2024");
  refs.add("PREC-NATWEST-2021");
  refs.add("PREC-CORPUS-CLOSED");
  refs.add("PREC-AWARENESS-POP");
  refs.add("ATT-MLRO-2026-Q2");
  refs.add("ISS-2026-009");

  for (const p of PRECEDENTS) {
    if (p.jurisdiction === "UK") refs.add(`PREC-${p.id}`);
  }
  for (const ref of Object.keys(CRSA_MECHANISM_TAGS)) refs.add(ref);

  // Filled RSS components point at real EV-* graph evidence.
  for (const e of RSS_COMPONENT_EVIDENCE) {
    if (e.artefactId) refs.add(e.artefactId);
  }

  return [...refs].sort();
}
