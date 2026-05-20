import type { RegAlertRecord } from '@/lib/IndianBankingAudit/regIntelMockData';

/** Inbox list sort — Zone B header control. */
export type RegIntelInboxSortKey = 'urgency';

export type RegIntelInboxSortDirection = 'asc' | 'desc';

export type RegIntelInboxSortState = {
  key: RegIntelInboxSortKey;
  direction: RegIntelInboxSortDirection;
};

export const DEFAULT_INBOX_SORT: RegIntelInboxSortState = {
  key: 'urgency',
  direction: 'asc',
};

/** Governance tier for urgency sort (lower = more urgent). */
export function urgencyTier(alert: RegAlertRecord): number {
  if (alert.instrument_type === 'DRAFT DIRECTION') return 4;
  if (alert.is_peer_signal) return 2;
  if (alert.governance_track === 'emergency') return 0;
  if (alert.governance_track === 'expedited') return 1;
  return 3;
}

/** Days to effective for sorting; null / past → large sentinel (sorts last when ascending). */
export function daysToEffectiveSortKey(alert: RegAlertRecord): number {
  return alert.days_to_effective == null || alert.days_to_effective < 0 ? 99999 : alert.days_to_effective;
}

export function toggleInboxSortDirection(state: RegIntelInboxSortState): RegIntelInboxSortState {
  return {
    ...state,
    direction: state.direction === 'asc' ? 'desc' : 'asc',
  };
}

/** Visible label — always plain text; direction is conveyed via icon + aria. */
export function inboxSortControlLabel(_state: RegIntelInboxSortState): string {
  return 'Sorted by urgency';
}

/** Text-only control styles (semantic `<button>`, looks like label copy). */
export const INBOX_SORT_TEXT_CONTROL_CLASS =
  'ori-reg-intel-inbox-sort-text inline-flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[11px] font-medium uppercase tracking-wide text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export function inboxSortAriaLabel(state: RegIntelInboxSortState): string {
  const order =
    state.direction === 'asc'
      ? 'most urgent first: emergency and expedited alerts, then soonest effective dates'
      : 'least urgent first: reverse urgency order';
  return `${inboxSortControlLabel(state)}. ${order}. Click to reverse sort order.`;
}

/**
 * Inbox sort (REG_INTEL_SPEC Pass 4 + direction toggle).
 * Asc: emergency → expedited → peer (materiality) → standard/advisory → drafts; fewest days first within tier.
 * Desc: reverses tier and tie-break order.
 */
export function sortInboxAlerts(
  alerts: RegAlertRecord[],
  sort: RegIntelInboxSortState = DEFAULT_INBOX_SORT,
): RegAlertRecord[] {
  const dir = sort.direction === 'asc' ? 1 : -1;

  return [...alerts].sort((a, b) => {
    const ta = urgencyTier(a);
    const tb = urgencyTier(b);
    if (ta !== tb) return dir * (ta - tb);

    if (ta === 2) {
      const mat = b.materiality_score - a.materiality_score;
      if (mat !== 0) return dir * mat;
    }

    if (ta === 4) {
      const pub = b.publication_date.localeCompare(a.publication_date);
      if (pub !== 0) return dir * pub;
    }

    const da = daysToEffectiveSortKey(a);
    const db = daysToEffectiveSortKey(b);
    if (da !== db) return dir * (da - db);

    const mat = b.materiality_score - a.materiality_score;
    if (mat !== 0) return dir * mat;

    return dir * b.publication_date.localeCompare(a.publication_date);
  });
}
