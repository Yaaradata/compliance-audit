/** Supported UK Process Audit app versions. */
export type UkpaVersion = "v1" | "v2";

export const UKPA_VERSION_SELECT_LABELS: Record<UkpaVersion, string> = {
  v2: "v2 — latest",
  v1: "v1",
};

/** Newest route first (version picker, docs). */
export const UKPA_VERSION_ORDER: readonly UkpaVersion[] = ["v2", "v1"];

export const LATEST_UKPA_VERSION: UkpaVersion = "v2";

export const UKPA_BASE_PATHS: Record<UkpaVersion, string> = {
  v1: "/UK_Process_Audit/v1",
  v2: "/UK_Process_Audit/v2",
};

export function getUkpaBasePath(version: UkpaVersion): string {
  return UKPA_BASE_PATHS[version];
}
