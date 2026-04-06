import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rv-root {
    display: flex; height: 100vh;
    background: #F4F6FB;
    font-family: 'Sora', sans-serif;
    color: #1A2035; overflow: hidden;
  }

  .rv-sidebar {
    width: 64px; background: #0F1628;
    display: flex; flex-direction: column;
    align-items: center; padding: 20px 0; gap: 8px; flex-shrink: 0;
  }
  .rv-sidebar-logo {
    width: 36px; height: 36px;
    background: #0369A1; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px; margin-bottom: 16px;
  }
  .rv-sidebar-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4B5A7A; cursor: pointer; transition: all 0.2s; font-size: 18px;
  }
  .rv-sidebar-icon:hover { background: #1E2D4F; color: #fff; }
  .rv-sidebar-icon.active { background: #0C2340; color: #38BDF8; }

  .rv-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .rv-topbar {
    background: #fff; border-bottom: 1px solid #E5E9F2;
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .rv-topbar-left { display: flex; align-items: center; gap: 12px; }
  .rv-topbar-title { font-size: 16px; font-weight: 600; }
  .rv-badge {
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    background: #E0F2FE; color: #0369A1;
  }
  .rv-topbar-right { display: flex; align-items: center; gap: 14px; }
  .rv-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #0369A1, #0284C7);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 600; font-size: 13px;
  }
  .rv-topbar-name { font-size: 13px; font-weight: 500; }
  .rv-topbar-role { font-size: 11px; color: #9CA3AF; }
  .rv-icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #E5E9F2; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px; color: #6B7280; position: relative;
  }
  .rv-notif-dot { position: absolute; top: 7px; right: 7px; width: 6px; height: 6px; background: #0369A1; border-radius: 50%; }

  .rv-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  .rv-hero {
    background: linear-gradient(135deg, #075985 0%, #0369A1 50%, #0284C7 100%);
    border-radius: 16px; padding: 28px 32px; color: #fff;
    margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;
    position: relative; overflow: hidden;
  }
  .rv-hero::before {
    content: ''; position: absolute; top: -40px; right: -20px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
  }
  .rv-hero-greeting { font-size: 13px; color: #BAE6FD; font-weight: 500; margin-bottom: 6px; }
  .rv-hero-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .rv-hero-sub { font-size: 13px; color: #E0F2FE; }
  .rv-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; z-index: 1; }
  .rv-hero-counter {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 12px; padding: 12px 20px;
    text-align: center;
  }
  .rv-hero-count-val { font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .rv-hero-count-label { font-size: 11px; color: #BAE6FD; }

  .rv-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px;
  }
  .rv-stat-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #E5E9F2; }
  .rv-stat-label { font-size: 11px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .rv-stat-value { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .rv-stat-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
  .rv-chip {
    display: inline-block; font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px; margin-top: 8px;
  }

  .rv-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }

  .rv-card { background: #fff; border-radius: 14px; border: 1px solid #E5E9F2; overflow: hidden; margin-bottom: 16px; }
  .rv-card-header {
    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #F3F4F6;
  }
  .rv-card-title { font-size: 14px; font-weight: 600; }
  .rv-card-action { font-size: 12px; color: #0369A1; cursor: pointer; font-weight: 500; }
  .rv-card-body { padding: 0; }

  /* REVIEW ITEM */
  .rv-review-item {
    padding: 16px 20px;
    border-bottom: 1px solid #F3F4F6;
    transition: background 0.15s;
    cursor: pointer;
  }
  .rv-review-item:hover { background: #F8FAFF; }
  .rv-review-item:last-child { border-bottom: none; }
  .rv-review-top { display: flex; align-items: flex-start; gap: 12px; }
  .rv-review-file-icon { font-size: 24px; flex-shrink: 0; }
  .rv-review-info { flex: 1; min-width: 0; }
  .rv-review-name { font-size: 13px; font-weight: 600; color: #1A2035; }
  .rv-review-control { font-size: 11px; color: #6B7280; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
  .rv-review-uploader { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
  .rv-review-meta-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .rv-ai-badge {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    padding: 3px 8px; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
  }
  .rv-priority-chip {
    font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 4px;
  }
  .rv-review-actions { display: flex; gap: 8px; margin-top: 12px; }
  .rv-btn {
    flex: 1; border: none; border-radius: 8px;
    font-size: 12px; font-weight: 600; padding: 8px;
    cursor: pointer; font-family: 'Sora', sans-serif;
    transition: all 0.15s;
  }
  .rv-btn-approve { background: #DCFCE7; color: #15803D; }
  .rv-btn-approve:hover { background: #BBF7D0; }
  .rv-btn-reject { background: #FEE2E2; color: #DC2626; }
  .rv-btn-reject:hover { background: #FECACA; }
  .rv-btn-comment { background: #F3F4F6; color: #374151; }
  .rv-btn-comment:hover { background: #E5E7EB; }

  /* TIMELINE */
  .rv-timeline { padding: 4px 0; }
  .rv-tl-item { display: flex; gap: 12px; padding: 0 20px 16px; position: relative; }
  .rv-tl-item::before {
    content: ''; position: absolute; left: 32px; top: 24px;
    width: 2px; bottom: 0; background: #F3F4F6;
  }
  .rv-tl-item:last-child::before { display: none; }
  .rv-tl-dot {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; flex-shrink: 0; margin-top: 2px; z-index: 1;
  }
  .rv-tl-content { flex: 1; }
  .rv-tl-text { font-size: 12px; color: #374151; line-height: 1.5; }
  .rv-tl-time { font-size: 10px; color: #9CA3AF; margin-top: 2px; }

  /* PROGRESS RINGS */
  .rv-cycle-progress {
    padding: 12px 20px;
    border-bottom: 1px solid #F9FAFB;
    display: flex; align-items: center; gap: 12px;
  }
  .rv-cycle-progress:last-child { border-bottom: none; }
  .rv-cp-icon { font-size: 20px; flex-shrink: 0; }
  .rv-cp-info { flex: 1; }
  .rv-cp-name { font-size: 12px; font-weight: 600; color: #1A2035; }
  .rv-cp-meta { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
  .rv-cp-bar { height: 4px; background: #F3F4F6; border-radius: 4px; overflow: hidden; margin-top: 6px; }
  .rv-cp-fill { height: 100%; border-radius: 4px; }
  .rv-cp-pct { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #0369A1; flex-shrink: 0; }

  /* FILTER TABS */
  .rv-tabs { display: flex; gap: 4px; padding: 12px 20px; border-bottom: 1px solid #F3F4F6; }
  .rv-tab {
    padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
  }
  .rv-tab.active { background: #0369A1; color: #fff; }
  .rv-tab:not(.active) { color: #6B7280; }
  .rv-tab:not(.active):hover { background: #F3F4F6; }

  /* COMMENT BOX */
  .rv-comment-box {
    background: #F8FAFF; border: 1px solid #DBEAFE; border-radius: 8px;
    padding: 8px 12px; margin-top: 8px;
    font-size: 12px; color: #374151; line-height: 1.5;
    font-style: italic;
  }
`;

const REVIEW_ITEMS = [
  {
    icon: "📄", name: "network_diagram_q1.pdf", control: "1.1 · Restrict Internet Access",
    uploader: "Uploaded by R. Sharma · 2h ago", aiScore: 94, aiColor: "#10B981", aiBg: "#DCFCE7",
    priority: "HIGH", priorityBg: "#FEE2E2", priorityColor: "#DC2626",
    comment: "AI flagged: diagram lacks DMZ zone documentation. Verify with uploader."
  },
  {
    icon: "📊", name: "privileged_access_review.xlsx", control: "1.2 · Privileged Account Controls",
    uploader: "Uploaded by K. Joshi · 5h ago", aiScore: 71, aiColor: "#F59E0B", aiBg: "#FEF3C7",
    priority: "MED", priorityBg: "#FEF3C7", priorityColor: "#B45309",
    comment: null
  },
  {
    icon: "📸", name: "patch_mgmt_jan_feb.png", control: "2.2 · Security Updates",
    uploader: "Uploaded by R. Sharma · Yesterday", aiScore: 88, aiColor: "#10B981", aiBg: "#DCFCE7",
    priority: "LOW", priorityBg: "#DCFCE7", priorityColor: "#15803D",
    comment: null
  },
];

const ACTIVITIES = [
  { dot: "#10B981", dotBg: "#DCFCE7", text: "You approved firewall_policy_v3.pdf for control 1.1", time: "1h ago" },
  { dot: "#EF4444", dotBg: "#FEE2E2", text: "You rejected access_log_old.xlsx — outdated data", time: "3h ago" },
  { dot: "#3B82F6", dotBg: "#EFF6FF", text: "R. Sharma re-uploaded mfa_screenshot.png after revision", time: "5h ago" },
  { dot: "#F59E0B", dotBg: "#FEF3C7", text: "ISO 27001 control A.9.1 assigned to you for review", time: "Yesterday" },
];

export default function ReviewerDashboard() {
  const [activeTab, setActiveTab] = useState("Pending");
  const tabs = ["Pending", "Approved", "Rejected", "All"];

  return (
    <>
      <style>{styles}</style>
      <div className="rv-root">
        <div className="rv-sidebar">
          <div className="rv-sidebar-logo">S</div>
          {["🔍", "⊞", "🔍", "✅", "📊"].map((icon, i) => (
            <div key={i} className={`rv-sidebar-icon ${i === 1 ? 'active' : ''}`}>{icon}</div>
          ))}
        </div>

        <div className="rv-main">
          <div className="rv-topbar">
            <div className="rv-topbar-left">
              <div className="rv-topbar-title">Review Queue</div>
              <div className="rv-badge">REVIEWER</div>
            </div>
            <div className="rv-topbar-right">
              <div className="rv-icon-btn">🔔<div className="rv-notif-dot" /></div>
              <div className="rv-avatar">A</div>
              <div>
                <div className="rv-topbar-name">A. Mehta</div>
                <div className="rv-topbar-role">Reviewer</div>
              </div>
            </div>
          </div>

          <div className="rv-content">
            {/* Hero */}
            <div className="rv-hero">
              <div>
                <div className="rv-hero-greeting">Monday, March 23, 2026 · SWIFT CSCF 2026</div>
                <div className="rv-hero-name">Review Dashboard, Arjun 🔍</div>
                <div className="rv-hero-sub">Your manual review is critical to audit integrity — 3 items waiting</div>
              </div>
              <div className="rv-hero-right">
                <div className="rv-hero-counter">
                  <div className="rv-hero-count-val">3</div>
                  <div className="rv-hero-count-label">Pending Reviews</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rv-stats">
              {[
                { label: "Assigned to Me", value: "24", sub: "Across 2 cycles", chip: "3 urgent", chipBg: "#FEE2E2", chipColor: "#DC2626" },
                { label: "Reviewed Today", value: "7", sub: "This session", chip: "On pace", chipBg: "#DCFCE7", chipColor: "#15803D" },
                { label: "Approved", value: "58", sub: "Total this cycle", chip: "84%  approve rate", chipBg: "#EFF6FF", chipColor: "#2563EB" },
                { label: "Rejected", value: "11", sub: "Sent back to uploader", chip: "16% rejection", chipBg: "#FEF3C7", chipColor: "#B45309" },
              ].map((s, i) => (
                <div key={i} className="rv-stat-card">
                  <div className="rv-stat-label">{s.label}</div>
                  <div className="rv-stat-value">{s.value}</div>
                  <div className="rv-stat-sub">{s.sub}</div>
                  <div className="rv-chip" style={{ background: s.chipBg, color: s.chipColor }}>{s.chip}</div>
                </div>
              ))}
            </div>

            <div className="rv-layout">
              {/* Review Queue */}
              <div>
                <div className="rv-card">
                  <div className="rv-card-header">
                    <div className="rv-card-title">Evidence Review Queue</div>
                    <div className="rv-card-action">Prioritize by AI score</div>
                  </div>
                  <div className="rv-tabs">
                    {tabs.map(tab => (
                      <div key={tab} className={`rv-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</div>
                    ))}
                  </div>
                  <div className="rv-card-body">
                    {REVIEW_ITEMS.map((item, i) => (
                      <div key={i} className="rv-review-item">
                        <div className="rv-review-top">
                          <div className="rv-review-file-icon">{item.icon}</div>
                          <div className="rv-review-info">
                            <div className="rv-review-name">{item.name}</div>
                            <div className="rv-review-control">{item.control}</div>
                            <div className="rv-review-uploader">{item.uploader}</div>
                          </div>
                        </div>
                        <div className="rv-review-meta-row">
                          <div className="rv-ai-badge" style={{ background: item.aiBg, color: item.aiColor }}>
                            🤖 AI Score: {item.aiScore}
                          </div>
                          <div className="rv-priority-chip" style={{ background: item.priorityBg, color: item.priorityColor }}>{item.priority}</div>
                        </div>
                        {item.comment && <div className="rv-comment-box">💬 {item.comment}</div>}
                        <div className="rv-review-actions">
                          <button className="rv-btn rv-btn-approve">✓ Approve</button>
                          <button className="rv-btn rv-btn-reject">✕ Reject</button>
                          <button className="rv-btn rv-btn-comment">💬 Comment</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div>
                {/* My Cycle Progress */}
                <div className="rv-card">
                  <div className="rv-card-header">
                    <div className="rv-card-title">My Cycle Progress</div>
                  </div>
                  <div className="rv-card-body">
                    {[
                      { icon: "🏦", name: "SWIFT CSCF 2026", meta: "24 assigned · 21 done", progress: 87, color: "#0369A1" },
                      { icon: "🔐", name: "SOC 2 Type II", meta: "18 assigned · 6 done", progress: 33, color: "#7C3AED" },
                    ].map((c, i) => (
                      <div key={i} className="rv-cycle-progress">
                        <div className="rv-cp-icon">{c.icon}</div>
                        <div className="rv-cp-info">
                          <div className="rv-cp-name">{c.name}</div>
                          <div className="rv-cp-meta">{c.meta}</div>
                          <div className="rv-cp-bar">
                            <div className="rv-cp-fill" style={{ width: `${c.progress}%`, background: c.color }} />
                          </div>
                        </div>
                        <div className="rv-cp-pct">{c.progress}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Activity */}
                <div className="rv-card">
                  <div className="rv-card-header">
                    <div className="rv-card-title">Review Activity</div>
                    <div className="rv-card-action">Full log</div>
                  </div>
                  <div className="rv-card-body" style={{ padding: '16px 0 0' }}>
                    <div className="rv-timeline">
                      {ACTIVITIES.map((a, i) => (
                        <div key={i} className="rv-tl-item">
                          <div className="rv-tl-dot" style={{ background: a.dotBg }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.dot }} />
                          </div>
                          <div className="rv-tl-content">
                            <div className="rv-tl-text">{a.text}</div>
                            <div className="rv-tl-time">{a.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Tips */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', marginBottom: 8 }}>💡 Review Guidance</div>
                  {[
                    "Check evidence date — must be within the audit period",
                    "Verify file matches the control requirement exactly",
                    "AI score < 70 warrants extra scrutiny before approving",
                  ].map((tip, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: '#2563EB', flexShrink: 0 }}>→</span>{tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
