/**
 * A2 SWIFT Component Inventory — spreadsheet evidence.
 * Evidence type: Spreadsheet
 * Controls covered: 1.1(M), 1.3(M), 1.5(M), 2.4A(A), 2.8(A)
 */

export const A2_EVIDENCE_ITEM_ID = "A2";

export type A2ColumnType = "text" | "select";

export interface A2SpreadsheetColumn {
  key: string;
  label: string;
  type: A2ColumnType;
  required: boolean;
  width?: string;
  options?: string[];
}

export const A2_SPREADSHEET_COLUMNS: A2SpreadsheetColumn[] = [
  { key: "hostname", label: "Hostname", type: "text", required: true },
  { key: "ip_address", label: "IP Address", type: "text", required: true },
  { key: "os_version", label: "OS Version", type: "text", required: true },
  {
    key: "function_role",
    label: "Function/Role",
    type: "select",
    required: true,
    options: [
      "Messaging Interface",
      "Communication Interface",
      "GUI",
      "SwiftNet Link",
      "HSM",
      "Customer Connector",
      "Jump Server",
      "Dedicated Operator PC",
      "General-Purpose PC",
      "Network Device",
      "Bridging Server",
      "Other",
    ],
  },
  {
    key: "zone",
    label: "Zone",
    type: "select",
    required: true,
    options: ["Secure Zone", "Customer Zone", "DMZ", "Enterprise", "DR"],
  },
  {
    key: "environment",
    label: "Environment",
    type: "select",
    required: true,
    options: ["Production", "Test", "DR", "Backup"],
  },
  {
    key: "physical_virtual",
    label: "Physical/Virtual",
    type: "select",
    required: true,
    options: ["Physical", "Virtual", "Container", "Cloud"],
  },
  { key: "hypervisor_platform", label: "Hypervisor/Platform", type: "text", required: false },
  { key: "host_mapping", label: "VM Host", type: "text", required: false },
  {
    key: "shared_host",
    label: "Shared Host?",
    type: "select",
    required: false,
    options: ["", "No", "Yes"],
  },
  { key: "cloud_provider", label: "Cloud Provider", type: "text", required: false },
  {
    key: "cloud_service_model",
    label: "Service Model",
    type: "select",
    required: false,
    options: ["", "IaaS", "PaaS", "SaaS"],
  },
  {
    key: "third_party_managed",
    label: "Third-Party Managed?",
    type: "select",
    required: false,
    options: ["", "No", "Yes"],
  },
  { key: "vendor_name", label: "Vendor Name", type: "text", required: false },
  {
    key: "mgmt_access_type",
    label: "Mgmt Access",
    type: "select",
    required: false,
    options: ["", "On-Site", "Remote", "Both"],
  },
  { key: "bridging_role", label: "Bridging Role", type: "text", required: false },
  {
    key: "dedicated_shared",
    label: "Dedicated/Shared",
    type: "select",
    required: false,
    options: ["", "Dedicated", "Shared"],
  },
  { key: "notes", label: "Notes", type: "text", required: false },
];

export const A2_FORM_KEYS = {
  exclusion_justification: "exclusion_justification",
  co_hosting_notes: "co_hosting_notes",
  customer_zone_notes: "customer_zone_notes",
} as const;

export type A2FormKey = (typeof A2_FORM_KEYS)[keyof typeof A2_FORM_KEYS];

export const A2_FORM_LABELS: Record<A2FormKey, string> = {
  exclusion_justification: "Systems excluded from zone (with justification)",
  co_hosting_notes: "Co-hosting decisions (non-SWIFT systems in zone)",
  customer_zone_notes: "Customer connectivity zone details (A1 only)",
};

export const A2_FORM_PLACEHOLDERS: Partial<Record<A2FormKey, string>> = {
  exclusion_justification:
    "List any systems excluded from the secure zone and provide justification for each exclusion.",
  co_hosting_notes:
    "Describe any non-SWIFT systems co-hosted in the secure zone and the rationale for co-hosting.",
  customer_zone_notes:
    "Describe customer connectivity zone details if A1 architecture applies (connector placement, boundaries).",
};

/** Checklist items AI verifies against A1/A4 diagrams when evaluating A2 inventory. */
export const A2_DIAGRAM_CROSS_CHECKS: { id: string; label: string }[] = [
  { id: "1", label: "Every SWIFT component in A2 inventory appears on the A1 diagram (or A4 where applicable)." },
  { id: "2", label: "Zone assignments in A2 match the zones shown on the diagram." },
  { id: "3", label: "Hostname/IP in A2 inventory matches labels on the diagram." },
  { id: "4", label: "Bridging servers and back-office paths in A2 align with diagram paths." },
  { id: "5", label: "Customer connector components (if any) in A2 are consistent with A1 connector zone." },
  { id: "6", label: "No diagram components are missing from the A2 inventory without explanation." },
];
