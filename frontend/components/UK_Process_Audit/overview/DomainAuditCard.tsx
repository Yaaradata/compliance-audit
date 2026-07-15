"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { UkDomainAuditCard } from "@/lib/UK_Process_Audit/types";
import { residualHex } from "../shared/pills";

export function DomainAuditCard({
  card,
  onOpen,
  focusLabel = "AI focus",
}: {
  card: UkDomainAuditCard;
  onOpen: () => void;
  /** v3 passes "Top exception". Default preserves v1 "AI focus". */
  focusLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const coverage = useMemo(() => {
    if (card.controls <= 0) return 0;
    return Math.min(100, Math.round((card.tested / card.controls) * 100));
  }, [card.tested, card.controls]);

  const fullyTested = card.controls > 0 && card.tested >= card.controls;
  const gap = Math.max(0, card.controls - card.tested);
  const color = residualHex(card.residualRisk);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-white text-left ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{card.domain}</div>
          <div className="mt-0.5 truncate text-[11px] text-slate-500">{card.owner}</div>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1"
          style={{ color, backgroundColor: `${color}14`, borderColor: `${color}33` }}
        >
          {card.residualRisk}
        </span>
      </div>

      <div className="px-4 pt-3">
        {fullyTested ? (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Fully tested
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{card.controls} in scope</span>
              <span>
                {card.tested}/{card.controls} tested
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${mounted ? coverage : 0}%`, backgroundColor: color }}
              />
            </div>
            {gap > 0 && (
              <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                {gap} not tested
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-px border-y border-slate-100 bg-slate-100">
        <Metric label="PASS RATE" value={`${card.compliance.toFixed(1)}%`} />
        <Metric label="CRITICAL" value={card.violations === 0 ? "None" : String(card.violations)} />
        <Metric label="OVERDUE" value={card.overdueRemediation === 0 ? "None" : String(card.overdueRemediation)} />
      </div>

      <div className="flex flex-1 flex-col px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{focusLabel}</div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-slate-600">{card.topIssue}</p>
        <p className="mt-1.5 text-[12px] font-medium leading-snug text-slate-900">{card.action}</p>
      </div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
