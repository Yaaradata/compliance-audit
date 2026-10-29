"use client";

/**
 * UK Board v2 — the visual grammar (§3): one form per kind of fact, and each form only for its fact.
 * BulletBar (level against amber trigger and limit) · PipRow (small count, or n of m by status) ·
 * ZeroCounter (zero-appetite count) · Unconfirmed · Sparkline · StatusStrip · StatusHistory ·
 * ProgressPace · HorizonTimeline · RouteMatrix · OptionCompare · StanceLine · AutonomyLadder ·
 * TradeoffPlot · CheckGrid · DataBarCell, and MeasureVisual, the one switch on `visualKind`.
 * Colour: bars, lines and sparklines are ink or grey; status colour only on pills, 3px borders and
 * categorical pips; indigo for links, primary buttons and the recommended outline; purple for ✦.
 */
import { Check, Lock, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  MEASURES,
  pipsOf,
  REPORTABLE_EVENTS,
  planPacePct,
  STATUS_ORDER,
  STATUS_WORD,
  statusAtLastBoard,
  type Measure,
  type MeasureStatus,
  type PipStatus,
} from "@/lib/ukboard/v2/boardStore";
import { ROUTES } from "@/lib/ukboard/v1/data";
import { useStore } from "./store";
import { AiTag, btn, btnPrimary } from "./ui";

const INK = "#0f172a";
const GREY = "#94a3b8";
const BAND = "#e2e8f0";
const BEYOND = "#cbd5e1";
const TRACK = "#f8fafc";
const r1 = (v: number) => Math.round(v * 10) / 10;

/* ── BulletBar ───────────────────────────────────────────────────────── */

/**
 * A level against its amber trigger and appetite limit, on its natural scale. The bad side is shaded
 * light grey from the amber trigger to the limit and darker beyond the limit; the actual value is an
 * ink bar; an optional marker (plan pace) is a hollow tick. The value is printed to the right.
 */
