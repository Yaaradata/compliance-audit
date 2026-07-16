// @ts-nocheck
'use client';

import { useState, useMemo, useCallback } from 'react';
import { getUkAuditUi, RssDecomposition } from '@/components/UKBankingAudit/v3';
import {
  smfHolders,
  getSMF,
  getObligation,
  getIssue,
  getKRI,
  getAppetite,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import {
  EmptyState,
  EntityTypeBadge,
  StatusBadge,
  bandText,
  bandBar,
} from './_shared';
import {
  PrecedentAwarenessPanel,
} from '@/components/UKBankingAudit/v5/smcr';
import type { SmcrTrailEvent } from '@/lib/ukbankingaudit/v5/smcrPrecedentAwareness';
import { useBoardRole } from '@/components/UKBankingAudit/v5/boardRoleContext';
import { recordAcknowledgement } from '@/lib/ukbankingaudit/v5/dispositions';
import { v5RefKind } from '@/lib/ukbankingaudit/v5/refRouter';

export function SMCRReasonableStepsWorkspaceV5({ variant = 'v2', selectedSMFId, setSelectedSMFId, smfTrails, pendingDecisionId, setPendingDecisionId, decisionRationale, setDecisionRationale, captureSMFDecision, openDrawer, setActiveScreen, setSelectedPackId }) {
  const ui = getUkAuditUi(variant === 'v4' || variant === 'v5' ? 'v3' : variant);
  const smf = getSMF(selectedSMFId);
  const [awarenessTrail, setAwarenessTrail] = useState<SmcrTrailEvent[]>([]);
  const boardRole = useBoardRole();
  const live = smfTrails[selectedSMFId];

  const mergedTrail = useMemo(
    () => [...awarenessTrail, ...(live?.trail ?? [])],
    [awarenessTrail, live?.trail],
  );

  const openEvidence = useCallback(
    (ref: string) => {
      openDrawer?.(v5RefKind(ref), ref, 'smcrWorkspace');
    },
    [openDrawer],
  );

  const acknowledgePrecedent = useCallback((precedentId: string, rationale: string) => {
    if (!smf) return;
    const result = recordAcknowledgement({
      role: boardRole,
      actorId: smf.id,
      reason: rationale,
      precedentId,
    });
    if (!result.ok) return;
    const entry: SmcrTrailEvent = {
      timestamp: result.entry.ts,
      eventType: 'awareness',
      label: `Acknowledged Final Notice ${precedentId}: ${rationale}`,
      evidenceId: `PREC-${precedentId}`,
      precedentId,
    };
    setAwarenessTrail((prev) => [entry, ...prev]);
  }, [boardRole, smf]);

  if (!smf || !live) return <EmptyState message="Select an SMF." />;
  const rss = live.rss;
  const rssComponents = ui.rssComponents;

  return (
    <div className="space-y-6">
      {/* SMF identity card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EntityTypeBadge type="smf" />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-600">{smf.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{smf.name}</h2>
            <div className="text-sm text-slate-700 mt-0.5">{smf.functionLabel}</div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{smf.smfFunction}</span>
              {smf.prescribedResponsibilities.map(pr => (
                <span key={pr} className="text-[10px] font-bold tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{pr}</span>
              ))}
              <span className="text-[10px] text-slate-500">SoR v{smf.sorVersion} · {smf.sorEffectiveFrom}</span>
              <span className="text-[10px] text-slate-500">MRM ref {smf.managementResponsibilitiesMapRef}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${bandText(rss.band)}`}>{rss.score}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">RSS</div>
            <StatusBadge tone={rss.band} label={rss.band.toUpperCase()} size="xs" />
          </div>
        </div>

        {/* SMF picker */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] text-slate-500">View SMF:</span>
          {smfHolders.map(s => (
            <button key={s.id} onClick={() => setSelectedSMFId(s.id)}
              className={`px-2.5 py-1 text-xs rounded ${selectedSMFId === s.id ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s.smfFunction}
            </button>
          ))}
        </div>
      </div>

      <PrecedentAwarenessPanel
        smf={{
          id: smf.id,
          smfFunction: smf.smfFunction,
          lastAttestationDate: smf.lastAttestationDate,
          accountableControlIds: smf.accountableControlIds,
        }}
        trail={mergedTrail}
        onAcknowledge={acknowledgePrecedent}
        onOpenEvidence={openEvidence}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* RSS decomposition */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RssDecomposition components={rss.components} defs={rssComponents} bandText={bandText} bandBar={bandBar} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Accountability Boundary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableProcessIds.length}</div>
                <div className="text-[10px] text-slate-500">Processes</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableControlIds.length}</div>
                <div className="text-[10px] text-slate-500">Controls</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableObligationIds.length}</div>
                <div className="text-[10px] text-slate-500">Obligations</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">SoR Reference</h3>
            <div className="text-xs space-y-1 text-slate-700">
              <div>SoR version: <span className="font-mono">v{smf.sorVersion}</span></div>
              <div>Effective: <span className="font-mono">{smf.sorEffectiveFrom}</span></div>
              <div>Last attestation: <span className="font-mono">{smf.lastAttestationDate}</span></div>
              <div>Conduct rule breaches: <span className={`font-bold ${smf.conductRuleBreaches === 0 ? "text-emerald-600" : "text-rose-600"}`}>{smf.conductRuleBreaches}</span></div>
            </div>
          </div>
        </div>

        {/* Centre: Awaiting acks + capture */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Awaiting My Acknowledgement ({live.awaiting.length})</h3>
              {live.awaiting.length === 0 && <StatusBadge tone="green" label="ALL CLEAR" size="xs" />}
            </div>
            <div className="divide-y divide-slate-100">
              {live.awaiting.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No items awaiting acknowledgement.</div>
              ) : (
                live.awaiting.map((a, idx) => {
                  const target = a.targetType === "issue" ? getIssue(a.targetId) : a.targetType === "appetite_breach" ? getAppetite(a.targetId) : getKRI(a.targetId);
                  const isExpanded = pendingDecisionId === a.targetId;
                  return (
                    <div key={a.targetId + idx} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{a.targetType.replace("_", " ")}</span>
                            <span className="text-xs font-mono text-slate-700">{a.targetId}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.daysOpen > 30 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{a.daysOpen}d open</span>
                          </div>
                          <div className="text-sm text-slate-900">{target?.title || target?.metric || target?.name || "—"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Raised {a.raisedDate}</div>
                        </div>
                        <button onClick={() => setPendingDecisionId(isExpanded ? null : a.targetId)}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md flex-shrink-0">
                          {isExpanded ? "Cancel" : "Capture decision"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <textarea value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)}
                            placeholder="Capture your reasonable-steps rationale: what you knew, what you did, what evidence supports the decision…"
                            className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" rows={3} />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setPendingDecisionId(null); setDecisionRationale(""); }}
                              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                            <button onClick={() => captureSMFDecision(selectedSMFId, a)} disabled={!decisionRationale.trim()}
                              className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded disabled:bg-slate-300 disabled:cursor-not-allowed">
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

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold">Reasonable Steps Trail</h3>
              <p className="text-[10px] text-slate-500">Chronological · click any event to drill to evidence</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {mergedTrail.map((t, idx) => (
                <button key={idx} onClick={() => t.evidenceId && openEvidence(t.evidenceId)}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 transition flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">{t.eventType}</span>
                      <span className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="text-xs text-slate-800">{t.label}</div>
                    {t.evidenceId && <div className="text-[10px] font-mono text-indigo-600 mt-0.5">→ {t.evidenceId}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: actions + accountable obligations */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Accountable Obligations</h3>
            <div className="space-y-1">
              {smf.accountableObligationIds.map(oid => {
                const o = getObligation(oid);
                if (!o) return null;
                return (
                  <button key={oid} onClick={() => openDrawer("obligation", oid, "smcrWorkspace")}
                    className="w-full text-left p-2 rounded hover:bg-slate-50 text-xs">
                    <div className="font-medium text-slate-900">{o.citationShort}</div>
                    <div className="text-[10px] text-slate-500">{o.regulator} · OCS {o.ocs.score}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => { setSelectedPackId("AP-S165-FCC-001"); setActiveScreen("monitoringReportBuilder"); }}
            className="w-full p-3 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md">
            Generate s.166 Reasonable Steps Pack →
          </button>
        </div>
      </div>
    </div>
  );
}
