import { INDIA_STATE_NAME_TO_RTO } from '../indiaStateRto';
import type { FastTagHeatRisk } from '../fastTagJourneyHeatmap';
import type { DrillPeriodGrain } from './fastTagDrillPeriod';

export type StateComplaintDatum = {
  rto: string;
  stateName: string;
  complaints: number;
  prior: number;
  deltaPct: number;
  topIssue: string;
  topChannel: string;
  risk: FastTagHeatRisk;
};

type StateSeed = {
  complaints: number;
  prior: number;
  topIssue: string;
  topChannel: string;
};

/** Demo complaint profile per state — aligned to macro regional story in Q2. */
const STATE_SEEDS: Record<string, StateSeed> = {
  MH: { complaints: 420, prior: 296, topIssue: 'Double deduction', topChannel: 'B2C app / wallet' },
  GJ: { complaints: 310, prior: 218, topIssue: 'Double deduction', topChannel: 'Partner / issuer' },
  RJ: { complaints: 180, prior: 142, topIssue: 'Plaza mis-read', topChannel: 'Call centre / IVR' },
  GA: { complaints: 62, prior: 58, topIssue: 'Blacklist dispute', topChannel: 'B2C app / wallet' },
  KA: { complaints: 280, prior: 219, topIssue: 'Recharge failure', topChannel: 'B2C app / wallet' },
  TN: { complaints: 240, prior: 188, topIssue: 'Recharge failure', topChannel: 'Call centre / IVR' },
  AP: { complaints: 195, prior: 158, topIssue: 'Recharge failure', topChannel: 'Social / email' },
  TS: { complaints: 168, prior: 132, topIssue: 'KYC / activation', topChannel: 'B2C app / wallet' },
  KL: { complaints: 97, prior: 84, topIssue: 'Plaza mis-read', topChannel: 'Call centre / IVR' },
  UP: { complaints: 220, prior: 185, topIssue: 'KYC / activation', topChannel: 'Call centre / IVR' },
  DL: { complaints: 145, prior: 118, topIssue: 'Double deduction', topChannel: 'Social / email' },
  HR: { complaints: 88, prior: 74, topIssue: 'Blacklist dispute', topChannel: 'B2C app / wallet' },
  PB: { complaints: 72, prior: 64, topIssue: 'KYC / activation', topChannel: 'Partner / issuer' },
  WB: { complaints: 165, prior: 148, topIssue: 'Plaza mis-read', topChannel: 'Social / email' },
  OD: { complaints: 118, prior: 102, topIssue: 'Recharge failure', topChannel: 'Call centre / IVR' },
  BR: { complaints: 95, prior: 86, topIssue: 'KYC / activation', topChannel: 'B2B fleet portal' },
  MP: { complaints: 130, prior: 120, topIssue: 'Blacklist dispute', topChannel: 'Call centre / IVR' },
  CG: { complaints: 54, prior: 50, topIssue: 'Plaza mis-read', topChannel: 'B2C app / wallet' },
  AS: { complaints: 48, prior: 44, topIssue: 'KYC / activation', topChannel: 'Call centre / IVR' },
  JH: { complaints: 41, prior: 38, topIssue: 'Recharge failure', topChannel: 'B2B fleet portal' },
};

function riskFromDelta(deltaPct: number, complaints: number): FastTagHeatRisk {
  if (complaints <= 0) return 'none';
  if (deltaPct >= 40) return 'critical';
  if (deltaPct >= 28) return 'high';
  if (deltaPct >= 15) return 'medium';
  if (deltaPct >= 5) return 'low';
  return 'none';
}

function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function fallbackSeed(rto: string): StateSeed {
  const h = stableHash(rto);
  const complaints = 12 + (h % 28);
  const prior = Math.max(8, complaints - (h % 6));
  const issues = ['KYC / activation', 'Plaza mis-read', 'Blacklist dispute', 'Recharge failure'];
  const channels = ['Call centre / IVR', 'B2C app / wallet', 'Partner / issuer'];
  return {
    complaints,
    prior,
    topIssue: issues[h % issues.length],
    topChannel: channels[h % channels.length],
  };
}

export function buildStateComplaintData(grain: DrillPeriodGrain): StateComplaintDatum[] {
  const scale = grain === 'last24' ? 0.04 : grain === 'year' ? 3.2 : 1;
  const entries = Object.entries(INDIA_STATE_NAME_TO_RTO);

  return entries.map(([stateName, rto]) => {
    const seed = STATE_SEEDS[rto] ?? fallbackSeed(rto);
    const complaints = Math.max(0, Math.round(seed.complaints * scale));
    const prior = Math.max(0, Math.round(seed.prior * scale));
    const deltaPct = prior > 0 ? Math.round(((complaints - prior) / prior) * 100) : complaints > 0 ? 100 : 0;

    return {
      rto,
      stateName,
      complaints,
      prior,
      deltaPct,
      topIssue: seed.topIssue,
      topChannel: seed.topChannel,
      risk: riskFromDelta(deltaPct, complaints),
    };
  });
}

export function stateComplaintsByRto(data: StateComplaintDatum[]): Record<string, StateComplaintDatum> {
  return Object.fromEntries(data.map((d) => [d.rto, d]));
}
