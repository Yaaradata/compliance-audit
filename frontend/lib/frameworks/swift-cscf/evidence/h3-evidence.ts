import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H3_EVIDENCE_ITEM_ID = "H3";

export const H3_UPLOAD_GUIDANCE = [
  { id: "1", label: "SWIFT ISAC subscription/registration confirmation" },
  { id: "2", label: "Evidence of ISAC bulletin and threat intelligence receipt" },
  { id: "3", label: "Internal distribution process for ISAC intelligence" },
  { id: "4", label: "Evidence of acting on ISAC recommendations (e.g. applied patches, updated rules)" },
  { id: "5", label: "Integration of ISAC intelligence with IR plan" },
  { id: "6", label: "Mandatory incident reporting to SWIFT for SWIFT-related cyber incidents" },
];

export const H3_FIELDS: FieldDef[] = [
  {
    key: "isac_subscription_status",
    label: "SWIFT ISAC subscription/registration status",
    type: "select",
    options: [
      "Active subscription — confirmed registered",
      "Registration pending",
      "Previously registered — lapsed",
      "Not registered",
    ],
  },
  {
    key: "bulletin_receipt_confirmation",
    label: "ISAC bulletins and threat intelligence received",
    type: "select",
    options: [
      "Regularly received and logged",
      "Received but not formally tracked",
      "Intermittently received",
      "Not receiving ISAC communications",
    ],
  },
  {
    key: "internal_distribution_process",
    label: "Internal distribution process for ISAC intelligence",
    type: "textarea",
    placeholder: "Describe how ISAC bulletins are distributed internally: who receives them (security team, operations, management), distribution method (email, ticketing system, meetings), and timeliness of distribution",
    rows: 3,
  },
  {
    key: "acting_on_recommendations",
    label: "Evidence of acting on ISAC recommendations",
    type: "select",
    options: [
      "All relevant recommendations assessed and actioned with tracking",
      "Most recommendations actioned — some pending",
      "Ad hoc response — no formal tracking",
      "Recommendations received but not actioned",
    ],
  },
  {
    key: "recommendation_action_examples",
    label: "Examples of actions taken on ISAC recommendations",
    type: "textarea",
    placeholder: "Provide specific examples: e.g. applied emergency patch per ISAC-2024-xxx, updated firewall rules per threat advisory, conducted targeted awareness after phishing alert",
    rows: 3,
  },
  {
    key: "ir_plan_integration",
    label: "ISAC intelligence integrated with IR plan",
    type: "select",
    options: [
      "Formally integrated — ISAC feeds into threat assessment and IR procedures",
      "Referenced in IR plan but no formal integration process",
      "No integration with IR plan",
    ],
  },
  {
    key: "mandatory_incident_reporting",
    label: "Mandatory incident reporting to SWIFT documented and understood",
    type: "select",
    options: [
      "Process documented with clear triggers, channels, and timelines",
      "Process understood but not formally documented",
      "Awareness exists but process unclear",
      "Not documented or understood",
    ],
  },
  {
    key: "incidents_reported_to_swift",
    label: "SWIFT-related cyber incidents reported to SWIFT (last 24 months)",
    type: "text",
    placeholder: "e.g. 0 incidents, or 1 incident reported on [date]",
  },
  {
    key: "known_gaps",
    label: "Known gaps in ISAC participation or incident reporting",
    type: "textarea",
    required: false,
    placeholder: "Describe any subscription issues, distribution delays, unactioned recommendations, or planned improvements",
    rows: 3,
  },
];
