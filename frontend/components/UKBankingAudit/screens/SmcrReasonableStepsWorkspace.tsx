'use client';

import React from 'react';
import { getActor, getAppetite, getIssue, getKRI, getObligation, getSMF, smfHolders } from '../dataModel';
import { EmptyState, EntityTypeBadge, StatusBadge } from '../primitives';
import { bandBar, bandText } from '../theme';

type OpenDrawer = (entityType: string, entityId: string, sourceScreen: string) => void;

type TrailState = {
  awaiting: { targetType: string; targetId: string; daysOpen: number; raisedDate: string }[];
  trail: { timestamp: string; eventType: string; label: string; evidenceId: string | null }[];
  rss: { score: number; band: string; components: Record<string, number> };
};

export function SmcrReasonableStepsWorkspace({
  selectedSMFId,
  setSelectedSMFId,
  smfTrails,
  pendingDecisionId,
  setPendingDecisionId,
  decisionRationale,
  setDecisionRationale,
  captureSMFDecision,
  openDrawer,
  setActiveScreen,
  setSelectedPackId,
}: {
  selectedSMFId: string;
  setSelectedSMFId: (id: string) => void;
  smfTrails: Record<string, TrailState>;
  pendingDecisionId: string | null;
  setPendingDecisionId: (id: string | null) => void;
  decisionRationale: string;
  setDecisionRationale: (s: string) => void;
  captureSMFDecision: (smfId: string, awaiting: TrailState['awaiting'][0]) => void;
  openDrawer: OpenDrawer;
  setActiveScreen: (s: string) => void;
  setSelectedPackId: (id: string) => void;
}) {
  const smf = getSMF(selectedSMFId);
  if (!smf) return <EmptyState message="Select an SMF." />;
  const live = smfTrails[selectedSMFId];
  if (!live) return <EmptyState message="Select an SMF." />;
  const rss = live.rss;

  const rssComponents = [
    { key: 'oversightCadenceEvidence', label: 'Oversight Cadence' },
    { key: 'escalationEvidence', label: 'Escalation' },
    { key: 'attestationFreshness', label: 'Attestation Freshness' },
    { key: 'issueAwareness', label: 'Issue Awareness' },
    { key: 'decisionLogCompleteness', label: 'Decision Log' },
    { key: 'mrmAlignment', label: 'MRM Alignment' },
    { key: 'sorAlignment', label: 'SoR Alignment' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <EntityTypeBadge type="smf" />
              <span className="text-xs text-slate-500">·</span>
              <span className="font-mono text-xs text-slate-600">{smf.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{smf.name}</h2>
            <div className="mt-0.5 text-sm text-slate-700">{smf.functionLabel}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-800">{smf.smfFunction}</span>
              {smf.prescribedResponsibilities.map((pr) => (
                <span key={pr} className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-800">
                  {pr}
                </span>
              ))}
              <span className="text-[10px] text-slate-500">
                SoR v{smf.sorVersion} · {smf.sorEffectiveFrom}
              </span>
              <span className="text-[10px] text-slate-500">MRM ref {smf.managementResponsibilitiesMapRef}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${bandText(rss.band)}`}>{rss.score}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">RSS</div>
            <StatusBadge tone={rss.band} label={rss.band.toUpperCase()} size="xs" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-[10px] text-slate-500">View SMF:</span>
          {smfHolders.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSMFId(s.id)}
              className={`rounded px-2.5 py-1 text-xs ${selectedSMFId === s.id ? 'bg-indigo-100 font-medium text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s.smfFunction}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">RSS Decomposition</h3>
            <div className="space-y-2">
              {rssComponents.map((c) => {
                const v = rss.components[c.key];
                const t = v >= 80 ? 'green' : v >= 60 ? 'amber' : 'red';
                return (
                  <div key={c.key}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="text-slate-700">{c.label}</span>
                      <span className={`font-bold ${bandText(t)}`}>{v}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${bandBar(t)}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Accountability Boundary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-slate-50 p-2">
                <div className="text-lg font-bold text-slate-900">{smf.accountableProcessIds.length}</div>
                <div className="text-[10px] text-slate-500">Processes</div>
              </div>
              <div className="rounded bg-slate-50 p-2">
                <div className="text-lg font-bold text-slate-900">{smf.accountableControlIds.length}</div>
                <div className="text-[10px] text-slate-500">Controls</div>
              </div>
              <div className="rounded bg-slate-50 p-2">
                <div className="text-lg font-bold text-slate-900">{smf.accountableObligationIds.length}</div>
                <div className="text-[10px] text-slate-500">Obligations</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">SoR Reference</h3>
            <div className="space-y-1 text-xs text-slate-700">
              <div>
                SoR version: <span className="font-mono">v{smf.sorVersion}</span>
              </div>
              <div>
                Effective: <span className="font-mono">{smf.sorEffectiveFrom}</span>
              </div>
              <div>
                Last attestation: <span className="font-mono">{smf.lastAttestationDate}</span>
              </div>
              <div>
                Conduct rule breaches:{' '}
                <span className={`font-bold ${smf.conductRuleBreaches === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{smf.conductRuleBreaches}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Awaiting My Acknowledgement ({live.awaiting.length})</h3>
              {live.awaiting.length === 0 && <StatusBadge tone="green" label="ALL CLEAR" size="xs" />}
            </div>
            <div className="divide-y divide-slate-100">
              {live.awaiting.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No items awaiting acknowledgement.</div>
              ) : (
                live.awaiting.map((a, idx) => {
                  const target =
                    a.targetType === 'issue'
                      ? getIssue(a.targetId)
                      : a.targetType === 'appetite_breach'
                        ? getAppetite(a.targetId)
                        : getKRI(a.targetId);
                  const isExpanded = pendingDecisionId === a.targetId;
                  return (
                    <div key={a.targetId + idx} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {a.targetType.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-xs text-slate-700">{a.targetId}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${a.daysOpen > 30 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}
                            >
                              {a.daysOpen}d open
                            </span>
                          </div>
                          <div className="text-sm text-slate-900">
                            {target && 'title' in target && target.title
                              ? target.title
                              : target && 'metric' in target
                                ? (target as { metric?: string }).metric
                                : target && 'name' in target
                                  ? (target as { name?: string }).name
                                  : '—'}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">Raised {a.raisedDate}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingDecisionId(isExpanded ? null : a.targetId)}
                          className="flex-shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          {isExpanded ? 'Cancel' : 'Capture decision'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <textarea
                            value={decisionRationale}
                            onChange={(e) => setDecisionRationale(e.target.value)}
                            placeholder="Capture your reasonable-steps rationale: what you knew, what you did, what evidence supports the decision…"
                            className="w-full rounded border border-slate-200 p-2 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            rows={3}
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPendingDecisionId(null);
                                setDecisionRationale('');
                              }}
                              className="rounded px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => captureSMFDecision(selectedSMFId, a)}
                              disabled={!decisionRationale.trim()}
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Sign & lodge
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">Reasonable Steps Trail</h3>
              <p className="text-[10px] text-slate-500">Chronological · click any event to drill to evidence</p>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {live.trail.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => t.evidenceId && openDrawer('evidence', t.evidenceId, 'smcrWorkspace')}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">{t.eventType}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(t.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800">{t.label}</div>
                    {t.evidenceId && <div className="mt-0.5 font-mono text-[10px] text-indigo-600">→ {t.evidenceId}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Accountable Obligations</h3>
            <div className="space-y-1">
              {smf.accountableObligationIds.map((oid) => {
                const o = getObligation(oid);
                if (!o) return null;
                return (
                  <button
                    key={oid}
                    type="button"
                    onClick={() => openDrawer('obligation', oid, 'smcrWorkspace')}
                    className="w-full rounded p-2 text-left text-xs hover:bg-slate-50"
                  >
                    <div className="font-medium text-slate-900">{o.citationShort}</div>
                    <div className="text-[10px] text-slate-500">
                      {o.regulator} · OCS {o.ocs.score}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPackId('AP-S165-FCC-001');
              setActiveScreen('auditPackBuilder');
            }}
            className="w-full rounded-md bg-slate-900 p-3 text-xs font-medium text-white hover:bg-slate-800"
          >
            Generate s.166 Reasonable Steps Pack →
          </button>
        </div>
      </div>
    </div>
  );
}
