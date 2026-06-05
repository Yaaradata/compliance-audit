import { filterCases, type FastTagCaseLike } from './fastTagExecutiveMetrics';
import { TOLL_SETTLEMENT_SUMMARY } from './tollSettlementData';

export type ExecTimeGrain = 'week' | 'month' | 'year';
export type ExecTimeWindow = '7d' | '30d' | 'q1' | '1y';

export type PeriodStatus = 'good' | 'warn' | 'bad';

export type TollPeriodPoint = {
  label: string;
  actual: number;
  target: number;
  fill: string;
  status: PeriodStatus;
};

export type NewCustomerPeriodPoint = {
  label: string;
  newCount: number;
  activated: number;
  target: number;
  activationPct: number;
  digitalSharePct: number;
  fill: string;
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

function slotCount(grain: ExecTimeGrain, window: ExecTimeWindow): number {
  if (window === '7d') return grain === 'week' ? 7 : grain === 'month' ? 7 : 1;
  if (window === '30d') return grain === 'week' ? 4 : grain === 'month' ? 4 : 1;
  if (window === '1y') return grain === 'week' ? 12 : grain === 'month' ? 12 : 4;
  // q1
  return grain === 'week' ? 13 : grain === 'month' ? 3 : 1;
}

export function periodLabels(grain: ExecTimeGrain, window: ExecTimeWindow): string[] {
  const n = slotCount(grain, window);
  if (window === '7d' && grain === 'week') {
    return ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  }
  if (window === '30d' && grain === 'week') {
    return ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
  }
  if (window === 'q1' && grain === 'month') {
    return ['Jan', 'Feb', 'Mar'];
  }
  if (window === 'q1' && grain === 'week') {
    return Array.from({ length: 13 }, (_, i) => `W${i + 1}`);
  }
  if (window === '1y' && grain === 'month') {
    return ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  }
  if (window === '1y' && grain === 'year') {
    return ['Q2', 'Q3', 'Q4', 'Q1'];
  }
  if (grain === 'year') {
    return window === 'q1' ? ['Q1'] : ['FY'];
  }
  return Array.from({ length: n }, (_, i) => `P${i + 1}`);
}

export function periodCaption(grain: ExecTimeGrain, window: ExecTimeWindow): string {
  const map: Record<ExecTimeWindow, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    q1: 'Q1 2026',
    '1y': 'Last 12 months',
  };
  const grainLabel = grain === 'week' ? 'by week' : grain === 'month' ? 'by month' : 'by year';
  return `${map[window]} · ${grainLabel}`;
}

function tollStatus(actual: number, target: number): PeriodStatus {
  const ratio = target > 0 ? actual / target : 1;
  if (ratio >= 0.98) return 'good';
  if (ratio >= 0.9) return 'warn';
  return 'bad';
}

function isRetailSegment(segment?: string): boolean {
  const s = (segment ?? '').toLowerCase();
  if (s.includes('fleet') || s.includes('courier') || s.includes('field') || s.includes('branch') || s.includes('neft')) {
    return false;
  }
  return true;
}

function newCustomerStatus(newCount: number, target: number, activationPct: number): PeriodStatus {
  const hitPlan = target > 0 ? newCount / target : 1;
  if (hitPlan >= 0.98 && activationPct >= 90) return 'good';
  if (hitPlan >= 0.9 && activationPct >= 85) return 'warn';
  return 'bad';
}

/** Toll debit volume by period (₹ crore) — colored vs plan. */
export function buildTollDebitTimeSeries(
  _cases: FastTagCaseLike[],
  region: string | null,
  grain: ExecTimeGrain,
  window: ExecTimeWindow,
): TollPeriodPoint[] {
  const labels = periodLabels(grain, window);
  const baseCr = TOLL_SETTLEMENT_SUMMARY.totalDebits / 1_00_00_000;
  const regionScale = region ? 0.12 + stableBucket(region, 10) * 0.04 : 1;
  const total = baseCr * regionScale;
  const n = labels.length;

  return labels.map((label, i) => {
    const wave = 0.78 + (i / Math.max(n - 1, 1)) * 0.24 + Math.sin(i * 0.9) * 0.04;
    const actual = Number((total * wave).toFixed(2));
    const target = Number((actual * (0.94 + (i % 4) * 0.015)).toFixed(2));
    const status = tollStatus(actual, target);
    return { label, actual, target, status, fill: STATUS_FILL[status] };
  });
}

/** Retail new-customer issuances by period (scaled from audit sample). */
export function buildNewCustomerTimeSeries(
  cases: FastTagCaseLike[],
  region: string | null,
  grain: ExecTimeGrain,
  window: ExecTimeWindow,
): NewCustomerPeriodPoint[] {
  const scoped = filterCases(cases, region);
  const retail = scoped.filter((k) => isRetailSegment(k.segment));
  const labels = periodLabels(grain, window);
  const n = labels.length;
  const scale = Math.max(1, Math.round(1400 / Math.max(scoped.length, 1)));

  return labels.map((label, i) => {
    const slice = retail.filter((k) => stableBucket(k.id + window, n) === i);
    const wave = 0.82 + (i / Math.max(n - 1, 1)) * 0.28 + Math.sin(i * 0.75) * 0.06;
    const base = retail.length > 0 ? Math.max(1, Math.round((retail.length / n) * scale * wave)) : Math.round(18 * scale * wave * 0.04);
    const newCount =
      slice.length > 0 ? Math.max(1, Math.round(slice.length * scale * wave)) : base;
    const activatedRaw = slice.filter((k) => k.overallStatus === 'compliant').length;
    const activated =
      slice.length > 0
        ? Math.max(0, Math.round(activatedRaw * scale * wave))
        : Math.round(newCount * (0.86 + (stableBucket(label, 11) % 8) * 0.012));
    const target = Math.round(newCount * (1.02 + (i % 3) * 0.01));
    const activationPct =
      newCount > 0 ? Math.round((activated / newCount) * 1000) / 10 : 88 + (stableBucket(label, 7) % 6);
    const digitalSharePct = 58 + (stableBucket(label + window, 17) % 22);
    const status = newCustomerStatus(newCount, target, activationPct);
    return {
      label,
      newCount,
      activated,
      target,
      activationPct,
      digitalSharePct,
      status,
      fill: STATUS_FILL[status],
    };
  });
}

export function summarizeTollSeries(points: TollPeriodPoint[]) {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const mom =
    last && prev && prev.actual > 0
      ? Math.round(((last.actual - prev.actual) / prev.actual) * 1000) / 10
      : 0;
  return { last, mom, breachCount: points.filter((p) => p.status === 'bad').length };
}

export function summarizeNewCustomerSeries(points: NewCustomerPeriodPoint[]) {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const mom =
    last && prev && prev.newCount > 0
      ? Math.round(((last.newCount - prev.newCount) / prev.newCount) * 1000) / 10
      : 0;
  return {
    last,
    mom,
    belowPlanPeriods: points.filter((p) => p.newCount < p.target).length,
  };
}
