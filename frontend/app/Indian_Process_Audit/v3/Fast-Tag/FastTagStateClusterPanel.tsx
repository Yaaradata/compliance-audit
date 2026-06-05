'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Minus, Search } from 'lucide-react';
import type { FastTagHeatRisk } from './fastTagJourneyHeatmap';
import { buildFastTagStateClusterRows, type FastTagStateClusterRow } from './fastTagStateCluster';

type CaseLike = {
  id?: string;
  subject?: string;
  overallStatus?: string;
  trail?: { status: string }[];
};

type Props = {
  cases: CaseLike[];
  selectedRegionCode?: string;
  onSelectRegion?: (regionCode: string) => void;
  /** When true, list all Indian states/UTs (map RTO set), not only states with cases. */
  allIndianStates?: boolean;
  /** Max height from the left insight stack (lg); table body scrolls inside. */
  panelMaxHeightPx?: number | null;
  panelTitle?: string;
  selectionHint?: string;
  /** Audit outcomes/findings vs business profit/loss/margin columns. */
  metricsMode?: 'audit' | 'business';
  /** Hide title + filter row (use StateClusterFilterBar above the panel). */
  hideHeader?: boolean;
  /** Controlled filters when hideHeader is true. */
  filterState?: StateClusterFilterState;
  /** Fill parent flex column (e.g. beside contribution table) — scroll inside. */
  fillAvailableHeight?: boolean;
  /** Tighter table rows to show more states in the same height. */
  denseRows?: boolean;
  /** Cap scroll viewport to this many table rows (remaining states scroll). */
  visibleRowCount?: number;
};

/** Default visible body rows in performance drill-down (§4 beside contribution table). */
export const STATE_CLUSTER_PERFORMANCE_VISIBLE_ROWS = 8;

function scrollHeightForVisibleRows(visibleRowCount: number, dense: boolean): number {
  const headPx = dense ? 36 : 40;
  const rowPx = dense ? 52 : 56;
  return headPx + rowPx * visibleRowCount;
}

export type RiskFilter = 'all' | 'Low' | 'Medium' | 'High';
export type SortKey = 'cases' | 'name' | 'risk';
export type TrendFilter = 'all' | 'up' | 'down' | 'flat';

export type StateClusterFilterState = {
  search: string;
  setSearch: (value: string) => void;
  riskFilter: RiskFilter;
  setRiskFilter: (value: RiskFilter) => void;
  trendFilter: TrendFilter;
  setTrendFilter: (value: TrendFilter) => void;
  sortBy: SortKey;
  setSortBy: (value: SortKey) => void;
  clearFilters: () => void;
  filtersActive: boolean;
};

export function useStateClusterFilters(): StateClusterFilterState {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('cases');
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');

  const filtersActive =
    search.trim() !== '' || riskFilter !== 'all' || trendFilter !== 'all' || sortBy !== 'cases';

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('all');
    setTrendFilter('all');
    setSortBy('cases');
  };

  return {
    search,
    setSearch,
    riskFilter,
    setRiskFilter,
    trendFilter,
    setTrendFilter,
    sortBy,
    setSortBy,
    clearFilters,
    filtersActive,
  };
}

type StateClusterFilterBarProps = StateClusterFilterState & {
  className?: string;
  /** Sit on the same row as a section title. */
  inline?: boolean;
};

