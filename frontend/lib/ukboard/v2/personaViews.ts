/**
 * UK Board v2 — persona-specific information architecture. The tab bar renders from the
 * active persona; each tab is a layout of reusable sections. Within one persona no section
 * appears on two tabs (checked by board.test.ts).
 */
export type PersonaId = "board" | "chair" | "cro";

export type SectionId =
  | "POSTURE"
  | "BUSINESS_LINES"
  | "DECIDE_LIST"
  | "CHANGED"
  | "UNCHANGED"
  | "AGENT_STRIP"
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
  | "OWNER_DRILL";

/** A row of columns on the 12-column grid; each column stacks its sections. */
export type Layout = { cols: { span: 3 | 4 | 6 | 8 | 12; sections: SectionId[] }[] }[];

export interface TabView {
  id: string;
  label: string;
  question: string;
  subtitle: string;
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
        subtitle: "Where we stand, what changed, and what needs the board.",
        layout: [
          full("POSTURE"),
          full("BUSINESS_LINES"),
          { cols: [{ span: 4, sections: ["DECIDE_LIST"] }, { span: 4, sections: ["CHANGED"] }, { span: 4, sections: ["UNCHANGED"] }] },
          full("AGENT_STRIP"),
        ],
      },
      {
        id: "growth",
        label: "Growth & Appetite",
        question: "How much risk are we using to grow?",
        subtitle: "Appetite the board set against where we operate.",
        layout: [full("APPETITE_SUMMARY"), { cols: [{ span: 8, sections: ["MEASURES"] }, { span: 4, sections: ["GROWTH_CAPACITY", "TRADEOFFS"] }] }],
      },
      {
        id: "decisions",
        label: "Decisions",
        question: "What must we decide on 15 Dec?",
        subtitle: "Three decisions, their options, and who decides.",
        layout: [full("DECISION_CARDS"), full("DECISION_HISTORY")],
      },
      {
        id: "regulator",
        label: "Regulator view",
        question: "Will the regulator be surprised?",
        subtitle: "Reporting status, restriction health and enforcement lessons.",
        layout: [
          { cols: [{ span: 8, sections: ["CLOCKS"] }, { span: 4, sections: ["HORIZON"] }] },
          { cols: [{ span: 6, sections: ["ENFORCEMENT"] }, { span: 6, sections: ["RESTRICTION"] }] },
        ],
      },
      {
        id: "ai",
        label: "AI oversight",
        question: "Are our AI agents working safely?",
        subtitle: "What the agents do, and the rules they cannot break.",
        layout: [full("AGENT_SUMMARY"), { cols: [{ span: 8, sections: ["AGENT_ROSTER"] }, { span: 4, sections: ["GUARDRAILS"] }] }, full("AGENT_ACTIVITY")],
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
