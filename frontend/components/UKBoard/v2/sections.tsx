"use client";

/**
 * UK Board v2 — reusable board sections (compact density). Tabs compose these per persona
 * (lib/ukboard/v2/personaViews.ts). One-line 40px list rows with a 3px status rail; 44px table
 * rows; cards sized to content; no stretched panels. Actions follow the persona:
 * Board member reads and challenges; the Chair records and governs; the CRO prepares and approves.
 */
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Lock, Sparkles } from "lucide-react";
import { CAPACITY, DRAFTS, EVENTS, HORIZON, KRI_DETAIL, PACK_ITEMS, PEOPLE, RESTRICTION, ROUTES } from "@/lib/ukboard/v1/data";
import { getPrecedent } from "@/lib/ukboard/v1/precedents";
import { headlineCounts, METRICS, rowState, type MetricMeta } from "@/lib/ukboard/v2/board";
import {
  CHANGES,
  DECISION_HISTORY,
  ENFORCEMENT_LESSONS,
  EVENT_PLAIN,
  FRANCHISES,
  GROWTH_TIER_LABEL,
  indicatorWord,
  measuresByTier,
  owners,
  postureWord,
  RESTRICTION_ROUTES,
  ROUTE_PLAIN,
  routesFor,
  signOffBuckets,
  UNCHANGED,
} from "@/lib/ukboard/v2/boardTabs";
import { ACTIVITY, AGENTS, FINDINGS, agentName, AUTONOMY_LABEL, AUTONOMY_ORDER, FIXED_RULES, MODEL_OVERSIGHT, QUEUE, totalChecks, TUNING, type Autonomy } from "@/lib/ukboard/v2/agentsData";
import type { SectionId } from "@/lib/ukboard/v2/personaViews";
import AppetiteDial from "./AppetiteDial";
import { renderBoardMemberSection } from "./boardRegistry";
import LineChart from "./LineChart";
import { useDrawer } from "./drawerContext";
import { useStore } from "./store";
import { AiTag, btn, btnPrimary, focus, Label, Opener, Pill, Sparkline, TONE, toneOf, type Tone } from "./ui";

/* ── Building blocks ─────────────────────────────────────────────────── */

const VERDICT_WORD = { room_to_grow: "Room to grow", hold: "Hold", fix_first: "Fix first", unverified: "Unconfirmed" } as const;
const STATE_WORD = { red: "Red", amber: "Amber", unverified: "Unconfirmed", within_appetite: "Within", not_assessed: "Not measured" } as const;

export function Card({ title, right, children, className = "", id }: { title?: string; right?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** One-line 40px list row with a 3px status rail; secondary detail inline after " · ". */
export function Row({ tone, text, detail, right, drawer }: { tone: Tone; text: string; detail?: string; right?: ReactNode; drawer?: string }) {
  const body = (
    <span className={`flex min-h-10 items-center justify-between gap-3 border-l-[3px] py-1 pl-3 pr-1 text-[13px] leading-snug ${TONE[tone].rail}`}>
      <span className="min-w-0 text-slate-800">
        {text}
        {detail ? <span className="text-slate-500"> · {detail}</span> : null}
      </span>
      {right}
    </span>
  );
  return drawer ? (
    <Opener drawer={drawer} label={text} className="rounded-r hover:bg-slate-50">
      {body}
    </Opener>
  ) : (
    body
  );
}

export function Tag({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${TONE[tone].bg} ${TONE[tone].text}`}>{children}</span>;
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${tone ? `${TONE[tone].bg} ${TONE[tone].border}` : "border-slate-200 bg-white"}`}>
      <Label>{label}</Label>
      <p className={`text-xl font-semibold leading-tight tabular-nums ${tone && tone !== "green" ? TONE[tone].text : "text-slate-900"}`}>{value}</p>
      {sub ? <p className="text-[11px] leading-snug text-slate-500">{sub}</p> : null}
    </div>
  );
}

export const measurePill = (m: MetricMeta) => {
  const s = rowState(m);
  if (s === "projected") return <Pill tone="amber" outline label={m.projectionText === "amber in about 9 weeks" ? "Amber ~9 weeks" : "Amber next quarter"} />;
  return <Pill tone={toneOf(s)} label={STATE_WORD[s]} />;
};

export function useGo() {
  const { dispatch } = useStore();
  return (tab: string) => dispatch({ type: "SET_TAB", tab });
}

/* ── Overview sections ───────────────────────────────────────────────── */

function Posture() {
  const word = postureWord();
  const t: Tone = word === "RED" ? "red" : word === "AMBER" ? "amber" : "green";
  const c = headlineCounts();
  const heading = METRICS.filter((m) => rowState(m) === "projected").length;
  const chips: [string, Tone][] = [
    [`${c.within_appetite} within`, "green"],
    [`${heading} heading for amber`, "amber"],
    [`${c.amber} amber`, "amber"],
    [`${c.red} red`, "red"],
    [`${c.unverified} unconfirmed`, "grey"],
    ["3 decisions", "amber"],
  ];
  return (
    <section className={`rounded-xl border-[1.5px] px-4 py-2.5 ${TONE[t].bg} ${TONE[t].border}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`h-3 w-3 rounded-full ${TONE[t].dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${TONE[t].text}`}>Board risk posture</span>
        <Pill tone={t} label={word} />
        <span className="text-[13px] text-slate-700">Growing within appetite in mortgages; savings growth outruns financial-crime capacity.</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {chips.map(([l, tone]) => (
          <Tag key={l} tone={tone}>
            {l}
          </Tag>
        ))}
      </div>
    </section>
  );
}

function BusinessLines() {
  const { state } = useStore();
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {FRANCHISES.map((f) => {
        const tone = toneOf(f.verdict);
        const done = f.pathDrafts.filter((id) => state.session.drafts[id]?.status !== "ai_draft").length;
        const isProtection = f.id === "O4";
        return (
          <Opener key={f.id} drawer={`franchise:${f.id}`} label={f.name} className="rounded-[10px]">
            <div className={`flex min-h-[112px] flex-col justify-between rounded-[10px] border-[1.5px] px-3 py-2 hover:shadow-md ${TONE[tone].bg} ${TONE[tone].border}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold text-slate-900">{f.name}</span>
                <Pill tone={tone} label={VERDICT_WORD[f.verdict]} />
              </div>
              <p className={`text-2xl font-bold leading-none tabular-nums ${tone === "green" ? "text-slate-900" : TONE[tone].text}`}>{isProtection ? "2 unconfirmed" : f.big}</p>
              <p className="flex items-baseline justify-between gap-2 text-[11px] leading-snug text-slate-600">
                <span>{isProtection ? "Monitoring 94.0% · Sanctions 1.3%" : f.line}</span>
                {!isProtection && f.verdict !== "room_to_grow" && f.pathDrafts.length ? (
                  <span className="shrink-0 font-semibold text-slate-500">
                    Path to green {done}/{f.pathDrafts.length}
                  </span>
                ) : null}
              </p>
              {isProtection ? null : (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold tabular-nums text-slate-600">{f.trend}</span>
                  {f.spark ? <Sparkline values={f.spark} tone={tone} /> : null}
                </div>
              )}
            </div>
          </Opener>
        );
      })}
    </div>
  );
}

