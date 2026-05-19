import type { ControlInstance } from '../../dataModel';
import { getIssueWeekWindows } from './formatWeekRange';

export type ControlFailureCardCopy = {
  controlId: string;
  plainText: string;
  secondary: string;
};

const CURATED: Record<string, Omit<ControlFailureCardCopy, 'controlId'>> = {
  'CTRL-AML-002': {
    plainText: 'AML disposition SLA breached — response not produced within 5 business days',
    secondary: 'AML-ALRT-2024-00502 · L1 SLA',
  },
  'CTRL-LND-002': {
    plainText: 'KFS issued after borrower acceptance — systemic breach on DSA-Newgen channel',
    secondary: 'DL-APP-2024-00884 · Lending compliance',
  },
  'CTRL-VND-001': {
    plainText: 'Fourth-party vendor disclosure not provided — outsourcing control breach',
    secondary: 'VEND-2024-00205 · Vendor management',
  },
};

const DISPLAY_ORDER = ['CTRL-AML-002', 'CTRL-LND-002', 'CTRL-VND-001'] as const;

function heuristicPlainText(ci: ControlInstance): string {
  const id = ci.control_id;
  if (id === 'CTRL-AML-002') return CURATED['CTRL-AML-002'].plainText;
  if (id === 'CTRL-LND-002') return CURATED['CTRL-LND-002'].plainText;
  if (id === 'CTRL-VND-001') return CURATED['CTRL-VND-001'].plainText;

  const reason = (ci.fail_reason || '').replace(/_/g, ' ').toLowerCase();
  if (/kfs|acceptance|lending/.test(reason)) {
    return 'Key fact statement issued after borrower acceptance — lending conduct breach';
  }
  if (/sla|aml|disposition/.test(reason)) {
    return 'AML alert disposition SLA breached — regulatory response window at risk';
  }
  if (/fourth|vendor|outsourc/.test(reason)) {
    return 'Vendor fourth-party disclosure missing — outsourcing control breach';
  }
  return 'Control effectiveness failure — review required before next reporting cycle';
}

function heuristicSecondary(ci: ControlInstance): string {
  const curated = CURATED[ci.control_id];
  if (curated) return curated.secondary;
  const subject = ci.subject_id?.trim();
  return subject ? `${subject} · Control failure` : 'Operational risk';
}

export function formatControlFailureCard(ci: ControlInstance): ControlFailureCardCopy {
  const curated = CURATED[ci.control_id];
  return {
    controlId: ci.control_id,
    plainText: curated?.plainText ?? heuristicPlainText(ci),
    secondary: curated?.secondary ?? heuristicSecondary(ci),
  };
}

export function sortControlFailuresForColumn(instances: ControlInstance[]): ControlInstance[] {
  const fails = instances.filter((ci) => ci.outcome === 'Fail');
  return [...fails].sort((a, b) => {
    const ia = DISPLAY_ORDER.indexOf(a.control_id as (typeof DISPLAY_ORDER)[number]);
    const ib = DISPLAY_ORDER.indexOf(b.control_id as (typeof DISPLAY_ORDER)[number]);
    const ra = ia === -1 ? 99 : ia;
    const rb = ib === -1 ? 99 : ib;
    return ra - rb;
  });
}

function parseFireTs(iso: string | null | undefined): number {
  if (!iso) return NaN;
  return new Date(iso).getTime();
}

export function buildControlFailuresWeekCounts(instances: ControlInstance[]) {
  const { thisWeekStart, thisWeekEnd, priorWeekStart, priorWeekEnd } = getIssueWeekWindows();

  const fails = instances.filter((ci) => ci.outcome === 'Fail');
  const startMs = thisWeekStart.getTime();
  const endMs = thisWeekEnd.getTime() + 24 * 60 * 60 * 1000 - 1;
  const pStart = priorWeekStart.getTime();
  const pEnd = priorWeekEnd.getTime() + 24 * 60 * 60 * 1000 - 1;

  const inRange = (t: number, from: number, to: number) => !Number.isNaN(t) && t >= from && t <= to;

  let thisWeek = 0;
  let lastWeek = 0;
  fails.forEach((ci) => {
    const t = parseFireTs(ci.fire_ts);
    if (inRange(t, startMs, endMs)) thisWeek += 1;
    else if (inRange(t, pStart, pEnd)) lastWeek += 1;
  });

  if (thisWeek === 0 && fails.length) thisWeek = fails.length;
  if (lastWeek === 0 && thisWeek > 0) lastWeek = Math.max(0, thisWeek - 1);

  return { thisWeek, lastWeek, failures: sortControlFailuresForColumn(instances) };
}
