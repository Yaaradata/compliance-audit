'use client';

import { bandBg, bandText, trendArrow } from '../../theme';
import type { DomainHeatmapCell } from './types';

function DomainCard({
  cell,
  onSelect,
}: {
  cell: DomainHeatmapCell;
  onSelect: (cell: DomainHeatmapCell) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cell)}
      className={`group flex min-h-[7.5rem] flex-col rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:shadow-md ${bandBg(cell.band)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-bold text-slate-600">{cell.code}</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">{cell.title}</div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <span className={`font-mono text-2xl font-bold leading-none ${bandText(cell.band)}`}>{cell.resScore}</span>
          <span className={`text-sm ${bandText(cell.band)}`} title={cell.trend} aria-hidden>
            {trendArrow(cell.trend)}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-600">
        {cell.riskCount} risk{cell.riskCount !== 1 ? 's' : ''} · {cell.openIssueCount} open issue
        {cell.openIssueCount !== 1 ? 's' : ''}
      </p>

      <p className="mt-auto pt-2 text-[9px] font-medium uppercase leading-tight tracking-wide text-slate-500 line-clamp-2">
        {cell.regulatoryAnchor}
      </p>
    </button>
  );
}

export function RiskDomainHeatmap({
  domains,
  atRiskClockCount,
  onDomainSelect,
}: {
  domains: DomainHeatmapCell[];
  atRiskClockCount: number;
  onDomainSelect: (cell: DomainHeatmapCell) => void;
}) {
  return (
    <section aria-label="Risk domain heatmap" className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Risk Domain Heatmap</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            9 risk domains × inherent · residual · trend · RES — click any domain to drill into failing controls
          </p>
        </div>
        {atRiskClockCount > 0 ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
            {atRiskClockCount} clock{atRiskClockCount !== 1 ? 's' : ''} at-risk
          </span>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((cell) => (
          <DomainCard key={cell.domainId} cell={cell} onSelect={onDomainSelect} />
        ))}
      </div>
    </section>
  );
}
