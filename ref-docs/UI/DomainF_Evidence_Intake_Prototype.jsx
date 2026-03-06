import { useState, useCallback, useMemo } from "react";

// ── DOMAIN F DATA MODEL (from Canonical Evidence Model) ──
// Unique: All 4 items serve single control 2.8. Evidence is per-vendor.
const ALL_CONTROLS = ["2.8"];

// Default vendor list — user can add/remove. In production, seeded from A2 inventory.
const DEFAULT_VENDORS = [
  { id: "v1", name: "SWIFT Service Bureau", classification: "Outsourcing Agent", access: "Remote", swiftComponents: "Alliance Gateway, Alliance Lite2" },
  { id: "v2", name: "Cloud Hosting Provider", classification: "IT Provider", access: "Remote", swiftComponents: "SWIFT VMs, HSM" },
  { id: "v3", name: "Network Connectivity Provider", classification: "Connectivity Provider", access: "Remote", swiftComponents: "SWIFTNet Link" },
];

const VENDOR_CLASSIFICATIONS = [
  "Outsourcing Agent",
  "Connectivity Provider",
  "IT Provider (Hosting/Managed Services)",
  "Application Vendor",
  "Security Service Provider",
  "Other",
];

const CERTIFICATION_TYPES = [
  "SOC 2 Type II",
  "SOC 2 Type I",
  "ISO 27001",
  "PCI DSS",
  "SWIFT Shared Infrastructure (SIPS)",
  "CSA STAR",
  "Other",
  "None",
];

