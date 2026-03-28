import Link from "next/link";
import type { UserRole } from "@/lib/types";
import { dashboardOutlineStyle } from "@/lib/dashboard-button-tokens";
import type { DeadlineRow, ItExpertDeadlineLinkRow } from "@/components/roles/shared/compliance-types";
import { phaseLabel } from "@/components/roles/shared/utils";

type UpcomingDeadlinesPanelProps = {
  deadlineRows: DeadlineRow[];
  loading: boolean;
  /** Open calendar; optional date focuses the month (same as clicking a row). */
  onOpenCalendar: (focusDate?: Date) => void;
  /** Outline color for “Calendar view” (matches role dashboard palette). */
  role?: UserRole | null;
};

/** Due date for a deadline row (for calendar month focus). */
export function deadlineRowCalendarDate(row: DeadlineRow): Date | undefined {
  const raw = row.cycle.target_submission_date ?? row.cycle.end_date;
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function UpcomingDeadlinesPanel({ deadlineRows, loading, onOpenCalendar, role }: UpcomingDeadlinesPanelProps) {
  const outline = dashboardOutlineStyle(role ?? null);
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          Upcoming deadlines
        </h3>
        <button
          type="button"
          onClick={() => onOpenCalendar()}
          className="interactive-outline-btn dashboard-btn-pill inline-flex shrink-0 items-center justify-center border-2 bg-white text-sm font-semibold shadow-sm"
          style={{ borderColor: outline.border, color: outline.text }}
        >
          Calendar view
        </button>
      </div>
      <div className="space-y-2">
        {deadlineRows.map((row) => (
          <button
            key={row.cycle.id}
            type="button"
            onClick={() => onOpenCalendar(deadlineRowCalendarDate(row))}
            className="w-full rounded-lg border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {row.cycle.label}
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              {phaseLabel(row.cycle.phase)} · {row.days <= 0 ? "Due today/overdue" : `${row.days} day(s) left`}
            </p>
          </button>
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
            className="interactive-card-link block rounded-lg border p-2.5"
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
