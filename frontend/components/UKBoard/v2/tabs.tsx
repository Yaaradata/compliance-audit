"use client";

/**
 * UK Board v2 — the six board tabs. Each tab answers one board question with its own cards;
 * no card repeats across tabs. Overview cards link to their tab. Every row and card opens
 * the detail drawer. Figures come from the data module; agent figures from agentsData.ts.
 */
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Lock, Sparkles } from "lucide-react";
import { CAPACITY, DRAFTS, EVENTS, HORIZON, KRI_DETAIL, PEOPLE, RESTRICTION, ROUTES } from "@/lib/ukboard/v1/data";
import { getPrecedent } from "@/lib/ukboard/v1/precedents";
import { headlineCounts, METRICS, rowState, type MetricMeta } from "@/lib/ukboard/v2/board";
import {
  CHANGES,
  DECISION_HISTORY,
  ENFORCEMENT_LESSONS,
  EVENT_PLAIN,
  FRANCHISES,
  greensCount,
  GROWTH_TIER_LABEL,
  indicatorWord,
  measuresByTier,
  owners,
  postureLine2,
  postureWord,
  RESTRICTION_ROUTES,
  ROUTE_PLAIN,
  routesFor,
  signOffBuckets,
  UNCHANGED,
  type TabId,
} from "@/lib/ukboard/v2/boardTabs";
import { ACTIVITY, AGENTS, agentName, AUTONOMY_LABEL, AUTONOMY_ORDER, FIXED_RULES, MODEL_OVERSIGHT, QUEUE, totalChecks, TUNING } from "@/lib/ukboard/v2/agentsData";
import AppetiteDial from "./AppetiteDial";
import LineChart from "./LineChart";
import { useDrawer } from "./drawerContext";
import { useStore } from "./store";
import { AiTag, btn, btnPrimary, ChangeRow, focus, Label, Opener, Panel, PathToGreen, Pill, RuleTag, Sparkline, TONE, toneOf, type Tone } from "./ui";

const VERDICT_WORD = { room_to_grow: "Room to grow", hold: "Hold", fix_first: "Fix first", unverified: "Unconfirmed" } as const;
const STATE_WORD = { red: "Red", amber: "Amber", unverified: "Unconfirmed", within_appetite: "Within", not_assessed: "Not measured" } as const;

function useGo() {
  const { dispatch } = useStore();
  return (tab: TabId) => {
    dispatch({ type: "SET_TAB", tab });
    window.scrollTo({ top: 0 });
  };
}

function Big({ value, tone }: { value: string; tone?: Tone }) {
  return <p className={`text-[28px] font-extrabold leading-tight tracking-tight tabular-nums ${tone && tone !== "green" ? TONE[tone].text : "text-slate-900"}`}>{value}</p>;
}

function StatusCard({ tone, children, className = "" }: { tone: Tone; children: ReactNode; className?: string }) {
  return <div className={`flex h-full flex-col rounded-[10px] border-[1.5px] px-3.5 py-3 ${TONE[tone].bg} ${TONE[tone].border} ${className}`}>{children}</div>;
}

const measurePill = (m: MetricMeta) => {
  const s = rowState(m);
  if (s === "projected") return <Pill tone="amber" outline label={m.projectionText === "amber in about 9 weeks" ? "Amber ~9 weeks" : "Amber next quarter"} />;
  return <Pill tone={toneOf(s)} label={STATE_WORD[s]} />;
};

/* ════════════════ OVERVIEW ════════════════ */

