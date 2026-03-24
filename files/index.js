// index.js — Barrel export for the dashboard module
// ─────────────────────────────────────────────────────────
//  Import everything from one place:
//  import { UserDashboard, CycleCard, ROLES } from './dashboard'
// ─────────────────────────────────────────────────────────

// Root
export { default as UserDashboard }        from "./UserDashboard";

// Constants
export * from "./constants/roles";
export { default as GLOBAL_STYLES }        from "./constants/styles";

// Layout
export { default as Sidebar }              from "./components/layout/Sidebar";
export { default as Topbar }               from "./components/layout/Topbar";

// Dashboard sections
export { default as HeroBanner }           from "./components/dashboard/HeroBanner";
export { default as StatsSummary }         from "./components/dashboard/StatsSummary";

// Cycles
export { default as CyclesList }           from "./components/cycles/CyclesList";
export { default as CycleCard }            from "./components/cycles/CycleCard";
export { default as PhaseStrip }           from "./components/cycles/PhaseStrip";
export { default as ControlsBar }          from "./components/cycles/ControlsBar";

// Task items (role-specific)
export { default as TaskItemResolver }         from "./components/tasks/TaskItemResolver";
export { default as EvidenceUploaderTaskItem } from "./components/tasks/EvidenceUploaderTaskItem";
export { default as ReviewerTaskItem }         from "./components/tasks/ReviewerTaskItem";
export { default as ApproverTaskItem }         from "./components/tasks/ApproverTaskItem";

// Right panel
export { default as DeadlinesCard }        from "./components/panel/DeadlinesCard";
export { default as PriorityTasksCard }    from "./components/panel/PriorityTasksCard";
export { default as ActivityFeed }         from "./components/panel/ActivityFeed";
