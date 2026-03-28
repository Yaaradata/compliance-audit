import Link from "next/link";
import type { RoleDashboardKpiCard, StatKpiArticle } from "@/components/roles/shared/compliance-types";

type DashboardKpiGridProps = {
  items: RoleDashboardKpiCard[];
  loading: boolean;
  columnsClassName?: string;
  ariaLabel?: string;
};

/** KPI cards that navigate on click (e.g. compliance officer). */
export function DashboardKpiGrid({
  items,
  loading,
  columnsClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4",
  ariaLabel = "Compliance KPI cards",
}: DashboardKpiGridProps) {
  return (
    <section className={columnsClassName} aria-label={ariaLabel}>
      {items.map((kpi) => (
        <Link
          key={kpi.label}
          href={kpi.href}
          aria-label={kpi.aria}
          className="interactive-kpi-card group rounded-xl border p-3 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              {kpi.label}
            </p>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${kpi.tone}`}>Live</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {loading ? "—" : kpi.value}
          </p>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            {kpi.sub}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-1.5 rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${loading ? 20 : kpi.meter}%` }}
              aria-hidden
            />
          </div>
        </Link>
      ))}
    </section>
  );
}

type StatKpiArticleGridProps = {
  items: StatKpiArticle[];
  loading: boolean;
  ariaLabel?: string;
  columnsClassName?: string;
};

/** KPI stats as non-link articles (e.g. IT Expert). */
export function StatKpiArticleGrid({
  items,
  loading,
  ariaLabel = "Role KPI stat cards",
  columnsClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4",
}: StatKpiArticleGridProps) {
  return (
    <section className={columnsClassName} aria-label={ariaLabel}>
      {items.map((kpi) => (
        <article
          key={kpi.label}
          className="rounded-lg border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: "#e5e7eb", background: "#ffffff" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              {kpi.label}
            </p>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${kpi.tone}`}>Live</span>
          </div>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {kpi.value}
          </p>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            {kpi.sub}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-1.5 rounded-full transition-all ${kpi.meterBarClass ?? "bg-[var(--primary)]"}`}
              style={{ width: `${loading ? 20 : kpi.meter}%` }}
              aria-hidden
            />
          </div>
        </article>
      ))}
    </section>
  );
}