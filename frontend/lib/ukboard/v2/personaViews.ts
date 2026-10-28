/**
 * UK Board v2 — persona-specific information architecture. The tab bar renders from the active
 * persona; each tab is a layout of shared sections (components/UKBoard/v2/sections.tsx). Within one
 * persona no section appears on two tabs (checked by board.test.ts). Titles are noun phrases.
 */
export type PersonaId = "board" | "chair" | "cro";

/** Section ids are the keys of the registry in sections.tsx. */
export type SectionId = string;

/** A row of columns on the 12-column grid; each column stacks its sections. */
export type Layout = { cols: { span: 3 | 4 | 6 | 8 | 12; sections: SectionId[] }[] }[];

export interface TabView {
  id: string;
  label: string;
  /** Page title: a noun phrase, at most 5 words. */
  title: string;
  /** Optional meta line, at most 10 words. */
  meta?: string;
  layout: Layout;
}

export interface PersonaView {
  label: string;
  person: string;
  defaultTab: string;
  tabs: TabView[];
}

type Span = 3 | 4 | 6 | 8 | 12;
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
        meta: "Pack 15 Dec · evidence 26 Oct",
        layout: [full("O_POSTURE"), full("O_TIERS"), row([4, "O_CALLS"], [4, "O_REPORTABLE"], [4, "O_TENSIONS"]), row([4, "O_ACCOUNT"], [8, "O_SINCE"])],
      },
      {
        id: "strategy",
        label: "Strategy & appetite",
        title: "Strategy and risk appetite",
        layout: [full("S_CASCADE"), row([6, "S_TENSIONS"], [6, "S_POLICY", "S_BANDS"])],
      },
      {
        id: "top",
        label: "Top risks",
        title: "Top risks",
        layout: [full("R_TOP_TABLE"), row([8, "R_CAPACITY"], [4, "R_FINCRIME_L2"]), row([4, "R_CREDIT"], [4, "R_LIQUIDITY"], [4, "R_CYBER"])],
      },
      {
        id: "emerging",
        label: "Emerging risks",
        title: "Emerging risks",
        layout: [full("E_TABLE"), row([8, "E_DETECTION"], [4, "E_SIGNALS"]), row([6, "E_UNMEASURED"], [6, "E_HORIZON"])],
      },
      {
        id: "obligatory",
        label: "Obligatory · Level 0",
        title: "Obligatory risks · Level 0",
        layout: [full("OB_BANNER"), full("OB_MEASURES"), full("OB_REPORTABLE"), row([6, "OB_RESTRICTION"], [6, "OB_SCREENING"]), full("OB_DUTY"), row([4, "OB_VULN"], [4, "OB_REDRESS"], [4, "OB_ENFORCEMENT"])],
      },
      {
        id: "accountability",
        label: "Accountability",
        title: "Accountability",
        layout: [full("AC_OWNERS"), row([8, "AC_HEATMAP"], [4, "AC_DEFENCE"]), full("AC_SIGHT"), row([6, "AC_CULTURE"], [6, "AC_REMOVED"])],
      },
      {
        id: "decisions",
        label: "Decisions",
        title: "Board decisions",
        layout: [full("D_CALLS"), full("DECISION_LOG")],
      },
      {
        id: "ai",
        label: "AI agents",
        title: "AI agents",
        layout: [full("A_TILES"), row([8, "A_FINDINGS"], [4, "A_AUTONOMY"]), row([8, "A_ROSTER"], [4, "A_RULES"]), full("A_TUNING")],
      },
    ],
  },
  chair: {
    label: "Risk Committee Chair",
    person: "Risk Committee Chair",
    defaultTab: "agenda",
    tabs: [
      {
        id: "agenda",
        label: "Agenda",
        title: "Committee agenda",
        meta: "Board Risk Committee · 15 Dec",
        layout: [full("POSTURE"), row([8, "C_AGENDA", "C_PACK"], [4, "ESCALATION", "UNCHANGED"])],
      },
      { id: "exceptions", label: "Appetite exceptions", title: "Appetite exceptions", layout: [row([8, "EXCEPTIONS"], [4, "TRADEOFFS"])] },
      { id: "owners", label: "Accountability & attestation", title: "Accountability and attestation", layout: [full("OWNERS"), row([4, "ATTEST_MONTH"], [8, "HEATMAP"])] },
      { id: "agents", label: "Agent governance", title: "Agent governance", layout: [row([4, "AUTONOMY"], [4, "RULES"], [4, "C_WAITING"]), full("ACTIVITY")] },
    ],
  },
  cro: {
    label: "Chief Risk Officer",
    person: "Chief Risk Officer",
    defaultTab: "actions",
    tabs: [
      { id: "actions", label: "My actions", title: "My actions", layout: [row([8, "R_QUEUE"], [4, "R_DEADLINES", "R_CLOCKS_DUE"])] },
      { id: "appetite", label: "Risk appetite", title: "Risk appetite", layout: [full("POSTURE"), full("MEASURES_FULL"), row([8, "CAPACITY"], [4, "TRADEOFFS"])] },
      { id: "reporting", label: "Reporting cases", title: "Reporting cases", layout: [row([8, "REPORTING"], [4, "RESTRICTION"]), row([6, "HORIZON"], [6, "ENFORCEMENT"])] },
      { id: "pack", label: "Board pack", title: "Board pack", layout: [row([8, "R_PACK"], [4, "ESCALATION"]), full("OWNERS"), full("DECISION_LOG")] },
      { id: "agents", label: "AI agents", title: "AI agents", layout: [row([8, "ROSTER"], [4, "AUTONOMY"]), row([6, "TUNING"], [6, "ACTIVITY"])] },
    ],
  },
};

export const sectionsOf = (t: TabView) => t.layout.flatMap((r) => r.cols.flatMap((c) => c.sections));
