'use client';

/** Shared legend for journey funnel charts (single instance per panel). */
export function JourneyFunnelLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden />
        Passed
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" aria-hidden />
        In review
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm bg-red-600" aria-hidden />
        Failed
      </span>
    </div>
  );
}
