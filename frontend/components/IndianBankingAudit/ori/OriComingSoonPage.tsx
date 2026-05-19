'use client';

import Link from 'next/link';
import { useOriVersion } from './OriVersionProvider';

/**
 * Minimal ORI-styled placeholder for cross-nav routes not yet implemented.
 */
export function OriComingSoonPage({ title }: { title: string }) {
  const { routes } = useOriVersion();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-100 px-6 py-16 text-center">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Coming soon</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {title} is not wired in this prototype yet. Use the Regulatory Intelligence Inbox to continue your workflow.
        </p>
        <Link
          href={routes.regulatoryIntelligence}
          className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Back to Reg Intelligence
        </Link>
      </div>
    </div>
  );
}