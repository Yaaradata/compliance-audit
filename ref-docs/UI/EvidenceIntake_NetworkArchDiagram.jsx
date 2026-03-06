import { useState, useEffect, useRef } from "react";

// === CONTROL EVIDENCE REQUIREMENTS ===
const CONTROLS = [
  {
    id: "1.1",
    name: "SWIFT Environment Protection",
    type: "M",
    objective: "Secure Your Environment",
    principle: "Restrict Internet Access & Protect Critical Systems",
    requirements: [
      { id: "1.1-a", label: "Secure zone boundary definition", description: "Clear demarcation of the SWIFT secure zone, showing logical and physical boundaries separating SWIFT infrastructure from the general IT environment.", type: "diagram", field: "secureBoundary" },
      { id: "1.1-b", label: "Firewall placement at zone boundaries", description: "Location and configuration of firewalls at every ingress/egress point of the secure zone, including rule direction (inbound/outbound).", type: "diagram", field: "firewallPlacement" },
      { id: "1.1-c", label: "All systems within the secure zone identified", description: "Complete inventory of servers, appliances, and endpoints residing inside the secure zone (Alliance Gateway, messaging interface, operator PCs, etc.).", type: "text", field: "systemsInventory" },
      { id: "1.1-d", label: "Zone design rationale documented", description: "Justification for the zone architecture chosen — why specific segmentation boundaries were drawn, referencing SWIFT's Security Guidance.", type: "text", field: "zoneRationale" },
      { id: "1.1-e", label: "Zone integrity monitoring evidence", description: "Evidence that zone boundaries are monitored for unauthorized changes or breaches (IDS alerts, config change monitoring).", type: "text", field: "integrityMonitoring" },
    ]
  },
  {
    id: "1.4",
    name: "Restriction of Internet Access",
    type: "M",
    objective: "Secure Your Environment",
    principle: "Restrict Internet Access & Protect Critical Systems",
    requirements: [
      { id: "1.4-a", label: "No direct internet access for SWIFT components", description: "The diagram must show that no SWIFT component (Gateway, messaging interface, operator PCs) has a direct path to the internet. All traffic routes through controlled intermediaries.", type: "diagram", field: "noDirectInternet" },
      { id: "1.4-b", label: "Proxy/gateway configuration shown", description: "If any indirect internet access exists (e.g., for SWIFT updates), the diagram must show the proxy or jump server path and its placement outside the secure zone.", type: "diagram", field: "proxyConfig" },
      { id: "1.4-c", label: "Firewall rules restricting outbound internet", description: "Specific firewall rules that deny outbound internet traffic from the secure zone, with any exceptions explicitly documented.", type: "text", field: "outboundRules" },
      { id: "1.4-d", label: "Internet access exception log", description: "If any exceptions to the internet restriction exist, they must be documented with business justification and compensating controls.", type: "text", field: "exceptionLog" },
    ]
  },
  {
    id: "1.5",
    name: "Customer Environment Protection",
    type: "M",
    objective: "Secure Your Environment",
    principle: "Restrict Internet Access & Protect Critical Systems",
    requirements: [
      { id: "1.5-a", label: "Customer connector zone boundaries", description: "If your architecture includes customer connectors, the diagram must show equivalent protection for the customer connector environment — its own zone boundaries and firewall placement.", type: "diagram", field: "connectorZone" },
      { id: "1.5-b", label: "Connector inventory", description: "List of all customer connectors shown in the diagram, with their network placement and the zone in which each resides.", type: "text", field: "connectorInventory" },
      { id: "1.5-c", label: "Segmentation between connector and secure zone", description: "Evidence that the customer connector zone is segmented from the main SWIFT secure zone with appropriate firewall or ACL controls.", type: "diagram", field: "connectorSegmentation" },
    ]
  },
  {
    id: "2.1",
    name: "Internal Data Flow Security",
    type: "M",
    objective: "Secure Your Environment",
    principle: "Reduce Attack Surface & Vulnerabilities",
    requirements: [
      { id: "2.1-a", label: "Data flows between SWIFT components and back-office", description: "The diagram must show all data flow paths between SWIFT secure zone components and back-office/middleware systems, including direction and protocol.", type: "diagram", field: "dataFlowPaths" },
      { id: "2.1-b", label: "Encryption method per data flow", description: "For each data flow crossing a zone boundary, the encryption method must be indicated (TLS version, IPSec, etc.) or the compensating control documented.", type: "text", field: "encryptionMethods" },
      { id: "2.1-c", label: "Controlled interfaces identified", description: "All interface points where data enters/exits the secure zone must be identified and shown as controlled (firewall, application gateway, API gateway).", type: "diagram", field: "controlledInterfaces" },
    ]
  },
  {
    id: "2.4A",
    name: "Back Office Data Flow Security",
    type: "A",
    objective: "Secure Your Environment",
    principle: "Reduce Attack Surface & Vulnerabilities",
    advisory: true,
    mandatoryFrom: "2026",
    requirements: [
      { id: "2.4A-a", label: "Back-office to secure zone data flow diagram", description: "Detailed view of data flows between back-office systems and the SWIFT secure zone, showing bridging servers, middleware, and any intermediary systems.", type: "diagram", field: "backOfficeFlows" },
      { id: "2.4A-b", label: "Bridging server identification", description: "If bridging servers are used between back-office and secure zone, they must be identified on the diagram with their network placement and security posture.", type: "text", field: "bridgingServers" },
      { id: "2.4A-c", label: "Security method per back-office data flow", description: "For each back-office data flow: encryption, segmentation, or other security method applied, documented per flow.", type: "text", field: "boSecurityMethods" },
    ]
  },
  {
    id: "2.5A",
    name: "External Transmission Data Protection",
    type: "A",
    objective: "Secure Your Environment",
    principle: "Reduce Attack Surface & Vulnerabilities",
    advisory: true,
    requirements: [
      { id: "2.5A-a", label: "External communication paths shown", description: "Any external data transmission paths related to SWIFT operations (e.g., to service bureaus, SWIFT network connection) must be visible on the diagram.", type: "diagram", field: "externalPaths" },
      { id: "2.5A-b", label: "Encryption for external transmissions", description: "Evidence that external data transmissions are encrypted in transit. The diagram or annotations should reference the encryption standard (TLS 1.2+, etc.).", type: "text", field: "externalEncryption" },
    ]
  },
];

