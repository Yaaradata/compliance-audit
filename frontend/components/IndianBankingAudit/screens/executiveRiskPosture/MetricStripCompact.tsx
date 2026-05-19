'use client';

import type { CompactPostureMetric, TrendBadgeTone } from './types';

const TREND_BADGE: Record<TrendBadgeTone, string> = {
  up: 'bg-rose-50 text-rose-700 ring-rose-200/80',
  down: 'bg-amber-50 text-amber-700 ring-amber-200/80',
  stable: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
};

const TREND_ARROW: Record<TrendBadgeTone, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

function TrendBadge({ label, tone }: { label: string; tone: TrendBadgeTone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${TREND_BADGE[tone]}`}
    >
      <span aria-hidden>{TREND_ARROW[tone]}</span>
      {label}
    </span>
  );
}

function CompactMetricCard({ metric }: { metric: CompactPostureMetric }) {
  return (
    <article className="relative flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900/80">{metric.label}</h3>
        <TrendBadge label={metric.trendLabel} tone={metric.trendTone} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold leading-none text-slate-900">{metric.value}</span>
        {metric.valueSuffix ? (
          <span className="text-sm font-medium text-slate-400">{metric.valueSuffix}</span>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-500">{metric.sub}</p>
    </article>
  );
}

export function MetricStripCompact({ metrics }: { metrics: CompactPostureMetric[] }) {
  return (
    <section aria-label="Executive posture metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {metrics.map((m) => (
        <CompactMetricCard key={m.id} metric={m} />
      ))}
    </section>
  );
}
