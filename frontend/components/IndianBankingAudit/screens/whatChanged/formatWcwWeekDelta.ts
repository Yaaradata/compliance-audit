export type WeekDeltaTone = 'up' | 'down' | 'same';

export type WeekDeltaLabel = {
  text: string;
  tone: WeekDeltaTone;
};

export function formatWeekDelta(thisWeek: number, lastWeek: number): WeekDeltaLabel {
  const diff = thisWeek - lastWeek;
  if (diff > 0) return { text: `↑${diff} vs last week`, tone: 'up' };
  if (diff < 0) return { text: `↓${Math.abs(diff)} vs last week`, tone: 'down' };
  return { text: '= same', tone: 'same' };
}

export const WEEK_DELTA_CLASS: Record<WeekDeltaTone, string> = {
  up: 'text-[#DC2626]',
  down: 'text-[#16A34A]',
  same: 'text-[#6B7280]',
};
