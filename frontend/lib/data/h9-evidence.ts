import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H9_EVIDENCE_ITEM_ID = "H9";

export const H9_UPLOAD_GUIDANCE = [
  { id: "1", label: "Scenario-based risk assessment covering SWIFT-specific threats and attack scenarios" },
  { id: "2", label: "Risk framework identification (CIS, ISO 27005, NIST RMF) and methodology documentation" },
  { id: "3", label: "Threat scenarios: end-user impersonation, message tampering, eavesdropping, third-party software weaknesses, system compromise, DoS" },
  { id: "4", label: "Existing preventive/detective controls mapped per scenario with residual risk" },
  { id: "5", label: "Risk register with all risks, status, owner, and treatment" },
  { id: "6", label: "Risk mitigation plan and update cycle documentation" },
  { id: "7", label: "Scope: people, processes, infrastructure, cloud/third-party risk" },
];

export const H9_FIELDS: FieldDef[] = [
  {
    key: "framework_used",
    label: "Risk assessment framework",
    type: "select",
    options: [
      "ISO 27005 (Information Security Risk Management)",
      "NIST RMF (Risk Management Framework)",
      "CIS RAM (Center for Internet Security Risk Assessment Method)",
      "Custom framework aligned with industry standards",
      "No formal framework identified",
    ],
  },
  {
    key: "assessment_scope",
    label: "Risk assessment scope",
    type: "select",
    options: [
      "Comprehensive: people, processes, infrastructure, and cloud/third-party",
      "People, processes, and infrastructure — cloud/third-party not included",
      "Infrastructure and technology only",
      "Limited scope",
    ],
  },
  {
    key: "threat_scenarios_covered",
    label: "SWIFT-specific threat scenarios assessed",
    type: "textarea",
    placeholder: "List scenarios assessed: end-user impersonation, message tampering, eavesdropping, third-party software weaknesses, system compromise, denial-of-service, fraudulent message injection — note any scenarios not covered",
    rows: 4,
  },
  {
    key: "swift_attack_scenarios",
    label: "SWIFT-specific attack scenarios included",
    type: "select",
    options: [
      "All major SWIFT attack scenarios modelled (operator compromise, message fraud, infrastructure attack)",
      "Most SWIFT-specific scenarios included",
      "Some SWIFT-specific scenarios — mostly generic threats",
      "No SWIFT-specific attack scenarios",
    ],
  },
  {
    key: "controls_mapped_per_scenario",
    label: "Existing preventive/detective controls mapped per scenario",
    type: "select",
    options: [
      "All scenarios have controls mapped — both preventive and detective",
      "Most scenarios have controls mapped",
      "Some scenarios have controls mapped",
      "Controls not mapped to scenarios",
    ],
  },
  {
    key: "residual_risk_assessment",
    label: "Residual risk assessed per scenario",
    type: "select",
    options: [
      "Residual risk quantified/rated for all scenarios after controls",
      "Residual risk assessed for most scenarios",
      "Residual risk assessed for critical scenarios only",
      "Residual risk not assessed",
    ],
  },
  {
    key: "risk_mitigation_plan",
    label: "Risk mitigation plan for identified risks",
    type: "textarea",
    placeholder: "Describe mitigation approach: treatment options (accept, mitigate, transfer, avoid), priority actions, responsible owners, target completion dates, budget allocation",
    rows: 4,
  },
  {
    key: "risk_register_maintained",
    label: "Risk register maintained and current",
    type: "select",
    options: [
      "Complete register: all risks with status, owner, treatment, and review dates",
      "Register maintained but missing some fields (owner or treatment)",
      "Partial register — not all risks captured",
      "No risk register maintained",
    ],
  },
  {
    key: "risk_register_details",
    label: "Risk register content overview",
    type: "textarea",
    placeholder: "Summarise register: total risks tracked, breakdown by criticality (Critical/High/Medium/Low), number with active mitigation plans, number accepted, number closed",
    rows: 3,
  },
  {
    key: "cloud_third_party_risk",
    label: "Cloud and third-party risk included in assessment",
    type: "select",
    options: [
      "Dedicated section covering cloud provider and third-party risks",
      "Cloud/third-party risks mentioned within broader assessment",
      "Not specifically addressed",
      "Not applicable — no cloud or third-party dependency",
    ],
  },
  {
    key: "reporting_criticality_isrm",
    label: "Results reported per criticality and ISRM",
    type: "select",
    options: [
      "Reported to senior management with criticality breakdown per ISRM",
      "Reported to management without formal ISRM alignment",
      "Internal team reporting only",
      "Results not formally reported",
    ],
  },
  {
    key: "update_cycle",
    label: "Risk assessment update cycle",
    type: "select",
    options: [
      "Updated after significant changes and at defined intervals (annually)",
      "Updated annually at minimum",
      "Updated ad hoc after incidents or major changes only",
      "No defined update cycle",
    ],
  },
  {
    key: "last_assessment_date",
    label: "Date of last risk assessment",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps in risk assessment or register",
    type: "textarea",
    required: false,
    placeholder: "Describe any unassessed scenarios, register gaps, outdated entries, or planned assessment improvements",
    rows: 3,
  },
];
