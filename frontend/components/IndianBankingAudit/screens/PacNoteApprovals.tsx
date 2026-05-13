'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getIncident,
  getObligation,
  getProcess,
  getRca,
  getSeniorManager,
  pacNotes,
  preventiveActions,
  type PacNote,
  type PreventiveAction,
} from '../dataModel';
import { EmptyState } from '../primitives';
import { oriFocusRing } from '../theme';
import { useOriDemoHints } from '../OriDemoContext';
import type { OpenDrawer, OrmCrossNavIntent } from '../types';

const PENDING = 'pending_orm_review';
const OPEN_PA = (s: string) => s === 'open';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function parseTs(iso?: string | null) {
  if (!iso) return NaN;
  return new Date(iso).getTime();
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function relativeFrom(iso: string) {
  const t = parseTs(iso);
  if (Number.isNaN(t)) return '—';
  const diff = Date.now() - t;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function daysWaiting(pn: PacNote) {
  const sub = pn.submitted_at || pn.comments?.[0]?.at;
  if (!sub) return '—';
  const start = new Date(sub.includes('T') ? sub : `${sub}T12:00:00`);
  if (Number.isNaN(start.getTime())) return '—';
  start.setHours(0, 0, 0, 0);
  const d = Math.floor((startOfToday() - start.getTime()) / 86400000);
  return d < 0 ? '0' : String(d);
}

function medianDays(nums: number[]) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  if (s.length % 2 === 1) return Math.round(s[m] * 10) / 10;
  return Math.round(((s[m - 1] + s[m]) / 2) * 10) / 10;
}

function paIsOpen(pa: PreventiveAction | undefined) {
  return !!pa && OPEN_PA(pa.status);
}

function openBlockingCount(pn: PacNote) {
  const ids = pn.blocking_preventive_action_ids || [];
  let n = 0;
  for (const id of ids) {
    const pa = preventiveActions.find((p) => p.preventive_action_id === id);
    if (paIsOpen(pa)) n += 1;
  }
  return n;
}

function blockingOpenPas(pn: PacNote): PreventiveAction[] {
  const out: PreventiveAction[] = [];
  for (const id of pn.blocking_preventive_action_ids || []) {
    const pa = preventiveActions.find((p) => p.preventive_action_id === id);
    if (paIsOpen(pa)) out.push(pa as PreventiveAction);
  }
  return out;
}

function docTypeLabel(t?: string) {
  if (!t) return 'Document';
  return t.replace(/_/g, ' ');
}

function statusChipClass(st?: string) {
  if (st === PENDING) return 'border-amber-200 bg-amber-50 text-amber-900';
  if (st === 'conditional_approval') return 'border-violet-200 bg-violet-50 text-violet-900';
  if (st === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (st === 'rejected') return 'border-rose-200 bg-rose-50 text-rose-900';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function paOverdueDays(pa: PreventiveAction, todayStart: number) {
  if (!OPEN_PA(pa.status)) return '—';
  const td = parseTs(pa.target_date?.includes('T') ? pa.target_date : `${pa.target_date}T00:00:00`);
  if (Number.isNaN(td)) return '—';
  if (td >= todayStart) return '0';
  return String(Math.floor((todayStart - td) / 86400000));
}

function useHasMinWidth(px: number) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const fn = () => setOk(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [px]);
  return ok;
}

function defaultTitle(pn: PacNote) {
  if (pn.title) return pn.title;
  return `${docTypeLabel(pn.document_type)} · ${pn.business_unit || 'ORM'}`;
}

export function PacNoteApprovals({
  openDrawer,
  onOpenRcaWorkspace,
  ormCrossNav,
  consumeOrmCrossNav,
}: {
  openDrawer: OpenDrawer;
  onOpenRcaWorkspace: (rcaId: string) => void;
  ormCrossNav?: OrmCrossNavIntent | null;
  consumeOrmCrossNav?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const [statusFilter, setStatusFilter] = useState('');
  const [docFilter, setDocFilter] = useState('');
  const [buFilter, setBuFilter] = useState('');
  const [blockedOnly, setBlockedOnly] = useState(false);

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setDocFilter('');
    setBuFilter('');
    setBlockedOnly(false);
  }, []);

  const [condOpen, setCondOpen] = useState(false);
  const [condText, setCondText] = useState('');
  const [retOpen, setRetOpen] = useState(false);
  const [retText, setRetText] = useState('');

  const todayStart = useMemo(() => startOfToday(), []);

  useEffect(() => {
    if (!ormCrossNav || ormCrossNav.target !== 'pacNoteApprovals' || ormCrossNav.preset !== 'blocked') return;
    setBlockedOnly(true);
    consumeOrmCrossNav?.();
  }, [ormCrossNav, consumeOrmCrossNav]);

  const demo = useOriDemoHints();

  useEffect(() => {
    const id = demo?.forcedPacNoteId;
    if (!id) return;
    setSelectedId(id);
  }, [demo?.forcedPacNoteId, demo?.step]);

  useEffect(() => {
    if (!demo?.scrollPacBlocking || !selectedId) return;
    const t = window.setTimeout(() => {
      document.getElementById('ori-demo-pac-blocking')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 550);
    return () => window.clearTimeout(t);
  }, [demo?.scrollPacBlocking, demo?.step, selectedId]);

  const statusOpts = useMemo(() => Array.from(new Set(pacNotes.map((p) => p.status).filter(Boolean))).sort() as string[], []);
  const docOpts = useMemo(() => Array.from(new Set(pacNotes.map((p) => p.document_type).filter(Boolean))).sort() as string[], []);
  const buOpts = useMemo(() => Array.from(new Set(pacNotes.map((p) => p.business_unit).filter(Boolean))).sort() as string[], []);

  const kpis = useMemo(() => {
    const pending = pacNotes.filter((p) => p.status === PENDING).length;
    let blocked = 0;
    for (const pn of pacNotes) {
      if (openBlockingCount(pn) > 0) blocked += 1;
    }
    const cycles: number[] = [];
    for (const pn of pacNotes) {
      if (pn.status !== 'approved' || !pn.submitted_at || !pn.approved_at) continue;
      const a = (parseTs(pn.approved_at) - parseTs(pn.submitted_at)) / 86400000;
      if (!Number.isNaN(a) && a >= 0) cycles.push(a);
    }
    const med = medianDays(cycles);
    return { pending, blocked, med };
  }, []);

  const filtered = useMemo(() => {
    return pacNotes.filter((p) => {
      if (blockedOnly && openBlockingCount(p) === 0) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (docFilter && p.document_type !== docFilter) return false;
      const bu = p.business_unit || '';
      if (buFilter && bu !== buFilter) return false;
      return true;
    });
  }, [statusFilter, docFilter, buFilter, blockedOnly]);

  const filterSelectClass = `w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-offset-1 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 ${oriFocusRing}`;
  const hasListFilters = !!(statusFilter || docFilter || buFilter || blockedOnly);

  const sortedQueue = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ba = openBlockingCount(a) > 0 ? 0 : 1;
      const bb = openBlockingCount(b) > 0 ? 0 : 1;
      if (ba !== bb) return ba - bb;
      const ta = parseTs(a.submitted_at || a.comments?.[0]?.at);
      const tb = parseTs(b.submitted_at || b.comments?.[0]?.at);
      return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
    });
  }, [filtered]);

  const selected = selectedId ? pacNotes.find((p) => p.pac_note_id === selectedId) || null : null;
  const blockOpen = selected ? blockingOpenPas(selected) : [];
  const nBlock = blockOpen.length;

  const isLg = useHasMinWidth(1024);
  const hasSelection = !!selectedId;
  const splitView = hasSelection && isLg;

  const canApprove =
    !!selected &&
    nBlock === 0 &&
    (selected.status === PENDING || selected.status === 'conditional_approval');

  useEffect(() => {
    if (selectedId && !pacNotes.some((p) => p.pac_note_id === selectedId)) setSelectedId(null);
  }, [selectedId]);

  useEffect(() => {
    setCondOpen(false);
    setCondText('');
    setRetOpen(false);
    setRetText('');
  }, [selectedId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {blockedOnly && (
        <div className="shrink-0 border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-950">
          <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 px-4">
            <span>
              <strong>ORM filter:</strong> PAC notes with at least one open blocking preventive action.
            </span>
            <button type="button" className="font-semibold text-rose-900 underline" onClick={() => setBlockedOnly(false)}>
              Clear
            </button>
          </div>
        </div>
      )}
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f4f6f9] ${splitView ? 'lg:flex-row lg:items-stretch' : ''}`}
      >
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm rounded-lg border border-slate-200/80 bg-slate-900 px-4 py-2.5 text-xs font-medium leading-snug text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Queue */}
      <aside
        className={`flex min-h-0 flex-col overflow-hidden border-slate-200/90 bg-white shadow-[2px_0_12px_rgba(15,23,42,0.04)] lg:border-r ${
          hasSelection && !isLg ? 'hidden' : 'flex'
        } ${splitView ? 'w-full shrink-0 lg:w-[40%] lg:max-w-[460px] lg:flex-none' : 'w-full min-h-0 flex-1'}`}
      >
        <header className="border-b border-slate-100 px-4 pb-3 pt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Approval queue</h2>
          <p className="mt-1 text-sm font-semibold text-slate-900">PAC notes · ORM first line</p>
        </header>

        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 px-3 py-3">
          <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 px-2 py-2.5 text-center shadow-sm">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">Pending review</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{kpis.pending}</div>
          </div>
          <div className="rounded-lg border border-rose-100 bg-gradient-to-b from-rose-50/90 to-white px-2 py-2.5 text-center shadow-sm">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-rose-800/80">Blocked by open PAs</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-rose-800">{kpis.blocked}</div>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 px-2 py-2.5 text-center shadow-sm">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">Median cycle</div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-indigo-800">{kpis.med == null ? '—' : `${kpis.med}d`}</div>
            <div className="text-[8px] text-slate-400">approved only</div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 px-3 py-2.5">
          <label className="flex min-w-0 flex-1 basis-[6.5rem] flex-col gap-1">
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
          <label className="flex min-w-0 flex-1 basis-[6.5rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Doc</span>
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by document type"
            >
              <option value="">All document types</option>
              {docOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[6.5rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Unit</span>
            <select
              value={buFilter}
              onChange={(e) => setBuFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by business unit"
            >
              <option value="">All units</option>
              {buOpts.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {!sortedQueue.length ? (
            <div className="p-4">
              <EmptyState
                message="No PAC notes match these filters."
                hint="Clear filters to see the full ORM queue."
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            </div>
          ) : (
            <ul className="space-y-2.5 pb-4">
              {sortedQueue.map((pn) => {
                const ob = openBlockingCount(pn);
                const sub = pn.submitted_at || pn.comments?.[0]?.at || '';
                const sel = pn.pac_note_id === selectedId;
                return (
                  <li key={pn.pac_note_id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(pn.pac_note_id)}
                      className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                        ob > 0 ? 'border-l-[3px] border-l-rose-300' : 'border-l-[3px] border-l-transparent'
                      } ${
                        sel
                          ? 'border border-indigo-200 bg-indigo-50/90 shadow-md ring-1 ring-indigo-200/80'
                          : 'border border-slate-200/90 bg-white shadow-sm hover:border-indigo-200/60 hover:shadow-md'
                      }`}
                    >
                      <div className="font-mono text-[10px] font-medium text-slate-500">{pn.pac_note_id}</div>
                      <div className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-slate-900">{defaultTitle(pn)}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
                        <span>{pn.business_unit}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-[10px] text-slate-500">v{pn.document_version ?? '1.0'}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusChipClass(pn.status)}`}>
                          {(pn.status || '').replace(/_/g, ' ')}
                        </span>
                        {sub ? (
                          <span className="text-[10px] text-slate-500">
                            {fmtDateTime(sub)} · <span className="font-medium text-slate-700">{relativeFrom(sub)}</span>
                          </span>
                        ) : null}
                      </div>
                      {ob > 0 ? (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-900">
                          <span aria-hidden>🔒</span>
                          Blocked by {ob} PA{ob === 1 ? '' : 's'}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {hasSelection ? (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-slate-200/60 bg-[#f8fafc] lg:border-l lg:min-h-0">
        <div className="flex-shrink-0 border-b border-slate-200/80 bg-white px-4 py-2.5">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-700 hover:underline"
            onClick={() => setSelectedId(null)}
          >
            {isLg ? '← Full queue' : '← Back to queue'}
          </button>
        </div>
        {selected ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 xl:px-8">
              <div className="mx-auto max-w-3xl space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">{defaultTitle(selected)}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-mono text-[11px] text-slate-500">{selected.pac_note_id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-[11px]">v{selected.document_version ?? '1.0'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize text-slate-700">{docTypeLabel(selected.document_type)}</span>
                      <span
                        className={`ml-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusChipClass(selected.status)}`}
                      >
                        {(selected.status || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => flash('Document viewer is not wired in this prototype — your click was logged for demo.')}
                    className={`flex-shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 ${oriFocusRing}`}
                  >
                    Open document ↗
                  </button>
                </div>

                <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Submission</h3>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div className="flex justify-between gap-3 border-b border-slate-50 pb-2 sm:block sm:border-0 sm:pb-0">
                      <dt className="text-slate-500">Submitted by</dt>
                      <dd className="font-medium text-slate-900">{selected.submitted_by_role || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-slate-50 pb-2 sm:block sm:border-0 sm:pb-0">
                      <dt className="text-slate-500">Submitted at</dt>
                      <dd className="font-mono text-[11px] text-slate-800">{fmtDateTime(selected.submitted_at || selected.comments?.[0]?.at)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-slate-50 pb-2 sm:block sm:border-0 sm:pb-0">
                      <dt className="text-slate-500">Target approval</dt>
                      <dd className="font-mono text-[11px]">{fmtDate(selected.target_approval_date)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-slate-50 pb-2 sm:block sm:border-0 sm:pb-0">
                      <dt className="text-slate-500">Days waiting</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">{daysWaiting(selected)}</dd>
                    </div>
                    <div className="sm:col-span-2 flex justify-between gap-3">
                      <dt className="text-slate-500">Accountable SM</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {selected.accountable_senior_manager_id
                          ? getSeniorManager(selected.accountable_senior_manager_id)?.name || selected.accountable_senior_manager_id
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Regulatory & process links</h3>
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Obligations</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(selected.linked_obligation_ids || []).length ? (
                        selected.linked_obligation_ids!.map((oid) => {
                          const o = getObligation(oid);
                          return (
                            <button
                              key={oid}
                              type="button"
                              title={o?.atomic_requirement}
                              onClick={() => openDrawer('obligation', oid, 'pacNoteApprovals')}
                              className="max-w-full truncate rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-left text-[11px] font-medium text-violet-900 transition hover:bg-violet-100"
                            >
                              {o ? `${oid}` : oid}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">None linked</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Processes</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(selected.linked_process_ids || []).length ? (
                        selected.linked_process_ids!.map((pid) => {
                          const pr = getProcess(pid);
                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={() => openDrawer('process', pid, 'pacNoteApprovals')}
                              className="max-w-full truncate rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-left text-[11px] font-medium text-indigo-900 transition hover:bg-indigo-100"
                            >
                              {pr ? `${pid} · ${pr.name}` : pid}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">None linked</span>
                      )}
                    </div>
                  </div>
                </section>

                {nBlock > 0 ? (
                  <section id="ori-demo-pac-blocking" className="overflow-hidden rounded-xl border-2 border-rose-200 bg-rose-50 shadow-sm">
                    <div className="border-b border-rose-200/80 bg-rose-100/40 px-4 py-3">
                      <h3 className="text-sm font-bold text-rose-950">
                        <span className="mr-1.5" aria-hidden>
                          ⚠
                        </span>
                        Blocked by {nBlock} open preventive action{nBlock === 1 ? '' : 's'}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-rose-900/85">ORM cannot clear this PAC until every blocking PA is closed in the RCA workspace.</p>
                    </div>
                    <div className="overflow-x-auto px-3 py-3">
                      <table className="w-full min-w-[520px] text-left text-xs">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-rose-900/70">
                            <th className="pb-2 pr-2 font-semibold">PA ID</th>
                            <th className="pb-2 pr-2 font-semibold">Title</th>
                            <th className="pb-2 pr-2 font-semibold">Owner</th>
                            <th className="pb-2 pr-2 font-semibold">Target</th>
                            <th className="pb-2 pr-2 font-semibold">Status</th>
                            <th className="pb-2 font-semibold">Days overdue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blockOpen.map((pa) => {
                            const sm = pa.owner_senior_manager_id ? getSeniorManager(pa.owner_senior_manager_id) : null;
                            return (
                              <tr
                                key={pa.preventive_action_id}
                                className="cursor-pointer border-t border-rose-200/60 hover:bg-rose-100/40"
                                onClick={() => openDrawer('preventiveAction', pa.preventive_action_id, 'pacNoteApprovals')}
                              >
                                <td className="py-2 pr-2 font-mono text-[10px] text-rose-950">{pa.preventive_action_id}</td>
                                <td className="max-w-[14rem] py-2 pr-2 font-medium text-rose-950">{pa.title || '—'}</td>
                                <td className="py-2 pr-2 text-rose-900">{sm?.name || '—'}</td>
                                <td className="py-2 pr-2 font-mono text-[10px]">{pa.target_date || '—'}</td>
                                <td className="py-2 pr-2 capitalize text-rose-900">{pa.status}</td>
                                <td className="py-2 font-semibold tabular-nums text-rose-950">{paOverdueDays(pa, todayStart)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="border-t border-rose-200/80 px-4 py-2.5 text-[11px] leading-relaxed text-rose-900/90">
                      Approval is blocked until all linked preventive actions are closed.
                    </p>
                  </section>
                ) : (
                  <section className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm">
                    <span className="font-semibold">✓</span> No open preventive actions blocking this approval.
                  </section>
                )}

                {(selected.referenced_rca_ids || []).length > 0 ? (
                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Referenced RCAs</h3>
                    <div className="mt-2 space-y-2">
                      {selected.referenced_rca_ids!.map((rid) => {
                        const rca = getRca(rid);
                        const inc = rca ? getIncident(rca.incident_id) : null;
                        const approved = rca?.rca_completed_at ? fmtDate(rca.rca_completed_at) : '—';
                        return (
                          <div
                            key={rid}
                            className="flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-mono text-[10px] text-slate-500">{rid}</div>
                              <div className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{inc?.title || rca?.incident_id || 'Incident'}</div>
                              <div className="mt-1 text-[11px] text-slate-600">RCA approval / completion · {approved}</div>
                            </div>
                            <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
                              <button
                                type="button"
                                onClick={() => onOpenRcaWorkspace(rid)}
                                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-900 transition hover:bg-indigo-100"
                              >
                                View RCA →
                              </button>
                              <button
                                type="button"
                                onClick={() => openDrawer('rca', rid, 'pacNoteApprovals')}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                              >
                                RCA record (drawer)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Comment thread</h3>
                  <ol className="relative mt-4 space-y-4 border-l border-slate-200 pl-5">
                    {(selected.comments || [])
                      .slice()
                      .sort((a, b) => parseTs(a.at) - parseTs(b.at))
                      .map((c, i) => (
                        <li key={`${c.at}-${i}`} className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-400 shadow" aria-hidden />
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                              {c.author_role}
                            </span>
                            <time className="text-[10px] text-slate-500" dateTime={c.at}>
                              {relativeFrom(c.at)} · {fmtDateTime(c.at)}
                            </time>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-800">{c.text}</p>
                        </li>
                      ))}
                  </ol>
                </section>

                <div className="h-28 shrink-0 xl:h-32" aria-hidden />
              </div>
            </div>

            <footer className="flex-shrink-0 border-t border-slate-200/90 bg-white/95 px-4 py-4 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm xl:px-8">
              <div className="mx-auto flex max-w-3xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  {condOpen ? (
                    <label className="block text-xs font-medium text-slate-700">
                      Approval conditions
                      <textarea
                        value={condText}
                        onChange={(e) => setCondText(e.target.value)}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 shadow-inner outline-none ring-indigo-200 focus:ring-2"
                        placeholder="e.g. KFS issuance gated behind manual checker until PA-2026-0005 closes"
                      />
                    </label>
                  ) : null}
                  {retOpen ? (
                    <label className="block text-xs font-medium text-slate-700">
                      Revision notes
                      <textarea
                        value={retText}
                        onChange={(e) => setRetText(e.target.value)}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 shadow-inner outline-none ring-indigo-200 focus:ring-2"
                        placeholder="What must the business unit change before re-submission?"
                      />
                    </label>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {nBlock > 0 && (selected.status === PENDING || selected.status === 'conditional_approval') ? (
                    <span
                      title={`Cannot approve while ${nBlock} preventive action${nBlock === 1 ? ' is' : 's are'} still open.`}
                      className="inline-flex cursor-not-allowed"
                    >
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400"
                      >
                        Approve
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canApprove}
                      title={
                        !selected
                          ? ''
                          : selected.status === 'approved'
                            ? 'Already approved.'
                            : selected.status === 'rejected'
                              ? 'This PAC was rejected.'
                              : undefined
                      }
                      className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm ${
                        canApprove
                          ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                      }`}
                      onClick={() => {
                        if (!canApprove) return;
                        flash('Marked approved — ORM team will be notified; BAU to upload signed PAC to repository (demo).');
                      }}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (condOpen) {
                        flash(condText.trim() ? 'Conditional approval noted — accountable SM will receive the conditions (demo).' : 'Please enter conditions or cancel.');
                        setCondOpen(false);
                        setCondText('');
                        return;
                      }
                      setCondOpen(true);
                    }}
                    className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100"
                  >
                    {condOpen ? 'Submit conditions' : 'Conditional approval'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (retOpen) {
                        flash(retText.trim() ? 'Returned for revision — submitter has been copied on email (demo).' : 'Please add revision notes or cancel.');
                        setRetOpen(false);
                        setRetText('');
                        return;
                      }
                      setRetOpen(true);
                    }}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                  >
                    {retOpen ? 'Submit return' : 'Return for revision'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reject this PAC note? This is a demo — no data will change.')) {
                        flash('Rejected — ORM will ask BAU to resubmit with clarifications (demo).');
                      }
                    }}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex min-h-[16rem] flex-1 items-center justify-center p-8">
            <EmptyState message="PAC note not found." hint="Return to the queue and select another card." />
          </div>
        )}
      </section>
      ) : null}
    </div>
    </div>
  );
}
