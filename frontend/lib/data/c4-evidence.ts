import type { FieldDef } from "@/components/domain/generic-intake-form";

export const C4_EVIDENCE_ITEM_ID = "C4";

export const C4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Role definitions for ALL in-scope SWIFT applications and systems" },
  { id: "2", label: "Messaging interface roles defined (operator, security officer, app admin)" },
  { id: "3", label: "Communication interface, GUI, and connector roles defined" },
  { id: "4", label: "OS, network device, and HSM roles defined" },
  { id: "5", label: "Per role: permissions, access scope, and data access level" },
  { id: "6", label: "Separation of duties enforced (submit≠approve, app admin≠security officer)" },
  { id: "7", label: "Four-eyes principle applied for sensitive operations" },
  { id: "8", label: "Conflicting role combinations documented and prohibited" },
  { id: "9", label: "Vendor/third-party role separation guidance" },
];

export const C4_FIELDS: FieldDef[] = [
  {
    key: "total_roles_defined",
    label: "Total number of RBAC roles defined",
    type: "text",
    placeholder: "e.g. 24",
  },
  {
    key: "role_definition_date",
    label: "Date role definitions were last updated",
    type: "date",
  },
  {
    key: "systems_covered",
    label: "Systems/applications with role definitions",
    type: "textarea",
    placeholder: "List all in-scope systems: messaging interface, communication interface, GUI, connectors, OS, network, HSM, etc.",
    rows: 3,
  },
  {
    key: "messaging_interface_roles",
    label: "Messaging interface roles (operator, security officer, app admin)",
    type: "select",
    options: [
      "All roles defined with permissions",
      "Some roles defined",
      "Not defined",
    ],
  },
  {
    key: "comm_gui_connector_roles",
    label: "Communication interface, GUI, and connector roles",
    type: "select",
    options: [
      "All defined with permissions",
      "Some defined",
      "Not defined",
      "Not applicable",
    ],
  },
  {
    key: "os_network_hsm_roles",
    label: "OS, network device, and HSM role definitions",
    type: "select",
    options: [
      "All defined with permissions",
      "Some defined",
      "Not defined",
    ],
  },
  {
    key: "permission_detail_level",
    label: "Per role detail: permissions, access scope, and data access level",
    type: "select",
    options: [
      "Fully documented for all roles",
      "Documented for most roles",
      "Minimal documentation",
      "Not documented",
    ],
  },
  {
    key: "sod_enforcement",
    label: "Separation of duties enforcement (submit≠approve, app admin≠security officer)",
    type: "select",
    options: [
      "Fully enforced — all conflicts prevented",
      "Mostly enforced with documented exceptions",
      "Partially enforced",
      "Not enforced",
    ],
  },
  {
    key: "four_eyes_operations",
    label: "Four-eyes principle for sensitive operations",
    type: "select",
    options: [
      "Enforced for all sensitive operations",
      "Enforced for some sensitive operations",
      "Not enforced",
    ],
  },
  {
    key: "conflicting_roles_documented",
    label: "Conflicting role combinations identified and prohibited",
    type: "select",
    options: [
      "Fully documented and technically enforced",
      "Documented but manually enforced",
      "Partially documented",
      "Not documented",
    ],
  },
  {
    key: "vendor_role_separation",
    label: "Vendor/third-party role separation guidance",
    type: "select",
    options: [
      "Documented and applied",
      "Documented but not consistently applied",
      "Not documented",
      "Not applicable",
    ],
  },
  {
    key: "role_review_frequency",
    label: "Role definition review frequency",
    type: "select",
    options: ["Quarterly", "Semi-annually", "Annually", "Ad hoc", "Not scheduled"],
  },
  {
    key: "known_gaps",
    label: "Known gaps and remediation plan",
    type: "textarea",
    required: false,
    placeholder: "Describe any missing role definitions, SoD conflicts, or planned improvements",
    rows: 3,
  },
];
