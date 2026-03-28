"use client";

import Link from "next/link";
import type { UserRole } from "@/lib/types";
import type { CycleInsight } from "@/components/roles/shared/compliance-types";
import { CyclePerformanceCard } from "@/components/roles/shared/cycle-performance-card";
import { dashboardOutlineStyle } from "@/lib/dashboard-button-tokens";

type CyclePerformanceSectionProps = {
  sortedInsights: CycleInsight[];
  loading: boolean;
  /** Called after a cycle is successfully deleted so parent state can refresh (KPIs, deadlines, etc.). */
  onCycleDeleted?: (cycleId: string) => void;
  title?: string;
  emptyMessage?: string;
  /** When set with onVisualCycleChange and cycleOptions, shows header controls (cycle scope + Details). */
  visualCycleId?: string | null;
  onVisualCycleChange?: (cycleId: string | null) => void;
  cycleOptions?: { id: string; display_id: string }[];
  role?: UserRole | null;
  /** When true, omit `xl:col-span-2` so the section can sit stacked inside a left column wrapper. */
  stacked?: boolean;
};

export function CyclePerformanceSection({
  sortedInsights,
  loading,
  onCycleDeleted,
  title = "Cycle-wise performance",
  emptyMessage = "No cycles available. Create your first assessment cycle to start tracking execution.",
  visualCycleId,
  onVisualCycleChange,
  cycleOptions,
  role,
  stacked = false,
}: CyclePerformanceSectionProps) {
  const visibleInsights = sortedInsights;
  const outline = dashboardOutlineStyle(role ?? null);
  const showScope = Boolean(cycleOptions?.length && onVisualCycleChange);
  const hasSelectedCycle = visualCycleId !== null;

  return (
    <div
      className={`rounded-2xl border p-4 ${stacked ? "" : "xl:col-span-2"}`}
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {showScope && (
            <select
              className="interactive-select max-w-[200px] rounded-lg border px-2.5 py-1.5 text-xs"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
              value={visualCycleId ?? ""}
              onChange={(e) => onVisualCycleChange?.(e.target.value || null)}
            >
              <option value="">All assigned cycles</option>
              {cycleOptions!.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_id}
                </option>
              ))}
            </select>
          )}
          {hasSelectedCycle && (
            <button
              type="button"
              onClick={() => onVisualCycleChange?.(null)}
              className="interactive-outline-btn dashboard-btn-pill inline-flex items-center justify-center border-2 bg-white text-sm font-semibold"
              style={{ borderColor: outline.border, color: outline.text }}
            >
              Show all cycles
            </button>
          )}
          <Link
            href="/report"
            className="interactive-outline-btn dashboard-btn-pill inline-flex items-center justify-center border-2 bg-white text-sm font-semibold no-underline"
            style={{ borderColor: outline.border, color: outline.text }}
          >
            Details
          </Link>
        </div>
      </div>
      <div className="space-y-3">
        {visibleInsights.map((row) => (
          <CyclePerformanceCard key={row.cycle.id} row={row} onDeleted={onCycleDeleted} />
        ))}
        {!loading && visibleInsights.length === 0 && (
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}
