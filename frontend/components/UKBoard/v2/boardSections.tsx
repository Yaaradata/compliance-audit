"use client";

/**
 * UK Board v2 — Board member sections. Every figure comes from lib/ukboard/v2/boardStore.ts;
 * each figure has one home tab and appears at most once per tab (useFigures warns in development).
 * Calm colour: white cards, status on pills and a 3px rail only, numbers in dark ink.
 * Charts only where they show a trend, a comparison on one scale, or a composition.
 * The board member reads, challenges, notes and requests deep dives; he never approves or prepares.
 */
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { CAPACITY, DRAFTS, RESTRICTION } from "@/lib/ukboard/v1/data";
import { AGENT_VALUE, AGENTS, agentName, FINDINGS, QUEUE, TUNING } from "@/lib/ukboard/v2/agentsData";
import { CULTURE, D1_OPTIONS, D2_BOARD_ASKS, D3_OPTIONS, DUE_FOR_REVIEW, ISSUES_FOUND, JOURNEYS, REG_CALENDAR, REGULATOR_RELATIONSHIP, SIGNOFF_HISTORY, SIGNOFF_MONTHS, TENSIONS, type SignOffMark } from "@/lib/ukboard/v2/boardMemberData";
import {
  agentFigures,
  businessLines,
  consumerDuty,
  EMERGING_UNMEASURED,
  FIG,
  fmt,
  issuesFound,
  journeysWithoutOwner,
  measure,
  MEASURES,
  measuresByTier,
  mortgageHeadroomM,
  mortgagePlanPct,
  postureText,
  rateErrorPct,
  routesDecided,
  SINCE_LAST_BOARD,
  signOffTotals,
  stillUnresolved,
  thresholdCells,
  timeToThreshold,
} from "@/lib/ukboard/v2/boardStore";
import { FRANCHISES, owners } from "@/lib/ukboard/v2/boardTabs";
import AppetitePositionChart from "./AppetitePositionChart";
import { useDrawer } from "./drawerContext";
import LineChart from "./LineChart";
import { BoardCard, DeltaMark, LineItem, LinkMore, StatRow, StatusPill, useFigures } from "./present";
import { useGo } from "./sections";
import { useStore } from "./store";
import { AiTag, btn, focus, Label, Pill, toneOf, type Tone } from "./ui";

const VERDICT_WORD = { room_to_grow: "Room to grow", hold: "Hold", fix_first: "Fix first", unverified: "Unconfirmed" } as const;
/** Full bar length in small bar sets (layout constant). */
const FULL = 100;
const railCls = (t: Tone) => (t === "red" ? "border-l-[3px] border-l-red-500" : t === "amber" ? "border-l-[3px] border-l-amber-500" : "");

/* ══ Briefing ═══════════════════════════════════════════════════════════ */

export function BmPosture() {
  useFigures(["f:posture"]);
  const moved = MEASURES.filter((m) => m.delta && m.delta.value !== 0).length;
  return (
    <section className="flex min-h-[48px] flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">Board risk posture</span>
        <Pill tone="amber" label="AMBER" />
      </span>
      <span className="text-[13px] text-slate-800">Mortgages can grow; savings growth is outrunning crime checks.</span>
      <span className="text-xs font-semibold tabular-nums text-slate-700">{postureText()}</span>
      <span className="ml-auto text-xs text-slate-600">Since last board: {moved} measures moved</span>
    </section>
  );
}

/** 4.3 Business-line cards: numbers only, identical structure so heights match. */
export function BusinessLineCards() {
  useFigures(["f:mortgage-growth", "f:mortgage-headroom", "f:savings-growth", "f:savings-limits"]);
  const { open } = useDrawer();
  const lines = businessLines();
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {FRANCHISES.map((f) => {
        const l = lines.find((x) => x.id === f.id)!;
        const tone = toneOf(f.verdict);
        const row = (label: string, text: string | null) => (
          <span className="grid h-11 grid-cols-[72px_minmax(0,1fr)] items-center gap-2 border-t border-slate-100 text-[13px] leading-tight">
            {text ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                <span className="text-slate-900">{text}</span>
              </>
            ) : null}
          </span>
        );
        return (
          <button key={f.id} type="button" onClick={(e) => open(`franchise:${f.id}`, e.currentTarget)} className={`block w-full rounded-xl border border-slate-200 bg-white px-3 pb-1 text-left hover:border-slate-300 ${focus} ${railCls(tone)}`}>
            <span className="flex h-10 items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-900">{f.name}</span>
              <Pill tone={tone} label={VERDICT_WORD[f.verdict]} />
            </span>
            {row("Growth", l.growth)}
            {row("Headroom", l.headroom)}
            {row("Next step", l.next)}
          </button>
        );
      })}
    </div>
  );
}

export function PositionChart() {
  const go = useGo();
  return (
    <BoardCard title="Where are we against appetite?" right={<span className="text-[11px] text-slate-500">{MEASURES.length} board measures</span>}>
      <AppetitePositionChart onEmerging={() => go("growth")} />
    </BoardCard>
  );
}

const DECISIONS = [
  { n: 1, title: "Savings growth vs crime checks", decider: "Board", by: `before ${FIG.dates.campaign}`, rail: "amber" as Tone },
  { n: 2, title: "Restriction breach: report or not?", decider: "Head of Compliance", by: "immediate", rail: "red" as Tone },
  { n: 3, title: "Issue removed from board pack", decider: "Risk Committee Chair", by: FIG.dates.brc, rail: "amber" as Tone },
];

const KEY_DATES: [string, string][] = [
  [FIG.dates.restrictionSignOff, "Restriction sign-off"],
  [FIG.dates.campaign, "Savings campaign starts"],
  [FIG.dates.brc, "Board Risk Committee"],
  [FIG.dates.incidentRules, "New incident-reporting rules"],
];

