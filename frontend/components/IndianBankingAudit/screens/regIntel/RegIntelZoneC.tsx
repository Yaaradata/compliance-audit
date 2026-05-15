'use client';

import Link from 'next/link';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BarChart2, X } from 'lucide-react';
import type { KPISummary, RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';
import { RegIntelCCOMetricsDrawer } from './RegIntelCCOMetricsDrawer';
import { REG_INTEL_HELP } from './regIntelHelpCopy';
import { REG_INTEL_ROUTES } from './regIntelPaths';
import { RegIntelHelpTip } from './RegIntelHelpTip';
import { RegIntelZoneCMiddle } from './RegIntelZoneCMiddle';
import { RegIntelZoneCActionBar } from './RegIntelZoneCActionBar';
import { RegIntelCountdownChip } from './RegIntelCountdownChip';
import { RegIntelWorkflowStepper } from './RegIntelWorkflowStepper';

const SOURCE_BRAND: Record<string, string> = {
  RBI: '#1F4E79',
  'FIU-IND': '#7B2D8B',
  'CERT-IN': '#C0392B',
  MOF: '#2C7A2C',
  SEBI: '#E8700A',
  NPCI: '#006FB4',
  IBA: '#5D5D5D',
};

const PEER_AMBER = '#B7580A';

const STAGE_BADGE: Record<
  RegAlertRecord['stage'],
  { label: string; bg: string; fg: string }
> = {
  acknowledge: { label: 'PENDING ACKNOWLEDGEMENT', bg: '#D97706', fg: '#FFFFFF' },
  assess: { label: 'UNDER ASSESSMENT', bg: '#2563EB', fg: '#FFFFFF' },
  assign: { label: 'ASSIGNING ACTIONS', bg: '#4F46E5', fg: '#FFFFFF' },
  implement: { label: 'IMPLEMENTATION', bg: '#0D9488', fg: '#FFFFFF' },
  certify: { label: 'CERTIFY', bg: '#15803D', fg: '#FFFFFF' },
  closed: { label: 'CERTIFIED CLOSED', bg: '#6B7280', fg: '#FFFFFF' },
};

function sourceHex(alert: RegAlertRecord): string {
  if (alert.is_peer_signal) return PEER_AMBER;
  return SOURCE_BRAND[alert.source] || '#64748b';
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

function C1SourceHashLine({ alert }: { alert: RegAlertRecord }) {
  const today = formatDate(new Date().toISOString().slice(0, 10));
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-slate-500">
      <span>
        {alert.instrument_ref} · Published {formatDate(alert.publication_date)} · As-of {today} ·{' '}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="inline-flex items-center gap-0.5 rounded px-0.5 transition-colors hover:bg-[rgba(59,130,246,0.1)]">
          <span>State hash </span>
          <span className="font-mono text-[11px] text-slate-700">{alert.source_hash}</span>
        </span>
        <RegIntelHelpTip text={REG_INTEL_HELP.sourceHash} label="State hash help" align="end" />
      </span>
    </p>
  );
}

function daysFromToday(isoDate: string): number {
  const end = new Date(isoDate + 'T12:00:00');
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

function UrgencyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3.5L17 16H3L10 3.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M10 8v3.5M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CountdownBanner({ alert }: { alert: RegAlertRecord }) {
  if (alert.is_peer_signal) {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <RegIntelCountdownChip variant="peer" days={null} />
        <p className="text-xs font-semibold text-amber-950">Peer enforcement detected — self-assessment recommended</p>
      </div>
    );
  }

  if (alert.instrument_type === 'DRAFT DIRECTION' && alert.consultation_deadline) {
    const n = daysFromToday(alert.consultation_deadline);
    return (
      <div className="mt-4 flex flex-col gap-2">
        <RegIntelCountdownChip variant="consultation" days={n} />
        <p className="text-xs text-slate-600">Consultation closes {formatDate(alert.consultation_deadline)}</p>
      </div>
    );
  }

  const d = alert.days_to_effective;
  const eff = alert.effective_date;

  if (eff == null || d == null) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
        No effective date scheduled for this item.
      </div>
    );
  }

  const formatted = formatDate(eff);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {d > 0 ? <RegIntelCountdownChip variant="effective" days={d} /> : <RegIntelCountdownChip variant="passed" days={d} />}
      {d >= 1 && d <= 7 ? (
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-950">
          <UrgencyIcon className="h-4 w-4 shrink-0 text-rose-700" />
          <span>
            {d} days until effective — {formatted} · URGENT
          </span>
        </div>
      ) : d > 0 ? (
        <p className="text-xs font-medium text-slate-600">
          {d} days until effective — {formatted}
        </p>
      ) : (
        <p className="text-xs font-semibold text-slate-700">
          Effective date passed {Math.abs(d)} {Math.abs(d) === 1 ? 'day' : 'days'} ago — in certification phase
        </p>
      )}
    </div>
  );
}

