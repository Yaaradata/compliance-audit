/**
 * Illustrative region volumes for the performance drill-down map
 * (business-health by state — independent of audit case sample size).
 */

export const PERFORMANCE_REGION_CASE_COUNTS: Record<string, number> = {
  AN: 12,
  AP: 88,
  AR: 14,
  AS: 16,
  BR: 92,
  CH: 18,
  CG: 44,
  DD: 10,
  DL: 52,
  GA: 22,
  GJ: 76,
  HR: 48,
  HP: 32,
  JK: 58,
  JH: 70,
  KA: 95,
  KL: 28,
  LA: 8,
  LD: 6,
  MP: 82,
  MH: 110,
  MN: 12,
  ML: 10,
  MZ: 9,
  NL: 11,
  OD: 74,
  PY: 14,
  PB: 54,
  RJ: 98,
  SK: 7,
  TN: 86,
  TS: 62,
  TR: 13,
  UP: 105,
  UK: 36,
  WB: 90,
};

export const PERFORMANCE_REGION_FAILED_COUNTS: Record<string, number> = {
  AN: 0,
  AP: 14,
  AR: 1,
  AS: 1,
  BR: 16,
  CH: 2,
  CG: 6,
  DD: 0,
  DL: 5,
  GA: 2,
  GJ: 8,
  HR: 5,
  HP: 3,
  JK: 12,
  JH: 11,
  KA: 15,
  KL: 1,
  LA: 1,
  LD: 0,
  MP: 13,
  MH: 18,
  MN: 0,
  ML: 0,
  MZ: 0,
  NL: 0,
  OD: 15,
  PY: 1,
  PB: 6,
  RJ: 17,
  SK: 0,
  TN: 14,
  TS: 7,
  TR: 1,
  UP: 17,
  UK: 3,
  WB: 16,
};

export const PERFORMANCE_REGION_CODES = Object.keys(PERFORMANCE_REGION_CASE_COUNTS);

/** Minimal case rows so the state drill-down table matches map selection. */
export function buildPerformanceRegionDemoCases(): {
  id: string;
  subject: string;
  overallStatus: string;
  trail: { status: string }[];
}[] {
  const out: {
    id: string;
    subject: string;
    overallStatus: string;
    trail: { status: string }[];
  }[] = [];
  for (const code of PERFORMANCE_REGION_CODES) {
    const total = PERFORMANCE_REGION_CASE_COUNTS[code] ?? 0;
    const failed = PERFORMANCE_REGION_FAILED_COUNTS[code] ?? 0;
    const capped = Math.min(total, 24);
    const failCapped = Math.min(failed, capped);
    for (let i = 0; i < capped; i++) {
      const isFail = i < failCapped;
      out.push({
        id: `perf-${code}-${i}`,
        subject: `VRN ${code}12AB${9000 + i}`,
        overallStatus: isFail ? 'rejected' : 'passed',
        trail: [{ status: isFail ? 'rejected' : 'passed' }],
      });
    }
  }
  return out;
}
