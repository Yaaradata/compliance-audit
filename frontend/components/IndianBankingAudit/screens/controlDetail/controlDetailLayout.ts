/** Shared layout tokens for Control Universe detail pane. */

export const DETAIL_CELL = 'px-2.5 py-2 align-top text-left';

export const DETAIL_TABLE_HEAD =
  'bg-slate-50 px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500';

/** Population grid — min width keeps columns readable; pane scrolls horizontally if needed. */
export const POPULATION_TABLE_MIN_W = 'min-w-[44rem]';

export const POPULATION_COL = {
  ci: 'w-[26%]',
  subject: 'w-[14%]',
  outcome: 'w-[11%]',
  fired: 'w-[17%]',
  latency: 'w-[9%]',
  reason: 'w-[23%]',
} as const;

export const OUTCOME_WINDOW_LABEL: Record<string, string> = {
  Pass: 'Pass',
  Fail: 'Fail',
  EvidenceGap: 'Evidence gap',
  DataGap: 'Data gap',
  NeedsReview: 'Needs review',
  NA: 'N/A',
};
