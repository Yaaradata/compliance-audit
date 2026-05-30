'use client';

import { useMemo } from 'react';
import {
  getJourneyHeatCellStyles,
  getJourneyHeatRiskTier,
  type JourneyHeatRisk,
} from './journeyHeatmap';
import { buildJourneySliceStats, type JourneyCaseLike } from './journeySliceData';

type Props = {
  cases: JourneyCaseLike[];
  portfolioLabel: string;
  entityPlural: string;
  selectedId: string;
  portfolioActive: boolean;
  resolveSlice: (kase: JourneyCaseLike) => string;
  getSliceLabel?: (id: string) => string;
  onSelect: (sliceId: string) => void;
  onAllPortfolio: () => void;
};

function sliceRisk(failed: number, total: number, maxFailed: number): JourneyHeatRisk {
  if (total <= 0 || failed <= 0) return 'none';
  return getJourneyHeatRiskTier(failed, maxFailed);
}

export default function JourneySliceSelector({
  cases,
  portfolioLabel,
  entityPlural,
  selectedId,
  portfolioActive,
  resolveSlice,
  getSliceLabel,
  onSelect,
  onAllPortfolio,
}: Props) {
  const labelFor = getSliceLabel ?? ((id: string) => id);
  const stats = useMemo(
    () => buildJourneySliceStats(cases, resolveSlice, labelFor),
    [cases, resolveSlice, getSliceLabel],
  );
  const maxFailed = Math.max(0, ...stats.map((s) => s.failedCount));

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAllPortfolio}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ring-1 transition-colors ${
          portfolioActive
            ? 'bg-indigo-600 text-white ring-indigo-600'
            : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50'
        }`}
      >
        <span>{portfolioLabel}</span>
        <span
          className={`tabular-nums text-xs font-medium ${portfolioActive ? 'text-indigo-100' : 'text-slate-500'}`}
        >
          {cases.length} {entityPlural.toLowerCase()}
        </span>
      </button>

      <ul className="max-h-[280px] space-y-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {stats.map((row) => {
          const risk = sliceRisk(row.failedCount, row.caseCount, maxFailed);
          const styles = getJourneyHeatCellStyles(risk);
          const isActive = !portfolioActive && selectedId === row.id;
          const failPct =
            row.caseCount > 0 ? Math.round((row.failedCount / row.caseCount) * 100) : 0;

          return (
            <li key={row.id}>
              <button
                type="button"
                title={`${row.label}: ${row.failedCount} with findings of ${row.caseCount}`}
                onClick={() => onSelect(row.id)}
                className={`flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left ring-1 transition-all ${styles.cell} ${styles.hover} ${
                  isActive ? styles.active : ''
                }`}
              >
                <span className={`min-w-0 flex-1 text-[11px] font-semibold leading-snug ${styles.text}`}>
                  {row.label}
                </span>
                <span className={`shrink-0 text-[10px] tabular-nums ${styles.text}`}>
                  {row.failedCount}/{row.caseCount}
                  {row.failedCount > 0 ? ` · ${failPct}%` : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-slate-100 ring-1 ring-slate-200" /> None
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" /> Low
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Med
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-orange-200 ring-1 ring-orange-300" /> High
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-red-300 ring-1 ring-red-400" /> Critical
        </span>
      </div>
    </div>
  );
}
