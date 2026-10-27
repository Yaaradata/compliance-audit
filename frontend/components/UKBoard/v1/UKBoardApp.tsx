"use client";

/**
 * UK Board v1 — app shell (CMP-40): store provider, scoped theme, header, viewer switch,
 * typed view routing and the presenter-only "Reset demo data" control.
 */
import Link from "next/link";
import { useState } from "react";
import { Moon, MoreHorizontal, Sun } from "lucide-react";
import { FIRM } from "@/lib/ukboard/v1/data";
import type { Layer1Screen, Viewer } from "@/lib/ukboard/v1/types";
import { BoardStoreProvider, useBoard } from "./state/boardStore";
import { themeVars, ui } from "./theme";
import BoardRiskViewScreen from "./screens/BoardRiskViewScreen";
import PrincipalRiskDrillScreen from "./screens/PrincipalRiskDrillScreen";
import RestrictionsReportabilityScreen from "./screens/RestrictionsReportabilityScreen";
import EscalationHealthScreen from "./screens/EscalationHealthScreen";
import ScopedDrillScreen from "./screens/ScopedDrillScreen";

const NAV: { screen: Layer1Screen; label: string }[] = [
  { screen: "board", label: "Board Risk View" },
  { screen: "restrictions", label: "Restrictions and reportability" },
  { screen: "escalation", label: "Escalation health (BRC chair)" },
];

function BoardHeader() {
  const { state, dispatch } = useBoard();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = state.view.screen === "risk" || state.view.screen === "drill" ? state.origin?.screen : state.view.screen;

  const viewers: { id: Viewer; label: string }[] = [
    { id: "cro", label: "Chief Risk Officer (SMF4)" },
    { id: "brc_chair_preview", label: "BRC chair (preview)" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ukb-border)] bg-[var(--ukb-surface)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <Link href="/select_region" aria-label="All dashboards" className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ukb-accent)] text-xs font-bold text-[var(--ukb-surface)] ${ui.focus}`}>
            UB
          </Link>
          <div className="leading-tight">
            <p className="text-sm font-bold text-[var(--ukb-text)]">UK Board</p>
            <p className="text-[11px] text-[var(--ukb-subtle)]">
              {FIRM.name} · illustrative
            </p>
          </div>
        </div>
        <div role="radiogroup" aria-label="Viewer" className="inline-flex w-fit rounded-lg bg-[var(--ukb-surface-2)] p-1">
          {viewers.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={state.viewer === v.id}
              onClick={() => state.viewer !== v.id && dispatch({ type: "SET_VIEWER", viewer: v.id })}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${ui.focus} ${
                state.viewer === v.id ? "bg-[var(--ukb-surface)] text-[var(--ukb-text)] shadow-sm" : "text-[var(--ukb-muted)] hover:text-[var(--ukb-text)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[var(--ukb-track)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ukb-muted)]">
            Illustrative data
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_THEME", theme: state.theme === "light" ? "dark" : "light" })}
            aria-label={state.theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            className={`${ui.button} ${ui.focus} px-2`}
          >
            {state.theme === "light" ? <Moon className="h-3.5 w-3.5" aria-hidden /> : <Sun className="h-3.5 w-3.5" aria-hidden />}
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Presenter menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${ui.button} ${ui.focus} px-2`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
            </button>
            {menuOpen ? (
              <div className={`${ui.card} absolute right-0 z-20 mt-1 w-44 p-1 shadow-lg`}>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "RESET_DEMO" });
                    setMenuOpen(false);
                  }}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs text-[var(--ukb-text)] hover:bg-[var(--ukb-surface-2)] ${ui.focus}`}
                >
                  Reset demo data
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-0 px-4 xl:flex-row xl:items-end xl:justify-between lg:px-6">
        <nav aria-label="Screens" className="-mb-px flex gap-5 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.screen}
              type="button"
              aria-current={active === n.screen ? "page" : undefined}
              onClick={() => dispatch({ type: "SET_VIEW", view: { screen: n.screen }, origin: null })}
              className={`whitespace-nowrap border-b-2 pb-2 pt-1 text-sm font-semibold ${ui.focus} ${
                active === n.screen
                  ? "border-[var(--ukb-accent)] text-[var(--ukb-accent)]"
                  : "border-transparent text-[var(--ukb-muted)] hover:text-[var(--ukb-text)]"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <p className="pb-2 pt-1 text-[11px] text-[var(--ukb-subtle)] xl:pt-0">
          {FIRM.periodLabel} · {FIRM.evidenceDate} · Next BRC {FIRM.nextBrc}
        </p>
      </div>
    </header>
  );
}

function ViewRouter() {
  const { state } = useBoard();
  const v = state.view;
  switch (v.screen) {
    case "board":
      return <BoardRiskViewScreen />;
    case "risk":
      return <PrincipalRiskDrillScreen principalRiskId={v.principalRiskId} focusUnitId={v.focusUnitId} />;
    case "restrictions":
      return <RestrictionsReportabilityScreen />;
    case "escalation":
      return <EscalationHealthScreen />;
    case "drill":
      return <ScopedDrillScreen view={v} />;
    default:
      return null;
  }
}

function Shell() {
  const { state } = useBoard();
  return (
    <div style={themeVars(state.theme)} className="min-h-screen bg-[var(--ukb-canvas)] text-[var(--ukb-text)]">
      <BoardHeader />
      {/* Viewer and reset epoch key the subtree so local state remounts cleanly (TK-6). */}
      <main key={`${state.viewer}-${state.epoch}`} className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <ViewRouter />
      </main>
    </div>
  );
}

export default function UKBoardApp() {
  return (
    <BoardStoreProvider>
      <Shell />
    </BoardStoreProvider>
  );
}
