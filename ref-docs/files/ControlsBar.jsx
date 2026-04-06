// components/cycles/ControlsBar.jsx
// ─────────────────────────────────────────────────────────
//  Segmented bar showing control statuses.
//  Receives: controls { total, compliant, inReview, pending, overdue }
// ─────────────────────────────────────────────────────────

const CSS = `
.ctrl-bar {
  height: 8px; border-radius: 5px;
  overflow: hidden; display: flex; gap: 1.5px;
}
.ctrl-seg { height: 100%; border-radius: 3px; }

.ctrl-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 7px; }
.ctrl-legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--sub); }
.cl-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }

.ctrl-total { font-size: 10px; color: var(--hint); margin-top: 4px; }
`;

const SEGMENTS = [
  { key: "compliant", color: "#10B981", label: "Compliant" },
  { key: "inReview",  color: "#6366F1", label: "In review" },
  { key: "pending",   color: "#D1D5DB", label: "Pending"   },
  { key: "overdue",   color: "#EF4444", label: "Overdue"   },
];

export default function ControlsBar({ controls = {} }) {
  const { total = 1 } = controls;

  return (
    <>
      <style>{CSS}</style>
      <div className="ctrl-bar">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            className="ctrl-seg"
            style={{
              width: `${((controls[seg.key] || 0) / total) * 100}%`,
              background: seg.color,
            }}
          />
        ))}
      </div>

      <div className="ctrl-legend">
        {SEGMENTS.map((seg) => (
          <div className="ctrl-legend-item" key={seg.key}>
            <div className="cl-dot" style={{ background: seg.color }} />
            {controls[seg.key] || 0} {seg.label}
          </div>
        ))}
      </div>

      <div className="ctrl-total">{total} total controls</div>
    </>
  );
}
