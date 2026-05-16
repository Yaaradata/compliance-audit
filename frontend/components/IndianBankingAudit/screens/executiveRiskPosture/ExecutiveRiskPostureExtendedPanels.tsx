'use client';

import {
  aggregateAITES,
  aggregateRTS,
  aggregateSAES,
  auditPacks,
  getControl,
  getInsight,
  getSeniorManager,
  incidents,
  inspectionLenses,
  issues,
  pacNotes,
  pendingAIInsights,
  preventiveActions,
  rcas,
  reportingClocks,
  seniorManagers,
} from '../../dataModel';
import { Chip, ScoreRing, SectionCard, SeverityBadge, Stat } from '../../primitives';
import { bandFromScore, oriCardHover, oriFocusRing } from '../../theme';
import type { OpenDrawer, OrmCrossNavIntent, SetActiveScreen } from '../../types';

const INC_CLOSED_HEART = new Set(['closed', 'closed_no_loss']);
const RCA_AWAIT_ORM = new Set(['under_review', 'hod_approval', 'spoc_review']);

function weekStartInclusive6Local() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 6);
  return d.getTime();
}

function parseDiscAgg(s: string) {
  return new Date(s.includes('T') ? s : `${s}T12:00:00`).getTime();
}

export function ExecutiveRiskPostureExtendedPanels({
  openDrawer,
  setActiveScreen,
  goOrm,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
  goOrm: (intent: OrmCrossNavIntent) => void;
}) {
  const rts = aggregateRTS();
  const saes = aggregateSAES();
  const aites = aggregateAITES();

  const tWeek = weekStartInclusive6Local();
  const criticalIncidents7d = incidents.filter(
    (i) =>
      !INC_CLOSED_HEART.has(i.status) &&
      (i.severity === 'high' || i.severity === 'critical') &&
      parseDiscAgg(i.discovered_date) >= tWeek
  ).length;

  const rcasAwaitingApproval = rcas.filter((r) => RCA_AWAIT_ORM.has(r.status || '')).length;

  const openPaIds = new Set(preventiveActions.filter((p) => p.status === 'open').map((p) => p.preventive_action_id));
  const pacNotesBlocked = pacNotes.filter((pn) =>
    (pn.blocking_preventive_action_ids || []).some((id) => openPaIds.has(id))
  ).length;

  const top5Issues = [...issues]
    .sort((a, b) => {
      const w = (i: typeof a) =>
        (i.severity === 'high' ? 100 : i.severity === 'medium' ? 50 : 10) +
        i.ageing_days +
        (i.rbi_mra_flag ? 80 : 0);
      return w(b) - w(a);
    })
    .slice(0, 5);

  const atRiskClocks = reportingClocks.filter((c) => c.current_status === 'at_risk');

  return (
    <>
      <SectionCard title="Governance health" subtitle="Reporting timeliness · senior accountability evidence · AI trust (secondary lens)">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Stat size="compact" k="RTS (reporting)" v={`${rts}%`} sub="on-time submissions" tone={rts >= 95 ? 'emerald' : rts >= 85 ? 'amber' : 'rose'} />
          <Stat size="compact" k="SAES (sr. mgmt)" v={saes} sub="senior accountability evidence" tone={saes >= 85 ? 'emerald' : saes >= 70 ? 'amber' : 'rose'} />
          <Stat size="compact" k="AITES (AI trust)" v={aites} sub="model-validated decisions" tone={aites >= 85 ? 'emerald' : aites >= 70 ? 'amber' : 'rose'} />
        </div>
      </SectionCard>

      <SectionCard title="This week's ORM heartbeat" subtitle="Deep-links apply filters on the destination screen">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => goOrm({ target: 'incidentRegister', preset: 'critical_incidents_7d' })}
            className={`rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${oriCardHover} ${oriFocusRing}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Critical incidents (7d)</div>
            <div className="mt-1 text-2xl font-bold text-rose-800">{criticalIncidents7d}</div>
            <div className="mt-2 text-xs text-indigo-700 underline">Open incident register →</div>
          </button>
          <button
            type="button"
            onClick={() => goOrm({ target: 'rcaWorkspace', preset: 'awaiting_approval' })}
            className={`rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${oriCardHover} ${oriFocusRing}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">RCAs awaiting approval</div>
            <div className="mt-1 text-2xl font-bold text-amber-900">{rcasAwaitingApproval}</div>
            <div className="mt-2 text-xs text-indigo-700 underline">Open RCA workspace →</div>
          </button>
          <button
            type="button"
            onClick={() => goOrm({ target: 'pacNoteApprovals', preset: 'blocked' })}
            className={`rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${oriCardHover} ${oriFocusRing}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PAC notes blocked</div>
            <div className="mt-1 text-2xl font-bold text-violet-900">{pacNotesBlocked}</div>
            <div className="mt-2 text-xs text-indigo-700 underline">Open PAC approvals →</div>
          </button>
        </div>
      </SectionCard>

      {atRiskClocks.length > 0 && (
        <SectionCard title="Reporting Clocks · at-risk" subtitle="STR / CTR / CSITE / FMR / CIMS — only clocks needing attention">
          <div className="flex flex-wrap gap-2">
            {atRiskClocks.map((c) => (
              <div key={c.clock_id} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs">
                <div className="font-semibold text-amber-900">{c.clock_label}</div>
                <div className="font-mono text-[10px] text-amber-700">
                  {c.clock_id} · {c.deadline_spec}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 [&>section]:h-[420px]">
          <SectionCard title="Issue Watchlist" subtitle="Top-5 ranked by severity × ageing × RBI MRA flag">
            <div className="h-[320px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Issue</th>
                    <th className="px-2 py-1.5 text-left">Linked CTRL</th>
                    <th className="px-2 py-1.5 text-left">Owner SM</th>
                    <th className="px-2 py-1.5 text-left">Severity</th>
                    <th className="px-2 py-1.5 text-right">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {top5Issues.map((iss) => {
                    const sm = getSeniorManager(iss.accountable_senior_manager_id);
                    const ctrl = iss.linked_control_ids[0] ? getControl(iss.linked_control_ids[0]) : null;
                    return (
                      <tr
                        key={iss.issue_id}
                        className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                        onClick={() => openDrawer('issue', iss.issue_id, 'riskPosture')}
                      >
                        <td className="px-2 py-2">
                          <div className="font-medium text-slate-900">{iss.title}</div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-slate-500">{iss.issue_id}</span>
                            {iss.rbi_mra_flag && <Chip label="RBI MRA" tone="rose" size="xs" />}
                            {iss.section_47a_exposure_flag && <Chip label="s.47A" tone="rose" size="xs" />}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-mono text-[10px] text-slate-600">{ctrl?.control_id || '—'}</td>
                        <td className="px-2 py-2 text-[11px] text-slate-700">{sm?.role || iss.accountable_senior_manager_id}</td>
                        <td className="px-2 py-2">
                          <SeverityBadge severity={iss.severity} />
                        </td>
                        <td className="px-2 py-2 text-right text-[11px] text-slate-600">{iss.ageing_days}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-1 [&>section]:h-[420px]">
          <SectionCard
            title="Supervisory readiness"
            subtitle="ARS per lens — click for pack view"
            actions={
              <button type="button" className="text-xs font-semibold text-indigo-600" onClick={() => setActiveScreen('inspectionReadiness')}>
                Open →
              </button>
            }
          >
            <div className="h-[320px] space-y-2 overflow-y-auto pr-1">
              {inspectionLenses.map((lens) => {
                const packsForLens = auditPacks.filter((p) => p.scope_id === lens.lens_id);
                const lensARS = packsForLens.length
                  ? Math.round(packsForLens.reduce((s, p) => s + p.ars, 0) / packsForLens.length)
                  : 0;
                const band = bandFromScore(lensARS, { green: 85, amber: 70 });
                return (
                  <button
                    key={lens.lens_id}
                    type="button"
                    onClick={() => packsForLens[0] && openDrawer('auditPack', packsForLens[0].audit_pack_id, 'riskPosture')}
                    className={`flex min-h-[64px] w-full items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left shadow-sm ${oriCardHover} ${oriFocusRing}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium leading-tight text-slate-900">{lens.label}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
                        {packsForLens.length} pack{packsForLens.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ScoreRing score={lensARS} band={band} size={36} thickness={5} />
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionCard
            title="Senior Accountability Snapshot"
            subtitle="SAES × open issues · click any to open ledger"
            actions={
              <button type="button" className="text-xs font-semibold text-indigo-600" onClick={() => setActiveScreen('accountability')}>
                Open ledger →
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {seniorManagers.slice(0, 6).map((sm) => {
                const openIssues = issues.filter((i) => i.accountable_senior_manager_id === sm.senior_manager_id && !i.closed_at);
                return (
                  <button
                    key={sm.senior_manager_id}
                    type="button"
                    onClick={() => openDrawer('seniorManager', sm.senior_manager_id, 'riskPosture')}
                    className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5 text-left hover:border-emerald-300"
                  >
                    <ScoreRing score={sm.saes} band={sm.saes >= 85 ? 'green' : sm.saes >= 70 ? 'amber' : 'red'} size={36} thickness={4} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-semibold text-slate-900">{sm.role}</div>
                      <div className="text-[10px] text-slate-500">{openIssues.length} open</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard
            title="AI / predictive signals · this week"
            subtitle="High-confidence signals touching your risk surface"
            actions={
              <button type="button" className="text-xs font-semibold text-indigo-600" onClick={() => setActiveScreen('aiInsights')}>
                Review queue ({pendingAIInsights().length}) →
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {pendingAIInsights().slice(0, 4).map((ai) => {
                const ins = getInsight(ai.ai_insight_id);
                if (!ins) return null;
                return (
                  <button
                    key={ai.ai_insight_id}
                    type="button"
                    onClick={() => openDrawer('aiInsight', ai.ai_insight_id, 'riskPosture')}
                    className="rounded-lg border border-violet-200 bg-violet-50 p-2.5 text-left hover:border-violet-400"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <Chip label={`${ins.signal_id} · ${ins.signal_class.replace('_', ' ')}`} tone="violet" size="xs" />
                      <span className="text-[10px] font-semibold text-violet-700">{(ins.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-900">{ins.title}</div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
