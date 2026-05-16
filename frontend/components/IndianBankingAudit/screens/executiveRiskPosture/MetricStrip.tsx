'use client';

import type { MetricStatus, PostureMetric } from './types';

const STATUS_BORDER: Record<MetricStatus, string> = {
  good: 'border-t-emerald-500',
  warning: 'border-t-amber-500',
  danger: 'border-t-rose-500',
  neutral: 'border-t-slate-400',
};

const STATUS_VALUE: Record<MetricStatus, string> = {
  good: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  neutral: 'text-slate-700',
};

const TREND_TONE: Record<MetricStatus, string> = {
  good: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
  neutral: 'text-slate-500',
};

function MetricCard({ metric }: { metric: PostureMetric }) {
  return (
    <article
      className={`min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm border-t-[3px] ${STATUS_BORDER[metric.status]}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{metric.label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold leading-none ${STATUS_VALUE[metric.status]}`}>
        {metric.value}
        {metric.trend ? <span className={`ml-1 text-sm font-normal ${TREND_TONE[metric.status]}`}>{metric.trend}</span> : null}
      </div>
      <p className="mt-1 text-[10px] leading-snug text-slate-500">{metric.sub}</p>
    </article>
  );
}

export function MetricStrip({ metrics }: { metrics: PostureMetric[] }) {
  return (
    <section aria-label="Executive posture metrics" className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => (
        <MetricCard key={m.id} metric={m} />
      ))}
    </section>
  );
}
