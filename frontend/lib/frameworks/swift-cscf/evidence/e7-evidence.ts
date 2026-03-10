import type { FieldDef } from "@/components/domain/generic-intake-form";

export const E7_EVIDENCE_ITEM_ID = "E7";

export const E7_UPLOAD_GUIDANCE = [
  { id: "1", label: "Admin activity logs collected in SIEM from all in-scope systems — parsed, indexed, and searchable" },
  { id: "2", label: "Log retention evidence: application audit ≥12 months, OS admin ≥12 months, operator PC ≥31 days" },
  { id: "3", label: "Log integrity protected from enterprise admin compromise" },
  { id: "4", label: "Regular admin log review evidence (daily recommended) and session recording for privileged accounts" },
  { id: "5", label: "Secure zone admin access logs — login events with timestamp, source, and account for zone entry" },
  { id: "6", label: "Administrative actions within secure zone: config changes, restarts, installations" },
  { id: "7", label: "Zone boundary access monitoring and firewall connection logging" },
  { id: "8", label: "Per-system admin login events: timestamp, account, source IP, success/failure" },
  { id: "9", label: "Privilege escalation events (sudo, UAC, root group) and administrative actions (config changes, user mods, software installs)" },
  { id: "10", label: "Unusual admin activity alerting (off-hours, multiple failures, unexpected escalation) and log review evidence" },
  { id: "11", label: "Credential store / password vault access logs: timestamp, user, action (view/retrieve/modify)" },
  { id: "12", label: "Physical safe access logs and emergency password retrieval logging" },
];

export const E7_FIELDS: FieldDef[] = [
  {
    key: "admin_log_siem_collection",
    label: "Admin Activity Logs Collected in SIEM",
    type: "select",
    options: [
      "All in-scope systems — logs parsed, indexed, and searchable",
      "Most systems (>75%) — some sources pending integration",
      "Partial (25-75%) — significant gaps remain",
      "Few systems (<25%)",
      "No admin logs in SIEM",
    ],
  },
  {
    key: "admin_log_retention",
    label: "Admin Log Retention Compliance",
    type: "select",
    options: [
      "Compliant — app audit ≥12mo, OS admin ≥12mo, operator PC ≥31 days",
      "Mostly compliant — one retention category below threshold",
      "Partially compliant — multiple categories below threshold",
      "Non-compliant — retention not configured or very short",
    ],
  },
  {
    key: "log_integrity_protection",
    label: "Log Integrity Protection from Enterprise Admin Compromise",
    type: "select",
    options: [
      "Immutable/WORM storage — enterprise admins cannot alter or delete",
      "Role-separated access — enterprise admins have no SIEM write access",
      "Partial protection — some logs modifiable by enterprise admins",
      "No protection — enterprise admins can modify or delete logs",
    ],
  },
  {
    key: "admin_log_review_frequency",
    label: "Admin Log Review Frequency",
    type: "select",
    options: [
      "Daily review by dedicated security team",
      "Weekly review",
      "Monthly review",
      "Ad-hoc / reactive only",
      "No regular review",
    ],
  },
  {
    key: "privileged_session_recording",
    label: "Session Recording for Privileged Accounts",
    type: "select",
    options: [
      "Full session recording (video/keystroke) for all privileged access",
      "Command-level logging for privileged sessions",
      "Session recording for selected critical systems only",
      "No session recording",
    ],
  },
  {
    key: "secure_zone_access_logging",
    label: "Secure Zone Admin Access Logging",
    type: "select",
    options: [
      "All zone entry logged — timestamp, source, account, success/failure",
      "Most zone entry logged — some entry points unmonitored",
      "Limited logging — only primary access point monitored",
      "No zone-level access logging",
    ],
  },
  {
    key: "zone_admin_actions_logged",
    label: "Administrative Actions Within Secure Zone",
    type: "textarea",
    rows: 3,
    placeholder: "Describe which zone admin actions are logged, e.g.:\n• Configuration changes: logged\n• Service restarts: logged\n• Software installations: logged\n• Account modifications: logged",
  },
  {
    key: "zone_boundary_firewall_logging",
    label: "Zone Boundary Monitoring & Firewall Connection Logging",
    type: "select",
    options: [
      "Firewall logs all connections (allow + deny) at zone boundary — forwarded to SIEM",
      "Firewall logs deny-only at boundary — forwarded to SIEM",
      "Firewall logs present but not forwarded to SIEM",
      "No firewall connection logging at zone boundary",
    ],
  },
  {
    key: "per_system_admin_login_logging",
    label: "Per-System Admin Login Event Logging",
    type: "select",
    options: [
      "All systems — timestamp, account, source IP, success/failure captured",
      "Most systems (>75%) — some gaps in login event capture",
      "Partial — limited to servers only (PCs not covered)",
      "Minimal or no per-system login logging",
    ],
  },
  {
    key: "privilege_escalation_logging",
    label: "Privilege Escalation Event Logging (sudo, UAC, root group)",
    type: "select",
    options: [
      "All escalation events logged and forwarded to SIEM",
      "Most escalation events logged — some OS types have gaps",
      "Limited — sudo only, no UAC or group membership changes",
      "Not logged",
    ],
  },
  {
    key: "unusual_admin_activity_alerting",
    label: "Unusual Admin Activity Alerting",
    type: "select",
    options: [
      "Automated alerts — off-hours access, multiple failures, unexpected escalation",
      "Alerts for multiple failures only — no off-hours or escalation alerts",
      "Manual review — no automated alerting",
      "No unusual activity monitoring",
    ],
  },
  {
    key: "activity_reconstruction_capability",
    label: "Admin Activity Reconstruction Capability",
    type: "select",
    options: [
      "Full reconstruction — can trace complete admin session from login to logout",
      "Partial reconstruction — some action types not captured",
      "Log data available but not correlated for reconstruction",
      "Cannot reconstruct admin activity from current logs",
    ],
  },
  {
    key: "credential_store_access_logging",
    label: "Credential Store / Password Vault Access Logging",
    type: "select",
    options: [
      "All access logged — timestamp, user, action (view/retrieve/modify), which credentials",
      "Access logged — but action type or credential identity not captured",
      "Login to vault logged — individual credential access not tracked",
      "No credential store access logging",
      "Not applicable — no electronic credential store in use",
    ],
  },
  {
    key: "physical_safe_access_logging",
    label: "Physical Safe Access & Emergency Password Retrieval Logging",
    type: "select",
    options: [
      "Physical safe access logged (timestamp, person, reason) + emergency retrievals logged",
      "Physical safe access logged — emergency retrieval not separately tracked",
      "Sign-out sheet only — no formal logging",
      "No physical safe access logging",
      "Not applicable — no physical credential storage",
    ],
  },
  {
    key: "credential_access_anomaly_alerting",
    label: "Anomalous Credential Repository Access Alerting",
    type: "select",
    options: [
      "Automated alerts for unexpected sources, off-hours access, and bulk retrievals",
      "Alerts for off-hours access only",
      "Manual review of vault access logs",
      "No anomaly alerting for credential access",
    ],
  },
  {
    key: "additional_notes",
    label: "Additional Notes or Known Gaps",
    type: "textarea",
    rows: 4,
    required: false,
    placeholder: "Describe any logging gaps across controls 6.4/1.1/1.2/5.4, systems not yet integrated, or planned improvements",
  },
];
