"use client";

import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { getPostureCell } from "@/lib/Srilanka_Retail/derivations";
import { StatusCell } from "../primitives";

/** The hero cell that flips OK on reconcile (highlighted so the ripple reads). */
const HERO_REGULATOR = "reg-excise";
const HERO_CONTROL = "ctrl-duty";

/**
 * Regulator × control posture matrix. Every cell reads its status from the
 * store, so the EXCISE × DUTY cell visibly flips ATTENTION → OK after the C1
 * reconcile (the C1 → C5 ripple).
 */
export function PostureGrid() {
  const data = useKeystoneStore((s) => s);
  const { regulators, controls } = data;

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px] gap-2"
        style={{ gridTemplateColumns: `minmax(150px, 1.4fr) repeat(${controls.length}, 1fr)` }}
      >
        <div />
        {controls.map((c) => (
          <div
            key={c.id}
            className="flex items-end justify-center pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          >
            {c.label}
          </div>
        ))}

        {regulators.map((reg) => (
          <div key={reg.id} className="contents">
            <div className="flex flex-col justify-center py-1">
              <span className="text-sm font-medium text-slate-200">{reg.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-600">{reg.key}</span>
            </div>
            {controls.map((ctrl) => {
              const cell = getPostureCell(data, reg.id, ctrl.id);
              if (!cell) return <div key={ctrl.id} />;
              return (
                <StatusCell
                  key={ctrl.id}
                  status={cell.status}
                  title={`${reg.label} · ${ctrl.label}`}
                  highlight={reg.id === HERO_REGULATOR && ctrl.id === HERO_CONTROL}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
