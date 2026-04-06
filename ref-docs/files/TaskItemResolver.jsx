// components/tasks/TaskItemResolver.jsx
// ─────────────────────────────────────────────────────────
//  Role → Component router.
//  Given a task and the user's role in that cycle,
//  renders the correct role-specific task component.
//
//  Add new roles here and create a matching *TaskItem.jsx.
//
//  Receives:
//    task      — task object
//    cycleName — string
//    userRole  — role string for this cycle
//    checked   — boolean
//    onToggle  — (id, e) => void
// ─────────────────────────────────────────────────────────

import { ROLES } from "../../constants/roles";
import EvidenceUploaderTaskItem from "./EvidenceUploaderTaskItem";
import ReviewerTaskItem         from "./ReviewerTaskItem";
import ApproverTaskItem         from "./ApproverTaskItem";

// Map role → component
const ROLE_TASK_MAP = {
  [ROLES.EVIDENCE_UPLOADER]: EvidenceUploaderTaskItem,
  [ROLES.REVIEWER]:          ReviewerTaskItem,
  [ROLES.APPROVER]:          ApproverTaskItem,
};

// Fallback: plain item for Compliance Officer or unknown roles
function DefaultTaskItem({ task, cycleName, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: "9px 15px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        cursor: "pointer",
        fontSize: 12,
        color: checked ? "var(--hint)" : "var(--text)",
        textDecoration: checked ? "line-through" : "none",
      }}
    >
      <div style={{ flex: 1 }}>{task.title}</div>
      <span style={{ fontSize: 10, color: "var(--hint)" }}>{task.due}</span>
    </div>
  );
}

export default function TaskItemResolver({ task, cycleName, userRole, checked, onToggle }) {
  const TaskComponent = ROLE_TASK_MAP[userRole] || DefaultTaskItem;

  return (
    <TaskComponent
      task={task}
      cycleName={cycleName}
      checked={checked}
      onToggle={onToggle}
    />
  );
}
