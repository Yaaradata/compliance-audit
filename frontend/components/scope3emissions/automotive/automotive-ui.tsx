"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";

export const autoPage = "flex flex-col gap-7";
export const autoPageTight = "flex flex-col gap-5";

export const AUTO_CHART_COLORS = ["#0d9488", "#2563eb", "#7c3aed", "#ea580c", "#e11d48", "#059669", "#0891b2", "#ca8a04"];

export type AutoKpiTone = "teal" | "blue" | "violet" | "amber" | "rose" | "emerald" | "primary" | "slate";

export const AUTO_KPI_TONES: Record<
  AutoKpiTone,
  { accent: string; soft: string; ring: string; gradient: string }
> = {
  teal: {
    accent: "#0d9488",
    soft: "rgba(13, 148, 136, 0.14)",
    ring: "rgba(13, 148, 136, 0.35)",
    gradient: "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
  },
  blue: {
    accent: "#2563eb",
    soft: "rgba(37, 99, 235, 0.14)",
    ring: "rgba(37, 99, 235, 0.35)",
    gradient: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
  },
  violet: {
    accent: "#7c3aed",
    soft: "rgba(124, 58, 237, 0.14)",
    ring: "rgba(124, 58, 237, 0.35)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
  },
  amber: {
    accent: "#d97706",
    soft: "rgba(217, 119, 6, 0.14)",
    ring: "rgba(217, 119, 6, 0.35)",
    gradient: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
  },
  rose: {
    accent: "#e11d48",
    soft: "rgba(225, 29, 72, 0.14)",
    ring: "rgba(225, 29, 72, 0.35)",
    gradient: "linear-gradient(135deg, #e11d48 0%, #fb7185 100%)",
  },
  emerald: {
    accent: "#059669",
    soft: "rgba(5, 150, 105, 0.14)",
    ring: "rgba(5, 150, 105, 0.35)",
    gradient: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
  },
  primary: {
    accent: "var(--primary)",
    soft: "color-mix(in srgb, var(--primary) 14%, transparent)",
    ring: "color-mix(in srgb, var(--primary) 35%, transparent)",
    gradient: "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, #60a5fa) 100%)",
  },
  slate: {
    accent: "#64748b",
    soft: "rgba(100, 116, 139, 0.14)",
    ring: "rgba(100, 116, 139, 0.35)",
    gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
  },
};

const KPI_TONE_CYCLE: AutoKpiTone[] = ["teal", "blue", "violet", "amber", "emerald", "rose", "primary", "slate"];

export function autoKpiToneAt(index: number): AutoKpiTone {
  return KPI_TONE_CYCLE[index % KPI_TONE_CYCLE.length]!;
}

export const autoCallout =
  "rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--muted)]/80 to-[var(--card)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground-muted)] shadow-sm";

export const autoSegmentGroup =
  "inline-flex w-full max-w-none flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--muted)]/60 via-[var(--card)] to-[var(--muted)]/40 p-1 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]";

/** Default active tab: light pill + dark text (readable without inline gradient). */
export function autoSegmentTabClass(active: boolean, gradient = false): string {
  return [
    "rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
    active
      ? gradient
        ? "text-white shadow-md"
        : "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-slate-900/[0.06] dark:ring-white/[0.08]"
      : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
  ].join(" ");
}

/** Active segment / tab tone — matches Intensity ratio “Products” pill. */
export const AUTO_DASHBOARD_TAB_TONE: AutoKpiTone = "blue";

export function autoSegmentTabStyle(active: boolean, tone: AutoKpiTone = AUTO_DASHBOARD_TAB_TONE): CSSProperties | undefined {
  if (!active) return undefined;
  const t = AUTO_KPI_TONES[tone];
  return { background: t.gradient, boxShadow: `0 4px 14px ${t.ring}` };
}

/** Use when applying `autoSegmentTabStyle` so label stays white on the gradient fill. */
export function autoSegmentTabClassWithGradient(active: boolean): string {
  return autoSegmentTabClass(active, active);
}

/** Shared class + inline style for dashboard segment/tab buttons. */
export function autoSegmentTabButtonProps(active: boolean, tone: AutoKpiTone = AUTO_DASHBOARD_TAB_TONE) {
  return {
    className: autoSegmentTabClassWithGradient(active),
    style: autoSegmentTabStyle(active, tone),
  };
}

export const autoBtnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#60a5fa] px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:shadow-lg hover:from-[#1d4ed8] hover:to-[#3b82f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2";

