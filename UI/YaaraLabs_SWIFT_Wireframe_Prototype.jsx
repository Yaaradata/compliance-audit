import { useState } from "react";

// === MOCK DATA ===
const DOMAINS = [
  { id: "A", name: "Network & Architecture", items: 6, completed: 5, controls: ["1.1","1.3","1.4","1.5","2.1","2.4A","2.5A"], gap: null },
  { id: "B", name: "System Hardening & Config", items: 8, completed: 6, controls: ["1.2","2.3","2.6","2.10","4.1","4.2"], gap: "B7 Virtualisation config missing" },
  { id: "C", name: "Access Management", items: 9, completed: 7, controls: ["5.1","5.2","5.3A","5.4"], gap: "C5 Quarterly access review overdue" },
  { id: "D", name: "Vulnerability & Patch Mgmt", items: 6, completed: 6, controls: ["2.2","2.7","7.3A"], gap: null },
  { id: "E", name: "Monitoring & Detection", items: 8, completed: 5, controls: ["6.1","6.2","6.3","6.4","6.5A"], gap: "E3 SIEM config needed" },
  { id: "F", name: "Third-Party & Outsourcing", items: 5, completed: 3, controls: ["2.8"], gap: "F4 Security risk assessments incomplete" },
  { id: "G", name: "Physical Security", items: 4, completed: 4, controls: ["3.1"], gap: null },
  { id: "H", name: "Policies & Governance", items: 9, completed: 7, controls: ["2.9","2.11A","7.1","7.2","7.4A"], gap: "H2 IR exercise records pending" },
];

const CONTROLS = [
  { id: "1.1", name: "SWIFT Environment Protection", type: "M", obj: 1, score: 95, evidenceCount: 4, status: "approved" },
  { id: "1.2", name: "OS Privileged Account Control", type: "M", obj: 1, score: 88, evidenceCount: 3, status: "approved" },
  { id: "1.3", name: "Virtualisation/Cloud Protection", type: "A", obj: 1, score: 45, evidenceCount: 1, status: "partial" },
  { id: "1.4", name: "Restriction of Internet Access", type: "M", obj: 1, score: 100, evidenceCount: 3, status: "approved" },
  { id: "1.5", name: "Customer Environment Protection", type: "M", obj: 1, score: 92, evidenceCount: 3, status: "approved" },
  { id: "2.1", name: "Internal Data Flow Security", type: "M", obj: 1, score: 85, evidenceCount: 3, status: "approved" },
  { id: "2.2", name: "Security Updates", type: "M", obj: 1, score: 100, evidenceCount: 4, status: "approved" },
  { id: "2.3", name: "System Hardening", type: "M", obj: 1, score: 78, evidenceCount: 3, status: "review" },
  { id: "2.4A", name: "Back Office Data Flow Security", type: "A", obj: 1, score: 60, evidenceCount: 2, status: "partial" },
  { id: "2.5A", name: "External Transmission Data Protection", type: "A", obj: 1, score: 70, evidenceCount: 2, status: "partial" },
  { id: "2.6", name: "Operator Session Confidentiality", type: "M", obj: 1, score: 95, evidenceCount: 2, status: "approved" },
  { id: "2.7", name: "Vulnerability Scanning", type: "M", obj: 1, score: 100, evidenceCount: 3, status: "approved" },
  { id: "2.8", name: "Outsourced Critical Activity Protection", type: "M", obj: 1, score: 55, evidenceCount: 3, status: "gap" },
  { id: "2.9", name: "Transaction Business Controls", type: "M", obj: 1, score: 90, evidenceCount: 2, status: "approved" },
  { id: "2.10", name: "Application Hardening", type: "M", obj: 1, score: 82, evidenceCount: 2, status: "review" },
  { id: "2.11A", name: "RMA Business Controls", type: "A", obj: 1, score: 75, evidenceCount: 1, status: "partial" },
  { id: "3.1", name: "Physical Security", type: "M", obj: 1, score: 100, evidenceCount: 4, status: "approved" },
  { id: "4.1", name: "Password Policy", type: "M", obj: 2, score: 95, evidenceCount: 3, status: "approved" },
  { id: "4.2", name: "Multi-Factor Authentication", type: "M", obj: 2, score: 100, evidenceCount: 3, status: "approved" },
  { id: "5.1", name: "Logical Access Control", type: "M", obj: 2, score: 72, evidenceCount: 4, status: "review" },
  { id: "5.2", name: "Token Management", type: "M", obj: 2, score: 88, evidenceCount: 2, status: "approved" },
  { id: "5.3A", name: "Personnel Vetting Process", type: "A", obj: 2, score: 65, evidenceCount: 1, status: "partial" },
  { id: "5.4", name: "Physical & Logical Password Storage", type: "M", obj: 2, score: 92, evidenceCount: 2, status: "approved" },
  { id: "6.1", name: "Malware Protection", type: "M", obj: 3, score: 100, evidenceCount: 3, status: "approved" },
  { id: "6.2", name: "Software Integrity", type: "M", obj: 3, score: 85, evidenceCount: 2, status: "approved" },
  { id: "6.3", name: "Database Integrity", type: "M", obj: 3, score: 78, evidenceCount: 2, status: "review" },
  { id: "6.4", name: "Logging and Monitoring", type: "M", obj: 3, score: 68, evidenceCount: 3, status: "partial" },
  { id: "6.5A", name: "Intrusion Detection", type: "A", obj: 3, score: 50, evidenceCount: 1, status: "partial" },
  { id: "7.1", name: "Cyber Incident Response Planning", type: "M", obj: 3, score: 82, evidenceCount: 3, status: "review" },
  { id: "7.2", name: "Security Training & Awareness", type: "M", obj: 3, score: 90, evidenceCount: 3, status: "approved" },
  { id: "7.3A", name: "Penetration Testing", type: "A", obj: 3, score: 85, evidenceCount: 2, status: "approved" },
  { id: "7.4A", name: "Scenario Risk Assessment", type: "A", obj: 3, score: 40, evidenceCount: 1, status: "gap" },
];

