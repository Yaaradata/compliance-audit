import { issues } from '../../dataModel';
import { buildReportingBreachesColumnData } from './buildReportingBreachesColumn';
import { buildNewIssuesColumnData, severityRank } from './formatWcwIssues';

/** Pass 6 — dev-only integrity checks (console warnings, not user-visible). */
export function runWcwDataIntegrityChecks(): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;

  const { metricRows } = buildReportingBreachesColumnData();

  const byMetricName = new Map<string, typeof metricRows>();
  metricRows.forEach((row) => {
    if (!byMetricName.has(row.metricName)) byMetricName.set(row.metricName, []);
    byMetricName.get(row.metricName)!.push(row);
  });

  byMetricName.forEach((rows, metricName) => {
    if (rows.length > 1) {
      const unlabeled = rows.filter((r) => !r.scopeLabel?.trim());
      if (unlabeled.length > 0) {
        console.warn('[WCW] Duplicate metric rows detected without branch/period label:', metricName);
      }
    }
    rows.forEach((row) => {
      if (!row.scopeLabel?.trim()) {
        console.warn('[WCW] Metric row has no branch/period label — placeholder required:', row.metricName);
      }
    });
  });

  const { displayIssues } = buildNewIssuesColumnData(issues);
  if (displayIssues.length > 1) {
    const firstRank = severityRank(displayIssues[0].severity);
    const hasHigherSeverity = displayIssues.some((i) => severityRank(i.severity) < firstRank);
    if (hasHigherSeverity) {
      console.warn('[WCW] Issue sort order incorrect — HIGH severity issue not at top');
    }
  }
}
