export type SrilankaRetailVersion = "v1" | "v2";

export const LATEST_SRILANKA_RETAIL_VERSION: SrilankaRetailVersion = "v2";

export const SRILANKA_RETAIL_PATHS: Record<SrilankaRetailVersion, string> = {
  v1: "/Srilanka_Retail/v1",
  v2: "/Srilanka_Retail/v2",
};

/** Dropdown labels — latest first. */
export const SRILANKA_RETAIL_VERSION_ORDER: SrilankaRetailVersion[] = ["v2", "v1"];

export const SRILANKA_RETAIL_VERSION_SELECT_LABELS: Record<SrilankaRetailVersion, string> = {
  v2: "v2 — latest",
  v1: "v1",
};
