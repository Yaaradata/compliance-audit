import { useState, useCallback, useMemo } from "react";

// ── DOMAIN H DATA MODEL (from Canonical Evidence Model) ──
// 9 items, 5 controls (3 Mandatory + 2 Advisory), 4 sub-groups
const SUB_GROUPS = [
  { name: "Incident Response", color: "#0891b2", items: ["H1","H2","H3"], controlRef: "7.1" },
  { name: "Security Training", color: "#7c3aed", items: ["H4","H5"], controlRef: "7.2" },
  { name: "Transaction Controls", color: "#059669", items: ["H6","H7"], controlRef: "2.9" },
  { name: "Business Governance", color: "#64748b", items: ["H8","H9"], controlRef: "2.11A / 7.4A" },
];

const EVIDENCE_ITEMS = [
  // ── INCIDENT RESPONSE (7.1) ──
  {
    id: "H1", order: 1, name: "Cyber Incident Response Plan",
    priority: "CRITICAL", type: "IR Plan Document / Runbook",
    controls: [{ id: "7.1", name: "Cyber Incident Response Planning", ma: "M" }],
    description: "Documented incident response plan covering SWIFT-specific scenarios: detection, containment, eradication, recovery, and communication procedures.",
    inputs: [
      { id: "ir_plan", label: "Incident Response Plan (SWIFT-specific)", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "runbook", label: "SWIFT Incident Runbook / Playbook", type: "file", required: false, accept: ".pdf,.docx" },
      { id: "contact_list", label: "Incident Contact List (internal + external)", type: "file", required: true, accept: ".pdf,.xlsx,.docx" },
      { id: "chk_scenarios", label: "SWIFT-specific incident scenarios documented (unauthorized transactions, credential compromise, malware)", type: "checkbox", required: true },
      { id: "chk_detection", label: "Detection and triage procedures defined", type: "checkbox", required: true },
      { id: "chk_containment", label: "Containment and eradication steps documented", type: "checkbox", required: true },
      { id: "chk_recovery", label: "Recovery procedures with RTO/RPO targets", type: "checkbox", required: true },
      { id: "chk_comms", label: "Communication plan includes SWIFT ISAC notification", type: "checkbox", required: true },
      { id: "chk_roles", label: "Roles and responsibilities assigned to named individuals", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "SWIFT-specific incident scenarios covered", why: "Generic IR plans miss SWIFT-specific threats (unauthorized transactions, credential theft). Must include SWIFT scenarios.", controlRef: "7.1" },
      { dim: "SD-2", label: "All IR phases addressed (detect → contain → eradicate → recover)", why: "Incomplete coverage means gaps in response. Each phase requires specific procedures.", controlRef: "7.1" },
      { dim: "SD-3", label: "SWIFT ISAC notification included", why: "SWIFT requires incident reporting to ISAC. Missing this = non-compliance with 7.1 communication requirements.", controlRef: "7.1" },
      { dim: "SD-4", label: "Contact lists current and complete", why: "Outdated contacts delay response. Must include internal team, SWIFT support, law enforcement, regulators.", controlRef: "7.1" },
      { dim: "SD-5", label: "Roles and responsibilities defined", why: "Undefined roles cause confusion during incidents. Named individuals with clear authorities required.", controlRef: "7.1" },
    ],
    reductionNote: "Foundation for incident response evidence. H2 exercises test this plan; H3 covers ISAC participation referenced here."
  },
  {
    id: "H2", order: 2, name: "Incident Response Exercise Records",
    priority: "HIGH", type: "Exercise Records / After-Action Reports",
    controls: [{ id: "7.1", name: "Cyber Incident Response Planning", ma: "M" }],
    description: "Records of IR exercises (tabletop or functional) covering SWIFT-related scenarios, including findings and improvement tracking.",
    inputs: [
      { id: "exercise_record", label: "Exercise Record / After-Action Report", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "findings", label: "Findings and Lessons Learned Document", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "improvement_tracker", label: "Improvement Action Tracker", type: "file", required: false, accept: ".xlsx,.pdf,.docx" },
      { id: "exercise_date", label: "Most Recent Exercise Date", type: "date", required: true },
      { id: "exercise_type", label: "Exercise Type", type: "select", required: true, options: ["Tabletop Exercise","Functional Exercise","Full Simulation","Walkthrough"] },
      { id: "chk_12months", label: "Exercise conducted within the last 12 months", type: "checkbox", required: true },
      { id: "chk_swift_scenario", label: "SWIFT-related scenario(s) tested", type: "checkbox", required: true },
      { id: "chk_participants", label: "Participant list documented with roles", type: "checkbox", required: true },
      { id: "chk_findings", label: "Findings and observations documented", type: "checkbox", required: true },
      { id: "chk_improvements", label: "Improvement actions tracked to completion", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Exercise within last 12 months", why: "Annual testing is expected. Exercises older than 12 months indicate untested plan.", controlRef: "7.1" },
      { dim: "SD-2", label: "SWIFT-specific scenario tested", why: "Generic exercises don't validate SWIFT-specific procedures. Must include SWIFT scenario.", controlRef: "7.1" },
      { dim: "SD-3", label: "Findings and observations documented", why: "Exercises without findings suggest perfunctory testing. Honest findings demonstrate maturity.", controlRef: "7.1" },
      { dim: "SD-4", label: "Lessons learned incorporated into plan", why: "Exercise value is in improvement. Unaddressed findings = plan decay.", controlRef: "7.1" },
      { dim: "SD-5", label: "Improvement actions tracked", why: "Findings without tracked actions are performative. Completion tracking required.", controlRef: "7.1" },
    ],
    reductionNote: "Validates H1 plan effectiveness. Exercise date automatically checked against 12-month window."
  },
  {
    id: "H3", order: 3, name: "SWIFT ISAC Participation Evidence",
    priority: "MEDIUM", type: "Registration / Alert Acknowledgments",
    controls: [{ id: "7.1", name: "Cyber Incident Response Planning", ma: "M" }],
    description: "Evidence of participation in SWIFT Information Sharing and Analysis Centre (ISAC) for threat intelligence and incident reporting.",
    inputs: [
      { id: "registration", label: "SWIFT ISAC Registration Confirmation", type: "file", required: true, accept: ".pdf,.png,.html" },
      { id: "alert_acks", label: "Recent ISAC Alert Acknowledgments (sample)", type: "file", required: true, accept: ".pdf,.png,.html,.xlsx" },
      { id: "poc_details", label: "Designated ISAC Point of Contact", type: "text", required: true, placeholder: "Name and role of designated contact" },
      { id: "chk_active", label: "SWIFT ISAC participation currently active", type: "checkbox", required: true },
      { id: "chk_alerts", label: "ISAC alerts reviewed and acknowledged", type: "checkbox", required: true },
      { id: "chk_poc", label: "Designated point of contact assigned", type: "checkbox", required: true },
      { id: "chk_process", label: "Process for acting on ISAC alerts documented", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "ISAC registration/participation active", why: "SWIFT requires active ISAC participation. Lapsed registration = non-compliance.", controlRef: "7.1" },
      { dim: "SD-2", label: "Alert acknowledgments evidenced", why: "Receiving alerts without acknowledging them provides no assurance of awareness.", controlRef: "7.1" },
      { dim: "SD-3", label: "Designated contact assigned", why: "ISAC alerts need a responsible individual. Unassigned alerts may be missed.", controlRef: "7.1" },
      { dim: "SD-4", label: "Process for acting on alerts documented", why: "Acknowledging alerts without acting on them provides no security benefit.", controlRef: "7.1" },
    ],
    reductionNote: "Information sharing compliance. Cross-references H1 communication plan (ISAC notification procedure)."
  },
  // ── SECURITY TRAINING (7.2) ──
  {
    id: "H4", order: 4, name: "Security Training Program Documentation",
    priority: "HIGH", type: "Training Program / Curriculum / Policy",
    controls: [{ id: "7.2", name: "Security Training & Awareness", ma: "M" }],
    description: "Documented security awareness training program covering SWIFT-specific content: curriculum, delivery method, frequency, and target audience.",
    inputs: [
      { id: "training_program", label: "Training Program Document / Policy", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "curriculum", label: "Training Curriculum / Content Outline", type: "file", required: true, accept: ".pdf,.docx,.pptx" },
      { id: "phishing_program", label: "Phishing Simulation Program (if applicable)", type: "file", required: false, accept: ".pdf,.docx,.xlsx" },
      { id: "chk_scope", label: "All SWIFT-related personnel included in training scope", type: "checkbox", required: true },
      { id: "chk_swift_content", label: "SWIFT-specific security topics covered in curriculum", type: "checkbox", required: true },
      { id: "chk_annual", label: "Training delivered at least annually", type: "checkbox", required: true },
      { id: "chk_newhire", label: "New-hire training requirements defined", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT personnel in scope", why: "Missing personnel = untrained users with SWIFT access. Scope must match C2 privileged accounts.", controlRef: "7.2" },
      { dim: "SD-2", label: "SWIFT-specific content included", why: "Generic security training misses SWIFT-specific threats. Must cover SWIFT scenarios.", controlRef: "7.2" },
      { dim: "SD-3", label: "Annual delivery minimum", why: "Security awareness decays. Annual refresh is the minimum acceptable frequency.", controlRef: "7.2" },
      { dim: "SD-4", label: "New-hire requirements defined", why: "New staff must be trained before receiving SWIFT access. Onboarding gap = risk.", controlRef: "7.2" },
      { dim: "SD-5", label: "Phishing simulation program (recommended)", why: "Phishing is the primary social engineering vector. Simulations validate awareness effectiveness.", controlRef: "7.2" },
    ],
    reductionNote: "Training program foundation. H5 completion records validate this program's execution."
  },
  {
    id: "H5", order: 5, name: "Training Completion Records",
    priority: "HIGH", type: "LMS Export / Completion Certificates / Attendance",
    controls: [{ id: "7.2", name: "Security Training & Awareness", ma: "M" }],
    description: "Training completion records for all SWIFT-related personnel showing who completed training, when, and assessment results.",
    inputs: [
      { id: "completion_report", label: "Training Completion Report (LMS export or equivalent)", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "noncompliance", label: "Non-Compliance Follow-up Evidence", type: "file", required: false, accept: ".pdf,.xlsx,.docx" },
      { id: "phishing_results", label: "Phishing Simulation Results (if applicable)", type: "file", required: false, accept: ".xlsx,.pdf" },
      { id: "completion_rate", label: "Overall Completion Rate (%)", type: "text", required: true, placeholder: "e.g., 97%" },
      { id: "chk_all_personnel", label: "Completion records cover all SWIFT-related personnel", type: "checkbox", required: true },
      { id: "chk_within_12", label: "Training completed within last 12 months", type: "checkbox", required: true },
      { id: "chk_results", label: "Pass/fail results recorded (if assessment-based)", type: "checkbox", required: true },
      { id: "chk_followup", label: "Non-compliance escalated and followed up", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All SWIFT personnel completed training", why: "Gap between personnel list and completions = untrained users. Must match C2/H4 scope.", controlRef: "7.2" },
      { dim: "SD-2", label: "Training within last 12 months", why: "Training older than 12 months is stale. Must be current cycle.", controlRef: "7.2" },
      { dim: "SD-3", label: "Assessment results recorded", why: "Completion without assessment doesn't validate understanding.", controlRef: "7.2" },
      { dim: "SD-4", label: "Non-compliance addressed", why: "Incomplete training without follow-up shows lack of enforcement.", controlRef: "7.2" },
    ],
    reductionNote: "Execution evidence for H4 program. AI cross-references personnel list against C2 privileged accounts."
  },
  // ── TRANSACTION CONTROLS (2.9) ──
  {
    id: "H6", order: 6, name: "Transaction Business Control Procedures",
    priority: "HIGH", type: "Process Documentation / Workflow Diagrams",
    controls: [{ id: "2.9", name: "Transaction Business Controls", ma: "M" }],
    description: "Documented procedures for transaction business controls: verification, dual authorization, out-of-band confirmation, monitoring, and reconciliation.",
    hasMultiInputTypes: true,
    multiInputGuidance: {
      process: {
        label: "Procedure Documentation",
        expectations: [
          "Transaction verification steps and checkpoints",
          "Dual authorization requirements and thresholds",
          "Out-of-band confirmation triggers and process",
          "Exception handling procedures with escalation",
          "Reconciliation schedule and process",
        ],
      },
      workflow: {
        label: "Workflow Diagrams",
        expectations: [
          "End-to-end transaction flow with control gates",
          "Decision points for dual authorization",
          "Exception and escalation paths",
          "Reconciliation touchpoints in the flow",
          "System handoff points between Alliance and back-office",
        ],
      },
    },
    inputs: [
      { id: "procedures", label: "Transaction Control Procedures Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "workflow", label: "Transaction Workflow Diagram (if available)", type: "file", required: false, accept: ".pdf,.png,.vsd,.vsdx" },
      { id: "chk_verification", label: "Transaction verification procedures documented", type: "checkbox", required: true },
      { id: "chk_dual_auth", label: "Dual authorization requirements defined with thresholds", type: "checkbox", required: true },
      { id: "chk_oob", label: "Out-of-band confirmation processes for high-value/unusual transactions", type: "checkbox", required: true },
      { id: "chk_monitoring", label: "Amount/currency/beneficiary monitoring rules defined", type: "checkbox", required: true },
      { id: "chk_reconciliation", label: "End-of-day reconciliation process documented", type: "checkbox", required: true },
      { id: "chk_exceptions", label: "Exception handling procedures with escalation defined", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Transaction verification procedures", why: "Unverified transactions = potential fraud. Verification checkpoints are the first line of defense.", controlRef: "2.9" },
      { dim: "SD-2", label: "Dual authorization with thresholds", why: "Single-person authorization for high-value transactions = collusion risk. Thresholds must be defined.", controlRef: "2.9" },
      { dim: "SD-3", label: "Out-of-band confirmation", why: "In-band confirmation can be spoofed. OOB verification for unusual transactions is critical.", controlRef: "2.9" },
      { dim: "SD-4", label: "Monitoring rules defined", why: "Without monitoring rules, unusual transactions go undetected. Rules must cover amount, currency, beneficiary.", controlRef: "2.9" },
      { dim: "SD-5", label: "Reconciliation process active", why: "EOD reconciliation catches discrepancies before they propagate. Missing reconciliation = undetected errors.", controlRef: "2.9" },
    ],
    reductionNote: "Business control procedures foundation. H7 demonstrates technical implementation of these procedures."
  },
  {
    id: "H7", order: 7, name: "Transaction Monitoring Config & Evidence",
    priority: "HIGH", type: "System Config / Monitoring Rules / Alert Samples",
    controls: [{ id: "2.9", name: "Transaction Business Controls", ma: "M" }],
    description: "Configuration evidence for transaction monitoring: system rules, thresholds, alert examples, reconciliation execution records, and session tracking.",
    inputs: [
      { id: "monitoring_config", label: "Monitoring System Configuration / Rules Export", type: "file", required: true, accept: ".pdf,.xlsx,.html,.xml" },
      { id: "alert_samples", label: "Alert Samples with Response Evidence (recent 30 days)", type: "file", required: true, accept: ".pdf,.xlsx" },
      { id: "reconciliation", label: "Daily Reconciliation Execution Records (recent 30 days)", type: "file", required: true, accept: ".xlsx,.pdf,.csv" },
      { id: "session_tracking", label: "Session Number Tracking Evidence", type: "file", required: false, accept: ".pdf,.xlsx" },
      { id: "chk_rules_active", label: "Monitoring rules configured and active (amount, currency, beneficiary)", type: "checkbox", required: true },
      { id: "chk_thresholds", label: "Thresholds defined and aligned with H6 procedures", type: "checkbox", required: true },
      { id: "chk_alerts_acted", label: "Alerts investigated and acted upon (evidence provided)", type: "checkbox", required: true },
      { id: "chk_recon_daily", label: "Reconciliation performed daily with evidence", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Monitoring rules active and configured", why: "Rules defined in H6 must be technically implemented. Config must match procedure.", controlRef: "2.9" },
      { dim: "SD-2", label: "Thresholds aligned with procedures", why: "Technical thresholds must match H6 business control thresholds. Misalignment = control gap.", controlRef: "2.9" },
      { dim: "SD-3", label: "Alert response evidence", why: "Alerts without response evidence suggest monitoring is passive. Must show investigation and action.", controlRef: "2.9" },
      { dim: "SD-4", label: "Daily reconciliation executed", why: "Reconciliation process (H6) must have daily execution evidence. Missing days = detection gap.", controlRef: "2.9" },
      { dim: "SD-5", label: "Session tracking active", why: "Session number tracking prevents replay attacks and supports reconciliation accuracy.", controlRef: "2.9" },
    ],
    reductionNote: "Technical implementation evidence for H6 procedures. AI cross-validates monitoring thresholds against H6 dual auth thresholds."
  },
  // ── BUSINESS GOVERNANCE (Advisory) ──
  {
    id: "H8", order: 8, name: "RMA Management Procedures & Review",
    priority: "MEDIUM", type: "Process Documentation / RMA Review Records",
    isAdvisory: true,
    controls: [{ id: "2.11A", name: "RMA Business Controls", ma: "A" }],
    description: "RMA relationship management procedures: due diligence, annual review evidence, and process for adding/removing RMA authorizations.",
    inputs: [
      { id: "rma_procedures", label: "RMA Management Procedures Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "annual_review", label: "Annual RMA Review Records", type: "file", required: true, accept: ".pdf,.xlsx,.docx" },
      { id: "auth_list", label: "Current RMA Authorization List", type: "file", required: true, accept: ".xlsx,.pdf,.csv" },
      { id: "chk_procedures", label: "RMA management procedures documented and approved", type: "checkbox", required: true },
      { id: "chk_due_diligence", label: "Due diligence process for new RMA relationships", type: "checkbox", required: true },
      { id: "chk_annual", label: "Annual review of existing RMA relationships completed", type: "checkbox", required: true },
      { id: "chk_removal", label: "Process for removing obsolete RMA relationships defined", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "RMA procedures documented", why: "Undocumented RMA management = ad-hoc relationship decisions. Process must be formal.", controlRef: "2.11A" },
      { dim: "SD-2", label: "Due diligence for new relationships", why: "Adding counterparties without vetting creates exposure to fraudulent entities.", controlRef: "2.11A" },
      { dim: "SD-3", label: "Annual review completed", why: "Stale RMA relationships persist without review. Annual cleanup removes unnecessary exposure.", controlRef: "2.11A" },
      { dim: "SD-4", label: "Obsolete relationship removal process", why: "Inactive counterparties with active RMA = unnecessary attack surface.", controlRef: "2.11A" },
    ],
    reductionNote: "Advisory control (2.11A). Demonstrates diligence in business relationship management."
  },
  {
    id: "H9", order: 9, name: "Risk Assessment & Risk Register",
    priority: "MEDIUM", type: "Risk Assessment / Risk Register / Treatment Plan",
    isAdvisory: true,
    controls: [{ id: "7.4A", name: "Scenario Risk Assessment", ma: "A" }],
    description: "SWIFT-specific risk assessment methodology and risk register: scenario analysis, risk ratings, treatment decisions, and residual risk acceptance.",
    hasMultiInputTypes: true,
    multiInputGuidance: {
      methodology: {
        label: "Risk Assessment Methodology",
        expectations: [
          "Risk identification approach (threats × vulnerabilities × impact)",
          "Likelihood and impact rating scales with definitions",
          "Risk scoring formula and threshold definitions",
          "Treatment decision framework (accept/mitigate/transfer/avoid)",
          "Residual risk acceptance criteria and authority levels",
        ],
      },
      register: {
        label: "Risk Register (Spreadsheet)",
        expectations: [
          "SWIFT-specific risk scenarios (minimum 10+)",
          "Per-risk: likelihood, impact, inherent risk score",
          "Per-risk: treatment decision with justification",
          "Per-risk: residual risk after treatment",
          "Management acceptance sign-off for accepted risks",
        ],
      },
    },
    inputs: [
      { id: "methodology", label: "Risk Assessment Methodology Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "risk_register", label: "SWIFT Risk Register", type: "file", required: true, accept: ".xlsx,.pdf,.csv" },
      { id: "treatment_plan", label: "Risk Treatment Plan (if separate)", type: "file", required: false, accept: ".pdf,.docx,.xlsx" },
      { id: "mgmt_acceptance", label: "Management Risk Acceptance Sign-off", type: "file", required: true, accept: ".pdf,.docx,.png" },
      { id: "chk_methodology", label: "Risk assessment methodology documented", type: "checkbox", required: true },
      { id: "chk_swift_scenarios", label: "SWIFT-specific risk scenarios analyzed (10+)", type: "checkbox", required: true },
      { id: "chk_ratings", label: "Risk ratings applied consistently with defined scales", type: "checkbox", required: true },
      { id: "chk_treatment", label: "Treatment decisions documented per risk (accept/mitigate/transfer/avoid)", type: "checkbox", required: true },
      { id: "chk_acceptance", label: "Residual risk acceptance by management with sign-off", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Methodology documented", why: "Ad-hoc risk assessment produces inconsistent results. Formal methodology required.", controlRef: "7.4A" },
      { dim: "SD-2", label: "SWIFT-specific scenarios analyzed", why: "Generic risk registers miss SWIFT-specific threats. Must include SWIFT scenarios.", controlRef: "7.4A" },
      { dim: "SD-3", label: "Consistent risk ratings", why: "Inconsistent scoring undermines risk prioritization. Scales must be defined and applied uniformly.", controlRef: "7.4A" },
      { dim: "SD-4", label: "Treatment decisions documented", why: "Risk without treatment decision = unmanaged risk. Each risk needs a documented decision.", controlRef: "7.4A" },
      { dim: "SD-5", label: "Management acceptance with sign-off", why: "Residual risk must be formally accepted by management. Missing sign-off = unauthorized risk.", controlRef: "7.4A" },
    ],
    reductionNote: "Advisory control (7.4A). Multi-input guidance: methodology document + risk register have different expectations."
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
  const isAdvisory = ctrl.ma === "A";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ background: isAdvisory ? "#f1f5f9" : "#fef3c7", borderColor: isAdvisory ? "#94a3b8" : "#f59e0b", color: isAdvisory ? "#475569" : "#92400e" }}>
      <span className="font-bold">{ctrl.id}</span>
      <span className="opacity-60">{ctrl.ma}</span>
    </span>
  );
}

// ── MAIN COMPONENT ──
export default function DomainHIntake() {
  const [activeItem, setActiveItem] = useState("H1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [expandedMultiInput, setExpandedMultiInput] = useState(false);

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
    (item.inputs || []).forEach(inp => {
      if (!inp.required) return;
      total++;
      const key = `${item.id}.${inp.id}`;
      if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
    });
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  const weights = { H1: 15, H2: 12, H3: 8, H4: 12, H5: 12, H6: 13, H7: 13, H8: 7, H9: 8 };
  const overallCompletion = useMemo(() => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  const controlScores = useMemo(() => {
    const controlItems = {
      "7.1": ["H1","H2","H3"], "7.2": ["H4","H5"],
      "2.9": ["H6","H7"], "2.11A": ["H8"], "7.4A": ["H9"]
    };
    const scores = {};
    Object.entries(controlItems).forEach(([ctrl, ids]) => {
      const avg = ids.reduce((s, id) => s + (itemCompletions[id] || 0), 0) / ids.length;
      scores[ctrl] = Math.round(avg);
    });
    return scores;
  }, [itemCompletions]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  const renderInput = (inp) => {
    const key = `${activeItemData.id}.${inp.id}`;
    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/30'}`}>
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
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none">
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
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none" />
      </div>
    );
  };

  const getMissingInputs = (item) => {
    return item.inputs.filter(inp => {
      if (!inp.required) return false;
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
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)", color: "white" }}>H</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Policies & Governance</h1>
                <p className="text-slate-400 text-xs">9 evidence items · 5 controls (3M + 2A)</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1 flex-wrap">
                {Object.entries(controlScores).map(([ctrl, score]) => {
                  const isAdv = ctrl.includes("A");
                  return (
                    <div key={ctrl} className="h-5 rounded text-xs font-bold flex items-center justify-center text-white px-1.5"
                      style={{ background: getStatusColor(score), opacity: isAdv ? 0.7 : 1 }} title={`${ctrl}: ${score}%`}>
                      {ctrl}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)", boxShadow: "0 2px 12px rgba(8,145,178,0.3)" }}>
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
              <div key={group.name} className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider mb-1.5 px-2 flex items-center gap-2" style={{ color: group.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                  {group.name}
                </div>
                {EVIDENCE_ITEMS.filter(it => group.items.includes(it.id)).map(item => {
                  const pct = itemCompletions[item.id];
                  const active = activeItem === item.id;
                  const color = getStatusColor(pct);
                  return (
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); setExpandedMultiInput(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg mb-0.5 transition-all ${active ? 'ring-1 ring-cyan-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#ecfeff" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 90 }}>{item.name.length > 20 ? item.name.slice(0,18)+"…" : item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold shrink-0 ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : item.isAdvisory ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                          {item.priority === 'CRITICAL' ? 'C' : item.priority === 'HIGH' ? 'H' : item.isAdvisory ? 'A' : 'M'}
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

            {/* Governance flow */}
            <div className="mt-1 p-2 rounded-lg border border-cyan-100 bg-cyan-50/50">
              <div className="text-xs font-semibold text-cyan-700 mb-1">Evidence Flow</div>
              <div className="text-xs text-cyan-600 leading-relaxed space-y-0.5">
                <div>H1 plan → H2 test → H3 share</div>
                <div>H4 program → H5 records</div>
                <div>H6 procedures → H7 monitoring</div>
                <div>H8 RMA · H9 risk (advisory)</div>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : activeItemData.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : activeItemData.isAdvisory ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                    {activeItemData.priority}{activeItemData.isAdvisory ? ' (Advisory)' : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">{activeItemData.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#ecfeff", border: "1px solid #a5f3fc", color: "#0e7490" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Advisory banner */}
              {activeItemData.isAdvisory && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/50 mb-5 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sky-600 text-lg">ℹ️</span>
                    <div>
                      <div className="text-sm font-semibold text-sky-800">Advisory Control</div>
                      <div className="text-xs text-sky-600 mt-0.5">This evidence supports an advisory control. Not mandatory for compliance but demonstrates security maturity and diligence.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Input Guidance (H6, H9) */}
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
                        <div key={key} className="p-3 rounded-lg border" style={{ borderColor: '#a5f3fc', background: '#ecfeff' }}>
                          <div className="text-xs font-bold mb-2 text-cyan-700">
                            {key === 'workflow' || key === 'methodology' ? '📊' : '📄'} {guide.label}
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
                  {activeItemData.inputs.map(inp => renderInput(inp))}
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
                        <span className="text-xs font-mono font-bold text-cyan-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 font-medium shrink-0 self-start">{s.controlRef}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PER-CONTROL SUFFICIENCY ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <button onClick={() => setExpandedPerControl(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                  <h3 className="font-semibold text-slate-700 text-sm">Control Sufficiency Requirements</h3>
                  <span className="text-slate-400">{expandedPerControl[activeItemData.id] ? '▲' : '▼'}</span>
                </button>
                {expandedPerControl[activeItemData.id] && (
                  <div className="px-5 py-3 border-t border-slate-100">
                    {activeItemData.controls.map(ctrl => {
                      const score = controlScores[ctrl.id] || 0;
                      const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === ctrl.id));
                      return (
                        <div key={ctrl.id} className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <ControlBadge ctrl={ctrl} />
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 pl-1 mb-1">{ctrl.name}</p>
                          <div className="text-xs text-slate-400 pl-1">
                            Requires: {items.map(it => it.id).join(" + ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── EVALUATE ── */}
              <div className="flex justify-center mb-5">
                <button onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)", boxShadow: "0 4px 20px rgba(8,145,178,0.25)" }}>
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
                                {inp.type === "file" ? "Upload required evidence file." : inp.type === "checkbox" ? "Confirm this attestation." : "Complete this required field."}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Cross-reference notes per item */}
                        {(activeItemData.id === "H1" || activeItemData.id === "H2" || activeItemData.id === "H3") && (
                          <div className="mt-2 p-3 rounded-lg border border-cyan-200 bg-cyan-50">
                            <div className="text-xs text-cyan-700">
                              <span className="font-bold">Cross-reference:</span> {activeItemData.id === "H1" ? "Communication plan validated against H3 (ISAC participation). Contact list validated for currency." : activeItemData.id === "H2" ? "Exercise date validated against 12-month window. Findings cross-referenced with H1 plan updates." : "ISAC participation validated against H1 communication plan references."}
                            </div>
                          </div>
                        )}
                        {(activeItemData.id === "H4" || activeItemData.id === "H5") && (
                          <div className="mt-2 p-3 rounded-lg border border-violet-200 bg-violet-50">
                            <div className="text-xs text-violet-700">
                              <span className="font-bold">Cross-reference:</span> {activeItemData.id === "H4" ? "Training scope cross-referenced against C2 (privileged account inventory) for personnel coverage." : "Completion records cross-referenced against C2 privileged accounts and H4 training scope. Gaps flagged per individual."}
                            </div>
                          </div>
                        )}
                        {(activeItemData.id === "H6" || activeItemData.id === "H7") && (
                          <div className="mt-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                            <div className="text-xs text-emerald-700">
                              <span className="font-bold">Cross-reference:</span> {activeItemData.id === "H6" ? "Transaction control procedures validated for completeness across all 6 control types." : "Monitoring thresholds cross-validated against H6 dual authorization thresholds. Reconciliation records checked for daily coverage."}
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
            {[
              { id: "7.1", name: "Cyber Incident Response", ma: "M", items: "H1 + H2 + H3" },
              { id: "7.2", name: "Security Training", ma: "M", items: "H4 + H5" },
              { id: "2.9", name: "Transaction Business Controls", ma: "M", items: "H6 + H7" },
              { id: "2.11A", name: "RMA Business Controls", ma: "A", items: "H8" },
              { id: "7.4A", name: "Scenario Risk Assessment", ma: "A", items: "H9" },
            ].map(ctrl => {
              const score = controlScores[ctrl.id] || 0;
              const isAdv = ctrl.ma === "A";
              return (
                <div key={ctrl.id} className={`mb-2.5 p-2.5 rounded-lg border ${isAdv ? 'border-slate-100 bg-slate-50/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-700">{ctrl.id} <span className={isAdv ? "text-slate-400" : "text-amber-600"}>{ctrl.ma}</span></span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{score}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1.5 leading-snug">{ctrl.name}</div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: getStatusColor(score), opacity: isAdv ? 0.7 : 1 }} />
                  </div>
                  <div className="text-xs text-slate-400">{ctrl.items}</div>
                </div>
              );
            })}

            {/* Per-item quick status */}
            <div className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Per-Item Status</div>
            {EVIDENCE_ITEMS.map(item => {
              const pct = itemCompletions[item.id];
              return (
                <div key={item.id} className="mb-1 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{item.id}</span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: getStatusColor(pct) }} />
                  </div>
                </div>
              );
            })}

            {/* Cross-domain */}
            <div className="mt-3 p-2 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="text-xs font-semibold text-amber-700 mb-1">Cross-Domain</div>
              <div className="space-y-0.5">
                <div className="text-xs text-amber-600">H4/H5 → C2 personnel</div>
                <div className="text-xs text-amber-600">H1 → H3 ISAC process</div>
                <div className="text-xs text-amber-600">H6 → H7 thresholds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