/** 4.5 Decisions without numbers, then key dates. */
export function DecideAndDates() {
  const go = useGo();
  useFigures(["f:key-dates"]);
  return (
    <BoardCard title="What do you need from us?" right={<LinkMore onClick={() => go("decisions")} label="Decisions" />}>
      {DECISIONS.map((d) => (
        <LineItem key={d.n} rail={d.rail} text={`${d.n}. ${d.title}`} detail={`${d.decider} · ${d.by}`} onClick={() => go("decisions")} right={<span className="text-indigo-700">›</span>} />
      ))}
      <p className="pb-1 pt-3">
        <Label>Key dates</Label>
      </p>
      {KEY_DATES.map(([d, t]) => (
        <span key={t} className="grid h-9 grid-cols-[96px_minmax(0,1fr)] items-center gap-3 border-t border-slate-100 text-[13px]">
          <b className="font-semibold tabular-nums text-slate-900">{d}</b>
          <span className="text-slate-700">{t}</span>
        </span>
      ))}
    </BoardCard>
  );
}

/** 4.6 Dated events since the last board (no measure values). */
export function SinceLastBoard() {
  const { open } = useDrawer();
  return (
    <BoardCard title="What happened since last board?">
      {SINCE_LAST_BOARD.map((e) => (
        <button key={e.text} type="button" onClick={(ev) => open(e.drawer, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-9 grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-0.5 text-[13px] leading-snug ${e.rail !== "grey" ? `pl-2.5 ${railCls(e.rail)}` : ""}`}>
            <b className="font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="text-slate-800">{e.text}</span>
            <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{e.tag}</span>
          </span>
        </button>
      ))}
    </BoardCard>
  );
}

/** 4.7 Standing items, duration only. */
export function StillUnresolved() {
  const { open } = useDrawer();
  useFigures(["f:vuln-quarters", "f:backlog", "f:not-escalated", "f:tradeoff-overdue"]);
  return (
    <BoardCard title="What is still unresolved?">
      {stillUnresolved().map((u) => {
        const [a, b, ...rest] = u.duration.split(" ");
        return <StatRow key={u.text} rail="amber" label={u.text} value={`${a} ${b}`} comparator={rest.join(" ")} onClick={(el) => open(u.drawer, el)} />;
      })}
    </BoardCard>
  );
}

export function PanelCustomers() {
  const go = useGo();
  const c = FIG.complaints;
  const last = c.perThousand.length - 1;
  useFigures(["f:complaints", "f:ombudsman", "f:vuln-exceptions", "f:rate-error"]);
  return (
    <BoardCard title="What are customers telling us?" right={<LinkMore onClick={() => go("customers")} label="Customers" />}>
      <StatRow label={`Complaints ${FIG.complaints.basis}`} value={String(c.perThousand[last])} comparator={`Q2 ${c.perThousand[last - 1]}`} />
      <StatRow label="Ombudsman upholds" value={fmt.pct(c.uphold)} comparator={`Q2 ${fmt.pct(c.upholdQ2)}`} />
      <StatRow label="Vulnerable exceptions" value={String(FIG.vuln.series[FIG.vuln.series.length - 1])} comparator={`amber at ${FIG.vuln.amber}`} />
      <StatRow label="Rate-error customers contacted" value={`${rateErrorPct()}%`} comparator={fmt.nOfM(FIG.rateError.contacted, FIG.rateError.customers)} />
    </BoardCard>
  );
}

export function PanelOwners() {
  const go = useGo();
  const s = signOffTotals();
  const j = journeysWithoutOwner();
  useFigures(["f:signoff-ontime", "f:first-line", "f:journeys-no-owner", "f:escalation-median"]);
  return (
    <BoardCard title="Who owns it?" right={<LinkMore onClick={() => go("ownership")} label="Ownership" />}>
      <StatRow label="Sign-offs on time" value={`${s.onTime} of ${s.cells}`} comparator="owner-months" />
      <StatRow label="First line found" value={`${issuesFound().firstPct}%`} comparator="of issues" />
      <StatRow label="Journeys without a risk owner" value={`${j.n} of ${j.of}`} comparator="journeys" />
      <StatRow label="Median time to escalate" value={`${FIG.escalation.medianMonths} months`} comparator={`${FIG.escalation.issues} issues`} />
    </BoardCard>
  );
}

export function PanelAgents() {
  const go = useGo();
  const { state } = useStore();
  const a = agentFigures(QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length);
  useFigures(["f:agent-findings", "f:agent-drafts", "f:agent-unapproved", "f:pack-hours"]);
  return (
    <BoardCard title="Are the AI agents helping?" right={<LinkMore onClick={() => go("ai")} label="AI oversight" />}>
      <StatRow label="Findings" value={String(a.findings)} comparator="this quarter" />
      <StatRow label="Drafts with the CRO" value={String(a.drafts)} comparator="waiting for a person" />
      <StatRow label="Actions without approval" value={String(a.withoutApproval)} comparator="this quarter" />
      <StatRow label="Pack preparation" value={`${a.packHours} hours`} comparator={`was ${a.packHoursWas}`} />
    </BoardCard>
  );
}

/* ══ Growth & Appetite ══════════════════════════════════════════════════ */

const GROWTH_COLS = "grid min-h-11 grid-cols-[minmax(150px,1fr)_minmax(220px,1.7fr)_minmax(180px,1.3fr)_110px_minmax(180px,1.2fr)] items-center gap-4 px-1 py-1.5 text-[13px] leading-snug";

export function GrowthTable() {
  const { open } = useDrawer();
  const go = useGo();
  useFigures(["f:mortgage-growth", "f:mortgage-headroom", "f:savings-growth", "f:savings-limits", "f:members"]);
  const lines = businessLines();
  const growth: Record<string, string> = {
    O1: `${fmt.gbpBn(FIG.mortgages.lentBn)} of ${fmt.gbpBn(FIG.mortgages.planBn)} plan · ${mortgagePlanPct()}% · pace ${Math.round(FIG.mortgages.pace * 100)}% · book ${fmt.gbpBn(FIG.mortgages.bookBn)}`,
    O2: `+${fmt.gbpBn(FIG.savings.balancesBn)} vs +${fmt.gbpBn(FIG.savings.planBn)} plan · members ${FIG.savings.membersM.toFixed(2)}m, ▲ ${FIG.savings.membersGrowthPct}%`,
    O3: "Wholesale funding inside its ceiling",
    O4: "Consumer Duty detail on Customers ›",
  };
  const headroom: Record<string, string> = {
    O1: `£${mortgageHeadroomM()}m before the appetite limit`,
    O2: lines[1].headroom,
    O3: "Funding headroom narrowing",
    O4: lines[3].headroom,
  };
  return (
    <BoardCard title="Where can we grow?">
      <div className={`${GROWTH_COLS} !min-h-0`}>
        {["Business line", "Growth vs plan", "Headroom", "Verdict", "Next step"].map((h) => (
          <Label key={h}>{h}</Label>
        ))}
      </div>
      {FRANCHISES.map((f) => {
        const l = lines.find((x) => x.id === f.id)!;
        return (
          <button key={f.id} type="button" onClick={(e) => (f.id === "O4" ? go("customers") : open(`franchise:${f.id}`, e.currentTarget))} className={`block w-full border-t border-slate-100 text-left hover:bg-slate-50 ${focus}`}>
            <span className={GROWTH_COLS}>
              <b className="text-slate-900">{f.name}</b>
              <span className="tabular-nums text-slate-900">{growth[f.id]}</span>
              <span className="text-slate-700">{headroom[f.id]}</span>
              <span>
                <Pill tone={toneOf(f.verdict)} label={VERDICT_WORD[f.verdict]} />
              </span>
              <span className="text-slate-700">{l.next}</span>
            </span>
          </button>
        );
      })}
    </BoardCard>
  );
}

/** Type and owner columns show from 1280px. */
const MCOLS = "grid min-h-10 grid-cols-[minmax(130px,1.2fr)_minmax(150px,1.6fr)_70px_84px_minmax(110px,1fr)_70px_120px] items-center gap-3 px-1 py-1 text-[13px] leading-snug xl:grid-cols-[minmax(150px,1.3fr)_minmax(170px,1.6fr)_76px_84px_minmax(120px,1fr)_76px_96px_minmax(120px,1fr)_128px]";

/** All 12 measures with numbers only; includes financial strength and time to threshold. */
export function MeasuresDetail() {
  const { open } = useDrawer();
  useFigures(MEASURES.map((m) => `m:${m.id}`));
  return (
    <BoardCard title="How is each measure moving?" right={<span className="text-[11px] text-slate-500">as at {FIG.dates.asAt}</span>}>
      <div className={`${MCOLS} !min-h-0 text-[10px] font-bold uppercase tracking-wider text-slate-500`}>
        <span>Measure</span>
        <span>Value</span>
        <span className="text-right">Amber</span>
        <span className="text-right">Limit</span>
        <span>Time to threshold</span>
        <span className="text-right">vs Q2</span>
        <span className="hidden xl:block">Type</span>
        <span className="hidden xl:block">Owner</span>
        <span className="text-right">Status</span>
      </div>
      {measuresByTier().map((g) => (
        <div key={g.tier}>
          <p className="border-t border-slate-200 px-1 pt-1.5">
            <Label>{g.tier === "obligatory" ? "Obligatory" : g.tier === "top" ? "Top risks" : "Emerging"}</Label>
          </p>
          {g.rows.map((m) => {
            const t = thresholdCells(m);
            const muted = m.status === "within";
            return (
              <button key={m.id} type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full border-t border-slate-100 text-left hover:bg-slate-50 ${focus}`}>
                <span className={`${MCOLS} ${muted ? "text-slate-500" : "text-slate-900"}`}>
                  <span className={muted ? "" : "font-semibold"}>{m.name}</span>
                  <span className="tabular-nums">{m.value}</span>
                  <span className="text-right tabular-nums">{t.amber}</span>
                  <span className="text-right tabular-nums">{t.limit}</span>
                  <span className="text-xs">{timeToThreshold(m)}</span>
                  <span className="text-right">
                    <DeltaMark d={m.delta} />
                  </span>
                  <span className="hidden text-xs xl:block">{m.type === "early_warning" ? "Early warning" : "Outcome"}</span>
                  <span className="hidden text-xs xl:block">{m.owner}</span>
                  <span className="justify-self-end">
                    <StatusPill status={m.status} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </BoardCard>
  );
}

export function CreditQuality() {
  const c = FIG.credit;
  useFigures(["f:credit"]);
  return (
    <BoardCard title="Is credit quality holding?">
      <StatRow label="Loans above 4.5× income" value={fmt.pct(c.above45, 1)} comparator={`limit ${c.above45Limit}%`} />
      <StatRow label="Arrears 3 months+" value={fmt.pct(c.arrears, 2)} comparator={`appetite ${fmt.pct(c.arrearsAppetite, 1)} · Q2 ${fmt.pct(c.arrearsQ2, 2)}`} />
      <StatRow label="Cost of risk" value={`${c.costOfRiskBps} bps`} comparator={`Q2 ${c.costOfRiskQ2Bps} bps`} />
    </BoardCard>
  );
}

export function EmergingList() {
  return (
    <BoardCard title="Which risks are not yet measured?">
      {EMERGING_UNMEASURED.map((e) => (
        <LineItem key={e.name} text={e.name} detail={`${e.owner ?? "Owner not named"} · ${e.note}`} right={<Pill tone="grey" label="Not measured" />} />
      ))}
    </BoardCard>
  );
}

/** Crime-check capacity: stat rows plus the one trend chart on this tab. */
export function Capacity() {
  const c = FIG.capacity;
  useFigures(["f:handlers", "f:per-handler", "f:restore", "f:cleared"]);
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  return (
    <BoardCard title="Do we have the crime-check capacity?">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div>
          <StatRow label="Qualified handlers" value={String(c.handlers)} comparator="today" />
          <StatRow label="Members per handler" value={fmt.n(c.perHandler)} comparator={`was ${fmt.n(c.perHandlerWas)}`} />
          <StatRow label="To restore the ratio" value={`+${c.restoreNeeded} handlers`} comparator={`about ${fmt.gbpM(c.restoreCostM)} a year`} />
          <StatRow label="Alerts cleared in target" value={fmt.share(c.cleared, c.alerts)} comparator={fmt.nOfM(c.cleared, c.alerts)} />
        </div>
        <div data-chart="capacity-trend">
          <LineChart
            title="Members and handlers, indexed to Q2 2025"
            height={140}
            series={[
              { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.membersM)[i] })) },
              { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: base(CAPACITY.handlers)[i] })), dashed: true },
            ]}
          />
        </div>
      </div>
    </BoardCard>
  );
}

