"use client";

/**
 * UK Board v2 — in-memory store (copied from the v1 store and adapted for three personas,
 * tabs, meeting notes, agent dials and the tuning lab). No browser storage.
 * Every human action writes an audit entry naming the person. Agents never act alone.
 */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { DRAFTS, FIRM, MANIFEST_ID, MANIFEST_VERSIONS, PACK_ITEMS, seedAudit } from "@/lib/ukboard/v1/data";
import type { AuditEntry, DraftState, ManifestVersion } from "@/lib/ukboard/v1/types";
import { AGENTS, type Autonomy } from "@/lib/ukboard/v2/agentsData";
import { PERSONA_VIEWS, type PersonaId as Persona } from "@/lib/ukboard/v2/personaViews";

type TabId = string;

interface Session {
  drafts: Record<string, DraftState>;
  audit: AuditEntry[];
  caveats: Record<string, { by: string; on: string }>;
  manifestVersions: ManifestVersion[];
  notes: { id: string; text: string; from: string }[];
  autonomy: Record<string, Autonomy>;
  tuningProposal: string | null;
  returned: string[];
  deepDives: string[];
  clock: number;
}

export interface State {
  persona: Persona;
  tab: TabId;
  epoch: number;
  session: Session;
}

export type Action =
  | { type: "SET_PERSONA"; persona: Persona }
  | { type: "SET_TAB"; tab: TabId }
  | { type: "ACCEPT"; draftId: string; optionId?: string; text?: string }
  | { type: "REJECT"; draftId: string; reason: string }
  | { type: "SEND"; draftId: string }
  | { type: "CHAIR_RECORD"; draftId: string; optionId: string }
  | { type: "RETURN_TO_CRO"; draftId: string }
  | { type: "SAVE_NOTE"; text: string; from: string }
  | { type: "SET_AUTONOMY"; agentId: string; level: Autonomy }
  | { type: "PROPOSE_TUNING"; optionId: string }
  | { type: "REQUEST_DEEP_DIVE"; topic: string }
  | { type: "RESET" };

function seed(): Session {
  const drafts: Record<string, DraftState> = {};
  Object.values(DRAFTS).forEach((d) => (drafts[d.draftId] = { status: "ai_draft", version: 1, text: d.body }));
  return {
    drafts,
    audit: seedAudit(),
    caveats: {},
    manifestVersions: MANIFEST_VERSIONS,
    notes: [],
    autonomy: Object.fromEntries(AGENTS.map((a) => [a.id, a.autonomy])),
    tuningProposal: null,
    returned: [],
    deepDives: [],
    clock: 0,
  };
}

export function initial(persona: Persona = "board"): State {
  return { persona, tab: PERSONA_VIEWS[persona].defaultTab, epoch: 0, session: seed() };
}

const person = (p: Persona) => PERSONA_VIEWS[p];
const ROLE: Record<Persona, string> = { board: "Board member", chair: "Risk Committee Chair", cro: "Chief Risk Officer" };

