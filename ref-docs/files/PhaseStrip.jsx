// components/cycles/PhaseStrip.jsx
// ─────────────────────────────────────────────────────────
//  4-step phase progress strip used inside CycleCard.
//  Receives: phaseIndex (0–3)
// ─────────────────────────────────────────────────────────

import { PHASES } from "../../constants/roles";

const CSS = `
.phase-strip { flex: 1; min-width: 0; }
.ps-nodes    { display: flex; align-items: flex-end; gap: 0; }
.ps-node     { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; }

.ps-dot-wrap { position: relative; width: 100%; height: 0; }
.ps-dot {
  width: 9px; height: 9px; border-radius: 50%;
  border: 2px solid var(--border2);
  background: var(--surface2);
  position: absolute; left: 50%; top: -6.5px;
  transform: translateX(-50%);
}
.ps-dot.done   { background: var(--accent); border-color: var(--accent); }
.ps-dot.active { background: #fff; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.2); }

.ps-bar { width: 100%; height: 4px; border-radius: 2px; }

.ps-label {
  font-size: 9px; font-weight: 600; color: var(--hint);
  text-transform: uppercase; letter-spacing: 0.3px;
  white-space: nowrap;
}
.ps-label.done   { color: var(--accent); }
.ps-label.active { color: var(--accent); font-weight: 800; }
`;

export default function PhaseStrip({ phaseIndex = 0 }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="phase-strip">
        <div className="ps-nodes">
          {PHASES.map((phase, i) => {
            const done   = i < phaseIndex;
            const active = i === phaseIndex;
            const barBg  = done   ? "var(--accent)"
              : active ? "linear-gradient(90deg, var(--accent) 55%, #EEF0F6 55%)"
              : "#EEF0F6";

            return (
              <div className="ps-node" key={phase}>
                <div className="ps-dot-wrap">
                  <div className={`ps-dot ${done ? "done" : active ? "active" : ""}`} />
                </div>
                <div className="ps-bar" style={{ background: barBg }} />
                <div className={`ps-label ${done ? "done" : active ? "active" : ""}`}>
                  {phase}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