export const autoBtnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/50";

/** Renders Recharts only after the container has positive dimensions (avoids width/height -1 warnings). */
export function AutoResponsiveChart({
  children,
  minHeight = 160,
  className = "h-full w-full min-w-0",
}: {
  children: ReactElement;
  minHeight?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const w = Math.floor(width);
      const h = Math.floor(height);
      if (w > 0 && h > 0) {
        setSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {size ? (
        <ResponsiveContainer width={size.w} height={size.h} debounce={50}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

export function AutoChartBox({
  heightClass = "h-[280px]",
  children,
  minChartHeight = 160,
}: {
  heightClass?: string;
  children: ReactElement;
  minChartHeight?: number;
}) {
  return (
    <div
      className={`relative w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)]/80 bg-gradient-to-b from-[var(--surface)] to-[var(--card)] ${heightClass} min-h-[200px] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.04]`}
    >
      <div className="absolute inset-3 min-h-0">
        <AutoResponsiveChart minHeight={minChartHeight}>{children}</AutoResponsiveChart>
      </div>
    </div>
  );
}

export const autoTableShell =
  "overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.05]";

export const autoTable = "min-w-full w-full border-collapse text-sm";

export const autoTh =
  "border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)]/90 to-[var(--muted)]/50 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]";

export const autoTd = "border-b border-[var(--border)]/80 px-3 py-2.5 align-middle text-[var(--foreground)]";

export const autoTrInteractive =
  "cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--muted))]";

export function AutoKpiGrid({
  children,
  className = "",
  cols = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
}: {
  children: ReactNode;
  className?: string;
  cols?: string;
}) {
  return <div className={`grid gap-3 ${cols} ${className}`.trim()}>{children}</div>;
}

export function AutoKpiCard({
  label,
  value,
  sub,
  tone = "primary",
  icon: Icon,
  delta,
  deltaInvert,
  quality,
  confidence,
  barPct,
  barColor,
  accentColor,
  className = "",
  variant = "hero",
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: AutoKpiTone;
  icon?: LucideIcon;
  delta?: number;
  deltaInvert?: boolean;
  quality?: string;
  confidence?: number;
  barPct?: number;
  barColor?: string;
  /** Overrides tone accent for top bar, value, and icon (e.g. gas species). */
  accentColor?: string;
  className?: string;
  /** `hero` is the standard Scope 3 KPI layout across verticals. */
  variant?: "default" | "hero";
  onClick?: () => void;
}) {
  const t = AUTO_KPI_TONES[tone];
  const accent = accentColor ?? t.accent;
  const Tag = onClick ? "button" : "div";
  const bad = delta != null ? (deltaInvert ? delta > 0 : delta < 0) : false;
  const deltaColor = bad ? "var(--danger)" : "var(--success)";
  const hero = variant !== "default";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={[
        "group relative flex flex-col overflow-hidden text-left transition-all duration-200",
        hero
          ? [
              "rounded-xl border border-[var(--border)] bg-[var(--card)]",
              "shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]",
              onClick
                ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                : "hover:shadow-md",
            ].join(" ")
          : [
              "rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm",
              "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.05]",
              onClick
                ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                : "",
            ].join(" "),
        className,
      ].join(" ")}
      style={{
        boxShadow: `0 1px 3px rgb(0 0 0 / 0.05), inset 0 3px 0 0 ${accent}`,
      }}
    >
      {hero ? (
        <div
          className="h-1 w-full shrink-0 rounded-t-xl"
          style={{ background: accentColor ? accent : t.gradient }}
          aria-hidden
        />
      ) : null}
      <div
        className={[
          "pointer-events-none absolute rounded-full blur-2xl",
          hero ? "-right-4 -top-2 h-20 w-20 opacity-[0.14]" : "-right-6 -top-6 h-24 w-24 opacity-[0.12]",
        ].join(" ")}
        style={{ background: accent }}
        aria-hidden
      />
      {hero ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-25"
          style={{
            background: `linear-gradient(160deg, ${t.soft} 0%, transparent 55%)`,
          }}
          aria-hidden
        />
      ) : null}
      <div className={["relative z-10", hero ? "p-3.5" : "p-4"].join(" ")}>
        {quality ? (
          <div className="absolute right-3 top-3 z-20">
            <DataQualityChip tag={quality} confidence={confidence} />
          </div>
        ) : null}
        {Icon ? (
          <span
            className={[
              "absolute flex items-center justify-center shadow-sm",
              hero ? "right-3.5 top-3.5 h-9 w-9 rounded-xl text-white" : "right-4 top-4 h-8 w-8 rounded-lg",
            ].join(" ")}
            style={
              hero
                ? {
                    background: accentColor ? accent : t.gradient,
                    boxShadow: `0 4px 12px -3px ${accentColor ? `color-mix(in srgb, ${accent} 35%, transparent)` : t.ring}`,
                  }
                : { background: t.soft, color: accent }
            }
          >
            <Icon className={`h-4 w-4 ${hero ? "text-white" : ""}`} aria-hidden strokeWidth={2} />
          </span>
        ) : null}
        <div className={Icon || quality ? "pr-11" : ""}>
          <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-[var(--foreground-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold leading-snug tracking-tight">
            <span className="tabular-nums" style={{ color: accent }}>
              {value}
            </span>
            {delta != null ? (
              <>
                {" "}
                <span
                  className="inline-flex align-middle rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums leading-none"
                  style={{ color: deltaColor, background: `color-mix(in srgb, ${deltaColor} 14%, transparent)` }}
                >
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
                </span>
                <span className="text-[10px] font-normal text-[var(--foreground-subtle)]"> vs prior year</span>
              </>
            ) : null}
          </p>
          {sub ? <p className="mt-0.5 text-[11px] leading-snug text-[var(--foreground-muted)]">{sub}</p> : null}
        </div>
        {barPct != null ? (
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(barPct, 100)}%`, background: barColor ?? t.gradient }}
            />
          </div>
        ) : null}
      </div>
    </Tag>
  );
}

export function AutoInsightCard({
  children,
  tone = "primary",
  className = "",
}: {
  children: ReactNode;
  tone?: AutoKpiTone;
  className?: string;
}) {
  const t = AUTO_KPI_TONES[tone];
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${className}`}
      style={{
        borderColor: `color-mix(in srgb, ${t.accent} 28%, var(--border))`,
        background: `linear-gradient(135deg, ${t.soft} 0%, var(--card) 70%)`,
        borderLeftWidth: 3,
        borderLeftColor: t.accent,
      }}
    >
      {children}
    </div>
  );
}

export function AutoRankRow({
  rank,
  label,
  value,
  barPct,
  tone = "primary",
  onClick,
}: {
  rank: number;
  label: string;
  value: string;
  barPct: number;
  tone?: AutoKpiTone;
  onClick?: () => void;
}) {
  const t = AUTO_KPI_TONES[tone];
  return (
    <li>
      <button
        type="button"
        className="flex w-full flex-col gap-1.5 rounded-lg px-1 py-1 text-left transition hover:bg-[var(--muted)]/40"
        onClick={onClick}
      >
        <div className="flex justify-between gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)]">
            <span
              className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
              style={{ background: t.gradient }}
            >
              {rank}
            </span>
            {label}
          </span>
          <span className="shrink-0 font-semibold tabular-nums" style={{ color: t.accent }}>
            {value}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
          <div className="h-full rounded-full" style={{ width: `${Math.min(barPct, 100)}%`, background: t.accent }} />
        </div>
      </button>
    </li>
  );
}

export function formatTCO2e(n: number, compact = false): string {
  if (compact && n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mt`;
  if (compact && n >= 1_000) return `${(n / 1_000).toFixed(1)} kt`;
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)} t`;
}

export function riskColor(level: string): string {
  if (level === "High" || level === "Non-compliant" || level === "critical") return "var(--danger)";
  if (level === "Medium" || level === "At risk" || level === "warning") return "var(--warning)";
  return "var(--success)";
}

export function DataQualityChip({ tag, confidence }: { tag: string; confidence?: number }) {
  const cls =
    tag === "Actual"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      : tag === "Estimated"
        ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
        : "bg-slate-500/15 text-slate-700 dark:text-slate-200";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${cls}`}>
      {tag}
      {confidence != null ? <span className="opacity-80">{confidence}%</span> : null}
    </span>
  );
}

export function statusBadgeClass(status: string): string {
  const base = "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";
  if (status === "On track" || status === "Compliant" || status === "Mapped" || status === "Ready")
    return `${base} bg-emerald-500/15 text-emerald-800 dark:text-emerald-200`;
  if (status === "At risk" || status === "Partial" || status === "Draft")
    return `${base} bg-amber-500/15 text-amber-900 dark:text-amber-100`;
  return `${base} bg-red-500/15 text-red-800 dark:text-red-200`;
}
