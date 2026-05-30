'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Table2 } from 'lucide-react';
import { CasesView } from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagSop } from './fastTagCaseBuilder';
import {
  FASTAG_INDIA_SCOPE_HEADING,
  FASTAG_OVERALL_SCOPE_BUTTON,
  getFastTagCaseDisplaySubject,
  getFastTagCaseRegion,
  getFastTagRegionCaseCounts,
  getFastTagRegionFailedCounts,
} from './auditData';
import FastTagIndiaRegionMap from './FastTagIndiaRegionMap';
import FastTagRegionSummaryPanel from './FastTagRegionSummaryPanel';
import {
  buildFastTagStageHeatmap,
  filterFastTagCasesByRegion,
  isFastTagStageAuditFinding,
  getFastTagHeatCellStyles,
  getFastTagRegionOptions,
  layoutFastTagHeatmapGrid,
} from './fastTagJourneyHeatmap';
import { buildFastTagSelectionSummary } from './fastTagRegionSummary';

type FastTagCase = {
  id: string;
  subject: string;
  segment?: string;
  scenario: string;
  overallStatus?: string;
  failStageId?: string;
  failControlId?: string;
  journeyException?: string;
  trail: { stage: { id: string; name: string }; status: string }[];
};

type Props = {
  domainId: string;
  domainLabel: string;
  sop: FastTagSop;
  cases: FastTagCase[];
  entity: { singular: string; plural: string; entity: string };
  controls: AuditControl[];
  journeyTitle?: string;
  getStageHeader: (stage: { id: string; name: string }) => string;
  controlExceptionLabels?: Record<string, string>;
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
};

