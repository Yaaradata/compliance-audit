'use client';

import { useMemo } from 'react';
import type { ClassicPostureMetric } from '../types';
import {
  AI_PANEL_HEIGHT_PX,
  COCKPIT,
  COCKPIT_SURFACE,
  KPI_CARD_HEIGHT_PX,
  KPI_GRID_GAP_PX,
  kpiAccentColor,
  kpiTrendVisual,
  kpiValueColor,
} from './cockpitTokens';
import { buildKpiSparklineSeries, KpiTrendSparkline } from './kpi';

function MetricLabel({ metric }: { metric: ClassicPostureMetric }) {
  const base = metric.labelAbbr ? metric.label.replace(metric.labelAbbr, '').trimEnd() : metric.label;

  if (metric.labelAbbr && metric.labelAbbrTooltip) {
    return (
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]"
        title={metric.labelTooltip}
      >
        {base}{' '}
        <abbr title={metric.labelAbbrTooltip} className="cursor-help no-underline">
          {metric.labelAbbr}
        </abbr>
      </span>
    );
  }

  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]" title={metric.labelTooltip}>
      {metric.label}
    </span>
  );
}

function KpiCard({ metric }: { metric: ClassicPostureMetric }) {
  const accent = kpiAccentColor(metric.status);
  const valueColor = kpiValueColor(metric.status);
  const sparkline = useMemo(() => buildKpiSparklineSeries(metric), [metric]);
  const trendVisual = useMemo(
    () => kpiTrendVisual(metric.id, metric.trend, metric.status, sparkline),
    [metric.id, metric.trend, metric.status, sparkline],
  );
  const trendDisplay = trendVisual.arrow === '—' ? '→' : trendVisual.arrow;

  return (
    <article
      title={metric.tileTooltip}
      className={`flex overflow-hidden rounded-xl border-l-4 ${COCKPIT_SURFACE.card} py-2.5 pl-3 pr-2`}
      style={{
        height: KPI_CARD_HEIGHT_PX,
        borderLeftColor: accent,
        backgroundColor: COCKPIT.cardBg,
        borderColor: COCKPIT.cardBorder,
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between pr-2">
        <MetricLabel metric={metric} />
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[32px] font-bold leading-none" style={{ color: valueColor }}>
            {metric.value}
          </span>
          <span
            className="text-lg font-normal leading-none"
            style={{ color: trendVisual.textColor }}
            aria-label="Week-over-week trend"
          >
            {trendDisplay}
          </span>
        </div>
        <p
          className="line-clamp-2 text-[11px] leading-snug"
          style={{ color: metric.subTone === 'amber' ? COCKPIT.amber.text : COCKPIT.gray.g400 }}
        >
          {metric.sub}
        </p>
      </div>

      <div className="flex w-[42%] max-w-[108px] shrink-0 items-center self-stretch border-l border-[#E8EAED] pl-1.5">
        <KpiTrendSparkline data={sparkline} stroke={trendVisual.strokeColor} height={KPI_CARD_HEIGHT_PX - 20} />
      </div>
    </article>
  );
}

/** Left column — 2×2 KPI grid (58% above-fold). */
export function KpiBannerStrip({ metrics }: { metrics: ClassicPostureMetric[] }) {
  return (
    <section
      aria-label="KPI banner"
      className="shrink-0"
      style={{ height: AI_PANEL_HEIGHT_PX }}
    >
      <div className="grid h-full grid-cols-2" style={{ gap: KPI_GRID_GAP_PX }}>
        {metrics.map((m) => (
          <KpiCard key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}