export function BulletBar({ value, amber, limit, scale, lowerIsWorse, marker, display, width = 168, label }: { value: number; amber: number; limit: number; scale: [number, number]; lowerIsWorse?: boolean; marker?: number; display: string; width?: number; label: string }) {
  const [lo, hi] = scale;
  const x = (v: number) => r1(((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * width);
  const band = lowerIsWorse ? [x(limit), x(amber)] : [x(amber), x(limit)];
  const beyond = lowerIsWorse ? [0, x(limit)] : [x(limit), width];
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={width} height={12} viewBox={`0 0 ${width} 12`} role="img" aria-label={label} className="shrink-0">
        <rect x={0} y={2} width={width} height={8} fill={TRACK} />
        <rect x={band[0]} y={2} width={band[1] - band[0]} height={8} fill={BAND} />
        <rect x={beyond[0]} y={2} width={beyond[1] - beyond[0]} height={8} fill={BEYOND} />
        <rect x={0} y={4} width={x(value)} height={4} fill={INK} />
        <line x1={x(amber)} x2={x(amber)} y1={1} y2={11} stroke="#64748b" strokeWidth={1} />
        <line x1={x(limit)} x2={x(limit)} y1={0} y2={12} stroke={INK} strokeWidth={1.5} />
        {marker !== undefined ? <rect x={x(marker) - 1} y={0.5} width={2} height={11} fill="white" stroke={INK} strokeWidth={0.75} /> : null}
      </svg>
      <b className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-slate-900">{display}</b>
    </span>
  );
}

/* ── PipRow ──────────────────────────────────────────────────────────── */

const PIP: Record<PipStatus, string> = {
  within: "bg-emerald-500",
  decided: "bg-emerald-500",
  amber: "bg-amber-500",
  pending: "bg-amber-500",
  red: "bg-red-500",
  open: "border border-slate-400 bg-white",
};

/** A small count against a small limit: one pip per unit up to the limit, filled pips dark. */
export function PipRow({ value, limit, display, label }: { value: number; limit: number; display: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5" role="img" aria-label={label}>
      <span className="inline-flex items-center gap-1">
        {Array.from({ length: limit }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < value ? "bg-slate-900" : "border border-slate-400 bg-white"}`} />
        ))}
        <span className="ml-0.5 h-3.5 w-px bg-slate-900" aria-hidden />
      </span>
      <b className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-slate-900">{display}</b>
    </span>
  );
}

/** n of m outcomes or routes, each pip coloured by its own status. */
export function StatusPips({ items, display }: { items: { label: string; status: PipStatus }[]; display: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex items-center gap-1" role="img" aria-label={display}>
        {items.map((p, i) => (
          <span key={i} title={p.label} className={`h-2.5 w-2.5 rounded-full ${PIP[p.status]}`} />
        ))}
      </span>
      <b className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-slate-900">{display}</b>
    </span>
  );
}

/* ── ZeroCounter and Unconfirmed ─────────────────────────────────────── */

/** A zero-appetite count: any breach is a breach, so no scale. */
export function ZeroCounter({ display, size = "md" }: { display: string; size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-baseline gap-2 border-l-[3px] border-l-red-500 pl-2">
      <b className={`font-semibold tabular-nums text-slate-900 ${size === "lg" ? "text-2xl" : "text-[15px]"}`}>{display}</b>
      <span className="text-xs text-slate-500">appetite 0</span>
    </span>
  );
}

export function Unconfirmed({ width = 168 }: { width?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="block h-3 shrink-0 rounded-sm border border-dashed border-slate-400" style={{ width }} aria-hidden />
      <span className="text-xs leading-tight text-slate-500">Awaiting owner confirmation</span>
    </span>
  );
}

/* ── MeasureVisual: the one switch ───────────────────────────────────── */

/** Renders a board measure in its form (§3 mapping). Used on Strategy, the drawer and the CRO roll-up. */
export function MeasureVisual({ m, width = 168 }: { m: Measure; width?: number }) {
  const display = m.short ?? m.value;
  switch (m.visualKind) {
    case "bullet":
      return <BulletBar value={m.actual!} amber={m.amber!} limit={m.limit!} scale={m.scale!} lowerIsWorse={m.direction === "lowerIsWorse"} marker={m.id === "u-growth" ? planPacePct() : undefined} display={display} width={width} label={`${m.name}: ${display}`} />;
    case "pips":
      return <PipRow value={m.actual!} limit={m.limit!} display={display} label={`${m.name}: ${display}`} />;
    case "pipsStatus": {
      const p = pipsOf(m);
      return <StatusPips items={p.items} display={p.label} />;
    }
    case "zero":
      return <ZeroCounter display={display} />;
    case "unconfirmed":
      return <Unconfirmed width={width} />;
  }
}

/* ── Sparkline ───────────────────────────────────────────────────────── */

/** Direction over time: 96×24, ink line, amber trigger dotted, last point marked, no axes. */
export function Sparkline({ values, amber, label }: { values: number[]; amber?: number; label: string }) {
  const W = 96;
  const H = 24;
  const all = amber !== undefined ? [...values, amber] : values;
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const y = (v: number) => r1(H - 2 - ((v - lo) / (hi - lo || 1)) * (H - 4));
  const x = (i: number) => r1((i / Math.max(values.length - 1, 1)) * (W - 4) + 2);
  const d = values.map((v, i) => `${i ? "L" : "M"} ${x(i)} ${y(v)}`).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="shrink-0">
      {amber !== undefined ? <line x1={0} x2={W} y1={y(amber)} y2={y(amber)} stroke={GREY} strokeWidth={1} strokeDasharray="2 2" /> : null}
      <path d={d} fill="none" stroke={INK} strokeWidth={1.5} />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={2.5} fill="white" stroke={INK} strokeWidth={1.5} />
    </svg>
  );
}

/* ── StatusStrip and StatusHistory ───────────────────────────────────── */

const CELL: Record<MeasureStatus, string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  projected: "border-2 border-amber-500 bg-white",
  unconfirmed: "border border-dashed border-slate-500 bg-white",
  within: "bg-emerald-500",
};

const LEGEND: Record<MeasureStatus, string> = { red: "red", amber: "amber", projected: "heading", unconfirmed: "unconfirmed", within: "within" };

/** All 12 at once: equal cells ordered red → amber → heading → unconfirmed → within. */
export function StatusStrip() {
  const order: MeasureStatus[] = ["red", "amber", "projected", "unconfirmed", "within"];
  const sorted = [...MEASURES].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <span className="inline-flex gap-0.5" role="img" aria-label={order.map((s) => `${MEASURES.filter((m) => m.status === s).length} ${STATUS_WORD[s].toLowerCase()}`).join(", ")}>
        {sorted.map((m) => (
          <span key={m.id} title={`${m.name}: ${STATUS_WORD[m.status]}`} className={`block h-5 w-2 rounded-[1px] ${CELL[m.status]}`} />
        ))}
      </span>
      <span className="flex flex-wrap gap-x-2.5 text-[11px] text-slate-600">
        {order.map((s) => (
          <span key={s}>
            <b className="tabular-nums text-slate-900">{MEASURES.filter((m) => m.status === s).length}</b> {LEGEND[s]}
          </span>
        ))}
      </span>
    </span>
  );
}

const QUARTERS = ["Q4 25", "Q1 26", "Q2 26", "Q3 26"];

/**
 * Status by quarter. The store records the status at the last board (Q2 26) and now (Q3 26); earlier
 * quarters have no record and are hatched rather than invented.
 */
export function StatusHistory() {
  const hatch = "bg-[repeating-linear-gradient(45deg,#e2e8f0_0,#e2e8f0_2px,#fff_2px,#fff_4px)]";
  return (
    <div className="text-[13px]">
      <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,40px)] items-center gap-x-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span>Board measure</span>
        {QUARTERS.map((q) => (
          <span key={q} className="text-center normal-case tracking-normal">
            {q}
          </span>
        ))}
      </div>
      {[...MEASURES]
        .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
        .map((m) => {
          const last = statusAtLastBoard(m);
          return (
            <div key={m.id} className="grid min-h-7 grid-cols-[minmax(0,1fr)_repeat(4,40px)] items-center gap-x-1.5 border-t border-slate-100">
              <span className="truncate text-slate-700">{m.name}</span>
              <span className={`mx-auto h-3.5 w-3.5 rounded-[2px] ${hatch}`} title="No record" />
              <span className={`mx-auto h-3.5 w-3.5 rounded-[2px] ${hatch}`} title="No record" />
              <span className={`mx-auto h-3.5 w-3.5 rounded-[2px] ${last === "new" ? hatch : CELL[last]}`} title={last === "new" ? "New measure" : STATUS_WORD[last]} />
              <span className={`mx-auto h-3.5 w-3.5 rounded-[2px] outline outline-1 outline-offset-1 outline-slate-900 ${CELL[m.status]}`} title={STATUS_WORD[m.status]} />
            </div>
          );
        })}
      <p className="pt-1.5 text-xs text-slate-500">Hatched: no record before the last board · current quarter outlined</p>
    </div>
  );
}

/* ── ProgressPace ────────────────────────────────────────────────────── */

/** Progress to a target: 100% = target, filled to actual, tick where plan pace should be today. */
export function ProgressPace({ actual, target, pace, text, width = 200 }: { actual: number; target: number; pace?: number; text: string; width?: number }) {
  const fill = Math.min(actual / target, 1);
  return (
    <span className="block">
      <span className="relative block h-2 rounded-full bg-slate-100" style={{ width }} role="img" aria-label={text}>
        <span className="absolute inset-y-0 left-0 rounded-full bg-slate-900" style={{ width: `${fill * 100}%` }} />
        {pace !== undefined ? <span className="absolute -top-1 h-4 w-0.5 bg-slate-500" style={{ left: `${Math.min(pace, 1) * 100}%` }} /> : null}
      </span>
      <span className="mt-1 block text-xs tabular-nums text-slate-600">{text}</span>
    </span>
  );
}

/* ── HorizonTimeline ─────────────────────────────────────────────────── */

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Months since Jan 2026 for "31 Jan 2027", "8 Dec" (2026) or "Jul 2027". */
const monthsOf = (d: string) => {
  const p = d.split(" ");
  const year = /^\d{4}$/.test(p[p.length - 1]) ? Number(p[p.length - 1]) : 2026;
  const mi = MONTH.indexOf(p.find((x) => MONTH.includes(x)) ?? "Jan");
  const day = /^\d+$/.test(p[0]) ? Number(p[0]) : 1;
  return (year - 2026) * 12 + mi + (day - 1) / 30;
};

/** Dated future events on one line, Oct 2026 → Jul 2027, with today marked. */
export function HorizonTimeline({ events, today }: { events: { date: string; label: string; tag?: string }[]; today: string }) {
  const start = monthsOf("1 Oct");
  const end = monthsOf("31 Jul 2027");
  const at = (d: string) => `${((monthsOf(d) - start) / (end - start)) * 100}%`;
  const ticks = ["1 Oct", "1 Jan 2027", "1 Apr 2027", "1 Jul 2027"];
  return (
    <div className="relative h-36 px-2" role="img" aria-label={events.map((e) => `${e.date}: ${e.label}`).join("; ")}>
      <div className="absolute inset-x-2 top-[68px] h-px bg-slate-300" />
      {ticks.map((t) => (
        <span key={t} className="absolute top-[74px] -translate-x-1/2 text-[11px] text-slate-400" style={{ left: at(t) }}>
          {t.split(" ").slice(1).join(" ")}
        </span>
      ))}
      <span className="absolute top-[56px] h-6 w-px -translate-x-1/2 bg-indigo-500" style={{ left: at(today) }} />
      <span className="absolute top-[90px] -translate-x-1/2 text-[11px] font-semibold text-indigo-700" style={{ left: at(today) }}>
        Today
      </span>
      {events.map((e, i) => (
        <div key={e.label} className={`absolute w-36 -translate-x-1/2 text-center ${i % 2 ? "top-[96px]" : "top-0"}`} style={{ left: at(e.date) }}>
          {i % 2 ? null : <Label e={e} />}
          <span className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-900 ${i % 2 ? "-top-[33px]" : "top-[63px]"}`} />
          {i % 2 ? <Label e={e} /> : null}
        </div>
      ))}
    </div>
  );
}
function Label({ e }: { e: { date: string; label: string; tag?: string } }) {
  return (
    <span className="block text-xs leading-tight">
      <b className="block font-semibold tabular-nums text-slate-900">{e.date}</b>
      <span className="text-slate-600">{e.label}</span>
      {e.tag ? <span className="block text-[11px] text-slate-400">{e.tag}</span> : null}
    </span>
  );
}

