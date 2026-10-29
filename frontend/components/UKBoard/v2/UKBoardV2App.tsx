"use client";

/**
 * UK Board v2 — board product shell. Header: product · persona switch · search · as-at date ·
 * committee countdown (computed) · board agent and notes (Board member).
 * The tab bar and every tab layout come from PERSONA_VIEWS (lib/ukboard/v2/personaViews.ts).
 * A persona switch replaces the tabs, opens that persona's default tab and closes the drawer;
 * the session audit trail is kept.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { NotebookPen } from "lucide-react";
import { METRICS } from "@/lib/ukboard/v2/board";
import { AGENTS } from "@/lib/ukboard/v2/agentsData";
import { AS_AT_LABEL, daysToCommittee, FIG, OWNER_ROLES, PANEL_SOURCES } from "@/lib/ukboard/v2/boardStore";
import { PERSONA_VIEWS, type PersonaId, type TabView } from "@/lib/ukboard/v2/personaViews";
import AskBoardAgent from "./AskBoardAgent";
import BoardDrawer from "./BoardDrawer";
import { DrawerContext } from "./drawerContext";
import type { DrawerKey } from "./drawerKeys";
import { StoreProvider, useStore } from "./store";
import { installAudit } from "./audit";
import { FigureRegistry, PageHeader, SourceCtx } from "./present";
import { renderSection } from "./sections";
import { focus } from "./ui";

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

function Header({ onOpen, onPersona, onAgent }: { onOpen: (k: DrawerKey, el?: HTMLElement | null) => void; onPersona: (p: PersonaId) => void; onAgent: () => void }) {
  const { state, dispatch } = useStore();
  const view = PERSONA_VIEWS[state.persona];
  const board = state.persona === "board";
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
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-slate-200 px-2 py-1 font-medium text-slate-700">{AS_AT_LABEL}</span>
          <button type="button" onClick={(e) => onOpen("sources", e.currentTarget)} className={headerBtn}>
            Sources
          </button>
          <span className="rounded-md border border-slate-200 px-2 py-1 font-medium text-slate-700">
            Board Risk Committee {FIG.dates.brc} · <Days /> days
          </span>
          {board ? (
            <>
              <button type="button" onClick={onAgent} className={`${headerBtn} text-violet-800`}>
                <span className="text-violet-500" aria-hidden>✦</span>
                Ask the board agent
              </button>
              <button type="button" onClick={(e) => onOpen("notes", e.currentTarget)} className={headerBtn}>
                <NotebookPen className="h-3.5 w-3.5" aria-hidden />
                My notes ({state.session.notes.length})
              </button>
            </>
          ) : null}
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

const noop = () => () => {};
/** Days to committee from today's date, computed on the client (the page is prerendered). */
function Days() {
  const d = useSyncExternalStore(noop, () => daysToCommittee(), () => null);
  return <span className="tabular-nums">{d ?? "–"}</span>;
}

const headerBtn = `flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 ${focus}`;

/** Columns stack below 1280px so tables keep their width at 1024. */
const SPAN = { 3: "xl:col-span-3", 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6", 7: "xl:col-span-7", 8: "xl:col-span-8", 12: "xl:col-span-12" } as const;

function TabBody({ tab }: { tab: TabView }) {
  return (
    <>
      {tab.layout.map((row, i) => (
        <div key={i} className="grid grid-cols-1 items-stretch gap-x-6 gap-y-4 xl:grid-cols-12">
          {row.cols.map((c, j) => (
            <div key={j} className={`flex min-w-0 flex-col gap-4 ${SPAN[c.span]}`}>
              {c.sections.map((id, k) => (
                // The last section in a column stretches, so cards in a row end level.
                <div key={id} data-section={id} className={k === c.sections.length - 1 ? "flex flex-1 flex-col [&>section]:flex-1" : undefined}>
                  {/* Every panel names its feed; the card inside renders the footer. */}
                  <SourceCtx.Provider value={PANEL_SOURCES[id] ?? null}>{renderSection(id)}</SourceCtx.Provider>
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
  const [agent, setAgent] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "development") installAudit(dispatch);
  }, [dispatch]);
  const onPersona = useCallback(
    (p: PersonaId) => {
      setKey(null);
      setAgent(false);
      opener.current = null;
      dispatch({ type: "SET_PERSONA", persona: p });
    },
    [dispatch],
  );
  return (
    <DrawerContext.Provider value={api}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Header onOpen={open} onPersona={onPersona} onAgent={() => setAgent(true)} />
        <main key={`${state.persona}-${tab.id}-${state.epoch}`} className="mx-auto max-w-[1440px] space-y-4 px-6 py-4">
          <PageHeader title={tab.title} meta={tab.meta} />
          <FigureRegistry tab={`${state.persona}-${tab.id}`}>
            <TabBody tab={tab} />
          </FigureRegistry>
        </main>
        {agent && state.persona === "board" ? <AskBoardAgent onClose={() => setAgent(false)} /> : null}
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
