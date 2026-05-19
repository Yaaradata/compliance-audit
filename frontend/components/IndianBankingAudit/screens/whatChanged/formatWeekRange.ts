const DATE_FMT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

/** Inclusive 7-day window ending today (local). */
export function getWeekRange() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start, end };
}

export function formatWeekRangeLabel(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat('en-IN', DATE_FMT);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/** Current 7-day window and the prior 7-day window (for WoW deltas). */
export function getIssueWeekWindows() {
  const { start, end } = getWeekRange();
  const priorEnd = new Date(start);
  priorEnd.setDate(priorEnd.getDate() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - 6);
  return { thisWeekStart: start, thisWeekEnd: end, priorWeekStart: priorStart, priorWeekEnd: priorEnd };
}
