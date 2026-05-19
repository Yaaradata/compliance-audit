'use client';

import { SAES_DATA_GAP_TOOLTIP } from './saesDataIntegrity';

export function SaesDataGapBadge({ className = '' }: { className?: string }) {
  return (
    <span
      title={SAES_DATA_GAP_TOOLTIP}
      className={`inline-flex items-center gap-0.5 rounded border border-amber-400 bg-amber-50 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-900 ${className}`.trim()}
    >
      ⚠ DATA GAP
    </span>
  );
}
