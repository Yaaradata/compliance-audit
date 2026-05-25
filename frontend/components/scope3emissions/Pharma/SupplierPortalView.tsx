"use client";

import { useState } from "react";
import type { Scope3MockData, SubmissionStatus } from "./types";
import { Scope3DrilldownDrawer } from "./scope3-ui";

type PortalTask = Scope3MockData["supplierPortal"]["openTasks"][number];
type PortalSubmission = Scope3MockData["supplierPortal"]["recentSubmissions"][number];

export function SupplierPortalView({ data }: { data: Scope3MockData }) {
  const p = data.supplierPortal;
  const pendingForTenant = data.pendingEsgRequests.filter((r) => r.supplierId === p.supplierId);
  const [taskDrill, setTaskDrill] = useState<PortalTask | null>(null);
  const [submissionDrill, setSubmissionDrill] = useState<PortalSubmission | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--foreground-muted)]">
        Signed in as <span className="font-semibold text-[var(--foreground)]">{p.supplierName}</span>
      </p>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending ESG requests</h2>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Procurement-initiated Scope 3 / ESG evidence asks routed to your organisation (GHG Protocol Category 1–4 alignment).
        </p>
        {pendingForTenant.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--foreground-muted)]">No outstanding requests — you are up to date.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {pendingForTenant.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[var(--foreground)]">{r.id}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">{r.status}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  Fields:{" "}
                  {r.requestedFields
                    .map((f) =>
                      f === "emissions_data"
                        ? "Emissions data"
                        : f === "certifications"
                          ? "Certifications"
                          : f === "energy_usage"
                            ? "Energy usage"
                            : "Lifecycle data",
                    )
                    .join(" · ")}
                </p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">Due {r.dueBy} · opened {r.createdAt}</p>
                {r.requesterNote ? (
                  <div className="mt-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs leading-relaxed text-[var(--foreground)]">
                    <span className="font-semibold text-[var(--foreground-muted)]">Buyer note: </span>
                    {r.requesterNote}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Open tasks</h2>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {p.openTasks.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg py-3 text-left text-sm outline-none transition-colors hover:bg-[var(--muted)]/40 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
                onClick={() => setTaskDrill(t)}
              >
                <div>
                  <div className="font-medium text-[var(--foreground)]">{t.label}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">Due {t.due}</div>
                </div>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">{t.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent submissions</h2>
        <ul className="mt-3 space-y-2">
          {p.recentSubmissions.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-left text-sm shadow-sm outline-none transition-colors hover:bg-[var(--primary-muted)]/25 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                onClick={() => setSubmissionDrill(h)}
              >
                <div className="font-medium text-[var(--foreground)]">{h.label}</div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  {h.submittedAt} · <span className="text-[var(--foreground)]">{h.outcome}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Scope3DrilldownDrawer
        open={taskDrill != null}
        onClose={() => setTaskDrill(null)}
        title={taskDrill?.label ?? ""}
        subtitle={taskDrill ? `Due ${taskDrill.due} · ${taskDrill.status}` : undefined}
      >
        {taskDrill ? (
          <TaskDetailBody status={taskDrill.status} />
        ) : null}
      </Scope3DrilldownDrawer>

      <Scope3DrilldownDrawer
        open={submissionDrill != null}
        onClose={() => setSubmissionDrill(null)}
        title={submissionDrill?.label ?? ""}
        subtitle={submissionDrill?.submittedAt}
      >
        {submissionDrill ? <SubmissionDetailBody outcome={submissionDrill.outcome} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function TaskDetailBody({ status }: { status: SubmissionStatus }) {
  return (
    <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
      <p>Portal workflow ID: PW-FY25-S3-042</p>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Steps</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>Download template and attach facility-level energy where requested.</li>
          <li>Upload supporting invoices (PDF) — max 25 MB per file.</li>
          <li>Submit for desk review; expect outcome within 10 business days.</li>
        </ol>
      </div>
      <p className="text-xs">
        Current status: <span className="font-semibold text-[var(--foreground)]">{status}</span>
      </p>
    </div>
  );
}

function SubmissionDetailBody({ outcome }: { outcome: string }) {
  return (
    <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
      <p>
        Outcome: <span className="font-semibold text-[var(--foreground)]">{outcome}</span>
      </p>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Reviewer notes</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>EF version aligned with corporate registry FY25.</li>
          <li>Minor allocation clarification accepted with footnote.</li>
        </ul>
      </div>
      <p className="text-xs">Download stamped acknowledgement from the attachments tab in your source system.</p>
    </div>
  );
}
