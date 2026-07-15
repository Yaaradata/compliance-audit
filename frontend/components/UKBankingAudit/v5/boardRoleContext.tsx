"use client";

import { createContext, useContext } from "react";
import type { BoardRole } from "@/lib/ukbankingaudit/v5/dispositions";

/**
 * Current viewer role for the v5 board. Defaults to the operating second line.
 * When set to "internal-audit" the pack is read-only — see `dispositions.ts`,
 * which refuses any disposition from this role at the data layer.
 */
export const BoardRoleContext = createContext<BoardRole>("second-line");

export function useBoardRole(): BoardRole {
  return useContext(BoardRoleContext);
}
