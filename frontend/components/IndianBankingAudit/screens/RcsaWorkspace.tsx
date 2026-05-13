'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  getProcess,
  getRisk,
  getSeniorManager,
  openPreventiveActionCountForRisk,
  rcsaCells,
  rcsaCycles,
} from '../dataModel';
import { Chip, DimCell, EmptyState, SectionCard, Stat, StatusBadge, TrendArrow } from '../primitives';
import { oriFocusRing } from '../theme';
import type { OpenDrawer } from '../types';
import type { RcsaCell, RcsaCycle } from '../dataModel';

const IN_FLIGHT = new Set(['in_progress', 'spoc_review', 'hod_approval']);

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function humanizeCadence(c?: string) {
  if (!c) return '—';
  return c.replace(/_/g, ' ');
}

function cycleStatusTone(st: string): string {
  if (st === 'signed_off') return 'emerald';
  if (st === 'locked') return 'slate';
  if (st === 'hod_approval') return 'amber';
  if (st === 'spoc_review') return 'violet';
  if (st === 'in_progress') return 'indigo';
  if (st === 'not_started') return 'slate';
  return 'slate';
}

function residualBand(r: string) {
  if (r === 'high') return 'red';
  if (r === 'medium') return 'amber';
  return 'green';
}

function residualScoreForDim(r: string) {
  if (r === 'high') return 88;
  if (r === 'medium') return 55;
  return 28;
}

function barTailwindForStatus(st: string): string {
  const m: Record<string, string> = {
    not_started: 'bg-slate-400',
    in_progress: 'bg-indigo-500',
    spoc_review: 'bg-violet-500',
    hod_approval: 'bg-amber-500',
    signed_off: 'bg-emerald-500',
    locked: 'bg-slate-500',
  };
  return m[st] || 'bg-slate-400';
}

const RCSA_CAL_STATUS_LEGEND: { status: string; label: string }[] = [
  { status: 'not_started', label: 'Not started' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'spoc_review', label: 'SPOC review' },
  { status: 'hod_approval', label: 'HoD approval' },
  { status: 'signed_off', label: 'Signed off' },
  { status: 'locked', label: 'Locked' },
];

function humanizeCycleStatus(st: string) {
  return st.replace(/_/g, ' ');
}

