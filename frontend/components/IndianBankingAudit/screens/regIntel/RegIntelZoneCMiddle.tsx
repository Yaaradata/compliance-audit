'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CoverageStatus, ObligationRecord, RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';
import { REG_INTEL_HELP } from './regIntelHelpCopy';
import { RegIntelHelpTip } from './RegIntelHelpTip';
import { useRegIntelToast } from './RegIntelToasts';

const COVERAGE_CHIP: Record<
  CoverageStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  uncovered: { label: 'UNCOVERED', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  partial: { label: 'PARTIAL', bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  covered: { label: 'COVERED', bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  unknown: { label: 'UNKNOWN', bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
};

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

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function daysFromToday(isoDate: string): number {
  const end = new Date(isoDate + 'T12:00:00');
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/** Map [Pack §a.b] → obligation index (b is 1-based per Pass 6 spec: §2.1 → first). */
export function citationPackToObligationIndex(ref: string, obligationCount: number): number {
  const parts = ref.split('.');
  const last = parts[parts.length - 1];
  const n = parseInt(last, 10);
  if (Number.isNaN(n) || obligationCount <= 0) return 0;
  return Math.min(Math.max(n - 1, 0), obligationCount - 1);
}

function resolveObligationFromCite(citeRef: string, obligations: ObligationRecord[]): ObligationRecord | undefined {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  const cr = norm(citeRef);
  for (const o of obligations) {
    const cp = norm(o.cited_paragraph);
    if (cp === cr) return o;
    if (cp === norm(`Para ${cr}`)) return o;
    const cpTail = cp.replace(/^para\s+/i, '');
    const crTail = cr.replace(/^para\s+/i, '');
    if (cpTail === crTail) return o;
  }
  if (!obligations.length) return undefined;
  const idx = citationPackToObligationIndex(citeRef, obligations.length);
  return obligations[idx];
}

function buildNarrativeHtml(plain: string): string {
  return plain.split(/(\[Pack §[^\]]+\])/g).map((part) => {
    const m = part.match(/^\[Pack §([^\]]+)\]$/);
    if (m) {
      const cite = m[1];
      return `<span class="ori-reg-intel-cite-chip inline-flex cursor-pointer align-super text-[10px] font-bold leading-none text-indigo-700 hover:text-indigo-900" data-cite="${escapeAttr(cite)}" contenteditable="false">§${escapeHtml(cite)}</span>`;
    }
    return escapeHtml(part).replace(/\n/g, '<br/>');
  }).join('');
}

function serializeNarrativeEl(root: HTMLElement): string {
  let out = '';
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains('ori-reg-intel-cite-chip')) {
        const cite = el.dataset.cite ?? '';
        out += `[Pack §${cite}]`;
        return;
      }
      if (el.tagName === 'BR') {
        out += '\n';
        return;
      }
      el.childNodes.forEach(walk);
    }
  };
  root.childNodes.forEach(walk);
  return out;
}

function confidenceClass(n: number): string {
  if (n >= 85) return 'text-emerald-700';
  if (n >= 70) return 'text-amber-700';
  return 'text-rose-700';
}

