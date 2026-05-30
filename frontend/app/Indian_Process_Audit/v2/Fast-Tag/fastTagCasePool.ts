import { INDIA_STATE_NAME_TO_RTO } from './indiaStateRto';
import type { FastTagCasePoolRecord } from './fastTagCaseBuilder';

export const FASTAG_CASES_PER_STATE = 10;

const CHANNELS = [
  'UPI load',
  'NETC hold',
  'Branch',
  'NEFT',
  'Fleet',
  'Net banking',
  'Digital',
  'IMPS',
  'Courier',
  'Field',
] as const;

const CLEAN_TEMPLATE: Omit<FastTagCasePoolRecord, 'id' | 'subject' | 'segment' | 'opened'> = {
  scenario: 'clean',
};

/** Non-clean patterns rotated per state so exception density varies (0–9 per 10 cases). */
const FINDING_TEMPLATES: {
  template: Omit<FastTagCasePoolRecord, 'id' | 'subject' | 'segment' | 'opened'>;
  title: string;
}[] = [
  {
    template: {
      scenario: 'rejected',
      failStageId: 'ovt',
      failControlId: 'FT-01',
      journeyException: 'Active tag on VRN (NETC)',
    },
    title: 'Mapper conflict',
  },
  { template: { scenario: 'pending', failStageId: 'kyc', failControlId: 'FT-04' }, title: 'CKYCR pending' },
  { template: { scenario: 'rejected', failStageId: 'wallet', failControlId: 'FT-06' }, title: 'Wallet load fail' },
  { template: { scenario: 'rejected', failStageId: 'fitment', failControlId: 'FT-09' }, title: 'Fitment QA gap' },
  {
    template: {
      scenario: 'rejected',
      failStageId: 'intake',
      failControlId: 'FT-02',
      journeyException: 'Issuer blacklist hit',
    },
    title: 'Blacklist override',
  },
  { template: { scenario: 'rejected', failStageId: 'identity', failControlId: 'FT-03' }, title: 'OTP session mismatch' },
  {
    template: {
      scenario: 'rejected',
      failStageId: 'wallet',
      failControlId: 'FT-07',
      journeyException: 'CBS debit failed',
    },
    title: 'IMPS no reversal',
  },
  { template: { scenario: 'rejected', failStageId: 'issue', failControlId: 'FT-08' }, title: 'EPC batch collision' },
  {
    template: { scenario: 'rejected', failStageId: 'activate', failControlId: 'FT-11' },
    title: 'Plaza settlement break',
  },
];

const VRN_SERIES = ['AB', 'CD', 'EF', 'GH', 'JK', 'LM', 'MN', 'PQ', 'RS', 'UV'] as const;

function buildVrn(rto: string, index: number): string {
  const district = String(1 + (index % 69)).padStart(2, '0');
  const series = VRN_SERIES[index];
  const number = String(1000 + index * 111).slice(-4);
  return `${rto}${district}${series}${number}`;
}

function buildOpenedTime(index: number): string {
  const hour = 9 + Math.floor(index / 6);
  const minute = (8 + index * 7) % 60;
  return `17 Apr 2026 ${hour}:${String(minute).padStart(2, '0')}`;
}

/** All RTO codes on the India map, sorted by state name. */
export function getFastTagAllRtoCodes(): string[] {
  const codes = [...new Set(Object.values(INDIA_STATE_NAME_TO_RTO))];
  const nameByCode = Object.fromEntries(
    Object.entries(INDIA_STATE_NAME_TO_RTO).map(([name, code]) => [code, name]),
  );
  return codes.sort((a, b) => (nameByCode[a] ?? a).localeCompare(nameByCode[b] ?? b));
}

export function buildFastTagCasePool(): FastTagCasePoolRecord[] {
  const rtoCodes = getFastTagAllRtoCodes();
  const pool: FastTagCasePoolRecord[] = [];
  let seq = 8801;

  for (let stateIndex = 0; stateIndex < rtoCodes.length; stateIndex++) {
    const rto = rtoCodes[stateIndex];
    /** 0–9 findings per state → spreads map tiers (None through Critical). */
    const findingCount = stateIndex % FASTAG_CASES_PER_STATE;

    for (let i = 0; i < FASTAG_CASES_PER_STATE; i++) {
      const vrn = buildVrn(rto, i);
      const isFinding = i < findingCount;
      const finding = FINDING_TEMPLATES[i % FINDING_TEMPLATES.length];
      const title = isFinding ? finding.title : 'Retail clean issuance';
      const template = isFinding ? finding.template : CLEAN_TEMPLATE;

      pool.push({
        id: `FT-20260417-${seq}`,
        subject: `VRN ${vrn} — ${title}`,
        segment: `Class ${4 + (i % 3)} · ${CHANNELS[i]}`,
        opened: buildOpenedTime(i),
        ...template,
      });
      seq += 1;
    }
  }

  return pool;
}
