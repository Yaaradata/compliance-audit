import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H1_EVIDENCE_ITEM_ID = "H1";

export const H1_UPLOAD_GUIDANCE = [
  { id: "1", label: "Documented Cyber Incident Response Plan with version history showing annual updates" },
  { id: "2", label: "Up-to-date contact list: internal stakeholders, third parties, connectivity providers, regulators, law enforcement" },
  { id: "3", label: "Escalation timers and severity classification matrix" },
  { id: "4", label: "Alignment with SWIFT Cyber Security Incident Recovery roadmap (Bulletin #10047)" },
  { id: "5", label: "Steps: internal notification, external notification, containment/isolation, forensic evidence preservation, safe recovery" },
  { id: "6", label: "Mandatory SWIFT incident reporting procedures" },
  { id: "7", label: "Backup and recovery plan covering all critical business lines" },
  { id: "8", label: "Plan revision history demonstrating annual update cycle" },
];

export const H1_FIELDS: FieldDef[] = [
  {
    key: "plan_version_date",
    label: "IR plan version/approval date",
    type: "date",
  },
  {
    key: "plan_owner",
    label: "IR plan owner/responsible party",
    type: "text",
    placeholder: "e.g. CISO, Head of IT Security, Incident Response Manager",
  },
  {
    key: "annual_update_status",
    label: "Plan updated at least annually",
    type: "select",
    options: [
      "Updated within the last 12 months with documented revision history",
      "Updated within 12-18 months",
      "Updated more than 18 months ago",
      "No revision history available",
    ],
  },
  {
    key: "contact_list_coverage",
    label: "Contact list completeness and currency",
    type: "select",
    options: [
      "Complete and current: internal teams, third parties, connectivity providers, regulators, law enforcement",
      "Mostly complete — some external contacts missing",
      "Internal contacts only — external contacts not listed",
      "Contact list outdated or missing",
    ],
  },
  {
    key: "escalation_timers",
    label: "Escalation timers and severity classification",
    type: "textarea",
    placeholder: "Describe severity levels (e.g. Critical/High/Medium/Low), escalation timers for each level (e.g. Critical: 15 min to CISO, 1 hr to regulator), and escalation path",
    rows: 4,
  },
  {
    key: "swift_recovery_roadmap",
    label: "Alignment with SWIFT Cyber Security Incident Recovery roadmap (Bulletin #10047)",
    type: "select",
    options: [
      "Fully aligned — all recovery steps incorporated",
      "Mostly aligned — minor gaps",
      "Partially aligned — significant gaps",
      "Not aligned or not assessed",
    ],
  },
  {
    key: "internal_notification_steps",
    label: "Internal and external notification procedures",
    type: "textarea",
    placeholder: "Describe steps: notify internal stakeholders (who, when, how), notify external parties (regulator, supervisor, law enforcement, SWIFT), and mandatory SWIFT reporting for SWIFT-related cyber incidents",
    rows: 4,
  },
  {
    key: "containment_isolation_procedures",
    label: "Containment, isolation, and forensic evidence procedures",
    type: "textarea",
    placeholder: "Describe containment/isolation steps, forensic evidence collection and preservation procedures, chain of custody, and safe recovery operations",
    rows: 4,
  },
  {
    key: "swift_mandatory_reporting",
    label: "Mandatory SWIFT incident reporting procedure documented",
    type: "select",
    options: [
      "Documented with specific SWIFT reporting channels and timelines",
      "Mentioned in plan but details incomplete",
      "Not specifically addressed for SWIFT",
    ],
  },
  {
    key: "backup_recovery_plan",
    label: "Backup and recovery plan covering all critical business lines",
    type: "select",
    options: [
      "Comprehensive plan covering all SWIFT-related critical business lines",
      "Plan covers most critical business lines",
      "Basic backup plan — limited business line coverage",
      "No backup/recovery plan documented",
    ],
  },
  {
    key: "business_lines_covered",
    label: "Critical business lines covered by backup/recovery",
    type: "textarea",
    placeholder: "List each critical business line and its recovery strategy: messaging, payments, connectivity, related supporting systems",
    rows: 3,
  },
  {
    key: "testing_status",
    label: "IR plan tested at least every 2 years (see H2)",
    type: "select",
    options: [
      "Tested within last 2 years",
      "Tested more than 2 years ago",
      "Never tested",
    ],
  },
  {
    key: "policy_legal_compliance",
    label: "Plan compliant with internal policies and local laws",
    type: "select",
    options: [
      "Confirmed compliant with both internal policies and local regulations",
      "Compliant with internal policies — local law compliance not verified",
      "Compliance not assessed",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps in IR plan or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any missing plan sections, outdated procedures, or improvements planned",
    rows: 3,
  },
];
