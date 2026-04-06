// components/panel/ActivityFeed.jsx
// ─────────────────────────────────────────────────────────
//  Right-panel activity log card.
//  Receives: activities (array)
// ─────────────────────────────────────────────────────────

import { FRAMEWORK_META } from "../../constants/roles";

const CSS = `
.af-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
.af-head  { padding: 11px 15px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.af-title { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }
.af-link  { font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; }
.af-link:hover { text-decoration: underline; }

.af-item { padding: 9px 15px; border-top: 1px solid var(--border); display: flex; align-items: flex-start; gap: 8px; }
.af-icon {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
}
.af-body { flex: 1; min-width: 0; }
.af-text { font-size: 11px; color: var(--text); line-height: 1.4; }
.af-bottom { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
.af-cycle-tag { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; font-family: var(--mono); }
.af-time      { font-size: 10px; color: var(--hint); }
`;

export default function ActivityFeed({ activities = [] }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="af-panel">
        <div className="af-head">
          <span className="af-title">Recent Activity</span>
          <span className="af-link">Full log →</span>
        </div>

        {activities.map((a, i) => {
          const fw = FRAMEWORK_META[a.cycleTag] || FRAMEWORK_META["SWIFT"];
          return (
            <div className="af-item" key={i}>
              <div className="af-icon" style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </div>
              <div className="af-body">
                <div className="af-text">{a.text}</div>
                <div className="af-bottom">
                  <span className="af-cycle-tag" style={{ background: fw.bg, color: fw.accent }}>
                    {a.cycle}
                  </span>
                  <span className="af-time">{a.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
