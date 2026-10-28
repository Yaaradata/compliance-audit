"use client";

/**
 * UK Board v2 — board product shell (header and tabs copied from the v7 brand header).
 * Persona switch changes the default tab, the actions and the visible content.
 * Six tabs with distinct content; every row and card opens the detail drawer.
 */
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { MoreHorizontal, NotebookPen } from "lucide-react";
import { METRICS } from "@/lib/ukboard/v2/board";
import { AGENTS } from "@/lib/ukboard/v2/agentsData";
import { PERSONAS, TABS } from "@/lib/ukboard/v2/boardTabs";
import { daysToBrc } from "@/lib/ukboard/v2/board";
import BoardDrawer from "./BoardDrawer";
import { DrawerContext } from "./drawerContext";
import type { DrawerKey } from "./drawerKeys";
import { StoreProvider, useStore } from "./store";
import { AccountabilityTab, AgentsTab, DecisionsTab, GrowthTab, OverviewTab, RegulatoryTab } from "./tabs";
import { focus } from "./ui";

const SEARCH_ITEMS: { label: string; hint: string; key: DrawerKey }[] = [
  ...METRICS.map((m) => ({ label: m.name, hint: `Measure · ${m.owner}`, key: `metric:${m.unitId}` })),
  { label: "Savings growth vs crime checks", hint: "Decision 1", key: "decision:1" },
  { label: "Restriction breach: report or not?", hint: "Decision 2", key: "decision:2" },
  { label: "Issue removed from board pack", hint: "Decision 3", key: "decision:3" },
  ...["Head of Financial Crime", "Treasurer", "Chief Credit Officer", "Head of Compliance", "Data owner (payments)"].map((r) => ({ label: r, hint: "Owner", key: `owner:${r}` })),
  ...AGENTS.map((a) => ({ label: a.name, hint: "AI agent", key: `agent:${a.id}` })),
];

function Search({ onPick }: { onPick: (k: DrawerKey, el: HTMLElement) => void }) {
  const [q, setQ] = useState("");
  const hits = q.trim().length > 1 ? SEARCH_ITEMS.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <div className="relative w-full max-w-sm">
      <input
        aria-label="Search risks, owners, decisions"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search risks, owners, decisions…"
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
      {hits.length ? (
        <ul className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {hits.map((h) => (
            <li key={h.key}>
              <button
                type="button"
                onClick={(e) => {
                  onPick(h.key, e.currentTarget);
                  setQ("");
                }}
                className={`flex w-full justify-between gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${focus}`}
              >
                <span className="text-slate-900">{h.label}</span>
                <span className="text-slate-500">{h.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Header({ onOpen }: { onOpen: (k: DrawerKey, el?: HTMLElement | null) => void }) {
  const { state, dispatch } = useStore();
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
        <Link href="/select_region" className={`flex items-center gap-2 rounded ${focus}`} aria-label="All dashboards">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 text-sm font-bold text-white">RC</span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-slate-900">
              RiskTrace<span className="text-indigo-600">.uk</span>
            </span>
            <span className="-mt-0.5 block text-[10px] text-slate-500">UK Board · Risk &amp; Growth</span>
          </span>
        </Link>
        <div role="radiogroup" aria-label="Persona" className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={state.persona === p.id}
              onClick={() => dispatch({ type: "SET_PERSONA", persona: p.id })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${focus} ${state.persona === p.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="min-w-[180px] flex-1">
          <Search onPick={(k, el) => onOpen(k, el)} />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {state.persona === "board" ? (
            <button type="button" onClick={(e) => onOpen("notes", e.currentTarget)} className={`flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 ${focus}`}>
              <NotebookPen className="h-3.5 w-3.5" aria-hidden />
              My notes ({state.session.notes.length})
            </button>
          ) : null}
          <div className="relative">
            <button type="button" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)} className={`rounded-md border border-slate-200 p-1.5 hover:bg-slate-50 ${focus}`}>
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
            {menu ? (
              <div className="absolute right-0 z-40 mt-1 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "RESET" });
                    setMenu(false);
                  }}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-50 ${focus}`}
                >
                  Reset session
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-slate-100 px-6">
      <nav aria-label="Board tabs" className="flex items-center gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-current={state.tab === t.id ? "page" : undefined}
            onClick={() => dispatch({ type: "SET_TAB", tab: t.id })}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-xs font-medium transition ${focus} ${state.tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
        <div className="flex flex-wrap items-center gap-2 py-1.5 text-[11px]">
          <span className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live · now
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700">Q3 2026 vs Q2 2026</span>
          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 font-semibold text-indigo-800">Next Board Risk Committee: 15 Dec 2026 ({daysToBrc()} days)</span>
        </div>
      </div>
    </header>
  );
}

const TITLES = {
  overview: ["Are we growing safely?", "Where we stand, what changed, and what needs the board today."],
  growth: ["How much risk are we using to grow?", "Appetite the board set against where the business operates."],
  decisions: ["What must we decide today?", "Three decisions, their options, and who decides."],
  regulatory: ["Will the regulator be surprised?", "Reporting clocks, restriction health and lessons from enforcement."],
  accountability: ["Who owns it, and is bad news reaching us?", "Named owners, sign-off, and what left the board pack."],
  agents: ["What are our AI agents doing?", "Agents watch, draft, test and propose. People decide."],
} as const;

function Page() {
  const { state } = useStore();
  const [key, setKey] = useState<DrawerKey | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((k: DrawerKey, el?: HTMLElement | null) => {
    opener.current = el ?? null;
    setKey(k);
  }, []);
  const close = useCallback(() => {
    setKey(null);
    opener.current?.focus();
  }, []);
  const api = useMemo(() => ({ openKey: key, open, close }), [key, open, close]);
  const [title, sub] = TITLES[state.tab];
  const Tab = { overview: OverviewTab, growth: GrowthTab, decisions: DecisionsTab, regulatory: RegulatoryTab, accountability: AccountabilityTab, agents: AgentsTab }[state.tab];
  return (
    <DrawerContext.Provider value={api}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Header onOpen={open} />
        <main key={`${state.persona}-${state.tab}-${state.epoch}`} className="space-y-5 px-6 py-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{sub}</p>
          </div>
          <Tab />
        </main>
        {key ? <BoardDrawer key={`${key}-${state.persona}`} drawerKey={key} onClose={close} /> : null}
      </div>
    </DrawerContext.Provider>
  );
}

export default function UKBoardV2App() {
  return (
    <StoreProvider>
      <Page />
    </StoreProvider>
  );
}
