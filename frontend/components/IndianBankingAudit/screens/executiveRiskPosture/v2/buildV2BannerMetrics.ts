import {
  aggregateARS,
  aggregateCES,
  aggregateKRIBreachCounts,
  aggregateOpenIncidents30dDetail,
  aggregateRES,
  auditPacks,
  controls,
  getPostureDataRefreshAt,
  incidents,
  kriBreachCountByDomain,
  risks,
} from '../../../dataModel';
import type { ClassicPostureMetric, DomainHeatmapCell, MetricStatus, MetricTrendArrow } from '../types';
import { kpiMetricStatus } from './kpi/kpiMetricSpec';
import { POSTURE_DATA_REFRESH_CADENCE_MINUTES, RED_POSTURE_RES_THRESHOLD } from './constants';

function metricStatusFromCount(count: number, goodMax: number, warnMax: number): MetricStatus {
  if (count <= goodMax) return 'good';
  if (count <= warnMax) return 'warning';
  return 'danger';
}

/** WoW arrow = how the metric value moved; colour applies polarity in kpiWowArrowVisual. */
function wowTrend(current: number, prior: number | null): MetricTrendArrow {
  if (prior == null || Number.isNaN(prior)) return '—';
  if (current === prior) return '→';
  return current > prior ? '↑' : '↓';
}

function countRedPostureDomains(domains: DomainHeatmapCell[], threshold = RED_POSTURE_RES_THRESHOLD): number {
  return domains.filter((d) => d.resScore < threshold).length;
}

function estimatedPriorResAggregate(): number {
  const adjusted = risks.map((r) => {
    if (r.residual_rating_trend === 'deteriorating' || r.residual_rating_trend === 'rapidly_deteriorating') {
      return Math.min(100, r.res_score + 5);
    }
    if (r.residual_rating_trend === 'improving') {
      return Math.max(0, r.res_score - 4);
    }
    return r.res_score;
  });
  return Math.round(adjusted.reduce((s, v) => s + v, 0) / Math.max(1, adjusted.length));
}

function priorWeekKriAsOfTs(): number {
  const refreshAt = getPostureDataRefreshAt(POSTURE_DATA_REFRESH_CADENCE_MINUTES).getTime();
  return refreshAt - 7 * 86400000;
}

function priorRedDomainCount(domains: DomainHeatmapCell[]): number {
  return domains.filter((d) => {
    let priorScore = d.resScore;
    if (d.trend === 'deteriorating') priorScore = Math.min(100, d.resScore + 6);
    else if (d.trend === 'improving') priorScore = Math.max(0, d.resScore - 4);
    return priorScore < RED_POSTURE_RES_THRESHOLD;
  }).length;
}

/** Prior-week CES proxy from control effectiveness drift in mock data. */
function estimatedPriorCesAggregate(): number | null {
  const scored = controls.filter((c) => c.ces != null);
  if (!scored.length) return null;
  const adjusted = scored.map((c) => {
    const ces = c.ces as number;
    if (c.ces_band === 'amber' || c.ces_band === 'red') return Math.min(100, ces + 3);
    if (c.ces_band === 'green') return Math.max(0, ces - 1);
    return ces;
  });
  return Math.round((adjusted.reduce((s, v) => s + v, 0) / adjusted.length) * 10) / 10;
}

function priorWeekOpenIncidents(): number {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 37);
  const t0 = cutoff.getTime();
  const cutoff30 = new Date();
  cutoff30.setHours(0, 0, 0, 0);
  cutoff30.setDate(cutoff30.getDate() - 30);
  const t30 = cutoff30.getTime();
  const closed = new Set(['closed', 'closed_no_loss']);
  const parse = (ymd: string) => new Date(ymd.includes('T') ? ymd : `${ymd}T12:00:00`).getTime();
  return incidents.filter((i) => {
    if (closed.has(i.status)) return false;
    const t = parse(i.discovered_date);
    return t >= t0 && t < t30;
  }).length;
}

const PRIMARY_KPI_IDS = new Set(['res', 'ces', 'kri', 'ars']);
const ORM_DEMOTED_IDS = new Set(['incidents', 'domains-red']);

