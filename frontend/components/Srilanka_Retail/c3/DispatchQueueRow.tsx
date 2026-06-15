import type { DispatchLoad } from "@/lib/Srilanka_Retail/types";
import { LivePilotBadge } from "../primitives";
import { LicenceStatusBadge } from "./LicenceStatusBadge";

/**
 * One dispatch load row. The auto-block affordance is PILOT-gated, so its
 * control renders dashed with the ◌ PILOT badge — never as a live action. The
 * validate/alert affordance is LIVE (solid). Both come from the load's liveRefs.
 */
export function DispatchQueueRow({ load }: { load: DispatchLoad }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3 md:grid-cols-[1.6fr_1fr_1.2fr]">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">{load.id}</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">
            {load.flCategory}
          </span>
        </div>
        <span className="text-xs text-slate-400">{load.posRef}</span>
      </div>

      <div className="flex items-center gap-2">
        <LicenceStatusBadge status={load.licenceStatus} />
        {load.sltdaChainStatus !== "NA" ? (
          <span className="text-[10px] uppercase tracking-wide text-amber-400">
            SLTDA {load.sltdaChainStatus}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-start gap-2 md:justify-end">
        {/* LIVE affordance: solid */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Validate</span>
          <LivePilotBadge liveState={load.validateAlert.liveState} />
        </span>
        {/* PILOT-gated affordance: dashed */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-700 px-2 py-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">Auto-block</span>
          <LivePilotBadge
            liveState={load.autoBlock.liveState}
            gapRef={load.autoBlock.gapRef}
          />
        </span>
      </div>
    </div>
  );
}
