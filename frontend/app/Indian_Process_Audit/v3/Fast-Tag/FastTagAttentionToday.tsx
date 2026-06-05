'use client';

import { ChevronRight } from 'lucide-react';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';
import {
  EXEC_AI_PRIORITIES_HOB_SUBTITLE,
  EXEC_AI_PRIORITIES_TITLE,
} from './fastTagExecutiveAiLabels';
import type { ExecAttentionItem, ExecDrillState } from './fastTagExecutiveTypes';

export type { ExecAttentionItem };

type Props = {
  risks: ExecAttentionItem[];
  onOpenDrill: (d: ExecDrillState) => void;
  title?: string;
  subtitle?: string;
  drillKind?: 'risk' | 'coh-attention';
};

export default function FastTagAttentionToday({
  risks,
  onOpenDrill,
  title = EXEC_AI_PRIORITIES_TITLE,
  subtitle = EXEC_AI_PRIORITIES_HOB_SUBTITLE,
  drillKind = 'risk',
}: Props) {
  const openCount = risks.length;
  const badgeTone =
    risks.some((r) => r.tone === 'bad') ? 'bad' : risks.some((r) => r.tone === 'warn') ? 'warn' : 'neutral';

  const badgeCls =
    badgeTone === 'bad'
      ? 'bg-red-50 text-red-700 ring-red-200'
      : badgeTone === 'warn'
        ? 'bg-amber-50 text-amber-800 ring-amber-200'
        : 'bg-slate-100 text-slate-600 ring-slate-200';

  return (
    <section
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
      aria-label={title}
    >
      <button
        type="button"
        onClick={() => onOpenDrill({ kind: 'attention-list', variant: drillKind })}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 ring-1 ring-violet-100"
          aria-hidden
        >
          <FastTagAiLogo />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${badgeCls}`}
        >
          {openCount} open
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      </button>
    </section>
  );
}
