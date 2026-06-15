import type { ReactNode } from "react";
import type { Regulator } from "@/lib/Srilanka_Retail/types";

/**
 * A regulator label tile, reused across the posture grid and evidence views.
 */
export function RegulatorTile({
  regulator,
  trailing,
}: {
  regulator: Regulator;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-200">{regulator.label}</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {regulator.key}
        </span>
      </div>
      {trailing}
    </div>
  );
}
