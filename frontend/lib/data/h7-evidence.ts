import type { FieldDef } from "@/components/domain/generic-intake-form";

export const H7_EVIDENCE_ITEM_ID = "H7";

export const H7_UPLOAD_GUIDANCE = [
  { id: "1", label: "Configuration screenshots/exports showing transaction limits, business hours, and thresholds" },
  { id: "2", label: "Real-time monitoring dashboard screenshots or system documentation" },
  { id: "3", label: "Sample reconciliation reports" },
  { id: "4", label: "Sample alert/exception reports showing detection and response" },
  { id: "5", label: "Transaction parameter documentation and review history" },
  { id: "6", label: "False positive management records and periodic parameter adjustment evidence" },
];

export const H7_FIELDS: FieldDef[] = [
  {
    key: "configuration_documented",
    label: "Transaction monitoring configuration documented",
    type: "select",
    options: [
      "Full configuration exported/screenshotted with all parameters",
      "Most configuration documented — some settings not captured",
      "Partially documented",
      "Not documented",
    ],
  },
  {
    key: "configured_limits_thresholds",
    label: "Configured limits and thresholds",
    type: "textarea",
    placeholder: "List specific configured values: per-transaction value limits, cumulative daily thresholds, business hour windows, volume caps, counterparty limits",
    rows: 4,
  },
  {
    key: "monitoring_dashboard_status",
    label: "Real-time monitoring dashboard operational status",
    type: "select",
    options: [
      "Dashboard active — real-time visibility with alerting",
      "Dashboard active — visibility without automated alerting",
      "Dashboard available but not actively monitored",
      "No monitoring dashboard in place",
    ],
  },
  {
    key: "reconciliation_reports",
    label: "Sample reconciliation reports available",
    type: "select",
    options: [
      "Daily reconciliation reports with matched/unmatched totals",
      "Periodic reconciliation reports (weekly/monthly)",
      "Reports generated ad hoc only",
      "No reconciliation reports available",
    ],
  },
  {
    key: "alert_exception_samples",
    label: "Sample alert/exception reports provided",
    type: "select",
    options: [
      "Alert samples provided showing detection, investigation, and resolution",
      "Alert samples provided — limited investigation detail",
      "Alert system exists but no samples available",
      "No alert system in place",
    ],
  },
  {
    key: "transaction_parameters_documented",
    label: "Transaction parameters fully documented",
    type: "select",
    options: [
      "All parameters documented with rationale and approval",
      "Parameters documented without rationale",
      "Some parameters documented",
      "Parameters not documented",
    ],
  },
  {
    key: "parameter_review_frequency",
    label: "Parameter review and adjustment frequency",
    type: "select",
    options: [
      "Quarterly or after significant business changes",
      "Semi-annually",
      "Annually",
      "No regular review — set once only",
    ],
  },
  {
    key: "last_parameter_review_date",
    label: "Date of last parameter review/adjustment",
    type: "date",
  },
  {
    key: "false_positive_management",
    label: "False positive management process",
    type: "select",
    options: [
      "Formal process: tracked, analysed, parameters tuned to reduce false positives",
      "False positives reviewed but no formal tuning process",
      "False positives acknowledged but not systematically managed",
      "No false positive management",
    ],
  },
  {
    key: "business_change_adjustment",
    label: "Parameters adjusted for business changes",
    type: "textarea",
    placeholder: "Describe how parameters are updated when business activity changes: new correspondents, volume increases, new currencies, seasonal patterns",
    rows: 3,
  },
  {
    key: "known_gaps",
    label: "Known gaps in monitoring configuration or planned improvements",
    type: "textarea",
    required: false,
    placeholder: "Describe any unconfigured controls, monitoring blind spots, parameter staleness, or planned enhancements",
    rows: 3,
  },
];
