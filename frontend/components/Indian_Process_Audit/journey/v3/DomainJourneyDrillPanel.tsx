'use client';

import type { RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { JourneyFunnelLegend } from './JourneyFunnelLegend';
import { JourneyStageFunnel } from './JourneyStageFunnel';
import { getCasesAtStage } from './journeyStageUtils';
import { StatusPill } from './StatusPill';
import { pct } from './journeyCommandCenterStyles';

type Props = {
  domain: RccDomain;
  selectedStage: string | null;
  onSelectStage: (key: string) => void;
  onOpenCase: (caseId: string) => void;
};

/** Domain-level funnel + filtered action queue (shared by journey tab and cockpit drawer). */
export function DomainJourneyDrillPanel({
  domain,
  selectedStage,
  onSelectStage,
  onOpenCase,
}: Props) {
  const compliancePct = pct(domain.completed, domain.total);
  const actionable = domain.cases.filter((c) => c.status !== 'Completed');
  const queue = selectedStage ? getCasesAtStage(domain, selectedStage) : actionable;

  const stageLabel = selectedStage
    ? domain.stages.find((s) => s.key === selectedStage)?.label
    : null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[17px] font-bold text-slate-900">{domain.name}</div>
        <div className="mt-0.5 text-xs text-slate-400">
          Journey control funnel · {compliancePct}% clean · {domain.critical} critical ·{' '}
          {domain.review} in review
        </div>
      </div>

      <JourneyFunnelLegend />

      <div className="h-[min(260px,36vh)] min-h-[200px]">
        <JourneyStageFunnel
          domain={domain}
          selectedKey={selectedStage}
          onSelect={onSelectStage}
        />
      </div>

      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {selectedStage ? `Cases at stage · ${stageLabel}` : 'Action queue'}
      </div>

      <div className="grid gap-2">
        {queue.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpenCase(c.id)}
            className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:bg-slate-50"
          >
            <StatusPill status={c.status} small />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-slate-900">{c.title}</span>
              <span className="text-[11.5px] text-slate-500">{c.exception}</span>
            </span>
            <span className="text-slate-400">›</span>
          </button>
        ))}
        {selectedStage && queue.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-center text-xs text-slate-400">
            No failures at this stage.
          </div>
        ) : null}
      </div>
    </div>
  );
}
