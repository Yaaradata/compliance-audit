"use client";

import Link from "next/link";
import type { UserRole } from "@/lib/types";
import { dashboardOutlineStyle } from "@/lib/dashboard-button-tokens";
import type { DeadlineRow } from "@/components/roles/shared/compliance-types";
import { deadlineRowCalendarDate } from "@/components/roles/shared/deadline-panels";
import { phaseLabel } from "@/components/roles/shared/utils";

/** Deadlines with links into the review workspace; calendar UX matches UpcomingDeadlinesPanel. */
export function ReviewerReviewDeadlinesPanel({
  deadlineRows,
  loading,
  onOpenCalendar,
  role,
}: {
  deadlineRows: DeadlineRow[];
  loading: boolean;
  onOpenCalendar: (focusDate?: Date) => void;
  role?: UserRole | null;
}) {
  const outline = dashboardOutlineStyle(role ?? null);
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            Submission deadlines
          </h3>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Plan reviews before these dates — open the queue for each cycle
          </p>
        </div>
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
          <div
            key={row.cycle.id}
            className="relative overflow-hidden rounded-lg border text-left"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <button
              type="button"
              className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              aria-label={`Open calendar for ${row.cycle.label}`}
              onClick={() => onOpenCalendar(deadlineRowCalendarDate(row))}
            />
            <div className="relative z-20 p-2.5">
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {row.cycle.label}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {phaseLabel(row.cycle.phase)} · {row.days <= 0 ? "Due today / overdue" : `${row.days} day(s) left`}
              </p>
              <Link
                href={`/cycles/${row.cycle.id}/review`}
                onClick={(e) => e.stopPropagation()}
                className="relative z-30 mt-1 inline-block text-xs font-semibold"
                style={{ color: "var(--primary)" }}
              >
                Review queue →
              </Link>
            </div>
          </div>
        ))}
        {!loading && deadlineRows.length === 0 && (
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            No submission deadlines on your assigned cycles.
          </p>
        )}
      </div>
    </div>
  );
}
