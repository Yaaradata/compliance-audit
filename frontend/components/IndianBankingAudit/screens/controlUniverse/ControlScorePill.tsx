'use client';

import { StatusBadge } from '../../primitives';
import { bandFromScore } from '../../theme';
import { formatScoreValue } from './controlUniverseLayout';

/** CES-style pill for Operating / Catch / Evidence (no progress bar). */
export function ControlScorePill({ value }: { value: number | null | undefined }) {
  return (
    <StatusBadge
      tone={bandFromScore(value)}
      label={formatScoreValue(value)}
      size="xs"
    />
  );
}
