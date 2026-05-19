import type { KRI } from '../../dataModel';
import { buildKriTileModel } from './buildKriTileModel';
import type { KriBand } from './kriMonitoringTokens';
import { kriConfidencePct, kriDomainCategory } from './kriAiSummaryTokens';
export type KriAiSummaryPoint = {
  id: string;
  code: string;
  category: string;
  band: KriBand;
  confidencePct: number;
  problem: string;
  recommendation: string;
  priority: number;
};

export type KriAiSummaryViewModel = {
  generatedAt: string;
  updatedTime: string;
  queueCount: number;
  counts: {
    total: number;
    red: number;
    amber: number;
    green: number;
    deteriorating: number;
  };
  points: KriAiSummaryPoint[];
};

function bandPriority(band: KriBand): number {
  if (band === 'red') return 0;
  if (band === 'amber') return 1;
  return 2;
}

function buildProblem(
  model: ReturnType<typeof buildKriTileModel>,
  kri: KRI,
): string {
  if (model.insight) {
    return `${model.name} — ${model.insight}`;
  }

  const trendNote =
    model.trend === 'up'
      ? 'worsening over the last four weeks'
      : model.trend === 'flat'
        ? 'flat but still above appetite'
        : 'improving but still elevated';

  if (model.band === 'red') {
    return `${model.name} — ${model.valueDisplay} ${model.unitLabel} is in red band (${trendNote}).`;
  }
  if (model.band === 'amber') {
    return `${model.name} — ${model.valueDisplay} ${model.unitLabel} is in amber watch band (${trendNote}).`;
  }
  return `${model.name} — ${model.valueDisplay} ${model.unitLabel} remains within green band.`;
}

function buildRecommendation(
  model: ReturnType<typeof buildKriTileModel>,
  kri: KRI,
): string {
  const owner = model.owner !== '—' ? model.owner : 'accountable senior manager';

  if (kri.kri_id === 'KRI-FC-001') {
    return `Escalate to ${owner} to clear AML L1 backlog above 5 BD SLA and restore queue to amber band within two weeks.`;
  }
  if (kri.kri_id === 'KRI-CD-001') {
    return `Prioritise LOS patch validation and conduct targeted KFS sequencing review with ${owner} before next disbursement cycle.`;
  }
  if (kri.kri_id === 'KRI-CO-001') {
    return `Accelerate CKYCR ack chain remediation with ops and ${owner}; target T+1 ack capture on new Re-KYC completions.`;
  }
  if (kri.kri_id === 'KRI-OP-001') {
    return `Review BPO Mumbai queue staffing and SLA routing with ${owner}; implement daily breach-ratio cap until below amber.`;
  }
  if (kri.kri_id === 'KRI-CR-001') {
    return `Run retail sanction cohort bureau-pull refresh with ${owner}; block stale pulls at sanction gate until cleared.`;
  }
  if (kri.kri_id === 'KRI-FR-001') {
    return `Increase NPCI funnel-out monitoring cadence with ${owner} and align Wave 2 rule thresholds to baseline.`;
  }

  if (model.band === 'red') {
    return `Request ${owner} to submit a 30-day remediation plan and weekly progress until the KRI returns to amber.`;
  }
  if (model.band === 'amber' && model.trend === 'up') {
    return `Ask ${owner} to confirm preventive controls and interim thresholds to halt further deterioration this month.`;
  }
  return `Maintain current monitoring cadence with ${owner}; no immediate escalation required.`;
}

export function buildKriAiSummary(kris: KRI[]): KriAiSummaryViewModel {
  const tiles = kris.map((k) => ({ kri: k, model: buildKriTileModel(k) }));

  const red = tiles.filter((t) => t.model.band === 'red');
  const amber = tiles.filter((t) => t.model.band === 'amber');
  const green = tiles.filter((t) => t.model.band === 'green');
  const deteriorating = tiles.filter((t) => t.model.trend === 'up');

  const actionable = tiles.filter((t) => t.model.band === 'red' || t.model.band === 'amber');

  const points: KriAiSummaryPoint[] = actionable
    .sort((a, b) => {
      const bp = bandPriority(a.model.band) - bandPriority(b.model.band);
      if (bp !== 0) return bp;
      return b.model.wow.delta - a.model.wow.delta;
    })
    .map((t) => ({
      id: t.model.code,
      code: t.model.code,
      category: kriDomainCategory(t.model.riskCode, t.model.domain),
      band: t.model.band,
      confidencePct: kriConfidencePct(t.model.band, t.model.trend),
      problem: buildProblem(t.model, t.kri),
      recommendation: buildRecommendation(t.model, t.kri),
      priority: bandPriority(t.model.band),
    }));

  const now = new Date();
  const generatedAt = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const updatedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    generatedAt,
    updatedTime,
    queueCount: points.length,
    counts: {
      total: tiles.length,
      red: red.length,
      amber: amber.length,
      green: green.length,
      deteriorating: deteriorating.length,
    },
    points,
  };
}
