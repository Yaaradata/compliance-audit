import type { UkProcessAuditDomainId } from "../types";
import type { Predicate, SanctionedCopy } from "./copy";

/**
 * Closed set of failure mechanisms. Exactly these members — no others.
 */
export type FailureMechanism =
  | "periodic-review-absent"
  | "tm-scope-gap"
  | "tm-ingestion-gap"
  | "alert-suppression"
  | "cdd-coverage-shortfall"
  | "assertion-unevidenced"
  | "restriction-breach"
  | "procedure-defeats-duty"
  | "remediation-unevidenced"
  | "redress-population-incomplete"
  | "sanctions-screening-misconfigured"
  | "risk-tolerated-past-expiry"
  | "post-lift-drift"
  | "disposition-quality";

/**
 * What was supposed to run in a period.
 * ARMED only when cadenceSource === "human-confirmed".
 * Unarmed controls must never produce a silence signal.
 * evidenceArtefactIds === [] means SILENCE (when armed).
 */
export interface UkExpectedOperation {
  controlId: string;
  /** ISO */
  periodStart: string;
  /** ISO = periodStart + cadence */
  expectedBy: string;
  graceDays: number;
  /** Empty array === SILENCE */
  evidenceArtefactIds: string[];
  cadenceSource: "register" | "policy-extracted" | "human-confirmed";
  confirmedBy: string | null;
  confirmedAt: string | null;
}

/**
 * Evidence artefact with a real ISO timestamp.
 * Do NOT reuse UkAuditControl.lastTested (that is a display label).
 * Derive artefact timestamps deterministically from controlId.
 */
export interface UkEvidenceArtefact {
  id: string;
  controlId: string;
  /** ISO timestamp */
  ts: string;
  type: string;
  sourceSystem: string;
  sha256: string;
  label: string;
}

/**
 * Signed management assertion. coveragePct is DERIVED — never stored.
 * Use {@link assertionCoveragePct}.
 */
export interface UkAssertion {
  id: string;
  text: string;
  claimTerms: string[];
  populationDefinition: string;
  populationCount: number;
  coveredCount: number;
  signedBy: string;
  signedAt: string;
  controlIds: string[];
}

/** Derived coverage percentage — never persisted on UkAssertion. */
export function assertionCoveragePct(assertion: UkAssertion): number {
  if (assertion.populationCount <= 0) return 0;
  return (assertion.coveredCount / assertion.populationCount) * 100;
}

export type PrecedentRegulator = "FCA" | "PRA" | "PSR" | "FOS" | "UpperTribunal" | "CrownCourt";

export type AdmissionPosture =
  | "admitted"
  | "settled-no-admission"
  | "alleged"
  | "criminal-conviction"
  | "guilty-plea"
  | "undertaking-only"
  | "tribunal-varied"
  | "open-investigation";

/**
 * Real public enforcement precedent.
 * admissionPosture is REQUIRED — no default, no optional.
 */
export interface UkPrecedent {
  id: string;
  regulator: PrecedentRegulator;
  noticeDate: string;
  respondent: string;
  /** null for restriction-only actions */
  penalty: number | null;
  penaltyPreDiscount: number | null;
  tribunalReducedTo: number | null;
  instrument: string[];
  admissionPosture: AdmissionPosture;
  failureMechanismTags: FailureMechanism[];
  sourceUrl: string;
  confidence: "verified" | "probable" | "unverified";
}

export interface UkRuleConfigChange {
  ruleId: string;
  controlId: string;
  ts: string;
  diff: string;
  direction: "more-sensitive" | "less-sensitive" | "neutral";
  approver: string;
  rationale: string | null;
  alertBacklogAtChange: number;
}

export type UkSignalAction =
  | "ACCEPT"
  | "REJECT"
  | "ESCALATE"
  | "OVERRIDE"
  | "OPEN_EVIDENCE"
  | "OPEN_INVESTIGATION";

export type UkSignalSeverity = "S1" | "S2" | "S3";

export type UkSignalStatus = "DETECTED_SIGNAL" | "ACCEPTED_EXCEPTION" | "CONFIRMED_ISSUE";

/**
 * Unified output of every detector.
 * evidenceRefs MAY be empty — that is the finding.
 * missingEvidence MUST be populated when evidenceRefs is empty.
 */
export interface UkSignal {
  id: string;
  mechanism: FailureMechanism;
  severity: UkSignalSeverity;
  status: UkSignalStatus;
  controlId: string;
  domainCode: UkProcessAuditDomainId;
  /** Closed set — card face copy is rendered only from this. */
  predicate: Predicate;
  /** One clause — must come from {@link renderCardCopy}. */
  signalObserved: SanctionedCopy;
  /** One sentence — must come from {@link renderCardCopy}. */
  soWhat: SanctionedCopy;
  primaryMetric: { value: number | string; label: string };
  /** Rendered literally, left column */
  expected: string;
  /** Rendered literally, right column */
  observed: string;
  /** Artefact ids. MAY be empty — that is the finding. */
  evidenceRefs: string[];
  /** MUST be populated when evidenceRefs is empty. */
  missingEvidence: string[];
  precedentId: string | null;
  derivation: "RULE" | "LLM";
  confidence: { level: "high" | "medium" | "low"; basis: string };
  /** e.g. "silence-rule@1.0.0" */
  detectionVersion: string;
  evaluatedAt: string;
  /** From control.controlOwnerRole */
  owner: string;
  /** Authored per detector, NOT generated */
  alternativeExplanation: string;
  humanActions: UkSignalAction[];
  /**
   * Optional split claims (e.g. precedent-match: LLM extraction + RULE match).
   * Two ClaimLines, two dots — the product's credibility distinction.
   */
  claimLines?: UkClaimLine[];
}

/** One visual claim line — RULE (computation) vs LLM (interpretation). */
export interface UkClaimLine {
  derivation: "RULE" | "LLM";
  text: string;
}

/**
 * Audit-trail actor — appears as a named party on a disposition or closure.
 * Never a subject of a rating: there is no `score` field.
 */
export type UkAuditTrailActor = {
  actorId: string;
  displayName?: string;
};

/** Remediation / management-action item (CMP closure detector). */
export interface UkRemediationItem {
  id: string;
  text: string;
  raisedAt: string;
  cycleDue: string;
  status: "open" | "closed";
  closedBy: string | null;
  closedAt: string | null;
  evidenceArtefactIds: string[];
  /** Synthetic flag: closedBy is a known leaver. */
  closedByIsLeaver?: boolean;
  domainCode: UkProcessAuditDomainId;
}

/** True when the control's expected operation is armed for silence detection. */
export function isArmed(op: UkExpectedOperation): boolean {
  return op.cadenceSource === "human-confirmed";
}
