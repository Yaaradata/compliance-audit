'use client';

import React from 'react';
import type { KPISummary } from '@/lib/IndianBankingAudit/regIntelMockData';
import type { RegIntelDateRangePreset, RegIntelKpiLinkFilter, RegIntelSubTab } from './regIntelFilters';
import { SOURCE_PILL_ORDER, STAGE_PILL_ORDER } from './regIntelFilters';

const PRIMARY_TAB = {
  underline: 'border-indigo-600 text-indigo-800',
  inactive: 'border-transparent text-slate-500 hover:text-slate-800',
} as const;

const FILTER_SELECT_CLS =
  'h-9 w-full min-w-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25';

/** Compact filter control — shared label + height for Period, Source, Stage. */
function FilterField({
  label,
  htmlFor,
  children,
  className = '',
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function PenaltyToggle({
  checked,
  onChange,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 ${
        compact ? 'h-9 shrink-0 self-end px-2.5' : 'col-span-2 h-9 px-2.5 sm:col-span-1'
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Penalty exposure only"
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          checked ? '' : 'bg-slate-300'
        }`}
        style={checked ? { backgroundColor: '#F59E0B' } : undefined}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="whitespace-nowrap text-[11px] font-medium text-slate-700">Penalty only</span>
    </div>
  );
}

function SubTabsNav({
  tabs,
  activeSubTab,
  onSelect,
}: {
  tabs: { id: RegIntelSubTab; label: string; count: number }[];
  activeSubTab: RegIntelSubTab;
  onSelect: (t: RegIntelSubTab) => void;
}) {
  return (
    <nav
      aria-label="Inbox views"
      className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto overflow-y-hidden pb-px [scrollbar-width:thin]"
    >
      {tabs.map((t) => {
        const active = activeSubTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`flex h-9 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              active ? `font-bold ${PRIMARY_TAB.underline}` : PRIMARY_TAB.inactive
            }`}
          >
            <span className="whitespace-nowrap">{t.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                active
                  ? t.id === 'alerts'
                    ? 'border-2 border-[#1F4E79] bg-[#F8FAFC] text-[#1F4E79]'
                    : t.id === 'consultations'
                      ? 'border-2 border-sky-500 bg-sky-50 text-sky-950'
                      : 'border-2 border-[#B7580A] bg-amber-50 text-amber-950'
                  : t.id === 'alerts'
                    ? 'bg-slate-100 text-slate-600 shadow-[inset_0_-2px_0_0_#1F4E79]'
                    : t.id === 'consultations'
                      ? 'bg-slate-100 text-slate-600 shadow-[inset_0_-2px_0_0_#38BDF8]'
                      : 'bg-slate-100 text-slate-600 shadow-[inset_0_-2px_0_0_#B7580A]'
              }`}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function KpiHelpTip({ text }: { text: string }) {
  return (
    <span className="group/tooltip relative inline-flex shrink-0 items-center">
      <span
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-white/40 text-[10px] font-bold leading-none text-white/90 hover:border-white"
        aria-hidden
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] right-0 left-auto z-50 w-[min(16rem,calc(100vw-2rem))] rounded-md bg-slate-900 px-2.5 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity delay-200 duration-200 group-hover/tooltip:visible group-hover/tooltip:opacity-100 break-words"
      >
        {text}
        <span
          className="absolute right-2 top-full border-[6px] border-transparent border-t-slate-900"
          aria-hidden
        />
      </span>
    </span>
  );
}

function PeriodSourceStageFilters({
  dateRangePreset,
  setDateRangePreset,
  activeSourceFilter,
  setActiveSourceFilter,
  activeStatusFilter,
  setActiveStatusFilter,
  penaltyOnlyFilter,
  setPenaltyOnlyFilter,
  sourceId,
  stageId,
  layout,
}: {
  dateRangePreset: RegIntelDateRangePreset;
  setDateRangePreset: (p: RegIntelDateRangePreset) => void;
  activeSourceFilter: string;
  setActiveSourceFilter: (s: string) => void;
  activeStatusFilter: string;
  setActiveStatusFilter: (s: string) => void;
  penaltyOnlyFilter: boolean;
  setPenaltyOnlyFilter: (v: boolean) => void;
  sourceId: string;
  stageId: string;
  layout: 'desktop' | 'mobile';
}) {
  const periodW = layout === 'desktop' ? 'w-[9.5rem]' : '';
  const selectW = layout === 'desktop' ? 'w-[8.5rem]' : '';

  return (
    <>
      <FilterField label="Period" className={periodW}>
        <select
          value={dateRangePreset}
          onChange={(e) => setDateRangePreset(e.target.value as RegIntelDateRangePreset)}
          className={FILTER_SELECT_CLS}
          aria-label="Publication date range"
        >
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
          <option value="custom">Custom range</option>
        </select>
      </FilterField>
      <FilterField label="Source" htmlFor={sourceId} className={selectW}>
        <select
          id={sourceId}
          value={activeSourceFilter}
          onChange={(e) => setActiveSourceFilter(e.target.value)}
          className={FILTER_SELECT_CLS}
          aria-label="Filter by regulatory source"
        >
          {SOURCE_PILL_ORDER.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </FilterField>
      <FilterField label="Stage" htmlFor={stageId} className={selectW}>
        <select
          id={stageId}
          value={activeStatusFilter}
          onChange={(e) => setActiveStatusFilter(e.target.value)}
          className={FILTER_SELECT_CLS}
          aria-label="Filter by workflow stage"
        >
          {STAGE_PILL_ORDER.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </FilterField>
      <PenaltyToggle
        checked={penaltyOnlyFilter}
        onChange={() => setPenaltyOnlyFilter(!penaltyOnlyFilter)}
        compact={layout === 'desktop'}
      />
    </>
  );
}

export function RegIntelZoneA({
  activeSubTab,
  setActiveSubTab,
  subTabCounts,
  activeSourceFilter,
  setActiveSourceFilter,
  activeStatusFilter,
  setActiveStatusFilter,
  kpiSummary,
  activeKpiFilter = null,
  onKpiTile,
  dateRangePreset,
  setDateRangePreset,
  customDateFrom,
  setCustomDateFrom,
  customDateTo,
  setCustomDateTo,
  penaltyOnlyFilter,
  setPenaltyOnlyFilter,
}: {
  activeSubTab: RegIntelSubTab;
  setActiveSubTab: (t: RegIntelSubTab) => void;
  subTabCounts: { alerts: number; consultations: number; peer: number };
  activeSourceFilter: string;
  setActiveSourceFilter: (s: string) => void;
  activeStatusFilter: string;
  setActiveStatusFilter: (s: string) => void;
  kpiSummary: KPISummary;
  activeKpiFilter?: RegIntelKpiLinkFilter;
  onKpiTile: (tile: 1 | 2 | 3 | 4) => void;
  dateRangePreset: RegIntelDateRangePreset;
  setDateRangePreset: (p: RegIntelDateRangePreset) => void;
  customDateFrom: string;
  setCustomDateFrom: (s: string) => void;
  customDateTo: string;
  setCustomDateTo: (s: string) => void;
  penaltyOnlyFilter: boolean;
  setPenaltyOnlyFilter: (v: boolean) => void;
}) {
  const tabs: { id: RegIntelSubTab; label: string; count: number }[] = [
    { id: 'alerts', label: 'Active Alerts', count: subTabCounts.alerts },
    { id: 'consultations', label: 'Consultations', count: subTabCounts.consultations },
    { id: 'peer', label: 'Peer Signals', count: subTabCounts.peer },
  ];

  const pendingAck = kpiSummary.pending_cco_ack;
  const eff30 = kpiSummary.effective_within_30_days;
  const uncovered = kpiSummary.uncovered_obligations;

  const kpiActiveRing =
    'ring-2 ring-white/90 ring-offset-2 ring-offset-slate-400/30 shadow-md';

  return (
    <div className="max-w-full shrink-0 overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-4">
        {/* Sub-tabs + Period / Source / Stage / Penalty — one top band */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
          {/* Desktop: tabs left, filters right */}
          <div className="hidden min-w-0 items-end gap-4 md:flex">
            <SubTabsNav tabs={tabs} activeSubTab={activeSubTab} onSelect={setActiveSubTab} />
            <div className="flex shrink-0 flex-wrap items-end gap-2 pb-px lg:gap-3">
              <PeriodSourceStageFilters
                layout="desktop"
                sourceId="reg-intel-filter-source"
                stageId="reg-intel-filter-stage"
                dateRangePreset={dateRangePreset}
                setDateRangePreset={setDateRangePreset}
                activeSourceFilter={activeSourceFilter}
                setActiveSourceFilter={setActiveSourceFilter}
                activeStatusFilter={activeStatusFilter}
                setActiveStatusFilter={setActiveStatusFilter}
                penaltyOnlyFilter={penaltyOnlyFilter}
                setPenaltyOnlyFilter={setPenaltyOnlyFilter}
              />
            </div>
          </div>

          {/* Mobile: tabs on top */}
          <div className="border-b border-slate-100 pb-2 md:hidden">
            <SubTabsNav tabs={tabs} activeSubTab={activeSubTab} onSelect={setActiveSubTab} />
          </div>

          {/* Mobile / tablet: Period, Source, Stage, Penalty */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:hidden">
            <PeriodSourceStageFilters
              layout="mobile"
              sourceId="reg-intel-filter-source-mobile"
              stageId="reg-intel-filter-stage-mobile"
              dateRangePreset={dateRangePreset}
              setDateRangePreset={setDateRangePreset}
              activeSourceFilter={activeSourceFilter}
              setActiveSourceFilter={setActiveSourceFilter}
              activeStatusFilter={activeStatusFilter}
              setActiveStatusFilter={setActiveStatusFilter}
              penaltyOnlyFilter={penaltyOnlyFilter}
              setPenaltyOnlyFilter={setPenaltyOnlyFilter}
            />
          </div>

          {dateRangePreset === 'custom' ? (
            <div className="flex flex-wrap items-end gap-2">
              <FilterField label="From" className="w-[9.5rem]">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className={FILTER_SELECT_CLS}
                  aria-label="Custom range from"
                />
              </FilterField>
              <FilterField label="To" className="w-[9.5rem]">
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className={FILTER_SELECT_CLS}
                  aria-label="Custom range to"
                />
              </FilterField>
            </div>
          ) : null}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => onKpiTile(1)}
            aria-pressed={activeKpiFilter === 'in_flight'}
            className={`flex min-h-[44px] cursor-pointer flex-col rounded-lg border border-slate-200/80 p-3 text-left text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
              activeKpiFilter === 'in_flight' ? kpiActiveRing : ''
            }`}
            style={{ backgroundColor: '#1F4E79' }}
          >
            <span className="text-2xl font-bold tabular-nums">{kpiSummary.total_in_flight}</span>
            <span className="mt-1 text-xs font-semibold">In Flight</span>
            <span className="mt-0.5 text-[10px] font-normal text-white/80">regulatory changes active</span>
          </button>

          <button
            type="button"
            onClick={() => onKpiTile(2)}
            aria-pressed={activeKpiFilter === 'pending_cco_ack'}
            className={`flex min-h-[44px] cursor-pointer flex-col rounded-lg border border-slate-200/80 p-3 text-left text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
              pendingAck > 0 ? 'ori-reg-intel-kpi-attn' : ''
            } ${activeKpiFilter === 'pending_cco_ack' ? kpiActiveRing : ''}`}
            style={{ backgroundColor: pendingAck > 0 ? '#D97706' : '#15803D' }}
          >
            <span className="text-2xl font-bold tabular-nums">{pendingAck}</span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <span>Pending CCO Ack</span>
              <KpiHelpTip text="Alerts in Stage 1 awaiting your acknowledgement. Tier 1 alerts have a 4-hour ack SLA." />
            </span>
            <span className="mt-0.5 text-[10px] font-normal text-white/80">awaiting your acknowledgement</span>
          </button>

          <button
            type="button"
            onClick={() => onKpiTile(3)}
            aria-pressed={activeKpiFilter === 'effective_within_30'}
            className={`flex min-h-[44px] cursor-pointer flex-col rounded-lg border border-slate-200/80 p-3 text-left text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
              activeKpiFilter === 'effective_within_30' ? kpiActiveRing : ''
            }`}
            style={{ backgroundColor: eff30 > 0 ? '#DC2626' : '#15803D' }}
          >
            <span className="text-2xl font-bold tabular-nums">{eff30}</span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <span>Effective ≤ 30 Days</span>
              <KpiHelpTip text="Regulatory changes whose effective date falls within the next 30 days." />
            </span>
            <span className="mt-0.5 text-[10px] font-normal text-white/80">compliance window closing</span>
          </button>

          <button
            type="button"
            onClick={() => onKpiTile(4)}
            aria-pressed={activeKpiFilter === 'uncovered'}
            className={`flex min-h-[44px] cursor-pointer flex-col rounded-lg border border-slate-200/80 p-3 text-left text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${
              activeKpiFilter === 'uncovered' ? kpiActiveRing : ''
            }`}
            style={{ backgroundColor: uncovered > 0 ? '#DC2626' : '#15803D' }}
          >
            <span className="text-2xl font-bold tabular-nums">{uncovered}</span>
            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <span>Uncovered Obligations</span>
              <KpiHelpTip text="Atomic regulatory requirements with no active control claiming coverage. P0 governance item." />
            </span>
            <span className="mt-0.5 text-[10px] font-normal text-white/80">no control claims coverage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
