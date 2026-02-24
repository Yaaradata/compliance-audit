import { useState, useMemo } from "react";

const DOMAINS = [
  { id: "A", name: "Network & Architecture", color: "#0F4C75", accent: "#BBE1FA", controls: ["1.1","1.3","1.4","1.5","2.1","2.4A","2.5A"], items: 6 },
  { id: "B", name: "System Hardening & Config", color: "#1B5E20", accent: "#C8E6C9", controls: ["1.2","2.3","2.6","2.10","4.1","4.2"], items: 8 },
  { id: "C", name: "Access Management", color: "#E65100", accent: "#FFE0B2", controls: ["5.1","5.2","5.3A","5.4"], items: 9 },
  { id: "D", name: "Vulnerability & Patch Mgmt", color: "#B71C1C", accent: "#FFCDD2", controls: ["2.2","2.7","7.3A"], items: 6 },
  { id: "E", name: "Monitoring & Detection", color: "#4A148C", accent: "#E1BEE7", controls: ["6.1","6.2","6.3","6.4","6.5A"], items: 7 },
  { id: "F", name: "Third-Party & Outsourcing", color: "#1565C0", accent: "#BBDEFB", controls: ["2.8"], items: 4 },
  { id: "G", name: "Physical Security", color: "#F57F17", accent: "#FFF9C4", controls: ["3.1"], items: 4 },
  { id: "H", name: "Policies & Governance", color: "#BF360C", accent: "#FFCCBC", controls: ["2.9","2.11A","7.1","7.2","7.4A"], items: 9 },
];

