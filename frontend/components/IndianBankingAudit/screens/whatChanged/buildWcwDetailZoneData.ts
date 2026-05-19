import {
  controlInstances,
  getRisk,
  getRiskDomain,
  issues,
  kris,
  kriObservations,
  type ControlInstance,
  type Issue,
} from '../../dataModel';
import { formatIssueDisplayTitle } from '../executiveRiskPosture/v2/zone2/issueWatchlistFormat';
import { buildWcwEvidenceQualityFlags } from './buildWcwAiSignalsColumn';
import { buildNewIssuesColumnData } from './formatWcwIssues';
import { sortControlFailuresForColumn } from './formatWcwControlFailures';

export type WcwControlFailureDetail = ControlInstance;

export type WcwFullIssueRow = Issue & { displayTitle: string };

export type WcwKriBandRow = {
  kriId: string;
  name: string;
  domainLabel: string;
  currentBand: string;
  wowChange: string;
};

export function buildWcwControlFailureDetails(): WcwControlFailureDetail[] {
  return sortControlFailuresForColumn(controlInstances);
}

export function buildWcwFullIssueList(): { issues: WcwFullIssueRow[]; total: number } {
  const { displayIssues } = buildNewIssuesColumnData(issues);
  return {
    total: displayIssues.length,
    issues: displayIssues.map((issue) => ({
      ...issue,
      displayTitle: formatIssueDisplayTitle(issue),
    })),
  };
}

export function buildWcwKriBandRows(): WcwKriBandRow[] {
  const byKri = new Map<string, typeof kriObservations>();
  kriObservations.forEach((o) => {
    if (!byKri.has(o.kri_id)) byKri.set(o.kri_id, []);
    byKri.get(o.kri_id)!.push(o);
  });

  return kris.map((kri) => {
    const obs = [...(byKri.get(kri.kri_id) ?? [])].sort((a, b) => (a.as_of_ts > b.as_of_ts ? -1 : 1));
    const current = obs[0]?.band ?? '—';
    const prior = obs[1]?.band;
    const wowChange =
      prior && prior !== current ? `${prior} → ${current}` : prior ? '= no change' : '—';

    const risk = getRisk(kri.linked_risk_id);
    const domain = risk ? getRiskDomain(risk.domain_id) : null;

    return {
      kriId: kri.kri_id,
      name: kri.name,
      domainLabel: domain?.title ?? risk?.domain_id ?? '—',
      currentBand: current,
      wowChange,
    };
  });
}

export { buildWcwEvidenceQualityFlags };
