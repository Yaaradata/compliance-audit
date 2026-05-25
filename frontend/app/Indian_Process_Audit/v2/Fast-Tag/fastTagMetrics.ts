import type { AuditControl, ControlStatus } from '@/lib/Indian_Process_Audit/types';

export type FastTagControlSeed = Omit<AuditControl, 'compliance' | 'status'> & {
  compliance?: number;
  status?: ControlStatus;
};

/** Derive display compliance from population / exceptions / violations. */
export function deriveFastTagCompliance(seed: {
  population: number;
  exceptions: number;
  violations: number;
}): number {
  const exceptionRate = (seed.exceptions / Math.max(seed.population, 1)) * 100;
  let comp = 100 - exceptionRate * 12 - seed.violations * 1.15;
  return Number(Math.max(85, Math.min(99.4, comp)).toFixed(1));
}

export function deriveFastTagStatus(
  compliance: number,
  violations: number,
): ControlStatus {
  if (compliance < 92 || violations >= 5) return 'deficient';
  if (compliance < 96 || violations >= 2) return 'needs-attention';
  return 'effective';
}

export function finalizeFastTagControl(seed: FastTagControlSeed): AuditControl {
  const compliance = seed.compliance ?? deriveFastTagCompliance(seed);
  const status = seed.status ?? deriveFastTagStatus(compliance, seed.violations);
  return { ...seed, compliance, status };
}
