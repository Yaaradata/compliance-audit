// components/panel/DeadlinesCard.jsx
// ─────────────────────────────────────────────────────────
//  Right-panel card showing cycle deadlines with urgency bars.
//  Receives: cycles (array)
// ─────────────────────────────────────────────────────────

const CSS = `
.dl-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
.dl-head  { padding: 11px 15px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.dl-title { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }
.dl-link  { font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; }
.dl-link:hover { text-decoration: underline; }

.dl-item { padding: 10px 15px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.dl-body { flex: 1; min-width: 0; }
.dl-name  { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 1px; }
.dl-sub   { font-size: 10px; color: var(--hint); }
.dl-bar   { height: 3px; background: #EEF0F6; border-radius: 2px; overflow: hidden; margin-top: 5px; }
.dl-fill  { height: 100%; border-radius: 2px; }

.dl-counter { text-align: center; flex-shrink: 0; }
.dl-num { font-size: 16px; font-weight: 800; font-family: var(--mono); line-height: 1; }
.dl-day-lbl { font-size: 9px; color: var(--hint); margin-top: 1px; }
`;

function getDeadlineColor(daysLeft) {
  if (daysLeft <= 3)  return "#EF4444";
  if (daysLeft <= 10) return "#F59E0B";
  return "#10B981";
}

function getDeadlineLabel(phase) {
  const map = {
    Setup:      "Setup phase closes",
    Collection: "Collection phase closes",
    Review:     "Review deadline",
    Approval:   "Final approval deadline",
  };
  return map[phase] || "Cycle deadline";
}

function getUrgencyRatio(daysLeft) {
  // urgency 0→1 (closer = higher)
  return Math.max(0.05, Math.min(1, 1 - daysLeft / 30));
}

export default function DeadlinesCard({ cycles = [] }) {
  const sorted = [...cycles].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <>
      <style>{CSS}</style>
      <div className="dl-panel">
        <div className="dl-head">
          <span className="dl-title">Upcoming Deadlines</span>
          <span className="dl-link">Calendar →</span>
        </div>

        {sorted.map((cycle) => {
          const color   = getDeadlineColor(cycle.daysLeft);
          const urgency = getUrgencyRatio(cycle.daysLeft);
          return (
            <div className="dl-item" key={cycle.id}>
              <div className="dl-body">
                <div className="dl-name">{cycle.name}</div>
                <div className="dl-sub">{getDeadlineLabel(cycle.phase)}</div>
                <div className="dl-bar">
                  <div className="dl-fill" style={{ width: `${urgency * 100}%`, background: color }} />
                </div>
              </div>
              <div className="dl-counter">
                <div className="dl-num" style={{ color }}>{cycle.daysLeft}</div>
                <div className="dl-day-lbl">days</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