const EVIDENCE_ITEMS = [
  {
    id: "F1", order: 1, name: "Third-Party Vendor Inventory",
    priority: "CRITICAL", type: "Structured Spreadsheet / VMS Export",
    controls: [{ id: "2.8", name: "Outsourced Critical Activity Protection", ma: "M" }],
    controlCount: 1,
    description: "Complete inventory of all third parties with access to or management of SWIFT-related components. Foundation for all Domain F evidence.",
    isInventory: true,
    inputs: [
      { id: "vendor_export", label: "Vendor Management System Export (if available)", type: "file", required: false, accept: ".xlsx,.csv,.pdf" },
    ],
    perVendorInputs: [
      { id: "vendor_name", label: "Vendor Name", type: "text", required: true, placeholder: "Legal entity name" },
      { id: "service_desc", label: "Service Description", type: "text", required: true, placeholder: "e.g., Managed SWIFT Gateway operations" },
      { id: "classification", label: "SWIFT Classification", type: "select", required: true, options: VENDOR_CLASSIFICATIONS },
      { id: "swift_components", label: "SWIFT Components Accessed/Managed", type: "text", required: true, placeholder: "e.g., Alliance Gateway, HSM, SWIFTNet Link" },
      { id: "access_type", label: "Access Type", type: "select", required: true, options: ["Remote Only","On-site Only","Remote + On-site","No Direct Access (advisory only)"] },
      { id: "contract_start", label: "Contract Start Date", type: "date", required: true },
      { id: "contract_end", label: "Contract End / Renewal Date", type: "date", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All third parties identified", why: "Control 2.8 requires a complete inventory. Missing one vendor = unmanaged risk.", controlRef: "2.8" },
      { dim: "SD-2", label: "SWIFT components mapped per vendor", why: "Each vendor's access scope must be explicitly documented. Unclear scope = audit finding.", controlRef: "2.8" },
      { dim: "SD-3", label: "Classification correct per SWIFT definitions", why: "SWIFT defines specific categories (outsourcing agent, connectivity provider). Wrong classification = wrong requirements.", controlRef: "2.8" },
      { dim: "SD-4", label: "Access type documented", why: "Remote access carries different risk profile than on-site. Must be explicitly stated.", controlRef: "2.8" },
      { dim: "SD-5", label: "Contract dates current", why: "Expired contracts mean no contractual security obligations. Critical gap.", controlRef: "2.8" },
    ],
    perControlSufficiency: [
      { controlId: "2.8", requirement: "Complete vendor inventory with SWIFT components, classification, access type, and current contract dates for every third party." },
    ],
    reductionNote: "Foundation for all Domain F evidence. Defines the vendor scope for F2, F3, F4."
  },
  {
    id: "F2", order: 2, name: "Third-Party SLA & NDA Agreements",
    priority: "HIGH", type: "Contract Excerpts / SLA / NDA Documents",
    controls: [{ id: "2.8", name: "Outsourced Critical Activity Protection", ma: "M" }],
    controlCount: 1,
    description: "SLA and NDA documentation for each third party managing SWIFT-related components, defining standard of care and confidentiality obligations.",
    perVendorInputs: [
      { id: "sla_doc", label: "SLA Document / Security Schedule", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "nda_doc", label: "NDA Document", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "chk_security_soc", label: "SLA defines security standard of care", type: "checkbox", required: true },
      { id: "chk_swift_data", label: "NDA covers SWIFT-related data and systems", type: "checkbox", required: true },
      { id: "chk_cscf_align", label: "CSCF alignment requirements referenced in contract", type: "checkbox", required: true },
      { id: "chk_incident", label: "Incident notification obligations defined (timeline + process)", type: "checkbox", required: true },
      { id: "chk_audit_right", label: "Right to audit clause included", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "SLA defines security standard of care", why: "Without a defined standard, vendor cannot be held accountable for security practices.", controlRef: "2.8" },
      { dim: "SD-2", label: "NDA covers SWIFT-related data", why: "SWIFT data confidentiality must be contractually protected. Generic NDAs may be insufficient.", controlRef: "2.8" },
      { dim: "SD-3", label: "CSCF alignment referenced", why: "Vendor must acknowledge SWIFT CSCF requirements. Without this, compliance obligations are unclear.", controlRef: "2.8" },
      { dim: "SD-4", label: "Incident notification obligations", why: "Security incidents at vendor must be reported promptly. Timeline and process must be contractually defined.", controlRef: "2.8" },
      { dim: "SD-5", label: "Right to audit clause", why: "Without audit rights, you cannot verify vendor compliance claims. Essential for ongoing assurance.", controlRef: "2.8" },
    ],
    perControlSufficiency: [
      { controlId: "2.8", requirement: "Per-vendor SLA with security standard; NDA covering SWIFT data; CSCF alignment; incident notification; audit rights." },
    ],
    reductionNote: "Per-vendor contractual evidence. Each vendor requires its own SLA and NDA documentation."
  },
  {
    id: "F3", order: 3, name: "Third-Party Security Risk Assessments",
    priority: "HIGH", type: "Risk Assessment Reports / Questionnaires / Certifications",
    controls: [{ id: "2.8", name: "Outsourced Critical Activity Protection", ma: "M" }],
    controlCount: 1,
    description: "Security risk assessments for each SWIFT-related third party: initial assessment and periodic reviews. Includes certification evidence.",
    perVendorInputs: [
      { id: "initial_assessment", label: "Initial Risk Assessment Report", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "periodic_review", label: "Most Recent Periodic Review", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "questionnaire", label: "Security Questionnaire Responses", type: "file", required: false, accept: ".pdf,.docx,.xlsx" },
      { id: "certification", label: "Certification Evidence", type: "file", required: true, accept: ".pdf" },
      { id: "cert_type", label: "Certification Type", type: "select", required: true, options: CERTIFICATION_TYPES },
      { id: "cert_expiry", label: "Certification Expiry Date", type: "date", required: true },
      { id: "chk_initial", label: "Risk assessment performed at engagement start", type: "checkbox", required: true },
      { id: "chk_annual", label: "Periodic review performed (at least annually)", type: "checkbox", required: true },
      { id: "chk_baseline", label: "Assessment aligned with Outsourcing Agents Security Requirements Baseline", type: "checkbox", required: true },
      { id: "chk_risks", label: "Identified risks documented with mitigations", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Initial risk assessment performed", why: "Control 2.8 requires risk assessment at engagement start. Retroactive assessments indicate gap.", controlRef: "2.8" },
      { dim: "SD-2", label: "Annual periodic review completed", why: "Security posture changes. Annual review ensures continued compliance.", controlRef: "2.8" },
      { dim: "SD-3", label: "Aligned with SWIFT Outsourcing Baseline", why: "SWIFT provides specific outsourcing security requirements. Generic assessments miss SWIFT-specific risks.", controlRef: "2.8" },
      { dim: "SD-4", label: "Current certification (SOC 2 / ISO 27001 / etc.)", why: "Third-party certification provides independent assurance. Expired certs provide no assurance.", controlRef: "2.8" },
      { dim: "SD-5", label: "Identified risks with documented mitigations", why: "Risk without mitigation = accepted risk. Must be documented and approved.", controlRef: "2.8" },
    ],
    perControlSufficiency: [
      { controlId: "2.8", requirement: "Per-vendor initial + periodic risk assessment; SWIFT baseline alignment; current certification; documented risk mitigations." },
    ],
    reductionNote: "Per-vendor risk assessment evidence. Certification tracking prevents expiry surprises."
  },
  {
    id: "F4", order: 4, name: "Third-Party Ongoing Monitoring Evidence",
    priority: "HIGH", type: "SOC Reports / Audit Reports / Monitoring Dashboards",
    controls: [{ id: "2.8", name: "Outsourced Critical Activity Protection", ma: "M" }],
    controlCount: 1,
    description: "Evidence of ongoing monitoring of third-party security posture: SOC reports, audit findings, certification renewals, and incident tracking.",
    perVendorInputs: [
      { id: "soc_report", label: "Current SOC 2 Type II Report (or equivalent)", type: "file", required: true, accept: ".pdf" },
      { id: "annual_review", label: "Annual Security Posture Review", type: "file", required: true, accept: ".pdf,.docx,.xlsx" },
      { id: "cert_renewal", label: "Certification Renewal Tracking Evidence", type: "file", required: false, accept: ".pdf,.xlsx" },
      { id: "incident_log", label: "Vendor Incident History Log", type: "file", required: true, accept: ".pdf,.xlsx,.csv" },
      { id: "action_items", label: "Previous Assessment Action Items & Remediation", type: "file", required: true, accept: ".pdf,.xlsx,.docx" },
      { id: "soc_period", label: "SOC Report Coverage Period", type: "text", required: true, placeholder: "e.g., Jan 2025 — Dec 2025" },
      { id: "chk_soc_current", label: "SOC report covers the current assessment period", type: "checkbox", required: true },
      { id: "chk_annual", label: "Annual vendor security review completed", type: "checkbox", required: true },
      { id: "chk_certs_valid", label: "All vendor certifications currently valid", type: "checkbox", required: true },
      { id: "chk_incidents", label: "Vendor incidents tracked with resolution evidence", type: "checkbox", required: true },
      { id: "chk_actions", label: "Previous assessment findings resolved or in progress", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Current SOC 2 Type II report (or equivalent)", why: "SOC report must cover the current assessment period. Gaps in coverage = unmonitored period.", controlRef: "2.8" },
      { dim: "SD-2", label: "Annual security posture review completed", why: "Annual review ensures vendor maintains security standards over time.", controlRef: "2.8" },
      { dim: "SD-3", label: "Certifications currently valid", why: "Expired certifications provide no assurance. Must be tracked and renewed.", controlRef: "2.8" },
      { dim: "SD-4", label: "Vendor incidents tracked with resolution", why: "Incidents without tracking suggest poor vendor management. Resolution evidence required.", controlRef: "2.8" },
      { dim: "SD-5", label: "Previous findings resolved", why: "Open action items from prior assessments indicate unresolved risk.", controlRef: "2.8" },
    ],
    perControlSufficiency: [
      { controlId: "2.8", requirement: "Per-vendor current SOC report; annual review; valid certifications; incident tracking; prior finding resolution." },
    ],
    reductionNote: "Per-vendor ongoing monitoring evidence. SOC report coverage period validation prevents gaps."
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
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }}>
      <span className="font-bold">{ctrl.id}</span>
      <span className="opacity-60">{ctrl.ma}</span>
    </span>
  );
}

// ── VENDOR COMPLETION BADGE ──
function VendorCompletionBadge({ pct }) {
  const color = getStatusColor(pct);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-10 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function DomainFIntake() {
  const [activeItem, setActiveItem] = useState("F1");
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [activeVendor, setActiveVendor] = useState("v1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setEvaluated(false);
  }, []);
  const markFileUploaded = useCallback((key) => {
    setUploadedFiles(prev => ({ ...prev, [key]: true }));
    setEvaluated(false);
  }, []);

  const addVendor = useCallback(() => {
    if (!newVendorName.trim()) return;
    const id = `v${Date.now()}`;
    setVendors(prev => [...prev, { id, name: newVendorName.trim(), classification: "", access: "", swiftComponents: "" }]);
    setNewVendorName("");
    setShowAddVendor(false);
    setActiveVendor(id);
  }, [newVendorName]);

  const removeVendor = useCallback((vendorId) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
    if (activeVendor === vendorId) {
      setActiveVendor(vendors[0]?.id || "");
    }
  }, [activeVendor, vendors]);

  // Completion: per-item, per-vendor, and overall
  const getVendorItemCompletion = useCallback((item, vendorId) => {
    const inputs = item.perVendorInputs || [];
    if (inputs.length === 0) return 100;
    let filled = 0, total = 0;
    inputs.forEach(inp => {
      if (!inp.required) return;
      total++;
      const key = `${item.id}.${vendorId}.${inp.id}`;
      if (inp.type === "file" ? uploadedFiles[key] : inp.type === "checkbox" ? formData[key] : formData[key]) filled++;
    });
    // Global inputs (F1 only)
    if (item.inputs) {
      item.inputs.forEach(inp => {
        if (!inp.required) return;
        total++;
        const key = `${item.id}.global.${inp.id}`;
        if (inp.type === "file" ? uploadedFiles[key] : formData[key]) filled++;
      });
    }
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles]);

  const getItemCompletion = useCallback((item) => {
    if (vendors.length === 0) return 0;
    const avg = vendors.reduce((sum, v) => sum + getVendorItemCompletion(item, v.id), 0) / vendors.length;
    return Math.round(avg);
  }, [vendors, getVendorItemCompletion]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  const weights = { F1: 30, F2: 25, F3: 25, F4: 20 };
  const overallCompletion = useMemo(() => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  const controlScores = useMemo(() => {
    // Single control: 2.8. Average of all 4 items.
    const avg = EVIDENCE_ITEMS.reduce((s, it) => s + itemCompletions[it.id], 0) / EVIDENCE_ITEMS.length;
    return { "2.8": Math.round(avg) };
  }, [itemCompletions]);

  // Per-vendor overall completion (across all 4 items)
  const vendorOverallCompletion = useCallback((vendorId) => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => {
      const item = EVIDENCE_ITEMS.find(it => it.id === id);
      total += (getVendorItemCompletion(item, vendorId) * w / 100);
    });
    return Math.round(total);
  }, [getVendorItemCompletion]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  const renderInput = (inp, vendorId) => {
    const prefix = vendorId ? `${activeItemData.id}.${vendorId}` : `${activeItemData.id}.global`;
    const key = `${prefix}.${inp.id}`;

    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/30'}`}>
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
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none">
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
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none" />
      </div>
    );
  };

  const getMissingInputsForVendor = (item, vendorId) => {
    const inputs = item.perVendorInputs || [];
    return inputs.filter(inp => {
      if (!inp.required) return false;
      const k = `${item.id}.${vendorId}.${inp.id}`;
      return inp.type === "file" ? !uploadedFiles[k] : inp.type === "checkbox" ? !formData[k] : !formData[k];
    });
  };

  const getVendorsWithGaps = (item) => {
    return vendors.filter(v => getMissingInputsForVendor(item, v.id).length > 0);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "#1e293b" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 border-b border-slate-200" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", color: "white" }}>F</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Third-Party & Outsourcing</h1>
                <p className="text-slate-400 text-xs">4 evidence items · 1 control · {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1">
                <div className="h-5 rounded text-xs font-bold flex items-center justify-center text-white px-1.5"
                  style={{ background: getStatusColor(controlScores["2.8"]) }} title={`2.8: ${controlScores["2.8"]}%`}>2.8</div>
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", boxShadow: "0 2px 12px rgba(234,88,12,0.3)" }}>
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
            {/* Evidence Items */}
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 flex items-center gap-2" style={{ color: "#ea580c" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#ea580c" }} />
              Evidence Items
            </div>
            {EVIDENCE_ITEMS.map(item => {
              const pct = itemCompletions[item.id];
              const active = activeItem === item.id;
              const color = getStatusColor(pct);
              return (
                <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-orange-300 shadow-sm' : 'hover:bg-slate-50'}`}
                  style={active ? { background: "#fff7ed" } : {}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-700">{item.id}</div>
                        <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 100 }}>{item.name.length > 22 ? item.name.slice(0,20)+"…" : item.name}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {item.priority === 'CRITICAL' ? 'C' : 'H'}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </button>
              );
            })}

            {/* Vendor List */}
            <div className="mt-4 text-xs font-semibold uppercase tracking-wider mb-2 px-2 flex items-center gap-2" style={{ color: "#b45309" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#b45309" }} />
              Vendors ({vendors.length})
            </div>
            {vendors.map(v => {
              const vPct = vendorOverallCompletion(v.id);
              const active = activeVendor === v.id;
              return (
                <button key={v.id} onClick={() => setActiveVendor(v.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg mb-1 transition-all flex items-center justify-between ${active ? 'ring-1 ring-orange-200 bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getStatusColor(vPct) }} />
                    <span className="text-xs text-slate-600 truncate">{v.name}</span>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: getStatusColor(vPct) }}>{vPct}%</span>
                </button>
              );
            })}
            <button onClick={() => setShowAddVendor(true)}
              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-orange-600 hover:bg-orange-50 font-medium mt-1">
              + Add Vendor
            </button>
            {showAddVendor && (
              <div className="mt-1 p-2 rounded-lg border border-orange-200 bg-orange-50">
                <input type="text" value={newVendorName} onChange={e => setNewVendorName(e.target.value)}
                  placeholder="Vendor name" className="w-full px-2 py-1 rounded border border-slate-300 text-xs mb-1.5 bg-white" onKeyDown={e => e.key === "Enter" && addVendor()} />
                <div className="flex gap-1">
                  <button onClick={addVendor} className="flex-1 px-2 py-1 rounded bg-orange-600 text-white text-xs font-medium">Add</button>
                  <button onClick={() => { setShowAddVendor(false); setNewVendorName(""); }} className="px-2 py-1 rounded text-xs text-slate-500">Cancel</button>
                </div>
              </div>
            )}

            {/* Domain note */}
            <div className="mt-4 p-2.5 rounded-lg border border-orange-100 bg-orange-50/50">
              <div className="text-xs font-semibold text-orange-700 mb-1">Vendor Lifecycle</div>
              <div className="text-xs text-orange-600 leading-relaxed">
                F1 inventory → F2 contracts → F3 assessments → F4 ongoing monitoring
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {activeItemData.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">{activeItemData.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Vendor Completion Grid */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 text-sm">Per-Vendor Completion — {activeItemData.id}</h3>
                  <span className="text-xs font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>
                    {itemCompletions[activeItemData.id]}% overall
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {vendors.map(v => {
                      const pct = getVendorItemCompletion(activeItemData, v.id);
                      const isActive = activeVendor === v.id;
                      return (
                        <button key={v.id} onClick={() => setActiveVendor(v.id)}
                          className={`text-left p-3 rounded-lg border transition-all ${isActive ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-200' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-700 truncate">{v.name}</span>
                            <span className="text-xs font-bold" style={{ color: getStatusColor(pct) }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: getStatusColor(pct) }} />
                          </div>
                          {v.classification && <div className="text-xs text-slate-400 mt-1">{v.classification}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Vendor Context Banner */}
              {activeVendor && vendors.find(v => v.id === activeVendor) && (
                <div className="mb-5 p-3 rounded-xl border border-orange-200 bg-orange-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", color: "white" }}>
                      {vendors.find(v => v.id === activeVendor)?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{vendors.find(v => v.id === activeVendor)?.name}</div>
                      <div className="text-xs text-slate-400">
                        {vendors.find(v => v.id === activeVendor)?.classification || "Classification pending"}
                        {vendors.find(v => v.id === activeVendor)?.swiftComponents && ` · ${vendors.find(v => v.id === activeVendor).swiftComponents}`}
                      </div>
                    </div>
                  </div>
                  <VendorCompletionBadge pct={vendorOverallCompletion(activeVendor)} />
                </div>
              )}

              {/* ── INPUTS (per active vendor) ── */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 text-sm">
                    Evidence Inputs — {vendors.find(v => v.id === activeVendor)?.name || "Select vendor"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${getVendorItemCompletion(activeItemData, activeVendor)}%`, background: getStatusColor(getVendorItemCompletion(activeItemData, activeVendor)) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(getVendorItemCompletion(activeItemData, activeVendor)) }}>{getVendorItemCompletion(activeItemData, activeVendor)}%</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {/* Global inputs (F1 only) */}
                  {activeItemData.inputs && activeItemData.inputs.map(inp => renderInput(inp, null))}
                  {/* Per-vendor inputs */}
                  {activeItemData.perVendorInputs && activeItemData.perVendorInputs.map(inp => renderInput(inp, activeVendor))}
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
                        <span className="text-xs font-mono font-bold text-orange-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-medium shrink-0 self-start">{s.controlRef}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PER-CONTROL SUFFICIENCY ── */}
              {activeItemData.perControlSufficiency && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-5">
                  <button onClick={() => setExpandedPerControl(p => ({...p, [activeItemData.id]: !p[activeItemData.id]}))}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-xl">
                    <h3 className="font-semibold text-slate-700 text-sm">Control 2.8 Sufficiency Requirements</h3>
                    <span className="text-slate-400">{expandedPerControl[activeItemData.id] ? '▲' : '▼'}</span>
                  </button>
                  {expandedPerControl[activeItemData.id] && (
                    <div className="px-5 py-3 border-t border-slate-100">
                      {activeItemData.perControlSufficiency.map(pcs => {
                        const score = controlScores[pcs.controlId] || 0;
                        return (
                          <div key={pcs.controlId}>
                            <div className="flex items-center justify-between mb-1.5">
                              <ControlBadge ctrl={{ id: pcs.controlId, ma: "M" }} />
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
                  style={{ background: "linear-gradient(135deg, #ea580c, #f97316)", boxShadow: "0 4px 20px rgba(234,88,12,0.25)" }}>
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
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Gap Analysis — Per Vendor</h4>
                    {getVendorsWithGaps(activeItemData).length === 0 && itemCompletions[activeItemData.id] >= 90 ? (
                      <div className="p-3 rounded-lg text-sm" style={{ background: "#ecfdf5", color: "#047857" }}>
                        All vendors have complete evidence for {activeItemData.id}. Ready for reviewer assessment.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getVendorsWithGaps(activeItemData).map(v => {
                          const missing = getMissingInputsForVendor(activeItemData, v.id);
                          return (
                            <div key={v.id} className="p-3 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-amber-500">⚠</span>
                                <span className="text-sm font-semibold text-slate-700">{v.name}</span>
                                <span className="text-xs text-slate-400">— {missing.length} missing item{missing.length !== 1 ? 's' : ''}</span>
                              </div>
                              {missing.map(inp => (
                                <div key={inp.id} className="text-xs text-slate-500 ml-6 mb-0.5">
                                  • {inp.label}: {inp.type === "file" ? "Upload required." : inp.type === "checkbox" ? "Confirm attestation." : "Complete field."}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {vendors.length === 0 && (
                          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                            No vendors registered. Add vendors to F1 inventory first.
                          </div>
                        )}
                        {/* Cross-reference note */}
                        <div className="mt-2 p-3 rounded-lg border border-orange-200 bg-orange-50">
                          <div className="text-xs text-orange-700">
                            <span className="font-bold">Cross-reference:</span> Vendor list validated against A2 (SWIFT Component Inventory) third-party flags. Missing vendors will be flagged.
                          </div>
                        </div>
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
            {/* Single control: 2.8 */}
            <div className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">2.8 <span className="text-amber-600">M</span></span>
                <span className="text-sm font-bold" style={{ color: getStatusColor(controlScores["2.8"]) }}>{controlScores["2.8"]}%</span>
              </div>
              <div className="text-xs text-slate-400 mb-2 leading-snug">Outsourced Critical Activity Protection</div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${controlScores["2.8"]}%`, background: getStatusColor(controlScores["2.8"]) }} />
              </div>
              <div className="text-xs text-slate-400">Requires: F1 + F2 + F3 + F4</div>
              <div className="text-xs text-slate-400">All {vendors.length} vendors must be covered</div>
            </div>

            {/* Per-item status */}
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Per-Item Status</div>
            {EVIDENCE_ITEMS.map(item => {
              const pct = itemCompletions[item.id];
              return (
                <div key={item.id} className="mb-1.5 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">{item.id}</span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: getStatusColor(pct) }} />
                  </div>
                </div>
              );
            })}

            {/* Vendor coverage summary */}
            <div className="mt-4 p-2 rounded-lg border border-orange-100 bg-orange-50/50">
              <div className="text-xs font-semibold text-orange-700 mb-1.5">Vendor Coverage</div>
              {vendors.map(v => {
                const pct = vendorOverallCompletion(v.id);
                return (
                  <div key={v.id} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-orange-600 truncate" style={{ maxWidth: 100 }}>{v.name}</span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(pct) }}>{pct}%</span>
                  </div>
                );
              })}
            </div>

            {/* Cross-domain links */}
            <div className="mt-3 p-2 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="text-xs font-semibold text-amber-700 mb-1">Cross-Domain</div>
              <div className="text-xs text-amber-600 leading-relaxed">
                F1 vendor list validated against A2 component inventory (third-party flags).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
