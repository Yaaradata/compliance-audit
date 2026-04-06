// components/tasks/EvidenceUploaderTaskItem.jsx
// ─────────────────────────────────────────────────────────
//  Task row rendered when user's role in a cycle is
//  "Evidence Uploader". Shows upload/re-upload actions.
//
//  Receives: task, cycleName, checked, onToggle
// ─────────────────────────────────────────────────────────

import { PRIORITY_META } from "../../constants/roles";

const CSS = `
.eu-task {
  padding: 9px 15px;
  border-top: 1px solid var(--border);
  display: flex; align-items: flex-start; gap: 8px;
  cursor: pointer; transition: background 0.1s;
}
.eu-task:hover { background: var(--surface2); }

.eu-cb {
  width: 15px; height: 15px; border-radius: 4px;
  border: 1.5px solid #D1D5DB; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; cursor: pointer; font-size: 8px;
}
.eu-cb.done { background: #10B981; border-color: #10B981; color: #fff; }

.eu-body  { flex: 1; min-width: 0; }
.eu-title { font-size: 12px; color: var(--text); line-height: 1.4; }
.eu-title.done { text-decoration: line-through; color: var(--hint); }

.eu-meta { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
.eu-cycle { font-size: 9px; color: var(--hint); font-family: var(--mono); }
.eu-action-chip {
  font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px;
  background: #EDE9FE; color: #6D28D9;
}
.eu-reupload-chip {
  font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px;
  background: #FEF2F2; color: #DC2626;
}
.eu-priority {
  font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px;
}
.eu-due { font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; white-space: nowrap; }
`;

const ACTION_CHIP = {
  upload:   { label: "⬆ Upload",      cls: "eu-action-chip"   },
  reupload: { label: "🔁 Re-upload",   cls: "eu-reupload-chip" },
  comment:  { label: "💬 Comment",     cls: "eu-action-chip"   },
};

export default function EvidenceUploaderTaskItem({ task, cycleName, checked, onToggle }) {
  const isDone    = checked;
  const pm        = PRIORITY_META[task.priority];
  const isToday   = task.due === "Today";
  const chip      = ACTION_CHIP[task.type] || ACTION_CHIP["upload"];

  return (
    <>
      <style>{CSS}</style>
      <div className="eu-task" onClick={onToggle}>
        <div className={`eu-cb ${isDone ? "done" : ""}`} onClick={onToggle}>
          {isDone && "✓"}
        </div>
        <div className="eu-body">
          <div className={`eu-title ${isDone ? "done" : ""}`}>{task.title}</div>
          <div className="eu-meta">
            <span className="eu-cycle">{cycleName}</span>
            <span className={chip.cls}>{chip.label}</span>
            <span className="eu-priority" style={{ background: pm.bg, color: pm.color }}>
              {pm.label}
            </span>
          </div>
        </div>
        <div className="eu-due" style={{ color: isToday ? "#EF4444" : "#D97706" }}>
          {isToday ? "Today" : task.due}
        </div>
      </div>
    </>
  );
}
