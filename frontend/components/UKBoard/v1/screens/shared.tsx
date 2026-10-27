"use client";

/** UK Board v1 — helpers shared by the screens: navigation with origin, inline action lists. */
import { useState } from "react";
import { DRAFTS, UNITS } from "@/lib/ukboard/v1/data";
import { selectStatus } from "@/lib/ukboard/v1/selectors";
import type { Layer1Screen, PrincipalRiskId, ViewState } from "@/lib/ukboard/v1/types";
import { DraftActionCard, GatedFaceLine } from "../ai";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";

export function useNav() {
  const { state, dispatch } = useBoard();
  const originScreen: Layer1Screen =
    state.view.screen === "board" || state.view.screen === "restrictions" || state.view.screen === "escalation"
      ? state.view.screen
      : (state.origin?.screen ?? "board");

  /** Open a drill addressed by the clicked item's own ID (DS7-5). */
  const drill = (view: ViewState, highlightRef: string) =>
    dispatch({ type: "SET_VIEW", view, origin: { screen: originScreen, highlightRef } });

  return {
    toRisk: (principalRiskId: PrincipalRiskId, focusUnitId: string) =>
      drill({ screen: "risk", principalRiskId, focusUnitId }, focusUnitId),
    drill,
    peer: (screen: Layer1Screen) => dispatch({ type: "SET_VIEW", view: { screen }, origin: null }),
    highlightRef: state.highlightRef,
    canGate: state.viewer === "cro",
  };
}

export function unitStatus(unitId: string) {
  return selectStatus(UNITS[unitId]);
}

/** Actions on a card face: each opens its gated draft inline (two clicks to action at most). */
export function ActionList({ draftIds, canGate }: { draftIds: string[]; canGate: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const { state } = useBoard();
  if (!draftIds.length) return null;
  return (
    <div className="mt-3 space-y-2">
      <GatedFaceLine draftIds={draftIds} />
      <div className="flex flex-wrap gap-1.5">
        {draftIds.map((id) => {
          const d = DRAFTS[id];
          const s = state.session.drafts[id];
          const done = s && s.status !== "ai_draft";
          return (
            <button
              key={id}
              type="button"
              aria-expanded={open === id}
              onClick={() => setOpen(open === id ? null : id)}
              className={`${ui.button} ${ui.focus} ${open === id ? "bg-[var(--ukb-surface-2)]" : ""}`}
            >
              {d.title}
              {done ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {open ? <DraftActionCard key={open} draftId={open} canGate={canGate} /> : null}
    </div>
  );
}

export function SoWhat({ children }: { children: string }) {
  return (
    <p className="mt-2 text-sm text-[var(--ukb-text)]">
      <span className="font-semibold">So what: </span>
      {children}
    </p>
  );
}
