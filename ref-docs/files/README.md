# Dashboard — Component Architecture

## Folder Structure

```
dashboard/
│
├── index.js                          ← Barrel export (import everything from here)
├── UserDashboard.jsx                 ← ROOT — role resolver + orchestrator
│
├── constants/
│   ├── roles.js                      ← ROLES enum, ROLE_META, STATUS_META, FRAMEWORK_META
│   └── styles.js                     ← Global CSS injected once at root
│
├── data/
│   └── mockData.js                   ← MOCK_USER, MOCK_CYCLES, MOCK_ACTIVITY
│                                       (replace with API calls in production)
│
├── components/
│   │
│   ├── layout/                       ── SHARED (role-agnostic)
│   │   ├── Sidebar.jsx               ← Left nav — same for all roles
│   │   └── Topbar.jsx                ← Top bar — same for all roles
│   │
│   ├── dashboard/                    ── SHARED (role-agnostic)
│   │   ├── HeroBanner.jsx            ← Welcome strip with KPI counters
│   │   └── StatsSummary.jsx          ← 4-stat card row (controls, evidence, AI, overdue)
│   │
│   ├── cycles/                       ── SHARED (role shown as badge inside card)
│   │   ├── CyclesList.jsx            ← Filter bar + renders CycleCard per cycle
│   │   ├── CycleCard.jsx             ← Full cycle card (identity, progress, controls, CTA)
│   │   ├── PhaseStrip.jsx            ← 4-step phase progress strip
│   │   └── ControlsBar.jsx           ← Segmented control status bar
│   │
│   ├── tasks/                        ── ROLE-SPECIFIC (one component per role)
│   │   ├── TaskItemResolver.jsx      ← Router: role → correct task component ✦
│   │   ├── EvidenceUploaderTaskItem  ← Upload / re-upload / comment actions
│   │   ├── ReviewerTaskItem.jsx      ← Review + inline Approve/Reject/Comment buttons
│   │   └── ApproverTaskItem.jsx      ← Sign-off + Risk flag buttons
│   │
│   └── panel/                        ── RIGHT SIDEBAR PANELS
│       ├── DeadlinesCard.jsx         ← Cycle deadlines with urgency bars
│       ├── PriorityTasksCard.jsx     ← Due-soon tasks (delegates to TaskItemResolver)
│       └── ActivityFeed.jsx          ← Recent activity log
```

---

## How Role Resolution Works

```
Login
  ↓
GET /api/me
  ↓
{ user, cycleRoles: { "CYC-001": "Reviewer", "CYC-002": "Approver" } }
  ↓
UserDashboard.jsx  ←  receives cycleRoles
  ↓
┌─────────────────────────────────────────────┐
│  CyclesList  →  CycleCard                   │
│    cycleRoles[cycle.id] = "Reviewer"        │
│    → shows "My role: Reviewer" badge        │
│    → "Open cycle →" passes role to router   │
└─────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────┐
│  PriorityTasksCard  →  TaskItemResolver     │
│    userRole = "Reviewer"                    │
│    → renders ReviewerTaskItem               │
│    → shows Approve / Reject / Comment btns │
└─────────────────────────────────────────────┘
```

The role never changes the *structure* of the dashboard.
It only changes the **task interaction style** inside each card.

---

## Adding a New Role

1. Add to `constants/roles.js`:
```js
export const ROLES = {
  ...
  QA_ANALYST: "QA Analyst",
};

export const ROLE_META = {
  ...
  [ROLES.QA_ANALYST]: {
    color: "#0891B2", bg: "#CFFAFE", border: "#A5F3FC",
    icon: "🧪", short: "QA",
  },
};
```

2. Create `components/tasks/QAAnalystTaskItem.jsx`
   (copy any existing task item and adjust actions/chips)

3. Register in `components/tasks/TaskItemResolver.jsx`:
```js
import QAAnalystTaskItem from "./QAAnalystTaskItem";

const ROLE_TASK_MAP = {
  ...
  [ROLES.QA_ANALYST]: QAAnalystTaskItem,
};
```

4. Done. No other file needs to change.

---

## Connecting to a Real API

Replace in `data/mockData.js`:
```js
// Before (mock)
export const MOCK_USER = { ... };

// After (real)
export async function fetchUser() {
  const res = await fetch("/api/me");
  return res.json();   // { user, cycleRoles }
}

export async function fetchCycles(userId) {
  const res = await fetch(`/api/cycles?userId=${userId}`);
  return res.json();
}
```

In `UserDashboard.jsx`:
```js
// Replace getUserWithRoles() with:
const { user, cycleRoles } = await fetchUser();
const cycles = await fetchCycles(user.id);
```

Use React Query, SWR, or useEffect + useState for data fetching.

---

## Props Reference

| Component           | Key Props                                            |
|---------------------|------------------------------------------------------|
| UserDashboard       | (none — reads from API/mock internally)              |
| Sidebar             | user, activeNav, onNavChange                         |
| Topbar              | user, pageTitle                                      |
| HeroBanner          | user, cycles, todayTaskCount, completedCount         |
| StatsSummary        | cycles                                               |
| CyclesList          | cycles, cycleRoles, onEnterCycle                     |
| CycleCard           | cycle, userRole, onEnter                             |
| PhaseStrip          | phaseIndex (0–3)                                     |
| ControlsBar         | controls { total, compliant, inReview, pending, overdue } |
| TaskItemResolver    | task, cycleName, userRole, checked, onToggle         |
| PriorityTasksCard   | cycles, cycleRoles, checked, onToggle                |
| DeadlinesCard       | cycles                                               |
| ActivityFeed        | activities                                           |
