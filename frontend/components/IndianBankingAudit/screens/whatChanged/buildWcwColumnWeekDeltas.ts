/** Pass 6 — curated WoW delta badges per column (directional semantics per spec). */
export type WcwWeekDeltaVariant = 'worse' | 'better' | 'same' | 'neutral';

export type WcwWeekDeltaSpec = {
  text: string;
  variant: WcwWeekDeltaVariant;
};

export const WCW_COLUMN_WEEK_DELTAS = {
  newIssues: { text: '↑2 vs last week', variant: 'worse' },
  controlFailures: { text: '= same', variant: 'same' },
  reportingBreaches: { text: '↑1 vs last week', variant: 'worse' },
  aiSignals: { text: '↑1 vs last week', variant: 'neutral' },
} as const satisfies Record<string, WcwWeekDeltaSpec>;

export const WCW_WEEK_DELTA_BADGE_STYLE: Record<
  WcwWeekDeltaVariant,
  { backgroundColor: string; color: string }
> = {
  worse: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  better: { backgroundColor: '#F0FDF4', color: '#16A34A' },
  same: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  neutral: { backgroundColor: '#F3F4F6', color: '#6B7280' },
};
