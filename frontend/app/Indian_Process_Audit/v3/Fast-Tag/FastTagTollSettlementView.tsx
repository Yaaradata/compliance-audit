'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Eye, Landmark } from 'lucide-react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import TollSettlementDrillDrawer from './TollSettlementDrillDrawer';
import type { TollDrillState } from './tollSettlementDrills';
import {
  CHARGEBACKS,
  MISMATCH_TYPE_LABEL,
  PLAZA_BREAKS,
  TOLL_METRIC_CARDS,
  TOLL_SETTLEMENT_SUMMARY,
  type AuditPriority,
  type ChargebackRecord,
  type PlazaBreakRecord,
} from './tollSettlementData';

type Props = {
  ft11Control: AuditControl | undefined;
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  /** Open plaza-break drill when routed from executive COH view. */
  initialPlazaBreakId?: string | null;
  onInitialPlazaBreakHandled?: () => void;
};

const TH =
  'px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-200 whitespace-nowrap';
const TD = 'px-3 py-2.5 align-middle text-xs';

function priorityPill(p: AuditPriority) {
  const map = {
    critical: 'bg-red-600 text-white ring-red-700',
    high: 'bg-amber-500 text-white ring-amber-600',
    medium: 'bg-slate-500 text-white ring-slate-600',
  };
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ${map[p]}`}>
      {p}
    </span>
  );
}

function breakStatusPill(status: PlazaBreakRecord['status']) {
  const map = {
    open: 'bg-red-100 text-red-900 ring-red-300',
    investigating: 'bg-sky-100 text-sky-900 ring-sky-300',
    resolved: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    escalated: 'bg-amber-100 text-amber-950 ring-amber-400',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function chargebackStatusPill(status: ChargebackRecord['status']) {
  const map = {
    open: 'bg-amber-100 text-amber-950 ring-amber-300',
    filed: 'bg-sky-100 text-sky-900 ring-sky-300',
    closed: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    breached: 'bg-red-100 text-red-900 ring-red-400',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function evidencePill(status: ChargebackRecord['evidenceStatus']) {
  const map = {
    complete: 'text-emerald-800 bg-emerald-50 ring-emerald-200',
    partial: 'text-amber-900 bg-amber-50 ring-amber-200',
    missing: 'text-red-800 bg-red-50 ring-red-200',
  };
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize ring-1 ${map[status]}`}>
      {status}
    </span>
  );
}

function plazaRowClass(row: PlazaBreakRecord) {
  if (row.priority === 'critical' || row.ageDays > row.slaDays) return 'bg-red-50/90 border-l-4 border-l-red-500';
  if (row.status === 'escalated' || row.ageDays >= row.slaDays - 1) return 'bg-amber-50/70 border-l-4 border-l-amber-400';
  if (row.status === 'investigating') return 'bg-sky-50/50 border-l-4 border-l-sky-400';
  return 'bg-white border-l-4 border-l-transparent even:bg-slate-50/40';
}

function chargebackRowClass(row: ChargebackRecord) {
  if (row.status === 'breached' || row.ageDays > row.networkTatDays) return 'bg-red-50/90 border-l-4 border-l-red-500';
  if (row.status === 'open' && row.evidenceStatus === 'missing') return 'bg-amber-50/70 border-l-4 border-l-amber-400';
  if (row.status === 'filed') return 'bg-sky-50/50 border-l-4 border-l-sky-400';
  return 'bg-white border-l-4 border-l-transparent even:bg-slate-50/40';
}

const DRILL_ROW =
  'cursor-pointer transition-colors hover:bg-indigo-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-inset';

