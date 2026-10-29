/**
 * UK Board v2 — persona-specific information architecture. The tab bar renders from the active
 * persona; each tab is a layout of shared sections (components/UKBoard/v2/sections.tsx). Within one
 * persona no section appears on two tabs (checked by board.test.ts). Titles are noun phrases.
 */
export type PersonaId = "board" | "chair" | "cro";

/** Section ids are the keys of the registry in sections.tsx. */
export type SectionId = string;

/** A row of columns on the 12-column grid; each column stacks its sections. */
export type Layout = { cols: { span: 3 | 4 | 5 | 6 | 7 | 8 | 12; sections: SectionId[] }[] }[];

export interface TabView {
  id: string;
  label: string;
  /** Page title: a noun phrase, at most 5 words. */
  title: string;
  /** Optional meta line, at most 10 words. */
  meta?: string;
  /** One-screen summary: sources as ⓘ tooltips, 12px gaps, cards end at their last row. */
  compact?: boolean;
  layout: Layout;
}

export interface PersonaView {
  label: string;
  person: string;
  defaultTab: string;
  tabs: TabView[];
}

type Span = 3 | 4 | 5 | 6 | 7 | 8 | 12;
const full = (...sections: SectionId[]) => ({ cols: [{ span: 12 as const, sections }] });
const row = (...cols: [Span, ...SectionId[]][]) => ({ cols: cols.map(([span, ...sections]) => ({ span, sections })) });

export const PERSONA_VIEWS: Record<PersonaId, PersonaView> = {
  board: {
    label: "Board member",
    person: "Board member (non-executive)",
    defaultTab: "overview",
    tabs: [
      {
        id: "overview",
        label: "Overview",
        title: "Board risk summary",
        compact: true,
        layout: [full("O_SCORECARD"), full("O_POSTURE_B"), row([4, "O_TOP"], [4, "O_OBLIGATORY"], [4, "O_EMERGING", "O_CALLS_B"]), row([7, "O_EXPOSURE"], [5, "O_SINCE"])],
      },
      {
        id: "appetite",
        label: "Risk appetite",
        title: "Risk appetite",
        layout: [full("M_TABLE"), row([6, "R_CAPACITY"], [6, "R_CYBER"]), row([6, "E_TRIAL"], [6, "E_UNMEASURED"]), row([6, "S_TENSIONS"], [6, "S_POLICY"]), full("S_HISTORY")],
      },
      {
        id: "obligatory",
        label: "Regulatory · Level 0",
        title: "Regulatory · Level 0",
        meta: "Zero appetite. Regulatory must-haves.",
        layout: [full("OB_CARDS"), full("OB_REPORTABLE"), row([6, "OB_RESTRICTION"], [6, "OB_SCREENING"]), full("OB_DUTY"), row([4, "OB_VULN"], [4, "OB_REDRESS"], [4, "OB_ENFORCEMENT"]), full("E_HORIZON")],
      },
      {
        id: "accountability",
        label: "Accountability",
        title: "Accountability",
        layout: [full("AC_OWNERS"), full("AC_SIGHT"), row([8, "AC_HEATMAP"], [4, "AC_DEFENCE"]), row([6, "AC_CULTURE"], [6, "AC_REMOVED"]), full("DECISION_LOG")],
      },
      {
        id: "ai",
        label: "AI agents",
        title: "AI agents",
        layout: [full("A_TILES"), row([8, "A_FINDINGS"], [4, "A_AUTONOMY"]), row([8, "A_TUNING"], [4, "A_RULES"]), full("A_ROSTER")],
      },
    ],
  },
  chair: {
    label: "Risk Committee Chair",
    person: "Risk Committee Chair",
    defaultTab: "committee",
    tabs: [
      {
        id: "committee",
        label: "Committee",
        title: "Committee",
        meta: "Board Risk Committee · 15 Dec",
        layout: [full("O_POSTURE"), row([8, "C_AGENDA"], [4, "P_PAPER"]), row([4, "C_PACK"], [4, "O_CALLS"], [4, "ESCALATION"])],
      },
      { id: "risk", label: "Risk & reporting", title: "Risk and reporting", layout: [full("P_TIERS"), full("OB_REPORTABLE")] },
      {
        id: "oversight",
        label: "Oversight",
        title: "Oversight",
        layout: [full("AC_OWNERS"), full("AC_SIGHT"), full("AC_HEATMAP"), row([8, "A_AUTONOMY"], [4, "A_RULES"]), row([4, "C_WAITING"], [8, "A_ACTIVITY"])],
      },
    ],
  },
  cro: {
    label: "Chief Risk Officer",
    person: "Chief Risk Officer",
    defaultTab: "actions",
    tabs: [
      { id: "actions", label: "My actions", title: "My actions", layout: [row([8, "R_QUEUE"], [4, "R_DEADLINES", "R_CLOCKS_DUE", "P_PAPER"]), full("R_PACK")] },
      { id: "risk", label: "Risk & roll-up", title: "Risk and roll-up", layout: [full("M_TABLE_CRO"), row([6, "S_TENSIONS"], [6, "S_POLICY"]), row([8, "AC_OWNERS"], [4, "ESCALATION"])] },
      { id: "reporting", label: "Regulatory reporting", title: "Regulatory reporting", layout: [full("OB_REPORTABLE"), row([6, "OB_RESTRICTION"], [6, "OB_ENFORCEMENT"]), full("E_HORIZON")] },
      { id: "agents", label: "AI agents", title: "AI agents", layout: [row([8, "A_ROSTER"], [4, "A_AUTONOMY"]), full("A_TUNING"), full("A_ACTIVITY")] },
    ],
  },
};

export const sectionsOf = (t: TabView) => t.layout.flatMap((r) => r.cols.flatMap((c) => c.sections));
