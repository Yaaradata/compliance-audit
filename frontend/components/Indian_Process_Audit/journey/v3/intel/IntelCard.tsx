'use client';

import type { ReactNode } from 'react';

export function IntelCard({
  title,
  hint,
  children,
  className = '',
}: {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700">{title}</h3>
        {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
