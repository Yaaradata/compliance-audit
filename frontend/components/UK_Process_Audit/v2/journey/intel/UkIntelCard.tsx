'use client';

import type { ReactNode } from 'react';

type Props = {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * UK v2 intel card shell — natural height; page scrolls via the dashboard
 * `<main>` region (same contract as Indian Process Audit v3 `IntelCard`).
 */
export function UkIntelCard({ title, hint, children, className = '' }: Props) {
  return (
    <section className={`flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{title}</h3>
        {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