const REVIEW_ITEMS = [
  { id: 1, title: "Network Architecture Diagram v3.2", domain: "A", controls: ["1.1","1.4","1.5"], submitter: "J. Chen", date: "Jan 28", status: "pending", impact: "HIGH" },
  { id: 2, title: "Firewall Rule Export - Core Zone", domain: "A", controls: ["1.1","1.4"], submitter: "M. Patel", date: "Jan 27", status: "in_review", impact: "CRITICAL" },
  { id: 3, title: "SIEM Configuration Screenshots", domain: "E", controls: ["6.4"], submitter: "S. Kim", date: "Jan 29", status: "pending", impact: "HIGH" },
  { id: 4, title: "Access Control Policy v2.1", domain: "C", controls: ["5.1","4.2","1.2"], submitter: "A. Wong", date: "Jan 26", status: "approved", impact: "CRITICAL" },
  { id: 5, title: "Vendor Risk Assessment - CloudCo", domain: "F", controls: ["2.8"], submitter: "R. Singh", date: "Jan 29", status: "returned", impact: "HIGH" },
  { id: 6, title: "Patch Deployment Records Q4", domain: "D", controls: ["2.2"], submitter: "T. Brown", date: "Jan 25", status: "approved", impact: "MEDIUM" },
  { id: 7, title: "IR Plan - SWIFT Scenarios", domain: "H", controls: ["7.1"], submitter: "L. Garcia", date: "Jan 28", status: "in_review", impact: "HIGH" },
  { id: 8, title: "MFA Config - Alliance Lite2", domain: "B", controls: ["4.2"], submitter: "M. Patel", date: "Jan 27", status: "approved", impact: "CRITICAL" },
];