// Flatten all fields for state init
const initFields = () => {
  const fields = {};
  CONTROLS.forEach(c => c.requirements.forEach(r => { fields[r.field] = { text: "", file: null, fileName: "" }; }));
  return fields;
};

// Evaluation logic
const evaluateControl = (control, fields) => {
  const results = control.requirements.map(r => {
    const f = fields[r.field];
    const hasContent = (f.text && f.text.trim().length > 20) || f.file;
    const isPartial = f.text && f.text.trim().length > 0 && f.text.trim().length <= 20;
    return { ...r, status: hasContent ? "sufficient" : isPartial ? "partial" : "missing", hasFile: !!f.file, textLength: f.text?.trim().length || 0 };
  });
  const sufficient = results.filter(r => r.status === "sufficient").length;
  const total = results.length;
  const pct = Math.round((sufficient / total) * 100);
  return { results, sufficient, total, pct };
};

// Guidance generator
const getGuidance = (req, field) => {
  if (field.file && field.text?.trim().length > 20) return null;
  if (field.file && (!field.text || field.text.trim().length <= 20)) return `Upload received. Add a brief annotation (>20 chars) describing how this file demonstrates "${req.label}" to strengthen the evidence.`;
  if (field.text?.trim().length > 20 && !field.file) return req.type === "diagram" ? `Text description noted. Uploading the relevant section of the network diagram as a visual artifact will significantly strengthen this evidence.` : null;
  if (field.text?.trim().length > 0 && field.text.trim().length <= 20) return `Your input is too brief. Provide specific detail: ${req.description}`;
  return `Required: ${req.description}`;
};

// === COMPONENTS ===

const StatusDot = ({ status }) => {
  const colors = { sufficient: "#10b981", partial: "#f59e0b", missing: "#94a3b8" };
  const labels = { sufficient: "✓", partial: "◐", missing: "○" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: `${colors[status]}18`, color: colors[status], fontSize: 12, fontWeight: 700, border: `2px solid ${colors[status]}`, flexShrink: 0 }}>
      {labels[status]}
    </span>
  );
};

const ScoreRing = ({ pct, size = 56 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 90 ? "#10b981" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : "#d1d5db";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size > 50 ? 14 : 11, fontWeight: 700, fill: color, fontFamily: "'DM Sans', sans-serif" }}>{pct}%</text>
    </svg>
  );
};