/* ── RouteMatrix ─────────────────────────────────────────────────────── */

export type RouteCell = { status: "decided" | "pending"; clock: string } | null;
const CLOCK_SHORT: Record<string, string> = { "Within the reporting period": "Reporting period" };

/** Events × routes: ● decided, ◐ pending (clock underneath), — not applicable. */
export function RouteMatrix({ rows, cols, compact }: { rows: { key: string; event: ReactNode; cells: RouteCell[]; rail?: "red" | "amber" }[]; cols: string[]; compact?: boolean }) {
  const grid = "grid items-center gap-3";
  const tpl = { gridTemplateColumns: `minmax(160px,1.6fr) repeat(${cols.length}, minmax(72px,1fr))` };
  return (
    <div className="text-[13px]" data-chart="route-matrix">
      <div className={`${grid} min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`} style={tpl}>
        <span>Event</span>
        {cols.map((c) => (
          <span key={c} className="text-center">
            {c}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.key} className={`${grid} min-h-12 border-l-[3px] border-t border-t-slate-100 py-1 pl-2 ${r.rail === "red" ? "border-l-red-500" : r.rail === "amber" ? "border-l-amber-500" : "border-l-transparent"}`} style={tpl}>
          <span className="min-w-0">{r.event}</span>
          {r.cells.map((c, i) => (
            <span key={i} className="text-center leading-tight">
              {c ? (
                <>
                  <span
                    role="img"
                    aria-label={c.status}
                    className={`mx-auto block h-3 w-3 rounded-full border-[1.5px] border-slate-900 ${c.status === "decided" ? "bg-slate-900" : "bg-[linear-gradient(90deg,#0f172a_50%,#fff_50%)]"}`}
                  />
                  {c.status === "pending" ? <span className="block text-[11px] text-slate-500">{CLOCK_SHORT[c.clock] ?? c.clock}</span> : null}
                </>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </span>
          ))}
        </div>
      ))}
      <p className="border-t border-slate-100 pt-1.5 text-xs text-slate-500">{compact ? "● decided · ◐ pending" : "● decided · ◐ pending, clock shown · — no route"}</p>
    </div>
  );
}

/* ── OptionCompare ───────────────────────────────────────────────────── */

export interface CompareOption {
  name: string;
  recommended?: boolean;
  current?: boolean;
  ai?: boolean;
  cells: string[];
}

/** 2–3 options side by side on the same rows; recommended outlined in indigo. */
export function OptionCompare({ rows, options }: { rows: string[]; options: CompareOption[] }) {
  const grid = "grid gap-x-3";
  const tpl = { gridTemplateColumns: `96px repeat(${options.length}, minmax(0,1fr))` };
  return (
    <div className="text-[13px]">
      <div className={`${grid} items-end pb-1.5`} style={tpl}>
        <span />
        {options.map((o) => (
          <span key={o.name} className={`rounded-t-md px-2.5 pt-2 ${o.recommended ? "border-2 border-b-0 border-indigo-500" : "border-2 border-transparent"}`}>
            <b className="block font-semibold leading-snug text-slate-900">{o.name}</b>
            <span className="mt-0.5 flex flex-wrap gap-1">
              {o.recommended ? <AiTag label="Recommended" /> : null}
              {o.current ? <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">Current</span> : null}
              {o.ai && !o.recommended ? <AiTag label="Proposed" /> : null}
            </span>
          </span>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={row} className={`${grid} items-stretch`} style={tpl}>
          <span className="border-t border-slate-100 py-1.5 text-xs font-semibold text-slate-500">{row}</span>
          {options.map((o) => (
            <span key={o.name} className={`border-t border-t-slate-100 px-2.5 py-1.5 text-slate-800 ${o.recommended ? `border-x-2 border-x-indigo-500 ${ri === rows.length - 1 ? "rounded-b-md border-b-2 border-b-indigo-500" : ""}` : "border-x-2 border-x-transparent"}`}>
              {o.cells[ri] || "—"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── StanceLine ──────────────────────────────────────────────────────── */

const STANCE_WORD = { tighten: "Tighten", hold: "Hold", loosen: "Loosen", set: "Set appetite", new: "Not yet set" } as const;

/** Read-only stance with any proposal; the only action adds it to the decision paper. */
export function StanceLine({ m, compact, short }: { m: Measure; compact?: boolean; short?: boolean }) {
  const { state, dispatch } = useStore();
  const item = `stance:${m.id}`;
  const added = state.session.paper.includes(item);
  if (short)
    return (
      <span className="text-xs text-slate-700">
        {STANCE_WORD[m.stance]}
        {m.proposal ? (
          <span className="text-slate-500">
            {" "}
            · proposed <b className="font-semibold text-slate-900">{STANCE_WORD[m.proposal.stance]}</b>
            {m.proposal.ai ? <span className="ml-0.5 text-violet-500">✦</span> : null}
          </span>
        ) : null}
      </span>
    );
  const text = (
    <span className="text-[13px] text-slate-700">
      Board stance <b className="font-semibold text-slate-900">{STANCE_WORD[m.stance]}</b>
      {m.proposal ? (
        <>
          {" "}
          · Proposed <b className="font-semibold text-slate-900">{STANCE_WORD[m.proposal.stance]}</b> by {m.proposal.proposer} {m.proposal.ai ? <AiTag label="✦" /> : null}
        </>
      ) : null}
    </span>
  );
  if (compact) return text;
  return (
    <div className="space-y-1.5">
      <p className="flex flex-wrap items-center gap-x-1">{text}</p>
      {m.proposal ? <p className="text-xs text-slate-500">{m.proposal.text}</p> : null}
      <button type="button" disabled={added} onClick={() => dispatch({ type: "ADD_TO_PAPER", item })} className={added ? btn : btnPrimary}>
        {added ? "Added to decision paper" : "Add to decision paper"}
      </button>
    </div>
  );
}

/* ── AutonomyLadder ──────────────────────────────────────────────────── */

const RUNGS = [
  { id: "watch", label: "Watch" },
  { id: "draft", label: "Draft" },
  { id: "propose", label: "Propose" },
  { id: "act", label: "Act" },
] as const;

/** Which agent sits at which autonomy level; Act is locked by policy. */
export function AutonomyLadder({ agents, renderChip }: { agents: { id: string; name: string; level: string }[]; renderChip?: (a: { id: string; name: string; level: string }) => ReactNode }) {
  return (
    <div className="grid grid-cols-4 gap-2" data-chart="autonomy-ladder">
      {RUNGS.map((r) => (
        <div key={r.id} className={`min-h-32 rounded-md border p-1.5 ${r.id === "act" ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200"}`}>
          <p className="flex items-center gap-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {r.label}
            {r.id === "act" ? <Lock className="h-3 w-3" aria-label="Locked by policy" /> : null}
          </p>
          {r.id === "act" ? <p className="text-[11px] leading-snug text-slate-500">Locked by policy. No agent decides.</p> : null}
          <div className="flex flex-col gap-1">
            {agents
              .filter((a) => a.level === r.id)
              .map((a) =>
                renderChip ? (
                  <span key={a.id}>{renderChip(a)}</span>
                ) : (
                  <span key={a.id} className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[11px] font-semibold leading-snug text-violet-800">
                    ✦ {a.name}
                  </span>
                ),
              )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── TradeoffPlot ────────────────────────────────────────────────────── */

export interface TradeoffPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  recommended?: boolean;
}

/** Two outcomes traded off: one labelled dot per option; recommended outlined; optional shaded zone. */
export function TradeoffPlot({ points, xMax, yMax, xLabel, yLabel, invertY, zoneMaxX, zoneLabel, fmtX = String, fmtY = String }: { points: TradeoffPoint[]; xMax: number; yMax: number; xLabel: string; yLabel: string; invertY?: boolean; zoneMaxX?: number; zoneLabel?: string; fmtX?: (v: number) => string; fmtY?: (v: number) => string }) {
  const W = 240;
  const H = 160;
  const L = 34;
  const B = 26;
  const px = (v: number) => r1(L + (v / xMax) * (W - L - 10));
  const py = (v: number) => r1(invertY ? 8 + (v / yMax) * (H - B - 8) : H - B - (v / yMax) * (H - B - 8));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} against ${xLabel}: ${points.map((p) => `${p.label} ${fmtY(p.y)}, ${fmtX(p.x)}`).join("; ")}`} className="shrink-0 overflow-visible" data-chart="tradeoff">
      {zoneMaxX !== undefined ? (
        <>
          <rect x={L} y={8} width={px(zoneMaxX) - L} height={H - B - 8} fill="#f1f5f9" />
          <text x={L + 4} y={18} fontSize={9} fill="#64748b">
            {zoneLabel}
          </text>
        </>
      ) : null}
      <line x1={L} x2={W - 6} y1={H - B} y2={H - B} stroke={BEYOND} />
      <line x1={L} x2={L} y1={6} y2={H - B} stroke={BEYOND} />
      <text x={L} y={H - 8} fontSize={9} fill="#64748b">
        {xLabel} →
      </text>
      <text x={4} y={12} fontSize={9} fill="#64748b">
        {invertY ? "↑ better" : "↑"}
      </text>
      <text x={8} y={H / 2} fontSize={9} fill="#64748b" transform={`rotate(-90 8 ${H / 2})`} textAnchor="middle">
        {yLabel}
      </text>
      {points.map((p) => (
        <g key={p.id}>
          <circle cx={px(p.x)} cy={py(p.y)} r={p.recommended ? 6 : 4.5} fill={INK} stroke={p.recommended ? "#6366f1" : "none"} strokeWidth={p.recommended ? 3 : 0} paintOrder="stroke" />
          <text x={px(p.x) + 9} y={py(p.y) + 3} fontSize={10} fontWeight={600} fill={INK}>
            {p.label}
          </text>
          <text x={px(p.x) + 9} y={py(p.y) + 14} fontSize={9} fill="#64748b">
            {fmtY(p.y)} · {fmtX(p.x)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── CheckGrid and DataBarCell ───────────────────────────────────────── */

export function CheckGrid({ checks, labels }: { checks: boolean[]; labels: string[] }) {
  return (
    <span className="inline-flex gap-4" role="img" aria-label={labels.map((l, i) => `${l}: ${checks[i] ? "yes" : "no"}`).join(", ")}>
      {checks.map((ok, i) => (
        <span key={labels[i]} className="inline-flex w-6 justify-center" title={labels[i]}>
          {ok ? <Check className="h-4 w-4 text-slate-900" aria-hidden /> : <X className="h-4 w-4 text-red-600" aria-hidden />}
        </span>
      ))}
    </span>
  );
}

/** A number with a thin grey bar behind it, scaled to the column maximum. */
export function DataBarCell({ value, max, display }: { value: number; max: number; display: string }) {
  return (
    <span className="relative block w-full py-0.5 text-right">
      <span className="absolute inset-y-1 right-0 rounded-sm bg-slate-100" style={{ width: `${(value / max) * 100}%` }} aria-hidden />
      <b className="relative font-semibold tabular-nums text-slate-900">{display}</b>
    </span>
  );
}


/* ── Reportable events as a route matrix (store-driven) ──────────────── */

const ROUTE_COLS: { label: string; match: RegExp }[] = [
  { label: "FCA", match: /^FCA/ },
  { label: "PRA", match: /^PRA/ },
  { label: "SAR", match: /Suspicious/ },
  { label: "Conduct rules", match: /Conduct rule/ },
];

/** The reportable events against the four routes, from the store's events and routes. */
export function EventRouteMatrix({ detail, compact }: { detail?: (e: (typeof REPORTABLE_EVENTS)[number]) => ReactNode; compact?: boolean }) {
  const rows = REPORTABLE_EVENTS.map((e) => ({
    key: e.id,
    rail: e.breached ? ("red" as const) : undefined,
    event: (
      <span className="block leading-snug">
        <b className="font-semibold text-slate-900">{e.event}</b>
        {compact ? null : <span className="block text-xs text-slate-500">{detail ? detail(e) : `Found ${e.found} · ${e.decider}`}</span>}
      </span>
    ),
    cells: ROUTE_COLS.map((c): RouteCell => {
      const r = ROUTES.find((x) => x.eventId === e.id && c.match.test(x.name));
      return r ? { status: r.status === "decided" ? "decided" : "pending", clock: r.clock } : null;
    }),
  }));
  return <RouteMatrix rows={rows} cols={ROUTE_COLS.map((c) => c.label)} compact={compact} />;
}
