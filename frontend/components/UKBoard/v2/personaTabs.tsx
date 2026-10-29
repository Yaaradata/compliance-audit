"use client";

/**
 * UK Board v2 — Chair and CRO sections (§6): the tier roll-up (one row per board measure, expanding
 * to its exception tree) and the decision paper (what this session added, invited, escalated or
 * proposed). Visibility follows §2.2 through ExceptionTree: the Chair sees Level 2 rows not within
 * appetite and Level 3 reds; the CRO can show every Level 2 row.
 */
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { measure, measuresByTier, REPORTABLE_EVENTS, TIER_INFO, type Measure } from "@/lib/ukboard/v2/boardStore";
import { ExceptionTree, RollupChip } from "./appetite";
import { MeasureVisual } from "./visuals";
import { useDrawer } from "./drawerContext";
import { Card, LineItem, StatusPill, useFigures } from "./present";
import { useStore } from "./store";
import { focus, Pill } from "./ui";

function TierRollup({ visuals }: { visuals?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = measuresByTier();
  useFigures([...groups.flatMap((g) => g.rows.map((m) => `m:${m.id}`))]);
  const cols = visuals ? "grid-cols-[20px_minmax(200px,1.6fr)_216px_150px_minmax(140px,1fr)_124px]" : "grid-cols-[20px_minmax(200px,1.6fr)_minmax(110px,0.9fr)_150px_minmax(140px,1fr)_124px]";
  const row = `grid min-h-10 ${cols} items-center gap-3 px-4 py-1 text-[13px] leading-snug`;
  return (
    <Card title="Risk tiers and roll-up" flush right={<span className="text-xs text-slate-500">Open a measure for its Level 2 metrics and Level 3 controls</span>}>
      <div {...(visuals ? { "data-chart": "measure-visuals" } : {})}>
        <div className={`${row} !min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>
          <span />
          <span>Board measure</span>
          <span>{visuals ? "Position" : "Value"}</span>
          <span>Below</span>
          <span>Risk owner</span>
          <span className="text-right">Status</span>
        </div>
        {groups.map((g) => (
          <Fragment key={g.tier}>
            <p className="border-t border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {TIER_INFO[g.tier].label} <span className="font-normal normal-case tracking-normal">· {TIER_INFO[g.tier].meaning}</span>
            </p>
            {g.rows.map((m) => (
              <TierRow key={m.id} m={m} row={row} visuals={visuals} expanded={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
            ))}
          </Fragment>
        ))}
      </div>
    </Card>
  );
}

function TierRow({ m, row, visuals, expanded, onToggle }: { m: Measure; row: string; visuals?: boolean; expanded: boolean; onToggle: () => void }) {
  const { open } = useDrawer();
  const rail = m.status === "red" ? "border-l-red-500" : m.status === "amber" ? "border-l-amber-500" : "border-l-transparent";
  const Icon = expanded ? ChevronDown : ChevronRight;
  return (
    <div className={`border-l-[3px] border-t border-t-slate-100 ${rail}`}>
      <button type="button" aria-expanded={expanded} onClick={onToggle} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
        <span className={`${row} !pl-[13px]`}>
          <Icon className="h-4 w-4 text-slate-400" aria-hidden />
          <span className={m.status === "within" ? "text-slate-600" : "font-semibold text-slate-900"}>{m.name}</span>
          {visuals ? <MeasureVisual m={m} width={100} /> : <span className="tabular-nums">{m.short ?? m.value}</span>}
          <RollupChip m={m} />
          <span className="text-xs text-slate-500">{m.owner}</span>
          <span className="justify-self-end">
            <StatusPill status={m.status} />
          </span>
        </span>
      </button>
      {expanded ? (
        <div className="px-4 pb-3 pl-10">
          <ExceptionTree m={m} />
          <button type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`mt-2 rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
            Open {m.name} ›
          </button>
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
  P_TIERS: () => <TierRollup />,
  P_TIERS_DIAL: () => <TierRollup visuals />,
  P_PAPER: DecisionPaper,
};
