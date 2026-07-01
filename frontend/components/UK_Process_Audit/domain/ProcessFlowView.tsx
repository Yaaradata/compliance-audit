"use client";

import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Gavel,
  Info,
  ListChecks,
  UserRound,
  Workflow,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  UkAuditControl,
  UkDomainSop,
  UkSopStageDef,
} from "@/lib/UK_Process_Audit/types";
import { ComplianceCell, StageHealthPill, StatusBadge } from "../shared/journeyUi";

type StageAgg = UkSopStageDef & {
  mapped: UkAuditControl[];
  total: number;
  violations: number;
  exceptions: number;
  compliance: number;
  health: "ok" | "attention" | "critical";
};

function aggregateStage(stage: UkSopStageDef, controls: UkAuditControl[]): StageAgg {
  const mapped = stage.controlIds
    .map((id) => controls.find((c) => c.controlId === id))
    .filter((c): c is UkAuditControl => Boolean(c));
  const total = mapped.length;
  const violations = mapped.reduce((s, c) => s + c.violations, 0);
  const exceptions = mapped.reduce((s, c) => s + c.exceptions, 0);
  const compliance = total
    ? Number((mapped.reduce((s, c) => s + c.compliance, 0) / total).toFixed(1))
    : 100;
  let health: "ok" | "attention" | "critical" = "ok";
  if (violations > 0 || compliance < 90) health = "critical";
  else if (exceptions > 0 || compliance < 95) health = "attention";
  return { ...stage, mapped, total, violations, exceptions, compliance, health };
}

const TONE: Record<string, { card: string; label: string; value: string }> = {
  slate: { card: "bg-slate-50/80 ring-slate-200", label: "text-slate-500", value: "text-slate-900" },
  rose: { card: "bg-red-50/60 ring-red-200", label: "text-red-700", value: "text-red-700" },
  amber: { card: "bg-amber-50/60 ring-amber-200", label: "text-amber-800", value: "text-amber-700" },
  emerald: { card: "bg-emerald-50/60 ring-emerald-200", label: "text-emerald-700", value: "text-emerald-700" },
};

