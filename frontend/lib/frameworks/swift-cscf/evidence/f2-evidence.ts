import type { FieldDef } from "@/components/domain/generic-intake-form";

export const F2_EVIDENCE_ITEM_ID = "F2";

export const F2_UPLOAD_GUIDANCE = [
  { id: "1", label: "SLA agreements with EVERY third party performing critical SWIFT activities" },
  { id: "2", label: "Minimum security requirements (standard of care) defined in each SLA" },
  { id: "3", label: "Service levels: incident response times, patching SLAs, availability targets, change management procedures" },
  { id: "4", label: "Right-to-audit and compliance evidence clauses in contracts" },
  { id: "5", label: "Breach notification obligations and timelines" },
  { id: "6", label: "NDAs covering SWIFT sensitive data for all relevant third parties" },
  { id: "7", label: "Connectivity provider SLAs specifically for hosted SWIFT components" },
  { id: "8", label: "Agreement review schedule and coverage summary (% with SLA, % with NDA, gaps)" },
];

export const F2_FIELDS: FieldDef[] = [
  {
    key: "sla_coverage_rate",
    label: "Percentage of critical-activity third parties with SLAs in place",
    type: "select",
    options: [
      "100% — all critical-activity vendors have SLAs",
      "75-99% — most vendors covered",
      "50-74% — majority covered",
      "25-49% — some covered",
      "<25% — few or none covered",
    ],
  },
  {
    key: "nda_coverage_rate",
    label: "Percentage of third parties with NDAs covering SWIFT sensitive data",
    type: "select",
    options: [
      "100% — all relevant vendors have NDAs",
      "75-99% — most vendors covered",
      "50-74% — majority covered",
      "25-49% — some covered",
      "<25% — few or none covered",
    ],
  },
  {
    key: "minimum_security_requirements",
    label: "Standard of care / minimum security requirements in SLAs",
    type: "textarea",
    placeholder: "Describe the minimum security standards required of vendors (e.g. encryption, access controls, vulnerability management, security certifications)",
    rows: 3,
  },
  {
    key: "service_level_terms",
    label: "Key service level terms documented",
    type: "textarea",
    placeholder: "Summarise incident response SLAs, patching timelines, availability targets (e.g. 99.9%), and change management procedures across vendors",
    rows: 4,
  },
  {
    key: "right_to_audit",
    label: "Right-to-audit / compliance evidence clause included",
    type: "select",
    options: [
      "Included in all vendor agreements",
      "Included in most agreements (>75%)",
      "Included in some agreements",
      "Not included in any agreement",
    ],
  },
  {
    key: "breach_notification",
    label: "Breach notification obligation and timeline",
    type: "select",
    options: [
      "Defined in all agreements with specific timelines (e.g. 24-72 hours)",
      "Defined in most agreements",
      "Defined in some agreements without clear timelines",
      "Not defined in agreements",
    ],
  },
  {
    key: "connectivity_provider_sla",
    label: "Connectivity provider SLAs for hosted SWIFT components",
    type: "select",
    options: [
      "Specific SLAs in place for all hosted components",
      "SLAs cover some hosted components",
      "General SLA only — no SWIFT-specific terms",
      "No connectivity provider SLAs",
      "Not applicable — no hosted components",
    ],
  },
  {
    key: "agreement_review_period",
    label: "Agreement review/renewal cycle",
    type: "select",
    options: [
      "Annually",
      "Every 2 years",
      "At contract renewal only",
      "Ad hoc / no defined cycle",
    ],
  },
  {
    key: "coverage_summary",
    label: "Coverage summary and gap analysis",
    type: "textarea",
    placeholder: "e.g. 5/6 vendors have SLAs (83%), 6/6 have NDAs (100%), 1 vendor pending SLA negotiation — expected completion Q2",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known gaps or remediation plans",
    type: "textarea",
    required: false,
    placeholder: "Describe any vendors missing SLAs/NDAs, weak contract terms, or planned improvements",
    rows: 3,
  },
];
