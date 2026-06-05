import {
  IssuesLowRatingViz,
  IssuesAttritionViz,
  IssuesComplaintSpikeViz,
  IssuesCxDirectionViz,
  IssuesResolutionThroughputViz,
} from './fastTagIssuesViz';

const P = 'dd';

export function IssuesCxDirectionChart({ data }) {
  return <IssuesCxDirectionViz prefix={P} data={data} />;
}

export function IssuesComplaintSpikeChart({ data }) {
  return <IssuesComplaintSpikeViz prefix={P} data={data} />;
}

export function IssuesAttritionChart({ data, view = 'customers' }) {
  return <IssuesAttritionViz prefix={P} data={data} view={view} />;
}

export function IssuesLowRatingChart({ data, band = 'low' }) {
  return <IssuesLowRatingViz prefix={P} data={data} band={band} />;
}

export function IssuesResolutionThroughputChart({ data, filter = 'all' }) {
  return <IssuesResolutionThroughputViz prefix={P} data={data} filter={filter} />;
}
