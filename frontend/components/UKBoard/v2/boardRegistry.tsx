"use client";

/** UK Board v2 — registry for the Board member sections (boardSections.tsx). */
import type { ReactNode } from "react";
import type { SectionId } from "@/lib/ukboard/v2/personaViews";
import * as B from "./boardSections";

const MAP: Partial<Record<SectionId, () => ReactNode>> = {
  BM_POSTURE: B.BmPosture,
  BM_LINES: B.BusinessLineCards,
  BM_POSITION: B.PositionChart,
  BM_DECIDE_DATES: B.DecideAndDates,
  BM_SINCE: B.SinceLastBoard,
  BM_UNRESOLVED: B.StillUnresolved,
  BM_PANEL_CUSTOMERS: B.PanelCustomers,
  BM_PANEL_OWNERS: B.PanelOwners,
  BM_PANEL_AGENTS: B.PanelAgents,
  BM_GROWTH_TABLE: B.GrowthTable,
  BM_MEASURES_DETAIL: B.MeasuresDetail,
  BM_CREDIT: B.CreditQuality,
  BM_EMERGING: B.EmergingList,
  BM_CAPACITY: B.Capacity,
  BM_TRADEOFFS: B.BmTradeoffs,
  BM_TENSIONS: B.PolicyTensions,
  BM_DUTY_OUTCOMES: B.DutyOutcomes,
  BM_COMPLAINTS: B.ComplaintsTrend,
  BM_THEMES: B.ComplaintThemes,
  BM_VULN: B.VulnerableCustomers,
  BM_HARM: B.HarmEvent,
  BM_SIGNALS: B.CustomerSignals,
  BM_CULTURE: B.Culture,
  BM_DECISION_CARDS: B.DecisionCards,
  BM_CHALLENGES: B.ChallengeQuestions,
  BM_MY_NOTES: B.MyNotes,
  BM_DUE_REVIEW: B.DueForReview,
  BM_RESTRICTION: B.BmRestriction,
  BM_SANCTIONS: B.SanctionsDetail,
  BM_REG_RELATIONSHIP: B.RegulatorRelationship,
  BM_REG_CALENDAR: B.RegulatoryCalendar,
  BM_OWNERS: B.BmOwners,
  BM_SIGNOFF_STRIP: B.SignOffStrip,
  BM_DEFENCE: B.LinesOfDefence,
  BM_JOURNEYS: B.RiskVsControlOwner,
  BM_ESCALATION: B.Escalation,
  BM_DATA_QUALITY: B.DataQuality,
  BM_REMOVED: B.BmRemoved,
  BM_AGENT_STATS: B.AgentStats,
  BM_FINDINGS: B.AgentFindings,
  BM_ROSTER: B.AgentRosterLines,
  BM_TUNING: B.TuningComparison,
};

export function renderBoardMemberSection(id: SectionId): ReactNode {
  const C = MAP[id];
  return C ? <C /> : null;
}
