'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  PlayCircle,
  Search,
  Target,
  Users,
  X,
} from 'lucide-react';
import {
  controlRecords,
  CONTROL_DOMAIN_PILL_ORDER,
  CONTROL_FREQUENCY_LABEL,
  CONTROL_STATUS_LABEL,
  type ControlDomain,
  type ControlRecord,
  type ControlTestRunResult,
  type ControlTestStatus,
} from '@/lib/IndianBankingAudit/controlTestingMockData';
import { obligationCoverageRows } from '@/lib/IndianBankingAudit/obligationCoverageData';
import { RegIntelSparkline } from '@/components/IndianBankingAudit/screens/regIntel/RegIntelSparkline';
import { RegIntelHelpTip } from '@/components/IndianBankingAudit/screens/regIntel/RegIntelHelpTip';
import { REG_INTEL_ROUTES } from '@/components/IndianBankingAudit/screens/regIntel/regIntelPaths';
import { OriStandalonePageShell } from '@/components/IndianBankingAudit/ori/OriStandalonePageShell';

const STATUS_META: Record<
  ControlTestStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  effective: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', dot: '#15803D' },
  partial: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', dot: '#D97706' },
  ineffective: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', dot: '#DC2626' },
  in_testing: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', dot: '#2563EB' },
  overdue: { bg: '#FFE4E6', text: '#9F1239', border: '#FDA4AF', dot: '#E11D48' },
};

const RESULT_META: Record<
  ControlTestRunResult,
  { label: string; color: string; bg: string }