function buildAllV2Metrics(domains: DomainHeatmapCell[]): ClassicPostureMetric[] {
  const res = aggregateRES();
  const priorRes = estimatedPriorResAggregate();
  const ces = aggregateCES();
  const priorCes = estimatedPriorCesAggregate();
  const kriNow = aggregateKRIBreachCounts();
  const kriPrior = aggregateKRIBreachCounts(priorWeekKriAsOfTs());
  const kriPctNow = kriNow.total ? (100 * kriNow.atAmber) / kriNow.total : 0;
  const kriPctPrior = kriPrior.total ? (100 * kriPrior.atAmber) / kriPrior.total : 0;
  const incidents = aggregateOpenIncidents30dDetail();
  const redCount = countRedPostureDomains(domains);
  const priorRed = priorRedDomainCount(domains);
  const ars = aggregateARS();
  const activePacks = auditPacks.length;
  const greenPacks = auditPacks.filter((p) => p.readiness_status === 'green').length;
  const amberRedPacks = auditPacks.length - greenPacks;
  const arsTrend: MetricTrendArrow =
    greenPacks > amberRedPacks ? '↑' : amberRedPacks > greenPacks ? '↓' : '→';

  const kriDomainTip = kriBreachCountByDomain()
    .map(({ domainId, count }) => `${domainId}: ${count}`)
    .join(', ');

  const priorIncidents = priorWeekOpenIncidents();

  return [
    {
      id: 'res',
      label: 'RES (Residual)',
      labelTooltip: 'Residual Exposure Score — enterprise mean of risk-level residual scores across nine ORM domains',
      value: String(res),
      sub: 'Enterprise mean · 9 risk domains',
      status: kpiMetricStatus('res', res),
      trend: wowTrend(res, priorRes),
    },
    {
      id: 'ces',
      label: 'CES (Controls)',
      labelTooltip: 'Control Effectiveness Score — weighted mean of active control effectiveness ratings',
      value: ces != null ? String(ces) : '—',
      sub: 'Active controls · weighted mean',
      status: ces != null ? kpiMetricStatus('ces', ces) : 'neutral',
      trend: ces != null && priorCes != null ? wowTrend(ces, priorCes) : '—',
    },
    {
      id: 'kri',
      label: 'KRI breach rate',
      labelTooltip: 'Key Risk Indicator breach rate — share of monitored KRIs at or above the amber threshold on latest observation',
      value: `${kriNow.pct}%`,
      sub: `${kriNow.atAmber} of ${kriNow.total} active KRIs · at or above amber`,
      status: kpiMetricStatus('kri', kriNow.pct),
      trend: wowTrend(kriPctNow, kriPctPrior),
      tileTooltip: kriDomainTip ? `By domain: ${kriDomainTip}` : 'No KRIs at amber threshold',
    },
    {
      id: 'incidents',
      label: 'Open incidents (30d)',
      labelTooltip: 'Operational incidents not closed with discovery date in the rolling 30-day window',
      value: String(incidents.open),
      sub: `${incidents.open} open · ${incidents.escalated} escalated · last 30 days`,
      status: metricStatusFromCount(incidents.open, 2, 6),
      trend: wowTrend(incidents.open, priorIncidents),
      subTone: incidents.escalated > 0 ? 'amber' : 'default',
    },
    {
      id: 'domains-red',
      label: 'Domains in red posture',
      labelTooltip: `Risk domains whose mean residual score is below the board appetite threshold (${RED_POSTURE_RES_THRESHOLD})`,
      value: String(redCount),
      sub: `${redCount} domain${redCount === 1 ? '' : 's'} below appetite threshold`,
      status: redCount > 0 ? 'danger' : 'good',
      trend: wowTrend(redCount, priorRed),
    },
    {
      id: 'ars',
      label: 'Inspection readiness',
      labelAbbr: '(ARS)',
      labelAbbrTooltip:
        'Audit Readiness Score — weighted composite across supervisory inspection packs',
      value: String(ars),
      sub: `${activePacks} packs active · weighted ARS`,
      status: kpiMetricStatus('ars', ars), // ≥85 green · 70–84 amber · <70 red
      trend: arsTrend,
    },
  ];
}

/** Above-fold 2×2 KPI grid — RES, CES, KRI breach, ARS only. */
export function buildV2PrimaryKpiMetrics(domains: DomainHeatmapCell[]): ClassicPostureMetric[] {
  return buildAllV2Metrics(domains).filter((m) => PRIMARY_KPI_IDS.has(m.id));
}

/** Demoted to ORM Heartbeat in Scroll Zone 2. */
export function buildV2OrmDemotedMetrics(domains: DomainHeatmapCell[]): ClassicPostureMetric[] {
  return buildAllV2Metrics(domains).filter((m) => ORM_DEMOTED_IDS.has(m.id));
}

/** @deprecated Use buildV2PrimaryKpiMetrics */
export function buildV2BannerMetrics(domains: DomainHeatmapCell[]): ClassicPostureMetric[] {
  return buildV2PrimaryKpiMetrics(domains);
}
