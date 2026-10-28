/**
 * UK Board v2 — persona-specific information architecture. The tab bar renders from the
 * active persona; each tab is a layout of reusable sections. Within one persona no section
 * appears on two tabs (checked by board.test.ts).
 */
export type PersonaId = "board" | "chair" | "cro";

export type SectionId =
  | "UNCHANGED"
  | "APPETITE_SUMMARY"
  | "MEASURES"
  | "GROWTH_CAPACITY"
  | "TRADEOFFS"
  | "DECISION_CARDS"
  | "DECISION_HISTORY"
  | "CLOCKS"
  | "HORIZON"
  | "RESTRICTION"
  | "ENFORCEMENT"
  | "OWNERS"
  | "BAD_NEWS"
  | "SIGNOFF"
  | "REMOVED"
  | "AGENT_SUMMARY"
  | "AGENT_ROSTER"
  | "APPROVALS"
  | "AGENT_CONTROLS"
  | "GUARDRAILS"
  | "TUNING"
  | "AGENT_ACTIVITY"
  | "WORK_QUEUE"
  | "DEADLINES"
  | "PACK_BUILDER"
  | "COMMITTEE_HEADER"
  | "OWNER_DRILL"
  | "BM_POSTURE"
  | "BM_SCORECARD"
  | "BM_DIAL_GRID"
  | "BM_TIERS"
  | "BM_CHANGED"
  | "BM_UNCHANGED"
  | "BM_CUSTOMER_PULSE"
  | "BM_FIN_STRENGTH"
  | "BM_AGENT_PANEL"
  | "BM_GROWTH_TABLE"
  | "BM_EARLY_WARNINGS"
  | "BM_CREDIT"
  | "BM_FIN_DETAIL"
  | "BM_TENSIONS"
  | "BM_DUTY_OUTCOMES"
  | "BM_COMPLAINTS"
  | "BM_THEMES"
  | "BM_VULN"
  | "BM_HARM"
  | "BM_SIGNALS"
  | "BM_CULTURE"
  | "BM_DECISION_CARDS"
  | "BM_CHALLENGES"
  | "BM_MY_NOTES"
  | "BM_DUE_REVIEW"
  | "BM_REG_RELATIONSHIP"
  | "BM_REG_CALENDAR"
  | "BM_SIGNOFF_STRIP"
  | "BM_DEFENCE"
  | "BM_JOURNEYS"
  | "BM_AGENT_VALUE"
  | "BM_FINDINGS"
  | "BM_TUNING_SUMMARY"
  | "BM_DECIDE_DATES";

/** A row of columns on the 12-column grid; each column stacks its sections. */
export type Layout = { cols: { span: 3 | 4 | 6 | 8 | 12; sections: SectionId[] }[] }[];

export interface TabView {
  id: string;
  label: string;
  question: string;
  subtitle: string;
  /** Optional meta line shown beside the title (Board member briefing). */
  meta?: string;
  layout: Layout;
}

export interface PersonaView {
  label: string;
  person: string;
  defaultTab: string;
  headerAction: "notes" | "agenda" | "queue";
  tabs: TabView[];
}

const full = (...sections: SectionId[]) => ({ cols: [{ span: 12 as const, sections }] });

