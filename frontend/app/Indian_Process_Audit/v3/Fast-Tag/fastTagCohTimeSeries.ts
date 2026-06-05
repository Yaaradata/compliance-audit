import { filterCases, type FastTagCaseLike } from './fastTagExecutiveMetrics';
import { getFastTagOverviewStrip } from './auditData';
import type { ExecTimeGrain, ExecTimeWindow, PeriodStatus } from './fastTagHobTimeSeries';
import { periodLabels, periodCaption } from './fastTagHobTimeSeries';

export type { ExecTimeGrain, ExecTimeWindow };
export { periodCaption };

export type SurgePeriodPoint = {
  label: string;
  rechargeFail: number;
  balMismatch: number;
  refundDelay: number;
  total: number;
  fill: string;
  status: PeriodStatus;
};

export type ExperiencePeriodPoint = {
  label: string;
  resolutionMin: number;
  experienceIndex: number;
  resolutionFill: string;
  experienceFill: string;
  status: PeriodStatus;
};

const STATUS_FILL: Record<PeriodStatus, string> = {
  good: '#059669',
  warn: '#f59e0b',
  bad: '#dc2626',
};

function stableBucket(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function surgeStatus(total: number, baseline: number): PeriodStatus {
  if (total <= baseline * 0.9) return 'good';
  if (total <= baseline * 1.2) return 'warn';
  return 'bad';
}

function experienceStatus(index: number): PeriodStatus {
  if (index >= 90) return 'good';
  if (index >= 80) return 'warn';
  return 'bad';
}

function resolutionStatus(minutes: number): PeriodStatus {
  if (minutes <= 26) return 'good';
  if (minutes <= 32) return 'warn';
  return 'bad';
}

/** Stacked CX finding surge by period. */
export function buildComplaintSurgeTimeSeries(
  cases: FastTagCaseLike[],
  region: string | null,
  grain: ExecTimeGrain,
  window: ExecTimeWindow,
): SurgePeriodPoint[] {
  const scoped = filterCases(
    cases.filter((k) => k.overallStatus !== 'compliant'),
    region,
  );
  const labels = periodLabels(grain, window);
  const n = labels.length;
  const baseline =
    scoped.length > 0 ? Math.max(1, Math.round(scoped.length / n / 3)) : 4;

  return labels.map((label, i) => {
    const slice = scoped.filter((k) => stableBucket(k.id + window, n) === i);
    const rechargeFail = slice.filter(
      (k) => k.failStageId === 'wallet' || k.failControlId === 'FT-06' || k.failControlId === 'FT-07',
    ).length;
    const balMismatch = slice.filter(
      (k) => k.failStageId === 'activate' || k.failControlId === 'FT-11',
    ).length;
    const refundDelay = slice.filter(
      (k) => k.failStageId === 'kyc' || k.failStageId === 'identity',
    ).length;
    const total = rechargeFail + balMismatch + refundDelay;
    const status = surgeStatus(total, baseline);
    return {
      label,
      rechargeFail,
      balMismatch,
      refundDelay,
      total,
      status,
      fill: STATUS_FILL[status],
    };
  });
}

/** Experience index + resolution proxy by period. */
export function buildExperienceTimeSeries(
  cases: FastTagCaseLike[],
  region: string | null,
  grain: ExecTimeGrain,
  window: ExecTimeWindow,
): ExperiencePeriodPoint[] {
  const scoped = filterCases(cases, region);
  const labels = periodLabels(grain, window);
  const n = labels.length;
  const baseIndex = getFastTagOverviewStrip().compliance;
  const failRate =
    scoped.length > 0
      ? scoped.filter((k) => k.overallStatus !== 'compliant').length / scoped.length
      : 0.2;

  return labels.map((label, i) => {
    const slice = scoped.filter((k) => stableBucket(k.id + window + 'x', n) === i);
    const dayFails = slice.filter((k) => k.overallStatus !== 'compliant').length;
    const pressure = slice.length > 0 ? dayFails / slice.length : failRate;
    const resolutionMin = Math.round(22 + pressure * 40 + (i % 5) * 1.2);
    const experienceIndex = Math.max(55, Math.round(baseIndex - i * 0.8 - pressure * 22));
    const expStatus = experienceStatus(experienceIndex);
    const resStatus = resolutionStatus(resolutionMin);
    const status: PeriodStatus =
      expStatus === 'bad' || resStatus === 'bad'
        ? 'bad'
        : expStatus === 'warn' || resStatus === 'warn'
          ? 'warn'
          : 'good';
    return {
      label,
      resolutionMin,
      experienceIndex,
      resolutionFill: STATUS_FILL[resStatus],
      experienceFill: STATUS_FILL[expStatus],
      status,
    };
  });
}

export function summarizeSurgeSeries(points: SurgePeriodPoint[]) {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const delta = last && prev ? last.total - prev.total : 0;
  return { last, delta, hotPeriods: points.filter((p) => p.status === 'bad').length };
}

export function summarizeExperienceSeries(points: ExperiencePeriodPoint[]) {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const indexDelta =
    last && prev ? Math.round((last.experienceIndex - prev.experienceIndex) * 10) / 10 : 0;
  return { last, indexDelta };
}
