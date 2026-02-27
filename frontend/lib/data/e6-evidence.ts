import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E6_EVIDENCE_ITEM_ID = "E6";

export const E6_UPLOAD_GUIDANCE = [
  { id: "1", label: "IDS/IPS deployment architecture and sensor placement at secure zone boundaries" },
  { id: "2", label: "HIDS configuration on in-scope systems (if applicable)" },
  { id: "3", label: "EDR/XDR and EPP integration details (if used for intrusion detection)" },
  { id: "4", label: "Detection method configuration: signature-based and anomaly-based rules" },
  { id: "5", label: "Signature update frequency and last update date" },
  { id: "6", label: "Anomaly detection baseline configuration" },
  { id: "7", label: "Network segment coverage (zone boundary + internal segments)" },
  { id: "8", label: "IPS active response capability (connection termination, blocking)" },
  { id: "9", label: "Integration with SIEM — events forwarded per E2 logging infrastructure" },
  { id: "10", label: "Cloud or remote environment coverage (if applicable)" },
];

export const E6_FIELDS: FieldDef[] = [
  {
    key: "ids_ips_product",
    label: "IDS/IPS Product & Version",
    type: "text",
    placeholder: "e.g. Snort 3.x, Suricata 7.x, Palo Alto Threat Prevention, Cisco Firepower, Check Point IPS",
  },
  {
    key: "nids_deployment_status",
    label: "NIDS Deployment at Secure Zone Boundary",
    type: "select",
    options: [
      "Deployed — sensors at all secure zone boundary points",
      "Deployed — sensors at primary boundary points (some secondary gaps)",
      "Partially deployed — coverage at limited boundary points",
      "Not deployed",
    ],
  },
  {
    key: "nids_sensor_placement",
    label: "NIDS Sensor Placement Details",
    type: "textarea",
    rows: 3,
    placeholder: "Describe sensor locations, e.g.:\n• Between general IT and SWIFT secure zone: inline IPS\n• Between SWIFT secure zone and SWIFTNet: span/tap + IDS\n• DMZ boundary: inline IPS",
  },
  {
    key: "hids_deployment",
    label: "HIDS Deployment on In-Scope Systems",
    type: "select",
    options: [
      "Deployed on all in-scope systems",
      "Deployed on servers only",
      "Deployed on selected critical systems",
      "Not deployed",
      "Not applicable — covered by EDR/XDR instead",
    ],
  },
  {
    key: "edr_xdr_integration",
    label: "EDR/XDR / EPP Integration for Intrusion Detection",
    type: "select",
    options: [
      "Fully integrated — EDR/XDR provides host-level intrusion detection",
      "Partially integrated — EDR deployed but not all hosts covered",
      "EPP only — basic endpoint protection without intrusion detection",
      "Not applicable — separate HIDS used instead",
      "No endpoint-based intrusion detection",
    ],
  },
  {
    key: "detection_methods",
    label: "Detection Methods Configured",
    type: "select",
    options: [
      "Both signature-based and anomaly-based detection",
      "Signature-based only",
      "Anomaly-based only",
      "Machine-learning / behavioral analysis",
      "Not configured",
    ],
  },
  {
    key: "signature_update_frequency",
    label: "Signature / Rule Update Frequency",
    type: "select",
    options: [
      "Real-time (vendor cloud feed)",
      "Daily",
      "Weekly",
      "Monthly",
      "Manual / irregular",
      "Not configured",
    ],
  },
  {
    key: "last_signature_update_date",
    label: "Last Signature / Rule Update Date",
    type: "date",
  },
  {
    key: "anomaly_baseline_config",
    label: "Anomaly Detection Baseline Status",
    type: "select",
    options: [
      "Baseline established and regularly updated",
      "Baseline established — not recently updated",
      "Baseline in learning/training phase",
      "No anomaly baseline configured",
      "Not applicable — signature-only detection",
    ],
  },
  {
    key: "network_segment_coverage",
    label: "Network Segment Coverage",
    type: "select",
    options: [
      "Zone boundary + internal SWIFT network segments",
      "Zone boundary only",
      "Internal segments only",
      "Partial coverage — gaps documented",
      "No network segment coverage",
    ],
  },
  {
    key: "ips_response_capability",
    label: "IPS Active Response Capability",
    type: "select",
    options: [
      "Inline blocking — connection termination + packet drop",
      "Inline blocking — selective rules only",
      "Detection only — no inline blocking (IDS mode)",
      "Mixed — IPS on boundary, IDS internally",
    ],
  },
  {
    key: "siem_integration_status",
    label: "Integration with SIEM (Event Forwarding per E2)",
    type: "select",
    options: [
      "All IDS/IPS events forwarded to SIEM in real-time",
      "High/critical severity events forwarded — low severity local only",
      "Events forwarded on schedule (not real-time)",
      "Not integrated with SIEM",
    ],
  },
  {
    key: "cloud_remote_coverage",
    label: "Cloud / Remote Environment Coverage",
    type: "select",
    required: false,
    options: [
      "Cloud-based IDS/IPS covering remote SWIFT components",
      "VPN-tunnelled traffic inspected by on-premises IDS/IPS",
      "No cloud/remote SWIFT components in scope",
      "Cloud/remote components not covered — gap identified",
    ],
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 3,
    required: false,
    placeholder: "Describe any coverage gaps, large VLAN considerations, planned improvements, or compensating controls",
  },
];