function cesBadgeClass(ces: number): string {
  if (ces >= 80) return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (ces >= 60) return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-rose-300 bg-rose-50 text-rose-900';
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 2h4v4M14 2L8 8M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={`${className ?? ''} shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoBannerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ''}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function avgConfidence(obligations: ObligationRecord[]): number {
  if (!obligations.length) return 0;
  return Math.round(obligations.reduce((s, o) => s + o.confidence, 0) / obligations.length);
}

export function RegIntelZoneCMiddle({
  alert,
  sourceHex: accent,
  expandedObligationId,
  setExpandedObligationId,
  onSelectLinkedAlert,
  updateAlert,
  narrativeOverride,
  setNarrativeOverride,
  narrativeEditedMap,
  setNarrativeEditedMap,
  obligationRowRefs,
  onOpenSourceDocument,
}: {
  alert: RegAlertRecord;
  sourceHex: string;
  expandedObligationId: string | null;
  setExpandedObligationId: (id: string | null) => void;
  onSelectLinkedAlert: (id: string) => void;
  updateAlert: (alertId: string, updater: (a: RegAlertRecord) => RegAlertRecord) => void;
  narrativeOverride: string | undefined;
  setNarrativeOverride: (alertId: string, text: string | null) => void;
  narrativeEditedMap: Record<string, boolean>;
  setNarrativeEditedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  obligationRowRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  /** Opens in-app Source Document drawer; `highlightAnchor` matches `cited_paragraph` / source body anchors. */
  onOpenSourceDocument?: (highlightAnchor: string | null) => void;
}) {
  const { pushToast } = useRegIntelToast();
  const [flashApproveId, setFlashApproveId] = useState<string | null>(null);
  const [citationHighlightId, setCitationHighlightId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [narrativeFocused, setNarrativeFocused] = useState(false);

  useEffect(() => {
    if (!expandedObligationId) return;
    const id = window.requestAnimationFrame(() => {
      obligationRowRefs.current[expandedObligationId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [expandedObligationId, alert.id]);

  const effectiveNarrative = narrativeOverride ?? alert.ai_narrative;
  const isEdited = !!narrativeEditedMap[alert.id];

  const scrollToObligation = useCallback(
    (oblId: string) => {
      setExpandedObligationId(oblId);
      window.requestAnimationFrame(() => {
        const el = obligationRowRefs.current[oblId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        setCitationHighlightId(oblId);
        window.setTimeout(() => setCitationHighlightId(null), 1200);
      });
    },
    [obligationRowRefs, setExpandedObligationId]
  );

  const onCitationRef = useCallback(
    (citeRef: string) => {
      const obl = resolveObligationFromCite(citeRef, alert.obligations);
      if (obl) {
        scrollToObligation(obl.id);
        onOpenSourceDocument?.(obl.cited_paragraph);
      } else {
        onOpenSourceDocument?.(citeRef);
      }
    },
    [alert.obligations, onOpenSourceDocument, scrollToObligation]
  );

  const narrativeEditorRef = useRef<HTMLDivElement>(null);
  const narrativePlainRef = useRef(effectiveNarrative);
  const lastAppliedHtml = useRef('');

  useLayoutEffect(() => {
    narrativePlainRef.current = effectiveNarrative;
  }, [effectiveNarrative, alert.id]);

  useLayoutEffect(() => {
    const el = narrativeEditorRef.current;
    if (!el || document.activeElement === el) return;
    const html = buildNarrativeHtml(effectiveNarrative);
    if (html !== lastAppliedHtml.current) {
      el.innerHTML = html;
      lastAppliedHtml.current = html;
    }
  }, [effectiveNarrative, alert.id, regenerating]);

  const onNarrativeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const t = (e.target as HTMLElement).closest('[data-cite]') as HTMLElement | null;
      if (t?.dataset.cite) {
        e.preventDefault();
        onCitationRef(t.dataset.cite);
      }
    },
    [onCitationRef]
  );

  const onNarrativeInput = useCallback(() => {
    const el = narrativeEditorRef.current;
    if (!el) return;
    const plain = serializeNarrativeEl(el);
    narrativePlainRef.current = plain;
    setNarrativeOverride(alert.id, plain);
    if (plain !== alert.ai_narrative) {
      setNarrativeEditedMap((m) => ({ ...m, [alert.id]: true }));
    } else {
      setNarrativeEditedMap((m) => {
        const n = { ...m };
        delete n[alert.id];
        return n;
      });
    }
  }, [alert.ai_narrative, alert.id, setNarrativeEditedMap, setNarrativeOverride]);

  const onApproveObligation = useCallback(
    (obl: ObligationRecord) => {
      updateAlert(alert.id, (a) => ({
        ...a,
        obligations_pending_hitl: Math.max(0, a.obligations_pending_hitl - 1),
        obligations_approved: a.obligations_approved + 1,
        obligations: a.obligations.map((o) =>
          o.id === obl.id
            ? {
                ...o,
                hitl_status: 'approved' as const,
                reviewer: 'Compliance Officer',
                reviewed_at: new Date().toISOString(),
              }
            : o
        ),
      }));
      setFlashApproveId(obl.id);
      window.setTimeout(() => setFlashApproveId(null), 800);
      pushToast({ type: 'success', message: `${obl.id} approved and committed` });
    },
    [alert.id, pushToast, updateAlert]
  );

  const onRejectObligation = useCallback(
    (obl: ObligationRecord) => {
      updateAlert(alert.id, (a) => ({
        ...a,
        obligations_pending_hitl: Math.max(0, a.obligations_pending_hitl - 1),
        obligations: a.obligations.map((o) =>
          o.id === obl.id ? { ...o, hitl_status: 'rejected' as const } : o
        ),
      }));
      pushToast({ type: 'info', message: `${obl.id} flagged for ORM analyst review` });
    },
    [alert.id, pushToast, updateAlert]
  );

  const c3Peer = (
    <section className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-sm text-slate-700">
      <p className="font-medium text-slate-900">
        No obligations extracted — peer enforcement signals are intelligence, not binding instruments.
      </p>
      <p className="mt-2">
        Recommended: run a self-assessment against{' '}
        {alert.peer_similar_to ? (
          <button
            type="button"
            className="font-mono font-semibold text-indigo-700 underline-offset-2 hover:underline"
            onClick={() => onSelectLinkedAlert(alert.peer_similar_to!)}
          >
            {alert.peer_similar_to}
          </button>
        ) : (
          'the linked alert'
        )}
        .
      </p>
    </section>
  );

  const needsObligationExtractionSpinner =
    !alert.is_peer_signal &&
    alert.instrument_type !== 'DRAFT DIRECTION' &&
    alert.obligations_total === 0;

  const c3Processing = (
    <section
      className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-10 text-center"
      aria-busy="true"
      aria-label="Obligations processing"
    >
      <Spinner className="h-10 w-10 text-indigo-600" />
      <p className="mt-4 max-w-md text-sm font-medium text-slate-800">
        No obligations extracted yet — the ORM analyst is processing this document.
      </p>
    </section>
  );

  const c3Draft = (
    <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <h3 className="text-base font-bold text-slate-900">Consultation Period Active</h3>
      <p className="mt-2 text-sm text-slate-700">
        No binding obligations are extracted from drafts. The bank should review the draft and consider submitting a
        response.
      </p>
      {alert.consultation_deadline ? (
        <p className="mt-2 text-sm font-semibold text-sky-950">
          Response due in {daysFromToday(alert.consultation_deadline)} days — {formatDate(alert.consultation_deadline)}
        </p>
      ) : null}
    </section>
  );

  const c3Standard = (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">Obligations Extracted — AI Draft</h3>
        <span className="inline-flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-900">
            AI · {avgConfidence(alert.obligations)}% confidence
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            HITL
            <RegIntelHelpTip text={REG_INTEL_HELP.hitlStatus} label="HITL status help" align="end" />
          </span>
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        AI-extracted with per-obligation citations · model {alert.ai_model}
      </p>
      <ul className="mt-4 space-y-2">
        {alert.obligations.map((obl) => {
          const cov = COVERAGE_CHIP[obl.coverage_status];
          const expanded = expandedObligationId === obl.id;
          const hex = accent;
          return (
            <li
              key={obl.id}
              ref={(el) => {
                obligationRowRefs.current[obl.id] = el;
              }}
              className={`overflow-hidden rounded-lg border border-slate-200 transition-shadow ${
                flashApproveId === obl.id ? 'ori-reg-intel-obligation-approve-flash' : ''
              } ${citationHighlightId === obl.id ? 'ori-reg-intel-obligation-cite-highlight' : ''}`}
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`obligation-detail-${obl.id}`}
                id={`obligation-row-${obl.id}`}
                aria-label={`${obl.id}, ${cov.label} coverage, ${obl.hitl_status} HITL. ${expanded ? 'Expanded' : 'Collapsed'}. Press Space to toggle.`}
                onClick={() => setExpandedObligationId(expanded ? null : obl.id)}
                className="flex min-h-[44px] w-full items-center gap-2 bg-slate-50/80 px-3 py-2.5 text-left hover:bg-slate-100/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-800">
                  {obl.id}
                </span>
                <span
                  className="rounded border px-1.5 py-0.5 text-[9px] font-bold"
                  style={{ backgroundColor: cov.bg, color: cov.text, borderColor: cov.border }}
                >
                  {cov.label}
                </span>
                {obl.hitl_status === 'pending' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-950">
                    <span className="ori-reg-intel-hitl-pending-dot h-1.5 w-1.5 rounded-full bg-amber-500" />
                    PENDING REVIEW
                  </span>
                ) : obl.hitl_status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                    <CheckIcon className="h-3 w-3" />
                    APPROVED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-900">
                    <XIcon className="h-3 w-3" />
                    REJECTED
                  </span>
                )}
                <span className={`ml-auto text-xs font-semibold tabular-nums ${confidenceClass(obl.confidence)}`}>
                  {obl.confidence}% confidence
                </span>
                <ChevronIcon expanded={expanded} className="text-slate-500" />
              </button>
              {expanded ? (
                <div
                  className="border-t border-slate-200 bg-white px-3 py-3"
                  id={`obligation-detail-${obl.id}`}
                  role="region"
                  aria-labelledby={`obligation-row-${obl.id}`}
                >
                  <blockquote
                    className="rounded-r-md py-4 pl-4 pr-3 text-sm italic leading-relaxed text-slate-800"
                    style={{
                      backgroundColor: '#F0F7FF',
                      borderLeft: `3px solid ${hex}`,
                    }}
                  >
                    {obl.text}
                  </blockquote>
                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="space-y-1 text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">Domain:</span> {obl.domain}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Effective:</span> {formatDate(obl.effective_date)}
                      </div>
                    </div>
                    <div className="space-y-2 text-slate-600">
                      {obl.linked_controls.length > 0 ? (
                        <div>
                          <span className="font-semibold text-slate-700">Covered by:</span>{' '}
                          <span className="mt-1 inline-flex flex-wrap items-center gap-1">
                            {obl.linked_controls.map((c) => (
                              <span
                                key={c}
                                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${cesBadgeClass(obl.linked_control_ces ?? 0)}`}
                              >
                                {c}
                                <span className="rounded bg-white/80 px-1 text-[9px]">CES {obl.linked_control_ces ?? '—'}</span>
                              </span>
                            ))}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">No linked control — this obligation is uncovered.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {obl.hitl_status === 'approved' && obl.reviewer && obl.reviewed_at ? (
                      <span>
                        Reviewed by {obl.reviewer} on {formatDateTime(obl.reviewed_at)}
                      </span>
                    ) : obl.hitl_status === 'pending' ? (
                      <span>Awaiting HITL review by ORM analyst</span>
                    ) : (
                      <span>Rejected — ORM analyst follow-up</span>
                    )}
                  </div>
                  {obl.hitl_status === 'pending' ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onApproveObligation(obl)}
                        className="min-h-[44px] rounded-md border-2 border-emerald-600 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        aria-label={`Approve obligation ${obl.id}`}
                      >
                        ✓ Approve Obligation
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectObligation(obl)}
                        className="min-h-[44px] rounded-md border-2 border-rose-600 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        aria-label={`Reject or request edit for obligation ${obl.id}`}
                      >
                        ✗ Reject / Request Edit
                      </button>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenSourceDocument?.(obl.cited_paragraph)}
                      className="text-left text-xs font-semibold text-indigo-800 hover:underline"
                    >
                      Source: {alert.instrument_ref}
                    </button>
                    <a
                      href={alert.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      aria-label="Open original issuer page in new tab"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );

  const c3 = alert.is_peer_signal
    ? c3Peer
    : alert.instrument_type === 'DRAFT DIRECTION'
      ? c3Draft
      : needsObligationExtractionSpinner
        ? c3Processing
        : c3Standard;

  const c4 = (
    <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">Generated Narrative</h3>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isEdited ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
              Edited — Unsaved
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#4F46E5' }}>
              AI · {alert.ai_citations} CITATIONS
            </span>
            <RegIntelHelpTip text={REG_INTEL_HELP.aiCitations} label="AI citations help" align="end" />
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        AI-drafted with per-paragraph citations · model {alert.ai_model}
      </p>
      <div
        ref={narrativeEditorRef}
        contentEditable
        suppressContentEditableWarning
        onClick={onNarrativeClick}
        onInput={onNarrativeInput}
        onFocus={(e) => {
          setNarrativeFocused(true);
          e.currentTarget.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
        }}
        onBlur={(e) => {
          setNarrativeFocused(false);
          e.currentTarget.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
          onNarrativeInput();
        }}
        className="ori-reg-intel-narrative-editor mt-3 min-h-[min(12rem,28vh)] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 outline-none"
      />
      {narrativeFocused ? (
        <p className="mt-1 text-[11px] text-amber-800">Editing — changes not saved</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={regenerating}
          onClick={() => {
            setRegenerating(true);
            window.setTimeout(() => {
              setNarrativeOverride(alert.id, null);
              setNarrativeEditedMap((m) => {
                const n = { ...m };
                delete n[alert.id];
                return n;
              });
              narrativePlainRef.current = alert.ai_narrative;
              const el = narrativeEditorRef.current;
              if (el) {
                el.innerHTML = buildNarrativeHtml(alert.ai_narrative);
                lastAppliedHtml.current = el.innerHTML;
              }
              setRegenerating(false);
              pushToast({ type: 'info', message: 'Narrative regenerated' });
            }, 1500);
          }}
          className="inline-flex items-center gap-2 rounded-md border border-indigo-500 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 disabled:opacity-60"
        >
          {regenerating ? <Spinner className="h-4 w-4" /> : null}
          Regenerate Narrative
        </button>
        {isEdited ? (
          <button
            type="button"
            onClick={() => {
              setNarrativeOverride(alert.id, null);
              setNarrativeEditedMap((m) => {
                const n = { ...m };
                delete n[alert.id];
                return n;
              });
              narrativePlainRef.current = alert.ai_narrative;
              const el = narrativeEditorRef.current;
              if (el) {
                el.innerHTML = buildNarrativeHtml(alert.ai_narrative);
                lastAppliedHtml.current = el.innerHTML;
              }
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Edits
          </button>
        ) : null}
      </div>
    </section>
  );

  return (
    <div className="space-y-0">
      <div className="border-b border-slate-200/90 pb-5">{c3}</div>
      <div className="pt-5">{c4}</div>
    </div>
  );
}