export function BmTradeoffs() {
  const tr = FIG.tradeoff;
  useFigures(["f:tradeoff", "f:tradeoff-overdue"]);
  return (
    <BoardCard title="Which trade-offs did we agree?" right={<span className="text-[11px] text-slate-500">Agreed {tr.agreed} · review {tr.overdueDays} days overdue</span>}>
      <StatRow rail="red" label="Onboarding uplift" value={`+${tr.uplift} pts`} comparator={`limit +${tr.upliftLimit}`} right={<Pill tone="red" label="Broken" />} />
      <StatRow rail="red" label="High-risk acceptance" value={fmt.pct(tr.acceptance, 1)} comparator={`limit ${fmt.pct(tr.acceptanceLimit, 1)}`} right={<Pill tone="red" label="Broken" />} />
      <StatRow label="Onboarding fraud losses" value={`${tr.fraudBp} bp`} comparator={`limit ${tr.fraudLimitBp} bp`} right={<Pill tone="green" label="Within" />} />
      <StatRow rail="red" label="Checks before transacting" value="Floor" comparator="regulatory floor" right={<Pill tone="red" label="Not tradeable" />} />
    </BoardCard>
  );
}

export function PolicyTensions() {
  const { open } = useDrawer();
  return (
    <BoardCard title="Where do our policies conflict?" right={<AiTag label="AI agent found" />}>
      {TENSIONS.map((t) => (
        <button key={t.a} type="button" onClick={(e) => open(t.drawer, e.currentTarget)} className={`block w-full border-t border-slate-100 py-2 text-left hover:bg-slate-50 ${focus} ${t.tone !== "green" ? `pl-2.5 ${railCls(t.tone)}` : ""}`}>
          <span className="flex items-start justify-between gap-3">
            <span className="text-[13px] font-semibold text-slate-900">
              {t.a} <span className="font-normal text-slate-400">vs</span> {t.b}
            </span>
            <Pill tone={t.tone} outline label={t.status} />
          </span>
          <span className="block text-xs text-slate-600">
            {t.effect}
            {t.note ? ` · ${t.note}` : ""}
          </span>
        </button>
      ))}
    </BoardCard>
  );
}

