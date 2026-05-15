'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Search,
  Shield,
  X,
} from 'lucide-react';
import type { CoverageStatus, HitlStatus } from '@/lib/IndianBankingAudit/regIntelMockData';
import {
  computeObligationCoverageKpi,
  obligationCoverageRows,
  obligationDomainSet,
  type ObligationCoverageRow,
} from '@/lib/IndianBankingAudit/obligationCoverageData';
import { getControlById, type ControlRecord } from '@/lib/IndianBankingAudit/controlTestingMockData';
import { getSourceColor } from '@/components/IndianBankingAudit/screens/regIntel/regIntelSourceColors';
import { RegIntelDonutChart } from '@/components/IndianBankingAudit/screens/regIntel/RegIntelDonutChart';
import { RegIntelHelpTip } from '@/components/IndianBankingAudit/screens/regIntel/RegIntelHelpTip';
import { REG_INTEL_ROUTES } from '@/components/IndianBankingAudit/screens/regIntel/regIntelPaths';
import { OriStandalonePageShell } from '@/components/IndianBankingAudit/ori/OriStandalonePageShell';

const COVERAGE_META: Record<
  CoverageStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  uncovered: { label: 'UNCOVERED', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', dot: '#DC2626' },
  partial: { label: 'PARTIAL', bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', dot: '#F59E0B' },
  covered: { label: 'COVERED', bg: '#DCFCE7', text: '#166534', border: '#86EFAC', dot: '#15803D' },
  unknown: { label: 'UNKNOWN', bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB', dot: '#64748B' },
};

const HITL_META: Record<
  HitlStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: 'PENDING REVIEW', bg: '#FEF3C7', text: '#92400E' },
  approved: { label: 'APPROVED', bg: '#DBEAFE', text: '#1E40AF' },
  rejected: { label: 'REJECTED', bg: '#FEE2E2', text: '#991B1B' },
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function daysFromToday(iso: string): number {
  const end = new Date(iso + 'T12:00:00');
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export function ObligationCoverageScreen({
  obligationIdParam,
  instrumentParam,
}: {
  obligationIdParam: string | null;
  instrumentParam: string | null;
}) {
  const allRows = obligationCoverageRows;
  const domains = useMemo(() => obligationDomainSet(allRows), [allRows]);

  const [coverageFilter, setCoverageFilter] = useState<'all' | CoverageStatus>('all');
  const [hitlFilter, setHitlFilter] = useState<'all' | HitlStatus>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(obligationIdParam);
  const [instrumentScope, setInstrumentScope] = useState<string | null>(instrumentParam);

  useEffect(() => {
    if (!obligationIdParam) return;
    setSelectedId(obligationIdParam);
  }, [obligationIdParam]);

  useEffect(() => {
    setInstrumentScope(instrumentParam);
  }, [instrumentParam]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (instrumentScope) rows = rows.filter((r) => r.parent.instrument_ref === instrumentScope);
    if (coverageFilter !== 'all') rows = rows.filter((r) => r.coverage_status === coverageFilter);
    if (hitlFilter !== 'all') rows = rows.filter((r) => r.hitl_status === hitlFilter);
    if (domainFilter !== 'all') rows = rows.filter((r) => r.domain === domainFilter);
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [
          r.id,
          r.text,
          r.domain,
          r.cited_paragraph,
          r.parent.instrument_name,
          r.parent.instrument_ref,
          ...r.linked_controls,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return rows;
  }, [allRows, instrumentScope, coverageFilter, hitlFilter, domainFilter, searchTerm]);

  const kpi = useMemo(() => computeObligationCoverageKpi(filteredRows), [filteredRows]);

  const selected = useMemo(
    () => (selectedId ? filteredRows.find((r) => r.id === selectedId) ?? allRows.find((r) => r.id === selectedId) ?? null : null),
    [filteredRows, allRows, selectedId]
  );

  const onClearAll = () => {
    setCoverageFilter('all');
    setHitlFilter('all');
    setDomainFilter('all');
    setSearchTerm('');
    setInstrumentScope(null);
  };

  return (
    <OriStandalonePageShell
      title="Obligation Coverage Map"
      subtitle="Atomic regulatory obligations extracted by AI, joined to the bank's control universe with HITL review state."
      rightSlot={
        <span className="hidden rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200 sm:inline-flex">
          {kpi.total} obligations · {kpi.instruments_count} instruments
        </span>
      }
    >
      {/* KPI Strip */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile
            value={kpi.total}
            label="Total obligations"
            sub={`${kpi.approved} approved · ${kpi.pending_hitl} pending HITL`}
            color="#1F4E79"
          />
          <KpiTile
            value={kpi.uncovered}
            label="Uncovered"
            sub={kpi.uncovered === 0 ? 'No P0 coverage gaps' : 'No linked control claims coverage'}
            color={kpi.uncovered === 0 ? '#15803D' : '#DC2626'}
            help="An obligation is Uncovered when no active control in the bank's universe claims design coverage. P0 governance item."
          />
          <KpiTile
            value={kpi.partial}
            label="Partial"
            sub="Linked control below internal CES target"
            color={kpi.partial === 0 ? '#15803D' : '#D97706'}
            help="Linked control(s) exist but the most recent CES is below the internal effectiveness threshold."
          />
          <KpiTile
            value={kpi.covered}
            label="Covered"
            sub={`Avg linked CES ${kpi.avg_linked_ces || '—'}`}
            color="#15803D"
            help="Linked controls collectively meet design intent and operating effectiveness at or above target CES."
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <RegIntelDonutChart
              uncovered={kpi.uncovered}
              partial={kpi.partial}
              covered={kpi.covered}
              size={108}
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Coverage</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {kpi.covered} / {kpi.total} obligations fully covered
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {kpi.sources.join(' · ')} · avg confidence {kpi.avg_confidence}%
              </div>
            </div>
          </div>
          {instrumentScope ? (
            <div className="ml-auto inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-900">
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-semibold">Scoped to:</span>
              <span className="font-mono text-[11px]">{instrumentScope}</span>
              <button
                type="button"
                onClick={() => setInstrumentScope(null)}
                className="rounded p-0.5 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                aria-label="Clear instrument scope"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
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
              placeholder="Search obligation ID, text, control, instrument…"
              className="h-9 w-full max-w-[480px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              aria-label="Search obligations"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Coverage"
              value={coverageFilter}
              onChange={(v) => setCoverageFilter(v as 'all' | CoverageStatus)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'uncovered', label: 'Uncovered' },
                { value: 'partial', label: 'Partial' },
                { value: 'covered', label: 'Covered' },
              ]}
            />
            <FilterSelect
              label="HITL"
              value={hitlFilter}
              onChange={(v) => setHitlFilter(v as 'all' | HitlStatus)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <FilterSelect
              label="Domain"
              value={domainFilter}
              onChange={(v) => setDomainFilter(v)}
              options={[
                { value: 'all', label: 'All domains' },
                ...domains.map((d) => ({ value: d, label: d })),
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
              {filteredRows.length} {filteredRows.length === 1 ? 'obligation' : 'obligations'}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">By materiality</span>
          </div>
          {filteredRows.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <Shield className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-slate-700">No obligations match the current filters</p>
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
                {filteredRows
                  .slice()
                  .sort((a, b) => b.parent.materiality_score - a.parent.materiality_score)
                  .map((row) => (
                    <li key={row.id}>
                      <ObligationCard
                        row={row}
                        selected={selectedId === row.id}
                        onSelect={() => setSelectedId(row.id)}
                      />
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {selected ? (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ObligationDetailPanel
              row={selected}
              onClose={() => setSelectedId(null)}
              onScopeToInstrument={(ref) => setInstrumentScope(ref)}
            />
          </div>
        ) : (
          <aside className="hidden rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:flex md:flex-col md:items-center md:justify-center">
            <Shield className="h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 font-semibold text-slate-700">Select an obligation</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Choose any obligation on the left to view its full text, source paragraph anchor, linked control(s),
              CES, and HITL trail.
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
  sub,
  color,
  help,
}: {
  value: number;
  label: string;
  sub?: string;
  color: string;
  help?: string;
}) {
  return (
    <div
      className="flex min-h-[88px] flex-col rounded-lg border border-slate-200/80 p-3 text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
        <span>{label}</span>
        {help ? <RegIntelHelpTip text={help} label={`${label} help`} align="end" /> : null}
      </span>
      {sub ? <span className="mt-0.5 text-[10px] font-normal text-white/85">{sub}</span> : null}
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

function CoverageChip({ status }: { status: CoverageStatus }) {
  const m = COVERAGE_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.dot }} aria-hidden />
      {m.label}
    </span>
  );
}

function HitlChip({ status }: { status: HitlStatus }) {
  const m = HITL_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: m.bg, color: m.text }}
    >
      {status === 'pending' ? (
        <Clock className="h-2.5 w-2.5" aria-hidden />
      ) : status === 'approved' ? (
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
      ) : (
        <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
      )}
      {m.label}
    </span>
  );
}

function ObligationCard({
  row,
  selected,
  onSelect,
}: {
  row: ObligationCoverageRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const sourceHex = getSourceColor(row.parent.source);
  const cesTone =
    row.linked_control_ces == null
      ? '#DC2626'
      : row.linked_control_ces >= 80
        ? '#15803D'
        : row.linked_control_ces >= 70
          ? '#D97706'
          : '#DC2626';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={`relative w-full rounded-xl border bg-white p-3 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        selected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
      }`}
      style={{ borderLeft: `4px solid ${sourceHex}` }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
          {row.id}
        </span>
        <CoverageChip status={row.coverage_status} />
        <HitlChip status={row.hitl_status} />
        <span className="ml-auto text-[10px] font-semibold text-slate-500" style={{ color: cesTone }}>
          {row.linked_control_ces == null ? 'NO CES' : `CES ${row.linked_control_ces}`}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-slate-900">{row.text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: sourceHex }}>
          {row.parent.source}
        </span>
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        <span className="truncate">{row.parent.instrument_name}</span>
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        <span>{row.cited_paragraph}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
        <span>Domain: <span className="text-slate-700">{row.domain}</span></span>
        <span>Effective: <span className="text-slate-700">{formatDate(row.effective_date)}</span></span>
        <span>Confidence: <span className="text-slate-700">{row.confidence}%</span></span>
        {row.linked_controls.length > 0 ? (
          <span>
            Controls: <span className="font-mono text-slate-700">{row.linked_controls.join(' · ')}</span>
          </span>
        ) : (
          <span className="font-semibold text-rose-700">No linked control</span>
        )}
      </div>
    </button>
  );
}

function ObligationDetailPanel({
  row,
  onClose,
  onScopeToInstrument,
}: {
  row: ObligationCoverageRow;
  onClose: () => void;
  onScopeToInstrument: (instrumentRef: string) => void;
}) {
  const sourceHex = getSourceColor(row.parent.source);
  const linkedControls: ControlRecord[] = row.linked_controls
    .map((id) => getControlById(id))
    .filter((c): c is ControlRecord => Boolean(c));
  const effDays = daysFromToday(row.effective_date);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header
        className="flex shrink-0 flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-4 py-3"
        style={{ backgroundColor: `${sourceHex}10` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: sourceHex }}
            >
              {row.parent.source}
            </span>
            <CoverageChip status={row.coverage_status} />
            <HitlChip status={row.hitl_status} />
            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
              {row.id}
            </span>
          </div>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-slate-900">{row.parent.instrument_name}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {row.parent.instrument_ref} · Published {formatDate(row.parent.publication_date)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Close detail"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <div className="space-y-6 px-4 py-4 sm:px-5 sm:py-5">
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Obligation</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{row.text}</p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Cited paragraph</span>
            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-800">
              {row.cited_paragraph}
            </span>
          </div>
          <blockquote
            className="mt-2 border-l-2 pl-3 text-[13px] italic leading-relaxed text-slate-700"
            style={{ borderColor: sourceHex }}
          >
            “{row.cited_paragraph_text}”
          </blockquote>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailKV label="Domain" value={row.domain} />
          <DetailKV
            label="Effective"
            value={
              <>
                {formatDate(row.effective_date)}
                <span className="ml-2 text-[10px] text-slate-500">
                  {effDays >= 0 ? `in ${effDays} d` : `passed ${Math.abs(effDays)} d ago`}
                </span>
              </>
            }
          />
          <DetailKV label="AI confidence" value={`${row.confidence}%`} />
          <DetailKV label="Accountable SM" value={`${row.parent.accountable_sm} · ${row.parent.accountable_sm_role}`} />
          <DetailKV label="Materiality" value={`${row.parent.materiality_score} / 100`} />
          <DetailKV label="Penalty exposure" value={row.parent.penalty_exposure.length ? row.parent.penalty_exposure.join(', ') : '—'} />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">HITL trail</h3>
            <HitlChip status={row.hitl_status} />
          </div>
          {row.hitl_status === 'pending' ? (
            <p className="text-xs text-slate-600">Awaiting HITL review by ORM analyst.</p>
          ) : (
            <p className="text-xs text-slate-600">
              Reviewed by <span className="font-semibold text-slate-900">{row.reviewer ?? '—'}</span> on{' '}
              {row.reviewed_at ? new Date(row.reviewed_at).toLocaleString('en-IN') : '—'}.
            </p>
          )}
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Linked controls</h3>
          {linkedControls.length === 0 ? (
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900">
              <p className="font-semibold">No linked control claims coverage of this obligation.</p>
              <p className="mt-1">
                P0 governance item — assign a 1LoD control owner or design a new control, then re-test.
              </p>
            </div>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {linkedControls.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
                        {c.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700">{c.domain}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      1LoD: {c.owner_1lod} · 2LoD: {c.tester_2lod} · Last tested {formatDate(c.last_tested_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div
                        className="text-base font-bold tabular-nums"
                        style={{
                          color: c.ces_current >= c.ces_target ? '#15803D' : c.ces_current >= c.ces_target - 6 ? '#D97706' : '#DC2626',
                        }}
                      >
                        CES {c.ces_current}
                      </div>
                      <div className="text-[10px] text-slate-500">Target {c.ces_target}</div>
                    </div>
                    <Link
                      href={`${REG_INTEL_ROUTES.controlTesting}?control=${encodeURIComponent(c.id)}`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Open in Control Testing
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onScopeToInstrument(row.parent.instrument_ref)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Scope list to this instrument
          </button>
          <a
            href={row.parent.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View source document
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </footer>
        </div>
      </div>
    </article>
  );
}

function DetailKV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm text-slate-900">{value}</div>
    </div>
  );
}
