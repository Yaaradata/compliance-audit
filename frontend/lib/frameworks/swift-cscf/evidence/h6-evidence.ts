import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H6_EVIDENCE_ITEM_ID = "H6";

export const H6_UPLOAD_GUIDANCE = [
  { id: "1", label: "Transaction detection, prevention, and validation controls documentation" },
  { id: "2", label: "Business hours restrictions and traffic limiting configuration" },
  { id: "3", label: "Value/volume thresholds (per-transaction and cumulative) with parameter basis" },
  { id: "4", label: "Daily reconciliation process (outbound vs back-office)" },
  { id: "5", label: "Real-time monitoring dashboard evidence or post-event next-day verification" },
  { id: "6", label: "Currency/counterparty restrictions and four-eyes enforcement for sensitive operations" },
  { id: "7", label: "Alert and exception handling procedures" },
];

export const H6_FIELDS: FieldDef[] = [
  {
    key: "controls_documentation_status",
    label: "Transaction control procedures documented",
    type: "select",
    options: [
      "Fully documented — all detection, prevention, and validation controls",
      "Mostly documented — some controls informal",
      "Partially documented",
      "Not documented",
    ],
  },
  {
    key: "business_hours_restrictions",
    label: "Traffic limiting outside business hours",
    type: "select",
    options: [
      "Implemented — transactions blocked or restricted outside defined hours",
      "Implemented — alerts generated but transactions not blocked",
      "Partially implemented — some message types only",
      "Not implemented",
    ],
  },
  {
    key: "value_volume_thresholds",
    label: "Value and volume thresholds configured",
    type: "textarea",
    placeholder: "Describe per-transaction value limits, cumulative daily volume limits, and how thresholds were determined based on normal activity analysis",
    rows: 4,
  },
  {
    key: "daily_reconciliation",
    label: "Daily reconciliation of outbound transactions vs back-office",
    type: "select",
    options: [
      "Automated daily reconciliation with exception reporting",
      "Manual daily reconciliation performed",
      "Reconciliation performed but not daily (weekly/monthly)",
      "No reconciliation process",
    ],
  },
  {
    key: "realtime_monitoring",
    label: "Real-time transaction monitoring dashboard",
    type: "select",
    options: [
      "Live dashboard with real-time alerts and operator notification",
      "Near real-time monitoring (within minutes)",
      "Periodic batch monitoring (hourly or less frequent)",
      "No real-time monitoring — post-event only",
      "Not implemented",
    ],
  },
  {
    key: "post_event_verification",
    label: "Post-event next-day verification process",
    type: "select",
    options: [
      "Systematic next-day review of all transactions with sign-off",
      "Next-day review of flagged transactions only",
      "Periodic review (not daily)",
      "No post-event verification",
    ],
  },
  {
    key: "parameters_basis",
    label: "Transaction parameters basis (normal activity analysis)",
    type: "textarea",
    placeholder: "Describe how thresholds/parameters were established: historical transaction analysis, business activity patterns, seasonal adjustments, approval process for parameter setting",
    rows: 3,
  },
  {
    key: "currency_counterparty_restrictions",
    label: "Currency and counterparty restrictions",
    type: "select",
    options: [
      "Restrictions in place for both currencies and counterparties",
      "Currency restrictions only",
      "Counterparty restrictions only",
      "No currency or counterparty restrictions",
    ],
  },
  {
    key: "four_eyes_enforcement",
    label: "Four-eyes principle for sensitive operations",
    type: "select",
    options: [
      "Enforced system-wide for all sensitive transaction operations",
      "Enforced for high-value transactions only",
      "Policy exists but not technically enforced",
      "Not implemented",
    ],
  },
  {
    key: "inbound_monitoring",
    label: "Inbound transaction monitoring (recommended)",
    type: "select",
    options: [
      "Inbound monitoring implemented with alerts",
      "Basic inbound monitoring without alerts",
      "Inbound monitoring planned but not yet implemented",
      "No inbound monitoring",
    ],
  },
  {
    key: "alert_exception_handling",
    label: "Alert and exception handling procedures",
    type: "textarea",
    placeholder: "Describe alert workflow: who receives alerts, response time targets, investigation procedures, escalation path, resolution documentation, and false positive handling",
    rows: 4,
  },
  {
    key: "controls_implemented_count",
    label: "Number of control types implemented (out of 5 recommended)",
    type: "select",
    options: [
      "All 5 (hours, thresholds, reconciliation, real-time, post-event)",
      "4 of 5 implemented",
      "3 of 5 implemented",
      "2 of 5 implemented",
      "1 or none implemented",
    ],
  },
  {
    key: "known_gaps",
    label: "Known gaps in transaction controls or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any unimplemented controls, threshold gaps, monitoring blind spots, or planned enhancements",
    rows: 3,
  },
];
