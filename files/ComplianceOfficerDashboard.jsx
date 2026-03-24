import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .co-root {
    display: flex;
    height: 100vh;
    background: #F0F2F7;
    font-family: 'Sora', sans-serif;
    color: #1A2035;
    overflow: hidden;
  }

  /* SIDEBAR */
  .co-sidebar {
    width: 64px;
    background: #0F1628;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    gap: 8px;
    flex-shrink: 0;
  }
  .co-sidebar-logo {
    width: 36px; height: 36px;
    background: #2563EB;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
    margin-bottom: 16px;
  }
  .co-sidebar-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4B5A7A;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 18px;
  }
  .co-sidebar-icon:hover { background: #1E2D4F; color: #fff; }
  .co-sidebar-icon.active { background: #1E3A8A; color: #60A5FA; }

  /* MAIN */
  .co-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* TOPBAR */
  .co-topbar {
    background: #fff;
    border-bottom: 1px solid #E5E9F2;
    padding: 0 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .co-topbar-left { display: flex; align-items: center; gap: 12px; }
  .co-topbar-title { font-size: 16px; font-weight: 600; color: #1A2035; }
  .co-topbar-badge {
    background: #EFF6FF;
    color: #2563EB;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
  }
  .co-topbar-right { display: flex; align-items: center; gap: 16px; }
  .co-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 600; font-size: 13px;
  }
  .co-topbar-name { font-size: 13px; font-weight: 500; color: #374151; }
  .co-topbar-role { font-size: 11px; color: #9CA3AF; }
  .co-icon-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    border: 1px solid #E5E9F2;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px; color: #6B7280;
    position: relative;
  }
  .co-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px;
    background: #EF4444; border-radius: 50%;
  }

  /* CONTENT */
  .co-content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
  }

  /* HERO */
  .co-hero {
    background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%);
    border-radius: 16px;
    padding: 28px 32px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .co-hero::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
  .co-hero::after {
    content: '';
    position: absolute; bottom: -60px; right: 100px;
    width: 150px; height: 150px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
  }
  .co-hero-greeting { font-size: 13px; color: #93C5FD; font-weight: 500; margin-bottom: 6px; }
  .co-hero-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .co-hero-sub { font-size: 13px; color: #BFDBFE; }
  .co-hero-btn {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
    position: relative; z-index: 1;
  }
  .co-hero-btn:hover { background: rgba(255,255,255,0.25); }

  /* STAT CARDS */
  .co-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .co-stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid #E5E9F2;
    position: relative;
    overflow: hidden;
  }
  .co-stat-label { font-size: 12px; color: #6B7280; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .co-stat-value { font-size: 28px; font-weight: 700; color: #1A2035; font-family: 'JetBrains Mono', monospace; }
  .co-stat-sub { font-size: 12px; color: #9CA3AF; margin-top: 4px; }
  .co-stat-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px; margin-top: 8px;
  }
  .co-stat-badge.up { background: #DCFCE7; color: #15803D; }
  .co-stat-badge.warn { background: #FEF3C7; color: #B45309; }
  .co-stat-badge.danger { background: #FEE2E2; color: #DC2626; }
  .co-stat-badge.info { background: #EFF6FF; color: #2563EB; }
  .co-stat-icon {
    position: absolute; top: 16px; right: 16px;
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  /* GRID 2 COL */
  .co-grid2 {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    margin-bottom: 16px;
  }
  .co-grid2-full { grid-column: 1 / -1; }

  /* CARD */
  .co-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #E5E9F2;
    overflow: hidden;
  }
  .co-card-header {
    padding: 18px 20px 14px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #F3F4F6;
  }
  .co-card-title { font-size: 14px; font-weight: 600; color: #1A2035; }
  .co-card-action { font-size: 12px; color: #2563EB; cursor: pointer; font-weight: 500; }
  .co-card-body { padding: 16px 20px; }

  /* CYCLE ROW */
  .co-cycle-row {
    display: flex; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #F9FAFB;
    gap: 12px;
  }
  .co-cycle-row:last-child { border-bottom: none; }
  .co-cycle-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .co-cycle-info { flex: 1; min-width: 0; }
  .co-cycle-name { font-size: 13px; font-weight: 600; color: #1A2035; }
  .co-cycle-meta { font-size: 11px; color: #9CA3AF; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
  .co-progress-bar {
    height: 4px; background: #F3F4F6; border-radius: 4px; overflow: hidden; margin-top: 6px;
  }
  .co-progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
  .co-phase-chip {
    font-size: 10px; font-weight: 600;
    padding: 3px 8px; border-radius: 6px;
    flex-shrink: 0;
  }

  /* ALERT ITEMS */
  .co-alert-item {
    display: flex; gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #F9FAFB;
    align-items: flex-start;
  }
  .co-alert-item:last-child { border-bottom: none; }
  .co-alert-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .co-alert-text { font-size: 12px; color: #374151; line-height: 1.5; }
  .co-alert-time { font-size: 11px; color: #9CA3AF; margin-top: 2px; }

  /* TEAM MEMBER */
  .co-member {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #F9FAFB;
  }
  .co-member:last-child { border-bottom: none; }
  .co-member-av {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: #fff; flex-shrink: 0;
  }
  .co-member-name { font-size: 13px; font-weight: 500; color: #1A2035; }
  .co-member-role { font-size: 11px; color: #9CA3AF; }
  .co-member-status {
    margin-left: auto; font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px;
  }

  /* QUICK ACTION */
  .co-actions {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px;
  }
  .co-action-btn {
    background: #fff;
    border: 1px solid #E5E9F2;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    transition: all 0.2s;
    text-align: left;
  }
  .co-action-btn:hover { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); transform: translateY(-1px); }
  .co-action-icon { font-size: 20px; }
  .co-action-label { font-size: 12px; font-weight: 600; color: #1A2035; }
  .co-action-desc { font-size: 11px; color: #9CA3AF; }

  /* DONUT CHART */
  .co-donut-wrap {
    display: flex; align-items: center; gap: 20px; padding: 8px 0;
  }
  .co-donut-svg { flex-shrink: 0; }
  .co-donut-legend { display: flex; flex-direction: column; gap: 10px; }
  .co-legend-item { display: flex; align-items: center; gap: 8px; }
  .co-legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
  .co-legend-label { font-size: 12px; color: #374151; }
  .co-legend-val { font-size: 12px; font-weight: 700; color: #1A2035; font-family: 'JetBrains Mono', monospace; }

  /* FRAMEWORK BADGE */
  .co-fw-badge {
    display: inline-flex; align-items: center; gap: 6px;
    border-radius: 8px; padding: 4px 10px;
    font-size: 11px; font-weight: 600;
  }
`;

const CYCLES = [
  { name: "SWIFT CSCF 2026", id: "CYC-2026-72A489", phase: "Setup", phaseColor: "#F59E0B", phaseBg: "#FEF3C7", progress: 12, icon: "🏦", iconBg: "#EFF6FF", framework: "SWIFT" },
  { name: "SOC 2 Type II", id: "CYC-2026-853C2E", phase: "Collection", phaseColor: "#2563EB", phaseBg: "#EFF6FF", progress: 45, icon: "🔐", iconBg: "#F0FDF4", framework: "SOC2" },
  { name: "ISO 27001", id: "CYC-2026-B06990", phase: "Review", phaseColor: "#7C3AED", phaseBg: "#EDE9FE", progress: 72, icon: "🛡️", iconBg: "#FEF3C7", framework: "ISO" },
  { name: "PCI-DSS v4.0", id: "CYC-2026-94C70C", phase: "Approval", phaseColor: "#059669", phaseBg: "#DCFCE7", progress: 91, icon: "💳", iconBg: "#FEE2E2", framework: "PCI" },
];

const ALERTS = [
  { color: "#EF4444", text: "3 controls overdue in SWIFT CSCF — deadline was Mar 20", time: "2 hours ago" },
  { color: "#F59E0B", text: "ISO 27001 Review phase stalled — reviewer unassigned for A.9.1", time: "5 hours ago" },
  { color: "#3B82F6", text: "SOC 2 evidence batch uploaded by R. Sharma — awaiting review", time: "Yesterday" },
  { color: "#10B981", text: "PCI-DSS cycle ready for final approver sign-off", time: "Yesterday" },
];

const MEMBERS = [
  { name: "Riya Sharma", role: "Evidence Uploader", initials: "RS", color: "#7C3AED", status: "Active", statusBg: "#EDE9FE", statusColor: "#7C3AED", cycles: 3 },
  { name: "Arjun Mehta", role: "Reviewer", initials: "AM", color: "#2563EB", status: "Active", statusBg: "#EFF6FF", statusColor: "#2563EB", cycles: 2 },
  { name: "Priya Das", role: "Approver", initials: "PD", color: "#059669", status: "Pending", statusBg: "#FEF3C7", statusColor: "#B45309", cycles: 1 },
  { name: "Karan Joshi", role: "Evidence Uploader", initials: "KJ", color: "#DC2626", status: "Active", statusBg: "#EDE9FE", statusColor: "#7C3AED", cycles: 4 },
];

function DonutChart() {
  const data = [
    { label: "Compliant", value: 68, color: "#10B981" },
    { label: "In Progress", value: 22, color: "#3B82F6" },
    { label: "At Risk", value: 7, color: "#F59E0B" },
    { label: "Non-Compliant", value: 3, color: "#EF4444" },
  ];
  const total = 100;
  let offset = 0;
  const r = 52; const cx = 64; const cy = 64;
  const circ = 2 * Math.PI * r;
  const segments = data.map(d => {
    const dash = (d.value / total) * circ;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="co-donut-wrap">
      <svg width="128" height="128" className="co-donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="18" />
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#1A2035" fontSize="16" fontWeight="700" fontFamily="JetBrains Mono">68%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="Sora">Compliant</text>
      </svg>
      <div className="co-donut-legend">
        {data.map((d, i) => (
          <div key={i} className="co-legend-item">
            <div className="co-legend-dot" style={{ background: d.color }} />
            <span className="co-legend-label">{d.label}</span>
            <span className="co-legend-val" style={{ marginLeft: 'auto', paddingLeft: 8 }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComplianceOfficerDashboard() {
  const [activeNav, setActiveNav] = useState(1);

  const navIcons = ["🔍", "⊞", "📋", "✅", "📊", "📁"];

  return (
    <>
      <style>{styles}</style>
      <div className="co-root">
        {/* Sidebar */}
        <div className="co-sidebar">
          <div className="co-sidebar-logo">S</div>
          {navIcons.map((icon, i) => (
            <div key={i} className={`co-sidebar-icon ${activeNav === i ? 'active' : ''}`} onClick={() => setActiveNav(i)}>
              {icon}
            </div>
          ))}
        </div>

        <div className="co-main">
          {/* Topbar */}
          <div className="co-topbar">
            <div className="co-topbar-left">
              <div className="co-topbar-title">Overview Dashboard</div>
              <div className="co-topbar-badge">COMPLIANCE OFFICER</div>
            </div>
            <div className="co-topbar-right">
              <div className="co-icon-btn">🔔<div className="co-notif-dot" /></div>
              <div className="co-icon-btn">🌙</div>
              <div className="co-avatar">S</div>
              <div>
                <div className="co-topbar-name">S. Kapoor</div>
                <div className="co-topbar-role">Compliance Officer</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="co-content">
            {/* Hero */}
            <div className="co-hero">
              <div>
                <div className="co-hero-greeting">Monday, March 23, 2026</div>
                <div className="co-hero-name">Good morning, Sandeep 👋</div>
                <div className="co-hero-sub">You have 4 active audit cycles · 3 items need your attention</div>
              </div>
              <button className="co-hero-btn" onClick={() => {}}>+ New Assessment Cycle</button>
            </div>

            {/* Stat Cards */}
            <div className="co-stats">
              {[
                { label: "Active Cycles", value: "4", sub: "Across 4 frameworks", badge: "2 on track", badgeType: "up", icon: "🔄", iconBg: "#EFF6FF" },
                { label: "Total Controls", value: "347", sub: "Across all cycles", badge: "68% compliant", badgeType: "info", icon: "🎯", iconBg: "#F0FDF4" },
                { label: "Evidence Items", value: "1,204", sub: "Uploaded this cycle", badge: "12 pending review", badgeType: "warn", icon: "📂", iconBg: "#FEF3C7" },
                { label: "Overdue Items", value: "18", sub: "Across 3 cycles", badge: "Action needed", badgeType: "danger", icon: "⚠️", iconBg: "#FEE2E2" },
              ].map((s, i) => (
                <div key={i} className="co-stat-card">
                  <div className="co-stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                  <div className="co-stat-label">{s.label}</div>
                  <div className="co-stat-value">{s.value}</div>
                  <div className="co-stat-sub">{s.sub}</div>
                  <div className={`co-stat-badge ${s.badgeType}`}>{s.badge}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="co-actions">
              {[
                { icon: "➕", label: "Create Cycle", desc: "Start new audit cycle" },
                { icon: "👥", label: "Assign Roles", desc: "Manage team members" },
                { icon: "📊", label: "View Reports", desc: "Compliance reports" },
                { icon: "⚙️", label: "Configure", desc: "Framework settings" },
              ].map((a, i) => (
                <button key={i} className="co-action-btn">
                  <div className="co-action-icon">{a.icon}</div>
                  <div className="co-action-label">{a.label}</div>
                  <div className="co-action-desc">{a.desc}</div>
                </button>
              ))}
            </div>

            <div className="co-grid2">
              {/* Cycles */}
              <div className="co-card">
                <div className="co-card-header">
                  <div className="co-card-title">Active Assessment Cycles</div>
                  <div className="co-card-action">View All →</div>
                </div>
                <div className="co-card-body">
                  {CYCLES.map((c, i) => (
                    <div key={i} className="co-cycle-row">
                      <div className="co-cycle-icon" style={{ background: c.iconBg }}>{c.icon}</div>
                      <div className="co-cycle-info">
                        <div className="co-cycle-name">{c.name}</div>
                        <div className="co-cycle-meta">{c.id}</div>
                        <div className="co-progress-bar">
                          <div className="co-progress-fill" style={{ width: `${c.progress}%`, background: c.phaseColor }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="co-phase-chip" style={{ color: c.phaseColor, background: c.phaseBg }}>{c.phase}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, fontFamily: 'JetBrains Mono' }}>{c.progress}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Compliance Overview */}
                <div className="co-card">
                  <div className="co-card-header">
                    <div className="co-card-title">Compliance Overview</div>
                    <div className="co-card-action">Details</div>
                  </div>
                  <div className="co-card-body">
                    <DonutChart />
                  </div>
                </div>

                {/* Alerts */}
                <div className="co-card">
                  <div className="co-card-header">
                    <div className="co-card-title">⚠️ Attention Required</div>
                    <div className="co-card-action">All alerts</div>
                  </div>
                  <div className="co-card-body">
                    {ALERTS.map((a, i) => (
                      <div key={i} className="co-alert-item">
                        <div className="co-alert-dot" style={{ background: a.color }} />
                        <div>
                          <div className="co-alert-text">{a.text}</div>
                          <div className="co-alert-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="co-card">
              <div className="co-card-header">
                <div className="co-card-title">Team Members</div>
                <div className="co-card-action">Manage Team →</div>
              </div>
              <div className="co-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 24px' }}>
                {MEMBERS.map((m, i) => (
                  <div key={i} className="co-member">
                    <div className="co-member-av" style={{ background: m.color }}>{m.initials}</div>
                    <div>
                      <div className="co-member-name">{m.name}</div>
                      <div className="co-member-role">{m.role} · {m.cycles} cycles</div>
                    </div>
                    <div className="co-member-status" style={{ background: m.statusBg, color: m.statusColor }}>{m.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
