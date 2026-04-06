import { useState } from "react";

/* ─────────────────────────────────────────────
   DATA  — simulates what the API would return
   for a user who has different roles per cycle
───────────────────────────────────────────── */
const USER = {
  name: "Riya Sharma",
  initials: "RS",
  email: "riya.sharma@acmecorp.com",
  totalCycles: 3,
  totalPendingTasks: 8,
};

// Role metadata
const ROLE_META = {
  "Evidence Uploader": { color: "#7C3AED", bg: "#EDE9FE", lightBg: "#F5F3FF", icon: "📂", short: "EU" },
  "Reviewer":          { color: "#0369A1", bg: "#E0F2FE", lightBg: "#F0F9FF", icon: "🔍", short: "RV" },
  "Approver":          { color: "#059669", bg: "#DCFCE7", lightBg: "#F0FDF4", icon: "✍️", short: "AP" },
};

// Each cycle the user is part of, with their specific role + pending work
const MY_CYCLES = [
  {
    id: "CYC-2026-72A489",
    framework: "SWIFT CSCF",
    frameworkBg: "#EFF6FF",
    frameworkColor: "#1D4ED8",
    year: 2026,
    icon: "🏦",
    phase: "Collection",
    phaseColor: "#2563EB",
    phaseBg: "#EFF6FF",
    overallProgress: 45,
    role: "Evidence Uploader",
    myStats: { total: 48, done: 21, pending: 27 },
    tasks: [
      { id: 1, label: "Upload evidence for control 2.1 – Internal Data Flow", priority: "HIGH", type: "upload", due: "Today" },
      { id: 2, label: "Re-upload firewall_policy.pdf — AI score too low (34)", priority: "HIGH", type: "reupload", due: "Today" },
      { id: 3, label: "Upload screenshots for control 6.1 – Anomaly Detection", priority: "MED", type: "upload", due: "Mar 25" },
    ],
  },
  {
    id: "CYC-2026-853C2E",
    framework: "SOC 2 Type II",
    frameworkBg: "#FEF3C7",
    frameworkColor: "#B45309",
    year: 2026,
    icon: "🔐",
    phase: "Review",
    phaseColor: "#7C3AED",
    phaseBg: "#EDE9FE",
    overallProgress: 68,
    role: "Reviewer",
    myStats: { total: 24, done: 17, pending: 7 },
    tasks: [
      { id: 4, label: "Review access_control_policy.pdf — uploaded by K. Joshi", priority: "HIGH", type: "review", due: "Today" },
      { id: 5, label: "Review encryption_cert_2026.pdf — AI score 88", priority: "MED", type: "review", due: "Mar 24" },
      { id: 6, label: "Add comment on incident_log.xlsx — flagged by AI", priority: "LOW", type: "comment", due: "Mar 26" },
    ],
  },
  {
    id: "CYC-2025-F3A921",
    framework: "ISO 27001",
    frameworkBg: "#F0FDF4",
    frameworkColor: "#15803D",
    year: 2025,
    icon: "🛡️",
    phase: "Approval",
    phaseColor: "#059669",
    phaseBg: "#DCFCE7",
    overallProgress: 94,
    role: "Approver",
    myStats: { total: 114, done: 112, pending: 2 },
    tasks: [
      { id: 7, label: "Sign off ISO 27001 2025 — all controls reviewed", priority: "HIGH", type: "approve", due: "Today" },
      { id: 8, label: "Accept risk flag on A.12.6 before final sign-off", priority: "MED", type: "risk", due: "Mar 24" },
    ],
  },
];

const PRIORITY_META = {
  HIGH: { bg: "#FEE2E2", color: "#DC2626" },
  MED:  { bg: "#FEF3C7", color: "#B45309" },
  LOW:  { bg: "#F3F4F6", color: "#6B7280" },
};

