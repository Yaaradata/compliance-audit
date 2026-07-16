"use client";

import { ChevronRight, Circle } from "lucide-react";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";
import type { EvidenceAgeCell } from "@/lib/UK_Process_Audit/liveIntel";
import { AutomationPill, NaturePill, ResidualPill, StatusPill } from "../shared/pills";

export function ControlTable({
  controls,
  onOpenEvidence,
  evidenceAgeByControlId,
}: {
  controls: UkAuditControl[];
  onOpenEvidence: (control: UkAuditControl) => void;
  /** When set (v3), show Evidence age column from artefacts — never lastTested labels. */
  evidenceAgeByControlId?: Record<string, EvidenceAgeCell>;
}) {
  const showAge = Boolean(evidenceAgeByControlId);

  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Control library</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {controls.length} controls in scope · click a row for the evidence pack
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-sm ${showAge ? "min-w-[980px]" : "min-w-[900px]"}`}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2.5">Control</th>
              <th className="px-4 py-2.5">SOP step</th>
              <th className="px-4 py-2.5">Obligation</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5 text-right">Sample</th>
              <th className="px-4 py-2.5 text-right">Exc.</th>
              <th className="px-4 py-2.5 text-right">Pass</th>
              {showAge ? <th className="px-4 py-2.5">Evidence age</th> : null}
              <th className="px-4 py-2.5">Residual</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr
                key={c.controlId}
                onClick={() => onOpenEvidence(c)}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 align-top">
                  <div className="font-semibold text-slate-900">{c.controlId}</div>
                  <div className="mt-0.5 max-w-[220px] text-[11px] leading-snug text-slate-500">
                    {c.controlOwnerRole}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-[240px] text-[13px] leading-snug text-slate-800">{c.sopStep}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">Step {c.stepNo}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="max-w-[220px] text-[12px] leading-snug text-slate-700">{c.primaryObligation}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{c.issuingBody}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-1">
                    <NaturePill nature={c.controlNature} />
                    <AutomationPill level={c.automationLevel} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-slate-700">{c.sample}</td>
                <td className="px-4 py-3 text-right align-top tabular-nums">
                  <span className={c.exceptions > 0 ? "font-semibold text-amber-600" : "text-slate-400"}>
                    {c.exceptions}
                  </span>
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums font-semibold text-slate-900">
                  {c.compliance.toFixed(1)}%
                </td>
                {showAge ? (
                  <td className="px-4 py-3 align-top">
                    <EvidenceAgeCellView cell={evidenceAgeByControlId?.[c.controlId]} />
                  </td>
                ) : null}
                <td className="px-4 py-3 align-top">
                  <ResidualPill risk={c.residualRisk} />
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-3 align-top text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EvidenceAgeCellView({ cell }: { cell: EvidenceAgeCell | undefined }) {
  if (!cell || cell.kind === "unarmed") {
    return (
      <span className="text-slate-400" title={cell?.tooltip ?? "Cadence unconfirmed"}>
        —
      </span>
    );
  }
  if (cell.kind === "armed-silent") {
    return (
      <span title="Armed · no evidence in window" className="inline-flex text-slate-500">
        <Circle className="h-4 w-4" strokeWidth={1.75} />
      </span>
    );
  }
  if (cell.daysSince == null) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <span
      className={`tabular-nums ${cell.overdueCadence ? "font-semibold text-amber-600" : "text-slate-600"}`}
    >
      {cell.daysSince}d
    </span>
  );
}
