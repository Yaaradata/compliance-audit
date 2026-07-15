/**
 * Signal-layer entities for UK Process Audit.
 * Describes tests that were supposed to run (and silence when they did not).
 */
export type {
  AdmissionPosture,
  FailureMechanism,
  PrecedentRegulator,
  UkAssertion,
  UkAuditTrailActor,
  UkClaimLine,
  UkEvidenceArtefact,
  UkExpectedOperation,
  UkPrecedent,
  UkRemediationItem,
  UkRuleConfigChange,
  UkSignal,
  UkSignalAction,
  UkSignalSeverity,
  UkSignalStatus,
} from "./types";

export type { Predicate, SanctionedCopy, CopySlots, CardCopy } from "./copy";
export { renderCardCopy, isSanctionedCopy } from "./copy";

export { assertionCoveragePct, isArmed } from "./types";
export { isUkSignalEvidenceValid, validateUkSignal } from "./validateSignal";
export {
  UK_PRECEDENTS,
  assertPrecedentsHaveAdmissionPosture,
  formatPenalty,
  matchPrecedents,
} from "./precedentCorpus";
export {
  MECHANISM_TAGS_BY_CONTROL,
  MECHANISM_TAGS_TAGGED_COUNT,
  MECHANISM_TAGS_UNTAGGED_COUNT,
  UK_CONTROL_LIBRARY_SIZE,
  tagsForControl,
} from "./mechanismTags";
export {
  CONFIRMED_CADENCE,
  SILENCE_DEP_CONTROL_ID,
  SILENCE_FC_SANCTIONS_CONTROL_ID,
  buildEvidenceArtefacts,
  buildExpectedOperations,
  parseCadence,
} from "./expectedOperations";
export { hashString, makeRng, randInt } from "./rng";
export {
  SYNTHETIC_FC_ASSERTION,
  buildDetectorSnapshot,
  detectAssertionDenominator,
  detectClosureWithoutEvidence,
  detectControlSilence,
  detectPrecedentMatch,
  runAllDetectors,
  seedCmpRemediationItems,
} from "./detectors";
export type { UkDetectorSnapshot } from "./detectors";
