import type { FieldDef } from "@/components/domain/generic-intake-form";

export const F4_EVIDENCE_ITEM_ID = "F4";

export const F4_UPLOAD_GUIDANCE = [
  { id: "1", label: "Compliance certifications per vendor (SOC2 Type II, PCI-DSS, ISO 27001, NIST CSF) with scope validation" },
  { id: "2", label: "Evidence certifications are current, valid, and cover SWIFT-related services" },
  { id: "3", label: "Gap analysis between certification scope and SWIFT requirements" },
  { id: "4", label: "Regular monitoring evidence: security review meetings, SLA performance, incident reports, audit follow-up" },
  { id: "5", label: "Connectivity provider additional comfort for hosted SWIFT components" },
  { id: "6", label: "Annual attestation or comfort letter from each critical-activity third party" },
];

export const F4_FIELDS: FieldDef[] = [
  {
    key: "compliance_certifications",
    label: "Compliance certifications held by third parties",
    type: "textarea",
    placeholder: "List each vendor and their certifications: e.g. Vendor A — SOC2 Type II (valid to Dec 2025), ISO 27001; Vendor B — PCI-DSS, NIST CSF",
    rows: 4,
  },
  {
    key: "certification_scope_coverage",
    label: "Certification scope covers SWIFT-related services",
    type: "select",
    options: [
      "All certifications explicitly cover SWIFT services in scope",
      "Most certifications cover SWIFT services",
      "Some certifications cover SWIFT services — others are general",
      "Certification scope does not mention SWIFT services",
      "No certifications held",
    ],
  },
  {
    key: "certification_validity",
    label: "Certification currency and validity status",
    type: "select",
    options: [
      "All certifications current and valid",
      "Most current — some expiring within 3 months",
      "Some expired or lapsed",
      "Most expired or not maintained",
    ],
  },
  {
    key: "cert_scope_gap_analysis",
    label: "Gaps between certification scope and SWIFT requirements",
    type: "textarea",
    placeholder: "Describe any SWIFT-specific requirements not covered by vendor certifications (e.g. OASRB controls not in SOC2 scope)",
    rows: 3,
  },
  {
    key: "monitoring_activities",
    label: "Regular monitoring activities conducted",
    type: "textarea",
    placeholder: "Describe monitoring: security review meetings (frequency, attendees), SLA performance tracking, incident report reviews, audit finding follow-up",
    rows: 4,
  },
  {
    key: "monitoring_frequency",
    label: "Frequency of ongoing vendor monitoring",
    type: "select",
    options: [
      "Monthly review meetings and quarterly deep reviews",
      "Quarterly reviews",
      "Semi-annual reviews",
      "Annual reviews only",
      "Ad hoc / no regular schedule",
    ],
  },
  {
    key: "sla_performance_tracking",
    label: "SLA performance tracking and reporting",
    type: "select",
    options: [
      "All vendors tracked with regular performance reports",
      "Most vendors tracked (>75%)",
      "Some vendors tracked",
      "No formal SLA performance tracking",
    ],
  },
  {
    key: "connectivity_provider_comfort",
    label: "Additional comfort for connectivity providers hosting SWIFT components",
    type: "select",
    options: [
      "Specific comfort obtained for all hosted components",
      "Comfort obtained for some hosted components",
      "General comfort only — no SWIFT-specific validation",
      "No additional comfort obtained",
      "Not applicable — no hosted components",
    ],
  },
  {
    key: "annual_attestation_status",
    label: "Annual attestation/comfort letter received per SWIFT OASRB",
    type: "select",
    options: [
      "Received from all critical-activity third parties",
      "Received from most (>75%)",
      "Received from some (25-75%)",
      "Not received from any vendor",
    ],
  },
  {
    key: "latest_attestation_date",
    label: "Date of most recent attestation/comfort letter received",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known gaps in ongoing monitoring or certification coverage",
    type: "textarea",
    required: false,
    placeholder: "Describe any vendors without certifications, monitoring gaps, missing attestations, or planned improvements",
    rows: 3,
  },
];