export function OverviewTab() {
  const go = useGo();
  const { state } = useStore();
  const word = postureWord();
  const t: Tone = word === "RED" ? "red" : word === "AMBER" ? "amber" : "green";
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length;
  const flagged = ACTIVITY.filter((a) => a.type === "FLAG").length;
  return (
    <div className="space-y-5">
      <div className={`rounded-xl border-[1.5px] p-5 ${TONE[t].bg} ${TONE[t].border}`}>
        <div className="mb-2 flex items-center gap-3">
          <span className={`h-3.5 w-3.5 rounded-full ${TONE[t].dot}`} />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${TONE[t].text}`}>Board risk posture</span>
          <span className={`text-2xl font-extrabold tracking-tight ${TONE[t].text}`}>{word}</span>
        </div>
        <p className="text-sm text-slate-700">Growing within appetite in mortgages. Savings growth is outrunning financial-crime capacity.</p>
        <p className="mt-1.5 text-[13px] font-semibold text-slate-600">{postureLine2()}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:col-span-8">
          {FRANCHISES.map((f) => {
            const tone = toneOf(f.verdict);
            return (
              <button key={f.id} type="button" onClick={() => go("growth")} className={`text-left ${focus} rounded-[10px]`}>
                <StatusCard tone={tone} className="hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold text-slate-900">{f.name}</span>
                    <Pill tone={tone} label={VERDICT_WORD[f.verdict]} />
                  </div>
                  <Big value={f.big} tone={tone} />
                  <p className="text-[12px] leading-snug text-slate-600">{f.line}</p>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <span className={`text-[12px] font-semibold tabular-nums ${f.trendWorse ? "text-red-600" : "text-slate-500"}`}>{f.trend === "—" ? "—" : `${/(^|\s)[−-]\d/.test(f.trend) ? "↘" : "↗"} ${f.trend}`}</span>
                    {f.spark ? <Sparkline values={f.spark} tone={tone} /> : null}
                  </div>
                  {f.verdict === "fix_first" || f.verdict === "hold" ? <PathToGreen draftIds={f.pathDrafts} from={f.verdict === "fix_first" ? "RED" : "AMBER"} /> : null}
                </StatusCard>
              </button>
            );
          })}
        </div>
        <Panel title="For your decision" className="xl:col-span-4">
          <div className="flex flex-col gap-2.5">
            {[
              { t: "Savings growth vs crime-check capacity", m: "Queue 19 days", s: "amber 14", tone: "amber" as Tone },
              { t: "Restriction breach: report or not?", m: "112 of 9,400", s: "accounts checked", tone: "red" as Tone },
              { t: "Issue removed from the board pack", m: "3 quarters", s: "at amber, no reason recorded", tone: "amber" as Tone },
            ].map((d, i) => (
              <button key={d.t} type="button" onClick={() => go("decisions")} className={`relative overflow-hidden rounded-[10px] border border-slate-200 bg-white py-3 pl-4 pr-3 text-left hover:shadow-md ${focus}`}>
                <span className={`absolute inset-y-0 left-0 w-[3px] ${TONE[d.tone].dot}`} />
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-bold leading-tight text-slate-900">
                    {i + 1}. {d.t}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                </span>
                <span className="mt-1 block text-base font-extrabold tabular-nums text-slate-900">
                  {d.m} <span className="text-[11px] font-normal text-slate-500">{d.s}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="What changed since last board">
          <div className="flex flex-col gap-2.5">
            {CHANGES.map((c) => (
              <ChangeRow key={c.text} {...c} />
            ))}
          </div>
        </Panel>
        <Panel title="What has not changed">
          <div className="flex flex-col gap-2.5">
            {UNCHANGED.map((c) => (
              <ChangeRow key={c.text} {...c} />
            ))}
          </div>
        </Panel>
      </div>

      <button type="button" onClick={() => go("agents")} className={`flex w-full flex-wrap items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-left text-[13px] text-slate-700 hover:bg-violet-100 ${focus}`}>
        <AiTag label="AI agents this quarter" />
        <span>
          <b className="tabular-nums">{totalChecks()}</b> checks run · <b className="tabular-nums">{flagged}</b> items flagged · <b className="tabular-nums">{waiting}</b> drafts waiting for approval
        </span>
        <span className="ml-auto font-semibold text-indigo-700">AI Agents ›</span>
      </button>
    </div>
  );
}

/* ════════════════ GROWTH & APPETITE ════════════════ */

function MeasureRow({ m }: { m: MetricMeta }) {
  return (
    <Opener drawer={`metric:${m.unitId}`} label={`${m.name}: ${m.value} ${m.denominator}`} className="hover:bg-slate-50">
      <div className="grid h-12 grid-cols-[minmax(140px,1.3fr)_minmax(80px,0.8fr)_minmax(0,1.2fr)_70px_92px_minmax(0,1.2fr)_auto] items-center gap-3 border-b border-slate-100 px-3 text-[13px]">
        <span className="truncate font-semibold text-slate-900">{m.name}</span>
        <span>{m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} /> : <span className="text-slate-400">—</span>}</span>
        <span className="truncate tabular-nums">
          <b className="text-slate-900">{m.value}</b> <span className="text-xs text-slate-500">{m.denominator}</span>
        </span>
        <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${m.delta?.worse ? "text-red-600" : "text-slate-400"}`}>
          {m.delta ? (
            <>
              {m.delta.text.startsWith("+") ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />}
              {m.delta.text.replace(/^[+−-]/, "")}
            </>
          ) : (
            "—"
          )}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-center text-[10px] font-semibold ${m.indicatorType === "leading" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{indicatorWord(m)}</span>
        <span className="truncate text-xs text-slate-500">{m.owner}</span>
        <span className="justify-self-end">{measurePill(m)}</span>
      </div>
    </Opener>
  );
}