const FileUploadZone = ({ field, value, onChange }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (file) onChange(field, { ...value, file, fileName: file.name });
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      style={{ border: `2px dashed ${dragOver ? "#3b82f6" : value.file ? "#10b981" : "#cbd5e1"}`, borderRadius: 8, padding: "10px 14px", background: dragOver ? "#eff6ff" : value.file ? "#f0fdf4" : "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s", minHeight: 42 }}
    >
      <input ref={inputRef} type="file" style={{ display: "none" }} accept=".pdf,.png,.jpg,.jpeg,.visio,.vsd,.vsdx,.svg,.docx" onChange={e => handleFile(e.target.files[0])} />
      {value.file ? (
        <>
          <span style={{ fontSize: 16 }}>📎</span>
          <span style={{ fontSize: 12, color: "#059669", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{value.fileName}</span>
          <button onClick={e => { e.stopPropagation(); onChange(field, { ...value, file: null, fileName: "" }); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>✕</button>
        </>
      ) : (
        <>
          <span style={{ fontSize: 14 }}>📤</span>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>Drop file or click to upload <span style={{ color: "#94a3b8" }}>(PDF, PNG, Visio, SVG)</span></span>
        </>
      )}
    </div>
  );
};

// === MAIN COMPONENT ===
export default function EvidenceIntake() {
  const [fields, setFields] = useState(initFields);
  const [evaluated, setEvaluated] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [expandedControls, setExpandedControls] = useState({ "1.1": true });
  const [animatingEval, setAnimatingEval] = useState(false);

  const updateField = (fieldName, value) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
    if (evaluated) setEvaluated(false); // reset eval on change
  };

  const handleEvaluate = () => {
    setAnimatingEval(true);
    setTimeout(() => {
      const results = {};
      CONTROLS.forEach(c => { results[c.id] = evaluateControl(c, fields); });
      setEvaluationResults(results);
      setEvaluated(true);
      setAnimatingEval(false);
      // Auto-expand controls with gaps
      const newExpanded = {};
      CONTROLS.forEach(c => { newExpanded[c.id] = results[c.id].pct < 100; });
      setExpandedControls(newExpanded);
    }, 1200);
  };

  const toggleControl = (id) => {
    setExpandedControls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Overall score
  const overallScore = evaluationResults ? (() => {
    const mandatory = CONTROLS.filter(c => c.type === "M");
    const mandatoryScores = mandatory.map(c => evaluationResults[c.id].pct);
    return Math.round(mandatoryScores.reduce((a, b) => a + b, 0) / mandatoryScores.length);
  })() : null;

  const totalFields = CONTROLS.reduce((a, c) => a + c.requirements.length, 0);
  const filledFields = Object.values(fields).filter(f => (f.text?.trim().length > 20) || f.file).length;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #f59e0b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>YaaraLabs</div>
          <div style={{ fontSize: 11, color: "#fbbf24", padding: "3px 10px", background: "rgba(251,191,36,0.12)", borderRadius: 4, fontWeight: 600, letterSpacing: 0.5 }}>SWIFT CSP · Evidence Intake</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#93c5fd" }}>Domain A · Network & Architecture</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>RL</div>
        </div>
      </div>

      {/* Breadcrumb + Title */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
          <span style={{ cursor: "pointer", color: "#3b82f6" }}>Evidence Dashboard</span>
          <span style={{ margin: "0 6px" }}>›</span>
          <span style={{ cursor: "pointer", color: "#3b82f6" }}>Domain A: Network & Architecture</span>
          <span style={{ margin: "0 6px" }}>›</span>
          <span style={{ color: "#374151", fontWeight: 600 }}>A1. Network Architecture Diagram</span>
        </div>

        {/* Evidence Header Card */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 20, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>🗺️</span>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Network Architecture Diagram</h1>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 4, border: "1px solid #fecaca" }}>CRITICAL PRIORITY</span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px", lineHeight: 1.6 }}>
                This single evidence artifact serves <strong>6 controls</strong> across 2 principles. It is the highest-value collection item in the SWIFT compliance framework — uploading a comprehensive network diagram with proper annotations can satisfy requirements across environment protection, internet access restriction, data flow security, and external transmission controls.
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CONTROLS.map(c => (
                  <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: c.type === "M" ? "#ede9fe" : "#fef3c7", color: c.type === "M" ? "#6d28d9" : "#92400e", border: `1px solid ${c.type === "M" ? "#ddd6fe" : "#fde68a"}` }}>
                    {c.id} {c.type === "M" ? "Mandatory" : "Advisory"}
                    {c.mandatoryFrom && <span style={{ fontSize: 9, opacity: 0.8 }}> (M from {c.mandatoryFrom})</span>}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginLeft: 24 }}>
              {evaluated && overallScore !== null ? (
                <ScoreRing pct={overallScore} size={64} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>—</span>
                </div>
              )}
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>{evaluated ? "Mandatory Avg" : "Not evaluated"}</span>
            </div>
          </div>

          {/* Progress strip */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((filledFields / totalFields) * 100)}%`, background: "linear-gradient(90deg, #3b82f6, #10b981)", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", minWidth: 90, textAlign: "right" }}>{filledFields}/{totalFields} items provided</span>
          </div>
        </div>

        {/* Main Layout: Controls + Sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 24 }}>
          {/* Left: Control-by-control intake */}
          <div>
            {CONTROLS.map(control => {
              const isExpanded = expandedControls[control.id];
              const evalResult = evaluationResults?.[control.id];
              return (
                <div key={control.id} style={{ background: "#fff", borderRadius: 10, marginBottom: 12, border: `1px solid ${evaluated && evalResult ? (evalResult.pct >= 90 ? "#a7f3d0" : evalResult.pct >= 50 ? "#fde68a" : "#fecaca") : "#e2e8f0"}`, overflow: "hidden", transition: "border-color 0.3s" }}>
                  {/* Control Header */}
                  <div onClick={() => toggleControl(control.id)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: evaluated && evalResult ? (evalResult.pct >= 90 ? "#f0fdf4" : evalResult.pct >= 50 ? "#fffbeb" : "#fef2f2") : "#fafbfc", borderBottom: isExpanded ? "1px solid #e5e7eb" : "none", transition: "background 0.3s" }}>
                    <span style={{ fontSize: 12, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#64748b" }}>▶</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "'JetBrains Mono', monospace", minWidth: 38 }}>{control.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{control.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: control.type === "M" ? "#7c3aed" : "#d97706", background: control.type === "M" ? "#ede9fe" : "#fef3c7", padding: "2px 8px", borderRadius: 4 }}>{control.type === "M" ? "MANDATORY" : "ADVISORY"}</span>
                    {evaluated && evalResult && <ScoreRing pct={evalResult.pct} size={36} />}
                    {evaluated && evalResult && <span style={{ fontSize: 10, color: "#64748b" }}>{evalResult.sufficient}/{evalResult.total}</span>}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
                        <strong>Principle:</strong> {control.principle} &nbsp;|&nbsp; <strong>Objective:</strong> {control.objective}
                      </div>

                      {control.requirements.map((req, idx) => {
                        const field = fields[req.field];
                        const evalItem = evalResult?.results?.find(r => r.id === req.id);
                        const guidance = evaluated ? getGuidance(req, field) : null;

                        return (
                          <div key={req.id} style={{ marginBottom: idx < control.requirements.length - 1 ? 16 : 0, paddingBottom: idx < control.requirements.length - 1 ? 16 : 0, borderBottom: idx < control.requirements.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                              {evaluated && evalItem ? <StatusDot status={evalItem.status} /> : <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8", fontWeight: 700, border: "2px solid #e2e8f0", flexShrink: 0 }}>{idx + 1}</span>}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{req.label}</div>
                                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{req.description}</div>
                              </div>
                              {req.type === "diagram" && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "#dbeafe", color: "#1d4ed8", fontWeight: 600, flexShrink: 0 }}>VISUAL</span>}
                            </div>

                            {/* Input area */}
                            <div style={{ marginLeft: 32 }}>
                              {req.type === "diagram" && <FileUploadZone field={req.field} value={field} onChange={updateField} />}
                              <textarea
                                value={field.text}
                                onChange={e => updateField(req.field, { ...field, text: e.target.value })}
                                placeholder={req.type === "diagram" ? "Add annotations or description of what the diagram shows for this requirement..." : `Describe: ${req.label.toLowerCase()}...`}
                                style={{ width: "100%", minHeight: req.type === "diagram" ? 48 : 64, marginTop: req.type === "diagram" ? 8 : 0, padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#fafbfc", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
                                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                              />
                            </div>

                            {/* Guidance (post-evaluation) */}
                            {evaluated && guidance && (
                              <div style={{ marginLeft: 32, marginTop: 8, padding: "8px 12px", background: evalItem?.status === "partial" ? "#fffbeb" : "#fff7ed", borderRadius: 6, borderLeft: `3px solid ${evalItem?.status === "partial" ? "#f59e0b" : "#f97316"}`, fontSize: 11, color: "#78350f", lineHeight: 1.5 }}>
                                <strong style={{ color: "#92400e" }}>💡 Guidance:</strong> {guidance}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Evaluate Button */}
            <div style={{ position: "sticky", top: 16 }}>
              <button
                onClick={handleEvaluate}
                disabled={animatingEval}
                style={{ width: "100%", padding: "14px 20px", borderRadius: 10, border: "none", background: animatingEval ? "#94a3b8" : "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: animatingEval ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3, boxShadow: "0 4px 14px rgba(30,64,175,0.3)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {animatingEval ? (
                  <>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 16 }}>⟳</span>
                    Evaluating Sufficiency...
                  </>
                ) : (
                  <>🔍 Evaluate Sufficiency</>
                )}
              </button>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", marginTop: 6 }}>AI checks if evidence covers all requirements per control</div>

              {/* Sufficiency Summary */}
              {evaluated && evaluationResults && (
                <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Sufficiency Summary</div>
                  {CONTROLS.map(c => {
                    const r = evaluationResults[c.id];
                    const color = r.pct >= 90 ? "#10b981" : r.pct >= 50 ? "#f59e0b" : r.pct > 0 ? "#ef4444" : "#d1d5db";
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", fontFamily: "'JetBrains Mono', monospace", minWidth: 32 }}>{c.id}</span>
                        <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 3, height: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${r.pct}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32, textAlign: "right" }}>{r.pct}%</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{r.sufficient}/{r.total}</span>
                      </div>
                    );
                  })}
                  {/* Overall */}
                  <div style={{ marginTop: 12, padding: "10px 0 0", borderTop: "2px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Overall (Mandatory)</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: overallScore >= 90 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444" }}>{overallScore}%</span>
                  </div>
                </div>
              )}

              {/* Gap Quick Reference */}
              {evaluated && evaluationResults && (() => {
                const gaps = [];
                CONTROLS.forEach(c => {
                  const r = evaluationResults[c.id];
                  r.results.filter(i => i.status !== "sufficient").forEach(i => gaps.push({ control: c.id, ...i }));
                });
                if (gaps.length === 0) return (
                  <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 10, border: "1px solid #a7f3d0", padding: 14, textAlign: "center" }}>
                    <span style={{ fontSize: 18 }}>🎉</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginTop: 4 }}>All requirements satisfied!</div>
                    <div style={{ fontSize: 11, color: "#047857", marginTop: 2 }}>This evidence is ready for review submission.</div>
                  </div>
                );
                return (
                  <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>⚠ {gaps.length} gap{gaps.length > 1 ? "s" : ""} remaining</div>
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                      {gaps.map((g, i) => (
                        <div key={i} style={{ padding: "6px 0", borderBottom: i < gaps.length - 1 ? "1px solid #f3f4f6" : "none", fontSize: 11 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <StatusDot status={g.status} />
                            <span style={{ fontWeight: 700, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{g.control}</span>
                            <span style={{ color: "#64748b" }}>{g.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Controls served reference */}
              <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Controls Served (6)</div>
                <div style={{ fontSize: 11, color: "#475569", lineHeight: 2 }}>
                  {CONTROLS.map(c => (
                    <div key={c.id} onClick={() => { setExpandedControls(prev => ({ ...prev, [c.id]: true })); document.getElementById(`ctrl-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "2px 4px", borderRadius: 4, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#3b82f6" }}>{c.id}</span>
                      <span>{c.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, color: c.type === "M" ? "#7c3aed" : "#d97706" }}>{c.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection value */}
              <div style={{ marginTop: 16, background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", borderRadius: 10, border: "1px solid #c7d2fe", padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>🎯 Collection Efficiency</div>
                <div style={{ fontSize: 11, color: "#4338ca", lineHeight: 1.6 }}>
                  This single upload satisfies requirements across <strong>6 controls</strong>. Without the platform, organizations would collect this diagram <strong>6 separate times</strong> — one per control. That's an <strong>83% reduction</strong> in collection effort for network architecture evidence alone.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 20px", textAlign: "center", fontSize: 10, color: "#94a3b8", borderTop: "1px solid #e5e7eb", background: "#fff" }}>
        YaaraLabs · SWIFT Compliance Platform · Phase 1 Pilot · Evidence Item A1 · Network Architecture Diagram
      </div>
    </div>
  );
}