// === HELPERS ===
const scoreColor = (s) => s >= 90 ? "#059669" : s >= 60 ? "#d97706" : s > 0 ? "#dc2626" : "#9ca3af";
const scoreBg = (s) => s >= 90 ? "#d1fae5" : s >= 60 ? "#fef3c7" : s > 0 ? "#fee2e2" : "#f3f4f6";
const statusColor = { approved: "#059669", review: "#2563eb", partial: "#d97706", gap: "#dc2626", pending: "#d97706", in_review: "#2563eb", returned: "#ea580c" };
const statusLabel = { approved: "Approved", review: "In Review", partial: "Partial", gap: "Gap", pending: "Pending", in_review: "In Review", returned: "Returned" };

const ProgressBar = ({ pct, h = 8 }) => (
  <div style={{ background: "#e5e7eb", borderRadius: h/2, height: h, width: "100%", overflow: "hidden" }}>
    <div style={{ background: scoreColor(pct), height: "100%", width: `${pct}%`, borderRadius: h/2, transition: "width 0.5s" }} />
  </div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: 0.3 }}>{text}</span>
);

const ControlHeatmap = ({ controls, onSelect, selected }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 3 }}>
    {controls.map(c => (
      <div key={c.id} onClick={() => onSelect?.(c)} title={`${c.id} ${c.name}: ${c.score}%`}
        style={{ width: "100%", aspectRatio: "1", borderRadius: 4, background: scoreBg(c.score),
          border: selected?.id === c.id ? "2px solid #1e40af" : `2px solid ${scoreColor(c.score)}40`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 600, color: scoreColor(c.score), transition: "all 0.2s" }}>
        {c.id}
      </div>
    ))}
  </div>
);

