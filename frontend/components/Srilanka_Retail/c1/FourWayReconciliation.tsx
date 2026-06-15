"use client";

import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d7DetectionLatencyVisible, getStream } from "@/lib/Srilanka_Retail/derivations";
import { formatNumber } from "@/lib/Srilanka_Retail/format";
import { StreamNode } from "./StreamNode";
import { TieOutNode } from "./TieOutNode";
import { VarianceFlag } from "./VarianceFlag";
import { VarianceInvestigationDrawer } from "./VarianceInvestigationDrawer";

/**
 * C1 hero: four input streams tie out to a single node; the variance is flagged
 * in red. The "Reconcile variance" action is the one live interaction — it
 * mutates the B.4 fields and ripples to C4 (EXCISE evidence) and C5 (posture).
 */
export function FourWayReconciliation() {
  const reconciliation = useKeystoneStore((s) => s.reconciliation);
  const reconcileVariance = useKeystoneStore((s) => s.reconcileVariance);
  const latencyVisible = useKeystoneStore(d7DetectionLatencyVisible);
  const data = useKeystoneStore((s) => s);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const reconciled = reconciliation.nodeState === "RECONCILED";

  const packaged = getStream(data, "packagedVolume")?.value.value;
  const stickers = getStream(data, "stickersConsumed")?.value.value;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-2 gap-3">
          {reconciliation.streams.map((stream) => (
            <StreamNode key={stream.key} stream={stream} />
          ))}
        </div>

        <TieOutNode
          nodeState={reconciliation.nodeState}
          expectedDuty={reconciliation.expectedDuty}
          detectionLatency={reconciliation.detectionLatency}
          detectionLatencyVisible={latencyVisible}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <VarianceFlag variance={reconciliation.variance} />

        <div className="flex flex-col justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-sm text-slate-400">
            {reconciled
              ? "The period four-way reconciliation is resolved. The EXCISE evidence pack and the EXCISE × DUTY posture cell now reflect the cleared variance."
              : `${stickers !== null && stickers !== undefined ? formatNumber(stickers) : "—"} stickers logged against ${
                  packaged !== null && packaged !== undefined ? formatNumber(packaged) : "—"
                } units packaged. Investigate the gap, then reconcile to clear the duty at risk.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:text-sky-200"
            >
              <Search className="h-4 w-4" />
              Investigate
            </button>
            <button
              type="button"
              onClick={reconcileVariance}
              disabled={reconciled}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <ShieldCheck className="h-4 w-4" />
              {reconciled ? "Reconciled" : "Reconcile variance"}
            </button>
          </div>
        </div>
      </div>

      <VarianceInvestigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variance={reconciliation.variance}
        expectedDuty={reconciliation.expectedDuty}
        detectionLatency={reconciliation.detectionLatency}
        nodeState={reconciliation.nodeState}
        onReconcile={reconcileVariance}
      />
    </div>
  );
}
