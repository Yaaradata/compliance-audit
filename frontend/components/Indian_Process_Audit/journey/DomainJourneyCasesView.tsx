'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Table2 } from 'lucide-react';
import { CasesView } from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import JourneySelectionSummaryPanel from './JourneySelectionSummaryPanel';
import JourneySliceSelector from './JourneySliceSelector';
import type { JourneyDomainConfig } from './journeyDomainConfigs';
import {
  buildJourneyStageHeatmap,
  filterCasesBySlice,
  getJourneyHeatCellStyles,
  isJourneyStageAuditFinding,
  layoutJourneyHeatmapGrid,
} from './journeyHeatmap';
import { buildJourneySelectionSummary } from './journeySelectionSummary';
import { getJourneySliceOptions, type JourneyCaseLike } from './journeySliceData';

type JourneySop = {
  name: string;
  purpose: string;
  stages: { id: string; name: string }[];
};

type Props = {
  config: JourneyDomainConfig;
  domainId: string;
  domainLabel: string;
  sop: JourneySop;
  cases: JourneyCaseLike[];
  entity: { singular: string; plural: string; entity: string };
  controls: AuditControl[];
  journeyTitle?: string;
  getStageHeader: (stage: { id: string; name: string }) => string;
  controlExceptionLabels?: Record<string, string>;
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
};

