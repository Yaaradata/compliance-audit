"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d9CommitteeRollup } from "@/lib/Srilanka_Retail/derivations";
import type { Severity } from "@/lib/Srilanka_Retail/types";

const SEVERITY_STYLE: Record<Severity, string> = {
  HIGH: "bg-amber-950/60 text-amber-300 border-amber-800/70",
  MEDIUM: "bg-slate-800 text-slate-300 border-slate-700",
  LOW: "bg-slate-800 text-slate-400 border-slate-700",
};

/**
 * Items routed to the audit committee. Derived (D9) from HIGH-severity posture
 * items. Attention severity renders amber — never red.
 */
export function CommitteeRollup() {
  // Select stable slices; the derivation builds a fresh array, so memoize it
  // rather than passing it straight to the store hook (would loop the snapshot).
  const rollupItems = useKeystoneStore((s) => s.committeeRollup.items);
  const postureGrid = useKeystoneStore((s) => s.postureGrid);
  const regulators = useKeystoneStore((s) => s.regulators);
  const controls = useKeystoneStore((s) => s.controls);
  const routedTo = useKeystoneStore((s) => s.committeeRollup.routedTo);

  const items = useMemo(
    () =>
      d9CommitteeRollup({
        committeeRollup: { items: rollupItems, routedTo },
        postureGrid,
        regulators,
        controls,
      } as Parameters<typeof d9CommitteeRollup>[0]),
    [rollupItems, postureGrid, regulators, controls, routedTo],
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-200">Committee roll-up</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {routedTo.replace("_", " ")}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No items routed.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.postureCellId}
            className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-950/40 p-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {item.regulator?.label}
                  {item.control ? ` · ${item.control.label}` : ""}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_STYLE[item.severity]}`}
                >
                  {item.severity}
                </span>
              </div>
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