export function StateClusterFilterBar({
  search,
  setSearch,
  riskFilter,
  setRiskFilter,
  trendFilter,
  setTrendFilter,
  sortBy,
  setSortBy,
  clearFilters,
  filtersActive,
  className = '',
  inline = false,
}: StateClusterFilterBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${inline ? 'justify-end' : ''} ${className}`.trim()}
    >
      <label
        className={
          inline
            ? 'relative w-[6.5rem] shrink-0 sm:w-[7.5rem]'
            : 'relative w-full min-w-[7.5rem] max-w-[9.5rem] sm:w-auto sm:flex-1 sm:max-w-[10rem]'
        }
      >
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
  );
}

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

function OutcomeMix({ row }: { row: FastTagStateClusterRow }) {
  if (row.caseCount === 0) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-[10px] font-semibold tabular-nums"
      title="Completed · Critical · Exception"
    >
      <span className="text-emerald-700">✓{row.compliantCount}</span>
      <span className="text-red-600">!{row.criticalCount}</span>
      <span className="text-sky-700">~{row.exceptionCount}</span>
    </div>
  );
}

function FindingsCell({ row }: { row: FastTagStateClusterRow }) {
  if (row.caseCount === 0) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  return (
    <div className="text-right">
      <p className="text-sm font-semibold tabular-nums text-slate-900">{row.failRatePct}%</p>
      <p className="mt-0.5 text-[10px] text-slate-500 tabular-nums">
        {row.failedCount} w/ finding{row.failedCount === 1 ? '' : 's'}
      </p>
    </div>
  );
}

function MoneyCell({
  row,
  field,
  tone,
}: {
  row: FastTagStateClusterRow;
  field: 'profitCr' | 'lossCr';
  tone: 'profit' | 'loss';
}) {
  if (row.caseCount === 0) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  const value = row[field];
  const color = tone === 'profit' ? 'text-emerald-700' : 'text-red-600';
  return (
    <p className={`text-right text-sm font-semibold tabular-nums ${color}`}>
      ₹{value.toFixed(1)}Cr
    </p>
  );
}

function MarginCell({ row }: { row: FastTagStateClusterRow }) {
  if (row.caseCount === 0) {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  const strong = row.marginPct >= 20;
  return (
    <div className="text-right">
      <p
        className={`text-sm font-semibold tabular-nums ${
          strong ? 'text-emerald-700' : 'text-amber-800'
        }`}
      >
        {row.marginPct}%
      </p>
      <p className="mt-0.5 text-[10px] text-slate-500">op. margin</p>
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
  metricsMode = 'audit',
  dense = false,
}: {
  row: FastTagStateClusterRow;
  active: boolean;
  onSelect?: (code: string) => void;
  metricsMode?: 'audit' | 'business';
  dense?: boolean;
}) {
  const cellPy = dense ? 'py-1.5' : 'py-2.5';
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
      <td className={`px-3 ${cellPy} sm:px-4`}>
        <p className={`font-semibold text-slate-900 ${dense ? 'text-[13px]' : 'text-sm'}`}>{row.label}</p>
        <p className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-500 ${dense ? 'mt-0 text-[10px]' : 'mt-0.5 text-[11px]'}`}>
          <span className="tabular-nums">
            {row.caseCount} case{row.caseCount === 1 ? '' : 's'}
          </span>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <DeltaBadge delta={row.deltaVsPrior} />
        </p>
        <p className="mt-1 text-[10px] leading-snug text-slate-600 sm:hidden">
          {metricsMode === 'business' ? (
            <>
              <span className="font-semibold text-emerald-700">₹{row.profitCr.toFixed(1)}Cr</span> profit
              <span className="text-slate-300" aria-hidden>
                {' '}
                ·{' '}
              </span>
              <span className="font-semibold text-red-600">₹{row.lossCr.toFixed(1)}Cr</span> loss
              <span className="text-slate-300" aria-hidden>
                {' '}
                ·{' '}
              </span>
              <span className="font-semibold text-slate-800">{row.marginPct}%</span> margin
            </>
          ) : (
            <>
              <span className="font-semibold tabular-nums text-slate-800">{row.failRatePct}%</span> w/
              findings
              <span className="text-slate-300" aria-hidden>
                {' '}
                ·{' '}
              </span>
              ✓{row.compliantCount} !{row.criticalCount} ~{row.exceptionCount}
            </>
          )}
        </p>
      </td>
      {metricsMode === 'business' ? (
        <>
          <td className={`hidden px-2 ${cellPy} sm:table-cell`}>
            <MoneyCell row={row} field="profitCr" tone="profit" />
          </td>
          <td className={`hidden px-2 ${cellPy} sm:table-cell`}>
            <MoneyCell row={row} field="lossCr" tone="loss" />
          </td>
          <td className={`hidden px-2 ${cellPy} sm:table-cell`}>
            <MarginCell row={row} />
          </td>
        </>
      ) : (
        <>
          <td className={`hidden px-2 ${cellPy} sm:table-cell`}>
            <OutcomeMix row={row} />
          </td>
          <td className={`hidden px-2 ${cellPy} sm:table-cell`}>
            <FindingsCell row={row} />
          </td>
        </>
      )}
      <td className={`px-2 ${cellPy}`}>
        <div className="flex justify-center">
          <TrendSparkline values={row.trend7d} risk={row.risk} />
        </div>
      </td>
      <td className={`px-3 ${cellPy} text-right sm:px-4`}>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${badge.pill}`}
        >
          {row.riskLabel}
        </span>
      </td>
    </tr>
  );
}

export function applyClusterFilters(
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
  allIndianStates = false,
  panelMaxHeightPx = null,
  panelTitle = 'State cluster',
  selectionHint,
  metricsMode = 'audit',
  hideHeader = false,
  filterState: filterStateProp,
  fillAvailableHeight = false,
  denseRows = false,
  visibleRowCount,
}: Props) {
  const rows = useMemo(
    () => buildFastTagStateClusterRows(cases, { allIndianStates }),
    [cases, allIndianStates],
  );
  const internalFilters = useStateClusterFilters();
  const filterState = filterStateProp ?? internalFilters;
  const { search, riskFilter, trendFilter, sortBy } = filterState;

  const filteredRows = useMemo(
    () => applyClusterFilters(rows, search, riskFilter, trendFilter, sortBy),
    [rows, search, riskFilter, trendFilter, sortBy],
  );

  const bounded = fillAvailableHeight || (panelMaxHeightPx != null && panelMaxHeightPx > 0);

  const headPy = denseRows ? 'py-1.5' : 'py-2.5';

  const scrollMaxHeightPx =
    visibleRowCount != null && visibleRowCount > 0
      ? scrollHeightForVisibleRows(visibleRowCount, denseRows)
      : panelMaxHeightPx != null && panelMaxHeightPx > 0
        ? panelMaxHeightPx
        : null;

  const tableScrollClassName = `${hideHeader ? 'mt-0' : 'mt-2'} min-h-0 overflow-y-auto overflow-x-auto overscroll-contain rounded-lg ring-1 ring-slate-200/90 [scrollbar-gutter:stable] [scrollbar-width:thin] ${
    bounded && scrollMaxHeightPx == null ? 'h-0 flex-1' : ''
  } ${scrollMaxHeightPx == null ? 'max-h-[min(32rem,70vh)]' : ''}`;

  const scrollViewportStyle =
    scrollMaxHeightPx != null
      ? { height: scrollMaxHeightPx, maxHeight: scrollMaxHeightPx }
      : undefined;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">No state-level cases in this selection.</p>
    );
  }

  return (
    <div className={bounded ? 'flex min-h-0 flex-col overflow-hidden' : 'flex min-h-0 flex-col'}>
      {!hideHeader ? (
        <div className="shrink-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <h3 className="shrink-0 text-sm font-semibold text-slate-900">{panelTitle}</h3>
            <StateClusterFilterBar
              {...filterState}
              className="min-w-0 flex-1 justify-end"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {selectionHint ??
              (onSelectRegion ? 'Click a row to focus the map' : 'RTO from VRN in this selection')}
          </p>
        </div>
      ) : selectionHint ? (
        <p className={`shrink-0 text-[10px] text-slate-500 ${denseRows ? 'mb-1' : 'mb-2'}`}>{selectionHint}</p>
      ) : null}

      <div
        className={tableScrollClassName}
        style={scrollViewportStyle}
        role="region"
        aria-label={`State cluster — ${filteredRows.length} states`}
        tabIndex={scrollMaxHeightPx != null ? 0 : undefined}
      >
        <table
          className={`w-full border-collapse text-left text-sm ${
            metricsMode === 'business' ? 'min-w-[420px]' : 'min-w-[360px]'
          }`}
        >
          <thead className="sticky top-0 z-10 bg-slate-50/95 shadow-[0_1px_0_0_rgb(226,232,240)] backdrop-blur-sm">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className={`px-3 ${headPy} sm:px-4`}>State</th>
              {metricsMode === 'business' ? (
                <>
                  <th className={`hidden px-2 ${headPy} text-right sm:table-cell`} title="Net profit (₹Cr)">
                    Profit
                  </th>
                  <th className={`hidden px-2 ${headPy} text-right sm:table-cell`} title="Leakage & cost (₹Cr)">
                    Loss
                  </th>
                  <th className={`hidden px-2 ${headPy} text-right sm:table-cell`} title="Operating margin">
                    Margin
                  </th>
                </>
              ) : (
                <>
                  <th
                    className={`hidden px-2 ${headPy} text-right sm:table-cell`}
                    title="Completed · Critical · Exception"
                  >
                    Outcomes
                  </th>
                  <th className={`hidden px-2 ${headPy} text-right sm:table-cell`}>Findings</th>
                </>
              )}
              <th className={`px-2 ${headPy} text-center`}>Trend 7d</th>
              <th className={`px-3 ${headPy} text-right sm:px-4`}>Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={metricsMode === 'business' ? 6 : 5} className="px-4 py-8 text-center text-sm text-slate-500">
                  No states match these filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <ClusterRow
                  key={row.regionCode}
                  row={row}
                  active={selectedRegionCode === row.regionCode}
                  onSelect={onSelectRegion}
                  metricsMode={metricsMode}
                  dense={denseRows}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
