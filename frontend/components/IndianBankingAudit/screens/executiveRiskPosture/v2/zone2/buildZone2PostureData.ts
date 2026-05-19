import {
  aggregateAITES,
  aggregateRTS,
  aggregateSAES,
  auditPacks,
  getSeniorManager,
  incidents,
  inspectionLenses,
  issues,
  pacNotes,
  preventiveActions,
  rcas,
  reportingSubmissions,
  seniorManagers,
  type Issue,
} from '../../../../dataModel';
import { buildAtRiskClockChips, type AtRiskClockChip } from './buildAtRiskClockChips';
import { computeIssueRiskScore } from './computeIssueRiskScore';
import type { MetricTrendArrow } from '../../types';
import type { SetActiveScreen } from '../../../../types';

const INC_CLOSED = new Set(['closed', 'closed_no_loss']);
const RCA_AWAIT = new Set(['under_review', 'hod_approval', 'spoc_review']);

function weekStartInclusive6Local() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 6);
  return d.getTime();
}

function parseDiscAgg(s: string) {
  return new Date(s.includes('T') ? s : `${s}T12:00:00`).getTime();
}

export type { AtRiskClockChip } from './buildAtRiskClockChips';

export type WatchlistIssueRow = {
  issue: Issue;
  riskScore: number;
};

export type SupervisoryLensRow = {
  lensId: string;
  label: string;
  packCount: number;
  lensARS: number;
  hasGap: boolean;
  primaryPackId: string | null;
};

export type GovernanceMetric = {
  id: 'rts' | 'saes' | 'aites';
  label: string;
  value: string;
  trend: MetricTrendArrow;
  onNavigate: () => void;
};

/** Pure builder for Scroll Zone 2 (v2 PASS 4). */
export function buildZone2PostureData(nav: { setActiveScreen: SetActiveScreen }) {
  const rts = aggregateRTS();
  const saes = aggregateSAES();
  const aites = aggregateAITES();
  const tWeek = weekStartInclusive6Local();

  const criticalIncidents7d = incidents.filter(
    (i) =>
      !INC_CLOSED.has(i.status) &&
      (i.severity === 'high' || i.severity === 'critical') &&
      parseDiscAgg(i.discovered_date) >= tWeek
  ).length;

  const awaitingRcas = rcas.filter((r) => RCA_AWAIT.has(r.status || ''));
  const rcasAwaitingApproval = awaitingRcas.length;

  const rcaApproverBreakdown = (() => {
    const counts = new Map<string, number>();
    awaitingRcas.forEach((r, idx) => {
      let label = 'CRO';
      if (r.status === 'hod_approval' || r.status === 'spoc_review') {
        label = 'Head of Operational Risk';
      } else if (r.status === 'under_review' && idx < awaitingRcas.length - 1) {
        label = 'Head of Operational Risk';
      }
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([label, n]) => `${label} (${n})`)
      .join(' · ');
  })();

  const openPaIds = new Set(preventiveActions.filter((p) => p.status === 'open').map((p) => p.preventive_action_id));
  const pacPending = pacNotes.filter(
    (pn) =>
      pn.status === 'pending_orm_review' ||
      (pn.blocking_preventive_action_ids || []).some((id) => openPaIds.has(id))
  );
  const pacNotesPendingApproval = pacPending.length;

  const pacBlockerReasons = (() => {
    let missingEvidence = 0;
    let pendingSignOff = 0;
    for (const pn of pacPending) {
      const text = (pn.comments || []).map((c) => c.text).join(' ').toLowerCase();
      if (/evidence|ddq|link|orm review pending|retest/.test(text)) missingEvidence += 1;
      else if (/sign-off|signoff|approval|mou|attestation/.test(text)) pendingSignOff += 1;
      else if ((pn.blocking_preventive_action_ids || []).length > 0) missingEvidence += 1;
      else pendingSignOff += 1;
    }
    const parts: string[] = [];
    if (missingEvidence) parts.push(`Missing evidence: ${missingEvidence}`);
    if (pendingSignOff) parts.push(`Pending sign-off: ${pendingSignOff}`);
    return parts.length ? parts.join(' · ') : 'ORM review queue';
  })();

  const openIssueCount = issues.filter((i) => !i.closed_at).length;

  const rankedIssues: WatchlistIssueRow[] = issues
    .filter((i) => !i.closed_at)
    .map((issue) => ({ issue, riskScore: computeIssueRiskScore(issue) }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const topIssues = rankedIssues.slice(0, 3);

  const atRiskClockChips = buildAtRiskClockChips();

  const supervisoryLenses: SupervisoryLensRow[] = inspectionLenses.map((lens) => {
    const packsForLens = auditPacks.filter((p) => p.scope_id === lens.lens_id);
    const packCount = packsForLens.length;
    const lensARS = packCount ? Math.round(packsForLens.reduce((s, p) => s + p.ars, 0) / packCount) : 0;
    return {
      lensId: lens.lens_id,
      label: lens.label,
      packCount,
      lensARS,
      hasGap: packCount === 0,
      primaryPackId: packsForLens[0]?.audit_pack_id ?? null,
    };
  });

  const seniorSnapshot = seniorManagers.slice(0, 6).map((sm) => ({
    sm,
    openIssues: issues.filter((i) => i.accountable_senior_manager_id === sm.senior_manager_id && !i.closed_at).length,
  }));

  const lateOrAtRiskSubmissions = reportingSubmissions.filter(
    (s) => s.status === 'late' || s.status === 'pending'
  ).length;
  const rtsWindowDays = 14;

  const governanceMetrics: GovernanceMetric[] = [
    {
      id: 'rts',
      label: 'RTS',
      value: `${rts}%`,
      trend: rts >= 90 ? '↑' : rts >= 75 ? '→' : '↓',
      onNavigate: () => nav.setActiveScreen('inspectionReadiness'),
    },
    {
      id: 'saes',
      label: 'SAES',
      value: String(saes),
      trend: saes >= 85 ? '↑' : saes >= 70 ? '→' : '↓',
      onNavigate: () => nav.setActiveScreen('accountability'),
    },
    {
      id: 'aites',
      label: 'AITES',
      value: String(aites),
      trend: aites >= 85 ? '↑' : aites >= 70 ? '→' : '↓',
      onNavigate: () => nav.setActiveScreen('aiInsights'),
    },
  ];

  return {
    rts,
    saes,
    aites,
    criticalIncidents7d,
    rcasAwaitingApproval,
    rcaApproverBreakdown,
    pacNotesPendingApproval,
    pacBlockerReasons,
    openIssueCount,
    topIssues,
    atRiskClockChips,
    supervisoryLenses,
    seniorSnapshot,
    governanceMetrics,
    rtsContextLine: `RTS at ${rts}% — ${lateOrAtRiskSubmissions} submissions tracking below completion threshold for next ${rtsWindowDays}-day window`,
    resolveIssueOwner: (issue: Issue) => {
      const sm = getSeniorManager(issue.accountable_senior_manager_id);
      return sm?.role ?? '—';
    },
  };
}

export type Zone2PostureData = ReturnType<typeof buildZone2PostureData>;