/* ══ Customers ══════════════════════════════════════════════════════════ */

/** Key line per outcome; support shows call wait so vulnerable exceptions keep their own home row. */
const outcomeKey = (o: (typeof FIG.outcomes)[number]) =>
  o.name === "Consumer understanding" ? `Letters understood ${fmt.pct(FIG.letters.pct)} · target ${fmt.pct(FIG.letters.target)}` : o.name === "Consumer support" ? `Median call wait ${FIG.callWait.value} · target ${FIG.callWait.target}` : o.key;

export function DutyOutcomes() {
  const cd = consumerDuty();
  useFigures(["m:u-cd", "f:letters", "f:call-wait"]);
  return (
    <BoardCard title="Are we meeting the Consumer Duty?" right={<span className="text-xs font-semibold tabular-nums text-slate-700">{cd.text}</span>}>
      <div className="grid grid-cols-1 items-start gap-3 pb-1 sm:grid-cols-2 xl:grid-cols-4">
        {FIG.outcomes.map((o) => (
          <div key={o.name} className={`rounded-lg border border-slate-200 px-3 ${railCls(o.status === "amber" ? "amber" : "green")}`}>
            <span className="flex h-10 items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-slate-900">{o.name}</span>
              <Pill tone={o.status === "amber" ? "amber" : "green"} label={o.status === "amber" ? "Amber" : "Within"} />
            </span>
            <span className="flex min-h-10 items-center border-t border-slate-100 py-1 text-[13px] leading-snug text-slate-900">{outcomeKey(o)}</span>
            <span className="flex min-h-9 flex-wrap items-center justify-between gap-x-2 border-t border-slate-100 py-1 text-xs text-slate-500">
              <span className="tabular-nums">
                {o.inTolerance} of {o.measures} measures in tolerance
              </span>
              <span>{o.owner}</span>
            </span>
          </div>
        ))}
      </div>
    </BoardCard>
  );
}

export function ComplaintsTrend() {
  const c = FIG.complaints;
  const last = c.perThousand.length - 1;
  useFigures(["f:complaints", "f:ombudsman"]);
  return (
    <BoardCard title="Are complaints rising?">
      <div data-chart="complaints-trend">
        <LineChart title={`Complaints ${c.basis}`} height={200} series={[{ name: c.basis, points: c.quarters.map((q, i) => ({ label: q, value: c.perThousand[i] })) }]} />
      </div>
      <StatRow label={`Complaints ${FIG.complaints.basis}`} value={String(c.perThousand[last])} comparator={`Q2 ${c.perThousand[last - 1]}`} />
      <StatRow label="Ombudsman upholds" value={fmt.pct(c.uphold)} comparator={`${c.upheld} of ${c.referred} · Q2 ${fmt.pct(c.upholdQ2)}`} />
    </BoardCard>
  );
}

export function ComplaintThemes() {
  useFigures(["f:themes"]);
  const max = Math.max(...FIG.complaints.themes.map((t) => t.share));
  return (
    <BoardCard title="What do customers complain about?" right={<span className="text-[11px] text-slate-500">share of complaints this quarter</span>}>
      <div data-chart="complaint-themes">
        {FIG.complaints.themes.map((t) => (
          <div key={t.theme} className="grid h-10 grid-cols-[200px_minmax(0,1fr)_48px] items-center gap-3 border-t border-slate-100 text-[13px]">
            <span className="text-slate-700">{t.theme}</span>
            <span className="h-2 rounded-full bg-slate-100">
              <span className="block h-2 rounded-full bg-slate-500" style={{ width: `${(t.share / max) * FULL}%` }} />
            </span>
            <b className="text-right font-semibold tabular-nums text-slate-900">{fmt.pct(t.share)}</b>
          </div>
        ))}
      </div>
    </BoardCard>
  );
}

export function VulnerableCustomers() {
  const { open } = useDrawer();
  const v = FIG.vuln;
  useFigures(["f:vuln-exceptions", "f:vuln-quarters"]);
  return (
    <BoardCard title="Are vulnerable customers protected?" rail="amber">
      <StatRow label={`Exceptions ${v.basis}`} value={String(v.series[v.series.length - 1])} comparator={`amber at ${v.amber} · red ${v.red}`} onClick={(el) => open("removed", el)} />
      <StatRow label="Previous quarters" value={v.series.slice(0, -1).join(" → ")} comparator={v.labels.slice(0, -1).join(", ")} />
      <StatRow label="At amber" value={`${v.quartersAmber} quarters`} comparator="dropped from the pack 14 Oct" />
    </BoardCard>
  );
}

