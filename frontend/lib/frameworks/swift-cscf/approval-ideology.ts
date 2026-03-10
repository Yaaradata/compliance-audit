/**
 * Domain-wise approval ideology — aligns Approval Journey and Report (SWIFT CSCF).
 * Approval follows domain order A→H; report is structured by domain.
 */

import { DOMAINS } from "./domains";

/** Domain order for approval journey and report (architecture view A–H). */
export const DOMAIN_APPROVAL_ORDER = DOMAINS.map((d) => d.id);

/** Human-readable description of domain-wise approval (for UI copy if needed). */
export const APPROVAL_IDEOLOGY_DESCRIPTION =
  "Approval follows your architecture by domain (A through H). Each domain's evidence is reviewed (L1 → L2 → L3); when all domains are cleared, final attestation unlocks. The report is structured by domain to match this journey.";

export { DOMAINS } from "./domains";
