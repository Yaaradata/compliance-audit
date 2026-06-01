import { INDIA_STATE_NAME_TO_RTO } from './indiaStateRto';
import type { FastTagCasePoolRecord } from './fastTagCaseBuilder';

/** Typical sample size per state before volume weighting (reference only). */
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

/** Non-clean patterns rotated per state so exception density varies. */
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

/** Issuance volume tier by RTO — scales state cluster / map case counts. */
const CASE_COUNT_BY_RTO: Partial<Record<string, number>> = {
  MH: 24,
  UP: 21,
  TN: 17,
  KA: 14,
  RJ: 12,
  GJ: 11,
  WB: 13,
  AP: 15,
  BR: 16,
  MP: 13,
  DL: 10,
  TS: 12,
  HR: 9,
  PB: 8,
  OR: 9,
  KL: 8,
  AS: 7,
  CG: 6,
  JH: 7,
  UK: 5,
  HP: 5,
  TR: 4,
  MN: 4,
  ML: 4,
  MZ: 4,
  NL: 4,
  SK: 4,
  AR: 4,
  GA: 5,
  PY: 4,
  CH: 4,
  AN: 4,
  LA: 4,
  LD: 4,
  JK: 8,
  DD: 5,
};

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Per-state case volume (varied, deterministic). */
export function getFastTagCaseCountForRto(rto: string, stateIndex: number): number {
  const mapped = CASE_COUNT_BY_RTO[rto];
  if (mapped != null) return mapped;
  const h = stableHash(rto);
  return 4 + ((h + stateIndex * 5) % 8);
}

function buildVrn(rto: string, index: number): string {
  const district = String(1 + (index % 69)).padStart(2, '0');
  const series = VRN_SERIES[index % VRN_SERIES.length];
  const number = String(1000 + index * 111).slice(-4);
  return `${rto}${district}${series}${number}`;
}

function buildOpenedTime(stateIndex: number, index: number): string {
  const hour = 9 + Math.floor((stateIndex + index) / 6);
  const minute = (8 + index * 7 + stateIndex) % 60;
  return `17 Apr 2026 ${hour}:${String(minute).padStart(2, '0')}`;
}

function findingCountForState(caseCount: number, stateIndex: number, rto: string): number {
  if (caseCount <= 0) return 0;
  const h = stableHash(`${rto}:${stateIndex}`);
  const ratePct = 22 + (h % 35);
  return Math.min(caseCount, Math.max(0, Math.round((caseCount * ratePct) / 100)));
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
    const caseCount = getFastTagCaseCountForRto(rto, stateIndex);
    const findingCount = findingCountForState(caseCount, stateIndex, rto);

    for (let i = 0; i < caseCount; i++) {
      const vrn = buildVrn(rto, i);
      const isFinding = i < findingCount;
      const finding = FINDING_TEMPLATES[i % FINDING_TEMPLATES.length];
      const title = isFinding ? finding.title : 'Retail clean issuance';
      const template = isFinding ? finding.template : CLEAN_TEMPLATE;

      pool.push({
        id: `FT-20260417-${seq}`,
        subject: `VRN ${vrn} — ${title}`,
        segment: `Class ${4 + (i % 3)} · ${CHANNELS[i % CHANNELS.length]}`,
        opened: buildOpenedTime(stateIndex, i),
        ...template,
      });
      seq += 1;
    }
  }

  return pool;
}