export default function DomainJourneyCasesView({
  config,
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
  const [sliceId, setSliceId] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [viewAllPortfolio, setViewAllPortfolio] = useState(false);
  const [viewAllInSlice, setViewAllInSlice] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const { resolveSlice, getSliceLabel } = config;

  useEffect(() => {
    setShowTable(false);
  }, [sliceId, stageFilter, viewAllPortfolio, viewAllInSlice]);

  const sliceOptions = useMemo(
    () => getJourneySliceOptions(cases, resolveSlice, getSliceLabel),
    [cases, resolveSlice, getSliceLabel],
  );

  const heatCells = useMemo(
    () =>
      buildJourneyStageHeatmap(cases, sop, sliceId || null, getStageHeader, resolveSlice),
    [cases, sop, sliceId, getStageHeader, resolveSlice],
  );

  const heatRows = useMemo(
    () => layoutJourneyHeatmapGrid(heatCells, config.heatmapColumns),
    [heatCells, config.heatmapColumns],
  );

  const sliceCaseCount = useMemo(() => {
    if (!sliceId) return cases.length;
    return filterCasesBySlice(cases, sliceId, resolveSlice).length;
  }, [cases, sliceId, resolveSlice]);

  const filteredCases = useMemo(() => {
    if (viewAllPortfolio) return cases;
    let rows = filterCasesBySlice(cases, sliceId || null, resolveSlice);
    if (stageFilter) {
      rows = rows.filter((kase) => isJourneyStageAuditFinding(kase, stageFilter));
    }
    return rows;
  }, [cases, sliceId, stageFilter, viewAllPortfolio, resolveSlice]);

  const emptyMessage = useMemo(() => {
    if (filteredCases.length > 0) return undefined;
    const sliceLabel = sliceOptions.find((o) => o.id === sliceId)?.label ?? 'selection';
    const stageLabel = heatCells.find((c) => c.stageId === stageFilter)?.shortLabel ?? 'stage';
    const plural = entity.plural.toLowerCase();
    if (stageFilter && sliceId) {
      return `No exception or critical ${plural} in ${sliceLabel} at ${stageLabel}.`;
    }
    if (stageFilter) {
      return `No exception or critical ${plural} at ${stageLabel}.`;
    }
    if (sliceId) return `No ${plural} in ${sliceLabel}.`;
    return undefined;
  }, [filteredCases.length, sliceId, stageFilter, sliceOptions, heatCells, entity.plural]);

  const toggleStage = (stageId: string) => {
    setViewAllPortfolio(false);
    setViewAllInSlice(false);
    setStageFilter((prev) => (prev === stageId ? null : stageId));
  };

  const clearCaseFilters = () => {
    setViewAllPortfolio(false);
    setViewAllInSlice(false);
    setStageFilter(null);
    setShowTable(false);
  };

  const handleAllPortfolio = () => {
    if (viewAllPortfolio) {
      clearCaseFilters();
      setSliceId('');
      return;
    }
    setViewAllPortfolio(true);
    setViewAllInSlice(false);
    setSliceId('');
    setStageFilter(null);
  };

  const handleShowAllStages = () => {
    if (showAllStagesActive) {
      clearCaseFilters();
      return;
    }
    setStageFilter(null);
    if (sliceId) {
      setViewAllPortfolio(false);
      setViewAllInSlice(true);
    } else {
      setViewAllPortfolio(true);
      setViewAllInSlice(false);
      setSliceId('');
    }
  };

  const showAllStagesActive = viewAllInSlice || (viewAllPortfolio && !stageFilter);

  const filtersReady =
    viewAllPortfolio || viewAllInSlice || Boolean(sliceId && stageFilter);

  const selectionSummary = useMemo(
    () =>
      filtersReady
        ? buildJourneySelectionSummary({
            cases: filteredCases,
            allCases: cases,
            sop,
            sliceId,
            sliceLabel: sliceId ? getSliceLabel(sliceId) : null,
            sliceMeta: sliceId ? config.sliceMetaLabel : null,
            stageFilter,
            viewAllPortfolio,
            getStageHeader,
            copy: config.summaryCopy,
          })
        : null,
    [
      filteredCases,
      cases,
      sop,
      sliceId,
      stageFilter,
      viewAllPortfolio,
      getStageHeader,
      filtersReady,
      getSliceLabel,
      config.summaryCopy,
      config.sliceMetaLabel,
    ],
  );

  const filterPrompt = useMemo(() => {
    if (filtersReady) return null;
    if (!sliceId && !stageFilter) return config.filterPrompts.initial;
    if (!sliceId) return config.filterPrompts.noSlice;
    return config.filterPrompts.hasSlice;
  }, [filtersReady, sliceId, stageFilter, config.filterPrompts]);

  const gridColsClass =
    config.heatmapColumns === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[320px]">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {config.sliceRailTitle}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{config.sliceRailHint}</p>
          </div>
          <div className="px-4 py-3">
            <JourneySliceSelector
              cases={cases}
              portfolioLabel={config.portfolioLabel}
              entityPlural={entity.plural}
              selectedId={sliceId}
              portfolioActive={viewAllPortfolio}
              resolveSlice={resolveSlice}
              getSliceLabel={getSliceLabel}
              onSelect={(id) => {
                setViewAllPortfolio(false);
                setViewAllInSlice(false);
                setSliceId(id);
                setStageFilter(null);
              }}
              onAllPortfolio={handleAllPortfolio}
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
              {sliceId ? (
                <>
                  <span className="font-medium text-slate-700">
                    {sliceCaseCount} {entity.singular.toLowerCase()}
                    {sliceCaseCount === 1 ? '' : 's'}
                  </span>{' '}
                  in {getSliceLabel(sliceId)} · cell color reflects exception density for this slice
                  (portfolio scale)
                </>
              ) : (
                <>Exceptions by lifecycle stage — failed or in review ({config.portfolioLabel.toLowerCase()})</>
              )}
              . Click a cell to focus the summary.
            </p>
          </div>
          <div className="px-4 py-3">
            <div className={`grid ${gridColsClass} gap-1.5`}>
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
                  const styles = getJourneyHeatCellStyles(cell.risk);
                  const isActive = stageFilter === cell.stageId;
                  return (
                    <button
                      key={cell.stageId}
                      type="button"
                      title={`${cell.stageName}: ${cell.failureCount} exception(s) of ${cell.totalInScope} in scope (failed or in review)${sliceId ? ' · selected slice' : ''}`}
                      onClick={() => toggleStage(cell.stageId)}
                      className={`flex aspect-square items-center justify-center rounded-md p-1 text-center ring-1 transition-all ${styles.cell} ${styles.hover} ${
                        isActive ? styles.active : ''
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold uppercase leading-tight ${styles.text}`}
                      >
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
            {(stageFilter || sliceId || viewAllPortfolio) && (
              <button
                type="button"
                onClick={() => {
                  setViewAllPortfolio(false);
                  setViewAllInSlice(false);
                  setStageFilter(null);
                  setSliceId('');
                }}
                className="mt-3 w-full rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {filtersReady && selectionSummary ? (
          <>
            {!showTable ? (
              <JourneySelectionSummaryPanel
                summary={selectionSummary}
                onViewTable={() => setShowTable(true)}
                snapshotEyebrow={config.snapshotEyebrow}
                headerIcon={config.headerIcon}
                benchmarkVsLabel={config.benchmarkVsLabel}
                aiCopy={config.aiCopy}
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
                    {selectionSummary.heading} · {filteredCases.length}{' '}
                    {entity.singular.toLowerCase()}
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
                  onCaseRowSelect={undefined}
                  onPageChange={undefined}
                  formatCaseSubject={undefined}
                />
              </>
            )}
          </>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">{config.emptyMatrixTitle}</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{filterPrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
