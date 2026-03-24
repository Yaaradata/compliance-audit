import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   CONSTANTS — roles.js
═══════════════════════════════════════════════════════ */
const ROLES = {
  COMPLIANCE_OFFICER: "Compliance Officer",
  EVIDENCE_UPLOADER:  "Evidence Uploader",
  REVIEWER:           "Reviewer",
  APPROVER:           "Approver",
};

const ROLE_META = {
  "Compliance Officer": { color:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE", icon:"🏛",  short:"CO" },
  "Evidence Uploader":  { color:"#6D28D9", bg:"#EDE9FE", border:"#C4B5FD", icon:"📂",  short:"EU" },
  "Reviewer":           { color:"#0369A1", bg:"#E0F2FE", border:"#BAE6FD", icon:"🔍",  short:"RV" },
  "Approver":           { color:"#065F46", bg:"#D1FAE5", border:"#A7F3D0", icon:"✍",   short:"AP" },
};

const FRAMEWORK_META = {
  SWIFT: { accent:"#1D4ED8", bg:"#EFF6FF", border:"#BFDBFE" },
  SOC2:  { accent:"#B45309", bg:"#FFFBEB", border:"#FDE68A" },
  ISO:   { accent:"#166534", bg:"#F0FDF4", border:"#BBF7D0" },
  PCI:   { accent:"#7E22CE", bg:"#FAF5FF", border:"#DDD6FE" },
};

const STATUS_META = {
  "on-track":        { label:"On track",        dot:"#10B981", text:"#065F46", bg:"#ECFDF5", border:"#A7F3D0" },
  "needs-attention": { label:"Needs attention",  dot:"#F59E0B", text:"#92400E", bg:"#FFFBEB", border:"#FDE68A" },
  "urgent":          { label:"Urgent",           dot:"#EF4444", text:"#991B1B", bg:"#FEF2F2", border:"#FECACA" },
  "completed":       { label:"Completed",        dot:"#6B7280", text:"#374151", bg:"#F9FAFB", border:"#E5E7EB" },
};

const PRIORITY_META = {
  high: { label:"High", color:"#DC2626", bg:"#FEF2F2" },
  med:  { label:"Med",  color:"#D97706", bg:"#FFFBEB" },
  low:  { label:"Low",  color:"#6B7280", bg:"#F9FAFB" },
};

const PHASES = ["Setup", "Collection", "Review", "Approval"];

/* ═══════════════════════════════════════════════════════
   MOCK DATA — mockData.js
═══════════════════════════════════════════════════════ */
const MOCK_USER = {
  id:"usr_riya_001", name:"Riya Sharma", initials:"RS",
  title:"Senior Compliance Analyst", email:"riya.sharma@acmecorp.com", org:"AcmeCorp",
  cycleRoles: {
    "CYC-2026-72A489": ROLES.EVIDENCE_UPLOADER,
    "CYC-2026-853C2E": ROLES.REVIEWER,
    "CYC-2025-F3A921": ROLES.APPROVER,
  },
};

const MOCK_CYCLES = [
  {
    id:"CYC-2026-72A489", name:"SWIFT CSCF 2026", framework:"SWIFT CSCF", frameworkTag:"SWIFT",
    icon:"🏦", year:2026, phase:"Collection", phaseIndex:1,
    deadline:"Mar 31, 2026", daysLeft:8, createdDate:"Mar 1, 2026", lastActivity:"2 hours ago",
    status:"needs-attention", overallProgress:45,
    controls:{ total:48, compliant:21, inReview:8, pending:15, overdue:4 },
    evidence:{ total:89, uploaded:54, aiPassed:42, pendingReview:12 },
    myTasks:{ total:13, completed:8, pending:5 },
    teamMembers:[
      { initials:"AM", color:"#3B82F6", name:"Arjun M.",  role:"Reviewer"          },
      { initials:"PD", color:"#10B981", name:"Priya D.",  role:"Approver"          },
      { initials:"KJ", color:"#8B5CF6", name:"Karan J.",  role:"Evidence Uploader" },
    ],
    tasks:[
      { id:1, title:"Upload evidence for control 2.1 — Internal Data Flow Security",     type:"upload",   priority:"high", due:"Today"  },
      { id:2, title:"Re-upload firewall_policy.pdf — AI score below threshold (34/100)", type:"reupload", priority:"high", due:"Today"  },
      { id:3, title:"Submit screenshots for control 6.1 — Anomaly Detection",            type:"upload",   priority:"med",  due:"Mar 26" },
      { id:4, title:"Provide supporting doc for control 5.2 — Logical Access",           type:"upload",   priority:"med",  due:"Mar 27" },
      { id:5, title:"Clarify metadata on patch_log_feb.xlsx with reviewer",              type:"comment",  priority:"low",  due:"Mar 29" },
    ],
  },
  {
    id:"CYC-2026-853C2E", name:"SOC 2 Type II 2026", framework:"SOC 2 Type II", frameworkTag:"SOC2",
    icon:"🔐", year:2026, phase:"Review", phaseIndex:2,
    deadline:"Apr 15, 2026", daysLeft:23, createdDate:"Mar 10, 2026", lastActivity:"Yesterday",
    status:"on-track", overallProgress:68,
    controls:{ total:61, compliant:38, inReview:14, pending:6, overdue:3 },
    evidence:{ total:203, uploaded:187, aiPassed:171, pendingReview:16 },
    myTasks:{ total:17, completed:14, pending:3 },
    teamMembers:[
      { initials:"NK", color:"#F59E0B", name:"Nikhil K.", role:"Evidence Uploader" },
      { initials:"PD", color:"#10B981", name:"Priya D.",  role:"Approver"          },
    ],
    tasks:[
      { id:6, title:"Review access_control_policy.pdf — uploaded by N. Kumar",  type:"review",  priority:"high", due:"Mar 24" },
      { id:7, title:"Review encryption_certificate_2026.pdf — AI score 88",     type:"review",  priority:"med",  due:"Mar 25" },
      { id:8, title:"Add clarification comment on incident_log.xlsx",            type:"comment", priority:"low",  due:"Mar 28" },
    ],
  },
  {
    id:"CYC-2025-F3A921", name:"ISO 27001 : 2025", framework:"ISO 27001", frameworkTag:"ISO",
    icon:"🛡️", year:2025, phase:"Approval", phaseIndex:3,
    deadline:"Mar 25, 2026", daysLeft:2, createdDate:"Jan 15, 2026", lastActivity:"3 hours ago",
    status:"urgent", overallProgress:94,
    controls:{ total:114, compliant:107, inReview:4, pending:2, overdue:1 },
    evidence:{ total:412, uploaded:412, aiPassed:401, pendingReview:0 },
    myTasks:{ total:24, completed:22, pending:2 },
    teamMembers:[
      { initials:"SP", color:"#6366F1", name:"Sanjay P.", role:"Evidence Uploader" },
      { initials:"AM", color:"#3B82F6", name:"Arjun M.",  role:"Reviewer"          },
    ],
    tasks:[
      { id:9,  title:"Final sign-off — all 114 controls reviewed, cycle ready for submission", type:"approve", priority:"high", due:"Today"  },
      { id:10, title:"Accept formal risk acceptance for control A.12.6",                       type:"risk",    priority:"high", due:"Mar 25" },
    ],
  },
];

const MOCK_ACTIVITY = [
  { icon:"✓", color:"#10B981", bg:"#ECFDF5", text:"Your submission for control 1.1 was approved by A. Mehta",       cycle:"SWIFT CSCF", cycleTag:"SWIFT", time:"1h ago"    },
  { icon:"↩", color:"#F59E0B", bg:"#FFFBEB", text:"firewall_policy.pdf rejected — AI confidence score too low (34)", cycle:"SWIFT CSCF", cycleTag:"SWIFT", time:"3h ago"    },
  { icon:"▶", color:"#6366F1", bg:"#EEF2FF", text:"ISO 27001 cycle moved to Approval — sign-off required",           cycle:"ISO 27001",  cycleTag:"ISO",   time:"Yesterday" },
  { icon:"↑", color:"#3B82F6", bg:"#EFF6FF", text:"14 controls marked compliant in SOC 2 Review phase",              cycle:"SOC 2",      cycleTag:"SOC2",  time:"2 days ago"},
  { icon:"⚑", color:"#EF4444", bg:"#FEF2F2", text:"4 controls overdue in SWIFT CSCF — deadline was Mar 20",          cycle:"SWIFT CSCF", cycleTag:"SWIFT", time:"3 days ago"},
];

/* ═══════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --font:'Plus Jakarta Sans',sans-serif;--mono:'JetBrains Mono',monospace;
  --bg:#EFF1F7;--surface:#fff;--surface2:#F7F8FB;
  --border:rgba(0,0,0,0.07);--border2:rgba(0,0,0,0.12);
  --text:#0D1117;--sub:#5B6278;--hint:#9BA5B7;
  --accent:#4F46E5;--sb:#090E1A;
  --r:14px;--rs:8px;--rm:10px;
}
html,body{height:100%;overflow:hidden}
.app{display:flex;height:100vh;background:var(--bg);font-family:var(--font);color:var(--text);font-size:13px;overflow:hidden}

/* SIDEBAR */
.sb{width:58px;background:var(--sb);display:flex;flex-direction:column;align-items:center;padding:16px 0 20px;gap:3px;flex-shrink:0}
.sb-logo{width:34px;height:34px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;margin-bottom:18px;flex-shrink:0}
.sb-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#3D4F6E;cursor:pointer;font-size:15px;transition:all 0.15s;flex-shrink:0}
.sb-icon:hover{background:#141D2E;color:#8B9CC4}
.sb-icon.on{background:#1A1F35;color:#818CF8}
.sb-sep{width:22px;height:1px;background:#141D2E;margin:8px 0;flex-shrink:0}
.sb-foot{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:10px}
.sb-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px;cursor:pointer}

/* TOPBAR */
.topbar{background:var(--surface);border-bottom:1px solid var(--border);height:52px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:12px}
.tb-l{display:flex;align-items:center;gap:6px;min-width:0}
.tb-title{font-size:14px;font-weight:800;color:var(--text)}
.tb-sep,.tb-crumb{font-size:12px;color:var(--hint)}
.tb-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
.tb-btn{height:30px;padding:0 12px;border-radius:var(--rs);border:1px solid var(--border2);background:var(--surface);display:flex;align-items:center;gap:5px;cursor:pointer;font-size:11px;font-weight:600;color:var(--sub);font-family:var(--font);transition:all 0.15s;white-space:nowrap}
.tb-btn:hover{background:var(--surface2);color:var(--text)}
.tb-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.tb-btn.primary:hover{background:#4338CA}
.tb-div{width:1px;height:18px;background:var(--border2);flex-shrink:0}
.tb-notif{width:30px;height:30px;border-radius:var(--rs);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;position:relative;color:var(--sub)}
.notif-pip{position:absolute;top:6px;right:6px;width:6px;height:6px;background:#EF4444;border-radius:50%;border:1.5px solid var(--surface)}
.tb-user{display:flex;align-items:center;gap:8px;cursor:pointer;flex-shrink:0}
.tb-uav{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px}
.tb-uname{font-size:12px;font-weight:700;color:var(--text)}
.tb-urole{font-size:10px;color:var(--hint)}

/* MAIN */
.main-shell{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.scroll-content{flex:1;overflow-y:auto;padding:22px 24px}
.scroll-content::-webkit-scrollbar{width:4px}
.scroll-content::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px}

/* HERO */
.hero{background:var(--sb);border-radius:16px;padding:20px 24px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden}
.hero-glow{position:absolute;right:-20px;top:-30px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%);pointer-events:none}
.hero-glow2{position:absolute;left:40%;bottom:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%);pointer-events:none}
.hero-date{font-size:10px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
.hero-name{font-size:20px;font-weight:800;color:#F1F5F9;margin-bottom:3px;letter-spacing:-0.3px}
.hero-sub{font-size:12px;color:#64748B}
.hero-kpis{display:flex;gap:10px;position:relative;z-index:1}
.hk{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;text-align:center;min-width:72px}
.hk-v{font-size:22px;font-weight:800;color:#F1F5F9;font-family:var(--mono);line-height:1}
.hk-l{font-size:9px;color:#64748B;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px}

/* STATS ROW */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.sc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:13px 15px;display:flex;align-items:center;gap:11px;transition:box-shadow 0.15s}
.sc:hover{box-shadow:0 2px 10px rgba(0,0,0,0.06)}
.sc-icon{width:36px;height:36px;border-radius:var(--rm);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sc-lbl{font-size:10px;font-weight:600;color:var(--hint);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px}
.sc-val{font-size:20px;font-weight:800;color:var(--text);font-family:var(--mono);line-height:1}
.sc-sub{font-size:10px;color:var(--hint);margin-top:2px}

/* BODY GRID */
.dash-body{display:grid;grid-template-columns:1fr 292px;gap:14px;align-items:start}
.right-panel{display:flex;flex-direction:column;gap:12px}

/* SEC HEADER */
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.sec-title{font-size:11px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.6px}
.sec-link{font-size:11px;font-weight:600;color:var(--accent);cursor:pointer}
.sec-link:hover{text-decoration:underline}

/* FILTER PILLS */
.filter-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.filter-lbl{font-size:10px;color:var(--hint)}
.fp{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.12s;border:1px solid var(--border);background:var(--surface);color:var(--sub);white-space:nowrap}
.fp:hover{border-color:var(--border2);color:var(--text)}
.fp.on{background:var(--accent);color:#fff;border-color:var(--accent)}

/* CYCLE CARD */
.cc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden;transition:box-shadow 0.18s,border-color 0.18s}
.cc:hover{box-shadow:0 4px 20px rgba(0,0,0,0.07);border-color:var(--border2)}

/* CC TOP */
.cc-top{padding:15px 17px 13px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:13px}
.cc-fw-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid}
.cc-head{flex:1;min-width:0}
.cc-title-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:2px}
.cc-name{font-size:14px;font-weight:800;color:var(--text);letter-spacing:-0.2px}
.fw-tag{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;font-family:var(--mono);letter-spacing:0.4px;border:1px solid;flex-shrink:0}
.cc-id{font-size:10px;color:var(--hint);font-family:var(--mono)}
.cc-badges{display:flex;align-items:center;gap:7px;margin-top:6px;flex-wrap:wrap}
.st-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;border:1px solid;flex-shrink:0}
.st-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.role-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 9px;border-radius:6px;border:1px solid;flex-shrink:0}
.cc-sub-meta{font-size:10px;color:var(--hint);display:flex;align-items:center;gap:5px}
.meta-dot{width:2px;height:2px;border-radius:50%;background:var(--hint)}

.cc-tr{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.dl-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;font-family:var(--mono);white-space:nowrap}
.team-row{display:flex;align-items:center}
.team-av{width:23px;height:23px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;border:2px solid var(--surface);margin-left:-6px;flex-shrink:0}
.team-av:first-child{margin-left:0}
.team-more{width:23px;height:23px;border-radius:50%;background:var(--surface2);border:1.5px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--hint);margin-left:-6px}

/* CC MID */
.cc-mid{padding:12px 17px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:16px}
.cc-mid-lbl{font-size:10px;font-weight:700;color:var(--hint);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:7px}
.ctrl-bar{height:8px;border-radius:5px;overflow:hidden;display:flex;gap:1.5px}
.ctrl-seg{height:100%;border-radius:3px}
.ctrl-leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:7px}
.ctrl-leg-item{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--sub)}
.cl-dot{width:7px;height:7px;border-radius:2px;flex-shrink:0}
.ctrl-total{font-size:10px;color:var(--hint);margin-top:4px}
.ev-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.ev-cell{background:var(--surface2);border-radius:var(--rs);padding:8px 10px;border:1px solid var(--border)}
.ev-v{font-size:17px;font-weight:800;color:var(--text);font-family:var(--mono);line-height:1}
.ev-l{font-size:9px;color:var(--hint);margin-top:2px;text-transform:uppercase;letter-spacing:0.3px}

/* CC BOT */
.cc-bot{padding:11px 17px;display:flex;align-items:center;gap:12px}
.vd{width:1px;height:28px;background:var(--border);flex-shrink:0}
.phase-strip{flex:1;min-width:0}
.ps-nodes{display:flex;align-items:flex-end;gap:0}
.ps-node{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0}
.ps-dot-wrap{position:relative;width:100%;height:0}
.ps-dot{width:9px;height:9px;border-radius:50%;border:2px solid var(--border2);background:var(--surface2);position:absolute;left:50%;top:-6.5px;transform:translateX(-50%)}
.ps-dot.done{background:var(--accent);border-color:var(--accent)}
.ps-dot.active{background:#fff;border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,70,229,0.2)}
.ps-bar{width:100%;height:4px;border-radius:2px}
.ps-lbl{font-size:9px;font-weight:600;color:var(--hint);text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap}
.ps-lbl.done{color:var(--accent)}
.ps-lbl.active{color:var(--accent);font-weight:800}
.prog-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.prog-track{width:70px;height:5px;background:#EEF0F6;border-radius:3px;overflow:hidden}
.prog-fill{height:100%;border-radius:3px}
.prog-pct{font-size:11px;font-weight:700;font-family:var(--mono);min-width:26px}
.my-tasks{text-align:center;flex-shrink:0}
.mt-num{font-size:21px;font-weight:800;font-family:var(--mono);line-height:1}
.mt-lbl{font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.3px;margin-top:2px}
.mt-sub{font-size:9px;color:var(--hint);margin-top:1px}
.enter-btn{background:var(--text);color:#fff;border:none;padding:8px 14px;border-radius:var(--rs);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap;display:flex;align-items:center;gap:5px;transition:all 0.15s;flex-shrink:0}
.enter-btn:hover{background:#1E293B;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.18)}

/* RIGHT PANELS */
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.ph{padding:11px 15px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.ph-title{font-size:11px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.5px}
.ph-link{font-size:11px;font-weight:600;color:var(--accent);cursor:pointer}
.ph-link:hover{text-decoration:underline}

/* DEADLINE */
.dl-item{padding:10px 15px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.dl-body{flex:1;min-width:0}
.dl-name{font-size:12px;font-weight:700;color:var(--text);margin-bottom:1px}
.dl-sub{font-size:10px;color:var(--hint)}
.dl-bar{height:3px;background:#EEF0F6;border-radius:2px;overflow:hidden;margin-top:5px}
.dl-fill{height:100%;border-radius:2px}
.dl-counter{text-align:center;flex-shrink:0}
.dl-num{font-size:16px;font-weight:800;font-family:var(--mono);line-height:1}
.dl-day-lbl{font-size:9px;color:var(--hint);margin-top:1px}

/* TASK ITEMS — shared base */
.ti{padding:9px 15px;border-top:1px solid var(--border);cursor:pointer;transition:background 0.1s}
.ti:hover{background:var(--surface2)}
.ti-row{display:flex;align-items:flex-start;gap:8px}
.ti-cb{width:15px;height:15px;border-radius:4px;border:1.5px solid #D1D5DB;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all 0.12s;cursor:pointer;font-size:8px}
.ti-cb.eu-done{background:#6D28D9;border-color:#6D28D9;color:#fff}
.ti-cb.rv-done{background:#0369A1;border-color:#0369A1;color:#fff}
.ti-cb.ap-done{background:#065F46;border-color:#065F46;color:#fff}
.ti-body{flex:1;min-width:0}
.ti-title{font-size:12px;color:var(--text);line-height:1.4}
.ti-title.done{text-decoration:line-through;color:var(--hint)}
.ti-meta{display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap}
.ti-cycle{font-size:9px;color:var(--hint);font-family:var(--mono)}
.ti-chip{font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px}
.ti-pri{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px}
.ti-due{font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px;white-space:nowrap}

/* Reviewer quick actions */
.rv-actions{display:flex;gap:5px;margin-top:7px;padding-left:23px}
.rv-qbtn{flex:1;border:none;border-radius:5px;font-size:10px;font-weight:700;padding:5px;cursor:pointer;font-family:var(--font);transition:opacity 0.12s}
.rv-qbtn:hover{opacity:0.8}
.rv-approve{background:#DCFCE7;color:#15803D}
.rv-reject{background:#FEE2E2;color:#DC2626}
.rv-comment{background:#F3F4F6;color:#374151}

/* Approver sign-off */
.ap-actions{display:flex;gap:5px;margin-top:7px;padding-left:23px}
.ap-sign-btn{flex:1;border:none;border-radius:5px;font-size:10px;font-weight:700;padding:6px;cursor:pointer;font-family:var(--font);background:#065F46;color:#fff;transition:opacity 0.12s}
.ap-sign-btn:hover{opacity:0.85}
.ap-flag-btn{border:none;border-radius:5px;font-size:10px;font-weight:700;padding:6px 10px;cursor:pointer;font-family:var(--font);background:#FEF3C7;color:#B45309;transition:opacity 0.12s}
.ap-flag-btn:hover{opacity:0.85}
.ap-signed{padding:5px 0 0 23px;font-size:11px;font-weight:700;color:#065F46}

/* ACTIVITY */
.ai-item{padding:9px 15px;border-top:1px solid var(--border);display:flex;align-items:flex-start;gap:8px}
.ai-icon{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px}
.ai-body{flex:1;min-width:0}
.ai-text{font-size:11px;color:var(--text);line-height:1.4}
.ai-bottom{display:flex;align-items:center;gap:5px;margin-top:3px}
.ai-tag{font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;font-family:var(--mono)}
.ai-time{font-size:10px;color:var(--hint)}

.cycles-empty{padding:24px;text-align:center;color:var(--hint);font-size:12px}
`;

/* ═══════════════════════════════════════════════════════
   PHASE STRIP — PhaseStrip.jsx
═══════════════════════════════════════════════════════ */
function PhaseStrip({ phaseIndex }) {
  return (
    <div className="phase-strip">
      <div className="ps-nodes">
        {PHASES.map((p, i) => {
          const done = i < phaseIndex, active = i === phaseIndex;
          return (
            <div className="ps-node" key={p}>
              <div className="ps-dot-wrap">
                <div className={`ps-dot ${done?"done":active?"active":""}`} />
              </div>
              <div className="ps-bar" style={{
                background: done ? "var(--accent)"
                  : active ? "linear-gradient(90deg,var(--accent) 55%,#EEF0F6 55%)"
                  : "#EEF0F6"
              }} />
              <div className={`ps-lbl ${done?"done":active?"active":""}`}>{p}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTROLS BAR — ControlsBar.jsx
═══════════════════════════════════════════════════════ */
const CTRL_SEGS = [
  { key:"compliant", color:"#10B981", label:"Compliant" },
  { key:"inReview",  color:"#6366F1", label:"In review" },
  { key:"pending",   color:"#D1D5DB", label:"Pending"   },
  { key:"overdue",   color:"#EF4444", label:"Overdue"   },
];
function ControlsBar({ controls }) {
  const total = controls.total || 1;
  return (
    <>
      <div className="ctrl-bar">
        {CTRL_SEGS.map(s => (
          <div key={s.key} className="ctrl-seg"
            style={{ width:`${((controls[s.key]||0)/total)*100}%`, background:s.color }} />
        ))}
      </div>
      <div className="ctrl-leg">
        {CTRL_SEGS.map(s => (
          <div className="ctrl-leg-item" key={s.key}>
            <div className="cl-dot" style={{ background:s.color }} />
            {controls[s.key]||0} {s.label}
          </div>
        ))}
      </div>
      <div className="ctrl-total">{total} total controls</div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TASK ITEMS — EvidenceUploaderTaskItem / ReviewerTaskItem / ApproverTaskItem
═══════════════════════════════════════════════════════ */
const EU_CHIP = {
  upload:   { label:"⬆ Upload",    bg:"#EDE9FE", color:"#6D28D9" },
  reupload: { label:"🔁 Re-upload", bg:"#FEF2F2", color:"#DC2626" },
  comment:  { label:"💬 Comment",   bg:"#EDE9FE", color:"#6D28D9" },
};

function EvidenceUploaderTaskItem({ task, cycleName, checked, onToggle }) {
  const pm = PRIORITY_META[task.priority];
  const chip = EU_CHIP[task.type] || EU_CHIP.upload;
  const isToday = task.due === "Today";
  return (
    <div className="ti" onClick={onToggle}>
      <div className="ti-row">
        <div className={`ti-cb ${checked?"eu-done":""}`} onClick={onToggle}>{checked&&"✓"}</div>
        <div className="ti-body">
          <div className={`ti-title ${checked?"done":""}`}>{task.title}</div>
          <div className="ti-meta">
            <span className="ti-cycle">{cycleName}</span>
            <span className="ti-chip" style={{ background:chip.bg, color:chip.color }}>{chip.label}</span>
            <span className="ti-pri" style={{ background:pm.bg, color:pm.color }}>{pm.label}</span>
          </div>
        </div>
        <div className="ti-due" style={{ color:isToday?"#EF4444":"#D97706" }}>
          {isToday?"Today":task.due}
        </div>
      </div>
    </div>
  );
}

function ReviewerTaskItem({ task, cycleName, checked, onToggle }) {
  const pm = PRIORITY_META[task.priority];
  const isToday = task.due === "Today";
  const isSoon = ["Mar 24","Mar 25"].includes(task.due);
  return (
    <div className="ti" onClick={onToggle}>
      <div className="ti-row">
        <div className={`ti-cb ${checked?"rv-done":""}`} onClick={onToggle}>{checked&&"✓"}</div>
        <div className="ti-body">
          <div className={`ti-title ${checked?"done":""}`}>{task.title}</div>
          <div className="ti-meta">
            <span className="ti-cycle">{cycleName}</span>
            <span className="ti-chip" style={{ background:"#E0F2FE", color:"#0369A1" }}>🔍 Review</span>
            <span className="ti-pri" style={{ background:pm.bg, color:pm.color }}>{pm.label}</span>
          </div>
        </div>
        <div className="ti-due" style={{ color:isToday?"#EF4444":isSoon?"#D97706":"var(--hint)" }}>
          {isToday?"Today":task.due}
        </div>
      </div>
      {!checked && (
        <div className="rv-actions">
          <button className="rv-qbtn rv-approve" onClick={e=>{e.stopPropagation();onToggle(e);}}>✓ Approve</button>
          <button className="rv-qbtn rv-reject"  onClick={e=>e.stopPropagation()}>✕ Reject</button>
          <button className="rv-qbtn rv-comment" onClick={e=>e.stopPropagation()}>💬 Comment</button>
        </div>
      )}
    </div>
  );
}

function ApproverTaskItem({ task, cycleName, checked, onToggle }) {
  const pm = PRIORITY_META[task.priority];
  const isToday = task.due === "Today";
  const isRisk = task.type === "risk";
  return (
    <div className="ti" onClick={onToggle}>
      <div className="ti-row">
        <div className={`ti-cb ${checked?"ap-done":""}`} onClick={onToggle}>{checked&&"✓"}</div>
        <div className="ti-body">
          <div className={`ti-title ${checked?"done":""}`}>{task.title}</div>
          <div className="ti-meta">
            <span className="ti-cycle">{cycleName}</span>
            <span className="ti-chip" style={{ background:isRisk?"#FEF3C7":"#D1FAE5", color:isRisk?"#B45309":"#065F46" }}>
              {isRisk?"🚩 Risk flag":"✍ Sign off"}
            </span>
            <span className="ti-pri" style={{ background:pm.bg, color:pm.color }}>{pm.label}</span>
          </div>
        </div>
        <div className="ti-due" style={{ color:isToday?"#EF4444":"var(--hint)" }}>
          {isToday?"Today":task.due}
        </div>
      </div>
      {checked ? (
        <div className="ap-signed">✅ Signed off</div>
      ) : (
        <div className="ap-actions">
          <button className="ap-sign-btn" onClick={e=>{e.stopPropagation();onToggle(e);}}>✍ Sign & Approve</button>
          <button className="ap-flag-btn" onClick={e=>e.stopPropagation()}>🚩 Flag</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TASK ITEM RESOLVER — TaskItemResolver.jsx
═══════════════════════════════════════════════════════ */
const ROLE_TASK_MAP = {
  [ROLES.EVIDENCE_UPLOADER]: EvidenceUploaderTaskItem,
  [ROLES.REVIEWER]:          ReviewerTaskItem,
  [ROLES.APPROVER]:          ApproverTaskItem,
};
function TaskItemResolver({ task, cycleName, userRole, checked, onToggle }) {
  const Component = ROLE_TASK_MAP[userRole] || EvidenceUploaderTaskItem;
  return <Component task={task} cycleName={cycleName} checked={checked} onToggle={onToggle} />;
}

/* ═══════════════════════════════════════════════════════
   CYCLE CARD — CycleCard.jsx
═══════════════════════════════════════════════════════ */
function CycleCard({ cycle, userRole, onEnter }) {
  const st = STATUS_META[cycle.status] || STATUS_META["on-track"];
  const fw = FRAMEWORK_META[cycle.frameworkTag] || FRAMEWORK_META.SWIFT;
  const rm = ROLE_META[userRole] || ROLE_META["Reviewer"];
  const isUrgent = cycle.daysLeft <= 3;
  const daysColor = isUrgent?"#EF4444":cycle.daysLeft<=10?"#D97706":"#059669";
  const daysBg    = isUrgent?"#FEF2F2":cycle.daysLeft<=10?"#FFFBEB":"#ECFDF5";
  const progColor = cycle.overallProgress>=80?"#10B981":cycle.overallProgress>=50?"#4F46E5":"#F59E0B";
  const taskColor = cycle.myTasks.pending===0?"#10B981":cycle.myTasks.pending>=4?"#EF4444":"#F59E0B";
  const evCells   = [
    { v:cycle.evidence.total,         l:"Total"     },
    { v:cycle.evidence.uploaded,      l:"Uploaded"  },
    { v:cycle.evidence.aiPassed,      l:"AI passed" },
    { v:cycle.evidence.pendingReview, l:"In review" },
  ];
  return (
    <div className="cc">
      {/* TOP */}
      <div className="cc-top">
        <div className="cc-fw-icon" style={{ background:fw.bg, borderColor:fw.border }}>{cycle.icon}</div>
        <div className="cc-head">
          <div className="cc-title-row">
            <span className="cc-name">{cycle.name}</span>
            <span className="fw-tag" style={{ background:fw.bg, color:fw.accent, borderColor:fw.border }}>{cycle.frameworkTag}</span>
          </div>
          <div className="cc-id">{cycle.id} · Year {cycle.year} · Created {cycle.createdDate}</div>
          <div className="cc-badges">
            <div className="st-badge" style={{ background:st.bg, color:st.text, borderColor:st.border }}>
              <div className="st-dot" style={{ background:st.dot }} />{st.label}
            </div>
            <div className="role-badge" style={{ background:rm.bg, color:rm.color, borderColor:rm.border }}>
              {rm.icon} My role: {userRole}
            </div>
            <div className="cc-sub-meta">
              <span>Phase: <strong style={{ color:"var(--sub)" }}>{cycle.phase}</strong></span>
              <div className="meta-dot" />
              <span>Updated {cycle.lastActivity}</span>
            </div>
          </div>
        </div>
        <div className="cc-tr">
          <div className="dl-badge" style={{ background:daysBg, color:daysColor }}>
            {isUrgent?"⚡ ":""}{cycle.daysLeft} days left · {cycle.deadline}
          </div>
          <div className="team-row">
            {cycle.teamMembers.map((m,i)=>(
              <div key={i} className="team-av" style={{ background:m.color, zIndex:cycle.teamMembers.length-i }} title={`${m.name} — ${m.role}`}>
                {m.initials}
              </div>
            ))}
            <div className="team-more">+</div>
          </div>
        </div>
      </div>

      {/* MID */}
      <div className="cc-mid">
        <div>
          <div className="cc-mid-lbl">Controls breakdown</div>
          <ControlsBar controls={cycle.controls} />
        </div>
        <div>
          <div className="cc-mid-lbl">Evidence files</div>
          <div className="ev-grid">
            {evCells.map(e=>(
              <div className="ev-cell" key={e.l}>
                <div className="ev-v">{e.v}</div>
                <div className="ev-l">{e.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOT */}
      <div className="cc-bot">
        <PhaseStrip phaseIndex={cycle.phaseIndex} />
        <div className="vd" />
        <div className="prog-wrap">
          <div className="prog-track">
            <div className="prog-fill" style={{ width:`${cycle.overallProgress}%`, background:progColor }} />
          </div>
          <div className="prog-pct" style={{ color:progColor }}>{cycle.overallProgress}%</div>
        </div>
        <div className="vd" />
        <div className="my-tasks">
          <div className="mt-num" style={{ color:taskColor }}>
            {cycle.myTasks.pending===0?"✓":cycle.myTasks.pending}
          </div>
          <div className="mt-lbl">{cycle.myTasks.pending===0?"All done":"My tasks"}</div>
          <div className="mt-sub">{cycle.myTasks.completed}/{cycle.myTasks.total} done</div>
        </div>
        <button className="enter-btn" onClick={()=>onEnter(cycle,userRole)}>Open cycle →</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CYCLES LIST — CyclesList.jsx
═══════════════════════════════════════════════════════ */
const FILTERS = ["All","Urgent","Evidence Uploader","Reviewer","Approver"];
function CyclesList({ cycles, cycleRoles, onEnterCycle }) {
  const [filter, setFilter] = useState("All");
  const filtered = cycles.filter(c => {
    if (filter==="All")    return true;
    if (filter==="Urgent") return c.daysLeft<=5||c.status==="urgent"||c.status==="needs-attention";
    return cycleRoles[c.id]===filter;
  });
  return (
    <div>
      <div className="sec-head">
        <span className="sec-title">My Audit Cycles</span>
        <div className="filter-row">
          <span className="filter-lbl">Filter:</span>
          {FILTERS.map(f=>(
            <div key={f} className={`fp ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>{f}</div>
          ))}
        </div>
      </div>
      {filtered.length===0
        ? <div className="cycles-empty">No cycles match this filter.</div>
        : filtered.map(c=>(
          <CycleCard key={c.id} cycle={c} userRole={cycleRoles[c.id]} onEnter={onEnterCycle} />
        ))
      }
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PANEL COMPONENTS
═══════════════════════════════════════════════════════ */
function DeadlinesCard({ cycles }) {
  const sorted = [...cycles].sort((a,b)=>a.daysLeft-b.daysLeft);
  const getColor = d => d<=3?"#EF4444":d<=10?"#F59E0B":"#10B981";
  const phaseLabel = p => ({Setup:"Setup closes",Collection:"Collection closes",Review:"Review deadline",Approval:"Final approval"}[p]||"Cycle deadline");
  return (
    <div className="panel">
      <div className="ph"><span className="ph-title">Upcoming Deadlines</span><span className="ph-link">Calendar →</span></div>
      {sorted.map(c=>{
        const color=getColor(c.daysLeft);
        const pct=Math.max(5,Math.min(100,100-c.daysLeft/30*100));
        return (
          <div className="dl-item" key={c.id}>
            <div className="dl-body">
              <div className="dl-name">{c.name}</div>
              <div className="dl-sub">{phaseLabel(c.phase)}</div>
              <div className="dl-bar"><div className="dl-fill" style={{ width:`${pct}%`, background:color }} /></div>
            </div>
            <div className="dl-counter">
              <div className="dl-num" style={{ color }}>{c.daysLeft}</div>
              <div className="dl-day-lbl">days</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DUE_SOON = ["Today","Mar 24","Mar 25"];
function PriorityTasksCard({ cycles, cycleRoles, checked, onToggle }) {
  const tasks = cycles.flatMap(c=>
    c.tasks.filter(t=>DUE_SOON.includes(t.due))
      .map(t=>({ ...t, cycleName:c.name, cycleId:c.id, userRole:cycleRoles[c.id] }))
  );
  return (
    <div className="panel">
      <div className="ph">
        <span className="ph-title">Priority Tasks</span>
        <span className="ph-link">All tasks →</span>
      </div>
      {tasks.length===0
        ? <div style={{ padding:"16px 15px", textAlign:"center", color:"var(--hint)", fontSize:12 }}>All caught up ✓</div>
        : tasks.map(t=>(
          <TaskItemResolver
            key={t.id}
            task={t}
            cycleName={t.cycleName}
            userRole={t.userRole}
            checked={!!checked[t.id]}
            onToggle={e=>onToggle(t.id,e)}
          />
        ))
      }
    </div>
  );
}

function ActivityFeed({ activities }) {
  return (
    <div className="panel">
      <div className="ph"><span className="ph-title">Recent Activity</span><span className="ph-link">Full log →</span></div>
      {activities.map((a,i)=>{
        const fw=FRAMEWORK_META[a.cycleTag]||FRAMEWORK_META.SWIFT;
        return (
          <div className="ai-item" key={i}>
            <div className="ai-icon" style={{ background:a.bg, color:a.color }}>{a.icon}</div>
            <div className="ai-body">
              <div className="ai-text">{a.text}</div>
              <div className="ai-bottom">
                <span className="ai-tag" style={{ background:fw.bg, color:fw.accent }}>{a.cycle}</span>
                <span className="ai-time">{a.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT — UserDashboard.jsx
═══════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const user       = MOCK_USER;
  const cycleRoles = MOCK_USER.cycleRoles;
  const [activeNav, setActiveNav] = useState("dashboard");
  const [checked,   setChecked]   = useState({});

  const toggleTask = (id, e) => { e?.stopPropagation(); setChecked(p=>({...p,[id]:!p[id]})); };
  const enterCycle = (cycle, role) => alert(`Opening "${cycle.name}" as ${role}`);

  const allTasks       = MOCK_CYCLES.flatMap(c=>c.tasks);
  const todayUnchecked = allTasks.filter(t=>t.due==="Today"&&!checked[t.id]).length;
  const totalDone      = MOCK_CYCLES.reduce((s,c)=>s+c.myTasks.completed,0);
  const totalPending   = MOCK_CYCLES.reduce((s,c)=>s+c.myTasks.pending,0);

  const NAV = [
    {ic:"⊞",k:"dashboard"},{ic:"📋",k:"tasks"},{ic:"📁",k:"evidence"},
    {ic:"📊",k:"reports"},{ic:"🏛",k:"cycles"},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside style={{ width:58, background:"var(--sb)", display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 0 20px", gap:3, flexShrink:0 }}>
          <div className="sb-logo">S</div>
          {NAV.map(n=>(
            <div key={n.k} className={`sb-icon ${activeNav===n.k?"on":""}`}
              title={n.k} onClick={()=>setActiveNav(n.k)}>{n.ic}</div>
          ))}
          <div className="sb-sep" />
          <div className="sb-icon" title="Settings">⚙️</div>
          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <div className="sb-icon" style={{ position:"relative" }} title="Notifications">
              🔔<div className="notif-pip" />
            </div>
            <div className="sb-av" title={user.name}>{user.initials}</div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-shell">

          {/* TOPBAR */}
          <header className="topbar">
            <div className="tb-l">
              <span className="tb-title">Dashboard</span>
              <span className="tb-sep">/</span>
              <span className="tb-crumb">{user.org}</span>
            </div>
            <div className="tb-r">
              <button className="tb-btn">📥 Export Report</button>
              <button className="tb-btn primary">＋ New Cycle</button>
              <div className="tb-div" />
              <div className="tb-notif">🔔<div className="notif-pip" /></div>
              <div className="tb-div" />
              <div className="tb-user">
                <div className="tb-uav">{user.initials}</div>
                <div><div className="tb-uname">{user.name}</div><div className="tb-urole">{user.title}</div></div>
              </div>
            </div>
          </header>

          {/* SCROLL CONTENT */}
          <div className="scroll-content">

            {/* HERO */}
            <div className="hero">
              <div className="hero-glow" /><div className="hero-glow2" />
              <div>
                <div className="hero-date">Monday, March 24, 2026</div>
                <div className="hero-name">Good morning, {user.name.split(" ")[0]} 👋</div>
                <div className="hero-sub">
                  Assigned to{" "}
                  <span style={{ color:"#94A3B8", fontWeight:700 }}>{MOCK_CYCLES.length} active cycles</span>
                  {" · "}
                  <span style={{ color:todayUnchecked>0?"#F87171":"#34D399", fontWeight:700 }}>
                    {todayUnchecked} task{todayUnchecked!==1?"s":""} due today
                  </span>
                </div>
              </div>
              <div className="hero-kpis">
                {[
                  {v:MOCK_CYCLES.length, l:"Cycles"},
                  {v:totalPending,       l:"Pending"},
                  {v:todayUnchecked,     l:"Due today"},
                  {v:totalDone,          l:"Completed"},
                ].map(k=>(
                  <div className="hk" key={k.l}>
                    <div className="hk-v">{k.v}</div>
                    <div className="hk-l">{k.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="stats-row">
              {[
                {icon:"🎯",bg:"#EEF2FF",lbl:"Total Controls",val:MOCK_CYCLES.reduce((s,c)=>s+c.controls.total,0),       sub:"Across all frameworks"},
                {icon:"📂",bg:"#FFF7ED",lbl:"Evidence Files", val:MOCK_CYCLES.reduce((s,c)=>s+c.evidence.total,0),       sub:"All frameworks"},
                {icon:"🤖",bg:"#F0FDF4",lbl:"AI Evaluated",   val:MOCK_CYCLES.reduce((s,c)=>s+c.evidence.aiPassed,0),    sub:"Passed AI review"},
                {icon:"⚠️",bg:"#FEF2F2",lbl:"Overdue Controls",val:MOCK_CYCLES.reduce((s,c)=>s+c.controls.overdue,0),   sub:"Needs immediate action"},
              ].map(s=>(
                <div className="sc" key={s.lbl}>
                  <div className="sc-icon" style={{ background:s.bg }}>{s.icon}</div>
                  <div>
                    <div className="sc-lbl">{s.lbl}</div>
                    <div className="sc-val">{s.val}</div>
                    <div className="sc-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* BODY */}
            <div className="dash-body">
              <CyclesList cycles={MOCK_CYCLES} cycleRoles={cycleRoles} onEnterCycle={enterCycle} />
              <div className="right-panel">
                <DeadlinesCard cycles={MOCK_CYCLES} />
                <PriorityTasksCard cycles={MOCK_CYCLES} cycleRoles={cycleRoles} checked={checked} onToggle={toggleTask} />
                <ActivityFeed activities={MOCK_ACTIVITY} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
