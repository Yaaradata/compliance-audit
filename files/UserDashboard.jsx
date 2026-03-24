import { useState } from "react";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const USER = {
  name: "Riya Sharma",
  initials: "RS",
  title: "Senior Compliance Analyst",
  email: "riya.sharma@acmecorp.com",
  org: "AcmeCorp",
};

const CYCLES = [
  {
    id: "CYC-2026-72A489",
    name: "SWIFT CSCF 2026",
    framework: "SWIFT CSCF",
    frameworkTag: "SWIFT",
    icon: "🏦",
    year: 2026,
    phase: "Collection",
    phaseIndex: 1,
    deadline: "Mar 31, 2026",
    daysLeft: 8,
    createdDate: "Mar 1, 2026",
    lastActivity: "2 hours ago",
    status: "needs-attention",
    myRole: "Evidence Uploader",
    overallProgress: 45,
    controls: { total: 48, compliant: 21, inReview: 8, pending: 15, overdue: 4 },
    evidence: { total: 89, uploaded: 54, aiPassed: 42, pendingReview: 12 },
    myTasks: { total: 13, completed: 8, pending: 5 },
    teamMembers: [
      { initials: "AM", color: "#3B82F6", name: "Arjun M.", role: "Reviewer" },
      { initials: "PD", color: "#10B981", name: "Priya D.", role: "Approver" },
      { initials: "KJ", color: "#8B5CF6", name: "Karan J.", role: "Uploader" },
    ],
    tasks: [
      { id: 1, title: "Upload evidence for control 2.1 — Internal Data Flow Security", priority: "high", due: "Today",   type: "upload",   done: false },
      { id: 2, title: "Re-upload firewall_policy.pdf — AI score below threshold (34/100)", priority: "high", due: "Today",   type: "reupload", done: false },
      { id: 3, title: "Submit screenshots for control 6.1 — Anomaly Detection", priority: "med",  due: "Mar 26", type: "upload",   done: false },
      { id: 4, title: "Provide supporting doc for control 5.2 — Logical Access", priority: "med",  due: "Mar 27", type: "upload",   done: false },
      { id: 5, title: "Clarify metadata on patch_log_feb.xlsx with reviewer",    priority: "low",  due: "Mar 29", type: "comment",  done: false },
    ],
  },
  {
    id: "CYC-2026-853C2E",
    name: "SOC 2 Type II 2026",
    framework: "SOC 2 Type II",
    frameworkTag: "SOC2",
    icon: "🔐",
    year: 2026,
    phase: "Review",
    phaseIndex: 2,
    deadline: "Apr 15, 2026",
    daysLeft: 23,
    createdDate: "Mar 10, 2026",
    lastActivity: "Yesterday",
    status: "on-track",
    myRole: "Reviewer",
    overallProgress: 68,
    controls: { total: 61, compliant: 38, inReview: 14, pending: 6, overdue: 3 },
    evidence: { total: 203, uploaded: 187, aiPassed: 171, pendingReview: 16 },
    myTasks: { total: 17, completed: 14, pending: 3 },
    teamMembers: [
      { initials: "RS", color: "#EC4899", name: "Riya S.", role: "Reviewer" },
      { initials: "NK", color: "#F59E0B", name: "Nikhil K.", role: "Uploader" },
      { initials: "PD", color: "#10B981", name: "Priya D.", role: "Approver" },
    ],
    tasks: [
      { id: 6, title: "Review access_control_policy.pdf — uploaded by N. Kumar",     priority: "high", due: "Mar 24", type: "review",  done: false },
      { id: 7, title: "Review encryption_certificate_2026.pdf — AI score 88",         priority: "med",  due: "Mar 25", type: "review",  done: false },
      { id: 8, title: "Add clarification comment on incident_log.xlsx",               priority: "low",  due: "Mar 28", type: "comment", done: false },
    ],
  },
  {
    id: "CYC-2025-F3A921",
    name: "ISO 27001 : 2025",
    framework: "ISO 27001",
    frameworkTag: "ISO",
    icon: "🛡️",
    year: 2025,
    phase: "Approval",
    phaseIndex: 3,
    deadline: "Mar 25, 2026",
    daysLeft: 2,
    createdDate: "Jan 15, 2026",
    lastActivity: "3 hours ago",
    status: "urgent",
    myRole: "Approver",
    overallProgress: 94,
    controls: { total: 114, compliant: 107, inReview: 4, pending: 2, overdue: 1 },
    evidence: { total: 412, uploaded: 412, aiPassed: 401, pendingReview: 0 },
    myTasks: { total: 24, completed: 22, pending: 2 },
    teamMembers: [
      { initials: "SP", color: "#6366F1", name: "Sanjay P.", role: "Uploader" },
      { initials: "AM", color: "#3B82F6", name: "Arjun M.", role: "Reviewer" },
    ],
    tasks: [
      { id: 9,  title: "Final sign-off — all 114 controls reviewed, cycle ready for submission", priority: "high", due: "Today",  type: "approve", done: false },
      { id: 10, title: "Accept formal risk acceptance for control A.12.6",                       priority: "high", due: "Mar 25", type: "risk",    done: false },
    ],
  },
];

