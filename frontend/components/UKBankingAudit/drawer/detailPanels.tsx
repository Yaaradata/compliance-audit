'use client';

import React from 'react';
import {
  aiInsights,
  getActor,
  getAuditPack,
  getControl,
  getControlInstance,
  getEvidence,
  getInsight,
  getIssue,
  getObligation,
  getProcessStep,
  getRisk,
  getSMF,
  issues,
  remediationActions,
} from '../dataModel';
import { EntityTypeBadge, EmptyState, KVRow, Stat, StatusBadge, ThreeDimSignalBars } from '../primitives';
import { bandBar, bandBg, bandText, severityBadge, trendArrow, trendTone } from '../theme';

export function RiskDetailContent({ risk, drillFromDrawer }: { risk: ReturnType<typeof getRisk>; drillFromDrawer: (t: string, id: string) => void }) {
  if (!risk) return <EmptyState message="Risk not found." />;
  const owner = getSMF(risk.accountableSMFId);
  const linkedIssues = issues.filter((i) => i.linkedRiskIds.includes(risk.id));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{risk.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{risk.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Domain" v={risk.domain.replace('_', ' ')} />
        <Stat k="Inherent" v={risk.inherentRating.toUpperCase()} />
        <Stat k="Residual" v={risk.residualRating.toUpperCase()} tone={risk.residualRating === 'high' ? 'rose' : risk.residualRating === 'medium' ? 'amber' : 'emerald'} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-baseline gap-3">
          <div className={`text-4xl font-bold ${bandText(risk.residualScore >= 70 ? 'red' : risk.residualScore >= 50 ? 'amber' : 'green')}`}>{risk.residualScore}</div>
          <div className="text-xs text-slate-500">Residual Exposure Score</div>
          <span className={`ml-auto text-xs font-medium ${trendTone(risk.trend)}`}>
            {trendArrow(risk.trend)} {risk.trend.replace('_', ' ')}
          </span>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">RES Decomposition</div>
          {Object.entries(risk.resDecomposition).map(([k, v]) => {
            const isBand = ['red', 'amber', 'green'].includes(String(v));
            return (
              <div key={k} className="flex items-center justify-between border-b border-slate-50 py-1 text-xs">
                <span className="text-slate-600">{k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                {isBand ? <StatusBadge tone={String(v)} label={String(v).toUpperCase()} size="xs" /> : <span className="font-bold text-slate-900">{String(v)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Accountable SMF</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-sm font-medium">{owner?.name}</div>
          <div className="text-xs text-slate-500">
            {owner?.functionLabel} · {owner?.smfFunction}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Linked Controls ({risk.linkedControlIds.length})</h3>
        <div className="space-y-1">
          {risk.linkedControlIds.map((cid) => {
            const c = getControl(cid);
            if (!c) return null;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => drillFromDrawer('control', cid)}
                className="w-full rounded border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">{c.id}</div>
                    <div className="truncate text-xs text-slate-600">{c.title}</div>
                  </div>
                  <div className={`rounded px-2 py-0.5 text-xs font-bold ${bandBg(c.ces.band)}`}>CES {c.ces.current}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {linkedIssues.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Open Issues ({linkedIssues.length})</h3>
          <div className="space-y-1">
            {linkedIssues.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => drillFromDrawer('issue', i.id)}
                className="w-full rounded border border-slate-200 p-3 text-left hover:border-indigo-300 hover:bg-indigo-50/30"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{i.id}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${severityBadge(i.severity)}`}>{i.severity.toUpperCase()}</span>
                </div>
                <div className="line-clamp-1 text-xs text-slate-800">{i.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {risk.linkedObligationIds.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Linked Obligations</h3>
          <div className="flex flex-wrap gap-1">
            {risk.linkedObligationIds.map((oid) => {
              const o = getObligation(oid);
              if (!o) return null;
              return (
                <button
                  key={oid}
                  type="button"
                  onClick={() => drillFromDrawer('obligation', oid)}
                  className="rounded border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700 hover:bg-purple-100"
                >
                  {o.citationShort}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ControlDetailContent({
  control,
  drillFromDrawer,
}: {
  control: ReturnType<typeof getControl>;
  drillFromDrawer: (t: string, id: string) => void;
}) {
  if (!control) return <EmptyState message="Control not found." />;
  const linkedInsights = aiInsights.filter((i) => i.relatedEntityIds?.some((r) => r.type === 'control' && r.id === control.id));
  const recentInstances = control.recentInstanceIds.map((id) => getControlInstance(id)).filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{control.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{control.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Type" v={control.controlType} />
        <Stat k="Nature" v={control.controlNature} />
        <Stat k="Frequency" v={control.frequency.replace('_', ' ')} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Three-Dimensional Effectiveness</h3>
        <ThreeDimSignalBars threeDim={control.threeDim} />
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-indigo-900">
              <div className="mb-0.5 font-bold">Composite Effectiveness Score</div>
              <div className="text-[10px] text-indigo-700">CES = 0.30 × Operating + 0.25 × Catch + 0.20 × Evidence + …</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${bandText(control.ces.band)}`}>{control.ces.current}</div>
              <div className={`text-[10px] ${trendTone(control.ces.trend)}`}>
                {trendArrow(control.ces.trend)} {control.ces.delta13w >= 0 ? '+' : ''}
                {control.ces.delta13w} pts (13w)
              </div>
            </div>
          </div>
        </div>
      </div>

      {control.observedVariantDriftFlag && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-700">⚠</span>
            <div>
              <div className="text-xs font-bold text-amber-900">Process Variant Drift Detected</div>
              <div className="mt-0.5 text-xs text-amber-800">{control.observedVariantNote}</div>
              <div className="mt-1 text-[10px] text-amber-700">
                Documented signature: <span className="font-mono">{control.documentedVariantSignature}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {recentInstances.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Recent Control Instances</h3>
          <div className="space-y-1">
            {recentInstances.slice(0, 6).map((ci) => {
              if (!ci) return null;
              const evMissing = ci.evidenceIds.length === 0;
              return (
                <button
                  key={ci.id}
                  type="button"
                  onClick={() => drillFromDrawer('evidence', evMissing ? ci.id : ci.evidenceIds[0])}
                  className="grid w-full grid-cols-12 items-center gap-2 rounded border border-slate-200 p-2 text-left text-xs hover:bg-slate-50"
                >
                  <span className="col-span-3 font-mono text-slate-700">{ci.id}</span>
                  <span className="col-span-3 text-slate-600">{ci.caseOrTransactionId}</span>
                  <span className="col-span-3">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ci.outcome === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {ci.outcome}
                    </span>
                  </span>
                  <span className="col-span-2 text-[10px] text-slate-500">EC {ci.evidenceCompletenessScore}%</span>
                  <span className="col-span-1 text-right text-indigo-600">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Linked Obligations</h3>
        <div className="flex flex-wrap gap-1">
          {control.linkedObligationIds.map((oid) => {
            const o = getObligation(oid);
            if (!o) return null;
            return (
              <button
                key={oid}
                type="button"
                onClick={() => drillFromDrawer('obligation', oid)}
                className="rounded border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700 hover:bg-purple-100"
              >
                {o.citationShort} · {o.regulator}
              </button>
            );
          })}
        </div>
      </div>

      {linkedInsights.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">AI Insights</h3>
          <div className="space-y-2">
            {linkedInsights.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => drillFromDrawer('aiInsight', i.id)}
                className="w-full rounded border border-violet-200 bg-violet-50/30 p-3 text-left hover:bg-violet-50"
              >
                <div className="mb-0.5 text-xs font-bold text-slate-900">{i.title}</div>
                <div className="line-clamp-2 text-[11px] text-slate-600">{i.summary}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ObligationDetailContent({
  obligation,
  drillFromDrawer,
}: {
  obligation: ReturnType<typeof getObligation>;
  drillFromDrawer: (t: string, id: string) => void;
}) {
  if (!obligation) return <EmptyState message="Obligation not found." />;
  const linkedIssues = issues.filter((i) => i.linkedObligationIds.includes(obligation.id));

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-800">{obligation.regulator}</span>
          <span className="font-mono text-xs text-slate-700">{obligation.citation}</span>
          {obligation.linkedPrescribedResponsibilities.map((pr) => (
            <span key={pr} className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              {pr}
            </span>
          ))}
          {obligation.consumerDutyRelevant && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">CONSUMER DUTY</span>
          )}
          {obligation.smcrRelevant && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">SMCR</span>}
        </div>
        <h2 className="text-base font-bold text-slate-900">{obligation.sourceInstrumentTitle}</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">{obligation.requirementText}</p>
        <a href={obligation.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[10px] text-indigo-600 hover:underline">
          View source instrument →
        </a>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-baseline gap-3">
          <div className={`text-3xl font-bold ${bandText(obligation.ocs.band)}`}>{obligation.ocs.score}</div>
          <div className="text-xs text-slate-500">Obligation Coverage Score</div>
          <StatusBadge tone={obligation.ocs.band} label={obligation.ocs.coverageStatus.replace('_', ' ').toUpperCase()} size="xs" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <KVRow k="Linked controls" v={obligation.ocs.linkedControlsCount} />
          <KVRow k="Mean linked CES" v={obligation.ocs.meanLinkedCES} />
          <KVRow k="Evidence freshness" v={`${obligation.ocs.evidenceFreshnessDays}d`} />
          <KVRow k="Evidence completeness" v={`${obligation.ocs.evidenceCompleteness}%`} />
        </div>
      </div>

      {obligation.ocs.coverageStatus === 'thinly_covered' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="mb-1 text-xs font-bold text-amber-900">⚠ Thinly Covered</div>
          <div className="text-xs text-amber-800">
            Only {obligation.ocs.linkedControlsCount} control(s) currently mitigate this obligation. Consider supplemental controls or compensating measures.
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Evidence Expectation</h3>
        <ul className="space-y-1">
          {obligation.evidenceExpectation.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
              <span className="mt-0.5 text-slate-400">·</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Linked Controls ({obligation.linkedControlIds.length})</h3>
        <div className="space-y-1">
          {obligation.linkedControlIds.map((cid) => {
            const c = getControl(cid);
            if (!c) return null;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => drillFromDrawer('control', cid)}
                className="flex w-full items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.id}</div>
                  <div className="truncate text-xs text-slate-600">{c.title}</div>
                </div>
                <div className={`rounded px-2 py-0.5 text-xs font-bold ${bandBg(c.ces.band)}`}>CES {c.ces.current}</div>
              </button>
            );
          })}
        </div>
      </div>

      {obligation.regulatoryChangeHistory.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Regulatory Change History</h3>
          <div className="space-y-1">
            {obligation.regulatoryChangeHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-2 rounded bg-slate-50 p-2 text-xs">
                <span className="font-mono text-slate-500">v{h.version}</span>
                <span className="text-slate-500">{h.effectiveFrom}</span>
                <span className="flex-1 text-slate-700">{h.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {linkedIssues.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Open Issues</h3>
          <div className="space-y-1">
            {linkedIssues.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => drillFromDrawer('issue', i.id)}
                className="w-full rounded border border-slate-200 p-2 text-left text-xs hover:bg-slate-50"
              >
                <span className="mr-2 font-mono text-slate-500">{i.id}</span>
                <span>{i.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function IssueDetailContent({ issue, drillFromDrawer }: { issue: ReturnType<typeof getIssue>; drillFromDrawer: (t: string, id: string) => void }) {
  if (!issue) return <EmptyState message="Issue not found." />;
  const owner = getActor(issue.ownerId);
  const smf = getSMF(issue.accountableSMFId);
  const remediations = remediationActions.filter((r) => r.issueId === issue.id);
  const siblings = issue.siblingIssueIds.map((sid) => getIssue(sid)).filter(Boolean);
  const linkedInsights = aiInsights.filter((i) => i.relatedEntityIds?.some((r) => r.type === 'issue' && r.id === issue.id));

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${severityBadge(issue.severity)}`}>{issue.severity.toUpperCase()}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{issue.source.replace(/_/g, ' ')}</span>
          <StatusBadge tone={(issue.status as string) === 'closed' ? 'green' : 'amber'} label={issue.status.replace('_', ' ')} size="xs" />
          {issue.regulatoryReportableFlag && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">REGULATORY REPORTABLE</span>
          )}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{issue.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">{issue.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Days open" v={issue.daysOpen} tone={issue.daysOpen > 60 ? 'rose' : issue.daysOpen > 30 ? 'amber' : 'emerald'} />
        <Stat k="Raised" v={issue.raisedDate} />
        <Stat k="Target close" v={issue.targetCloseDate} />
      </div>

      {issue.rootCauseClusterId && (
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Root Cause Cluster</div>
          <div className="text-base font-bold text-slate-900">{issue.rootCauseClusterName}</div>
          <div className="mt-1 text-xs text-slate-700">{issue.rootCause}</div>
          {issue.pastClusterSuccessRate && <div className="mt-2 text-xs italic text-indigo-800">📊 {issue.pastClusterSuccessRate}</div>}
          {siblings.length > 0 && (
            <div className="mt-3 border-t border-indigo-200 pt-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Sibling issues in cluster ({siblings.length})</div>
              <div className="space-y-1">
                {siblings.map((s) =>
                  s ? (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => drillFromDrawer('issue', s.id)}
                      className="w-full rounded border border-indigo-200 bg-white p-2 text-left text-xs hover:border-indigo-400"
                    >
                      <span className="mr-2 font-mono text-slate-500">{s.id}</span>
                      <span>{s.title}</span>
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Owner & Accountable SMF</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] text-slate-500">Owner</div>
            <div className="text-sm font-medium">{owner?.name || '—'}</div>
            <div className="text-[10px] text-slate-500">{owner?.role}</div>
          </div>
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] text-slate-500">Accountable SMF</div>
            <div className="text-sm font-medium">{smf?.name || '—'}</div>
            <div className="text-[10px] text-slate-500">{smf?.smfFunction}</div>
          </div>
        </div>
      </div>

      {issue.linkedControlInstanceIds.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Empirical Evidence ({issue.linkedControlInstanceIds.length} substantiating instances)</h3>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {issue.linkedControlInstanceIds.slice(0, 6).map((ciId) => {
              const ci = getControlInstance(ciId);
              if (!ci) return null;
              return (
                <button
                  key={ciId}
                  type="button"
                  onClick={() => drillFromDrawer('evidence', ci.evidenceIds[0] || ciId)}
                  className="flex w-full items-center gap-2 rounded border border-slate-200 p-2 text-left text-xs hover:bg-slate-50"
                >
                  <span className="font-mono text-slate-600">{ci.id}</span>
                  <span className="text-slate-500">·</span>
                  <span className="truncate text-slate-700">{ci.caseOrTransactionId}</span>
                  <span
                    className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      ci.evidenceIds.length === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ci.evidenceIds.length === 0 ? 'missing' : 'incomplete'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {remediations.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Remediation Actions ({remediations.length})</h3>
          <div className="space-y-2">
            {remediations.map((r) => {
              const aOwner = getActor(r.ownerId);
              return (
                <div key={r.id} className="rounded border border-slate-200 p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-slate-500">{r.id}</span>
                    <StatusBadge
                      tone={(r.status as string) === 'closed' ? 'green' : (r.status as string) === 'slipped' ? 'red' : 'amber'}
                      label={r.status.replace('_', ' ')}
                      size="xs"
                    />
                  </div>
                  <div className="mb-1 text-xs text-slate-800">{r.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      {aOwner?.name} · due {r.dueDate}
                    </span>
                    {r.validationStatus && (
                      <span className={(r.validationStatus as string) === 'validated' ? 'font-bold text-emerald-600' : ''}>{r.validationStatus}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {linkedInsights.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">AI Insights</h3>
          {linkedInsights.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => drillFromDrawer('aiInsight', i.id)}
              className="mb-2 w-full rounded border border-violet-200 bg-violet-50/30 p-3 text-left hover:bg-violet-50"
            >
              <div className="mb-0.5 text-xs font-bold text-slate-900">{i.title}</div>
              <div className="line-clamp-2 text-[11px] text-slate-600">{i.summary}</div>
            </button>
          ))}
        </div>
      )}

      {issue.linkedRiskIds.length + issue.linkedObligationIds.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Linked Entities</h3>
          <div className="flex flex-wrap gap-1">
            {issue.linkedRiskIds.map((rid) => (
              <button
                key={rid}
                type="button"
                onClick={() => drillFromDrawer('risk', rid)}
                className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
              >
                Risk · {rid}
              </button>
            ))}
            {issue.linkedObligationIds.map((oid) => (
              <button
                key={oid}
                type="button"
                onClick={() => drillFromDrawer('obligation', oid)}
                className="rounded border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700 hover:bg-purple-100"
              >
                Obligation · {getObligation(oid)?.citationShort || oid}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EvidenceDetailContent({ entityId }: { entityId: string }) {
  let evidence = getEvidence(entityId);
  let placeholderInstance = null as ReturnType<typeof getControlInstance> | null;
  if (!evidence) {
    const ci = getControlInstance(entityId);
    if (ci) placeholderInstance = ci;
  }

  if (placeholderInstance) {
    const ci = placeholderInstance;
    const c = getControl(ci.controlId);
    const step = getProcessStep(ci.stepId);
    return (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">⚠</span>
            <div>
              <div className="text-base font-bold text-rose-900">Evidence Missing</div>
              <div className="text-xs text-rose-700">Control fired but evidence was not captured.</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <KVRow k="Control instance" v={ci.id} />
            <KVRow k="Case / Tx" v={ci.caseOrTransactionId} />
            <KVRow k="Control" v={`${c?.id} · ${c?.title}`} />
            <KVRow k="Step" v={step?.name || '—'} />
            <KVRow k="Operator" v={getActor(ci.operatorId)?.name} />
            <KVRow k="Outcome" v={ci.outcome} tone="rose" />
          </div>
          {ci.missingFields?.length > 0 && (
            <div className="mt-3 rounded border border-rose-200 bg-white p-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">Missing required fields</div>
              <ul className="space-y-0.5">
                {ci.missingFields.map((f, i) => (
                  <li key={i} className="text-xs text-rose-900">
                    · {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-2 text-[10px] text-rose-700">
            Expected standard: <span className="font-mono">{ci.expectedEvidenceStandardId}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!evidence) return <EmptyState message="Evidence not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-sky-800">{evidence.evidenceType.toUpperCase()}</span>
          {evidence.s166Ready && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">s.166 READY</span>}
          {evidence.consumerDutyRelevant && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">CONSUMER DUTY</span>}
        </div>
        <h2 className="break-all text-base font-bold text-slate-900">{evidence.id}</h2>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Payload preview</div>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800">{evidence.payloadPreview}</pre>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Provenance</h3>
        <div className="space-y-2 text-xs">
          <KVRow k="Source system" v={evidence.sourceSystem} />
          <KVRow k="Created" v={new Date(evidence.createdTs).toLocaleString('en-GB')} />
          <KVRow k="Ingested" v={new Date(evidence.ingestedTs).toLocaleString('en-GB')} />
          <KVRow k="Collection" v={evidence.collectionMethod} />
          <KVRow k="Hash" v={<span className="font-mono text-[10px]">{evidence.payloadHash}</span>} />
          <KVRow k="Hash verified" v={evidence.hashVerified ? '✓ Yes' : '✗ No'} tone={evidence.hashVerified ? 'green' : 'red'} />
          <KVRow k="Chain of custody" v={evidence.chainOfCustodyStatus} tone={evidence.chainOfCustodyStatus === 'intact' ? 'green' : 'red'} />
          <KVRow k="Retention" v={`${evidence.retentionClass.replace('_', ' ')} · expires ${evidence.retentionExpiry}`} />
          <KVRow k="Standard" v={evidence.evidenceStandardId} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Evidence Completeness</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <div className={`text-3xl font-bold ${bandText(evidence.evidenceCompletenessScore >= 80 ? 'green' : evidence.evidenceCompletenessScore >= 60 ? 'amber' : 'red')}`}>
              {evidence.evidenceCompletenessScore}%
            </div>
            <span className="text-[10px] text-slate-500">{evidence.evidenceFreshnessDays}d old</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${(() => {
                const b = evidence.evidenceCompletenessScore >= 80 ? 'green' : evidence.evidenceCompletenessScore >= 60 ? 'amber' : 'red';
                return bandBar(b);
              })()}`}
              style={{ width: `${evidence.evidenceCompletenessScore}%` }}
            />
          </div>
          {evidence.missingFields.length > 0 && (
            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Missing fields</div>
              <ul className="text-xs text-amber-900">
                {evidence.missingFields.map((f, i) => (
                  <li key={i}>
                    · {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Regulator Readiness</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded border p-2 text-center ${evidence.regulatorReady ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider">Regulator</div>
            <div className="mt-1 text-sm font-bold">{evidence.regulatorReady ? '✓ Ready' : 'Pending'}</div>
          </div>
          <div className={`rounded border p-2 text-center ${evidence.s166Ready ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider">s.166</div>
            <div className="mt-1 text-sm font-bold">{evidence.s166Ready ? '✓ Ready' : 'Pending'}</div>
          </div>
        </div>
      </div>

      {evidence.linkedAuditPackIds.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Linked Audit Packs</h3>
          <div className="space-y-1">
            {evidence.linkedAuditPackIds.map((pid) => {
              const p = getAuditPack(pid);
              if (!p) return null;
              return (
                <div key={pid} className="rounded border border-slate-200 p-2 text-xs">
                  <div className="font-mono text-slate-700">{p.id}</div>
                  <div className="text-[10px] text-slate-500">{p.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SmfDetailContent({
  smf,
  setSelectedSMFId,
  setActiveScreen,
  closeDrawer,
}: {
  smf: ReturnType<typeof getSMF>;
  setSelectedSMFId: (id: string) => void;
  setActiveScreen: (s: string) => void;
  closeDrawer: () => void;
}) {
  if (!smf) return <EmptyState message="SMF not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">{smf.smfFunction}</span>
          {smf.prescribedResponsibilities.map((pr) => (
            <span key={pr} className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
              {pr}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{smf.name}</h2>
        <div className="text-sm text-slate-700">{smf.functionLabel}</div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-2 flex items-baseline gap-3">
          <div className={`text-4xl font-bold ${bandText(smf.rss.band)}`}>{smf.rss.score}</div>
          <div className="text-xs text-slate-500">Reasonable Steps Score</div>
          <StatusBadge tone={smf.rss.band} label={smf.rss.band.toUpperCase()} size="xs" />
        </div>
        <div className="space-y-1.5">
          {Object.entries(smf.rss.components).map(([k, v]) => {
            const t = v >= 80 ? 'green' : v >= 60 ? 'amber' : 'red';
            return (
              <div key={k}>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">{k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                  <span className={`font-bold ${bandText(t)}`}>{v}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${bandBar(t)}`} style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat k="Processes" v={smf.accountableProcessIds.length} />
        <Stat k="Controls" v={smf.accountableControlIds.length} />
        <Stat k="Obligations" v={smf.accountableObligationIds.length} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <KVRow k="Last attestation" v={smf.lastAttestationDate} />
        <KVRow k="Next due" v={smf.nextAttestationDue} />
        <KVRow k="Conduct breaches" v={smf.conductRuleBreaches} tone={smf.conductRuleBreaches === 0 ? 'green' : 'red'} />
        <KVRow k="Appointed" v={smf.appointmentDate} />
      </div>

      <button
        type="button"
        onClick={() => {
          setSelectedSMFId(smf.id);
          setActiveScreen('smcrWorkspace');
          closeDrawer();
        }}
        className="w-full rounded bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700"
      >
        Open in SMCR Workspace →
      </button>
    </div>
  );
}

export function AuditPackDetailContent({
  pack,
  setSelectedPackId,
  setActiveScreen,
  closeDrawer,
}: {
  pack: ReturnType<typeof getAuditPack>;
  setSelectedPackId: (id: string) => void;
  setActiveScreen: (s: string) => void;
  closeDrawer: () => void;
}) {
  if (!pack) return <EmptyState message="Pack not found." />;
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">{pack.scopeType.replace(/_/g, ' ').toUpperCase()}</span>
          <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">{pack.targetAudience.toUpperCase()}</span>
        </div>
        <h2 className="text-base font-bold text-slate-900">{pack.title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <KVRow k="Window" v={`${pack.timeWindowStart} → ${pack.timeWindowEnd}`} />
        <KVRow k="As-of" v={pack.asOfStateDate} />
        <KVRow k="Total entities" v={pack.composition.totalEntities.toLocaleString()} />
        <KVRow k="Readiness" v={pack.readinessStatus.replace('_', ' ')} tone="amber" />
      </div>
      <div className="line-clamp-6 text-xs leading-relaxed text-slate-700">{pack.generatedNarrative}</div>
      <button
        type="button"
        onClick={() => {
          setSelectedPackId(pack.id);
          setActiveScreen('auditPackBuilder');
          closeDrawer();
        }}
        className="w-full rounded bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700"
      >
        Open in Pack Builder →
      </button>
    </div>
  );
}

type AIInsight = NonNullable<ReturnType<typeof getInsight>>;

export function AiInsightDetailContent({
  insight,
  drillFromDrawer,
}: {
  insight: AIInsight;
  drillFromDrawer: (t: string, id: string) => void;
}) {
  if (!insight) return <EmptyState message="Insight not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-800">AI · {insight.type.replace('_', ' ')}</span>
          <StatusBadge
            tone={insight.severity === 'high' ? 'red' : insight.severity === 'medium' ? 'amber' : 'green'}
            label={insight.severity.toUpperCase()}
            size="xs"
          />
          <span className="text-[10px] text-slate-500">conf {Math.round(insight.confidence * 100)}%</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{insight.title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">{insight.summary}</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Model Lineage</h3>
        <div className="space-y-1 rounded-lg border border-slate-200 p-3 text-xs">
          <KVRow k="Model" v={insight.modelId} />
          <KVRow k="Version" v={insight.modelVersion} />
          <KVRow k="Generated" v={new Date(insight.generatedAt).toLocaleString('en-GB')} />
          <KVRow
            k="Independence"
            v={!insight.independenceLineage.inputsFromLOD1 && !insight.independenceLineage.inputsFromLOD2 ? '✓ 3LoD-clean' : 'Mixed'}
            tone={!insight.independenceLineage.inputsFromLOD1 && !insight.independenceLineage.inputsFromLOD2 ? 'green' : 'amber'}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Methodology</h3>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">{insight.methodology}</div>
      </div>

      {insight.sourceRecordIds?.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Source Records ({insight.sourceRecordIds.length})</h3>
          <div className="space-y-1">
            {insight.sourceRecordIds.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => drillFromDrawer(s.type, s.id)}
                className="flex w-full items-center gap-2 rounded border border-slate-200 p-2 text-left text-xs hover:border-indigo-300 hover:bg-indigo-50/30"
              >
                <EntityTypeBadge type={s.type} />
                <span className="font-mono text-slate-600">{s.id}</span>
                <span className="flex-1 truncate text-slate-700">{s.label}</span>
                <span className="text-indigo-600">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {insight.counterfactual && (
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">Counterfactual</div>
          <div className="text-xs leading-relaxed text-emerald-900">{insight.counterfactual}</div>
        </div>
      )}

      {insight.inputsNotSeen?.length > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Inputs Not Seen by Model</div>
          <ul className="space-y-0.5 text-xs text-amber-900">
            {insight.inputsNotSeen.map((x, i) => (
              <li key={i}>· {x}</li>
            ))}
          </ul>
          <div className="mt-2 text-[10px] italic text-amber-700">Human judgement should weight these factors before acting on this insight.</div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Human Action</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-600">Status</span>
            <StatusBadge
              tone={insight.humanActionStatus === 'acknowledged' || insight.humanActionStatus === 'actioned' ? 'green' : 'amber'}
              label={insight.humanActionStatus.replace(/_/g, ' ')}
              size="xs"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="flex-1 rounded bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700">
              Acknowledge
            </button>
            <button type="button" className="flex-1 rounded border border-slate-200 bg-white py-2 text-xs font-medium hover:bg-slate-50">
              Reject with rationale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
