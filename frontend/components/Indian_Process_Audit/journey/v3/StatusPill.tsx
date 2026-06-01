'use client';

import type { RccCaseStatus } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { STATUS_STYLES } from './journeyCommandCenterStyles';

export function StatusPill({ status, small }: { status: RccCaseStatus; small?: boolean }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Completed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold ${s.fg} ${s.bg} ${s.border} ${
        small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
