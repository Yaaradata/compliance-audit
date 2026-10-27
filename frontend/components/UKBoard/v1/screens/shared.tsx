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

/** Short face labels for action buttons; the full title shows in the draft card. */
const SHORT_LABEL: Record<string, string> = {
  "d-t21-appetite": "Propose recommendation",
  "d-t21-para": "Prepare BRC paragraph",
  "d-t25-choice": "Propose restore or pace",
  "d-t25-paper": "Prepare resourcing paper",
  "d-t214-caveat": "Prepare caveat",
  "d-t214-remed": "Propose remediation",
  "d-t217-challenge": "Propose re-attestation",
  "d-t214-triage": "Open triage entry",
  "d-t212-promo": "Propose promotion",
  "d-t213-metric": "Propose metric and owner",
  "d-t227-contain": "Propose containment",
  "d-pg1-coverage": "Propose coverage fix",
  "d-t228-summary": "Prepare evidence summary",
  "d-t228-facts": "Propose facts to disclose",
  "d-t26-redecide": "Propose re-decision",
};

/** Actions on a card face: each opens its gated draft inline (two clicks to action at most). */
export function ActionList({ draftIds, canGate }: { draftIds: string[]; canGate: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const { state } = useBoard();
  if (!draftIds.length) return null;
  return (
    <div className="space-y-2">
      <GatedFaceLine draftIds={draftIds} />
      <div className="flex flex-wrap gap-2">
        {draftIds.map((id) => {
          const d = DRAFTS[id];
          const s = state.session.drafts[id];
          const done = s && s.status !== "ai_draft";
          return (
            <button
              key={id}
              type="button"
              aria-expanded={open === id}
              title={d.title}
              onClick={() => setOpen(open === id ? null : id)}
              className={`${ui.button} ${ui.focus} ${open === id ? "bg-[var(--ukb-surface-2)]" : ""}`}
            >
              {SHORT_LABEL[id] ?? d.title}
              {done ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {open ? <DraftActionCard key={open} draftId={open} canGate={canGate} /> : null}
    </div>
  );
}
