"use client";

/**
 * UK Board v2 — Board member sections (non-executive director view). Commercial framing first,
 * risk second; numbers always against plan, appetite, target or last quarter. The board member
 * reads, challenges, notes and requests deep dives; he never approves or prepares.
 * New values come from lib/ukboard/v2/boardMemberData.ts (see TIEOUT.md).
 */
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, Minus } from "lucide-react";
import { METRICS, rowState, type MetricMeta } from "@/lib/ukboard/v2/board";
import { CHANGES, FRANCHISES, UNCHANGED } from "@/lib/ukboard/v2/boardTabs";
import { AGENT_VALUE, AGENTS, agentName, FINDINGS, QUEUE, totalChecks, TUNING } from "@/lib/ukboard/v2/agentsData";
import {
  COMPLAINT_THEMES,
  COMPLAINTS,
  CREDIT_QUALITY,
  CULTURE,
  D1_OPTIONS,
  D2_BOARD_ASKS,
  D3_OPTIONS,
  DUE_FOR_REVIEW,
  DUTY_OUTCOMES,
  EARLY_WARNINGS,
  FINANCIAL_STRENGTH,
  HARM_EVENT,
  ISSUES_FOUND,
  JOURNEYS,
  LINE_GROWTH,
  MORTGAGE_BOOK,
  REG_CALENDAR,
  REGULATOR_RELATIONSHIP,
  RISK_TIERS,
  SIGNOFF_HISTORY,
  SIGNOFF_MONTHS,
  SINCE_LAST_BOARD,
  TENSIONS,
  VULN,
  CALL_WAIT,
  type SignOffMark,
} from "@/lib/ukboard/v2/boardMemberData";
import AppetiteDial from "./AppetiteDial";
import { useDrawer } from "./drawerContext";
import { Card, Row, Tag, useGo } from "./sections";
import { useStore } from "./store";
import { AiTag, btn, focus, Label, Opener, Pill, Sparkline, TONE, toneOf, type Tone } from "./ui";

const VERDICT_WORD = { room_to_grow: "Room to grow", hold: "Hold", fix_first: "Fix first", unverified: "Unconfirmed" } as const;
const metric = (id: string) => METRICS.find((m) => m.unitId === id)!;

function More({ tab, label }: { tab: string; label: string }) {
  const go = useGo();
  return (
    <button type="button" onClick={() => go(tab)} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
      {label} ›
    </button>
  );
}

function Trend({ dir }: { dir: "up" | "down" | "flat" | "none" }) {
  if (dir === "up") return <ArrowUp className="h-3.5 w-3.5 text-slate-500" aria-label="rising" />;
  if (dir === "down") return <ArrowDown className="h-3.5 w-3.5 text-slate-500" aria-label="falling" />;
  if (dir === "flat") return <Minus className="h-3.5 w-3.5 text-slate-400" aria-label="no change" />;
  return <span className="w-3.5" />;
}

