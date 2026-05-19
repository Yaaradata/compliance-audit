import type { Risk } from '../../dataModel';
import type { RiskDetailViewModel } from './buildRiskDetailViewModel';

/** One risk-specific AI insight sentence for the flyout strip (PASS 5.2). */
export function generateRiskAiInsight(
  risk: Risk,
  vm: Pick<
    RiskDetailViewModel,
    'resHistory' | 'linkedIncidents' | 'kriReading' | 'controlRows' | 'lastAssessed' | 'nextReviewDue'
  >
): string {
  const scores = vm.resHistory.map((p) => p.score);
  let stableRun = 1;
  for (let i = scores.length - 2; i >= 0; i--) {
    if (scores[i] === scores[scores.length - 1]) stableRun++;
    else break;
  }
  const latestRes = risk.res_score;
  if (stableRun >= 3 && risk.residual_rating_trend === 'stable') {
    return `RES stable at ${latestRes} for ${stableRun} consecutive assessments — consider triggering reassessment to avoid score staleness`;
  }

  if (
    (risk.residual_rating_trend === 'deteriorating' || risk.residual_rating_trend === 'rapidly_deteriorating') &&
    scores.length >= 2
  ) {
    const drop = scores[scores.length - 2] - scores[scores.length - 1];
    if (drop >= 5) {
      const n = vm.controlRows.length;
      const ctrlHint = n > 0 ? ` for ${n} linked control${n !== 1 ? 's' : ''}` : '';
      return `Residual score has declined ${drop} points over 2 cycles — review control effectiveness${ctrlHint}`;
    }
  }

  if (vm.kriReading?.breachBand === 'red') {
    return `KRI ${vm.kriReading.kriId} in red breach at ${vm.kriReading.currentValue} — escalate to accountable SM and align bureau pull remediation`;
  }
  if (vm.kriReading?.breachBand === 'amber') {
    return `KRI ${vm.kriReading.kriId} trending amber (${vm.kriReading.currentValue}) — validate threshold calibration against current sanction cohort`;
  }

  if (vm.linkedIncidents.length === 0) {
    return 'No incidents in last 90 days — validate KRI threshold alignment with current portfolio data';
  }

  if (vm.nextReviewDue?.isOverdue) {
    return `RCSA review overdue since ${vm.nextReviewDue.dateLabel} — prioritize sign-off before next supervisory touchpoint`;
  }

  const openCtrlFails = vm.controlRows.filter((r) => r.testResult === 'FAIL').length;
  if (openCtrlFails > 0) {
    return `${openCtrlFails} linked control test failure${openCtrlFails !== 1 ? 's' : ''} on record — review population test workpapers before next assessment`;
  }

  return `Residual posture at RES ${latestRes} (${risk.residual_rating}) — monitor ${risk.kri_ids[0] ?? 'linked KRIs'} through next ${vm.lastAssessed ? 'RCSA cycle' : 'review window'}`;
}
