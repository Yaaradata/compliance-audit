// components/cycles/CycleCard.jsx
// ─────────────────────────────────────────────────────────
//  Generic cycle card — role-agnostic shell.
//  Shows: identity, status, role badge, controls breakdown,
//         evidence grid, phase progress, task count, CTA.
//
//  Receives:
//    cycle    — cycle data object
//    userRole — role string for this user in this cycle
//    onEnter  — callback when "Open cycle" is clicked
// ─────────────────────────────────────────────────────────

import { ROLE_META, FRAMEWORK_META, STATUS_META } from "../../constants/roles";
import PhaseStrip  from "./PhaseStrip";
import ControlsBar from "./ControlsBar";

const CSS = `
.cc {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.cc:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); border-color: var(--border2); }

/* ── TOP ROW ── */
.cc-top {
  padding: 15px 17px 13px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; gap: 13px;
}
.cc-fw-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0; border: 1px solid;
}
.cc-head { flex: 1; min-width: 0; }
.cc-title-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 2px; }
.cc-name  { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -0.2px; }
.fw-tag   {
  font-size: 9px; font-weight: 700; padding: 2px 7px;
  border-radius: 4px; font-family: var(--mono);
  letter-spacing: 0.4px; border: 1px solid; flex-shrink: 0;
}
.cc-id    { font-size: 10px; color: var(--hint); font-family: var(--mono); }
.cc-badges { display: flex; align-items: center; gap: 7px; margin-top: 6px; flex-wrap: wrap; }

.status-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  border-radius: 20px; border: 1px solid; flex-shrink: 0;
}
.s-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.role-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 3px 9px;
  border-radius: 6px; border: 1px solid; flex-shrink: 0;
}

.cc-sub-meta { font-size: 10px; color: var(--hint); display: flex; align-items: center; gap: 5px; }
.meta-dot    { width: 2px; height: 2px; border-radius: 50%; background: var(--hint); }

/* TOP RIGHT */
.cc-top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.dl-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-family: var(--mono); white-space: nowrap; }

.team-row { display: flex; align-items: center; }
.team-av  {
  width: 23px; height: 23px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff;
  border: 2px solid var(--surface); margin-left: -6px; flex-shrink: 0;
}
.team-av:first-child { margin-left: 0; }
.team-more {
  width: 23px; height: 23px; border-radius: 50%;
  background: var(--surface2); border: 1.5px dashed var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: var(--hint); margin-left: -6px;
}

/* ── MIDDLE ROW ── */
.cc-mid {
  padding: 12px 17px;
  border-bottom: 1px solid var(--border);
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.cc-mid-label {
  font-size: 10px; font-weight: 700; color: var(--hint);
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 7px;
}
.ev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.ev-cell { background: var(--surface2); border-radius: var(--rs); padding: 8px 10px; border: 1px solid var(--border); }
.ev-val  { font-size: 17px; font-weight: 800; color: var(--text); font-family: var(--mono); line-height: 1; }
.ev-lbl  { font-size: 9px; color: var(--hint); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

/* ── BOTTOM ROW ── */
.cc-bot {
  padding: 11px 17px;
  display: flex; align-items: center; gap: 12px;
}
.cc-vd { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

.prog-wrap    { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.prog-track   { width: 70px; height: 5px; background: #EEF0F6; border-radius: 3px; overflow: hidden; }
.prog-fill    { height: 100%; border-radius: 3px; }
.prog-pct     { font-size: 11px; font-weight: 700; font-family: var(--mono); min-width: 26px; }

.my-tasks     { text-align: center; flex-shrink: 0; }
.mt-num       { font-size: 21px; font-weight: 800; font-family: var(--mono); line-height: 1; }
.mt-lbl       { font-size: 9px; color: var(--hint); text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }
.mt-sub       { font-size: 9px; color: var(--hint); margin-top: 1px; }

.enter-btn {
  background: var(--text); color: #fff;
  border: none; padding: 8px 14px; border-radius: var(--rs);
  font-size: 12px; font-weight: 700; cursor: pointer;
  font-family: var(--font); white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
  transition: all 0.15s; flex-shrink: 0; letter-spacing: -0.1px;
}
.enter-btn:hover { background: #1E293B; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
`;

