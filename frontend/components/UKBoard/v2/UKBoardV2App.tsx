"use client";

/**
 * UK Board v2 — board product shell. Header: product · persona switch · search, then the
 * tab bar.
 * The tab bar and every tab layout come from PERSONA_VIEWS (lib/ukboard/v2/personaViews.ts).
 * A persona switch replaces the tabs, opens that persona's default tab and closes the drawer;
 * the session audit trail is kept.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { METRICS } from "@/lib/ukboard/v2/board";
import { AGENTS } from "@/lib/ukboard/v2/agentsData";
import { OWNER_ROLES } from "@/lib/ukboard/v2/boardStore";
import { headlineOf, PAGE_SOURCES, waitingDraftCount } from "@/lib/ukboard/v2/headlines";
import { PERSONA_VIEWS, type PersonaId, type TabView } from "@/lib/ukboard/v2/personaViews";
import BoardDrawer from "./BoardDrawer";
import { DrawerContext } from "./drawerContext";
import type { DrawerKey } from "./drawerKeys";
import { StoreProvider, useStore } from "./store";
import { installAudit } from "./audit";
import { FigureRegistry, HeadlineBar, PageSources } from "./present";
import { renderSection } from "./sections";
import { focus } from "./ui";
import { StatusCells } from "./visuals";

const SEARCH_ITEMS: { label: string; hint: string; key: DrawerKey }[] = [
  ...METRICS.map((m) => ({ label: m.name, hint: `Measure · ${m.owner}`, key: `metric:${m.unitId}` })),
  { label: "Savings growth vs crime checks", hint: "Decision 1", key: "decision:1" },
  { label: "Restriction breach: reportable", hint: "Decision 2", key: "decision:2" },
  { label: "Issue removed from board pack", hint: "Decision 3", key: "decision:3" },
  ...OWNER_ROLES.map((o) => ({ label: o.role, hint: "Risk owner", key: `owner:${o.role}` })),
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
  const view = PERSONA_VIEWS[state.persona];
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
        <Link href="/select_region" className={`flex items-center gap-2 rounded ${focus}`} aria-label="All dashboards">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-700 text-sm font-bold text-white">RC</span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-slate-900">
              RiskTrace<span className="text-indigo-600">.uk</span>
            </span>
            <span className="-mt-0.5 block text-[10px] text-slate-500">UK Board · Risk &amp; Growth</span>
          </span>
        </Link>
        <div role="radiogroup" aria-label="Persona" className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {(Object.keys(PERSONA_VIEWS) as PersonaId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={state.persona === id}
              onClick={() => onPersona(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${focus} ${state.persona === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {PERSONA_VIEWS[id].label}
            </button>
          ))}
        </div>
        <div className="min-w-[180px] flex-1">
          <Search onPick={(k, el) => onOpen(k, el)} />
        </div>
      </div>
      <nav aria-label="Board tabs" className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto border-t border-slate-100 px-6">
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
    </header>
  );
}

/** Columns stack below 1280px so tables keep their width at 1024. */
const SPAN = { 3: "xl:col-span-3", 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6", 7: "xl:col-span-7", 8: "xl:col-span-8", 12: "xl:col-span-12" } as const;

/** A stretched card shares its spare height across its list rows, so cards in a row end level with no empty space. */
const STRETCH = "flex flex-1 flex-col [&>section]:flex-1 [&>section>button]:flex [&>section>button]:flex-1 [&>section>button>span:only-child]:w-full [&>section>span]:flex-1 [&>section>div[data-row]]:flex [&>section>div[data-row]]:flex-1 [&>section>div[data-row]>span:only-child]:w-full";

function TabBody({ tab }: { tab: TabView }) {
  const compact = !!tab.compact;
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {tab.layout.map((row, i) => (
        <div key={i} className={`grid grid-cols-1 items-stretch xl:grid-cols-12 ${compact ? "gap-3" : "gap-x-6 gap-y-4"}`}>
          {row.cols.map((c, j) => (
            <div key={j} className={`flex min-w-0 flex-col ${compact ? "gap-3" : "gap-4"} ${SPAN[c.span]}`}>
              {c.sections.map((id, k) => (
                // The last section in a column stretches, so cards in a row end level (every section on compact tabs).
                <div key={id} data-section={id} className={compact || k === c.sections.length - 1 ? STRETCH : undefined}>
                  {renderSection(id)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
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
  const headline = headlineOf(state.persona, tab.id, waitingDraftCount(state.session.drafts));
  useEffect(() => {
    if (process.env.NODE_ENV === "development") installAudit(dispatch);
  }, [dispatch]);
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
        <main key={`${state.persona}-${tab.id}-${state.epoch}`} className={`mx-auto max-w-[1440px] px-6 py-4 ${tab.compact ? "space-y-3" : "space-y-4"}`}>
          {headline ? <HeadlineBar status={headline.status} line={headline.line} ask={headline.ask} right={<StatusCells />} /> : null}
          <FigureRegistry tab={`${state.persona}-${tab.id}`}>
            <TabBody tab={tab} />
          </FigureRegistry>
          <PageSources text={PAGE_SOURCES} />
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
