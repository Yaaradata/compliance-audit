'use client';

import { ChevronRight } from 'lucide-react';
import type { ExecAttentionItem } from './fastTagExecutiveTypes';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

const TONE_BADGE = {
  bad: 'bg-red-50 text-red-800 ring-red-200',
  warn: 'bg-amber-50 text-amber-900 ring-amber-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
};

const VALUE_CLS = {
  bad: 'text-red-600',
  warn: 'text-amber-600',
  info: 'text-blue-600',
};

type Props = {
  item: ExecAttentionItem;
  personaLabel: 'Head of Business' | 'Head of CX';
  onNavigate: (req: FastTagWorkspaceNavigate) => void;
};

export default function FastTagAttentionDrillPanel({ item, personaLabel, onNavigate }: Props) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-4 text-sm text-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-mono text-[10px] font-bold text-slate-400">{item.num}</span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${TONE_BADGE[item.tone]}`}
          >
            {item.tone === 'bad' ? 'Escalate' : item.tone === 'warn' ? 'Watch' : 'Review'}
          </span>
        </div>

        <p className="text-base font-semibold leading-snug text-slate-900">{item.title}</p>
        <p className="leading-relaxed text-slate-600">{item.desc}</p>

        <div className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key metric</div>
          <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${VALUE_CLS[item.tone]}`}>
            {item.value}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          AI-ranked · {personaLabel} · Q1 2026 · audit sample and operational registers
        </p>
      </div>

      <button
        type="button"
        onClick={() => onNavigate(item.navigate)}
        className="mt-6 flex w-full items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3.5 text-left text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
      >
        <span>{item.action}</span>
        <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
      </button>
    </div>
  );
}