const PHASES = ["Setup", "Collection", "Review", "Approval"];

const ACTIVITY_LOG = [
  { icon: "✓", color: "#10B981", bg: "#ECFDF5", text: "Your submission for control 1.1 was approved by A. Mehta",       cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "1h ago" },
  { icon: "↩", color: "#F59E0B", bg: "#FFFBEB", text: "firewall_policy.pdf rejected — AI confidence score too low (34)", cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "3h ago" },
  { icon: "▶", color: "#6366F1", bg: "#EEF2FF", text: "ISO 27001 cycle moved to Approval — your sign-off required",      cycle: "ISO 27001",   cycleTag: "ISO",   time: "Yesterday" },
  { icon: "↑", color: "#3B82F6", bg: "#EFF6FF", text: "14 controls marked compliant in SOC 2 Review phase",              cycle: "SOC 2",       cycleTag: "SOC2",  time: "2 days ago" },
  { icon: "⚑", color: "#EF4444", bg: "#FEF2F2", text: "4 controls overdue in SWIFT CSCF — deadline was Mar 20",          cycle: "SWIFT CSCF",  cycleTag: "SWIFT", time: "3 days ago" },
];

const DEADLINES = [
  { cycle: "ISO 27001",    label: "Final approval deadline",  daysLeft: 2,  color: "#EF4444", urgency: 1.0 },
  { cycle: "SWIFT CSCF",  label: "Collection phase closes",  daysLeft: 8,  color: "#F59E0B", urgency: 0.7 },
  { cycle: "SOC 2 Type II",label: "Review phase deadline",   daysLeft: 23, color: "#10B981", urgency: 0.2 },
];

