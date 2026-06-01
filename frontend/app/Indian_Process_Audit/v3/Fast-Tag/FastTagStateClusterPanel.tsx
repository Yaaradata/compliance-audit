'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Minus, Search } from 'lucide-react';
import type { FastTagHeatRisk } from './fastTagJourneyHeatmap';
import { buildFastTagStateClusterRows, type FastTagStateClusterRow } from './fastTagStateCluster';

type CaseLike = { id?: string; subject?: string; trail?: { status: string }[] };

/** Default rows when not beside the insight column (mobile). */
const DEFAULT_VISIBLE_STATES = 10;
/** At most this many states render — never the full national list. */
const MAX_VISIBLE_STATES = 14;
const PANEL_CHROME_PX = 118;
const ROW_HEIGHT_PX = 54;

type Props = {
  cases: CaseLike[];
  selectedRegionCode?: string;
  onSelectRegion?: (regionCode: string) => void;
  /** Max height from the left insight stack (lg); used to fit a few more rows, not all states. */
  panelMaxHeightPx?: number | null;
};

type RiskFilter = 'all' | 'Low' | 'Medium' | 'High';
type SortKey = 'cases' | 'name' | 'risk';
type TrendFilter = 'all' | 'up' | 'down' | 'flat';

const FILTER_SELECT_CLASS =
  'h-8 rounded-md border-0 bg-slate-100/90 py-0 pl-2 pr-7 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/90 focus:ring-2 focus:ring-indigo-500/30';

const RISK_BADGE: Record<
  'Low' | 'Medium' | 'High',
  { pill: string; spark: string }
> = {
  Low: {
    pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200/90',
    spark: 'bg-emerald-500',
  },
  Medium: {
    pill: 'bg-amber-50 text-amber-950 ring-amber-200/90',
    spark: 'bg-amber-500',
  },
  High: {
    pill: 'bg-red-50 text-red-800 ring-red-200/90',
    spark: 'bg-red-500',
  },
};

function sparkToneFromRisk(risk: FastTagHeatRisk): keyof typeof RISK_BADGE {
  if (risk === 'critical' || risk === 'high') return 'High';
  if (risk === 'medium') return 'Medium';
  return 'Low';
}

function TrendSparkline({ values, risk }: { values: number[]; risk: FastTagHeatRisk }) {
  const tone = RISK_BADGE[sparkToneFromRisk(risk)];
  const max = Math.max(...values, 1);
  return (
    <div
      className="flex h-9 w-[4.5rem] items-end justify-center gap-0.5 sm:w-20"
      aria-hidden
    >
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1.5 min-w-[3px] max-w-[6px] flex-1 rounded-sm ${tone.spark} opacity-90`}
          style={{ height: `${Math.max(12, Math.round((v / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500">
        <Minus className="h-3 w-3" aria-hidden />
        flat vs prior
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
        up ? 'text-red-600' : 'text-emerald-700'
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />}
      {up ? '+' : ''}
      {delta} vs prior
    </span>
  );
}

function ClusterRow({
  row,
  active,
  onSelect,
}: {
  row: FastTagStateClusterRow;
  active: boolean;
  onSelect?: (code: string) => void;
}) {
  const badge = RISK_BADGE[row.riskLabel];
  const clickable = Boolean(onSelect);

  return (
    <tr
      className={`border-t border-slate-100 first:border-t-0 transition-colors ${
        active ? 'bg-indigo-50/70' : 'bg-white hover:bg-slate-50/80'
      } ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? () => onSelect?.(row.regionCode) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(row.regionCode);
              }
            }
          : undefined
      }
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      aria-pressed={clickable ? active : undefined}
    >
      <td className="px-3 py-2.5 sm:px-4">
        <p className="text-sm font-semibold text-slate-900">{row.label}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500">
          <span className="tabular-nums">
            {row.caseCount} case{row.caseCount === 1 ? '' : 's'}
          </span>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <DeltaBadge delta={row.deltaVsPrior} />
        </p>
      </td>
      <td className="hidden px-2 py-2.5 text-right tabular-nums text-lg font-semibold text-slate-900 sm:table-cell">
        {row.caseCount}
      </td>
      <td className="px-2 py-2.5">
        <div className="flex justify-center">
          <TrendSparkline values={row.trend7d} risk={row.risk} />
        </div>
      </td>
      <td className="px-3 py-2.5 text-right sm:px-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${badge.pill}`}
        >
          {row.riskLabel}
        </span>
      </td>
    </tr>
  );
}

function applyClusterFilters(
  rows: FastTagStateClusterRow[],
  search: string,
  riskFilter: RiskFilter,
  trendFilter: TrendFilter,
  sortBy: SortKey,
): FastTagStateClusterRow[] {
  let list = rows;
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) => r.label.toLowerCase().includes(q) || r.regionCode.toLowerCase().includes(q),
    );
  }
  if (riskFilter !== 'all') {
    list = list.filter((r) => r.riskLabel === riskFilter);
  }
  if (trendFilter === 'up') list = list.filter((r) => r.deltaVsPrior > 0);
  else if (trendFilter === 'down') list = list.filter((r) => r.deltaVsPrior < 0);
  else if (trendFilter === 'flat') list = list.filter((r) => r.deltaVsPrior === 0);

  const riskOrder: Record<'High' | 'Medium' | 'Low', number> = { High: 0, Medium: 1, Low: 2 };
  return [...list].sort((a, b) => {
    if (sortBy === 'name') return a.label.localeCompare(b.label);
    if (sortBy === 'risk') {
      return (
        riskOrder[a.riskLabel] - riskOrder[b.riskLabel] ||
        b.caseCount - a.caseCount ||
        a.label.localeCompare(b.label)
      );
    }
    return b.caseCount - a.caseCount || a.label.localeCompare(b.label);
  });
}

