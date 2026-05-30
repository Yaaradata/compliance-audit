import { isJourneyCaseAuditFinding } from './journeyHeatmap';
import type { JourneyCaseLike } from './journeyCaseTypes';

export type { JourneyCaseLike } from './journeyCaseTypes';

const UNCLASSIFIED = 'Unclassified';

export function sliceFromSegment(kase: JourneyCaseLike): string {
  const raw = kase.segment?.trim();
  return raw && raw.length > 0 ? raw : UNCLASSIFIED;
}

export function getLoanProductSlice(kase: JourneyCaseLike): string {
  const subj = kase.subject ?? '';
  const prefixes = [
    'Home Loan',
    'Personal Loan',
    'Vehicle Loan',
    'MSME Loan',
    'Gold Loan',
    'Business Loan',
  ] as const;
  for (const prefix of prefixes) {
    if (subj.startsWith(prefix)) return prefix;
  }
  return sliceFromSegment(kase);
}

export type JourneySliceStat = {
  id: string;
  label: string;
  caseCount: number;
  failedCount: number;
};

export function buildJourneySliceStats(
  cases: JourneyCaseLike[],
  resolveSlice: (kase: JourneyCaseLike) => string,
  getLabel: (id: string) => string = (id) => id,
): JourneySliceStat[] {
  const map = new Map<string, JourneySliceStat>();
  for (const kase of cases) {
    const id = resolveSlice(kase);
    const row = map.get(id) ?? { id, label: getLabel(id), caseCount: 0, failedCount: 0 };
    row.caseCount += 1;
    if (isJourneyCaseAuditFinding(kase)) row.failedCount += 1;
    map.set(id, row);
  }
  return [...map.values()].sort(
    (a, b) => b.failedCount - a.failedCount || b.caseCount - a.caseCount,
  );
}

export function getJourneySliceOptions(
  cases: JourneyCaseLike[],
  resolveSlice: (kase: JourneyCaseLike) => string,
  getLabel?: (id: string) => string,
) {
  return buildJourneySliceStats(cases, resolveSlice, getLabel).map((s) => ({
    id: s.id,
    label: s.label,
    caseCount: s.caseCount,
    failedCount: s.failedCount,
  }));
}
