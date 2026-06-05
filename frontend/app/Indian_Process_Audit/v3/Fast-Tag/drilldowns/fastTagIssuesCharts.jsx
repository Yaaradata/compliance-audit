import {
  DrillChurnRiskPanel,
  DrillComplaintMixPie,
  DrillHappinessGaugePanel,
  DrillIssuesImpactTable,
  DrillPartnerScorecardPanel,
  DrillRootCauseActionsPanel,
  DrillSentimentTrendPanel,
} from './fastTagDrillViz';

const P = 'dd';

export function IssuesImpactChart({ rows }) {
  return <DrillIssuesImpactTable prefix={P} rows={rows} />;
}

export function IssuesComplaintMixChart({ slices }) {
  return <DrillComplaintMixPie prefix={P} slices={slices} />;
}

export function IssuesHappinessChart({ metrics }) {
  return <DrillHappinessGaugePanel prefix={P} metrics={metrics} />;
}

export function IssuesPartnerScorecardChart({ partners }) {
  return <DrillPartnerScorecardPanel prefix={P} partners={partners} />;
}

export function IssuesChurnRiskChart({ metrics, note }) {
  return <DrillChurnRiskPanel prefix={P} metrics={metrics} note={note} />;
}

export function IssuesSentimentChart({ points, tag }) {
  return <DrillSentimentTrendPanel prefix={P} points={points} tag={tag} />;
}

export function IssuesRootCauseActionsChart({ rootCauses, actions }) {
  return <DrillRootCauseActionsPanel prefix={P} rootCauses={rootCauses} actions={actions} />;
}
