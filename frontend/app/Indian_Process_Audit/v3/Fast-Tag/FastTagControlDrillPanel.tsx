'use client';

import { ChevronRight, FileText } from 'lucide-react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { ControlDrillContent } from './fastTagControlDrill';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

const STATUS_PILL = {
  good: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warn: 'bg-amber-50 text-amber-900 ring-amber-200',
  bad: 'bg-red-50 text-red-800 ring-red-200',
};

const ROW_PILL = {
  clean: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  flagged: 'bg-amber-50 text-amber-900 ring-amber-200',
  failure: 'bg-red-50 text-red-800 ring-red-200',
};

const SEVERITY_CLS: Record<string, string> = {
  Critical: 'text-red-700',
  High: 'text-amber-800',
  Medium: 'text-slate-700',
};

type Props = {
  content: ControlDrillContent;
  control: AuditControl;
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  onNavigate?: (req: FastTagWorkspaceNavigate) => void;
};

export default function FastTagControlDrillPanel({
  content,
  control,
  onOpenEvidence,
  onNavigate,
}: Props) {
  return (
    <div className="space-y-5 text-sm text-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-bold text-slate-500">{content.controlId}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{content.headline}</p>
          <p className="mt-1 text-xs text-slate-500">{content.actionHint}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${STATUS_PILL[content.statusTone]}`}
        >
          {content.statusLabel}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {content.metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{m.label}</dt>
            <dd className="mt-0.5 text-xs font-semibold text-slate-900">{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Regulatory & objective</h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">{control.objective}</p>
        <p className="mt-2 text-[11px] font-medium text-slate-600">{control.regulatory}</p>
      </div>

      <div className="rounded-lg bg-amber-50/80 px-3 py-2.5 ring-1 ring-amber-200/80">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Auditor finding</h4>
        <p className="mt-1 text-xs leading-relaxed text-amber-950">{content.finding}</p>
      </div>

      <p className="text-xs text-slate-600">{content.cxNote}</p>

      {content.exceptions.length > 0 ? (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top exceptions</h4>
          <ul className="mt-2 space-y-2">
            {content.exceptions.map((ex) => (
              <li key={ex.detail} className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase ${SEVERITY_CLS[ex.severity] ?? 'text-slate-700'}`}>
                    {ex.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">SLA · {ex.sla}</span>
                </div>
                <p className="mt-1 text-xs text-slate-800">{ex.detail}</p>
                <p className="mt-1 text-[11px] font-medium text-sky-800">{ex.action}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {content.linkedCases.length > 0 ? (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Linked audit cases</h4>
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {content.linkedCases.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">{row.primary}</div>
                  <div className="truncate text-[11px] text-slate-500">{row.secondary}</div>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ${ROW_PILL[row.status]}`}
                >
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onOpenEvidence(control, 'Fast-Tag')}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <FileText className="h-3.5 w-3.5" /> Evidence pack
        </button>
        {onNavigate ? (
          <button
            type="button"
            onClick={() => onNavigate(content.workspaceLink)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {content.workspaceLinkLabel} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() =>
            onNavigate?.({ view: 'register', registerFilter: 'deficient', controlId: control.id })
          }
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Control register
        </button>
      </div>
    </div>
  );
}
