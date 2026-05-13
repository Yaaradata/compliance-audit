'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatInrLossDisplay } from '../inrFormat';
import {
  getSeniorManager,
  incidents,
  medianRcaCycleTimeDays,
  rcas,
} from '../dataModel';
import type { Incident } from '../dataModel';
import { Chip, EmptyState, SectionCard, Stat } from '../primitives';
import { oriFocusRing } from '../theme';
import { useOriDemoHints } from '../OriDemoContext';
import type { OpenDrawer, OrmCrossNavIntent } from '../types';

const CLOSED = new Set(['closed', 'closed_no_loss']);

function parseYmd(s: string) {
  return new Date(s.includes('T') ? s : `${s}T00:00:00`).getTime();
}

function fmtDiscovered(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function rcaForIncident(inc: Incident) {
  if (inc.linked_rca_id) return rcas.find((r) => r.rca_id === inc.linked_rca_id) || null;
  return rcas.find((r) => r.incident_id === inc.incident_id) || null;
}

function rcaStatusLabel(inc: Incident) {
  const r = rcaForIncident(inc);
  if (!r) return 'No RCA';
  return r.status?.replace(/_/g, ' ') ?? '—';
}

function typeChipTone(t: string): 'slate' | 'rose' | 'violet' | 'sky' | 'amber' | 'indigo' {
  if (t === 'operational_loss') return 'slate';
  if (t === 'near_miss') return 'sky';
  if (t === 'fraud') return 'rose';
  if (t === 'cyber') return 'violet';
  if (t === 'conduct') return 'amber';
  if (t === 'regulatory_breach') return 'indigo';
  return 'slate';
}

export function IncidentRegister({
  openDrawer,
  ormCrossNav,
  consumeOrmCrossNav,
}: {
  openDrawer: OpenDrawer;
  ormCrossNav?: OrmCrossNavIntent | null;
  consumeOrmCrossNav?: () => void;
}) {
  const [ormCritical7d, setOrmCritical7d] = useState(false);

  useEffect(() => {
    if (!ormCrossNav || ormCrossNav.target !== 'incidentRegister' || ormCrossNav.preset !== 'critical_incidents_7d') return;
    setOrmCritical7d(true);
    consumeOrmCrossNav?.();
  }, [ormCrossNav, consumeOrmCrossNav]);

  const d30 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 30);
    return d.getTime();
  }, []);

  const typeOpts = ['operational_loss', 'near_miss', 'fraud', 'cyber', 'conduct', 'regulatory_breach'];
  const sevOpts = useMemo(() => Array.from(new Set(incidents.map((i) => i.severity))).sort(), []);
  const busUnits = useMemo(() => Array.from(new Set(incidents.map((i) => i.business_unit || '—'))).sort(), []);
  const statusOpts = useMemo(() => Array.from(new Set(incidents.map((i) => i.status))).sort(), []);
  const baselOpts = useMemo(() => Array.from(new Set(incidents.map((i) => i.basel_event_type || '—'))).sort(), []);

  const [typeFilter, setTypeFilter] = useState('');
  const [sevFilter, setSevFilter] = useState('');
  const [buFilter, setBuFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [baselFilter, setBaselFilter] = useState('');
  const [rcaFilter, setRcaFilter] = useState<'yes' | 'no' | ''>('');

  const clearFilters = useCallback(() => {
    setTypeFilter('');
    setSevFilter('');
    setBuFilter('');
    setStatusFilter('');
    setBaselFilter('');
    setRcaFilter('');
    setOrmCritical7d(false);
  }, []);

  const weekCutInclusive6 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 6);
    return d.getTime();
  }, []);

  const demo = useOriDemoHints();

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const demoF = demo?.incidentFilter;
      if (demoF) {
        if (!demoF.incidentTypes.includes(i.incident_type)) return false;
        if (parseYmd(i.discovered_date) < demoF.minDiscoveredTs) return false;
        return true;
      }
      if (ormCritical7d) {
        if (CLOSED.has(i.status)) return false;
        if (i.severity !== 'high' && i.severity !== 'critical') return false;
        if (parseYmd(i.discovered_date) < weekCutInclusive6) return false;
      }
      if (typeFilter && i.incident_type !== typeFilter) return false;
      if (sevFilter && i.severity !== sevFilter) return false;
      const bu = i.business_unit || '—';
      if (buFilter && bu !== buFilter) return false;
      if (statusFilter && i.status !== statusFilter) return false;
      const bsl = i.basel_event_type || '—';
      if (baselFilter && bsl !== baselFilter) return false;
      if (rcaFilter === 'yes' && !rcaForIncident(i)) return false;
      if (rcaFilter === 'no' && rcaForIncident(i)) return false;
      return true;
    });
  }, [typeFilter, sevFilter, buFilter, statusFilter, baselFilter, rcaFilter, ormCritical7d, weekCutInclusive6, demo?.incidentFilter]);

  const kpis = useMemo(() => {
    const openCount = incidents.filter((i) => !CLOSED.has(i.status)).length;
    const nm30 = incidents.filter(
      (i) => i.incident_type === 'near_miss' && parseYmd(i.discovered_date) >= d30
    ).length;
    const hiOpen = incidents.filter((i) => !CLOSED.has(i.status) && (i.severity === 'high' || i.severity === 'critical')).length;
    const med = medianRcaCycleTimeDays();
    return { openCount, nm30, hiOpen, med };
  }, [d30]);

  const filterSelectClass = `w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-offset-1 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 ${oriFocusRing}`;
  const hasListFilters = !!(typeFilter || sevFilter || buFilter || statusFilter || baselFilter || rcaFilter || ormCritical7d);

  return (
    <div className="space-y-5">
      {ormCritical7d && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
          <span>
            <strong>ORM filter:</strong> critical or high severity · open pipeline · discovered in the last 7 calendar days.
          </span>
          <button
            type="button"
            className="font-semibold text-indigo-800 underline"
            onClick={() => setOrmCritical7d(false)}
          >
            Clear
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat k="Open incidents" v={kpis.openCount} sub="Status not closed / closed-no-loss" tone="indigo" />
        <Stat k="Near-miss (30d)" v={kpis.nm30} sub="Discovered in last 30 days" tone="violet" />
        <Stat k="High / critical open" v={kpis.hiOpen} sub="Severity · open pipeline" tone="rose" />
        <Stat
          k="Avg RCA cycle time"
          v={kpis.med == null ? '—' : `${kpis.med} d`}
          sub="Median completed RCA (start → completion)"
          tone="slate"
        />
      </div>

      <SectionCard title="Filters">
        <div className="flex flex-wrap items-end gap-2 sm:gap-3 xl:flex-nowrap">
          <label className="flex min-w-0 flex-1 basis-[7.5rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by incident type"
            >
              <option value="">All types</option>
              {typeOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[6rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Severity</span>
            <select
              value={sevFilter}
              onChange={(e) => setSevFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by severity"
            >
              <option value="">All severities</option>
              {sevOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[7.5rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Unit</span>
            <select
              value={buFilter}
              onChange={(e) => setBuFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by business unit"
            >
              <option value="">All units</option>
              {busUnits.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[8rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {statusOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[8rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Basel</span>
            <select
              value={baselFilter}
              onChange={(e) => setBaselFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by Basel event type"
            >
              <option value="">All Basel types</option>
              {baselOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[5.5rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">RCA</span>
            <select
              value={rcaFilter}
              onChange={(e) => setRcaFilter(e.target.value as 'yes' | 'no' | '')}
              className={filterSelectClass}
              aria-label="Filter by RCA linked"
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          {hasListFilters ? (
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

      <SectionCard title="Incident register" subtitle={`${filtered.length} in view · ORI mock`}>
        {!filtered.length ? (
          <EmptyState
            message="No incidents match these filters."
            hint="Adjust filters or clear to see the register again."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Type</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">Severity</th>
                  <th className="px-2 py-2 text-left">Unit</th>
                  <th className="px-2 py-2 text-left">Discovered</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Basel</th>
                  <th className="px-2 py-2 text-right">Net loss</th>
                  <th className="px-2 py-2 text-left">RCA status</th>
                  <th className="px-2 py-2 text-left">Accountable SM</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const sm = getSeniorManager(i.accountable_senior_manager_id);
                  const gross = i.gross_loss_inr ?? 0;
                  const rec = i.recovery_inr ?? 0;
                  const net = gross - rec;
                  const netDisp =
                    i.gross_loss_inr == null && i.recovery_inr == null ? '—' : formatInrLossDisplay(net);
                  return (
                    <tr
                      key={i.incident_id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => openDrawer('incident', i.incident_id, 'incidentRegister')}
                    >
                      <td className="px-2 py-2 font-mono text-[11px] text-slate-700">{i.incident_id}</td>
                      <td className="px-2 py-2">
                        <Chip label={i.incident_type.replace(/_/g, ' ')} size="xs" tone={typeChipTone(i.incident_type)} />
                      </td>
                      <td className="max-w-[14rem] truncate px-2 py-2 font-medium text-slate-800" title={i.title}>
                        {i.title}
                      </td>
                      <td className="px-2 py-2 capitalize text-slate-700">{i.severity}</td>
                      <td className="max-w-[8rem] truncate px-2 py-2 text-slate-600" title={i.business_unit}>
                        {i.business_unit || '—'}
                      </td>
                      <td className="px-2 py-2 text-slate-600">{fmtDiscovered(i.discovered_date)}</td>
                      <td className="px-2 py-2 text-[10px] text-slate-700">{i.status.replace(/_/g, ' ')}</td>
                      <td className="max-w-[9rem] truncate px-2 py-2 text-[10px] text-slate-600" title={i.basel_event_type}>
                        {(i.basel_event_type || '—').replace(/_/g, ' ')}
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-slate-800">{netDisp}</td>
                      <td className="px-2 py-2 text-[10px] capitalize text-slate-700">{rcaStatusLabel(i)}</td>
                      <td className="px-2 py-2 text-slate-700">{sm?.name ?? i.accountable_senior_manager_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
