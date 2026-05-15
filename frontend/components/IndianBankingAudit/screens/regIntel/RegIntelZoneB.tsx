'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Clock } from 'lucide-react';
import type { RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';
import { RegIntelHelpTip } from './RegIntelHelpTip';
import { REG_INTEL_HELP } from './regIntelHelpCopy';
import { RegIntelCountdownChip } from './RegIntelCountdownChip';
import { RegIntelMaterialityRing } from './RegIntelMaterialityRing';
import { getAlertStripeColor, getSourceColor } from './regIntelSourceColors';

const GOVERNANCE_TRACK: Record<
  RegAlertRecord['governance_track'],
  { bg: string; text: string; label: string }
> = {
  emergency: { bg: '#EF4444', text: '#FFFFFF', label: 'EMERGENCY' },
  expedited: { bg: '#F59E0B', text: '#FFFFFF', label: 'EXPEDITED' },
  standard: { bg: '#6B7280', text: '#FFFFFF', label: 'STANDARD' },
  advisory: { bg: '#3B82F6', text: '#FFFFFF', label: 'ADVISORY' },
};

const STAGE_ORDER: RegAlertRecord['stage'][] = ['acknowledge', 'assess', 'assign', 'implement', 'certify'];

function sourceHex(alert: RegAlertRecord): string {
  return getSourceColor(alert.source);
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(100,116,139,${alpha})`;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function instrumentChipText(alert: RegAlertRecord): string {
  if (alert.instrument_type === 'OPERATIONAL CIRCULAR') {
    return `${alert.source} CIRCULAR`.toUpperCase();
  }
  return `${alert.source} ${alert.instrument_type}`.toUpperCase();
}

function inboxCountdown(alert: RegAlertRecord) {
  if (alert.is_peer_signal) {
    return <RegIntelCountdownChip variant="peer" days={null} />;
  }
  if (alert.instrument_type === 'DRAFT DIRECTION') {
    return <RegIntelCountdownChip variant="consultation" days={alert.days_to_effective} />;
  }
  const d = alert.days_to_effective;
  if (d == null) return <RegIntelCountdownChip variant="none" days={null} />;
  if (d <= 0) return <RegIntelCountdownChip variant="passed" days={d} />;
  return <RegIntelCountdownChip variant="effective" days={d} />;
}

function cardStripeStyle(alert: RegAlertRecord, selected: boolean): React.CSSProperties {
  const stripe = getAlertStripeColor(alert);
  return {
    borderLeftWidth: selected ? 6 : 4,
    borderLeftStyle: 'solid',
    borderLeftColor: stripe,
    ...(selected
      ? {
          boxShadow: `-8px 0 12px -4px ${hexToRgba(stripe, 0.15)}`,
          backgroundColor: hexToRgba(stripe, 0.06),
        }
      : {}),
  };
}

function SourceVerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 shadow-sm">
        <Check className="h-2.5 w-2.5 shrink-0 stroke-[3]" aria-hidden />
        VERIFIED
      </span>
    );
  }
  return (
    <span className="inline-flex max-w-[11rem] items-center gap-0.5 rounded-full border border-amber-400 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 shadow-sm">
      <Clock className="h-2.5 w-2.5 shrink-0" aria-hidden />
      PENDING VERIFICATION
    </span>
  );
}

function PenaltyChips({ codes }: { codes: string[] }) {
  if (!codes.length) {
    return null;
  }
  return (
    <div className="flex max-w-[9.5rem] flex-col items-end justify-start gap-0.5">
      {codes.map((c) => (
        <span
          key={c}
          className="max-w-full truncate rounded border border-rose-400 bg-rose-50 px-1.5 py-0.5 text-right text-[9px] font-bold text-rose-900"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function StageDotsRow({ alert, noTopMargin }: { alert: RegAlertRecord; noTopMargin?: boolean }) {
  const hex = sourceHex(alert);
  const idx = STAGE_ORDER.indexOf(alert.stage as (typeof STAGE_ORDER)[number]);
  const filledThrough =
    alert.stage === 'closed'
      ? 5
      : idx >= 0
        ? idx + 1
        : Math.min(Math.max(alert.stage_index, 1), 5);
  const stageLabel = alert.stage.replace(/_/g, ' ').toUpperCase();
  return (
    <div className={noTopMargin ? '' : 'mt-2'}>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full border border-slate-200"
            style={{
              backgroundColor: i <= filledThrough ? hex : '#e2e8f0',
            }}
          />
        ))}
      </div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: hex }}>
        {stageLabel} — Stage {Math.min(alert.stage_index, 5)} of 5
      </div>
    </div>
  );
}

function PeerBinoculars() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 10a4 4 0 018 0v1H5v-1zm6 0a4 4 0 018 0v1h-8v-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <circle cx="9" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 18h4l2-3h6l2 3h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EmptyInboxIllustration() {
  return (
    <svg className="mx-auto h-24 w-28 text-slate-300" viewBox="0 0 112 96" fill="none" aria-hidden>
      <path
        d="M8 28h96l-8 52H16L8 28z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M16 36h80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <rect x="40" y="12" width="32" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M48 20h16M56 16v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function StandardAlertCard({
  alert,
  selected,
  onSelect,
  elRef,
  tabIndex = 0,
  id,
  onFocus,
  onKeyDown,
}: {
  alert: RegAlertRecord;
  selected: boolean;
  onSelect: () => void;
  elRef?: React.Ref<HTMLButtonElement>;
  tabIndex?: number;
  id?: string;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}) {
  const hex = sourceHex(alert);
  const gt = GOVERNANCE_TRACK[alert.governance_track];
  return (
    <button
      id={id}
      ref={elRef}
      type="button"
      tabIndex={tabIndex}
      onClick={onSelect}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      aria-current={selected ? 'true' : undefined}

      className={`relative flex w-full flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        selected ? 'shadow-md' : ''
      }`}
      style={cardStripeStyle(alert, selected)}
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-0.5">
        <div className="col-start-1 row-start-1 min-w-0 self-start">
          <span
            className="inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: hex }}
          >
            {instrumentChipText(alert)}
          </span>
        </div>
        <div className="col-start-2 row-span-3 row-start-1 flex flex-col items-end gap-1 self-start">
          <div className="flex items-center gap-0.5">
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: gt.bg, color: gt.text }}
            >
              {gt.label}
            </span>
            <RegIntelHelpTip text={REG_INTEL_HELP.governanceTrack} label="Governance track help" align="end" />
          </div>
          <SourceVerificationBadge verified={alert.source_verified} />
        </div>
        <div className="col-start-1 row-start-2 min-w-0 pt-0.5 text-sm font-bold leading-snug text-slate-900 line-clamp-1">
          {alert.instrument_name}
        </div>
        <div className="col-start-1 row-start-3 min-w-0 text-xs text-slate-500">
          <span className="break-words">{alert.instrument_ref}</span>
          <span> · Published {formatDate(alert.publication_date)}</span>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="shrink-0">
          <RegIntelMaterialityRing score={alert.materiality_score} size={44} strokeWidth={4} />
        </div>
        <div className={`flex min-w-0 flex-col gap-1 ${alert.penalty_exposure.length > 0 ? 'flex-1' : ''}`}>
          <div className="w-fit max-w-full">{inboxCountdown(alert)}</div>
          <StageDotsRow alert={alert} noTopMargin />
        </div>
        {alert.penalty_exposure.length > 0 ? (
          <div className="ml-auto shrink-0 self-start pt-0.5">
            <PenaltyChips codes={alert.penalty_exposure} />
          </div>
        ) : null}
      </div>
      {alert.unread ? (
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" aria-label="Unread" />
      ) : null}
    </button>
  );
}

function DraftAlertCard({
  alert,
  selected,
  onSelect,
  elRef,
  tabIndex = 0,
  id,
  onFocus,
  onKeyDown,
}: {
  alert: RegAlertRecord;
  selected: boolean;
  onSelect: () => void;
  elRef?: React.Ref<HTMLButtonElement>;
  tabIndex?: number;
  id?: string;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}) {
  const hex = sourceHex(alert);
  return (
    <button
      id={id}
      ref={elRef}
      type="button"
      tabIndex={tabIndex}
      onClick={onSelect}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      aria-current={selected ? 'true' : undefined}

      className={`relative flex w-full flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        selected ? 'shadow-md' : ''
      }`}
      style={cardStripeStyle(alert, selected)}
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-0.5">
        <div className="col-start-1 row-start-1 min-w-0 self-start">
          <span className="inline-block max-w-full truncate rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-900">
            {alert.source} DRAFT DIRECTION
          </span>
        </div>
        <div className="col-start-2 row-span-3 row-start-1 flex flex-col items-end gap-1 self-start">
          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            CONSULTATION OPEN
          </span>
          <SourceVerificationBadge verified={alert.source_verified} />
        </div>
        <div className="col-start-1 row-start-2 min-w-0 pt-0.5 text-sm font-bold leading-snug text-slate-900 line-clamp-1">
          {alert.instrument_name}
        </div>
        <div className="col-start-1 row-start-3 min-w-0 text-xs text-slate-500">
          <span className="break-words">{alert.instrument_ref}</span>
          <span> · Published {formatDate(alert.publication_date)}</span>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <div className="shrink-0">
          <RegIntelMaterialityRing score={alert.materiality_score} size={44} strokeWidth={4} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">{inboxCountdown(alert)}</div>
      </div>
      <p className="text-[10px] text-slate-500">Response status: No response drafted</p>
      {alert.unread ? (
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" aria-label="Unread" />
      ) : null}
    </button>
  );
}

function PeerSignalCard({
  alert,
  selected,
  onSelect,
  elRef,
  tabIndex = 0,
  id,
  onFocus,
  onKeyDown,
}: {
  alert: RegAlertRecord;
  selected: boolean;
  onSelect: () => void;
  elRef?: React.Ref<HTMLButtonElement>;
  tabIndex?: number;
  id?: string;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}) {
  const peerHex = '#B7580A';
  return (
    <button
      id={id}
      ref={elRef}
      type="button"
      tabIndex={tabIndex}
      onClick={onSelect}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      aria-current={selected ? 'true' : undefined}

      className={`relative flex w-full flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        selected ? 'shadow-md' : ''
      }`}
      style={cardStripeStyle(alert, selected)}
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-0.5">
        <div className="col-start-1 row-start-1 min-w-0 self-start">
          <span
            className="inline-flex min-w-0 max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: peerHex }}
          >
            <PeerBinoculars />
            PEER ENFORCEMENT SIGNAL
          </span>
        </div>
        <div className="col-start-2 row-span-3 row-start-1 flex flex-col items-end gap-1 self-start">
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300">
            SELF-ASSESSMENT RECOMMENDED
          </span>
          <SourceVerificationBadge verified={alert.source_verified} />
        </div>
        <div className="col-start-1 row-start-2 min-w-0 pt-0.5 text-sm font-bold leading-snug text-slate-900 line-clamp-1">
          {alert.instrument_name}
        </div>
        <div className="col-start-1 row-start-3 min-w-0 text-xs text-slate-500">
          <span className="break-words">{alert.instrument_ref}</span>
          <span> · Detected {formatDate(alert.publication_date)}</span>
        </div>
      </div>
      <div className="min-w-0 space-y-0.5 text-xs text-slate-600">
        <p>
          Peer bank penalised: <span className="font-semibold text-slate-900">{alert.peer_penalty_amount}</span>
        </p>
        <p>
          Similarity:{' '}
          <span className="text-sm font-bold text-amber-700">{alert.peer_similarity_pct}%</span> with your gap on{' '}
          <span className="font-mono text-[11px] text-slate-800">{alert.peer_similar_to}</span>
        </p>
      </div>
      <div className="flex justify-start">{inboxCountdown(alert)}</div>
      {alert.unread ? (
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" aria-label="Unread" />
      ) : null}
    </button>
  );
}

function renderCard(
  alert: RegAlertRecord,
  selected: boolean,
  onSelect: () => void,
  opts: {
    elRef?: React.Ref<HTMLButtonElement>;
    tabIndex?: number;
    id?: string;
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  }
) {
  const p = {
    elRef: opts.elRef,
    tabIndex: opts.tabIndex,
    id: opts.id,
    onFocus: opts.onFocus,
    onKeyDown: opts.onKeyDown,
  };
  if (alert.is_peer_signal) {
    return <PeerSignalCard alert={alert} selected={selected} onSelect={onSelect} {...p} />;
  }
  if (alert.instrument_type === 'DRAFT DIRECTION') {
    return <DraftAlertCard alert={alert} selected={selected} onSelect={onSelect} {...p} />;
  }
  return <StandardAlertCard alert={alert} selected={selected} onSelect={onSelect} {...p} />;
}

function InboxSkeletonCards() {
  return (
    <ul className="flex flex-col gap-2 p-2" aria-busy="true" aria-label="Loading alerts">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="animate-pulse">
          <div className="flex min-h-[118px] flex-col rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="h-3.5 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-2.5 w-full rounded bg-slate-200" />
            <div className="mt-1.5 h-2.5 w-4/5 rounded bg-slate-200" />
            <div className="mt-auto flex justify-between pt-3">
              <div className="h-9 w-9 rounded-full bg-slate-200" />
              <div className="h-10 w-14 rounded-full bg-slate-200" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export type RegIntelInboxLayout = 'flow' | 'pane';

export function RegIntelZoneB({
  alerts,
  selectedAlertId,
  onSelectAlert,
  onClearFilters,
  dataReady = true,
  searchTerm = '',
  preSearchMatchCount,
  onClearSearch,
  inboxLayout = 'flow',
}: {
  alerts: RegAlertRecord[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  onClearFilters: () => void;
  dataReady?: boolean;
  searchTerm?: string;
  preSearchMatchCount?: number;
  onClearSearch?: () => void;
  /** `flow`: list grows with the page (full-page scroll). `pane`: fill parent height; list body scrolls. */
  inboxLayout?: RegIntelInboxLayout;
}) {
  const [kbFocus, setKbFocus] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const q = searchTerm.trim();
  const denom = preSearchMatchCount ?? alerts.length;
  const showSearchSummary = q.length > 0 && preSearchMatchCount !== undefined;

  useLayoutEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, alerts.length);
  }, [alerts.length]);

  useEffect(() => {
    if (!selectedAlertId || !alerts.length) return;
    const i = alerts.findIndex((a) => a.id === selectedAlertId);
    if (i >= 0) setKbFocus(i);
  }, [selectedAlertId, alerts]);

  useEffect(() => {
    if (!dataReady || !alerts.length) return;
    itemRefs.current[kbFocus]?.focus();
  }, [kbFocus, alerts.length, dataReady]);

  const pane = inboxLayout === 'pane';

  return (
    <div
      className={`flex flex-col overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
        pane ? 'h-full min-h-0 max-h-full' : 'max-w-full min-h-0'
      }`}
    >
      <header className="shrink-0 border-b border-slate-100 bg-white/95 px-3 py-2.5 backdrop-blur-sm sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 text-sm font-semibold text-slate-800">
            {showSearchSummary ? (
              <span className="break-words">
                {alerts.length} of {denom} alerts · matching &apos;{q}&apos;
              </span>
            ) : (
              <span>
                {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <span aria-hidden>⇅</span>
            Sorted by urgency
          </span>
        </div>
      </header>
      <div
        className={`p-2.5 sm:p-3 ${pane ? 'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain' : ''}`}
      >
        {!dataReady ? (
          <InboxSkeletonCards />
        ) : alerts.length === 0 && q.length > 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <EmptyInboxIllustration />
            <h3 className="mt-4 text-sm font-bold text-slate-800">No alerts match your search</h3>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-600">
              Try a shorter search term or clear the search.
            </p>
            <button
              type="button"
              onClick={() => onClearSearch?.()}
              className="mt-4 min-h-[44px] rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Clear Search
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <EmptyInboxIllustration />
            <h3 className="mt-4 text-sm font-bold text-slate-800">No alerts match these filters</h3>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-600">
              Try clearing filters or check the Consultations / Peer Signals tabs.
            </p>
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 min-h-[44px] rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert, i) => (
              <li key={alert.id}>
                {renderCard(alert, selectedAlertId === alert.id, () => onSelectAlert(alert.id), {
                  elRef: (el) => {
                    itemRefs.current[i] = el;
                  },
                  tabIndex: i === kbFocus ? 0 : -1,
                  id: `reg-inbox-card-${alert.id}`,
                  onFocus: () => setKbFocus(i),
                  onKeyDown: (e) => {
                    if (!dataReady || !alerts.length) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setKbFocus(Math.min(i + 1, alerts.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setKbFocus(Math.max(i - 1, 0));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      onSelectAlert(alert.id);
                    }
                  },
                })}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
