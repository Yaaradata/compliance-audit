import { useState, useCallback, useMemo } from "react";

// ── DOMAIN G DATA MODEL (from Canonical Evidence Model) ──
// All 4 items serve single control 3.1 (Physical Security, Mandatory)
const ALL_CONTROLS = ["3.1"];

// SWIFT equipment zones — evidence is collected per zone where applicable
const SWIFT_ZONES = [
  { id: "z1", name: "Data Center / Server Room", description: "Primary SWIFT servers and HSMs" },
  { id: "z2", name: "Network Equipment Room", description: "SWIFT network devices, firewalls, routers" },
  { id: "z3", name: "Operations Room", description: "SWIFT operator workstations" },
  { id: "z4", name: "Backup / DR Site", description: "Disaster recovery SWIFT infrastructure (if applicable)" },
];

const SUB_GROUPS = [
  { name: "Access Security", color: "#be123c", items: ["G1", "G2"] },
  { name: "Environment & Lifecycle", color: "#7c3aed", items: ["G3", "G4"] },
];

const EVIDENCE_ITEMS = [
  {
    id: "G1", order: 1, name: "Physical Access Control Evidence",
    priority: "HIGH", type: "Access System Config / Card Reader Logs / Policy",
    perZone: true,
    controls: [{ id: "3.1", name: "Physical Security", ma: "M" }],
    controlCount: 1,
    description: "Physical access controls for areas housing SWIFT equipment: access control systems, authorized personnel lists, and visitor management.",
    inputs: [
      { id: "access_policy", label: "Physical Access Control Policy", type: "file", required: true, scope: "global", accept: ".pdf,.docx" },
      { id: "annual_review", label: "Annual Access List Review Evidence", type: "file", required: true, scope: "global", accept: ".pdf,.docx,.xlsx" },
      { id: "revocation_process", label: "Access Revocation Process / Evidence", type: "file", required: true, scope: "global", accept: ".pdf,.docx,.xlsx" },
      { id: "access_config", label: "Access Control System Config (card/biometric)", type: "file", required: true, scope: "per-zone", accept: ".pdf,.xlsx,.png,.html" },
      { id: "auth_personnel", label: "Authorized Personnel List (dated)", type: "file", required: true, scope: "per-zone", accept: ".xlsx,.pdf,.csv" },
      { id: "chk_control_system", label: "Physical access control system active (card reader, biometric, or combination)", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_visitor", label: "Visitor management process documented and enforced (escorted access)", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_annual", label: "Authorized personnel list reviewed within past 12 months", type: "checkbox", required: true, scope: "global" },
      { id: "chk_revocation", label: "Access revocation evidenced for role changes and leavers", type: "checkbox", required: true, scope: "global" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Access control system active at each zone", why: "Control 3.1 requires physical access controls at every area housing SWIFT equipment. Uncontrolled access = critical finding.", controlRef: "3.1" },
      { dim: "SD-2", label: "Authorized personnel list maintained per zone", why: "Only named individuals should access SWIFT areas. Undocumented access = unauthorized access risk.", controlRef: "3.1" },
      { dim: "SD-3", label: "Visitor management process enforced", why: "Visitors must be escorted in SWIFT areas. Unescorted visitor access = physical security breach.", controlRef: "3.1" },
      { dim: "SD-4", label: "Annual access list review completed", why: "Access lists go stale. Annual review removes unnecessary access. No review = access creep.", controlRef: "3.1" },
      { dim: "SD-5", label: "Access revocation for role changes / leavers", why: "Former employees or role changers retaining access is a common audit finding. Timely revocation required.", controlRef: "3.1" },
    ],
    perControlSufficiency: [
      { controlId: "3.1", requirement: "Active access controls at all SWIFT zones; maintained personnel lists; visitor management; annual review; timely revocation." },
    ],
    reductionNote: "Per-zone evidence collected once. Access policy, annual review, and revocation process shared across all zones."
  },
  {
    id: "G2", order: 2, name: "Physical Access Logs (12 Months)",
    priority: "HIGH", type: "Access System Logs / Log Extracts / Monitoring Reports",
    perZone: true,
    controls: [{ id: "3.1", name: "Physical Security", ma: "M" }],
    controlCount: 1,
    description: "Physical access logs for SWIFT equipment areas, retained for minimum 12 months. Must be available for audit and investigation.",
    inputs: [
      { id: "retention_policy", label: "Log Retention Policy", type: "file", required: true, scope: "global", accept: ".pdf,.docx" },
      { id: "privacy_compliance", label: "Privacy Compliance Statement (if applicable)", type: "file", required: false, scope: "global", accept: ".pdf,.docx" },
      { id: "access_logs", label: "Access Log Extract (recent 30 days sample)", type: "file", required: true, scope: "per-zone", accept: ".pdf,.csv,.xlsx,.log" },
      { id: "retention_evidence", label: "12-Month Retention Evidence (earliest available log)", type: "file", required: true, scope: "per-zone", accept: ".pdf,.csv,.xlsx,.png" },
      { id: "monitoring_report", label: "Unusual Access Monitoring Report", type: "file", required: false, scope: "per-zone", accept: ".pdf,.xlsx" },
      { id: "log_start_date", label: "Earliest Available Log Date", type: "date", required: true, scope: "per-zone" },
      { id: "chk_all_entries", label: "Logs cover all entry/exit points for this zone", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_12months", label: "Logs retained for minimum 12 months", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_available", label: "Logs available for audit and investigation upon request", type: "checkbox", required: true, scope: "global" },
      { id: "chk_unusual", label: "Unusual or off-hours access flagged and reviewed", type: "checkbox", required: true, scope: "global" },
      { id: "chk_privacy", label: "Log retention complies with local privacy regulations", type: "checkbox", required: true, scope: "global" },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Logs cover all SWIFT zone entry points", why: "Missing entry points create blind spots. Every door/entry to SWIFT areas must log access.", controlRef: "3.1" },
      { dim: "SD-2", label: "Minimum 12-month retention", why: "SWIFT requires 12+ months. Shorter retention prevents historical investigation.", controlRef: "3.1" },
      { dim: "SD-3", label: "Logs available for audit", why: "Logs must be retrievable on demand. Archived logs that cannot be accessed are useless.", controlRef: "3.1" },
      { dim: "SD-4", label: "Unusual access flagged and reviewed", why: "Access logs without monitoring provide no detective value. Off-hours access must trigger review.", controlRef: "3.1" },
      { dim: "SD-5", label: "Privacy regulation compliance", why: "Physical access logs may contain personal data. Retention must comply with local privacy laws.", controlRef: "3.1" },
    ],
    perControlSufficiency: [
      { controlId: "3.1", requirement: "All zone entry points logged; 12-month retention; audit-ready; unusual access monitoring; privacy compliant." },
    ],
    reductionNote: "Time-series evidence paired with G1 access controls. Retention policy and privacy compliance shared across all zones."
  },
  {
    id: "G3", order: 3, name: "Video Surveillance Evidence",
    priority: "MEDIUM", type: "Surveillance Config / Camera Placement Diagram / Retention Policy",
    perZone: true,
    hasMultiInputTypes: true,
    controls: [{ id: "3.1", name: "Physical Security", ma: "M" }],
    controlCount: 1,
    description: "Video surveillance configuration for SWIFT equipment areas: camera placement, recording configuration, retention (recommended 3+ months), and legal compliance.",
    inputs: [
      { id: "surveillance_policy", label: "Surveillance / CCTV Policy", type: "file", required: true, scope: "global", accept: ".pdf,.docx" },
      { id: "camera_diagram", label: "Camera Placement Diagram", type: "file", required: true, scope: "per-zone", accept: ".pdf,.png,.vsd,.vsdx,.drawio" },
      { id: "system_config", label: "Surveillance System Configuration", type: "file", required: true, scope: "per-zone", accept: ".pdf,.html,.png,.xlsx" },
      { id: "retention_period", label: "Footage Retention Period (days)", type: "text", required: true, scope: "global", placeholder: "Recommended: 90+ days" },
      { id: "chk_coverage", label: "Cameras cover all entry/exit points and SWIFT equipment areas", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_recording", label: "Motion detection and continuous recording active", type: "checkbox", required: true, scope: "per-zone" },
      { id: "chk_retention", label: "Footage retained for recommended 3+ months", type: "checkbox", required: true, scope: "global" },
      { id: "chk_legal", label: "Surveillance complies with applicable privacy/surveillance laws", type: "checkbox", required: true, scope: "global" },
      { id: "chk_access_control", label: "Access to surveillance footage restricted to authorized personnel", type: "checkbox", required: true, scope: "global" },
    ],
    multiInputGuidance: {
      diagram: {
        label: "Camera Placement Diagram",
        expectations: [
          "Floor plan or layout of the SWIFT zone",
          "Camera positions marked with field-of-view indicators",
          "Entry/exit points clearly labeled",
          "SWIFT equipment locations shown relative to cameras",
          "Blind spot analysis (if any)",
          "Camera type annotations (fixed, PTZ, dome)",
        ],
      },
      config: {
        label: "Surveillance System Configuration",
        expectations: [
          "Camera resolution and frame rate settings",
          "Motion detection sensitivity / recording triggers",
          "Storage configuration and capacity",
          "Retention period settings",
          "Remote monitoring configuration (if applicable)",
          "Access control settings for footage viewing",
        ],
      },
    },
    sufficiency: [
      { dim: "SD-1", label: "Camera coverage of SWIFT equipment areas", why: "All SWIFT areas must be under surveillance. Gaps allow unmonitored physical access.", controlRef: "3.1" },
      { dim: "SD-2", label: "Motion detection and recording active", why: "Static cameras without recording provide no evidence. Active recording is required.", controlRef: "3.1" },
      { dim: "SD-3", label: "Retention period 3+ months", why: "Recommended 3-month minimum allows investigation of incidents discovered after the fact.", controlRef: "3.1" },
      { dim: "SD-4", label: "Legal / privacy compliance", why: "Surveillance must comply with local laws. Non-compliant surveillance may be inadmissible.", controlRef: "3.1" },
      { dim: "SD-5", label: "Footage access controls", why: "Unrestricted access to footage creates privacy and tampering risks.", controlRef: "3.1" },
    ],
    perControlSufficiency: [
      { controlId: "3.1", requirement: "Camera coverage of SWIFT zones; active recording; 3+ month retention; legal compliance; footage access controls." },
    ],
    reductionNote: "Environmental monitoring evidence. Camera placement diagram + system config required per zone. Policy and retention shared globally."
  },
  {
    id: "G4", order: 4, name: "Equipment Disposal / Sanitization Evidence",
    priority: "MEDIUM", type: "Disposal Logs / Sanitization Certificates / Destruction Records",
    controls: [{ id: "3.1", name: "Physical Security", ma: "M" }],
    controlCount: 1,
    description: "Secure disposal or sanitization procedures for SWIFT equipment being decommissioned: data wiping, physical destruction, chain of custody, covering all storage media.",
    hasDisposalEvents: true,
    inputs: [
      { id: "disposal_policy", label: "Disposal / Sanitization Policy", type: "file", required: true, accept: ".pdf,.docx" },
      { id: "disposal_log", label: "Disposal / Decommission Log (all events)", type: "file", required: true, accept: ".xlsx,.csv,.pdf" },
      { id: "recent_cert", label: "Most Recent Sanitization Certificate", type: "file", required: true, accept: ".pdf" },
      { id: "chain_of_custody", label: "Chain of Custody Records", type: "file", required: true, accept: ".pdf,.xlsx" },
      { id: "chk_process", label: "Disposal/sanitization process documented and approved", type: "checkbox", required: true },
      { id: "chk_execution", label: "Evidence of execution for recent disposals (within 12 months)", type: "checkbox", required: true },
      { id: "chk_chain", label: "Chain of custody maintained from decommission to destruction", type: "checkbox", required: true },
      { id: "chk_certification", label: "Data wiping or physical destruction certification obtained", type: "checkbox", required: true },
      { id: "chk_storage_media", label: "All storage media covered (disks, tapes, HSM tokens, USB)", type: "checkbox", required: true },
      { id: "chk_no_recent", label: "No SWIFT equipment disposed of in past 12 months (if applicable)", type: "checkbox", required: false },
    ],
    sufficiency: [
      { dim: "SD-1", label: "Disposal/sanitization process documented", why: "Without a documented process, disposal is ad-hoc and unverifiable. Process must be approved.", controlRef: "3.1" },
      { dim: "SD-2", label: "Execution evidence for recent disposals", why: "Process without execution evidence is just a policy. Recent disposals must have matching records.", controlRef: "3.1" },
      { dim: "SD-3", label: "Chain of custody maintained", why: "Equipment moving between decommission and destruction without tracking creates data leak risk.", controlRef: "3.1" },
      { dim: "SD-4", label: "Sanitization / destruction certification", why: "Third-party certification proves data was irrecoverably destroyed. Self-attestation is weaker.", controlRef: "3.1" },
      { dim: "SD-5", label: "All storage media covered", why: "Disks, tapes, HSM tokens, and USB devices all contain sensitive data. Missing media types = residual risk.", controlRef: "3.1" },
    ],
    perControlSufficiency: [
      { controlId: "3.1", requirement: "Documented disposal process; execution evidence; chain of custody; destruction certification; all storage media covered." },
    ],
    reductionNote: "Equipment lifecycle evidence. If no disposals occurred in 12 months, a single attestation satisfies the requirement."
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

// ── MAIN COMPONENT ──
export default function DomainGIntake() {
  const [activeItem, setActiveItem] = useState("G1");
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [evaluated, setEvaluated] = useState(false);
  const [expandedSuff, setExpandedSuff] = useState({});
  const [expandedPerControl, setExpandedPerControl] = useState({});
  const [expandedMultiInput, setExpandedMultiInput] = useState(false);
  const [selectedZone, setSelectedZone] = useState("all");

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
      if (item.perZone && inp.scope === "per-zone") {
        SWIFT_ZONES.forEach(z => {
          total++;
          const key = `${item.id}.${z.id}.${inp.id}`;
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

  const weights = { G1: 30, G2: 30, G3: 20, G4: 20 };
  const overallCompletion = useMemo(() => {
    let total = 0;
    Object.entries(weights).forEach(([id, w]) => { total += (itemCompletions[id] || 0) * w / 100; });
    return Math.round(total);
  }, [itemCompletions]);

  const controlScores = useMemo(() => {
    const avg = EVIDENCE_ITEMS.reduce((s, it) => s + itemCompletions[it.id], 0) / EVIDENCE_ITEMS.length;
    return { "3.1": Math.round(avg) };
  }, [itemCompletions]);

  const activeItemData = EVIDENCE_ITEMS.find(it => it.id === activeItem);

  const renderInput = (inp, zonePrefix) => {
    const key = zonePrefix ? `${activeItemData.id}.${zonePrefix}.${inp.id}` : `${activeItemData.id}.${inp.id}`;
    if (inp.type === "file") {
      const uploaded = uploadedFiles[key];
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <div onClick={() => markFileUploaded(key)}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-rose-400 hover:bg-rose-50/30'}`}>
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
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 bg-white" />
          <span className="text-sm text-slate-600 group-hover:text-slate-900">{inp.label} {inp.required && <span className="text-red-500 text-xs">*</span>}</span>
        </label>
      );
    }
    if (inp.type === "select") {
      return (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">{inp.label} {inp.required && <span className="text-red-500">*</span>}</label>
          <select value={formData[key] || ""} onChange={e => updateField(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none">
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
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none" />
      </div>
    );
  };

  const getMissingInputs = (item) => {
    return item.inputs.filter(inp => {
      if (!inp.required) return false;
      if (item.perZone && inp.scope === "per-zone") {
        return SWIFT_ZONES.some(z => {
          const k = `${item.id}.${z.id}.${inp.id}`;
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
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #be123c, #f43f5e)", color: "white" }}>G</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Physical Security</h1>
                <p className="text-slate-400 text-xs">4 evidence items · 1 control · {SWIFT_ZONES.length} zones</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <ScoreRing pct={overallCompletion} />
              <div className="hidden lg:flex items-center gap-1">
                <div className="h-5 rounded text-xs font-bold flex items-center justify-center text-white px-1.5"
                  style={{ background: getStatusColor(controlScores["3.1"]) }} title={`3.1: ${controlScores["3.1"]}%`}>3.1</div>
              </div>
              <button onClick={() => setEvaluated(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #be123c 0%, #f43f5e 100%)", boxShadow: "0 2px 12px rgba(190,18,60,0.3)" }}>
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
                    <button key={item.id} onClick={() => { setActiveItem(item.id); setEvaluated(false); setSelectedZone("all"); setExpandedMultiInput(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${active ? 'ring-1 ring-rose-300 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={active ? { background: "#fff1f2" } : {}}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color }}>{getStatusIcon(pct)}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{item.id}</div>
                            <div className="text-xs text-slate-400 truncate" style={{ maxWidth: 100 }}>{item.name.length > 22 ? item.name.slice(0,20)+"…" : item.name}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-1 py-0.5 rounded font-bold ${item.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.priority === 'HIGH' ? 'H' : 'M'}
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

            {/* Physical security lifecycle */}
            <div className="mt-2 p-2.5 rounded-lg border border-rose-100 bg-rose-50/50">
              <div className="text-xs font-semibold text-rose-700 mb-1">Security Lifecycle</div>
              <div className="text-xs text-rose-600 leading-relaxed">
                G1 access controls → G2 access logs → G3 surveillance → G4 disposal
              </div>
            </div>

            {/* Zone legend */}
            <div className="mt-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500 mb-1.5">SWIFT Equipment Zones</div>
              {SWIFT_ZONES.map(z => (
                <div key={z.id} className="text-xs text-slate-500 mb-0.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span className="truncate">{z.name}</span>
                </div>
              ))}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeItemData.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {activeItemData.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">{activeItemData.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-xs text-slate-400 mr-1">Satisfies:</span>
                  {activeItemData.controls.map(c => <ControlBadge key={c.id} ctrl={c} />)}
                </div>
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239" }}>
                  📉 {activeItemData.reductionNote}
                </div>
              </div>

              {/* Multi-Input Type Guidance (G3) */}
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
                        <div key={key} className="p-3 rounded-lg border" style={{ borderColor: key === 'diagram' ? '#fecdd3' : '#bae6fd', background: key === 'diagram' ? '#fff1f2' : '#f0f9ff' }}>
                          <div className="text-xs font-bold mb-2" style={{ color: key === 'diagram' ? '#be123c' : '#0369a1' }}>
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

              {/* "No disposal" shortcut for G4 */}
              {activeItemData.hasDisposalEvents && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/50 mb-5 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-violet-600 text-lg">ℹ️</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-violet-800">No recent disposals?</div>
                      <div className="text-xs text-violet-600 mt-0.5">If no SWIFT equipment was disposed of in the past 12 months, check the attestation below. The disposal policy and process documentation are still required.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zone Selector (for per-zone items) */}
              {activeItemData.perZone && (
                <div className="mb-4 p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-2">SWIFT Equipment Zones</div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedZone("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedZone === "all" ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      All Zones ({SWIFT_ZONES.length})
                    </button>
                    {SWIFT_ZONES.map(z => {
                      const zComplete = activeItemData.inputs.filter(i => i.required && i.scope === "per-zone").every(inp => {
                        const k = `${activeItemData.id}.${z.id}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      });
                      return (
                        <button key={z.id} onClick={() => setSelectedZone(z.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedZone === z.id ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${zComplete ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                          {z.name}
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
                  {activeItemData.perZone ? (
                    <>
                      {/* Global inputs first */}
                      {activeItemData.inputs.filter(i => !i.scope || i.scope === "global").map(inp => renderInput(inp))}

                      {/* Per-zone inputs */}
                      {(selectedZone === "all" ? SWIFT_ZONES : SWIFT_ZONES.filter(z => z.id === selectedZone)).map(z => (
                        <div key={z.id} className="p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                          <div className="text-xs font-bold text-rose-600 mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />{z.name}
                          </div>
                          <div className="text-xs text-slate-400 mb-3">{z.description}</div>
                          <div className="space-y-3">
                            {activeItemData.inputs.filter(i => i.scope === "per-zone").map(inp => renderInput(inp, z.id))}
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
                        <span className="text-xs font-mono font-bold text-rose-600 shrink-0 mt-0.5">{s.dim}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{s.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.why}</div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-medium shrink-0 self-start">{s.controlRef}</span>
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
                    <h3 className="font-semibold text-slate-700 text-sm">Control 3.1 Sufficiency Requirements</h3>
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
                  style={{ background: "linear-gradient(135deg, #be123c, #f43f5e)", boxShadow: "0 4px 20px rgba(190,18,60,0.25)" }}>
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
                                {activeItemData.perZone && inp.scope === "per-zone"
                                  ? `Missing for: ${SWIFT_ZONES.filter(z => { const k=`${activeItemData.id}.${z.id}.${inp.id}`; return inp.type==="file" ? !uploadedFiles[k] : !formData[k]; }).map(z => z.name).join(", ")}`
                                  : inp.type === "file" ? "Upload required evidence file."
                                  : inp.type === "checkbox" ? "Confirm this attestation."
                                  : "Complete this required field."}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Cross-reference notes */}
                        {activeItemData.id === "G1" && (
                          <div className="mt-2 p-3 rounded-lg border border-rose-200 bg-rose-50">
                            <div className="text-xs text-rose-700">
                              <span className="font-bold">Cross-reference:</span> Authorized personnel list validated against C2 (Privileged Account Inventory) for consistency. Zone definitions validated against A1 (Network Architecture Diagram) for completeness.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "G2" && (
                          <div className="mt-2 p-3 rounded-lg border border-rose-200 bg-rose-50">
                            <div className="text-xs text-rose-700">
                              <span className="font-bold">Cross-reference:</span> Access log zone coverage validated against G1 zone list. 12-month retention validated against earliest log date. Off-hours access patterns flagged.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "G3" && (
                          <div className="mt-2 p-3 rounded-lg border border-rose-200 bg-rose-50">
                            <div className="text-xs text-rose-700">
                              <span className="font-bold">Cross-reference:</span> Camera placement validated against G1 zone list. Coverage must include all entry/exit points identified in G1 access control configuration.
                            </div>
                          </div>
                        )}
                        {activeItemData.id === "G4" && (
                          <div className="mt-2 p-3 rounded-lg border border-rose-200 bg-rose-50">
                            <div className="text-xs text-rose-700">
                              <span className="font-bold">Cross-reference:</span> Disposal log validated against A2 (SWIFT Component Inventory) for decommissioned systems. Storage media types cross-checked with equipment specifications.
                            </div>
                          </div>
                        )}
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
            {/* Single control: 3.1 */}
            <div className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-700">3.1 <span className="text-amber-600">M</span></span>
                <span className="text-sm font-bold" style={{ color: getStatusColor(controlScores["3.1"]) }}>{controlScores["3.1"]}%</span>
              </div>
              <div className="text-xs text-slate-400 mb-2 leading-snug">Physical Security</div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${controlScores["3.1"]}%`, background: getStatusColor(controlScores["3.1"]) }} />
              </div>
              <div className="text-xs text-slate-400">Requires: G1 + G2 + G3 + G4</div>
              <div className="text-xs text-slate-400">All {SWIFT_ZONES.length} zones must be covered</div>
            </div>

            {/* Per-item status */}
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Per-Item Status</div>
            {EVIDENCE_ITEMS.map(item => {
              const pct = itemCompletions[item.id];
              return (
                <div key={item.id} className="mb-1.5 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">{item.id} {item.name.split(" ")[0]}</span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: getStatusColor(pct) }} />
                  </div>
                </div>
              );
            })}

            {/* Zone coverage summary */}
            <div className="mt-4 p-2 rounded-lg border border-rose-100 bg-rose-50/50">
              <div className="text-xs font-semibold text-rose-700 mb-1.5">Zone Coverage</div>
              {SWIFT_ZONES.map(z => {
                // Average completion across G1 and G2 (per-zone items) for this zone
                const perZoneItems = EVIDENCE_ITEMS.filter(it => it.perZone);
                const avg = perZoneItems.length > 0
                  ? Math.round(perZoneItems.reduce((s, it) => {
                      const zoneInputs = it.inputs.filter(i => i.required && i.scope === "per-zone");
                      if (zoneInputs.length === 0) return s + 100;
                      const filled = zoneInputs.filter(inp => {
                        const k = `${it.id}.${z.id}.${inp.id}`;
                        return inp.type === "file" ? uploadedFiles[k] : inp.type === "checkbox" ? formData[k] : formData[k];
                      }).length;
                      return s + (filled / zoneInputs.length * 100);
                    }, 0) / perZoneItems.length)
                  : 0;
                return (
                  <div key={z.id} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-rose-600 truncate" style={{ maxWidth: 120 }}>{z.name}</span>
                    <span className="text-xs font-bold" style={{ color: getStatusColor(avg) }}>{avg}%</span>
                  </div>
                );
              })}
            </div>

            {/* Cross-domain links */}
            <div className="mt-3 p-2 rounded-lg border border-amber-100 bg-amber-50/50">
              <div className="text-xs font-semibold text-amber-700 mb-1">Cross-Domain</div>
              <div className="space-y-1">
                <div className="text-xs text-amber-600">G1 → A1 zone definitions</div>
                <div className="text-xs text-amber-600">G1 → C2 personnel list</div>
                <div className="text-xs text-amber-600">G3 → G1 entry points</div>
                <div className="text-xs text-amber-600">G4 → A2 decommissions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
