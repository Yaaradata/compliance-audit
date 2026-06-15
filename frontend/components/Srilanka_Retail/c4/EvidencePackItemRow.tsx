import { Check } from "lucide-react";
import type { EvidencePackItem } from "@/lib/Srilanka_Retail/types";

const SOURCE_STYLE: Record<string, string> = {
  C1: "bg-sky-950/60 text-sky-300 border-sky-900/70",
  C2: "bg-slate-800 text-slate-300 border-slate-700",
  C3: "bg-slate-800 text-slate-300 border-slate-700",
};

/**
 * One evidence item. The derivedFrom screen is shown as a provenance tag so an
 * auditor can trace each artefact back to the screen that produced it.
 */
export function EvidencePackItemRow({
  item,
  isNew = false,
}: {
  item: EvidencePackItem;
  isNew?: boolean;
}) {
  const checked = item.status === "CHECKED";
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border bg-slate-950/40 px-3 py-2.5 transition-colors duration-500 ${
        isNew ? "border-sky-700/70 bg-sky-950/20" : "border-slate-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            checked ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm text-slate-200">{item.label}</span>
      </div>
      <span
        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          SOURCE_STYLE[item.derivedFrom] ?? "bg-slate-800 text-slate-300 border-slate-700"
        }`}
      >
        {item.derivedFrom}
      </span>
    </div>
  );
}
