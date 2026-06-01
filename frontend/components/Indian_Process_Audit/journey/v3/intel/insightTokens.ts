import type { AiInsightTag } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export const TAG_BADGE: Record<AiInsightTag, string> = {
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
