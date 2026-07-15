/**
 * UK Process Audit — data layer entry point.
 *
 * Real control library is sourced from the embedded CSV (uk_bank_operational_controls.csv);
 * audit-test metrics are derived deterministically. Components load data only through here.
 */
import { assembleUkProcessAuditSnapshot } from "./assembleSnapshot";
import type { UkProcessAuditSnapshot } from "./types";

export function getUkProcessAuditData(): UkProcessAuditSnapshot {
  return assembleUkProcessAuditSnapshot();
}

export { buildUkEvidence } from "./buildEvidence";

/** v3 entry — cadence, precedents, evidence-bound claims. Does not alter v1/v2. */
export { getUkProcessAuditDataV3 } from "./v3";
export type {
  AdmissionPosture,
  CadenceStatus,
  ClaimOrigin,
  SignalPredicate,
  UkAuditClaim,
  UkCadenceEvaluation,
  UkEnforcementPrecedent,
  UkEvidenceRef,
  UkPopulationCoverageCheck,
  UkProcessAuditV3Snapshot,
} from "./v3";

export type {
  UkAuditControl,
  UkAutomationLevel,
  UkCaseOverall,
  UkCaseTrailItem,
  UkControlNature,
  UkControlResult,
  UkControlSource,
  UkControlStatus,
  UkDomainAuditCard,
  UkDomainEntity,
  UkDomainSop,
  UkEvidencePack,
  UkJourneyCase,
  UkProcessAuditDomainDef,
  UkProcessAuditDomainId,
  UkProcessAuditOverview,
  UkProcessAuditSnapshot,
  UkProcessAuditTabId,
  UkResidualRisk,
  UkSopStageDef,
  UkSopStep,
  UkStageOwner,
  UkSubmitter,
  UkTrailStatus,
} from "./types";
