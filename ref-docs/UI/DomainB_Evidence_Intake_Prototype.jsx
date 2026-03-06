import { useState, useCallback, useMemo } from "react";

// ── DOMAIN B DATA MODEL (from Canonical Evidence Model & Sufficiency Matrix) ──
const EVIDENCE_ITEMS = [
  {
    id: "B1", order: 1, name: "OS Hardening Configuration",
    priority: "CRITICAL", type: "Config Exports / Screenshots",
    perSystem: true,
    controls: [
      { id: "1.2", name: "OS Privileged Account Control", ma: "M" },
      { id: "2.3", name: "System Hardening", ma: "M" },
    ],
    controlCount: 2,
    description: "Per-system OS hardening evidence: privileged accounts, services, USB restrictions, CIS/SWIFT SG baselines.",
    inputs: [
      { id: "standard", label: "Hardening Standard Used", type: "select", required: true, scope: "global", options: ["CIS Benchmark","SWIFT Security Guidance","Combined CIS + SWIFT SG","Custom baseline"] },
      { id: "config_file", label: "Config Export / CIS Scan Result", type: "file", required: true, scope: "per-system", accept: ".pdf,.txt,.csv,.xlsx,.html" },
      { id: "priv_accounts", label: "Privileged Account List", type: "file", required: true, scope: "per-system", accept: ".xlsx,.csv,.pdf" },
      { id: "chk_services", label: "Unnecessary services identified and disabled", type: "checkbox", required: true, scope: "per-system" },
      { id: "chk_usb", label: "USB/removable media access restricted", type: "checkbox", required: true, scope: "per-system" },
      { id: "chk_privesc", label: "Privilege elevation controls (sudo/UAC) configured and logged", type: "checkbox", required: true, scope: "per-system" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Privileged account list with restriction evidence", why: "Control 1.2 requires documented, justified privileged accounts on each SWIFT system." },
      { dim: "SD-2", label: "Unnecessary services disabled", why: "Control 2.3 requires attack surface reduction by disabling unused services." },
      { dim: "SD-3", label: "USB/removable media restricted", why: "Removable media is a common malware vector. Must be blocked on SWIFT systems." },
      { dim: "SD-4", label: "CIS/SWIFT SG baseline applied", why: "Configuration must reference a recognized baseline. Generic hardening is insufficient." },
      { dim: "SD-5", label: "Privilege elevation controls configured", why: "Admin elevation must be controlled and logged (sudo, UAC) per control 1.2." },
    ],
    reductionNote: "Same evidence serves both control 1.2 (privileged accounts) and 2.3 (system hardening). 50% reduction."
  },
  {
    id: "B2", order: 2, name: "SWIFT Application Security Config",
    priority: "CRITICAL", type: "Config Exports / SG Checklist",
    controls: [
      { id: "2.6", name: "Operator Session Confidentiality", ma: "M" },
      { id: "2.10", name: "Application Hardening", ma: "M" },
    ],
    controlCount: 2,
    description: "SWIFT application-level settings: session encryption, GUI access, timeouts, whitelisting, SG hardening.",
    inputs: [
      { id: "app_config", label: "SWIFT Application Config Export(s)", type: "file", required: true, accept: ".pdf,.txt,.xlsx,.zip" },
      { id: "sg_checklist", label: "SWIFT Security Guidance Checklist", type: "file", required: true, accept: ".pdf,.xlsx" },
      { id: "chk_tls", label: "TLS/SSH encryption configured for all operator connections", type: "checkbox", required: true },
      { id: "tls_detail", label: "TLS Version & Cipher Suite Used", type: "text", required: true, placeholder: "e.g., TLS 1.2, AES-256-GCM" },
      { id: "timeout_val", label: "Session Timeout (minutes)", type: "text", required: true, placeholder: "e.g., 15" },
      { id: "chk_timeout", label: "Session timeout enforced (not just configured)", type: "checkbox", required: true },
      { id: "gui_access", label: "GUI Access Security Settings", type: "file", required: false, accept: ".pdf,.png,.jpg" },
      { id: "chk_whitelist", label: "Application whitelisting enforced on SWIFT systems", type: "checkbox", required: true },
      { id: "swift_version", label: "SWIFT Software Version", type: "text", required: true, placeholder: "e.g., Alliance Gateway 7.8.20" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Encrypted session config (TLS/SSH) for operator connections", why: "Control 2.6 requires proof that session encryption is active, not just available." },
      { dim: "SD-2", label: "GUI access security settings documented", why: "SWIFT GUI access must have IP restrictions and role-based access controls." },
      { dim: "SD-3", label: "Session timeout enforced", why: "Idle sessions are a security risk. Must demonstrate enforcement, not just configuration." },
      { dim: "SD-4", label: "Application whitelisting active", why: "Control 2.10 requires only approved applications run on SWIFT systems." },
      { dim: "SD-5", label: "Hardening per SWIFT Security Guidance", why: "Control 2.10 requires referencing specific SG sections. Generic hardening is insufficient." },
    ],
    reductionNote: "Single config set covers operator session confidentiality (2.6) and application hardening (2.10). 50% reduction."
  },
  {
    id: "B7", order: 3, name: "MFA Configuration Evidence",
    priority: "CRITICAL", type: "Config Screenshots / Admin Export",
    perAccessPoint: true,
    controls: [
      { id: "4.2", name: "Multi-Factor Authentication", ma: "M" },
    ],
    controlCount: 1,
    description: "Per-access-point MFA evidence for operator, admin, remote access, and sensitive operations.",
    inputs: [
      { id: "mfa_vendor", label: "MFA Solution (Vendor/Product)", type: "text", required: true, placeholder: "e.g., RSA SecurID, Duo Security" },
      { id: "mfa_version", label: "MFA Solution Version", type: "text", required: true },
      { id: "mfa_config", label: "MFA Admin Console Export", type: "file", required: true, accept: ".pdf,.png,.xlsx" },
      { id: "breakglass", label: "Break-Glass Procedure Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "chk_samedev", label: "Same-device risk assessment completed (if applicable)", type: "checkbox", required: false },
      { id: "samedev_detail", label: "Same-Device Mitigation Description", type: "textarea", required: false, placeholder: "If software tokens reside on same device as SWIFT access, describe risk mitigation per NIST SP 800-63B." },
    ],
    sufficiency: [
      { dim: "SD-1", label: "MFA enforced for all interactive access", why: "SWIFT requires MFA on all interactive SWIFT system access. Missing one access point = audit finding." },
      { dim: "SD-2", label: "MFA types appropriate per NIST SP 800-63B", why: "Hardware tokens preferred. Software tokens on same device require documented risk assessment." },
      { dim: "SD-3", label: "All access points covered", why: "Operator PCs, admin consoles, jump servers, VPN, remote — all must be in the coverage matrix." },
      { dim: "SD-4", label: "Break-glass procedure documented", why: "Emergency access without MFA must be pre-planned, authorized, and reviewed. Undocumented = finding." },
      { dim: "SD-5", label: "Same-device risk addressed", why: "Software tokens on the same SWIFT device weaken MFA. NIST requires documented risk assessment." },
    ],
    reductionNote: "Control-specific for 4.2. Paired with C1 access control policy for comprehensive coverage."
  },
  {
    id: "B3", order: 4, name: "Encryption Configuration",
    priority: "HIGH", type: "Config Exports / Cert Details",
    controls: [
      { id: "2.1", name: "Internal Data Flow Security", ma: "M" },
      { id: "2.4A", name: "Back Office Data Flow Security", ma: "A" },
      { id: "2.5A", name: "External Transmission Data Protection", ma: "A" },
      { id: "2.6", name: "Operator Session Confidentiality", ma: "M" },
    ],
    controlCount: 4,
    description: "Highest-reuse item in Domain B. One encryption evidence set satisfies 4 data security controls. 75% reduction.",
    inputs: [
      { id: "tls_config", label: "TLS/SSL Configuration Export", type: "file", required: true, accept: ".txt,.pdf,.csv,.conf" },
      { id: "cert_inventory", label: "Certificate Inventory", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "cipher_list", label: "Active Cipher Suite Listing", type: "file", required: true, accept: ".txt,.pdf,.csv" },
      { id: "chk_atrest", label: "All SWIFT data at rest outside secure zone is encrypted", type: "checkbox", required: true },
      { id: "atrest_evidence", label: "At-Rest Encryption Evidence", type: "file", required: true, accept: ".pdf,.png,.txt" },
      { id: "cert_expiry", label: "Nearest Certificate Expiry Date", type: "date", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "TLS version ≥1.2 per connection type", why: "TLS 1.0/1.1 are deprecated. All SWIFT connections must use minimum TLS 1.2." },
      { dim: "SD-2", label: "Strong cipher suites only", why: "Weak ciphers (RC4, DES, MD5) must be disabled. Only AES-GCM, SHA-256+ permitted." },
      { dim: "SD-3", label: "Certificates valid and managed", why: "Expired or self-signed certificates in production are audit findings." },
      { dim: "SD-4", label: "At-rest encryption for data outside secure zone", why: "Backups and archives containing SWIFT data must be encrypted at rest." },
      { dim: "SD-5", label: "Per-flow encryption config matches A3 data flow diagram", why: "Every data flow crossing zone boundaries must have matching encryption evidence." },
    ],
    reductionNote: "One encryption config set satisfies 4 data security controls across 2 SWIFT principles. 75% reduction."
  },
  {
    id: "B6", order: 5, name: "Hardening Baseline Comparison",
    priority: "HIGH", type: "Scan Report / Deviation Log",
    controls: [
      { id: "2.3", name: "System Hardening", ma: "M" },
      { id: "2.10", name: "Application Hardening", ma: "M" },
      { id: "6.2", name: "Software Integrity", ma: "M" },
    ],
    controlCount: 3,
    description: "Formal comparison against CIS/SWIFT SG baselines. Validates B1 and B2 configurations. 67% reduction.",
    inputs: [
      { id: "baseline_std", label: "Baseline Standard Used", type: "select", required: true, options: ["CIS Benchmark","SWIFT Security Guidance","Combined CIS + SWIFT SG"] },
      { id: "baseline_ver", label: "Baseline Version", type: "text", required: true, placeholder: "e.g., CIS v3.1, SWIFT SG 2025" },
      { id: "scan_report", label: "Compliance Scan Report", type: "file", required: true, accept: ".pdf,.html,.csv,.xlsx" },
      { id: "deviation_log", label: "Deviation Log with Justifications", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "chk_integrity", label: "SWIFT software integrity verified against vendor checksums", type: "checkbox", required: true },
      { id: "software_list", label: "Authorized Software List", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Recognized baseline standard used", why: "CIS or SWIFT SG required. Custom baselines without recognized reference are insufficient." },
      { dim: "SD-2", label: "Per-system compliance scores", why: "Every SWIFT system must be scanned. Missing systems = gap." },
      { dim: "SD-3", label: "Deviations listed with justification", why: "Deviations without business justification are audit findings." },
      { dim: "SD-4", label: "Application integrity verification results", why: "Control 6.2 requires SWIFT binaries verified against vendor-approved versions." },
      { dim: "SD-5", label: "Authorized software list maintained", why: "Control 6.2 requires current, dated authorized software list for SWIFT systems." },
    ],
    reductionNote: "CIS/SWIFT SG baseline comparison covers 3 mandatory hardening and integrity controls. 67% reduction."
  },
  {
    id: "B5", order: 6, name: "Password Policy Configuration",
    priority: "HIGH", type: "Policy + Config Exports",
    perSystemType: true,
    controls: [
      { id: "4.1", name: "Password Policy", ma: "M" },
    ],
    controlCount: 1,
    description: "Password policy settings enforced across all SWIFT systems: length, complexity, expiry, lockout, history.",
    inputs: [
      { id: "policy_doc", label: "Password Policy Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "config_evidence", label: "Per-System-Type Config Evidence", type: "file", required: true, accept: ".pdf,.png,.xlsx" },
      { id: "min_length", label: "Minimum Password Length", type: "text", required: true, placeholder: "SWIFT recommends ≥10" },
      { id: "chk_complexity", label: "Complexity requirements enforced (upper, lower, numeric, special)", type: "checkbox", required: true },
      { id: "max_validity", label: "Maximum Validity Period (days)", type: "text", required: true, placeholder: "SWIFT recommends ≤90" },
      { id: "lockout", label: "Account Lockout Threshold (attempts)", type: "text", required: true, placeholder: "SWIFT recommends ≤5" },
      { id: "history", label: "Password History (remembered)", type: "text", required: true, placeholder: "SWIFT recommends ≥12" },
      { id: "token_pin", label: "Token/Device PIN Requirements", type: "text", required: false, placeholder: "If hardware tokens used" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Minimum length ≥10 characters", why: "SWIFT minimum recommendation. Below this = audit warning." },
      { dim: "SD-2", label: "Complexity enforced", why: "Mixed case + numeric + special character combination required." },
      { dim: "SD-3", label: "Maximum validity ≤90 days", why: "Passwords must expire within 90 days maximum." },
      { dim: "SD-4", label: "Account lockout ≤5 attempts", why: "Prevents brute-force attacks against SWIFT accounts." },
      { dim: "SD-5", label: "Password history ≥12", why: "Prevents password reuse across recent history." },
      { dim: "SD-6", label: "All system types covered with enforcement evidence", why: "Policy alone is insufficient. Must show enforcement per system type." },
    ],
    reductionNote: "Control-specific for 4.1. Single policy + per-system enforcement evidence."
  },
  {
    id: "B8", order: 7, name: "Operator Session Security Config",
    priority: "HIGH", type: "Config Exports / Screenshots",
    controls: [
      { id: "2.6", name: "Operator Session Confidentiality", ma: "M" },
    ],
    controlCount: 1,
    description: "Detailed session management: encryption, timeouts, concurrent limits, jump servers, session logging. Supplements B2.",
    inputs: [
      { id: "session_encrypt", label: "Session Encryption Configuration", type: "file", required: true, accept: ".pdf,.txt,.png" },
      { id: "encrypt_detail", label: "Protocol & Version per Connection Type", type: "text", required: true, placeholder: "e.g., SSH 2.0 for admin, TLS 1.3 for GUI" },
      { id: "timeout_config", label: "Session Timeout Configuration Evidence", type: "file", required: true, accept: ".pdf,.png,.txt" },
      { id: "timeout_val", label: "Timeout Value (minutes)", type: "text", required: true, placeholder: "Recommended ≤30" },
      { id: "chk_concurrent", label: "Concurrent session limits enforced", type: "checkbox", required: true },
      { id: "concurrent_max", label: "Max Concurrent Sessions", type: "text", required: false, placeholder: "e.g., 2" },
      { id: "jump_server", label: "Jump Server Configuration (if used)", type: "file", required: false, accept: ".pdf,.txt,.png" },
      { id: "chk_logging", label: "All operator sessions are logged", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All operator connection types encrypted", why: "Any unencrypted session is an immediate audit failure for control 2.6." },
      { dim: "SD-2", label: "Session timeouts enforced (≤30 min)", why: "Idle sessions are a security risk. Must be enforced, not just configured." },
      { dim: "SD-3", label: "Concurrent session limits in place", why: "Unlimited concurrent sessions can mask unauthorized access." },
      { dim: "SD-4", label: "Jump server properly configured (if used)", why: "Jump servers are the single point of session control when used." },
      { dim: "SD-5", label: "Session logs retained", why: "Session audit trail required for incident investigation." },
    ],
    reductionNote: "Supplements B2 with detailed session-level controls for 2.6."
  },
  {
    id: "B4", order: 8, name: "Virtualisation/Cloud Platform Config",
    priority: "HIGH*", type: "Config Exports / Hypervisor Settings",
    conditional: true,
    controls: [
      { id: "1.3", name: "Virtualisation/Cloud Platform Protection", ma: "A" },
    ],
    controlCount: 1,
    description: "Conditional. Only collected if virtualised SWIFT components exist. Advisory control (1.3).",
    inputs: [
      { id: "platform_config", label: "Hypervisor/Cloud Platform Config", type: "file", required: true, accept: ".pdf,.txt,.xlsx,.png" },
      { id: "chk_isolation", label: "SWIFT VMs are isolated from non-SWIFT workloads", type: "checkbox", required: true },
      { id: "hardening_doc", label: "Platform Hardening Documentation", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "admin_access", label: "Platform Admin Access Controls", type: "file", required: true, accept: ".pdf,.xlsx,.png" },
      { id: "chk_resources", label: "No shared CPU/memory/storage with non-SWIFT workloads", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "SWIFT VMs isolated from non-SWIFT workloads", why: "Co-hosted VMs enable lateral movement. SWIFT mandates separation." },
      { dim: "SD-2", label: "Platform hardened per recognized baseline", why: "Unhardened hypervisors are a critical attack surface." },
      { dim: "SD-3", label: "Platform admin access restricted and logged", why: "Hypervisor admin = root access to all VMs." },
      { dim: "SD-4", label: "VM escape protections in place", why: "VM escape vulnerabilities can compromise the entire platform." },
      { dim: "SD-5", label: "Resource isolation confirmed", why: "Shared resources enable side-channel attacks." },
    ],
    reductionNote: "Advisory control 1.3. Only if virtualised. Paired with A2 inventory for VM-host mapping."
  },
];

const ALL_CONTROLS = ["1.2","1.3","2.1","2.3","2.4A","2.5A","2.6","2.10","4.1","4.2","6.2"];
const SUB_GROUPS = [
  { name: "Hardening & Baselines", items: ["B1","B2","B6"], color: "#4f46e5" },
  { name: "Encryption & Sessions", items: ["B3","B8"], color: "#0e7490" },
  { name: "Credential Protection", items: ["B5","B7"], color: "#b45309" },
  { name: "Platform (Conditional)", items: ["B4"], color: "#64748b" },
];

const SWIFT_SYSTEMS = ["SWIFT-GW-01","SWIFT-MSG-01","SWIFT-MSG-02","OP-PC-01","OP-PC-02"];
const ACCESS_POINTS = [
  { name: "Operator PC — Alliance GUI", type: "Interactive" },
  { name: "Jump Server — RDP", type: "Interactive" },
  { name: "Admin Console — SSH", type: "Admin" },
  { name: "VPN — Remote Access", type: "Remote" },
];

function getStatusColor(pct) {
  if (pct >= 90) return "#059669";
  if (pct >= 60) return "#d97706";
  if (pct > 0) return "#dc2626";
  return "#94a3b8";
}
function getStatusLabel(pct) {
  if (pct >= 90) return "Pass";
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
  const isMandatory = ctrl.ma === "M" || ctrl.ma === "M+A";
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

export default function DomainBIntake() {
  const [activeItem, setActiveItem] = useState("B1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [mfaMatrix, setMfaMatrix] = useState(() => {
    const m = {};
    ACCESS_POINTS.forEach(ap => { m[ap.name] = { mfaType: "", enforced: false, evidenceUploaded: false }; });
    return m;
  });

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
    if (item.id === "B7") {
      ACCESS_POINTS.forEach(ap => {
        total += 2;
        if (mfaMatrix[ap.name]?.enforced) filled++;
        if (mfaMatrix[ap.name]?.evidenceUploaded) filled++;
      });
    }
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles, mfaMatrix]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  const weights = { B1: 20, B2: 18, B7: 18, B3: 15, B6: 12, B5: 8, B8: 6, B4: 3 };
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
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
            {uploaded ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span className="text-sm text-emerald-700 font-medium">Uploaded</span>
                <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => { const n={...prev}; delete n[key]; return n; }); }}
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
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none">
            <option value="">Select...</option>
            {inp.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    if (inp.type === "textarea") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label}</label>
          <textarea value={formData[key] || ""} onChange={e => updateField(key, e.target.value)} rows={2}
            placeholder={inp.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-y" />
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
        <input type={inp.type === "date" ? "date" : "text"} value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
          placeholder={inp.placeholder}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none" />
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1e293b" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}>B</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">System Hardening & Configuration</h1>
                <p className="text-slate-400 text-xs">8 evidence items · 11 controls · 4 sub-groups</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1 flex-wrap">
                {ALL_CONTROLS.map(cid => (
                  <div key={cid} className="w-8 h-5 rounded text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: getStatusColor(controlScores[cid]) }} title={`${cid}: ${controlScores[cid]}%`}>{cid.replace("A","")}</div>
                ))}
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", boxShadow: "0 2px 12px rgba(79,70,229,0.3)" }}>
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
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-indigo-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#eef2ff" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 110 }}>{item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : item.priority === 'HIGH*' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
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
                  {activeItemData.conditional && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Conditional</span>}
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

              {/* System Selector (for per-system items) */}
              {activeItemData.perSystem && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">SWIFT Systems (from A2 Inventory)</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedSystem("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSystem === "all" ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      All Systems ({SWIFT_SYSTEMS.length})
                    </button>
                    {SWIFT_SYSTEMS.map(sys => {
                      const sysComplete = activeItemData.inputs.filter(i => i.required && i.scope === "per-system").every(inp => {
                        const k = `${activeItemData.id}.${sys}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      });
                      return (
                        <button key={sys} onClick={() => setSelectedSystem(sys)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedSystem === sys ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${sysComplete ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {sys}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MFA Access Point Matrix (for B7) */}
              {activeItemData.perAccessPoint && (
                <div className="mb-4 p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-3">MFA Coverage Matrix — All SWIFT Access Points</div>
                  <div className="space-y-2">
                    {ACCESS_POINTS.map(ap => {
                      const data = mfaMatrix[ap.name] || {};
                      return (
                        <div key={ap.name} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-700">{ap.name}</div>
                            <div className="text-xs text-slate-400">{ap.type}</div>
                          </div>
                          <select value={data.mfaType || ""} onChange={e => setMfaMatrix(prev => ({...prev, [ap.name]: {...prev[ap.name], mfaType: e.target.value}}))}
                            className="px-2 py-1 rounded text-xs bg-white border border-slate-300 text-slate-600">
                            <option value="">MFA Type...</option>
                            <option value="Hardware token">Hardware token</option>
                            <option value="Software token">Software token</option>
                            <option value="Push notification">Push notification</option>
                            <option value="Biometric">Biometric</option>
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={data.enforced} onChange={e => { setMfaMatrix(prev => ({...prev, [ap.name]: {...prev[ap.name], enforced: e.target.checked}})); setEvaluated(false); }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 bg-white" />
                            <span className="text-xs text-slate-500">Enforced</span>
                          </label>
                          <button onClick={() => { setMfaMatrix(prev => ({...prev, [ap.name]: {...prev[ap.name], evidenceUploaded: true}})); setEvaluated(false); }}
                            className={`px-2 py-1 rounded text-xs font-medium ${data.evidenceUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {data.evidenceUploaded ? "✓ Evidence" : "Upload"}
                          </button>
                        </div>
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
                      {activeItemData.inputs.filter(i => i.scope === "global").map(inp => renderInput(inp))}
                      {(selectedSystem === "all" ? SWIFT_SYSTEMS : [selectedSystem]).map(sys => (
                        <div key={sys} className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/30">
                          <div className="text-xs font-bold text-indigo-600 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />{sys}
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

              {/* ── SUFFICIENCY ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <button onClick={() => setExpandedSuff(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                  <h3 className="font-semibold text-slate-700 text-sm">Sufficiency Dimensions — What Will Be Evaluated</h3>
                  <span className="text-slate-400">{expandedSuff[activeItemData.id] ? '▲' : '▼'}</span>
                </button>
                {expandedSuff[activeItemData.id] && (
                  <div className="p-5 border-t border-slate-100">
                    {activeItemData.sufficiency.map((s, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg mb-1" style={{ background: i%2 === 0 ? "#f8fafc" : "transparent" }}>
                        <span className="text-xs font-mono font-bold text-indigo-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── CONTROL MAPPINGS ── */}
              {activeItemData.controls.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700 text-sm">Per-Control Sufficiency</h3>
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

              {/* ── EVALUATE ── */}
              <div className="flex justify-center mb-5">
                <button onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 4px 20px rgba(79,70,229,0.25)" }}>
                  Evaluate Sufficiency for {activeItemData.id}
                </button>
              </div>

              {/* ── RESULTS ── */}
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
                        {activeItemData.inputs.filter(inp => {
                          if (!inp.required) return false;
                          if (activeItemData.perSystem && inp.scope === "per-system") {
                            return SWIFT_SYSTEMS.some(sys => {
                              const k = `${activeItemData.id}.${sys}.${inp.id}`;
                              return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
                            });
                          }
                          const k = `${activeItemData.id}.${inp.id}`;
                          return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
                        }).map(inp => (
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
                        {activeItemData.id === "B7" && ACCESS_POINTS.filter(ap => !mfaMatrix[ap.name]?.enforced || !mfaMatrix[ap.name]?.evidenceUploaded).length > 0 && (
                          <div className="flex gap-3 p-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <span className="text-amber-500">⚠</span>
                            <div>
                              <div className="text-sm font-medium text-slate-700">MFA Coverage Gaps</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {ACCESS_POINTS.filter(ap => !mfaMatrix[ap.name]?.enforced).map(ap => ap.name).join(", ")} — MFA not confirmed as enforced.
                              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
