import { Lock, Unlock } from "lucide-react";
import type { Batch, GateState } from "@/lib/Srilanka_Retail/types";
import { GateRow, LivePilotBadge } from "../primitives";

const HELD_REASON_LABEL: Record<string, string> = {
  ABV_MISMATCH: "ABV mismatch beyond tolerance",
  NONE: "—",
};

/**
 * Batch release gate. The gate state is derived (D6) from the ABV reconciliation;
 * a HELD gate is an attention state (amber), not a rupees-at-risk event.
 */
export function ReleaseGate({
  batch,
  gateState,
}: {
  batch: Batch;
  gateState: GateState;
}) {
  const held = gateState === "HELD";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 bg-slate-900/40 p-4 ${
        batch.liveState === "LIVE" ? "border-slate-700" : "border-dashed border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {held ? (
            <Lock className="h-5 w-5 text-amber-300" />
          ) : (
            <Unlock className="h-5 w-5 text-emerald-300" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-100">Batch {batch.id}</span>
            <span className="text-xs text-slate-500">
              {held ? HELD_REASON_LABEL[batch.heldReason] : "Cleared for release"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              held ? "bg-amber-950/60 text-amber-300" : "bg-emerald-950/60 text-emerald-300"
            }`}
          >
            {gateState}
          </span>
          <LivePilotBadge liveState={batch.liveState} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {batch.qcPanel.map((qc) => (
          <GateRow
            key={qc.key}
            label={qc.label}
            tone={qc.status === "PASS" ? "ok" : "attention"}
            statusLabel={qc.status}
          />
        ))}
      </div>
    </div>
  );
}
