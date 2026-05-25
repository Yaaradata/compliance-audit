"use client";

import { useState } from "react";
import type { PersonaId, ReportDefinition, Scope3MockData } from "./types";
import { isBoardHighLevel, isReadOnlyAuditor } from "./personaAccess";
import { Scope3DrilldownDrawer } from "./scope3-ui";
import { useScope3Toast } from "./scope3-feedback";

export function ReportingView({ data, persona }: { data: Scope3MockData; persona: PersonaId }) {
  const board = isBoardHighLevel(persona);
  const auditor = isReadOnlyAuditor(persona);
  const { pushToast } = useScope3Toast();
  const [selectedId, setSelectedId] = useState(data.reports[0]?.id ?? "");
  const [checklistReport, setChecklistReport] = useState<ReportDefinition | null>(null);

  const selected = data.reports.find((r) => r.id === selectedId) ?? data.reports[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Report catalog</h2>
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {data.reports.map((r) => (
              <li key={r.id} className="py-3">
                <button
                  type="button"
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset ${
                    selectedId === r.id ? "bg-[var(--primary-muted)]" : ""
                  }`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[var(--foreground)]">{r.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "Ready"
                          ? "bg-[var(--success-bg)] text-[var(--success)]"
                          : "bg-[var(--warning-bg)] text-[var(--warning)]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--foreground-muted)]">
                    Next deadline: {r.nextDeadline}
                    {r.lastGenerated && ` · Last: ${r.lastGenerated}`}
                  </div>
                  {r.missingFields && r.missingFields.length > 0 && (
                    <div className="mt-1 text-xs text-[var(--danger)]">Missing: {r.missingFields.join("; ")}</div>
                  )}
                </button>
                {!board && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-2">
                    <button
                      type="button"
                      className="rounded-md bg-[var(--primary)] px-2 py-1 text-xs font-medium text-white shadow-sm outline-none transition-colors hover:bg-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                      onClick={() => pushToast(`Generate queued: ${r.name}`, "info")}
                    >
                      Generate
                    </button>
                    {!auditor && (
                      <>
                        <ReportFormatExportButton label="PDF" onExport={(fmt) => pushToast(`Export: ${fmt}`, "info")} />
                        <ReportFormatExportButton label="Excel" onExport={(fmt) => pushToast(`Export: ${fmt}`, "info")} />
                        <ReportFormatExportButton label="JSON" onExport={(fmt) => pushToast(`Export: ${fmt}`, "info")} />
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Preview</h2>
          {selected ? (
            <div className="mt-3 text-sm text-[var(--foreground)]">
              <p className="font-medium">{selected.name}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
                {selected.previewBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 text-xs font-semibold text-[var(--primary)] hover:underline"
                onClick={() => setChecklistReport(selected)}
              >
                Full field checklist →
              </button>
              {!board && (
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--muted)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm outline-none transition-colors hover:bg-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                  onClick={() => pushToast("Assurance bundle staged (evidence hashes + methodology + control tests).", "info")}
                >
                  Stage assurance evidence bundle
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">No report selected.</p>
          )}
        </section>
      </div>

      <Scope3DrilldownDrawer
        open={checklistReport != null}
        onClose={() => setChecklistReport(null)}
        title={checklistReport?.name ?? ""}
        subtitle="Disclosure readiness checklist"
      >
        {checklistReport ? (
          <div className="space-y-4 text-sm">
            <p className="text-[var(--foreground-muted)]">
              Status: <span className="font-semibold text-[var(--foreground)]">{checklistReport.status}</span> · Next:{" "}
              {checklistReport.nextDeadline}
            </p>
            {checklistReport.missingFields && checklistReport.missingFields.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Missing fields</h3>
                <ul className="mt-2 space-y-3">
                  {checklistReport.missingFields.map((field) => (
                    <li key={field} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2">
                      <div className="font-medium text-[var(--foreground)]">{field}</div>
                      <div className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Remediation: pull source evidence from Controls → lineage step 2; re-run generate when cleared.
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[var(--foreground-muted)]">All mandatory fields satisfied for this template.</p>
            )}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">QA gates</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-[var(--foreground-muted)]">
                <li>Controller sign-off on category totals</li>
                <li>Legal review for forward-looking statements</li>
                <li>XBRL / taxonomy validation (where applicable)</li>
              </ol>
            </div>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function ReportFormatExportButton({ label, onExport }: { label: string; onExport: (label: string) => void }) {
  return (
    <button
      type="button"
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs hover:bg-[var(--muted)]"
      onClick={() => onExport(label)}
    >
      {label}
    </button>
  );
}
