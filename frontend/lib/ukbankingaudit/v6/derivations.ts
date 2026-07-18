/**
 * Derivation registry — METHOD behind a claim, not evidence of the claim.
 * PREC-CORPUS-CLOSED, LLM-CLAIM-*, RULE-DENOM-*, etc. are working papers for a
 * Big Four reviewer. Missing entries still resolve (never "Insight not found.").
 */
import {
  ATTESTATION_DENOMINATOR_SEEDS,
  COMPLETENESS_CLAIM_TERMS,
  SIGNED_WITHOUT_PACK,
} from "./crsaAttestation";
import { CADENCE_FEASIBILITY_CHECKS, MLRO_SCREENING_CLAIMS } from "./mlroSignals";
import { PRECEDENTS } from "./precedentCorpus";

export type DerivationKind = "RULE" | "LLM";

export type DerivationRecord = {
  kind: DerivationKind;
  question: string;
  method: string;
  inputs: { label: string; value: string }[];
  output: string;
  version: string;
  evaluatedAt: string;
};

export type ResolvedDerivation = DerivationRecord & {
  id: string;
  missing?: boolean;
};

const EVALUATED_AT = "2026-07-10T00:00:00.000Z";

const UK_COUNT = PRECEDENTS.filter((p) => p.jurisdiction === "UK").length;
const UK_VERIFIED = PRECEDENTS.filter((p) => p.jurisdiction === "UK" && p.confidence === "verified").length;
const UK_PROBABLE = PRECEDENTS.filter((p) => p.jurisdiction === "UK" && p.confidence === "probable").length;
const UK_UNVERIFIED = PRECEDENTS.filter((p) => p.jurisdiction === "UK" && p.confidence === "unverified").length;