export default function FastTagJourneyCasesView({
  domainId,
  domainLabel,
  sop,
  cases,
  entity,
  controls,
  journeyTitle,
  getStageHeader,
  controlExceptionLabels,
  onOpenEvidence,
}: Props) {
  const [regionCode, setRegionCode] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [viewAllIndia, setViewAllIndia] = useState(false);
  const [viewAllInRegion, setViewAllInRegion] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    setShowTable(false);
  }, [regionCode, stageFilter, viewAllIndia, viewAllInRegion]);

  const regionOptions = useMemo(() => getFastTagRegionOptions(cases), [cases]);

  const availableRegionCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const kase of cases) {
      const code = getFastTagCaseRegion(kase);
      if (code) codes.add(code);
    }
    return [...codes];
  }, [cases]);

  const regionCaseCounts = useMemo(() => getFastTagRegionCaseCounts(cases), [cases]);

  const regionFailedCounts = useMemo(() => getFastTagRegionFailedCounts(cases), [cases]);

  const heatCells = useMemo(
    () => buildFastTagStageHeatmap(cases, sop, regionCode || null, getStageHeader),
    [cases, sop, regionCode, getStageHeader],
  );

  const heatRows = useMemo(() => layoutFastTagHeatmapGrid(heatCells), [heatCells]);

  const regionalCaseCount = useMemo(() => {
    if (!regionCode) return cases.length;
    return filterFastTagCasesByRegion(cases, regionCode).length;
  }, [cases, regionCode]);

  const filteredCases = useMemo(() => {
    if (viewAllIndia) return cases;
    let rows = filterFastTagCasesByRegion(cases, regionCode || null);
    if (stageFilter) {
      rows = rows.filter((kase) => isFastTagStageAuditFinding(kase, stageFilter));
    }
    return rows;
  }, [cases, regionCode, stageFilter, viewAllIndia]);

  const emptyMessage = useMemo(() => {
    if (filteredCases.length > 0) return undefined;
    const regionLabel = regionOptions.find((o) => o.id === regionCode)?.label ?? 'region';
    const stageLabel = heatCells.find((c) => c.stageId === stageFilter)?.shortLabel ?? 'stage';
    if (stageFilter && regionCode) {
      return `No exception or critical ${entity.plural.toLowerCase()} in ${regionLabel} at ${stageLabel}.`;
    }
    if (stageFilter) {
      return `No exception or critical ${entity.plural.toLowerCase()} at ${stageLabel}.`;
    }
    if (regionCode) return `No ${entity.plural.toLowerCase()} in ${regionLabel}.`;
    return undefined;
  }, [filteredCases.length, regionCode, stageFilter, regionOptions, heatCells, entity.plural]);

  const toggleStage = (stageId: string) => {
    setViewAllIndia(false);
    setViewAllInRegion(false);
    setStageFilter((prev) => (prev === stageId ? null : stageId));
  };

  const clearCaseFilters = () => {
    setViewAllIndia(false);
    setViewAllInRegion(false);
    setStageFilter(null);
    setShowTable(false);
  };

  const handleAllIndia = () => {
    if (viewAllIndia) {
      clearCaseFilters();
      setRegionCode('');
      return;
    }
    setViewAllIndia(true);
    setViewAllInRegion(false);
    setRegionCode('');
    setStageFilter(null);
  };

  const handleShowAllStages = () => {
    if (showAllStagesActive) {
      clearCaseFilters();
      return;
    }
    setStageFilter(null);
    if (regionCode) {
      setViewAllIndia(false);
      setViewAllInRegion(true);
    } else {
      setViewAllIndia(true);
      setViewAllInRegion(false);
      setRegionCode('');
    }
  };

  const showAllStagesActive = viewAllInRegion || (viewAllIndia && !stageFilter);

  const filtersReady =
    viewAllIndia || viewAllInRegion || Boolean(regionCode && stageFilter);

  const selectionSummary = useMemo(
    () =>
      filtersReady
        ? buildFastTagSelectionSummary({
            cases: filteredCases,
            allCases: cases,
            sop,
            regionCode,
            stageFilter,
            viewAllIndia,
            getStageHeader,
          })
        : null,
    [
      filteredCases,
      cases,
      sop,
      regionCode,
      stageFilter,
      viewAllIndia,
      getStageHeader,
      filtersReady,
    ],
  );

  const filterPrompt = useMemo(() => {
    if (filtersReady) return null;
    if (!regionCode && !stageFilter) {
      return `Click ${FASTAG_OVERALL_SCOPE_BUTTON} or pick a state on the map and a stage in the heatmap to open the regional summary.`;
    }
    if (!regionCode) {
      return `Pick a state on the map, click Show All on the heatmap, or ${FASTAG_OVERALL_SCOPE_BUTTON} for the ${FASTAG_INDIA_SCOPE_HEADING} summary.`;
    }
    return 'Click a stage in the heatmap to focus this state, or Show All for the full state summary.';
  }, [filtersReady, regionCode, stageFilter]);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Left — region map + stage heatmap (separate cards) */}
        <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[320px]">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Region</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                Pick a state on the map (RTO from VRN)
              </p>
            </div>
            <div className="px-4 py-3">
              <FastTagIndiaRegionMap
                selectedCode={regionCode}
                allIndiaActive={viewAllIndia}
                availableCodes={availableRegionCodes}
                caseCounts={regionCaseCounts}
                failedCounts={regionFailedCounts}
                onSelect={(code) => {
                  setViewAllIndia(false);
                  setViewAllInRegion(false);
                  setRegionCode(code);
                  setStageFilter(null);
                }}
                onAllIndia={handleAllIndia}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Stage heatmap
                </p>
                <button
                  type="button"
                  onClick={handleShowAllStages}
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors ${
                    showAllStagesActive
                      ? 'bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-700'
                      : 'text-indigo-700 ring-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  Show All
                </button>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {regionCode ? (
                  <>
                    <span className="font-medium text-slate-700">
                      {regionalCaseCount} case{regionalCaseCount === 1 ? '' : 's'}
                    </span>{' '}
                    in {regionOptions.find((o) => o.id === regionCode)?.label ?? regionCode} · cell
                    color reflects exception density for this state (all-India scale)
                  </>
                ) : (
                  <>Exceptions by lifecycle stage — failed or in review ({FASTAG_INDIA_SCOPE_HEADING})</>
                )}
                . Click a cell to focus the summary.
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-4 gap-1.5">
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
                    const isActive = stageFilter === cell.stageId;
                    return (
                      <button
                        key={cell.stageId}
                        type="button"
                        title={`${cell.stageName}: ${cell.failureCount} exception(s) of ${cell.totalInScope} in scope (failed or in review)${regionCode ? ' · selected state' : ''}`}
                        onClick={() => toggleStage(cell.stageId)}
                        className={`flex aspect-square items-center justify-center rounded-md p-1 text-center ring-1 transition-all ${styles.cell} ${styles.hover} ${
                          isActive ? styles.active : ''
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase leading-tight ${styles.text}`}>
                          {cell.shortLabel}
                        </span>
                      </button>
                    );
                  }),
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-200" /> None
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" /> Low
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Med
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-orange-200 ring-1 ring-orange-300" /> High
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-red-300 ring-1 ring-red-400" /> Critical
                </span>
              </div>
              {(stageFilter || regionCode || viewAllIndia) && (
                <button
                  type="button"
                  onClick={() => {
                    setViewAllIndia(false);
                    setViewAllInRegion(false);
                    setStageFilter(null);
                    setRegionCode('');
                  }}
                  className="mt-3 w-full rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Right — regional summary, then optional journey matrix drill-down */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {filtersReady && selectionSummary ? (
            <>
              {!showTable ? (
                <FastTagRegionSummaryPanel
                  summary={selectionSummary}
                  onViewTable={() => setShowTable(true)}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTable(false)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Back to summary
                    </button>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Table2 className="h-3.5 w-3.5" aria-hidden />
                      {selectionSummary.heading} · {filteredCases.length} case
                      {filteredCases.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  <CasesView
                    domainId={domainId}
                    sop={sop}
                    cases={filteredCases}
                    entity={entity}
                    domainLabel={domainLabel}
                    onOpenEvidence={onOpenEvidence}
                    controls={controls}
                    journeyTitle={journeyTitle}
                    getStageHeader={getStageHeader}
                    controlExceptionLabels={controlExceptionLabels}
                    hideJourneyHeader
                    emptyCasesMessage={emptyMessage}
                    pageSize={10}
                    formatCaseSubject={(kase: FastTagCase) => getFastTagCaseDisplaySubject(kase.subject)}
                    onCaseRowSelect={undefined}
                    onPageChange={undefined}
                  />
                </>
              )}
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">Issuance cases — Journey matrix</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{filterPrompt}</p>
            </div>
          )}
        </div>
    </div>
  );
}
