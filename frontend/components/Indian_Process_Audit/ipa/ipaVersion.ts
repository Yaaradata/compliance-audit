/** Supported Indian Process Audit app versions. */
export type IpaVersion = 'v1' | 'v2';

export const IPA_VERSION_SELECT_LABELS: Record<IpaVersion, string> = {
  v2: 'v2 — latest',
  v1: 'v1',
};

export const LATEST_IPA_VERSION: IpaVersion = 'v2';

export const IPA_BASE_PATHS: Record<IpaVersion, string> = {
  v1: '/Indian_Process_Audit/v1',
  v2: '/Indian_Process_Audit/v2',
};

export const DEFAULT_IPA_VERSION: IpaVersion = LATEST_IPA_VERSION;

export function getIpaBasePath(version: IpaVersion): string {
  return IPA_BASE_PATHS[version];
}
