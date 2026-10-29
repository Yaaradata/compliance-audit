"use client";

/**
 * UK Board v1 — in-memory store (React context + reducer). No browser storage:
 * a reload returns to the seed. Slices follow Stage 8 ST-1 to ST-10.
 */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { DRAFTS, FIRM, MANIFEST_ID, MANIFEST_VERSIONS, PACK_ITEMS, PEOPLE, seedAudit } from "@/lib/ukboard/v1/data";
import type { AuditEntry, DraftState, ManifestVersion, Origin, ViewState, Viewer } from "@/lib/ukboard/v1/types";

export type Theme = "light" | "dark";

interface SessionSlice {
  drafts: Record<string, DraftState>;
  audit: AuditEntry[];
  caveats: Record<string, { byPersonId: string; on: string; version: number }>;
  ledgerDrafts: { draftId: string; label: string; on: string }[];
  manifestVersions: ManifestVersion[];
  promoted: boolean;
  clock: number;
}

export interface BoardState {
  viewer: Viewer;
  view: ViewState;
  origin: Origin | null;
  highlightRef: string | null;
  theme: Theme;
  expandedBadges: string[];
  fraudFilter: boolean;
  /** Incremented by RESET_DEMO so screen subtrees remount with the seed. */
  epoch: number;
  session: SessionSlice;
}

export type BoardAction =
  | { type: "SET_VIEW"; view: ViewState; origin?: Origin | null }
  | { type: "BACK" }
  | { type: "SET_VIEWER"; viewer: Viewer }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "TOGGLE_BADGE"; ref: string }
  | { type: "SET_FRAUD_FILTER"; on: boolean }
  | { type: "GATE_ACCEPT"; draftId: string; optionId?: string }
  | { type: "GATE_EDIT_ACCEPT"; draftId: string; text: string; optionId?: string }
  | { type: "GATE_REJECT"; draftId: string; reasonCode: string }
  /** BRC chair records a chair-held decision (v2 only; v1 never dispatches it). */
  | { type: "CHAIR_RECORD"; draftId: string; optionId: string }
  | { type: "SEND_TO_OWNER"; draftId: string }
  | { type: "RESET_DEMO" };

function seedSession(): SessionSlice {
  const drafts: Record<string, DraftState> = {};
  Object.values(DRAFTS).forEach((d) => {
    drafts[d.draftId] = { status: "ai_draft", version: 1, text: d.body };
  });
  return {
    drafts,
    audit: seedAudit(),
    caveats: {},
    ledgerDrafts: [],
    manifestVersions: MANIFEST_VERSIONS,
    promoted: false,
    clock: 0,
  };
}

export function initialState(): BoardState {
  return {
    viewer: "cro",
    view: { screen: "board" },
    origin: null,
    highlightRef: null,
    theme: "light",
    expandedBadges: [],
    fraudFilter: false,
    epoch: 0,
    session: seedSession(),
  };
}

/** Deterministic demo clock: 27 October 2026 from 10:00, two minutes per gated action. */
function stamp(clock: number) {
  const mins = 10 * 60 + clock * 2;
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  return `${FIRM.demoToday} ${hh}:${mm}`;
}

function audit(s: SessionSlice, action: string, objectLabel: string, objectRef: string, version?: number, reasonCode?: string): AuditEntry {
  const actor = PEOPLE.cro;
  return {
    entryId: `ae-${s.audit.length + 1}`,
    ts: stamp(s.clock),
    actorName: actor.name,
    actorRole: actor.role,
    action,
    objectLabel,
    objectRef,
    version,
    reasonCode,
  };
}

function applyAccept(state: BoardState, draftId: string, text: string | null, optionId?: string): BoardState {
  const draft = DRAFTS[draftId];
  const current = state.session.drafts[draftId];
  // Gate guard: only CRO-held gates are operable; chair-held gates are for the chair (HG-13).
  if (!draft || !current || current.status !== "ai_draft" || draft.gateHolder !== "cro") return state;
  if (draft.options && !optionId) return state;

  let s: SessionSlice = { ...state.session, clock: state.session.clock + 1 };
  const edited = text !== null && text !== current.text;
  const version = edited ? current.version + 1 : current.version;
  const entries: AuditEntry[] = [
    audit(s, edited ? "gate.edit_accept" : "gate.accept", draft.title, draft.unitId, version),
  ];
  const next: DraftState = {
    ...current,
    status: "accepted",
    version,
    text: text ?? current.text,
    chosenOptionId: optionId,
    byPersonId: "cro",
    on: FIRM.demoToday,
  };

  if (draft.effect === "caveat") {
    s = { ...s, caveats: { ...s.caveats, [draft.unitId]: { byPersonId: "cro", on: FIRM.demoToday, version } } };
    entries.push(audit(s, "caveat.accepted", "Caveat text", draft.unitId, version));
  }
  if (draft.effect === "ledger_draft") {
    s = { ...s, ledgerDrafts: [...s.ledgerDrafts, { draftId, label: draft.ledgerLabel ?? draft.title, on: FIRM.demoToday }] };
    entries.push(audit(s, "ledger.draft_opened", draft.title, draft.unitId));
  }
  if (draft.effect === "decision_proposed") {
    entries.push(audit(s, "decision_record.proposed", draft.title, draft.unitId));
  }
  if (draft.effect === "promotion") {
    s = { ...s, promoted: true };
    entries.push(audit(s, "headline_set.changed", "NSFR promoted to the board view", draft.unitId));
  }
  if (draft.effect === "manifest_restore") {
    const latest = s.manifestVersions[s.manifestVersions.length - 1];
    const v3: ManifestVersion = {
      version: latest.version + 1,
      state: "draft",
      createdOn: FIRM.demoToday,
      createdBy: PEOPLE.cro.name,
      itemIds: PACK_ITEMS.map((i) => i.itemId),
      note: "Item restored · awaiting CRO pack approval",
    };
    s = { ...s, manifestVersions: [...s.manifestVersions, v3] };
    entries.push(audit(s, "manifest.version_created", `BRC pack manifest v${v3.version} (draft)`, MANIFEST_ID, v3.version));
  }

  return {
    ...state,
    session: { ...s, drafts: { ...s.drafts, [draftId]: next }, audit: [...s.audit, ...entries] },
  };
}

function reducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_VIEW": {
      const origin = action.origin === undefined ? state.origin : action.origin;
      // RT-4: the CRO entering Escalation health views it as the BRC chair (preview).
      const viewer = action.view.screen === "escalation" ? "brc_chair_preview" : state.viewer;
      return { ...state, view: action.view, origin, viewer, highlightRef: null };
    }
    case "BACK": {
      if (!state.origin) return { ...state, view: { screen: "board" } };
      return { ...state, view: { screen: state.origin.screen }, highlightRef: state.origin.highlightRef, origin: null };
    }
    case "SET_VIEWER":
      // Viewer switch resets UI state and keeps the session record (DS7-6).
      return {
        ...state,
        viewer: action.viewer,
        view: action.viewer === "cro" ? { screen: "board" } : { screen: "escalation" },
        origin: null,
        highlightRef: null,
        expandedBadges: [],
        fraudFilter: false,
      };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "TOGGLE_BADGE":
      return {
        ...state,
        expandedBadges: state.expandedBadges.includes(action.ref)
          ? state.expandedBadges.filter((r) => r !== action.ref)
          : [...state.expandedBadges, action.ref],
      };
    case "SET_FRAUD_FILTER":
      return { ...state, fraudFilter: action.on };
    case "GATE_ACCEPT":
      return applyAccept(state, action.draftId, null, action.optionId);
    case "GATE_EDIT_ACCEPT":
      return applyAccept(state, action.draftId, action.text, action.optionId);
    case "GATE_REJECT": {
      const draft = DRAFTS[action.draftId];
      const current = state.session.drafts[action.draftId];
      if (!draft || !current || current.status !== "ai_draft" || draft.gateHolder !== "cro" || !action.reasonCode) return state;
      const s = { ...state.session, clock: state.session.clock + 1 };
      return {
        ...state,
        session: {
          ...s,
          drafts: { ...s.drafts, [action.draftId]: { ...current, status: "rejected", byPersonId: "cro", on: FIRM.demoToday, rejectReason: action.reasonCode } },
          audit: [...s.audit, audit(s, "gate.reject", draft.title, draft.unitId, current.version, action.reasonCode)],
        },
      };
    }
    case "SEND_TO_OWNER": {
      const draft = DRAFTS[action.draftId];
      const current = state.session.drafts[action.draftId];
      if (!draft || !current || current.status !== "accepted") return state;
      const s = { ...state.session, clock: state.session.clock + 1 };
      return {
        ...state,
        session: {
          ...s,
          drafts: { ...s.drafts, [action.draftId]: { ...current, status: "sent_to_owner" } },
          audit: [...s.audit, audit(s, "send_to_owner", `${draft.title} → ${draft.targetRole}`, draft.unitId, current.version)],
        },
      };
    }
    case "CHAIR_RECORD": {
      const draft = DRAFTS[action.draftId];
      const current = state.session.drafts[action.draftId];
      if (!draft || !current || current.status !== "ai_draft" || draft.gateHolder !== "brc_chair" || state.viewer !== "brc_chair_preview") return state;
      const s = { ...state.session, clock: state.session.clock + 1 };
      const chair = PEOPLE.chair;
      const entry: AuditEntry = {
        ...audit(s, "decision_record.recorded", draft.title, draft.unitId, current.version),
        actorName: chair.name,
        actorRole: chair.role,
      };
      return {
        ...state,
        session: {
          ...s,
          drafts: { ...s.drafts, [action.draftId]: { ...current, status: "accepted", chosenOptionId: action.optionId, byPersonId: "chair", on: FIRM.demoToday } },
          audit: [...s.audit, entry],
        },
      };
    }
    case "RESET_DEMO":
      return { ...initialState(), theme: state.theme, epoch: state.epoch + 1 };
    default:
      return state;
  }
}

interface StoreValue {
  state: BoardState;
  dispatch: (a: BoardAction) => void;
}

const BoardStoreContext = createContext<StoreValue | null>(null);

export function BoardStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <BoardStoreContext.Provider value={value}>{children}</BoardStoreContext.Provider>;
}

export function useBoard(): StoreValue {
  const ctx = useContext(BoardStoreContext);
  if (!ctx) throw new Error("useBoard must be used inside BoardStoreProvider");
  return ctx;
}

/** Number of BRC-chair agenda proposals accepted this session (S4 band). */
export function agendaProposalCount(state: BoardState): number {
  return Object.entries(state.session.drafts).filter(
    ([id, d]) => DRAFTS[id]?.effect === "chair_proposal" && d.status !== "ai_draft" && d.status !== "rejected",
  ).length;
}

export { reducer as boardReducer };
