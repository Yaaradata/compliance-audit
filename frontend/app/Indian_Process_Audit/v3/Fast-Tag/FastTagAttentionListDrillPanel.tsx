'use client';

import { ChevronRight } from 'lucide-react';
import { EXEC_AI_PRIORITIES_LIST_FOOTER } from './fastTagExecutiveAiLabels';
import type { ExecAttentionItem, ExecDrillState } from './fastTagExecutiveTypes';

const ROW_BORDER = {
  bad: 'border-l-red-500 bg-red-50/30',
  warn: 'border-l-amber-500 bg-amber-50/25',
  info: 'border-l-sky-500 bg-sky-50/25',
};

const VALUE_CLS = {
  bad: 'text-red-600',
  warn: 'text-amber-600',
  info: 'text-blue-600',
};

const NUM_CLS = {
  bad: 'text-red-600',
  warn: 'text-amber-600',
  info: 'text-blue-600',
};

type Props = {
  items: ExecAttentionItem[];
  drillKind: 'risk' | 'coh-attention';
  subtitle: string;
  onOpenDrill: (d: ExecDrillState) => void;
};

export default function FastTagAttentionListDrillPanel({
  items,
  drillKind,
  subtitle,
  onOpenDrill,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{subtitle}</p>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-200">
        {items.map((r) => (
          <li
            key={r.id}
            className={`flex cursor-pointer items-start gap-3 border-l-4 px-4 py-3.5 transition-colors hover:bg-slate-50 ${ROW_BORDER[r.tone]}`}
            onClick={() =>
              onOpenDrill(
                drillKind === 'coh-attention'
                  ? { kind: 'coh-attention', id: r.id }
                  : { kind: 'risk', id: r.id },
              )
            }
          >
            <span className={`mt-0.5 font-mono text-[10px] font-bold ${NUM_CLS[r.tone]}`}>{r.num}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-snug text-slate-900">{r.title}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{r.desc}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`font-mono text-xs font-semibold tabular-nums ${VALUE_CLS[r.tone]}`}>
                {r.value}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-500">{EXEC_AI_PRIORITIES_LIST_FOOTER}</p>
    </div>
  );
}