export const PERSONA_VIEWS: Record<PersonaId, PersonaView> = {
  board: {
    label: "Board member",
    person: "Board member (non-executive)",
    defaultTab: "briefing",
    headerAction: "notes",
    tabs: [
      {
        id: "briefing",
        label: "Briefing",
        question: "Are we growing safely?",
        subtitle: "Growth, appetite and what needs the board on 15 Dec.",
        meta: "Board pack for 15 Dec · prepared 15 Oct · 12 measures · 3 decisions",
        layout: [
          full("BM_POSTURE"),
          full("BM_SCORECARD"),
          { cols: [{ span: 8, sections: ["BM_DIAL_GRID"] }, { span: 4, sections: ["BM_DECIDE_DATES"] }] },
          full("BM_TIERS"),
          { cols: [{ span: 6, sections: ["BM_CHANGED"] }, { span: 6, sections: ["BM_UNCHANGED"] }] },
          { cols: [{ span: 4, sections: ["BM_CUSTOMER_PULSE"] }, { span: 4, sections: ["BM_FIN_STRENGTH"] }, { span: 4, sections: ["BM_AGENT_PANEL"] }] },
        ],
      },
      {
        id: "growth",
        label: "Growth & Appetite",
        question: "Where can we grow, and what's stopping us?",
        subtitle: "Plan, appetite headroom and the early warnings.",
        layout: [
          full("APPETITE_SUMMARY"),
          full("BM_GROWTH_TABLE"),
          { cols: [{ span: 8, sections: ["MEASURES"] }, { span: 4, sections: ["BM_EARLY_WARNINGS", "BM_CREDIT"] }] },
          { cols: [{ span: 6, sections: ["BM_FIN_DETAIL", "BM_TENSIONS"] }, { span: 6, sections: ["GROWTH_CAPACITY", "TRADEOFFS"] }] },
        ],
      },
      {
        id: "customers",
        label: "Customers",
        question: "What are customers telling us?",
        subtitle: "Outcomes, complaints and vulnerable customers.",
        layout: [
          full("BM_DUTY_OUTCOMES"),
          { cols: [{ span: 6, sections: ["BM_COMPLAINTS"] }, { span: 6, sections: ["BM_THEMES"] }] },
          { cols: [{ span: 4, sections: ["BM_VULN"] }, { span: 4, sections: ["BM_HARM"] }, { span: 4, sections: ["BM_SIGNALS"] }] },
          full("BM_CULTURE"),
        ],
      },
      {
        id: "decisions",
        label: "Decisions",
        question: "What do you need from the board?",
        subtitle: "Three decisions, their options and their cost.",
        layout: [
          full("BM_DECISION_CARDS"),
          { cols: [{ span: 8, sections: ["BM_CHALLENGES"] }, { span: 4, sections: ["BM_MY_NOTES", "BM_DUE_REVIEW"] }] },
          full("DECISION_HISTORY"),
        ],
      },
      {
        id: "regulator",
        label: "Regulator view",
        question: "Will the regulator be surprised?",
        subtitle: "What may be reportable, deadlines and lessons from others.",
        layout: [
          { cols: [{ span: 6, sections: ["CLOCKS"] }, { span: 6, sections: ["RESTRICTION"] }] },
          { cols: [{ span: 6, sections: ["BM_REG_RELATIONSHIP"] }, { span: 6, sections: ["BM_REG_CALENDAR"] }] },
          full("ENFORCEMENT"),
        ],
      },
      {
        id: "ownership",
        label: "Ownership",
        question: "Who owns it, and do we hear bad news early?",
        subtitle: "Owners, monthly sign-off and escalation.",
        layout: [
          full("OWNERS"),
          { cols: [{ span: 8, sections: ["BM_SIGNOFF_STRIP"] }, { span: 4, sections: ["BM_DEFENCE"] }] },
          full("BM_JOURNEYS"),
          { cols: [{ span: 8, sections: ["BAD_NEWS"] }, { span: 4, sections: ["REMOVED"] }] },
        ],
      },
      {
        id: "ai",
        label: "AI oversight",
        question: "Are our AI agents helping, and under control?",
        subtitle: "What agents found, what they saved, and their limits.",
        layout: [
          full("AGENT_SUMMARY"),
          full("BM_AGENT_VALUE"),
          { cols: [{ span: 8, sections: ["BM_FINDINGS"] }, { span: 4, sections: ["AGENT_CONTROLS"] }] },
          full("AGENT_ROSTER"),
          { cols: [{ span: 6, sections: ["BM_TUNING_SUMMARY"] }, { span: 6, sections: ["AGENT_ACTIVITY"] }] },
          full("GUARDRAILS"),
        ],
      },
    ],
  },
  chair: {
    label: "Risk Committee Chair",
    person: "Graham Pryce",
    defaultTab: "agenda",
    headerAction: "agenda",
    tabs: [
      {
        id: "agenda",
        label: "Committee agenda",
        question: "What comes to committee on 15 Dec?",
        subtitle: "Your decision, items for noting, and pack integrity.",
        layout: [full("COMMITTEE_HEADER"), full("DECISION_CARDS"), full("REMOVED")],
      },
      {
        id: "escalation",
        label: "Escalation health",
        question: "Is bad news reaching us in time?",
        subtitle: "How fast serious issues reach the committee.",
        layout: [{ cols: [{ span: 8, sections: ["BAD_NEWS"] }, { span: 4, sections: ["UNCHANGED"] }] }],
      },
      {
        id: "breaches",
        label: "Appetite breaches",
        question: "What is outside or heading outside appetite?",
        subtitle: "Off-track measures and the agreed trade-off.",
        layout: [full("APPETITE_SUMMARY"), { cols: [{ span: 8, sections: ["MEASURES"] }, { span: 4, sections: ["TRADEOFFS"] }] }],
      },
      {
        id: "owners",
        label: "Owners & sign-off",
        question: "Who owns it, and have they signed off?",
        subtitle: "Named owners, their items and sign-off status.",
        layout: [full("OWNERS"), { cols: [{ span: 4, sections: ["SIGNOFF"] }, { span: 8, sections: ["OWNER_DRILL"] }] }],
      },
      {
        id: "agents",
        label: "Agent governance",
        question: "How far may our agents go?",
        subtitle: "You set the dials; changes go to committee and are logged.",
        layout: [{ cols: [{ span: 4, sections: ["AGENT_CONTROLS"] }, { span: 4, sections: ["GUARDRAILS"] }, { span: 4, sections: ["APPROVALS"] }] }, full("AGENT_ACTIVITY")],
      },
    ],
  },
  cro: {
    label: "Chief Risk Officer",
    person: "Eleanor Hartley",
    defaultTab: "actions",
    headerAction: "queue",
    tabs: [
      {
        id: "actions",
        label: "My actions",
        question: "What needs me this week?",
        subtitle: "Approve, prepare, send and chase, by due date.",
        layout: [{ cols: [{ span: 8, sections: ["WORK_QUEUE"] }, { span: 4, sections: ["DEADLINES"] }] }],
      },
      {
        id: "appetite",
        label: "Risk appetite",
        question: "Where are we against appetite?",
        subtitle: "All 12 board measures, capacity and the agreed trade-off.",
        layout: [full("APPETITE_SUMMARY"), { cols: [{ span: 8, sections: ["MEASURES"] }, { span: 4, sections: ["GROWTH_CAPACITY", "TRADEOFFS"] }] }],
      },
      {
        id: "reporting",
        label: "Reporting cases",
        question: "What may be reportable, and who decides?",
        subtitle: "Every reporting route, its clock and its decider.",
        layout: [
          { cols: [{ span: 8, sections: ["CLOCKS"] }, { span: 4, sections: ["HORIZON", "RESTRICTION"] }] },
          full("ENFORCEMENT"),
        ],
      },
      {
        id: "pack",
        label: "Board pack",
        question: "Is the 15 Dec pack complete and honest?",
        subtitle: "Qualifying items, decision papers and owners to chase.",
        layout: [{ cols: [{ span: 8, sections: ["PACK_BUILDER"] }, { span: 4, sections: ["DECISION_HISTORY"] }] }, full("OWNERS"), full("BAD_NEWS")],
      },
      {
        id: "agents",
        label: "AI agents",
        question: "What are the agents doing?",
        subtitle: "Roster, tuning lab and activity. Approvals sit in My actions.",
        layout: [full("AGENT_SUMMARY"), full("AGENT_ROSTER"), full("TUNING"), { cols: [{ span: 8, sections: ["AGENT_ACTIVITY"] }, { span: 4, sections: ["AGENT_CONTROLS"] }] }],
      },
    ],
  },
};

export const sectionsOf = (t: TabView) => t.layout.flatMap((r) => r.cols.flatMap((c) => c.sections));
