import { useMemo } from 'react';
import type { SetActiveScreen } from '../../../types';
import { buildZone2PostureData } from './zone2/buildZone2PostureData';

/** Shared aggregates for Scroll Zone 2 (v2 cockpit — PASS 4). */
export function useZone2PostureData(setActiveScreen: SetActiveScreen) {
  return useMemo(() => buildZone2PostureData({ setActiveScreen }), [setActiveScreen]);
}

export type { Zone2PostureData } from './zone2/buildZone2PostureData';
