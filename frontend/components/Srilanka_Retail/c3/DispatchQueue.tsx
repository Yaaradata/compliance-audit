"use client";

import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { DispatchQueueRow } from "./DispatchQueueRow";

/**
 * C3 dispatch queue. Rows are read from the store; the LIVE validate/alert and
 * the PILOT-gated auto-block render strictly from each load's data state.
 */
export function DispatchQueue() {
  const loads = useKeystoneStore((s) => s.dispatchLoads);

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden grid-cols-[1.6fr_1fr_1.2fr] px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600 md:grid">
        <span>Load · outlet</span>
        <span>Licence</span>
        <span className="text-right">Affordances</span>
      </div>
      {loads.map((load) => (
        <DispatchQueueRow key={load.id} load={load} />
      ))}
    </div>
  );
}
