'use client';

import React from 'react';
import { aiInsights, metrics, personas, riskDomains, smfHolders } from '../dataModel';
import { KVRow, Sparkline, StatusBadge } from '../primitives';
import { bandDot, severityBadge, trendArrow, trendTone } from '../theme';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

const insightFilter = (i: (typeof aiInsights)[0]) =>
  i.type === 'what_changed' || i.type === 'anomaly' || i.type === 'root_cause';

const domainToneClass = (b: string) =>
  ({
    red: 'border-rose-300 bg-rose-50 text-rose-900',
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    green: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    neutral: 'border-slate-300 bg-slate-50 text-slate-700',
  }[b] || 'border-slate-300 bg-slate-50 text-slate-700');

export function CroRiskPostureCockpit({
  openDrawer,
  setActiveScreen,
  setSelectedSMFId,
  smfTrails,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: (s: string) => void;
  setSelectedSMFId: (id: string) => void;
  smfTrails: Record<
    string,
    {
      awaiting: { targetType: string; targetId: string; daysOpen: number; raisedDate: string }[];
      trail: { timestamp: string; eventType: string; label: string; evidenceId: string | null }[];
      rss: { score: number; band: string; components: Record<string, number> };
    }
  >;
}) {
  const cro = personas.find((p) => p.id === 'cro');
  const cromSMF = cro?.smfId ? smfHolders.find((s) => s.id === cro.smfId) : null;
  const trail = cromSMF ? smfTrails[cromSMF.id] : null;
  const inboxItems = metrics.byPersona.cro.inboxItems;
  const filteredInsights = aiInsights.filter(insightFilter);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* One grid: tight vertical rhythm, hero row aligned on the same horizontal plane */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-4">
        {/* Row 1 — Enterprise RES */}
        <section className="flex min-h-0 min-w-0 lg:col-span-7 lg:row-start-1">
          <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:min-h-[220px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Enterprise Residual Exposure Score
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <div className="text-5xl font-bold leading-none text-amber-600">{metrics.enterpriseRES.value}</div>
                  <StatusBadge tone={metrics.enterpriseRES.band} label={metrics.enterpriseRES.band.toUpperCase()} />
                  <span className="text-sm font-semibold text-rose-600">▲ {metrics.enterpriseRES.delta} this week</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">PRA SREP</div>
                <div className="text-2xl font-bold leading-none text-slate-900">Cat {metrics.enterpriseRES.praSREPCategory}</div>
              </div>
            </div>
            <div className="mt-4 flex min-h-0 flex-1 flex-col justify-end gap-2">
              <Sparkline
                series={metrics.enterpriseRES.sparklineSeries}
                band={metrics.enterpriseRES.band}
                width={480}
                height={48}
                fill
              />
              <div className="text-xs text-slate-500">13 weeks</div>
            </div>
          </div>
        </section>

        {/* Row 1 — SMF4 snapshot (same row, same top edge as RES) */}
        <section className="flex min-h-0 min-w-0 lg:col-span-5 lg:row-start-1">
          <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:min-h-[220px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">My Reasonable Steps · SMF4</div>
                <div className="mt-1 text-base font-semibold leading-snug text-slate-900">{cromSMF?.name || '—'}</div>
                <div className="text-xs text-slate-500">{cromSMF?.functionLabel}</div>
              </div>
              {trail ? <StatusBadge tone={trail.rss.band} label={`RSS ${trail.rss.score}`} /> : null}
            </div>
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              {trail && cromSMF ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1">
                    <KVRow k="Awaiting acks" v={trail.awaiting.length} tone={trail.awaiting.length === 0 ? 'green' : 'amber'} />
                    <KVRow k="Last attestation" v={cromSMF.lastAttestationDate || '—'} />
                    <KVRow k="PR" v={cromSMF.prescribedResponsibilities.join(', ') || '—'} />
                    <KVRow
                      k="Conduct breaches"
                      v={cromSMF.conductRuleBreaches}
                      tone={cromSMF.conductRuleBreaches === 0 ? 'green' : 'red'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSMFId(cromSMF.id);
                      setActiveScreen('smcrWorkspace');
                    }}
                    className="mt-auto w-full rounded-md border border-indigo-200 bg-indigo-50 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Open my Reasonable Steps Workspace →
                  </button>
                </>
              ) : (
                <p className="mt-auto text-xs text-slate-500">No SMF profile linked for this persona.</p>
              )}
            </div>
          </div>
        </section>

        {/* Row 2 — Domain heat map */}
        <section className="flex min-h-0 min-w-0 lg:col-span-7 lg:row-start-2">
          <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Domain Heat Map</h3>
              <span className="text-[10px] text-slate-500">click a domain to drill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {riskDomains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => openDrawer('risk', d.primaryDriverRiskId, 'riskPosture')}
                  className={`rounded-lg border-2 p-3 text-left transition hover:shadow-md ${domainToneClass(d.resBand as string)}`}
                >
                  <div className="mb-1 flex items-start justify-between gap-1">
                    <div className="text-xs font-medium leading-tight">{d.label}</div>
                    <span className={`shrink-0 text-xs ${trendTone(d.trend)}`}>{trendArrow(d.trend)}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold leading-none">{d.res}</div>
                  <div className="mt-2 w-full overflow-hidden">
                    <Sparkline series={d.resSparklineSeries} band={d.resBand} width={120} height={22} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Row 2 — What Changed (fixed height, scroll body) */}
        <section className="flex min-h-0 min-w-0 lg:col-span-5 lg:row-start-2">
          <div className="flex h-full min-h-[260px] max-h-[min(48vh,400px)] w-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:max-h-[min(52vh,440px)]">
            <h3 className="shrink-0 text-sm font-semibold text-slate-900">What Changed This Week</h3>
            <p className="mt-0.5 shrink-0 text-[10px] text-slate-500">{filteredInsights.length} insight(s)</p>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]">
              {filteredInsights.length === 0 ? (
                <p className="text-xs text-slate-500">No matching insights for this week.</p>
              ) : (
                filteredInsights.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => openDrawer('aiInsight', i.id, 'riskPosture')}
                    className="w-full shrink-0 rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">AI</span>
                      <StatusBadge
                        tone={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'green'}
                        label={i.severity.toUpperCase()}
                        size="xs"
                      />
                      <span className="ml-auto text-[10px] text-slate-500">conf {Math.round(i.confidence * 100)}%</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{i.title}</div>
                    <div className="mt-1 line-clamp-3 text-[11px] leading-snug text-slate-600">{i.summary}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Inbox — full width, compact */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Material Items Awaiting Decision</h3>
          <p className="text-xs text-slate-500">CRO inbox · {inboxItems.length} items</p>
        </div>
        <div className="divide-y divide-slate-100">
          {inboxItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                openDrawer(
                  item.targetEntityType === 'issue'
                    ? 'issue'
                    : item.targetEntityType === 'auditPack'
                      ? 'auditPack'
                      : 'aiInsight',
                  item.targetEntityId,
                  'riskPosture',
                )
              }
              className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
            >
              <div
                className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${bandDot(
                  (item.severity as string) === 'critical' || (item.severity as string) === 'high'
                    ? 'red'
                    : (item.severity as string) === 'medium'
                      ? 'amber'
                      : 'neutral',
                )}`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {item.type.replace('_', ' ')} · {item.ageDays}d open · → {item.targetEntityId}
                </div>
              </div>
              <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${severityBadge(item.severity)}`}>
                {item.severity.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
