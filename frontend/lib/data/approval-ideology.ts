/**
 * Domain-wise approval ideology — aligns Approval Journey and Report.
 *
 * Ideology:
 * - Approval follows the architecture view: Domain A → B → C → D → E → F → G → H.
 * - For each domain: evidence must be submitted, then L1 (Completeness) → L2 (Quality) → L3 (Assessment).
 * - A domain is "approved" when all its evidence items have passed L1/L2/L3.
 * - When all domains are approved, Final attestation (senior sign-off) is available.
 * - The Report is structured by domain: one section per domain (A–H) plus Executive Summary,
 *   Gap Analysis, Evidence Index, and optional Glossary — so report content mirrors the approval journey.
 */

import { DOMAINS } from "./domains";

/** Domain order for approval journey and report (architecture view A–H). */
export const DOMAIN_APPROVAL_ORDER = DOMAINS.map((d) => d.id);

/** Human-readable description of domain-wise approval (for UI copy if needed). */
export const APPROVAL_IDEOLOGY_DESCRIPTION =
  "Approval follows your architecture by domain (A through H). Each domain’s evidence is reviewed (L1 → L2 → L3); when all domains are cleared, final attestation unlocks. The report is structured by domain to match this journey.";

export { DOMAINS };
