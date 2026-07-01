/** Supported UK Process Audit app versions. */
export type UkpaVersion = "v1";

export const UKPA_VERSION_SELECT_LABELS: Record<UkpaVersion, string> = {
  v1: "v1 — latest",
};

export const UKPA_VERSION_ORDER: readonly UkpaVersion[] = ["v1"];

export const LATEST_UKPA_VERSION: UkpaVersion = "v1";

export const UKPA_BASE_PATHS: Record<UkpaVersion, string> = {
  v1: "/UK_Process_Audit/v1",
};

export function getUkpaBasePath(version: UkpaVersion): string {
  return UKPA_BASE_PATHS[version];
}
