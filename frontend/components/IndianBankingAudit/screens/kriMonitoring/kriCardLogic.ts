import type { KriBand } from './kriMonitoringTokens';

export type KriTrend = 'up' | 'down' | 'flat';

const LOWER_IS_BETTER = true;

export function bandForValue(
  v: number,
  thresholds: { amber: number; red: number },
  lowerIsBetter = LOWER_IS_BETTER,
): KriBand {
  if (lowerIsBetter) {
    if (v >= thresholds.red) return 'red';
    if (v >= thresholds.amber) return 'amber';
    return 'green';
  }
  if (v <= thresholds.red) return 'red';
  if (v <= thresholds.amber) return 'amber';
  return 'green';
}

export function inferTrend(values: number[]): KriTrend {
  if (values.length < 2) return 'flat';
  const last3 = values.slice(-3);
  if (last3.length === 3 && last3[0] < last3[1] && last3[1] < last3[2]) return 'up';
  if (last3.length === 3 && last3[0] > last3[1] && last3[1] > last3[2]) return 'down';
  const first = values[0];
  const last = values[values.length - 1];
  const eps = Math.max(0.001, Math.abs(last) * 0.002);
  if (last > first + eps) return 'up';
  if (last < first - eps) return 'down';
  return 'flat';
}

export function isTrendImproving(trend: KriTrend, lowerIsBetter = LOWER_IS_BETTER): boolean {
  if (trend === 'flat') return false;
  return (lowerIsBetter && trend === 'down') || (!lowerIsBetter && trend === 'up');
}

export function formatKriValue(v: number, unit?: string): string {
  if (unit === 'ratio') return v.toFixed(3);
  if (v < 1 && v > 0) return v.toFixed(3);
  if (v < 10 && !Number.isInteger(v)) return v.toFixed(1);
  return String(v);
}

export function formatWowDelta(delta: number): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const abs = Math.abs(delta);
  const formatted = abs < 1 ? abs.toFixed(3) : abs < 10 ? abs.toFixed(2) : String(Math.round(abs * 10) / 10);
  return `${sign}${formatted} vs 4w`;
}

export function arrowSymbol(trend: KriTrend): string {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
}

export function formatUnitLabel(unit: string): string {
  return unit.replace(/_/g, ' ');
}

export function formatWeekLabel(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