/** Compact stat panel: 4 numbers, each against a comparison. */
function StatPanel({ title, stats, more }: { title: string; stats: { label: string; value: string; against: string; tone: Tone; drawer?: string }[]; more?: ReactNode }) {
  return (
    <Card title={title} right={more}>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => {
          const body = (
            <div className={`h-full rounded-lg border px-2.5 py-1.5 ${s.tone === "green" ? "border-slate-200 bg-slate-50" : `${TONE[s.tone].bg} ${TONE[s.tone].border}`}`}>
              <Label className="block leading-tight">{s.label}</Label>
              <p className={`text-lg font-bold leading-tight tabular-nums ${s.tone === "green" ? "text-slate-800" : TONE[s.tone].text}`}>{s.value}</p>
              <p className="text-[11px] leading-snug text-slate-500">{s.against}</p>
            </div>
          );
          return s.drawer ? (
            <Opener key={s.label} drawer={s.drawer} label={s.label} className="rounded-lg">
              {body}
            </Opener>
          ) : (
            <div key={s.label}>{body}</div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Briefing ────────────────────────────────────────────────────────── */

export function BmPosture() {
  const heading = METRICS.filter((m) => rowState(m) === "projected").length;
  const count = (s: string) => METRICS.filter((m) => rowState(m) === s).length;
  const chips: [string, Tone][] = [
    [`${count("within_appetite")} within`, "green"],
    [`${heading} heading for amber`, "amber"],
    [`${count("amber")} amber`, "amber"],
    [`${count("red")} red`, "red"],
    [`${count("unverified")} unconfirmed`, "grey"],
    ["3 decisions", "amber"],
  ];
  return (
    <section className={`rounded-xl border-[1.5px] px-4 py-2.5 ${TONE.amber.bg} ${TONE.amber.border}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`h-3 w-3 rounded-full ${TONE.amber.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${TONE.amber.text}`}>Board risk posture</span>
        <Pill tone="amber" label="AMBER" />
        <span className="text-[13px] text-slate-700">Mortgages can grow; savings growth is outrunning crime checks.</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {chips.map(([l, tone]) => (
          <Tag key={l} tone={tone}>
            {l}
          </Tag>
        ))}
        <span className="ml-auto text-[11px] font-semibold text-slate-600">{SINCE_LAST_BOARD}</span>
      </div>
    </section>
  );
}

function GrowthBar({ actual, plan, pace, tone }: { actual: number; plan: number; pace?: number; tone: Tone }) {
  const pct = Math.min(100, (actual / plan) * 100);
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-200" aria-hidden>
      <div className={`h-2 rounded-full ${tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${pct}%` }} />
      {pace ? <span className="absolute -top-0.5 h-3 w-0.5 bg-slate-700" style={{ left: `${pace * 100}%` }} title="Plan pace" /> : null}
    </div>
  );
}

/** 4.1 Business line card: growth vs plan, risk headroom, verdict, what unlocks growth. */
export function BusinessLineScorecard() {
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {FRANCHISES.map((f) => {
        const g = LINE_GROWTH.find((x) => x.id === f.id)!;
        const tone = toneOf(f.verdict);
        const dialMetric = f.id === "O1" ? metric("u-hltv") : f.id === "O3" ? metric("u-nsfr") : f.id === "O2" ? metric("u-capacity") : undefined;
        return (
          <Opener key={f.id} drawer={`franchise:${f.id}`} label={f.name} className="rounded-[10px]">
            <div className={`flex min-h-[150px] flex-col gap-1.5 rounded-[10px] border-[1.5px] px-3 py-2.5 hover:shadow-md ${TONE[tone].bg} ${TONE[tone].border}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-bold text-slate-900">{f.name}</span>
                <Pill tone={tone} label={VERDICT_WORD[f.verdict]} />
              </div>
              <div>
                <p className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-slate-500">Growth</span>
                  <span className={`font-semibold ${g.growthTone === "green" ? "text-emerald-700" : TONE[g.growthTone].text}`}>{g.growthStatus}</span>
                </p>
                <GrowthBar actual={g.actual} plan={g.plan} pace={g.pace} tone={g.growthTone} />
                <p className="mt-0.5 text-xs text-slate-700">{g.growthLabel}</p>
              </div>
              <div>
                <p className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-slate-500">Risk</span>
                  <span className="font-semibold text-slate-700">{g.riskLabel}</span>
                </p>
                {dialMetric?.dial ? <AppetiteDial dial={dialMetric.dial} direction={dialMetric.direction} /> : <div className="h-3.5 rounded-full border border-dashed border-slate-400" aria-hidden />}
              </div>
              <p className="border-t border-black/5 pt-1 text-xs text-slate-800">
                <b className="text-slate-900">Unlock:</b> {g.unlock}
              </p>
            </div>
          </Opener>
        );
      })}
    </div>
  );
}

function DialTile({ m }: { m: MetricMeta }) {
  const s = rowState(m);
  const tone: Tone = s === "projected" ? "amber" : toneOf(s);
  const muted = s === "within_appetite";
  const cls = muted ? "border-emerald-100 bg-emerald-50/40" : s === "unverified" ? "border-dashed border-slate-400 bg-slate-50" : `${TONE[tone].bg} ${TONE[tone].border}`;
  return (
    <Opener drawer={`metric:${m.unitId}`} label={`${m.name}: ${m.value}`} className="rounded-lg">
      <div className={`flex min-h-[72px] flex-col justify-between gap-1 rounded-lg border px-2.5 py-2 hover:shadow-sm ${cls}`}>
        <span className="flex items-center justify-between gap-1.5">
          <span className={`text-[11px] font-semibold leading-tight ${muted ? "text-slate-500" : "text-slate-900"}`}>{m.name}</span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${s === "projected" ? "border-2 border-amber-500" : TONE[tone].dot}`} title={s === "projected" ? "Heading for amber" : undefined} />
        </span>
        {m.dial ? (
          <AppetiteDial dial={m.dial} direction={m.direction} />
        ) : (
          <span className={`h-2 rounded-full ${s === "red" ? "bg-red-300" : s === "unverified" ? "border border-dashed border-slate-400" : "bg-emerald-200"}`} aria-hidden />
        )}
        <span className={`text-[11px] tabular-nums ${muted ? "text-slate-500" : "text-slate-800"}`}>
          <b>{m.value}</b> {m.denominator}
        </span>
      </div>
    </Opener>
  );
}

/** 12 mini appetite dials: appetite set against where we operate. */
export function DialGrid() {
  return (
    <Card title="Can we grow within appetite?" right={<span className="text-[11px] text-slate-500">12 board measures · greens muted</span>}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {METRICS.map((m) => (
          <DialTile key={m.unitId} m={m} />
        ))}
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#fcd34d]" /> Amber zone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#fca5a5]" /> Red zone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-slate-800" /> Where we are
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-1 border border-slate-700" /> Projection
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-500" /> Unconfirmed: grey, not a colour
        </span>
      </p>
    </Card>
  );
}

const KEY_DATES: [string, string, Tone][] = [
  ["8 Nov", "Restriction sign-off", "red"],
  ["8 Dec", "Savings campaign starts", "amber"],
  ["15 Dec", "Board Risk Committee", "amber"],
  ["18 Mar 2027", "New incident-reporting rules", "grey"],
];

/** For your decision (3) with key dates filling the column. */
export function DecideAndDates() {
  const go = useGo();
  return (
    <Card title="What do you need from us?" right={<More tab="decisions" label="Decisions" />}>
      {DECISIONS.map((d) => (
        <button key={d.n} type="button" onClick={() => go("decisions")} className={`flex min-h-9 w-full items-center justify-between gap-2 border-l-[3px] py-1 pl-3 pr-1 text-left text-[13px] leading-snug hover:bg-slate-50 ${focus} ${TONE[d.tone].rail}`}>
          <span className="text-slate-800">
            {d.n}. {d.title}
          </span>
          <b className={`shrink-0 tabular-nums ${TONE[d.tone].text}`}>{d.key}</b>
        </button>
      ))}
      <p className="mb-0.5 mt-1.5">
        <Label>Key dates</Label>
      </p>
      {KEY_DATES.map(([d, t, tone]) => (
        <span key={d} className={`flex h-8 items-center gap-3 border-l-[3px] pl-3 text-[13px] ${TONE[tone].rail}`}>
          <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wider text-indigo-700">{d}</span>
          <span className="text-slate-800">{t}</span>
        </span>
      ))}
    </Card>
  );
}

export function RiskTiers() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      {RISK_TIERS.map((t) => (
        <Card key={t.tier} title={`${t.tier} risks`} right={t.tier === "Obligatory" ? <span className="text-[11px] text-slate-500">Level zero</span> : undefined}>
          {t.items.map((i) => (
            <Opener key={i.name} drawer={i.drawer} label={i.name} className="rounded-r hover:bg-slate-50">
              <span className={`flex min-h-10 items-center justify-between gap-2 border-l-[3px] py-1 pl-3 pr-1 text-[13px] leading-snug ${TONE[i.tone].rail}`}>
                <span className="min-w-0">
                  <span className="text-slate-800">{i.name}</span>
                  <span className="block text-[11px] text-slate-500">{i.owner}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Trend dir={i.trend} />
                  <Pill tone={i.tone} label={i.status} />
                </span>
              </span>
            </Opener>
          ))}
        </Card>
      ))}
    </div>
  );
}

export function BmChanged() {
  return (
    <Card title="What changed since last board?">
      {CHANGES.map((c) => (
        <Row key={c.text} tone={c.tone} text={c.text} drawer={c.drawer} right={<Tag tone={c.tone}>{c.tag}</Tag>} />
      ))}
    </Card>
  );
}

export function BmUnchanged() {
  return (
    <Card title="What has not changed?">
      {UNCHANGED.map((c) => (
        <Row key={c.text} tone={c.tone} text={c.text} drawer={c.drawer} right={<Tag tone={c.tone}>{c.standing ? c.standing.replace("Standing ", "") : c.tag}</Tag>} />
      ))}
      {DUE_FOR_REVIEW.map((d) => (
        <Row key={d.item} tone={d.tone} text={d.item} detail={d.detail} drawer={d.drawer} right={<Tag tone={d.tone}>Overdue</Tag>} />
      ))}
    </Card>
  );
}

export function CustomerPulse() {
  const last = COMPLAINTS.perThousand.length - 1;
  return (
    <StatPanel
      title="What are customers telling us?"
      more={<More tab="customers" label="Customers" />}
      stats={[
        { label: "Complaints", value: `${COMPLAINTS.perThousand[last]}`, against: `per 1,000 accounts · Q2 ${COMPLAINTS.perThousand[last - 1]}`, tone: "amber" },
        { label: "Ombudsman upholds", value: COMPLAINTS.ombudsmanUphold.now, against: `Q2 ${COMPLAINTS.ombudsmanUphold.q2}`, tone: "amber" },
        { label: "Vulnerable exceptions", value: `${VULN.series[VULN.series.length - 1]}`, against: `per 10,000 · amber ${VULN.amber}`, tone: "amber", drawer: "removed" },
        { label: "Rate-error customers", value: HARM_EVENT.contacted.toLocaleString("en-GB"), against: `of ${HARM_EVENT.customers.toLocaleString("en-GB")} contacted`, tone: "amber" },
      ]}
    />
  );
}

export function FinancialStrengthPanel() {
  return <StatPanel title="Are we financially strong?" more={<More tab="growth" label="Growth" />} stats={FINANCIAL_STRENGTH.map((f) => ({ ...f, drawer: `metric:${f.unitId}` }))} />;
}

export function AgentPanel() {
  const { state } = useStore();
  const waiting = QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length;
  return (
    <StatPanel
      title="Are the AI agents helping?"
      more={<More tab="ai" label="AI oversight" />}
      stats={[
        { label: "Agents", value: String(AGENTS.length), against: `${totalChecks()} checks this week`, tone: "green" },
        { label: "Findings", value: String(FINDINGS.length), against: "this quarter", tone: "amber" },
        { label: "Drafts with CRO", value: String(waiting), against: "waiting for a person", tone: "amber" },
        { label: "Without approval", value: "0", against: "actions taken", tone: "green" },
      ]}
    />
  );
}

/* ── Growth & Appetite ───────────────────────────────────────────────── */

/** 4.2 One row per business line: growth vs plan, appetite used, headroom, what unlocks growth. */
export function GrowthAppetiteTable() {
  const cols = "grid min-h-11 grid-cols-[minmax(130px,1fr)_minmax(150px,1.3fr)_minmax(110px,0.9fr)_90px_110px_minmax(0,1.5fr)] items-center gap-3 px-2 py-1.5 text-[13px] leading-snug";
  return (
    <Card title="Where can we grow?">
      <div className={`${cols} !min-h-0 pb-1`}>
        {["Business line", "Growth vs plan", "Appetite used", "Headroom", "Verdict", "What unlocks more growth"].map((h) => (
          <Label key={h}>{h}</Label>
        ))}
      </div>
      {FRANCHISES.map((f) => {
        const g = LINE_GROWTH.find((x) => x.id === f.id)!;
        const tone = toneOf(f.verdict);
        const dm = f.id === "O1" ? metric("u-hltv") : f.id === "O3" ? metric("u-nsfr") : f.id === "O2" ? metric("u-capacity") : undefined;
        return (
          <Opener key={f.id} drawer={`franchise:${f.id}`} label={f.name} className="border-t border-slate-100 hover:bg-slate-50">
            <div className={cols}>
              <span>
                <b className="text-slate-900">{f.name}</b>
                {f.id === "O1" ? <span className="block text-[11px] text-slate-500">Book {MORTGAGE_BOOK}</span> : null}
              </span>
              <span>
                <GrowthBar actual={g.actual} plan={g.plan} pace={g.pace} tone={g.growthTone} />
                <span className="mt-0.5 block text-xs text-slate-600">
                  {g.growthLabel} · <b>{Math.round((g.actual / g.plan) * 100)}%</b>
                </span>
              </span>
              <span>
                {dm?.dial ? <AppetiteDial dial={dm.dial} direction={dm.direction} /> : <span className="block h-3.5 rounded-full border border-dashed border-slate-400" />}
                <span className="mt-0.5 block text-xs text-slate-600">{g.riskLabel}</span>
              </span>
              <b className="tabular-nums text-slate-900">{g.headroom}</b>
              <span>
                <Pill tone={tone} label={VERDICT_WORD[f.verdict]} />
              </span>
              <span className="text-slate-800">{g.unlock}</span>
            </div>
          </Opener>
        );
      })}
    </Card>
  );
}

export function EarlyWarnings() {
  return (
    <Card title="Which early warnings are moving?">
      {EARLY_WARNINGS.map((w) => (
        <Row key={w.name} tone={w.tone} text={w.name} detail={w.when} drawer={`metric:${w.unitId}`} />
      ))}
      <p className="mt-1.5 text-[11px] text-slate-500">Straight-line projections, sorted by time to threshold.</p>
    </Card>
  );
}

export function CreditQuality() {
  return (
    <Card title="Is credit quality holding?">
      {CREDIT_QUALITY.map((c) => (
        <Row key={c.label} tone={c.tone} text={`${c.label} ${c.value}`} detail={c.against} drawer={c.label === "High-LTV share" ? "metric:u-hltv" : undefined} />
      ))}
      <p className="mt-1.5 text-[11px] text-slate-500">Mortgage book {MORTGAGE_BOOK} · all four within appetite</p>
    </Card>
  );
}

export function FinancialStrengthDetail() {
  return (
    <Card title="Capital and liquidity headroom">
      {FINANCIAL_STRENGTH.map((f) => {
        const m = metric(f.unitId);
        return (
          <Opener key={f.unitId} drawer={`metric:${f.unitId}`} label={f.label} className="rounded hover:bg-slate-50">
            <span className="block border-b border-slate-100 px-1 py-1.5 last:border-b-0">
              <span className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-slate-800">{f.label}</span>
                <span className="tabular-nums">
                  <b>{f.value}</b> <span className="text-slate-500">{f.against}</span>
                </span>
              </span>
              {m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} /> : null}
            </span>
          </Opener>
        );
      })}
    </Card>
  );
}

/** 4.4 AI-found tensions between two policies or measures. */
export function PolicyTensions() {
  return (
    <Card title="Where do our policies conflict?" right={<AiTag label="AI agent found" />}>
      <div className="space-y-2">
        {TENSIONS.map((t) => (
          <Opener key={t.a} drawer={t.drawer} label={`${t.a} versus ${t.b}`} className="rounded-lg">
            <div className={`rounded-lg border px-3 py-2 hover:shadow-sm ${TONE[t.tone].border} ${t.tone === "green" ? "bg-white" : TONE[t.tone].bg}`}>
              <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                {t.a} <ArrowRight className="h-3 w-3 text-slate-400" aria-label="versus" /> {t.b}
              </p>
              <p className="text-xs text-slate-600">
                {t.aWants} · {t.bWants}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-800">{t.effect}</span>
                <span className="flex items-center gap-1.5">
                  {t.note ? <span className="text-[11px] text-slate-500">{t.note}</span> : null}
                  <Pill tone={t.tone} outline label={t.status} />
                </span>
              </p>
            </div>
          </Opener>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        {TENSIONS.length} tensions found · {TENSIONS.filter((t) => t.status === "Regulatory floor, not tradeable").length} is a regulatory floor · {TENSIONS.filter((t) => t.status === "Not agreed").length} not yet agreed by the board
      </p>
    </Card>
  );
}

/* ── Customers ───────────────────────────────────────────────────────── */

/** 4.9 Consumer Duty outcome cards. */
export function DutyOutcomes() {
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {DUTY_OUTCOMES.map((o) => (
        <div key={o.outcome} className="rounded-xl border-[1.5px] border-emerald-200 bg-white px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[13px] font-bold text-slate-900">{o.outcome}</span>
            <Pill tone={o.tone} label={o.status} />
          </div>
          <p className={`mt-1 text-2xl font-bold leading-tight tabular-nums ${o.measureTone === "green" ? "text-slate-900" : TONE[o.measureTone].text}`}>{o.measure}</p>
          <p className="text-xs text-slate-600">{o.against}</p>
          {o.outcome === "Consumer support" ? (
            <p className="text-xs text-slate-600">
              Call wait {CALL_WAIT.value} · target {CALL_WAIT.target}
            </p>
          ) : null}
          <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            {o.measureTone === "green" ? <span>{o.trend}</span> : <Tag tone={o.measureTone}>{o.trend}</Tag>}
            <span>{o.owner}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function ComplaintsTrend() {
  const n = COMPLAINTS.perThousand.length - 1;
  return (
    <Card title="Are complaints rising?">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold tabular-nums text-amber-700">{COMPLAINTS.perThousand[n]}</p>
          <p className="text-xs text-slate-600">per 1,000 accounts · Q2 {COMPLAINTS.perThousand[n - 1]}</p>
        </div>
        <div className="text-right">
          <Sparkline values={COMPLAINTS.perThousand} tone="amber" />
          <p className="text-[11px] text-slate-500">
            {COMPLAINTS.quarters[0]} {COMPLAINTS.perThousand[0]} → {COMPLAINTS.quarters[n]} {COMPLAINTS.perThousand[n]}
          </p>
        </div>
      </div>
      <p className="mt-2 flex gap-1.5">
        {COMPLAINTS.quarters.map((q, i) => (
          <span key={q} className={`flex-1 rounded-md border px-2 py-1 text-center text-[11px] ${i === n ? `${TONE.amber.bg} ${TONE.amber.border} font-semibold text-amber-800` : "border-slate-200 text-slate-600"}`}>
            {q} · <b className="tabular-nums">{COMPLAINTS.perThousand[i]}</b>
          </span>
        ))}
      </p>
      <Row tone="amber" text={`Ombudsman upholds ${COMPLAINTS.ombudsmanUphold.now}`} detail={`${COMPLAINTS.ombudsmanUphold.detail} · Q2 ${COMPLAINTS.ombudsmanUphold.q2}`} />
    </Card>
  );
}

export function ComplaintThemes() {
  return (
    <Card title="What do customers complain about?">
      {COMPLAINT_THEMES.map((t) => (
        <div key={t.theme} className="flex h-10 items-center gap-3 text-[13px]">
          <span className="w-52 shrink-0 text-slate-800">{t.theme}</span>
          <span className="h-2.5 flex-1 rounded-full bg-slate-100">
            <span className="block h-2.5 rounded-full bg-amber-400" style={{ width: `${t.share * 2}%` }} />
          </span>
          <b className="w-10 text-right tabular-nums">{t.share}%</b>
        </div>
      ))}
      <p className="text-[11px] text-slate-500">Share of complaints this quarter.</p>
    </Card>
  );
}

export function VulnerableCustomers() {
  return (
    <Card title="Are vulnerable customers protected?">
      <Opener drawer="removed" label="Vulnerable-customer exceptions" className="rounded">
        <p className="text-2xl font-bold tabular-nums text-amber-700">
          {VULN.series[VULN.series.length - 1]} <span className="text-xs font-normal text-slate-500">exceptions per 10,000 · amber {VULN.amber}</span>
        </p>
        <div className="mt-1 flex items-end gap-2">
          {VULN.series.map((v, i) => (
            <span key={i} className="flex flex-1 flex-col items-center gap-0.5">
              <span className="w-full rounded-t bg-amber-300" style={{ height: `${(v / VULN.red) * 60}px` }} />
              <span className="text-[10px] text-slate-500">
                {VULN.labels[i]} · {v}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-600">Amber 3 quarters · red at {VULN.red} · dropped from the pack 14 Oct</p>
      </Opener>
    </Card>
  );
}

export function HarmEvent() {
  const pct = Math.round((HARM_EVENT.contacted / HARM_EVENT.customers) * 100);
  return (
    <Card title="Are we putting harm right?">
      <Opener drawer="event:e-117" label={HARM_EVENT.name} className="rounded">
        <p className="text-[13px] font-semibold text-slate-900">{HARM_EVENT.name}</p>
        <p className="text-2xl font-bold tabular-nums text-amber-700">
          {HARM_EVENT.contacted.toLocaleString("en-GB")} <span className="text-xs font-normal text-slate-500">of {HARM_EVENT.customers.toLocaleString("en-GB")} customers contacted</span>
        </p>
        <span className="mt-1 block h-2 rounded-full bg-slate-200">
          <span className="block h-2 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
        </span>
        <p className="mt-1 text-xs text-slate-600">
          {pct}% contacted · redress about {HARM_EVENT.redress} · target {HARM_EVENT.target}
        </p>
      </Opener>
      <div className="mt-1.5">
        <Row tone="amber" text={`${(HARM_EVENT.customers - HARM_EVENT.contacted).toLocaleString("en-GB")} customers still to contact`} detail={`by ${HARM_EVENT.target}`} />
      </div>
    </Card>
  );
}

export function CustomerSignals() {
  const f = FINDINGS.find((x) => x.agentId === "signals")!;
  return (
    <Card title="What are the agents hearing?" right={<AiTag label="Customer Signals" />}>
      <Row tone="amber" text={f.finding} detail={f.impact.toLowerCase()} drawer={f.drawer} />
      <Row tone="amber" text={`Savings account access: ${COMPLAINT_THEMES[0].share}% of complaints`} detail="largest theme" />
      <Row tone="amber" text={`Ombudsman upholds up to ${COMPLAINTS.ombudsmanUphold.now}`} detail={`from ${COMPLAINTS.ombudsmanUphold.q2}`} />
      <p className="mt-1 text-[11px] text-slate-500">Accountable: Chief Customer Officer</p>
    </Card>
  );
}

export function Culture() {
  return (
    <Card title="Do staff feel safe to speak up?">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {CULTURE.map((c) => (
          <div key={c.label} className={`rounded-lg border px-3 py-2 ${c.tone === "amber" ? `${TONE.amber.bg} ${TONE.amber.border}` : "border-slate-200 bg-slate-50"}`}>
            <Label>{c.label}</Label>
            <p className={`text-xl font-bold tabular-nums ${c.tone === "amber" ? "text-amber-700" : "text-slate-900"}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500">{c.against}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Decisions ───────────────────────────────────────────────────────── */

const CHALLENGES: Record<number, string[]> = {
  1: ["Restoring capacity takes 10 weeks; the campaign starts in 6. Then what?", "Why no resourcing decision since August?", "What would pacing growth cost in members?"],
  2: ["When did we first know about the savings pot?", "Who decides each reporting route, and by when?", "Why are 24,000 openings still not checked?"],
  3: ["Who removed this item, and on what authority?", "Why no action after 3 quarters at amber?", "What stops an item being dropped silently?"],
};

const DECISIONS = [
  { n: 1, title: "Savings growth vs crime checks", tone: "amber" as Tone, key: "19 days", keySub: "alert queue · amber 14", why: "Next savings campaign starts in 6 weeks.", decider: "Board · before 8 Dec" },
  { n: 2, title: "Restriction breach: report or not?", tone: "red" as Tone, key: "112 of 9,400", keySub: "accounts checked", why: "Reporting clocks are already running.", decider: "Head of Compliance · immediate" },
  { n: 3, title: "Issue removed from board pack", tone: "amber" as Tone, key: "3 quarters", keySub: "at amber, then dropped", why: "It met a committee rule but left the pack.", decider: "Risk Committee Chair · 15 Dec" },
];

const openChallenge = (n: number) => window.dispatchEvent(new CustomEvent("ukb-challenge", { detail: n }));

function BoardActions({ n, title }: { n: number; title: string }) {
  const { state, dispatch } = useStore();
  const noted = state.session.notes.some((x) => x.from === `Decision ${n} note`);
  const topic = `Decision ${n}: ${title}`;
  const asked = state.session.deepDives.includes(topic);
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={() => openChallenge(n)} className={btn}>
        Ask a challenge question
      </button>
      <button type="button" disabled={noted} onClick={() => dispatch({ type: "SAVE_NOTE", text: `Raise decision ${n} at the meeting`, from: `Decision ${n} note` })} className={btn}>
        {noted ? "In my notes" : "Add to my notes"}
      </button>
      <button type="button" disabled={asked} onClick={() => dispatch({ type: "REQUEST_DEEP_DIVE", topic })} className={btn}>
        {asked ? "Deep dive requested" : "Request a deep dive"}
      </button>
    </div>
  );
}

function ImpactTable({ n }: { n: number }) {
  if (n === 1) {
    return (
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-slate-500">
            {["Option", "Growth", "Risk", "Cost", "To green"].map((h) => (
              <th key={h} className="pb-1 pr-2 font-bold uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D1_OPTIONS.map((o) => (
            <tr key={o.option} className="border-t border-slate-100 align-top">
              <td className="py-1.5 pr-2 font-semibold text-slate-900">
                {o.option}
                {o.recommended ? (
                  <span className="mt-0.5 block">
                    <AiTag label="Recommended" />
                  </span>
                ) : null}
              </td>
              <td className="py-1.5 pr-2 text-slate-700">{o.growth}</td>
              <td className="py-1.5 pr-2 text-slate-700">{o.risk}</td>
              <td className="py-1.5 pr-2 text-slate-700">{o.cost}</td>
              <td className="py-1.5 font-semibold text-slate-900">{o.toGreen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (n === 3) {
    return (
      <div>
        {D3_OPTIONS.map((o, i) => (
          <p key={o.option} className="flex items-baseline justify-between gap-2 border-t border-slate-100 py-1.5 text-xs">
            <b className="text-slate-900">
              {o.option}
              {i === 0 ? (
                <span className="ml-1.5 align-middle">
                  <AiTag label="Recommended" />
                </span>
              ) : null}
            </b>
            <span className="text-right text-slate-600">{o.impact}</span>
          </p>
        ))}
      </div>
    );
  }
  return (
    <div>
      <p className="border-t border-slate-100 pt-1.5 text-xs text-slate-700">
        Not a board decision: the Head of Compliance decides each reporting route. <b>1 of 7 routes decided.</b>
      </p>
      <p className="mt-1">
        <Label>What the board should ask</Label>
      </p>
      {D2_BOARD_ASKS.map((q) => (
        <p key={q} className="text-xs text-slate-700">
          · {q}
        </p>
      ))}
    </div>
  );
}

/** 4.3 Decision card with option impact. */
export function BmDecisionCards() {
  const { open } = useDrawer();
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.45fr_1fr_1fr]">
      {DECISIONS.map((d) => (
        <div key={d.n} className={`rounded-xl border-[1.5px] bg-white p-4 shadow-sm ${TONE[d.tone].border}`}>
          <button type="button" onClick={(e) => open(`decision:${d.n}`, e.currentTarget)} className={`block w-full text-left ${focus} rounded`}>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{d.n}</span>
              <span className="text-sm font-bold text-slate-900">{d.title}</span>
            </span>
            <span className={`mt-1.5 block text-[26px] font-bold leading-tight tabular-nums ${TONE[d.tone].text}`}>
              {d.key} <span className="text-xs font-normal text-slate-500">{d.keySub}</span>
            </span>
            <span className="block text-xs text-slate-700">
              <b>Why now:</b> {d.why}
            </span>
            <span className="block text-xs font-semibold text-slate-500">{d.decider}</span>
          </button>
          <div className="mt-2">
            <ImpactTable n={d.n} />
          </div>
          {d.n === 1 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-violet-800">
              <AiTag /> Recommends restoring capacity
            </p>
          ) : null}
          <div className="mt-2.5">
            <BoardActions n={d.n} title={d.title} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChallengeQuestions() {
  const { state, dispatch } = useStore();
  const [openN, setOpenN] = useState<number>(1);
  useEffect(() => {
    const on = (e: Event) => {
      setOpenN((e as CustomEvent<number>).detail);
      document.getElementById("bm-challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("ukb-challenge", on);
    return () => window.removeEventListener("ukb-challenge", on);
  }, []);
  const saved = (n: number, q: string) => state.session.notes.some((x) => x.from === `Decision ${n}` && x.text === q);
  return (
    <Card id="bm-challenges" title="What should we ask?" right={<AiTag label="AI agent drafted" />}>
      {DECISIONS.map((d) => (
        <div key={d.n} className="border-t border-slate-100 first:border-t-0">
          <button type="button" aria-expanded={openN === d.n} onClick={() => setOpenN(openN === d.n ? 0 : d.n)} className={`flex h-10 w-full items-center justify-between text-left text-[13px] font-semibold text-slate-900 ${focus}`}>
            <span>
              {d.n}. {d.title}
            </span>
            <span className="text-xs font-normal text-indigo-700">{openN === d.n ? "Hide" : "3 questions"}</span>
          </button>
          {openN === d.n
            ? CHALLENGES[d.n].map((q) => (
                <p key={q} className="flex min-h-9 items-center justify-between gap-3 pl-3 text-xs text-slate-700">
                  <span>{q}</span>
                  <button type="button" disabled={saved(d.n, q)} onClick={() => dispatch({ type: "SAVE_NOTE", text: q, from: `Decision ${d.n}` })} className={btn}>
                    {saved(d.n, q) ? "In my notes" : "Add to my notes"}
                  </button>
                </p>
              ))
            : null}
        </div>
      ))}
    </Card>
  );
}

export function MyNotes() {
  const { state } = useStore();
  const notes = state.session.notes;
  const dives = state.session.deepDives;
  return (
    <Card title={`My notes (${notes.length})`}>
      {notes.length ? notes.map((n) => <Row key={n.id} tone="grey" text={n.text} detail={n.from} />) : <p className="text-xs text-slate-500">Questions and items you add appear here for the meeting.</p>}
      <p className="mb-0.5 mt-2">
        <Label>Deep dives requested</Label>
      </p>
      {dives.length ? dives.map((d) => <Row key={d} tone="amber" text={d} detail="with the CRO" />) : <p className="text-xs text-slate-500">None yet.</p>}
    </Card>
  );
}

export function DueForReview() {
  return (
    <Card title="Which decisions are overdue for review?">
      {DUE_FOR_REVIEW.map((d) => (
        <Row key={d.item} tone={d.tone} text={d.item} detail={d.detail} drawer={d.drawer} right={<Pill tone={d.tone} label="Overdue" />} />
      ))}
    </Card>
  );
}

/* ── Regulator view ──────────────────────────────────────────────────── */

export function RegulatorRelationship() {
  return (
    <Card title="Where do we stand with regulators?">
      {REGULATOR_RELATIONSHIP.map((r) => (
        <Row key={r.label} tone={r.tone} text={r.label} right={<b className="text-[13px] tabular-nums text-slate-900">{r.value}</b>} />
      ))}
    </Card>
  );
}

export function RegulatoryCalendar() {
  return (
    <Card title="What is coming up?">
      {REG_CALENDAR.map((c) => (
        <span key={c.item} className={`flex min-h-10 items-center gap-3 border-l-[3px] py-1 pl-3 text-[13px] ${TONE[c.tone].rail}`}>
          <span className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider text-indigo-700">{c.date}</span>
          <span className="text-slate-800">{c.item}</span>
        </span>
      ))}
    </Card>
  );
}

/* ── Ownership ───────────────────────────────────────────────────────── */

const MARK: Record<SignOffMark, { cls: string; word: string }> = {
  on_time: { cls: "bg-emerald-500", word: "Signed on time" },
  late: { cls: "bg-amber-400", word: "Late" },
  missing: { cls: "border border-dashed border-slate-400 bg-white", word: "Missing" },
  early: { cls: "bg-red-500", word: "Signed before data check finished" },
};

/** 4.5 Monthly sign-off strip, one row per owner, month of the numbers. */
export function SignOffStrip() {
  return (
    <Card title="Do owners sign off every month?">
      <div className="grid grid-cols-[170px_repeat(12,minmax(0,1fr))] items-center gap-1 text-[10px] text-slate-500">
        <span />
        {SIGNOFF_MONTHS.map((m, i) => (
          <span key={m} className={`text-center ${i === SIGNOFF_MONTHS.length - 1 ? "font-bold text-slate-900" : ""}`}>
            {m}
          </span>
        ))}
        {SIGNOFF_HISTORY.map((o) => (
          <div key={o.role} className="contents">
            <span className="flex h-8 items-center text-xs font-semibold text-slate-800">{o.role}</span>
            {o.marks.map((mk, i) => (
              <span key={i} title={`${SIGNOFF_MONTHS[i]}: ${MARK[mk].word}`} className={`mx-auto h-5 w-full max-w-7 rounded ${MARK[mk].cls}`} />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
        {(Object.keys(MARK) as SignOffMark[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${MARK[k].cls}`} />
            {MARK[k].word}
          </span>
        ))}
        <span className="text-slate-500">· Month of the numbers, Oct 2025 – Sep 2026</span>
      </p>
    </Card>
  );
}

/** 4.6 Lines of defence: who found this quarter's issues. */
export function LinesOfDefence() {
  const first = ISSUES_FOUND.by[0];
  return (
    <Card title="Who finds our problems?">
      <p className="text-[13px] text-slate-800">
        <b>First line found {Math.round((first.n / ISSUES_FOUND.total) * 100)}% of issues</b> <span className="text-slate-500">· aim: most</span>
      </p>
      <div className="mt-1.5 flex h-3 overflow-hidden rounded-full">
        {ISSUES_FOUND.by.map((b) => (
          <span key={b.line} className={b.color} style={{ width: `${(b.n / ISSUES_FOUND.total) * 100}%` }} title={`${b.line}: ${b.n}`} />
        ))}
      </div>
      <div className="mt-2 space-y-0.5">
        {ISSUES_FOUND.by.map((b) => (
          <p key={b.line} className="flex h-9 items-center justify-between border-b border-slate-100 text-xs last:border-b-0">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className={`h-2.5 w-2.5 rounded-sm ${b.color}`} />
              {b.line}
            </span>
            <span className="tabular-nums">
              <b>{b.n}</b> <span className="text-slate-500">of {ISSUES_FOUND.total} · {Math.round((b.n / ISSUES_FOUND.total) * 100)}%</span>
            </span>
          </p>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">{ISSUES_FOUND.total} issues found this quarter.</p>
    </Card>
  );
}

/** 4.7 Risk owner (product) against control owner (operations), per customer journey. */
export function RiskVsControlOwner() {
  const cols = "grid min-h-11 grid-cols-[minmax(150px,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)_110px] items-center gap-3 px-2 py-1 text-[13px] leading-snug";
  return (
    <Card title="Is the right person accountable?">
      <div className={`${cols} !min-h-0 pb-1`}>
        {["Customer journey", "Risk owner (product)", "Control owner (operations)", "Aligned?", "Complaints this quarter"].map((h) => (
          <Label key={h}>{h}</Label>
        ))}
      </div>
      {JOURNEYS.map((j) => (
        <div key={j.journey} className={`${cols} border-t border-slate-100`}>
          <b className="text-slate-900">{j.journey}</b>
          <span className={j.riskOwner ? "text-slate-700" : "font-semibold text-red-600"}>{j.riskOwner ?? "Not named"}</span>
          <span className="text-slate-700">{j.controlOwner}</span>
          <span className="flex flex-wrap items-center gap-2">
            {j.aligned ? (
              <Check className="h-4 w-4 text-emerald-600" aria-label="Aligned" />
            ) : (
              <>
                <Pill tone="red" label="Mismatch" />
                <span className="text-xs text-slate-600">{j.reason}</span>
              </>
            )}
          </span>
          <b className="tabular-nums text-slate-900">{j.complaints}</b>
        </div>
      ))}
    </Card>
  );
}

/* ── AI oversight ────────────────────────────────────────────────────── */

export function AgentValue() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {AGENT_VALUE.map((v) => (
        <div key={v.label} className="rounded-xl border border-violet-200 bg-white px-3 py-2">
          <Label>{v.label}</Label>
          <p className="text-xl font-bold tabular-nums text-violet-800">{v.value}</p>
          <p className="text-[11px] text-slate-500">{v.against}</p>
        </div>
      ))}
    </div>
  );
}

export function AgentFindings() {
  return (
    <Card title="What did the agents find?" right={<AiTag label="AI agent findings" />}>
      {FINDINGS.map((f) => (
        <Opener key={f.finding} drawer={f.drawer} label={f.finding} className="rounded-r hover:bg-slate-50">
          <span className={`flex min-h-11 items-center justify-between gap-3 border-l-[3px] py-1 pl-3 pr-1 text-[13px] leading-snug ${TONE[f.tone].rail}`}>
            <span className="min-w-0">
              <span className="text-slate-900">{f.finding}</span>
              <span className="block text-[11px] text-slate-500">
                {f.impact} · {agentName(f.agentId)} · flagged {f.flagged}
              </span>
            </span>
            <Tag tone={f.tone}>{f.status}</Tag>
          </span>
        </Opener>
      ))}
    </Card>
  );
}

export function TuningSummary() {
  const { state } = useStore();
  return (
    <Card title="Should we tighten the savings check?" right={<AiTag label="AI agent test" />}>
      <p className="mb-1.5 text-xs text-slate-600">{TUNING.proposal}. Tested on 10,000 new accounts.</p>
      {TUNING.options.map((o) => (
        <Row
          key={o.id}
          tone={o.id === "B" ? "green" : o.id === "C" ? "red" : "amber"}
          text={`${o.id} · ${o.label}: catches ${o.caught} of ${TUNING.breaches}`}
          detail={`+${o.extraAlerts.toLocaleString("en-GB")} alerts a month · ${o.capacity.toLowerCase()}`}
          right={o.id === TUNING.recommended ? <AiTag label="Recommended" /> : undefined}
        />
      ))}
      <Row tone="grey" text="How it was tested" detail={TUNING.test} />
      <Row tone="grey" text="Who decides" detail="Risk Committee, after model-risk review" />
      <p className="mt-2.5 text-[11px] text-slate-500">
        {state.session.tuningProposal ? `Option ${state.session.tuningProposal} proposed to the Risk Committee.` : "Decision sits with the Risk Committee."} Nothing goes live without a named approver.
      </p>
    </Card>
  );
}
