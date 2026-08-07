"use client";

import { createContext, useContext } from "react";

/** Region the board pack is being read in. Drives precedent corpus, accountability regime, and consequence language. */
export type Jurisdiction = "UK" | "US";

export const JurisdictionContext = createContext<Jurisdiction>("UK");

export function useJurisdiction(): Jurisdiction {
  return useContext(JurisdictionContext);
}
