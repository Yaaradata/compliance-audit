/** Shared period grains for FASTag gateway drill-downs. */

export type DrillPeriodGrain = 'year' | 'quarter' | 'month' | 'weeks' | 'last24';

export const DRILL_PERIOD_OPTIONS: { id: DrillPeriodGrain; label: string }[] = [
  { id: 'year', label: 'Year' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'month', label: 'Month' },
  { id: 'weeks', label: 'Weeks' },
  { id: 'last24', label: 'Last-24' },
];
