/**
 * Indian Process Audit — data layer entry point.
 *
 * Components and app routes must load mock/derived audit data only through this module.
 */
import { buildProcessAuditSnapshot, type ProcessAuditSnapshot } from './assembleSnapshot';

let cachedSnapshot: ProcessAuditSnapshot | null = null;

/** Singleton snapshot built from lib mock data (controls, SOPs, cases, overview metrics). */
export function getProcessAuditData(): ProcessAuditSnapshot {
  if (!cachedSnapshot) {
    cachedSnapshot = buildProcessAuditSnapshot();
  }
  return cachedSnapshot;
}

export type { ProcessAuditSnapshot } from './assembleSnapshot';
export * from './types';
