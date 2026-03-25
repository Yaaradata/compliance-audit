import Link from "next/link";
import type { ReviewerQueueRow } from "@/components/roles/shared/compliance-types";
import type { ReviewerHomeTier } from "@/components/roles/shared/utils";

const TIER_ACCENT: Record<ReviewerHomeTier, string> = {
  l1: "border-l-4 border-l-violet-500",
  l2: "border-l-4 border-l-indigo-500",
  l3: "border-l-4 border-l-amber-500",
};

type ReviewerQueueInsightCardProps = {
  row: ReviewerQueueRow;
  cycleReviewHref: (cycleId: string) => string;
  tier: ReviewerHomeTier;
  /** 1 = highest priority (most pending / soonest due) */
  priorityRank?: number;
};

export function ReviewerQueueInsightCard({
  row: c,
  cycleReviewHref,
  tier,
  priorityRank,
}: ReviewerQueueInsightCardProps) {
  const total = c.pending + c.approved + c.returned;
  const clearedPct = total > 0 ? Math.round((c.approved / total) * 100) : 0;
  const statusLabel =
    c.pending > 0 ? "Needs review" : c.returned > 0 ? "Returns open" : total > 0 ? "Cleared" : "Empty queue";

  const accent = TIER_ACCENT[tier];

  return (
    <Link
      href={cycleReviewHref(c.id)}
      className={`block overflow-hidden rounded-2xl border p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg ${accent}`}
      style={{ borderColor: "var(--border)", background: "var(--background)" }}
    >
      <div
        className="border-b px-4 py-3 sm:px-5"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {priorityRank != null && priorityRank <= 3 && c.pending > 0 && (
              <span className="mb-1 inline-block rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                Priority {priorityRank}
              </span>
            )}
            <p className="truncate text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              {c.label}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
              {c.displayId} · {c.phase} · {c.dueLabel}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
            <span className="rounded-md bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold text-violet-800 dark:text-violet-200">
              {c.pending} in queue
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                c.pending > 0
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                  : c.returned > 0
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5" style={{ background: "var(--background)" }}>
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Decisions at your tier
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              {clearedPct}% approved ({c.approved}/{total || 0})
            </p>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${Math.max(0, Math.min(100, clearedPct))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border px-2 py-2 sm:px-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Awaiting you
            </p>
            <p className="mt-1 text-lg font-bold text-violet-700 dark:text-violet-300">{c.pending}</p>
          </div>
          <div className="rounded-lg border px-2 py-2 sm:px-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Approved
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{c.approved}</p>
          </div>
          <div className="rounded-lg border px-2 py-2 sm:px-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Returned
            </p>
            <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">{c.returned}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs font-semibold" style={{ color: "var(--primary)" }}>
          Open review workspace →
        </p>
      </div>
    </Link>
  );
}

type ReviewerCycleInsightsSectionProps = {
  title: string;
  subtitle: string;
  cycleRows: ReviewerQueueRow[];
  loading: boolean;
  emptyMessage: string;
  cycleReviewHref: (cycleId: string) => string;
  tier: ReviewerHomeTier;
};

export function ReviewerCycleInsightsSection({
  title,
  subtitle,
  cycleRows,
  loading,
  emptyMessage,
  cycleReviewHref,
  tier,
}: ReviewerCycleInsightsSectionProps) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {title}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {cycleRows.map((c, idx) => (
          <ReviewerQueueInsightCard
            key={c.id}
            row={c}
            cycleReviewHref={cycleReviewHref}
            tier={tier}
            priorityRank={idx < 3 && c.pending > 0 ? idx + 1 : undefined}
          />
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
