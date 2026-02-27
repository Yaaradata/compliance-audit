/**
 * A1 Network Architecture Diagram — structured evidence prompts.
 * Separates what should be visible in the uploaded diagram vs what must be confirmed in text.
 */

export const A1_EVIDENCE_ITEM_ID = "A1";

export const A1_DIAGRAM_DERIVED_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Secure zone boundary and all ingress/egress points are clearly labelled." },
  { id: "2", label: "Firewall placement is shown at every boundary crossing." },
  { id: "3", label: "All SWIFT systems are visible in-zone with identifiable names (and IP where available)." },
  { id: "4", label: "Data-flow direction arrows are present and protocols are annotated." },
  { id: "5", label: "Customer connector boundary/zone is shown (A1-specific) or explicitly marked as not applicable." },
  { id: "6", label: "Back-office connection paths are shown from secure zone components." },
  { id: "7", label: "No direct internet path exists from secure zone components (or exception is explicitly justified)." },
  { id: "8", label: "Diagram is current for the assessment period (dated within 12 months)." },
];

export const A1_FORM_KEYS = {
  diagram_date: "diagram_date",
  protocol_encryption_notes: "protocol_encryption_notes",
  internet_exposure_confirmation: "internet_exposure_confirmation",
  internet_exposure_justification: "internet_exposure_justification",
  connector_zone_statement: "connector_zone_statement",
  backoffice_path_summary: "backoffice_path_summary",
  known_gaps_and_plan: "known_gaps_and_plan",
} as const;

export type A1FormKey = (typeof A1_FORM_KEYS)[keyof typeof A1_FORM_KEYS];

export const A1_FORM_LABELS: Record<A1FormKey, string> = {
  diagram_date: "Diagram version/date used for assessment",
  protocol_encryption_notes: "Protocol/encryption clarifications (if not fully visible on diagram)",
  internet_exposure_confirmation: "Any direct internet path from secure zone?",
  internet_exposure_justification: "If yes, provide business/technical justification and compensating controls",
  connector_zone_statement: "Customer connector zone statement (A1-specific)",
  backoffice_path_summary: "Back-office connectivity summary",
  known_gaps_and_plan: "Known documentation gaps and remediation plan",
};

export const A1_FORM_PLACEHOLDERS: Partial<Record<A1FormKey, string>> = {
  diagram_date: "YYYY-MM-DD",
  protocol_encryption_notes:
    "List critical flows and protocol/security detail if labels are abbreviated on the diagram (e.g. SNL over TLS 1.2, MQ over TLS, API via reverse proxy).",
  internet_exposure_justification:
    "If any internet path exists, explain why, identify affected systems, and list compensating controls and timeline.",
  connector_zone_statement:
    "Describe connector placement/boundary and segregation controls, or state why connector zone is not applicable.",
  backoffice_path_summary:
    "Summarize secure-zone to back-office paths, first-hop controls, and any bridging/transfer servers.",
  known_gaps_and_plan:
    "Document missing labels/details in the diagram and when updated evidence will be provided.",
};
