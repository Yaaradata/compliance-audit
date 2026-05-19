'use client';

import React, { useMemo, useState } from 'react';
import { getRegulation } from '../../dataModel';
import { Chip, EmptyState, ScoreRing, SectionCard, SeverityBadge, Sparkline, StatusBadge } from '../../primitives';
import type { DrillFromDrawer, SetActiveScreen } from '../../types';
import type { ControlTestResultBadge } from './buildRiskDetailViewModel';
import { buildRiskDetailViewModel } from './buildRiskDetailViewModel';

const TEST_BADGE_CLASS: Record<ControlTestResultBadge, string> = {
  PASS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAIL: 'bg-rose-100 text-rose-800 border-rose-200',
  PARTIAL: 'bg-amber-100 text-amber-800 border-amber-200',
  'NOT TESTED': 'bg-slate-100 text-slate-600 border-slate-200',
};

function TestResultBadge({ result }: { result: ControlTestResultBadge }) {
  return (
    <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TEST_BADGE_CLASS[result]}`}>
      {result}
    </span>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-xs font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function KriGaugeBar({ markerPct, amberPct, redPct }: { markerPct: number; amberPct: number; redPct: number }) {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="absolute inset-y-0 left-0 bg-emerald-200/80" style={{ width: `${amberPct}%` }} />
      <div
        className="absolute inset-y-0 bg-amber-200/90"
        style={{ left: `${amberPct}%`, width: `${Math.max(0, redPct - amberPct)}%` }}
      />
      <div className="absolute inset-y-0 bg-rose-300/90" style={{ left: `${redPct}%`, right: 0 }} />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800 shadow"
        style={{ left: `${markerPct}%` }}
      />
    </div>
  );
}

function ResHistoricalChart({ history, band }: { history: { label: string; score: number }[]; band: string }) {
  const series = history.map((p) => p.score);
  return (
    <div className="min-w-[14rem] flex-1 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <Sparkline series={series} band={band} width={320} height={56} fill className="w-full" />
      <div className="mt-2 flex justify-between gap-1">
        {history.map((p) => (
          <div key={p.label} className="min-w-0 flex-1 text-center">
            <div className="font-mono text-[10px] font-bold text-slate-800">{p.score}</div>
            <div className="truncate text-[9px] text-slate-500">{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskDetailPanel({
  riskId,
  drillFromDrawer,
  setActiveScreen,
}: {
  riskId: string;
  drillFromDrawer: DrillFromDrawer;
  setActiveScreen?: SetActiveScreen;
}) {
  const vm = useMemo(() => buildRiskDetailViewModel(riskId), [riskId]);
  const [postureView, setPostureView] = useState<'current' | 'historical'>('current');

  if (!vm) return <EmptyState message="Risk not found." />;

  const { risk } = vm;
  const visibleControls = vm.controlRows.slice(0, 5);
  const kriWrapClass =
    vm.kriReading?.breachBand === 'red'
      ? 'rounded-lg border border-rose-100 bg-rose-50 -m-1 p-1'
      : vm.kriReading?.breachBand === 'amber'
        ? 'rounded-lg border border-amber-100 bg-amber-50/80 -m-1 p-1'
        : '';

  const goRcsa = () => setActiveScreen?.('rcsaWorkspace');
  const goObligations = () => setActiveScreen?.('obligationCoverage');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{risk.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Chip label={`Domain · ${risk.domain_id}`} tone="indigo" />
          <Chip label={`Inherent · ${risk.inherent_rating}`} tone="amber" />
          <Chip label={`Residual · ${risk.residual_rating}`} tone="rose" />
          <Chip label={`Trend · ${risk.residual_rating_trend.replace(/_/g, ' ')}`} tone="slate" />
        </div>
      </div>

      <div className="flex gap-2 rounded-md border-l-[3px] border-amber-400 bg-amber-50 px-3 py-2.5">
        <span className="mt-0.5 shrink-0 text-sm" aria-hidden>
          ✨
        </span>
        <p className="text-xs leading-relaxed text-amber-950">{vm.aiInsight}</p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          {postureView === 'current' ? (
            <ScoreRing score={risk.res_score} band={vm.resBand} label="RES" size={88} />
          ) : (
            <ResHistoricalChart history={vm.resHistory} band={vm.resBand} />
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Risk posture</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setPostureView('current')}
              className={`rounded px-2 py-1 ${postureView === 'current' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => setPostureView('historical')}
              className={`rounded px-2 py-1 ${postureView === 'historical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Historical
            </button>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetaField label="Risk ID">
          <span className="font-mono text-[11px]">{risk.risk_id}</span>
        </MetaField>
        <MetaField label="Accountable SM">
          <button
            type="button"
            className="text-left text-xs font-semibold text-indigo-700 underline decoration-dotted hover:text-indigo-900"
            onClick={() => drillFromDrawer('seniorManager', vm.accountableSmId)}
          >
            {vm.accountableSmName}
          </button>
        </MetaField>
        <MetaField label="KRIs">{risk.kri_ids.join(', ') || '—'}</MetaField>
        <MetaField label="Appetite metrics">{risk.appetite_metric_ids.join(', ') || '—'}</MetaField>
        <MetaField label="Last assessed">{vm.lastAssessed?.dateLabel ?? '—'}</MetaField>
        <MetaField label="Next review due">
          {vm.nextReviewDue ? (
            <span className={vm.nextReviewDue.isOverdue ? 'font-semibold text-rose-700' : ''}>
              {vm.nextReviewDue.dateLabel}
              {vm.nextReviewDue.isOverdue ? ' (OVERDUE)' : ''}
            </span>
          ) : (
            '—'
          )}
        </MetaField>
      </dl>

      <SectionCard title="Controls summary">
        {vm.controlRows.length === 0 ? (
          <p className="text-xs text-slate-500">
            No controls linked to this risk —{' '}
            <button type="button" className="font-semibold text-indigo-700 underline hover:text-indigo-900" onClick={goRcsa}>
              add control mapping →
            </button>
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="pb-2 pr-2">Control ID</th>
                    <th className="pb-2 pr-2">Control name</th>
                    <th className="pb-2 pr-2">Last test date</th>
                    <th className="pb-2 pr-2">Test result</th>
                    <th className="pb-2">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleControls.map((row) => (
                    <tr key={row.controlId} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-2 font-mono text-[11px]">
                        <button
                          type="button"
                          className="text-indigo-700 underline decoration-dotted hover:text-indigo-900"
                          onClick={() => drillFromDrawer('control', row.controlId)}
                        >
                          {row.controlId}
                        </button>
                      </td>
                      <td className="max-w-[12rem] truncate py-2 pr-2 text-slate-800" title={row.controlName}>
                        {row.controlName}
                      </td>
                      <td className="py-2 pr-2 text-slate-600">{row.lastTestDate ?? '—'}</td>
                      <td className="py-2 pr-2">
                        <TestResultBadge result={row.testResult} />
                      </td>
                      <td className="py-2 text-slate-700">{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {vm.totalControlCount > 5 ? (
              <button type="button" className="mt-2 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900" onClick={goRcsa}>
                View all {vm.totalControlCount} controls →
              </button>
            ) : null}
          </>
        )}
      </SectionCard>

      {vm.kriReading ? (
        <div className={kriWrapClass}>
          <SectionCard title="KRI current reading">
            <p className="mb-2 text-[11px] font-semibold text-slate-800">
              {vm.kriReading.kriId} · {vm.kriReading.kriName}
            </p>
            <KriGaugeBar markerPct={vm.kriReading.markerPct} amberPct={vm.kriReading.amberPct} redPct={vm.kriReading.redPct} />
            <p className="mt-2 text-[11px] text-slate-600">
              Current: <span className="font-semibold text-slate-900">{vm.kriReading.currentValue}</span> · Amber threshold:{' '}
              {vm.kriReading.thresholdAmber} · Red threshold: {vm.kriReading.thresholdRed} · Breach status:{' '}
              <span
                className={
                  vm.kriReading.breachBand === 'red'
                    ? 'font-semibold text-rose-700'
                    : vm.kriReading.breachBand === 'amber'
                      ? 'font-semibold text-amber-700'
                      : 'font-semibold text-emerald-700'
                }
              >
                {vm.kriReading.breachStatusLabel}
              </span>
            </p>
          </SectionCard>
        </div>
      ) : null}

      <SectionCard title="Linked incidents">
        {vm.linkedIncidents.length === 0 ? (
          <p className="text-xs text-slate-500">No incidents in last 90 days</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-2 pr-2">Incident ID</th>
                  <th className="pb-2 pr-2">Description</th>
                  <th className="pb-2 pr-2">Date</th>
                  <th className="pb-2 pr-2">Severity</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {vm.linkedIncidents.map((row) => (
                  <tr key={row.incidentId} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-2 font-mono text-[11px]">
                      <button
                        type="button"
                        className="text-indigo-700 underline decoration-dotted"
                        onClick={() => drillFromDrawer('incident', row.incidentId)}
                      >
                        {row.incidentId}
                      </button>
                    </td>
                    <td className="max-w-[14rem] truncate py-2 pr-2 text-slate-700" title={row.description}>
                      {row.description}
                    </td>
                    <td className="py-2 pr-2 text-slate-600">{row.date}</td>
                    <td className="py-2 pr-2">
                      <SeverityBadge severity={row.severity} />
                    </td>
                    <td className="py-2">
                      <StatusBadge label={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {vm.obligationIds.length > 0 ? (
        <SectionCard title="Linked obligations">
          <div className="flex flex-wrap gap-1.5">
            {vm.obligationIds.map((id) => (
              <Chip key={id} label={id} tone="violet" onClick={() => drillFromDrawer('obligation', id)} />
            ))}
          </div>
        </SectionCard>
      ) : (
        <section>
          <h3 className="mb-1 text-xs font-bold text-slate-900">Linked obligations</h3>
          {vm.suggestedObligation ? (
            <p className="text-xs text-slate-500">
              Suggested: {vm.suggestedObligation.anchorLabel} (detected from domain mapping) —{' '}
              <button type="button" className="font-semibold text-indigo-700 underline hover:text-indigo-900" onClick={goObligations}>
                confirm linkage →
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              No obligations linked —{' '}
              <button type="button" className="font-semibold text-indigo-700 underline hover:text-indigo-900" onClick={goObligations}>
                map an obligation →
              </button>
            </p>
          )}
        </section>
      )}

      {vm.regulationIds.length > 0 ? (
        <SectionCard title="Regulations">
          <div className="flex flex-wrap gap-1.5">
            {vm.regulationIds.map((rid) => {
              const reg = getRegulation(rid);
              return <Chip key={rid} label={reg?.title || rid} tone="slate" onClick={() => drillFromDrawer('regulation', rid)} />;
            })}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
