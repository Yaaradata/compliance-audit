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
  | "BM_LINES"
  | "BM_POSITION"
  | "BM_DECIDE_DATES"
  | "BM_SINCE"
  | "BM_UNRESOLVED"
  | "BM_PANEL_CUSTOMERS"
  | "BM_PANEL_OWNERS"
  | "BM_PANEL_AGENTS"
  | "BM_GROWTH_TABLE"
  | "BM_MEASURES_DETAIL"
  | "BM_CREDIT"
  | "BM_EMERGING"
  | "BM_CAPACITY"
  | "BM_TRADEOFFS"
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
  | "BM_RESTRICTION"
  | "BM_SANCTIONS"
  | "BM_REG_RELATIONSHIP"
  | "BM_REG_CALENDAR"
  | "BM_OWNERS"
  | "BM_SIGNOFF_STRIP"
  | "BM_DEFENCE"
  | "BM_JOURNEYS"
  | "BM_ESCALATION"
  | "BM_DATA_QUALITY"
  | "BM_REMOVED"
  | "BM_AGENT_STATS"
  | "BM_FINDINGS"
  | "BM_ROSTER"
  | "BM_TUNING";

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
        meta: "Board pack for 15 Dec · evidence to 26 Oct · measures as at 30 Sep",
        layout: [
          full("BM_POSTURE"),
          full("BM_LINES"),
          { cols: [{ span: 8, sections: ["BM_POSITION"] }, { span: 4, sections: ["BM_DECIDE_DATES", "BM_UNRESOLVED"] }] },
          full("BM_SINCE"),
          { cols: [{ span: 4, sections: ["BM_PANEL_CUSTOMERS"] }, { span: 4, sections: ["BM_PANEL_OWNERS"] }, { span: 4, sections: ["BM_PANEL_AGENTS"] }] },
        ],
      },
      {
        id: "growth",
        label: "Growth & Appetite",
        question: "Where can we grow, and what's stopping us?",
        subtitle: "Plan, appetite headroom and the early warnings.",
        layout: [
          full("BM_GROWTH_TABLE"),
          full("BM_MEASURES_DETAIL"),
          { cols: [{ span: 4, sections: ["BM_CREDIT"] }, { span: 8, sections: ["BM_CAPACITY"] }] },
          { cols: [{ span: 6, sections: ["BM_TRADEOFFS"] }, { span: 6, sections: ["BM_TENSIONS"] }] },
          full("BM_EMERGING"),
        ],
      },
      {
        id: "customers",
        label: "Customers",
        question: "What are customers telling us?",
        subtitle: "Outcomes, complaints and vulnerable customers.",
        layout: [
          full("BM_DUTY_OUTCOMES"),
          { cols: [{ span: 6, sections: ["BM_COMPLAINTS"] }, { span: 6, sections: ["BM_THEMES", "BM_SIGNALS"] }] },
          { cols: [{ span: 6, sections: ["BM_VULN"] }, { span: 6, sections: ["BM_HARM"] }] },
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
          { cols: [{ span: 6, sections: ["CLOCKS", "BM_SANCTIONS"] }, { span: 6, sections: ["BM_RESTRICTION"] }] },
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
          full("BM_OWNERS"),
          { cols: [{ span: 8, sections: ["BM_SIGNOFF_STRIP"] }, { span: 4, sections: ["BM_DEFENCE"] }] },
          full("BM_JOURNEYS"),
          { cols: [{ span: 4, sections: ["BM_ESCALATION"] }, { span: 4, sections: ["BM_DATA_QUALITY"] }, { span: 4, sections: ["BM_REMOVED"] }] },
        ],
      },
      {
        id: "ai",
        label: "AI oversight",
        question: "Are our AI agents helping, and under control?",
        subtitle: "What agents found, what they saved, and their limits.",
        layout: [
          full("BM_AGENT_STATS"),
          { cols: [{ span: 8, sections: ["BM_FINDINGS"] }, { span: 4, sections: ["AGENT_CONTROLS"] }] },
          { cols: [{ span: 6, sections: ["BM_ROSTER"] }, { span: 6, sections: ["BM_TUNING"] }] },
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
