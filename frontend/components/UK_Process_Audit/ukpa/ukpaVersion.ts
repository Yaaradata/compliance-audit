/** Supported UK Process Audit app versions. */
export type UkpaVersion = "v1" | "v2" | "v3";

export const UKPA_VERSION_SELECT_LABELS: Record<UkpaVersion, string> = {
  v3: "v3 — enforcement intelligence",
  v2: "v2",
  v1: "v1",
};

/** Newest route first (version picker, docs). */
export const UKPA_VERSION_ORDER: readonly UkpaVersion[] = ["v3", "v2", "v1"];

export const LATEST_UKPA_VERSION: UkpaVersion = "v3";

export const UKPA_BASE_PATHS: Record<UkpaVersion, string> = {
  v1: "/UK_Process_Audit/v1",
  v2: "/UK_Process_Audit/v2",
  v3: "/UK_Process_Audit/v3",
};

export function getUkpaBasePath(version: UkpaVersion): string {
  return UKPA_BASE_PATHS[version];
}
