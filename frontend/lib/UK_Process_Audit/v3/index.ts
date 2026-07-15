/**
 * UK Process Audit — v3 data layer.
 *
 * Adds cadence evaluation, population-claim checks, real enforcement precedents,
 * and evidence-bound RULE/LLM claims. Does not alter v1/v2 behaviour.
 */
export { assembleUkProcessAuditV3Snapshot } from "./assemble";
export { evaluateCadence, evaluateAllCadence, parseCadenceDays } from "./cadence";
export { buildAuditClaims, claimsForDomain } from "./claims";
export { evaluatePopulationClaim, evaluatePopulationClaims } from "./populationClaims";
export { UK_ENFORCEMENT_PRECEDENTS, renderablePrecedents } from "./precedents";
export { UKPA_V3_AS_OF } from "./types";
export { buildUkLiveIntel } from "./liveIntel";
export type {
  EvidenceAgeCell,
  EvidenceAgeKind,
  MissingEvidenceSection,
  UkLiveIntel,
} from "./liveIntel";
export { getUkSignalInvestigation, listUkSignalIds } from "./signalLookup";
export type { UkSignalInvestigationBundle } from "./signalLookup";
export { buildHeartbeatGrid } from "./heartbeatGrid";
export type {
  HeartbeatCell,
  HeartbeatCellState,
  HeartbeatGrid,
} from "./heartbeatGrid";
export {
  applyDisposition,
  bucketSignalsForInbox,
  mergeSignalDispositions,
} from "./dispositionStore";
export { canDisposition } from "./persona";
export type { UkpaV3Persona } from "./persona";

export type {
  AdmissionPosture,
  CadenceStatus,
  ClaimOrigin,
  SignalPredicate,
  UkAuditClaim,
  UkCadenceEvaluation,
  UkCadenceRollup,
  UkEnforcementPrecedent,
  UkEvidenceRef,
  UkPopulationCoverageCheck,
  UkProcessAuditV3Snapshot,
} from "./types";

import { assembleUkProcessAuditV3Snapshot } from "./assemble";
import type { UkProcessAuditV3Snapshot } from "./types";

export function getUkProcessAuditDataV3(): UkProcessAuditV3Snapshot {
  return assembleUkProcessAuditV3Snapshot();
}
