'use client';

import { ChevronRight, IndianRupee, Radio, Tag } from 'lucide-react';
import type { SegmentDrillContent } from './fastTagSegmentDrill';
import { ISSUANCE_SEGMENT_COLORS } from './fastTagSegmentDrill';
import type { FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';

type Props = {
  content: SegmentDrillContent;
  onNavigate?: (req: FastTagWorkspaceNavigate) => void;
};

export default function FastTagSegmentMixDrillPanel({ content, onNavigate }: Props) {
  const accent = ISSUANCE_SEGMENT_COLORS[content.key];

  return (
    <div className="space-y-5 text-sm text-slate-700">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <div>
          <p className="text-lg font-bold text-slate-900">{content.label}</p>
          <p className="text-xs text-slate-500">
            {content.sharePct}% of audit sample · {content.caseCount.toLocaleString('en-IN')} cases
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl bg-emerald-50/80 px-4 py-3 ring-1 ring-emerald-200/80">
          <div className="flex items-center gap-2 text-emerald-800">
            <IndianRupee className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wider">Money generated</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-950">{content.moneyGenerated}</p>
          <p className="mt-0.5 text-[11px] text-emerald-900/80">{content.moneyGeneratedSub}</p>
        </div>

        <div className="rounded-xl bg-sky-50/80 px-4 py-3 ring-1 ring-sky-200/80">
          <div className="flex items-center gap-2 text-sky-800">
            <Radio className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wider">Toll usage</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-sky-950">{content.tollUsage}</p>
          <p className="mt-0.5 text-[11px] text-sky-900/80">{content.tollUsageSub}</p>
        </div>

        <div className="rounded-xl bg-violet-50/80 px-4 py-3 ring-1 ring-violet-200/80">
          <div className="flex items-center gap-2 text-violet-800">
            <Tag className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wider">Live sales</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-violet-950">{content.liveSales}</p>
          <p className="mt-0.5 text-[11px] text-violet-900/80">{content.liveSalesSub}</p>
        </div>
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-100">
        {content.insight}
      </p>

      {onNavigate ? (
        <button
          type="button"
          onClick={() => onNavigate(content.workspaceLink)}
          className="flex w-full items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          View channel cases
          <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
