"use client";

import Link from "next/link";
import type { DeadlineRow } from "@/components/roles/shared/compliance-types";
import { phaseLabel } from "@/components/roles/shared/utils";

/** Deadlines with links into the review workspace (not generic cycle dashboard). */
export function ReviewerReviewDeadlinesPanel({
  deadlineRows,
  loading,
  onOpenCalendar,
}: {
  deadlineRows: DeadlineRow[];
  loading: boolean;
  onOpenCalendar: () => void;
}) {
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
          onClick={onOpenCalendar}
          className="interactive-text-link shrink-0 text-xs font-medium"
          style={{ color: "var(--primary)" }}
        >
          Calendar
        </button>
      </div>
      <div className="space-y-2">
        {deadlineRows.map((row) => (
          <Link
            key={row.cycle.id}
            href={`/cycles/${row.cycle.id}/review`}
            className="interactive-card-link block rounded-lg border p-2.5"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {row.cycle.label}
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              {phaseLabel(row.cycle.phase)} · {row.days <= 0 ? "Due today / overdue" : `${row.days} day(s) left`} ·{" "}
              <span className="font-medium" style={{ color: "var(--primary)" }}>
                Review queue →
              </span>
            </p>
          </Link>
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
