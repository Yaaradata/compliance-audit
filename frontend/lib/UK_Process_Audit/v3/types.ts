import type { UkAuditControl, UkProcessAuditDomainId, UkProcessAuditSnapshot } from "../types";

/** Fixed as-of date for the demo cycle — ISO so cadence math is subtractable. */
export const UKPA_V3_AS_OF = "2026-06-30";

export type AdmissionPosture =
  | "settled-no-admission"
  | "criminal-conviction"
  | "guilty-plea"
  | "admitted"
  | "contested";

/**
 * Permitted signal predicates only.
 * Do not use enforcement-style prose predicates in claim text.
 */
export type SignalPredicate =
  | "SIGNAL_FIRED"
  | "EVIDENCE_GAP_OBSERVED"
  | "PRECEDENT_MATCHED"
  | "HUMAN_REVIEW_REQUIRED";

export type ClaimOrigin = "RULE" | "LLM";

/**
 * Cadence arming state.
 * UNARMED = no confirmed cadence (unknown ≠ failed). Never paint as FAILING.
 */
export type CadenceStatus = "ARMED" | "UNARMED" | "OVERDUE" | "DUE_SOON" | "CURRENT";

export interface UkEvidenceRef {
  controlId: string;
  evidenceType: string;
  sourceSystem: string;
  packHint: string;
}

export interface UkEnforcementPrecedent {
  id: string;
  firm: string;
  regulator: string;
  /** ISO date of the public notice / judgment. */
  date: string;
  amountGbp: number;
  /** Non-nullable — a precedent without posture must not render. */
  admissionPosture: AdmissionPosture;
  summary: string;
  sourceUrl: string;
  matchedDomainIds: UkProcessAuditDomainId[];
  matchedThemes: string[];
}

export interface UkCadenceEvaluation {
  controlId: string;
  domainId: UkProcessAuditDomainId;
  frequencyRaw: string;
  /** null when frequency cannot be evaluated → UNARMED. */
  cadenceDays: number | null;
  /** ISO date of last test; null when UNARMED. */
  lastTestedAt: string | null;
  asOf: string;
  daysSinceTest: number | null;
  status: CadenceStatus;
  /** Synthetic demo field — always true for derived cadence. */
  synthetic: true;
}

export interface UkPopulationCoverageCheck {
  controlId: string;
  domainId: UkProcessAuditDomainId;
  /** Claimed coverage in the synthesised management statement (0–100). */
  claimedCoveragePct: number;
  /** Observed coverage from population math (0–100). */
  observedCoveragePct: number;
  population: number;
  covered: number;
  gap: number;
  claimText: string;
  synthetic: true;
  predicate: "EVIDENCE_GAP_OBSERVED" | null;
}

export interface UkAuditClaim {
  id: string;
  origin: ClaimOrigin;
  predicate: SignalPredicate;
  headline: string;
  detail: string;
  /** Required — a claim without evidence must fail to compile at the call site. */
  evidence: UkEvidenceRef;
  domainId: UkProcessAuditDomainId;
  controlId: string | null;
  precedentId: string | null;
}

export interface UkCadenceRollup {
  total: number;
  armed: number;
  unarmed: number;
  overdue: number;
  dueSoon: number;
  current: number;
}

export interface UkProcessAuditV3Snapshot {
  /** Base snapshot (controls, SOP, cases) — unchanged contract. */
  base: UkProcessAuditSnapshot;
  asOf: string;
  cadenceByControlId: Record<string, UkCadenceEvaluation>;
  cadenceRollup: UkCadenceRollup;
  cadenceByDomain: Record<UkProcessAuditDomainId, UkCadenceRollup>;
  populationChecks: UkPopulationCoverageCheck[];
  precedents: UkEnforcementPrecedent[];
  claims: UkAuditClaim[];
  /** Controls projected with cadence for the v3 register. */
  controlsWithCadence: Array<UkAuditControl & { cadence: UkCadenceEvaluation }>;
}
