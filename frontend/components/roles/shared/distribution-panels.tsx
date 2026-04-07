"use client";

import Link from "next/link";
import type { UserRole } from "@/lib/types";
import { dashboardOutlineStyle } from "@/lib/dashboard-button-tokens";
import type {
  ComplianceOverviewData,
  CycleInsight,
  ItExpertVisualization,
  ReviewerQueueOverviewData,
} from "@/components/roles/shared/compliance-types";
import { PlotlyDonutChart } from "@/components/roles/shared/plotly-donut-chart";

type ComplianceOverviewPanelProps = {
  complianceOverview: ComplianceOverviewData;
  hasSelectedCycle: boolean;
  onShowAllCycles: () => void;
  /** Multi-cycle home dashboards: scope donut to one cycle (same pattern as reviewer queue overview). */
  visualCycleId?: string | null;
  onVisualCycleChange?: (cycleId: string | null) => void;
  cycleOptions?: { id: string; display_id: string }[];
  /** Outline color for header actions (Details, Show all cycles). */
  role?: UserRole | null;
};

export function ComplianceOverviewPanel({
  complianceOverview,
  hasSelectedCycle,
  onShowAllCycles,
  visualCycleId,
  onVisualCycleChange,
  cycleOptions,
  role,
}: ComplianceOverviewPanelProps) {
  const co = complianceOverview;
  const outline = dashboardOutlineStyle(role ?? null);
  const showScope = Boolean(cycleOptions?.length && onVisualCycleChange);
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          Compliance Overview
        </h3>
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
              onClick={onShowAllCycles}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PlotlyDonutChart
          values={co.rows.map((r) => r.count)}
          labels={co.rows.map((r) => r.label)}
          colors={co.rows.map((r) => r.color)}
          centerPct={co.center}
          centerCaption={co.centerLabel}
          hole={0.7}
          hoverTemplate="%{label}: %{value} cycles (%{percent})<extra></extra>"
        />
        <div className="flex-1 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
            Cycle Distribution ({co.totalCycles} cycles)
          </p>
          {co.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: row.color }} />
                <span style={{ color: "var(--foreground)" }}>{row.label}</span>
              </div>
              <span className="font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
                {row.value}% ({row.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ReviewerQueueOverviewPanelProps = {
  data: ReviewerQueueOverviewData;
  hasSelectedCycle: boolean;
  onShowAllCycles: () => void;
  title?: string;
  /** Replaces default “Queue distribution (N items at this tier)”. */
  distributionCaption?: string;
  visualCycleId?: string | null;
  onVisualCycleChange?: (cycleId: string | null) => void;
  cycleOptions?: { id: string; display_id: string }[];
};

/** Same shell as Compliance Overview; copy and metrics are reviewer / queue focused. */
export function ReviewerQueueOverviewPanel({
  data,
  hasSelectedCycle,
  onShowAllCycles,
  title = "Decision mix (this tier)",
  distributionCaption,
  visualCycleId,
  onVisualCycleChange,
  cycleOptions,
}: ReviewerQueueOverviewPanelProps) {
  const q = data;
  const caption =
    distributionCaption ?? `Queue distribution (${q.totalItems} items at this tier)`;
  const showScope = Boolean(cycleOptions?.length && onVisualCycleChange);
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h3>
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
              onClick={onShowAllCycles}
              className="interactive-text-link text-xs font-medium"
              style={{ color: "var(--primary)" }}
            >
              Show all cycles
            </button>
          )}
          <Link href="/report" className="interactive-text-link text-xs font-medium" style={{ color: "var(--primary)" }}>
            Reporting
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PlotlyDonutChart
          values={q.rows.map((r) => r.count)}
          labels={q.rows.map((r) => r.label)}
          colors={q.rows.map((r) => r.color)}
          centerPct={q.center}
          centerCaption={q.centerLabel}
          hole={0.7}
          hoverTemplate="%{label}: %{value} items (%{percent})<extra></extra>"
        />
        <div className="flex-1 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
            {caption}
          </p>
          {q.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: row.color }} />
                <span style={{ color: "var(--foreground)" }}>{row.label}</span>
              </div>
              <span className="font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
                {row.value}% ({row.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ItExpertVisualizationPanelProps = {
  visualization: ItExpertVisualization;
  visualCycleId: string | null;
  onVisualCycleChange: (cycleId: string | null) => void;
  assignedInsights: CycleInsight[];
  /** Defaults: Evidence Collection-specific copy. */
  heading?: string;
  subheading?: string;
};

export function ItExpertVisualizationPanel({
  visualization,
  visualCycleId,
  onVisualCycleChange,
  assignedInsights,
  heading = "Evidence Collection Visualization",
  subheading = "Evidence and review distribution",
}: ItExpertVisualizationPanelProps) {
  const v = visualization;
  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {heading}
        </h3>
        <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          {subheading}
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
          Scope: {v.selectedLabel}
        </p>
        <div className="flex items-center gap-2">
          {visualCycleId && (
            <button
              type="button"
              onClick={() => onVisualCycleChange(null)}
              className="interactive-text-link text-xs font-medium"
              style={{ color: "var(--primary)" }}
            >
              Show all cycles
            </button>
          )}
          <select
            className="interactive-select rounded-lg border px-2.5 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            value={visualCycleId ?? ""}
            onChange={(e) => onVisualCycleChange(e.target.value || null)}
          >
            <option value="">All assigned cycles</option>
            {assignedInsights.map((row) => (
              <option key={row.cycle.id} value={row.cycle.id}>
                {row.cycle.display_id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PlotlyDonutChart
          values={v.rows.map((r) => r.value)}
          labels={v.rows.map((r) => r.label)}
          colors={v.rows.map((r) => r.color)}
          centerPct={v.center}
          centerCaption={v.centerLabel}
          hole={0.68}
          hoverTemplate="%{label}: %{value} (%{percent})<extra></extra>"
        />
        <div className="flex-1 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
            Distribution ({v.total})
          </p>
          {v.rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} />
                <span style={{ color: "var(--foreground)" }}>{r.label}</span>
              </div>
              <span className="font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
