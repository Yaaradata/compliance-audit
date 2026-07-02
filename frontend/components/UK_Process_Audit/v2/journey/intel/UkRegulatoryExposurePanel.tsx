'use client';

import type { DomainFlaggedCase } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { IntelCard } from '@/components/Indian_Process_Audit/journey/v3/intel/IntelCard';

/** Matches Indian v3 — title stacked above note (not a single truncated line). */
function FlagList({
  rows,
  empty,
  dot,
  onOpenCase,
}: {
  rows: DomainFlaggedCase[];
  empty: string;
  dot: string;
  onOpenCase: (caseId: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="py-3 text-center text-xs text-slate-400">{empty}</p>;
  }
  return (
    <ul className="grid gap-1.5">
      {rows.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onOpenCase(r.id)}
            className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-semibold text-slate-800">{r.title}</span>
              <span className="block text-[11px] leading-snug text-slate-500">{r.note}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** UK v2 regulatory panel — same card structure as Indian Process Audit v3. */
export function UkRegulatoryExposurePanel({
  regulatory,
  slaAtRisk,
  onOpenCase,
}: {
  regulatory: DomainFlaggedCase[];
  slaAtRisk: DomainFlaggedCase[];
  onOpenCase: (caseId: string) => void;
}) {
  return (
    <IntelCard
      title="Regulatory & SLA exposure"
      hint={`${regulatory.length + slaAtRisk.length} flagged`}
    >
      <div className="grid gap-3">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
            Reg-reportable / statutory
          </div>
          <FlagList
            rows={regulatory}
            empty="No statutory exposure flagged."
            dot="bg-amber-500"
            onOpenCase={onOpenCase}
          />
        </div>
        <div className="border-t border-slate-100 pt-2">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-red-700">
            SLA / window at risk
          </div>
          <FlagList
            rows={slaAtRisk}
            empty="All cases within SLA window."
            dot="bg-red-500"
            onOpenCase={onOpenCase}
          />
        </div>
      </div>
    </IntelCard>
  );
}
