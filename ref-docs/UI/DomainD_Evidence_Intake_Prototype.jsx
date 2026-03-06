import { useState, useCallback, useMemo } from "react";

// ── DOMAIN D DATA MODEL (from Canonical Evidence Model & Sufficiency Matrix) ──
const SUB_GROUPS = [
  { name: "Patch Management", color: "#0369a1", items: ["D1","D2","D3"] },
  { name: "Vulnerability Management", color: "#b45309", items: ["D4","D5"] },
  { name: "Penetration Testing", color: "#7c3aed", items: ["D6"] },
];

const ALL_CONTROLS = ["2.2","2.7","7.3A"];

// SWIFT systems from A2 inventory (referenced for per-system patch/scan coverage)
const SWIFT_SYSTEMS = ["SWIFT-GW-01","SWIFT-MSG-01","SWIFT-MSG-02","OP-PC-01","OP-PC-02"];

// Months for D3 12-month deployment history
const DEPLOY_MONTHS = [
  "Feb 2025","Jan 2025","Dec 2024","Nov 2024","Oct 2024","Sep 2024",
  "Jun 2024","May 2024","Apr 2024","Mar 2024","Feb 2024","Jan 2024"
];

const EVIDENCE_ITEMS = [
  {
    id: "D1", order: 1, name: "Patch Management Policy",
    priority: "HIGH", type: "Policy Document",
    controls: [
      { id: "2.2", name: "Security Updates", ma: "M" },
    ],
    controlCount: 1,
    description: "Documented patch management policy covering SWIFT systems: update frequency, testing procedures, rollback plans, and emergency patching process.",
    inputs: [
      { id: "policy_doc", label: "Patch Management Policy Document", type: "file", required: true, accept: ".pdf,.docx,.doc" },
      { id: "policy_version", label: "Policy Version / Effective Date", type: "text", required: true, placeholder: "e.g., v2.1 — Effective 01-Jan-2025" },
      { id: "policy_approver", label: "Approving Authority", type: "text", required: true, placeholder: "e.g., IT Director, Head of Infrastructure" },
      { id: "chk_frequency", label: "Policy defines patch review frequency (minimum monthly)", type: "checkbox", required: true },
      { id: "chk_testing", label: "Policy mandates testing before production deployment", type: "checkbox", required: true },
      { id: "chk_rollback", label: "Policy documents rollback procedures for failed patches", type: "checkbox", required: true },
      { id: "chk_emergency", label: "Policy defines emergency/critical patch process (out-of-cycle)", type: "checkbox", required: true },
      { id: "chk_scope", label: "Policy scope explicitly covers all SWIFT systems", type: "checkbox", required: true },
      { id: "chk_vendor", label: "Policy addresses vendor support lifecycle (EOL management)", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Patch frequency defined (minimum monthly review)", why: "Control 2.2 requires regular, documented patching cadence. Ad-hoc patching = finding.", controlRef: "2.2" },
      { dim: "SD-2", label: "Testing mandated before deployment", why: "Untested patches on SWIFT systems risk operational disruption. Must demonstrate testing requirement.", controlRef: "2.2" },
      { dim: "SD-3", label: "Rollback procedures documented", why: "Failed patches without rollback plan can cause extended SWIFT outage.", controlRef: "2.2" },
      { dim: "SD-4", label: "Emergency patch process defined", why: "Critical vulnerabilities require out-of-cycle patching. Process must be pre-defined.", controlRef: "2.2" },
      { dim: "SD-5", label: "All SWIFT systems in scope", why: "Policy must explicitly cover every SWIFT system type. Partial scope = partial compliance.", controlRef: "2.2" },
      { dim: "SD-6", label: "Vendor support lifecycle requirements stated", why: "Running EOL software without documented risk acceptance is a critical finding.", controlRef: "2.2" },
    ],
    perControlSufficiency: [
      { controlId: "2.2", requirement: "Patch policy covering frequency, testing, rollback, emergency process, scope, and vendor lifecycle management." },
    ],
    reductionNote: "Control-specific for 2.2. Policy foundation for D2 and D3 evidence."
  },
  {
    id: "D2", order: 2, name: "Current Patch Levels (All SWIFT Systems)",
    priority: "CRITICAL", type: "System Scan / Patch Audit",
    perSystem: true,
    controls: [
      { id: "2.2", name: "Security Updates", ma: "M" },
    ],
    controlCount: 1,
    description: "Current patch status for all SWIFT systems showing installed patches, missing patches, and vendor support status. Point-in-time compliance snapshot.",
    inputs: [
      { id: "scan_tool", label: "Patch Scanning Tool", type: "select", required: true, options: ["WSUS","SCCM/MECM","Qualys Patch Mgmt","Tanium","Ivanti","Manual audit","Other"] },
      { id: "scan_date", label: "Scan / Report Date", type: "date", required: true },
      { id: "patch_report", label: "Patch Audit Report / WSUS Export", type: "file", required: true, accept: ".pdf,.xlsx,.csv,.html", scope: "global" },
      { id: "os_patch_date", label: "Last OS Patch Date", type: "date", required: true, scope: "per-system" },
      { id: "app_patch_date", label: "Last Application Patch Date", type: "date", required: true, scope: "per-system" },
      { id: "missing_critical", label: "Missing Critical/Security Patches", type: "text", required: true, scope: "per-system", placeholder: "e.g., 0 missing / 2 pending test" },
      { id: "vendor_status", label: "Vendor Support Status", type: "select", required: true, scope: "per-system", options: ["Fully Supported","Extended Support","Approaching EOL (<12mo)","End of Life","N/A"] },
      { id: "maint_contract", label: "Maintenance Contract Status", type: "select", required: true, scope: "per-system", options: ["Active","Expiring (<90 days)","Expired","Not Required"] },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT systems scanned", why: "Control 2.2 requires every SWIFT system. Missing one system from scope = finding.", controlRef: "2.2" },
      { dim: "SD-2", label: "OS patches current (within policy timeframe)", why: "OS patches must be applied within the cadence defined in D1 policy.", controlRef: "2.2" },
      { dim: "SD-3", label: "Application patches current", why: "SWIFT application patches are equally critical. Alliance patches must be current.", controlRef: "2.2" },
      { dim: "SD-4", label: "No missing critical/security patches", why: "Outstanding critical patches are immediate findings. Must be zero or justified.", controlRef: "2.2" },
      { dim: "SD-5", label: "No EOL software", why: "End-of-life software receives no security updates. Must be replaced or risk-accepted.", controlRef: "2.2" },
      { dim: "SD-6", label: "Maintenance contracts active", why: "Expired maintenance = no vendor support for patches. Operational risk.", controlRef: "2.2" },
    ],
    perControlSufficiency: [
      { controlId: "2.2", requirement: "Per-system patch levels current; no missing critical patches; no EOL software; active vendor support." },
    ],
    reductionNote: "Control-specific for 2.2. Cross-referenced with A2 system inventory for completeness."
  },
  {
    id: "D3", order: 3, name: "Patch Deployment Records (12 Months)",
    priority: "HIGH", type: "Deployment Logs / Change Records",
    hasTimeline: true,
    controls: [
      { id: "2.2", name: "Security Updates", ma: "M" },
    ],
    controlCount: 1,
    description: "Historical patch deployment records for 12 months demonstrating regular cadence and timely security update application.",
    inputs: [
      { id: "deploy_records", label: "Deployment Records / Change Logs", type: "file", required: true, accept: ".pdf,.xlsx,.csv,.zip" },
      { id: "wsus_history", label: "WSUS/SCCM Deployment History (if applicable)", type: "file", required: false, accept: ".pdf,.xlsx,.csv" },
      { id: "chk_monthly", label: "Monthly deployment records available for all 12 months", type: "checkbox", required: true },
      { id: "chk_timeline", label: "Critical patches deployed within 30 days of release", type: "checkbox", required: true },
      { id: "chk_testing", label: "Testing records exist for each deployment cycle", type: "checkbox", required: true },
      { id: "chk_rollbacks", label: "All failed deployments and rollbacks are documented", type: "checkbox", required: true },
      { id: "chk_coverage", label: "Deployment records cover all SWIFT systems", type: "checkbox", required: true },
      { id: "avg_deploy_days", label: "Average Days from Release to Deployment (critical patches)", type: "text", required: true, placeholder: "e.g., 14 days" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Regular monthly cadence maintained", why: "Control 2.2 requires regular patching. Gaps in cadence indicate process failure.", controlRef: "2.2" },
      { dim: "SD-2", label: "Critical patches applied within 30 days", why: "Industry standard: critical patches within 30 days. Beyond this = finding.", controlRef: "2.2" },
      { dim: "SD-3", label: "Testing evidence present per cycle", why: "Patches deployed without testing violate D1 policy and risk SWIFT availability.", controlRef: "2.2" },
      { dim: "SD-4", label: "Failed deployments documented", why: "Undocumented failures suggest uncontrolled change management.", controlRef: "2.2" },
      { dim: "SD-5", label: "All SWIFT systems covered across 12 months", why: "Selective patching (some systems, some months) = incomplete compliance.", controlRef: "2.2" },
    ],
    perControlSufficiency: [
      { controlId: "2.2", requirement: "12-month history with monthly cadence; critical patches within 30 days; testing evidence; full system coverage." },
    ],
    reductionNote: "Control-specific for 2.2. Time-series evidence of ongoing patch management discipline."
  },
  {
    id: "D4", order: 4, name: "Vulnerability Scan Reports (Last Quarter)",
    priority: "CRITICAL", type: "Scanner Output / Executive Summary",
    controls: [
      { id: "2.7", name: "Vulnerability Scanning", ma: "M" },
    ],
    controlCount: 1,
    description: "Vulnerability scan results for all SWIFT systems from the most recent quarter. Paired with D5 for remediation tracking.",
    inputs: [
      { id: "scanner_tool", label: "Scanner Tool", type: "select", required: true, options: ["Nessus","Qualys","Rapid7 InsightVM","Tenable.io","OpenVAS","CrowdStrike","Other"] },
      { id: "scanner_version", label: "Scanner / Plugin Version", type: "text", required: true, placeholder: "e.g., Nessus 10.7, plugins updated 2025-01-30" },
      { id: "scan_date", label: "Most Recent Scan Date", type: "date", required: true },
      { id: "scan_report", label: "Full Scan Report", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx,.nessus" },
      { id: "exec_summary", label: "Executive Summary (if separate)", type: "file", required: false, accept: ".pdf,.docx" },
      { id: "chk_all_systems", label: "All SWIFT systems included in scan scope", type: "checkbox", required: true },
      { id: "chk_os_app", label: "Scan covers both OS and application layers", type: "checkbox", required: true },
      { id: "chk_authenticated", label: "Authenticated (credentialed) scan performed", type: "checkbox", required: true },
      { id: "critical_count", label: "Critical Findings Count", type: "text", required: true, placeholder: "e.g., 0" },
      { id: "high_count", label: "High Findings Count", type: "text", required: true, placeholder: "e.g., 3" },
      { id: "medium_count", label: "Medium Findings Count", type: "text", required: false, placeholder: "e.g., 12" },
      { id: "low_count", label: "Low / Informational Count", type: "text", required: false, placeholder: "e.g., 28" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT systems in scan scope", why: "Control 2.7 requires every SWIFT system scanned. Partial scope = partial compliance.", controlRef: "2.7" },
      { dim: "SD-2", label: "Up-to-date scanner with current plugins", why: "Outdated plugins miss recent vulnerabilities. Plugin date must be within 30 days of scan.", controlRef: "2.7" },
      { dim: "SD-3", label: "Scan within last 90 days", why: "Control 2.7 requires quarterly scanning. Older than 90 days = non-compliant.", controlRef: "2.7" },
      { dim: "SD-4", label: "Both OS and application layers covered", why: "OS-only scans miss application vulnerabilities. Both layers mandatory.", controlRef: "2.7" },
      { dim: "SD-5", label: "Authenticated (credentialed) scan", why: "Unauthenticated scans miss internal vulnerabilities. Credentialed scanning required.", controlRef: "2.7" },
      { dim: "SD-6", label: "Severity-rated findings with counts", why: "Findings must be severity-rated per CVSS or equivalent. Enables D5 prioritization.", controlRef: "2.7" },
    ],
    perControlSufficiency: [
      { controlId: "2.7", requirement: "Full-scope credentialed scan; current scanner; both layers; severity-rated findings; within 90 days." },
    ],
    reductionNote: "Control-specific for 2.7. Paired with D5 for remediation tracking of identified vulnerabilities."
  },
  {
    id: "D5", order: 5, name: "Vulnerability Remediation Tracking Log",
    priority: "HIGH", type: "Tracking Log / Ticketing Export",
    controls: [
      { id: "2.7", name: "Vulnerability Scanning", ma: "M" },
      { id: "7.3A", name: "Penetration Testing", ma: "A" },
    ],
    controlCount: 2,
    description: "Single remediation tracker covers both vulnerability scanning (2.7) and penetration test follow-up (7.3A). 50% reduction vs separate tracking.",
    inputs: [
      { id: "tracking_log", label: "Remediation Tracking Log / Export", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "ticketing_export", label: "Ticketing System Export (Jira/ServiceNow)", type: "file", required: false, accept: ".xlsx,.csv,.pdf" },
      { id: "tracking_tool", label: "Tracking Tool Used", type: "text", required: true, placeholder: "e.g., Jira, ServiceNow, Excel tracker" },
      { id: "chk_all_findings", label: "All findings from D4 scans and D6 pen tests are tracked", type: "checkbox", required: true },
      { id: "chk_severity", label: "Each finding has a severity rating (Critical/High/Medium/Low)", type: "checkbox", required: true },
      { id: "chk_owner", label: "Each finding has an assigned remediation owner", type: "checkbox", required: true },
      { id: "chk_timeline", label: "Target and actual resolution dates are tracked", type: "checkbox", required: true },
      { id: "chk_verification", label: "Closed findings have verification/retest evidence", type: "checkbox", required: true },
      { id: "chk_risk_accept", label: "Deferred findings have documented risk acceptance", type: "checkbox", required: true },
      { id: "open_critical", label: "Open Critical Findings", type: "text", required: true, placeholder: "e.g., 0" },
      { id: "open_high", label: "Open High Findings", type: "text", required: true, placeholder: "e.g., 2" },
      { id: "overdue_count", label: "Overdue Findings Count", type: "text", required: true, placeholder: "e.g., 1" },
    ],
    requiredColumns: ["Vulnerability ID","Source (Scan/PenTest)","Severity","Affected System","Remediation Owner","Target Date","Actual Resolution Date","Status","Verification Evidence","Risk Acceptance (if deferred)"],
    sufficiency: [
      { dim: "SD-1", label: "All scan and pen test findings tracked", why: "Control 2.7 requires all findings tracked. Missing items = unmanaged risk.", controlRef: "2.7" },
      { dim: "SD-2", label: "Severity-rated with CVSS or equivalent", why: "Severity drives remediation SLAs. Unrated findings cannot be prioritized.", controlRef: "2.7" },
      { dim: "SD-3", label: "Critical findings resolved within SLA", why: "Open critical vulnerabilities are the highest-severity audit finding.", controlRef: "2.7" },
      { dim: "SD-4", label: "Verification evidence for closed items", why: "Closing without retest evidence = unverified remediation.", controlRef: "2.7" },
      { dim: "SD-5", label: "Risk acceptance for deferred findings", why: "Deferred findings without formal risk acceptance = unmanaged risk.", controlRef: "2.7, 7.3A" },
      { dim: "SD-6", label: "Pen test findings tracked to resolution", why: "Control 7.3A requires pen test findings remediated and retested.", controlRef: "7.3A" },
    ],
    perControlSufficiency: [
      { controlId: "2.7", requirement: "All scan findings tracked; severity-rated; critical resolved timely; verification evidence; risk acceptance for deferrals." },
      { controlId: "7.3A", requirement: "Pen test findings tracked; remediation actions documented; retest results confirming resolution." },
    ],
    reductionNote: "Single tracker covers both vulnerability scanning (2.7) and penetration test follow-up (7.3A). 50% reduction."
  },
  {
    id: "D6", order: 6, name: "Penetration Test Reports (Annual)",
    priority: "HIGH", type: "Pen Test Report / Scope / Retest",
    isAdvisory: true,
    controls: [
      { id: "7.3A", name: "Penetration Testing", ma: "A" },
    ],
    controlCount: 1,
    description: "Penetration test reports covering SWIFT infrastructure. Advisory control (7.3A). Paired with D5 for remediation tracking.",
    inputs: [
      { id: "pentest_report", label: "Penetration Test Report", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "scope_doc", label: "Scope & Methodology Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "retest_report", label: "Retest Report (for prior findings)", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "test_date", label: "Test Completion Date", type: "date", required: true },
      { id: "tester_firm", label: "Testing Firm / Qualified Tester", type: "text", required: true, placeholder: "e.g., NCC Group, Mandiant, internal red team" },
      { id: "methodology", label: "Testing Methodology", type: "select", required: true, options: ["OWASP","PTES","NIST SP 800-115","CREST","TIBER-EU","Custom (documented)"] },
      { id: "chk_swift_scope", label: "SWIFT secure zone and infrastructure explicitly in scope", type: "checkbox", required: true },
      { id: "chk_qualified", label: "Tester holds relevant certification (CREST, OSCP, etc.)", type: "checkbox", required: true },
      { id: "chk_findings_rated", label: "All findings severity-rated with exploitation evidence", type: "checkbox", required: true },
      { id: "chk_retest", label: "Retesting performed for previously identified critical/high findings", type: "checkbox", required: true },
      { id: "critical_findings", label: "Critical Findings Count", type: "text", required: true, placeholder: "e.g., 0" },
      { id: "high_findings", label: "High Findings Count", type: "text", required: true, placeholder: "e.g., 2" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "SWIFT infrastructure explicitly in scope", why: "Generic corporate pen tests not covering SWIFT infrastructure do not satisfy 7.3A.", controlRef: "7.3A" },
      { dim: "SD-2", label: "Qualified tester with relevant certification", why: "Testing by unqualified personnel provides limited assurance.", controlRef: "7.3A" },
      { dim: "SD-3", label: "Documented methodology (OWASP/PTES/etc.)", why: "Ad-hoc testing without methodology cannot be evaluated for completeness.", controlRef: "7.3A" },
      { dim: "SD-4", label: "Findings severity-rated with exploitation evidence", why: "Findings without severity or exploitation evidence lack actionable detail.", controlRef: "7.3A" },
      { dim: "SD-5", label: "Retesting performed for prior findings", why: "Without retesting, prior remediation cannot be verified as effective.", controlRef: "7.3A" },
      { dim: "SD-6", label: "Test within 12 months", why: "Pen tests older than 12 months do not reflect current security posture.", controlRef: "7.3A" },
    ],
    perControlSufficiency: [
      { controlId: "7.3A", requirement: "SWIFT in scope; qualified tester; documented methodology; severity-rated findings; retesting for prior issues." },
    ],
    reductionNote: "Advisory control (7.3A). Findings feed into D5 remediation tracking."
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

// ── SEVERITY BADGE for D4/D5/D6 findings ──
function SeverityBadge({ label, count, color }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border" style={{ borderColor: color + "44", background: color + "0a" }}>
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-xs font-bold" style={{ color }}>{count}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function DomainDIntake() {
  const [activeItem, setActiveItem] = useState("D1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [selectedSystem, setSelectedSystem] = useState("all");

  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setEvaluated(false);
  }, []);
  const markFileUploaded = useCallback((key) => {
    setUploadedFiles(prev => ({ ...prev, [key]: true }));
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
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  // Weighted: D2 and D4 critical (highest), D5 multi-control, D1/D3/D6 standard
  const weights = { D1: 12, D2: 24, D3: 14, D4: 24, D5: 16, D6: 10 };
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

  // Derive severity summary for D4/D5/D6 when fields are filled
  const severitySummary = useMemo(() => {
    if (!activeItemData) return null;
    if (activeItemData.id === "D4") {
      return {
        critical: formData["D4.critical_count"] || "—",
        high: formData["D4.high_count"] || "—",
        medium: formData["D4.medium_count"] || "—",
        low: formData["D4.low_count"] || "—",
      };
    }
    if (activeItemData.id === "D5") {
      return {
        openCritical: formData["D5.open_critical"] || "—",
        openHigh: formData["D5.open_high"] || "—",
        overdue: formData["D5.overdue_count"] || "—",
      };
    }
    if (activeItemData.id === "D6") {
      return {
        critical: formData["D6.critical_findings"] || "—",
        high: formData["D6.high_findings"] || "—",
      };
    }
    return null;
  }, [activeItemData, formData]);

  const renderInput = (inp, keyPrefix) => {
    const key = keyPrefix ? `${activeItemData.id}.${keyPrefix}.${inp.id}` : `${activeItemData.id}.${inp.id}`;
    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/30'}`}>
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
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none">
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
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none" />
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
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #0369a1, #0ea5e9)", color: "white" }}>D</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Vulnerability & Patch Management</h1>
                <p className="text-slate-400 text-xs">6 evidence items · 3 controls · 3 sub-groups</p>
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
                style={{ background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)", boxShadow: "0 2px 12px rgba(3,105,161,0.3)" }}>
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
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); setSelectedSystem("all"); }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-sky-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#f0f9ff" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 100 }}>{item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.priority === 'MEDIUM' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                          {item.priority === 'CRITICAL' ? 'C' : 'H'}
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

            {/* Domain flow note */}
            <div className="mt-2 p-2.5 rounded-lg border border-sky-100 bg-sky-50/50">
              <div className="text-xs font-semibold text-sky-700 mb-1">Evidence Flow</div>
              <div className="text-xs text-sky-600 leading-relaxed">
                D1 policy → D2 current state → D3 history → D4 scan → D5 remediation → D6 pen test
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
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{activeItemData.id}</span>
                  <span className="text-lg font-semibold text-slate-700">{activeItemData.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {activeItemData.priority}
                  </span>
                  {activeItemData.isAdvisory && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Advisory</span>}
                </div>
                <p className="text-sm text-slate-500 mb-3">{activeItemData.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Severity Summary (for D4, D5, D6) */}
              {severitySummary && activeItemData.id === "D4" && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Vulnerability Severity Distribution</div>
                  <div className="flex gap-3 flex-wrap">
                    <SeverityBadge label="Critical" count={severitySummary.critical} color="#dc2626" />
                    <SeverityBadge label="High" count={severitySummary.high} color="#ea580c" />
                    <SeverityBadge label="Medium" count={severitySummary.medium} color="#d97706" />
                    <SeverityBadge label="Low/Info" count={severitySummary.low} color="#65a30d" />
                  </div>
                </div>
              )}
              {severitySummary && activeItemData.id === "D5" && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Remediation Status Summary</div>
                  <div className="flex gap-3 flex-wrap">
                    <SeverityBadge label="Open Critical" count={severitySummary.openCritical} color="#dc2626" />
                    <SeverityBadge label="Open High" count={severitySummary.openHigh} color="#ea580c" />
                    <SeverityBadge label="Overdue" count={severitySummary.overdue} color="#7c3aed" />
                  </div>
                </div>
              )}
              {severitySummary && activeItemData.id === "D6" && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Pen Test Findings Summary</div>
                  <div className="flex gap-3 flex-wrap">
                    <SeverityBadge label="Critical" count={severitySummary.critical} color="#dc2626" />
                    <SeverityBadge label="High" count={severitySummary.high} color="#ea580c" />
                  </div>
                </div>
              )}

              {/* Required Columns (for D5) */}
              {activeItemData.requiredColumns && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Required Columns in Tracking Log</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {activeItemData.requiredColumns.map(col => (
                      <span key={col} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">{col}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* System Selector (for D2 per-system) */}
              {activeItemData.perSystem && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">SWIFT Systems (from A2 Inventory)</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedSystem("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSystem === "all" ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      All Systems ({SWIFT_SYSTEMS.length})
                    </button>
                    {SWIFT_SYSTEMS.map(sys => {
                      const sysComplete = activeItemData.inputs.filter(i => i.required && i.scope === "per-system").every(inp => {
                        const k = `${activeItemData.id}.${sys}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      });
                      return (
                        <button key={sys} onClick={() => setSelectedSystem(sys)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedSystem === sys ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${sysComplete ? 'bg-emerald-500' : 'bg-slate-300'}`} />
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
                        <div key={sys} className="p-3 rounded-lg border border-sky-100 bg-sky-50/30">
                          <div className="text-xs font-bold text-sky-600 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />{sys}
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
                        <span className="text-xs font-mono font-bold text-sky-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        {s.controlRef && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 font-medium shrink-0 self-start">{s.controlRef}</span>
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

              {/* ── CONTROL MAPPING (multi-control items) ── */}
              {activeItemData.controls.length > 1 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700 text-sm">Control Satisfaction Status</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeItemData.controls.map(ctrl => {
                      const score = controlScores[ctrl.id] || 0;
                      return (
                        <div key={ctrl.id} className="px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ControlBadge ctrl={ctrl} />
                            <span className="text-sm text-slate-600">{ctrl.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── EVALUATE BUTTON ── */}
              <div className="flex justify-center mb-5">
                <button onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #0369a1, #0ea5e9)", boxShadow: "0 4px 20px rgba(3,105,161,0.25)" }}>
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
                        {activeItemData.id === "D2" && (
                          <div className="mt-2 p-3 rounded-lg border border-sky-200 bg-sky-50">
                            <div className="text-xs text-sky-700">
                              <span className="font-bold">Cross-reference:</span> System list will be validated against A2 (SWIFT Component Inventory). Missing systems will be flagged.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "D5" && (
                          <div className="mt-2 p-3 rounded-lg border border-sky-200 bg-sky-50">
                            <div className="text-xs text-sky-700">
                              <span className="font-bold">Cross-reference:</span> Findings will be validated against D4 scan results and D6 pen test findings. Untracked findings will be flagged.
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

            {/* Evidence item dependencies */}
            <div className="mt-4 p-2 rounded-lg border border-sky-100 bg-sky-50/50">
              <div className="text-xs font-semibold text-sky-700 mb-1">Evidence Dependencies</div>
              <div className="space-y-1.5">
                <div className="text-xs text-sky-600">D1 policy → D2/D3 enforcement</div>
                <div className="text-xs text-sky-600">D4 findings → D5 tracking</div>
                <div className="text-xs text-sky-600">D6 findings → D5 tracking</div>
              </div>
            </div>

            {/* Cross-domain links */}
            <div className="mt-3 p-2 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="text-xs font-semibold text-amber-700 mb-1">Cross-Domain Links</div>
              <div className="text-xs text-amber-600 leading-relaxed">
                D2 patch levels validated against A2 system inventory. D4 scan scope cross-checked with A2.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
