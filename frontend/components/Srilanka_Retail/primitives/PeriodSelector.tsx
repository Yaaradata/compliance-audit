"use client";

import { CalendarDays } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";

/**
 * Period control. The dataset carries a single current period (May 2026);
 * the label is read from the store, never hardcoded.
 */
export function PeriodSelector() {
  const periods = useKeystoneStore((s) => s.periods);
  const current = periods.find((p) => p.current) ?? periods[0];

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-300">
      <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden />
      <span className="font-medium">{current?.label}</span>
    </div>
  );
}
