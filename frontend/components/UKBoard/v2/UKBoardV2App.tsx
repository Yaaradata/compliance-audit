"use client";

/**
 * UK Board v2 — one board page (no tabs). Header A, headline B, growth strip C,
 * off-track list D beside decisions E, panels F. Detail opens in the right drawer.
 * Reuses the v1 store (gates, audit, viewer, theme) and v1 data read-only.
 */
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { Moon, MoreHorizontal, Sun } from "lucide-react";
import { FIRM } from "@/lib/ukboard/v1/data";
import type { Viewer } from "@/lib/ukboard/v1/types";
import { daysToBrc, type DrawerKey } from "@/lib/ukboard/v2/board";
import { BoardStoreProvider, useBoard } from "../v1/state/boardStore";
import { themeVars, ui } from "../v1/theme";
import BoardDrawer from "./BoardDrawer";
import { DrawerContext } from "./drawerContext";
import { BoardHeadline, Decisions, OffTrack, Panels, WhereCanWeGrow } from "./sections";

function Header() {
  const { state, dispatch } = useBoard();
  const [menu, setMenu] = useState(false);
  const viewers: { id: Viewer; label: string }[] = [
    { id: "cro", label: "CRO" },
    { id: "brc_chair_preview", label: "BRC chair" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ukb-border)] bg-[var(--ukb-surface)]">
      <div className="mx-auto grid h-14 max-w-[1360px] grid-cols-[1fr_auto] items-center gap-3 px-4 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/select_region" aria-label="All dashboards" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ukb-accent)] text-[11px] font-bold text-[var(--ukb-surface)] ${ui.focus}`}>
            UB
          </Link>
          <span className="truncate text-sm font-semibold text-[var(--ukb-text)]">{FIRM.name}</span>
          <span className="hidden rounded border border-[var(--ukb-track)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--ukb-muted)] sm:inline">Illustrative</span>
        </div>
        <p className="hidden text-xs text-[var(--ukb-muted)] lg:block">
          Q3 2026 vs Q2 2026 · Next BRC {FIRM.nextBrc} ({daysToBrc()} days)
        </p>
        <div className="flex items-center justify-end gap-2">
          <div role="radiogroup" aria-label="Viewer" className="inline-flex rounded-lg bg-[var(--ukb-surface-2)] p-0.5">
            {viewers.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={state.viewer === v.id}
                onClick={() => state.viewer !== v.id && dispatch({ type: "SET_VIEWER", viewer: v.id })}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${ui.focus} ${state.viewer === v.id ? "bg-[var(--ukb-surface)] text-[var(--ukb-text)] shadow-sm" : "text-[var(--ukb-muted)]"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_THEME", theme: state.theme === "light" ? "dark" : "light" })}
            aria-label={state.theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            className={`${ui.button} ${ui.focus} px-2`}
          >
            {state.theme === "light" ? <Moon className="h-3.5 w-3.5" aria-hidden /> : <Sun className="h-3.5 w-3.5" aria-hidden />}
          </button>
          <div className="relative">
            <button type="button" aria-label="Presenter menu" aria-expanded={menu} onClick={() => setMenu(!menu)} className={`${ui.button} ${ui.focus} px-2`}>
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
            </button>
            {menu ? (
              <div className={`${ui.card} absolute right-0 z-40 mt-1 w-44 p-1 shadow-lg`}>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "RESET_DEMO" });
                    setMenu(false);
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
    </header>
  );
}

function Page() {
  const { state } = useBoard();
  const [openKey, setOpenKey] = useState<DrawerKey | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((key: DrawerKey, from?: HTMLElement | null) => {
    opener.current = from ?? null;
    setOpenKey(key);
  }, []);
  const close = useCallback(() => {
    setOpenKey(null);
    opener.current?.focus();
  }, []);
  const api = useMemo(() => ({ openKey, open, close }), [openKey, open, close]);

  return (
    <DrawerContext.Provider value={api}>
      <div style={themeVars(state.theme)} className="min-h-screen bg-[var(--ukb-canvas)] text-[var(--ukb-text)]">
        <Header />
        {/* Viewer and reset epoch key the page so local state remounts cleanly. */}
        <main key={`${state.viewer}-${state.epoch}`} className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-4 lg:px-8">
          <BoardHeadline />
          <WhereCanWeGrow />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <OffTrack />
            </div>
            <div className="xl:col-span-4">
              <Decisions />
            </div>
          </div>
          <Panels />
        </main>
        {openKey ? <BoardDrawer key={`${openKey}-${state.viewer}`} drawerKey={openKey} onClose={close} /> : null}
      </div>
    </DrawerContext.Provider>
  );
}

export default function UKBoardV2App() {
  return (
    <BoardStoreProvider>
      <Page />
    </BoardStoreProvider>
  );
}