export default function CycleCard({ cycle, userRole, onEnter }) {
  const st  = STATUS_META[cycle.status]  || STATUS_META["on-track"];
  const fw  = FRAMEWORK_META[cycle.frameworkTag] || FRAMEWORK_META["SWIFT"];
  const rm  = ROLE_META[userRole]        || ROLE_META["Reviewer"];

  const isUrgent   = cycle.daysLeft <= 3;
  const daysColor  = isUrgent ? "#EF4444" : cycle.daysLeft <= 10 ? "#D97706" : "#059669";
  const daysBg     = isUrgent ? "#FEF2F2" : cycle.daysLeft <= 10 ? "#FFFBEB" : "#ECFDF5";

  const progColor  = cycle.overallProgress >= 80 ? "#10B981"
    : cycle.overallProgress >= 50 ? "#4F46E5" : "#F59E0B";

  const taskColor  = cycle.myTasks.pending === 0 ? "#10B981"
    : cycle.myTasks.pending >= 4 ? "#EF4444" : "#F59E0B";

  const evidenceCells = [
    { v: cycle.evidence.total,         l: "Total"     },
    { v: cycle.evidence.uploaded,      l: "Uploaded"  },
    { v: cycle.evidence.aiPassed,      l: "AI passed" },
    { v: cycle.evidence.pendingReview, l: "In review" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="cc">

        {/* TOP */}
        <div className="cc-top">
          <div className="cc-fw-icon" style={{ background: fw.bg, borderColor: fw.border }}>
            {cycle.icon}
          </div>

          <div className="cc-head">
            <div className="cc-title-row">
              <span className="cc-name">{cycle.name}</span>
              <span className="fw-tag" style={{ background: fw.bg, color: fw.accent, borderColor: fw.border }}>
                {cycle.frameworkTag}
              </span>
            </div>
            <div className="cc-id">{cycle.id} · Year {cycle.year} · Created {cycle.createdDate}</div>
            <div className="cc-badges">
              <div className="status-badge" style={{ background: st.bg, color: st.text, borderColor: st.border }}>
                <div className="s-dot" style={{ background: st.dot }} />
                {st.label}
              </div>
              <div className="role-badge" style={{ background: rm.bg, color: rm.color, borderColor: rm.border }}>
                {rm.icon} My role: {userRole}
              </div>
              <div className="cc-sub-meta">
                <span>Phase: <strong style={{ color: "var(--sub)" }}>{cycle.phase}</strong></span>
                <div className="meta-dot" />
                <span>Updated {cycle.lastActivity}</span>
              </div>
            </div>
          </div>

          <div className="cc-top-right">
            <div className="dl-badge" style={{ background: daysBg, color: daysColor }}>
              {isUrgent ? "⚡ " : ""}{cycle.daysLeft} days left · {cycle.deadline}
            </div>
            <div className="team-row">
              {cycle.teamMembers.map((m, i) => (
                <div
                  key={i}
                  className="team-av"
                  style={{ background: m.color, zIndex: cycle.teamMembers.length - i }}
                  title={`${m.name} — ${m.role}`}
                >
                  {m.initials}
                </div>
              ))}
              <div className="team-more" title="View all">+</div>
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="cc-mid">
          <div>
            <div className="cc-mid-label">Controls breakdown</div>
            <ControlsBar controls={cycle.controls} />
          </div>
          <div>
            <div className="cc-mid-label">Evidence files</div>
            <div className="ev-grid">
              {evidenceCells.map((e) => (
                <div className="ev-cell" key={e.l}>
                  <div className="ev-val">{e.v}</div>
                  <div className="ev-lbl">{e.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="cc-bot">
          <PhaseStrip phaseIndex={cycle.phaseIndex} />
          <div className="cc-vd" />

          <div className="prog-wrap">
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${cycle.overallProgress}%`, background: progColor }} />
            </div>
            <div className="prog-pct" style={{ color: progColor }}>{cycle.overallProgress}%</div>
          </div>
          <div className="cc-vd" />

          <div className="my-tasks">
            <div className="mt-num" style={{ color: taskColor }}>
              {cycle.myTasks.pending === 0 ? "✓" : cycle.myTasks.pending}
            </div>
            <div className="mt-lbl">{cycle.myTasks.pending === 0 ? "All done" : "My tasks"}</div>
            <div className="mt-sub">{cycle.myTasks.completed}/{cycle.myTasks.total} done</div>
          </div>

          <button className="enter-btn" onClick={() => onEnter?.(cycle, userRole)}>
            Open cycle →
          </button>
        </div>

      </div>
    </>
  );
}
