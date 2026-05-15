'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  alerts as regIntelAlertsSeed,
  kpiSummary,
  syncStateSeed,
} from '@/lib/IndianBankingAudit/regIntelMockData';
import type { KPISummary, RegAlertRecord, SyncSourceState } from '@/lib/IndianBankingAudit/regIntelMockData';
import { getSourceDocumentByRef } from '@/lib/IndianBankingAudit/regIntelSourceDocuments';
import {
  type RegIntelDateRangeFilter,
  type RegIntelDateRangePreset,
  type RegIntelKpiLinkFilter,
  type RegIntelSubTab,
  computeFilteredAlertsCore,
  computeKpiSummary,
  countAlertsBySubTab,
  filterAlertsBySearchTerm,
  sortInboxAlerts,
} from './regIntel/regIntelFilters';
import { RegIntelZoneA } from './regIntel/RegIntelZoneA';
import { RegIntelZoneB } from './regIntel/RegIntelZoneB';
import { RegIntelZoneC } from './regIntel/RegIntelZoneC';
import { RegIntelToastProvider } from './regIntel/RegIntelToasts';
import { SourceDocumentDrawer } from './regIntel/SourceDocumentDrawer';
import { effectiveSyncDisplay } from './regIntel/regIntelSyncUtils';

function MobileZoneCSheet({
  alert,
  onClose,
  expandedObligationId,
  setExpandedObligationId,
  onSelectLinkedAlert,
  updateAlert,
  narrativeOverrides,
  setNarrativeOverride,
  narrativeEditedMap,
  setNarrativeEditedMap,
  certifiedAtByAlertId,
  setCertifiedAtByAlertId,
  kpiSummary,
  allAlerts,
  dataReady,
  onOpenSourceDocumentForAlert,
  metricsDrawerOpen,
  onMetricsDrawerOpenChange,
}: {
  alert: RegAlertRecord;
  onClose: () => void;
  expandedObligationId: string | null;
  setExpandedObligationId: (id: string | null) => void;
  onSelectLinkedAlert: (id: string) => void;
  updateAlert: (alertId: string, updater: (a: RegAlertRecord) => RegAlertRecord) => void;
  narrativeOverrides: Record<string, string>;
  setNarrativeOverride: (alertId: string, text: string | null) => void;
  narrativeEditedMap: Record<string, boolean>;
  setNarrativeEditedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  certifiedAtByAlertId: Record<string, string>;
  setCertifiedAtByAlertId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  kpiSummary: KPISummary;
  allAlerts: RegAlertRecord[];
  dataReady: boolean;
  onOpenSourceDocumentForAlert?: (highlightAnchor: string | null) => void;
  metricsDrawerOpen: boolean;
  onMetricsDrawerOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-[8400] flex min-h-0 flex-col bg-black/50 md:hidden" role="dialog" aria-modal="true" aria-label="Alert detail">
      <button
        type="button"
        className="min-h-[44px] min-w-0 flex-1 cursor-default bg-transparent"
        aria-label="Dismiss sheet backdrop"
        onClick={onClose}
      />
      <div className="mt-auto flex w-full max-h-[min(90dvh,calc(100dvh-2.5rem))] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="truncate pr-2 text-xs font-semibold text-slate-800">{alert.instrument_name}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-lg text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Close detail"
          >
            ×
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <RegIntelZoneC
            scrollMode="pane"
            alert={alert}
            expandedObligationId={expandedObligationId}
            setExpandedObligationId={setExpandedObligationId}
            onSelectLinkedAlert={onSelectLinkedAlert}
            updateAlert={updateAlert}
            narrativeOverrides={narrativeOverrides}
            setNarrativeOverride={setNarrativeOverride}
            narrativeEditedMap={narrativeEditedMap}
            setNarrativeEditedMap={setNarrativeEditedMap}
            certifiedAtByAlertId={certifiedAtByAlertId}
            setCertifiedAtByAlertId={setCertifiedAtByAlertId}
            kpiSummary={kpiSummary}
            allAlerts={allAlerts}
            dataReady={dataReady}
            onOpenSourceDocumentForAlert={onOpenSourceDocumentForAlert}
            metricsDrawerOpen={metricsDrawerOpen}
            onMetricsDrawerOpenChange={onMetricsDrawerOpenChange}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Regulatory Intelligence Inbox — ORI (REG_INTEL_SPEC.md).
 * Pass 7: polish, skeletons, cross-nav, keyboard, mobile sheet, metrics drawer.
 */
export function RegulatoryIntelligenceInbox() {
  return (
    <RegIntelToastProvider>
      <RegulatoryIntelligenceInboxInner />
    </RegIntelToastProvider>
  );
}

function RegulatoryIntelligenceInboxInner() {
  const [activeSubTab, setActiveSubTabState] = useState<RegIntelSubTab>('alerts');
  const [activeSourceFilter, setActiveSourceFilterState] = useState('All Sources');
  const [activeStatusFilter, setActiveStatusFilterState] = useState('All Stages');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<RegAlertRecord[]>(() => [...regIntelAlertsSeed]);
  const [expandedObligationId, setExpandedObligationId] = useState<string | null>(null);
  const [narrativeEdited, setNarrativeEdited] = useState<Record<string, boolean>>({});
  const [narrativeOverrides, setNarrativeOverrides] = useState<Record<string, string>>({});
  const [certifiedAtByAlertId, setCertifiedAtByAlertId] = useState<Record<string, string>>({});
  const [sourceDrawerInstrumentRef, setSourceDrawerInstrumentRef] = useState<string | null>(null);
  const [sourceDrawerHighlightAnchor, setSourceDrawerHighlightAnchor] = useState<string | null>(null);
  const [kpiLinkFilter, setKpiLinkFilter] = useState<RegIntelKpiLinkFilter>(null);
  const [dataReady, setDataReady] = useState(false);
  const [isMdUp, setIsMdUp] = useState(true);
  const syncSources = useMemo<SyncSourceState[]>(() => syncStateSeed.map((s) => ({ ...s })), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState<RegIntelDateRangePreset>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [penaltyOnlyFilter, setPenaltyOnlyFilter] = useState(false);
  const [ccoMetricsDrawerOpen, setCcoMetricsDrawerOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDataReady(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const fn = () => setIsMdUp(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const closeSourceDocument = useCallback(() => {
    setSourceDrawerInstrumentRef(null);
    setSourceDrawerHighlightAnchor(null);
  }, []);

  const openSourceDocument = useCallback((instrumentRef: string, highlightAnchor: string | null) => {
    setSourceDrawerInstrumentRef(instrumentRef);
    setSourceDrawerHighlightAnchor(highlightAnchor);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sourceDrawerInstrumentRef) {
          e.preventDefault();
          closeSourceDocument();
          return;
        }
        if (ccoMetricsDrawerOpen) {
          e.preventDefault();
          setCcoMetricsDrawerOpen(false);
          return;
        }
        if (selectedAlertId) {
          setSelectedAlertId(null);
          setExpandedObligationId(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedAlertId, sourceDrawerInstrumentRef, ccoMetricsDrawerOpen, closeSourceDocument]);

  const setActiveSubTab = useCallback((t: RegIntelSubTab) => {
    setKpiLinkFilter(null);
    setActiveSubTabState(t);
  }, []);

  const setActiveSourceFilter = useCallback((s: string) => {
    setKpiLinkFilter(null);
    setActiveSourceFilterState(s);
  }, []);

  const setActiveStatusFilter = useCallback((s: string) => {
    setKpiLinkFilter(null);
    setActiveStatusFilterState(s);
  }, []);

  const subTabCounts = useMemo(() => countAlertsBySubTab(alerts), [alerts]);

  const liveKpiSummary = useMemo(() => computeKpiSummary(alerts, kpiSummary), [alerts]);

  const dateRangeFilter = useMemo((): RegIntelDateRangeFilter => {
    if (dateRangePreset === 'custom') {
      if (customDateFrom && customDateTo) return { from: customDateFrom, to: customDateTo };
      return 'all';
    }
    return dateRangePreset;
  }, [dateRangePreset, customDateFrom, customDateTo]);

  const coreFilterOpts = useMemo(
    () => ({
      activeSubTab,
      activeSourceFilter,
      activeStatusFilter,
      kpiLinkFilter,
      dateRangeFilter,
      penaltyOnlyFilter,
    }),
    [activeSubTab, activeSourceFilter, activeStatusFilter, kpiLinkFilter, dateRangeFilter, penaltyOnlyFilter]
  );

  const preSearchAlerts = useMemo(() => computeFilteredAlertsCore(alerts, coreFilterOpts), [alerts, coreFilterOpts]);

  const filteredAlerts = useMemo(
    () => filterAlertsBySearchTerm(preSearchAlerts, searchTerm),
    [preSearchAlerts, searchTerm]
  );

  const sortedInboxAlerts = useMemo(() => sortInboxAlerts(filteredAlerts), [filteredAlerts]);

  const selectedAlert = useMemo(
    () => (selectedAlertId ? alerts.find((a) => a.id === selectedAlertId) ?? null : null),
    [alerts, selectedAlertId]
  );

  const onKpiTile = useCallback((tile: 1 | 2 | 3 | 4) => {
    const next: RegIntelKpiLinkFilter =
      tile === 1
        ? 'in_flight'
        : tile === 2
          ? 'pending_cco_ack'
          : tile === 3
            ? 'effective_within_30'
            : 'uncovered';

    setKpiLinkFilter((prev) => (prev === next ? null : next));
  }, []);

  useEffect(() => {
    if (!kpiLinkFilter) return;
    setActiveStatusFilterState('All Stages');
    setActiveSourceFilterState('All Sources');
    setPenaltyOnlyFilter(false);
  }, [kpiLinkFilter]);

  const onSelectAlert = useCallback((id: string) => {
    setSelectedAlertId(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, unread: false } : a)));
  }, []);

  const onClearFilters = useCallback(() => {
    setKpiLinkFilter(null);
    setActiveSourceFilterState('All Sources');
    setActiveStatusFilterState('All Stages');
    setSearchTerm('');
    setDateRangePreset('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setPenaltyOnlyFilter(false);
  }, []);

  const onClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const onSelectLinkedAlert = useCallback((id: string) => {
    setSelectedAlertId(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, unread: false } : a)));
  }, []);

  const updateAlert = useCallback((alertId: string, updater: (a: RegAlertRecord) => RegAlertRecord) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? updater(a) : a)));
  }, []);

  const setNarrativeOverride = useCallback((alertId: string, text: string | null) => {
    setNarrativeOverrides((prev) => {
      const next = { ...prev };
      if (text === null) delete next[alertId];
      else next[alertId] = text;
      return next;
    });
  }, []);

  /** Clears Zone C selection, collapses obligations, and closes CCO metrics (desktop + mobile). */
  const closeDetailView = useCallback(() => {
    setCcoMetricsDrawerOpen(false);
    setSelectedAlertId(null);
    setExpandedObligationId(null);
  }, []);

  const openSourceForSelectedAlert = useCallback(
    (highlightAnchor: string | null) => {
      if (!selectedAlertId) return;
      const a = alerts.find((x) => x.id === selectedAlertId);
      if (a) openSourceDocument(a.instrument_ref, highlightAnchor);
    },
    [alerts, selectedAlertId, openSourceDocument]
  );

  const sourceDrawerSync = useMemo(() => {
    if (!sourceDrawerInstrumentRef) return { neutral: true as const, status: null as null };
    const d = getSourceDocumentByRef(sourceDrawerInstrumentRef);
    if (!d) return { neutral: true as const, status: null as null };
    if (d.authority_emblem === 'PEER') return { neutral: true as const, status: null as null };
    const row = syncSources.find((s) => s.source === d.authority_emblem);
    if (!row) return { neutral: true as const, status: null as null };
    return { neutral: false as const, status: effectiveSyncDisplay(row, false) };
  }, [sourceDrawerInstrumentRef, syncSources]);

  const showMobileSheet = Boolean(!isMdUp && selectedAlert);
  /** Desktop + selection: two-column layout; single main scroll (no locked split height or nested list/detail panes). */
  const splitDesktop = Boolean(selectedAlert && isMdUp);
  const splitGridRef = useRef<HTMLDivElement>(null);
  const wasSplitDesktopRef = useRef(false);

  useLayoutEffect(() => {
    if (splitDesktop && !wasSplitDesktopRef.current && splitGridRef.current) {
      splitGridRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    wasSplitDesktopRef.current = splitDesktop;
  }, [splitDesktop]);

  return (
    <>
      <div className="flex max-w-full min-w-0 flex-col gap-4 overflow-x-hidden">
        <RegIntelZoneA
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          subTabCounts={subTabCounts}
          activeSourceFilter={activeSourceFilter}
          setActiveSourceFilter={setActiveSourceFilter}
          activeStatusFilter={activeStatusFilter}
          setActiveStatusFilter={setActiveStatusFilter}
          kpiSummary={liveKpiSummary}
          activeKpiFilter={kpiLinkFilter}
          onKpiTile={onKpiTile}
          dateRangePreset={dateRangePreset}
          setDateRangePreset={setDateRangePreset}
          customDateFrom={customDateFrom}
          setCustomDateFrom={setCustomDateFrom}
          customDateTo={customDateTo}
          setCustomDateTo={setCustomDateTo}
          penaltyOnlyFilter={penaltyOnlyFilter}
          setPenaltyOnlyFilter={setPenaltyOnlyFilter}
        />

        <div
          ref={splitGridRef}
          className={`grid min-w-0 grid-cols-1 gap-5 md:items-start ${
            splitDesktop ? 'md:grid-cols-[minmax(0,0.46fr)_minmax(0,1fr)]' : ''
          }`}
        >
          <div className="flex min-w-0 flex-col">
            <RegIntelZoneB
              alerts={sortedInboxAlerts}
              selectedAlertId={selectedAlertId}
              onSelectAlert={onSelectAlert}
              onClearFilters={onClearFilters}
              dataReady={dataReady}
              searchTerm={searchTerm}
              preSearchMatchCount={preSearchAlerts.length}
              onClearSearch={onClearSearch}
              inboxLayout="flow"
            />
          </div>
          {selectedAlert ? (
            <div className="hidden min-w-0 md:block">
              <div className="flex min-w-0 flex-col overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <RegIntelZoneC
                  scrollMode="document"
                  alert={selectedAlert}
                  expandedObligationId={expandedObligationId}
                  setExpandedObligationId={setExpandedObligationId}
                  onSelectLinkedAlert={onSelectLinkedAlert}
                  updateAlert={updateAlert}
                  narrativeOverrides={narrativeOverrides}
                  setNarrativeOverride={setNarrativeOverride}
                  narrativeEditedMap={narrativeEdited}
                  setNarrativeEditedMap={setNarrativeEdited}
                  certifiedAtByAlertId={certifiedAtByAlertId}
                  setCertifiedAtByAlertId={setCertifiedAtByAlertId}
                  kpiSummary={liveKpiSummary}
                  allAlerts={alerts}
                  dataReady={dataReady}
                  onOpenSourceDocumentForAlert={openSourceForSelectedAlert}
                  metricsDrawerOpen={ccoMetricsDrawerOpen}
                  onMetricsDrawerOpenChange={setCcoMetricsDrawerOpen}
                  onCloseDetail={closeDetailView}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showMobileSheet && selectedAlert ? (
          <MobileZoneCSheet
            alert={selectedAlert}
            onClose={closeDetailView}
            expandedObligationId={expandedObligationId}
            setExpandedObligationId={setExpandedObligationId}
            onSelectLinkedAlert={onSelectLinkedAlert}
            updateAlert={updateAlert}
            narrativeOverrides={narrativeOverrides}
            setNarrativeOverride={setNarrativeOverride}
            narrativeEditedMap={narrativeEdited}
            setNarrativeEditedMap={setNarrativeEdited}
            certifiedAtByAlertId={certifiedAtByAlertId}
            setCertifiedAtByAlertId={setCertifiedAtByAlertId}
            kpiSummary={liveKpiSummary}
            allAlerts={alerts}
            dataReady={dataReady}
            onOpenSourceDocumentForAlert={openSourceForSelectedAlert}
            metricsDrawerOpen={ccoMetricsDrawerOpen}
            onMetricsDrawerOpenChange={setCcoMetricsDrawerOpen}
          />
        ) : null}

      </div>
      <SourceDocumentDrawer
        isOpen={sourceDrawerInstrumentRef !== null}
        instrumentRef={sourceDrawerInstrumentRef}
        highlightAnchor={sourceDrawerHighlightAnchor}
        onClose={closeSourceDocument}
        isGlobalSyncing={false}
        syncStripNeutral={sourceDrawerSync.neutral}
        regulatorSyncStatus={sourceDrawerSync.neutral ? null : sourceDrawerSync.status}
      />
    </>
  );
}
