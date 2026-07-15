/**
 * v3 persona — second-line (CCO) vs third-line (Internal Audit).
 * Internal Audit must not disposition second-line signals.
 */
export type UkpaV3Persona = "chief-compliance-officer" | "internal-audit";

export const UKPA_V3_PERSONA_LABEL: Record<UkpaV3Persona, string> = {
  "chief-compliance-officer": "Chief Compliance Officer",
  "internal-audit": "Internal Audit",
};

/** Disposition is a second-line act. Third line observes only. */
export function canDisposition(persona: UkpaV3Persona): boolean {
  return persona === "chief-compliance-officer";
}

export const INTERNAL_AUDIT_ASSURANCE =
  "Internal Audit assures controls; it does not operate or disposition second-line signals.";
