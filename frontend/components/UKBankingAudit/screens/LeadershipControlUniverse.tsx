'use client';

import React, { useMemo } from 'react';
import { aiInsights, controls, getControl, obligations, processes, riskDomains } from '../dataModel';
import { bandText, trendArrow, trendTone } from '../theme';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

type ControlEntry = (typeof controls)[number];
type DriftTrend = 'worsening' | 'rapidly_worsening';

const DRIFT_TRENDS: ReadonlySet<DriftTrend> = new Set(['worsening', 'rapidly_worsening']);
const DRIFT_TREND_RANK: Record<DriftTrend, number> = { rapidly_worsening: 0, worsening: 1 };

export function LeadershipControlUniverse({
  activeViewMode,
  setActiveViewMode,
  openDrawer,
  filterDomain,
  setFilterDomain,
}: {
  activeViewMode: string;
  setActiveViewMode: (m: string) => void;
  openDrawer: OpenDrawer;
  filterDomain: string | null;
  setFilterDomain: (id: string | null) => void;
}) {
  const filteredControls = useMemo(() => {
    if (!filterDomain) return controls;
    const dom = riskDomains.find((d) => d.id === filterDomain);
    if (!dom) return controls;
    return controls.filter((c) => (c as { linkedRiskIds?: string[] }).linkedRiskIds?.[0] === dom.primaryDriverRiskId);
  }, [filterDomain]);

  const controlRows = useMemo(() => {
    return processes
      .map((process) => {
        const rowControls = filteredControls.filter((control) => control.processId === process.id);
        return {
          id: process.id,
          label: compactProcessName(process.name),
          count: rowControls.length,
          chips: rowControls
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((control) => ({
              id: control.id,
              tone: control.ces.band,
              onClick: () => openDrawer('control', control.id, 'controlUniverse'),
            })),
        };
      })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [filteredControls, openDrawer]);

  const obligationRows = useMemo(() => {
    return obligations
      .map((obligation) => ({
        id: obligation.id,
        label: `${obligation.citationShort} (${obligation.regulator})`,
        count: obligation.linkedControlIds.length,
        chips: obligation.linkedControlIds
          .map((controlId) => getControl(controlId))
          .filter(Boolean)
          .map((control) => ({
            id: control!.id,
            tone: control!.ces.band,
            onClick: () => openDrawer('obligation', obligation.id, 'controlUniverse'),
          })),
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [openDrawer]);

  const driftControls = useMemo(() => buildDriftWatch(filteredControls), [filteredControls]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Control Universe & Obligation Coverage</h2>
          <p className="text-xs text-slate-500">
            SMF16/17 leadership view · {controls.length} controls · {obligations.length} obligations
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-0.5">
          {(['controls', 'obligations'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveViewMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${activeViewMode === m ? 'bg-white shadow-sm' : 'text-slate-600'}`}
            >
              {m === 'controls' ? 'Controls' : 'Obligation Coverage'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Domain:</span>
        <button
          type="button"
          onClick={() => setFilterDomain(null)}
          className={`rounded px-2.5 py-1 text-xs ${!filterDomain ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </button>
        {riskDomains.slice(0, 5).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setFilterDomain(d.id)}
            className={`rounded px-2.5 py-1 text-xs ${filterDomain === d.id ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {activeViewMode === 'controls' ? 'Control Universe' : 'Obligation Coverage'}
              </h3>
              <div className="text-xs text-slate-500">
                {activeViewMode === 'controls' ? `${controlRows.length} process lanes` : `${obligationRows.length} obligations`}
              </div>
            </div>
            {activeViewMode === 'controls' ? (
              <MatrixView rows={controlRows} />
            ) : (
              <MatrixView rows={obligationRows} />
            )}
          </div>

          <div className="mt-4 min-h-[240px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Domain AI Insights</h3>
            <div className="space-y-2">
              {aiInsights
                .filter((i) => i.screenRelevance.includes('controlUniverse'))
                .slice(0, 3)
                .map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => openDrawer('aiInsight', i.id, 'controlUniverse')}
                    className="w-full rounded border border-slate-200 p-2 text-left hover:border-indigo-300 hover:bg-indigo-50/30"
                  >
                    <div className="text-xs font-medium text-slate-900">{i.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      conf {Math.round(i.confidence * 100)}% · {i.type.replace('_', ' ')}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-4">
          <DriftWatch entries={driftControls} openDrawer={openDrawer} />
        </div>
      </div>
    </div>
  );
}

type MatrixRow = {
  id: string;
  label: string;
  count: number;
  chips: { id: string; tone: string; onClick: () => void }[];
};

function MatrixView({ rows }: { rows: MatrixRow[] }) {
  if (!rows.length) {
    return <div className="px-5 py-8 text-sm text-slate-500">No records available for the current filter.</div>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[180px_36px_1fr] items-center gap-4 px-5 py-3"
        >
          <div className="truncate text-sm font-semibold text-slate-900" title={row.label}>
            {row.label}
          </div>
          <div className="text-right text-sm font-medium text-slate-500 tabular-nums">{row.count}</div>
          <div className="flex flex-wrap gap-1.5">
            {row.chips.map((chip) => (
              <button
                key={`${row.id}-${chip.id}`}
                type="button"
                onClick={chip.onClick}
                title={chip.id}
                className={`rounded-md border px-2 py-1 font-mono text-[11px] leading-none transition hover:brightness-95 ${chipTone(chip.tone)}`}
              >
                {chip.id}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function compactProcessName(name: string) {
  if (name.startsWith('AML')) return 'AML Alert Disposition';
  if (name.startsWith('Customer Onboarding')) return 'Customer Onboarding';
  if (name.startsWith('Wire Payments')) return 'Wire Payments';
  if (name.startsWith('Vendor Onboarding')) return 'Vendor Onboarding';
  if (name.startsWith('Model Validation')) return 'Model Validation';
  if (name.startsWith('Loan Origination')) return 'Loan Origination';
  return name;
}

function chipTone(tone: string) {
  if (tone === 'green') return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  if (tone === 'amber') return 'border-amber-300 bg-amber-50 text-amber-700';
  if (tone === 'red') return 'border-rose-300 bg-rose-50 text-rose-700';
  return 'border-slate-300 bg-slate-50 text-slate-700';
}

type DriftEntry = {
  id: string;
  title: string;
  ces: number;
  cesBand: string;
  cesTrend: string;
  threeDim: ControlEntry['threeDim'];
};

function buildDriftWatch(source: ControlEntry[]): DriftEntry[] {
  return source
    .filter((control) => DRIFT_TRENDS.has(control.ces.trend as DriftTrend))
    .sort((a, b) => {
      const rankDiff =
        DRIFT_TREND_RANK[a.ces.trend as DriftTrend] - DRIFT_TREND_RANK[b.ces.trend as DriftTrend];
      if (rankDiff !== 0) return rankDiff;
      return a.ces.current - b.ces.current;
    })
    .slice(0, 6)
    .map((control) => ({
      id: control.id,
      title: control.title,
      ces: control.ces.current,
      cesBand: control.ces.band,
      cesTrend: control.ces.trend,
      threeDim: control.threeDim,
    }));
}

function DriftWatch({ entries, openDrawer }: { entries: DriftEntry[]; openDrawer: OpenDrawer }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Drift Watch</h3>
        <p className="text-[11px] text-slate-500">Worsening trend</p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-500">
          No worsening controls in scope.
        </div>
      ) : (
        <div className="max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <DriftCard key={entry.id} entry={entry} openDrawer={openDrawer} />
          ))}
        </div>
      )}
    </div>
  );
}

function DriftCard({ entry, openDrawer }: { entry: DriftEntry; openDrawer: OpenDrawer }) {
  return (
    <button
      type="button"
      onClick={() => openDrawer('control', entry.id, 'driftWatch')}
      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-semibold text-violet-700">{entry.id}</div>
          <div className="truncate text-xs font-medium text-slate-900" title={entry.title}>
            {entry.title}
          </div>
        </div>
        <div className={`flex items-center gap-1 leading-none ${bandText(entry.cesBand)}`}>
          <span className="text-base font-bold tabular-nums">{entry.ces}</span>
          <span className={`text-sm ${trendTone(entry.cesTrend)}`}>{trendArrow(entry.cesTrend)}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <DimMetric label="Op rate"  value={entry.threeDim.operating.current} band={entry.threeDim.operating.band} />
        <DimMetric label="Catch"    value={entry.threeDim.catch.current}     band={entry.threeDim.catch.band} />
        <DimMetric label="Evidence" value={entry.threeDim.evidence.current}  band={entry.threeDim.evidence.band} />
      </div>
    </button>
  );
}

function DimMetric({ label, value, band }: { label: string; value: number; band: string }) {
  return (
    <div>
      <div className="text-[9px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-xs font-bold tabular-nums ${bandText(band)}`}>{value}%</div>
    </div>
  );
}