function stamp(clock: number) {
  const mins = 10 * 60 + clock * 2;
  return `${FIRM.demoToday} ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function entry(state: State, s: Session, action: string, objectLabel: string, objectRef: string, version?: number, reasonCode?: string): AuditEntry {
  return {
    entryId: `ae-${s.audit.length + 1}`,
    ts: stamp(s.clock),
    actorName: ROLE[state.persona],
    actorRole: ROLE[state.persona],
    action,
    objectLabel,
    objectRef,
    version,
    reasonCode,
  };
}

function reducer(state: State, a: Action): State {
  const s0 = state.session;
  const s = { ...s0, clock: s0.clock + 1 };
  const write = (patch: Partial<Session>, ...entries: AuditEntry[]): State => ({ ...state, session: { ...s, ...patch, audit: [...s.audit, ...entries] } });

  switch (a.type) {
    case "SET_PERSONA":
      return { ...state, persona: a.persona, tab: person(a.persona).defaultTab };
    case "SET_TAB":
      return { ...state, tab: a.tab };
    case "ACCEPT": {
      const d = DRAFTS[a.draftId];
      const cur = s0.drafts[a.draftId];
      // Human gate: only the CRO operates CRO-held drafts.
      if (!d || !cur || cur.status !== "ai_draft" || d.gateHolder !== "cro" || state.persona !== "cro") return state;
      if (d.options && !a.optionId) return state;
      const edited = a.text !== undefined && a.text !== cur.text;
      const version = edited ? cur.version + 1 : cur.version;
      const next: DraftState = { ...cur, status: "accepted", version, text: a.text ?? cur.text, chosenOptionId: a.optionId, byPersonId: "cro", on: FIRM.demoToday };
      const entries = [entry(state, s, edited ? "approved (edited)" : "approved", d.title, d.unitId, version)];
      const patch: Partial<Session> = { drafts: { ...s.drafts, [a.draftId]: next } };
      if (d.effect === "caveat") patch.caveats = { ...s.caveats, [d.unitId]: { by: person("cro").person, on: FIRM.demoToday } };
      if (d.effect === "manifest_restore") {
        const latest = s.manifestVersions[s.manifestVersions.length - 1];
        patch.manifestVersions = [
          ...s.manifestVersions,
          { version: latest.version + 1, state: "draft", createdOn: FIRM.demoToday, createdBy: person("cro").person, itemIds: PACK_ITEMS.map((i) => i.itemId), note: "Item restored · awaiting pack approval" },
        ];
        entries.push(entry(state, s, "board pack version created", `Board pack v${latest.version + 1} (draft)`, MANIFEST_ID, latest.version + 1));
      }
      return write(patch, ...entries);
    }
    case "REJECT": {
      const d = DRAFTS[a.draftId];
      const cur = s0.drafts[a.draftId];
      if (!d || !cur || cur.status !== "ai_draft" || state.persona !== "cro" || !a.reason) return state;
      return write({ drafts: { ...s.drafts, [a.draftId]: { ...cur, status: "rejected", byPersonId: "cro", on: FIRM.demoToday, rejectReason: a.reason } } }, entry(state, s, "rejected", d.title, d.unitId, cur.version, a.reason));
    }
    case "SEND": {
      const d = DRAFTS[a.draftId];
      const cur = s0.drafts[a.draftId];
      if (!d || !cur || cur.status !== "accepted" || state.persona !== "cro") return state;
      return write({ drafts: { ...s.drafts, [a.draftId]: { ...cur, status: "sent_to_owner" } } }, entry(state, s, "sent to owner", `${d.title} → ${d.targetRole}`, d.unitId, cur.version));
    }
    case "CHAIR_RECORD": {
      const d = DRAFTS[a.draftId];
      const cur = s0.drafts[a.draftId];
      if (!d || !cur || cur.status !== "ai_draft" || d.gateHolder !== "brc_chair" || state.persona !== "chair") return state;
      return write({ drafts: { ...s.drafts, [a.draftId]: { ...cur, status: "accepted", chosenOptionId: a.optionId, byPersonId: "chair", on: FIRM.demoToday } } }, entry(state, s, "decision recorded", d.title, d.unitId, cur.version));
    }
    case "RETURN_TO_CRO": {
      const d = DRAFTS[a.draftId];
      if (!d || state.persona !== "chair" || s0.returned.includes(a.draftId)) return state;
      return write({ returned: [...s.returned, a.draftId] }, entry(state, s, "returned to CRO", d.title, d.unitId));
    }
    case "SAVE_NOTE": {
      if (!a.text.trim()) return state;
      return write({ notes: [...s.notes, { id: `n-${s.notes.length + 1}`, text: a.text.trim(), from: a.from }] }, entry(state, s, "meeting note saved", a.from, "notes"));
    }
    case "SET_AUTONOMY": {
      // Only the Risk Committee Chair sets agent autonomy; the change is proposed to committee.
      if (state.persona !== "chair" || s0.autonomy[a.agentId] === a.level) return state;
      const agent = AGENTS.find((g) => g.id === a.agentId);
      return write({ autonomy: { ...s.autonomy, [a.agentId]: a.level } }, entry(state, s, `autonomy ${a.level} proposed to committee`, agent?.name ?? a.agentId, `agent:${a.agentId}`));
    }
    case "PROPOSE_TUNING":
      if (s0.tuningProposal) return state;
      return write({ tuningProposal: a.optionId }, entry(state, s, `tuning option ${a.optionId} proposed to the Risk Committee`, "Financial-crime tuning lab", "agent:tuning"));
    case "REQUEST_DEEP_DIVE":
      // Board members request; the CRO prepares. Logged against the board member.
      if (state.persona !== "board" || s0.deepDives.includes(a.topic)) return state;
      return write({ deepDives: [...s.deepDives, a.topic] }, entry(state, s, "deep dive requested from the CRO", a.topic, "deep-dive"));
    case "RESET":
      return { ...initial(state.persona), epoch: state.epoch + 1 };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initial("board"));
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export const personaName = (p: Persona) => person(p).person;
