import type { Money, NodeState, Tagged } from "@/lib/Srilanka_Retail/types";
import { formatRupeesFull } from "@/lib/Srilanka_Retail/format";
import { SourceChip, NUM } from "../primitives";

/**
 * The convergence node where the four streams tie out. nodeState drives the
 * colour (AT_RISK amber / RECONCILED green). Detection latency is revealed only
 * once reconciled (D7).
 */
export function TieOutNode({
  nodeState,
  expectedDuty,
  detectionLatency,
  detectionLatencyVisible,
}: {
  nodeState: NodeState;
  expectedDuty: Tagged<Money>;
  detectionLatency: Tagged<string>;
  detectionLatencyVisible: boolean;
}) {
  const reconciled = nodeState === "RECONCILED";
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 bg-slate-950/60 p-4 transition-colors duration-500 ${
        reconciled ? "border-emerald-700/70" : "border-amber-700/70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Four-way tie-out
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            reconciled ? "bg-emerald-950/60 text-emerald-300" : "bg-amber-950/60 text-amber-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${reconciled ? "bg-emerald-400" : "bg-amber-400"}`}
            aria-hidden
          />
          {nodeState.replace("_", " ")}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Expected duty</span>
        <span className={`text-lg font-semibold text-slate-100 ${NUM}`}>
          {formatRupeesFull(expectedDuty.value)}
        </span>
        <SourceChip tag={expectedDuty.sourceTag} className="self-start" />
      </div>

      <div
        className={`flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 transition-opacity duration-500 ${
          detectionLatencyVisible ? "opacity-100" : "opacity-40"
        }`}
      >
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Detection latency</span>
        <span className="text-xs font-medium text-slate-300">
          {detectionLatencyVisible ? detectionLatency.value : "—"}
        </span>
      </div>
    </div>
  );
}
