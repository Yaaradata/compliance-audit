import type { Band, Trend } from '../../theme';

export type MetricStatus = 'good' | 'warning' | 'danger' | 'neutral';

export type MetricTrendArrow = '↑' | '↓' | '→' | '—';

/** v1 — horizontal strip with coloured top border and arrow trend. */
export type ClassicPostureMetric = {
  id: string;
  label: string;
  value: string;
  sub: string;
  status: MetricStatus;
  trend: MetricTrendArrow;
  /** Full-label tooltip (v2 — undefined acronyms). */
  labelTooltip?: string;
  /** Inline abbreviation with its own tooltip, e.g. ARS in inspection readiness label. */
  labelAbbr?: string;
  labelAbbrTooltip?: string;
  /** Hover on tile body (e.g. KRI breach by domain). */
  tileTooltip?: string;
  /** Sub-label emphasis when escalated count > 0. */
  subTone?: 'amber' | 'default';
};

/** v2 — 2×2 cards with WoW badge. */
export type TrendBadgeTone = 'up' | 'down' | 'stable';

export type CompactPostureMetric = {
  id: string;
  label: string;
  value: string;
  valueSuffix?: string;
  sub: string;
  status: MetricStatus;
  trendLabel: string;
  trendTone: TrendBadgeTone;
};

export type DomainHeatmapCell = {
  domainId: string;
  code: string;
  title: string;
  regulatoryAnchor: string;
  resScore: number;
  band: Band;
  trend: Trend;
  riskCount: number;
  openIssueCount: number;
  primaryRiskId: string | null;
};

export type ExecutiveRiskPostureViewModel = {
  classicMetrics: ClassicPostureMetric[];
  compactMetrics: CompactPostureMetric[];
  domains: DomainHeatmapCell[];
  atRiskClockCount: number;
};
