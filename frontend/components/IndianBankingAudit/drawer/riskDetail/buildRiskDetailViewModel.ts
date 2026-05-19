import {
  controlsForRisk,
  getKRI,
  getObligation,
  getRegulation,
  getRisk,
  getRiskDomain,
  getSeniorManager,
  incidentsForRiskWithinDays,
  latestTestExecutionForControl,
  observationsForKRI,
  rcsaCellsForRisk,
  rcsaCycles,
  type Control,
  type Incident,
  type Risk,
} from '../../dataModel';
import { bandFromScore } from '../../theme';
import { generateRiskAiInsight } from './generateRiskAiInsight';

export type ControlTestResultBadge = 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT TESTED';

export type RiskControlRow = {
  controlId: string;
  controlName: string;
  lastTestDate: string | null;
  testResult: ControlTestResultBadge;
  owner: string;
};

export type RiskKriReading = {
  kriId: string;
  kriName: string;
  currentValue: number;
  thresholdAmber: number;
  thresholdRed: number;
  unit: string;
  breachBand: 'green' | 'amber' | 'red';
  breachStatusLabel: string;
  /** 0–100 position for gauge marker */
  markerPct: number;
  amberPct: number;
  redPct: number;
};

export type RiskIncidentRow = {
  incidentId: string;
  description: string;
  date: string;
  severity: string;
  status: string;
};

export type ResHistoryPoint = {
  label: string;
  score: number;
};

export type RiskDetailViewModel = {
  risk: Risk;
  aiInsight: string;
  accountableSmName: string;
  accountableSmId: string;
  lastAssessed: { dateLabel: string } | null;
  nextReviewDue: { dateLabel: string; isOverdue: boolean } | null;
  controlRows: RiskControlRow[];
  totalControlCount: number;
  kriReading: RiskKriReading | null;
  linkedIncidents: RiskIncidentRow[];
  obligationIds: string[];
  regulationIds: string[];
  suggestedObligation: { anchorLabel: string } | null;
  resHistory: ResHistoryPoint[];
  resBand: string;
};

const FISCAL_LABELS = ['Q3 FY25', 'Q4 FY25', 'Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26'] as const;

function fmtDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function mapTestResult(result: string | undefined | null): ControlTestResultBadge {
  if (!result) return 'NOT TESTED';
  const r = result.toLowerCase();
  if (r === 'pass' || r === 'passed') return 'PASS';
  if (r === 'fail' || r === 'failed') return 'FAIL';
  if (r === 'partial') return 'PARTIAL';
  return 'NOT TESTED';
}

function approximateResFromCell(ces: number, inherentRating: string): number {
  const inhAdj = { low: 4, medium: 0, high: -6 }[inherentRating] ?? 0;
  return Math.min(99, Math.max(40, Math.round(ces * 0.88 + inhAdj)));
}

function buildResHistory(risk: Risk): ResHistoryPoint[] {
  const cells = rcsaCellsForRisk(risk.risk_id)
    .filter((c) => c.last_refreshed)
    .sort((a, b) => (a.last_refreshed! < b.last_refreshed! ? -1 : 1));

  const byCycle = new Map<string, number>();
  for (const cell of cells) {
    const score = approximateResFromCell(cell.control_effectiveness_score, cell.inherent_rating);
    byCycle.set(cell.rcsa_cycle_id, score);
  }

  const fromCells = Array.from(byCycle.values());
  const targetLen = 6;
  let scores: number[];

  if (fromCells.length >= targetLen) {
    scores = fromCells.slice(-targetLen);
  } else if (fromCells.length > 0) {
    const start = fromCells[0];
    const padCount = targetLen - fromCells.length;
    const step = (risk.res_score - fromCells[fromCells.length - 1]) / (padCount + 1);
    scores = [
      ...Array.from({ length: padCount }, (_, i) =>
        Math.round(start + step * (i + 1) * 0.5)
      ),
      ...fromCells,
    ].slice(-targetLen);
    while (scores.length < targetLen) {
      scores.unshift(Math.max(40, scores[0] - 2));
    }
  } else {
    const delta = risk.residual_rating_trend === 'deteriorating' ? -3 : risk.residual_rating_trend === 'improving' ? 2 : 0;
    scores = Array.from({ length: targetLen }, (_, i) => {
      const offset = (targetLen - 1 - i) * Math.abs(delta || 1);
      const sign = delta <= 0 ? 1 : -1;
      return Math.min(99, Math.max(40, risk.res_score + sign * offset));
    });
  }

  scores[scores.length - 1] = risk.res_score;

  if (risk.residual_rating_trend === 'stable') {
    const tail = risk.res_score;
    let run = 1;
    for (let i = scores.length - 2; i >= 0 && scores[i] === tail; i--) run++;
    if (run < 3) {
      scores[scores.length - 1] = tail;
      scores[scores.length - 2] = tail;
      scores[scores.length - 3] = tail;
    }
  }

  return FISCAL_LABELS.map((label, i) => ({ label, score: scores[i] ?? risk.res_score }));
}

function addCadenceMonths(base: Date, cadence: string | undefined): Date {
  const d = new Date(base);
  switch (cadence) {
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'half_yearly':
      d.setMonth(d.getMonth() + 6);
      break;
    case 'annual':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'quarterly':
    default:
      d.setMonth(d.getMonth() + 3);
      break;
  }
  return d;
}

