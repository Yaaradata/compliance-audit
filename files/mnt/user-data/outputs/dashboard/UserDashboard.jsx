// UserDashboard.jsx
// ─────────────────────────────────────────────────────────
//  ROOT ENTRY POINT
//
//  On login, the app calls getUserWithRoles() which returns
//  the user profile including cycleRoles: { cycleId → role }.
//
//  This component:
//   1. Reads the user's cycleRoles
//   2. Passes cycleRoles down to CyclesList (card-level role badge)
//   3. Passes cycleRoles down to PriorityTasksCard (task-level role component)
//
//  No role-specific logic lives here — each child handles its own.
//  To support a new role: add it to roles.js + create a *TaskItem.jsx
//  + register it in TaskItemResolver.jsx. Done.
// ─────────────────────────────────────────────────────────

import { useState } from "react";

// Constants & data
import GLOBAL_STYLES         from "./constants/styles";
import { MOCK_USER, MOCK_CYCLES, MOCK_ACTIVITY } from "./data/mockData";

// Layout
import Sidebar from "./components/layout/Sidebar";
import Topbar  from "./components/layout/Topbar";

// Dashboard sections
import HeroBanner   from "./components/dashboard/HeroBanner";
import StatsSummary from "./components/dashboard/StatsSummary";

// Cycles
import CyclesList from "./components/cycles/CyclesList";

// Right panel
import DeadlinesCard    from "./components/panel/DeadlinesCard";
import PriorityTasksCard from "./components/panel/PriorityTasksCard";
import ActivityFeed     from "./components/panel/ActivityFeed";

/* ── Layout CSS ─────────────────────────────────────────── */
const LAYOUT_CSS = `
.main-shell { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.scroll-content { flex: 1; overflow-y: auto; padding: 22px 24px; }

/* Body 2-col grid */
.dash-body {
  display: grid;
  grid-template-columns: 1fr 292px;
  gap: 14px;
  align-items: start;
}
.right-panel { display: flex; flex-direction: column; gap: 12px; }
`;

/* ── Role resolver ───────────────────────────────────────
   In production, this would be an API call:
     GET /api/me  →  { user, cycleRoles: { cycleId: role } }
   For now it reads from MOCK_USER.
──────────────────────────────────────────────────────── */
function getUserWithRoles() {
  return {
    user:       MOCK_USER,
    cycleRoles: MOCK_USER.cycleRoles,   // { cycleId → role }
  };
}

/* ── Main component ─────────────────────────────────────── */
export default function UserDashboard() {
  const { user, cycleRoles } = getUserWithRoles();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [checked,   setChecked]   = useState({});   // { taskId: bool }

  const handleToggleTask = (taskId, e) => {
    e?.stopPropagation();
    setChecked((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleEnterCycle = (cycle, userRole) => {
    // In production: router.push(`/cycles/${cycle.id}`)
    // The cycle workspace will re-read userRole and render
    // the role-specific workspace (upload UI / review queue / sign-off).
    alert(`Opening "${cycle.name}" as ${userRole}`);
  };

  // Derived counts for hero banner
  const allTasks       = MOCK_CYCLES.flatMap((c) => c.tasks);
  const todayUnchecked = allTasks.filter((t) => t.due === "Today" && !checked[t.id]);
  const totalDone      = MOCK_CYCLES.reduce((s, c) => s + c.myTasks.completed, 0);

  return (
    <>
      {/* Global styles injected once at root */}
      <style>{GLOBAL_STYLES}</style>
      <style>{LAYOUT_CSS}</style>

      <div className="app">
        {/* ── Sidebar ── */}
        <Sidebar
          user={user}
          activeNav={activeNav}
          onNavChange={setActiveNav}
        />

        {/* ── Main shell ── */}
        <div className="main-shell">
          <Topbar user={user} pageTitle="Dashboard" />

          <div className="scroll-content">
            {/* Welcome hero */}
            <HeroBanner
              user={user}
              cycles={MOCK_CYCLES}
              todayTaskCount={todayUnchecked.length}
              completedCount={totalDone}
            />

            {/* Top stats */}
            <StatsSummary cycles={MOCK_CYCLES} />

            {/* 2-col body */}
            <div className="dash-body">

              {/* Left — cycle cards (role badge + CTA per card) */}
              <CyclesList
                cycles={MOCK_CYCLES}
                cycleRoles={cycleRoles}
                onEnterCycle={handleEnterCycle}
              />

              {/* Right — deadlines / tasks / activity */}
              <div className="right-panel">
                <DeadlinesCard cycles={MOCK_CYCLES} />

                {/* Role-aware task list: each task renders its role component */}
                <PriorityTasksCard
                  cycles={MOCK_CYCLES}
                  cycleRoles={cycleRoles}
                  checked={checked}
                  onToggle={handleToggleTask}
                />

                <ActivityFeed activities={MOCK_ACTIVITY} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
