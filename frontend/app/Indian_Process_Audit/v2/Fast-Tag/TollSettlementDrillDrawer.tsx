'use client';

import { useEffect } from 'react';
import { AlertTriangle, ChevronRight, FileText, X } from 'lucide-react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import {
  drillSubtitle,
  drillTitle,
  getChargebackDrill,
  getMetricDrill,
  getPlazaBreakDrill,
  type TollDrillState,
} from './tollSettlementDrills';

type Props = {
  drill: TollDrillState;
  ft11Control?: AuditControl;
  onClose: () => void;
  onOpenEvidence?: (control: AuditControl, domainLabel: string) => void;
  onDrillPlazaBreak?: (id: string) => void;
  onDrillChargeback?: (id: string) => void;
};

function toneRowClass(tone?: 'ok' | 'warn' | 'bad') {
  if (tone === 'bad') return 'text-red-700';
  if (tone === 'warn') return 'text-amber-700';
  if (tone === 'ok') return 'text-emerald-700';
  return 'text-slate-800';
}

function MetricBody({ id }: { id: Parameters<typeof getMetricDrill>[0] }) {
  const d = getMetricDrill(id);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {d.kpis.map((k) => (
          <div key={k.label} className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k.label}</div>
            <div className="mt-1 text-base font-semibold tabular-nums text-slate-900">{k.value}</div>
            {k.hint ? <div className="mt-0.5 text-[10px] text-slate-500">{k.hint}</div> : null}
          </div>
        ))}
      </div>
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Auditor insights</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          {d.insights.map((line) => (
            <li key={line} className="flex gap-2 leading-relaxed">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </section>
      {d.rows?.length ? (
        <section>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Breakdown</h4>
          <div className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {d.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="text-slate-600">{r.label}</span>
                <span className={`font-medium tabular-nums ${toneRowClass(r.tone)}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PlazaBreakBody({
  id,
  onDrillChargeback,
}: {
  id: string;
  onDrillChargeback?: (id: string) => void;
}) {
  const d = getPlazaBreakDrill(id);
  if (!d) return <p className="text-sm text-slate-500">Break not found.</p>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-500">Break amount</div>
          <div className="mt-1 text-base font-semibold text-amber-800 tabular-nums">
            ₹{d.breakAmountInr.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-500">Wallet debit</div>
          <div className="mt-1 text-base font-semibold tabular-nums">
            ₹{d.walletDebitInr.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-500">Plaza file</div>
          <div className="mt-1 text-base font-semibold tabular-nums">
            ₹{d.plazaFileAmountInr.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-amber-50/60 px-3 py-2.5 text-sm text-amber-950 ring-1 ring-amber-200">
        <span className="font-semibold">Mismatch: </span>
        {d.mismatchReason}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Settlement date: </span>
          <span className="font-medium text-slate-800">{d.settlementDate}</span>
        </div>
        <div>
          <span className="text-slate-500">NPCI cycle: </span>
          <span className="font-medium text-slate-800">{d.npciCycle}</span>
        </div>
        <div>
          <span className="text-slate-500">Owner: </span>
          <span className="font-medium text-slate-800">{d.owner}</span>
        </div>
        <div>
          <span className="text-slate-500">Age: </span>
          <span className="font-medium text-slate-800">{d.ageDays}d</span>
        </div>
      </div>
      {d.linkedChargebackId && onDrillChargeback ? (
        <button
          type="button"
          onClick={() => onDrillChargeback(d.linkedChargebackId!)}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          Linked chargeback {d.linkedChargebackId}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Timeline</h4>
        <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
          {d.timeline.map((ev) => (
            <li key={`${ev.at}-${ev.event}`} className="relative text-sm">
              <span className="absolute -left-[1.15rem] top-1.5 h-2 w-2 rounded-full bg-slate-400" aria-hidden />
              <div className="text-[10px] font-semibold text-slate-500">
                {ev.at} · {ev.actor}
              </div>
              <div className="text-slate-800">{ev.event}</div>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Audit insights
        </h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {d.auditInsights.map((line) => (
            <li key={line} className="leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Source systems</h4>
        <div className="space-y-2">
          {d.sourceSystems.map((s) => (
            <div key={s.name} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-200">
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-800">{s.name}</div>
                <div className="text-slate-600">{s.record}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChargebackBody({
  id,
  onDrillPlazaBreak,
}: {
  id: string;
  onDrillPlazaBreak?: (id: string) => void;
}) {
  const d = getChargebackDrill(id);
  if (!d) return <p className="text-sm text-slate-500">Chargeback not found.</p>;
  const tatBreached = d.ageDays > d.networkTatDays;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <div className="text-[10px] font-bold uppercase text-slate-500">Amount</div>
          <div className="mt-1 text-base font-semibold tabular-nums">
            ₹{d.tollDebitInr.toLocaleString('en-IN')}
          </div>
        </div>
        <div className={`rounded-lg px-3 py-2.5 ring-1 ${tatBreached ? 'bg-red-50 ring-red-200' : 'bg-slate-50 ring-slate-200'}`}>
          <div className="text-[10px] font-bold uppercase text-slate-500">Age / TAT</div>
          <div className={`mt-1 text-base font-semibold tabular-nums ${tatBreached ? 'text-red-700' : 'text-slate-900'}`}>
            {d.ageDays}d / {d.networkTatDays}d
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 col-span-2">
          <div className="text-[10px] font-bold uppercase text-slate-500">Reason</div>
          <div className="mt-1 text-sm font-medium text-slate-800">{d.reason}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Tag: </span>
          <span className="font-mono font-medium text-slate-800">{d.tagId}</span>
        </div>
        <div>
          <span className="text-slate-500">Raised: </span>
          <span className="font-medium text-slate-800">{d.raisedOn}</span>
        </div>
      </div>
      {d.relatedPlazaBreakId && onDrillPlazaBreak ? (
        <button
          type="button"
          onClick={() => onDrillPlazaBreak(d.relatedPlazaBreakId!)}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          Linked plaza break {d.relatedPlazaBreakId}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Dispute timeline</h4>
        <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
          {d.timeline.map((ev) => (
            <li key={`${ev.at}-${ev.event}`} className="relative text-sm">
              <span className="absolute -left-[1.15rem] top-1.5 h-2 w-2 rounded-full bg-slate-400" aria-hidden />
              <div className="text-[10px] font-semibold text-slate-500">
                {ev.at} · {ev.actor}
              </div>
              <div className="text-slate-800">{ev.event}</div>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Documents</h4>
        <div className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
          {d.documents.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-slate-700">{doc.name}</span>
              <span
                className={`text-[10px] font-semibold uppercase ${doc.status === 'available' ? 'text-emerald-700' : 'text-red-700'}`}
              >
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Audit insights</h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {d.auditInsights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function TollSettlementDrillDrawer({
  drill,
  ft11Control,
  onClose,
  onOpenEvidence,
  onDrillPlazaBreak,
  onDrillChargeback,
}: Props) {
  useEffect(() => {
    if (!drill) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drill, onClose]);

  if (!drill) return null;

  const title = drillTitle(drill);
  const subtitle = drillSubtitle(drill);

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="toll-drill-title">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Toll settlement drill-down · FT-11
              </p>
              <h2 id="toll-drill-title" className="mt-1 text-base font-semibold leading-snug text-slate-900">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-xs text-slate-600">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close drill-down"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {ft11Control && onOpenEvidence ? (
            <button
              type="button"
              onClick={() => onOpenEvidence(ft11Control, 'Fast-Tag')}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Open FT-11 evidence pack
            </button>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {drill.kind === 'metric' && <MetricBody id={drill.id} />}
          {drill.kind === 'plaza-break' && (
            <PlazaBreakBody id={drill.id} onDrillChargeback={onDrillChargeback} />
          )}
          {drill.kind === 'chargeback' && (
            <ChargebackBody id={drill.id} onDrillPlazaBreak={onDrillPlazaBreak} />
          )}
        </div>
        <div className="border-t border-slate-200 px-6 py-3 text-[11px] text-slate-500">
          Click table rows or KPI cards for detail · Esc to close
        </div>
      </aside>
    </div>
  );
}