export function HarmEvent() {
  const { open } = useDrawer();
  const r = FIG.rateError;
  useFigures(["f:rate-error"]);
  return (
    <BoardCard title="Are we putting harm right?" right={<span className="text-[11px] text-slate-500">mortgage rate error</span>}>
      <StatRow label="Customers contacted" value={`${rateErrorPct()}%`} comparator={fmt.nOfM(r.contacted, r.customers)} onClick={(el) => open("event:e-117", el)} />
      <StatRow label="Still to contact" value={fmt.n(r.customers - r.contacted)} comparator="customers" />
      <StatRow label="Redress estimate" value={fmt.gbpK(r.redressK)} comparator={`complete by ${r.due}`} />
    </BoardCard>
  );
}

export function CustomerSignals() {
  const go = useGo();
  const f = FINDINGS.find((x) => x.agentId === "signals")!;
  return (
    <BoardCard title="What are the agents hearing?" right={<AiTag label="Customer Signals" />}>
      <LineItem rail="amber" text={f.finding} detail={f.impact.toLowerCase()} />
      <LineItem text="Accountable" detail="Chief Customer Officer" />
      <LineItem text="All agent findings" right={<LinkMore onClick={() => go("ai")} label="AI oversight" />} />
    </BoardCard>
  );
}

export function Culture() {
  useFigures(["f:culture"]);
  return (
    <BoardCard title="Do staff feel safe to speak up?">
      <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {CULTURE.map((c) => (
          <StatRow key={c.label} label={c.label} value={c.value} comparator={c.against} />
        ))}
      </div>
    </BoardCard>
  );
}

/* ══ Decisions ══════════════════════════════════════════════════════════ */

const CHALLENGES: Record<number, string[]> = {
  1: ["Restoring capacity finishes after the campaign starts. Then what?", "Why no resourcing decision since August?", "What would pacing growth cost in members?"],
  2: ["When did we first know about the savings pot?", "Who decides each reporting route, and by when?", "Why are the partner-channel openings still not checked?"],
  3: ["Who removed this item, and on what authority?", "Why no action while it stayed at amber?", "What stops an item being dropped silently?"],
};

const openChallenge = (n: number) => window.dispatchEvent(new CustomEvent("ukb-challenge", { detail: n }));

