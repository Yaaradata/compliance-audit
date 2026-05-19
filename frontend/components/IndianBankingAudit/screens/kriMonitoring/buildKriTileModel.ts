import type { KRI } from '../../dataModel';
import { getRisk, getRiskDomain, getSeniorManager, observationsForKRI } from '../../dataModel';
import {
  bandForValue,
  formatKriValue,
  formatUnitLabel,
  formatWowDelta,
  inferTrend,
} from './kriCardLogic';
import type { KriBand } from './kriMonitoringTokens';
import type { KriTrend } from './kriCardLogic';

export type KriTileModel = {
  code: string;
  riskCode: string;
  domain: string;
  name: string;
  value: number;
  valueDisplay: string;
  unitLabel: string;
  thresholds: { amber: number; red: number };
  band: KriBand;
  trend: KriTrend;
  wow: { delta: number; label: string };
  owner: string;
  ownerCode: string;
  seniorManagerId: string | null;
  spark: number[];
  insight: string | null;
  linkedRiskId: string;
};

export function buildKriTileModel(kri: KRI): KriTileModel {
  const obs = observationsForKRI(kri.kri_id).slice(-12);
  const spark = obs.map((o) => o.value);
  const latest = obs.length ? obs[obs.length - 1] : null;
  const value = latest?.value ?? 0;
  const band = (latest?.band === 'red' || latest?.band === 'amber' || latest?.band === 'green'
    ? latest.band
    : bandForValue(value, { amber: kri.threshold_amber, red: kri.threshold_red })) as KriBand;

  const trend = inferTrend(spark);
  const wowDelta =
    spark.length >= 5 ? spark[spark.length - 1] - spark[spark.length - 5] : spark.length >= 2 ? spark[spark.length - 1] - spark[0] : 0;

  const risk = getRisk(kri.linked_risk_id);
  const domain = getRiskDomain(risk?.domain_id ?? '')?.title ?? risk?.domain_id ?? '—';
  const sm = getSeniorManager(risk?.accountable_senior_manager_id ?? '');
  const ownerCode = sm?.role ?? sm?.senior_manager_id ?? '—';
  const owner = sm?.name ?? '—';

  return {
    code: kri.kri_id,
    riskCode: risk?.domain_id ?? kri.linked_risk_id.split('-').slice(0, 2).join('-'),
    domain,
    name: kri.name,
    value,
    valueDisplay: latest != null ? formatKriValue(latest.value, kri.unit) : '—',
    unitLabel: formatUnitLabel(kri.unit),
    thresholds: { amber: kri.threshold_amber, red: kri.threshold_red },
    band,
    trend,
    wow: { delta: wowDelta, label: formatWowDelta(wowDelta) },
    owner,
    ownerCode,
    seniorManagerId: sm?.senior_manager_id ?? null,
    spark,
    insight: kri.breach_summary ?? null,
    linkedRiskId: kri.linked_risk_id,
  };
}