export function ProcessFlowView({
  sop,
  controls,
  onOpenEvidence,
}: {
  sop: UkDomainSop;
  controls: UkAuditControl[];
  onOpenEvidence: (control: UkAuditControl) => void;
}) {
  const stageAgg = useMemo(
    () => sop.stages.map((s) => aggregateStage(s, controls)),
    [sop, controls],
  );
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  const totalExceptions = stageAgg.reduce((s, st) => s + st.exceptions, 0);
  const totalViolations = stageAgg.reduce((s, st) => s + st.violations, 0);
  const missedStages = stageAgg.filter((s) => s.health !== "ok").length;
  const stageCount = sop.stages.length;
  const missPct = stageCount > 0 ? Math.round((missedStages / stageCount) * 1000) / 10 : 0;

  const kpis: { label: string; value: string; sub: string; tone: string; icon: LucideIcon }[] = [
    { label: "SOP stages", value: String(stageCount), sub: "Lifecycle steps in scope", tone: "slate", icon: ListChecks },
    {
      label: "Stages w/ miss",
      value: String(missedStages),
      sub: missedStages > 0 ? `${missPct}% of stages` : "All stages within tolerance",
      tone: missedStages > 0 ? "rose" : "emerald",
      icon: AlertTriangle,
    },
    { label: "Failed cases", value: String(totalExceptions), sub: "Case-level exceptions in sample", tone: totalExceptions > 0 ? "amber" : "emerald", icon: ClipboardList },
    { label: "Critical", value: String(totalViolations), sub: "Rejected controls", tone: totalViolations > 0 ? "rose" : "emerald", icon: XCircle },
  ];

  const healthSoft = (h: string) =>
    h === "critical" ? "bg-red-50/60" : h === "attention" ? "bg-amber-50/60" : "bg-emerald-50/60";

  return (
    <div className="space-y-5">
      {/* SOP header */}
      <div className="space-y-4 rounded-lg bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
            <Workflow className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{sop.name}</h3>
            <p className="mt-0.5 max-w-3xl text-xs leading-snug text-slate-500">{sop.purpose}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((m) => {
            const t = TONE[m.tone];
            const Icon = m.icon;
            return (
              <div key={m.label} className={`rounded-lg px-4 py-3 ring-1 ${t.card}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${t.label}`} />
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${t.label}`}>{m.label}</div>
                </div>
                <div className={`mt-1 text-2xl font-semibold leading-none tabular-nums ${t.value}`}>{m.value}</div>
                <div className="mt-1 text-[10px] text-slate-500">{m.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage-by-stage table */}
      <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Stage-by-stage compliance map</h4>
            <p className="mt-0.5 text-xs text-slate-500">Every SOP stage and the misses at that step.</p>
          </div>
          <span className="text-[11px] text-slate-500">Click a stage row to expand details inline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="w-10 px-4 py-2.5 font-semibold">#</th>
                <th className="px-3 py-2.5 font-semibold">Stage</th>
                <th className="px-3 py-2.5 font-semibold">Accountable owner</th>
                <th className="px-3 py-2.5 text-center font-semibold">Pass rate</th>
                <th className="px-3 py-2.5 text-center font-semibold text-amber-700">Failed cases</th>
                <th className="px-3 py-2.5 text-center font-semibold text-red-700">Critical</th>
                <th className="px-3 py-2.5 font-semibold">Missed controls</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stageAgg.map((st, idx) => {
                const missed = st.mapped.filter((c) => c.exceptions > 0 || c.violations > 0);
                const isOpen = expandedStageId === st.id;
                return (
                  <Fragment key={st.id}>
                    <tr
                      onClick={() => setExpandedStageId((id) => (id === st.id ? null : st.id))}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${isOpen ? "bg-slate-100" : "hover:bg-slate-50/70"}`}
                    >
                      <td className="px-4 py-2.5 align-top text-xs font-semibold text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-medium text-slate-900">{st.name}</div>
                        <div className="line-clamp-2 max-w-xs text-[11px] text-slate-500">{st.description}</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="min-w-[160px]">
                          <div className="text-[11px] font-semibold leading-tight text-slate-800">{st.owner.role}</div>
                          <div className="text-[10px] leading-tight text-slate-500">{st.owner.team}</div>
                          <div className="mt-0.5 line-clamp-2 max-w-[200px] text-[10px] italic leading-tight text-slate-400">{st.owner.submits}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center align-top"><ComplianceCell v={st.compliance} /></td>
                      <td className="px-3 py-2.5 text-center align-top text-xs font-semibold text-amber-700">{st.exceptions}</td>
                      <td className="px-3 py-2.5 text-center align-top text-xs font-semibold text-red-700">{st.violations}</td>
                      <td className="px-3 py-2.5 align-top text-xs">
                        {missed.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> None
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {missed.map((c) => (
                              <span key={c.controlId} className="text-slate-700">
                                <span className="font-mono text-[10px] font-semibold text-red-700">{c.controlId}</span>
                                <span className="text-slate-600"> — {c.sopStep}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top"><StageHealthPill health={st.health} /></td>
                    </tr>
                    {isOpen && (
                      <tr className={`border-b border-slate-200 ${healthSoft(st.health)}`}>
                        <td colSpan={8} className="p-0 align-top">
                          <div className="space-y-3 px-4 py-5 sm:px-6">
                            <div className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                                <UserRound className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 text-xs">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Accountable submitter:</span>
                                <span className="ml-2 font-semibold text-slate-900">{st.owner.role}</span>
                                <span className="ml-2 text-slate-500">· {st.owner.team}</span>
                                <div className="mt-0.5 text-slate-600">
                                  <span className="font-semibold text-slate-700">Submits: </span>
                                  {st.owner.submits}
                                </div>
                              </div>
                            </div>

                            {st.mapped.length === 0 ? (
                              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm italic text-slate-500 ring-1 ring-slate-200">
                                <Info className="h-4 w-4" /> No controls mapped to this stage.
                              </div>
                            ) : (
                              st.mapped.map((c) => {
                                const hasMiss = c.exceptions > 0 || c.violations > 0;
                                const accent =
                                  c.violations > 0 ? "border-l-red-500" : c.exceptions > 0 ? "border-l-amber-500" : "border-l-emerald-500";
                                return (
                                  <div key={c.controlId} className={`rounded-lg border-l-4 bg-white p-4 ring-1 ring-slate-200 ${accent}`}>
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                      <span className="font-mono text-xs font-semibold text-slate-700">{c.controlId}</span>
                                      <span className="text-sm font-semibold text-slate-900">{c.sopStep}</span>
                                      <StatusBadge status={c.status} />
                                      {hasMiss && (
                                        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                                          <AlertTriangle className="h-3 w-3 shrink-0" /> Miss at stage
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                        <Gavel className="h-3 w-3" /> {c.primaryObligation}
                                      </span>
                                    </div>

                                    <div className="mt-2 rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
                                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                        {hasMiss ? "Why this is a miss" : "Control description"}
                                      </div>
                                      <p className="text-[13px] leading-relaxed text-slate-800">{c.controlDescription}</p>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span>Sampled <span className="font-semibold tabular-nums text-slate-800">{c.sample.toLocaleString("en-GB")}</span></span>
                                        <span className="font-semibold tabular-nums text-emerald-700">{c.sample - c.exceptions} passed</span>
                                        <span className="font-semibold tabular-nums text-amber-700">{c.exceptions} failed</span>
                                        <span className="font-semibold tabular-nums text-red-700">{c.violations} critical</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onOpenEvidence(c)}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 transition-colors hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                                      >
                                        <Eye className="h-3.5 w-3.5" /> Evidence
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
