import type { AiInsightTag, CockpitTone, DeadlineStatus } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export const TONE_CLASS: Record<CockpitTone, string> = {
  good: 'text-emerald-600',
  warn: 'text-amber-600',
  bad: 'text-red-600',
  gap: 'text-slate-400',
};

export const TONE_HEX: Record<CockpitTone, string> = {
  good: '#16a34a',
  warn: '#d97706',
  bad: '#dc2626',
  gap: '#94a3b8',
};

export const TONE_BG: Record<CockpitTone, string> = {
  good: 'bg-emerald-50 border-emerald-200',
  warn: 'bg-amber-50 border-amber-200',
  bad: 'bg-red-50 border-red-200',
  gap: 'bg-slate-50 border-slate-200',
};

export const TAG_CLASS: Record<AiInsightTag, string> = {
  REGULATORY: 'text-amber-700 bg-amber-50',
  FRAUD: 'text-red-700 bg-red-50',
  CONDUCT: 'text-violet-700 bg-violet-50',
  CYBER: 'text-blue-700 bg-blue-50',
  CREDIT: 'text-indigo-700 bg-indigo-50',
};

export const TAG_BORDER: Record<AiInsightTag, string> = {
  REGULATORY: 'border-l-amber-500',
  FRAUD: 'border-l-red-500',
  CONDUCT: 'border-l-violet-500',
  CYBER: 'border-l-blue-500',
  CREDIT: 'border-l-indigo-500',
};

export const DEADLINE_DOT: Record<DeadlineStatus, string> = {
  'on-track': 'bg-emerald-500',
  'at-risk': 'bg-amber-500',
  degraded: 'bg-red-500',
  overdue: 'bg-red-600',
};

export function pctOf(n: number, d: number): number {
  return d ? Math.round((n / d) * 100) : 0;
}