function buildAssessmentDates(riskId: string): {
  lastAssessed: RiskDetailViewModel['lastAssessed'];
  nextReviewDue: RiskDetailViewModel['nextReviewDue'];
} {
  const cells = rcsaCellsForRisk(riskId);
  if (!cells.length) return { lastAssessed: null, nextReviewDue: null };

  let latestTs = 0;
  let latestCell = cells[0];
  for (const cell of cells) {
    const candidates = [cell.last_refreshed, cell.spoc_attested_at].filter(Boolean) as string[];
    for (const iso of candidates) {
      const t = new Date(iso).getTime();
      if (!Number.isNaN(t) && t > latestTs) {
        latestTs = t;
        latestCell = cell;
      }
    }
  }

  const lastLabel = fmtDate(latestCell.last_refreshed ?? latestCell.spoc_attested_at);
  if (!lastLabel) return { lastAssessed: null, nextReviewDue: null };

  const cycle = rcsaCycles.find((c) => c.rcsa_cycle_id === latestCell.rcsa_cycle_id);
  const base = new Date(lastLabel);
  const due = addCadenceMonths(base, cycle?.refresh_cadence);
  const dueLabel = fmtDate(due.toISOString())!;
  const isOverdue = due.getTime() < Date.now();

  return {
    lastAssessed: { dateLabel: lastLabel },
    nextReviewDue: { dateLabel: dueLabel, isOverdue },
  };
}

function buildControlRows(riskId: string): RiskControlRow[] {
  return controlsForRisk(riskId).map((c: Control) => {
    const test = latestTestExecutionForControl(c.control_id);
    return {
      controlId: c.control_id,
      controlName: c.title,
      lastTestDate: test?.as_of_date ? fmtDate(test.as_of_date) : null,
      testResult: mapTestResult(test?.result),
      owner: c.owner_role,
    };
  });
}

function buildKriReading(risk: Risk): RiskKriReading | null {
  const kriId = risk.kri_ids[0];
  if (!kriId) return null;
  const kri = getKRI(kriId);
  if (!kri) return null;

  const obs = observationsForKRI(kriId);
  const latest = obs[obs.length - 1];
  if (!latest) return null;

  const value = latest.value;
  let breachBand: 'green' | 'amber' | 'red' = 'green';
  if (value >= kri.threshold_red) breachBand = 'red';
  else if (value >= kri.threshold_amber) breachBand = 'amber';

  const maxScale = Math.max(kri.threshold_red * 1.15, value, 1);
  const markerPct = Math.min(100, (value / maxScale) * 100);
  const amberPct = Math.min(100, (kri.threshold_amber / maxScale) * 100);
  const redPct = Math.min(100, (kri.threshold_red / maxScale) * 100);

  const breachStatusLabel =
    breachBand === 'red' ? 'Red breach' : breachBand === 'amber' ? 'Amber watch' : 'Within appetite';

  return {
    kriId: kri.kri_id,
    kriName: kri.name,
    currentValue: value,
    thresholdAmber: kri.threshold_amber,
    thresholdRed: kri.threshold_red,
    unit: kri.unit,
    breachBand,
    breachStatusLabel,
    markerPct,
    amberPct,
    redPct,
  };
}

function buildIncidentRows(riskId: string): RiskIncidentRow[] {
  return incidentsForRiskWithinDays(riskId, 90).slice(0, 3).map((inc: Incident) => ({
    incidentId: inc.incident_id,
    description: (inc.description ?? inc.title).slice(0, 80),
    date: fmtDate(inc.discovered_date) ?? inc.discovered_date,
    severity: inc.severity,
    status: inc.status.replace(/_/g, ' '),
  }));
}

function buildSuggestedObligation(risk: Risk): RiskDetailViewModel['suggestedObligation'] {
  if (risk.linked_obligation_ids.length > 0) return null;
  const domain = getRiskDomain(risk.domain_id);
  if (!domain?.regulatory_anchor) return null;
  return { anchorLabel: domain.regulatory_anchor.toUpperCase() };
}

export function buildRiskDetailViewModel(riskId: string): RiskDetailViewModel | null {
  const risk = getRisk(riskId);
  if (!risk) return null;

  const sm = getSeniorManager(risk.accountable_senior_manager_id);
  const resHistory = buildResHistory(risk);
  const { lastAssessed, nextReviewDue } = buildAssessmentDates(riskId);
  const controlRows = buildControlRows(riskId);
  const kriReading = buildKriReading(risk);
  const linkedIncidents = buildIncidentRows(riskId);
  const suggestedObligation = buildSuggestedObligation(risk);

  const obligationIds = risk.linked_obligation_ids;
  const regulationIds = Array.from(
    new Set(
      obligationIds
        .map((oid) => getObligation(oid))
        .filter((o): o is NonNullable<typeof o> => !!o)
        .map((o) => o.regulation_id)
    )
  );

  const partial = {
    risk,
    accountableSmName: sm?.name ?? risk.accountable_senior_manager_id,
    accountableSmId: risk.accountable_senior_manager_id,
    lastAssessed,
    nextReviewDue,
    controlRows,
    totalControlCount: controlRows.length,
    kriReading,
    linkedIncidents,
    obligationIds,
    regulationIds,
    suggestedObligation,
    resHistory,
    resBand: bandFromScore(risk.res_score),
  };

  return {
    ...partial,
    aiInsight: generateRiskAiInsight(risk, partial),
  };
}
