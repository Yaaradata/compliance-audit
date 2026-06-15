import type { ReconStream } from "@/lib/Srilanka_Retail/types";
import { formatNumber } from "@/lib/Srilanka_Retail/format";
import { SourceChip, NUM } from "../primitives";

/**
 * One reconciliation input stream. MISMATCH is shown in amber (attention) —
 * never red. The displayed figure is read straight off the stream value.
 */
export function StreamNode({ stream }: { stream: ReconStream }) {
  const mismatch = stream.status === "MISMATCH";
  const hasValue = stream.value.value !== null;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border bg-slate-950/50 p-3 transition-colors duration-500 ${
        mismatch ? "border-amber-800/70" : "border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-300">{stream.label}</span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            mismatch ? "text-amber-300" : "text-emerald-300"
          }`}
        >
          {stream.status}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={`text-xl font-semibold text-slate-100 ${NUM}`}>
          {hasValue ? formatNumber(stream.value.value as number) : "—"}
        </span>
        <span className="text-xs text-slate-500">{stream.unit}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <SourceChip tag={stream.value.sourceTag} />
        <span className="text-[10px] uppercase tracking-wide text-slate-600">
          {stream.liveSource}
        </span>
      </div>
    </div>
  );
}
