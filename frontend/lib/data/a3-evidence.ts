/**
 * A3 Data Flow Diagrams — structured evidence prompts.
 * Evidence type: Diagram. Controls: 2.1(M), 2.4A(A), 2.5A(A)
 * Separates what AI verifies from uploaded diagram vs what must be confirmed in text.
 */

export const A3_EVIDENCE_ITEM_ID = "A3";

export const A3_DIAGRAM_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "All inter-component data flows shown with source, destination, direction" },
  {
    id: "2",
    label:
      "Specific flows: Local RMA↔messaging, GUI↔messaging, GUI↔communication, messaging↔communication",
  },
  { id: "3", label: "Protocol per flow annotated (LAU+TLS, two-way TLS, etc.)" },
  { id: "4", label: "Zone boundary crossings highlighted" },
  { id: "5", label: "Cross-environment flows (on-prem to cloud) explicitly marked" },
  {
    id: "6",
    label: "Back-office to secure zone flows with bridging servers in path",
  },
  { id: "7", label: "Direct vs indirect flow classification present" },
  {
    id: "8",
    label: "Security method per leg/segment documented (end-to-end or per-leg TLS)",
  },
  {
    id: "9",
    label:
      "External transmission paths shown (backup, replication, data extraction, cross-DC)",
  },
  { id: "10", label: "Encryption method annotated per external path" },
  {
    id: "11",
    label: "SAN/NAS and cloud storage paths with encryption requirements",
  },
];

export const A3_FORM_KEYS = {
  flow_inventory_notes: "flow_inventory_notes",
  unprotected_legacy_flows: "unprotected_legacy_flows",
  hsm_flow_details: "hsm_flow_details",
  encryption_method_summary: "encryption_method_summary",
  cross_environment_details: "cross_environment_details",
  known_gaps: "known_gaps",
} as const;

export type A3FormKey = (typeof A3_FORM_KEYS)[keyof typeof A3_FORM_KEYS];

export const A3_FORM_LABELS: Record<A3FormKey, string> = {
  flow_inventory_notes: "Data flow inventory clarifications",
  unprotected_legacy_flows: "Unprotected/legacy flows and risk status",
  hsm_flow_details: "HSM connection flow details",
  encryption_method_summary: "Encryption method summary per flow type",
  cross_environment_details: "Cross-environment flow details",
  known_gaps: "Known documentation gaps and remediation plan",
};

export const A3_FORM_PLACEHOLDERS: Record<A3FormKey, string> = {
  flow_inventory_notes:
    "List any flows not fully visible on the diagram, or clarify abbreviated annotations (e.g. 'MQ flow from SAA to SIL uses TLS 1.2 with mutual auth').",
  unprotected_legacy_flows:
    "Identify any legacy flows without end-to-end protection. Note risk assessment status and planned remediation timeline.",
  hsm_flow_details:
    "Describe HSM flows if not fully shown on diagram (connections to messaging interface, key management paths).",
  encryption_method_summary:
    "Summarize encryption methods: e.g. Internal flows: LAU+TLS 1.2; Back-office: per-leg TLS; External: AES-256 at rest, TLS 1.2 in transit.",
  cross_environment_details:
    "Describe any on-prem to cloud flows, cross-datacenter flows, or hybrid environment paths.",
  known_gaps:
    "Document any missing flow details and when updated evidence will be provided.",
};
