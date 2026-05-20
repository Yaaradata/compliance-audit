'use client';

import type { ReactNode } from 'react';
import type { Control } from '../../dataModel';
import { Chip, SectionCard } from '../../primitives';
import { OUTCOME_WINDOW_LABEL } from './controlDetailLayout';

function MetadataStat({
  label,
  value,
  mono,
  className = '',
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={`mt-0.5 break-words text-xs leading-relaxed text-slate-800 ${mono ? 'font-mono text-[11px]' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

export function ControlDetailHeader({
  ctrl,
  processName,
  ownerLabel,
  outcomeCounts,
  onClose,
  onOpenObligation,
  onOpenRisk,
}: {
  ctrl: Control;
  processName: string;
  ownerLabel: string;
  outcomeCounts: Record<string, number>;
  onClose?: () => void;
  onOpenObligation: (id: string) => void;
  onOpenRisk: (id: string) => void;
}) {
  const activeOutcomes = Object.entries(outcomeCounts).filter(([, n]) => n > 0);

  return (
    <SectionCard
      title={ctrl.title}
      subtitle={`${ctrl.control_id} · ${ctrl.type} · ${ctrl.nature} · ${ctrl.frequency}`}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← List
            </button>
          ) : null}
          <Chip label={ownerLabel} tone="emerald" size="xs" />
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <MetadataStat label="Process" value={processName} />
          <MetadataStat label="Position" value={ctrl.position_in_step} mono />
          <MetadataStat label="Owner role" value={ctrl.owner_role} />
          <MetadataStat label="Population testable" value={ctrl.population_testable_flag ? 'yes' : 'no'} />

          <div className="min-w-0 sm:col-span-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Linked obligations</div>
            {ctrl.linked_obligations.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ctrl.linked_obligations.map((id) => (
                  <Chip key={id} label={id} tone="violet" size="xs" onClick={() => onOpenObligation(id)} />
                ))}
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-slate-500">—</p>
            )}
          </div>

          <div className="min-w-0 sm:col-span-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Linked risks</div>
            {ctrl.linked_risks.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ctrl.linked_risks.map((id) => (
                  <Chip key={id} label={id} tone="rose" size="xs" onClick={() => onOpenRisk(id)} />
                ))}
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="flex min-w-[7.5rem] flex-col gap-2 border-t border-slate-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 lg:text-right">
            Outcomes (window)
          </div>
          <div className="flex flex-col gap-2">
            {activeOutcomes.length === 0 ? (
              <p className="text-xs text-slate-500 lg:text-right">—</p>
            ) : (
              activeOutcomes.map(([key, count]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5"
                >
                  <span className="text-base font-bold tabular-nums text-slate-900">{count}</span>
                  <span className="text-right text-[9px] font-semibold uppercase leading-snug tracking-wide text-slate-600">
                    {OUTCOME_WINDOW_LABEL[key] ?? key}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
