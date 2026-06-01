/** Supported Indian Process Audit app versions. */
export type IpaVersion = 'v1' | 'v2' | 'v3';

export const IPA_VERSION_SELECT_LABELS: Record<IpaVersion, string> = {
  v3: 'v3 — latest',
  v2: 'v2',
  v1: 'v1',
};

/** Newest route first (version picker, docs). */
export const IPA_VERSION_ORDER: readonly IpaVersion[] = ['v3', 'v2', 'v1'];

export const LATEST_IPA_VERSION: IpaVersion = 'v3';

export const IPA_BASE_PATHS: Record<IpaVersion, string> = {
  v1: '/Indian_Process_Audit/v1',
  v2: '/Indian_Process_Audit/v2',
  v3: '/Indian_Process_Audit/v3',
};

export const DEFAULT_IPA_VERSION: IpaVersion = LATEST_IPA_VERSION;

/** v2+ journey heatmap, hero KPIs, and Fast-Tag domain. */
export function hasModernIpaFeatures(version: IpaVersion): boolean {
  return version === 'v2' || version === 'v3';
}

/** v3 journey matrix — stage funnel, action queue, and case drawer (excludes Fast-Tag). */
export function hasV3JourneyCommandCenter(version: IpaVersion): boolean {
  return version === 'v3';
}

export function getIpaBasePath(version: IpaVersion): string {
  return IPA_BASE_PATHS[version];
}
