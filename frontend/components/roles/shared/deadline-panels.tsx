import Link from "next/link";
import type { DeadlineRow, ItExpertDeadlineLinkRow } from "@/components/roles/shared/compliance-types";
import { phaseLabel } from "@/components/roles/shared/utils";

type UpcomingDeadlinesPanelProps = {
  deadlineRows: DeadlineRow[];
  loading: boolean;
  onOpenCalendar: () => void;
};

export function UpcomingDeadlinesPanel({ deadlineRows, loading, onOpenCalendar }: UpcomingDeadlinesPanelProps) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          Upcoming deadlines
        </h3>
        <button
          type="button"
          onClick={onOpenCalendar}
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Calendar view
        </button>
      </div>
      <div className="space-y-2">
        {deadlineRows.map((row) => (
          <div
            key={row.cycle.id}
            className="rounded-lg border p-2.5"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {row.cycle.label}
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              {phaseLabel(row.cycle.phase)} · {row.days <= 0 ? "Due today/overdue" : `${row.days} day(s) left`}
            </p>
          </div>
        ))}
        {!loading && deadlineRows.length === 0 && (
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            No dated deadlines configured yet.
          </p>
        )}
      </div>
    </div>
  );
}

type DeadlineLinksSectionProps = {
  title: string;
  subtitle?: string;
  rows: ItExpertDeadlineLinkRow[];
  loading: boolean;
  emptyMessage: string;
  cycleDashboardHref: (cycleId: string) => string;
  /** When false, omits the outer card (for stacking with other sections in one card). */
  renderInCard?: boolean;
};

export function DeadlineLinksSection({
  title,
  subtitle,
  rows,
  loading,
  emptyMessage,
  cycleDashboardHref,
  renderInCard = true,
}: DeadlineLinksSectionProps) {
  const inner = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h3>
        {subtitle ? (
          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        {rows.map((d) => (
          <Link
            key={d.id}
            href={cycleDashboardHref(d.id)}
            className="block rounded-lg border p-2.5 transition hover:shadow-sm"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <p className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {d.label}
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              {d.displayId} · {d.phase}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {d.dueDateLabel}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  (d.dueIn ?? 99) <= 2 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {d.dueIn === null ? "No deadline" : d.dueIn <= 0 ? "Due now" : `${d.dueIn}d left`}
              </span>
            </div>
          </Link>
        ))}
        {!loading && rows.length === 0 && (
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            {emptyMessage}
          </p>
        )}
      </div>
    </>
  );

  if (!renderInCard) {
    return inner;
  }

  return (
    <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      {inner}
    </div>
  );
}
