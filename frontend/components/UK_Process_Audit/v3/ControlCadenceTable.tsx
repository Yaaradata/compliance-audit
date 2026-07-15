"use client";

import { ChevronRight } from "lucide-react";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";
import type { UkCadenceEvaluation } from "@/lib/UK_Process_Audit/v3";
import { CadenceStatusPill } from "./CadenceStrip";

export function ControlCadenceTable({
  rows,
  onOpenEvidence,
}: {
  rows: Array<UkAuditControl & { cadence: UkCadenceEvaluation }>;
  onOpenEvidence: (control: UkAuditControl) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Control register · cadence</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {rows.length} controls · UNARMED rows are hatched (unknown cadence ≠ failed test)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2.5">Control</th>
              <th className="px-4 py-2.5">Frequency</th>
              <th className="px-4 py-2.5">Last tested (ISO)</th>
              <th className="px-4 py-2.5 text-right">Days since</th>
              <th className="px-4 py-2.5">Cadence</th>
              <th className="px-4 py-2.5 text-right">Sample</th>
              <th className="px-4 py-2.5 text-right">Pass</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const unarmed = c.cadence.status === "UNARMED";
              return (
                <tr
                  key={c.controlId}
                  onClick={() => onOpenEvidence(c)}
                  className={`cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
                    unarmed
                      ? "bg-[repeating-linear-gradient(135deg,#f1f5f9_0_8px,#ffffff_8px_16px)]"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-slate-900">{c.controlId}</div>
                    <div className="mt-0.5 max-w-[220px] text-[11px] leading-snug text-slate-500">
                      {c.sopStep}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[12px] text-slate-700">
                    {c.testingFrequency}
                    {c.cadence.cadenceDays != null ? (
                      <div className="text-[11px] text-slate-400">{c.cadence.cadenceDays}d window</div>
                    ) : (
                      <div className="text-[11px] text-slate-400">No calendar window</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top tabular-nums text-[12px] text-slate-700">
                    {c.cadence.lastTestedAt ?? "—"}
                    {c.cadence.synthetic ? (
                      <div className="text-[10px] text-amber-700">synthetic</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums text-slate-700">
                    {c.cadence.daysSinceTest ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <CadenceStatusPill status={c.cadence.status} />
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums text-slate-700">
                    {c.sample}
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums font-semibold text-slate-900">
                    {c.compliance.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
