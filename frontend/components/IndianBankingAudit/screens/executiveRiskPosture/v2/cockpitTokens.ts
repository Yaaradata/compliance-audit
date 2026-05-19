import type { ClassicPostureMetric, MetricStatus, MetricTrendArrow } from '../types';

/** v2 cockpit color tokens — layout pass only. */
export const COCKPIT = {
  pageBg: '#ECEEF2',
  cardBg: '#F6F7F9',
  cardBorder: '#DDE1E8',
  cardMuted: '#EFF1F4',
  aiPanelBg: '#0F0F2D',
  green: { text: '#16A34A', border: '#16A34A', tint: '#F0FDF4', bar: '#22C55E' },
  amber: { text: '#D97706', border: '#D97706', tint: '#FFFBEB', bar: '#F59E0B' },
  red: { text: '#DC2626', border: '#DC2626', tint: '#FEF2F2', bar: '#EF4444' },
  gray: { g900: '#111827', g700: '#374151', g500: '#6B7280', g400: '#9CA3AF' },
} as const;

export const KPI_CARD_HEIGHT_PX = 112;
export const KPI_GRID_GAP_PX = 12;
export const AI_PANEL_HEIGHT_PX = KPI_CARD_HEIGHT_PX * 2 + KPI_GRID_GAP_PX;
/** @deprecated Tiles are content-sized; see heatmap/heatmapTileTokens.ts */
export const HEATMAP_TILE_HEIGHT_PX = 72;

/** Shared Tailwind fragments for cockpit surfaces. */
export const COCKPIT_SURFACE = {
  card: 'rounded-lg border border-[#DDE1E8] bg-[#F6F7F9] shadow-sm',
  cardPad: 'px-4 py-3',
  pagePadX: 'px-8',
  sectionGap: 'gap-3',
  sectionPy: 'py-3',
} as const;

const STATUS_ACCENT: Record<MetricStatus, string> = {
  good: COCKPIT.green.border,
  warning: COCKPIT.amber.border,
  danger: COCKPIT.red.border,
  neutral: COCKPIT.gray.g400,
};

const STATUS_VALUE: Record<MetricStatus, string> = {
  good: COCKPIT.green.text,
  warning: COCKPIT.amber.text,
  danger: COCKPIT.red.text,
  neutral: COCKPIT.gray.g700,
};

const HIGHER_IS_BETTER: Record<string, boolean> = {
  res: true,
  ces: true,
  kri: false,
  ars: true,
  incidents: false,
  'domains-red': false,
};

export function kpiAccentColor(status: MetricStatus): string {
  return STATUS_ACCENT[status];
}

export function kpiValueColor(status: MetricStatus): string {
  return STATUS_VALUE[status];
}

/** Green/red/gray from WoW direction × metric polarity (higher-is-better vs lower-is-better). */
function trendIsImproving(metricId: string, trend: MetricTrendArrow): boolean {
  const higherIsBetter = HIGHER_IS_BETTER[metricId] ?? true;
  return (trend === '↑' && higherIsBetter) || (trend === '↓' && !higherIsBetter);
}

/** Infer value direction from sparkline endpoints when WoW is flat. */
export function inferTrendFromSeries(series: number[]): MetricTrendArrow | null {
  if (series.length < 2) return null;
  const first = series[0];
  const last = series[series.length - 1];
  const eps = Math.max(0.05, Math.abs(first) * 0.008);
  if (last > first + eps) return '↑';
  if (last < first - eps) return '↓';
  return null;
}

/**
 * Effective trend for color + sparkline: WoW arrow when ↑/↓; else sparkline slope;
 * flat plateau uses green only when status is good (never ash/grey).
 */
export function resolveKpiEffectiveTrend(
  metricId: string,
  wowTrend: MetricTrendArrow,
  series: number[],
): MetricTrendArrow {
  if (wowTrend === '↑' || wowTrend === '↓') return wowTrend;
  return inferTrendFromSeries(series) ?? '→';
}

export type KpiTrendVisual = {
  arrow: MetricTrendArrow;
  textColor: string;
  strokeColor: string;
};

/** Arrow + sparkline colors: direction × polarity; flat uses status (good = green, else red). */
export function kpiTrendVisual(
  metricId: string,
  wowTrend: MetricTrendArrow,
  status: MetricStatus,
  series: number[],
): KpiTrendVisual {
  const arrow = resolveKpiEffectiveTrend(metricId, wowTrend, series);
  const improved = arrow === '→' ? status === 'good' : trendIsImproving(metricId, arrow);
  return {
    arrow,
    textColor: improved ? COCKPIT.green.text : COCKPIT.red.text,
    strokeColor: improved ? COCKPIT.green.bar : COCKPIT.red.bar,
  };
}

export function kpiTrendColor(metricId: string, trend: MetricTrendArrow, status: MetricStatus = 'neutral'): string {
  return kpiTrendVisual(metricId, trend, status, []).textColor;
}

/** Sparkline stroke — same semantics as {@link kpiTrendColor}. */
export function kpiTrendStroke(metricId: string, trend: MetricTrendArrow, status: MetricStatus = 'neutral'): string {
  return kpiTrendVisual(metricId, trend, status, []).strokeColor;
}

export function heatmapScoreTone(score: number): 'green' | 'amber' | 'red' {
  if (score >= 75) return 'green';
  if (score >= 65) return 'amber';
  return 'red';
}

export const HEATMAP_TONE = {
  green: {
    text: COCKPIT.green.text,
    border: COCKPIT.green.border,
    bg: 'rgba(22,163,74,0.06)',
  },
  amber: {
    text: COCKPIT.amber.text,
    border: COCKPIT.amber.border,
    bg: 'rgba(217,119,6,0.06)',
  },
  red: {
    text: COCKPIT.red.text,
    border: COCKPIT.red.border,
    bg: 'rgba(220,38,38,0.06)',
  },
} as const;

export function signalBadgeStyles(badge: string): { badgeClass: string; borderClass: string } {
  const b = badge.toUpperCase();
  if (b === 'FRAUD' || b === 'AML') {
    return {
      badgeClass: 'bg-red-500/20 text-red-200',
      borderClass: 'border-l-red-500',
    };
  }
  if (b === 'REGULATORY') {
    return {
      badgeClass: 'bg-amber-500/20 text-amber-200',
      borderClass: 'border-l-amber-500',
    };
  }
  return {
    badgeClass: 'bg-violet-500/20 text-violet-200',
    borderClass: 'border-l-violet-500',
  };
}

export function signalBadgeStylesLight(badge: string): { badgeClass: string; borderClass: string } {
  const b = badge.toUpperCase();
  if (b === 'FRAUD' || b === 'AML') {
    return {
      badgeClass: 'bg-red-100 text-red-800',
      borderClass: 'border-l-red-500',
    };
  }
  if (b === 'REGULATORY') {
    return {
      badgeClass: 'bg-amber-100 text-amber-800',
      borderClass: 'border-l-amber-500',
    };
  }
  return {
    badgeClass: 'bg-violet-100 text-violet-800',
    borderClass: 'border-l-violet-500',
  };
}

export function displaySignalBadge(badge: string): string {
  const b = badge.toUpperCase();
  if (b === 'FRAUD' || b === 'REGULATORY') return b;
  if (b === 'CONTROL' || b === 'STRATEGIC' || b === 'ACCOUNTABILITY') return 'ANOMALY';
  return b;
}

export type KpiMetric = ClassicPostureMetric;
