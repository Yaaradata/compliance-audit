'use client';

import type { ReactNode } from 'react';

const BADGE_TONE: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

/** Delta lane column for What Changed This Week. */
export function DeltaColumn({
  title,
  tone,
  children,
  footer,
}: {
  title: string;
  tone: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const badgeClass = BADGE_TONE[tone] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 shadow-sm">
      <div
        className={`inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}
      >
        <span className="truncate">{title}</span>
      </div>
      <div className="mt-2 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <div className="min-h-0 min-w-0 flex-1 space-y-2">{children}</div>
        {footer ? <div className="shrink-0 border-t border-slate-200/70 pt-3">{footer}</div> : null}
      </div>
    </div>
  );
}
