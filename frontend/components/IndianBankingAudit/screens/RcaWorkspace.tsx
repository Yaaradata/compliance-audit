'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getControl,
  getIncident,
  getRisk,
  getSeniorManager,
  pacNotes,
  preventiveActions,
  rcas,
  type PreventiveAction,
  type RcaRecord,
} from '../dataModel';
import { Chip, EmptyState, SectionCard } from '../primitives';
import { oriCardHover, oriFocusRing } from '../theme';
import { useOriDemoHints } from '../OriDemoContext';
import type { OpenDrawer, OrmCrossNavIntent } from '../types';

const IN_FLIGHT = new Set(['draft', 'under_review']);
const ALL_METHODOLOGIES = ['five_whys', 'fishbone'] as const;
const RC_CATS = ['people', 'process', 'technology', 'external', 'vendor'] as const;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function parseDay(s?: string | null) {
  if (!s) return NaN;
  return new Date(s.includes('T') ? s : `${s}T00:00:00`).getTime();
}

function fmtDiscovered(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTsShort(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 16) + 'Z';
}

function splitWhyStatement(statement: string): { q: string; a: string } {
  const seps = [' — ', ' – ', ' - '];
  for (const sep of seps) {
    const i = statement.indexOf(sep);
    if (i > 0) {
      const left = statement.slice(0, i).trim();
      const right = statement.slice(i + sep.length).trim();
      const q = left.endsWith('?') ? left : `${left}?`;
      return { q, a: right };
    }
  }
  return { q: 'Why?', a: statement };
}

function methodologyLabel(m?: string) {
  const v = m || 'five_whys';
  return v === 'fishbone' ? 'Fishbone' : '5-Whys';
}

function statusChipTone(st: string): 'slate' | 'amber' | 'emerald' | 'violet' | 'rose' {
  if (st === 'approved') return 'emerald';
  if (st === 'under_review') return 'amber';
  if (st === 'draft') return 'slate';
  if (st === 'reopened') return 'rose';
  return 'violet';
}

function paRowTone(pa: PreventiveAction, todayStart: number): string {
  const td = parseDay(pa.target_date);
  const overdue = pa.status === 'open' && !Number.isNaN(td) && td < todayStart;
  if (pa.status === 'closed') return 'bg-emerald-50';
  if (overdue) return 'bg-rose-50';
  if (pa.status === 'open' || pa.status === 'in_progress') return 'bg-amber-50';
  return 'bg-slate-50';
}

function pasForRca(rcaId: string) {
  return preventiveActions.filter((p) => p.rca_id === rcaId);
}

function paBadgeToneForRca(rcaId: string, todayStart: number): 'rose' | 'amber' | 'emerald' {
  const pas = pasForRca(rcaId);
  if (!pas.length) return 'emerald';
  let anyOverdue = false;
  let anyOpen = false;
  for (const p of pas) {
    const td = parseDay(p.target_date);
    if (p.status === 'open' && !Number.isNaN(td) && td < todayStart) anyOverdue = true;
    if (p.status === 'open' || p.status === 'in_progress') anyOpen = true;
  }
  if (anyOverdue) return 'rose';
  if (anyOpen) return 'amber';
  return 'emerald';
}

function rcaBlocksPac(rcaId: string) {
  return preventiveActions.some((p) => p.rca_id === rcaId && p.linked_pac_note_block_flag === true);
}

function ownerRole(rca: RcaRecord) {
  const sm = rca.owner_senior_manager_id ? getSeniorManager(rca.owner_senior_manager_id) : null;
  return sm?.role ?? '—';
}

function defaultRootSummary(r: RcaRecord): string {
  if (r.root_cause_summary) return r.root_cause_summary;
  const steps = r.five_whys_steps || [];
  const last = steps[steps.length - 1]?.statement;
  if (last) return last.replace(/^Root systemic cause —\s*/i, '').trim() || last;
  return 'Root cause narrative to be finalised after ORM review.';
}

function defaultCategories(r: RcaRecord): string[] {
  if (r.root_cause_categories?.length) return r.root_cause_categories;
  return ['process', 'people'];
}

const AWAITING_APPROVAL_STATUSES = new Set(['under_review', 'hod_approval', 'spoc_review']);

const filterSelectClass = `w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-offset-1 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 ${oriFocusRing}`;

function isOverdueOpen(pa: PreventiveAction, todayStart: number) {
  if (pa.status !== 'open') return false;
  const td = parseDay(pa.target_date);
  return !Number.isNaN(td) && td < todayStart;
}

