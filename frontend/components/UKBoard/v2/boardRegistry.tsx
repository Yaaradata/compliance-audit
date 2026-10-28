"use client";

/** UK Board v2 — registry for the Board member sections (boardSections.tsx). */
import type { ReactNode } from "react";
import type { SectionId } from "@/lib/ukboard/v2/personaViews";
import * as B from "./boardSections";

const MAP: Partial<Record<SectionId, () => ReactNode>> = {
  BM_POSTURE: B.BmPosture,
  BM_SCORECARD: B.BusinessLineScorecard,
  BM_DIAL_GRID: B.DialGrid,
  BM_TIERS: B.RiskTiers,
  BM_CHANGED: B.BmChanged,
  BM_UNCHANGED: B.BmUnchanged,
  BM_CUSTOMER_PULSE: B.CustomerPulse,
  BM_FIN_STRENGTH: B.FinancialStrengthPanel,
  BM_AGENT_PANEL: B.AgentPanel,
  BM_GROWTH_TABLE: B.GrowthAppetiteTable,
  BM_EARLY_WARNINGS: B.EarlyWarnings,
  BM_CREDIT: B.CreditQuality,
  BM_FIN_DETAIL: B.FinancialStrengthDetail,
  BM_TENSIONS: B.PolicyTensions,
  BM_DUTY_OUTCOMES: B.DutyOutcomes,
  BM_COMPLAINTS: B.ComplaintsTrend,
  BM_THEMES: B.ComplaintThemes,
  BM_VULN: B.VulnerableCustomers,
  BM_HARM: B.HarmEvent,
  BM_SIGNALS: B.CustomerSignals,
  BM_CULTURE: B.Culture,
  BM_DECISION_CARDS: B.BmDecisionCards,
  BM_CHALLENGES: B.ChallengeQuestions,
  BM_MY_NOTES: B.MyNotes,
  BM_DUE_REVIEW: B.DueForReview,
  BM_REG_RELATIONSHIP: B.RegulatorRelationship,
  BM_REG_CALENDAR: B.RegulatoryCalendar,
  BM_SIGNOFF_STRIP: B.SignOffStrip,
  BM_DEFENCE: B.LinesOfDefence,
  BM_JOURNEYS: B.RiskVsControlOwner,
  BM_AGENT_VALUE: B.AgentValue,
  BM_FINDINGS: B.AgentFindings,
  BM_TUNING_SUMMARY: B.TuningSummary,
  BM_DECIDE_DATES: B.DecideAndDates,
};

export function renderBoardMemberSection(id: SectionId): ReactNode {
  const C = MAP[id];
  return C ? <C /> : null;
}
