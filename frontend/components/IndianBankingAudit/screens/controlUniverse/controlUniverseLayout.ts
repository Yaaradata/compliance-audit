/** Layout tokens for Control Universe master table. */

export const SELECT_CLASS =
  'w-full min-w-0 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800';

export const FIELD_LABEL = 'mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500';

export const TABLE_HEAD =
  'px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500';

export const TABLE_CELL = 'px-2 py-2 align-top';

export const SCORE_COL_CLASS = 'w-[4.5rem]';

/** Format dimension scores for pill labels (integers or one decimal). */
export function formatScoreValue(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
