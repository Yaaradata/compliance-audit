"use client";

/**
 * UK Board v2 — board product shell (header and tabs copied from the v7 brand header).
 * The tab bar and every tab layout come from PERSONA_VIEWS (lib/ukboard/v2/personaViews.ts).
 * A persona switch replaces the tabs, opens that persona's default tab and closes the drawer;
 * the session audit trail is kept.
 */
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarDays, ListChecks, MoreHorizontal, NotebookPen } from "lucide-react";
import { METRICS } from "@/lib/ukboard/v2/board";
import { AGENTS } from "@/lib/ukboard/v2/agentsData";
import { daysToBrc } from "@/lib/ukboard/v2/board";
import { PERSONA_VIEWS, type PersonaId, type TabView } from "@/lib/ukboard/v2/personaViews";
import BoardDrawer from "./BoardDrawer";
import { DrawerContext } from "./drawerContext";
import type { DrawerKey } from "./drawerKeys";
import { StoreProvider, useStore } from "./store";
import { queueCount, renderSection } from "./sections";
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

function Header({ onOpen, onPersona }: { onOpen: (k: DrawerKey, el?: HTMLElement | null) => void; onPersona: (p: PersonaId) => void }) {
  const { state, dispatch } = useStore();
  const [menu, setMenu] = useState(false);
  const view = PERSONA_VIEWS[state.persona];
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
          {(Object.keys(PERSONA_VIEWS) as PersonaId[]).map((id) => ({ id, label: PERSONA_VIEWS[id].label })).map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={state.persona === p.id}
              onClick={() => onPersona(p.id)}
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
          <span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-800">Viewing as: {view.label}</span>
          {view.headerAction === "notes" ? (
            <button type="button" onClick={(e) => onOpen("notes", e.currentTarget)} className={headerBtn}>
              <NotebookPen className="h-3.5 w-3.5" aria-hidden />
              My notes ({state.session.notes.length})
            </button>
          ) : view.headerAction === "agenda" ? (
            <button type="button" onClick={() => dispatch({ type: "SET_TAB", tab: "agenda" })} className={headerBtn}>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Agenda · 15 Dec
            </button>
          ) : (
            <button type="button" onClick={() => dispatch({ type: "SET_TAB", tab: "actions" })} className={headerBtn}>
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              My queue ({queueCount(state)})
            </button>
          )}
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
        {view.tabs.map((t) => (
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

const headerBtn = `flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 ${focus}`;

const SPAN = { 3: "lg:col-span-3", 4: "lg:col-span-4", 6: "lg:col-span-6", 8: "lg:col-span-8", 12: "lg:col-span-12" } as const;

function TabBody({ tab }: { tab: TabView }) {
  const [ownerPick, setOwnerPick] = useState("Head of Financial Crime");
  const drill = tab.layout.some((r) => r.cols.some((c) => c.sections.includes("OWNER_DRILL")));
  const ctx = { ownerPick, setOwnerPick, drill };
  return (
    <>
      {tab.layout.map((row, i) => (
        <div key={i} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {row.cols.map((c, j) => (
            <div key={j} className={`flex min-w-0 flex-col gap-4 ${SPAN[c.span]}`}>
              {c.sections.map((id) => (
                <div key={id} data-section={id}>
                  {renderSection(id, ctx)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

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
  const { dispatch } = useStore();
  const view = PERSONA_VIEWS[state.persona];
  const tab = view.tabs.find((t) => t.id === state.tab) ?? view.tabs[0];
  const onPersona = useCallback(
    (p: PersonaId) => {
      setKey(null);
      opener.current = null;
      dispatch({ type: "SET_PERSONA", persona: p });
    },
    [dispatch],
  );
  return (
    <DrawerContext.Provider value={api}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Header onOpen={open} onPersona={onPersona} />
        <main key={`${state.persona}-${tab.id}-${state.epoch}`} className="space-y-4 px-6 py-4">
          <div className="max-h-14">
            <h1 className="text-xl font-extrabold leading-7 tracking-tight text-slate-900">{tab.question}</h1>
            <p className="text-[13px] leading-5 text-slate-600">{tab.subtitle}</p>
          </div>
          <TabBody tab={tab} />
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
