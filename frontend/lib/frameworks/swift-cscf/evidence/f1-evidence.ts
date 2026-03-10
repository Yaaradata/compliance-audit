import type { FieldDef } from "@/components/domain/generic-intake-form";

export const F1_EVIDENCE_ITEM_ID = "F1";

export const F1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Complete inventory/register of ALL third parties managing SWIFT components or activities" },
  { id: "2", label: "Vendor details: name, services provided, SWIFT components managed (cross-referenced with A2 architecture)" },
  { id: "3", label: "Contract dates and service type classification (IT outsourcing, managed services, cloud hosting, connectivity)" },
  { id: "4", label: "Critical activity classification per vendor (security/change mgmt, RMA, sensitive user data, event monitoring, etc.)" },
  { id: "5", label: "Outsourcing agent vs connectivity provider distinction for each third party" },
  { id: "6", label: "Remote vs on-site access designation and equipment ownership (own vs user's equipment)" },
];

export const F1_FIELDS: FieldDef[] = [
  {
    key: "total_third_parties",
    label: "Total number of third parties managing SWIFT components/activities",
    type: "text",
    placeholder: "e.g. 7",
  },
  {
    key: "vendor_list_completeness",
    label: "Completeness of third-party inventory against A2 architecture",
    type: "select",
    options: [
      "All third parties identified and mapped to A2 components",
      "Most third parties identified (>75%)",
      "Some third parties identified (25-75%)",
      "Few identified (<25%)",
      "No inventory exists",
    ],
  },
  {
    key: "service_type_breakdown",
    label: "Service type classification breakdown",
    type: "textarea",
    placeholder: "e.g. 2 IT outsourcing agents, 1 managed services provider, 1 cloud hosting provider, 3 connectivity providers",
    rows: 3,
  },
  {
    key: "critical_activity_classifications",
    label: "Critical activity classifications covered",
    type: "textarea",
    placeholder: "List which critical activities are outsourced: security/change mgmt, RMA/business transactions, sensitive user data handling, event monitoring, network mgmt, transaction operations, security admin, ancillary services",
    rows: 4,
  },
  {
    key: "outsourcing_agent_vs_connectivity",
    label: "Outsourcing agent vs connectivity provider distinction documented",
    type: "select",
    options: [
      "All vendors clearly classified as outsourcing agent or connectivity provider",
      "Most vendors classified",
      "Classification incomplete",
      "Not distinguished",
    ],
  },
  {
    key: "access_type_coverage",
    label: "Remote vs on-site access documented per vendor",
    type: "select",
    options: [
      "All vendors have access type documented",
      "Most vendors documented (>75%)",
      "Some vendors documented (25-75%)",
      "Not documented",
    ],
  },
  {
    key: "equipment_ownership",
    label: "Equipment ownership designation (vendor's own vs user's equipment)",
    type: "select",
    options: [
      "Documented for all vendors",
      "Documented for most vendors",
      "Documented for some vendors",
      "Not documented",
    ],
  },
  {
    key: "swift_component_mapping",
    label: "SWIFT components managed per vendor (matching A2 architecture)",
    type: "textarea",
    placeholder: "List each vendor and the specific SWIFT components they manage, cross-referenced with A2 architecture diagram",
    rows: 4,
  },
  {
    key: "contract_date_coverage",
    label: "Contract dates (start/end) documented for all vendors",
    type: "select",
    options: [
      "All vendors have current contract dates recorded",
      "Most vendors (>75%) have dates recorded",
      "Some vendors (25-75%) have dates recorded",
      "Few or no contract dates recorded",
    ],
  },
  {
    key: "last_inventory_review_date",
    label: "Date of last inventory review/update",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps or missing vendor information",
    type: "textarea",
    required: false,
    placeholder: "Describe any vendors not yet catalogued, missing classifications, or planned inventory improvements",
    rows: 3,
  },
];
