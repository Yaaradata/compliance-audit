'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';
import { getSourceDocumentByRef } from '@/lib/IndianBankingAudit/regIntelSourceDocuments';
import { ORI_ROUTES, REG_INTEL_ROUTES } from './regIntelPaths';
import { useRegIntelToast } from './RegIntelToasts';

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

function InfoBannerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ViewSourceDocumentButton({
  alert,
  onViewSourceDocument,
}: {
  alert: RegAlertRecord;
  onViewSourceDocument?: () => void;
}) {
  if (!onViewSourceDocument || !getSourceDocumentByRef(alert.instrument_ref)) return null;
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={onViewSourceDocument}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <FileText className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
        View Source Document
      </button>
    </div>
  );
}

export function RegIntelZoneCActionBar({
  alert,
  updateAlert,
  certifiedAtByAlertId,
  setCertifiedAtByAlertId,
  onViewSourceDocument,
}: {
  alert: RegAlertRecord;
  updateAlert: (alertId: string, updater: (a: RegAlertRecord) => RegAlertRecord) => void;
  certifiedAtByAlertId: Record<string, string>;
  setCertifiedAtByAlertId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onViewSourceDocument?: () => void;
}) {
  const { pushToast } = useRegIntelToast();
  const [showCertifyCelebration, setShowCertifyCelebration] = useState(false);

  const nowIso = () => new Date().toISOString();

  if (alert.is_peer_signal && alert.stage !== 'closed') {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={REG_INTEL_ROUTES.rcsaWorkspace}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-indigo-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Run Self-Assessment
          </Link>
          <button
            type="button"
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              const ts = nowIso();
              updateAlert(alert.id, (a) => ({ ...a, stage: 'closed', stage_index: 5 }));
              setCertifiedAtByAlertId((m) => ({ ...m, [alert.id]: ts }));
              pushToast({ type: 'success', message: 'Peer signal marked as reviewed.' });
            }}
          >
            Mark as Reviewed
          </button>
        </div>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.instrument_type === 'DRAFT DIRECTION') {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-[44px] rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => pushToast({ type: 'success', message: 'Consultation response saved.' })}
          >
            Submit Consultation Response
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => pushToast({ type: 'info', message: 'Marked as monitored.' })}
          >
            Mark as Monitored
          </button>
        </div>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'closed') {
    const when = certifiedAtByAlertId[alert.id]
      ? formatDateTime(certifiedAtByAlertId[alert.id])
      : formatDateTime(nowIso());
    return (
      <>
        <div className="text-sm text-slate-700">
          <p>Certified by Compliance Officer on {when}. This regulatory change is in the audit trail.</p>
          <button type="button" className="mt-2 text-sm font-semibold text-indigo-700 hover:underline">
            View Full Audit Trail
          </button>
        </div>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'acknowledge') {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-[44px] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style={{ backgroundColor: '#1F4E79' }}
            onClick={() => {
              updateAlert(alert.id, (a) => ({ ...a, stage: 'assess', stage_index: 2 }));
              pushToast({ type: 'success', message: 'Acknowledged — advanced to Assess stage' });
            }}
          >
            Acknowledge &amp; Classify
          </button>
          <button
            type="button"
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => pushToast({ type: 'info', message: 'Marked as advisory only (demo).' })}
          >
            Mark as Advisory Only
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Acknowledging moves this alert to Stage 2 (Assess) and notifies the Head of ORM.
        </p>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'assess') {
    const disabled = alert.obligations_pending_hitl > 0;
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <span
            className={disabled ? 'inline-block' : ''}
            title={disabled ? 'Approve all pending obligations above before proceeding to Stage 3.' : undefined}
          >
            <button
              type="button"
              disabled={disabled}
              className="min-h-[44px] w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              onClick={() => {
                updateAlert(alert.id, (a) => ({ ...a, stage: 'assign', stage_index: 3 }));
                pushToast({ type: 'success', message: 'Obligation set approved — advanced to Assign stage' });
              }}
            >
              Approve Obligation Set
            </button>
          </span>
          <button
            type="button"
            className="min-h-[44px] rounded-lg border border-slate-400 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => pushToast({ type: 'info', message: 'Information request sent (demo).' })}
          >
            Request More Information
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Approving the obligation set commits all obligations to the Coverage Map and advances to Stage 3 (Assign).
        </p>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'assign') {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-[44px] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              const n = alert.uncovered_count + alert.partial_count;
              updateAlert(alert.id, (a) => ({
                ...a,
                pas_created: n,
                stage: 'implement',
                stage_index: 4,
              }));
              pushToast({ type: 'success', message: `${n} PAs created — advanced to Implement stage` });
            }}
          >
            Create Preventive Actions
          </button>
          <Link
            href={REG_INTEL_ROUTES.issuesBoard}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
          >
            View in Issues Board
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">Creating PAs links them to the obligations and notifies owners.</p>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'implement') {
    return (
      <>
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950">
          <InfoBannerIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
          <p>
            Implementation is in progress. The 1LoD control owners are updating controls and 2LoD is testing. Return
            here when control tests pass to certify.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={(() => {
              // Deep-link to the most-relevant control for this alert: prefer the
              // control linked to a `partial`-coverage obligation; otherwise first.
              const partial = alert.obligations.find(
                (o) => o.coverage_status === 'partial' && o.linked_controls.length > 0
              );
              const anyLinked = alert.obligations.find((o) => o.linked_controls.length > 0);
              const ctrlId = (partial ?? anyLinked)?.linked_controls[0];
              return ctrlId
                ? ORI_ROUTES.controlTestingForControl(ctrlId)
                : REG_INTEL_ROUTES.controlTesting;
            })()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-indigo-600 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Check Control Test Result
          </Link>
          <Link
            href={REG_INTEL_ROUTES.evidenceWorkbench}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View Evidence Workbench
          </Link>
        </div>
        <button
          type="button"
          className="mt-3 min-h-[44px] text-sm font-medium text-indigo-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            updateAlert(alert.id, (a) => ({ ...a, stage: 'certify', stage_index: 5 }));
            pushToast({ type: 'success', message: 'Implementation marked complete — advance to Certify.' });
          }}
        >
          Mark Implementation Complete
        </button>
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  if (alert.stage === 'certify') {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              const ts = nowIso();
              updateAlert(alert.id, (a) => ({ ...a, stage: 'closed', stage_index: 5 }));
              setCertifiedAtByAlertId((m) => ({ ...m, [alert.id]: ts }));
              setShowCertifyCelebration(true);
              window.setTimeout(() => setShowCertifyCelebration(false), 2200);
              pushToast({
                type: 'success',
                message: `Certified. SAES record updated for ${alert.accountable_sm}.`,
              });
            }}
          >
            <CheckIcon className="h-4 w-4 text-white" />
            Sign &amp; Certify Closure
          </button>
          <Link
            href={REG_INTEL_ROUTES.inspectionReadiness}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Open Inspection Pack
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Certification requires your Senior Manager attestation. This action is logged in the Senior Accountability
          Ledger (SAES) and is irreversible.
        </p>
        {showCertifyCelebration ? (
          <div className="ori-reg-intel-certify-overlay pointer-events-none fixed inset-0 z-[8000] flex items-start justify-center pt-24">
            <div className="ori-reg-intel-certify-burst rounded-full bg-emerald-500/90 px-6 py-3 text-lg font-bold text-white shadow-xl">
              CERTIFIED CLOSED ✓
            </div>
          </div>
        ) : null}
        <ViewSourceDocumentButton alert={alert} onViewSourceDocument={onViewSourceDocument} />
      </>
    );
  }

  return null;
}
