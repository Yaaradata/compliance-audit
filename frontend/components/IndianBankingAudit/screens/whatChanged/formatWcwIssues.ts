import type { Issue } from '../../dataModel';
import { formatIssueDisplayTitle, truncateWords } from '../executiveRiskPosture/v2/zone2/issueWatchlistFormat';
import { getIssueWeekWindows } from './formatWeekRange';

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function severityRank(severity: string): number {
  return SEVERITY_RANK[severity.toLowerCase()] ?? 99;
}

/** Strict HIGH → MEDIUM → LOW (critical grouped with high). */
export function sortIssuesBySeverity<T extends { severity: string; ageing_days?: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const dr = severityRank(a.severity) - severityRank(b.severity);
    if (dr !== 0) return dr;
    return (a.ageing_days ?? 0) - (b.ageing_days ?? 0);
  });
}

function parseOpenedAt(iso: string): number {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).getTime();
}

function isInRange(iso: string, startMs: number, endMs: number): boolean {
  const t = parseOpenedAt(iso);
  return !Number.isNaN(t) && t >= startMs && t <= endMs;
}

export function filterIssuesOpenedInWeek(issueList: Issue[], weekStart: Date, weekEnd: Date): Issue[] {
  const startMs = weekStart.getTime();
  const endMs = weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1;
  return issueList.filter((i) => isInRange(i.opened_at, startMs, endMs));
}

/** Issues for column 1: opened this week, severity-sorted; falls back to open issues if none. */
export function buildNewIssuesColumnData(issueList: Issue[]) {
  const { thisWeekStart, thisWeekEnd, priorWeekStart, priorWeekEnd } = getIssueWeekWindows();

  const thisWeek = sortIssuesBySeverity(filterIssuesOpenedInWeek(issueList, thisWeekStart, thisWeekEnd));
  const lastWeekCount = filterIssuesOpenedInWeek(issueList, priorWeekStart, priorWeekEnd).length;

  const openSorted = sortIssuesBySeverity(issueList.filter((i) => !i.closed_at));
  const displaySource = thisWeek.length ? thisWeek : openSorted;
  const displayIssues = displaySource;

  return {
    thisWeekCount: thisWeek.length,
    lastWeekCount,
    totalForViewAll: displayIssues.length,
    displayIssues,
    visibleIssues: displayIssues.slice(0, 3),
  };
}

export function issueTitleForCard(issue: Issue, maxWords = 8): string {
  return truncateWords(formatIssueDisplayTitle(issue), maxWords);
}

export const SEVERITY_BADGE: Record<
  string,
  { label: string; bg: string; text: string; border: string; accent: string; tint: string }
> = {
  critical: {
    label: 'HIGH',
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#FECACA',
    accent: '#DC2626',
    tint: 'rgba(220, 38, 38, 0.04)',
  },
  high: {
    label: 'HIGH',
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#FECACA',
    accent: '#DC2626',
    tint: 'rgba(220, 38, 38, 0.04)',
  },
  medium: {
    label: 'MEDIUM',
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
    accent: '#D97706',
    tint: 'rgba(217, 119, 6, 0.04)',
  },
  low: {
    label: 'LOW',
    bg: '#F0FDF4',
    text: '#16A34A',
    border: '#BBF7D0',
    accent: '#16A34A',
    tint: 'rgba(22, 163, 74, 0.04)',
  },
};

export function severityBadgeStyle(severity: string) {
  const key = severity.toLowerCase();
  return SEVERITY_BADGE[key] ?? SEVERITY_BADGE.medium;
}
