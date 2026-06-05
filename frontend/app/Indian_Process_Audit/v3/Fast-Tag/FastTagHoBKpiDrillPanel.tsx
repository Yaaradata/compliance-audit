'use client';

import { ChevronRight } from 'lucide-react';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';
import type { HobKpiDrillContent } from './fastTagHobKpiDrill';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

const STATUS_PILL = {
  clean: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  flagged: 'bg-amber-50 text-amber-900 ring-amber-200',
  failure: 'bg-red-50 text-red-800 ring-red-200',
};

type Props = {
  content: HobKpiDrillContent;
  onNavigate?: (req: FastTagWorkspaceNavigate) => void;
};

export default function FastTagHoBKpiDrillPanel({ content, onNavigate }: Props) {
  return (
    <div className="space-y-5 text-sm text-slate-700">
      <div>
        <p className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">{content.headline}</p>
        <p className="mt-1 text-xs text-slate-500">{content.actionHint}</p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {content.metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{m.label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{m.value}</dd>
          </div>
        ))}
      </dl>

      {content.funnel?.length ? (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activation funnel</h4>
          <ul className="mt-2 space-y-1.5">
            {content.funnel.map((f) => (
              <li
                key={f.step}
                className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-xs ring-1 ring-slate-100"
              >
                <span className="font-medium text-slate-700">{f.step}</span>
                <span className="tabular-nums text-slate-600">
                  {f.count.toLocaleString('en-IN')} · {f.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {content.rows.length > 0 ? (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sample cases</h4>
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {content.rows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{row.primary}</div>
                  <div className="truncate text-[11px] text-slate-500">{row.secondary}</div>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${STATUS_PILL[row.status]}`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg bg-violet-50 px-3 py-2.5 ring-1 ring-violet-100">
        <div className="flex gap-2">
          <FastTagAiLogo className="mt-0.5 shrink-0 text-sm" />
          <p className="text-xs leading-relaxed text-violet-950">{content.aiInsight}</p>
        </div>
      </div>

      {content.workspaceLink && onNavigate ? (
        <button
          type="button"
          onClick={() => onNavigate(content.workspaceLink!)}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          {content.workspaceLinkLabel ?? 'Open in workspace'}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
