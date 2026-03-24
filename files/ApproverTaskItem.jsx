// components/tasks/ApproverTaskItem.jsx
// ─────────────────────────────────────────────────────────
//  Task row rendered when user's role in a cycle is
//  "Approver". Shows sign-off / risk acceptance actions.
//
//  Receives: task, cycleName, checked, onToggle
// ─────────────────────────────────────────────────────────

import { PRIORITY_META } from "../../constants/roles";

const CSS = `
.ap-task {
  padding: 9px 15px;
  border-top: 1px solid var(--border);
  cursor: pointer; transition: background 0.1s;
}
.ap-task:hover { background: var(--surface2); }

.ap-task-row { display: flex; align-items: flex-start; gap: 8px; }
.ap-cb {
  width: 15px; height: 15px; border-radius: 4px;
  border: 1.5px solid #D1D5DB; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; cursor: pointer; font-size: 8px;
}
.ap-cb.done { background: #065F46; border-color: #065F46; color: #fff; }

.ap-body  { flex: 1; min-width: 0; }
.ap-title { font-size: 12px; color: var(--text); line-height: 1.4; }
.ap-title.done { text-decoration: line-through; color: var(--hint); }

.ap-meta  { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
.ap-cycle  { font-size: 9px; color: var(--hint); font-family: var(--mono); }
.ap-action { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; }
.ap-action.signoff  { background: #D1FAE5; color: #065F46; }
.ap-action.risk     { background: #FEF3C7; color: #92400E; }
.ap-priority { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; }
.ap-due { font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; white-space: nowrap; }

/* Sign-off button */
.ap-signoff-row { display: flex; gap: 5px; margin-top: 7px; padding-left: 23px; }
.ap-signoff-btn {
  flex: 1; border: none; border-radius: 5px;
  font-size: 10px; font-weight: 700; padding: 6px;
  cursor: pointer; font-family: var(--font);
  background: #065F46; color: #fff; transition: opacity 0.12s;
}
.ap-signoff-btn:hover { opacity: 0.85; }
.ap-flag-btn {
  border: none; border-radius: 5px;
  font-size: 10px; font-weight: 700; padding: 6px 10px;
  cursor: pointer; font-family: var(--font);
  background: #FEF3C7; color: #B45309; transition: opacity 0.12s;
}
.ap-flag-btn:hover { opacity: 0.85; }

/* Signed state */
.ap-signed-state {
  margin-top: 6px; padding-left: 23px;
  font-size: 11px; font-weight: 700; color: #065F46;
}
`;

const getChipProps = (type) => {
  if (type === "risk")    return { label: "🚩 Risk flag", cls: "ap-action risk" };
  return { label: "✍ Sign off", cls: "ap-action signoff" };
};

export default function ApproverTaskItem({ task, cycleName, checked, onToggle }) {
  const isDone  = checked;
  const pm      = PRIORITY_META[task.priority];
  const isToday = task.due === "Today";
  const chip    = getChipProps(task.type);

  return (
    <>
      <style>{CSS}</style>
      <div className="ap-task" onClick={onToggle}>
        <div className="ap-task-row">
          <div className={`ap-cb ${isDone ? "done" : ""}`} onClick={onToggle}>
            {isDone && "✓"}
          </div>
          <div className="ap-body">
            <div className={`ap-title ${isDone ? "done" : ""}`}>{task.title}</div>
            <div className="ap-meta">
              <span className="ap-cycle">{cycleName}</span>
              <span className={chip.cls}>{chip.label}</span>
              <span className="ap-priority" style={{ background: pm.bg, color: pm.color }}>
                {pm.label}
              </span>
            </div>
          </div>
          <div className="ap-due" style={{ color: isToday ? "#EF4444" : "var(--hint)" }}>
            {isToday ? "Today" : task.due}
          </div>
        </div>

        {isDone ? (
          <div className="ap-signed-state">✅ Signed off</div>
        ) : (
          <div className="ap-signoff-row">
            <button className="ap-signoff-btn" onClick={(e) => { e.stopPropagation(); onToggle(e); }}>
              ✍ Sign &amp; Approve
            </button>
            <button className="ap-flag-btn" onClick={(e) => e.stopPropagation()}>
              🚩 Flag
            </button>
          </div>
        )}
      </div>
    </>
  );
}