function RcsaRefreshCalendar({ cycles, today }: { cycles: RcsaCycle[]; today: Date }) {
  if (!cycles.length) {
    return (
      <SectionCard title="RCSA refresh calendar" subtitle="FY26-H1 window">
        <EmptyState message="No cycles in the current filter — calendar hidden." hint="Clear filters to see cycle timelines." />
      </SectionCard>
    );
  }
  const fyStart = new Date('2026-04-01T00:00:00').getTime();
  const fyEnd = new Date('2026-09-30T23:59:59').getTime();
  const span = fyEnd - fyStart || 1;
  const tToday = Math.min(Math.max(today.getTime(), fyStart), fyEnd);
  const todayPct = ((tToday - fyStart) / span) * 100;

  const pct = (iso: string) => {
    const t = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`).getTime();
    const x = Number.isNaN(t) ? fyStart : Math.min(Math.max(t, fyStart), fyEnd);
    return ((x - fyStart) / span) * 100;
  };

  const n = cycles.length;

  return (
    <SectionCard title="RCSA refresh calendar" subtitle="FY26-H1 · each bar runs from period start → target SPOC sign-off; colour = cycle status">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          className="relative grid min-w-[42rem] items-stretch"
          style={{
            gridTemplateColumns: 'minmax(12rem, 15rem) minmax(22rem, 1fr)',
            gridTemplateRows: `auto repeat(${n}, auto)`,
          }}
        >
          <div className="flex items-center border-b border-r border-slate-200 bg-slate-50 px-4 py-3" style={{ gridColumn: 1, gridRow: 1 }}>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Cycle / unit</span>
          </div>
          <div className="flex items-end justify-between border-b border-slate-200 bg-slate-50 px-4 pb-2 pt-2" style={{ gridColumn: 2, gridRow: 1 }}>
            <span className="text-xs font-semibold text-slate-700">Apr 2026</span>
            <span className="text-xs font-medium text-slate-500">FY26-H1 window</span>
            <span className="text-xs font-semibold text-slate-700">Sep 2026</span>
          </div>

          {cycles.map((c, i) => {
            const row = i + 2;
            const raw0 = pct(c.period_start);
            const raw1 = pct(c.target_signoff_at || c.period_end);
            const left = Math.min(raw0, raw1);
            const width = Math.max(1.25, Math.abs(raw1 - raw0));
            return (
              <React.Fragment key={c.rcsa_cycle_id}>
                <div
                  className="flex flex-col justify-center border-b border-r border-slate-100 bg-slate-50/90 px-4 py-3"
                  style={{ gridColumn: 1, gridRow: row }}
                >
                  <span className="text-sm font-semibold leading-snug text-slate-900" title={c.cycle_name}>
                    {c.cycle_name}
                  </span>
                  <span className="mt-1 text-xs capitalize text-slate-600">{humanizeCycleStatus(c.status || '')}</span>
                </div>
                <div className="relative z-0 border-b border-slate-100 bg-white px-4 py-3" style={{ gridColumn: 2, gridRow: row }}>
                  <div className="relative h-10 w-full rounded-md bg-slate-100 ring-1 ring-slate-200/80">
                    <div
                      className={`absolute inset-y-1 rounded-md shadow-sm ring-1 ring-black/5 ${barTailwindForStatus(c.status)}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                      title={`${fmtDate(c.period_start)} → ${fmtDate(c.target_signoff_at || c.period_end)} · ${humanizeCycleStatus(c.status || '')}`}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Today marker: same column as tracks, spans all data rows */}
          <div className="pointer-events-none relative z-10" style={{ gridColumn: 2, gridRow: `2 / span ${n}` }}>
            <div className="absolute inset-0 px-4 py-3">
              <div className="relative h-full w-full">
                <div
                  className="absolute bottom-0 top-0 w-0 border-l-2 border-dashed border-orange-500"
                  style={{ left: `${todayPct}%` }}
                  title="Today (clamped inside Apr–Sep 2026)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="inline-block h-3 w-0.5 border-l-2 border-dashed border-orange-500" aria-hidden />
            Orange dashed line = today (clamped inside Apr–Sep 2026)
          </span>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Bar colour = cycle status</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {RCSA_CAL_STATUS_LEGEND.map(({ status, label }) => (
              <span key={status} className="inline-flex items-center gap-2 text-xs text-slate-700">
                <span className={`h-3 w-5 shrink-0 rounded-sm ring-1 ring-black/10 ${barTailwindForStatus(status)}`} aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function RcsaWorkspace({ openDrawer }: { openDrawer: OpenDrawer }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = ymd(today);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [controlsPick, setControlsPick] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const cellsByCycle = useMemo(() => {
    const m = new Map<string, RcsaCell[]>();
    for (const c of rcsaCells) {
      const arr = m.get(c.rcsa_cycle_id) || [];
      arr.push(c);
      m.set(c.rcsa_cycle_id, arr);
    }
    return m;
  }, []);

  const allStatuses = useMemo(() => Array.from(new Set(rcsaCycles.map((c) => c.status))).sort(), []);
  const allBus = useMemo(() => Array.from(new Set(rcsaCycles.map((c) => c.business_unit || c.cycle_name))).sort(), []);
  const allCadence = useMemo(() => Array.from(new Set(rcsaCycles.map((c) => c.refresh_cadence || 'half_yearly'))).sort(), []);

  const [statusFilter, setStatusFilter] = useState('');
  const [buFilter, setBuFilter] = useState('');
  const [cadenceFilter, setCadenceFilter] = useState('');

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setBuFilter('');
    setCadenceFilter('');
  }, []);

  const filteredCycles = useMemo(() => {
    return rcsaCycles.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      const bu = c.business_unit || c.cycle_name;
      if (buFilter && bu !== buFilter) return false;
      const cad = c.refresh_cadence || 'half_yearly';
      if (cadenceFilter && cad !== cadenceFilter) return false;
      return true;
    });
  }, [statusFilter, buFilter, cadenceFilter]);

  const filterSelectClass = `w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-offset-1 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 ${oriFocusRing}`;
  const hasScopeFilters = !!(statusFilter || buFilter || cadenceFilter);

  const kpis = useMemo(() => {
    const inProg = rcsaCycles.filter((c) => IN_FLIGHT.has(c.status)).length;
    const highRes = rcsaCells.filter((c) => c.residual_rating === 'high').length;
    const overdue = rcsaCells.filter((cell) => {
      const cy = rcsaCycles.find((x) => x.rcsa_cycle_id === cell.rcsa_cycle_id);
      const tgt = cy?.target_signoff_at || cy?.period_end;
      if (!tgt) return false;
      const tgtDate = ymd(new Date(tgt.includes('T') ? tgt : `${tgt}T00:00:00`));
      if (tgtDate >= todayStr) return false;
      return cell.spoc_attested_at == null || cell.spoc_attested_at === '';
    }).length;
    const det = rcsaCells.filter((c) => c.residual_trend === 'deteriorating').length;
    return { inProg, highRes, overdue, det };
  }, [todayStr]);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k="Cycles in progress" v={kpis.inProg} sub="In progress · SPOC review · HOD approval" tone="indigo" />
          <Stat k="High residual cells" v={kpis.highRes} sub="Across all cycles" tone="rose" />
          <Stat k="Overdue attestations" v={kpis.overdue} sub="Target sign-off passed · SPOC not attested" tone="amber" />
          <Stat k="Deteriorating trend" v={kpis.det} sub="RCSA cell residual trend" tone="amber" />
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 ${oriFocusRing}`}
            onClick={() => flash('Queued — new RCSA cycle wizard will follow BRMC-approved template.')}
          >
            + New Cycle
          </button>
          <button
            type="button"
            className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 ${oriFocusRing}`}
            onClick={() => flash('Import queued — workbook validation runs offline in this prototype.')}
          >
            Import RCSA Excel
          </button>
          <button
            type="button"
            className={`rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 shadow-sm hover:bg-indigo-100 ${oriFocusRing}`}
            onClick={() => flash('Export queued — ORMC pack will attach MIS annex from latest RCSA refresh.')}
          >
            Export to ORMC pack
          </button>
        </div>
      </div>

      <SectionCard title="Scope filters" subtitle="One dropdown per dimension; All clears that filter.">
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <label className="flex min-w-0 flex-1 basis-[7rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by cycle status"
            >
              <option value="">All statuses</option>
              {allStatuses.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[7rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Unit</span>
            <select
              value={buFilter}
              onChange={(e) => setBuFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by business unit"
            >
              <option value="">All units</option>
              {allBus.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[7rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cadence</span>
            <select
              value={cadenceFilter}
              onChange={(e) => setCadenceFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by refresh cadence"
            >
              <option value="">All cadences</option>
              {allCadence.map((v) => (
                <option key={v} value={v}>
                  {humanizeCadence(v)}
                </option>
              ))}
            </select>
          </label>
          {hasScopeFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className={`shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 ${oriFocusRing}`}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="RCSA cycles" subtitle="Expand a row to inspect assessed cells · FY26-H1">
        {!filteredCycles.length ? (
          <EmptyState
            message="No RCSA cycles match these filters."
            hint="Clear filters to return to the full FY26-H1 register."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left">Business unit</th>
                  <th className="px-2 py-2 text-left">Period</th>
                  <th className="px-2 py-2 text-left">Cadence</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-right">High res. / total</th>
                  <th className="px-2 py-2 text-right">Days to signoff</th>
                  <th className="px-2 py-2 text-left">Owner SM</th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredCycles.map((c) => {
                  const cells = cellsByCycle.get(c.rcsa_cycle_id) || [];
                  const high = cells.filter((x) => x.residual_rating === 'high').length;
                  const tgt = c.target_signoff_at || c.period_end;
                  const tgtD = new Date(tgt.includes('T') ? tgt : `${tgt}T00:00:00`);
                  const days = Math.round((tgtD.getTime() - today.getTime()) / 86400000);
                  const sm = getSeniorManager(c.owner_senior_manager_id);
                  const open = expanded.has(c.rcsa_cycle_id);
                  return (
                    <React.Fragment key={c.rcsa_cycle_id}>
                      <tr className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-2 font-medium text-slate-800">{c.business_unit || c.cycle_name}</td>
                        <td className="px-2 py-2 text-slate-600">
                          {c.fiscal_period_label} · {fmtDate(c.period_start)} – {fmtDate(c.period_end)}
                        </td>
                        <td className="px-2 py-2 capitalize text-slate-600">{humanizeCadence(c.refresh_cadence)}</td>
                        <td className="px-2 py-2">
                          <StatusBadge tone={cycleStatusTone(c.status)} label={c.status.replace(/_/g, ' ')} size="xs" />
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-[10px] text-slate-700">
                          {high}/{cells.length}
                        </td>
                        <td className={`px-2 py-2 text-right font-bold ${days < 0 ? 'text-rose-700' : 'text-slate-700'}`}>{days}</td>
                        <td className="px-2 py-2 text-slate-700">{sm?.name ?? c.owner_senior_manager_id}</td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            className="rounded border border-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-600 hover:bg-white"
                            aria-expanded={open}
                            onClick={() =>
                              setExpanded((prev) => {
                                const n = new Set(prev);
                                if (n.has(c.rcsa_cycle_id)) n.delete(c.rcsa_cycle_id);
                                else n.add(c.rcsa_cycle_id);
                                return n;
                              })
                            }
                          >
                            {open ? '⌄' : '>'}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={8} className="px-2 py-3">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cells · {cells.length}</div>
                            <div className="mt-2 overflow-x-auto rounded border border-slate-200 bg-white">
                              <table className="w-full text-[11px]">
                                <thead className="bg-slate-100 text-[9px] uppercase text-slate-500">
                                  <tr>
                                    <th className="px-2 py-1.5 text-left">Process</th>
                                    <th className="px-2 py-1.5 text-left">Risk</th>
                                    <th className="px-2 py-1.5 text-left">Inherent</th>
                                    <th className="px-2 py-1.5 text-left">Controls</th>
                                    <th className="px-2 py-1.5 text-right">Effectiveness %</th>
                                    <th className="px-2 py-1.5 text-left">Residual</th>
                                    <th className="px-2 py-1.5 text-left">Trend</th>
                                    <th className="px-2 py-1.5 text-right">Open actions</th>
                                    <th className="px-2 py-1.5 text-left">Last refreshed</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cells.map((cell) => {
                                    const proc = getProcess(cell.process_id);
                                    const rk = getRisk(cell.risk_id);
                                    const poa = openPreventiveActionCountForRisk(cell.risk_id);
                                    const showCtrls = controlsPick === cell.rcsa_cell_id;
                                    return (
                                      <tr
                                        key={cell.rcsa_cell_id}
                                        className="cursor-pointer border-t border-slate-100 hover:bg-indigo-50/40"
                                        onClick={() => openDrawer('risk', cell.risk_id, 'rcsaWorkspace')}
                                      >
                                        <td className="px-2 py-1.5 font-mono text-[10px] text-slate-700">{proc?.name ?? cell.process_id}</td>
                                        <td className="px-2 py-1.5 text-slate-800">{rk?.title ?? cell.risk_id}</td>
                                        <td className="px-2 py-1.5">
                                          <div className="flex items-center gap-1">
                                            <Chip label={cell.inherent_rating} tone="slate" size="xs" />
                                            <span className="text-[10px] text-slate-400">
                                              L{cell.inherent_likelihood}×I{cell.inherent_impact}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-2 py-1.5">
                                          <button
                                            type="button"
                                            className="text-left text-indigo-700 underline decoration-dotted"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setControlsPick(showCtrls ? null : cell.rcsa_cell_id);
                                            }}
                                          >
                                            {cell.control_ids.length} linked
                                          </button>
                                          {showCtrls && (
                                            <div className="mt-1 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                                              {cell.control_ids.map((id) => (
                                                <Chip key={id} label={id} size="xs" tone="indigo" />
                                              ))}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono font-bold text-slate-800">
                                          {Math.round(cell.control_effectiveness_score)}%
                                        </td>
                                        <td className="px-2 py-1.5">
                                          <DimCell value={residualScoreForDim(cell.residual_rating)} band={residualBand(cell.residual_rating)} />
                                          <div className="mt-0.5 text-[9px] capitalize text-slate-500">{cell.residual_rating}</div>
                                        </td>
                                        <td className="px-2 py-1.5">
                                          <TrendArrow trend={cell.residual_trend} />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono text-slate-700">{poa}</td>
                                        <td className="px-2 py-1.5 text-slate-600">{cell.last_refreshed ? fmtDate(cell.last_refreshed) : '—'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <RcsaRefreshCalendar cycles={filteredCycles} today={today} />
    </div>
  );
}
