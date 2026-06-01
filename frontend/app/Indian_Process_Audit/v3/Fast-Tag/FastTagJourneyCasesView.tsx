'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Table2 } from 'lucide-react';
import { CasesView } from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagSop } from './fastTagCaseBuilder';
import {
  getFastTagCaseDisplaySubject,
  getFastTagCaseRegion,
  getFastTagRegionCaseCounts,
  getFastTagRegionFailedCounts,
} from './auditData';
import FastTagIndiaRegionMap from './FastTagIndiaRegionMap';
import FastTagRegionSummaryPanel from './FastTagRegionSummaryPanel';
import FastTagStageHeatmapPanel from './FastTagStageHeatmapPanel';
import { filterFastTagCasesByRegion, getFastTagRegionOptions } from './fastTagJourneyHeatmap';
import {
  type FastTagOutcomeDrill,
  type FastTagOutcomeSlice,
  outcomeDrillLabel,
  outcomeSliceToDrill,
} from './fastTagOutcomeDrill';
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
  const [viewAllIndia, setViewAllIndia] = useState(true);
  const [outcomeDrill, setOutcomeDrill] = useState<FastTagOutcomeDrill | null>(null);

  const resetToAllIndia = () => {
    setViewAllIndia(true);
    setRegionCode('');
  };

  useEffect(() => {
    setOutcomeDrill(null);
  }, [regionCode, viewAllIndia]);

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

  const heatRegionCode = viewAllIndia ? null : regionCode || null;

  const regionalCaseCount = useMemo(() => {
    if (!heatRegionCode) return cases.length;
    return filterFastTagCasesByRegion(cases, heatRegionCode).length;
  }, [cases, heatRegionCode]);

  const selectedRegionLabel = useMemo(
    () => regionOptions.find((o) => o.id === regionCode)?.label,
    [regionOptions, regionCode],
  );

  const filteredCases = useMemo(() => {
    if (viewAllIndia) return cases;
    return filterFastTagCasesByRegion(cases, regionCode || null);
  }, [cases, regionCode, viewAllIndia]);

  const emptyMessage = useMemo(() => {
    if (filteredCases.length > 0) return undefined;
    const regionLabel = regionOptions.find((o) => o.id === regionCode)?.label ?? 'region';
    if (regionCode) return `No ${entity.plural.toLowerCase()} in ${regionLabel}.`;
    return undefined;
  }, [filteredCases.length, regionCode, regionOptions, entity.plural]);

  const handleAllIndia = () => {
    resetToAllIndia();
  };

  const handleOutcomeSelect = (slice: FastTagOutcomeSlice) => {
    const drill = outcomeSliceToDrill(slice);
    if (drill) setOutcomeDrill(drill);
  };

  const selectionSummary = useMemo(
    () =>
      buildFastTagSelectionSummary({
        cases: filteredCases,
        allCases: cases,
        sop,
        regionCode,
        stageFilter: null,
        viewAllIndia,
        getStageHeader,
      }),
    [filteredCases, cases, sop, regionCode, viewAllIndia, getStageHeader],
  );

  const drillCases = useMemo(() => {
    if (!outcomeDrill) return filteredCases;
    if (outcomeDrill.mode === 'compliant-details') {
      return filteredCases.filter((kase) => kase.overallStatus === 'compliant');
    }
    if (outcomeDrill.mode === 'matrix' && outcomeDrill.status) {
      return filteredCases.filter((kase) => kase.overallStatus === outcomeDrill.status);
    }
    return filteredCases;
  }, [filteredCases, outcomeDrill]);

  const drillEmptyMessage = useMemo(() => {
    if (!outcomeDrill || drillCases.length > 0) return emptyMessage;
    if (outcomeDrill.mode === 'compliant-details') {
      return `No completed ${entity.plural.toLowerCase()} in this selection.`;
    }
    if (outcomeDrill.status === 'failure') {
      return `No critical ${entity.plural.toLowerCase()} in this selection.`;
    }
    if (outcomeDrill.status === 'pending') {
      return `No exception ${entity.plural.toLowerCase()} in this selection.`;
    }
    return emptyMessage;
  }, [outcomeDrill, drillCases.length, emptyMessage, entity.plural]);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[320px]">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Region</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              Pick a state on the map (RTO from VRN), or Overall for all-India
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
                if (!code) {
                  resetToAllIndia();
                  return;
                }
                setViewAllIndia(false);
                setRegionCode(code);
              }}
              onAllIndia={handleAllIndia}
            />
            {!viewAllIndia && regionCode ? (
              <button
                type="button"
                onClick={resetToAllIndia}
                className="mt-3 w-full rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80"
              >
                Clear state filter
              </button>
            ) : null}
          </div>
        </div>

        <FastTagStageHeatmapPanel
          cases={cases}
          sop={sop}
          regionCode={heatRegionCode}
          regionLabel={selectedRegionLabel}
          regionalCaseCount={regionalCaseCount}
          getStageHeader={getStageHeader}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {!outcomeDrill ? (
          <FastTagRegionSummaryPanel
            summary={selectionSummary}
            cases={filteredCases}
            selectedRegionCode={regionCode}
            onSelectRegion={(code) => {
              setViewAllIndia(false);
              setRegionCode(code);
              setOutcomeDrill(null);
            }}
            onViewTable={() => setOutcomeDrill({ mode: 'matrix' })}
            onOutcomeSelect={handleOutcomeSelect}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOutcomeDrill(null)}
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to summary
              </button>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                {outcomeDrill.mode === 'matrix' ? (
                  <Table2 className="h-3.5 w-3.5" aria-hidden />
                ) : null}
                {selectionSummary.heading} · {outcomeDrillLabel(outcomeDrill)}
              </p>
            </div>

            {outcomeDrill.mode === 'compliant-details' ? (
              <p className="rounded-lg bg-emerald-50/80 px-4 py-2.5 text-[11px] leading-relaxed text-emerald-950 ring-1 ring-emerald-200/90">
                Completed cases — click a case name in the matrix below to expand the full
                submission trail for all SOP stages.
              </p>
            ) : null}

            <CasesView
              domainId={domainId}
              sop={sop}
              cases={drillCases}
              entity={entity}
              domainLabel={domainLabel}
              onOpenEvidence={onOpenEvidence}
              controls={controls}
              journeyTitle={journeyTitle}
              getStageHeader={getStageHeader}
              controlExceptionLabels={controlExceptionLabels}
              hideJourneyHeader
              emptyCasesMessage={drillEmptyMessage}
              pageSize={10}
              formatCaseSubject={(kase: FastTagCase) =>
                getFastTagCaseDisplaySubject(kase.subject)
              }
              onCaseRowSelect={undefined}
              onPageChange={undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}
