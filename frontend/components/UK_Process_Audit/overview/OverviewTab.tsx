"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Gauge,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  UkDomainAuditCard,
  UkProcessAuditDomainId,
  UkProcessAuditOverview,
  UkResidualRisk,
} from "@/lib/UK_Process_Audit/types";
import { DomainAuditCard } from "./DomainAuditCard";

const POSTURE_BANNER: Record<UkResidualRisk, { ring: string; text: string; dot: string; label: string }> = {
  Critical: { ring: "ring-red-200 bg-red-50", text: "text-red-800", dot: "bg-red-500", label: "Critical" },
  High: { ring: "ring-amber-200 bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", label: "Elevated" },
  Medium: { ring: "ring-sky-200 bg-sky-50", text: "text-sky-800", dot: "bg-sky-500", label: "Moderate" },
  Low: { ring: "ring-emerald-200 bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", label: "Stable" },
};

export function OverviewTab({
  overview,
  domainCards,
  onDrillDown,
}: {
  overview: UkProcessAuditOverview;
  domainCards: UkDomainAuditCard[];
  onDrillDown: (id: UkProcessAuditDomainId) => void;
}) {
  const sortedCards = useMemo(
    () =>
      [...domainCards].sort(
        (a, b) =>
          b.violations * 10 + b.overdueRemediation - (a.violations * 10 + a.overdueRemediation),
      ),
    [domainCards],
  );

  const attentionDomains = useMemo(
    () =>
      [...domainCards]
        .filter((c) => c.residualRisk === "Critical" || c.residualRisk === "High")
        .sort((a, b) => b.exceptions - a.exceptions)
        .slice(0, 3),
    [domainCards],
  );

  const banner = POSTURE_BANNER[overview.posture];

  return (
    <div className="space-y-6">
      {/* Residual risk posture banner */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-4 ring-1 ${banner.ring}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${banner.dot}`}>
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          <div>
            <div className={`text-sm font-semibold ${banner.text}`}>
              Residual audit posture: {banner.label}
            </div>
            <div className="text-[12px] text-slate-600">
              {overview.criticalFindings} critical control{overview.criticalFindings === 1 ? "" : "s"} ·{" "}
              {overview.openExceptions} open exceptions across {overview.totalControls} controls ·{" "}
              {overview.lastAuditCycle}
            </div>
          </div>
        </div>
        <span className="rounded-md bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
          Metrics illustrative · sourced from operational control library
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={ListChecks} label="Controls in scope" value={String(overview.totalControls)} tint="#0f172a" />
        <Kpi icon={Gauge} label="Avg compliance" value={`${overview.avgCompliance}%`} tint="#10b981" />
        <Kpi icon={Activity} label="Open exceptions" value={String(overview.openExceptions)} tint="#f59e0b" />
        <Kpi icon={AlertTriangle} label="Critical controls" value={String(overview.criticalFindings)} tint="#ef4444" />
        <Kpi icon={Cpu} label="Automated" value={`${overview.automatedPct}%`} tint="#0ea5e9" />
        <Kpi icon={ShieldCheck} label="Preventive" value={`${overview.preventivePct}%`} tint="#6366f1" />
      </div>

      {/* AI intelligence card */}
      <section className="overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white ring-1 ring-slate-900">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <h3 className="text-sm font-semibold">AI audit intelligence</h3>
          <span className="ml-auto text-[11px] text-slate-400">Where to focus this cycle</span>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-3">
          {attentionDomains.length === 0 ? (
            <div className="bg-slate-900 px-5 py-4 text-[13px] text-slate-300 sm:col-span-3">
              No critical or high-risk domains this cycle — maintain BAU testing cadence.
            </div>
          ) : (
            attentionDomains.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onDrillDown(c.id)}
                className="flex flex-col gap-1 bg-slate-900 px-5 py-4 text-left transition-colors hover:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[13px] font-semibold">{c.domain}</span>
                  <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold">
                    {c.residualRisk}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {c.exceptions} exceptions · {c.violations} critical · {c.compliance.toFixed(1)}% pass
                </span>
                <span className="mt-1 line-clamp-2 text-[12px] text-slate-300">{c.action}</span>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Audit domain cards */}
      <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Audit domains</h3>
            <p className="mt-1 max-w-3xl text-xs text-slate-500">
              Each card rolls up the SOP steps and controls for a domain. Border colour = residual
              risk. Click a card to open the control library, SOP flow and evidence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
            {(["Critical", "High", "Medium", "Low"] as UkResidualRisk[]).map((l) => (
              <span key={l} className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${POSTURE_BANNER[l].dot}`} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedCards.map((c) => (
              <DomainAuditCard key={c.id} card={c} onOpen={() => onDrillDown(c.id)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ backgroundColor: `${tint}14`, color: tint }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
