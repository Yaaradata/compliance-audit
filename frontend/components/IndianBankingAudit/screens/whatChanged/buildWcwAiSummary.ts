import {
  controlInstances,
  getKRI,
  getRisk,
  getRiskDomain,
  issues,
  pendingAIInsights,
  riskDomains,
  seniorManagers,
  type AIInsight,
  type Issue,
} from '../../dataModel';
import { buildAtRiskClockChips } from '../executiveRiskPosture/v2/zone2/buildAtRiskClockChips';
import { classifyAiSignalTier } from '../executiveRiskPosture/v2/aiSignals/classifyAiSignalTier';
import { rewriteAiSignalText } from '../executiveRiskPosture/v2/aiSignals/rewriteAiSignalText';
import { formatIssueDisplayTitle } from '../executiveRiskPosture/v2/zone2/issueWatchlistFormat';
import { getWeekRange } from './formatWeekRange';

export type RiskDirection = 'DETERIORATING' | 'STABLE' | 'IMPROVING';

export type WcwActionChip = {
  id: string;
  label: string;
  tone: 'red' | 'amber' | 'purple';
  href?: string;
};

export type WcwAiSummaryViewModel = {
  generatedAtIst: string;
  riskDirection: RiskDirection;
  sentences: {
    topIssue: string;
    aiSignal: string;
    kriBands: string;
  };
  kriFooterLines: string[];
  kriFooterStable: boolean;
  actionChips: WcwActionChip[];
  openedPhrase: string;
  metrics: {
    activeHighIssues: number;
    newHighThisWeek: number;
    controlFailures: number;
    reportingClocksAtRisk: number;
    kriDeltaCount: number;
  };
};

function parseOpenedAt(iso: string): number {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).getTime();
}

function isHighSeverity(severity: string): boolean {
  return severity === 'high' || severity === 'critical';
}

export function countActiveHighIssues(): number {
  return issues.filter((i) => !i.closed_at && isHighSeverity(i.severity)).length;
}

function countNewHighIssuesThisWeek(): number {
  const { start } = getWeekRange();
  const w0 = start.getTime();
  return issues.filter((i) => {
    if (i.closed_at || !isHighSeverity(i.severity)) return false;
    const t = parseOpenedAt(i.opened_at);
    return !Number.isNaN(t) && t >= w0;
  }).length;
}

function countControlFailures(): number {
  return controlInstances.filter((ci) => ci.outcome === 'Fail').length;
}

function countReportingAtRisk(): number {
  return buildAtRiskClockChips().length;
}

function deriveRiskDirection(newHighThisWeek: number, urgentClockDays: number | null): RiskDirection {
  if (newHighThisWeek > 0 || (urgentClockDays != null && urgentClockDays < 7)) {
    return 'DETERIORATING';
  }
  const high = countActiveHighIssues();
  const failures = countControlFailures();
  const clocks = countReportingAtRisk();
  if (high === 0 && failures === 0 && clocks === 0) return 'IMPROVING';
  return 'STABLE';
}

function issueUrgencyScore(issue: Issue): number {
  let score = issue.severity === 'critical' ? 100 : isHighSeverity(issue.severity) ? 80 : 40;
  if (issue.rbi_mra_flag) score += 20;
  if (issue.section_47a_exposure_flag === 'confirmed') score += 15;
  else if (issue.section_47a_exposure_flag === 'candidate') score += 10;
  score += Math.max(0, 30 - Math.min(issue.ageing_days, 30));
  return score;
}

export function pickTopUrgentIssue(): Issue | null {
  const open = issues.filter((i) => !i.closed_at && isHighSeverity(i.severity));
  if (!open.length) return null;
  return [...open].sort((a, b) => issueUrgencyScore(b) - issueUrgencyScore(a))[0];
}