export function GrowthTab() {
  const [greens, setGreens] = useState(false);
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const c = headlineCounts();
  const heading = METRICS.filter((m) => rowState(m) === "projected").length;
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  const proposed = state.session.notes.some((n) => n.from === "Trade-off proposal");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Within appetite", v: c.within_appetite, s: `${heading} heading for amber`, tone: "green" as Tone },
          { l: "Amber", v: c.amber, s: "past the trigger", tone: "amber" as Tone },
          { l: "Red", v: c.red, s: "past appetite", tone: "red" as Tone },
          { l: "Unconfirmed", v: c.unverified, s: "data not yet confirmed", tone: "grey" as Tone },
        ].map((x) => (
          <StatusCard key={x.l} tone={x.tone}>
            <Label>{x.l}</Label>
            <Big value={`${x.v} of ${METRICS.length}`} tone={x.tone} />
            <span className="text-xs text-slate-600">{x.s}</span>
          </StatusCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 min-[1400px]:grid-cols-12">
        <Panel title="Board measures" className="min-[1400px]:col-span-8">
          {measuresByTier(false).map((g) => (
            <div key={g.tier}>
              <p className="px-3 pb-1 pt-2">
                <Label>{GROWTH_TIER_LABEL[g.tier]}</Label>
              </p>
              {g.rows.map((m) => (
                <MeasureRow key={m.unitId} m={m} />
              ))}
              {g.tier === "emerging" ? (
                <div className="flex h-12 items-center justify-between gap-3 border-b border-slate-100 px-3 text-[13px]">
                  <span>
                    <b className="text-slate-900">AI impersonation fraud</b> <span className="text-xs text-slate-500">not yet measured · Head of Financial Crime</span>
                  </span>
                  <button type="button" onClick={(e) => open("horizon", e.currentTarget)} className={btn}>
                    Propose a measure
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          <button type="button" aria-expanded={greens} onClick={() => setGreens(!greens)} className={`mt-1 flex h-10 w-full items-center gap-2 px-3 text-left text-[13px] text-slate-700 hover:bg-slate-50 ${focus}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {greensCount()} more within appetite <span className="font-semibold text-indigo-700">· {greens ? "hide" : "show"}</span>
          </button>
          {greens ? METRICS.filter((m) => rowState(m) === "within_appetite").map((m) => <MeasureRow key={m.unitId} m={m} />) : null}
        </Panel>

        <Panel title="Growth vs capacity" className="min-[1400px]:col-span-4">
          <LineChart
            title="Members index against qualified handlers index"
            height={180}
            series={[
              { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.membersM)[i] })) },
              { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.handlers)[i] })), dashed: true },
            ]}
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { l: "Per handler", v: "30,160", s: "was 25,000" },
              { l: "Within target", v: "81%", s: "31,600 of 39,000" },
              { l: "Queue", v: "19 days", s: "amber 14" },
            ].map((x) => (
              <div key={x.l} className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                <Label>{x.l}</Label>
                <p className="text-base font-bold tabular-nums text-slate-900">{x.v}</p>
                <p className="text-[10px] text-slate-500">{x.s}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Trade-offs the board has agreed"
        right={
          state.persona === "cro" ? (
            <button type="button" onClick={(e) => open("franchise:O2", e.currentTarget)} className={btn}>
              Propose re-decision
            </button>
          ) : state.persona === "board" ? (
            <button type="button" disabled={proposed} onClick={() => dispatch({ type: "SAVE_NOTE", text: "Propose adjusting the savings onboarding appetite (no live limit changes)", from: "Trade-off proposal" })} className={btn}>
              {proposed ? "Proposal noted" : "Adjust appetite (propose)"}
            </button>
          ) : null
        }
      >
        <p className="mb-2 text-xs text-slate-500">Savings growth against customer checks · agreed 14 Apr 2026 · review 27 days overdue</p>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-4">
          {[
            { l: "Onboarding uplift", v: "+6.2 pts", s: "limit +5 pts", tone: "red" as Tone, p: "Broken" },
            { l: "High-risk acceptance", v: "1.1%", s: "limit 0.8%", tone: "red" as Tone, p: "Broken" },
            { l: "Onboarding fraud losses", v: "0.9 bp", s: "limit 1.5 bp", tone: "green" as Tone, p: "Within" },
            { l: "Checks before transacting", v: "Broken", s: "Not a trade-off: regulatory floor", tone: "red" as Tone, p: "Floor" },
          ].map((x) => (
            <StatusCard key={x.l} tone={x.tone}>
              <div className="flex items-start justify-between gap-2">
                <Label>{x.l}</Label>
                <Pill tone={x.tone} label={x.p} />
              </div>
              <p className={`mt-1 text-xl font-bold tabular-nums ${x.tone === "red" ? "text-red-600" : "text-slate-900"}`}>{x.v}</p>
              <p className="text-xs text-slate-600">{x.s}</p>
            </StatusCard>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ════════════════ BOARD DECISIONS ════════════════ */

const CHALLENGES: Record<number, string[]> = {
  1: ["What capacity do we need before the 8 December campaign?", "Why was no resourcing decision recorded since August?", "What would pacing growth cost us in members?"],
  2: ["When did we first know the savings pot was outside the block?", "Who decides each reporting route, and by when?", "Why are 24,000 openings still not checked?"],
  3: ["Who removed this item, and on what authority?", "Why has amber persisted for 3 quarters with no action?", "What stops another item being dropped silently?"],
};

function ChallengeBox({ n }: { n: number }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const saved = state.session.notes.filter((x) => x.from === `Decision ${n}`).map((x) => x.text);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className={btn}>
        Ask a challenge question
      </button>
      {open ? (
        <div className="mt-2 space-y-1.5 rounded-lg border border-violet-200 bg-violet-50 p-2.5">
          <AiTag label="AI agent drafted" />
          {CHALLENGES[n].map((q) => (
            <div key={q} className="flex items-start justify-between gap-2 text-xs text-slate-700">
              <span>{q}</span>
              <button type="button" disabled={saved.includes(q)} onClick={() => dispatch({ type: "SAVE_NOTE", text: q, from: `Decision ${n}` })} className={`shrink-0 text-[11px] font-semibold text-indigo-700 disabled:text-slate-400 ${focus} rounded`}>
                {saved.includes(q) ? "Saved" : "Save to notes"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DecisionCard({ n, title, tone, keyFig, keySub, support, why, recommend, decider, children }: { n: number; title: string; tone: Tone; keyFig: string; keySub: string; support: string; why: string; recommend: string; decider: string; children: ReactNode }) {
  const { open } = useDrawer();
  return (
    <div className={`flex h-full flex-col rounded-xl border-[1.5px] bg-white p-4 shadow-sm ${TONE[tone].border}`}>
      <button type="button" onClick={(e) => open(`decision:${n}`, e.currentTarget)} className={`text-left ${focus} rounded`}>
        <div className="flex items-start gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{n}</span>
          <span className="text-[15px] font-bold leading-tight text-slate-900">{title}</span>
        </div>
        <div className={`mt-3 rounded-lg px-3 py-2 ${TONE[tone].bg}`}>
          <p className={`text-[28px] font-extrabold leading-tight tabular-nums ${TONE[tone].text}`}>{keyFig}</p>
          <p className="text-xs text-slate-600">{keySub}</p>
        </div>
        <p className="mt-2 text-xs text-slate-600">{support}</p>
        <p className="mt-2 text-xs text-slate-800">
          <Label>Why now</Label> {why}
        </p>
      </button>
      <div className="mt-2 flex items-start gap-1.5 text-xs text-violet-800">
        <AiTag />
        <span>{recommend}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{decider}</p>
      <div className="mt-auto space-y-2 pt-3">{children}</div>
    </div>
  );
}

function Confirmable({ label, confirmText, onConfirm, done, primary }: { label: string; confirmText: string; onConfirm: () => void; done?: string; primary?: boolean }) {
  const [ask, setAsk] = useState(false);
  if (done) return <p className="text-xs font-semibold text-slate-900">{done}</p>;
  return ask ? (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs">
      <p className="text-slate-700">{confirmText}</p>
      <div className="mt-1.5 flex gap-2">
        <button type="button" onClick={onConfirm} className={btnPrimary}>
          Confirm
        </button>
        <button type="button" onClick={() => setAsk(false)} className={btn}>
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button type="button" onClick={() => setAsk(true)} className={primary ? btnPrimary : btn}>
      {label}
    </button>
  );
}

export function DecisionsTab() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const p = state.persona;
  const d1 = state.session.drafts["d-t25-choice"];
  const paper = state.session.drafts["d-t25-paper"];
  const chairD = state.session.drafts["d-t234-options"];
  const restore = state.session.drafts["d-t235-restore"];
  const [chairOpt, setChairOpt] = useState<string | null>(null);
  const casesSent = ROUTES.filter((r) => r.caseDraftId && state.session.drafts[r.caseDraftId]?.status === "sent_to_owner").length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <DecisionCard n={1} title="Savings growth vs crime checks" tone="amber" keyFig="19 days" keySub="alert queue age · amber 14" support="30,160 members per handler (was 25,000)" why="Next savings campaign starts in 6 weeks." recommend="Recommends restore capacity · queue past amber since August" decider="Board · before the 8 Dec campaign">
          {p === "board" ? <ChallengeBox n={1} /> : null}
          {p === "chair" ? <p className="text-xs text-slate-500">With CRO · proposal pending</p> : null}
          {p === "cro" ? (
            <>
              {d1.status !== "ai_draft" ? (
                <p className="text-xs font-semibold text-slate-900">Proposed: {DRAFTS["d-t25-choice"].options?.find((o) => o.id === d1.chosenOptionId)?.label} · decision pending</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {DRAFTS["d-t25-choice"].options!.map((o) => (
                    <Confirmable
                      key={o.id}
                      label={`Propose: ${o.id === "pace" ? "Pace growth" : o.label}`}
                      confirmText={`Propose "${o.label}" to the board? Recorded as proposed; the board decides.`}
                      onConfirm={() => dispatch({ type: "ACCEPT", draftId: "d-t25-choice", optionId: o.id })}
                    />
                  ))}
                </div>
              )}
              <Confirmable label="Prepare paper" confirmText="Prepare the resourcing paper for the Head of Financial Crime?" onConfirm={() => dispatch({ type: "ACCEPT", draftId: "d-t25-paper" })} done={paper.status !== "ai_draft" ? "Resourcing paper prepared" : undefined} />
            </>
          ) : null}
        </DecisionCard>

        <DecisionCard n={2} title="Restriction breach: report or not?" tone="red" keyFig="112 of 9,400" keySub="accounts checked · 24,000 not yet checked" support="104 customers, including 3 previously exited" why="FCA and PRA clocks are immediate." recommend="Prepared the case; it does not recommend an answer" decider="Head of Compliance decides · FCA and PRA: immediate">
          {p === "board" ? <ChallengeBox n={2} /> : null}
          {p === "chair" ? <p className="text-xs text-slate-500">With Head of Compliance · decision pending</p> : null}
          {p === "cro" ? (
            <button type="button" onClick={(e) => open("decision:2", e.currentTarget)} className={btnPrimary}>
              {casesSent ? `Prepared case · ${casesSent} sent` : "Prepare case for Head of Compliance"}
            </button>
          ) : null}
        </DecisionCard>

        <DecisionCard n={3} title="Issue removed from board pack" tone="amber" keyFig="3 quarters" keySub="vulnerable-customer exceptions at amber" support="Removed at Executive Risk Committee 14 Oct, no reason" why="It met a Risk Committee rule but left the pack." recommend="Recommends remediation with an owner · nothing recorded in 3 quarters" decider="Risk Committee Chair · 15 Dec">
          {p === "board" ? <ChallengeBox n={3} /> : null}
          {p === "chair" ? (
            chairD.status !== "ai_draft" ? (
              <p className="text-xs font-semibold text-slate-900">Recorded by {PEOPLE.chair.name}: {DRAFTS["d-t234-options"].options?.find((o) => o.id === chairD.chosenOptionId)?.label}</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Chair decision</legend>
                {DRAFTS["d-t234-options"].options!.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="radio" name="chair3" checked={chairOpt === o.id} onChange={() => setChairOpt(o.id)} />
                    {o.label}
                  </label>
                ))}
                <button type="button" disabled={!chairOpt} onClick={() => chairOpt && dispatch({ type: "CHAIR_RECORD", draftId: "d-t234-options", optionId: chairOpt })} className={`${btnPrimary} mt-2`}>
                  Record decision
                </button>
              </fieldset>
            )
          ) : null}
          {p === "cro" ? (
            <Confirmable label="Propose: restore to agenda" confirmText="Propose restoring the item to the board pack? A new draft pack version is created; the Chair decides." onConfirm={() => dispatch({ type: "ACCEPT", draftId: "d-t235-restore" })} done={restore.status !== "ai_draft" ? "Restored to the draft pack · awaiting approval" : undefined} />
          ) : null}
        </DecisionCard>
      </div>

      <Panel title="Decision history">
        <ol className="divide-y divide-slate-100">
          {DECISION_HISTORY.map((h) => (
            <li key={h.decision} className="flex items-start gap-3 py-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              <span className="w-24 shrink-0 text-[11px] text-slate-500">{h.date}</span>
              <span className="w-32 shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{h.forum}</span>
              <span className="flex-1 text-[13px] text-slate-800">{h.decision}</span>
              <Pill tone={h.tone} outline label={h.outcome} />
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

/* ════════════════ REGULATORY ════════════════ */

export function RegulatoryTab() {
  const { state } = useStore();
  const cro = state.persona === "cro";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Reporting clocks" className="xl:col-span-8">
          <div className="flex flex-col gap-3">
            {EVENTS.map((e) => {
              const rs = routesFor(e.eventId);
              const decided = rs.filter((r) => r.status === "decided").length;
              return (
                <Opener key={e.eventId} drawer={`event:${e.eventId}`} label={EVENT_PLAIN[e.eventId]} className="rounded-[10px]">
                  <div className={`rounded-[10px] border-[1.5px] ${decided ? TONE.amber.border : TONE.red.border}`}>
                    <div className={`flex flex-wrap items-baseline justify-between gap-2 rounded-t-[9px] px-3 py-2 ${decided ? TONE.amber.bg : TONE.red.bg}`}>
                      <span className="text-[13px] font-bold text-slate-900">{EVENT_PLAIN[e.eventId]}</span>
                      <span className="text-xs font-semibold text-slate-600">
                        Day {e.dayN} · {decided} of {rs.length} routes decided
                      </span>
                    </div>
                    {rs.map((r) => {
                      const hist = r.history[r.history.length - 1];
                      return (
                        <div key={r.routeId} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_auto] items-center gap-3 border-t border-slate-100 px-3 py-2 text-xs">
                          <span className="font-semibold text-slate-900">{ROUTE_PLAIN[r.routeId]}</span>
                          <span className="text-slate-600">{r.isSar ? "As soon as practicable" : r.clockHours === 24 ? (r.status === "decided" ? "Immediate" : "Immediate · 24-hour triage passed") : "Within the reporting period"}</span>
                          <span className="text-slate-600">{hist ? `${PEOPLE[hist.deciderPersonId].name}, Head of Compliance` : r.proposedDeciderRole}</span>
                          <Pill tone={r.status === "decided" ? "green" : r.isSar ? "grey" : "amber"} label={r.status === "decided" ? "Decided" : r.isSar ? (r.status === "not_engaged" ? "Closed" : "Open") : "Pending"} />
                        </div>
                      );
                    })}
                    {e.awarenessGap && cro ? <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-600">Earlier linked records {e.awarenessGap.gapDays} days before the logged date (CRO view)</p> : null}
                  </div>
                </Opener>
              );
            })}
          </div>
        </Panel>
        <Panel title="Horizon" className="xl:col-span-4">
          <Opener drawer="horizon" label="Horizon" className="rounded-[10px]">
            <div className="flex flex-col gap-2.5">
              {[
                { v: String(HORIZON.emergingRisks), s: "emerging risks in the register" },
                { v: String(HORIZON.withinTwelveMonths), s: "expected within 12 months" },
                { v: `${HORIZON.daysToIncidentRules} days`, s: `to new incident-reporting rules (18 Mar 2027)` },
                { v: "1", s: "in-horizon risk with no measure" },
              ].map((x) => (
                <div key={x.s} className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-white py-2 pl-4 pr-3">
                  <span className="absolute inset-y-0 left-0 w-[3px] bg-slate-300" />
                  <p className="text-base font-extrabold tabular-nums text-slate-900">{x.v}</p>
                  <p className="text-[11px] text-slate-500">{x.s}</p>
                </div>
              ))}
            </div>
          </Opener>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Restriction health">
          <Opener drawer="restriction" label="Restriction health" className="rounded-[10px]">
            <StatusCard tone="red">
              <div className="flex items-start justify-between">
                <Label>Accounts in breach</Label>
                <Pill tone="red" label="Breach" />
              </div>
              <Big value={`${RESTRICTION.breachesAccounts} of ${RESTRICTION.tested.toLocaleString("en-GB")}`} tone="red" />
              <p className="text-xs text-slate-600">104 customers, including 3 previously exited · 1 of 4 clauses not supported · sign-off due in 12 days (8 Nov)</p>
              <div className="mt-2 space-y-1">
                {RESTRICTION_ROUTES.map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    <span className="w-28 shrink-0 text-slate-600">{r.label}</span>
                    <span className="h-2 rounded-full bg-red-400" style={{ width: `${(r.accounts / 112) * 100}%` }} />
                    <b className="tabular-nums text-slate-900">{r.accounts}</b>
                  </div>
                ))}
              </div>
              <p className="mt-2 rounded-md border border-dashed border-red-300 bg-white px-2 py-1 text-xs text-slate-700">The block fired 1,208 times, but the full check found 112 breaches.</p>
            </StatusCard>
          </Opener>
        </Panel>
        <Panel title="Enforcement lessons for us">
          <div className="flex flex-col gap-2.5">
            {ENFORCEMENT_LESSONS.map((l) => {
              const pr = getPrecedent(l.id)!;
              const m = METRICS.find((x) => x.unitId === l.unitId)!;
              return (
                <Opener key={l.id} drawer={`lesson:${l.id}`} label={pr.respondent} className="rounded-[10px]">
                  <div className="rounded-[10px] border border-slate-200 bg-white p-3 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-bold text-slate-900">
                        {pr.respondent} <span className="text-[11px] font-normal text-slate-500">{pr.noticeDate ?? "date unconfirmed"} · Settled, no admission</span>
                      </span>
                      {measurePill(m)}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {l.what} → <b className="text-slate-800">{l.touches}</b>
                    </p>
                  </div>
                </Opener>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ════════════════ ACCOUNTABILITY ════════════════ */

export function AccountabilityTab() {
  const { state, dispatch } = useStore();
  const targets = Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole]));
  const list = owners(targets);
  const b = signOffBuckets();
  const chairNoted = state.session.notes.some((n) => n.from === "Chair request");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {list.map((o) => {
          const open = o.draftIds.filter((id) => state.session.drafts[id]?.status === "ai_draft").length;
          const tone: Tone = o.state;
          return (
            <Opener key={o.role} drawer={`owner:${o.role}`} label={o.role} className="rounded-xl">
              <div className={`flex h-full flex-col rounded-xl border-[1.5px] bg-white p-3.5 shadow-sm hover:shadow-md ${TONE[tone].border}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-800">{o.role}</span>
                  <Pill tone={tone} label={tone === "grey" ? "Unconfirmed" : tone === "green" ? "On track" : tone === "red" ? "Red" : "Amber"} />
                </div>
                <p className={`mt-2 text-[28px] font-extrabold tabular-nums ${tone === "green" ? "text-slate-900" : TONE[tone].text}`}>
                  {o.offTrack}
                  <span className="text-sm font-semibold text-slate-500"> of {o.measures.length} off track</span>
                </p>
                <p className="text-[11px] text-slate-500">Last sign-off {o.lastSignOff}</p>
                <p className="mt-auto pt-1 text-[11px] font-semibold text-slate-700">{open} outstanding {open === 1 ? "action" : "actions"}</p>
              </div>
            </Opener>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Is bad news reaching us?" className="xl:col-span-8">
          <Opener drawer="badnews" label="Is bad news reaching us?" className="rounded-[10px]">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {[
                { l: "Issue to Risk Committee", v: "4.6 months", s: "median of 23 serious issues", tone: "amber" as Tone },
                { l: "Not escalated", v: "3", s: "issues after 12 months", tone: "amber" as Tone },
                { l: "Customer checks overdue", v: "26,900", s: "against a 10,000 target", tone: "red" as Tone },
                { l: "Closed, no effect", v: "42", s: "actions; 2 issues downgraded", tone: "red" as Tone },
              ].map((x) => (
                <StatusCard key={x.l} tone={x.tone}>
                  <Label>{x.l}</Label>
                  <p className={`text-xl font-bold tabular-nums ${TONE[x.tone].text}`}>{x.v}</p>
                  <p className="text-[11px] text-slate-600">{x.s}</p>
                </StatusCard>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              <Label>Months without escalation</Label>
              {KRI_DETAIL.latency.unescalated.map((u) => (
                <div key={u.unit} className="flex items-center gap-2 text-xs">
                  <span className="w-40 shrink-0 text-slate-600">{u.unit}</span>
                  <span className="h-2 rounded-full bg-amber-400" style={{ width: `${(u.months / 14) * 60}%` }} />
                  <b className="tabular-nums text-slate-900">{u.months} months</b>
                </div>
              ))}
            </div>
          </Opener>
        </Panel>
        <Panel title="Sign-off status" className="xl:col-span-4">
          <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-200">
            {[
              { l: "Signed off", n: b.signed.length, tone: "green" as Tone },
              { l: "Due", n: b.due.length, tone: "amber" as Tone },
              { l: "Unconfirmed", n: b.unconfirmed.length, tone: "grey" as Tone },
            ].map((x) => (
              <div key={x.l} className="p-3">
                <span className={`inline-block h-3 w-3 rounded-full ${TONE[x.tone].dot}`} />
                <p className={`text-3xl font-bold tabular-nums ${x.tone === "green" ? "text-emerald-600" : TONE[x.tone].text}`}>{x.n}</p>
                <p className="text-xs text-slate-500">{x.l}</p>
              </div>
            ))}
          </div>
          <Opener drawer="metric:u-tm" label="Monitoring coverage sign-off" className="mt-3 rounded-lg">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-700">
              <Pill tone="grey" label="Unconfirmed" /> <span className="ml-1">Monitoring coverage signed off 3 hours before the data run finished</span>
            </div>
          </Opener>
        </Panel>
      </div>

      {state.persona === "chair" ? (
        <Panel title="Bad-news timeline">
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-5">
            {[
              { d: "Q1 2026", t: "Vulnerable-customer exceptions reach amber (14.2)", tone: "amber" as Tone },
              { d: "Q2 2026", t: "Still amber (15.8); nothing recorded", tone: "amber" as Tone },
              { d: "Q3 2026", t: "Still amber (16.9); qualifies for the pack", tone: "amber" as Tone },
              { d: "14 Oct 2026", t: "Removed at Executive Risk Committee, no reason", tone: "red" as Tone },
              { d: "15 Dec 2026", t: "Risk Committee meets", tone: "grey" as Tone },
            ].map((e) => (
              <li key={e.d} className={`rounded-r-lg border-l-[3px] bg-stone-50/80 px-3 py-2 ${TONE[e.tone].rail}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">{e.d}</p>
                <p className="text-xs text-slate-700">{e.t}</p>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      <Panel
        title="Items removed or downgraded"
        right={
          state.persona === "chair" ? (
            <button type="button" disabled={chairNoted} onClick={() => dispatch({ type: "SAVE_NOTE", text: "Restore vulnerable-customer exceptions to the December agenda", from: "Chair request" })} className={btnPrimary}>
              {chairNoted ? "Restore requested" : "Restore to agenda"}
            </button>
          ) : null
        }
      >
        <div className="flex flex-col gap-2.5">
          <ChangeRow text="Vulnerable-customer exceptions: removed at Executive Risk Committee on 14 Oct, no reason recorded" tag="Removed" tone="red" drawer="removed" standing="Amber 3 quarters" />
          {KRI_DETAIL.effectiveness.pairs.slice(1, 3).map((p) => (
            <ChangeRow key={p.action} text={`${p.action.replace(/^Issue I-\d+ /, "Issue ")}: ${p.metric.toLowerCase()}`} tag="Downgraded" tone="amber" drawer="badnews" />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ════════════════ AI AGENTS ════════════════ */

export function AgentsTab() {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const cro = state.persona === "cro";
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft");
  const [dial, setDial] = useState(TUNING.recommended);
  const statusTone = { running: "green", waiting: "amber", paused: "grey" } as const;
  const statusWord = { running: "Running", waiting: "Waiting", paused: "Paused" } as const;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border-[1.5px] border-violet-200 bg-violet-50 px-5 py-4">
        <AiTag label="AI agents" />
        {[
          [String(AGENTS.length), "agents"],
          [String(totalChecks()), "checks this week"],
          [String(waiting.length), "drafts waiting for a person"],
          ["0", "actions taken without approval"],
        ].map(([v, l]) => (
          <span key={l} className="text-sm text-slate-700">
            <b className="text-2xl font-extrabold tabular-nums text-violet-800">{v}</b> {l}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => (
          <Opener key={a.id} drawer={`agent:${a.id}`} label={a.name} className="rounded-xl">
            <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <Sparkles className="h-4 w-4 text-violet-500" aria-label="AI agent" />
                  {a.name}
                </p>
                <Pill tone={statusTone[a.status]} label={statusWord[a.status]} />
              </div>
              <p className="text-xs text-slate-600">{a.does}</p>
              <p className="mt-2 text-xs font-medium text-slate-800">{a.finding}</p>
              <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                <span>{a.accountable}</span>
                <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-800">{AUTONOMY_LABEL[state.session.autonomy[a.id]]}</span>
              </div>
            </div>
          </Opener>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel title="Waiting for a person" className="xl:col-span-8">
          {waiting.length ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {waiting.map((q) => (
                <div key={q.draftId} className="grid grid-cols-1 items-center gap-2 px-3 py-2.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_auto]">
                  <b className="text-[13px] text-slate-900" title={`From ${agentName(q.agentId)}`}>
                    {q.title}
                  </b>
                  <span className="text-xs text-slate-600">{q.reason}</span>
                  {cro ? (
                    <span className="flex gap-1.5">
                      <button type="button" onClick={() => dispatch({ type: "ACCEPT", draftId: q.draftId })} className={btnPrimary}>
                        Approve
                      </button>
                      <button type="button" onClick={(e) => open(`queue:${q.draftId}`, e.currentTarget)} className={btn}>
                        Edit
                      </button>
                      <button type="button" onClick={() => dispatch({ type: "REJECT", draftId: q.draftId, reason: "Not supported by the evidence" })} className={btn}>
                        Reject
                      </button>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">With CRO for approval</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nothing waiting. Every draft has a named decision.</p>
          )}
        </Panel>
        <Panel title="Board controls for agents" className="xl:col-span-4">
          <div className="space-y-1.5">
            {AGENTS.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-slate-700">{a.name}</span>
                <select
                  aria-label={`${a.name} autonomy`}
                  value={state.session.autonomy[a.id]}
                  onChange={(e) => dispatch({ type: "SET_AUTONOMY", agentId: a.id, level: e.target.value as (typeof AUTONOMY_ORDER)[number] })}
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
              </div>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Lock className="h-3 w-3" aria-hidden />
            Act: locked by policy
          </p>
          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
            {FIXED_RULES.map((r) => (
              <p key={r} className="flex items-center gap-1.5 text-xs text-slate-700">
                <Lock className="h-3 w-3 text-slate-400" aria-hidden />
                {r}
              </p>
            ))}
            <p className="pt-1 text-[11px] text-slate-500">
              Model risk review {MODEL_OVERSIGHT.lastReview} · {MODEL_OVERSIGHT.pastValidation}
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Tuning lab: savings-pot check" right={<AiTag label="AI agent test" />}>
        <p className="text-[13px] text-slate-700">
          <b>{TUNING.proposal}</b> · {TUNING.test}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Bars: caught of 97 · extra alerts of 39,000</p>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {TUNING.options.map((o) => {
            const sel = dial === o.id;
            const tone: Tone = o.id === "C" ? "red" : o.id === "B" ? "green" : "amber";
            return (
              <button key={o.id} type="button" onClick={() => setDial(o.id)} aria-pressed={sel} className={`rounded-[10px] text-left ${focus}`}>
                <StatusCard tone={tone} className={sel ? "ring-2 ring-indigo-500" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold text-slate-900">
                      {o.id} · {o.label} <span className="font-normal text-slate-500">({o.dial})</span>
                    </span>
                    {o.view === "Recommended" ? <AiTag label="Recommended" /> : <span className="text-[11px] text-slate-500">{o.view}</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 rounded-full bg-emerald-500" style={{ width: `${(o.caught / TUNING.breaches) * 70}%`, minWidth: 2 }} />
                    <b className="text-sm tabular-nums text-slate-900">
                      {o.caught} of {TUNING.breaches}
                    </b>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 rounded-full bg-amber-500" style={{ width: `${(o.extraAlerts / 2100) * 70}%`, minWidth: 2 }} />
                    <b className="text-sm tabular-nums text-slate-900">
                      +{o.extraAlerts.toLocaleString("en-GB")} ({((o.extraAlerts / TUNING.alertsPerMonth) * 100).toFixed(1)}%)
                    </b>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{o.capacity}</p>
                </StatusCard>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">Nothing goes live without model-risk review and a named approver.</p>
          {state.session.tuningProposal ? (
            <p className="text-xs font-semibold text-slate-900">Option {state.session.tuningProposal} proposed to the Risk Committee · decision pending</p>
          ) : (
            <button type="button" onClick={() => dispatch({ type: "PROPOSE_TUNING", optionId: dial })} className={btnPrimary}>
              Propose option {dial} to Risk Committee
            </button>
          )}
        </div>
      </Panel>

      <Panel title="Agent activity this week">
        <ol className="divide-y divide-slate-100">
          {ACTIVITY.map((ev, i) => (
            <li key={i} className="flex items-start gap-3 py-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{ev.type}</span>
              <span className="w-24 shrink-0 text-[11px] text-slate-500">{ev.date}</span>
              <span className="flex-1 text-xs text-slate-800" title={agentName(ev.agentId)}>
                {ev.line}
              </span>
              {ev.type === "APPROVED" ? <RuleTag /> : null}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