/* ─────────────────────────────────────────
   DESIGN CONSTANTS
───────────────────────────────────────── */
const STATUS_MAP = {
  "on-track":        { label: "On track",        dot: "#10B981", textColor: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  "needs-attention": { label: "Needs attention",  dot: "#F59E0B", textColor: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  "urgent":          { label: "Urgent",           dot: "#EF4444", textColor: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
  "completed":       { label: "Completed",        dot: "#6B7280", textColor: "#374151", bg: "#F9FAFB", border: "#E5E7EB" },
};

const ROLE_MAP = {
  "Evidence Uploader": { color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD" },
  "Reviewer":          { color: "#0369A1", bg: "#E0F2FE", border: "#BAE6FD" },
  "Approver":          { color: "#065F46", bg: "#DCFCE7", border: "#A7F3D0" },
};

const FW_MAP = {
  "SWIFT": { accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  "SOC2":  { accent: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  "ISO":   { accent: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
  "PCI":   { accent: "#7E22CE", bg: "#FAF5FF", border: "#DDD6FE" },
};

const PRIORITY_MAP = {
  high: { label: "High",   color: "#DC2626", bg: "#FEF2F2" },
  med:  { label: "Med",    color: "#D97706", bg: "#FFFBEB" },
  low:  { label: "Low",    color: "#6B7280", bg: "#F9FAFB" },
};

const TYPE_LABEL = {
  upload: "Upload", reupload: "Re-upload",
  review: "Review", comment: "Comment",
  approve: "Sign off", risk: "Risk flag",
};

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --font:'Plus Jakarta Sans',sans-serif;
  --mono:'JetBrains Mono',monospace;
  --bg:#EFF1F7;
  --surface:#FFFFFF;
  --surface2:#F7F8FB;
  --border:rgba(0,0,0,0.07);
  --border2:rgba(0,0,0,0.12);
  --text:#0D1117;
  --sub:#5B6278;
  --hint:#9BA5B7;
  --accent:#4F46E5;
  --accent-lt:#EEF2FF;
  --sb:#090E1A;
  --r:14px;--rs:8px;--rm:10px;
}

html,body{height:100%;overflow:hidden}
.app{display:flex;height:100vh;background:var(--bg);font-family:var(--font);color:var(--text);font-size:13px;overflow:hidden}

/* ── SIDEBAR ── */
.sb{width:58px;background:var(--sb);display:flex;flex-direction:column;align-items:center;padding:16px 0 20px;gap:3px;flex-shrink:0}
.sb-logo{width:34px;height:34px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;margin-bottom:18px;flex-shrink:0;letter-spacing:-0.5px}
.sb-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#3D4F6E;cursor:pointer;font-size:15px;transition:all 0.15s;flex-shrink:0}
.sb-icon:hover{background:#141D2E;color:#8B9CC4}
.sb-icon.on{background:#1A1F35;color:#818CF8}
.sb-sep{width:22px;height:1px;background:#141D2E;margin:8px 0;flex-shrink:0}
.sb-foot{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:10px}
.sb-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px;cursor:pointer}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── TOPBAR ── */
.topbar{background:var(--surface);border-bottom:1px solid var(--border);height:52px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:12px}
.tb-l{display:flex;align-items:center;gap:6px;min-width:0}
.tb-title{font-size:14px;font-weight:800;color:var(--text);white-space:nowrap}
.tb-sep{color:var(--hint);font-size:12px}
.tb-crumb{font-size:12px;color:var(--hint);white-space:nowrap}
.tb-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
.tb-btn{height:30px;padding:0 11px;border-radius:var(--rs);border:1px solid var(--border2);background:var(--surface);display:flex;align-items:center;gap:5px;cursor:pointer;font-size:11px;font-weight:600;color:var(--sub);font-family:var(--font);transition:all 0.15s;white-space:nowrap}
.tb-btn:hover{background:var(--surface2);color:var(--text)}
.tb-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.tb-btn.primary:hover{background:#4338CA}
.tb-notif{width:30px;height:30px;border-radius:var(--rs);border:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;position:relative;color:var(--sub)}
.notif-pip{position:absolute;top:6px;right:6px;width:6px;height:6px;background:#EF4444;border-radius:50%;border:1.5px solid var(--surface)}
.tb-divider{width:1px;height:18px;background:var(--border2);flex-shrink:0}
.tb-user{display:flex;align-items:center;gap:8px;cursor:pointer;flex-shrink:0}
.tb-user-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:10px}
.tb-uname{font-size:12px;font-weight:700;color:var(--text)}
.tb-urole{font-size:10px;color:var(--hint)}

/* ── SCROLL CONTENT ── */
.content{flex:1;overflow-y:auto;padding:22px 24px}
.content::-webkit-scrollbar{width:4px}
.content::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px}

/* ── HERO ── */
.hero{background:var(--sb);border-radius:16px;padding:20px 24px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden}
.hero-glow{position:absolute;right:-20px;top:-30px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%);pointer-events:none}
.hero-glow2{position:absolute;left:40%;bottom:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%);pointer-events:none}
.hero-l{}
.hero-date{font-size:10px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
.hero-name{font-size:20px;font-weight:800;color:#F1F5F9;margin-bottom:3px;letter-spacing:-0.3px}
.hero-sub{font-size:12px;color:#64748B}
.hero-kpis{display:flex;gap:10px;position:relative;z-index:1}
.hk{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;text-align:center;min-width:72px}
.hk-v{font-size:22px;font-weight:800;color:#F1F5F9;font-family:var(--mono);line-height:1}
.hk-l{font-size:9px;color:#64748B;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px}

/* ── STAT ROW ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.sc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:13px 15px;display:flex;align-items:center;gap:11px}
.sc-icon{width:36px;height:36px;border-radius:var(--rm);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.sc-lbl{font-size:10px;font-weight:600;color:var(--hint);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px}
.sc-val{font-size:20px;font-weight:800;color:var(--text);font-family:var(--mono);line-height:1}
.sc-sub{font-size:10px;color:var(--hint);margin-top:2px}

/* ── BODY GRID ── */
.body{display:grid;grid-template-columns:1fr 294px;gap:14px;align-items:start}

/* ── SECTION HEADER ── */
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.sh-title{font-size:11px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.6px}
.sh-right{display:flex;align-items:center;gap:6px}
.sh-link{font-size:11px;font-weight:600;color:var(--accent);cursor:pointer}

/* FILTER PILLS */
.fp{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.12s;border:1px solid var(--border);background:var(--surface);color:var(--sub);white-space:nowrap}
.fp:hover{border-color:var(--border2);color:var(--text)}
.fp.on{background:var(--accent);color:#fff;border-color:var(--accent)}

/* ══════════════════════════════
   CYCLE CARD
══════════════════════════════ */
.cc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden;transition:box-shadow 0.18s,border-color 0.18s}
.cc:hover{box-shadow:0 4px 20px rgba(0,0,0,0.07);border-color:var(--border2)}

/* TOP */
.cc-top{padding:15px 17px 13px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:13px}
.cc-fw-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid}
.cc-head{flex:1;min-width:0}
.cc-title-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:2px}
.cc-name{font-size:14px;font-weight:800;color:var(--text);letter-spacing:-0.2px}
.fw-tag{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;font-family:var(--mono);letter-spacing:0.4px;border:1px solid;flex-shrink:0}
.cc-id{font-size:10px;color:var(--hint);font-family:var(--mono)}
.cc-badges{display:flex;align-items:center;gap:7px;margin-top:6px;flex-wrap:wrap}
.status-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;border:1px solid;flex-shrink:0}
.s-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.role-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 9px;border-radius:6px;border:1px solid;flex-shrink:0}
.cc-sub-meta{font-size:10px;color:var(--hint);display:flex;align-items:center;gap:5px}
.meta-dot{width:2px;height:2px;border-radius:50%;background:var(--hint)}

/* TOP RIGHT */
.cc-tr{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.dl-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;font-family:var(--mono);white-space:nowrap}
.team-row{display:flex;align-items:center}
.team-av{width:23px;height:23px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;border:2px solid var(--surface);margin-left:-6px;flex-shrink:0}
.team-av:first-child{margin-left:0}
.team-more{width:23px;height:23px;border-radius:50%;background:var(--surface2);border:1.5px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--hint);margin-left:-6px}

/* MIDDLE — controls + evidence */
.cc-mid{padding:12px 17px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:16px}
.cc-mid-lbl{font-size:10px;font-weight:700;color:var(--hint);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:7px}

/* CONTROL BAR */
.ctrl-bar{height:8px;border-radius:5px;overflow:hidden;display:flex;gap:1.5px}
.ctrl-seg{height:100%;border-radius:3px}
.ctrl-leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:7px}
.ctrl-leg-item{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--sub)}
.cl-dot{width:7px;height:7px;border-radius:2px;flex-shrink:0}
.ctrl-total{font-size:10px;color:var(--hint);margin-top:4px}

/* EVIDENCE GRID */
.ev-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.ev-cell{background:var(--surface2);border-radius:var(--rs);padding:8px 10px;border:1px solid var(--border)}
.ev-v{font-size:17px;font-weight:800;color:var(--text);font-family:var(--mono);line-height:1}
.ev-l{font-size:9px;color:var(--hint);margin-top:2px;text-transform:uppercase;letter-spacing:0.3px}

/* BOTTOM — phase + progress + tasks + cta */
.cc-bot{padding:11px 17px;display:flex;align-items:center;gap:12px}

/* PHASE STRIP */
.phase-strip{flex:1;min-width:0}
.ps-nodes{display:flex;align-items:flex-end;gap:0}
.ps-node{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0}
.ps-bar{width:100%;height:4px;border-radius:2px}
.ps-label{font-size:9px;font-weight:600;color:var(--hint);text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap}
.ps-label.done{color:var(--accent)}
.ps-label.active{color:var(--accent);font-weight:800}
.ps-dot-wrap{position:relative;width:100%;height:0}
.ps-dot{width:9px;height:9px;border-radius:50%;border:2px solid var(--border2);background:var(--surface2);position:absolute;left:50%;top:-6.5px;transform:translateX(-50%)}
.ps-dot.done{background:var(--accent);border-color:var(--accent)}
.ps-dot.active{background:#fff;border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,70,229,0.2)}

/* PROGRESS */
.prog-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.prog-track{width:70px;height:5px;background:#EEF0F6;border-radius:3px;overflow:hidden}
.prog-fill{height:100%;border-radius:3px}
.prog-pct{font-size:11px;font-weight:700;font-family:var(--mono);min-width:26px}

/* VERT DIVIDER */
.vd{width:1px;height:28px;background:var(--border);flex-shrink:0}

/* MY TASKS */
.my-tasks{text-align:center;flex-shrink:0}
.mt-num{font-size:21px;font-weight:800;font-family:var(--mono);line-height:1}
.mt-lbl{font-size:9px;color:var(--hint);text-transform:uppercase;letter-spacing:0.3px;margin-top:2px}
.mt-sub{font-size:9px;color:var(--hint);margin-top:1px}

/* ENTER BTN */
.enter-btn{background:var(--text);color:#fff;border:none;padding:8px 14px;border-radius:var(--rs);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap;display:flex;align-items:center;gap:5px;transition:all 0.15s;flex-shrink:0;letter-spacing:-0.1px}
.enter-btn:hover{background:#1E293B;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.18)}

/* ══════════════════════════════
   RIGHT PANEL
══════════════════════════════ */
.rp{display:flex;flex-direction:column;gap:12px}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.ph{padding:11px 15px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.ph-title{font-size:11px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:0.5px}
.ph-action{font-size:11px;font-weight:600;color:var(--accent);cursor:pointer}
.ph-action:hover{text-decoration:underline}

/* DEADLINE ITEMS */
.dl-item{padding:10px 15px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.dl-body{flex:1;min-width:0}
.dl-name{font-size:12px;font-weight:700;color:var(--text);margin-bottom:1px}
.dl-sub{font-size:10px;color:var(--hint)}
.dl-progress{height:3px;background:#EEF0F6;border-radius:2px;overflow:hidden;margin-top:5px}
.dl-fill{height:100%;border-radius:2px}
.dl-counter{text-align:center;flex-shrink:0}
.dl-num{font-size:16px;font-weight:800;font-family:var(--mono);line-height:1}
.dl-day-lbl{font-size:9px;color:var(--hint);margin-top:1px}

/* TASK ITEMS */
.ti{padding:9px 15px;border-top:1px solid var(--border);display:flex;align-items:flex-start;gap:8px;cursor:pointer;transition:background 0.1s}
.ti:hover{background:var(--surface2)}
.ti-cb{width:15px;height:15px;border-radius:4px;border:1.5px solid #D1D5DB;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all 0.12s;cursor:pointer;font-size:8px}
.ti-cb.done{background:#10B981;border-color:#10B981;color:#fff}
.ti-body{flex:1;min-width:0}
.ti-title{font-size:12px;color:var(--text);line-height:1.4}
.ti-title.done{text-decoration:line-through;color:var(--hint)}
.ti-meta{display:flex;align-items:center;gap:5px;margin-top:3px}
.ti-cycle{font-size:9px;color:var(--hint);font-family:var(--mono)}
.ti-type{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px}
.ti-due{font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px;white-space:nowrap}

/* ACTIVITY */
.ai{padding:9px 15px;border-top:1px solid var(--border);display:flex;align-items:flex-start;gap:8px}
.ai-icon{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px}
.ai-body{flex:1;min-width:0}
.ai-text{font-size:11px;color:var(--text);line-height:1.4}
.ai-bottom{display:flex;align-items:center;gap:5px;margin-top:3px}
.ai-cycle-tag{font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;font-family:var(--mono)}
.ai-time{font-size:10px;color:var(--hint)}

/* EMPTY */
.empty{padding:20px;text-align:center;color:var(--hint);font-size:12px}
`;

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function PhaseStrip({ phaseIndex }) {
  return (
    <div className="phase-strip">
      <div className="ps-nodes">
        {PHASES.map((p, i) => {
          const done   = i < phaseIndex;
          const active = i === phaseIndex;
          return (
            <div className="ps-node" key={p}>
              <div className="ps-dot-wrap">
                <div className={`ps-dot ${done ? "done" : active ? "active" : ""}`} />
              </div>
              <div
                className="ps-bar"
                style={{
                  background: done ? "var(--accent)"
                    : active ? "linear-gradient(90deg,var(--accent) 55%,#EEF0F6 55%)"
                    : "#EEF0F6",
                }}
              />
              <div className={`ps-label ${done ? "done" : active ? "active" : ""}`}>{p}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CtrlBar({ c }) {
  const total = c.total;
  const segs = [
    { val: c.compliant, color: "#10B981", label: `${c.compliant} Compliant` },
    { val: c.inReview,  color: "#6366F1", label: `${c.inReview} In review`  },
    { val: c.pending,   color: "#D1D5DB", label: `${c.pending} Pending`     },
    { val: c.overdue,   color: "#EF4444", label: `${c.overdue} Overdue`     },
  ];
  return (
    <>
      <div className="ctrl-bar">
        {segs.map(s => (
          <div key={s.label}
            className="ctrl-seg"
            style={{ width: `${(s.val/total)*100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="ctrl-leg">
        {segs.map(s => (
          <div className="ctrl-leg-item" key={s.label}>
            <div className="cl-dot" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div className="ctrl-total">{total} total controls</div>
    </>
  );
}

function CycleCard({ cycle, onEnter }) {
  const st = STATUS_MAP[cycle.status];
  const fw = FW_MAP[cycle.frameworkTag] || FW_MAP["SWIFT"];
  const rm = ROLE_MAP[cycle.myRole]     || ROLE_MAP["Reviewer"];

  const isUrgent = cycle.daysLeft <= 3;
  const daysColor = isUrgent ? "#EF4444" : cycle.daysLeft <= 10 ? "#D97706" : "#059669";
  const daysBg    = isUrgent ? "#FEF2F2" : cycle.daysLeft <= 10 ? "#FFFBEB" : "#ECFDF5";

  const progColor = cycle.overallProgress >= 80 ? "#10B981"
    : cycle.overallProgress >= 50 ? "#4F46E5" : "#F59E0B";

  const taskColor = cycle.myTasks.pending === 0 ? "#10B981"
    : cycle.myTasks.pending >= 4 ? "#EF4444" : "#F59E0B";

  return (
    <div className="cc">
      {/* TOP */}
      <div className="cc-top">
        <div className="cc-fw-icon" style={{ background: fw.bg, borderColor: fw.border }}>
          {cycle.icon}
        </div>
        <div className="cc-head">
          <div className="cc-title-row">
            <span className="cc-name">{cycle.name}</span>
            <span className="fw-tag" style={{ background: fw.bg, color: fw.accent, borderColor: fw.border }}>
              {cycle.frameworkTag}
            </span>
          </div>
          <div className="cc-id">{cycle.id} · Year {cycle.year} · Created {cycle.createdDate}</div>
          <div className="cc-badges">
            <div className="status-badge" style={{ background: st.bg, color: st.textColor, borderColor: st.border }}>
              <div className="s-dot" style={{ background: st.dot }} />
              {st.label}
            </div>
            <div className="role-badge" style={{ background: rm.bg, color: rm.color, borderColor: rm.border }}>
              My role: {cycle.myRole}
            </div>
            <div className="cc-sub-meta">
              <span>Phase: <strong style={{ color: "var(--sub)" }}>{cycle.phase}</strong></span>
              <div className="meta-dot" />
              <span>Last activity {cycle.lastActivity}</span>
            </div>
          </div>
        </div>
        <div className="cc-tr">
          <div className="dl-badge" style={{ background: daysBg, color: daysColor }}>
            {isUrgent ? "⚡ " : ""}{cycle.daysLeft} days left · {cycle.deadline}
          </div>
          <div className="team-row">
            {cycle.teamMembers.map((m, i) => (
              <div key={i} className="team-av"
                style={{ background: m.color, zIndex: cycle.teamMembers.length - i }}
                title={`${m.name} — ${m.role}`}
              >{m.initials}</div>
            ))}
            <div className="team-more" title="More members">+</div>
          </div>
        </div>
      </div>

      {/* MID */}
      <div className="cc-mid">
        <div>
          <div className="cc-mid-lbl">Controls breakdown</div>
          <CtrlBar c={cycle.controls} />
        </div>
        <div>
          <div className="cc-mid-lbl">Evidence files</div>
          <div className="ev-grid">
            {[
              { v: cycle.evidence.total,         l: "Total" },
              { v: cycle.evidence.uploaded,      l: "Uploaded" },
              { v: cycle.evidence.aiPassed,      l: "AI passed" },
              { v: cycle.evidence.pendingReview, l: "In review" },
            ].map((e, i) => (
              <div className="ev-cell" key={i}>
                <div className="ev-v">{e.v}</div>
                <div className="ev-l">{e.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="cc-bot">
        <PhaseStrip phaseIndex={cycle.phaseIndex} />
        <div className="vd" />
        <div className="prog-wrap">
          <div className="prog-track">
            <div className="prog-fill" style={{ width: `${cycle.overallProgress}%`, background: progColor }} />
          </div>
          <div className="prog-pct" style={{ color: progColor }}>{cycle.overallProgress}%</div>
        </div>
        <div className="vd" />
        <div className="my-tasks">
          <div className="mt-num" style={{ color: taskColor }}>
            {cycle.myTasks.pending === 0 ? "✓" : cycle.myTasks.pending}
          </div>
          <div className="mt-lbl">{cycle.myTasks.pending === 0 ? "All done" : "My tasks"}</div>
          <div className="mt-sub">{cycle.myTasks.completed}/{cycle.myTasks.total} done</div>
        </div>
        <button className="enter-btn" onClick={() => onEnter(cycle)}>
          Open cycle →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function UserDashboard() {
  const [filter,  setFilter]  = useState("All");
  const [checked, setChecked] = useState({});

  const allTasks = CYCLES.flatMap(c =>
    c.tasks.map(t => ({
      ...t,
      cycleName: c.name,
      frameworkTag: c.frameworkTag,
      fw: FW_MAP[c.frameworkTag] || FW_MAP["SWIFT"],
    }))
  );

  const todayAndSoon = allTasks.filter(t =>
    ["Today", "Mar 24", "Mar 25"].includes(t.due)
  );
  const todayUnchecked = allTasks.filter(t => t.due === "Today" && !checked[t.id]);

  const filteredCycles =
    filter === "All"            ? CYCLES
    : filter === "Urgent"       ? CYCLES.filter(c => c.daysLeft <= 5 || c.status === "urgent" || c.status === "needs-attention")
    : CYCLES.filter(c => c.myRole === filter);

  const toggleTask = (id, e) => {
    e.stopPropagation();
    setChecked(p => ({ ...p, [id]: !p[id] }));
  };

  const totalPending  = CYCLES.reduce((s, c) => s + c.myTasks.pending, 0);
  const totalDone     = CYCLES.reduce((s, c) => s + c.myTasks.completed, 0);

  const nav = [
    { ic: "⊞", l: "Dashboard" },
    { ic: "📋", l: "Tasks" },
    { ic: "📁", l: "Evidence" },
    { ic: "📊", l: "Reports" },
    { ic: "🏛",  l: "Cycles" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-logo">S</div>
          {nav.map((n, i) => (
            <div key={i} className={`sb-icon ${i === 0 ? "on" : ""}`} title={n.l}>{n.ic}</div>
          ))}
          <div className="sb-sep" />
          <div className="sb-icon" title="Settings">⚙️</div>
          <div className="sb-foot">
            <div className="sb-icon" style={{ position: "relative" }} title="Notifications">
              🔔<div className="notif-pip" />
            </div>
            <div className="sb-av" title={USER.name}>RS</div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">

          {/* TOPBAR */}
          <div className="topbar">
            <div className="tb-l">
              <span className="tb-title">Dashboard</span>
              <span className="tb-sep">/</span>
              <span className="tb-crumb">{USER.org}</span>
            </div>
            <div className="tb-r">
              <button className="tb-btn">📥 Export Report</button>
              <button className="tb-btn primary">＋ New Cycle</button>
              <div className="tb-divider" />
              <div className="tb-notif">🔔<div className="notif-pip" /></div>
              <div className="tb-divider" />
              <div className="tb-user">
                <div className="tb-user-av">RS</div>
                <div>
                  <div className="tb-uname">{USER.name}</div>
                  <div className="tb-urole">{USER.title}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="content">

            {/* HERO */}
            <div className="hero">
              <div className="hero-glow" /><div className="hero-glow2" />
              <div className="hero-l">
                <div className="hero-date">Monday, March 23, 2026</div>
                <div className="hero-name">Good morning, Riya 👋</div>
                <div className="hero-sub">
                  Assigned to&nbsp;
                  <span style={{ color: "#94A3B8", fontWeight: 700 }}>{CYCLES.length} active cycles</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: todayUnchecked.length > 0 ? "#F87171" : "#34D399", fontWeight: 700 }}>
                    {todayUnchecked.length} task{todayUnchecked.length !== 1 ? "s" : ""} due today
                  </span>
                </div>
              </div>
              <div className="hero-kpis">
                {[
                  { v: CYCLES.length,             l: "Cycles" },
                  { v: totalPending,               l: "Pending" },
                  { v: todayUnchecked.length,      l: "Due today" },
                  { v: totalDone,                  l: "Completed" },
                ].map((k, i) => (
                  <div className="hk" key={i}>
                    <div className="hk-v">{k.v}</div>
                    <div className="hk-l">{k.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="stats">
              {[
                { icon: "🎯", bg: "#EEF2FF", lbl: "Total Controls",   val: CYCLES.reduce((s,c)=>s+c.controls.total,0),   sub: "Across all frameworks" },
                { icon: "📂", bg: "#FFF7ED", lbl: "Evidence Files",    val: CYCLES.reduce((s,c)=>s+c.evidence.total,0),   sub: "All frameworks" },
                { icon: "🤖", bg: "#F0FDF4", lbl: "AI Evaluated",      val: CYCLES.reduce((s,c)=>s+c.evidence.aiPassed,0), sub: "Passed AI review" },
                { icon: "⚠️", bg: "#FEF2F2", lbl: "Overdue Controls",  val: CYCLES.reduce((s,c)=>s+c.controls.overdue,0), sub: "Needs immediate action" },
              ].map((s, i) => (
                <div className="sc" key={i}>
                  <div className="sc-icon" style={{ background: s.bg }}>{s.icon}</div>
                  <div>
                    <div className="sc-lbl">{s.lbl}</div>
                    <div className="sc-val">{s.val}</div>
                    <div className="sc-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* BODY */}
            <div className="body">

              {/* LEFT — CYCLES */}
              <div>
                <div className="sh">
                  <span className="sh-title">My Audit Cycles</span>
                  <div className="sh-right">
                    {["All", "Urgent", "Evidence Uploader", "Reviewer", "Approver"].map(f => (
                      <div key={f} className={`fp ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</div>
                    ))}
                  </div>
                </div>

                {filteredCycles.length === 0
                  ? <div className="empty">No cycles match this filter.</div>
                  : filteredCycles.map(c => (
                    <CycleCard
                      key={c.id}
                      cycle={c}
                      onEnter={(cy) => alert(`Opening: ${cy.name}`)}
                    />
                  ))
                }
              </div>

              {/* RIGHT PANEL */}
              <div className="rp">

                {/* DEADLINES */}
                <div className="panel">
                  <div className="ph">
                    <span className="ph-title">Upcoming Deadlines</span>
                    <span className="ph-action">Calendar →</span>
                  </div>
                  {DEADLINES.map((d, i) => (
                    <div className="dl-item" key={i}>
                      <div className="dl-body">
                        <div className="dl-name">{d.cycle}</div>
                        <div className="dl-sub">{d.label}</div>
                        <div className="dl-progress">
                          <div className="dl-fill" style={{ width: `${d.urgency * 100}%`, background: d.color }} />
                        </div>
                      </div>
                      <div className="dl-counter">
                        <div className="dl-num" style={{ color: d.color }}>{d.daysLeft}</div>
                        <div className="dl-day-lbl">days</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PRIORITY TASKS */}
                <div className="panel">
                  <div className="ph">
                    <span className="ph-title">Priority Tasks</span>
                    <span className="ph-action">All tasks →</span>
                  </div>
                  {todayAndSoon.length === 0
                    ? <div className="empty">All caught up ✓</div>
                    : todayAndSoon.map(task => {
                        const isDone = checked[task.id];
                        const pm = PRIORITY_MAP[task.priority];
                        const isToday = task.due === "Today";
                        return (
                          <div className="ti" key={task.id} onClick={(e) => toggleTask(task.id, e)}>
                            <div className={`ti-cb ${isDone ? "done" : ""}`} onClick={(e) => toggleTask(task.id, e)}>
                              {isDone && "✓"}
                            </div>
                            <div className="ti-body">
                              <div className={`ti-title ${isDone ? "done" : ""}`}>{task.title}</div>
                              <div className="ti-meta">
                                <span className="ti-cycle">{task.cycleName}</span>
                                <span className="ti-type" style={{ background: pm.bg, color: pm.color }}>
                                  {TYPE_LABEL[task.type]}
                                </span>
                              </div>
                            </div>
                            <div className="ti-due" style={{ color: isToday ? "#EF4444" : "#D97706" }}>
                              {isToday ? "Today" : task.due}
                            </div>
                          </div>
                        );
                      })
                  }
                </div>

                {/* ACTIVITY */}
                <div className="panel">
                  <div className="ph">
                    <span className="ph-title">Recent Activity</span>
                    <span className="ph-action">Full log →</span>
                  </div>
                  {ACTIVITY_LOG.map((a, i) => {
                    const fw2 = FW_MAP[a.cycleTag] || FW_MAP["SWIFT"];
                    return (
                      <div className="ai" key={i}>
                        <div className="ai-icon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                        <div className="ai-body">
                          <div className="ai-text">{a.text}</div>
                          <div className="ai-bottom">
                            <span className="ai-cycle-tag" style={{ background: fw2.bg, color: fw2.accent }}>{a.cycle}</span>
                            <span className="ai-time">{a.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
