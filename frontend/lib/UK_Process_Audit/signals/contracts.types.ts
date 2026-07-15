/**
 * Re-exports used only by contracts.test-types.ts so actor shapes stay local
 * to the signals package without pulling v3 UI into the type graph incorrectly.
 */
export type { UkAuditTrailActor, UkPrecedent, UkRemediationItem, UkRuleConfigChange } from "./types";

/** Disposition actor shape — { actorId } only; never scored. */
export type UkSignalDispositionActor = {
  actorId: string;
};
