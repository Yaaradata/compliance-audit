import type { RccCaseStatus, RccJourneyStepStatus } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export const STATUS_STYLES: Record<
  RccCaseStatus,
  { fg: string; bg: string; dot: string; border: string }
> = {
  Critical: {
    fg: 'text-red-700',
    bg: 'bg-red-50',
    dot: 'bg-red-600',
    border: 'border-red-200',
  },
  Exception: {
    fg: 'text-amber-800',
    bg: 'bg-amber-50',
    dot: 'bg-amber-600',
    border: 'border-amber-200',
  },
  Completed: {
    fg: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-600',
    border: 'border-emerald-200',
  },
};

export const JOURNEY_STEP: Record<
  RccJourneyStepStatus,
  { char: string; box: string; text: string }
> = {
  pass: { char: '✓', box: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-slate-400' },
  fail: { char: '✕', box: 'bg-red-50 text-red-700 border-red-200', text: 'text-slate-400' },
  review: { char: 'R', box: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-slate-400' },
  blocked: { char: '–', box: 'bg-slate-100 text-slate-400 border-slate-200', text: 'text-slate-400' },
};

export function pct(n: number, d: number): number {
  return d ? Math.round((n / d) * 100) : 0;
}