function DecideList() {
  const go = useGo();
  const items: [string, string, Tone][] = [
    ["Savings growth vs crime checks", "queue 19 days, amber 14", "amber"],
    ["Restriction breach: report or not?", "112 of 9,400 accounts", "red"],
    ["Issue removed from the pack", "amber 3 quarters", "amber"],
  ];
  return (
    <Card title="For your decision">
      {items.map(([t, d, tone], i) => (
        <button key={t} type="button" onClick={() => go("decisions")} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <Row tone={tone} text={`${i + 1}. ${t}`} detail={d} />
        </button>
      ))}
    </Card>
  );
}

function ChangeList({ kind }: { kind: "changed" | "unchanged" }) {
  const list = kind === "changed" ? CHANGES : UNCHANGED;
  return (
    <Card title={kind === "changed" ? "What changed since last board" : "What has not changed"}>
      {list.map((c) => (
        <Row key={c.text} tone={c.tone} text={c.text} drawer={c.drawer} right={<Tag tone={c.tone}>{c.standing ? c.standing.replace("Standing ", "") : c.tag}</Tag>} />
      ))}
    </Card>
  );
}

function AgentStrip() {
  const { state } = useStore();
  const go = useGo();
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length;
  return (
    <button type="button" onClick={() => go("ai")} className={`flex w-full flex-wrap items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-left text-[13px] text-slate-700 hover:bg-violet-100 ${focus}`}>
      <AiTag label="AI agents this quarter" />
      <span>
        <b>{totalChecks()}</b> checks · <b>{ACTIVITY.filter((a) => a.type === "FLAG").length}</b> flagged · <b>{waiting}</b> drafts with the CRO
      </span>
      <span className="ml-auto font-semibold text-indigo-700">AI oversight ›</span>
    </button>
  );
}

/* ── Appetite sections ───────────────────────────────────────────────── */

