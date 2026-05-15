'use client';

import React, { useEffect, useMemo } from 'react';
import type { KPISummary, RegAlertRecord, RegStage } from '@/lib/IndianBankingAudit/regIntelMockData';
import { RegIntelDonutChart } from './RegIntelDonutChart';
import { RegIntelSparkline } from './RegIntelSparkline';
import { getSourceColor, type RegIntelStripeSource } from './regIntelSourceColors';

const MTTA_SPARK = [3.8, 3.5, 3.4, 3.6, 3.2, 3.0, 3.3, 3.2];
const MTTC_SPARK = [24.1, 22.8, 23.4, 21.9, 20.5, 21.2, 19.8, 18.4];

function sourceCounts(alerts: RegAlertRecord[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of alerts) {
    const k = a.source;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function obligationCoverageFromObligations(alerts: RegAlertRecord[]) {
  const all = alerts.flatMap((a) => a.obligations);
  return {
    uncovered: all.filter((o) => o.coverage_status === 'uncovered').length,
    partial: all.filter((o) => o.coverage_status === 'partial').length,
    covered: all.filter((o) => o.coverage_status === 'covered').length,
  };
}

function stageCounts(alerts: RegAlertRecord[]): { stage: RegStage; count: number }[] {
  const order: RegStage[] = ['acknowledge', 'assess', 'assign', 'implement', 'certify', 'closed'];
  const map = new Map<RegStage, number>();
  for (const s of order) map.set(s, 0);
  for (const a of alerts) {
    map.set(a.stage, (map.get(a.stage) ?? 0) + 1);
  }
  return order.map((stage) => ({ stage, count: map.get(stage) ?? 0 }));
}

const STAGE_VIS: Record<
  RegStage,
  { label: string; bar: string }
> = {
  acknowledge: { label: 'Acknowledge', bar: '#D97706' },
  assess: { label: 'Assess', bar: '#2563EB' },
  assign: { label: 'Assign', bar: '#4F46E5' },
  implement: { label: 'Implement', bar: '#0D9488' },
  certify: { label: 'Certify', bar: '#15803D' },
  closed: { label: 'Closed', bar: '#6B7280' },
};

function penaltyExposureSummary(alerts: RegAlertRecord[]) {
  const byCode = new Map<string, number>();
  for (const a of alerts) {
    if (a.is_peer_signal) {
      byCode.set('Peer enforcement', (byCode.get('Peer enforcement') ?? 0) + 1);
    }
    for (const code of a.penalty_exposure) {
      byCode.set(code, (byCode.get(code) ?? 0) + 1);
    }
  }
  return Array.from(byCode.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((x, y) => y.count - x.count);
}

function Gauge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-slate-700">
        <span>{label}</span>
        <span className="tabular-nums text-emerald-800">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-0.5 text-[10px] text-slate-500">Target under {max}</p>
    </div>
  );
}

export function RegIntelCCOMetricsDrawer({
  open,
  onClose,
  kpiSummary,
  alerts,
}: {
  open: boolean;
  onClose: () => void;
  kpiSummary: KPISummary;
  alerts: RegAlertRecord[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const cov = useMemo(() => obligationCoverageFromObligations(alerts), [alerts]);
  const sources = useMemo(() => sourceCounts(alerts), [alerts]);
  const maxSource = useMemo(() => Math.max(1, ...sources.map((s) => s.count)), [sources]);
  const stages = useMemo(() => stageCounts(alerts), [alerts]);
  const maxStage = useMemo(() => Math.max(1, ...stages.map((s) => s.count)), [stages]);
  const penaltyRows = useMemo(() => penaltyExposureSummary(alerts), [alerts]);
  const alertsWithPendingHitl = useMemo(
    () => alerts.filter((a) => a.obligations_pending_hitl > 0).length,
    [alerts]
  );

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[8500] bg-slate-900/40 md:bg-slate-900/30"
        aria-label="Close metrics panel"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-[8600] flex h-full w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-xl md:w-[min(26rem,100vw)] md:max-w-[min(26rem,100vw)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-intel-metrics-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="reg-intel-metrics-title" className="text-sm font-bold text-slate-900">
            CCO metrics quick view
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-lg text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <section>
            <Gauge value={kpiSummary.mtta_hours} max={4} label="MTTA (Mean Time to Acknowledge)" />
            <p className="mt-1 text-xs text-slate-600">
              {kpiSummary.mtta_hours}h — Target &lt; 4h · last 8 weeks (demo)
            </p>
            <RegIntelSparkline data={MTTA_SPARK} stroke="#2563eb" height={40} />
          </section>

          <section>
            <Gauge value={kpiSummary.mttc_days} max={30} label="MTTC (Mean Time to Certify)" />
            <p className="mt-1 text-xs text-slate-600">
              {kpiSummary.mttc_days}d — Target &lt; 30d · last 8 weeks (demo)
            </p>
            <RegIntelSparkline data={MTTC_SPARK} stroke="#0d9488" height={40} />
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Obligation coverage (all in-flight)</h3>
            <p className="mt-1 text-[11px] text-slate-500">From obligation rows · coverage_status</p>
            <div className="mt-3 flex items-start gap-4">
              <RegIntelDonutChart uncovered={cov.uncovered} partial={cov.partial} covered={cov.covered} size={112} />
              <ul className="min-w-0 flex-1 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <span>
                    Uncovered <span className="font-semibold tabular-nums">({cov.uncovered})</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span>
                    Partial <span className="font-semibold tabular-nums">({cov.partial})</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>
                    Covered <span className="font-semibold tabular-nums">({cov.covered})</span>
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending HITL</h3>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{kpiSummary.pending_hitl}</p>
            <p className="mt-1 text-xs text-slate-600">Across {alertsWithPendingHitl} alerts</p>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Active sources (inbox)</h3>
            <ul className="mt-3 space-y-2.5">
              {sources.map((s) => {
                const hex = getSourceColor(s.label as RegIntelStripeSource);
                const wPct = (s.count / maxSource) * 100;
                return (
                  <li key={s.label} className="text-sm text-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-24 shrink-0 font-medium">{s.label}</span>
                      <span className="tabular-nums font-semibold text-slate-900">{s.count}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-all" style={{ width: `${wPct}%`, backgroundColor: hex }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Top stuck stages</h3>
            <p className="mt-1 text-[11px] text-slate-500">Alerts by workflow stage</p>
            <ul className="mt-3 space-y-2">
              {stages.map(({ stage, count }) => {
                const vis = STAGE_VIS[stage];
                const wPct = (count / maxStage) * 100;
                return (
                  <li key={stage} className="text-xs">
                    <div className="flex justify-between gap-2 font-medium text-slate-700">
                      <span>{vis.label}</span>
                      <span className="tabular-nums text-slate-900">{count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${wPct}%`, backgroundColor: vis.bar }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Penalty exposure</h3>
            <p className="mt-1 text-[11px] text-slate-500">Alerts contributing to each exposure tag (demo roll-up)</p>
            {penaltyRows.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">No penalty-tagged or peer alerts in current set.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
                {penaltyRows.map((row) => (
                  <li key={row.code} className="flex justify-between border-b border-slate-100 py-1">
                    <span className="font-mono text-xs">{row.code}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
