// components/dashboard/StatsSummary.jsx
// ─────────────────────────────────────────────────────────
//  4-card stat row — computed from all cycles.
//  Receives: cycles (array)
// ─────────────────────────────────────────────────────────

const CSS = `
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 11px;
  transition: box-shadow 0.15s;
}
.stat-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.stat-icon {
  width: 36px; height: 36px;
  border-radius: var(--rm);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.stat-label { font-size: 10px; font-weight: 600; color: var(--hint); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
.stat-value { font-size: 20px; font-weight: 800; color: var(--text); font-family: var(--mono); line-height: 1; }
.stat-sub   { font-size: 10px; color: var(--hint); margin-top: 2px; }
`;

export default function StatsSummary({ cycles = [] }) {
  const totalControls  = cycles.reduce((s, c) => s + c.controls.total,         0);
  const totalEvidence  = cycles.reduce((s, c) => s + c.evidence.total,          0);
  const totalAIPassed  = cycles.reduce((s, c) => s + c.evidence.aiPassed,       0);
  const totalOverdue   = cycles.reduce((s, c) => s + c.controls.overdue,        0);

  const stats = [
    { icon: "🎯", bg: "#EEF2FF", label: "Total Controls",  value: totalControls, sub: "Across all frameworks"  },
    { icon: "📂", bg: "#FFF7ED", label: "Evidence Files",   value: totalEvidence, sub: "All frameworks"         },
    { icon: "🤖", bg: "#F0FDF4", label: "AI Evaluated",     value: totalAIPassed, sub: "Passed AI review"       },
    { icon: "⚠️", bg: "#FEF2F2", label: "Overdue Controls", value: totalOverdue,  sub: "Needs immediate action" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
