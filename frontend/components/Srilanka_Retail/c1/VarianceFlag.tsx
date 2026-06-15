"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { Variance } from "@/lib/Srilanka_Retail/types";
import { formatNumber } from "@/lib/Srilanka_Retail/format";
import { SourceChip, NUM } from "../primitives";

/**
 * The hero. The variance figure is the ONLY animated element in the entire app:
 * a count-down from Rs 3,200,000 → Rs 0 when the variance is cleared.
 *
 * RED is used here and NOWHERE ELSE — it appears strictly while rupees are at
 * risk. Once cleared (Rs 0), the figure resolves to emerald (no longer at risk).
 */
export function VarianceFlag({ variance }: { variance: Variance }) {
  const atRisk = variance.status === "AT_RISK";
  const target = variance.amount.amount;

  const count = useMotionValue(target);
  const display = useTransform(count, (v) => `Rs ${formatNumber(Math.round(v))}`);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [count, target]);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 p-5 transition-colors duration-500 ${
        atRisk ? "border-red-600/70 bg-red-950/30" : "border-emerald-700/70 bg-emerald-950/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Duty at risk
        </span>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            atRisk ? "bg-red-900/60 text-red-200" : "bg-emerald-950/60 text-emerald-300"
          }`}
        >
          {variance.status}
        </span>
      </div>

      <motion.span
        className={`text-4xl font-bold leading-none sm:text-5xl ${NUM} ${
          atRisk ? "text-red-400" : "text-emerald-300"
        }`}
      >
        {display}
      </motion.span>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {atRisk
            ? `${formatNumber(variance.unaccountedUnits)} units unaccounted`
            : "Variance cleared — all units accounted"}
        </span>
        <SourceChip tag={variance.sourceTag} />
      </div>
    </div>
  );
}