export default function FastTagStateClusterPanel({
  cases,
  selectedRegionCode = '',
  onSelectRegion,
  panelMaxHeightPx = null,
}: Props) {
  const rows = useMemo(() => buildFastTagStateClusterRows(cases), [cases]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('cases');
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');

  const filteredRows = useMemo(
    () => applyClusterFilters(rows, search, riskFilter, trendFilter, sortBy),
    [rows, search, riskFilter, trendFilter, sortBy],
  );

  const visibleLimit = useMemo(() => {
    if (panelMaxHeightPx == null || panelMaxHeightPx <= PANEL_CHROME_PX) {
      return Math.min(filteredRows.length, DEFAULT_VISIBLE_STATES);
    }
    const fit = Math.floor((panelMaxHeightPx - PANEL_CHROME_PX) / ROW_HEIGHT_PX);
    return Math.min(
      filteredRows.length,
      Math.max(DEFAULT_VISIBLE_STATES, Math.min(MAX_VISIBLE_STATES, fit)),
    );
  }, [panelMaxHeightPx, filteredRows.length]);

  const visibleRows = useMemo(
    () => filteredRows.slice(0, visibleLimit),
    [filteredRows, visibleLimit],
  );

  const filtersActive =
    search.trim() !== '' || riskFilter !== 'all' || trendFilter !== 'all' || sortBy !== 'cases';

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('all');
    setTrendFilter('all');
    setSortBy('cases');
  };

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">No state-level cases in this selection.</p>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="shrink-0 space-y-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <h3 className="shrink-0 text-sm font-semibold text-slate-900">State cluster</h3>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <label className="relative w-full min-w-[7.5rem] max-w-[9.5rem] sm:w-auto sm:flex-1 sm:max-w-[10rem]">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state…"
              className="h-8 w-full rounded-md bg-slate-100/90 py-0 pl-7 pr-2 text-[11px] text-slate-800 ring-1 ring-slate-200/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-label="Search states"
            />
          </label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
            className={FILTER_SELECT_CLASS}
            aria-label="Filter by risk"
          >
            <option value="all">All risk</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value as TrendFilter)}
            className={FILTER_SELECT_CLASS}
            aria-label="Filter by trend vs prior"
          >
            <option value="all">All trends</option>
            <option value="up">↑ vs prior</option>
            <option value="down">↓ vs prior</option>
            <option value="flat">Flat vs prior</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className={FILTER_SELECT_CLASS}
            aria-label="Sort states"
          >
            <option value="cases">Sort: cases</option>
            <option value="risk">Sort: risk</option>
            <option value="name">Sort: name</option>
          </select>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="h-8 shrink-0 rounded-md px-2.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200/90 hover:bg-indigo-50/80"
            >
              Clear
            </button>
          ) : null}
        </div>

        <p className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {filteredRows.length === rows.length
            ? `${rows.length} states`
            : `${filteredRows.length} / ${rows.length}`}
        </p>
      </div>

      <p className="text-[11px] text-slate-500">
        {onSelectRegion ? 'Click a row to focus the map' : 'RTO from VRN in this selection'}
      </p>
      </div>

      <div
        className="mt-2 overflow-x-auto rounded-lg ring-1 ring-slate-200/90"
        role="region"
        aria-label={`State cluster — ${visibleRows.length} of ${filteredRows.length} states shown`}
      >
        <table className="w-full min-w-[320px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 shadow-[0_1px_0_0_rgb(226,232,240)] backdrop-blur-sm">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2.5 sm:px-4">State</th>
              <th className="hidden px-2 py-2.5 text-right sm:table-cell">Cases</th>
              <th className="px-2 py-2.5 text-center">Trend 7d</th>
              <th className="px-3 py-2.5 text-right sm:px-4">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No states match these filters.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <ClusterRow
                  key={row.regionCode}
                  row={row}
                  active={selectedRegionCode === row.regionCode}
                  onSelect={onSelectRegion}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
