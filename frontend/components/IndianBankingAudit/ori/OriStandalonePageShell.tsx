import Link from 'next/link';
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ORI_REG_INTEL_INBOX_HREF } from '@/components/IndianBankingAudit/screens/regIntel/regIntelPaths';

/**
 * Shared chrome for standalone ORI cross-nav pages (Obligation Coverage, Control Testing).
 *
 * Mirrors the visual language of the Reg Intel inbox: slate background, rounded white
 * cards, ORM accent. Page content scrolls naturally with the document.
 */
export function OriStandalonePageShell({
  title,
  subtitle,
  rightSlot,
  children,
}: {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <Link
                href={ORI_REG_INTEL_INBOX_HREF}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-1.5 py-1 text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                Reg Intelligence
              </Link>
              <span aria-hidden className="text-slate-300">
                /
              </span>
              <span className="truncate text-slate-600">{title}</span>
            </div>
            <h1 className="mt-1 text-lg font-bold leading-snug text-slate-900 sm:text-xl">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-xs text-slate-600">{subtitle}</p> : null}
          </div>
          {rightSlot ? <div className="flex shrink-0 items-center gap-2">{rightSlot}</div> : null}
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
