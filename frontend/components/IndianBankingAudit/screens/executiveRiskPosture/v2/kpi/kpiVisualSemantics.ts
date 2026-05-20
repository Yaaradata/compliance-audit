import type { MetricTrendArrow } from '../../types';
import { COCKPIT } from '../cockpitTokens';
import { kpiPolarity, kpiValueZone, parseKpiNumeric } from './kpiMetricSpec';

export { kpiPolarity } from './kpiMetricSpec';

export type KpiTrendColors = { text: string; stroke: string };

/** WoW glyph — map missing data to flat. */
export function resolveWowArrow(wowTrend: MetricTrendArrow): MetricTrendArrow {
  if (wowTrend === '—') return '→';
  return wowTrend;
}

/**
 * Trend colour from direction × polarity only (green = improving, red = worsening).
 * Flat (→) is never improving — shows red (no relief / no positive momentum).
 */
export function isImprovingTrend(metricId: string, direction: MetricTrendArrow): boolean {
  if (direction === '→' || direction === '—') return false;
  const higherIsBetter = kpiPolarity(metricId) === 'higher';
  return (direction === '↑' && higherIsBetter) || (direction === '↓' && !higherIsBetter);
}

export function trendColorsForDirection(metricId: string, direction: MetricTrendArrow): KpiTrendColors {
  const improved = isImprovingTrend(metricId, direction);
  return {
    text: improved ? COCKPIT.green.text : COCKPIT.red.text,
    stroke: improved ? COCKPIT.green.bar : COCKPIT.red.bar,
  };
}

const ZONE_VALUE: Record<'green' | 'amber' | 'red', string> = {
  green: COCKPIT.green.text,
  amber: COCKPIT.amber.text,
  red: COCKPIT.red.text,
};

const ZONE_ACCENT: Record<'green' | 'amber' | 'red', string> = {
  green: COCKPIT.green.border,
  amber: COCKPIT.amber.border,
  red: COCKPIT.red.border,
};

export function kpiValueColorForMetric(metricId: string, displayValue: string): string {
  return ZONE_VALUE[kpiValueZone(metricId, parseKpiNumeric(displayValue))];
}

export function kpiAccentColorForMetric(metricId: string, displayValue: string): string {
  return ZONE_ACCENT[kpiValueZone(metricId, parseKpiNumeric(displayValue))];
}

export type KpiWowArrowVisual = { arrow: MetricTrendArrow; textColor: string };

/** WoW arrow colour — WoW direction × polarity (flat → red). */
export function kpiWowArrowVisual(metricId: string, wowTrend: MetricTrendArrow): KpiWowArrowVisual {
  const arrow = resolveWowArrow(wowTrend);
  return { arrow, textColor: trendColorsForDirection(metricId, arrow).text };
}

/** Sparkline stroke — same rules as arrow (WoW direction × polarity). */
export function kpiSparklineStrokeColor(metricId: string, wowTrend: MetricTrendArrow): string {
  const direction = resolveWowArrow(wowTrend);
  return trendColorsForDirection(metricId, direction).stroke;
}
