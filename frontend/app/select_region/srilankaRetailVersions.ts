export type SrilankaRetailVersion = "v1" | "v2" | "v4" | "v5";

export const LATEST_SRILANKA_RETAIL_VERSION: SrilankaRetailVersion = "v5";

export const SRILANKA_RETAIL_PATHS: Record<SrilankaRetailVersion, string> = {
  v1: "/Srilanka_Retail/v1",
  v2: "/Srilanka_Retail/v2",
  v4: "/Srilanka_Retail/v4",
  v5: "/Srilanka_Retail/v5",
};

/** Dropdown labels — latest first. */
export const SRILANKA_RETAIL_VERSION_ORDER: SrilankaRetailVersion[] = ["v5", "v4", "v2", "v1"];

export const SRILANKA_RETAIL_VERSION_SELECT_LABELS: Record<SrilankaRetailVersion, string> = {
  v5: "v5 — latest",
  v4: "v4",
  v2: "v2",
  v1: "v1",
};
