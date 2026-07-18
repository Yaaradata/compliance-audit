// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  personas,
  crsaAttestationCycles,
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

/**
 * v6 CRSA Cycle Cockpit — same structure and layout as v4.
 * Persona landing for SMF16: active cycle, area tiles, horizon scanner, findings.
 */
export function CRSACycleCockpitV6({
  openDrawer,
  setActiveScreen,
  setSelectedRiskAreaId,
  setSelectedCycleId,
  selectedCycleId,
}) {
  const persona = personas.find((p) => p.id === 'smf16');
  const [reportCycleId, setReportCycleId] = useState(null);

  if (!persona) return <EmptyState message="SMF16 persona not configured." />;

  const cycles = crsaAttestationCycles || [];
  const focalCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];

  const drillToArea = (cycle) => {
    setSelectedCycleId(cycle.id);
    setSelectedRiskAreaId(cycle.riskAreaId);
    setActiveScreen('controlUniverse');
  };

  const reportCycle = reportCycleId ? cycles.find((c) => c.id === reportCycleId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">
            {persona.smfDesignation}
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900">{persona.label}</h1>
          <p className="mt-1 text-sm text-slate-600">{persona.subhead}</p>
        </div>
        <button
          type="button"
          onClick={() => setReportCycleId(focalCycle?.id || null)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Generate Quarterly Report →
        </button>
      </div>

      {/* Cycle summary card — focuses on AML by default (the demo focal cycle). */}
      {focalCycle && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Active Cycle
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                {focalCycle.id} · {focalCycle.periodLabel}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Owner {focalCycle.ownerSMFId} · due {focalCycle.dueDate} · source template{' '}
                <span className="font-mono">{focalCycle.sourceTemplateRef}</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Completion
                </div>
                <div className="text-3xl font-bold text-slate-900">{focalCycle.completionPct}%</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Exceptions
                </div>
                <div
                  className={`text-3xl font-bold ${
                    focalCycle.exceptionsCount > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {focalCycle.exceptionsCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  {focalCycle.status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <CoverageMetric
              mode={focalCycle.coverageMode}
              populationSize={focalCycle.populationSize}
              size="lg"
            />
          </div>
        </div>
      )}

      {/* 5-up area tile grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">CRSA Cycles · Q2 2026</h2>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            click an area to drill (per-requirement view)
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cycles.map((cycle) => {
            const area = (riskAreas || []).find((a) => a.id === cycle.riskAreaId);
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
