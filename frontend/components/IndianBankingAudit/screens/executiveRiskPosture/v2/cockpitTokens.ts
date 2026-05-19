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