function BoardActions({ n, title }: { n: number; title: string }) {
  const { state, dispatch } = useStore();
  const noted = state.session.notes.some((x) => x.from === `Decision ${n} note`);
  const topic = `Decision ${n}: ${title}`;
  const asked = state.session.deepDives.includes(topic);
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
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

function DecisionKey({ label, value, comparator }: { label: string; value: string; comparator: string }) {
  return (
    <span className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 text-[13px]">
      <span className="text-slate-600">{label}</span>
      <span className="text-right">
        <b className="font-semibold tabular-nums text-slate-900">{value}</b> <span className="text-xs text-slate-500">{comparator}</span>
      </span>
    </span>
  );
}

/** Decision cards: the home for option impacts. No charts. */
export function DecisionCards() {
  const { open } = useDrawer();
  const r = routesDecided();
  useFigures(["m:u-capacity", "m:u-restriction", "f:vuln-quarters", "f:routes-decided", "f:d1-options"]);
  const q = measure("u-capacity");
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
      <BoardCard title="1. Savings growth vs crime checks" rail="amber" right={<span className="text-[11px] text-slate-500">Board · before {FIG.dates.campaign}</span>}>
        <button type="button" onClick={(e) => open("decision:1", e.currentTarget)} className={`block w-full text-left ${focus}`}>
          <DecisionKey label="Alert queue age" value={q.value} comparator={q.comparator} />
        </button>
        <table className="mt-1 w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500">
              {["Option", "Growth", "Risk", "Cost", "To green"].map((h) => (
                <th key={h} className="py-1.5 pr-2 font-bold">
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
                <td className="py-1.5 pr-2 tabular-nums text-slate-700">{o.cost}</td>
                <td className="py-1.5 font-semibold tabular-nums text-slate-900">{o.toGreen}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <BoardActions n={1} title="Savings growth vs crime checks" />
      </BoardCard>
      <BoardCard title="2. Restriction breach: report or not?" rail="red" right={<span className="text-[11px] text-slate-500">Head of Compliance</span>}>
        <button type="button" onClick={(e) => open("decision:2", e.currentTarget)} className={`block w-full text-left ${focus}`}>
          <DecisionKey label="Accounts in breach" value={fmt.nOfM(FIG.restriction.breaches, FIG.restriction.tested)} comparator="checked" />
          <DecisionKey label="Reporting routes decided" value={`${r.decided} of ${r.total}`} comparator="routes" />
        </button>
        <p className="border-t border-slate-100 pt-2 text-xs text-slate-700">Not a board decision: the Head of Compliance decides each reporting route.</p>
        <p className="pt-2">
          <Label>What the board should ask</Label>
        </p>
        {D2_BOARD_ASKS.filter((x) => !/\d/.test(x)).map((x) => (
          <p key={x} className="text-xs text-slate-700">
            · {x}
          </p>
        ))}
        <div className="mt-2">
          <BoardActions n={2} title="Restriction breach: report or not?" />
        </div>
      </BoardCard>
      <BoardCard title="3. Issue removed from board pack" rail="amber" right={<span className="text-[11px] text-slate-500">Chair · {FIG.dates.brc}</span>}>
        <button type="button" onClick={(e) => open("decision:3", e.currentTarget)} className={`block w-full text-left ${focus}`}>
          <DecisionKey label="Vulnerable-customer exceptions at amber" value={`${FIG.vuln.quartersAmber} quarters`} comparator="then dropped" />
        </button>
        {D3_OPTIONS.map((o, i) => (
          <p key={o.option} className="grid min-h-10 grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-2 border-t border-slate-100 text-xs">
            <b className="text-slate-900">
              {o.option}
              {i === 0 ? (
                <span className="ml-1 align-middle">
                  <AiTag label="Recommended" />
                </span>
              ) : null}
            </b>
            <span className="text-right text-slate-600">{o.impact}</span>
          </p>
        ))}
        <BoardActions n={3} title="Issue removed from board pack" />
      </BoardCard>
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
    <BoardCard id="bm-challenges" title="What should we ask?" right={<AiTag label="AI agent drafted" />}>
      {DECISIONS.map((d) => (
        <div key={d.n} className="border-t border-slate-100">
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
    </BoardCard>
  );
}

export function MyNotes() {
  const { state } = useStore();
  const notes = state.session.notes;
  const dives = state.session.deepDives;
  return (
    <BoardCard title={`My notes (${notes.length})`}>
      {notes.length ? notes.map((n) => <LineItem key={n.id} text={n.text} detail={n.from} />) : <p className="border-t border-slate-100 py-2 text-xs text-slate-500">Questions and items you add appear here for the meeting.</p>}
      <p className="pb-0.5 pt-2">
        <Label>Deep dives requested</Label>
      </p>
      {dives.length ? dives.map((d) => <LineItem key={d} rail="amber" text={d} detail="with the CRO" />) : <p className="border-t border-slate-100 py-2 text-xs text-slate-500">None yet.</p>}
    </BoardCard>
  );
}

export function DueForReview() {
  const { open } = useDrawer();
  return (
    <BoardCard title="Which decisions are overdue for review?">
      {DUE_FOR_REVIEW.map((d) => (
        <LineItem key={d.item} rail={d.tone} text={d.item} detail={d.detail} onClick={(el) => open(d.drawer, el)} right={<Pill tone={d.tone} label="Overdue" />} />
      ))}
    </BoardCard>
  );
}

/* ══ Regulator view ═════════════════════════════════════════════════════ */

const ROUTE_LABEL: Record<string, string> = { product: "New savings pot", migration: "Group migration", override: "Branch override" };

/** Restriction health: home for the restriction detail; the one bar set on this tab. */
export function BmRestriction() {
  const { open } = useDrawer();
  const r = FIG.restriction;
  useFigures(["m:u-restriction", "f:restriction-customers", "f:restriction-untested", "f:restriction-routes"]);
  return (
    <BoardCard title="How healthy is the restriction?" rail="red" right={<Pill tone="red" label="Red" />}>
      <StatRow label="Accounts in breach" value={fmt.nOfM(r.breaches, r.tested)} comparator={`appetite 0 · ▲ ${r.breaches - r.previous}`} onClick={(el) => open("restriction", el)} />
      <StatRow label="Customers affected" value={String(r.customers)} comparator={`incl. ${r.exited} previously exited`} />
      <StatRow label="Openings not yet checked" value={fmt.n(r.untested)} comparator="partner channel" />
      <StatRow label="Block fired" value={`${fmt.n(r.blockFired)} times`} comparator="a firing is not adherence" />
      <div className="border-t border-slate-100 pt-2" data-chart="restriction-routes">
        <Label>Breaches by route</Label>
        {RESTRICTION.byRoute.map((b) => (
          <div key={b.route} className="grid h-8 grid-cols-[130px_minmax(0,1fr)_40px] items-center gap-3 text-xs">
            <span className="text-slate-600">{ROUTE_LABEL[b.lane] ?? b.route}</span>
            <span className="h-2 rounded-full bg-slate-100">
              <span className="block h-2 rounded-full bg-slate-500" style={{ width: `${(b.accounts / r.breaches) * FULL}%` }} />
            </span>
            <b className="text-right font-semibold tabular-nums text-slate-900">{b.accounts}</b>
          </div>
        ))}
      </div>
    </BoardCard>
  );
}

export function SanctionsDetail() {
  const s = FIG.sanctions;
  const m = measure("u-sanctions");
  useFigures(["m:u-sanctions"]);
  return (
    <BoardCard title="Is sanctions screening complete?" right={<StatusPill status={m.status} />}>
      <StatRow label="List coverage" value={m.value.split(" · ")[0]} comparator={`${s.rules} rules · ${fmt.n(s.entries)} entries`} />
      <StatRow label="Alerts" value="None" comparator={`${s.weeksNoAlerts} weeks · about ${s.expectedPerWeek} a week expected`} />
      <StatRow label="Owner" value="Financial crime" comparator="sign-off unconfirmed" />
    </BoardCard>
  );
}

export function RegulatorRelationship() {
  return (
    <BoardCard title="Where do we stand with regulators?">
      {REGULATOR_RELATIONSHIP.map((r) => (
        <StatRow key={r.label} rail={r.tone === "red" || r.tone === "amber" ? r.tone : undefined} label={r.label} value={r.value} />
      ))}
    </BoardCard>
  );
}

export function RegulatoryCalendar() {
  useFigures(["f:key-dates"]);
  return (
    <BoardCard title="What is coming up?">
      {REG_CALENDAR.map((c) => (
        <span key={c.item} className="grid min-h-10 grid-cols-[96px_minmax(0,1fr)] items-center gap-3 border-t border-slate-100 text-[13px]">
          <b className="font-semibold tabular-nums text-slate-900">{c.date.replace(" 2026", "")}</b>
          <span className="text-slate-700">{c.item}</span>
        </span>
      ))}
    </BoardCard>
  );
}

/* ══ Ownership ══════════════════════════════════════════════════════════ */

export function BmOwners() {
  const { state } = useStore();
  const { open } = useDrawer();
  const list = owners(Object.fromEntries(Object.values(DRAFTS).map((d) => [d.draftId, d.targetRole])));
  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {list.map((o) => {
        const openN = o.draftIds.filter((id) => state.session.drafts[id]?.status === "ai_draft").length;
        const pill = o.state === "grey" ? "Unconfirmed" : o.state === "green" ? "On track" : o.state === "red" ? "Red" : "Amber";
        return (
          <button key={o.role} type="button" onClick={(e) => open(`owner:${o.role}`, e.currentTarget)} className={`block w-full rounded-xl border border-slate-200 bg-white px-3 pb-1 text-left hover:border-slate-300 ${focus} ${railCls(o.state)}`}>
            <span className="flex min-h-10 items-center justify-between gap-2 py-1">
              <span className="text-[13px] font-bold leading-tight text-slate-900">{o.role}</span>
              <Pill tone={o.state} label={pill} />
            </span>
            <span className="flex h-9 items-center justify-between border-t border-slate-100 text-[13px]">
              <span className="text-slate-600">Measures off track</span>
              <b className="font-semibold tabular-nums text-slate-900">{o.measures.length ? `${o.offTrack} of ${o.measures.length}` : "None held"}</b>
            </span>
            <span className="flex h-9 items-center justify-between border-t border-slate-100 text-[13px]">
              <span className="text-slate-600">Actions open</span>
              <b className="font-semibold tabular-nums text-slate-900">{openN}</b>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const MARK: Record<SignOffMark, { cls: string; word: string }> = {
  on_time: { cls: "bg-slate-400", word: "On time" },
  late: { cls: "bg-amber-500", word: "Late" },
  missing: { cls: "border border-dashed border-slate-400 bg-white", word: "Missing" },
  early: { cls: "bg-red-500", word: "Signed before data check finished" },
};

export function SignOffStrip() {
  const t = signOffTotals();
  useFigures(["f:signoff-ontime"]);
  return (
    <BoardCard title="Do owners sign off every month?" right={<span className="text-xs font-semibold tabular-nums text-slate-700">{t.onTime} of {t.cells} on time · {t.late} late · {t.missing} missing · {t.early} early</span>}>
      <div data-chart="signoff-strip" className="grid grid-cols-[170px_repeat(12,minmax(0,1fr))] items-center gap-1 text-[10px] text-slate-500">
        <span />
        {SIGNOFF_MONTHS.map((m, i) => (
          <span key={m} className={`text-center ${i === SIGNOFF_MONTHS.length - 1 ? "font-bold text-slate-900" : ""}`}>
            {m}
          </span>
        ))}
        {SIGNOFF_HISTORY.map((o) => (
          <div key={o.role} className="contents">
            <span className="flex h-8 items-center text-xs text-slate-800">{o.role}</span>
            {o.marks.map((mk, i) => (
              <span key={i} title={`${SIGNOFF_MONTHS[i]}: ${MARK[mk].word}`} className={`mx-auto h-5 w-full max-w-7 rounded ${MARK[mk].cls}`} />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
        {(Object.keys(MARK) as SignOffMark[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${MARK[k].cls}`} />
            {MARK[k].word}
          </span>
        ))}
        <span className="text-slate-500">Month of the numbers, Oct 2025 – Sep 2026</span>
      </p>
    </BoardCard>
  );
}

const DEFENCE_SHADE = ["bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300"];

export function LinesOfDefence() {
  const f = issuesFound();
  useFigures(["f:first-line", "f:issues-found"]);
  return (
    <BoardCard title="Who finds our problems?" right={<span className="text-xs font-semibold text-slate-700">First line {f.firstPct}% · aim: most</span>}>
      <div data-chart="lines-of-defence" className="mb-1 flex h-4 overflow-hidden rounded-full">
        {ISSUES_FOUND.by.map((b, i) => (
          <span key={b.line} className={DEFENCE_SHADE[i]} style={{ width: `${(b.n / f.total) * FULL}%` }} title={`${b.line}: ${b.n}`} />
        ))}
      </div>
      <div className="mt-2">
        {ISSUES_FOUND.by.map((b, i) => (
          <span key={b.line} className="grid h-10 grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-3 border-t border-slate-100 text-[13px]">
            <span className="flex items-center gap-2 text-slate-700">
              <span className={`h-2.5 w-2.5 rounded-sm ${DEFENCE_SHADE[i]}`} />
              {b.line}
            </span>
            <b className="text-right font-semibold tabular-nums text-slate-900">{b.n}</b>
            <span className="text-xs text-slate-500">of {f.total}</span>
          </span>
        ))}
      </div>
    </BoardCard>
  );
}

const JCOLS = "grid min-h-11 grid-cols-[minmax(160px,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_110px] items-center gap-4 px-1 py-1 text-[13px] leading-snug";

export function RiskVsControlOwner() {
  const j = journeysWithoutOwner();
  useFigures(["f:journeys-no-owner", "f:journey-complaints"]);
  return (
    <BoardCard title="Is the right person accountable?" right={<span className="text-xs font-semibold text-slate-700">{j.n} of {j.of} journeys without a risk owner</span>}>
      <div className={`${JCOLS} !min-h-0 text-[10px] font-bold uppercase tracking-wider text-slate-500`}>
        <span>Customer journey</span>
        <span>Risk owner (product)</span>
        <span>Control owner (operations)</span>
        <span>Aligned?</span>
        <span className="text-right">Complaints this quarter</span>
      </div>
      {JOURNEYS.map((x) => (
        <div key={x.journey} className={`${JCOLS} border-t border-slate-100 ${x.aligned ? "" : railCls("red")}`}>
          <b className="text-slate-900">{x.journey}</b>
          <span className="text-slate-700">{x.riskOwner ?? "Not named"}</span>
          <span className="text-slate-700">{x.controlOwner}</span>
          <span className="flex flex-wrap items-center gap-2">
            {x.aligned ? (
              <Check className="h-4 w-4 text-slate-500" aria-label="Aligned" />
            ) : (
              <>
                <Pill tone="red" label="Mismatch" />
                <span className="text-xs text-slate-600">{x.reason}</span>
              </>
            )}
          </span>
          <b className="text-right font-semibold tabular-nums text-slate-900">{x.complaints}</b>
        </div>
      ))}
    </BoardCard>
  );
}

export function Escalation() {
  const { open } = useDrawer();
  const e = FIG.escalation;
  useFigures(["f:escalation-median", "f:not-escalated", "f:overdue-checks", "f:actions-closed"]);
  return (
    <BoardCard title="Is bad news reaching us early enough?" rail="amber">
      <StatRow label="Median time to the Risk Committee" value={`${e.medianMonths} months`} comparator={`${e.issues} serious issues`} onClick={(el) => open("badnews", el)} />
      <StatRow label="Not escalated after 12 months" value={String(e.notEscalated)} comparator={e.unescalated.map((u) => `${u.unit.split(" ")[0]} ${u.months} months`).join(" · ")} />
      <StatRow label="Customer checks overdue" value={fmt.n(e.overdueChecks)} comparator={`target ${fmt.n(e.overdueTarget)}`} />
      <StatRow label="Actions closed, measure unchanged" value={String(e.actionsClosed)} comparator={`${e.downgraded} issues downgraded`} />
    </BoardCard>
  );
}

export function DataQuality() {
  const { open } = useDrawer();
  const tm = measure("u-tm");
  const ibs = measure("u-ibs");
  useFigures(["m:u-tm", "m:u-ibs"]);
  return (
    <BoardCard title="Can we trust the data?">
      <StatRow label="Monitoring coverage" value={tm.value.split(" ")[0]} comparator={tm.value.split(" ").slice(1).join(" ")} right={<StatusPill status={tm.status} />} onClick={(el) => open("metric:u-tm", el)} />
      <StatRow label="Monitoring sign-off" value="Early" comparator="signed before the data check finished" />
      <StatRow label="Service disruption" value={ibs.value.split(" ")[0]} comparator="of impact tolerance used" right={<DeltaMark d={ibs.delta} />} onClick={(el) => open("metric:u-ibs", el)} />
    </BoardCard>
  );
}

export function BmRemoved() {
  const { open } = useDrawer();
  return (
    <BoardCard title="What was removed or extended?">
      <LineItem rail="red" text="Vulnerable-customer exceptions" detail="removed at Executive Risk Committee 14 Oct, no reason recorded" onClick={(el) => open("removed", el)} right={<Pill tone="red" label="Removed" />} />
      <LineItem rail="amber" text={`Customer-check backlog deadline extended ${FIG.escalation.extensions} times`} detail={`limit ${FIG.escalation.extensionLimit}`} onClick={(el) => open("badnews", el)} right={<Pill tone="amber" label="Extended" />} />
      <p className="flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        <AiTag label="Board Pack agent" /> flagged the removal on 15 Oct
      </p>
    </BoardCard>
  );
}

/* ══ AI oversight ═══════════════════════════════════════════════════════ */

export function AgentStats() {
  const { state } = useStore();
  const a = agentFigures(QUEUE.filter((q) => state.session.drafts[q.draftId]?.status === "ai_draft").length);
  useFigures(["f:agents", "f:agent-checks", "f:agent-findings", "f:agent-drafts", "f:agent-unapproved", "f:pack-hours"]);
  const extra = AGENT_VALUE.filter((v) => v.label === "Found before people did" || v.label === "Data to flag");
  return (
    <BoardCard title="What are the agents doing?" right={<AiTag label="AI agents" />}>
      <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        <div>
          <StatRow label="Agents" value={String(a.agents)} comparator="on the roster" />
          <StatRow label="Checks" value={String(a.checksThisWeek)} comparator="this week" />
          <StatRow label="Findings" value={String(a.findings)} comparator="this quarter" />
          <StatRow label="Drafts with the CRO" value={String(a.drafts)} comparator="waiting for a person" />
        </div>
        <div>
          <StatRow label="Actions without approval" value={String(a.withoutApproval)} comparator="this quarter" />
          <StatRow label="Board pack preparation" value={`${a.packHours} hours`} comparator={`was ${a.packHoursWas} hours`} />
          {extra.map((v) => (
            <StatRow key={v.label} label={v.label} value={v.value} comparator={v.against} />
          ))}
        </div>
      </div>
    </BoardCard>
  );
}

export function AgentFindings() {
  const { open } = useDrawer();
  return (
    <BoardCard title="What did the agents find?" right={<AiTag label="AI agent findings" />}>
      {FINDINGS.map((f) => (
        <button key={f.finding} type="button" onClick={(e) => open(f.drawer, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
          <span className={`grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${f.tone !== "green" && f.tone !== "grey" ? `pl-2.5 ${railCls(f.tone)}` : ""}`}>
            <span>
              <span className="text-slate-900">{f.finding}</span>
              <span className="block text-[11px] text-slate-500">
                {agentName(f.agentId)} · flagged {f.flagged}
              </span>
            </span>
            <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{f.status}</span>
          </span>
        </button>
      ))}
    </BoardCard>
  );
}

const statusTone = { running: "green", waiting: "amber", paused: "grey" } as const;
const statusWord = { running: "Running", waiting: "Waiting", paused: "Paused" } as const;

export function AgentRosterLines() {
  const { open } = useDrawer();
  return (
    <BoardCard title="Which agents do we run?">
      {AGENTS.map((a) => (
        <LineItem key={a.id} text={a.name} detail={`${a.does} · ${a.accountable}`} onClick={(el) => open(`agent:${a.id}`, el)} right={<Pill tone={statusTone[a.status]} label={statusWord[a.status]} />} />
      ))}
    </BoardCard>
  );
}

/** Tuning lab: the one comparison chart on this tab. */
export function TuningComparison() {
  const { state } = useStore();
  useFigures(["f:tuning"]);
  const maxAlerts = Math.max(...TUNING.options.map((o) => o.extraAlerts));
  return (
    <BoardCard title="Should we tighten the savings check?" right={<AiTag label="AI agent test" />}>
      <div data-chart="tuning">
        <div className="grid h-7 grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span>Option</span>
          <span>Breaches caught of {TUNING.breaches}</span>
          <span>Extra alerts a month</span>
        </div>
        {TUNING.options.map((o) => (
          <div key={o.id} className="grid min-h-14 grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-t border-slate-100 py-1.5 text-[13px]">
            <span className="font-semibold text-slate-900">
              {o.id} · {o.label}
              <span className="block text-[11px] font-normal text-slate-500">{o.capacity}</span>
              {o.id === TUNING.recommended ? (
                <span className="mt-0.5 block">
                  <AiTag label="Recommended" />
                </span>
              ) : null}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 flex-1 rounded-full bg-slate-100">
                <span className="block h-2 rounded-full bg-slate-600" style={{ width: `${(o.caught / TUNING.breaches) * FULL}%` }} />
              </span>
              <b className="w-8 text-right font-semibold tabular-nums">{o.caught}</b>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 flex-1 rounded-full bg-slate-100">
                <span className="block h-2 rounded-full bg-slate-400" style={{ width: `${maxAlerts ? (o.extraAlerts / maxAlerts) * FULL : 0}%` }} />
              </span>
              <b className="w-14 text-right font-semibold tabular-nums">{fmt.n(o.extraAlerts)}</b>
            </span>
          </div>
        ))}
      </div>
      <p className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        {state.session.tuningProposal ? `Option ${state.session.tuningProposal} proposed to the Risk Committee.` : "Decision sits with the Risk Committee."} Nothing goes live without a named approver.
      </p>
    </BoardCard>
  );
}