function businessConsequence(issue: Issue): string {
  if (issue.section_47a_exposure_flag === 'confirmed' || issue.section_47a_exposure_flag === 'candidate') {
    return 'potential s.47A regulatory breach';
  }
  if (issue.pmla_exposure_flag) return 'PMLA / FIU reporting exposure';
  const rc = issue.root_cause?.trim();
  if (rc) {
    const short = rc.split(';')[0]?.trim() ?? rc;
    return short.length > 72 ? `${short.slice(0, 69)}…` : short;
  }
  return 'material operational and regulatory exposure';
}

function formatTopIssueSentence(issue: Issue): string {
  const title = formatIssueDisplayTitle(issue);
  const mra = issue.rbi_mra_flag ? ', RBI MRA flagged' : '';
  return `Most urgent: ${title} (${issue.ageing_days}d old${mra}) — ${businessConsequence(issue)}.`;
}

function pickCriticalAiInsight(): AIInsight | null {
  const pool = pendingAIInsights();
  const ranked = pool
    .map((ins) => ({
      ins,
      tier: classifyAiSignalTier(ins),
      score:
        (classifyAiSignalTier(ins) === 1 ? 50 : 0) +
        ins.confidence * 40 +
        (/mlro|saes|accountability|attestation|str clock/i.test(ins.title) ? 25 : 0) +
        (/kfs|11,118|regulatory|ctr/i.test(ins.title) ? 15 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.ins ?? pool[0] ?? null;
}

function buildAiSignalSentence(ins: AIInsight | null): string {
  const mlro = seniorManagers.find((sm) => sm.senior_manager_id === 'SM-MLRO-001' || /mlro/i.test(sm.role));
  if (mlro && mlro.saes < 70) {
    return `MLRO accountability score has dropped to ${mlro.saes} with an overdue STR attestation — AML governance gap requires immediate escalation.`;
  }
  if (!ins) {
    return 'No critical AI signals are pending review this week — continue monitoring tier-1 queue.';
  }
  const plain = rewriteAiSignalText(ins);
  const forward =
    ins.recommendation?.trim() ||
    ins.risk_if_wrong?.trim() ||
    'forward-looking remediation should be prioritised before the next BRMC cycle';
  const forwardShort =
    forward.length > 90 ? `${forward.slice(0, 87)}…` : forward.charAt(0).toLowerCase() + forward.slice(1);
  return `${plain} — ${forwardShort}.`;
}

function bandLabel(band: string): string {
  return band === 'green' ? 'green' : band === 'amber' ? 'amber' : band === 'red' ? 'red' : band;
}

export function buildKriDeltaLines(
  kriDeltas: { kriId: string; prev: string; current: string }[],
): { sentence: string; footerLines: string[]; stable: boolean } {
  const domainCount = riskDomains.length;
  if (!kriDeltas.length) {
    const line = `KRI bands: no changes this week — all indicators stable`;
    return {
      sentence: `${line}.`,
      footerLines: [`KRI bands: no changes this week · All ${domainCount} domains stable`],
      stable: true,
    };
  }
  const footerLines = kriDeltas.map((d) => {
    const kri = getKRI(d.kriId);
    const risk = kri?.linked_risk_id ? getRisk(kri.linked_risk_id) : null;
    const domain = risk?.domain_id ? getRiskDomain(risk.domain_id) : null;
    const domainName = domain?.title ?? risk?.domain_id ?? d.kriId;
    return `KRI band change: ${domainName} moved ${bandLabel(d.prev)}→${bandLabel(d.current)}`;
  });
  const first = kriDeltas[0];
  const firstKri = getKRI(first.kriId);
  const firstRisk = firstKri?.linked_risk_id ? getRisk(firstKri.linked_risk_id) : null;
  const firstDomain = firstRisk?.domain_id ? getRiskDomain(firstRisk.domain_id) : null;
  const domainLabel = firstDomain?.title ?? firstRisk?.domain_id ?? 'a risk domain';
  const sentence =
    kriDeltas.length === 1
      ? `KRI bands: 1 band change this week — ${domainLabel} moved to ${bandLabel(first.current)}.`
      : `KRI bands: ${kriDeltas.length} band changes this week — ${domainLabel} moved to ${bandLabel(first.current)}.`;
  return { sentence, footerLines, stable: false };
}

function buildActionChips(controlFailures: number): WcwActionChip[] {
  const chips: WcwActionChip[] = [];
  const urgentClocks = buildAtRiskClockChips()
    .filter((c) => c.daysRemaining < 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (urgentClocks.length) {
    chips.push({
      id: 'str-clock',
      label: `Review STR clock → ${urgentClocks[0].daysRemaining}d remaining`,
      tone: 'red',
      href: '#wcw-detail-zone',
    });
  }

  const lowSaesExec = seniorManagers.filter((sm) => sm.saes < 70);
  if (lowSaesExec.length) {
    const mlro = lowSaesExec.find((sm) => /mlro/i.test(sm.role)) ?? lowSaesExec[0];
    chips.push({
      id: 'mlro-saes',
      label: `Escalate ${mlro.name.includes('MLRO') ? 'MLRO' : mlro.name} accountability gap →`,
      tone: 'amber',
      href: '#wcw-detail-zone',
    });
  }

  if (controlFailures > 0) {
    chips.push({
      id: 'control-failures',
      label: 'View control failure details →',
      tone: 'purple',
      href: '#wcw-zone1',
    });
  }

  return chips;
}

function formatGeneratedIst(): string {
  return new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true,
  });
}

export function buildWcwAiSummary(kriDeltas: { kriId: string; prev: string; current: string; value: number }[]): WcwAiSummaryViewModel {
  const activeHighIssues = countActiveHighIssues();
  const newHighThisWeek = countNewHighIssuesThisWeek();
  const controlFailures = countControlFailures();
  const reportingClocksAtRisk = countReportingAtRisk();
  const atRisk = buildAtRiskClockChips();
  const urgentDays = atRisk.length ? Math.min(...atRisk.map((c) => c.daysRemaining)) : null;

  const riskDirection = deriveRiskDirection(newHighThisWeek, urgentDays);
  const topIssue = pickTopUrgentIssue();
  const aiInsight = pickCriticalAiInsight();
  const kri = buildKriDeltaLines(kriDeltas);

  const openedPhrase =
    newHighThisWeek > 0
      ? `${newHighThisWeek} new HIGH-severity issue${newHighThisWeek === 1 ? '' : 's'} opened`
      : `${activeHighIssues} HIGH-severity issue${activeHighIssues === 1 ? '' : 's'} active`;

  return {
    generatedAtIst: formatGeneratedIst(),
    riskDirection,
    openedPhrase,
    sentences: {
      topIssue: topIssue ? formatTopIssueSentence(topIssue) : 'Most urgent: no open HIGH-severity issues in the current window.',
      aiSignal: buildAiSignalSentence(aiInsight),
      kriBands: kri.sentence,
    },
    kriFooterLines: kri.footerLines,
    kriFooterStable: kri.stable,
    actionChips: buildActionChips(controlFailures),
    metrics: {
      activeHighIssues,
      newHighThisWeek,
      controlFailures,
      reportingClocksAtRisk,
      kriDeltaCount: kriDeltas.length,
    },
  };
}

export const RISK_DIRECTION_STYLES: Record<
  RiskDirection,
  { badge: string; strong: string }
> = {
  DETERIORATING: { badge: 'bg-[#FEE2E2] text-[#991B1B]', strong: 'text-[#DC2626]' },
  STABLE: { badge: 'bg-[#FEF3C7] text-[#92400E]', strong: 'text-[#D97706]' },
  IMPROVING: { badge: 'bg-[#DCFCE7] text-[#166534]', strong: 'text-[#16A34A]' },
};

export const CHIP_STYLES: Record<WcwActionChip['tone'], string> = {
  red: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2]',
  amber: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF9C3]',
  purple: 'border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]',
};