const EVIDENCE_ITEMS = [
  { code:"A1", name:"Network architecture diagram", domain:"A", priority:"CRITICAL", controlsServed:["1.1","1.4","1.5","2.1","2.4A","2.5A"], mix:"4M+2A", format:"Visio/PDF diagram", sufficiency:"Secure zone boundaries, firewall placement at all ingress/egress, all systems identified, data flow annotations, zone integrity monitoring", reuse:"83% reduction — collected 6× without platform" },
  { code:"A2", name:"SWIFT component inventory", domain:"A", priority:"CRITICAL", controlsServed:["1.1","1.3","1.5","2.4A","2.8"], mix:"3M+2A", format:"Spreadsheet/CMDB", sufficiency:"Complete system list with hostname, IP, OS, function, physical/virtual, zone placement, third-party flags", reuse:"Single inventory satisfies 5 control areas" },
  { code:"A3", name:"Data flow diagrams", domain:"A", priority:"HIGH", controlsServed:["2.1","2.4A","2.5A"], mix:"1M+2A", format:"Visio/PDF diagram", sufficiency:"All data flows with direction, protocol, encryption method per flow, bridging server identification", reuse:"One diagram covers internal, back-office, and external flows" },
  { code:"A4", name:"Firewall rule sets", domain:"A", priority:"CRITICAL", controlsServed:["1.1","1.4","1.5"], mix:"3M", format:"Config export/PDF", sufficiency:"Deny-by-default posture, explicitly permitted traffic only, direction per rule, no direct internet, customer connector segmentation", reuse:"Single export satisfies 3 mandatory controls" },
  { code:"A5", name:"Architecture type declaration", domain:"A", priority:"CRITICAL", controlsServed:["All 32"], mix:"25M+7A", format:"Form/text", sufficiency:"Formal A1/A2/A3/A4/B declaration with supporting rationale and component ownership model", reuse:"Foundational — determines applicability of every control" },
  { code:"A6", name:"Secure zone design rationale", domain:"A", priority:"HIGH", controlsServed:["1.1","1.5"], mix:"2M", format:"Document", sufficiency:"Zone boundary justification referencing SWIFT SG, customer connector rationale (if A1)", reuse:"Single rationale covers environment + customer protection" },
  { code:"B1", name:"OS hardening configuration", domain:"B", priority:"CRITICAL", controlsServed:["1.2","2.3"], mix:"2M", format:"Config/screenshots", sufficiency:"Per-system: privileged accounts, services disabled, USB restrictions, CIS/SWIFT SG baseline", reuse:"Same evidence serves privileged account + system hardening" },
  { code:"B2", name:"SWIFT application security config", domain:"B", priority:"CRITICAL", controlsServed:["2.6","2.10"], mix:"2M", format:"Config/screenshots", sufficiency:"Session encryption (TLS/SSH), GUI security, timeouts, app whitelisting, SWIFT SG hardening", reuse:"Single config set covers session + app hardening" },
  { code:"B3", name:"Encryption configuration", domain:"B", priority:"HIGH", controlsServed:["2.1","2.4A","2.5A","2.6"], mix:"2M+2A", format:"Config exports", sufficiency:"TLS versions (≥1.2), cipher suites, certificate management, at-rest encryption for backups", reuse:"One config evidence set satisfies 4 data security controls" },
  { code:"B4", name:"Virtualisation/cloud platform config", domain:"B", priority:"HIGH", controlsServed:["1.3"], mix:"1A", format:"Config/screenshots", sufficiency:"VM isolation, platform hardening, admin access controls, resource separation", reuse:"Control-specific (1.3 only)" },
  { code:"B5", name:"Password policy configuration", domain:"B", priority:"HIGH", controlsServed:["4.1"], mix:"1M", format:"Policy + config", sufficiency:"Min length ≥10, complexity, lockout, history, validity period, token/device PINs", reuse:"Control-specific (4.1 only)" },
  { code:"B6", name:"Hardening baseline comparison", domain:"B", priority:"HIGH", controlsServed:["2.3","2.10","6.2"], mix:"3M", format:"Scan report/checklist", sufficiency:"CIS/SWIFT SG comparison, deviation justifications, application integrity, authorized software list", reuse:"67% reduction — covers 3 hardening & integrity controls" },
  { code:"B7", name:"MFA configuration evidence", domain:"B", priority:"CRITICAL", controlsServed:["4.2"], mix:"1M", format:"Config screenshots", sufficiency:"MFA enforced at all access points, MFA types, coverage matrix, break-glass procedures", reuse:"Control-specific (4.2 only)" },
  { code:"B8", name:"Operator session security config", domain:"B", priority:"HIGH", controlsServed:["2.6"], mix:"1M", format:"Config exports", sufficiency:"TLS/SSH for all sessions, timeouts, concurrent session limits, session logging", reuse:"Supplements B2 for detailed session controls" },
  { code:"C1", name:"Access control policy", domain:"C", priority:"CRITICAL", controlsServed:["1.2","1.3","2.6","4.2","5.1"], mix:"4M+1A", format:"Policy document", sufficiency:"RBAC model, privileged access rules, MFA requirements, session management, JML process, quarterly review mandate", reuse:"Highest-reuse policy — covers 5 controls across 3 principles" },
  { code:"C2", name:"Privileged account inventory", domain:"C", priority:"CRITICAL", controlsServed:["1.2","5.1"], mix:"2M", format:"Spreadsheet/PAM export", sufficiency:"All privileged accounts with justification, assigned person, last review, usage evidence, status", reuse:"Same list serves OS control + logical access control" },
  { code:"C3", name:"User access list (all accounts)", domain:"C", priority:"HIGH", controlsServed:["5.1"], mix:"1M", format:"System export", sufficiency:"All accounts with role assignments, permissions, department, creation/last login dates", reuse:"Control-specific (5.1)" },
  { code:"C4", name:"RBAC role definitions", domain:"C", priority:"HIGH", controlsServed:["5.1"], mix:"1M", format:"Config/matrix doc", sufficiency:"Roles with permissions, separation of duties matrix, user-to-role mapping, maker-checker enforcement", reuse:"Control-specific (5.1)" },
  { code:"C5", name:"Quarterly access review records", domain:"C", priority:"HIGH", controlsServed:["5.1"], mix:"1M", format:"Review documentation", sufficiency:"4 reviews/year, reviewer + scope + findings + actions + management sign-off per review", reuse:"Control-specific (5.1)" },
  { code:"C6", name:"Joiner/mover/leaver process", domain:"C", priority:"MEDIUM", controlsServed:["5.1"], mix:"1M", format:"Process doc + logs", sufficiency:"Documented JML process, HR trigger mechanism, timeliness SLAs, execution evidence", reuse:"Control-specific (5.1)" },
  { code:"C7", name:"Token/certificate inventory", domain:"C", priority:"HIGH", controlsServed:["5.2"], mix:"1M", format:"Inventory/PKI export", sufficiency:"All tokens with assignment, lifecycle procedures, annual review, revocation for leavers, PED key management", reuse:"Control-specific (5.2)" },
  { code:"C8", name:"Credential storage evidence", domain:"C", priority:"HIGH", controlsServed:["5.4"], mix:"1M", format:"Config/vault screenshots", sufficiency:"No plaintext storage, encryption-at-rest, authenticated access, access logging, physical password security", reuse:"Control-specific (5.4)" },
  { code:"C9", name:"Personnel vetting records", domain:"C", priority:"MEDIUM", controlsServed:["5.3A"], mix:"1A", format:"HR documentation", sufficiency:"Screening policy, pre-employment checks, periodic re-vetting, contractor coverage", reuse:"Advisory control (5.3A)" },
  { code:"D1", name:"Patch management policy", domain:"D", priority:"HIGH", controlsServed:["2.2"], mix:"1M", format:"Policy document", sufficiency:"Patch frequency, testing requirements, rollback procedures, emergency process, vendor support lifecycle", reuse:"Control-specific (2.2)" },
  { code:"D2", name:"Current patch levels", domain:"D", priority:"CRITICAL", controlsServed:["2.2"], mix:"1M", format:"Scan/WSUS report", sufficiency:"Per-system OS + app patch level, missing critical patches, vendor support status, maintenance contracts", reuse:"Control-specific (2.2)" },
  { code:"D3", name:"Patch deployment records (12mo)", domain:"D", priority:"HIGH", controlsServed:["2.2"], mix:"1M", format:"Deployment logs", sufficiency:"Monthly records, time-to-deployment, testing evidence, failed deployments, system coverage", reuse:"Control-specific (2.2)" },
  { code:"D4", name:"Vulnerability scan reports", domain:"D", priority:"CRITICAL", controlsServed:["2.7"], mix:"1M", format:"Scanner output", sufficiency:"All SWIFT systems scanned, scanner + version, scan within 90 days, findings by severity, OS + app coverage", reuse:"Control-specific (2.7)" },
  { code:"D5", name:"Vulnerability remediation tracking", domain:"D", priority:"HIGH", controlsServed:["2.7","7.3A"], mix:"1M+1A", format:"Tracking log", sufficiency:"Per finding: ID, severity, system, owner, target date, resolution date, verification evidence", reuse:"Single tracker covers vuln scanning + pen test follow-up" },
  { code:"D6", name:"Penetration test reports", domain:"D", priority:"HIGH", controlsServed:["7.3A"], mix:"1A", format:"Pen test report", sufficiency:"SWIFT scope, methodology, findings with severity, exploitation evidence, retest results", reuse:"Advisory control (7.3A)" },
  { code:"E1", name:"Anti-malware config & updates", domain:"E", priority:"CRITICAL", controlsServed:["6.1"], mix:"1M", format:"Config/console export", sufficiency:"AV per system, daily definition updates, real-time scanning, scheduled full scans, exclusions justified", reuse:"Control-specific (6.1)" },
  { code:"E2", name:"SIEM/logging configuration", domain:"E", priority:"CRITICAL", controlsServed:["6.4"], mix:"1M", format:"SIEM config export", sufficiency:"All systems sending logs, event types captured, retention ≥6 months, integrity protection, review process", reuse:"Control-specific (6.4)" },
  { code:"E3", name:"Alert rules & escalation procedures", domain:"E", priority:"HIGH", controlsServed:["6.4","6.5A"], mix:"1M+1A", format:"Documentation", sufficiency:"SWIFT-specific alert rules, escalation matrix, response procedures per alert type, IDS/IPS rules", reuse:"One doc covers logging/monitoring + intrusion detection" },
  { code:"E4", name:"Software integrity verification", domain:"E", priority:"HIGH", controlsServed:["6.2","2.10"], mix:"2M", format:"Check results/FIM", sufficiency:"Integrity verification process, baseline checks, change detection, authorized software list, SWIFT version match", reuse:"Integrity checks serve software integrity + app hardening" },
  { code:"E5", name:"Database integrity evidence", domain:"E", priority:"HIGH", controlsServed:["6.3"], mix:"1M", format:"Integrity checks/logs", sufficiency:"DB integrity verification, access controls, change audit trail, backup integrity, no direct modification", reuse:"Control-specific (6.3)" },
  { code:"E6", name:"IDS/IPS configuration", domain:"E", priority:"MEDIUM", controlsServed:["6.5A"], mix:"1A", format:"Config export", sufficiency:"IDS/IPS on SWIFT segments, detection signatures current, SIEM integration, response procedures", reuse:"Advisory control (6.5A)" },
  { code:"E7", name:"Admin activity monitoring logs", domain:"E", priority:"HIGH", controlsServed:["1.2","5.4","6.4"], mix:"3M", format:"Log extracts/SIEM", sufficiency:"Admin login events, privilege escalation, config changes, credential access logged, unusual activity flagged", reuse:"67% reduction — serves privileged account, credential, and logging controls" },
  { code:"F1", name:"Third-party vendor inventory", domain:"F", priority:"CRITICAL", controlsServed:["2.8"], mix:"1M", format:"Spreadsheet", sufficiency:"All third parties with SWIFT access, components managed, access type, contracts, classification", reuse:"Control-specific (2.8)" },
  { code:"F2", name:"Third-party SLA/NDA agreements", domain:"F", priority:"HIGH", controlsServed:["2.8"], mix:"1M", format:"Contract excerpts", sufficiency:"SLA with security standards, NDA, CSCF alignment, incident notification, right to audit", reuse:"Control-specific (2.8)" },
  { code:"F3", name:"Third-party security assessments", domain:"F", priority:"HIGH", controlsServed:["2.8"], mix:"1M", format:"Assessment reports", sufficiency:"Risk assessment per vendor, periodic review, Outsourcing Baseline alignment, certifications, mitigations", reuse:"Control-specific (2.8)" },
  { code:"F4", name:"Third-party ongoing monitoring", domain:"F", priority:"HIGH", controlsServed:["2.8"], mix:"1M", format:"SOC reports/audits", sufficiency:"Current SOC 2 or equivalent, annual security review, certification tracking, incident history", reuse:"Control-specific (2.8)" },
  { code:"G1", name:"Physical access controls", domain:"G", priority:"HIGH", controlsServed:["3.1"], mix:"1M", format:"Access system config", sufficiency:"Access control system, authorized personnel list, visitor management, annual review, revocation process", reuse:"Control-specific (3.1)" },
  { code:"G2", name:"Physical access logs (12mo)", domain:"G", priority:"HIGH", controlsServed:["3.1"], mix:"1M", format:"Access logs", sufficiency:"All SWIFT areas logged, 12-month retention, audit availability, unusual access flagged", reuse:"Control-specific (3.1)" },
  { code:"G3", name:"Video surveillance evidence", domain:"G", priority:"MEDIUM", controlsServed:["3.1"], mix:"1M", format:"Surveillance config", sufficiency:"Camera placement, motion detection, 3+ month retention, legal compliance, footage access controls", reuse:"Control-specific (3.1)" },
  { code:"G4", name:"Equipment disposal evidence", domain:"G", priority:"MEDIUM", controlsServed:["3.1"], mix:"1M", format:"Disposal records", sufficiency:"Disposal/sanitization process, execution evidence, chain of custody, storage media covered", reuse:"Control-specific (3.1)" },
  { code:"H1", name:"Cyber incident response plan", domain:"H", priority:"CRITICAL", controlsServed:["7.1"], mix:"1M", format:"IR plan document", sufficiency:"SWIFT scenarios, detection/containment/eradication/recovery, ISAC notification, roles, contact lists", reuse:"Control-specific (7.1)" },
  { code:"H2", name:"IR exercise records", domain:"H", priority:"HIGH", controlsServed:["7.1"], mix:"1M", format:"Exercise records", sufficiency:"Exercise within 12 months, SWIFT scenario tested, participants, findings, lessons learned, improvements", reuse:"Control-specific (7.1)" },
  { code:"H3", name:"SWIFT ISAC participation", domain:"H", priority:"MEDIUM", controlsServed:["7.1"], mix:"1M", format:"Registration/alerts", sufficiency:"ISAC registration, alert acknowledgments, designated contact, process for acting on alerts", reuse:"Control-specific (7.1)" },
  { code:"H4", name:"Security training program", domain:"H", priority:"HIGH", controlsServed:["7.2"], mix:"1M", format:"Program document", sufficiency:"SWIFT-specific content, all relevant staff, annual minimum, phishing simulations, new-hire requirements", reuse:"Control-specific (7.2)" },
  { code:"H5", name:"Training completion records", domain:"H", priority:"HIGH", controlsServed:["7.2"], mix:"1M", format:"LMS export", sufficiency:"All SWIFT personnel completed, within 12 months, pass/fail results, non-compliance follow-up, phishing results", reuse:"Control-specific (7.2)" },
  { code:"H6", name:"Transaction control procedures", domain:"H", priority:"HIGH", controlsServed:["2.9"], mix:"1M", format:"Process documentation", sufficiency:"Verification procedures, dual authorization, out-of-band confirmation, monitoring rules, reconciliation", reuse:"Control-specific (2.9)" },
  { code:"H7", name:"Transaction monitoring config", domain:"H", priority:"HIGH", controlsServed:["2.9"], mix:"1M", format:"System config/records", sufficiency:"Monitoring rules configured, thresholds, alert samples, daily reconciliation, session number tracking", reuse:"Control-specific (2.9)" },
  { code:"H8", name:"RMA management procedures", domain:"H", priority:"MEDIUM", controlsServed:["2.11A"], mix:"1A", format:"Process doc/records", sufficiency:"RMA procedures, due diligence, annual review, obsolete relationship removal, authorization list", reuse:"Advisory control (2.11A)" },
  { code:"H9", name:"Risk assessment & register", domain:"H", priority:"MEDIUM", controlsServed:["7.4A"], mix:"1A", format:"Risk docs/register", sufficiency:"Methodology, SWIFT-specific scenarios, risk ratings, treatment decisions, residual risk acceptance", reuse:"Advisory control (7.4A)" },
];

