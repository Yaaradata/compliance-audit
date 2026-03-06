import { useState, useCallback, useMemo } from "react";

// ── DATA MODEL (from Canonical Evidence Model & Sufficiency Matrix) ──
const EVIDENCE_ITEMS = [
  {
    id: "A5", order: 1, name: "Architecture Type Declaration",
    priority: "CRITICAL", type: "Form/Text",
    controls: [{ id: "All", name: "All 32 Controls (Scoping)", ma: "M+A" }],
    controlCount: 32,
    description: "Foundational scoping document. Determines which of 32 controls are applicable.",
    inputs: [
      { id: "arch_type", label: "Architecture Type", type: "select", required: true, options: ["A1 — With customer connectors","A2 — Without customer connectors","A3 — Connector only","A4 — No local SWIFT infrastructure","B — Service bureau"] },
      { id: "rationale", label: "Supporting Rationale", type: "textarea", required: true, placeholder: "Explain why this architecture type was selected. Min 200 characters.", minLength: 200 },
      { id: "infra_desc", label: "Infrastructure Description", type: "textarea", required: true, placeholder: "Describe SWIFT infrastructure matching the selected architecture. Reference actual component names." },
      { id: "ownership", label: "Component Ownership Model", type: "select", required: true, options: ["Fully self-managed","Partially outsourced","Fully outsourced"] },
      { id: "hybrid", label: "Hybrid Setup", type: "checkbox", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Architecture type matches actual infrastructure", why: "Auditors verify your declared type against actual setup. Mismatches cause assessment failure." },
      { dim: "SD-2", label: "All SWIFT components accounted for", why: "The architecture decision tree requires identification of all SWIFT-related components." },
      { dim: "SD-3", label: "Justification aligns with SWIFT decision tree", why: "Your rationale must follow the formal SWIFT decision tree logic." },
      { dim: "SD-4", label: "Ownership model clear", why: "Controls differ based on self-managed vs outsourced. Ambiguity cascades to all controls." },
      { dim: "SD-5", label: "Hybrid setups acknowledged", why: "Mixed deployments require additional documentation." },
    ],
    reductionNote: "Determines applicability of every control. Auto-generates N/A justifications for non-applicable controls."
  },
  {
    id: "A1", order: 2, name: "Network Architecture Diagram",
    priority: "CRITICAL", type: "Diagram + Text",
    controls: [
      { id: "1.1", name: "SWIFT Environment Protection", ma: "M" },
      { id: "1.4", name: "Restriction of Internet Access", ma: "M" },
      { id: "1.5", name: "Customer Environment Protection", ma: "M" },
      { id: "2.1", name: "Internal Data Flow Security", ma: "M" },
      { id: "2.4A", name: "Back Office Data Flow Security", ma: "A" },
      { id: "2.5A", name: "External Transmission Data Protection", ma: "A" },
    ],
    controlCount: 6,
    description: "Highest-reuse diagram. Single upload satisfies 6 controls across 2 principles.",
    inputs: [
      { id: "diagram_file", label: "Network Diagram File", type: "file", required: true, accept: ".vsd,.vsdx,.pdf,.png,.jpg" },
      { id: "diagram_date", label: "Diagram Date", type: "date", required: true },
      { id: "diagram_author", label: "Author / Preparer", type: "text", required: true },
      { id: "diagram_version", label: "Version", type: "text", required: true },
      { id: "chk_zone", label: "Diagram includes secure zone boundaries", type: "checkbox", required: true },
      { id: "chk_fw", label: "Diagram shows firewall placement at all ingress/egress", type: "checkbox", required: true },
      { id: "chk_flow", label: "Diagram includes data flow direction arrows with protocols", type: "checkbox", required: true },
      { id: "txt_zone", label: "Supplementary: Zone Boundary Description", type: "textarea", required: false, placeholder: "Describe which systems define the secure zone boundary." },
      { id: "txt_internet", label: "Supplementary: Internet Access Posture", type: "textarea", required: false, placeholder: "Describe internet access posture for control 1.4." },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Secure zone boundary clearly defined", why: "Auditors check this first. Both logical and physical boundaries must be visible." },
      { dim: "SD-2", label: "Firewall at every ingress/egress point", why: "Zone boundaries without firewalls fail environment protection requirements." },
      { dim: "SD-3", label: "All SWIFT systems identified by name/IP", why: "Validates completeness against component inventory (A2)." },
      { dim: "SD-4", label: "Data flow arrows with direction + protocol", why: "Required for internal data flow security (2.1) and back-office flow security (2.4A)." },
      { dim: "SD-5", label: "No direct internet path visible", why: "Critical for control 1.4. Any internet path must be via proxy/gateway." },
      { dim: "SD-6", label: "Customer connector zones shown (if A1)", why: "Required for control 1.5 if architecture type is A1." },
    ],
    reductionNote: "83% reduction — collected 6 separate times without platform."
  },
  {
    id: "A2", order: 3, name: "SWIFT Component Inventory",
    priority: "CRITICAL", type: "Spreadsheet",
    controls: [
      { id: "1.1", name: "SWIFT Environment Protection", ma: "M" },
      { id: "1.3", name: "Virtualisation/Cloud Platform Protection", ma: "A" },
      { id: "1.5", name: "Customer Environment Protection", ma: "M" },
      { id: "2.4A", name: "Back Office Data Flow Security", ma: "A" },
      { id: "2.8", name: "Outsourced Critical Activity Protection", ma: "M" },
    ],
    controlCount: 5,
    description: "Complete list of all hardware/software within the SWIFT secure zone.",
    inputs: [
      { id: "inv_file", label: "Inventory File (XLSX/CSV)", type: "file", required: true, accept: ".xlsx,.csv" },
      { id: "inv_count", label: "Total Systems in Inventory", type: "text", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "All systems listed with hostname, IP, function", why: "Validates network diagram completeness for control 1.1." },
      { dim: "SD-2", label: "Physical/Virtual indicator per system", why: "Identifies virtualised components for control 1.3." },
      { dim: "SD-3", label: "Third-party managed flag populated", why: "Critical for outsourcing control 2.8. Maps vendors to components." },
      { dim: "SD-4", label: "Zone placement per system", why: "Confirms all listed systems are within the declared secure zone." },
      { dim: "SD-5", label: "Customer connectors listed (if A1)", why: "Required for control 1.5 customer environment protection." },
    ],
    reductionNote: "Single inventory satisfies 5 control areas."
  },
  {
    id: "A4", order: 4, name: "Firewall Rule Sets",
    priority: "CRITICAL", type: "Config Export",
    controls: [
      { id: "1.1", name: "SWIFT Environment Protection", ma: "M" },
      { id: "1.4", name: "Restriction of Internet Access", ma: "M" },
      { id: "1.5", name: "Customer Environment Protection", ma: "M" },
    ],
    controlCount: 3,
    description: "Firewall rule exports for every boundary of the SWIFT secure zone.",
    inputs: [
      { id: "fw_file", label: "Firewall Rule Export(s)", type: "file", required: true, accept: ".txt,.pdf,.csv,.log" },
      { id: "fw_vendor", label: "Firewall Product / Vendor", type: "text", required: true, placeholder: "e.g., Palo Alto PA-5200" },
      { id: "fw_date", label: "Export Date", type: "date", required: true },
      { id: "chk_deny", label: "Deny-by-default posture confirmed at all boundaries", type: "checkbox", required: true },
      { id: "chk_inet", label: "No rule permits direct internet access from secure zone", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Deny-by-default at all boundaries", why: "Only explicitly permitted traffic is allowed. Any/any rules fail this check." },
      { dim: "SD-2", label: "Internet deny rules present", why: "Explicit deny for outbound internet from secure zone required for 1.4." },
      { dim: "SD-3", label: "Connector zone segmentation (if A1)", why: "Rules between connector zone and main secure zone required for 1.5." },
    ],
    reductionNote: "Single export satisfies all 3 mandatory environment protection controls."
  },
  {
    id: "A3", order: 5, name: "Data Flow Diagrams",
    priority: "HIGH", type: "Diagram + Matrix",
    controls: [
      { id: "2.1", name: "Internal Data Flow Security", ma: "M" },
      { id: "2.4A", name: "Back Office Data Flow Security", ma: "A" },
      { id: "2.5A", name: "External Transmission Data Protection", ma: "A" },
    ],
    controlCount: 3,
    description: "All data flows between SWIFT components, back-office, and external systems.",
    inputs: [
      { id: "df_file", label: "Data Flow Diagram File", type: "file", required: true, accept: ".vsd,.vsdx,.pdf,.png" },
      { id: "df_matrix", label: "Flow Matrix (optional, recommended)", type: "file", required: false, accept: ".xlsx,.csv" },
      { id: "chk_internal", label: "Covers internal flows (SWIFT-to-SWIFT)", type: "checkbox", required: true },
      { id: "chk_backoffice", label: "Covers back-office flows (SWIFT-to-back-office)", type: "checkbox", required: true },
      { id: "chk_external", label: "Covers external flows (SWIFT-to-service-bureau/network)", type: "checkbox", required: true },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Internal flows with direction, protocol, security method", why: "Required for control 2.1 internal data flow security." },
      { dim: "SD-2", label: "Back-office flows with bridging server placement", why: "Advisory control 2.4A requires identification of bridging servers." },
      { dim: "SD-3", label: "External paths with encryption annotations", why: "Advisory control 2.5A requires TLS 1.2+ for external transmissions." },
    ],
    reductionNote: "One diagram covers internal, back-office, and external data flow controls. 67% reduction."
  },
  {
    id: "A6", order: 6, name: "Secure Zone Design Rationale",
    priority: "HIGH", type: "Document + Form",
    controls: [
      { id: "1.1", name: "SWIFT Environment Protection", ma: "M" },
      { id: "1.5", name: "Customer Environment Protection", ma: "M" },
    ],
    controlCount: 2,
    description: "Written rationale explaining zone boundary placement and segmentation approach.",
    inputs: [
      { id: "rat_file", label: "Design Rationale Document", type: "file", required: false, accept: ".docx,.pdf" },
      { id: "rat_approach", label: "Zone Design Approach", type: "textarea", required: true, placeholder: "Describe your segmentation approach and why it was chosen." },
      { id: "rat_swiftsg", label: "SWIFT Security Guidance Reference", type: "textarea", required: true, placeholder: "Reference specific SWIFT SG sections that informed the design." },
      { id: "rat_deviations", label: "Deviations from SWIFT Recommendations", type: "textarea", required: false, placeholder: "If any, describe deviations with compensating controls." },
      { id: "rat_connector", label: "Customer Connector Zone Rationale (A1 only)", type: "textarea", required: false, placeholder: "Why connector zone provides equivalent protection." },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Specific boundary rationale (not generic)", why: "Auditors reject boilerplate. Must reference your actual zone decisions." },
      { dim: "SD-2", label: "SWIFT Security Guidance referenced", why: "Rationale must cite specific SG sections to demonstrate informed design." },
      { dim: "SD-3", label: "Deviations documented with compensating controls", why: "Undocumented deviations are audit findings." },
      { dim: "SD-4", label: "Connector zone rationale (if A1)", why: "A1 users must explain equivalent protection for customer connector zone." },
    ],
    reductionNote: "Single rationale document covers both 1.1 and 1.5. 50% reduction."
  },
];

const ALL_CONTROLS_SERVED = ["1.1","1.3","1.4","1.5","2.1","2.4A","2.5A"];

// ── STATUS HELPERS ──
function getStatusColor(pct) {
  if (pct >= 90) return "#10b981";
  if (pct >= 60) return "#f59e0b";
  if (pct > 0) return "#ef4444";
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

// ── SCORE RING ──
function ScoreRing({ pct, size = 64, stroke = 5, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = getStatusColor(pct);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-bold text-sm" style={{ color }}>{pct}%</span>
      </div>
      {label && <span className="text-xs text-slate-500 mt-1">{label}</span>}
    </div>
  );
}

// ── CONTROL BADGE ──
function ControlBadge({ ctrl, small }) {
  const isMandatory = ctrl.ma === "M" || ctrl.ma === "M+A";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${small ? 'text-xs' : 'text-xs'} font-medium`}
      style={{ 
        background: isMandatory ? "#fef3c7" : "#e0f2fe",
        borderColor: isMandatory ? "#f59e0b" : "#7dd3fc",
        color: isMandatory ? "#92400e" : "#0369a1"
      }}>
      <span className="font-bold">{ctrl.id}</span>
      {!small && <span className="hidden sm:inline opacity-70">{ctrl.ma}</span>}
    </span>
  );
}

// ── MAIN COMPONENT ──
export default function EvidenceIntakeScreen() {
  const [activeItem, setActiveItem] = useState("A5");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [expandedSufficiency, setExpandedSufficiency] = useState({});

  const updateField = useCallback((itemId, fieldId, value) => {
    setFormData(prev => ({ ...prev, [`${itemId}.${fieldId}`]: value }));
    setEvaluated(false);
  }, []);

  const handleFileUpload = useCallback((itemId, fieldId) => {
    setUploadedFiles(prev => ({ ...prev, [`${itemId}.${fieldId}`]: true }));
    setEvaluated(false);
  }, []);

  // ── Completion calculation ──
  const getItemCompletion = useCallback((item) => {
    let filled = 0, total = 0;
    item.inputs.forEach(inp => {
      if (!inp.required) return;
      total++;
      const key = `${item.id}.${inp.id}`;
      if (inp.type === "file") {
        if (uploadedFiles[key]) filled++;
      } else if (inp.type === "checkbox") {
        if (formData[key]) filled++;
      } else if (inp.type === "textarea") {
        const val = formData[key] || "";
        if (val.length >= (inp.minLength || 1)) filled++;
      } else {
        if (formData[key]) filled++;
      }
    });
    return total === 0 ? 100 : Math.round((filled / total) * 100);
  }, [formData, uploadedFiles]);

  const itemCompletions = useMemo(() => {
    const map = {};
    EVIDENCE_ITEMS.forEach(item => { map[item.id] = getItemCompletion(item); });
    return map;
  }, [getItemCompletion]);

  const overallCompletion = useMemo(() => {
    const weights = { A5: 25, A1: 25, A2: 20, A4: 15, A3: 10, A6: 5 };
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  // ── Control sufficiency (simplified model) ──
  const controlScores = useMemo(() => {
    const scores = {};
    ALL_CONTROLS_SERVED.forEach(cid => {
      const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid || c.id === "All"));
      if (items.length === 0) { scores[cid] = 0; return; }
      const avg = items.reduce((sum, it) => sum + itemCompletions[it.id], 0) / items.length;
      scores[cid] = Math.round(avg);
    });
    return scores;
  }, [itemCompletions]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── DOMAIN HEADER ── */}
      <div className="sticky top-0 z-30" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "#0d9488" }}>A</div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'IBM Plex Sans'" }}>Network & Architecture</h1>
                  <p className="text-slate-400 text-xs">6 evidence items · 7 controls served</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Overall progress ring */}
              <div className="relative flex items-center gap-3">
                <ScoreRing pct={overallCompletion} size={52} stroke={4} />
                <div className="text-white text-xs leading-tight">
                  <div className="font-semibold">Domain</div>
                  <div className="text-slate-400">Progress</div>
                </div>
              </div>

              {/* Control mini-badges */}
              <div className="hidden lg:flex items-center gap-1.5">
                {ALL_CONTROLS_SERVED.map(cid => {
                  const score = controlScores[cid];
                  const color = getStatusColor(score);
                  return (
                    <div key={cid} className="flex flex-col items-center" title={`Control ${cid}: ${score}%`}>
                      <div className="w-8 h-5 rounded text-xs font-bold flex items-center justify-center text-white" style={{ background: color }}>{cid}</div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)", boxShadow: "0 2px 8px rgba(13,148,136,0.4)" }}
              >
                Evaluate All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex" style={{ minHeight: "calc(100vh - 72px)" }}>
        {/* ── LEFT RAIL ── */}
        <div className="w-56 shrink-0 border-r border-slate-200 bg-white sticky top-[72px] self-start" style={{ maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}>
          <div className="p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Evidence Items</div>
            {EVIDENCE_ITEMS.map(item => {
              const pct = itemCompletions[item.id];
              const active = activeItem === item.id;
              const icon = getStatusIcon(pct);
              const color = getStatusColor(pct);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${active ? 'shadow-md' : 'hover:bg-slate-50'}`}
                  style={active ? { background: "#f0fdfa", borderLeft: "3px solid #0d9488" } : { borderLeft: "3px solid transparent" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color }}>{icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-700">{item.id}</div>
                        <div className="text-xs text-slate-500 truncate" style={{ maxWidth: 120 }}>{item.name}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.priority === 'CRITICAL' ? 'C' : 'H'}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Collection Order</div>
            <div className="text-xs text-slate-500 px-2 leading-relaxed">
              A5 → A1 → A2 → A4 → A3 → A6
              <br /><span className="text-slate-400">A5 first (scoping), A6 last (rationale).</span>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 p-6">
          {activeItemData && (
            <div className="max-w-4xl">
              {/* Item Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold" style={{ color: "#0f172a", fontFamily: "'IBM Plex Sans'" }}>{activeItemData.id}</span>
                  <span className="text-xl font-semibold text-slate-700">{activeItemData.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {activeItemData.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{activeItemData.description}</p>
                
                {/* Control mapping pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                  <span className="text-xs text-slate-400 ml-2">({activeItemData.controlCount} controls)</span>
                </div>

                {/* Effort reduction note */}
                <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46" }}>
                  <span className="font-semibold">📉 Effort reduction:</span> {activeItemData.reductionNote}
                </div>
              </div>

              {/* Evidence Type badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-slate-500">Evidence Type:</span>
                <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: "#e0f2fe", color: "#0369a1" }}>{activeItemData.type}</span>
              </div>

              {/* ── INPUT SECTION ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Evidence Inputs</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${itemCompletions[activeItemData.id]}%`, background: getStatusColor(itemCompletions[activeItemData.id]) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>{itemCompletions[activeItemData.id]}%</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {activeItemData.inputs.map(inp => {
                    const key = `${activeItemData.id}.${inp.id}`;
                    const val = formData[key] || "";
                    
                    if (inp.type === "file") {
                      const uploaded = uploadedFiles[key];
                      return (
                        <div key={inp.id}>
                          <label className="text-xs font-semibold text-slate-700 mb-1 block">
                            {inp.label} {inp.required && <span className="text-red-500">*</span>}
                          </label>
                          <div
                            onClick={() => handleFileUpload(activeItemData.id, inp.id)}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${uploaded ? 'border-teal-300 bg-teal-50' : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'}`}
                          >
                            {uploaded ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-teal-600 text-lg">✓</span>
                                <span className="text-sm font-medium text-teal-700">File uploaded</span>
                                <button onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => { const n = {...prev}; delete n[key]; return n; }); }}
                                  className="text-xs text-slate-400 hover:text-red-500 ml-2">Remove</button>
                              </div>
                            ) : (
                              <div>
                                <div className="text-slate-400 text-2xl mb-1">↑</div>
                                <div className="text-sm text-slate-500">Drop file or click to upload</div>
                                {inp.accept && <div className="text-xs text-slate-400 mt-1">{inp.accept}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (inp.type === "checkbox") {
                      return (
                        <label key={inp.id} className="flex items-start gap-3 cursor-pointer group">
                          <input type="checkbox" checked={!!formData[key]}
                            onChange={e => updateField(activeItemData.id, inp.id, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}
                          </span>
                        </label>
                      );
                    }
                    if (inp.type === "select") {
                      return (
                        <div key={inp.id}>
                          <label className="text-xs font-semibold text-slate-700 mb-1 block">
                            {inp.label} {inp.required && <span className="text-red-500">*</span>}
                          </label>
                          <select value={val} onChange={e => updateField(activeItemData.id, inp.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            <option value="">Select...</option>
                            {inp.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      );
                    }
                    if (inp.type === "textarea") {
                      const charCount = val.length;
                      const minLen = inp.minLength || 0;
                      return (
                        <div key={inp.id}>
                          <label className="text-xs font-semibold text-slate-700 mb-1 block">
                            {inp.label} {inp.required && <span className="text-red-500">*</span>}
                          </label>
                          <textarea value={val} onChange={e => updateField(activeItemData.id, inp.id, e.target.value)}
                            placeholder={inp.placeholder} rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y" />
                          {minLen > 0 && (
                            <div className={`text-xs mt-1 ${charCount >= minLen ? 'text-teal-600' : 'text-slate-400'}`}>
                              {charCount}/{minLen} characters {charCount >= minLen ? '✓' : 'required'}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div key={inp.id}>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">
                          {inp.label} {inp.required && <span className="text-red-500">*</span>}
                        </label>
                        <input type={inp.type} value={val} onChange={e => updateField(activeItemData.id, inp.id, e.target.value)}
                          placeholder={inp.placeholder}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── SUFFICIENCY DIMENSIONS ── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                <button
                  onClick={() => setExpandedSufficiency(prev => ({...prev, [activeItemData.id]: !prev[activeItemData.id]}))}
                  className="w-full px-5 py-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="font-semibold text-slate-800 text-sm">Sufficiency Dimensions — What Will Be Evaluated</h3>
                  <span className="text-slate-400 text-sm">{expandedSufficiency[activeItemData.id] ? '▲' : '▼'}</span>
                </button>
                {expandedSufficiency[activeItemData.id] && (
                  <div className="p-5">
                    <div className="space-y-3">
                      {activeItemData.sufficiency.map((s, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: i % 2 === 0 ? "#f8fafc" : "white" }}>
                          <span className="text-xs font-mono font-bold text-teal-700 shrink-0 mt-0.5">{s.dim}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{s.label}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{s.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── CONTROL-SPECIFIC REQUIREMENTS ── */}
              {activeItemData.id !== "A5" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                  <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800 text-sm">Per-Control Sufficiency Requirements</h3>
                    <p className="text-xs text-slate-500 mt-0.5">What this evidence must demonstrate for each control it serves</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeItemData.controls.map(ctrl => {
                      const score = controlScores[ctrl.id] || 0;
                      return (
                        <div key={ctrl.id} className="px-5 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <ControlBadge ctrl={ctrl} />
                              <span className="text-sm font-medium text-slate-700">{ctrl.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: getStatusColor(score) }}>{getStatusLabel(score)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── EVALUATE BUTTON ── */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setEvaluated(true)}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)", boxShadow: "0 4px 14px rgba(13,148,136,0.35)" }}
                >
                  Evaluate Sufficiency for {activeItemData.id}
                </button>
              </div>

              {/* ── EVALUATION RESULTS ── */}
              {evaluated && (
                <div className="rounded-xl border-2 overflow-hidden mb-6" style={{ borderColor: getStatusColor(itemCompletions[activeItemData.id]) }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: getStatusColor(itemCompletions[activeItemData.id]) + "15" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(itemCompletions[activeItemData.id])}</span>
                      <div>
                        <div className="font-bold text-slate-800">{getStatusLabel(itemCompletions[activeItemData.id])}</div>
                        <div className="text-xs text-slate-600">{activeItemData.id} — {activeItemData.name}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getStatusColor(itemCompletions[activeItemData.id]) }}>
                      {itemCompletions[activeItemData.id]}%
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Gap Analysis & Remediation</h4>
                    {itemCompletions[activeItemData.id] >= 90 ? (
                      <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">
                        All required inputs are complete. This item is ready for reviewer assessment.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeItemData.inputs.filter(inp => {
                          if (!inp.required) return false;
                          const key = `${activeItemData.id}.${inp.id}`;
                          if (inp.type === "file") return !uploadedFiles[key];
                          if (inp.type === "checkbox") return !formData[key];
                          if (inp.type === "textarea") return (formData[key] || "").length < (inp.minLength || 1);
                          return !formData[key];
                        }).map(inp => (
                          <div key={inp.id} className="flex gap-3 p-3 rounded-lg" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                            <span className="text-amber-600 shrink-0">⚠</span>
                            <div>
                              <div className="text-sm font-medium text-slate-800">{inp.label}</div>
                              <div className="text-xs text-slate-600 mt-0.5">
                                {inp.type === "file" ? "Upload the required file to satisfy this input." :
                                 inp.type === "checkbox" ? "Confirm this attestation to complete this requirement." :
                                 inp.type === "textarea" && inp.minLength ? `Enter at least ${inp.minLength} characters of specific, non-generic content.` :
                                 "Complete this required field."}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR: CONTROL SUFFICIENCY PANEL ── */}
        {showPanel && (
          <div className="w-60 shrink-0 border-l border-slate-200 bg-white sticky top-[72px] self-start hidden xl:block" style={{ maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Control Sufficiency</span>
                <button onClick={() => setShowPanel(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
              </div>
              {ALL_CONTROLS_SERVED.map(cid => {
                const score = controlScores[cid];
                const color = getStatusColor(score);
                const ctrl = EVIDENCE_ITEMS.flatMap(it => it.controls).find(c => c.id === cid);
                const name = ctrl ? ctrl.name : cid;
                const ma = ctrl ? ctrl.ma : "";
                const items = EVIDENCE_ITEMS.filter(it => it.controls.some(c => c.id === cid)).map(it => it.id);
                return (
                  <div key={cid} className="mb-3 p-2.5 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{cid} <span className={`font-normal ${ma === 'M' ? 'text-amber-600' : 'text-sky-600'}`}>{ma}</span></span>
                      <span className="text-xs font-bold" style={{ color }}>{score}%</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1.5 leading-snug">{name}</div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
                    </div>
                    <div className="text-xs text-slate-400">Evidence: {items.join(", ")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
