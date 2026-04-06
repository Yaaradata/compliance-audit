// components/tasks/ReviewerTaskItem.jsx
// ─────────────────────────────────────────────────────────
//  Task row rendered when user's role in a cycle is
//  "Reviewer". Shows review/approve/reject actions inline.
//
//  Receives: task, cycleName, checked, onToggle
// ─────────────────────────────────────────────────────────

import { PRIORITY_META } from "../../constants/roles";

const CSS = `
.rv-task {
  padding: 9px 15px;
  border-top: 1px solid var(--border);
  cursor: pointer; transition: background 0.1s;
}
.rv-task:hover { background: var(--surface2); }

.rv-task-row  { display: flex; align-items: flex-start; gap: 8px; }
.rv-cb {
  width: 15px; height: 15px; border-radius: 4px;
  border: 1.5px solid #D1D5DB; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; cursor: pointer; font-size: 8px;
}
.rv-cb.done { background: #0369A1; border-color: #0369A1; color: #fff; }

.rv-body  { flex: 1; min-width: 0; }
.rv-title { font-size: 12px; color: var(--text); line-height: 1.4; }
.rv-title.done { text-decoration: line-through; color: var(--hint); }

.rv-meta { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
.rv-cycle  { font-size: 9px; color: var(--hint); font-family: var(--mono); }
.rv-action { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; background: #E0F2FE; color: #0369A1; }
.rv-priority { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; }

.rv-due { font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; white-space: nowrap; }

/* inline quick actions */
.rv-actions {
  display: flex; gap: 5px; margin-top: 7px; padding-left: 23px;
}
.rv-qbtn {
  flex: 1; border: none; border-radius: 5px;
  font-size: 10px; font-weight: 700; padding: 5px;
  cursor: pointer; font-family: var(--font); transition: opacity 0.12s;
}
.rv-qbtn:hover { opacity: 0.8; }
.rv-qbtn.approve  { background: #DCFCE7; color: #15803D; }
.rv-qbtn.reject   { background: #FEE2E2; color: #DC2626; }
.rv-qbtn.comment  { background: #F3F4F6; color: #374151; }
`;

export default function ReviewerTaskItem({ task, cycleName, checked, onToggle }) {
  const isDone  = checked;
  const pm      = PRIORITY_META[task.priority];
  const isToday = task.due === "Today";
  const isSoon  = task.due === "Mar 24" || task.due === "Mar 25";

  return (
    <>
      <style>{CSS}</style>
      <div className="rv-task" onClick={onToggle}>
        <div className="rv-task-row">
          <div className={`rv-cb ${isDone ? "done" : ""}`} onClick={onToggle}>
            {isDone && "✓"}
          </div>
          <div className="rv-body">
            <div className={`rv-title ${isDone ? "done" : ""}`}>{task.title}</div>
            <div className="rv-meta">
              <span className="rv-cycle">{cycleName}</span>
              <span className="rv-action">🔍 Review</span>
              <span className="rv-priority" style={{ background: pm.bg, color: pm.color }}>
                {pm.label}
              </span>
            </div>
          </div>
          <div className="rv-due" style={{ color: isToday ? "#EF4444" : isSoon ? "#D97706" : "var(--hint)" }}>
            {isToday ? "Today" : task.due}
          </div>
        </div>

        {/* Inline quick action buttons — only when not done */}
        {!isDone && (
          <div className="rv-actions">
            <button className="rv-qbtn approve" onClick={(e) => { e.stopPropagation(); onToggle(e); }}>
              ✓ Approve
            </button>
            <button className="rv-qbtn reject"  onClick={(e) => e.stopPropagation()}>
              ✕ Reject
            </button>
            <button className="rv-qbtn comment" onClick={(e) => e.stopPropagation()}>
              💬 Comment
            </button>
          </div>
        )}
      </div>
    </>
  );
}
