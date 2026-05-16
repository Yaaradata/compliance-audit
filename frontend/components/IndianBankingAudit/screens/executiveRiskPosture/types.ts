import type { Band, Trend } from '../../theme';

export type MetricStatus = 'good' | 'warning' | 'danger' | 'neutral';

export type PostureMetric = {
  id: string;
  label: string;
  value: string;
  sub: string;
  status: MetricStatus;
  trend?: string;
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
  metrics: PostureMetric[];
  domains: DomainHeatmapCell[];
  atRiskClockCount: number;
};
