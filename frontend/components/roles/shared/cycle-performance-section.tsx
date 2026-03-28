import type { CycleInsight } from "@/components/roles/shared/compliance-types";
import { CyclePerformanceCard } from "@/components/roles/shared/cycle-performance-card";

type CyclePerformanceSectionProps = {
  sortedInsights: CycleInsight[];
  loading: boolean;
  onViewVisuals: (cycleId: string) => void;
  /** Called after a cycle is successfully deleted so parent state can refresh (KPIs, deadlines, etc.). */
  onCycleDeleted?: (cycleId: string) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  /** When true, omit `xl:col-span-2` so the section can sit stacked inside a left column wrapper. */
  stacked?: boolean;
};

export function CyclePerformanceSection({
  sortedInsights,
  loading,
  onViewVisuals,
  onCycleDeleted,
  title = "Cycle-wise performance",
  subtitle = "Status, progress, and direct navigation",
  emptyMessage = "No cycles available. Create your first assessment cycle to start tracking execution.",
  stacked = false,
}: CyclePerformanceSectionProps) {
  const visibleInsights = sortedInsights;

  return (
    <div
      className={`rounded-2xl border p-4 ${stacked ? "" : "xl:col-span-2"}`}
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
        {visibleInsights.map((row) => (
          <CyclePerformanceCard
            key={row.cycle.id}
            row={row}
            onViewVisuals={onViewVisuals}
            onDeleted={onCycleDeleted}
          />
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
