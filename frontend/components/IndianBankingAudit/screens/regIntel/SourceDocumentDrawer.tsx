'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, X } from 'lucide-react';
import type { SyncSourceStatus } from '@/lib/IndianBankingAudit/regIntelMockData';
import { getSourceDocumentByRef, type SourceAuthorityEmblem } from '@/lib/IndianBankingAudit/regIntelSourceDocuments';
import { getSourceColor } from './regIntelSourceColors';
import { AuthorityEmblemFor } from './AuthorityEmblems';
import { REG_INTEL_ROUTES } from './regIntelPaths';

export interface SourceDocumentDrawerProps {
  isOpen: boolean;
  instrumentRef: string | null;
  highlightAnchor?: string | null;
  onClose: () => void;
  /** Pass 5 — global demo sync animation. */
  isGlobalSyncing?: boolean;
  /** When true, header sync dot is neutral grey when idle (e.g. peer emblem). */
  syncStripNeutral?: boolean;
  /** Per-source effective status from inbox sync state (ignored when neutral and not global syncing). */
  regulatorSyncStatus?: SyncSourceStatus | null;
}

type DocTab = 'document' | 'provisions' | 'annexures' | 'metadata';

function displayHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'issuer site';
  }
}

function formatSynced(iso: string): string {
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

function accentForEmblem(kind: SourceAuthorityEmblem): string {
  return getSourceColor(kind === 'PEER' ? 'PEER' : kind);
}

function DrawerHeaderSyncDot({
  isGlobalSyncing,
  neutral,
  regulatorStatus,
}: {
  isGlobalSyncing: boolean;
  neutral: boolean;
  regulatorStatus: SyncSourceStatus | null;
}) {
  if (isGlobalSyncing) {
    return (
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-sky-500" />
        <Loader2 className="absolute h-3.5 w-3.5 animate-spin text-sky-600" />
      </span>
    );
  }
  if (neutral) {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400" aria-hidden />;
  }
  const s = regulatorStatus ?? 'fresh';
  const dot =
    s === 'fresh'
      ? 'bg-emerald-500'
      : s === 'stale'
        ? 'bg-amber-400'
        : s === 'error'
          ? 'bg-rose-500'
          : 'bg-emerald-500';
  return <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />;
}

export function SourceDocumentDrawer({
  isOpen,
  instrumentRef,
  highlightAnchor,
  onClose,
  isGlobalSyncing = false,
  syncStripNeutral = true,
  regulatorSyncStatus = null,
}: SourceDocumentDrawerProps) {
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<DocTab>('document');
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const highlightRunRef = useRef(0);

  const doc = instrumentRef ? getSourceDocumentByRef(instrumentRef) : undefined;

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightAnchor) setTab('document');
  }, [isOpen, instrumentRef, highlightAnchor]);

  useEffect(() => {
    if (!isOpen || !doc || !highlightAnchor || tab !== 'document') return;
    const run = ++highlightRunRef.current;
    const t = window.setTimeout(() => {
      if (highlightRunRef.current !== run) return;
      const root = bodyScrollRef.current;
      if (!root) return;
      const esc =
        typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
          ? CSS.escape(highlightAnchor)
          : highlightAnchor.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const el = root.querySelector(`[data-source-anchor="${esc}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ori-reg-intel-cite-highlight');
        window.setTimeout(() => {
          el.classList.remove('ori-reg-intel-cite-highlight');
        }, 1200);
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [isOpen, doc, highlightAnchor, tab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !instrumentRef) return null;

  if (!doc) {
    return (
      <div
        className="fixed inset-0 z-[8500] flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-intel-source-doc-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/35 transition-opacity duration-200"
          style={{ opacity: entered ? 1 : 0 }}
          aria-label="Close source document"
          onClick={onClose}
        />
        <div
          className="relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-[250ms] ease-out md:max-w-[720px] md:shadow-[-8px_0_24px_rgba(15,23,42,0.12)]"
          style={{ transform: entered ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <span id="reg-intel-source-doc-title" className="text-sm font-semibold text-slate-800">
              Source document
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-600">
            No demo source body is catalogued for this instrument reference.
          </div>
        </div>
      </div>
    );
  }

  const host = displayHost(doc.source_url);
  const accent = accentForEmblem(doc.authority_emblem);

  return (
    <div
      className="fixed inset-0 z-[8500] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-intel-source-doc-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/0 transition-colors duration-200"
        style={{ backgroundColor: entered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)' }}
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-[250ms] ease-out md:max-w-[720px] md:shadow-[-8px_0_24px_rgba(15,23,42,0.12)]"
        style={{ transform: entered ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <header className="shrink-0 border-b border-slate-200 bg-white px-6 pb-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <AuthorityEmblemFor kind={doc.authority_emblem} size={28} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                {doc.issuing_authority.split(',')[0]}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-2">
                <DrawerHeaderSyncDot
                  isGlobalSyncing={isGlobalSyncing}
                  neutral={syncStripNeutral}
                  regulatorStatus={regulatorSyncStatus}
                />
                <span className="rounded-full border border-emerald-500/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                  VERIFIED · synced from {host} on {formatSynced(doc.last_synced_at)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
          <h2 id="reg-intel-source-doc-title" className="mt-4 line-clamp-2 text-lg font-bold leading-snug md:text-xl" style={{ color: accent }}>
            {doc.title}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {doc.instrument_ref} · {doc.publication_date} · {doc.signatory_role} · {doc.signatory_name}
          </p>
          <nav className="mt-4 flex flex-wrap gap-4 border-b border-slate-100">
            {(
              [
                ['document', 'Document'],
                ['provisions', 'Key Provisions'],
                ['annexures', 'Annexures'],
                ['metadata', 'Metadata'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`border-b-2 pb-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  tab === id ? 'border-indigo-600 text-indigo-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div ref={bodyScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-6">
          {tab === 'document' ? (
            <div>
              {doc.body_paragraphs.map((p) => (
                <div key={p.anchor} className="mb-5" data-source-anchor={p.anchor}>
                  <div className="flex items-baseline gap-3">
                    <span className="mt-1 min-w-[5.5rem] font-mono text-xs font-semibold text-slate-400">{p.anchor}</span>
                    <p className="text-sm leading-relaxed text-slate-700">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {tab === 'provisions' ? (
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700">
              {doc.key_provisions.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ol>
          ) : null}
          {tab === 'annexures' ? (
            <div className="space-y-2">
              {doc.annexures.map((a) => (
                <div key={a.ref} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <FileText className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                  <div>
                    <div className="font-mono text-xs text-slate-500">{a.ref}</div>
                    <div className="text-sm text-slate-800">{a.title}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {tab === 'metadata' ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Applicability</dt>
              <dd className="mb-3 text-sm text-slate-800 sm:col-span-2">{doc.applicability_scope}</dd>
              {Object.entries(doc.metadata).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className="mb-3 text-sm text-slate-800">{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] text-slate-500">Source hash: {doc.source_hash}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={REG_INTEL_ROUTES.obligationCoverageForInstrument(doc.instrument_ref)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Open Obligation Map →
              </Link>
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Open original at {host} ↗
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