const STATS = {
  totalItems: 53, totalControls: 32, mandatoryControls: 25, advisoryControls: 7,
  multiControlItems: 16, controlSpecificItems: 37, avgReuse: 4.2,
  beforeHours: "120–160", afterHours: "65–90", reduction: "~45%",
  domains: 8
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    CRITICAL: { bg: "#DC2626", text: "#fff" },
    HIGH: { bg: "#D97706", text: "#fff" },
    MEDIUM: { bg: "#059669", text: "#fff" },
  };
  const c = colors[priority] || colors.MEDIUM;
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:700, letterSpacing:"0.5px", background:c.bg, color:c.text }}>{priority}</span>
  );
};

const ControlPill = ({ ctrl, isAdvisory }) => (
  <span style={{ display:"inline-block", padding:"1px 6px", margin:"1px 2px", borderRadius:3, fontSize:10, fontWeight:600, border: isAdvisory ? "1px dashed #999" : "1px solid #1B3A5C", background: isAdvisory ? "#f5f5f5" : "#E8F0FE", color: isAdvisory ? "#666" : "#1B3A5C" }}>
    {ctrl}{isAdvisory && " (A)"}
  </span>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderTop:`3px solid ${accent||"#1B3A5C"}`, borderRadius:6, padding:"14px 16px", textAlign:"center", minWidth:120 }}>
    <div style={{ fontSize:28, fontWeight:800, color:accent||"#1B3A5C", fontFamily:"'DM Mono', monospace", lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:11, color:"#666", marginTop:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{sub}</div>}
  </div>
);

