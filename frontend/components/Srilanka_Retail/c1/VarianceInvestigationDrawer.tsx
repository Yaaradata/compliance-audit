"use client";

import { X, ShieldCheck } from "lucide-react";
import type { Money, NodeState, Tagged, Variance } from "@/lib/Srilanka_Retail/types";
import { formatNumber, formatRupeesFull } from "@/lib/Srilanka_Retail/format";
import { SourceChip, NUM } from "../primitives";

/**
 * Slide-over that explains the variance and hosts the one live action.
 * Reading is all from the store; the CTA fires reconcileVariance().
 */
export function VarianceInvestigationDrawer({
  open,
  onClose,
  variance,
  expectedDuty,
  detectionLatency,
  nodeState,
  onReconcile,
}: {
  open: boolean;
  onClose: () => void;
  variance: Variance;
  expectedDuty: Tagged<Money>;
  detectionLatency: Tagged<string>;
  nodeState: NodeState;
  onReconcile: () => void;
}) {
  if (!open) return null;
  const reconciled = nodeState === "RECONCILED";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close investigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto border-l border-slate-800 bg-slate-950 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Variance investigation</h3>
            <p className="text-xs text-slate-500">Period tie-out · EXCISE × DUTY</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">Root cause</span>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{variance.rootCause}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Unaccounted</dt>
            <dd className={`mt-1 text-lg font-semibold text-slate-100 ${NUM}`}>
              {formatNumber(variance.unaccountedUnits)}
              <span className="ml-1 text-xs text-slate-500">units</span>
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Expected duty</dt>
            <dd className={`mt-1 text-lg font-semibold text-slate-100 ${NUM}`}>
              {formatRupeesFull(expectedDuty.value)}
            </dd>
            <SourceChip tag={expectedDuty.sourceTag} className="mt-1.5" />
          </div>
        </dl>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Detection latency
          </span>
          <p className="mt-1 text-sm text-slate-300">{detectionLatency.value}</p>
          <SourceChip tag={detectionLatency.sourceTag} className="mt-1.5" />
        </div>

        <div className="mt-auto">
          {reconciled ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-800/70 bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              Variance cleared — period reconciled
            </div>
          ) : (
            <button
              type="button"
              onClick={onReconcile}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <ShieldCheck className="h-5 w-5" />
              Reconcile variance
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
