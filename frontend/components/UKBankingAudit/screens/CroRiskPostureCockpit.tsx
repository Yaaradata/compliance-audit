'use client';

import React from 'react';
import { aiInsights, metrics, personas, riskDomains, smfHolders } from '../dataModel';
import { Sparkline, StatusBadge } from '../primitives';
import { KVRow } from '../primitives';
import { bandDot, severityBadge, trendArrow, trendTone } from '../theme';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Enterprise Residual Exposure Score
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <div className="text-5xl font-bold text-amber-600">{metrics.enterpriseRES.value}</div>
                  <StatusBadge tone={metrics.enterpriseRES.band} label={metrics.enterpriseRES.band.toUpperCase()} />
                  <span className="text-sm font-semibold text-rose-600">▲ {metrics.enterpriseRES.delta} this week</span>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">PRA SREP</div>
                  <div className="text-2xl font-bold text-slate-900">Cat {metrics.enterpriseRES.praSREPCategory}</div>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-4">
              <Sparkline series={metrics.enterpriseRES.sparklineSeries} band={metrics.enterpriseRES.band} width={400} height={50} fill />
              <div className="pb-1 text-xs text-slate-500">13 weeks</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">My Reasonable Steps · SMF4</div>
                <div className="mt-0.5 text-base font-semibold text-slate-900">{cromSMF?.name || '—'}</div>
                <div className="text-xs text-slate-500">{cromSMF?.functionLabel}</div>
              </div>
              {trail && <StatusBadge tone={trail.rss.band} label={`RSS ${trail.rss.score}`} />}
            </div>
            {trail && cromSMF && (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2">
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
                  className="w-full rounded-md border border-indigo-200 bg-indigo-50 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  Open my Reasonable Steps Workspace →
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Domain Heat Map</h3>
              <span className="text-[10px] text-slate-500">click a domain to drill</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {riskDomains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => openDrawer('risk', d.primaryDriverRiskId, 'riskPosture')}
                  className={`rounded-lg border-2 p-3 text-left transition hover:shadow-md ${(() => {
                    const b = d.resBand as string;
                    return (
                      {
                        red: 'bg-rose-50 border-rose-300 text-rose-900',
                        amber: 'bg-amber-50 border-amber-300 text-amber-900',
                        green: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                        neutral: 'bg-slate-50 border-slate-300 text-slate-700',
                      }[b] || 'bg-slate-50 border-slate-300 text-slate-700'
                    );
                  })()}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="text-xs font-medium">{d.label}</div>
                    <span className={`text-xs ${trendTone(d.trend)}`}>{trendArrow(d.trend)}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold">{d.res}</div>
                  <Sparkline series={d.resSparklineSeries} band={d.resBand} width={90} height={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">What Changed This Week</h3>
            <div className="space-y-2">
              {aiInsights
                .filter((i) => i.type === 'what_changed' || i.type === 'anomaly' || i.type === 'root_cause')
                .slice(0, 3)
                .map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => openDrawer('aiInsight', i.id, 'riskPosture')}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30"
                  >
                    <div className="mb-1 flex items-start gap-2">
                      <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">AI</span>
                      <StatusBadge
                        tone={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'amber' : 'green'}
                        label={i.severity.toUpperCase()}
                        size="xs"
                      />
                      <span className="ml-auto text-[10px] text-slate-500">conf {Math.round(i.confidence * 100)}%</span>
                    </div>
                    <div className="mb-0.5 text-xs font-semibold text-slate-900">{i.title}</div>
                    <div className="line-clamp-2 text-[11px] text-slate-600">{i.summary}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Material Items Awaiting Decision</h3>
          <p className="text-xs text-slate-500">
            CRO inbox · {metrics.byPersona.cro.inboxItems.length} items
          </p>
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
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {item.type.replace('_', ' ')} · {item.ageDays}d open · → {item.targetEntityId}
                </div>
              </div>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${severityBadge(item.severity)}`}>
                {item.severity.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