export default function FastTagTollSettlementView({
  ft11Control,
  onOpenEvidence,
  initialPlazaBreakId,
  onInitialPlazaBreakHandled,
}: Props) {
  const [drill, setDrill] = useState<TollDrillState>(null);

  useEffect(() => {
    if (!initialPlazaBreakId) return;
    setDrill({ kind: 'plaza-break', id: initialPlazaBreakId });
    onInitialPlazaBreakHandled?.();
  }, [initialPlazaBreakId, onInitialPlazaBreakHandled]);

  const openDrill = useCallback((next: TollDrillState) => setDrill(next), []);
  const closeDrill = useCallback(() => setDrill(null), []);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="w-full space-y-5">
      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Toll settlement &amp; plaza reconciliation</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                NPCI settlement cycle ({TOLL_SETTLEMENT_SUMMARY.npciCycle}) · Control FT-11 ·{' '}
                {TOLL_SETTLEMENT_SUMMARY.periodLabel}
              </p>
            </div>
          </div>
          {ft11Control && (
            <button
              type="button"
              onClick={() => onOpenEvidence(ft11Control, 'Fast-Tag')}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" /> FT-11 evidence
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOLL_METRIC_CARDS.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => openDrill({ kind: 'metric', id: m.drillId })}
              className={`rounded-lg px-4 py-3 text-left ring-1 transition-colors hover:ring-sky-400 hover:shadow-md ${m.cardClass} ${DRILL_ROW}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider ${m.labelClass}`}>{m.label}</div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums leading-none ${m.valueClass}`}>
                {m.value}
              </div>
              {'sub' in m && m.sub ? <div className="mt-1 text-[11px] text-slate-500">{m.sub}</div> : null}
              <div className="mt-2 flex items-center gap-0.5 text-[10px] font-semibold text-sky-700">
                View insights <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plaza file breaks — full-width register */}
      <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Plaza file breaks register</h4>
            <p className="text-[11px] text-slate-300">
              {PLAZA_BREAKS.length} sampled · {TOLL_SETTLEMENT_SUMMARY.openPlazaBreaks} open portfolio-wide
            </p>
          </div>
          <span className="rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-100 ring-1 ring-amber-400/40">
            FT-11 deficient · reconcile &gt; ₹50 / tag / day
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-slate-700">
                <th className={`${TH} w-[9%] pl-4`}>Break ref</th>
                <th className={`${TH} w-[10%]`}>Settlement · cycle</th>
                <th className={`${TH} w-[14%]`}>Plaza / acquirer</th>
                <th className={`${TH} w-[11%]`}>VRN · tag</th>
                <th className={`${TH} w-[12%]`}>Recon amounts</th>
                <th className={`${TH} w-[11%]`}>Mismatch type</th>
                <th className={`${TH} w-[10%]`}>Priority · SLA</th>
                <th className={`${TH} w-[11%]`}>Status · dispute</th>
                <th className={`${TH} w-[12%] pr-3`}>Owner · linked CB</th>
              </tr>
            </thead>
            <tbody>
              {PLAZA_BREAKS.map((row) => {
                const slaBreached = row.ageDays > row.slaDays;
                return (
                  <tr
                    key={row.id}
                    className={`${plazaRowClass(row)} ${DRILL_ROW}`}
                    onClick={() => openDrill({ kind: 'plaza-break', id: row.id })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDrill({ kind: 'plaza-break', id: row.id });
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <td className={`${TD} pl-4 font-mono text-[10px] font-semibold text-slate-800`}>{row.id}</td>
                    <td className={TD}>
                      <div className="whitespace-nowrap text-slate-800">{row.settlementDate}</div>
                      <div className="font-mono text-[10px] text-slate-500">{row.npciCycle}</div>
                    </td>
                    <td className={TD}>
                      <div className="font-medium leading-snug text-slate-900">{row.plazaName}</div>
                      <div className="text-[10px] leading-snug text-slate-500">
                        {row.plazaId} · {row.acquirer}
                      </div>
                    </td>
                    <td className={TD}>
                      <div className="font-semibold text-slate-800">{row.vrn}</div>
                      <div className="font-mono text-[10px] text-slate-500">{row.tagId}</div>
                    </td>
                    <td className={`${TD} tabular-nums`}>
                      <div className="text-slate-700">
                        <span className="text-[10px] text-slate-500">W </span>
                        {fmt(row.walletDebitInr)}
                      </div>
                      <div className="text-slate-700">
                        <span className="text-[10px] text-slate-500">P </span>
                        {fmt(row.plazaFileAmountInr)}
                      </div>
                      <div className={row.varianceInr > 0 ? 'font-bold text-red-700' : 'text-emerald-700'}>
                        <span className="text-[10px] font-normal text-slate-500">V </span>
                        {row.varianceInr > 0 ? fmt(row.varianceInr) : '—'}
                      </div>
                    </td>
                    <td className={TD}>
                      <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-800 ring-1 ring-slate-200">
                        {MISMATCH_TYPE_LABEL[row.mismatchType]}
                      </span>
                    </td>
                    <td className={TD}>
                      <div className="flex flex-wrap items-center gap-1">
                        {priorityPill(row.priority)}
                      </div>
                      <div className="mt-1 tabular-nums text-[11px]">
                        <span className={slaBreached ? 'font-bold text-red-700' : 'text-slate-700'}>
                          {row.ageDays}d
                        </span>
                        <span className="text-slate-400"> / {row.slaDays}d</span>
                        {slaBreached && (
                          <span className="ml-1 inline-flex items-center gap-0.5 font-semibold text-red-600">
                            <AlertTriangle className="h-3 w-3" /> SLA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={TD}>
                      {breakStatusPill(row.status)}
                      <div
                        className={`mt-1 text-[10px] font-bold uppercase ${
                          row.npciDisputeRaised ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        NPCI {row.npciDisputeRaised ? 'filed' : 'pending'}
                      </div>
                    </td>
                    <td className={`${TD} pr-3`}>
                      <div className="text-slate-700">{row.owner}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-sky-800">
                        {row.linkedChargebackId ?? '—'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-700">
                <td colSpan={4} className="px-4 py-2 pl-4">
                  Register subtotal (sampled)
                </td>
                <td className="px-3 py-2 tabular-nums text-red-800">
                  Σ variance {fmt(PLAZA_BREAKS.reduce((s, r) => s + r.varianceInr, 0))}
                </td>
                <td colSpan={4} className="px-3 py-2 text-right">
                  {PLAZA_BREAKS.filter((r) => r.priority === 'critical').length} critical ·{' '}
                  {PLAZA_BREAKS.filter((r) => r.ageDays > r.slaDays).length} past SLA
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Chargebacks — full-width register */}
      <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/30 bg-red-950 px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Chargebacks &amp; disputes register</h4>
            <p className="text-[11px] text-red-200/90">
              Network TAT T+{CHARGEBACKS[0]?.networkTatDays ?? 5} · {TOLL_SETTLEMENT_SUMMARY.chargebacksBreachedTat}{' '}
              breached of {TOLL_SETTLEMENT_SUMMARY.chargebacksOpen} open
            </p>
          </div>
          <span className="rounded-md bg-red-500/25 px-2 py-1 text-[10px] font-semibold text-red-100 ring-1 ring-red-400/50">
            Past TAT = critical exception
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-red-900">
                <th className={`${TH} w-[10%] pl-4`}>CB · NPCI ref</th>
                <th className={`${TH} w-[10%]`}>Raised · due</th>
                <th className={`${TH} w-[11%]`}>VRN · tag</th>
                <th className={`${TH} w-[14%]`}>Plaza</th>
                <th className={`${TH} w-[8%]`}>Debit ₹</th>
                <th className={`${TH} w-[14%]`}>Category · reason</th>
                <th className={`${TH} w-[10%]`}>Age / TAT</th>
                <th className={`${TH} w-[11%]`}>Evidence · owner</th>
                <th className={`${TH} w-[12%] pr-3`}>Status · break</th>
              </tr>
            </thead>
            <tbody>
              {CHARGEBACKS.map((row) => {
                const tatBreached = row.ageDays > row.networkTatDays;
                return (
                  <tr
                    key={row.id}
                    className={`${chargebackRowClass(row)} ${DRILL_ROW}`}
                    onClick={() => openDrill({ kind: 'chargeback', id: row.id })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDrill({ kind: 'chargeback', id: row.id });
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <td className={`${TD} pl-4`}>
                      <div className="font-mono text-[10px] font-semibold text-slate-800">{row.id}</div>
                      <div className="font-mono text-[10px] text-slate-500">{row.npciRef}</div>
                    </td>
                    <td className={TD}>
                      <div className="whitespace-nowrap text-slate-800">{row.raisedOn}</div>
                      <div className={`text-[10px] ${tatBreached ? 'font-semibold text-red-700' : 'text-slate-500'}`}>
                        Due {row.resolutionDue}
                      </div>
                    </td>
                    <td className={TD}>
                      <div className="font-semibold text-slate-800">{row.vrn}</div>
                      <div className="font-mono text-[10px] text-slate-500">{row.tagId}</div>
                    </td>
                    <td className={TD}>
                      <div className="truncate font-medium text-slate-900" title={row.plazaName}>
                        {row.plazaName}
                      </div>
                      <div className="text-[10px] text-slate-500">{row.plazaId}</div>
                    </td>
                    <td className={`${TD} tabular-nums font-semibold text-slate-900`}>{fmt(row.tollDebitInr)}</td>
                    <td className={TD}>
                      <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-900 ring-1 ring-indigo-200">
                        {row.disputeCategory}
                      </span>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-600" title={row.reason}>
                        {row.reason}
                      </p>
                    </td>
                    <td className={`${TD} tabular-nums`}>
                      <span className={tatBreached ? 'font-bold text-red-700' : 'text-slate-800'}>{row.ageDays}d</span>
                      <span className="text-slate-400"> / {row.networkTatDays}d</span>
                      {tatBreached && (
                        <div className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-red-600">
                          <AlertTriangle className="h-3 w-3" /> Breached
                        </div>
                      )}
                    </td>
                    <td className={TD}>
                      {evidencePill(row.evidenceStatus)}
                      <div className="mt-1 text-[11px] text-slate-700">{row.owner}</div>
                    </td>
                    <td className={`${TD} pr-3`}>
                      {chargebackStatusPill(row.status)}
                      <div className="mt-1 font-mono text-[10px] text-sky-800">
                        {row.relatedPlazaBreakId ?? '—'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-red-50 text-[11px] font-semibold text-red-950">
                <td colSpan={4} className="px-4 py-2 pl-4">
                  Dispute subtotal (sampled)
                </td>
                <td className="px-3 py-2 tabular-nums">{fmt(CHARGEBACKS.reduce((s, r) => s + r.tollDebitInr, 0))}</td>
                <td colSpan={4} className="px-3 py-2 text-right">
                  {CHARGEBACKS.filter((r) => r.ageDays > r.networkTatDays).length} past TAT ·{' '}
                  {CHARGEBACKS.filter((r) => r.evidenceStatus === 'missing').length} missing evidence
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <TollSettlementDrillDrawer
        drill={drill}
        ft11Control={ft11Control}
        onClose={closeDrill}
        onOpenEvidence={onOpenEvidence}
        onDrillPlazaBreak={(id) => openDrill({ kind: 'plaza-break', id })}
        onDrillChargeback={(id) => openDrill({ kind: 'chargeback', id })}
      />
    </div>
  );
}
