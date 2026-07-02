/**
 * UK Process Audit — v2 data layer entry point.
 *
 * v2 reuses the Indian Process Audit presentation components; this module
 * exposes the UK data already shaped to their `ProcessAuditSnapshot` contract.
 */
export { getUkProcessAuditDataV2 } from "./indianSnapshot";
export { buildUkDomainIntel } from "./domainIntel";
export { getUkRccDomain } from "./riskCommandCenter";