> = {
  pass: { label: 'Pass', color: '#166534', bg: '#DCFCE7' },
  pass_with_exception: { label: 'Pass w/ Exception', color: '#92400E', bg: '#FEF3C7' },
  fail: { label: 'Fail', color: '#991B1B', bg: '#FEE2E2' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function daysAgo(iso: string): number {
  const t = new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).getTime();
  return Math.floor((Date.now() - t) / 86400000);
}

function cesTone(current: number, target: number): { color: string; bg: string; label: string } {
  if (current >= target + 6) return { color: '#166534', bg: '#DCFCE7', label: 'above target' };
  if (current >= target - 4) return { color: '#92400E', bg: '#FEF3C7', label: 'at target' };
  return { color: '#991B1B', bg: '#FEE2E2', label: 'below target' };
}

export function ControlTestingScreen({ controlIdParam }: { controlIdParam: string | null }) {
  const [statusFilter, setStatusFilter] = useState<'all' | ControlTestStatus>('all');
  const [domainFilter, setDomainFilter] = useState<'all' | ControlDomain>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(controlIdParam);

  useEffect(() => {
    if (!controlIdParam) return;
    setSelectedId(controlIdParam);
  }, [controlIdParam]);

  // Map of obligations linked to each control, derived once
  const obligationsByControl = useMemo(() => {
    const m = new Map<string, typeof obligationCoverageRows>();
    for (const row of obligationCoverageRows) {
      for (const cid of row.linked_controls) {
        const arr = m.get(cid) ?? [];
        arr.push(row);
        m.set(cid, arr);
      }
    }
    return m;
  }, []);

  const filtered = useMemo(() => {
    let rows = controlRecords;
    if (statusFilter !== 'all') rows = rows.filter((c) => c.status === statusFilter);
    if (domainFilter !== 'all') rows = rows.filter((c) => c.domain === domainFilter);
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) =>
        [c.id, c.name, c.domain, c.owner_1lod, c.tester_2lod, c.design_statement]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return rows;
  }, [statusFilter, domainFilter, searchTerm]);

  const selected = useMemo(
    () =>
      selectedId
        ? filtered.find((c) => c.id === selectedId) ?? controlRecords.find((c) => c.id === selectedId) ?? null
        : null,
    [filtered, selectedId]
  );

  // Aggregate KPIs (across full universe, not filter — gives a stable orientation)
  const universeKpi = useMemo(() => {
    const total = controlRecords.length;
    const avgCes = Math.round(
      controlRecords.reduce((s, c) => s + c.ces_current, 0) / Math.max(1, total)
    );
    const belowTarget = controlRecords.filter((c) => c.ces_current < c.ces_target).length;
    const overdue = controlRecords.filter((c) => c.status === 'overdue').length;
    const exceptions = controlRecords.reduce((s, c) => s + c.exceptions_ytd, 0);
    const linkedObligations = new Set<string>();
    for (const c of controlRecords) {
      const list = obligationsByControl.get(c.id) ?? [];
      for (const o of list) linkedObligations.add(o.id);
    }
    return { total, avgCes, belowTarget, overdue, exceptions, linkedObligations: linkedObligations.size };
  }, [obligationsByControl]);

  const onClearAll = () => {
    setStatusFilter('all');
    setDomainFilter('all');
    setSearchTerm('');
  };

  return (
    <OriStandalonePageShell
      title="Control Testing"
      subtitle="2LoD operating-effectiveness evidence over the bank's control universe, joined to the obligations they cover."
      rightSlot={
        <span className="hidden rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200 sm:inline-flex">
          {universeKpi.total} controls · {universeKpi.linkedObligations} obligations linked
        </span>
      }
    >
      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiTile value={universeKpi.total} label="Total controls" tone="indigo" />
        <KpiTile
          value={universeKpi.avgCes}
          label="Avg CES"
          tone={universeKpi.avgCes >= 80 ? 'green' : 'amber'}
          help="Mean Control Effectiveness Score across the universe. CES targets are control-specific."
        />
        <KpiTile
          value={universeKpi.belowTarget}
          label="Below target"
          tone={universeKpi.belowTarget === 0 ? 'green' : 'amber'}
          help="Controls whose latest CES is under the internally-set target threshold for that control."
        />
        <KpiTile
          value={universeKpi.overdue}
          label="Overdue tests"
          tone={universeKpi.overdue === 0 ? 'green' : 'red'}
          help="Controls whose last-tested-at exceeds 180 days. Trigger for immediate ORM intervention."
        />
        <KpiTile
          value={universeKpi.exceptions}
          label="Exceptions YTD"
          tone="slate"
          help="Total test-run exceptions reported across all controls in the current FY."
        />
        <KpiTile
          value={universeKpi.linkedObligations}
          label="Obligations linked"
          tone="slate"
          help="Unique atomic obligations covered, partially or fully, by at least one control in this universe."
        />
      </section>

      {/* Filters */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search control ID, name, owner, tester…"
              className="h-9 w-full max-w-[480px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              aria-label="Search controls"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | ControlTestStatus)}
              options={[
                { value: 'all', label: 'All' },
                ...Object.keys(CONTROL_STATUS_LABEL).map((k) => ({
                  value: k,
                  label: CONTROL_STATUS_LABEL[k as ControlTestStatus],
                })),
              ]}
            />
            <FilterSelect
              label="Domain"
              value={domainFilter}
              onChange={(v) => setDomainFilter(v as 'all' | ControlDomain)}
              options={[
                { value: 'all', label: 'All domains' },
                ...CONTROL_DOMAIN_PILL_ORDER.map((d) => ({ value: d, label: d })),
              ]}
            />
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Split — fixed-height panes on desktop so list + detail align and scroll independently */}
      <section
        className={`mt-4 grid min-w-0 grid-cols-1 gap-4 ${
          selected
            ? 'md:grid-cols-[minmax(0,0.46fr)_minmax(0,1fr)] md:items-stretch md:h-[clamp(28rem,62dvh,72rem)]'
            : ''
        }`}
      >
        <div
          className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
            selected ? 'h-full max-h-full' : ''
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">
              {filtered.length} {filtered.length === 1 ? 'control' : 'controls'}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">By CES gap</span>
          </div>
          {filtered.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <ClipboardList className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-slate-700">No controls match the current filters</p>
              <button
                type="button"
                onClick={onClearAll}
                className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain ${
                selected ? '' : 'max-h-[min(70dvh,48rem)]'
              }`}
            >
              <ul className="flex flex-col gap-2 p-3 sm:p-4">
                {filtered
                  .slice()
                  .sort((a, b) => a.ces_current - a.ces_target - (b.ces_current - b.ces_target))
                  .map((c) => (
                    <li key={c.id}>
                      <ControlCard
                        control={c}
                        selected={selectedId === c.id}
                        linkedObligationsCount={(obligationsByControl.get(c.id) ?? []).length}
                        onSelect={() => setSelectedId(c.id)}
                      />
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {selected ? (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ControlDetailPanel
              control={selected}
              obligations={obligationsByControl.get(selected.id) ?? []}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <aside className="hidden rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:flex md:flex-col md:items-center md:justify-center">
            <Target className="h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 font-semibold text-slate-700">Select a control</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Open any control to view its design statement, CES trend, recent test runs, linked obligations and
              preventive actions in flight.
            </p>
          </aside>
        )}
      </section>
    </OriStandalonePageShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function KpiTile({
  value,
  label,
  tone,
  help,
}: {
  value: number;
  label: string;
  tone: 'indigo' | 'green' | 'amber' | 'red' | 'slate';
  help?: string;
}) {
  const toneCls = {
    indigo: 'bg-indigo-700',
    green: 'bg-emerald-700',
    amber: 'bg-amber-600',
    red: 'bg-rose-700',
    slate: 'bg-slate-700',
  }[tone];
  return (
    <div className={`flex min-h-[88px] flex-col rounded-lg ${toneCls} p-3 text-white shadow-sm`}>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
        <span>{label}</span>
        {help ? <RegIntelHelpTip text={help} label={`${label} help`} align="end" /> : null}
      </span>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 max-w-[12rem] cursor-pointer rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusChip({ status }: { status: ControlTestStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.dot }} aria-hidden />
      {CONTROL_STATUS_LABEL[status]}
    </span>
  );
}

function CesBadge({ current, target }: { current: number; target: number }) {
  const t = cesTone(current, target);
  return (
    <div
      className="flex flex-col items-end rounded-lg px-2.5 py-1 text-right shadow-sm"
      style={{ backgroundColor: t.bg, color: t.color, border: `1px solid ${t.color}33` }}
    >
      <span className="text-lg font-bold leading-none tabular-nums">{current}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider">Target {target}</span>
    </div>
  );
}

function ControlCard({
  control,
  selected,
  linkedObligationsCount,
  onSelect,
}: {
  control: ControlRecord;
  selected: boolean;
  linkedObligationsCount: number;
  onSelect: () => void;
}) {
  const lastTested = daysAgo(control.last_tested_at);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`flex w-full flex-col gap-2 rounded-xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        selected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
              CTRL-{control.id}
            </span>
            <StatusChip status={control.status} />
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              {control.domain}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{control.name}</p>
        </div>
        <CesBadge current={control.ces_current} target={control.ces_target} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3 text-slate-400" aria-hidden /> 1LoD {control.owner_1lod}
        </span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-slate-400" aria-hidden /> 2LoD {control.tester_2lod}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3 w-3 text-slate-400" aria-hidden />
          {CONTROL_FREQUENCY_LABEL[control.frequency]} · Last {lastTested}d ago
        </span>
        <span className="inline-flex items-center gap-1">
          <ClipboardList className="h-3 w-3 text-slate-400" aria-hidden />
          {linkedObligationsCount} obligation{linkedObligationsCount === 1 ? '' : 's'} · {control.exceptions_ytd} excp YTD
        </span>
      </div>
      <div className="h-7">
        <RegIntelSparkline
          data={control.ces_history}
          height={28}
          stroke={control.ces_current >= control.ces_target ? '#15803D' : '#D97706'}
        />
      </div>
    </button>
  );
}

function ControlDetailPanel({
  control,
  obligations,
  onClose,
}: {
  control: ControlRecord;
  obligations: typeof obligationCoverageRows;
  onClose: () => void;
}) {
  const t = cesTone(control.ces_current, control.ces_target);
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
              CTRL-{control.id}
            </span>
            <StatusChip status={control.status} />
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              {control.domain}
            </span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-700">
              {CONTROL_FREQUENCY_LABEL[control.frequency]}
            </span>
          </div>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-slate-900">{control.name}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            1LoD owner {control.owner_1lod} · {control.owner_1lod_role} — Tester {control.tester_2lod} ·{' '}
            {control.tester_2lod_role}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Close control detail"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <div className="space-y-6 px-4 py-4 sm:px-5 sm:py-5">
        {/* Hero CES band */}
        <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-6">
          <div
            className="flex flex-col items-center justify-center rounded-lg px-4 py-3 sm:w-40"
            style={{ backgroundColor: t.bg, color: t.color }}
          >
            <span className="text-3xl font-bold tabular-nums">{control.ces_current}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">CES — {t.label}</span>
            <span className="mt-0.5 text-[10px]">Target {control.ces_target}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">12-period CES trend</div>
            <div className="mt-1 h-14">
              <RegIntelSparkline
                data={control.ces_history}
                height={56}
                stroke={control.ces_current >= control.ces_target ? '#15803D' : '#D97706'}
              />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-slate-500">
              <span>Last tested {formatDate(control.last_tested_at)} ({daysAgo(control.last_tested_at)}d ago)</span>
              <span>Next due {formatDate(control.next_due_at)}</span>
              <span>Sample size {control.sample_size_latest}</span>
              <span>Evidence freshness {control.evidence_freshness_days}d</span>
              <span>{control.exceptions_ytd} exceptions YTD</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Design statement</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{control.design_statement}</p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Testing narrative</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{control.testing_narrative}</p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent test runs</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlayCircle className="h-3 w-3" aria-hidden />
              Run new test
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Tester</th>
                  <th className="px-3 py-2">Sample</th>
                  <th className="px-3 py-2">Exceptions</th>
                  <th className="px-3 py-2">Evidence</th>
                  <th className="px-3 py-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {control.test_runs.map((run) => {
                  const rm = RESULT_META[run.result];
                  return (
                    <tr key={run.id} className="align-top">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-700">{formatDate(run.test_date)}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <div className="font-semibold text-slate-900">{run.tester}</div>
                        <div className="text-[10px] text-slate-500">{run.tester_role}</div>
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{run.sample_size}</td>
                      <td className="px-3 py-2 tabular-nums">
                        <span
                          className={`font-semibold ${run.exceptions === 0 ? 'text-emerald-700' : 'text-amber-700'}`}
                        >
                          {run.exceptions}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-700">{run.evidence_count}</td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: rm.bg, color: rm.color }}
                        >
                          {rm.label}
                        </span>
                        <p className="mt-1 text-[11px] leading-snug text-slate-600">{run.narrative}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Linked obligations ({obligations.length})
          </h3>
          {obligations.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500">
              This control is not currently linked to any AI-extracted obligation.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {obligations.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
                        {o.id}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-700">
                        {o.coverage_status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{o.parent.source}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-800">{o.text}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {o.parent.instrument_name} · {o.cited_paragraph}
                    </p>
                  </div>
                  <Link
                    href={REG_INTEL_ROUTES.obligationCoverage(o.id)}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Open in Obligation Coverage
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {control.preventive_actions.length > 0 ? (
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Preventive actions ({control.preventive_actions.length})
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {control.preventive_actions.map((pa) => (
                <li
                  key={pa.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
                        {pa.id}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          pa.status === 'closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pa.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pa.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] font-semibold text-slate-900">{pa.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Owner {pa.owner} · Due {formatDate(pa.due_date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {control.status === 'effective' ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Mark test cycle complete
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlayCircle className="h-3.5 w-3.5" aria-hidden />
              Run new test
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            View evidence pack
          </button>
          {control.ces_current < control.ces_target ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              Raise preventive action
            </button>
          ) : null}
        </footer>
        </div>
      </div>
    </article>
  );
}
