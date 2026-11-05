"use client";

import { useSyncExternalStore } from "react";
import { getInitialRiskState, getRiskState, subscribeRisk, type RiskState } from "@/lib/ukbankingaudit/v8/riskStore";

/** Session risk state. Every v8 screen reads this, so a save updates them all at once. */
export function useRiskState(): RiskState {
  return useSyncExternalStore(subscribeRisk, getRiskState, getInitialRiskState);
}
