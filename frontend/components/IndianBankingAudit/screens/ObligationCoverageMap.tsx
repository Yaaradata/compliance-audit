'use client';

import React, { useMemo, useState } from 'react';
import {
  controls,
  controlsForObligation,
  evidenceRecords,
  getControl,
  getRegulation,
  getReportingClock,
  getSeniorManager,
  obligations,
  regulations,
} from '../dataModel';
import { Chip, EmptyState, KVRow, SectionCard, StatusBadge } from '../primitives';
import { bandBar, bandFromScore, bandText } from '../theme';
import type { OpenDrawer, SetActiveScreen } from '../types';

const REGULATORS = ['ALL', ...Array.from(new Set(regulations.map((r) => r.regulator)))];

export function ObligationCoverageMap({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const [activeRegulator, setActiveRegulator] = useState<string>('ALL');
  const [selectedOblId, setSelectedOblId] = useState<string | null>(obligations[0]?.obligation_id || null);

  const filteredObligations = useMemo(() => {
    if (activeRegulator === 'ALL') return obligations;
    return obligations.filter((o) => {
      const r = getRegulation(o.regulation_id);
      return r?.regulator === activeRegulator;
    });
  }, [activeRegulator]);

  const selectedObl = obligations.find((o) => o.obligation_id === selectedOblId) || null;

  // OCS aggregate
  const ocs = useMemo(() => {
    if (!filteredObligations.length) return 0;
    const covered = filteredObligations.filter((o) => o.linked_control_ids.length > 0).length;
    return Math.round((covered / filteredObligations.length) * 100);
  }, [filteredObligations]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SmallStat k="OCS" v={ocs} sub={`${filteredObligations.length} obligations`} band={bandFromScore(ocs)} />
        <SmallStat
          k="Strong coverage"
          v={filteredObligations.filter((o) => o.linked_control_ids.length >= 2).length}
          sub="2+ linked controls"
          band="green"
        />
        <SmallStat
          k="Thin coverage"
          v={filteredObligations.filter((o) => o.linked_control_ids.length === 1).length}
          sub="1 control"
          band="amber"
        />
        <SmallStat
          k="Coverage gap"
          v={filteredObligations.filter((o) => o.linked_control_ids.length === 0).length}
          sub="0 controls"
          band="red"
        />
      </div>

      {/* Regulator filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Regulator:</span>
        {REGULATORS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setActiveRegulator(r)}
            className={`rounded px-2.5 py-1 text-xs ${activeRegulator === r ? 'bg-violet-100 font-semibold text-violet-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Zone A — Obligation list */}
        <div className="lg:col-span-2">
          <SectionCard title={`Obligations (${filteredObligations.length})`} subtitle="Click to open coverage drill-in">
            <div className="space-y-2">
              {filteredObligations.map((o) => {
                const reg = getRegulation(o.regulation_id);
                const linked = controlsForObligation(o.obligation_id);
                const meanCES = linked.length
                  ? Math.round(linked.reduce((s, c) => s + (c.ces ?? 0), 0) / linked.length)
                  : 0;
                const evdComplete = evidenceRecords.filter(
                  (e) =>
                    linked.some((c) => c.evidence_specs.some((es) => e.evidence_id.includes(es.replace('EVD-', '')))) &&
                    e.evidence_status === 'Complete'
                ).length;
                const coverage = o.linked_control_ids.length === 0 ? 'gap' : o.linked_control_ids.length === 1 ? 'thin' : 'adequate';
                const coverageBand = coverage === 'gap' ? 'red' : coverage === 'thin' ? 'amber' : 'green';
                const isActive = o.obligation_id === selectedOblId;
                return (
                  <button
                    key={o.obligation_id}
                    type="button"
                    onClick={() => setSelectedOblId(o.obligation_id)}
                    className={`block w-full rounded-lg border p-3 text-left transition ${isActive ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] text-slate-500">{o.obligation_id}</div>
                        <div className="text-xs font-semibold text-slate-900">{o.atomic_requirement}</div>
                      </div>
                      <Chip label={reg?.regulator || '—'} tone="violet" size="xs" />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Coverage strength</div>
                        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full ${bandBar(coverageBand)}`} style={{ width: `${linked.length * 33}%` }} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">CES</div>
                        <div className={`text-sm font-bold ${bandText(bandFromScore(meanCES))}`}>{meanCES || '—'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">EVD ✓</div>
                        <div className="text-sm font-bold text-emerald-700">{evdComplete}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Zone B — Drill-in panel */}
        <div className="space-y-4">
          {selectedObl ? (
            <>
              <SectionCard title="Selected obligation">
                <KVRow k="Obligation ID" v={selectedObl.obligation_id} mono />
                <KVRow k="Regulator" v={getRegulation(selectedObl.regulation_id)?.regulator || '—'} />
                <KVRow
                  k="Accountable SM"
                  v={getSeniorManager(selectedObl.accountable_senior_manager_id)?.role || selectedObl.accountable_senior_manager_id}
                />
                <KVRow k="Reporting clock" v={selectedObl.reporting_clock_id ? getReportingClock(selectedObl.reporting_clock_id)?.clock_label || selectedObl.reporting_clock_id : '—'} />
                <KVRow k="Applicability" v={selectedObl.applicability_archetype.join(', ')} />
              </SectionCard>

              <SectionCard
                title={`Linked controls (${selectedObl.linked_control_ids.length})`}
                actions={
                  selectedObl.linked_control_ids[0] ? (
                    <button
                      type="button"
                      onClick={() => openDrawer('control', selectedObl.linked_control_ids[0], 'obligationCoverage')}
                      className="text-xs font-semibold text-indigo-600"
                    >
                      Open first →
                    </button>
                  ) : undefined
                }
              >
                {selectedObl.linked_control_ids.length ? (
                  <div className="space-y-2">
                    {selectedObl.linked_control_ids.map((cid) => {
                      const c = getControl(cid);
                      if (!c) return null;
                      return (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => openDrawer('control', cid, 'obligationCoverage')}
                          className="block w-full rounded border border-slate-200 p-2 text-left hover:border-indigo-300"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-600">{c.control_id}</span>
                            <StatusBadge tone={c.ces_band} label={`CES ${c.ces ?? '—'}`} size="xs" />
                          </div>
                          <div className="text-[11px] font-medium text-slate-800">{c.title}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState message="No controls linked" hint="OBL coverage gap — raise issue" />
                )}
              </SectionCard>

              <button
                type="button"
                onClick={() => setActiveScreen('controlUniverse')}
                className="w-full rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
              >
                Browse Control Universe →
              </button>
            </>
          ) : (
            <EmptyState message="Select an obligation" />
          )}
        </div>
      </div>
    </div>
  );
}

function SmallStat({ k, v, sub, band }: { k: string; v: number; sub: string; band: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className={`text-2xl font-bold ${bandText(band)}`}>{v}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
