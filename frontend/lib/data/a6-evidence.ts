/**
 * A6 Secure Zone Design Rationale — structured evidence prompts.
 * Evidence type: Document
 * Controls covered: 1.1(M), 1.5(M)
 */

export const A6_EVIDENCE_ITEM_ID = "A6";

export const A6_DOCUMENT_GUIDANCE: { id: string; label: string }[] = [
  { id: "1", label: "Written rationale for WHY specific zone boundaries were drawn at those points" },
  { id: "2", label: "Reference to SWIFT Security Guidance and/or CSCF Appendix B reference architectures" },
  { id: "3", label: "Justification for zone scope: why certain systems are included/excluded" },
  { id: "4", label: "Explanation of segmentation approach chosen" },
  { id: "5", label: "Authentication zone separation rationale" },
  { id: "6", label: "Risk assessment for shared components/services crossing zone boundary" },
  { id: "7", label: "Co-hosting decisions documentation" },
  { id: "8", label: "Customer connector zone design rationale (A1 only)" },
  { id: "9", label: "Equivalent protection justification for customer zone" },
  { id: "10", label: "Customer zone segmentation justification and risk assessment" },
];

export const A6_FORM_KEYS = {
  zone_boundary_rationale: "zone_boundary_rationale",
  swift_guidance_reference: "swift_guidance_reference",
  segmentation_approach: "segmentation_approach",
  auth_separation_rationale: "auth_separation_rationale",
  shared_component_risk: "shared_component_risk",
  co_hosting_justification: "co_hosting_justification",
  customer_zone_rationale: "customer_zone_rationale",
  customer_zone_equivalence: "customer_zone_equivalence",
} as const;

export type A6FormKey = (typeof A6_FORM_KEYS)[keyof typeof A6_FORM_KEYS];

export const A6_FORM_LABELS: Record<A6FormKey, string> = {
  zone_boundary_rationale: "Why were zone boundaries drawn at these specific points?",
  swift_guidance_reference: "SWIFT Security Guidance references",
  segmentation_approach: "Segmentation approach",
  auth_separation_rationale: "Authentication zone separation rationale",
  shared_component_risk: "Shared components/services risk assessment",
  co_hosting_justification: "Co-hosting decisions",
  customer_zone_rationale: "Customer connector zone design rationale (A1 only)",
  customer_zone_equivalence: "Customer zone equivalent protection justification (A1 only)",
};

export const A6_FORM_PLACEHOLDERS: Partial<Record<A6FormKey, string>> = {
  zone_boundary_rationale:
    "Explain the rationale for your secure zone boundary placement, referencing network topology and risk considerations.",
  swift_guidance_reference:
    "List specific SWIFT Security Guidance sections, CSCF Appendix B reference architectures, or other standards referenced in your design.",
  auth_separation_rationale:
    "Explain why separate AD/LDAP is used (or not) for the SWIFT zone. Document any shared authentication with risk assessment.",
  shared_component_risk:
    "Document any shared components crossing zone boundaries with risk assessment and compensating controls.",
  co_hosting_justification:
    "If any non-SWIFT systems exist in the secure zone, provide justification for each.",
  customer_zone_rationale:
    "Explain customer connector zone design choices, protection equivalence, and segmentation from main SWIFT zone.",
  customer_zone_equivalence:
    "Explain how customer zone achieves equivalent protection to the main secure zone.",
};
