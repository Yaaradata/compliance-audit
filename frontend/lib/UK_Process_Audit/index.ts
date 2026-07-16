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
