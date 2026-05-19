import {
  appetiteObservations,
  aiInsights,
  controlInstances,
  getAppetite,
  getKRI,
  issues,
  kriObservations,
  reportingClocks,
} from '../../dataModel';
import { buildControlFailuresWeekCounts } from './formatWcwControlFailures';
import { buildNewIssuesColumnData } from './formatWcwIssues';

const fmtDate = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : '—');

export function useWhatChangedWeekData() {
  const newIssuesColumn = buildNewIssuesColumnData(issues);

  const controlFailuresColumn = buildControlFailuresWeekCounts(controlInstances);

  const recentInsights = [...aiInsights]
    .sort((a, b) => (a.fired_at < b.fired_at ? 1 : -1))
    .slice(0, 4);

  /** Reserved for AI summary (Pass 2) and detail zone (Pass 6) — not shown as a column in Pass 1. */
  const kriDeltas: { kriId: string; prev: string; current: string; value: number }[] = [];
  const byKri = new Map<string, typeof kriObservations>();
  kriObservations.forEach((o) => {
    if (!byKri.has(o.kri_id)) byKri.set(o.kri_id, []);
    byKri.get(o.kri_id)!.push(o);
  });
  byKri.forEach((obs, kriId) => {
    const sorted = [...obs].sort((a, b) => (a.as_of_ts > b.as_of_ts ? -1 : 1));
    if (sorted.length >= 2 && sorted[0].band !== sorted[1].band) {
      kriDeltas.push({ kriId, prev: sorted[1].band, current: sorted[0].band, value: sorted[0].value });
    }
  });

  const appetiteBreaches = appetiteObservations
    .filter((o) => o.band === 'red' || o.band === 'amber')
    .slice(0, 4);

  const reportingBreaches = reportingClocks.filter(
    (c) => c.current_status === 'at_risk' || c.current_status === 'breached',
  );

  return {
    fmtDate,
    /** v1 legacy lanes */
    recentIssues: newIssuesColumn.displayIssues.slice(0, 4),
    failingCIs: controlFailuresColumn.failures,
    newIssuesColumn,
    controlFailuresColumn,
    recentInsights,
    kriDeltas,
    appetiteBreaches,
    reportingBreaches,
    getKRI,
    getAppetite,
  };
}
