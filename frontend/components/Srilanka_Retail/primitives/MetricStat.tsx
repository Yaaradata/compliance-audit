import type { ReactNode } from "react";
import type { SourceTag } from "@/lib/Srilanka_Retail/types";
import { SourceChip } from "./SourceChip";

/**
 * A single headline statistic: quiet label, generous value, provenance chip.
 * The value is passed as children (a <RangeValue>, formatted scalar, etc.) so
 * the call site reads it from the store — MetricStat never owns a number.
 */
export function MetricStat({
  label,
  tag,
  emphasis = "SUPPORTING",
  children,
}: {
  label: string;
  tag?: SourceTag;
  emphasis?: "PRIMARY" | "SUPPORTING";
  children: ReactNode;
}) {
  const valueSize = emphasis === "PRIMARY" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl";
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className={`font-semibold leading-tight text-slate-100 ${valueSize}`}>
        {children}
      </span>
      {tag ? <SourceChip tag={tag} className="self-start" /> : null}
    </div>
  );
}