const TYPE_META = {
  upload:   { icon: "⬆️", verb: "Upload" },
  reupload: { icon: "🔁", verb: "Re-upload" },
  review:   { icon: "🔍", verb: "Review" },
  comment:  { icon: "💬", verb: "Comment" },
  approve:  { icon: "✍️", verb: "Sign off" },
  risk:     { icon: "🚩", verb: "Accept risk" },
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.uw-root {
  display: flex;
  height: 100vh;
  background: #ECEEF3;
  font-family: 'DM Sans', sans-serif;
  color: #111827;
  overflow: hidden;
}

/* ── SIDEBAR ── */
.uw-sidebar {
  width: 60px;
  background: #111827;
  display: flex; flex-direction: column;
  align-items: center; padding: 18px 0; gap: 6px;
  flex-shrink: 0;
}
.uw-logo {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg,#6366F1,#8B5CF6);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:13px;margin-bottom:14px;
}
.uw-nav-icon {
  width: 38px; height: 38px; border-radius: 9px;
  display:flex;align-items:center;justify-content:center;
  color:#4B5563; cursor:pointer; font-size:16px;
  transition: all 0.15s;
}
.uw-nav-icon:hover { background:#1F2937; color:#E5E7EB; }
.uw-nav-icon.active { background:#1E1B4B; color:#818CF8; }
.uw-sidebar-bottom { margin-top:auto; display:flex;flex-direction:column;align-items:center;gap:8px; }
.uw-user-dot {
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#6366F1,#8B5CF6);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:12px;
}

/* ── MAIN ── */
.uw-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }

/* ── TOPBAR ── */
.uw-topbar {
  background:#fff;
  border-bottom:1px solid #E5E7EB;
  padding:0 28px; height:58px;
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.uw-topbar-left { display:flex;align-items:center;gap:10px; }
.uw-topbar-title { font-size:15px;font-weight:600;color:#111827; }
.uw-topbar-sep { color:#D1D5DB; }
.uw-topbar-sub { font-size:13px;color:#6B7280; }
.uw-topbar-right { display:flex;align-items:center;gap:12px; }
.uw-topbar-notif {
  width:32px;height:32px;border-radius:8px;border:1px solid #E5E7EB;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  font-size:14px;color:#6B7280;position:relative;
}
.uw-notif-pip {
  position:absolute;top:6px;right:6px;width:7px;height:7px;
  background:#6366F1;border-radius:50%;border:1.5px solid #fff;
}
.uw-topbar-user { display:flex;align-items:center;gap:8px; }
.uw-topbar-avatar {
  width:32px;height:32px;border-radius:50%;
  background:linear-gradient(135deg,#6366F1,#8B5CF6);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:12px;
}
.uw-topbar-info {}
.uw-topbar-name { font-size:13px;font-weight:600;line-height:1.2; }
.uw-topbar-roles { font-size:10px;color:#9CA3AF; }

/* ── CONTENT ── */
.uw-content { flex:1; overflow-y:auto; padding:24px 28px; }

/* ── HERO BANNER ── */
.uw-hero {
  background: #111827;
  border-radius:16px;
  padding:24px 28px;
  margin-bottom:22px;
  display:flex;justify-content:space-between;align-items:center;
  position:relative;overflow:hidden;
}
.uw-hero-glow {
  position:absolute;top:-60px;right:-60px;
  width:240px;height:240px;
  background:radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
  pointer-events:none;
}
.uw-hero-greeting { font-size:12px;color:#6B7280;font-weight:500;margin-bottom:5px; }
.uw-hero-name { font-size:22px;font-weight:700;color:#F9FAFB;margin-bottom:4px; }
.uw-hero-sub { font-size:13px;color:#9CA3AF; }
.uw-hero-right { display:flex;gap:16px;z-index:1; }
.uw-hero-kpi {
  text-align:center;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:12px;padding:12px 18px;
}
.uw-hero-kpi-val { font-size:26px;font-weight:700;color:#F9FAFB;font-family:'DM Mono',monospace; }
.uw-hero-kpi-label { font-size:10px;color:#6B7280;margin-top:3px;text-transform:uppercase;letter-spacing:0.5px; }

/* ── ROLE LEGEND ── */
.uw-role-legend {
  display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;
}
.uw-role-pill {
  display:flex;align-items:center;gap:7px;
  padding:7px 14px;border-radius:30px;
  border:1px solid;font-size:12px;font-weight:600;
  cursor:pointer;transition:all 0.15s;
}
.uw-role-pill-dot { width:8px;height:8px;border-radius:50%; }
.uw-role-count {
  font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;
  font-family:'DM Mono',monospace;
}

/* ── FILTER TABS ── */
.uw-filter-row { display:flex;gap:6px;margin-bottom:20px;align-items:center; }
.uw-filter-label { font-size:12px;color:#9CA3AF;margin-right:4px; }
.uw-filter-tab {
  padding:5px 14px;border-radius:20px;font-size:12px;font-weight:500;
  cursor:pointer;transition:all 0.15s;border:1px solid transparent;
}
.uw-filter-tab.active { background:#111827;color:#fff;border-color:#111827; }
.uw-filter-tab:not(.active) { background:#fff;color:#6B7280;border-color:#E5E7EB; }
.uw-filter-tab:not(.active):hover { border-color:#D1D5DB;color:#374151; }

/* ── CYCLE CARD ── */
.uw-cycle-card {
  background:#fff;border-radius:16px;border:1px solid #E5E7EB;
  margin-bottom:16px;overflow:hidden;
  transition:box-shadow 0.2s;
}
.uw-cycle-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.07); }

.uw-cycle-header {
  padding:18px 22px;
  display:flex;align-items:center;gap:14px;
  cursor:pointer;
  border-bottom:1px solid #F3F4F6;
  position:relative;
}
.uw-cycle-framework-icon {
  width:42px;height:42px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
}
.uw-cycle-meta { flex:1;min-width:0; }
.uw-cycle-top-row { display:flex;align-items:center;gap:8px;margin-bottom:3px; }
.uw-cycle-name { font-size:15px;font-weight:700;color:#111827; }
.uw-cycle-id { font-size:10px;color:#9CA3AF;font-family:'DM Mono',monospace; }
.uw-cycle-sub { font-size:12px;color:#6B7280;display:flex;align-items:center;gap:8px; }

/* MY ROLE CHIP — prominent */
.uw-my-role {
  display:flex;align-items:center;gap:6px;
  padding:5px 12px;border-radius:8px;
  font-size:12px;font-weight:700;flex-shrink:0;
  border:1.5px solid;
}
.uw-my-role-label { font-size:9px;opacity:0.7;display:block;margin-bottom:1px;text-transform:uppercase;letter-spacing:0.5px; }
.uw-my-role-val { font-size:12px;font-weight:700; }

.uw-cycle-right { display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0; }
.uw-phase-chip {
  font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;
  font-family:'DM Mono',monospace;
}
.uw-cycle-chevron { font-size:12px;color:#9CA3AF;transition:transform 0.2s; }
.uw-cycle-chevron.open { transform:rotate(180deg); }

/* PROGRESS ROW IN HEADER */
.uw-header-progress { display:flex;align-items:center;gap:8px;margin-top:6px; }
.uw-header-progress-track { flex:1;height:4px;background:#F3F4F6;border-radius:4px;overflow:hidden; }
.uw-header-progress-fill { height:100%;border-radius:4px; }
.uw-header-progress-pct { font-size:11px;font-weight:700;font-family:'DM Mono',monospace; }

/* CYCLE BODY */
.uw-cycle-body { padding:0; }

/* MY WORK STATS */
.uw-my-work-bar {
  display:flex;gap:0;border-bottom:1px solid #F3F4F6;
}
.uw-work-stat {
  flex:1;padding:14px 20px;text-align:center;
  border-right:1px solid #F3F4F6;
}
.uw-work-stat:last-child { border-right:none; }
.uw-work-stat-val { font-size:20px;font-weight:700;font-family:'DM Mono',monospace; }
.uw-work-stat-label { font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-top:2px; }

/* TASKS */
.uw-tasks-header {
  padding:12px 22px 8px;
  display:flex;justify-content:space-between;align-items:center;
}
.uw-tasks-title { font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px; }
.uw-tasks-action { font-size:11px;font-weight:600;cursor:pointer; }

.uw-task-item {
  display:flex;align-items:center;gap:12px;
  padding:11px 22px;
  border-top:1px solid #F9FAFB;
  transition:background 0.12s;
  cursor:pointer;
}
.uw-task-item:hover { background:#FAFAFA; }
.uw-task-type-icon {
  width:30px;height:30px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;flex-shrink:0;
}
.uw-task-label { font-size:12px;color:#374151;flex:1;line-height:1.4; }
.uw-task-due { font-size:11px;font-weight:500;flex-shrink:0; }
.uw-task-priority {
  font-size:9px;font-weight:700;padding:2px 7px;
  border-radius:4px;flex-shrink:0;
  font-family:'DM Mono',monospace;
  letter-spacing:0.3px;
}
.uw-task-check {
  width:18px;height:18px;border-radius:5px;
  border:1.5px solid #D1D5DB;flex-shrink:0;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all 0.15s;
}
.uw-task-check.done { background:#6366F1;border-color:#6366F1;color:#fff;font-size:9px; }

.uw-cycle-footer {
  padding:12px 22px;
  border-top:1px solid #F3F4F6;
  display:flex;gap:8px;
}
.uw-enter-btn {
  flex:1;padding:9px;border-radius:9px;
  font-size:13px;font-weight:700;cursor:pointer;
  border:none;font-family:'DM Sans',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all 0.15s;
}
.uw-enter-btn:hover { opacity:0.9;transform:translateY(-1px); }
.uw-view-btn {
  padding:9px 16px;border-radius:9px;
  font-size:12px;font-weight:600;cursor:pointer;
  border:1px solid #E5E7EB;background:#fff;color:#6B7280;
  font-family:'DM Sans',sans-serif;transition:all 0.15s;
}
.uw-view-btn:hover { border-color:#9CA3AF;color:#374151; }

/* EMPTY STATE */
.uw-empty {
  text-align:center;padding:48px 24px;color:#9CA3AF;
}
.uw-empty-icon { font-size:36px;margin-bottom:10px; }
.uw-empty-text { font-size:14px; }

/* RIGHT PANEL (summary sidebar) */
.uw-layout { display:grid;grid-template-columns:1fr 280px;gap:18px; }

.uw-summary-panel { display:flex;flex-direction:column;gap:14px; }

.uw-panel-card {
  background:#fff;border-radius:14px;border:1px solid #E5E7EB;overflow:hidden;
}
.uw-panel-header {
  padding:14px 18px;border-bottom:1px solid #F3F4F6;
  font-size:13px;font-weight:600;color:#111827;
}
.uw-panel-body { padding:10px 18px; }

/* MINI TASK LIST */
.uw-mini-task {
  display:flex;align-items:flex-start;gap:8px;
  padding:8px 0;border-bottom:1px solid #F9FAFB;
}
.uw-mini-task:last-child { border-bottom:none; }
.uw-mini-dot { width:6px;height:6px;border-radius:50%;margin-top:5px;flex-shrink:0; }
.uw-mini-text { font-size:11px;color:#374151;flex:1;line-height:1.4; }
.uw-mini-fw { font-size:10px;font-weight:600;margin-top:2px; }

/* TODAY URGENT */
.uw-urgent-count {
  font-size:32px;font-weight:700;font-family:'DM Mono',monospace;
  color:#DC2626;
}
.uw-urgent-label { font-size:11px;color:#9CA3AF;margin-top:2px; }
.uw-urgent-list { margin-top:8px; }
.uw-urgent-item {
  display:flex;align-items:center;gap:6px;padding:5px 0;
  font-size:11px;color:#374151;border-bottom:1px solid #F9FAFB;
}
.uw-urgent-item:last-child { border-bottom:none; }
.uw-urgent-fw-chip {
  font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;flex-shrink:0;
}

/* ROLE BREAKDOWN */
.uw-role-bar-row { display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #F9FAFB; }
.uw-role-bar-row:last-child { border-bottom:none; }
.uw-role-bar-icon { font-size:14px;flex-shrink:0; }
.uw-role-bar-label { font-size:11px;color:#374151;flex:1; }
.uw-role-bar-track { width:60px;height:5px;background:#F3F4F6;border-radius:4px;overflow:hidden; }
.uw-role-bar-fill { height:100%;border-radius:4px; }
.uw-role-bar-val { font-size:11px;font-weight:700;font-family:'DM Mono',monospace;width:20px;text-align:right;flex-shrink:0; }
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function UnifiedUserDashboard() {
  const [expanded, setExpanded] = useState({ 0: true, 1: true, 2: false });
  const [checked, setChecked] = useState({});
  const [filter, setFilter] = useState("All");

  const toggleExpand = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));
  const toggleCheck = (id, e) => { e.stopPropagation(); setChecked(p => ({ ...p, [id]: !p[id] })); };

  const allRoles = [...new Set(MY_CYCLES.map(c => c.role))];
  const filters = ["All", ...allRoles];

  const todayTasks = MY_CYCLES.flatMap(c => c.tasks.filter(t => t.due === "Today").map(t => ({ ...t, framework: c.framework, frameworkColor: c.frameworkColor, frameworkBg: c.frameworkBg, role: c.role })));

  const filteredCycles = filter === "All" ? MY_CYCLES : MY_CYCLES.filter(c => c.role === filter);

  // Role task totals
  const roleTaskTotals = allRoles.map(r => ({
    role: r,
    tasks: MY_CYCLES.filter(c => c.role === r).reduce((s, c) => s + c.tasks.length, 0),
    meta: ROLE_META[r],
  }));
  const maxTasks = Math.max(...roleTaskTotals.map(r => r.tasks));

  return (
    <>
      <style>{CSS}</style>
      <div className="uw-root">

        {/* Sidebar */}
        <div className="uw-sidebar">
          <div className="uw-logo">S</div>
          {["⊞", "🏠", "📂", "🔍", "✅"].map((ic, i) => (
            <div key={i} className={`uw-nav-icon ${i === 0 ? 'active' : ''}`}>{ic}</div>
          ))}
          <div className="uw-sidebar-bottom">
            <div className="uw-nav-icon">⚙️</div>
            <div className="uw-user-dot">RS</div>
          </div>
        </div>

        <div className="uw-main">

          {/* Topbar */}
          <div className="uw-topbar">
            <div className="uw-topbar-left">
              <div className="uw-topbar-title">My Dashboard</div>
              <div className="uw-topbar-sep">·</div>
              <div className="uw-topbar-sub">
                {USER.totalCycles} active cycles · {allRoles.length} different roles
              </div>
            </div>
            <div className="uw-topbar-right">
              <div className="uw-topbar-notif">
                🔔 <div className="uw-notif-pip" />
              </div>
              <div className="uw-topbar-user">
                <div className="uw-topbar-avatar">RS</div>
                <div className="uw-topbar-info">
                  <div className="uw-topbar-name">{USER.name}</div>
                  <div className="uw-topbar-roles">{allRoles.join(" · ")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="uw-content">

            {/* Hero */}
            <div className="uw-hero">
              <div className="uw-hero-glow" />
              <div>
                <div className="uw-hero-greeting">Monday, March 23, 2026</div>
                <div className="uw-hero-name">Good morning, Riya 👋</div>
                <div className="uw-hero-sub">
                  You wear <strong style={{ color: '#A5B4FC' }}>{allRoles.length} different hats</strong> across{" "}
                  <strong style={{ color: '#A5B4FC' }}>{USER.totalCycles} audit cycles</strong>. Here's everything in one place.
                </div>
              </div>
              <div className="uw-hero-right">
                <div className="uw-hero-kpi">
                  <div className="uw-hero-kpi-val">{USER.totalPendingTasks}</div>
                  <div className="uw-hero-kpi-label">Pending Tasks</div>
                </div>
                <div className="uw-hero-kpi">
                  <div className="uw-hero-kpi-val">{todayTasks.length}</div>
                  <div className="uw-hero-kpi-label">Due Today</div>
                </div>
                <div className="uw-hero-kpi">
                  <div className="uw-hero-kpi-val">{USER.totalCycles}</div>
                  <div className="uw-hero-kpi-label">Cycles</div>
                </div>
              </div>
            </div>

            {/* Role pills — visual summary of all my roles */}
            <div className="uw-role-legend">
              <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center', marginRight: 4 }}>My roles:</span>
              {MY_CYCLES.map((c, i) => {
                const rm = ROLE_META[c.role];
                return (
                  <div
                    key={i}
                    className="uw-role-pill"
                    style={{ background: rm.lightBg, color: rm.color, borderColor: rm.bg }}
                    onClick={() => setFilter(filter === c.role ? "All" : c.role)}
                  >
                    <div className="uw-role-pill-dot" style={{ background: rm.color }} />
                    <span style={{ fontSize: 11 }}>{c.framework}</span>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>→</span>
                    <span>{rm.icon} {c.role}</span>
                    <div className="uw-role-count" style={{ background: rm.bg, color: rm.color }}>
                      {c.tasks.length}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="uw-layout">
              {/* Cycle cards */}
              <div>
                {/* Filter row */}
                <div className="uw-filter-row">
                  <span className="uw-filter-label">Show:</span>
                  {filters.map(f => (
                    <div key={f} className={`uw-filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                      {f}
                    </div>
                  ))}
                </div>

                {filteredCycles.length === 0 && (
                  <div className="uw-empty">
                    <div className="uw-empty-icon">🔍</div>
                    <div className="uw-empty-text">No cycles match the selected filter.</div>
                  </div>
                )}

                {filteredCycles.map((cycle, ci) => {
                  const rm = ROLE_META[cycle.role];
                  const isOpen = expanded[ci];
                  const pendingTasks = cycle.tasks.filter(t => !checked[t.id]);

                  return (
                    <div key={cycle.id} className="uw-cycle-card">
                      {/* Header */}
                      <div className="uw-cycle-header" onClick={() => toggleExpand(ci)}>
                        <div className="uw-cycle-framework-icon" style={{ background: cycle.frameworkBg }}>
                          {cycle.icon}
                        </div>

                        <div className="uw-cycle-meta">
                          <div className="uw-cycle-top-row">
                            <div className="uw-cycle-name">{cycle.framework}</div>
                            <div className="uw-cycle-id">{cycle.id}</div>
                          </div>
                          <div className="uw-cycle-sub">
                            Year {cycle.year} · {cycle.myStats.done}/{cycle.myStats.total} items complete
                          </div>
                          <div className="uw-header-progress">
                            <div className="uw-header-progress-track">
                              <div
                                className="uw-header-progress-fill"
                                style={{ width: `${cycle.overallProgress}%`, background: rm.color }}
                              />
                            </div>
                            <div className="uw-header-progress-pct" style={{ color: rm.color }}>
                              {cycle.overallProgress}%
                            </div>
                          </div>
                        </div>

                        {/* My role — the key differentiator */}
                        <div
                          className="uw-my-role"
                          style={{ color: rm.color, borderColor: rm.bg, background: rm.lightBg }}
                        >
                          <div>
                            <div className="uw-my-role-label">My role</div>
                            <div className="uw-my-role-val">{rm.icon} {cycle.role}</div>
                          </div>
                        </div>

                        <div className="uw-cycle-right">
                          <div className="uw-phase-chip" style={{ background: cycle.phaseBg, color: cycle.phaseColor }}>
                            {cycle.phase}
                          </div>
                          <div style={{
                            fontSize: 11, fontWeight: 700, color: pendingTasks.length > 0 ? '#DC2626' : '#10B981',
                            background: pendingTasks.length > 0 ? '#FEE2E2' : '#DCFCE7',
                            padding: '2px 8px', borderRadius: 20
                          }}>
                            {pendingTasks.length > 0 ? `${pendingTasks.length} pending` : '✓ All done'}
                          </div>
                          <div className={`uw-cycle-chevron ${isOpen ? 'open' : ''}`}>▼</div>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {isOpen && (
                        <div className="uw-cycle-body">
                          {/* Work stats */}
                          <div className="uw-my-work-bar">
                            {[
                              { val: cycle.myStats.total, label: "Assigned", color: '#111827' },
                              { val: cycle.myStats.done, label: "Completed", color: '#10B981' },
                              { val: cycle.myStats.pending, label: "Remaining", color: '#6366F1' },
                              { val: cycle.tasks.filter(t => t.due === "Today").length, label: "Due Today", color: '#DC2626' },
                            ].map((s, i) => (
                              <div key={i} className="uw-work-stat">
                                <div className="uw-work-stat-val" style={{ color: s.color }}>{s.val}</div>
                                <div className="uw-work-stat-label">{s.label}</div>
                              </div>
                            ))}
                          </div>

                          {/* Task list */}
                          <div className="uw-tasks-header">
                            <div className="uw-tasks-title">My pending tasks</div>
                            <div className="uw-tasks-action" style={{ color: rm.color }}>View all in cycle →</div>
                          </div>
                          {cycle.tasks.map(task => {
                            const pm = PRIORITY_META[task.priority];
                            const tm = TYPE_META[task.type];
                            const isDone = checked[task.id];
                            return (
                              <div key={task.id} className="uw-task-item" style={{ opacity: isDone ? 0.45 : 1 }}>
                                <div
                                  className={`uw-task-check ${isDone ? 'done' : ''}`}
                                  onClick={(e) => toggleCheck(task.id, e)}
                                >
                                  {isDone && '✓'}
                                </div>
                                <div className="uw-task-type-icon" style={{ background: rm.lightBg }}>
                                  {tm.icon}
                                </div>
                                <div className="uw-task-label" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: rm.color, marginRight: 5 }}>
                                    {tm.verb}
                                  </span>
                                  {task.label}
                                </div>
                                <div
                                  className="uw-task-due"
                                  style={{ color: task.due === "Today" ? '#DC2626' : '#9CA3AF' }}
                                >
                                  {task.due === "Today" ? "🔴 Today" : task.due}
                                </div>
                                <div className="uw-task-priority" style={{ background: pm.bg, color: pm.color }}>
                                  {task.priority}
                                </div>
                              </div>
                            );
                          })}

                          {/* Footer CTA */}
                          <div className="uw-cycle-footer">
                            <button
                              className="uw-enter-btn"
                              style={{ background: rm.color, color: '#fff' }}
                            >
                              {rm.icon} Open as {cycle.role}
                            </button>
                            <button className="uw-view-btn">📊 Cycle Overview</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary side panel */}
              <div className="uw-summary-panel">

                {/* Today's urgent */}
                <div className="uw-panel-card">
                  <div className="uw-panel-header">🔴 Due Today</div>
                  <div className="uw-panel-body">
                    <div className="uw-urgent-count">{todayTasks.length}</div>
                    <div className="uw-urgent-label">tasks across all cycles</div>
                    <div className="uw-urgent-list">
                      {todayTasks.map((t, i) => {
                        const rm = ROLE_META[t.role];
                        return (
                          <div key={i} className="uw-urgent-item">
                            <div className="uw-urgent-fw-chip" style={{ background: t.frameworkBg, color: t.frameworkColor }}>
                              {t.framework.split(" ")[0]}
                            </div>
                            <span style={{ flex: 1 }}>{t.label.slice(0, 42)}…</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* My roles breakdown */}
                <div className="uw-panel-card">
                  <div className="uw-panel-header">My Role Distribution</div>
                  <div className="uw-panel-body">
                    {roleTaskTotals.map((r, i) => (
                      <div key={i} className="uw-role-bar-row">
                        <div className="uw-role-bar-icon">{r.meta.icon}</div>
                        <div className="uw-role-bar-label">{r.role}</div>
                        <div className="uw-role-bar-track">
                          <div className="uw-role-bar-fill" style={{ width: `${(r.tasks / maxTasks) * 100}%`, background: r.meta.color }} />
                        </div>
                        <div className="uw-role-bar-val" style={{ color: r.meta.color }}>{r.tasks}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10, lineHeight: 1.5 }}>
                      Your role is determined per cycle by the Compliance Officer. It may differ across frameworks.
                    </div>
                  </div>
                </div>

                {/* All pending tasks flat list */}
                <div className="uw-panel-card">
                  <div className="uw-panel-header">All Pending Tasks</div>
                  <div className="uw-panel-body">
                    {MY_CYCLES.flatMap(c =>
                      c.tasks.filter(t => !checked[t.id]).map(t => ({
                        ...t,
                        framework: c.framework,
                        frameworkBg: c.frameworkBg,
                        frameworkColor: c.frameworkColor,
                        roleColor: ROLE_META[c.role].color,
                      }))
                    ).slice(0, 6).map((t, i) => (
                      <div key={i} className="uw-mini-task">
                        <div className="uw-mini-dot" style={{ background: PRIORITY_META[t.priority].color }} />
                        <div>
                          <div className="uw-mini-text">{t.label.slice(0, 50)}{t.label.length > 50 ? '…' : ''}</div>
                          <div className="uw-mini-fw" style={{ color: t.roleColor }}>
                            {t.framework} · {t.due === "Today" ? "🔴 Today" : t.due}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