function AppetiteSummary() {
  const c = headlineCounts();
  const heading = METRICS.filter((m) => rowState(m) === "projected").length;
  const tiles: [string, string, Tone][] = [
    ["Within appetite", `${c.within_appetite} of 12 · ${heading} heading for amber`, "green"],
    ["Amber", `${c.amber} of 12`, "amber"],
    ["Red", `${c.red} of 12`, "red"],
    ["Unconfirmed", `${c.unverified} of 12`, "grey"],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {tiles.map(([l, v, tone]) => (
        <div key={l} className={`flex h-16 items-center justify-between rounded-lg border-[1.5px] px-3 ${TONE[tone].bg} ${TONE[tone].border}`}>
          <Label>{l}</Label>
          <span className={`text-base font-bold tabular-nums ${tone === "green" ? "text-emerald-700" : TONE[tone].text}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}

const ROW_GRID = "grid min-h-11 grid-cols-[minmax(120px,1.2fr)_minmax(70px,0.8fr)_minmax(0,1.2fr)_64px_88px_auto] items-center gap-2.5 border-b border-slate-100 px-2 py-1 text-[13px] leading-snug min-[1400px]:grid-cols-[minmax(130px,1.3fr)_minmax(70px,0.8fr)_minmax(0,1.2fr)_64px_88px_minmax(0,1.1fr)_auto]";

function MeasureRow({ m }: { m: MetricMeta }) {
  const { state } = useStore();
  // Board member face: plain owner wording (no "feed").
  const owner = state.persona === "board" ? m.owner.replace(/^Feed owner$/, "Data owner") : m.owner;
  return (
    <Opener drawer={`metric:${m.unitId}`} label={`${m.name}: ${m.value} ${m.denominator}`} className="hover:bg-slate-50">
      <div className={ROW_GRID}>
        <span className="font-semibold text-slate-900">{m.name}</span>
        <span>{m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} /> : <span className="text-slate-400">no dial</span>}</span>
        <span className="tabular-nums">
          <b>{m.value}</b> <span className="text-xs text-slate-500">{m.denominator}</span>
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${m.delta?.worse ? "text-red-600" : "text-slate-400"}`}>
          {m.delta ? (
            <>
              {m.delta.text.startsWith("+") ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />}
              {m.delta.text.replace(/^[+−-]/, "")}
            </>
          ) : (
            "no change"
          )}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-center text-[10px] font-semibold ${m.indicatorType === "leading" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{indicatorWord(m)}</span>
        <span className="hidden truncate text-xs text-slate-500 min-[1400px]:block">{owner}</span>
        <span className="justify-self-end">{measurePill(m)}</span>
      </div>
    </Opener>
  );
}

function Measures() {
  const { state } = useStore();
  const { open } = useDrawer();
  const [greens, setGreens] = useState(state.persona === "cro");
  const greenRows = METRICS.filter((m) => rowState(m) === "within_appetite");
  return (
    <Card title="Board measures">
      {measuresByTier(false).map((g) => (
        <div key={g.tier}>
          <p className="px-2 pb-0.5 pt-1.5">
            <Label>{GROWTH_TIER_LABEL[g.tier]}</Label>
          </p>
          {g.rows.map((m) => (
            <MeasureRow key={m.unitId} m={m} />
          ))}
          {g.tier === "emerging" && state.persona !== "chair" ? (
            <div className="flex h-11 items-center justify-between gap-3 border-b border-slate-100 px-2 text-[13px]">
              <span className="truncate">
                <b>AI impersonation fraud</b> <span className="text-xs text-slate-500">· not yet measured · Head of Financial Crime</span>
              </span>
              {state.persona === "cro" ? (
                <button type="button" onClick={(e) => open("horizon", e.currentTarget)} className={btn}>
                  Propose a measure
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
      <button type="button" aria-expanded={greens} onClick={() => setGreens(!greens)} className={`flex h-10 w-full items-center gap-2 px-2 text-left text-[13px] hover:bg-slate-50 ${focus}`}>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {greenRows.length} more within appetite <span className="font-semibold text-indigo-700">· {greens ? "hide" : "show"}</span>
      </button>
      {greens ? greenRows.map((m) => <MeasureRow key={m.unitId} m={m} />) : null}
    </Card>
  );
}

function GrowthCapacity() {
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  return (
    <Card title="Growth vs capacity">
      <LineChart
        title="Members index against handlers index"
        height={140}
        series={[
          { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.membersM)[i] })) },
          { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.handlers)[i] })), dashed: true },
        ]}
      />
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat label="Per handler" value="30,160" sub="was 25,000" />
        <Stat label="In target" value="81%" sub="31,600 of 39,000" />
        <Stat label="Queue" value="19 days" sub="amber 14" tone="amber" />
      </div>
    </Card>
  );
}

function Tradeoffs() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const p = state.persona;
  const returned = state.session.returned.includes("d-t26-redecide");
  const rows: [string, string, Tone, string][] = [
    ["Onboarding uplift", "+6.2 pts vs limit +5", "red", "Broken"],
    ["High-risk acceptance", "1.1% vs limit 0.8%", "red", "Broken"],
    ["Onboarding fraud losses", "0.9 bp vs limit 1.5 bp", "green", "Within"],
    ["Checks before transacting", "regulatory floor", "red", "Floor"],
  ];
  const action =
    p === "cro" ? (
      <button type="button" onClick={(e) => open("franchise:O2", e.currentTarget)} className={btn}>
        Adjust appetite (propose)
      </button>
    ) : p === "chair" ? (
      <button type="button" disabled={returned} onClick={() => dispatch({ type: "RETURN_TO_CRO", draftId: "d-t26-redecide" })} className={btn}>
        {returned ? "Returned to CRO" : "Return to CRO"}
      </button>
    ) : null;
  return (
    <Card title="Agreed trade-off: savings" right={action}>
      <p className="mb-1 text-[11px] text-slate-500">
        Agreed 14 Apr 2026 · <span className="font-semibold text-red-600">review 27 days overdue</span>
      </p>
      {rows.map(([t, d, tone, pill]) => (
        <Row key={t} tone={tone} text={t} detail={d} right={<Pill tone={tone} label={pill} />} />
      ))}
    </Card>
  );
}

/* ── Decision sections ───────────────────────────────────────────────── */

const CHALLENGES: Record<number, string[]> = {
  1: ["What capacity do we need before the 8 Dec campaign?", "Why no resourcing decision since August?", "What would pacing growth cost in members?"],
  2: ["When did we first know about the savings pot?", "Who decides each reporting route, and by when?", "Why are 24,000 openings still not checked?"],
  3: ["Who removed this item, and on what authority?", "Why no action after 3 quarters at amber?", "What stops an item being dropped silently?"],
};

interface DecisionDef {
  n: 1 | 2 | 3;
  title: string;
  tone: Tone;
  key: string;
  keySub: string;
  support: string;
  why: string;
  recommend: string;
  decider: string;
}

const DECISIONS: DecisionDef[] = [
  { n: 1, title: "Savings growth vs crime checks", tone: "amber", key: "19 days", keySub: "alert queue age · amber 14", support: "30,160 members per handler (was 25,000)", why: "Next savings campaign starts in 6 weeks.", recommend: "Recommends restore capacity", decider: "Board · before 8 Dec" },
  { n: 2, title: "Restriction breach: report or not?", tone: "red", key: "112 of 9,400", keySub: "accounts checked · 24,000 not checked", support: "104 customers, including 3 previously exited", why: "FCA and PRA clocks are immediate.", recommend: "Prepared the case; no answer recommended", decider: "Head of Compliance · immediate" },
  { n: 3, title: "Issue removed from board pack", tone: "amber", key: "3 quarters", keySub: "vulnerable-customer exceptions at amber", support: "Removed at Executive Risk Committee 14 Oct, no reason", why: "It met a committee rule but left the pack.", recommend: "Recommends remediation with an owner", decider: "Risk Committee Chair · 15 Dec" },
];

function Challenge({ n }: { n: number }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const saved = state.session.notes.filter((x) => x.from === `Decision ${n}`).map((x) => x.text);
  const noted = state.session.notes.some((x) => x.from === `Decision ${n} note`);
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(!open)} className={btn}>
          Ask a challenge question
        </button>
        <button type="button" disabled={noted} onClick={() => dispatch({ type: "SAVE_NOTE", text: `Raise decision ${n} at the meeting`, from: `Decision ${n} note` })} className={btn}>
          {noted ? "In my notes" : "Add to my notes"}
        </button>
      </div>
      {open ? (
        <div className="space-y-1 rounded-lg border border-violet-200 bg-violet-50 p-2">
          <AiTag label="AI agent drafted" />
          {CHALLENGES[n].map((q) => (
            <div key={q} className="flex items-start justify-between gap-2 text-xs text-slate-700">
              <span>{q}</span>
              <button type="button" disabled={saved.includes(q)} onClick={() => dispatch({ type: "SAVE_NOTE", text: q, from: `Decision ${n}` })} className={`shrink-0 text-[11px] font-semibold text-indigo-700 disabled:text-slate-400 ${focus} rounded`}>
                {saved.includes(q) ? "Saved" : "Save"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChairRecord() {
  const { state, dispatch } = useStore();
  const [opt, setOpt] = useState<string | null>(null);
  const d = state.session.drafts["d-t234-options"];
  if (d.status !== "ai_draft") return <p className="text-xs font-semibold text-slate-900">Recorded by {PEOPLE.chair.name}: {DRAFTS["d-t234-options"].options?.find((o) => o.id === d.chosenOptionId)?.label}</p>;
  return (
    <fieldset>
      <legend className="sr-only">Your decision</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {DRAFTS["d-t234-options"].options!.map((o) => (
          <label key={o.id} className="flex items-center gap-1.5 text-xs text-slate-700">
            <input type="radio" name="chair-d3" checked={opt === o.id} onChange={() => setOpt(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
      <button type="button" disabled={!opt} onClick={() => opt && dispatch({ type: "CHAIR_RECORD", draftId: "d-t234-options", optionId: opt })} className={`${btnPrimary} mt-2`}>
        Record decision
      </button>
    </fieldset>
  );
}

function DecisionCard({ d, compact, children }: { d: DecisionDef; compact?: boolean; children?: ReactNode }) {
  const { open } = useDrawer();
  return (
    <div className={`rounded-xl border-[1.5px] bg-white p-4 shadow-sm ${TONE[d.tone].border}`}>
      <button type="button" onClick={(e) => open(`decision:${d.n}`, e.currentTarget)} className={`block w-full text-left ${focus} rounded`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{d.n}</span>
          <span className="text-sm font-bold text-slate-900">{d.title}</span>
          {compact ? <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">For noting</span> : null}
        </div>
        <p className={`mt-2 tabular-nums ${compact ? "text-xl font-semibold" : "text-[28px] font-bold leading-tight"} ${TONE[d.tone].text}`}>
          {d.key} <span className="text-xs font-normal text-slate-500">{d.keySub}</span>
        </p>
        {compact ? (
          <p className="text-xs text-slate-500">{d.decider}</p>
        ) : (
          <>
            <p className="text-xs text-slate-600">{d.support}</p>
            <p className="mt-1 text-xs text-slate-700">
              <Label>Why now</Label> {d.why}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-800">
              <AiTag /> {d.recommend}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{d.decider}</p>
          </>
        )}
      </button>
      {children ? <div className="mt-2.5">{children}</div> : null}
    </div>
  );
}

function DecisionCards() {
  const { state } = useStore();
  if (state.persona === "chair") {
    return (
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <DecisionCard d={DECISIONS[2]}>
            <ChairRecord />
          </DecisionCard>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-6">
          <DecisionCard d={DECISIONS[0]} compact />
          <DecisionCard d={DECISIONS[1]} compact />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      {DECISIONS.map((d) => (
        <DecisionCard key={d.n} d={d}>
          {state.persona === "board" ? <Challenge n={d.n} /> : null}
        </DecisionCard>
      ))}
    </div>
  );
}

function DecisionHistory() {
  const { state } = useStore();
  const compact = state.persona === "cro";
  return (
    <Card title="Decision history">
      {DECISION_HISTORY.map((h) => (
        <Row key={h.decision} tone={h.tone} text={compact ? h.decision : `${h.date} · ${h.forum}: ${h.decision}`} detail={compact ? h.date : undefined} right={compact ? undefined : <Pill tone={h.tone} outline label={h.outcome} />} />
      ))}
    </Card>
  );
}

/* ── Regulatory sections ─────────────────────────────────────────────── */

function Clocks() {
  const { state, dispatch } = useStore();
  const cro = state.persona === "cro";
  return (
    <Card title={cro ? "Reporting clocks" : state.persona === "board" ? "What may be reportable?" : "Reporting status"}>
      {EVENTS.map((e) => {
        const rs = routesFor(e.eventId);
        const decided = rs.filter((r) => r.status === "decided").length;
        if (!cro) {
          return <Row key={e.eventId} tone={decided ? "amber" : "red"} text={EVENT_PLAIN[e.eventId]} detail={`day ${e.dayN} · ${decided} of ${rs.length} decided · Head of Compliance`} drawer={`event:${e.eventId}`} />;
        }
        return (
          <div key={e.eventId} className="mb-2 rounded-lg border border-slate-200">
            <div className="flex h-10 items-center justify-between bg-slate-50 px-3 text-[13px]">
              <b className="text-slate-900">{EVENT_PLAIN[e.eventId]}</b>
              <span className="text-xs text-slate-600">
                Day {e.dayN} · {decided} of {rs.length} decided
              </span>
            </div>
            {rs.map((r) => {
              const caseId = r.caseDraftId;
              const cs = caseId ? state.session.drafts[caseId] : undefined;
              return (
                <div key={r.routeId} className="grid h-11 grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_auto] items-center gap-3 border-t border-slate-100 px-3 text-xs">
                  <b className="text-slate-900">{ROUTE_PLAIN[r.routeId]}</b>
                  <span className="truncate text-slate-600">{r.isSar ? "As soon as practicable" : r.clockHours === 24 ? (r.status === "decided" ? "Immediate" : "Immediate · triage passed") : "Reporting period"}</span>
                  <span className="truncate text-slate-600">{r.status === "decided" ? `${PEOPLE[r.history[0].deciderPersonId].name}, ${r.history[0].decidedOn}` : r.proposedDeciderRole}</span>
                  {cs && cs.status === "ai_draft" ? (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "ACCEPT", draftId: caseId! });
                        dispatch({ type: "SEND", draftId: caseId! });
                      }}
                      className={btn}
                    >
                      Send case
                    </button>
                  ) : (
                    <Pill tone={r.status === "decided" ? "green" : r.isSar ? "grey" : "amber"} label={r.status === "decided" ? "Decided" : r.isSar ? (r.status === "not_engaged" ? "Closed" : "Open") : "With SMF"} />
                  )}
                </div>
              );
            })}
            {e.awarenessGap ? <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-600">Awareness date: earlier linked records {e.awarenessGap.gapDays} days before the logged date</p> : null}
          </div>
        );
      })}
      {state.persona === "board" ? (
        <>
          <Row tone="red" text="FCA and PRA clocks are immediate" detail="Head of Compliance decides, not the board" />
        </>
      ) : null}
    </Card>
  );
}

function Horizon() {
  return (
    <Card title="Horizon">
      <Row tone="grey" text="7 emerging risks" detail="in the register" drawer="horizon" />
      <Row tone="amber" text="2 within 12 months" detail="1 not yet measured" drawer="horizon" />
      <Row tone="grey" text={`${HORIZON.daysToIncidentRules} days`} detail="to new incident rules (18 Mar 2027)" drawer="horizon" />
      <Row tone="grey" text="9 of 31 incidents" detail="classified in a trial run" drawer="horizon" />
    </Card>
  );
}

function Restriction() {
  return (
    <Card title="Restriction health" right={<Pill tone="red" label="Breach" />}>
      <Opener drawer="restriction" label="Restriction health" className="rounded">
        <p className="text-2xl font-bold tabular-nums text-red-600">
          112 of 9,400 <span className="text-xs font-normal text-slate-500">accounts checked · 104 customers</span>
        </p>
        <p className="text-xs text-slate-600">The block fired 1,208 times; the full check found 112 breaches.</p>
        <div className="mt-1.5 space-y-1">
            {RESTRICTION_ROUTES.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <span className="w-28 shrink-0 text-slate-600">{r.label}</span>
                <span className="h-1.5 rounded-full bg-red-400" style={{ width: `${(r.accounts / RESTRICTION.breachesAccounts) * 55}%` }} />
                <b className="tabular-nums">{r.accounts}</b>
              </div>
            ))}
          <p className="text-xs text-slate-500">1 of 4 clauses not supported · sign-off due 8 Nov</p>
        </div>
      </Opener>
    </Card>
  );
}

function Enforcement() {
  const { state, dispatch } = useStore();
  const cro = state.persona === "cro";
  const done = state.session.drafts["d-t232-readacross"]?.status !== "ai_draft";
  return (
    <Card
      title="Enforcement lessons for us"
      right={
        cro ? (
          <button type="button" disabled={done} onClick={() => dispatch({ type: "ACCEPT", draftId: "d-t232-readacross" })} className={btn}>
            {done ? "Read-across recorded" : "Record read-across"}
          </button>
        ) : null
      }
    >
      {ENFORCEMENT_LESSONS.map((l) => {
        const p = getPrecedent(l.id)!;
        const m = METRICS.find((x) => x.unitId === l.unitId)!;
        const tone = toneOf(rowState(m));
        return (
          <Opener key={l.id} drawer={`lesson:${l.id}`} label={p.respondent} className="rounded-r hover:bg-slate-50">
            <span className={`block border-l-[3px] py-1.5 pl-3 pr-1 ${TONE[tone].rail}`}>
              <span className="flex items-center justify-between gap-2 text-[13px]">
                <b className="text-slate-900">{p.respondent}</b>
                <Tag tone={tone}>Touches {l.touches.toLowerCase()}</Tag>
              </span>
              <span className="block text-xs text-slate-600">{l.what} · settled, no admission</span>
            </span>
          </Opener>
        );
      })}
    </Card>
  );
}

/* ── Accountability sections ─────────────────────────────────────────── */

function useOwners() {
  return owners(Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole])));
}

function Owners({ onPick, picked }: { onPick?: (role: string) => void; picked?: string }) {
  const { state } = useStore();
  const { open } = useDrawer();
  const list = useOwners();
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {list.map((o) => {
        const openN = o.draftIds.filter((id) => state.session.drafts[id]?.status === "ai_draft").length;
        const tone: Tone = o.state;
        return (
          <button
            key={o.role}
            type="button"
            aria-pressed={picked === o.role}
            onClick={(e) => (onPick ? onPick(o.role) : open(`owner:${o.role}`, e.currentTarget))}
            className={`flex min-h-[104px] flex-col justify-between gap-1 rounded-xl border-[1.5px] bg-white px-3 py-2.5 text-left shadow-sm hover:shadow-md ${focus} ${TONE[tone].border} ${picked === o.role ? "ring-2 ring-indigo-500" : ""}`}
          >
            <span className="w-fit whitespace-nowrap rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">{o.role}</span>
            <span className="flex items-center justify-between gap-2">
              <span className={`text-2xl font-bold tabular-nums ${tone === "green" ? "text-slate-900" : TONE[tone].text}`}>
                {o.offTrack} <span className="text-xs font-normal text-slate-500">of {o.measures.length} off track</span>
              </span>
              <Pill tone={tone} label={tone === "grey" ? "Unconfirmed" : tone === "green" ? "On track" : tone === "red" ? "Red" : "Amber"} />
            </span>
            <span className="text-[11px] leading-snug text-slate-500">
              {o.lastSignOff === "Unconfirmed" ? "Sign-off unconfirmed" : `Signed off ${o.lastSignOff.replace(/ (\w{3})\w* 2026/, " $1")}`} · {openN} {openN === 1 ? "action" : "actions"} open
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OwnerDrill({ role }: { role: string }) {
  const { state, dispatch } = useStore();
  const o = useOwners().find((x) => x.role === role)!;
  const done = state.session.notes.some((n) => n.from === `Reasonable steps · ${role}`);
  return (
    <Card
      title={`${role}: items`}
      right={
        <button type="button" disabled={done} onClick={() => dispatch({ type: "SAVE_NOTE", text: `Reasonable steps reviewed for ${role}`, from: `Reasonable steps · ${role}` })} className={btnPrimary}>
          {done ? "Reasonable steps recorded" : "Record reasonable steps"}
        </button>
      }
    >
      {o.measures.map((m) => (
        <Row key={m.unitId} tone={toneOf(rowState(m))} text={m.name} detail={`${m.value} ${m.denominator}`} drawer={`metric:${m.unitId}`} right={measurePill(m)} />
      ))}
      <Row tone="grey" text={`${o.draftIds.filter((id) => state.session.drafts[id]?.status === "ai_draft").length} open actions routed here`} detail={`last sign-off ${o.lastSignOff}`} />
    </Card>
  );
}

function BadNews() {
  const { state } = useStore();
  return (
    <Card title={state.persona === "chair" ? "Escalation" : "Is bad news reaching us?"}>
      <Opener drawer="badnews" label="Is bad news reaching us?" className="rounded">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat label="To committee" value="4.6 months" sub="median of 23 serious issues" tone="amber" />
          <Stat label="Not escalated" value="3" sub="issues after 12 months" tone="amber" />
          <Stat label="Checks overdue" value="26,900" sub="vs 10,000 target" tone="red" />
          <Stat label="Closed, no effect" value="42" sub="actions; 2 downgraded" tone="red" />
        </div>
        {state.persona !== "cro" ? (
          <div className="mt-2.5 space-y-1">
            <Label>Months without escalation</Label>
            {KRI_DETAIL.latency.unescalated.map((u) => (
              <div key={u.unit} className="flex items-center gap-2 text-xs">
                <span className="w-36 shrink-0 text-slate-600">{u.unit}</span>
                <span className="h-1.5 rounded-full bg-amber-400" style={{ width: `${(u.months / 14) * 55}%` }} />
                <b className="tabular-nums">{u.months} months</b>
              </div>
            ))}
          </div>
        ) : null}
      </Opener>
    </Card>
  );
}

function SignOff() {
  const b = signOffBuckets();
  return (
    <Card title="Sign-off status">
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-200">
        {[
          ["Signed off", b.signed.length, "green"],
          ["Due", b.due.length, "amber"],
          ["Unconfirmed", b.unconfirmed.length, "grey"],
        ].map(([l, n, tone]) => (
          <div key={l as string} className="px-3 py-2">
            <p className={`text-2xl font-bold tabular-nums ${tone === "green" ? "text-emerald-600" : TONE[tone as Tone].text}`}>{n as number}</p>
            <p className="text-xs text-slate-500">{l as string} of 12</p>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Row tone="grey" text="Monitoring coverage" detail="signed off 3 hours early" drawer="metric:u-tm" right={<Pill tone="grey" label="Unconfirmed" />} />
      </div>
    </Card>
  );
}

function Removed() {
  const { state, dispatch } = useStore();
  const chair = state.persona === "chair";
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  const restored = latest.itemIds.includes("pi-vuln");
  const asked = state.session.notes.some((n) => n.from === "Chair request");
  return (
    <Card
      title={state.persona === "board" ? "What was removed or downgraded?" : "Pack integrity"}
      right={
        chair ? (
          <button type="button" disabled={asked || restored} onClick={() => dispatch({ type: "SAVE_NOTE", text: "Restore vulnerable-customer exceptions to the 15 Dec agenda", from: "Chair request" })} className={btnPrimary}>
            {asked ? "Restore requested" : restored ? "Restored" : "Restore to agenda"}
          </button>
        ) : null
      }
    >
      <Row tone={restored ? "amber" : "red"} text="Vulnerable-customer exceptions" detail="removed at Executive Risk Committee 14 Oct, no reason recorded" drawer="removed" right={<Pill tone={restored ? "amber" : "red"} label={restored ? "Restored · draft" : "Removed"} />} />
      <Row tone="amber" text="2 issues downgraded high → medium" detail="linked measure unchanged" drawer="badnews" right={<Pill tone="amber" label="Downgraded" />} />
      {state.persona === "board" ? <Row tone="amber" text="Customer-check backlog deadline extended 3 times" detail="limit 2" drawer="badnews" right={<Pill tone="amber" label="Extended" />} /> : null}
      {state.persona === "board" ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <AiTag label="Board Pack agent" /> flagged the removal on 15 Oct
        </p>
      ) : null}
    </Card>
  );
}

/* ── Agent sections ──────────────────────────────────────────────────── */

const statusTone = { running: "green", waiting: "amber", paused: "grey" } as const;
const statusWord = { running: "Running", waiting: "Waiting", paused: "Paused" } as const;

function AgentSummary() {
  const { state } = useStore();
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border-[1.5px] border-violet-200 bg-violet-50 px-4 py-2.5">
      <AiTag label="AI agents" />
      {[
        [String(AGENTS.length), "agents"],
        [String(totalChecks()), "checks this week"],
        ...(state.persona === "board" ? [[String(FINDINGS.length), "findings this quarter"]] : []),
        [String(waiting), "drafts waiting for a person"],
        ["0", "actions without approval"],
      ].map(([v, l]) => (
        <span key={l} className="text-[13px] text-slate-700">
          <b className="text-xl font-bold tabular-nums text-violet-800">{v}</b> {l}
        </span>
      ))}
    </div>
  );
}

function AgentRoster() {
  const { state } = useStore();
  if (state.persona === "board") {
    return (
      <Card title="Agent roster">
        {AGENTS.map((a) => (
          <Row key={a.id} tone={statusTone[a.status]} text={a.name} detail={`${a.finding} · ${a.accountable}`} drawer={`agent:${a.id}`} right={<Pill tone={statusTone[a.status]} label={statusWord[a.status]} />} />
        ))}
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
      {AGENTS.map((a) => (
        <Opener key={a.id} drawer={`agent:${a.id}`} label={a.name} className="rounded-xl">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-violet-500" aria-label="AI agent" />
                {a.name}
              </p>
              <Pill tone={statusTone[a.status]} label={statusWord[a.status]} />
            </div>
            <p className="mt-1 truncate text-xs text-slate-800">{a.finding}</p>
            <p className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>{a.accountable}</span>
              <span className="rounded bg-violet-100 px-1.5 font-semibold text-violet-800">{AUTONOMY_LABEL[state.session.autonomy[a.id]]}</span>
            </p>
          </div>
        </Opener>
      ))}
    </div>
  );
}

function Approvals() {
  const { state } = useStore();
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft");
  return (
    <Card title="Waiting for the CRO">
      {waiting.length ? waiting.map((q) => <Row key={q.draftId} tone="amber" text={q.title} detail={agentName(q.agentId)} />) : <p className="text-xs text-slate-500">Nothing waiting.</p>}
    </Card>
  );
}

function AgentControls() {
  const { state, dispatch } = useStore();
  const chair = state.persona === "chair";
  return (
    <Card title="Agent autonomy" right={chair ? undefined : <span className="text-[11px] text-slate-500">Set by the Risk Committee</span>}>
      {AGENTS.map((a) => (
        <div key={a.id} className="flex h-9 items-center justify-between gap-2 border-b border-slate-100 text-xs last:border-b-0">
          <span className="truncate text-slate-700">{a.name}</span>
          {chair ? (
            <select
              aria-label={`${a.name} autonomy`}
              value={state.session.autonomy[a.id]}
              onChange={(e) => dispatch({ type: "SET_AUTONOMY", agentId: a.id, level: e.target.value as Autonomy })}
              className={`rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700 ${focus}`}
            >
              {AUTONOMY_ORDER.map((lv) => (
                <option key={lv} value={lv}>
                  {AUTONOMY_LABEL[lv]}
                </option>
              ))}
              <option value="act" disabled>
                Act (locked)
              </option>
            </select>
          ) : (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-800">{AUTONOMY_LABEL[state.session.autonomy[a.id]]}</span>
          )}
        </div>
      ))}
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
        <Lock className="h-3 w-3" aria-hidden /> Act: locked by policy{chair ? " · changes go to committee" : ""}
      </p>
    </Card>
  );
}

function Guardrails() {
  return (
    <Card title="Rules agents cannot break">
      {FIXED_RULES.map((r) => (
        <p key={r} className="flex h-8 items-center gap-1.5 text-xs text-slate-700">
          <Lock className="h-3 w-3 text-slate-400" aria-hidden />
          {r}
        </p>
      ))}
      <p className="mt-1 text-[11px] text-slate-500">
        Model risk review {MODEL_OVERSIGHT.lastReview} · {MODEL_OVERSIGHT.pastValidation}
      </p>
    </Card>
  );
}

function Tuning() {
  const { state, dispatch } = useStore();
  const [dial, setDial] = useState(TUNING.recommended);
  return (
    <Card title="Tuning lab: savings-pot check" right={<AiTag label="AI agent test" />}>
      <p className="text-xs text-slate-600">
        {TUNING.proposal} · {TUNING.test} · bars: caught of 97, extra alerts of 39,000
      </p>
      <div className="mt-2 grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        {TUNING.options.map((o) => {
          const tone: Tone = o.id === "C" ? "red" : o.id === "B" ? "green" : "amber";
          return (
            <button key={o.id} type="button" aria-pressed={dial === o.id} onClick={() => setDial(o.id)} className={`rounded-lg border-[1.5px] px-3 py-2 text-left ${focus} ${TONE[tone].bg} ${TONE[tone].border} ${dial === o.id ? "ring-2 ring-indigo-500" : ""}`}>
              <span className="flex items-center justify-between text-[13px] font-bold text-slate-900">
                {o.id} · {o.label}{o.dial !== o.label ? ` (${o.dial})` : ""}{o.view === "Recommended" ? <AiTag label="Recommended" /> : <span className="text-[11px] font-normal text-slate-500">{o.view}</span>}
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs">
                <span className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(o.caught / TUNING.breaches) * 60}%`, minWidth: 2 }} />
                <b className="tabular-nums">{o.caught} of 97</b>
              </span>
              <span className="flex items-center gap-2 text-xs">
                <span className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(o.extraAlerts / 2100) * 60}%`, minWidth: 2 }} />
                <b className="tabular-nums">
                  +{o.extraAlerts.toLocaleString("en-GB")} ({((o.extraAlerts / TUNING.alertsPerMonth) * 100).toFixed(1)}%)
                </b>
              </span>
              <span className="block text-[11px] text-slate-600">{o.capacity}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">Nothing goes live without model-risk review and a named approver.</p>
        {state.session.tuningProposal ? (
          <p className="text-xs font-semibold">Option {state.session.tuningProposal} proposed to the Risk Committee</p>
        ) : (
          <button type="button" onClick={() => dispatch({ type: "PROPOSE_TUNING", optionId: dial })} className={btnPrimary}>
            Propose option {dial}
          </button>
        )}
      </div>
    </Card>
  );
}

function AgentActivity() {
  return (
    <Card title="Agent activity this week">
      {ACTIVITY.map((e, i) => (
        <span key={i} className="flex h-8 items-center gap-3 border-b border-slate-100 text-xs last:border-b-0" title={agentName(e.agentId)}>
          <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{e.type}</span>
          <span className="w-20 shrink-0 text-[11px] text-slate-500">{e.date.replace(" 2026", "")}</span>
          <span className="truncate text-slate-800">{e.line}</span>
        </span>
      ))}
    </Card>
  );
}

/* ── New sections: work queue, deadlines, pack builder, committee header ── */

type QueueRow = { type: "Approve" | "Prepare" | "Send case" | "Chase"; item: string; due: string; rank: number; owner: string; action: ReactNode };

function WorkQueue() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const ownersList = useOwners();
  const rows: QueueRow[] = [];
  for (const r of ROUTES) {
    if (r.caseDraftId && state.session.drafts[r.caseDraftId]?.status === "ai_draft") {
      const id = r.caseDraftId;
      rows.push({
        type: "Send case",
        item: `${r.eventId === "e-117" ? "Mortgage rate error" : EVENT_PLAIN[r.eventId]}: ${ROUTE_PLAIN[r.routeId]}`,
        due: r.clockHours === 24 ? "Immediate" : "Reporting period",
        rank: r.clockHours === 24 ? 0 : 6,
        owner: "Head of Compliance",
        action: (
          <button
            type="button"
            className={btn}
            onClick={() => {
              dispatch({ type: "ACCEPT", draftId: id });
              dispatch({ type: "SEND", draftId: id });
            }}
          >
            Send case
          </button>
        ),
      });
    }
  }
  rows.push({ type: "Prepare", item: "Decision 1 paper: restore or pace", due: "8 Dec", rank: 2, owner: "Board", action: <button type="button" className={btn} onClick={(e) => open("decision:1", e.currentTarget)}>Prepare</button> });
  rows.push({ type: "Prepare", item: "Decision 3 paper: dropped pack item", due: "15 Dec", rank: 4, owner: "Risk Committee Chair", action: <button type="button" className={btn} onClick={(e) => open("decision:3", e.currentTarget)}>Prepare</button> });
  rows.push({ type: "Prepare", item: "Restriction sign-off evidence", due: "8 Nov", rank: 1, owner: "Head of Financial Crime", action: <button type="button" className={btn} onClick={(e) => open("decision:2", e.currentTarget)}>Prepare</button> });
  for (const q of QUEUE) {
    if (state.session.drafts[q.draftId]?.status !== "ai_draft") continue;
    rows.push({
      type: "Approve",
      item: q.title,
      due: "Before 15 Dec",
      rank: 3,
      owner: agentName(q.agentId),
      action: (
        <span className="flex gap-1">
          <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "ACCEPT", draftId: q.draftId })}>
            Approve
          </button>
          <button type="button" className={btn} onClick={(e) => open(`queue:${q.draftId}`, e.currentTarget)}>
            Edit
          </button>
          <button type="button" className={btn} onClick={() => dispatch({ type: "REJECT", draftId: q.draftId, reason: "Not supported by the evidence" })}>
            Reject
          </button>
        </span>
      ),
    });
  }
  for (const o of ownersList) {
    const n = o.draftIds.filter((id) => state.session.drafts[id]?.status === "ai_draft").length;
    if (!n) continue;
    rows.push({ type: "Chase", item: `${n} ${n === 1 ? "action" : "actions"} open`, due: "Before 15 Dec", rank: 5, owner: o.role, action: <button type="button" className={btn} onClick={(e) => open(`owner:${o.role}`, e.currentTarget)}>Send to owner</button> });
  }
  rows.sort((a, b) => a.rank - b.rank);
  const typeTone = { Approve: "amber", Prepare: "grey", "Send case": "red", Chase: "grey" } as const;
  return (
    <Card title={`Work queue (${rows.length})`}>
      <div className="grid grid-cols-[84px_minmax(0,1.6fr)_96px_minmax(0,1fr)_212px] gap-3 px-2 pb-1">
        <Label>Type</Label>
        <Label>Item</Label>
        <Label>Due</Label>
        <Label>Owner</Label>
        <span className="justify-self-end">
          <Label>Action</Label>
        </span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid min-h-11 grid-cols-[84px_minmax(0,1.6fr)_96px_minmax(0,1fr)_212px] items-center gap-3 border-t border-slate-100 px-2 py-1 text-xs leading-snug">
          <Tag tone={typeTone[r.type]}>{r.type}</Tag>
          <span className="text-[13px] text-slate-900">{r.item}</span>
          <span className={`font-semibold ${r.due === "Immediate" ? "text-red-600" : "text-slate-600"}`}>{r.due}</span>
          <span className="text-slate-500">{r.owner}</span>
          <span className="justify-self-end">{r.action}</span>
        </div>
      ))}
    </Card>
  );
}

export function queueCount(state: ReturnType<typeof useStore>["state"]) {
  const s = state.session.drafts;
  const cases = ROUTES.filter((r) => r.caseDraftId && s[r.caseDraftId]?.status === "ai_draft").length;
  const approvals = QUEUE.filter((q) => s[q.draftId]?.status === "ai_draft").length;
  const chases = owners(Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]))).filter((o) => o.draftIds.some((id) => s[id]?.status === "ai_draft")).length;
  return cases + approvals + 3 + chases;
}

function Deadlines() {
  return (
    <Card title="Deadlines">
      {[
        ["8 Nov 2026", "Restriction sign-off", "red"],
        ["8 Dec 2026", "Savings campaign starts", "amber"],
        ["15 Dec 2026", "Board Risk Committee", "amber"],
        ["18 Mar 2027", "New incident-reporting rules", "grey"],
      ].map(([d, t, tone]) => (
        <span key={d} className={`flex h-10 items-center gap-3 border-l-[3px] pl-3 text-[13px] ${TONE[tone as Tone].rail}`}>
          <span className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-indigo-700">{d}</span>
          <span className="text-slate-800">{t}</span>
        </span>
      ))}
    </Card>
  );
}

function PackBuilder() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  const restore = state.session.drafts["d-t235-restore"];
  const ordered = [...PACK_ITEMS].sort((a, b) => Number(!!b.removal) - Number(!!a.removal));
  return (
    <Card title={`Board pack · ${latest.itemIds.length} of ${PACK_ITEMS.length} qualifying items · v${latest.version} ${latest.state}`}>
      <div className="max-h-[264px] overflow-y-auto">
        {ordered.map((i) => {
          const inPack = latest.itemIds.includes(i.itemId);
          return (
            <Row
              key={i.itemId}
              tone={inPack ? "green" : "red"}
              text={i.label}
              detail={i.removal ? (inPack ? "restored in draft" : "removed, no reason") : undefined}
              right={
                !inPack && restore.status === "ai_draft" ? (
                  <button type="button" className={btnPrimary} onClick={() => dispatch({ type: "ACCEPT", draftId: "d-t235-restore" })}>
                    Propose restore
                  </button>
                ) : inPack ? (
                  <Check className="h-4 w-4 text-emerald-600" aria-label="In pack" />
                ) : (
                  <Pill tone="red" label="Removed" />
                )
              }
            />
          );
        })}
      </div>
      <p className="mb-0.5 mt-2.5">
        <Label>Decision papers</Label>
      </p>
      {DECISIONS.map((d) => (
        <Row
          key={d.n}
          tone={d.tone}
          text={`${d.n}. ${d.title}`}
          right={
            <button type="button" className={btn} onClick={(e) => open(`decision:${d.n}`, e.currentTarget)}>
              Prepare paper
            </button>
          }
        />
      ))}
    </Card>
  );
}

function CommitteeHeader() {
  const { state } = useStore();
  const latest = state.session.manifestVersions[state.session.manifestVersions.length - 1];
  const removed = PACK_ITEMS.length - latest.itemIds.length;
  const decided = ROUTES.filter((r) => r.status === "decided").length;
  const chips: [string, Tone][] = [
    ["15 Dec", "amber"],
    [`${PACK_ITEMS.length} items qualify`, "grey"],
    [`${latest.itemIds.length} in pack`, "green"],
    [`${removed} removed with no reason`, removed ? "red" : "green"],
    ["1 decision is yours", "amber"],
    [`${EVENTS.length} reporting events · ${decided} of ${ROUTES.length} routes decided`, "grey"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-[1.5px] border-indigo-200 bg-indigo-50 px-4 py-2.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-700">Board Risk Committee</span>
      {chips.map(([l, tone]) => (
        <Tag key={l} tone={tone}>
          {l}
        </Tag>
      ))}
    </div>
  );
}

/* ── Registry ────────────────────────────────────────────────────────── */

export function renderSection(id: SectionId, ctx: { ownerPick: string; setOwnerPick: (r: string) => void; drill: boolean }): ReactNode {
  switch (id) {
    case "POSTURE":
      return <Posture />;
    case "BUSINESS_LINES":
      return <BusinessLines />;
    case "DECIDE_LIST":
      return <DecideList />;
    case "CHANGED":
      return <ChangeList kind="changed" />;
    case "UNCHANGED":
      return <ChangeList kind="unchanged" />;
    case "AGENT_STRIP":
      return <AgentStrip />;
    case "APPETITE_SUMMARY":
      return <AppetiteSummary />;
    case "MEASURES":
      return <Measures />;
    case "GROWTH_CAPACITY":
      return <GrowthCapacity />;
    case "TRADEOFFS":
      return <Tradeoffs />;
    case "DECISION_CARDS":
      return <DecisionCards />;
    case "DECISION_HISTORY":
      return <DecisionHistory />;
    case "CLOCKS":
      return <Clocks />;
    case "HORIZON":
      return <Horizon />;
    case "RESTRICTION":
      return <Restriction />;
    case "ENFORCEMENT":
      return <Enforcement />;
    case "OWNERS":
      return <Owners onPick={ctx.drill ? ctx.setOwnerPick : undefined} picked={ctx.drill ? ctx.ownerPick : undefined} />;
    case "OWNER_DRILL":
      return <OwnerDrill role={ctx.ownerPick} />;
    case "BAD_NEWS":
      return <BadNews />;
    case "SIGNOFF":
      return <SignOff />;
    case "REMOVED":
      return <Removed />;
    case "AGENT_SUMMARY":
      return <AgentSummary />;
    case "AGENT_ROSTER":
      return <AgentRoster />;
    case "APPROVALS":
      return <Approvals />;
    case "AGENT_CONTROLS":
      return <AgentControls />;
    case "GUARDRAILS":
      return <Guardrails />;
    case "TUNING":
      return <Tuning />;
    case "AGENT_ACTIVITY":
      return <AgentActivity />;
    case "WORK_QUEUE":
      return <WorkQueue />;
    case "DEADLINES":
      return <Deadlines />;
    case "PACK_BUILDER":
      return <PackBuilder />;
    case "COMMITTEE_HEADER":
      return <CommitteeHeader />;
    default:
      return renderBoardMemberSection(id);
  }
}