const DomainCard = ({ domain, isActive, onClick, itemCount }) => (
  <div onClick={onClick} style={{ cursor:"pointer", background: isActive ? domain.color : "#fff", border:`2px solid ${domain.color}`, borderRadius:8, padding:"12px 14px", transition:"all 0.2s", transform: isActive ? "scale(1.02)" : "scale(1)", boxShadow: isActive ? `0 4px 12px ${domain.color}40` : "0 1px 3px rgba(0,0,0,0.08)" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:28, height:28, borderRadius:6, background: isActive ? "rgba(255,255,255,0.2)" : domain.accent, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color: isActive ? "#fff" : domain.color }}>{domain.id}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color: isActive ? "#fff" : "#1a1a1a", lineHeight:1.2 }}>{domain.name}</div>
        <div style={{ fontSize:10, color: isActive ? "rgba(255,255,255,0.7)" : "#888", marginTop:2 }}>{itemCount} items · {domain.controls.length} controls</div>
      </div>
    </div>
  </div>
);

export default function CanonicalEvidenceModel() {
  const [activeDomain, setActiveDomain] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const [filterPriority, setFilterPriority] = useState("ALL");

  const filteredItems = useMemo(() => {
    let items = EVIDENCE_ITEMS;
    if (activeDomain) items = items.filter(i => i.domain === activeDomain);
    if (filterPriority !== "ALL") items = items.filter(i => i.priority === filterPriority);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.sufficiency.toLowerCase().includes(q) ||
        i.controlsServed.some(c => c.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeDomain, searchQuery, filterPriority]);

  const multiControlItems = EVIDENCE_ITEMS.filter(i => Array.isArray(i.controlsServed) && i.controlsServed.length > 1 && i.controlsServed[0] !== "All 32");
  const foundationalItem = EVIDENCE_ITEMS.find(i => i.code === "A5");

  return (
    <div style={{ fontFamily:"'DM Sans', 'Segoe UI', sans-serif", background:"#F7F8FA", minHeight:"100vh", color:"#1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 50%, #2E5984 100%)", padding:"24px 28px 20px", color:"#fff" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:700, letterSpacing:"1px", fontFamily:"'DM Mono', monospace" }}>SWIFT CSCF v2025</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>YaaraLabs Phase 1</div>
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, margin:"8px 0 4px", letterSpacing:"-0.3px" }}>Canonical Evidence Model</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:0 }}>53 evidence items × 8 domains × 32 controls — system-ready for evidence intake design</p>

        {/* Navigation */}
        <div style={{ display:"flex", gap:4, marginTop:16 }}>
          {[{id:"overview",label:"Overview"},{id:"catalog",label:"Evidence Catalog"},{id:"reuse",label:"Reuse Analysis"},{id:"controls",label:"Control Matrix"}].map(v => (
            <button key={v.id} onClick={() => { setActiveView(v.id); setActiveDomain(null); setExpandedItem(null); }}
              style={{ padding:"7px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight: activeView===v.id ? 700 : 500,
                background: activeView===v.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: activeView===v.id ? "#fff" : "rgba(255,255,255,0.5)", transition:"all 0.15s" }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 28px", maxWidth:1200 }}>

        {/* OVERVIEW VIEW */}
        {activeView === "overview" && (
          <div>
            {/* Stats Row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:12, marginBottom:24 }}>
              <StatCard label="Evidence Items" value="53" sub="across 8 domains" accent="#1B3A5C" />
              <StatCard label="Controls Covered" value="32" sub="25 mandatory + 7 advisory" accent="#0F4C75" />
              <StatCard label="Multi-Control Items" value="16" sub="serve 2+ controls each" accent="#D97706" />
              <StatCard label="Effort Reduction" value="~45%" sub="vs. per-control collection" accent="#059669" />
              <StatCard label="Time Saved" value="55–70h" sub="per assessment cycle" accent="#DC2626" />
            </div>

            {/* Domain Grid */}
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:10, color:"#1B3A5C" }}>8 Evidence Domains</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10, marginBottom:24 }}>
              {DOMAINS.map(d => {
                const itemCount = EVIDENCE_ITEMS.filter(i => i.domain === d.id).length;
                return <DomainCard key={d.id} domain={d} itemCount={itemCount} isActive={activeDomain === d.id}
                  onClick={() => { setActiveDomain(activeDomain === d.id ? null : d.id); setActiveView("catalog"); }} />;
              })}
            </div>

            {/* Key Insight */}
            <div style={{ background:"linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)", border:"1px solid #FFE082", borderRadius:8, padding:"16px 20px", marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#F57F17", marginBottom:6 }}>💡 Core Value Proposition: Collect Once, Map to Many</div>
              <div style={{ fontSize:12, color:"#5D4037", lineHeight:1.6 }}>
                16 multi-control evidence items (like the network diagram serving 6 controls) mean organizations collect evidence once and the platform automatically maps it to all applicable controls. This eliminates the #1 pain point in SWIFT compliance: collecting the same document multiple times for different controls. Combined with 37 control-specific items organized by intuitive domains, the platform reduces total collection requests from 97+ to 53 — a 45% reduction in effort.
              </div>
            </div>

            {/* Before/After */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:"#FFF5F5", border:"1px solid #FFC9C9", borderRadius:8, padding:"16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#C62828", marginBottom:8 }}>❌ Without Platform</div>
                <div style={{ fontSize:11, color:"#5D4037", lineHeight:1.8 }}>
                  97+ evidence collection requests<br/>Network diagram collected 6 separate times<br/>12+ system config screenshot requests<br/>8+ policy document requests<br/>120–160 hours collection time<br/>40–60 hours manual report generation
                </div>
              </div>
              <div style={{ background:"#F1F8E9", border:"1px solid #C5E1A5", borderRadius:8, padding:"16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#2E7D32", marginBottom:8 }}>✓ With Platform</div>
                <div style={{ fontSize:11, color:"#33691E", lineHeight:1.8 }}>
                  53 canonical evidence items<br/>Network diagram uploaded once, serves 6 controls<br/>Per-system configs, auto-mapped to controls<br/>5 policy domains, auto-linked<br/>65–90 hours collection time<br/>AI-drafted report, human-reviewed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE CATALOG VIEW */}
        {activeView === "catalog" && (
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search items, controls, or keywords..."
                style={{ flex:1, minWidth:200, padding:"8px 12px", borderRadius:6, border:"1px solid #ddd", fontSize:12, outline:"none" }} />
              <div style={{ display:"flex", gap:4 }}>
                {["ALL","CRITICAL","HIGH","MEDIUM"].map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    style={{ padding:"5px 10px", borderRadius:4, border: filterPriority===p ? "2px solid #1B3A5C" : "1px solid #ddd", background: filterPriority===p ? "#E8F0FE" : "#fff", cursor:"pointer", fontSize:11, fontWeight: filterPriority===p ? 700 : 400 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain chips */}
            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              <button onClick={() => setActiveDomain(null)}
                style={{ padding:"4px 10px", borderRadius:4, border: !activeDomain ? "2px solid #1B3A5C" : "1px solid #ccc", background: !activeDomain ? "#1B3A5C" : "#fff", color: !activeDomain ? "#fff" : "#666", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                All ({EVIDENCE_ITEMS.length})
              </button>
              {DOMAINS.map(d => {
                const count = EVIDENCE_ITEMS.filter(i => i.domain === d.id).length;
                return (
                  <button key={d.id} onClick={() => setActiveDomain(activeDomain === d.id ? null : d.id)}
                    style={{ padding:"4px 10px", borderRadius:4, border: activeDomain===d.id ? `2px solid ${d.color}` : "1px solid #ccc", background: activeDomain===d.id ? d.accent : "#fff", color: activeDomain===d.id ? d.color : "#666", cursor:"pointer", fontSize:11, fontWeight: activeDomain===d.id ? 700 : 500 }}>
                    {d.id}: {d.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>{filteredItems.length} items shown</div>

            {/* Item Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filteredItems.map(item => {
                const domain = DOMAINS.find(d => d.id === item.domain);
                const isExpanded = expandedItem === item.code;
                const controlCount = item.controlsServed[0] === "All 32" ? 32 : item.controlsServed.length;
                return (
                  <div key={item.code} onClick={() => setExpandedItem(isExpanded ? null : item.code)}
                    style={{ background:"#fff", border: isExpanded ? `2px solid ${domain.color}` : "1px solid #e0e0e0", borderRadius:8, padding:"12px 16px", cursor:"pointer", transition:"all 0.15s", borderLeft:`4px solid ${domain.color}` }}>

                    {/* Header row */}
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontFamily:"'DM Mono', monospace", fontSize:13, fontWeight:700, color:domain.color, minWidth:28 }}>{item.code}</span>
                      <span style={{ fontSize:13, fontWeight:600, flex:1 }}>{item.name}</span>
                      <PriorityBadge priority={item.priority} />
                      <span style={{ fontSize:11, color:"#888", fontFamily:"'DM Mono', monospace" }}>{controlCount} ctrl{controlCount>1?"s":""}</span>
                      <span style={{ fontSize:11, color:domain.color, fontWeight:600 }}>{item.mix}</span>
                      <span style={{ fontSize:16, color:"#ccc", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>▾</span>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #eee" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Format</div>
                            <div style={{ fontSize:12, color:"#333" }}>{item.format}</div>
                          </div>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Controls Served</div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
                              {item.controlsServed[0] === "All 32" ?
                                <span style={{ fontSize:11, fontWeight:700, color:"#DC2626" }}>All 32 controls (scoping)</span> :
                                item.controlsServed.map(c => <ControlPill key={c} ctrl={c} isAdvisory={c.includes("A") && c !== "A1"} />)
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Sufficiency Definition</div>
                          <div style={{ fontSize:12, color:"#333", lineHeight:1.6, background:"#FAFAFA", padding:"8px 12px", borderRadius:4, borderLeft:`3px solid ${domain.color}` }}>{item.sufficiency}</div>
                        </div>
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Cross-Control Reuse & Effort Saving</div>
                          <div style={{ fontSize:12, color: controlCount > 1 ? "#2E7D32" : "#666", fontWeight: controlCount > 1 ? 600 : 400, lineHeight:1.5 }}>{item.reuse}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REUSE ANALYSIS VIEW */}
        {activeView === "reuse" && (
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"#1B3A5C" }}>Evidence Reuse Tiers</h3>
            <p style={{ fontSize:12, color:"#666", marginBottom:16 }}>Items sorted by how many controls they satisfy. Higher reuse = higher platform value.</p>

            {/* Foundational */}
            <div style={{ background:"linear-gradient(135deg, #DC2626 0%, #B71C1C 100%)", borderRadius:8, padding:"16px 20px", marginBottom:16, color:"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <span style={{ fontFamily:"'DM Mono', monospace", fontSize:16, fontWeight:800 }}>A5</span>
                <span style={{ fontSize:14, fontWeight:700 }}>Architecture Type Declaration</span>
                <span style={{ background:"rgba(255,255,255,0.2)", padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:700 }}>FOUNDATIONAL — 32 CONTROLS</span>
              </div>
              <div style={{ fontSize:12, opacity:0.85 }}>Must be collected first. Determines which of all 32 controls are applicable. Auto-generates N/A justifications for non-applicable controls.</div>
            </div>

            {/* Tier groups */}
            {[
              { label: "Ultra-High Reuse (5–6 controls)", items: multiControlItems.filter(i => i.controlsServed.length >= 5), color: "#D97706" },
              { label: "High Reuse (3–4 controls)", items: multiControlItems.filter(i => i.controlsServed.length >= 3 && i.controlsServed.length <= 4), color: "#1565C0" },
              { label: "Moderate Reuse (2 controls)", items: multiControlItems.filter(i => i.controlsServed.length === 2), color: "#059669" },
            ].map(tier => (
              <div key={tier.label} style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:tier.color, marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:tier.color }}></div>
                  {tier.label} — {tier.items.length} items
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {tier.items.map(item => {
                    const domain = DOMAINS.find(d => d.id === item.domain);
                    return (
                      <div key={item.code} style={{ background:"#fff", border:"1px solid #e0e0e0", borderRadius:6, padding:"10px 14px", borderLeft:`4px solid ${tier.color}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12, fontWeight:700, color:domain.color }}>{item.code}</span>
                          <span style={{ fontSize:12, fontWeight:600, flex:1 }}>{item.name}</span>
                          <PriorityBadge priority={item.priority} />
                          <div style={{ display:"flex", gap:2 }}>
                            {item.controlsServed.map(c => <ControlPill key={c} ctrl={c} isAdvisory={c.includes("A") && c !== "A1"} />)}
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:"#2E7D32", marginTop:4, fontWeight:500 }}>{item.reuse}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Control-specific summary */}
            <div style={{ background:"#F5F5F5", borderRadius:8, padding:"14px 18px", marginTop:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", marginBottom:4 }}>Control-Specific Items (1 control each) — 37 items</div>
              <div style={{ fontSize:11, color:"#888", lineHeight:1.6 }}>
                These 37 items each serve a single control and are organized by domain for efficient collection. While they don't provide cross-control reuse, domain grouping still reduces cognitive load and enables batch collection by team (e.g., the Access Management team collects C3–C9 together).
              </div>
            </div>
          </div>
        )}

        {/* CONTROL MATRIX VIEW */}
        {activeView === "controls" && (
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4, color:"#1B3A5C" }}>Control → Evidence Matrix</h3>
            <p style={{ fontSize:12, color:"#666", marginBottom:16 }}>All 32 controls with their mapped evidence items. Click any control to see details.</p>

            {[
              { obj: "Secure Your Environment", principles: ["1: Restrict Internet Access", "2: Reduce Attack Surface", "3: Physical Security"], color: "#0F4C75" },
              { obj: "Know and Limit Access", principles: ["4: Credential Protection", "5: Privilege Management"], color: "#E65100" },
              { obj: "Detect and Respond", principles: ["6: Anomaly Detection", "7: Incident Response"], color: "#4A148C" },
            ].map(objective => (
              <div key={objective.obj} style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:objective.color, padding:"8px 12px", background:`${objective.color}10`, borderRadius:6, marginBottom:8 }}>
                  {objective.obj}
                </div>
                {EVIDENCE_ITEMS.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {[
                      {id:"1.1",name:"SWIFT Environment Protection",t:"M",items:["A1","A2","A4","A5","A6","E7"]},
                      {id:"1.2",name:"OS Privileged Account Control",t:"M",items:["B1","C1","C2","E7"]},
                      {id:"1.3",name:"Virtualisation/Cloud Protection",t:"A",items:["A2","B4","C1"]},
                      {id:"1.4",name:"Restriction of Internet Access",t:"M",items:["A1","A4","A5"]},
                      {id:"1.5",name:"Customer Environment Protection",t:"M",items:["A1","A2","A4","A5","A6"]},
                      {id:"2.1",name:"Internal Data Flow Security",t:"M",items:["A1","A3","B3"]},
                      {id:"2.2",name:"Security Updates",t:"M",items:["D1","D2","D3"]},
                      {id:"2.3",name:"System Hardening",t:"M",items:["B1","B6"]},
                      {id:"2.4A",name:"Back Office Data Flow Security",t:"A",items:["A1","A2","A3","B3"]},
                      {id:"2.5A",name:"External Transmission Data Protection",t:"A",items:["A1","A3","B3"]},
                      {id:"2.6",name:"Operator Session Confidentiality",t:"M",items:["B2","B3","B8","C1"]},
                      {id:"2.7",name:"Vulnerability Scanning",t:"M",items:["D4","D5"]},
                      {id:"2.8",name:"Outsourced Critical Activity Protection",t:"M",items:["A2","F1","F2","F3","F4"]},
                      {id:"2.9",name:"Transaction Business Controls",t:"M",items:["H6","H7"]},
                      {id:"2.10",name:"Application Hardening",t:"M",items:["B2","B6","E4"]},
                      {id:"2.11A",name:"RMA Business Controls",t:"A",items:["H8"]},
                      {id:"3.1",name:"Physical Security",t:"M",items:["G1","G2","G3","G4"]},
                      {id:"4.1",name:"Password Policy",t:"M",items:["B5"]},
                      {id:"4.2",name:"Multi-Factor Authentication",t:"M",items:["B7","C1"]},
                      {id:"5.1",name:"Logical Access Control",t:"M",items:["C1","C2","C3","C4","C5","C6"]},
                      {id:"5.2",name:"Token Management",t:"M",items:["C7"]},
                      {id:"5.3A",name:"Personnel Vetting Process",t:"A",items:["C9"]},
                      {id:"5.4",name:"Password Repository Protection",t:"M",items:["C8","E7"]},
                      {id:"6.1",name:"Malware Protection",t:"M",items:["E1"]},
                      {id:"6.2",name:"Software Integrity",t:"M",items:["B6","E4"]},
                      {id:"6.3",name:"Database Integrity",t:"M",items:["E5"]},
                      {id:"6.4",name:"Logging and Monitoring",t:"M",items:["E2","E3","E7"]},
                      {id:"6.5A",name:"Intrusion Detection",t:"A",items:["E3","E6"]},
                      {id:"7.1",name:"Cyber Incident Response Planning",t:"M",items:["H1","H2","H3"]},
                      {id:"7.2",name:"Security Training & Awareness",t:"M",items:["H4","H5"]},
                      {id:"7.3A",name:"Penetration Testing",t:"A",items:["D5","D6"]},
                      {id:"7.4A",name:"Scenario Risk Assessment",t:"A",items:["H9"]},
                    ].filter(c => objective.principles.some(p => {
                      const pNum = p.split(":")[0].trim();
                      return c.id.startsWith(pNum + ".") || (pNum === "2" && c.id.startsWith("2.")) || (pNum === "6" && c.id.startsWith("6.")) || (pNum === "7" && c.id.startsWith("7."));
                    })).map(ctrl => (
                      <div key={ctrl.id} style={{ background: ctrl.t === "A" ? "#FAFAFA" : "#fff", border:"1px solid #e0e0e0", borderRadius:6, padding:"8px 14px", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12, fontWeight:700, color: ctrl.t === "M" ? "#C62828" : "#888", minWidth:36 }}>{ctrl.id}</span>
                        <span style={{ fontSize:11, fontWeight: ctrl.t === "M" ? 600 : 400, color: ctrl.t === "M" ? "#1a1a1a" : "#666", flex:1, minWidth:200 }}>
                          {ctrl.name}
                          {ctrl.t === "A" && <span style={{ fontSize:9, color:"#999", marginLeft:4 }}>(Advisory)</span>}
                        </span>
                        <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"flex-end" }}>
                          {ctrl.items.map(code => {
                            const domain = DOMAINS.find(d => d.id === code[0]);
                            return (
                              <span key={code} style={{ display:"inline-block", padding:"1px 6px", borderRadius:3, fontSize:10, fontWeight:600, background: domain?.accent || "#eee", color: domain?.color || "#333", border:`1px solid ${domain?.color || "#ccc"}30` }}>
                                {code}
                              </span>
                            );
                          })}
                        </div>
                        <span style={{ fontSize:10, color:"#888", fontFamily:"'DM Mono', monospace", minWidth:20, textAlign:"right" }}>{ctrl.items.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"16px 28px", borderTop:"1px solid #e0e0e0", background:"#fff", fontSize:10, color:"#999", display:"flex", justifyContent:"space-between" }}>
        <span>YaaraLabs · SWIFT CSCF v2025 Canonical Evidence Model · Phase 1</span>
        <span>53 items · 8 domains · 32 controls · ~45% effort reduction</span>
      </div>
    </div>
  );
}
