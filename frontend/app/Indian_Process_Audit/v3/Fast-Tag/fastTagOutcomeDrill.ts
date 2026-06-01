/** Pie legend labels — must match `OutcomePieChart` slice names. */
export type FastTagOutcomeSlice = 'Completed' | 'Critical' | 'Exception';

export type FastTagOutcomeDrill =
  | { mode: 'matrix'; status?: 'failure' | 'pending' }
  | { mode: 'compliant-details' };

export function outcomeSliceToDrill(slice: FastTagOutcomeSlice): FastTagOutcomeDrill | null {
  if (slice === 'Critical') return { mode: 'matrix', status: 'failure' };
  if (slice === 'Exception') return { mode: 'matrix', status: 'pending' };
  if (slice === 'Completed') return { mode: 'compliant-details' };
  return null;
}

export function outcomeDrillLabel(drill: FastTagOutcomeDrill): string {
  if (drill.mode === 'compliant-details') return 'Completed cases';
  if (drill.status === 'failure') return 'Critical cases';
  if (drill.status === 'pending') return 'Exception cases';
  return 'All cases';
}
