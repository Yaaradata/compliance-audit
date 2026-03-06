import { useState, useCallback, useMemo } from "react";

// ── DOMAIN E DATA MODEL (from Canonical Evidence Model & Sufficiency Matrix) ──
const SUB_GROUPS = [
  { name: "Malware & Integrity", color: "#059669", items: ["E1","E4","E5"] },
  { name: "Monitoring & Logging", color: "#0369a1", items: ["E2","E3","E7"] },
  { name: "Intrusion Detection", color: "#7c3aed", items: ["E6"] },
];

const ALL_CONTROLS = ["1.2","2.10","5.4","6.1","6.2","6.3","6.4","6.5A"];

// SWIFT Windows systems for E1 anti-malware per-system evidence
const SWIFT_SYSTEMS = ["SWIFT-GW-01","SWIFT-MSG-01","SWIFT-MSG-02","OP-PC-01","OP-PC-02"];

// Log event types for E2 coverage checklist
const LOG_EVENT_TYPES = [
  "Authentication (login/logout/failed)",
  "Privilege escalation / sudo",
  "Configuration changes",
  "Transaction events",
  "System start/stop/restart",
  "File integrity changes",
  "Network connection events",
];

const EVIDENCE_ITEMS = [
  {
    id: "E1", order: 1, name: "Anti-Malware Configuration & Update Evidence",
    priority: "CRITICAL", type: "Config Screenshots / Console Export / Update Logs",
    perSystem: true,
    controls: [
      { id: "6.1", name: "Malware Protection", ma: "M" },
    ],
    controlCount: 1,
    description: "Anti-malware software configuration for all SWIFT Windows systems: product details, definition update frequency, scan schedules, and exclusion documentation.",
    inputs: [
      { id: "av_product", label: "AV Product & Version", type: "text", required: true, scope: "global", placeholder: "e.g., CrowdStrike Falcon 7.x, Defender ATP" },
      { id: "mgmt_console", label: "Centralized Management Console Export", type: "file", required: true, scope: "global", accept: ".pdf,.xlsx,.csv,.html,.png" },
      { id: "update_frequency", label: "Definition Update Frequency", type: "select", required: true, scope: "global", options: ["Continuous (real-time)","Hourly","Every 4 hours","Daily","Other"] },
      { id: "exclusion_doc", label: "Exclusion Documentation & Justifications", type: "file", required: false, scope: "global", accept: ".pdf,.docx,.xlsx" },
      { id: "config_evidence", label: "Per-System Config Evidence (screenshot/export)", type: "file", required: true, scope: "per-system", accept: ".pdf,.png,.html,.txt" },
      { id: "chk_realtime", label: "Real-time scanning enabled", type: "checkbox", required: true, scope: "per-system" },
      { id: "chk_scheduled", label: "Scheduled full scan configured (at least weekly)", type: "checkbox", required: true, scope: "per-system" },
      { id: "chk_current", label: "Definitions current (within 24 hours)", type: "checkbox", required: true, scope: "per-system" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT Windows systems covered", why: "Control 6.1 requires every Windows-based SWIFT system to have active anti-malware. Missing one system = finding.", controlRef: "6.1" },
      { dim: "SD-2", label: "Definitions updated at least daily", why: "Outdated definitions miss recent malware. Daily minimum; real-time preferred.", controlRef: "6.1" },
      { dim: "SD-3", label: "Real-time scanning enabled", why: "On-access scanning must be active, not just scheduled scans. This is the primary detection layer.", controlRef: "6.1" },
      { dim: "SD-4", label: "Scheduled full scans configured", why: "Real-time scanning can miss dormant threats. Regular full scans are required as a second layer.", controlRef: "6.1" },
      { dim: "SD-5", label: "Exclusions documented with justification", why: "Uncontrolled exclusions create blind spots. Each exclusion needs documented business justification.", controlRef: "6.1" },
      { dim: "SD-6", label: "Centrally managed", why: "Individual system management cannot guarantee consistent policy enforcement.", controlRef: "6.1" },
    ],
    perControlSufficiency: [
      { controlId: "6.1", requirement: "All SWIFT Windows systems with active AV; daily definitions; real-time + scheduled scans; justified exclusions; centralized management." },
    ],
    reductionNote: "Control-specific for 6.1. Critical for all Windows-based SWIFT systems."
  },
  {
    id: "E4", order: 2, name: "Software Integrity Verification Evidence",
    priority: "HIGH", type: "Integrity Check Results / FIM Reports",
    controls: [
      { id: "6.2", name: "Software Integrity", ma: "M" },
      { id: "2.10", name: "Application Hardening", ma: "M" },
    ],
    controlCount: 2,
    description: "Software integrity verification for SWIFT applications: baseline integrity checks, change detection monitoring, authorized software list, and verification against SWIFT-approved versions. Serves both 6.2 and 2.10. 50% reduction.",
    inputs: [
      { id: "integrity_report", label: "Integrity Check Results / FIM Report", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx" },
      { id: "fim_tool", label: "File Integrity Monitoring Tool", type: "text", required: true, placeholder: "e.g., Tripwire, OSSEC, CrowdStrike FIM, AIDE" },
      { id: "baseline_results", label: "Baseline Integrity Check Results", type: "file", required: true, accept: ".pdf,.html,.csv" },
      { id: "authorized_sw_list", label: "Authorized Software List (dated)", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "swift_versions", label: "Installed vs SWIFT-Approved Version Comparison", type: "file", required: true, accept: ".pdf,.xlsx,.csv" },
      { id: "chk_baseline", label: "Baseline integrity checks performed and documented", type: "checkbox", required: true },
      { id: "chk_change_detection", label: "Change detection / FIM actively monitoring SWIFT binaries", type: "checkbox", required: true },
      { id: "chk_sw_list", label: "Authorized software list is maintained and dated", type: "checkbox", required: true },
      { id: "chk_swift_match", label: "Installed software matches SWIFT-approved versions", type: "checkbox", required: true },
      { id: "chk_whitelisting", label: "Application whitelisting enforced (if applicable)", type: "checkbox", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Integrity verification process documented", why: "Control 6.2 requires a defined, repeatable integrity verification process for SWIFT software.", controlRef: "6.2" },
      { dim: "SD-2", label: "Baseline check results available", why: "Without a baseline, changes cannot be detected. Initial baseline is the foundation.", controlRef: "6.2" },
      { dim: "SD-3", label: "Change detection / FIM active", why: "Continuous monitoring catches unauthorized modifications between scheduled checks.", controlRef: "6.2" },
      { dim: "SD-4", label: "Authorized software list maintained", why: "Control 2.10 requires a current, dated list of authorized software on SWIFT systems.", controlRef: "2.10" },
      { dim: "SD-5", label: "Software matches SWIFT-approved versions", why: "Control 2.10 requires verification that installed software matches vendor-approved versions.", controlRef: "2.10" },
      { dim: "SD-6", label: "Unauthorized software identification", why: "Any software not on the authorized list must be identified, justified, or removed.", controlRef: "2.10" },
    ],
    perControlSufficiency: [
      { controlId: "6.2", requirement: "Integrity verification process; baseline checks; change detection/FIM monitoring SWIFT binaries." },
      { controlId: "2.10", requirement: "Authorized software list; version comparison against SWIFT-approved versions; application whitelisting." },
    ],
    reductionNote: "Integrity checks serve both software integrity (6.2) and application hardening (2.10). 50% reduction."
  },
  {
    id: "E5", order: 3, name: "Database Integrity Evidence",
    priority: "HIGH", type: "Integrity Checks / Audit Logs / Access Controls",
    conditional: true,
    conditionalNote: "Applicable to architectures with local SWIFT databases (A1, A2, A3)",
    controls: [
      { id: "6.3", name: "Database Integrity", ma: "M" },
    ],
    controlCount: 1,
    description: "Evidence of database integrity controls for SWIFT transaction databases: integrity verification, access controls, change detection, and audit logging.",
    inputs: [
      { id: "integrity_check", label: "Database Integrity Check Results", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx" },
      { id: "access_control", label: "Database Access Control Configuration", type: "file", required: true, accept: ".pdf,.xlsx,.png,.txt" },
      { id: "audit_log", label: "Database Audit Log Sample (30 days)", type: "file", required: true, accept: ".pdf,.csv,.xlsx,.log" },
      { id: "backup_integrity", label: "Backup Integrity Verification Evidence", type: "file", required: true, accept: ".pdf,.xlsx,.csv" },
      { id: "db_type", label: "Database Type", type: "text", required: true, placeholder: "e.g., Oracle, SQL Server, Alliance DB" },
      { id: "chk_integrity", label: "Database integrity verification process active", type: "checkbox", required: true },
      { id: "chk_access", label: "Access restricted to authorized accounts only", type: "checkbox", required: true },
      { id: "chk_audit", label: "Change detection / audit trail active", type: "checkbox", required: true },
      { id: "chk_backup", label: "Backup integrity verified regularly", type: "checkbox", required: true },
      { id: "chk_no_direct", label: "No direct database modification outside application", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Integrity verification process active", why: "Control 6.3 requires active integrity monitoring of SWIFT transaction databases.", controlRef: "6.3" },
      { dim: "SD-2", label: "Access restricted to authorized accounts", why: "Unrestricted database access enables unauthorized data manipulation.", controlRef: "6.3" },
      { dim: "SD-3", label: "Change detection / audit trail active", why: "All database changes must be logged and attributable to specific accounts.", controlRef: "6.3" },
      { dim: "SD-4", label: "Backup integrity verified", why: "Corrupted backups provide no recovery assurance. Integrity must be verified.", controlRef: "6.3" },
      { dim: "SD-5", label: "No direct database modification", why: "All changes must flow through the application layer. Direct DB access = critical finding.", controlRef: "6.3" },
    ],
    perControlSufficiency: [
      { controlId: "6.3", requirement: "Integrity checks; restricted access; audit trail; backup integrity; no direct modification outside application." },
    ],
    reductionNote: "Control-specific for 6.3. Applicable to architectures with local SWIFT databases (A1, A2, A3)."
  },
  {
    id: "E2", order: 4, name: "SIEM / Logging Configuration & Retention",
    priority: "CRITICAL", type: "SIEM Config / Log Architecture Diagram / Retention Policy",
    hasMultiInputTypes: true,
    controls: [
      { id: "6.4", name: "Logging and Monitoring", ma: "M" },
    ],
    controlCount: 1,
    description: "SIEM or centralized logging configuration showing which SWIFT systems and events are monitored, log retention periods, and log integrity protection. Foundation for all monitoring evidence.",
    inputs: [
      { id: "siem_config", label: "SIEM Configuration Export", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx,.json" },
      { id: "log_arch_diagram", label: "Log Architecture Diagram", type: "file", required: true, accept: ".pdf,.png,.vsd,.vsdx,.drawio" },
      { id: "retention_policy", label: "Log Retention Policy Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "siem_product", label: "SIEM Product / Version", type: "text", required: true, placeholder: "e.g., Splunk Enterprise 9.x, QRadar 7.5" },
      { id: "retention_period", label: "Retention Period (months)", type: "text", required: true, placeholder: "Minimum 6 months, recommended 13 months" },
      { id: "chk_all_systems", label: "All SWIFT systems sending logs to SIEM", type: "checkbox", required: true },
      { id: "chk_integrity", label: "Log integrity protection active (tamper-evident)", type: "checkbox", required: true },
      { id: "chk_review", label: "Regular log review process documented and evidenced", type: "checkbox", required: true },
    ],
    eventTypeCoverage: LOG_EVENT_TYPES,
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT systems sending logs to SIEM", why: "Control 6.4 requires centralized logging of all SWIFT systems. Missing log sources = blind spots.", controlRef: "6.4" },
      { dim: "SD-2", label: "All required event types captured", why: "Auth, admin, transaction, and system events must all be captured. Partial coverage = partial compliance.", controlRef: "6.4" },
      { dim: "SD-3", label: "Retention ≥6 months (13 recommended)", why: "Minimum 6-month retention per SWIFT. 13 months covers full assessment cycle.", controlRef: "6.4" },
      { dim: "SD-4", label: "Log integrity protection active", why: "Logs must be tamper-evident. Unprotected logs cannot be trusted for forensic use.", controlRef: "6.4" },
      { dim: "SD-5", label: "Regular log review process", why: "Collecting logs without reviewing them provides no detection value.", controlRef: "6.4" },
      { dim: "SD-6", label: "Log architecture diagram provided", why: "Visual representation showing log flow from SWIFT systems to SIEM. Validates completeness.", controlRef: "6.4" },
    ],
    multiInputGuidance: {
      diagram: {
        label: "Log Architecture Diagram",
        expectations: ["All SWIFT systems as log sources", "Log collection infrastructure (forwarders, agents)", "SIEM/centralized logging destination", "Log flow direction arrows", "Retention storage architecture", "Network segmentation between log sources and SIEM"],
      },
      config: {
        label: "SIEM Configuration Export",
        expectations: ["Data sources / log inputs configured", "Parsing rules per source type", "Alert rules defined (see E3)", "Retention period settings", "Storage allocation", "User access controls on SIEM"],
      },
    },
    perControlSufficiency: [
      { controlId: "6.4", requirement: "All SWIFT systems logging; all event types; ≥6 month retention; integrity protection; regular review process." },
    ],
    reductionNote: "Control-specific for 6.4. Foundation for E3 alert rules and E7 admin monitoring."
  },
  {
    id: "E3", order: 5, name: "Security Event Alert Rules & Response Procedures",
    priority: "HIGH", type: "Alert Documentation / Runbook / Escalation Matrix",
    controls: [
      { id: "6.4", name: "Logging and Monitoring", ma: "M" },
      { id: "6.5A", name: "Intrusion Detection", ma: "A" },
    ],
    controlCount: 2,
    description: "Defined alert rules for security events on SWIFT systems, escalation procedures, and response workflows. Single document covers logging/monitoring (6.4) and intrusion detection (6.5A). 50% reduction.",
    inputs: [
      { id: "alert_rules", label: "Alert Rule Documentation", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "runbook", label: "Incident Response Runbook / Playbook", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "escalation_matrix", label: "Escalation Matrix with Contacts", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "alert_review_evidence", label: "Evidence of Regular Alert Review (samples)", type: "file", required: true, accept: ".pdf,.xlsx,.csv,.png" },
      { id: "chk_swift_alerts", label: "SWIFT-specific alert rules defined (failed logins, privilege escalation, unusual transactions)", type: "checkbox", required: true },
      { id: "chk_escalation", label: "Escalation matrix includes contacts and response timelines", type: "checkbox", required: true },
      { id: "chk_procedures", label: "Response procedures defined per alert severity", type: "checkbox", required: true },
      { id: "chk_ids_rules", label: "IDS/IPS detection rules for SWIFT network segments documented (advisory)", type: "checkbox", required: false },
      { id: "chk_regular_review", label: "Evidence of regular alert rule review and tuning", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "SWIFT-specific alert rules defined", why: "Generic alerts miss SWIFT-specific threats. Rules must cover failed logins, privilege escalation, unusual transactions.", controlRef: "6.4" },
      { dim: "SD-2", label: "Escalation matrix current with contacts", why: "Alerts without escalation paths are unactionable. Matrix must be current and tested.", controlRef: "6.4" },
      { dim: "SD-3", label: "Response procedures per alert severity", why: "Different severities require different response timelines. Critical vs informational must be distinguished.", controlRef: "6.4" },
      { dim: "SD-4", label: "Evidence of regular alert review", why: "Alerts must be reviewed regularly to prove the monitoring system is operationally effective.", controlRef: "6.4" },
      { dim: "SD-5", label: "IDS/IPS rules for SWIFT segments", why: "Advisory control 6.5A requires detection rules specific to SWIFT network traffic patterns.", controlRef: "6.5A" },
      { dim: "SD-6", label: "Response procedures for IDS/IPS alerts", why: "IDS alerts without response procedures provide detection but not response capability.", controlRef: "6.5A" },
    ],
    perControlSufficiency: [
      { controlId: "6.4", requirement: "SWIFT-specific alert rules; escalation matrix; severity-based response procedures; evidence of regular review." },
      { controlId: "6.5A", requirement: "IDS/IPS alert rules for SWIFT network segments; response procedures for detection alerts." },
    ],
    reductionNote: "One alert/escalation document covers logging/monitoring (6.4) and intrusion detection (6.5A). 50% reduction."
  },
  {
    id: "E7", order: 6, name: "Admin Activity Monitoring Logs",
    priority: "HIGH", type: "Log Extracts / SIEM Reports / Audit Trail",
    controls: [
      { id: "1.2", name: "OS Privileged Account Control", ma: "M" },
      { id: "5.4", name: "Password Repository Protection", ma: "M" },
      { id: "6.4", name: "Logging and Monitoring", ma: "M" },
    ],
    controlCount: 3,
    description: "Logs showing monitoring of administrative/privileged activity on SWIFT systems. Highest-reuse item in Domain E: serves 3 mandatory controls. 67% reduction.",
    inputs: [
      { id: "admin_logs", label: "Admin Activity Log Extracts (30-day sample)", type: "file", required: true, accept: ".pdf,.csv,.xlsx,.log" },
      { id: "siem_reports", label: "SIEM Reports — Admin Activity Dashboard", type: "file", required: true, accept: ".pdf,.html,.png" },
      { id: "credential_access_log", label: "Credential Store / Vault Access Logs", type: "file", required: true, accept: ".pdf,.csv,.xlsx,.log" },
      { id: "alert_evidence", label: "Evidence of Unusual Admin Activity Alerts", type: "file", required: true, accept: ".pdf,.png,.xlsx" },
      { id: "chk_login", label: "Admin login events captured (success and failure)", type: "checkbox", required: true },
      { id: "chk_privesc", label: "Privilege escalation events logged (sudo, runas, UAC)", type: "checkbox", required: true },
      { id: "chk_config", label: "Configuration changes tracked and attributed", type: "checkbox", required: true },
      { id: "chk_cred_access", label: "Credential store access logged and reviewed", type: "checkbox", required: true },
      { id: "chk_unusual", label: "Unusual admin activity flagged and alerted", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Admin login events captured", why: "Control 1.2 requires all admin logins (success + failure) to be captured and reviewable.", controlRef: "1.2" },
      { dim: "SD-2", label: "Privilege escalation logged", why: "Control 1.2 requires logging of every privilege elevation (sudo, runas, UAC bypass).", controlRef: "1.2" },
      { dim: "SD-3", label: "Configuration changes tracked", why: "All config changes on SWIFT systems must be logged with timestamps and attribution.", controlRef: "6.4" },
      { dim: "SD-4", label: "Credential store access logged", why: "Control 5.4 requires audit trail of all access to password vaults/repositories.", controlRef: "5.4" },
      { dim: "SD-5", label: "Unusual admin activity flagged", why: "Monitoring without alerting provides no timely detection. Anomalous activity must trigger alerts.", controlRef: "6.4" },
      { dim: "SD-6", label: "Logs forwarded to SIEM", why: "Admin logs must flow to centralized SIEM (E2) for retention and correlation.", controlRef: "6.4" },
    ],
    perControlSufficiency: [
      { controlId: "1.2", requirement: "Admin login events captured; privilege escalation logging; unusual admin activity alerting." },
      { controlId: "5.4", requirement: "Credential store/vault access logging; password retrieval events tracked and reviewed." },
      { controlId: "6.4", requirement: "Admin activity logs forwarded to SIEM; retention compliance; regular review evidence." },
    ],
    reductionNote: "Admin activity logs satisfy privileged account monitoring (1.2), credential storage audit (5.4), and logging controls (6.4). 67% reduction."
  },
  {
    id: "E6", order: 7, name: "IDS/IPS Configuration Evidence",
    priority: "MEDIUM", type: "Config Export / Detection Rules / Alert Samples",
    isAdvisory: true,
    controls: [
      { id: "6.5A", name: "Intrusion Detection", ma: "A" },
    ],
    controlCount: 1,
    description: "Intrusion detection/prevention system configuration for SWIFT network segments. Advisory control (6.5A). Supplements E3 alert rules. Paired with E2 SIEM for comprehensive detection.",
    inputs: [
      { id: "ids_config", label: "IDS/IPS Configuration Export", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx,.json" },
      { id: "detection_rules", label: "Detection Signature / Rule Documentation", type: "file", required: true, accept: ".pdf,.docx,.xlsx,.csv" },
      { id: "alert_samples", label: "Alert Samples (recent 30 days)", type: "file", required: true, accept: ".pdf,.csv,.xlsx,.log" },
      { id: "ids_product", label: "IDS/IPS Product & Version", type: "text", required: true, placeholder: "e.g., Snort 3.x, Suricata 7.x, Palo Alto IPS" },
      { id: "chk_swift_segments", label: "IDS/IPS deployed on SWIFT network segments", type: "checkbox", required: true },
      { id: "chk_sigs_current", label: "Detection signatures / rules are current (updated within 30 days)", type: "checkbox", required: true },
      { id: "chk_siem_integrated", label: "Alerts integrated with SIEM/SOC (E2)", type: "checkbox", required: true },
      { id: "chk_response", label: "Response procedures for IDS alerts defined (see E3)", type: "checkbox", required: true },
      { id: "chk_updates", label: "Regular signature updates documented", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Deployed on SWIFT network segments", why: "IDS/IPS must specifically cover SWIFT network segments. Corporate-only coverage is insufficient.", controlRef: "6.5A" },
      { dim: "SD-2", label: "Detection signatures current", why: "Outdated signatures miss current attack patterns. Must be updated within 30 days.", controlRef: "6.5A" },
      { dim: "SD-3", label: "Integrated with SIEM/SOC", why: "IDS alerts must flow to centralized monitoring (E2). Standalone alerts may be missed.", controlRef: "6.5A" },
      { dim: "SD-4", label: "Response procedures defined", why: "Detection without response is incomplete. Response procedures must exist in E3.", controlRef: "6.5A" },
      { dim: "SD-5", label: "Regular signature updates documented", why: "Update cadence must be evidenced to show continuous detection improvement.", controlRef: "6.5A" },
    ],
    perControlSufficiency: [
      { controlId: "6.5A", requirement: "SWIFT segment coverage; current signatures; SIEM integration; response procedures; regular updates." },
    ],
    reductionNote: "Advisory control (6.5A). Supplements E3 alert rules. Paired with E2 SIEM for comprehensive detection."
  },
];

// ── UTILITY FUNCTIONS ──
function getStatusColor(pct) {
  if (pct >= 90) return "#059669";
  if (pct >= 60) return "#d97706";
  if (pct > 0) return "#dc2626";
  return "#94a3b8";
}
function getStatusLabel(pct) {
  if (pct >= 90) return "Sufficient";
  if (pct >= 60) return "Partial";
  if (pct > 0) return "Insufficient";
  return "Not Started";
}
function getStatusIcon(pct) {
  if (pct >= 90) return "✓";
  if (pct >= 60) return "⚠";
  if (pct > 0) return "✗";
  return "○";
}

function ScoreRing({ pct, size = 56, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = getStatusColor(pct);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 absolute">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

function ControlBadge({ ctrl }) {
  const isMandatory = ctrl.ma === "M";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        background: isMandatory ? "#fef3c7" : "#e0f2fe",
        borderColor: isMandatory ? "#f59e0b" : "#7dd3fc",
        color: isMandatory ? "#92400e" : "#0369a1"
      }}>
      <span className="font-bold">{ctrl.id}</span>
      <span className="opacity-60">{ctrl.ma}</span>
    </span>
  );
}

// ── MAIN COMPONENT ──
export default function DomainEIntake() {
  const [activeItem, setActiveItem] = useState("E1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [expandedMultiInput, setExpandedMultiInput] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [eventTypeCoverage, setEventTypeCoverage] = useState({});

  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setEvaluated(false);
  }, []);
  const markFileUploaded = useCallback((key) => {
    setUploadedFiles(prev => ({ ...prev, [key]: true }));
    setEvaluated(false);
  }, []);
  const toggleEventType = useCallback((evt) => {
    setEventTypeCoverage(prev => ({ ...prev, [evt]: !prev[evt] }));
    setEvaluated(false);
  }, []);

  const getItemCompletion = useCallback((item) => {
    let filled = 0, total = 0;
    item.inputs.forEach(inp => {
      if (!inp.required) return;
      if (item.perSystem && inp.scope === "per-system") {
        SWIFT_SYSTEMS.forEach(sys => {
          total++;
          const key = `${item.id}.${sys}.${inp.id}`;
          if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
        });
      } else {
        total++;
        const key = `${item.id}.${inp.id}`;
        if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
      }
    });
    // Event type coverage for E2
    if (item.eventTypeCoverage) {
      item.eventTypeCoverage.forEach(evt => {
        total++;
        if (eventTypeCoverage[evt]) filled++;
      });
    }
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles, eventTypeCoverage]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  // Weights: E1 CRITICAL=18, E2 CRITICAL=18, E4 multi=14, E5=10, E3 multi=14, E7 highest-reuse=18, E6 advisory=8
  const weights = { E1: 18, E4: 14, E5: 10, E2: 18, E3: 14, E7: 18, E6: 8 };
  const overallCompletion = useMemo(() => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  const controlScores = useMemo(() => {
    const scores = {};
    ALL_CONTROLS.forEach(cid => {
      const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid));
      if (items.length === 0) { scores[cid] = 0; return; }
      scores[cid] = Math.round(items.reduce((s, it) => s + itemCompletions[it.id], 0) / items.length);
    });
    return scores;
  }, [itemCompletions]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  const renderInput = (inp, keyPrefix) => {
    const key = keyPrefix ? `${activeItemData.id}.${keyPrefix}.${inp.id}` : `${activeItemData.id}.${inp.id}`;
    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30'}`}>
            {uploaded ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span className="text-sm text-emerald-700 font-medium">Uploaded</span>
                <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => { const n={...prev}; delete n[key]; return n; }); setEvaluated(false); }}
                  className="text-xs text-slate-400 hover:text-red-500 ml-2">Remove</button>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">↑ Drop or click · {inp.accept}</div>
            )}
          </div>
        </div>
      );
    }
    if (inp.type === "checkbox") {
      return (
        <label key={key} className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={!!formData[key]} onChange={e => updateField(key, e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none">
            <option value="">Select...</option>
            {(inp.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
        <input type={inp.type === "date" ? "date" : "text"} value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
          placeholder={inp.placeholder}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none" />
      </div>
    );
  };

  const getMissingInputs = (item) => {
    return item.inputs.filter(inp => {
      if (!inp.required) return false;
      if (item.perSystem && inp.scope === "per-system") {
        return SWIFT_SYSTEMS.some(sys => {
          const k = `${item.id}.${sys}.${inp.id}`;
          return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
        });
      }
      const k = `${item.id}.${inp.id}`;
      return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1e293b" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #059669, #34d399)", color: "white" }}>E</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Monitoring & Detection</h1>
                <p className="text-slate-400 text-xs">7 evidence items · 8 controls · 3 sub-groups</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1 flex-wrap">
                {ALL_CONTROLS.map(cid => (
                  <div key={cid} className="h-5 rounded text-xs font-bold flex items-center justify-center text-white px-1.5"
                    style={{ background: getStatusColor(controlScores[cid]) }} title={`${cid}: ${controlScores[cid]}%`}>{cid}</div>
                ))}
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #059669 0%, #34d399 100%)", boxShadow: "0 2px 12px rgba(5,150,105,0.3)" }}>
                Evaluate All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex" style={{ minHeight: "calc(100vh - 72px)" }}>
        {/* ── LEFT RAIL ── */}
        <div className="w-56 shrink-0 border-r border-slate-200 sticky top-[72px] self-start overflow-y-auto" style={{ maxHeight: "calc(100vh - 72px)", background: "#ffffff" }}>
          <div className="p-3">
            {SUB_GROUPS.map(group => (
              <div key={group.name} className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 flex items-center gap-2" style={{ color: group.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  {group.name}
                </div>
                {EVIDENCE_ITEMS.filter(it => group.items.includes(it.id)).map(item => {
                  const pct = itemCompletions[item.id];
                  const active = activeItem === item.id;
                  const color = getStatusColor(pct);
                  return (
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); setSelectedSystem("all"); setExpandedMultiInput(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-emerald-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#ecfdf5" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 100 }}>{item.name.length > 25 ? item.name.slice(0,23)+"…" : item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.priority === 'MEDIUM' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {item.priority === 'CRITICAL' ? 'C' : item.priority === 'MEDIUM' ? 'M' : 'H'}
                        </span>
                      </div>
                      <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Evidence chain note */}
            <div className="mt-2 p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50">
              <div className="text-xs font-semibold text-emerald-700 mb-1">Detection Stack</div>
              <div className="text-xs text-emerald-600 leading-relaxed">
                E1 malware → E4/E5 integrity → E2 logging → E3 alerting → E7 admin monitoring → E6 IDS
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 p-6">
          {activeItemData && (
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-2xl font-bold text-slate-900">{activeItemData.id}</span>
                  <span className="text-lg font-semibold text-slate-700">{activeItemData.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : activeItemData.priority === 'MEDIUM' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                    {activeItemData.priority}
                  </span>
                  {activeItemData.isAdvisory && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Advisory</span>}
                  {activeItemData.conditional && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Conditional</span>}
                </div>
                <p className="text-sm text-slate-500 mb-2">{activeItemData.description}</p>
                {activeItemData.conditionalNote && (
                  <div className="px-3 py-1.5 rounded-lg text-xs mb-2" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#6d28d9" }}>
                    ⚡ {activeItemData.conditionalNote}
                  </div>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                  {activeItemData.controlCount > 1 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{activeItemData.controlCount} controls</span>
                  )}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Multi-Input Type Guidance (E2) */}
              {activeItemData.multiInputGuidance && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <button onClick={() => setExpandedMultiInput(!expandedMultiInput)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                    <h3 className="font-semibold text-slate-700 text-sm">📐 Multi-Input Guidance — What Each Input Type Must Show</h3>
                    <span className="text-slate-400">{expandedMultiInput ? '▲' : '▼'}</span>
                  </button>
                  {expandedMultiInput && (
                    <div className="p-5 border-t border-slate-100 grid grid-cols-2 gap-4">
                      {Object.entries(activeItemData.multiInputGuidance).map(([key, guide]) => (
                        <div key={key} className="p-3 rounded-lg border" style={{ borderColor: key === 'diagram' ? '#c4b5fd' : '#bae6fd', background: key === 'diagram' ? '#faf5ff' : '#f0f9ff' }}>
                          <div className="text-xs font-bold mb-2" style={{ color: key === 'diagram' ? '#7c3aed' : '#0369a1' }}>
                            {key === 'diagram' ? '📊' : '⚙️'} {guide.label}
                          </div>
                          {guide.expectations.map((exp, i) => (
                            <div key={i} className="text-xs text-slate-600 mb-1 flex items-start gap-1.5">
                              <span className="text-slate-400 mt-px shrink-0">•</span>
                              <span>{exp}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event Type Coverage Checklist (E2) */}
              {activeItemData.eventTypeCoverage && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 text-sm">Event Type Coverage Checklist</h3>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(Math.round(Object.values(eventTypeCoverage).filter(Boolean).length / LOG_EVENT_TYPES.length * 100)) }}>
                      {Object.values(eventTypeCoverage).filter(Boolean).length}/{LOG_EVENT_TYPES.length}
                    </span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-2">
                    {LOG_EVENT_TYPES.map(evt => (
                      <label key={evt} className="flex items-start gap-2.5 cursor-pointer group py-1">
                        <input type="checkbox" checked={!!eventTypeCoverage[evt]} onChange={() => toggleEventType(evt)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white" />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{evt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* System Selector (for E1 per-system) */}
              {activeItemData.perSystem && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">SWIFT Windows Systems (from A2 Inventory)</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedSystem("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSystem === "all" ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      All Systems ({SWIFT_SYSTEMS.length})
                    </button>
                    {SWIFT_SYSTEMS.map(sys => {
                      const sysComplete = activeItemData.inputs.filter(i => i.required && i.scope === "per-system").every(inp => {
                        const k = `${activeItemData.id}.${sys}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      });
                      return (
                        <button key={sys} onClick={() => setSelectedSystem(sys)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedSystem === sys ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${sysComplete ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                          {sys}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── INPUTS ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 text-sm">Evidence Inputs</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${itemCompletions[activeItemData.id]}%`, background: getStatusColor(itemCompletions[activeItemData.id]) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>{itemCompletions[activeItemData.id]}%</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {activeItemData.perSystem ? (
                    <>
                      {activeItemData.inputs.filter(i => !i.scope || i.scope === "global").map(inp => renderInput(inp))}
                      {(selectedSystem === "all" ? SWIFT_SYSTEMS : [selectedSystem]).map(sys => (
                        <div key={sys} className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                          <div className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{sys}
                          </div>
                          <div className="space-y-3">
                            {activeItemData.inputs.filter(i => i.scope === "per-system").map(inp => renderInput(inp, sys))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    activeItemData.inputs.map(inp => renderInput(inp))
                  )}
                </div>
              </div>

              {/* ── SUFFICIENCY DIMENSIONS ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <button onClick={() => setExpandedSuff(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                  <h3 className="font-semibold text-slate-700 text-sm">Sufficiency Dimensions — What Will Be Evaluated</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{activeItemData.sufficiency.length} dimensions</span>
                    <span className="text-slate-400">{expandedSuff[activeItemData.id] ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedSuff[activeItemData.id] && (
                  <div className="p-5 border-t border-slate-100">
                    {activeItemData.sufficiency.map((s, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg mb-1" style={{ background: i%2 === 0 ? "#f8fafc" : "transparent" }}>
                        <span className="text-xs font-mono font-bold text-emerald-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        {s.controlRef && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium shrink-0 self-start">{s.controlRef}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PER-CONTROL SUFFICIENCY ── */}
              {activeItemData.perControlSufficiency && activeItemData.perControlSufficiency.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <button onClick={() => setExpandedPerControl(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                    <h3 className="font-semibold text-slate-700 text-sm">Per-Control Sufficiency Requirements</h3>
                    <span className="text-slate-400">{expandedPerControl[activeItemData.id] ? '▲' : '▼'}</span>
                  </button>
                  {expandedPerControl[activeItemData.id] && (
                    <div className="divide-y divide-slate-100">
                      {activeItemData.perControlSufficiency.map(pcs => {
                        const ctrl = activeItemData.controls.find(c => c.id === pcs.controlId);
                        const score = controlScores[pcs.controlId] || 0;
                        return (
                          <div key={pcs.controlId} className="px-5 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                {ctrl && <ControlBadge ctrl={ctrl} />}
                                <span className="text-sm font-medium text-slate-600">{ctrl?.name || pcs.controlId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 pl-1">{pcs.requirement}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── EVALUATE BUTTON ── */}
              <div className="flex justify-center mb-5">
                <button onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #059669, #34d399)", boxShadow: "0 4px 20px rgba(5,150,105,0.25)" }}>
                  Evaluate Sufficiency for {activeItemData.id}
                </button>
              </div>

              {/* ── EVALUATION RESULTS ── */}
              {evaluated && (
                <div className="rounded-xl border-2 overflow-hidden mb-5" style={{ borderColor: getStatusColor(itemCompletions[activeItemData.id]) }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: getStatusColor(itemCompletions[activeItemData.id]) + "12" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(itemCompletions[activeItemData.id])}</span>
                      <div>
                        <div className="font-bold text-slate-900">{getStatusLabel(itemCompletions[activeItemData.id])}</div>
                        <div className="text-xs text-slate-500">{activeItemData.id} — {activeItemData.name}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>{itemCompletions[activeItemData.id]}%</div>
                  </div>
                  <div className="p-5 bg-slate-50/80">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Gap Analysis & Remediation</h4>
                    {itemCompletions[activeItemData.id] >= 90 ? (
                      <div className="p-3 rounded-lg text-sm" style={{ background: "#ecfdf5", color: "#047857" }}>
                        All required inputs complete. Ready for reviewer assessment.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getMissingInputs(activeItemData).map(inp => (
                          <div key={inp.id} className="flex gap-3 p-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <span className="text-amber-500 shrink-0">⚠</span>
                            <div>
                              <div className="text-sm font-medium text-slate-700">{inp.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {activeItemData.perSystem && inp.scope === "per-system"
                                  ? `Missing for: ${SWIFT_SYSTEMS.filter(sys => { const k=`${activeItemData.id}.${sys}.${inp.id}`; return inp.type==="file" ? !uploadedFiles[k] : !formData[k]; }).join(", ")}`
                                  : inp.type === "file" ? "Upload required evidence file."
                                  : inp.type === "checkbox" ? "Confirm this attestation."
                                  : "Complete this required field."}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Event type coverage gaps (E2) */}
                        {activeItemData.eventTypeCoverage && (
                          (() => {
                            const missing = LOG_EVENT_TYPES.filter(e => !eventTypeCoverage[e]);
                            return missing.length > 0 ? (
                              <div className="flex gap-3 p-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <span className="text-amber-500 shrink-0">⚠</span>
                                <div>
                                  <div className="text-sm font-medium text-slate-700">Missing Event Type Coverage</div>
                                  <div className="text-xs text-slate-500 mt-0.5">Uncovered: {missing.join("; ")}</div>
                                </div>
                              </div>
                            ) : null;
                          })()
                        )}
                        {/* Sufficiency dimension risk warning */}
                        {itemCompletions[activeItemData.id] < 60 && (
                          <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50">
                            <div className="text-xs font-semibold text-red-700 mb-2">Sufficiency Dimensions at Risk</div>
                            {activeItemData.sufficiency.slice(0, 3).map((s, i) => (
                              <div key={i} className="text-xs text-red-600 mb-1">
                                <span className="font-mono font-bold">{s.dim}</span> — {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Cross-reference warnings */}
                        {activeItemData.id === "E1" && (
                          <div className="mt-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                            <div className="text-xs text-emerald-700">
                              <span className="font-bold">Cross-reference:</span> System list validated against A2 (SWIFT Component Inventory). Non-Windows systems are excluded from E1 scope.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "E2" && (
                          <div className="mt-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                            <div className="text-xs text-emerald-700">
                              <span className="font-bold">Cross-reference:</span> Log sources validated against A2 system inventory. Missing log sources will be flagged. E7 admin logs must flow through this SIEM.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "E7" && (
                          <div className="mt-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                            <div className="text-xs text-emerald-700">
                              <span className="font-bold">Cross-reference:</span> Admin logs validated against E2 SIEM configuration and C2 privileged account inventory. Credential access logs cross-checked with C8.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-56 shrink-0 border-l border-slate-200 sticky top-[72px] self-start hidden xl:block overflow-y-auto" style={{ maxHeight: "calc(100vh - 72px)", background: "#ffffff" }}>
          <div className="p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Control Sufficiency</div>
            {ALL_CONTROLS.map(cid => {
              const score = controlScores[cid];
              const color = getStatusColor(score);
              const ctrl = EVIDENCE_ITEMS.flatMap(it => it.controls).find(c => c.id === cid);
              const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid)).map(it => it.id);
              return (
                <div key={cid} className="mb-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{cid} <span className={ctrl?.ma === "M" ? "text-amber-600" : "text-sky-600"}>{ctrl?.ma}</span></span>
                    <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1 leading-snug">{ctrl?.name || cid}</div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-0.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
                  </div>
                  <div className="text-xs text-slate-400">{items.join(", ")}</div>
                </div>
              );
            })}

            {/* Evidence dependencies */}
            <div className="mt-4 p-2 rounded-lg border border-emerald-100 bg-emerald-50/50">
              <div className="text-xs font-semibold text-emerald-700 mb-1">Evidence Dependencies</div>
              <div className="space-y-1.5">
                <div className="text-xs text-emerald-600">E2 SIEM ← E7 admin logs feed</div>
                <div className="text-xs text-emerald-600">E3 alerts → E6 IDS rules</div>
                <div className="text-xs text-emerald-600">E4 integrity ↔ B6 baseline</div>
              </div>
            </div>

            {/* Cross-domain links */}
            <div className="mt-3 p-2 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="text-xs font-semibold text-amber-700 mb-1">Cross-Domain</div>
              <div className="space-y-1">
                <div className="text-xs text-amber-600">E1 → A2 system inventory</div>
                <div className="text-xs text-amber-600">E7 → C2 priv accounts</div>
                <div className="text-xs text-amber-600">E7 → C8 credential storage</div>
                <div className="text-xs text-amber-600">E4 → B6 hardening baseline</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
