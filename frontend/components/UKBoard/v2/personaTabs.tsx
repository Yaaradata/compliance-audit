"use client";

/**
 * UK Board v2 — the 12-measure table and the decision paper.
 * MeasureTable: one row per board measure grouped by tier (Top · Emerging · Obligatory Level 0). With
 * visuals (Board Risk appetite, CRO Risk & roll-up) a row shows the statement, the measure visual,
 * amber trigger, limit, leading or lagging, stance, roll-up and status; the Chair's version is text
 * only (value · threshold · roll-up · pill). A row expands inline to its sparkline, Level 2 rows and
 * red Level 3 controls (ExceptionTree applies the persona's visibility) and names the row's feed.
 */
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { historyOf, measure, measuresByTier, REPORTABLE_EVENTS, thresholdCells, TIER_INFO, type Measure } from "@/lib/ukboard/v2/boardStore";
import { ExceptionTree, RollupChip } from "./appetite";
import { MeasureVisual, Sparkline, StanceLine, StatusStrip } from "./visuals";
import { useDrawer } from "./drawerContext";
import { Card, DeltaMark, LineItem, SourceLine, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { focus, Pill } from "./ui";

/** Column templates: at 1024 amber and limit share a column and type and stance are hidden. */
const VISUAL_COLS = "grid-cols-[20px_minmax(160px,1.6fr)_230px_88px_140px_112px] xl:grid-cols-[20px_minmax(190px,1.6fr)_230px_64px_64px_60px_minmax(110px,1fr)_140px_112px]";
const TEXT_COLS = "grid-cols-[20px_minmax(200px,1.6fr)_minmax(110px,0.9fr)_minmax(150px,1fr)_150px_124px]";

function MeasureTable({ visuals }: { visuals?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = measuresByTier();
  useFigures([...groups.flatMap((g) => g.rows.map((m) => `m:${m.id}`))]);
  const row = `grid min-h-[52px] ${visuals ? VISUAL_COLS : TEXT_COLS} items-center gap-3 px-4 py-1 text-[13px] leading-snug`;
  const head = `${row} !min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`;
  return (
    <Card title="Board measures by tier" flush right={visuals ? <span className="text-xs text-slate-500">Open a row for its trend, Level 2 metrics and Level 3 controls</span> : <StatusStrip />}>
      <div {...(visuals ? { "data-chart": "measure-visuals" } : {})}>
        {visuals ? (
          <div className={head}>
            <span />
            <span>Board measure · risk appetite statement</span>
            <span>Position</span>
            <span className="xl:hidden">Amber · limit</span>
            <span className="hidden xl:block">Amber</span>
            <span className="hidden xl:block">Limit</span>
            <span className="hidden xl:block">Type</span>
            <span className="hidden xl:block">Stance</span>
            <span>Below</span>
            <span className="text-right">Status</span>
          </div>
        ) : (
          <div className={head}>
            <span />
            <span>Board measure</span>
            <span>Value</span>
            <span>Threshold</span>
            <span>Below</span>
            <span className="text-right">Status</span>
          </div>
        )}
        {groups.map((g) => (
          <Fragment key={g.tier}>
            <p className="border-t border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {TIER_INFO[g.tier].label} <span className="font-normal normal-case tracking-normal">· {TIER_INFO[g.tier].meaning}</span>
            </p>
            {g.rows.map((m) => (
              <MeasureRow key={m.id} m={m} row={row} visuals={visuals} expanded={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
            ))}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

function MeasureRow({ m, row, visuals, expanded, onToggle }: { m: Measure; row: string; visuals?: boolean; expanded: boolean; onToggle: () => void }) {
  const { open } = useDrawer();
  const rail = m.status === "red" ? "border-l-red-500" : m.status === "amber" ? "border-l-amber-500" : "border-l-transparent";
  const Icon = expanded ? ChevronDown : ChevronRight;
  const t = thresholdCells(m);
  const h = historyOf(m.id);
  const name = <span className={m.status === "within" ? "text-slate-600" : "font-semibold text-slate-900"}>{m.name}</span>;
  return (
    <div className={`border-l-[3px] border-t border-t-slate-100 ${rail}`}>
      <button type="button" aria-expanded={expanded} onClick={onToggle} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
        {visuals ? (
          <span className={`${row} !pl-[13px]`}>
            <Icon className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="min-w-0">
              {name}
              <span className="block text-xs text-slate-500">{m.statement}</span>
            </span>
            <MeasureVisual m={m} width={120} />
            <span className="text-xs tabular-nums xl:hidden">
              {t.amber} · {t.limit}
            </span>
            <span className="hidden text-xs tabular-nums xl:block">{t.amber}</span>
            <span className="hidden text-xs tabular-nums xl:block">{t.limit}</span>
            <span className="hidden text-xs xl:block">{m.type === "leading" ? "Leading" : "Lagging"}</span>
            <span className="hidden xl:block">
              <StanceLine m={m} short />
            </span>
            <RollupChip m={m} />
            <span className="justify-self-end">
              <StatusPill status={m.status} />
            </span>
          </span>
        ) : (
          <span className={`${row} !pl-[13px]`}>
            <Icon className="h-4 w-4 text-slate-400" aria-hidden />
            {name}
            <span className="tabular-nums">{m.short ?? m.value}</span>
            <span className="text-xs text-slate-500">{m.comparator}</span>
            <RollupChip m={m} />
            <span className="justify-self-end">
              <StatusPill status={m.status} />
            </span>
          </span>
        )}
      </button>
      {expanded ? (
        <div className="px-4 pb-3 pl-10">
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 py-2 text-xs text-slate-500">
            <b className="text-[15px] font-semibold tabular-nums text-slate-900">{m.short ?? m.value}</b>
            {h ? <Sparkline values={h.values} amber={m.amber} limit={m.limit} status={m.status} label={`${m.name}, last ${h.span}`} /> : <span>History from Q3 2026</span>}
            <span className="inline-flex items-center gap-1">
              <DeltaMark d={m.delta} /> vs {m.delta?.since ?? "Q2"}
            </span>
            <span>Risk owner: {m.owner}</span>
          </div>
          <ExceptionTree m={m} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <SourceLine src={{ ids: [m.source.id], note: m.projection ? "projection: 6-month trend" : undefined }} bare />
            <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
              Open {m.name} ›
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** What this session put on the decision paper and the committee agenda. Nothing here is sent. */
function DecisionPaper() {
  const { state } = useStore();
  const s = state.session;
  const items = [
    ...s.paper.map((p) => ({ key: p, text: measure(p.replace(/^stance:/, "")).name, detail: "stance for the decision paper", tag: "Paper" })),
    ...s.invited.map((r) => ({ key: `inv:${r}`, text: r, detail: "invited to present", tag: "Agenda" })),
    ...s.escalated.map((id) => ({ key: `esc:${id}`, text: REPORTABLE_EVENTS.find((e) => e.id === id)?.event ?? id, detail: "escalation note drafted for the decider", tag: "Draft" })),
    ...s.proposals.map((p) => ({ key: `pro:${p}`, text: measure(p.replace(/^tuning:/, "")).name, detail: "tuning proposal with the risk owner", tag: "Proposed" })),
  ];
  return (
    <Card title="Decision paper and agenda" right={<span className="text-xs text-slate-500">This session</span>}>
      {items.map((i) => (
        <LineItem key={i.key} text={i.text} detail={i.detail} right={<Pill tone="grey" outline label={i.tag} />} />
      ))}
      {items.length === 0 ? <p className="border-t border-slate-100 py-2 text-xs text-slate-500">Nothing added yet. Stances, invitations and escalation notes appear here.</p> : null}
    </Card>
  );
}

export const PERSONA_SECTIONS = {
  P_TIERS: () => <MeasureTable />,
  M_TABLE: () => <MeasureTable visuals />,
  M_TABLE_CRO: () => <MeasureTable visuals />,
  P_PAPER: DecisionPaper,
};