// === SCREENS ===
const EvidenceDashboard = () => {
  const [selectedControl, setSelectedControl] = useState(null);
  const totalItems = DOMAINS.reduce((a, d) => a + d.items, 0);
  const completedItems = DOMAINS.reduce((a, d) => a + d.completed, 0);
  const overallPct = Math.round((completedItems / totalItems) * 100);
  const mandatoryApproved = CONTROLS.filter(c => c.type === "M" && c.score >= 90).length;
  const mandatoryTotal = CONTROLS.filter(c => c.type === "M").length;

  return (
    <div>
      {/* Overall Progress */}
      <div style={{ background: "linear-gradient(135deg, #0c2340 0%, #1a5276 100%)", borderRadius: 12, padding: "20px 24px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Overall Evidence Collection</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{overallPct}%</div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>{mandatoryApproved}/{mandatoryTotal}</div><div style={{ opacity: 0.7 }}>Mandatory Controls</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>{completedItems}/{totalItems}</div><div style={{ opacity: 0.7 }}>Evidence Items</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700 }}>3</div><div style={{ opacity: 0.7 }}>Gaps Identified</div></div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 10, overflow: "hidden" }}>
          <div style={{ background: "#34d399", height: "100%", width: `${overallPct}%`, borderRadius: 6 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
        {/* Domain Cards */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Evidence Domains</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {DOMAINS.map(d => {
              const pct = Math.round((d.completed / d.items) * 100);
              return (
                <div key={d.id} style={{ background: "white", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: scoreBg(pct), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: scoreColor(pct) }}>{d.id}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{d.name}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor(pct) }}>{pct}%</div>
                  </div>
                  <ProgressBar pct={pct} h={6} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#6b7280" }}>
                    <span>{d.completed}/{d.items} items</span>
                    <span>{d.controls.length} controls</span>
                  </div>
                  {d.gap && <div style={{ marginTop: 8, padding: "4px 8px", background: "#fef3c7", borderRadius: 4, fontSize: 11, color: "#92400e" }}>⚠ {d.gap}</div>}
                </div>
              );
            })}
          </div>
          {/* Upload Zone */}
          <div style={{ marginTop: 16, border: "2px dashed #93c5fd", borderRadius: 10, padding: 24, textAlign: "center", background: "#eff6ff", cursor: "pointer" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📎</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Drop files here or click to upload</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>AI will auto-classify and suggest control mappings</div>
          </div>
        </div>

        {/* Right Sidebar - Control Heatmap */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Control Sufficiency (32)</div>
          <div style={{ background: "white", borderRadius: 10, padding: 12, border: "1px solid #e5e7eb" }}>
            <ControlHeatmap controls={CONTROLS} onSelect={setSelectedControl} selected={selectedControl} />
            {selectedControl && (
              <div style={{ marginTop: 12, padding: 10, background: "#f9fafb", borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: "#1f2937" }}>{selectedControl.id} {selectedControl.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  <ProgressBar pct={selectedControl.score} h={6} />
                  <span style={{ fontWeight: 700, color: scoreColor(selectedControl.score), minWidth: 36 }}>{selectedControl.score}%</span>
                </div>
                <div style={{ marginTop: 4, color: "#6b7280" }}>{selectedControl.evidenceCount} evidence items • {selectedControl.type === "M" ? "Mandatory" : "Advisory"}</div>
              </div>
            )}
          </div>
          {/* AI Insights */}
          <div style={{ marginTop: 16, background: "#f0f9ff", borderRadius: 10, padding: 12, border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>🤖 AI Suggestions</div>
            <div style={{ fontSize: 11, color: "#0c4a6e", lineHeight: 1.5 }}>
              <div style={{ padding: "4px 0", borderBottom: "1px solid #bae6fd" }}>Upload vendor risk assessments to improve Control 2.8 from 55% → ~90%</div>
              <div style={{ padding: "4px 0", borderBottom: "1px solid #bae6fd" }}>SIEM config screenshot needed for Control 6.4</div>
              <div style={{ padding: "4px 0" }}>Quarterly access review records will close gap on Control 5.1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewQueue = () => {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const filtered = filter === "all" ? REVIEW_ITEMS : REVIEW_ITEMS.filter(i => i.status === filter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
      <div>
        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "My Queue", count: 3, color: "#2563eb", bg: "#eff6ff" },
            { label: "Unassigned", count: 2, color: "#d97706", bg: "#fffbeb" },
            { label: "Overdue", count: 1, color: "#dc2626", bg: "#fef2f2" },
            { label: "Completed Today", count: 4, color: "#059669", bg: "#ecfdf5" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 8, padding: 12, textAlign: "center", cursor: "pointer", border: `1px solid ${m.color}20` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.count}</div>
              <div style={{ fontSize: 11, color: m.color, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["all","pending","in_review","returned","approved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: filter === f ? "#1e40af" : "white", color: filter === f ? "white" : "#374151", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
              {f === "all" ? "All" : statusLabel[f]}
            </button>
          ))}
        </div>

        {/* Queue Table */}
        <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Controls","Evidence","Domain","Submitter","Date","Status","Impact"].map(h => (
                  <th key={h} style={{ padding: "10px 8px", textAlign: "left", fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)}
                  style={{ cursor: "pointer", background: selectedItem?.id === item.id ? "#eff6ff" : "white", borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = "#f8fafc" }}
                  onMouseLeave={e => { if (selectedItem?.id !== item.id) e.currentTarget.style.background = "white" }}>
                  <td style={{ padding: "8px" }}><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{item.controls.map(c => <span key={c} style={{ background: "#e0e7ff", color: "#3730a3", padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>{c}</span>)}</div></td>
                  <td style={{ padding: "8px", fontWeight: 500, color: "#1f2937" }}>{item.title}</td>
                  <td style={{ padding: "8px" }}><Badge text={item.domain} color="#1e40af" bg="#dbeafe" /></td>
                  <td style={{ padding: "8px", color: "#6b7280" }}>{item.submitter}</td>
                  <td style={{ padding: "8px", color: "#6b7280" }}>{item.date}</td>
                  <td style={{ padding: "8px" }}><Badge text={statusLabel[item.status]} color={statusColor[item.status]} bg={`${statusColor[item.status]}18`} /></td>
                  <td style={{ padding: "8px" }}><Badge text={item.impact} color={item.impact === "CRITICAL" ? "#dc2626" : item.impact === "HIGH" ? "#d97706" : "#6b7280"} bg={item.impact === "CRITICAL" ? "#fef2f2" : item.impact === "HIGH" ? "#fffbeb" : "#f3f4f6"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview Panel */}
        {selectedItem && (
          <div style={{ marginTop: 12, background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{selectedItem.title}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Submitted by {selectedItem.submitter} on {selectedItem.date}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #059669", background: "#ecfdf5", color: "#059669", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✓ Approve</button>
                <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d97706", background: "#fffbeb", color: "#d97706", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>↩ Return</button>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 10, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0369a1", marginBottom: 4 }}>🤖 AI Summary <span style={{ fontWeight: 400, color: "#6b7280" }}>• 87% confidence</span></div>
              <div style={{ fontSize: 12, color: "#1e3a5f", lineHeight: 1.5 }}>This document provides network architecture diagrams showing the SWIFT secure zone boundaries, firewall placement, and data flow paths between SWIFT components and back-office systems. It demonstrates segregation of the secure zone from the general IT environment.</div>
            </div>
          </div>
        )}
      </div>

      {/* Control Sufficiency Sidebar */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Control Sufficiency</div>
        {[
          { obj: "Secure Your Environment", num: 1, ids: CONTROLS.filter(c => c.obj === 1) },
          { obj: "Know & Limit Access", num: 2, ids: CONTROLS.filter(c => c.obj === 2) },
          { obj: "Detect & Respond", num: 3, ids: CONTROLS.filter(c => c.obj === 3) },
        ].map(g => {
          const avg = Math.round(g.ids.reduce((a, c) => a + c.score, 0) / g.ids.length);
          return (
            <div key={g.num} style={{ background: "white", borderRadius: 8, border: "1px solid #e5e7eb", padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{g.obj}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(avg) }}>{avg}%</span>
              </div>
              {g.ids.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 10 }}>
                  <span style={{ minWidth: 28, fontWeight: 600, color: "#6b7280" }}>{c.id}</span>
                  <div style={{ flex: 1 }}><ProgressBar pct={c.score} h={4} /></div>
                  <span style={{ minWidth: 28, textAlign: "right", fontWeight: 600, color: scoreColor(c.score) }}>{c.score}%</span>
                  {c.score < 60 && <span style={{ color: "#dc2626", fontSize: 12 }}>⚠</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EvidenceDetail = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
    {/* Document Viewer */}
    <div style={{ background: "#1e293b", borderRadius: 10, padding: 20, minHeight: 400 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>📄 Network_Architecture_v3.2.pdf</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "#334155", border: "none", color: "#94a3b8", padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>⟵</button>
          <span style={{ color: "#94a3b8", fontSize: 11, padding: "3px 0" }}>Page 1 of 4</span>
          <button style={{ background: "#334155", border: "none", color: "#94a3b8", padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>⟶</button>
        </div>
      </div>
      <div style={{ background: "#f8fafc", borderRadius: 8, padding: 20, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Network Architecture Diagram</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>SWIFT Secure Zone | Firewall Boundaries | Data Flows</div>
        </div>
      </div>
    </div>

    {/* Right Panel */}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* AI Summary Card */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>🤖 AI Summary</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Badge text="92% confidence" color="#059669" bg="#d1fae5" />
            <button style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#6b7280", cursor: "pointer" }}>Edit</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 6px" }}><strong>Purpose:</strong> Network architecture documentation for the SWIFT secure zone, including logical and physical network boundaries.</p>
          <p style={{ margin: "0 0 6px" }}><strong>Key Content:</strong> Defines zone segmentation with dedicated firewalls at all boundaries. Shows SWIFT Alliance Gateway, messaging interface, and operator PC placement within the secure zone. Documents data flow paths to back-office systems via controlled interfaces.</p>
          <p style={{ margin: 0 }}><strong>Relevance:</strong> Directly supports Controls 1.1 (Environment Protection), 1.4 (Internet Access Restriction), 1.5 (Customer Environment Protection). Partial support for 2.1 (Internal Data Flow Security).</p>
        </div>
      </div>

      {/* Control Mappings */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", marginBottom: 10 }}>Control Mappings</div>
        {[
          { id: "1.1", name: "SWIFT Environment Protection", relevance: 98, impact: "+15%" },
          { id: "1.4", name: "Restriction of Internet Access", relevance: 92, impact: "+12%" },
          { id: "1.5", name: "Customer Environment Protection", relevance: 88, impact: "+10%" },
          { id: "2.1", name: "Internal Data Flow Security", relevance: 65, impact: "+8%" },
        ].map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6", gap: 8 }}>
            <Badge text={m.id} color="#1e40af" bg="#dbeafe" />
            <span style={{ flex: 1, fontSize: 11, color: "#374151" }}>{m.name}</span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>Relevance: {m.relevance}%</span>
            <Badge text={m.impact} color="#059669" bg="#d1fae5" />
          </div>
        ))}
        <button style={{ marginTop: 8, width: "100%", padding: 6, background: "#f8fafc", border: "1px dashed #d1d5db", borderRadius: 6, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>+ Add control mapping</button>
      </div>

      {/* Comments */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", marginBottom: 10 }}>Comments (2)</div>
        <div style={{ fontSize: 12, color: "#374151", padding: 8, background: "#f9fafb", borderRadius: 6, marginBottom: 8, lineHeight: 1.5 }}>
          <strong>J. Martinez</strong> <span style={{ color: "#9ca3af", fontSize: 10 }}>Jan 29, 10:15 AM</span>
          <div style={{ marginTop: 4 }}>Diagram looks good. Can we confirm the back-office data flow paths align with the new bridging server setup?</div>
        </div>
        <div style={{ fontSize: 12, color: "#374151", padding: 8, background: "#eff6ff", borderRadius: 6, lineHeight: 1.5 }}>
          <strong>M. Patel</strong> <span style={{ color: "#9ca3af", fontSize: 10 }}>Jan 29, 2:30 PM</span>
          <div style={{ marginTop: 4 }}>Updated v3.2 includes the new bridging server. See page 3 for detailed flow diagram.</div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#059669", color: "white", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>✓ Approve Evidence</button>
        <button style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d97706", background: "white", color: "#d97706", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>↩ Return for Revision</button>
      </div>
    </div>
  </div>
);

const ApprovalSignoff = () => {
  const mandatoryControls = CONTROLS.filter(c => c.type === "M");
  const mandatoryApproved = mandatoryControls.filter(c => c.score >= 90).length;
  const overallScore = Math.round(mandatoryControls.reduce((a, c) => a + c.score, 0) / mandatoryControls.length);
  const gaps = CONTROLS.filter(c => c.score < 60);
  const checksComplete = 3;
  const checksTotal = 5;

  return (
    <div>
      {/* Compliance Scorecard */}
      <div style={{ background: `linear-gradient(135deg, ${overallScore >= 80 ? "#059669" : "#d97706"} 0%, ${overallScore >= 80 ? "#047857" : "#b45309"} 100%)`, borderRadius: 12, padding: "20px 24px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Overall Compliance Score</div>
            <div style={{ fontSize: 42, fontWeight: 700 }}>{overallScore}%</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Mandatory: {mandatoryApproved}/{mandatoryControls.length} approved</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Secure Environment", count: "14/17", score: 86 },
              { label: "Know & Limit Access", count: "5/6", score: 87 },
              { label: "Detect & Respond", count: "6/9", score: 75 },
            ].map(o => (
              <div key={o.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: 12, textAlign: "center", minWidth: 110 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{o.count}</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 4 }}>{o.label}</div>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 3, height: 4 }}>
                  <div style={{ background: "white", height: "100%", width: `${o.score}%`, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          {/* Control Matrix */}
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", fontSize: 13, fontWeight: 600 }}>Control Compliance Matrix</div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {CONTROLS.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "6px 14px", borderBottom: "1px solid #f3f4f6", gap: 8, fontSize: 11 }}>
                  <span style={{ minWidth: 32, fontWeight: 600, color: "#374151" }}>{c.id}</span>
                  <Badge text={c.type} color={c.type === "M" ? "#7c3aed" : "#6b7280"} bg={c.type === "M" ? "#ede9fe" : "#f3f4f6"} />
                  <span style={{ flex: 1, color: "#374151" }}>{c.name}</span>
                  <div style={{ width: 60 }}><ProgressBar pct={c.score} h={5} /></div>
                  <span style={{ minWidth: 32, textAlign: "right", fontWeight: 600, color: scoreColor(c.score), fontSize: 11 }}>{c.score}%</span>
                  <Badge text={statusLabel[c.status]} color={statusColor[c.status]} bg={`${statusColor[c.status]}18`} />
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          {gaps.length > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b", marginBottom: 10 }}>⚠ Open Gaps ({gaps.length})</div>
              {gaps.map(g => (
                <div key={g.id} style={{ background: "white", borderRadius: 8, padding: 10, marginBottom: 8, border: "1px solid #fecaca" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><Badge text={g.id} color="#dc2626" bg="#fee2e2" /> <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 6 }}>{g.name}</span></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{g.score}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid #dc2626", background: "white", color: "#dc2626", fontSize: 10, cursor: "pointer" }}>Add Remediation Plan</button>
                    <button style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid #d97706", background: "white", color: "#d97706", fontSize: 10, cursor: "pointer" }}>Accept Risk</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign-Off Checklist */}
        <div>
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Sign-Off Checklist</div>
            {[
              { label: "All mandatory controls reviewed", done: true },
              { label: "All evidence approved", done: true },
              { label: "All gaps documented", done: true },
              { label: "IR plan is current", done: false },
              { label: "Assessment report complete", done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? "#d1fae5" : "#f3f4f6", color: item.done ? "#059669" : "#9ca3af", fontSize: 12, fontWeight: 700 }}>
                  {item.done ? "✓" : "○"}
                </span>
                <span style={{ color: item.done ? "#374151" : "#9ca3af" }}>{item.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 8, background: "#f3f4f6", borderRadius: 6, fontSize: 11, color: "#6b7280", textAlign: "center" }}>
              {checksComplete}/{checksTotal} prerequisites met
            </div>
          </div>
          <button disabled style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#9ca3af", color: "white", fontWeight: 700, fontSize: 14, cursor: "not-allowed", opacity: 0.7 }}>
            🔒 Sign & Attest (MFA Required)
          </button>
          <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 6 }}>Complete all prerequisites to enable attestation</div>
        </div>
      </div>
    </div>
  );
};

const ReportPreview = () => {
  const sections = [
    { name: "Executive Summary", status: "draft", ai: true },
    { name: "Scope Statement", status: "complete", ai: false },
    { name: "Methodology", status: "complete", ai: false },
    { name: "Control Assessments", status: "in_progress", ai: true, sub: "24/32 drafted" },
    { name: "Gap Analysis", status: "draft", ai: true },
    { name: "Evidence Index", status: "complete", ai: false },
    { name: "Glossary", status: "complete", ai: false },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
      {/* Section Navigation */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Report Sections</div>
        {sections.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 6px", borderRadius: 6, cursor: "pointer", background: i === 0 ? "#eff6ff" : "transparent", marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.status === "complete" ? "#059669" : s.status === "in_progress" ? "#d97706" : "#93c5fd" }} />
            <span style={{ fontSize: 11, color: i === 0 ? "#1e40af" : "#374151", fontWeight: i === 0 ? 600 : 400 }}>{s.name}</span>
            {s.ai && <span style={{ fontSize: 9, color: "#6b7280" }}>🤖</span>}
          </div>
        ))}
        <div style={{ marginTop: 12, padding: 8, background: "#f9fafb", borderRadius: 6, fontSize: 11, color: "#6b7280", textAlign: "center" }}>
          5/7 sections complete
        </div>
      </div>

      {/* Document Preview */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Executive Summary <Badge text="AI Draft" color="#2563eb" bg="#dbeafe" /></div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 4, background: "white", fontSize: 10, color: "#374151", cursor: "pointer" }}>🔄 Regenerate</button>
            <button style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 4, background: "white", fontSize: 10, color: "#374151", cursor: "pointer" }}>✏️ Edit</button>
          </div>
        </div>
        <div style={{ padding: 24, fontSize: 13, color: "#1f2937", lineHeight: 1.8, maxHeight: 380, overflowY: "auto" }}>
          <h2 style={{ fontSize: 18, color: "#0c2340", marginBottom: 12 }}>Executive Summary</h2>
          <p style={{ marginBottom: 12 }}>This report presents the findings of the 2025 SWIFT Customer Security Controls Framework (CSCF) compliance assessment for <strong>[Organization Name]</strong>, BIC code <strong>[BIC-CODE]</strong>, operating under Architecture Type <strong>A1</strong>.</p>
          <p style={{ marginBottom: 12 }}>The assessment evaluated compliance across all 25 mandatory controls and 7 advisory controls. Of the mandatory controls, <strong>22 were found fully compliant</strong> (scoring above 90% sufficiency), <strong>2 require minor remediation</strong>, and <strong>1 has an identified gap</strong> requiring a risk acceptance decision.</p>
          <p style={{ marginBottom: 12, padding: "8px 12px", background: "#fef3c7", borderRadius: 6, borderLeft: "3px solid #d97706" }}>
            <strong>Key Finding:</strong> Control 2.8 (Outsourced Critical Activity Protection) requires completion of security risk assessments for two third-party providers. Remediation plan targets completion by March 2026.
          </p>
          <p style={{ marginBottom: 12 }}>Overall compliance posture is <strong>strong</strong>, with an aggregate mandatory control score of <strong>87%</strong>. The organization demonstrates mature security practices across network segmentation, access control, and monitoring domains.</p>
          <p style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}>This section was drafted by AI and requires human review before finalization. Click "Edit" to make changes.</p>
        </div>
        {/* Export Bar */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#0c2340", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📄 Export PDF</button>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>📝 Export Word</button>
            <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>📊 Export XML</button>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Last saved: 2 min ago | v3.1</div>
        </div>
      </div>
    </div>
  );
};

// === MAIN APP ===
export default function App() {
  const [screen, setScreen] = useState(0);
  const screens = [
    { label: "1. Evidence Dashboard", icon: "📊", component: <EvidenceDashboard /> },
    { label: "2. Review Queue", icon: "📋", component: <ReviewQueue /> },
    { label: "3. Evidence Detail", icon: "🔍", component: <EvidenceDetail /> },
    { label: "4. Approval & Sign-Off", icon: "✅", component: <ApprovalSignoff /> },
    { label: "5. Report Preview", icon: "📄", component: <ReportPreview /> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>
      {/* Top Header */}
      <div style={{ background: "#0c2340", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>YaaraLabs</div>
          <div style={{ fontSize: 11, color: "#93c5fd", padding: "2px 8px", background: "rgba(147,197,253,0.15)", borderRadius: 4 }}>SWIFT Compliance Platform</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#93c5fd" }}>Assessment Cycle: 2025</span>
          <span style={{ fontSize: 11, color: "#93c5fd" }}>Architecture: A1</span>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 600 }}>RL</div>
        </div>
      </div>

      {/* Screen Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 20px", display: "flex", gap: 4, overflowX: "auto" }}>
        {screens.map((s, i) => (
          <button key={i} onClick={() => setScreen(i)}
            style={{ padding: "10px 14px", border: "none", borderBottom: screen === i ? "2px solid #1e40af" : "2px solid transparent",
              background: "transparent", color: screen === i ? "#1e40af" : "#6b7280",
              fontWeight: screen === i ? 600 : 400, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Screen Content */}
      <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
        {screens[screen].component}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", textAlign: "center", fontSize: 10, color: "#9ca3af", borderTop: "1px solid #e5e7eb" }}>
        Low-Fidelity Prototype | YaaraLabs SWIFT Compliance Platform | Phase 1 Pilot | February 2026
      </div>
    </div>
  );
}