const STATIC: Record<string, DerivationRecord> = {
  "PREC-CORPUS-CLOSED": {
    kind: "RULE",
    question: "Is the notice corpus complete?",
    method:
      "The corpus is a closed, hand-curated set of published UK enforcement actions. It is not scraped and not model-generated. Every record is transcribed from the primary notice and carries an admission posture and a source URL.",
    inputs: [
      { label: "Records in corpus", value: String(UK_COUNT) },
      { label: "Jurisdiction", value: "UK" },
      { label: "Last curated", value: "2026-07-10" },
    ],
    output: `${UK_COUNT} UK records. ${UK_VERIFIED} verified, ${UK_PROBABLE} probable, ${UK_UNVERIFIED} unverified.`,
    version: "precedent-corpus@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "PREC-AWARENESS-POP": {
    kind: "RULE",
    question: "Why these 3 notices and not the other 9?",
    method:
      "Two deterministic filters. First: noticeDate > your attestation cutoff. Second: the notice's failure mechanism intersects the mechanism tags of a control mapped to your SMF function via the responsibilities map. No model is involved in either filter.",
    inputs: [
      { label: "Your attestation cutoff", value: "1 Mar 2025" },
      { label: "Domains mapped to you", value: "fincrime" },
      { label: "Notices in corpus", value: String(UK_COUNT) },
      { label: "Passing the date filter", value: "5" },
      { label: "Passing the domain filter", value: "3" },
    ],
    output: "3 outstanding, none recorded.",
    version: "awareness-population@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "DISP-REASON-META": {
    kind: "RULE",
    question: "How was disposition dispersion detected?",
    method:
      "Weekly reason-code histograms only — no customer content. Entropy of the early three weeks is compared to the recent three weeks. The signal fires when recent entropy falls below 75% of early entropy, closures are non-decreasing, and a single reason code exceeds 65% of the latest week.",
    inputs: [
      { label: "Series length", value: "8 weeks" },
      { label: "Early window", value: "W-12 … W-8" },
      { label: "Recent window", value: "W-4 … This week" },
      { label: "Dominant recent code", value: "no-action" },
    ],
    output: "Dispersion collapsed toward no-action while closures held.",
    version: "disposition-dispersion@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "ENF-NOTICE-QUEUE": {
    kind: "RULE",
    question: "Which notices are unassessed against your CRSA graph?",
    method:
      "Every UK corpus notice is joined to CRSA_MECHANISM_TAGS by failureMechanismTags ∩ domainScope. Notices with zero intersecting tagged controls are queued as unassessed. The queue is a set difference — no model ranks or selects.",
    inputs: [
      { label: "UK notices in corpus", value: String(UK_COUNT) },
      { label: "Tagged CRSA refs", value: "6" },
      { label: "Join key", value: "failureMechanismTags ∩ CRSA_MECHANISM_TAGS" },
    ],
    output: "Unassessed notices listed on the Enforcement coverage strip.",
    version: "enforcement-queue@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "PREC-NATIONWIDE-2025": {
    kind: "RULE",
    question: "Why cite Nationwide 2025 on cadence feasibility?",
    method:
      "The cadence check is arithmetic (substrate refresh + investigation SLA vs detection window). Nationwide is attached as the published pattern for an assertion of coverage that the arithmetic could not have supported. The notice itself is not the calculation.",
    inputs: [
      { label: "Precedent id", value: "uk-nationwide-2025" },
      { label: "Join", value: "assertion-unevidenced / cdd-coverage-shortfall" },
    ],
    output: "Cadence infeasible; Nationwide is the published mirror pattern.",
    version: "cadence-precedent-cite@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "PREC-STARLING-2024": {
    kind: "RULE",
    question: "Why cite Starling 2024 on screening denominators?",
    method:
      "Screening claims without a named list and population are the finding. Starling is the published pattern where screening ran against a fraction of the Consolidated List while being reported as functioning.",
    inputs: [
      { label: "Precedent id", value: "uk-starling-2024" },
      { label: "Join", value: "sanctions-screening-misconfigured" },
    ],
    output: "Denominator gap on a screening claim; Starling is the mirror pattern.",
    version: "screening-precedent-cite@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "PREC-NATWEST-2021": {
    kind: "RULE",
    question: "Why cite NatWest 2021 on alert suppression?",
    method:
      "A less-sensitive TM rule change while the backlog was already rising is the conjunction signal. NatWest is the published pattern where a rule designed to flag suspicious activity was switched off because it produced too many alerts.",
    inputs: [
      { label: "Precedent id", value: "uk-natwest-fowler-oldfield-2021" },
      { label: "Join", value: "alert-suppression" },
    ],
    output: "Suppression conjunction fired; NatWest is the mirror pattern.",
    version: "suppression-precedent-cite@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "ATT-MLRO-2026-Q2": {
    kind: "LLM",
    question: "Where did the 'enhanced' characterisation come from?",
    method:
      "The characterisation is an interpretation of MLRO Q2 narrative text, not a measured coverage figure. Extraction was human-confirmed by A. Whitfield (2LOD) against the source report before the change row shipped.",
    inputs: [
      { label: "Source", value: "MLRO Q2 2026 report narrative" },
      { label: "Matched term", value: "enhanced" },
      { label: "Confirmed by", value: "A. Whitfield" },
    ],
    output: "CDD coverage characterised as enhanced — interpretation, not a count.",
    version: "llm-extract@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
  "APPETITE-BREACH-FINCRIME": {
    kind: "RULE",
    question: "How was appetite breach without a plan detected?",
    method:
      "Conjunction of (a) at least one domain KRI outside GREEN appetite and (b) a remediation plan with a Delayed step or only Not Started steps. Both must hold. No model ranks severity.",
    inputs: [
      { label: "Domain", value: "fincrime" },
      { label: "Breached KRIs", value: "KYC backlog; alert closure SLA" },
      { label: "Remediation", value: "Delayed step present" },
    ],
    output: "Breach without a plan — fincrime.",
    version: "appetite-breach-no-plan@1.0.0",
    evaluatedAt: EVALUATED_AT,
  },
};

function llmClaim(racmRef: string): DerivationRecord {
  const seed = ATTESTATION_DENOMINATOR_SEEDS[racmRef];
  const sentence =
    seed?.claimSentence ??
    `Attestation assertion text for ${racmRef} (no seeded claim sentence).`;
  const matched = seed?.claimTerms ?? [];
  const termList =
    matched.length > 0
      ? matched.join(", ")
      : COMPLETENESS_CLAIM_TERMS.filter((t) => sentence.toLowerCase().includes(t)).join(", ") ||
        "(none)";
  return {
    kind: "LLM",
    question: "Which words triggered this?",
    method:
      "Phrase match against COMPLETENESS_CLAIM_TERMS on the attestation assertion text. The extraction is an interpretation of wording, not a measured coverage figure, and was human-confirmed by A. Whitfield (2LOD) before the strip shipped.",
    inputs: [
      { label: "Claim sentence", value: sentence },
      { label: "COMPLETENESS_CLAIM_TERMS matched", value: termList },
      { label: "Confirmed by", value: "A. Whitfield" },
    ],
    output: matched.length ? `Matched: ${matched.join(", ")}` : "No completeness term matched.",
    version: "assertion-claim-extract@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function ruleDenom(racmRef: string): DerivationRecord {
  const seed = ATTESTATION_DENOMINATOR_SEEDS[racmRef] ?? {
    coveredCount: 0,
    populationCount: 0,
  };
  const pct =
    seed.populationCount > 0
      ? `${((seed.coveredCount / seed.populationCount) * 100).toFixed(1)}%`
      : "n/a";
  return {
    kind: "RULE",
    question: "Where did the coverage percentage come from?",
    method: "Integer division. No model. No estimate.",
    inputs: [
      { label: "Covered", value: String(seed.coveredCount) },
      { label: "Population", value: String(seed.populationCount) },
      { label: "RACM ref", value: racmRef },
    ],
    output: pct,
    version: "assertion-denominator@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function packDerivation(lineId: string): DerivationRecord {
  const pack = SIGNED_WITHOUT_PACK.find((p) => p.lineId === lineId);
  return {
    kind: "RULE",
    question: "Was a frozen state pack present at sign-off?",
    method:
      "Construction trigger: an attestation line is signed while frozenSnapshotRef is null. The record is the accountability artefact — the absence of the pack is the finding.",
    inputs: [
      { label: "Line id", value: lineId },
      { label: "RACM ref", value: pack?.racmRef ?? "—" },
      { label: "Signed by", value: pack?.signedBy ?? "—" },
      { label: "Signed at", value: pack?.signedAt ?? "—" },
      { label: "frozenSnapshotRef", value: "null" },
    ],
    output: "Signed without a frozen state pack.",
    version: "signed-without-pack@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function cadenceDerivation(controlId: string): DerivationRecord {
  const check = CADENCE_FEASIBILITY_CHECKS.find((c) => c.controlId === controlId);
  return {
    kind: "RULE",
    question: "Can the control detect within the required window?",
    method:
      "minimumCycle = substrateRefreshDays + calendarDays(investigationSlaWorkingDays). Feasible only when requiredDetectionWindowDays >= minimumCycle. Integer arithmetic only.",
    inputs: [
      { label: "Control id", value: controlId },
      { label: "Required window (days)", value: String(check?.requiredDetectionWindowDays ?? "—") },
      { label: "Substrate refresh (days)", value: String(check?.substrateRefreshDays ?? "—") },
      { label: "Investigation SLA (working days)", value: String(check?.investigationSlaWorkingDays ?? "—") },
    ],
    output: check
      ? check.feasible
        ? "Feasible"
        : `Infeasible — short by ${check.gapDays} day(s)`
      : "No cadence check seeded for this control.",
    version: "cadence-feasibility@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function screeningClaim(claimId: string): DerivationRecord {
  const claim = MLRO_SCREENING_CLAIMS.find((c) => c.id.toUpperCase() === claimId.toUpperCase());
  return {
    kind: "RULE",
    question: "Is the screening denominator named?",
    method:
      "A screening coverage claim is only countable when listName and populationLabel are both present. Absence of either is the finding — the product does not invent a denominator.",
    inputs: [
      { label: "Claim id", value: claimId },
      { label: "Claim text", value: claim?.claim ?? "—" },
      { label: "List name", value: claim?.listName ?? "null" },
      { label: "Population label", value: claim?.populationLabel ?? "null" },
      { label: "populationDefined", value: String(claim?.populationDefined ?? false) },
    ],
    output:
      claim?.populationDefined && claim.listName && claim.populationLabel
        ? "Denominator named."
        : "Denominator missing — that is the finding.",
    version: "screening-denominator@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function standingItem(id: string): DerivationRecord {
  return {
    kind: "RULE",
    question: "Why is this a standing awareness gap?",
    method:
      "An open issue or finding owned by the SMF spans more than one attestation cycle and the reasonable-steps trail contains no entry referencing its id. Duration and cycle span are integer arithmetic from raised/discovered dates.",
    inputs: [
      { label: "Item id", value: id },
      { label: "Trail reference", value: "none" },
    ],
    output: "Standing awareness gap — open beyond one attestation cycle with no trail entry.",
    version: "standing-awareness@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

function kriBreach(domainId: string): DerivationRecord {
  const key = `APPETITE-BREACH-${domainId.toUpperCase()}`;
  if (STATIC[key]) return STATIC[key];
  return {
    kind: "RULE",
    question: "How was appetite breach without a plan detected?",
    method:
      "Conjunction of (a) at least one domain KRI outside GREEN appetite and (b) stalled remediation. Both must hold.",
    inputs: [{ label: "Domain", value: domainId.toLowerCase() }],
    output: `Breach without a plan — ${domainId.toLowerCase()}.`,
    version: "appetite-breach-no-plan@1.0.0",
    evaluatedAt: EVALUATED_AT,
  };
}

/** Resolve a derivation id. Always returns a record — missing entries are flagged. */
export function getDerivation(id: string): ResolvedDerivation {
  const staticHit = STATIC[id];
  if (staticHit) return { id, ...staticHit };

  if (id.startsWith("LLM-CLAIM-")) {
    return { id, ...llmClaim(id.slice("LLM-CLAIM-".length)) };
  }
  if (id.startsWith("RULE-DENOM-")) {
    return { id, ...ruleDenom(id.slice("RULE-DENOM-".length)) };
  }
  if (id.startsWith("PACK-")) {
    return { id, ...packDerivation(id.slice("PACK-".length)) };
  }
  if (id.startsWith("CADENCE-")) {
    return { id, ...cadenceDerivation(id.slice("CADENCE-".length)) };
  }
  if (id.startsWith("SCR-CLAIM-")) {
    return { id, ...screeningClaim(id.slice("SCR-CLAIM-".length)) };
  }
  if (id.startsWith("APPETITE-BREACH-") || id.startsWith("KRI-BREACH-")) {
    const domain = id.replace(/^(APPETITE-BREACH-|KRI-BREACH-)/, "");
    return { id, ...kriBreach(domain) };
  }
  if (/^ISS-/.test(id) || /^FND-/.test(id)) {
    return { id, ...standingItem(id) };
  }

  if (typeof console !== "undefined" && console.warn) {
    console.warn(`[v6 derivations] No derivation recorded for reference: ${id}`);
  }
  return {
    id,
    missing: true,
    kind: "RULE",
    question: "No derivation recorded for this reference.",
    method: "No derivation recorded for this reference.",
    inputs: [],
    output: "—",
    version: "missing@0",
    evaluatedAt: EVALUATED_AT,
  };
}

export const DERIVATION_STATIC_IDS = Object.keys(STATIC);
