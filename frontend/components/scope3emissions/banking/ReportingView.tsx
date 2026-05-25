"use client";

import { useState } from "react";
import type { BankPersonaId, BankScope3MockData, ReportDefinition } from "./types";
import { reportsSummaryOnly } from "./personaAccess";
import { Scope3DrilldownDrawer, Scope3Panel } from "../Pharma/scope3-ui";
import { bankBtnPrimary, bankBtnSecondary, bankCallout, bankPage } from "./banking-ui";

function statusBadge(s: ReportDefinition["status"]): string {
  if (s === "Ready") return "bg-emerald-600/15 text-emerald-900 dark:text-emerald-100";
  if (s === "Incomplete") return "bg-amber-600/15 text-amber-900 dark:text-amber-100";
  return "bg-slate-500/15 text-slate-800 dark:text-slate-100";
}

export function ReportingView({ data, persona }: { data: BankScope3MockData; persona: BankPersonaId }) {
  const summary = reportsSummaryOnly(persona);
  const [preview, setPreview] = useState<ReportDefinition | null>(null);

  return (
    <div className={bankPage}>
      {summary ? <p className={`${bankCallout} mb-6`}>CRO summary mode — download disabled for non-export views; use ESG / Compliance persona for full pack actions.</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {data.reports.map((r) => (
          <Scope3Panel key={r.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">{r.name}</div>
                <div className="mt-1 text-xs text-[var(--foreground-muted)]">{r.regulatoryBasis}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(r.status)}`}>{r.status}</span>
            </div>
            <dl className="grid gap-1 text-xs text-[var(--foreground-muted)]">
              <div className="flex justify-between gap-2">
                <dt>Deadline</dt>
                <dd className="font-mono text-[var(--foreground)]">{r.deadline}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Completeness</dt>
                <dd className="font-mono text-[var(--foreground)]">{r.completenessPct}%</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Last generated</dt>
                <dd className="font-mono text-[var(--foreground)]">{r.lastGenerated ?? "—"}</dd>
              </div>
            </dl>
            {r.missingFields.length ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-2 text-[11px] text-[var(--foreground-muted)]">
                Missing: {r.missingFields.join("; ")}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              <button type="button" className={bankBtnSecondary} onClick={() => setPreview(r)}>
                Generate preview
              </button>
              <button
                type="button"
                disabled={summary || r.status !== "Ready"}
                className={bankBtnPrimary}
              >
                Download
              </button>
            </div>
          </Scope3Panel>
        ))}
      </div>

      <Scope3DrilldownDrawer open={preview != null} title={preview?.name ?? "Preview"} onClose={() => setPreview(null)} size="lg">
        {preview ? (
          <div className="space-y-3 text-sm">
            <p className="text-[var(--foreground-muted)]">Skeleton preview — fields filled from mockData where completeness allows.</p>
            <ul className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
              <li className={preview.completenessPct > 80 ? "text-[var(--success)]" : "text-[var(--foreground)]"}>
                Financed emissions tables — {preview.completenessPct > 80 ? "OK" : "Partial"}
              </li>
              <li className={preview.missingFields.length ? "text-[var(--danger)]" : "text-[var(--success)]"}>
                Missing fields — {preview.missingFields.length ? preview.missingFields.join(", ") : "None flagged"}
              </li>
              <li className="text-[var(--foreground-muted)]">Regulatory basis: {preview.regulatoryBasis}</li>
            </ul>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}
