/**
 * UK Board version routing — shared by the select-region card.
 * Separate product from UK Banking Audit. Keep in sync with app/UKBoard/v{n}/page.tsx.
 */
export type UkBoardVersion = "v1" | "v2";

export const LATEST_UK_BOARD_VERSION: UkBoardVersion = "v2";

export const UK_BOARD_PATHS: Record<UkBoardVersion, string> = {
  v1: "/UKBoard/v1",
  v2: "/UKBoard/v2",
};

/** Dropdown labels — latest first. */
export const UK_BOARD_VERSION_ORDER: UkBoardVersion[] = ["v2", "v1"];

export const UK_BOARD_VERSION_SELECT_LABELS: Record<UkBoardVersion, string> = {
  v2: "v2 — latest",
  v1: "v1",
};
