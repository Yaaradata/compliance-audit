// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import {
  personas,
  crsaAttestationCycles,
  crsaAttestationLines,
  groupSetRequirements,
  riskAreas,
  horizonScanItems,
  findingsLedger,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import {
  EmptyState,
  CoverageMetric,
  RiskAreaTile,
  HorizonScannerPanel,
  FindingsLedger,
  QuarterlyReportGenerator,
} from './_shared';
import {
  AttestationWithoutPack,
  AttestationLinesTableV5,
} from '@/components/UKBankingAudit/v5/crsa';

export function CRSACycleCockpitV5({ openDrawer, setActiveScreen, setSelectedRiskAreaId, setSelectedCycleId, selectedCycleId, setSelectedGSRId }) {
  const persona = personas.find(p => p.id === "smf16");
  const [reportCycleId, setReportCycleId] = useState(null);

  if (!persona) return <EmptyState message="SMF16 persona not configured." />;

  const cycles = crsaAttestationCycles || [];
  const focalCycle = cycles.find(c => c.id === selectedCycleId) || cycles[0];

  const drillToArea = (cycle) => {
    setSelectedCycleId(cycle.id);
    setSelectedRiskAreaId(cycle.riskAreaId);
    setActiveScreen("controlUniverse"); // repurposed as the area-drill view
  };

  const reportCycle = reportCycleId ? cycles.find(c => c.id === reportCycleId) : null;

  const focalLines = useMemo(
    () => (crsaAttestationLines || []).filter((l) => l.cycleId === focalCycle?.id),
    [focalCycle?.id],
  );

  const gsrById = useMemo(() => {
    const m = {};
    for (const g of groupSetRequirements || []) {
      m[g.id] = { id: g.id, racmRef: g.racmRef, requirementText: g.requirementText };
    }
    return m;
  }, []);

  const drillToLine = (gsrId) => {
    if (!focalCycle) return;
    setSelectedGSRId?.(gsrId, focalCycle.id);
    setActiveScreen?.('perRequirementAttestation');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">{persona.smfDesignation}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{persona.label}</h1>
          <p className="text-sm text-slate-600 mt-1">{persona.subhead}</p>
        </div>
        <button onClick={() => setReportCycleId(focalCycle?.id || null)}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md shadow-sm">
          Generate Quarterly Report →
        </button>
      </div>

      {/* Cycle summary card — focuses on AML by default (the demo focal cycle). */}
      {focalCycle && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">Active Cycle</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {focalCycle.id} · {focalCycle.periodLabel}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Owner {focalCycle.ownerSMFId} · due {focalCycle.dueDate} · source template{" "}
                <span className="font-mono">{focalCycle.sourceTemplateRef}</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Completion</div>
                <div className="text-3xl font-bold text-slate-900">{focalCycle.completionPct}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Exceptions</div>
                <div className={`text-3xl font-bold ${focalCycle.exceptionsCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>{focalCycle.exceptionsCount}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Status</div>
                <div className="text-sm font-bold text-slate-900 mt-2">{focalCycle.status.replace(/_/g, " ")}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <CoverageMetric mode={focalCycle.coverageMode} populationSize={focalCycle.populationSize} size="lg" />
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
            <button
              type="button"
              className="shrink-0 rounded-md bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-800"
            >
              Submit cycle sign-off →
            </button>
            <div className="min-w-0 flex-1">
              <AttestationWithoutPack
                cycle={focalCycle}
                lines={focalLines}
                gsrById={gsrById}
                onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'crsaCycleCockpit')}
              />
            </div>
          </div>
        </div>
      )}

      {focalCycle ? (
        <AttestationLinesTableV5
          cycle={focalCycle}
          onDrillLine={drillToLine}
          onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'crsaCycleCockpit')}
        />
      ) : null}

      {/* 5-up area tile grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">CRSA Cycles · Q2 2026</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">click an area to drill (per-requirement view)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {cycles.map(cycle => {
            const area = (riskAreas || []).find(a => a.id === cycle.riskAreaId);
            if (!area) return null;
            return (
              <RiskAreaTile
                key={cycle.id}
                area={area}
                cycle={cycle}
                isActive={focalCycle?.id === cycle.id}
                onClick={() => drillToArea(cycle)}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: Horizon Scanner + Findings Ledger side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizonScannerPanel items={horizonScanItems || []} />
        <FindingsLedger findings={findingsLedger || []} openDrawer={openDrawer} />
      </div>

      {/* Modal */}
      {reportCycle && (
        <QuarterlyReportGenerator cycle={reportCycle} onClose={() => setReportCycleId(null)} />
      )}
    </div>
  );
}
