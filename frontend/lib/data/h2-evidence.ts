import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H2_EVIDENCE_ITEM_ID = "H2";

export const H2_UPLOAD_GUIDANCE = [
  { id: "1", label: "IR exercise/test records including date, type, scope, and participants" },
  { id: "2", label: "Test scenario description (relevant to SWIFT environment)" },
  { id: "3", label: "Results: what worked, what failed, gaps identified" },
  { id: "4", label: "Lessons learned and plan updates resulting from findings" },
  { id: "5", label: "Evidence of safe recovery demonstration and minimised outage validation" },
  { id: "6", label: "External third-party participation (if outsourced activities involved)" },
];

export const H2_FIELDS: FieldDef[] = [
  {
    key: "last_test_date",
    label: "Date of most recent IR exercise/test",
    type: "date",
  },
  {
    key: "test_within_two_years",
    label: "Most recent test conducted within last 2 years",
    type: "select",
    options: [
      "Yes — tested within last 12 months",
      "Yes — tested within last 24 months",
      "No — last test more than 2 years ago",
      "Never tested",
    ],
  },
  {
    key: "test_type",
    label: "Type of IR exercise conducted",
    type: "select",
    options: [
      "Live drill / full simulation",
      "Functional exercise with system recovery",
      "Tabletop exercise with walkthrough",
      "Discussion-based review only",
    ],
  },
  {
    key: "test_scope",
    label: "Scope of the exercise",
    type: "textarea",
    placeholder: "Describe what was tested: which systems, business lines, communication channels, recovery procedures, and which IR plan sections were exercised",
    rows: 3,
  },
  {
    key: "participants",
    label: "Exercise participants",
    type: "textarea",
    placeholder: "List participant roles and teams: IT security, operations, management, communications, legal — include names/titles if available",
    rows: 3,
  },
  {
    key: "scenario_description",
    label: "Scenario description (SWIFT-relevant)",
    type: "textarea",
    placeholder: "Describe the attack/incident scenario used: e.g. compromised operator credentials, fraudulent SWIFT message injection, ransomware affecting messaging interface",
    rows: 3,
  },
  {
    key: "results_summary",
    label: "Results — what worked and what failed",
    type: "textarea",
    placeholder: "Summarise: detection effectiveness, containment speed, communication success, recovery time, any failures or bottlenecks encountered",
    rows: 4,
  },
  {
    key: "lessons_learned",
    label: "Lessons learned from exercise",
    type: "textarea",
    placeholder: "Describe key takeaways, process improvements identified, training needs, tool/technology gaps discovered",
    rows: 3,
  },
  {
    key: "plan_updates_from_findings",
    label: "IR plan updated based on exercise findings",
    type: "select",
    options: [
      "Plan updated with all findings incorporated",
      "Plan partially updated — some findings pending",
      "Findings documented but plan not yet updated",
      "No updates made from exercise findings",
    ],
  },
  {
    key: "safe_recovery_demonstrated",
    label: "Safe recovery of operations demonstrated",
    type: "select",
    options: [
      "Full safe recovery demonstrated within target RTO",
      "Recovery demonstrated with minor delays",
      "Recovery partially demonstrated — some systems not tested",
      "Safe recovery not demonstrated",
    ],
  },
  {
    key: "minimised_outage_validated",
    label: "Minimised outage validated during exercise",
    type: "select",
    options: [
      "Outage minimisation confirmed — within acceptable limits",
      "Outage longer than target but acceptable",
      "Significant outage beyond acceptable limits",
      "Outage minimisation not measured",
    ],
  },
  {
    key: "external_party_participation",
    label: "External third-party participation (if outsourced activities)",
    type: "select",
    options: [
      "All relevant third parties participated",
      "Some third parties participated",
      "Third parties notified but did not participate",
      "No third-party involvement",
      "Not applicable — no outsourced SWIFT activities",
    ],
  },
  {
    key: "next_test_due",
    label: "Next IR exercise due date",
    type: "date",
  },
  {
    key: "known_gaps",
    label: "Known exercise gaps or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any untested scenarios, missing participants, or planned exercise enhancements",
    rows: 3,
  },
];
