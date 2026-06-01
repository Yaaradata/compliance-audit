'use client';

import { useMemo } from 'react';
import { FASTAG_INDIA_SCOPE_HEADING } from './auditData';
import type { FastTagSop } from './fastTagCaseBuilder';
import {
  buildFastTagStageHeatmap,
  getFastTagHeatCellStyles,
  layoutFastTagHeatmapGrid,
} from './fastTagJourneyHeatmap';

type CaseLike = {
  subject?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

type Props = {
  cases: CaseLike[];
  sop: FastTagSop;
  /** When set, cell counts reflect this RTO; colors stay on all-India scale. */
  regionCode?: string | null;
  regionLabel?: string;
  regionalCaseCount?: number;
  getStageHeader: (stage: { id: string; name: string }) => string;
};

const LEGEND = [
  { label: 'None', swatch: 'bg-slate-100 ring-slate-200' },
  { label: 'Low', swatch: 'bg-emerald-100 ring-emerald-200' },
  { label: 'Med', swatch: 'bg-amber-100 ring-amber-200' },
  { label: 'High', swatch: 'bg-orange-200 ring-orange-300' },
  { label: 'Critical', swatch: 'bg-red-300 ring-red-400' },
] as const;

/** Read-only lifecycle stage heatmap — no filters or cell selection. */
export default function FastTagStageHeatmapPanel({
  cases,
  sop,
  regionCode = null,
  regionLabel,
  regionalCaseCount = 0,
  getStageHeader,
}: Props) {
  const heatCells = useMemo(
    () => buildFastTagStageHeatmap(cases, sop, regionCode || null, getStageHeader),
    [cases, sop, regionCode, getStageHeader],
  );

  const heatRows = useMemo(() => layoutFastTagHeatmapGrid(heatCells), [heatCells]);

  const scopeLine = regionCode ? (
    <>
      <span className="font-medium text-slate-700">
        {regionalCaseCount} case{regionalCaseCount === 1 ? '' : 's'}
      </span>{' '}
      in {regionLabel ?? regionCode} · cell color uses all-India scale
    </>
  ) : (
    <>Exceptions by lifecycle stage — failed or in review ({FASTAG_INDIA_SCOPE_HEADING})</>
  );

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Stage heatmap
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{scopeLine}</p>
      </div>
      <div className="px-4 py-3">
        <div
          className="grid grid-cols-4 gap-1.5"
          role="img"
          aria-label="Stage heatmap showing exception density by lifecycle stage"
        >
          {heatRows.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${rowIdx}-${colIdx}`}
                    className="aspect-square rounded-md border border-dashed border-slate-200/80 bg-slate-50/50"
                    aria-hidden
                  />
                );
              }
              const styles = getFastTagHeatCellStyles(cell.risk);
              return (
                <div
                  key={cell.stageId}
                  title={`${cell.stageName}: ${cell.failureCount} exception(s) of ${cell.totalInScope} in scope (${cell.failureRate}%)${
                    regionCode ? ' · selected state' : ''
                  }`}
                  className={`flex aspect-square items-center justify-center rounded-md p-1 text-center ring-1 ${styles.cell}`}
                >
                  <span className={`text-[9px] font-bold uppercase leading-tight ${styles.text}`}>
                    {cell.shortLabel}
                  </span>
                </div>
              );
            }),
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
          {LEGEND.map(({ label, swatch }) => (
            <span key={label} className="inline-flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm ring-1 ${swatch}`} aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
