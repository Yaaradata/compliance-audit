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

  return (
    <header className="border-b border-[var(--ukb-border)] bg-[var(--ukb-surface)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/select_region" className={`text-xs ${ui.link} ${ui.focus}`}>
            All dashboards
          </Link>
          <p className="text-sm font-bold text-[var(--ukb-text)]">
            {FIRM.name} <span className="text-xs font-normal text-[var(--ukb-subtle)]">[illustrative]</span>
          </p>
          <nav aria-label="Screens" className="flex flex-wrap gap-1">
            {NAV.map((n) => (
              <button
                key={n.screen}
                type="button"
                aria-current={active === n.screen ? "page" : undefined}
                onClick={() => dispatch({ type: "SET_VIEW", view: { screen: n.screen }, origin: null })}
                className={`rounded-md px-2 py-1 text-xs font-semibold ${ui.focus} ${
                  active === n.screen
                    ? "bg-[var(--ukb-accent)] text-[var(--ukb-surface)]"
                    : "text-[var(--ukb-muted)] hover:bg-[var(--ukb-surface-2)]"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1 text-xs text-[var(--ukb-muted)]">
            Viewer
            <select
              value={state.viewer}
              onChange={(e) => dispatch({ type: "SET_VIEWER", viewer: e.target.value as Viewer })}
              className={`rounded-md border border-[var(--ukb-track)] bg-[var(--ukb-surface)] px-1.5 py-1 text-xs font-semibold text-[var(--ukb-text)] ${ui.focus}`}
            >
              <option value="cro">Chief Risk Officer</option>
              <option value="brc_chair_preview">Viewing as BRC chair (preview)</option>
            </select>
          </label>
          <span className="rounded border border-[var(--ukb-track)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ukb-muted)]">
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
      <div className="mx-auto flex max-w-[1440px] flex-wrap gap-x-4 gap-y-0.5 px-4 pb-2 text-[11px] text-[var(--ukb-subtle)]">
        <span>{FIRM.periodLabel}</span>
        <span>{FIRM.evidenceDate}</span>
        <span>
          Next BRC: {FIRM.nextBrc} <span className="uppercase">[illustrative]</span>
        </span>
        <span>{state.viewer === "cro" ? "Chief Risk Officer" : "Viewing as BRC chair (preview)"}</span>
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
      <main key={`${state.viewer}-${state.epoch}`} className="mx-auto max-w-[1440px] px-4 py-4">
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
