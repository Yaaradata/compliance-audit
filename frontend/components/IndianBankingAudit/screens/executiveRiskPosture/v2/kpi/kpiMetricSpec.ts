import type { MetricStatus } from '../../types';

export type KpiMetricId = 'res' | 'ces' | 'kri' | 'ars';
export type KpiPolarity = 'higher' | 'lower';
export type KpiValueZone = 'green' | 'amber' | 'red';

const HIGHER_IS_BETTER: Set<string> = new Set(['res', 'ces', 'ars']);

/** Parse displayed KPI value to a number (strips % and other suffixes). */
export function parseKpiNumeric(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

export function kpiPolarity(metricId: string): KpiPolarity {
  return HIGHER_IS_BETTER.has(metricId) ? 'higher' : 'lower';
}

/**
 * Value zone thresholds (cockpit KPI rules).
 * RES / CES / ARS: ≥80 green · 65–79 amber · <65 red
 * KRI breach %:   <30 green · 30–59 amber · ≥60 red
 * ARS uses inspection pack thresholds: ≥85 green · 70–84 amber · <70 red
 */
export function kpiValueZone(metricId: string, value: number): KpiValueZone {
  switch (metricId) {
    case 'kri':
      if (value < 30) return 'green';
      if (value < 60) return 'amber';
      return 'red';
    case 'ars':
      if (value >= 85) return 'green';
      if (value >= 70) return 'amber';
      return 'red';
    case 'res':
    case 'ces':
    default:
      if (value >= 80) return 'green';
      if (value >= 65) return 'amber';
      return 'red';
  }
}

export function kpiMetricStatus(metricId: string, value: number): MetricStatus {
  const zone = kpiValueZone(metricId, value);
  if (zone === 'green') return 'good';
  if (zone === 'amber') return 'warning';
  return 'danger';
}
