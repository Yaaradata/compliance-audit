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
  /** One-screen summary: 12px gaps. */
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
        layout: [full("O_SCORECARD"), row([6, "O_OUTSIDE"], [6, "O_DECISIONS", "O_TELL"]), row([6, "O_SINCE"], [6, "O_OWNERSHIP"])],
      },
      {
        id: "appetite",
        label: "Risk appetite",
        title: "Risk appetite",
        layout: [full("M_TABLE"), row([6, "R_CAPACITY", "E_UNMEASURED"], [6, "E_TRIAL", "R_CYBER"]), row([6, "S_TENSIONS"], [6, "S_POLICY"])],
      },
      {
        id: "obligatory",
        label: "Regulatory · Level 0",
        title: "Regulatory · Level 0",
        meta: "Zero appetite. Regulatory must-haves.",
        layout: [full("OB_CARDS"), row([6, "OB_REPORTABLE", "OB_ENFORCEMENT"], [6, "OB_RESTRICTION", "OB_VULN"]), row([6, "OB_SCREENING"], [6, "E_HORIZON", "OB_REDRESS"])],
      },
      {
        id: "accountability",
        label: "Accountability",
        title: "Accountability",
        layout: [row([8, "AC_OWNERS"], [4, "AC_DEFENCE", "AC_CULTURE"]), row([6, "AC_HEATMAP"], [6, "AC_SIGHT"]), full("DECISION_LOG")],
      },
      {
        id: "ai",
        label: "AI agents",
        title: "AI agents",
        layout: [row([6, "A_FINDINGS", "A_RULES"], [6, "A_TUNING", "A_AUTONOMY"]), full("A_ROSTER")],
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
        layout: [row([8, "C_AGENDA"], [4, "P_PAPER", "C_PACK"]), row([6, "O_CALLS"], [6, "ESCALATION"])],
      },
      { id: "risk", label: "Risk & reporting", title: "Risk and reporting", layout: [full("P_TIERS"), full("OB_REPORTABLE")] },
      {
        id: "oversight",
        label: "Oversight",
        title: "Oversight",
        layout: [row([8, "AC_OWNERS"], [4, "C_WAITING", "A_RULES"]), full("AC_SIGHT"), row([7, "AC_HEATMAP"], [5, "A_AUTONOMY"])],
      },
    ],
  },
  cro: {
    label: "Chief Risk Officer",
    person: "Chief Risk Officer",
    defaultTab: "actions",
    tabs: [
      { id: "actions", label: "My actions", title: "My actions", layout: [row([8, "R_QUEUE"], [4, "R_DEADLINES", "R_CLOCKS_DUE", "P_PAPER"]), full("R_PACK")] },
      { id: "risk", label: "Risk & roll-up", title: "Risk and roll-up", layout: [full("M_TABLE_CRO"), row([8, "AC_OWNERS"], [4, "ESCALATION", "S_POLICY"]), full("S_TENSIONS")] },
      { id: "reporting", label: "Regulatory reporting", title: "Regulatory reporting", layout: [full("OB_REPORTABLE"), row([6, "OB_RESTRICTION"], [6, "OB_ENFORCEMENT", "E_HORIZON"])] },
      { id: "agents", label: "AI agents", title: "AI agents", layout: [row([6, "A_AUTONOMY", "A_ROSTER"], [6, "A_TUNING", "A_ACTIVITY"])] },
    ],
  },
};

export const sectionsOf = (t: TabView) => t.layout.flatMap((r) => r.cols.flatMap((c) => c.sections));