export function RcaWorkspace({
  openDrawer,
  selectedRcaId,
  setSelectedRcaId,
  ormCrossNav,
  consumeOrmCrossNav,
}: {
  openDrawer: OpenDrawer;
  selectedRcaId: string | null;
  setSelectedRcaId: (id: string | null) => void;
  ormCrossNav?: OrmCrossNavIntent | null;
  consumeOrmCrossNav?: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const todayStart = useMemo(() => startOfToday(), []);

  const statusOpts = useMemo(() => {
    const u = new Set<string>();
    for (const r of rcas) {
      if (r.status) u.add(r.status);
    }
    ['reopened'].forEach((x) => u.add(x));
    return Array.from(u).sort();
  }, []);

  const [statusFilter, setStatusFilter] = useState('');
  const [methodologyFilter, setMethodologyFilter] = useState('');
  const [ormAwaitingApprovalLens, setOrmAwaitingApprovalLens] = useState(false);

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setMethodologyFilter('');
    setOrmAwaitingApprovalLens(false);
  }, []);

  useEffect(() => {
    if (!ormCrossNav || ormCrossNav.target !== 'rcaWorkspace' || ormCrossNav.preset !== 'awaiting_approval') return;
    setStatusFilter('');
    setMethodologyFilter('');
    setOrmAwaitingApprovalLens(true);
    consumeOrmCrossNav?.();
  }, [ormCrossNav, consumeOrmCrossNav]);

  const filteredRcas = useMemo(() => {
    return rcas.filter((r) => {
      const st = r.status || '';
      if (ormAwaitingApprovalLens) {
        if (!AWAITING_APPROVAL_STATUSES.has(st)) return false;
      } else if (statusFilter && st !== statusFilter) return false;
      const meth = r.methodology || 'five_whys';
      if (methodologyFilter && meth !== methodologyFilter) return false;
      return true;
    });
  }, [statusFilter, methodologyFilter, ormAwaitingApprovalLens]);

  const kpis = useMemo(() => {
    const inProg = rcas.filter((r) => IN_FLIGHT.has(r.status || '')).length;
    const overduePa = preventiveActions.filter(
      (p) => p.status === 'open' && parseDay(p.target_date) < todayStart && !Number.isNaN(parseDay(p.target_date))
    ).length;
    const openIds = new Set(preventiveActions.filter((p) => p.status === 'open').map((p) => p.preventive_action_id));
    let pacBlocked = 0;
    for (const pn of pacNotes) {
      const ids = pn.blocking_preventive_action_ids || [];
      if (ids.some((id) => openIds.has(id))) pacBlocked += 1;
    }
    return { inProg, overduePa, pacBlocked };
  }, [todayStart]);

  const selected = selectedRcaId ? rcas.find((r) => r.rca_id === selectedRcaId) || null : null;
  const selectedIncident = selected ? getIncident(selected.incident_id) : null;

  const [paSortDesc, setPaSortDesc] = useState(false);

  const sortedPas = useMemo(() => {
    if (!selected) return [];
    const list = [...pasForRca(selected.rca_id)];
    list.sort((a, b) => {
      const ao = isOverdueOpen(a, todayStart);
      const bo = isOverdueOpen(b, todayStart);
      if (ao !== bo) return ao ? -1 : 1;
      const ta = parseDay(a.target_date);
      const tb = parseDay(b.target_date);
      const cmp = (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
      return paSortDesc ? -cmp : cmp;
    });
    return list;
  }, [selected, todayStart, paSortDesc]);

  const isLg = useHasMinWidth(1024);
  const hasSelection = !!selectedRcaId;
  /** Desktop: list + detail side-by-side. Mobile: full list OR full detail with back. */
  const splitView = hasSelection && isLg;

  const demo = useOriDemoHints();
  const demoPaFlashRef = useRef(false);

  useEffect(() => {
    if (demo?.step !== 7) {
      demoPaFlashRef.current = false;
      return;
    }
    if (!demo.highlightPreventiveActionId || demoPaFlashRef.current) return;
    demoPaFlashRef.current = true;
    const t = window.setTimeout(() => {
      flash('Marked closed — evidence pack still to be uploaded in BAU (demo).');
      document
        .querySelector(`[data-ori-pa-row="${demo.highlightPreventiveActionId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 650);
    return () => window.clearTimeout(t);
  }, [demo?.step, demo?.highlightPreventiveActionId, flash]);

  useEffect(() => {
    if (selectedRcaId && !rcas.some((r) => r.rca_id === selectedRcaId)) {
      setSelectedRcaId(null);
    }
  }, [selectedRcaId, setSelectedRcaId]);

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${splitView ? 'lg:flex-row lg:items-stretch' : ''}`}
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Left pane — full width until an RCA is selected; then narrows beside detail on lg+ */}
      <aside
        className={`flex min-h-0 flex-col overflow-hidden border-slate-200 bg-white lg:border-r ${
          hasSelection && !isLg ? 'hidden' : 'flex'
        } ${splitView ? 'w-full shrink-0 lg:w-[40%] lg:max-w-[480px] lg:flex-none' : 'w-full min-h-0 flex-1'}`}
      >
        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 p-3">
          <div className="rounded-md border border-slate-200 bg-slate-50/80 px-2 py-2 text-center">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">RCAs in flight</div>
            <div className="text-lg font-bold text-indigo-700">{kpis.inProg}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50/80 px-2 py-2 text-center">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">PAs overdue</div>
            <div className="text-lg font-bold text-rose-700">{kpis.overduePa}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50/80 px-2 py-2 text-center">
            <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-slate-500">PAC blocked</div>
            <div className="text-lg font-bold text-amber-700">{kpis.pacBlocked}</div>
          </div>
        </div>

        <div className="border-b border-slate-100 p-3">
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <label className="flex min-w-0 flex-1 basis-[9rem] flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <select
                value={ormAwaitingApprovalLens ? '' : statusFilter}
                onChange={(e) => {
                  setOrmAwaitingApprovalLens(false);
                  setStatusFilter(e.target.value);
                }}
                className={filterSelectClass}
                aria-label="Filter RCAs by status"
              >
                <option value="">All statuses</option>
                {statusOpts.map((v) => (
                  <option key={v} value={v}>
                    {v.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 basis-[7.5rem] flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Method</span>
              <select
                value={methodologyFilter}
                onChange={(e) => {
                  setOrmAwaitingApprovalLens(false);
                  setMethodologyFilter(e.target.value);
                }}
                className={filterSelectClass}
                aria-label="Filter RCAs by methodology"
              >
                <option value="">All methods</option>
                {ALL_METHODOLOGIES.map((v) => (
                  <option key={v} value={v}>
                    {methodologyLabel(v)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {ormAwaitingApprovalLens ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-indigo-200 bg-indigo-50/90 px-2 py-1.5 text-[10px] text-indigo-900">
              <span className="min-w-0 leading-snug">ORM view: under review / HOD / SPOC only</span>
              <button
                type="button"
                className="shrink-0 font-semibold text-indigo-800 underline"
                onClick={() => setOrmAwaitingApprovalLens(false)}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {!filteredRcas.length ? (
            <EmptyState
              message="No RCAs match these filters."
              hint="Clear filters or the ORM awaiting-approval view to see the full list."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <ul className="space-y-2">
              {filteredRcas.map((r) => {
                const inc = getIncident(r.incident_id);
                const selectedCard = r.rca_id === selectedRcaId;
                const paTone = paBadgeToneForRca(r.rca_id, todayStart);
                const blockPac = rcaBlocksPac(r.rca_id);
                return (
                  <li key={r.rca_id} className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRcaId(r.rca_id)}
                      className={`min-w-0 flex-1 rounded-lg border p-3 text-left shadow-sm ${
                        selectedCard
                          ? 'border-indigo-200 bg-indigo-50 ring-2 ring-indigo-200'
                          : `border-slate-200 bg-white ${oriCardHover}`
                      } ${oriFocusRing}`}
                    >
                      <div className="font-mono text-[11px] text-slate-500">{r.rca_id}</div>
                      <div className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-slate-800">{inc?.title ?? r.incident_id}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Chip label={(r.status || '—').replace(/_/g, ' ')} size="xs" tone={statusChipTone(r.status || '')} />
                        <span className="text-[10px] text-slate-600">{ownerRole(r)}</span>
                        <span
                          className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${
                            paTone === 'rose'
                              ? 'border-rose-200 bg-rose-50 text-rose-800'
                              : paTone === 'amber'
                                ? 'border-amber-200 bg-amber-50 text-amber-900'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          PA {pasForRca(r.rca_id).length}
                        </span>
                        {blockPac ? (
                          <span className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-800">
                            Blocks PAC ↗
                          </span>
                        ) : null}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={`Open ${r.rca_id} in drawer`}
                      title="Open RCA record in drawer"
                      className={`flex-shrink-0 self-stretch rounded-lg border border-indigo-200 bg-white px-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 ${oriFocusRing}`}
                      onClick={() => openDrawer('rca', r.rca_id, 'rcaWorkspace')}
                    >
                      ↗
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Right pane — only after a selection (full width on mobile, split on lg+) */}
      {hasSelection ? (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/80 lg:min-h-0">
        <div className="flex-shrink-0 border-b border-slate-200/90 bg-white px-4 py-2.5">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-700 hover:underline"
            onClick={() => setSelectedRcaId(null)}
          >
            {isLg ? '← Full list' : '← Back to RCA list'}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {selected ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">{selected.rca_id}</span>
              <Chip label={(selected.status || '—').replace(/_/g, ' ')} size="xs" tone={statusChipTone(selected.status || '')} />
              <Chip label={methodologyLabel(selected.methodology)} size="xs" tone="indigo" />
              {selectedIncident ? (
                <button
                  type="button"
                  onClick={() => openDrawer('incident', selectedIncident.incident_id, 'rcaWorkspace')}
                  className="ml-auto rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-800 hover:bg-indigo-50"
                >
                  Open linked incident ↗
                </button>
              ) : null}
            </div>

            {selectedIncident ? (
              <SectionCard title="Linked incident">
                <div className="text-sm font-bold text-slate-900">{selectedIncident.title}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="capitalize">{selectedIncident.incident_type.replace(/_/g, ' ')}</span>
                  <span>·</span>
                  <span className="capitalize">Severity {selectedIncident.severity}</span>
                  <span>·</span>
                  <span>Discovered {fmtDiscovered(selectedIncident.discovered_date)}</span>
                </div>
              </SectionCard>
            ) : null}

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">5-Whys ladder</h3>
              <div className="space-y-0">
                {(selected.five_whys_steps || [])
                  .slice()
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step, idx, arr) => {
                    const { q, a } = splitWhyStatement(step.statement);
                    const last = idx === arr.length - 1;
                    return (
                      <div key={step.step_order} className="flex gap-3">
                        <div className="flex w-8 flex-col items-center pt-1">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-400 bg-white text-xs font-bold text-indigo-800 shadow-sm">
                            {step.step_order}
                          </div>
                          {!last ? <div className="mt-1 min-h-[1.25rem] w-px flex-1 bg-indigo-300" aria-hidden /> : null}
                        </div>
                        <div className={`min-w-0 flex-1 rounded-lg border-l-4 border-indigo-400 bg-white p-4 shadow-sm ${last ? '' : 'mb-4'}`}>
                          <p className="text-xs italic text-slate-600">Why?</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-600">{q}</p>
                          <p className="mt-3 text-xs italic text-slate-500">Because…</p>
                          <p className="mt-0.5 text-sm leading-relaxed text-slate-900">{a}</p>
                        </div>
                      </div>
                    );
                  })}
                {!(selected.five_whys_steps || []).length ? (
                  <EmptyState message="No 5-Whys steps recorded for this RCA." />
                ) : null}
              </div>
            </div>

            <SectionCard title="Root cause categories">
              <div className="flex flex-wrap gap-1.5">
                {RC_CATS.map((cat) => {
                  const active = defaultCategories(selected).includes(cat);
                  return (
                    <span
                      key={cat}
                      className={`rounded-full border px-2.5 py-1 text-[11px] capitalize ${
                        active
                          ? 'border-indigo-300 bg-indigo-100 font-semibold text-indigo-900'
                          : 'border-slate-100 bg-slate-50 text-slate-400 opacity-40 grayscale'
                      }`}
                    >
                      {cat}
                    </span>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Root cause summary">
              <blockquote className="border-l-4 border-slate-300 bg-slate-50 py-2 pl-4 text-sm leading-relaxed text-slate-800">
                {defaultRootSummary(selected)}
              </blockquote>
            </SectionCard>

            <SectionCard title="Linked risks">
              {selectedIncident?.linked_risk_ids?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedIncident.linked_risk_ids.map((rid) => {
                    const r = getRisk(rid);
                    return (
                      <Chip
                        key={rid}
                        label={r?.title ? `${rid} · ${r.title.slice(0, 42)}${r.title.length > 42 ? '…' : ''}` : rid}
                        tone="rose"
                        size="xs"
                        onClick={() => openDrawer('risk', rid, 'rcaWorkspace')}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No risks linked on the incident." />
              )}
            </SectionCard>

            <SectionCard title="Linked controls">
              {selectedIncident?.linked_control_ids?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedIncident.linked_control_ids.map((cid) => {
                    const c = getControl(cid);
                    return (
                      <Chip
                        key={cid}
                        label={c?.title ? `${cid} · ${c.title.slice(0, 36)}${c.title.length > 36 ? '…' : ''}` : cid}
                        tone="indigo"
                        size="xs"
                        onClick={() => openDrawer('control', cid, 'rcaWorkspace')}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No controls linked on the incident." />
              )}
            </SectionCard>

            <SectionCard
              title="Preventive actions"
              subtitle="Sorted: overdue open first, then by target date · click header to reverse"
            >
              {!sortedPas.length ? (
                <EmptyState message="No preventive actions for this RCA." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="py-2 pr-2">PA ID</th>
                        <th className="py-2 pr-2">Title</th>
                        <th className="py-2 pr-2">Owner role</th>
                        <th className="py-2 pr-2">
                          <button
                            type="button"
                            className="font-semibold text-indigo-700 hover:underline"
                            onClick={() => setPaSortDesc((d) => !d)}
                          >
                            Target date {paSortDesc ? '↓' : '↑'}
                          </button>
                        </th>
                        <th className="py-2 pr-2">Status</th>
                        <th className="py-2 pr-2">Blocks PAC</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPas.map((pa) => {
                        const sm = pa.owner_senior_manager_id ? getSeniorManager(pa.owner_senior_manager_id) : null;
                        const hi = demo?.highlightPreventiveActionId === pa.preventive_action_id;
                        return (
                          <tr
                            key={pa.preventive_action_id}
                            data-ori-pa-row={pa.preventive_action_id}
                            className={`border-t border-slate-100 ${paRowTone(pa, todayStart)} ${hi ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
                          >
                            <td className="py-2 pr-2 font-mono text-[10px]">{pa.preventive_action_id}</td>
                            <td className="max-w-[10rem] py-2 pr-2 font-medium text-slate-800">{pa.title || '—'}</td>
                            <td className="py-2 pr-2 text-slate-700">{sm?.role ?? '—'}</td>
                            <td className="py-2 pr-2 font-mono text-[10px]">{pa.target_date || '—'}</td>
                            <td className="py-2 pr-2 capitalize">{pa.status.replace(/_/g, ' ')}</td>
                            <td className="py-2 pr-2 text-center">
                              {pa.linked_pac_note_block_flag ? (
                                <span title="Blocks PAC note approval until closed" className="cursor-help text-base">
                                  🔒
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-900 hover:bg-indigo-100"
                                  onClick={() => openDrawer('preventiveAction', pa.preventive_action_id, 'rcaWorkspace')}
                                >
                                  Graph
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium hover:bg-slate-100"
                                  onClick={() => flash('Marked in progress — control owner will see this on the PA tracker (demo).')}
                                >
                                  Mark in progress
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium hover:bg-slate-100"
                                  onClick={() => flash('Marked closed — evidence pack still to be uploaded in BAU (demo).')}
                                >
                                  Mark closed
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Lessons learnt">
              {selected.lessons_learnt ? (
                <p className="text-sm leading-relaxed text-slate-800">{selected.lessons_learnt}</p>
              ) : (
                <EmptyState message="No lessons captured yet." />
              )}
            </SectionCard>

            {selected.status === 'under_review' ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-900">Approval</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    onClick={() => flash('Approved for filing — ORM team will be notified (demo).')}
                  >
                    Approve RCA
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    onClick={() => flash('Returned for revision — branch FCC lead copied on email (demo).')}
                  >
                    Return for revision
                  </button>
                </div>
                <div className="mt-3 text-[10px] text-slate-600">
                  Cycle window: <span className="font-mono">{fmtTsShort(selected.rca_started_at)}</span>
                  {' → '}
                  <span className="font-mono">{selected.rca_completed_at ? fmtTsShort(selected.rca_completed_at) : '— (incomplete)'}</span>
                </div>
              </div>
            ) : null}
          </div>
          ) : (
            <div className="flex min-h-[16rem] items-center justify-center">
              <EmptyState message="RCA record not found." hint="Return to the list and select another card." />
            </div>
          )}
        </div>
      </section>
      ) : null}
    </div>
  );
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
