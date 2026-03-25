import Link from "next/link";
import type { ItExpertCycleRow } from "@/components/roles/shared/compliance-types";

type EvidenceCycleInsightCardProps = {
  row: ItExpertCycleRow;
  cycleDashboardHref: (cycleId: string) => string;
};

export function EvidenceCycleInsightCard({ row: c, cycleDashboardHref }: EvidenceCycleInsightCardProps) {
  return (
    <Link
      href={cycleDashboardHref(c.id)}
      className="block overflow-hidden rounded-2xl border p-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "var(--border)", background: "var(--background)" }}
    >
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              {c.label}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
              {c.displayId} · {c.phase} · {c.dueLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
              {c.assignedControls} controls
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                c.rejected > 0
                  ? "bg-rose-100 text-rose-700"
                  : c.inReview > 0
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {c.rejected > 0 ? "Needs response" : c.inReview > 0 ? "In review" : "Healthy"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3" style={{ background: "var(--background)" }}>
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Evidence Upload Progress
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              {c.evidenceDone}/{c.evidenceTotal} ({c.evidencePct}%)
            </p>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${Math.max(0, Math.min(100, c.evidencePct))}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Assigned Controls
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {c.assignedControls}
            </p>
          </div>
          <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Evidence Uploaded
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {c.evidenceDone}/{c.evidenceTotal}
            </p>
          </div>
          <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              AI Evaluated In Review
            </p>
            <p className="mt-1 text-sm font-semibold text-violet-700">{c.inReview}</p>
          </div>
          <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Review Succeeded
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">{c.approved}</p>
          </div>
          <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Reviewer Rejected
            </p>
            <p className="mt-1 text-sm font-semibold text-rose-700">{c.rejected}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

type ItExpertCycleInsightsSectionProps = {
  title: string;
  subtitle: string;
  cycleRows: ItExpertCycleRow[];
  loading: boolean;
  emptyMessage: string;
  cycleDashboardHref: (cycleId: string) => string;
};

export function ItExpertCycleInsightsSection({
  title,
  subtitle,
  cycleRows,
  loading,
  emptyMessage,
  cycleDashboardHref,
}: ItExpertCycleInsightsSectionProps) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 xl:col-span-2"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
        <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          {subtitle}
        </span>
      </div>
      <div className="space-y-3">
        {cycleRows.map((c) => (
          <EvidenceCycleInsightCard key={c.id} row={c} cycleDashboardHref={cycleDashboardHref} />
        ))}
        {!loading && cycleRows.length === 0 && (
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}
