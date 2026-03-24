// components/panel/PriorityTasksCard.jsx
// ─────────────────────────────────────────────────────────
//  Right-panel card showing upcoming tasks.
//  Renders the correct task component per role per cycle.
//
//  Receives:
//    cycles     — array of cycles (with .tasks)
//    cycleRoles — map { cycleId: role }
//    checked    — { taskId: bool }
//    onToggle   — (taskId, e) => void
// ─────────────────────────────────────────────────────────

import TaskItemResolver from "../tasks/TaskItemResolver";

const CSS = `
.ptask-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
.ptask-head  { padding: 11px 15px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.ptask-title { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }
.ptask-link  { font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; }
.ptask-link:hover { text-decoration: underline; }
.ptask-empty { padding: 20px 15px; text-align: center; color: var(--hint); font-size: 12px; }
`;

const DUE_SOON = ["Today", "Mar 24", "Mar 25"];

export default function PriorityTasksCard({ cycles = [], cycleRoles = {}, checked = {}, onToggle }) {
  // Flatten tasks that are due today or very soon, keeping cycle context
  const urgentTasks = cycles.flatMap((cycle) =>
    cycle.tasks
      .filter((t) => DUE_SOON.includes(t.due))
      .map((t) => ({
        ...t,
        cycleName: cycle.name,
        cycleId:   cycle.id,
        userRole:  cycleRoles[cycle.id],
      }))
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ptask-panel">
        <div className="ptask-head">
          <span className="ptask-title">Priority Tasks</span>
          <span className="ptask-link">All tasks →</span>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="ptask-empty">All caught up ✓</div>
        ) : (
          urgentTasks.map((task) => (
            <TaskItemResolver
              key={task.id}
              task={task}
              cycleName={task.cycleName}
              userRole={task.userRole}
              checked={!!checked[task.id]}
              onToggle={(e) => onToggle?.(task.id, e)}
            />
          ))
        )}
      </div>
    </>
  );
}
