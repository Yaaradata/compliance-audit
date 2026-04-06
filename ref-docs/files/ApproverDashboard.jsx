import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ap-root {
    display: flex; height: 100vh;
    background: #F3F5F0;
    font-family: 'Sora', sans-serif;
    color: #1A2035; overflow: hidden;
  }

  .ap-sidebar {
    width: 64px; background: #0F1628;
    display: flex; flex-direction: column;
    align-items: center; padding: 20px 0; gap: 8px; flex-shrink: 0;
  }
  .ap-sidebar-logo {
    width: 36px; height: 36px; background: #059669;
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; color: #fff; font-weight: 700; font-size: 14px; margin-bottom: 16px;
  }
  .ap-sidebar-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4B5A7A; cursor: pointer; transition: all 0.2s; font-size: 18px;
  }
  .ap-sidebar-icon:hover { background: #1E2D4F; color: #fff; }
  .ap-sidebar-icon.active { background: #052E16; color: #4ADE80; }

  .ap-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .ap-topbar {
    background: #fff; border-bottom: 1px solid #E5E9F2;
    padding: 0 32px; height: 60px;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .ap-topbar-left { display: flex; align-items: center; gap: 12px; }
  .ap-topbar-title { font-size: 16px; font-weight: 600; }
  .ap-badge {
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    background: #DCFCE7; color: #15803D;
  }
  .ap-topbar-right { display: flex; align-items: center; gap: 14px; }
  .ap-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #059669, #047857);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 600; font-size: 13px;
  }
  .ap-topbar-name { font-size: 13px; font-weight: 500; }
  .ap-topbar-role { font-size: 11px; color: #9CA3AF; }
  .ap-icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1px solid #E5E9F2; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px; color: #6B7280; position: relative;
  }
  .ap-notif-dot { position: absolute; top: 7px; right: 7px; width: 6px; height: 6px; background: #059669; border-radius: 50%; }

  .ap-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  /* HERO */
  .ap-hero {
    background: linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%);
    border-radius: 16px; padding: 28px 32px; color: #fff;
    margin-bottom: 24px;
    position: relative; overflow: hidden;
  }
  .ap-hero::before {
    content: ''; position: absolute; top: -30px; right: -20px;
    width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%;
  }
  .ap-hero::after {
    content: ''; position: absolute; bottom: -50px; right: 200px;
    width: 120px; height: 120px; background: rgba(255,255,255,0.04); border-radius: 50%;
  }
  .ap-hero-inner { display: flex; justify-content: space-between; align-items: center; }
  .ap-hero-greeting { font-size: 13px; color: #6EE7B7; font-weight: 500; margin-bottom: 6px; }
  .ap-hero-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .ap-hero-sub { font-size: 13px; color: #A7F3D0; }
  .ap-hero-pills { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .ap-hero-pill {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px; padding: 8px 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .ap-hero-pill-val { font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ap-hero-pill-label { font-size: 10px; color: #A7F3D0; }
  .ap-hero-btn {
    background: #ECFDF5; color: #065F46;
    border: none; padding: 10px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    font-family: 'Sora', sans-serif;
    z-index: 1; position: relative;
    transition: all 0.2s;
  }
  .ap-hero-btn:hover { background: #D1FAE5; }

  .ap-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px;
  }
  .ap-stat-card { background: #fff; border-radius: 14px; padding: 20px; border: 1px solid #E5E9F2; }
  .ap-stat-label { font-size: 11px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .ap-stat-value { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ap-stat-sub { font-size: 11px; color: #9CA3AF; margin-top: 4px; }
  .ap-chip {
    display: inline-block; font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px; margin-top: 8px;
  }

  .ap-layout { display: grid; grid-template-columns: 1fr 340px; gap: 16px; }

  .ap-card { background: #fff; border-radius: 14px; border: 1px solid #E5E9F2; overflow: hidden; margin-bottom: 16px; }
  .ap-card-header {
    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #F3F4F6;
  }
  .ap-card-title { font-size: 14px; font-weight: 600; }
  .ap-card-action { font-size: 12px; color: #059669; cursor: pointer; font-weight: 500; }
  .ap-card-body { padding: 0; }

  /* APPROVAL ITEM */
  .ap-approval-item {
    padding: 18px 20px;
    border-bottom: 1px solid #F3F4F6;
  }
  .ap-approval-item:last-child { border-bottom: none; }
  .ap-ap-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
  .ap-framework-badge {
    padding: 2px 10px; border-radius: 6px;
    font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
  }
  .ap-ap-title { font-size: 14px; font-weight: 600; color: #1A2035; }
  .ap-ap-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
  .ap-ap-metrics {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 8px; margin-bottom: 12px;
  }
  .ap-metric-box {
    background: #F9FAFB; border-radius: 8px; padding: 8px;
    text-align: center; border: 1px solid #F3F4F6;
  }
  .ap-metric-val { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ap-metric-label { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
  .ap-ap-progress { margin-bottom: 12px; }
  .ap-ap-progress-label {
    display: flex; justify-content: space-between;
    font-size: 11px; color: #6B7280; margin-bottom: 4px;
  }
  .ap-progress-track { height: 6px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
  .ap-progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
  .ap-ap-reviewer {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: #6B7280; margin-bottom: 12px;
  }
  .ap-reviewer-av {
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 600; color: #fff;
  }
  .ap-ap-btns { display: flex; gap: 8px; }
  .ap-btn {
    border: none; border-radius: 8px;
    font-size: 12px; font-weight: 600; padding: 9px 16px;
    cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.15s;
  }
  .ap-btn-sign { background: #059669; color: #fff; flex: 1; }
  .ap-btn-sign:hover { background: #047857; }
  .ap-btn-flag { background: #FEF3C7; color: #B45309; }
  .ap-btn-flag:hover { background: #FDE68A; }
  .ap-btn-view { background: #F3F4F6; color: #374151; }
  .ap-btn-view:hover { background: #E5E7EB; }

  /* SIGN LOG */
  .ap-signlog-item {
    padding: 12px 20px; border-bottom: 1px solid #F9FAFB;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .ap-signlog-item:last-child { border-bottom: none; }
  .ap-signlog-icon { font-size: 18px; flex-shrink: 0; }
  .ap-signlog-text { font-size: 12px; color: #374151; flex: 1; line-height: 1.5; }
  .ap-signlog-time { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
  .ap-signlog-sig {
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    color: #059669; flex-shrink: 0;
    background: #DCFCE7; padding: 2px 6px; border-radius: 4px;
  }

  /* RISK SUMMARY */
  .ap-risk-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid #F9FAFB;
  }
  .ap-risk-row:last-child { border-bottom: none; }
  .ap-risk-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .ap-risk-name { font-size: 12px; color: #374151; flex: 1; }
  .ap-risk-val { font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ap-risk-badge {
    font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; flex-shrink: 0;
  }

  /* LEGAL NOTICE */
  .ap-legal {
    background: #FFFBEB; border: 1px solid #FDE68A;
    border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;
  }
  .ap-legal-title { font-size: 11px; font-weight: 700; color: #B45309; margin-bottom: 4px; }
  .ap-legal-text { font-size: 11px; color: #78350F; line-height: 1.5; }
`;

const APPROVALS = [
  {
    framework: "PCI-DSS", fwBg: "#FEE2E2", fwColor: "#DC2626",
    title: "PCI-DSS v4.0 Assessment Cycle",
    sub: "CYC-2026-94C70C · Year 2026 · Created 3/12/2026",
    controls: 142, compliant: 136, evidence: 412, reviewed: 412,
    progress: 96, progressColor: "#059669",
    reviewer: { name: "A. Mehta", initials: "AM", color: "#2563EB" },
    ready: true,
  },
  {
    framework: "ISO 27001", fwBg: "#EDE9FE", fwColor: "#7C3AED",
    title: "ISO 27001 Assessment Cycle",
    sub: "CYC-2026-B06990 · Year 2026 · Created 3/12/2026",
    controls: 114, compliant: 98, evidence: 287, reviewed: 265,
    progress: 72, progressColor: "#7C3AED",
    reviewer: { name: "A. Mehta", initials: "AM", color: "#2563EB" },
    ready: false,
  },
];

const SIGN_LOG = [
  { icon: "✅", text: "You signed off SWIFT CSCF 2025 — all 48 controls approved", time: "Jan 15, 2026", sig: "APPR-2025-001" },
  { icon: "🚩", text: "Flagged SOC 2 2025 — 3 high-risk controls pending remediation", time: "Dec 3, 2025", sig: null },
  { icon: "✅", text: "You signed off PCI-DSS 2025 — submitted to QSA", time: "Nov 20, 2025", sig: "APPR-2025-002" },
];

const RISKS = [
  { dot: "#EF4444", name: "Unresolved findings in ISO A.12.6", val: "3", badge: "HIGH", badgeBg: "#FEE2E2", badgeColor: "#DC2626" },
  { dot: "#F59E0B", name: "2 controls missing evidence — SWIFT 2.1", val: "2", badge: "MED", badgeBg: "#FEF3C7", badgeColor: "#B45309" },
  { dot: "#3B82F6", name: "Reviewer note pending resolution", val: "1", badge: "LOW", badgeBg: "#EFF6FF", badgeColor: "#2563EB" },
];

export default function ApproverDashboard() {
  const [signed, setSigned] = useState([false, false]);

  const handleSign = (i) => {
    const next = [...signed];
    next[i] = true;
    setSigned(next);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ap-root">
        <div className="ap-sidebar">
          <div className="ap-sidebar-logo">S</div>
          {["🔍", "⊞", "✅", "📜", "📊"].map((icon, i) => (
            <div key={i} className={`ap-sidebar-icon ${i === 1 ? 'active' : ''}`}>{icon}</div>
          ))}
        </div>

        <div className="ap-main">
          <div className="ap-topbar">
            <div className="ap-topbar-left">
              <div className="ap-topbar-title">Approval Dashboard</div>
              <div className="ap-badge">APPROVER</div>
            </div>
            <div className="ap-topbar-right">
              <div className="ap-icon-btn">🔔<div className="ap-notif-dot" /></div>
              <div className="ap-avatar">P</div>
              <div>
                <div className="ap-topbar-name">P. Das</div>
                <div className="ap-topbar-role">Approver · CISO</div>
              </div>
            </div>
          </div>

          <div className="ap-content">
            {/* Hero */}
            <div className="ap-hero">
              <div className="ap-hero-inner">
                <div>
                  <div className="ap-hero-greeting">Monday, March 23, 2026 · Final Approval Stage</div>
                  <div className="ap-hero-name">Approval Center, Priya ✍️</div>
                  <div className="ap-hero-sub">Your sign-off finalizes the audit — review all findings before approving</div>
                  <div className="ap-hero-pills">
                    {[
                      { val: "2", label: "Awaiting Sign-off" },
                      { val: "1", label: "Ready Now" },
                      { val: "3", label: "Risk Flags" },
                    ].map((p, i) => (
                      <div key={i} className="ap-hero-pill">
                        <div>
                          <div className="ap-hero-pill-val">{p.val}</div>
                          <div className="ap-hero-pill-label">{p.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="ap-hero-btn">📋 Generate Report</button>
              </div>
            </div>

            {/* Stats */}
            <div className="ap-stats">
              {[
                { label: "Pending Approvals", value: "2", sub: "PCI-DSS & ISO 27001", chip: "1 ready now", chipBg: "#DCFCE7", chipColor: "#15803D" },
                { label: "Completed Sign-offs", value: "6", sub: "This year", chip: "2025 cycles done", chipBg: "#EFF6FF", chipColor: "#2563EB" },
                { label: "Risk Flags", value: "3", sub: "Across active cycles", chip: "Review before signing", chipBg: "#FEE2E2", chipColor: "#DC2626" },
                { label: "Avg Cycle Time", value: "41d", sub: "From creation to approval", chip: "Industry avg: 52d", chipBg: "#FEF3C7", chipColor: "#B45309" },
              ].map((s, i) => (
                <div key={i} className="ap-stat-card">
                  <div className="ap-stat-label">{s.label}</div>
                  <div className="ap-stat-value">{s.value}</div>
                  <div className="ap-stat-sub">{s.sub}</div>
                  <div className="ap-chip" style={{ background: s.chipBg, color: s.chipColor }}>{s.chip}</div>
                </div>
              ))}
            </div>

            <div className="ap-layout">
              {/* Approval Queue */}
              <div>
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">Cycles Awaiting Your Sign-off</div>
                    <div className="ap-card-action">Download summary</div>
                  </div>
                  <div className="ap-card-body">
                    {APPROVALS.map((a, i) => (
                      <div key={i} className="ap-approval-item">
                        <div className="ap-ap-header">
                          <div className="ap-framework-badge" style={{ background: a.fwBg, color: a.fwColor }}>{a.framework}</div>
                          <div>
                            <div className="ap-ap-title">{a.title}</div>
                            <div className="ap-ap-sub">{a.sub}</div>
                          </div>
                        </div>

                        <div className="ap-ap-metrics">
                          {[
                            { val: a.controls, label: "Controls" },
                            { val: a.compliant, label: "Compliant" },
                            { val: a.evidence, label: "Evidence" },
                            { val: a.reviewed, label: "Reviewed" },
                          ].map((m, j) => (
                            <div key={j} className="ap-metric-box">
                              <div className="ap-metric-val">{m.val}</div>
                              <div className="ap-metric-label">{m.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="ap-ap-progress">
                          <div className="ap-ap-progress-label">
                            <span>Review completeness</span>
                            <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: a.progressColor }}>{a.progress}%</span>
                          </div>
                          <div className="ap-progress-track">
                            <div className="ap-progress-fill" style={{ width: `${a.progress}%`, background: a.progressColor }} />
                          </div>
                        </div>

                        <div className="ap-ap-reviewer">
                          <div className="ap-reviewer-av" style={{ background: a.reviewer.color }}>{a.reviewer.initials}</div>
                          Reviewed by {a.reviewer.name}
                          {a.ready && <span style={{ color: '#059669', fontWeight: 600 }}>· ✓ Ready for sign-off</span>}
                          {!a.ready && <span style={{ color: '#B45309', fontWeight: 600 }}>· Review in progress</span>}
                        </div>

                        {signed[i] ? (
                          <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#15803D', textAlign: 'center' }}>
                            ✅ Signed off — Audit finalized
                          </div>
                        ) : (
                          <div className="ap-ap-btns">
                            <button className="ap-btn ap-btn-sign" onClick={() => handleSign(i)} disabled={!a.ready} style={{ opacity: a.ready ? 1 : 0.5, cursor: a.ready ? 'pointer' : 'not-allowed' }}>
                              ✍️ Sign & Approve
                            </button>
                            <button className="ap-btn ap-btn-flag">🚩 Flag Issue</button>
                            <button className="ap-btn ap-btn-view">👁 Full Report</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div>
                {/* Legal Notice */}
                <div className="ap-legal">
                  <div className="ap-legal-title">⚠️ Approver Accountability</div>
                  <div className="ap-legal-text">
                    Your digital sign-off constitutes a formal attestation of compliance. Ensure all high-risk findings are resolved or formally accepted before signing.
                  </div>
                </div>

                {/* Risk Flags */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">Open Risk Flags</div>
                    <div className="ap-card-action">Accept all</div>
                  </div>
                  <div className="ap-card-body" style={{ padding: '8px 20px' }}>
                    {RISKS.map((r, i) => (
                      <div key={i} className="ap-risk-row">
                        <div className="ap-risk-dot" style={{ background: r.dot }} />
                        <div className="ap-risk-name">{r.name}</div>
                        <div className="ap-risk-val">{r.val}</div>
                        <div className="ap-risk-badge" style={{ background: r.badgeBg, color: r.badgeColor }}>{r.badge}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign-off Log */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-card-title">Sign-off History</div>
                    <div className="ap-card-action">Full audit trail</div>
                  </div>
                  <div className="ap-card-body">
                    {SIGN_LOG.map((s, i) => (
                      <div key={i} className="ap-signlog-item">
                        <div className="ap-signlog-icon">{s.icon}</div>
                        <div className="ap-signlog-content" style={{ flex: 1 }}>
                          <div className="ap-signlog-text">{s.text}</div>
                          <div className="ap-signlog-time">{s.time}</div>
                        </div>
                        {s.sig && <div className="ap-signlog-sig">{s.sig}</div>}
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
