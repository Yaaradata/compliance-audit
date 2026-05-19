import {
  appetiteObservations,
  getAppetite,
  type AppetiteObservation,
} from '../../dataModel';
import { buildAtRiskClockChips, type AtRiskClockChip } from '../executiveRiskPosture/v2/zone2/buildAtRiskClockChips';

/** Metric breach rows shown in WCW column (STR + KFS ratios). */
const REPORTING_METRIC_IDS = ['APM-FC-001', 'APM-CD-001'] as const;

/**
 * Branch / period labels until observation carries explicit scope in data model.
 * TODO: replace with branch_id or period_label from appetite observation when wired.
 */
const OBSERVATION_SCOPE_LABEL: Record<string, string> = {
  'APOBS-FC-001-W17': 'Branch A',
  'APOBS-FC-001-W16': 'Branch B',
  'APOBS-CD-001-W17': 'Branch A',
  'APOBS-CD-001-W16': 'Branch B',
};

export type MetricBreachRow = {
  observationId: string;
  metricId: string;
  metricName: string;
  scopeLabel: string;
  value: number;
  threshold: number;
  breached: boolean;
  deltaDirection: 'down' | 'up' | 'flat';
  progressPct: number;
};

export type ReportingBreachesColumnData = {
  clockChips: AtRiskClockChip[];
  metricRows: MetricBreachRow[];
  clockCount: number;
  metricCount: number;
  countBadge: string;
};

function scopeLabelForObservation(obs: AppetiteObservation, indexInMetric: number): string {
  return (
    OBSERVATION_SCOPE_LABEL[obs.observation_id] ??
    (indexInMetric === 0 ? 'Branch A' : indexInMetric === 1 ? 'Branch B' : `Period ${indexInMetric + 1}`)
  );
}

function compareDelta(
  current: number,
  prior: number | null,
  breached: boolean,
): MetricBreachRow['deltaDirection'] {
  if (prior == null) return breached ? 'down' : 'flat';
  const diff = current - prior;
  if (Math.abs(diff) < 0.001) return 'flat';
  return diff < 0 ? 'down' : 'up';
}

function buildMetricBreachRows(): MetricBreachRow[] {
  const rows: MetricBreachRow[] = [];

  for (const metricId of REPORTING_METRIC_IDS) {
    const metric = getAppetite(metricId);
    if (!metric) continue;

    const obsForMetric = appetiteObservations
      .filter((o) => o.appetite_metric_id === metricId && (o.band === 'red' || o.band === 'amber'))
      .sort((a, b) => (a.as_of_ts > b.as_of_ts ? -1 : 1));

    obsForMetric.forEach((obs, index) => {
      const prior = obsForMetric[index + 1];
      const threshold = metric.board_approved_threshold;
      const breached = obs.value < threshold;

      rows.push({
        observationId: obs.observation_id,
        metricId,
        metricName: metric.name,
        scopeLabel: scopeLabelForObservation(obs, index),
        value: obs.value,
        threshold,
        breached,
        deltaDirection: compareDelta(obs.value, prior?.value ?? null, breached),
        progressPct: Math.min(100, Math.max(0, (obs.value / threshold) * 100)),
      });
    });
  }

  return rows;
}

/** Reporting breaches column: at-risk clocks + deduplicated metric threshold rows. */
export function buildReportingBreachesColumnData(): ReportingBreachesColumnData {
  const clockChips = buildAtRiskClockChips().sort((a, b) => {
    const order = ['RC-CTR', 'RC-STR-7BD'];
    return order.indexOf(a.clock.clock_id) - order.indexOf(b.clock.clock_id);
  });

  const metricRows = buildMetricBreachRows();
  const clockCount = clockChips.length;
  const metricCount = metricRows.length;

  return {
    clockChips,
    metricRows,
    clockCount,
    metricCount,
    countBadge: `${clockCount} clocks + ${metricCount} metrics`,
  };
}
