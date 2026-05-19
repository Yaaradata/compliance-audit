import type { ClassicPostureMetric, MetricTrendArrow } from '../../types';
import { resolveWowArrow } from './kpiVisualSemantics';

const POINT_COUNT = 8;

function parseMetricNumeric(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function seedOffset(id: string): number {
  return id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 7;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function inferStartValue(current: number, trend: MetricTrendArrow): number {
  const delta = Math.max(1.5, current * 0.12);
  if (trend === '↑') return current - delta;
  if (trend === '↓') return current + delta;
  return current - delta * 0.35;
}

/** Nudge tail points so chart slope matches WoW direction used for stroke colour. */
function alignSparklineTail(
  series: number[],
  direction: MetricTrendArrow,
  current: number,
  max: number,
): number[] {
  if (direction === '→' || series.length < 4) return series;

  const out = [...series];
  const n = out.length;
  const bump = Math.max(0.6, current * 0.035);

  if (direction === '↑') {
    out[n - 3] = Math.round(clamp(current - bump * 2.2, 0, max) * 10) / 10;
    out[n - 2] = Math.round(clamp(current - bump, 0, max) * 10) / 10;
    out[n - 1] = current;
  } else {
    out[n - 3] = Math.round(clamp(current + bump * 2.2, 0, max) * 10) / 10;
    out[n - 2] = Math.round(clamp(current + bump, 0, max) * 10) / 10;
    out[n - 1] = current;
  }

  return out;
}

/** Eight-week demo series ending at the displayed KPI value (deterministic per metric). */
export function buildKpiSparklineSeries(metric: ClassicPostureMetric): number[] {
  const current = parseMetricNumeric(metric.value);
  const isPercent = metric.value.includes('%');
  const max = isPercent ? 100 : 100;

  const wowDirection = resolveWowArrow(metric.trend);
  const start = inferStartValue(current, wowDirection);
  const phase = seedOffset(metric.id);

  const series: number[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const t = i / (POINT_COUNT - 1);
    const base = start + (current - start) * t;
    const wobble = Math.sin((i + phase) * 0.95) * (max * 0.025);
    const point = i === POINT_COUNT - 1 ? current : base + wobble;
    series.push(Math.round(clamp(point, 0, max) * 10) / 10);
  }

  return alignSparklineTail(series, wowDirection, current, max);
}
