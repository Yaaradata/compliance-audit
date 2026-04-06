import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .eu-root {
    display: flex;
    height: 100vh;
    background: #F5F6FA;
    font-family: 'Sora', sans-serif;
    color: #1A2035;
    overflow: hidden;
  }

  .eu-sidebar {
    width: 64px;
    background: #0F1628;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    gap: 8px;
    flex-shrink: 0;
  }
  .eu-sidebar-logo {
    width: 36px; height: 36px;
    background: #7C3AED;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
    margin-bottom: 16px;
  }
  .eu-sidebar-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4B5A7A; cursor: pointer; transition: all 0.2s; font-size: 18px;
  }
  .eu-sidebar-icon:hover { background: #1E2D4F; color: #fff; }
  .eu-sidebar-icon.active { background: #2D1B69; color: #A78BFA; }

  .eu-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .eu-topbar {
    background: #fff;
    border-bottom: 1px solid #E5E9F2;
    padding: 0 32px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .eu-topbar-left { display: flex; align-items: center; gap: 12px; }
  .eu-topbar-title { font-size: 16px; font-weight: 600; }
  .eu-badge {
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
  }
  .eu-topbar-right { display: flex; align-items: center; gap: 14px; }
  .eu-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 600; font-size: 13px;
  }
  .eu-topbar-name { font-size: 13px; font-weight: 500; }
  .eu-topbar-role { font-size: 11px; color: #9CA3AF; }
  .eu-icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #E5E9F2; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px; color: #6B7280; position: relative;
  }
  .eu-notif-dot { position: absolute; top: 7px; right: 7px; width: 6px; height: 6px; background: #7C3AED; border-radius: 50%; }

  .eu-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  /* HERO UPLOAD ZONE */
  .eu-hero {
    background: linear-gradient(135deg, #4C1D95 0%, #6D28D9 60%, #7C3AED 100%);
    border-radius: 16px; padding: 28px 32px;
    color: #fff; margin-bottom: 24px;
    display: flex; justify-content: space-between; align-items: center;
    position: relative; overflow: hidden;
  }
  .eu-hero::before {
    content: ''; position: absolute; top: -30px; right: 60px;
    width: 180px; height: 180px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
  }
  .eu-hero-greeting { font-size: 13px; color: #C4B5FD; font-weight: 500; margin-bottom: 6px; }
  .eu-hero-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .eu-hero-sub { font-size: 13px; color: #DDD6FE; }
  .eu-hero-stats {
    display: flex; gap: 24px; z-index: 1; position: relative;
  }
  .eu-hero-stat { text-align: center; }
  .eu-hero-stat-val { font-size: 24px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .eu-hero-stat-label { font-size: 11px; color: #C4B5FD; }

  .eu-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px;
  }
  .eu-stat-card {
    background: #fff; border-radius: 14px; padding: 20px;
    border: 1px solid #E5E9F2;
  }
  .eu-stat-label { font-size: 11px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .eu-stat-value { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .eu-stat-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
  .eu-chip {
    display: inline-block; font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px; margin-top: 8px;
  }

  .eu-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 16px; }

  .eu-card { background: #fff; border-radius: 14px; border: 1px solid #E5E9F2; overflow: hidden; }
  .eu-card-header {
    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #F3F4F6;
  }
  .eu-card-title { font-size: 14px; font-weight: 600; }
  .eu-card-action { font-size: 12px; color: #7C3AED; cursor: pointer; font-weight: 500; }
  .eu-card-body { padding: 16px 20px; }

  /* UPLOAD DROPZONE */
  .eu-dropzone {
    border: 2px dashed #DDD6FE;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    background: #FAFBFF;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 16px;
  }
  .eu-dropzone:hover { border-color: #7C3AED; background: #F5F3FF; }
  .eu-dropzone-icon { font-size: 32px; margin-bottom: 8px; }
  .eu-dropzone-title { font-size: 14px; font-weight: 600; color: #1A2035; margin-bottom: 4px; }
  .eu-dropzone-sub { font-size: 12px; color: #9CA3AF; }
  .eu-dropzone-btn {
    margin-top: 12px; background: #7C3AED; color: #fff;
    border: none; padding: 8px 20px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: 'Sora', sans-serif;
  }

  /* CONTROL MAPPING */
  .eu-control-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #F9FAFB;
  }
  .eu-control-row:last-child { border-bottom: none; }
  .eu-control-code {
    font-size: 11px; font-weight: 700; padding: 3px 8px;
    border-radius: 6px; font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }
  .eu-control-name { font-size: 12px; color: #374151; flex: 1; }
  .eu-control-count { font-size: 11px; color: #9CA3AF; flex-shrink: 0; }
  .eu-control-status {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  }

  /* EVIDENCE LIST */
  .eu-evidence-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: #F9FAFB; margin-bottom: 8px;
    border: 1px solid #F3F4F6;
  }
  .eu-evidence-icon { font-size: 20px; flex-shrink: 0; }
  .eu-evidence-name { font-size: 12px; font-weight: 600; color: #1A2035; }
  .eu-evidence-meta { font-size: 11px; color: #9CA3AF; }
  .eu-evidence-status {
    margin-left: auto; font-size: 10px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px; flex-shrink: 0;
  }
  .eu-ai-score {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }

  /* CYCLE SELECTOR */
  .eu-cycle-selector {
    display: flex; flex-direction: column; gap: 8px;
  }
  .eu-cycle-card {
    border: 1px solid #E5E9F2; border-radius: 10px;
    padding: 12px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 10px;
  }
  .eu-cycle-card:hover { border-color: #7C3AED; }
  .eu-cycle-card.selected { border-color: #7C3AED; background: #F5F3FF; }
  .eu-cycle-icon-sm { font-size: 20px; }
  .eu-cycle-name-sm { font-size: 13px; font-weight: 600; }
  .eu-cycle-role { font-size: 11px; color: #7C3AED; margin-top: 2px; }
  .eu-cycle-progress-sm {
    margin-left: auto; font-size: 11px;
    font-family: 'JetBrains Mono', monospace; color: #9CA3AF;
  }

  /* AI RESULT */
  .eu-ai-panel {
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
    border: 1px solid #DDD6FE;
    border-radius: 12px; padding: 16px;
    margin-top: 12px;
  }
  .eu-ai-title { font-size: 12px; font-weight: 700; color: #6D28D9; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .eu-ai-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .eu-ai-bar-label { font-size: 11px; color: #374151; width: 90px; flex-shrink: 0; }
  .eu-ai-bar-track { flex: 1; height: 6px; background: #EDE9FE; border-radius: 4px; overflow: hidden; }
  .eu-ai-bar-fill { height: 100%; border-radius: 4px; background: #7C3AED; }
  .eu-ai-bar-val { font-size: 11px; font-weight: 700; color: #6D28D9; width: 30px; text-align: right; font-family: 'JetBrains Mono', monospace; }
`;

const MY_CYCLES = [
  { name: "SWIFT CSCF 2026", icon: "🏦", role: "Evidence Uploader", progress: "12 / 48 controls", selected: true },
  { name: "SOC 2 Type II", icon: "🔐", role: "Reviewer", progress: "22 / 60 controls", selected: false },
];

const CONTROLS = [
  { code: "1.1", name: "Restrict Internet Access", count: "3 files", status: "#10B981", codeBg: "#DCFCE7", codeColor: "#15803D" },
  { code: "1.2", name: "Privileged Account Controls", count: "1 file", status: "#F59E0B", codeBg: "#FEF3C7", codeColor: "#B45309" },
  { code: "2.1", name: "Internal Data Flow Security", count: "0 files", status: "#EF4444", codeBg: "#FEE2E2", codeColor: "#DC2626" },
  { code: "2.2", name: "Security Updates", count: "2 files", status: "#10B981", codeBg: "#DCFCE7", codeColor: "#15803D" },
  { code: "5.1", name: "Logical Access Controls", count: "4 files", status: "#10B981", codeBg: "#DCFCE7", codeColor: "#15803D" },
  { code: "6.1", name: "Detect Anomalous Activity", count: "0 files", status: "#EF4444", codeBg: "#FEE2E2", codeColor: "#DC2626" },
];

const RECENT = [
  { icon: "📄", name: "firewall_policy_v3.pdf", meta: "1.1 · Uploaded 2h ago · 2.4 MB", status: "AI Reviewed", statusBg: "#EDE9FE", statusColor: "#7C3AED", score: 92 },
  { icon: "📊", name: "access_log_march.xlsx", meta: "5.1 · Uploaded 5h ago · 8.1 MB", status: "Pending", statusBg: "#FEF3C7", statusColor: "#B45309", score: null },
  { icon: "📸", name: "mfa_screenshot.png", meta: "1.2 · Uploaded Yesterday · 450 KB", status: "AI Reviewed", statusBg: "#EDE9FE", statusColor: "#7C3AED", score: 78 },
  { icon: "📝", name: "sec_policy_doc.docx", meta: "2.2 · Uploaded Yesterday · 1.1 MB", status: "Rejected", statusBg: "#FEE2E2", statusColor: "#DC2626", score: 34 },
];

export default function EvidenceUploaderDashboard() {
  const [selectedCycle, setSelectedCycle] = useState(0);
  const navIcons = ["🔍", "⊞", "📂", "🤖", "📊"];

  return (
    <>
      <style>{styles}</style>
      <div className="eu-root">
        <div className="eu-sidebar">
          <div className="eu-sidebar-logo">S</div>
          {navIcons.map((icon, i) => (
            <div key={i} className={`eu-sidebar-icon ${i === 1 ? 'active' : ''}`}>{icon}</div>
          ))}
        </div>

        <div className="eu-main">
          <div className="eu-topbar">
            <div className="eu-topbar-left">
              <div className="eu-topbar-title">My Evidence Workspace</div>
              <div className="eu-badge" style={{ background: '#EDE9FE', color: '#7C3AED' }}>EVIDENCE UPLOADER</div>
            </div>
            <div className="eu-topbar-right">
              <div className="eu-icon-btn">🔔<div className="eu-notif-dot" /></div>
              <div className="eu-avatar">R</div>
              <div>
                <div className="eu-topbar-name">R. Sharma</div>
                <div className="eu-topbar-role">Evidence Uploader</div>
              </div>
            </div>
          </div>

          <div className="eu-content">
            {/* Hero */}
            <div className="eu-hero">
              <div>
                <div className="eu-hero-greeting">Monday, March 23, 2026 · SWIFT CSCF 2026</div>
                <div className="eu-hero-name">Welcome back, Riya 📂</div>
                <div className="eu-hero-sub">6 controls need evidence · AI has reviewed 18 of your uploads</div>
              </div>
              <div className="eu-hero-stats">
                <div className="eu-hero-stat">
                  <div className="eu-hero-stat-val">23</div>
                  <div className="eu-hero-stat-label">Uploaded</div>
                </div>
                <div className="eu-hero-stat">
                  <div className="eu-hero-stat-val">18</div>
                  <div className="eu-hero-stat-label">AI Reviewed</div>
                </div>
                <div className="eu-hero-stat">
                  <div className="eu-hero-stat-val">82%</div>
                  <div className="eu-hero-stat-label">Avg AI Score</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="eu-stats">
              {[
                { label: "Controls Assigned", value: "48", sub: "SWIFT CSCF 2026", chip: "12 complete", chipBg: "#DCFCE7", chipColor: "#15803D" },
                { label: "Files Uploaded", value: "23", sub: "This cycle", chip: "5 this week", chipBg: "#EDE9FE", chipColor: "#7C3AED" },
                { label: "AI Passed", value: "18", sub: "Auto-evaluated", chip: "≥70 score", chipBg: "#EFF6FF", chipColor: "#2563EB" },
                { label: "Needs Attention", value: "5", sub: "Low AI score / rejected", chip: "Re-upload needed", chipBg: "#FEE2E2", chipColor: "#DC2626" },
              ].map((s, i) => (
                <div key={i} className="eu-stat-card">
                  <div className="eu-stat-label">{s.label}</div>
                  <div className="eu-stat-value">{s.value}</div>
                  <div className="eu-stat-sub">{s.sub}</div>
                  <div className="eu-chip" style={{ background: s.chipBg, color: s.chipColor }}>{s.chip}</div>
                </div>
              ))}
            </div>

            <div className="eu-grid">
              {/* Main area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Upload Zone */}
                <div className="eu-card">
                  <div className="eu-card-header">
                    <div className="eu-card-title">Upload Evidence</div>
                    <div className="eu-card-action">View guidelines</div>
                  </div>
                  <div className="eu-card-body">
                    <div className="eu-dropzone">
                      <div className="eu-dropzone-icon">☁️</div>
                      <div className="eu-dropzone-title">Drag & drop evidence files</div>
                      <div className="eu-dropzone-sub">PDF, DOCX, XLSX, PNG, JPG supported · Max 50MB per file</div>
                      <button className="eu-dropzone-btn">Browse Files</button>
                    </div>
                    {/* AI Score Example */}
                    <div className="eu-ai-panel">
                      <div className="eu-ai-title">🤖 AI Evaluation — firewall_policy_v3.pdf</div>
                      {[
                        { label: "Relevance", val: 95 },
                        { label: "Completeness", val: 88 },
                        { label: "Accuracy", val: 92 },
                        { label: "Recency", val: 85 },
                      ].map((b, i) => (
                        <div key={i} className="eu-ai-bar-row">
                          <span className="eu-ai-bar-label">{b.label}</span>
                          <div className="eu-ai-bar-track">
                            <div className="eu-ai-bar-fill" style={{ width: `${b.val}%` }} />
                          </div>
                          <span className="eu-ai-bar-val">{b.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Uploads */}
                <div className="eu-card">
                  <div className="eu-card-header">
                    <div className="eu-card-title">Recent Uploads</div>
                    <div className="eu-card-action">View all →</div>
                  </div>
                  <div className="eu-card-body">
                    {RECENT.map((e, i) => (
                      <div key={i} className="eu-evidence-item">
                        <div className="eu-evidence-icon">{e.icon}</div>
                        <div>
                          <div className="eu-evidence-name">{e.name}</div>
                          <div className="eu-evidence-meta">{e.meta}</div>
                        </div>
                        {e.score && (
                          <div className="eu-ai-score" style={{ color: e.score >= 70 ? '#10B981' : '#EF4444' }}>
                            🤖 {e.score}
                          </div>
                        )}
                        <div className="eu-evidence-status" style={{ background: e.statusBg, color: e.statusColor }}>{e.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* My Cycles */}
                <div className="eu-card">
                  <div className="eu-card-header">
                    <div className="eu-card-title">My Cycle Assignments</div>
                  </div>
                  <div className="eu-card-body">
                    <div className="eu-cycle-selector">
                      {MY_CYCLES.map((c, i) => (
                        <div key={i} className={`eu-cycle-card ${selectedCycle === i ? 'selected' : ''}`} onClick={() => setSelectedCycle(i)}>
                          <div className="eu-cycle-icon-sm">{c.icon}</div>
                          <div>
                            <div className="eu-cycle-name-sm">{c.name}</div>
                            <div className="eu-cycle-role">{c.role}</div>
                          </div>
                          <div className="eu-cycle-progress-sm">{c.progress}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="eu-card">
                  <div className="eu-card-header">
                    <div className="eu-card-title">Controls to Fill</div>
                    <div className="eu-card-action">6 pending</div>
                  </div>
                  <div className="eu-card-body">
                    {CONTROLS.map((c, i) => (
                      <div key={i} className="eu-control-row">
                        <div className="eu-control-code" style={{ background: c.codeBg, color: c.codeColor }}>{c.code}</div>
                        <div className="eu-control-name">{c.name}</div>
                        <div className="eu-control-count">{c.count}</div>
                        <div className="eu-control-status" style={{ background: c.status }} />
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