function C1HeaderStandard({ alert }: { alert: RegAlertRecord }) {
  const hex = sourceHex(alert);
  const badge = STAGE_BADGE[alert.stage];

  return (
    <div
      className="rounded-xl border border-slate-200 p-4 shadow-sm"
      style={{ backgroundColor: hexToRgba(hex, 0.04) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className="max-w-full truncate rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: hex }}
          >
            {instrumentChipText(alert)}
          </span>
          <span
            className="rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ borderColor: hex, color: hex }}
          >
            {alert.domain}
          </span>
          {alert.penalty_exposure.map((code) => (
            <span
              key={code}
              className="rounded border border-rose-400 bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-900"
            >
              {code}
            </span>
          ))}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: badge.bg, color: badge.fg }}
        >
          {badge.label}
        </span>
      </div>

      <h2 className="mt-3 text-[22px] font-bold leading-snug text-slate-900">{alert.instrument_name}</h2>

      <C1SourceHashLine alert={alert} />

      <RegIntelWorkflowStepper alert={alert} accentHex={hex} />
      <CountdownBanner alert={alert} />
    </div>
  );
}

function C1HeaderPeer({ alert }: { alert: RegAlertRecord }) {
  const hex = PEER_AMBER;

  return (
    <div
      className="rounded-xl border border-slate-200 p-4 shadow-sm"
      style={{ backgroundColor: hexToRgba(hex, 0.06) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: hex }}
          >
            PEER ENFORCEMENT SIGNAL
          </span>
          <span
            className="rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ borderColor: hex, color: hex }}
          >
            {alert.domain}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${
            alert.stage === 'closed'
              ? 'border border-slate-400 bg-slate-200 text-slate-800'
              : 'border border-amber-700 bg-amber-100 text-amber-950'
          }`}
        >
          {alert.stage === 'closed' ? 'PEER SIGNAL REVIEWED' : 'SELF-ASSESSMENT RECOMMENDED'}
        </span>
      </div>

      <h2 className="mt-3 text-[22px] font-bold leading-snug text-slate-900">{alert.instrument_name}</h2>

      <C1SourceHashLine alert={alert} />

      <CountdownBanner alert={alert} />
    </div>
  );
}

function C1HeaderDraft({ alert }: { alert: RegAlertRecord }) {
  const hex = sourceHex(alert);
  const draftChipBg = '#E0F2FE';
  const draftChipFg = '#0369A1';

  return (
    <div
      className="rounded-xl border border-slate-200 p-4 shadow-sm"
      style={{ backgroundColor: hexToRgba(hex, 0.04) }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: draftChipBg, color: draftChipFg, border: `1px solid ${draftChipFg}33` }}
          >
            RBI DRAFT DIRECTION
          </span>
          <span
            className="rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ borderColor: hex, color: hex }}
          >
            {alert.domain}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-sky-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
          CONSULTATION OPEN
        </span>
      </div>

      <h2 className="mt-3 text-[22px] font-bold leading-snug text-slate-900">{alert.instrument_name}</h2>

      <C1SourceHashLine alert={alert} />

      <CountdownBanner alert={alert} />
    </div>
  );
}

function C2CompositionStandard({
  alert,
  expandedObligationId,
  setExpandedObligationId,
}: {
  alert: RegAlertRecord;
  expandedObligationId: string | null;
  setExpandedObligationId: (id: string | null) => void;
}) {
  const u = alert.uncovered_count;
  const p = alert.partial_count;
  const c = alert.covered_count;
  const totalCov = u + p + c;
  const uPct = totalCov > 0 ? (u / totalCov) * 100 : 0;
  const pPct = totalCov > 0 ? (p / totalCov) * 100 : 0;
  const cPct = totalCov > 0 ? (c / totalCov) * 100 : 0;
  const gapColor = u === 0 ? '#15803D' : '#DC2626';
  const openPas = Math.max(0, alert.pas_created - alert.pas_closed);

  return (
    <div className="mt-4">
      <h3 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        Change Composition
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <span className="text-[40px] font-bold leading-none tabular-nums text-slate-900">
            {alert.obligations_total}
          </span>
          <div className="mt-1 text-sm font-medium text-slate-500">Atomic obligations extracted</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {alert.obligations_approved} approved · {alert.obligations_pending_hitl} pending HITL
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-600">
            <span className="font-medium">Materiality</span>
            <RegIntelHelpTip text={REG_INTEL_HELP.materialityScore} label="Materiality score help" align="start" />
            <span className="font-semibold tabular-nums text-slate-900">{alert.materiality_score}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {alert.obligations.map((obl) => (
              <Link
                key={obl.id}
                href={REG_INTEL_ROUTES.obligationCoverage(obl.id)}
                aria-label={`Obligation ${obl.id}: expand in this view or open coverage in new tab with modifier key`}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  expandedObligationId === obl.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  setExpandedObligationId(obl.id);
                }}
              >
                {obl.id}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <span>Coverage Gap</span>
            <RegIntelHelpTip text={REG_INTEL_HELP.coverageStatus} label="Coverage status help" align="start" />
          </div>
          <span className="mt-1 block text-[40px] font-bold leading-none tabular-nums" style={{ color: gapColor }}>
            {u}
          </span>
          <div className="mt-1 text-sm font-medium text-slate-500">Uncovered obligations</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {u} uncovered · {p} partial · {c} covered
          </div>
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
            {totalCov === 0 ? (
              <div className="h-full w-full rounded-full bg-slate-200" />
            ) : (
              <>
                {uPct > 0 ? (
                  <div className="h-full bg-rose-600" style={{ width: `${uPct}%` }} title="Uncovered" />
                ) : null}
                {pPct > 0 ? (
                  <div className="h-full bg-amber-500" style={{ width: `${pPct}%` }} title="Partial" />
                ) : null}
                {cPct > 0 ? (
                  <div className="h-full bg-emerald-600" style={{ width: `${cPct}%` }} title="Covered" />
                ) : null}
              </>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-red-500" aria-hidden />
              Uncovered ({u})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-amber-500" aria-hidden />
              Partial ({p})
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-sm bg-green-600" aria-hidden />
              Covered ({c})
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <span className="text-[40px] font-bold leading-none tabular-nums text-slate-900">{alert.pas_created}</span>
          <div className="mt-1 text-sm font-medium text-slate-500">Preventive actions raised</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {openPas} open · {alert.pas_closed} closed
          </div>
          <div className="mt-3">
            {alert.pas_created === 0 ? (
              <p className="text-xs text-slate-500">No PAs yet — create in Stage 3</p>
            ) : (
              <Link
                href={REG_INTEL_ROUTES.issuesBoardPa}
                className="inline-flex min-h-[44px] items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                View PAs in Issues Board
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function C2PeerPanel({
  alert,
  onSelectLinkedAlert,
}: {
  alert: RegAlertRecord;
  onSelectLinkedAlert: (id: string) => void;
}) {
  const pct = alert.peer_similarity_pct ?? 0;
  const linkId = alert.peer_similar_to;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <h3 className="text-sm font-bold text-slate-900">Similarity Analysis</h3>
      <p className="mt-2 text-sm text-slate-700">
        ORI AI detected {pct}% structural similarity with:
      </p>
      {linkId ? (
        <button
          type="button"
          onClick={() => onSelectLinkedAlert(linkId)}
          className="mt-2 block w-full truncate rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-left font-mono text-sm font-bold text-amber-950 underline-offset-2 hover:underline"
        >
          {linkId}
        </button>
      ) : null}
      <p className="mt-3 text-sm text-slate-800">
        Penalty grounds: same as your open gap on {linkId ?? '—'}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        Recommended action: run a self-assessment against the linked obligation and document the outcome.
      </p>
    </div>
  );
}

function C2DraftPanel({ alert }: { alert: RegAlertRecord }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Change Composition</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <span className="text-[40px] font-bold leading-none tabular-nums text-slate-300">0</span>
          <div className="mt-1 text-sm font-medium text-slate-500">Atomic obligations extracted</div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            No binding obligations yet — obligations will be extracted only after the final direction is issued.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <div className="text-sm font-bold text-slate-800">Consultation Response Status</div>
          <p className="mt-2 text-sm text-slate-600">No response drafted</p>
          {alert.consultation_deadline ? (
            <p className="mt-1 text-xs text-slate-500">
              Deadline {formatDate(alert.consultation_deadline)} · {daysFromToday(alert.consultation_deadline)} days
              left
            </p>
          ) : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <div className="text-sm font-bold text-slate-800">Response</div>
          <button
            type="button"
            className="mt-3 rounded-md border border-sky-500 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-sky-800 shadow-sm hover:bg-sky-50"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('[RegIntel] Draft Response (placeholder)');
            }}
          >
            Draft Response
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoneCSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 py-4" aria-busy="true" aria-label="Loading alert details">
      <div className="h-32 rounded-xl bg-slate-100" />
      <div className="h-28 rounded-lg bg-slate-100" />
      <div className="h-48 rounded-lg bg-slate-100" />
    </div>
  );
}

export function RegIntelZoneC({
  alert: selectedAlert,
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
  dataReady = true,
  scrollMode = 'document',
  onOpenSourceDocumentForAlert,
  metricsDrawerOpen,
  onMetricsDrawerOpenChange,
  onCloseDetail,
}: {
  alert: RegAlertRecord;
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
  dataReady?: boolean;
  /** `document`: flows with page scroll (desktop inbox). `pane`: inner scroll + pinned footer (mobile sheet). */
  scrollMode?: 'document' | 'pane';
  /** Opens Source Document drawer for the alert currently shown in Zone C. */
  onOpenSourceDocumentForAlert?: (highlightAnchor: string | null) => void;
  /** Pass 7 — lifted so parent can close CCO metrics on Escape before clearing selection. */
  metricsDrawerOpen: boolean;
  onMetricsDrawerOpenChange: (open: boolean) => void;
  /** Desktop: clears selection and returns to full-width inbox. Omitted in mobile sheet (sheet supplies its own close). */
  onCloseDetail?: () => void;
}) {
  const [rendered, setRendered] = useState(selectedAlert);
  const [opacity, setOpacity] = useState(1);
  const renderedIdRef = useRef(rendered.id);
  const obligationRowRefs = useRef<Record<string, HTMLElement | null>>({});
  const detailScrollRef = useRef<HTMLDivElement | null>(null);
  renderedIdRef.current = rendered.id;

  const pane = scrollMode === 'pane';
  useLayoutEffect(() => {
    if (!pane) return;
    const el = detailScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [rendered.id, pane, dataReady]);

  useEffect(() => {
    if (selectedAlert.id === renderedIdRef.current) return;
    setOpacity(0);
    const t = window.setTimeout(() => {
      setRendered(selectedAlert);
      renderedIdRef.current = selectedAlert.id;
      window.requestAnimationFrame(() => setOpacity(1));
    }, 100);
    return () => window.clearTimeout(t);
  }, [selectedAlert]);

  const alert = rendered;

  const c1 = alert.is_peer_signal ? (
    <C1HeaderPeer alert={alert} />
  ) : alert.instrument_type === 'DRAFT DIRECTION' ? (
    <C1HeaderDraft alert={alert} />
  ) : (
    <C1HeaderStandard alert={alert} />
  );

  const c2 = alert.is_peer_signal ? (
    <C2PeerPanel alert={alert} onSelectLinkedAlert={onSelectLinkedAlert} />
  ) : alert.instrument_type === 'DRAFT DIRECTION' ? (
    <C2DraftPanel alert={alert} />
  ) : (
    <C2CompositionStandard
      alert={alert}
      expandedObligationId={expandedObligationId}
      setExpandedObligationId={setExpandedObligationId}
    />
  );

  const opacityStyle = {
    opacity,
    transitionDuration: opacity === 0 ? '100ms' : '150ms',
  } as const;

  const actionBar = (
    <RegIntelZoneCActionBar
      alert={alert}
      updateAlert={updateAlert}
      certifiedAtByAlertId={certifiedAtByAlertId}
      setCertifiedAtByAlertId={setCertifiedAtByAlertId}
      onViewSourceDocument={() => onOpenSourceDocumentForAlert?.(null)}
    />
  );

  const middleBlock = (
    <RegIntelZoneCMiddle
      alert={alert}
      sourceHex={sourceHex(alert)}
      expandedObligationId={expandedObligationId}
      setExpandedObligationId={setExpandedObligationId}
      onSelectLinkedAlert={onSelectLinkedAlert}
      updateAlert={updateAlert}
      narrativeOverride={narrativeOverrides[alert.id]}
      setNarrativeOverride={setNarrativeOverride}
      narrativeEditedMap={narrativeEditedMap}
      setNarrativeEditedMap={setNarrativeEditedMap}
      obligationRowRefs={obligationRowRefs}
      onOpenSourceDocument={onOpenSourceDocumentForAlert}
    />
  );

  return (
    <div
      className={`ori-reg-intel-zone-c-slide-enter flex w-full min-w-0 flex-col ${
        pane ? 'h-full min-h-0 flex-1 overflow-hidden' : 'max-w-full min-h-0 flex-1 overflow-x-hidden'
      }`}
    >
      <header className="flex w-full shrink-0 items-center justify-end gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-3"
          aria-label="Open CCO metrics quick view"
          onClick={() => onMetricsDrawerOpenChange(true)}
        >
          <BarChart2 className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
          <span className="text-xs font-semibold tracking-tight">Metrics</span>
        </button>
        {onCloseDetail ? (
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Close alert detail"
            onClick={onCloseDetail}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
      </header>
      <RegIntelCCOMetricsDrawer
        open={metricsDrawerOpen}
        onClose={() => onMetricsDrawerOpenChange(false)}
        kpiSummary={kpiSummary}
        alerts={allAlerts}
      />
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col transition-opacity duration-150 ease-out ${
          pane ? 'min-h-0 overflow-hidden' : ''
        }`}
        style={opacityStyle}
      >
        {!dataReady ? (
          <div
            ref={pane ? detailScrollRef : undefined}
            className={`min-h-0 min-w-0 flex-1 px-5 py-4 ${pane ? 'overflow-y-auto overscroll-y-contain' : ''}`}
          >
            <ZoneCSkeleton />
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-100" aria-hidden />
            </div>
          </div>
        ) : pane ? (
          <div
            ref={detailScrollRef}
            className="min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 pt-4 pb-8"
          >
            <div className="border-b border-slate-200/90 pb-6">{c1}</div>
            <div className="border-b border-slate-200/90 pb-6 pt-6">{c2}</div>
            <div className="pt-6">{middleBlock}</div>
            <div className="mt-8 border-t border-slate-200 pt-6">{actionBar}</div>
          </div>
        ) : (
          <div className="min-w-0 flex-1 px-6 py-5 sm:px-7 sm:py-6">
            <div className="border-b border-slate-200/90 pb-6">{c1}</div>
            <div className="border-b border-slate-200/90 pb-6 pt-6">{c2}</div>
            <div className="pt-6">{middleBlock}</div>
            <div className="mt-8 border-t border-slate-200 pt-6">{actionBar}</div>
          </div>
        )}
      </div>
    </div>
  );
}
