// components/cycles/CyclesList.jsx
// ─────────────────────────────────────────────────────────
//  Renders cycle cards with a filter bar.
//  Receives: cycles (array), cycleRoles (map), onEnterCycle (fn)
// ─────────────────────────────────────────────────────────

import { useState } from "react";
import CycleCard from "./CycleCard";

const CSS = `
.cycles-section {}

.filter-row {
  display: flex; align-items: center;
  gap: 6px; flex-wrap: wrap;
}
.filter-label { font-size: 10px; color: var(--hint); margin-right: 2px; }
.fp {
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600; cursor: pointer;
  transition: all 0.12s; border: 1px solid var(--border);
  background: var(--surface); color: var(--sub); white-space: nowrap;
}
.fp:hover { border-color: var(--border2); color: var(--text); }
.fp.on    { background: var(--accent); color: #fff; border-color: var(--accent); }

.cycles-empty { padding: 24px; text-align: center; color: var(--hint); font-size: 12px; }
`;

const FILTERS = [
  { key: "All",              label: "All"              },
  { key: "Urgent",           label: "Urgent"           },
  { key: "Evidence Uploader",label: "Evidence Uploader"},
  { key: "Reviewer",         label: "Reviewer"         },
  { key: "Approver",         label: "Approver"         },
];

export default function CyclesList({ cycles = [], cycleRoles = {}, onEnterCycle }) {
  const [filter, setFilter] = useState("All");

  const filtered = cycles.filter((c) => {
    if (filter === "All")    return true;
    if (filter === "Urgent") return c.daysLeft <= 5 || c.status === "urgent" || c.status === "needs-attention";
    return cycleRoles[c.id] === filter;
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="cycles-section">

        <div className="sec-head">
          <span className="sec-title">My Audit Cycles</span>
          <div className="filter-row">
            <span className="filter-label">Filter:</span>
            {FILTERS.map((f) => (
              <div
                key={f.key}
                className={`fp ${filter === f.key ? "on" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="cycles-empty">No cycles match this filter.</div>
        ) : (
          filtered.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              userRole={cycleRoles[cycle.id]}
              onEnter={onEnterCycle}
            />
          ))
        )}
      </div>
    </>
  );
}
