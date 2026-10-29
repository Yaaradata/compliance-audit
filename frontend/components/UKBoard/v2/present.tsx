"use client";

/**
 * UK Board v2 — component library (one set for all three personas).
 * PageHeader · PostureStrip · KpiTile · StatList/StatRow · MeasureTable · OwnerTable · EventList ·
 * ChartCard · StatusPill (+ verdict, tension and workflow pills) · Card.
 * Rules: white cards with a 1px border and a 40px header; status colour only on pills, a 3px rail on
 * red/amber rows and chart threshold lines; numbers in dark ink, tabular, right-aligned; the posture
 * strip is the only tinted block. The figure registry warns (dev only) when a figure repeats on a tab.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  deltaText,
  measuresByTier,
  MEASURES,
  position,
  postureCounts,
  STATUS_WORD,
  thresholdCells,
  timeToThreshold,
  type AttestState,
  type Delta,
  type Measure,
  type MeasureStatus,
} from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { focus, Pill, type Tone } from "./ui";

export const STATUS_TONE: Record<MeasureStatus, Tone> = { red: "red", amber: "amber", projected: "amber", within: "green", unconfirmed: "grey" };
const RAIL: Record<Tone, string> = { red: "border-l-red-500", amber: "border-l-amber-500", green: "border-l-transparent", grey: "border-l-transparent" };
/** Every row reserves the 3px rail so rows with and without status line up. */
export const rowRail = (t?: Tone) => `border-l-[3px] pl-2.5 ${t ? RAIL[t] : "border-l-transparent"}`;

/* ── Figure registry ─────────────────────────────────────────────────── */

const Registry = createContext<Map<string, number> | null>(null);

export function FigureRegistry({ tab, children }: { tab: string; children: ReactNode }) {
  const [map] = useState(() => new Map<string, number>());
  return (
    <Registry.Provider value={map} key={tab}>
      {children}
    </Registry.Provider>
  );
}

export function useFigures(ids: string[]) {
  const map = useContext(Registry);
  const key = ids.join("|");
  useEffect(() => {
    if (!map || process.env.NODE_ENV !== "development") return;
    const list = key.split("|").filter(Boolean);
    for (const id of list) {
      const n = (map.get(id) ?? 0) + 1;
      map.set(id, n);
      if (n > 1) console.warn(`[UK Board] figure "${id}" rendered ${n} times on this tab`);
    }
    (window as unknown as { __ukbFigures?: Map<string, number> }).__ukbFigures = map;
    return () => {
      for (const id of list) map.set(id, (map.get(id) ?? 1) - 1);
    };
  }, [map, key]);
}

/* ── Pills: one vocabulary ───────────────────────────────────────────── */

export function StatusPill({ status }: { status: MeasureStatus }) {
  return <Pill tone={STATUS_TONE[status]} outline={status === "projected"} label={STATUS_WORD[status]} />;
}

export type Verdict = "room_to_grow" | "hold" | "fix_first" | "unverified";
const VERDICT: Record<Verdict, [Tone, string]> = { room_to_grow: ["green", "Room to grow"], hold: ["amber", "Hold"], fix_first: ["red", "Fix first"], unverified: ["grey", "Unconfirmed"] };
export const VerdictPill = ({ v }: { v: Verdict }) => <Pill tone={VERDICT[v][0]} label={VERDICT[v][1]} />;

export type Limit = "within" | "broken" | "floor";
const LIMIT: Record<Limit, [Tone, string]> = { within: ["green", "Within"], broken: ["red", "Broken"], floor: ["red", "Regulatory floor"] };
export const LimitPill = ({ l }: { l: Limit }) => <Pill tone={LIMIT[l][0]} label={LIMIT[l][1]} />;

export type Workflow = "due" | "overdue" | "decided" | "draft" | "proposed" | "approved";
const FLOW: Record<Workflow, [Tone, string]> = { due: ["amber", "Due"], overdue: ["red", "Overdue"], decided: ["green", "Decided"], draft: ["grey", "Draft"], proposed: ["amber", "Proposed"], approved: ["green", "Approved"] };
export const FlowPill = ({ w }: { w: Workflow }) => <Pill tone={FLOW[w][0]} outline label={FLOW[w][1]} />;

const ATTEST: Record<AttestState | "none", [Tone, string] | null> = { attested: ["green", "Attested"], due: ["amber", "Due"], unconfirmed: ["grey", "Unconfirmed"], none: null };
export function AttestPill({ a }: { a: AttestState | "none" }) {
  const v = ATTEST[a];
  return v ? <Pill tone={v[0]} outline={a !== "unconfirmed"} label={v[1]} /> : <span className="text-xs text-slate-400">—</span>;
}

/* ── Page and cards ──────────────────────────────────────────────────── */

export function PageHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h1 className="text-[22px] font-semibold leading-7 text-slate-900">{title}</h1>
      {meta ? <p className="text-xs text-slate-500">{meta}</p> : null}
    </div>
  );
}

export function Card({ title, right, rail, children, className = "", id, flush }: { title?: string; right?: ReactNode; rail?: Tone; children: ReactNode; className?: string; id?: string; flush?: boolean }) {
  const railCls = rail === "red" || rail === "amber" ? `border-l-[3px] ${RAIL[rail]}` : "";
  return (
    <section id={id} className={`rounded-lg border border-slate-200 bg-white ${flush ? "" : "px-4 pb-3"} ${railCls} ${className}`}>
      {title ? (
        <div className={`flex h-10 items-center justify-between gap-3 ${flush ? "px-4" : ""}`}>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}
/** Back-compat alias. */
export const BoardCard = Card;

export function LinkMore({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
      {label} ›
    </button>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap rounded border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">{children}</span>;
}

/** The only tinted block. Five computed counts. */
export function PostureStrip({ sentence, detail }: { sentence: string; detail?: string[] }) {
  const c = postureCounts();
  const chips: [string, number][] = [
    ["within", c.within],
    ["heading for amber", c.projected],
    ["amber", c.amber],
    ["red", c.red],
    ["unconfirmed", c.unconfirmed],
  ];
  useFigures(["f:posture"]);
  return (
    <section data-tinted="posture" className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2">
      <Pill tone="amber" label="Amber" />
      <span className="text-[13px] text-slate-800">{sentence}</span>
      <span className="ml-auto flex flex-wrap gap-1.5">
        {chips.map(([l, n]) => (
          <span key={l} className="rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-700">
            <b className="tabular-nums text-slate-900">{n}</b> {l}
          </span>
        ))}
      </span>
      {detail?.length ? (
        <span className="flex basis-full flex-wrap gap-x-4 text-xs text-slate-700">
          {detail.map((d) => (
            <span key={d} className="tabular-nums">
              {d}
            </span>
          ))}
        </span>
      ) : null}
    </section>
  );
}

export function KpiTile({ label, value, comparator, pill, rail, onClick }: { label: string; value: string; comparator?: string; pill?: ReactNode; rail?: Tone; onClick?: (el: HTMLElement) => void }) {
  const body = (
    <span className={`flex h-[88px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left ${rail === "red" || rail === "amber" ? `border-l-[3px] ${RAIL[rail]}` : ""}`}>
      <span className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {pill}
      </span>
      <span className="text-2xl font-semibold leading-7 tabular-nums text-slate-900">{value}</span>
      <span className="truncate text-xs text-slate-500">{comparator}</span>
    </span>
  );
  return onClick ? (
    <button type="button" onClick={(e) => onClick(e.currentTarget)} className={`block w-full rounded-lg hover:shadow-sm ${focus}`}>
      {body}
    </button>
  ) : (
    body
  );
}

/* ── Rows ────────────────────────────────────────────────────────────── */

export function DeltaMark({ d }: { d?: Delta }) {
  if (!d || d.value === 0) return <span className="text-xs text-slate-400">—</span>;
  return <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${d.worse ? "text-red-600" : "text-emerald-700"}`}>{deltaText(d)}</span>;
}

/** Label · right-aligned number · muted comparator · optional pill. 36px rows. */
export function StatRow({ label, value, comparator, rail, right, onClick }: { label: string; value: string; comparator?: string; rail?: Tone; right?: ReactNode; onClick?: (el: HTMLElement) => void }) {
  const body = (
    <span className={`grid min-h-9 grid-cols-[minmax(0,1fr)_auto_minmax(72px,0.9fr)] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail(rail)}`}>
      <span className="text-slate-700">{label}</span>
      <b className="text-right font-semibold tabular-nums text-slate-900">{value}</b>
      <span className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs text-slate-500">
        <span>{comparator}</span>
        {right}
      </span>
    </span>
  );
  return onClick ? (
    <button type="button" onClick={(e) => onClick(e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
      {body}
    </button>
  ) : (
    body
  );
}

export interface StatRowData {
  label: string;
  value: string;
  comparator?: string;
  rail?: Tone;
  right?: ReactNode;
  onClick?: (el: HTMLElement) => void;
}

export function StatList({ title, right, rows, rail, figures = [] }: { title: string; right?: ReactNode; rail?: Tone; rows: StatRowData[]; figures?: string[] }) {
  useFigures(figures);
  return (
    <Card title={title} right={right} rail={rail}>
      {rows.map((r) => (
        <StatRow key={r.label} {...r} />
      ))}
    </Card>
  );
}

/** One-line item with optional rail and right slot. */
export function LineItem({ text, detail, rail, right, onClick }: { text: string; detail?: string; rail?: Tone; right?: ReactNode; onClick?: (el: HTMLElement) => void }) {
  const body = (
    <span className={`flex min-h-9 items-center justify-between gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail(rail)}`}>
      <span className="min-w-0 text-slate-800">
        {text}
        {detail ? <span className="text-slate-500"> · {detail}</span> : null}
      </span>
      {right}
    </span>
  );
  return onClick ? (
    <button type="button" onClick={(e) => onClick(e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
      {body}
    </button>
  ) : (
    body
  );
}

export function EventList({ title, right, items }: { title: string; right?: ReactNode; items: { date: string; text: string; tag?: string; rail?: Tone; drawer?: string }[] }) {
  const { open } = useDrawer();
  return (
    <Card title={title} right={right}>
      {items.map((e) => {
        const row = (
          <span className={`grid min-h-9 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-1 text-[13px] leading-snug ${rowRail(e.rail)}`}>
            <b className="font-semibold tabular-nums text-slate-900">{e.date}</b>
            <span className="text-slate-800">{e.text}</span>
            {e.tag ? <Chip>{e.tag}</Chip> : <span />}
          </span>
        );
        return e.drawer ? (
          <button key={e.text} type="button" onClick={(ev) => open(e.drawer!, ev.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
            {row}
          </button>
        ) : (
          <div key={e.text}>{row}</div>
        );
      })}
    </Card>
  );
}

/** Generic table inside a card: header row plus rows; numbers right-aligned by column flag. */
export function Table({ title, right, cols, head, rows, rightCols = [] }: { title: string; right?: ReactNode; cols: string; head: string[]; rows: { key: string; cells: ReactNode[]; rail?: Tone; onClick?: (el: HTMLElement) => void }[]; rightCols?: number[] }) {
  const grid = `grid min-h-9 ${cols} items-center gap-3 px-4 py-1 text-[13px] leading-snug`;
  return (
    <Card title={title} flush right={right}>
      <div className={`${grid} !min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>
        {head.map((h, i) => (
          <span key={h} className={rightCols.includes(i) ? "text-right" : ""}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r) => {
        const rail = r.rail === "red" ? "border-l-red-500" : r.rail === "amber" ? "border-l-amber-500" : "border-l-transparent";
        const inner = (
          <span className={`${grid} !pl-[13px]`}>
            {r.cells.map((c, i) => (
              <span key={i} className={rightCols.includes(i) ? "justify-self-end text-right tabular-nums" : "min-w-0"}>
                {c}
              </span>
            ))}
          </span>
        );
        return r.onClick ? (
          <button key={r.key} type="button" onClick={(e) => r.onClick!(e.currentTarget)} className={`block w-full border-l-[3px] border-t border-t-slate-100 text-left hover:bg-slate-50 ${rail} ${focus}`}>
            {inner}
          </button>
        ) : (
          <div key={r.key} className={`border-l-[3px] border-t border-t-slate-100 ${rail}`}>
            {inner}
          </div>
        );
      })}
    </Card>
  );
}

/* ── Measure table ───────────────────────────────────────────────────── */

const TIER_LABEL = { obligatory: "Obligatory risks · Level 0", top: "Top risks", emerging: "Emerging risks" } as const;
/** Short owner names for tables (full role in the drawer). */
export const OWNER_SHORT: Record<string, string> = {
  "Head of Financial Crime": "Financial crime",
  "Data owner (payments)": "Payments data",
  "Chief Customer Officer": "Customer",
  Treasurer: "Treasurer",
  "Chief Credit Officer": "Credit",
  "Chief Financial Officer": "Finance",
  "Chief Operating Officer": "Operations",
};
const BAR_SCALE = 120;
const at = (v: number) => `${(Math.min(v, BAR_SCALE) / BAR_SCALE) * 100}%`;

/** 80px inline appetite bar (one scale: share of appetite used; further right is worse). */
function AppetiteBar({ m }: { m: Measure }) {
  const p = position(m);
  if (m.status === "unconfirmed") return <span className="block h-2 w-20 rounded-full border border-dashed border-slate-400" aria-label="Unconfirmed: no position" />;
  if (m.direction === "status" && m.id !== "u-restriction") return <span className="block w-20 text-xs text-slate-400">—</span>;
  const muted = m.status === "within";
  return (
    <span className="relative block h-3 w-20" role="img" aria-label={`${Math.round(p.actual ?? 0)} per cent of appetite used`}>
      <span className={`absolute inset-x-0 top-1 h-1 rounded-full ${muted ? "bg-slate-100" : "bg-slate-200"}`} />
      {p.amber !== undefined ? <span className="absolute -top-0.5 h-4 w-px bg-amber-500" style={{ left: at(p.amber) }} /> : null}
      <span className="absolute -top-0.5 h-4 w-px bg-red-500" style={{ left: at(p.limit) }} />
      {p.actual !== undefined ? <span className={`absolute top-0 h-3 w-1.5 -translate-x-1/2 rounded-sm ${muted ? "bg-slate-400" : "bg-slate-900"}`} style={{ left: at(p.actual) }} /> : null}
    </span>
  );
}

export function MeasureTable({ title, variant, inlineBar, onWithin }: { title: string; variant: "exceptions" | "full"; inlineBar?: boolean; onWithin?: () => void }) {
  const { open } = useDrawer();
  const groups = measuresByTier()
    .map((g) => ({ ...g, rows: variant === "exceptions" ? g.rows.filter((m) => m.status !== "within") : g.rows }))
    .filter((g) => g.rows.length);
  const shown = groups.flatMap((g) => g.rows);
  useFigures(shown.map((m) => `m:${m.id}`));
  const within = MEASURES.filter((m) => m.status === "within").length;
  const full = variant === "full";
  const cols = full
    ? `grid min-h-9 ${inlineBar ? "grid-cols-[minmax(130px,1.3fr)_84px_minmax(110px,1.2fr)_56px_64px_minmax(100px,1fr)_64px_96px_minmax(84px,0.8fr)_110px]" : "grid-cols-[minmax(130px,1.3fr)_minmax(120px,1.3fr)_56px_64px_minmax(100px,1fr)_64px_96px_minmax(84px,0.8fr)_120px]"} items-center gap-3 px-4 py-1 text-[13px] leading-snug`
    : "grid min-h-9 grid-cols-[minmax(140px,1.3fr)_minmax(120px,1.2fr)_minmax(100px,1fr)_64px_minmax(90px,0.8fr)_120px] items-center gap-3 px-4 py-1 text-[13px] leading-snug";
  const head = full ? ["Measure", ...(inlineBar ? ["Appetite"] : []), "Value", "Amber trigger", "Appetite limit", "To threshold", "vs Q2", "Type", "Risk owner", "Status"] : ["Measure", "Value", "Threshold", "vs Q2", "Risk owner", "Status"];
  const rightHead = new Set(["Amber trigger", "Appetite limit", "vs Q2", "Status"]);
  return (
    <Card title={title} flush right={full ? <span className="text-xs text-slate-500">{`${MEASURES.length} measures`}</span> : undefined}>
      <div {...(inlineBar ? { "data-chart": "appetite-bar" } : {})}>
        <div className={`${cols} !min-h-7 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>
          {head.map((h) => (
            <span key={h} className={rightHead.has(h) ? "text-right" : ""}>
              {h}
            </span>
          ))}
        </div>
        {groups.map((g) => (
          <div key={g.tier}>
            <p className="border-t border-slate-200 px-4 pb-0.5 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{TIER_LABEL[g.tier]}</p>
            {g.rows.map((m) => {
              const t = thresholdCells(m);
              const muted = m.status === "within";
              const rail = m.status === "red" ? "border-l-red-500" : m.status === "amber" ? "border-l-amber-500" : "border-l-transparent";
              return (
                <button key={m.id} type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full border-l-[3px] border-t border-t-slate-100 text-left hover:bg-slate-50 ${rail} ${focus}`}>
                  <span className={`${cols} !pl-[13px] ${muted ? "text-slate-500" : "text-slate-900"}`}>
                    <span className={muted ? "" : "font-semibold"}>{m.name}</span>
                    {full && inlineBar ? <AppetiteBar m={m} /> : null}
                    <span className="tabular-nums">{m.short ?? m.value}</span>
                    {full ? (
                      <>
                        <span className="text-right tabular-nums">{t.amber}</span>
                        <span className="text-right tabular-nums">{t.limit}</span>
                        <span className="text-xs">{timeToThreshold(m)}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">{m.comparator || "—"}</span>
                    )}
                    <span className="text-right">
                      <DeltaMark d={m.delta} />
                    </span>
                    {full ? <span className="text-xs">{m.type === "leading" ? "Leading" : "Lagging"}</span> : null}
                    <span className="text-xs text-slate-500">{OWNER_SHORT[m.owner] ?? m.owner}</span>
                    <span className="justify-self-end">
                      <StatusPill status={m.status} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {!full && onWithin ? (
          <button type="button" onClick={onWithin} className={`flex h-9 w-full items-center border-t border-slate-200 px-4 text-left text-[13px] text-slate-600 hover:bg-slate-50 ${focus}`}>
            {within} within appetite <span className="ml-1 font-semibold text-indigo-700">›</span>
          </button>
        ) : null}
      </div>
    </Card>
  );
}

/* ── Owner table ─────────────────────────────────────────────────────── */

export function OwnerTable({ rows }: { rows: { role: string; measures: Measure[]; offTrack: number; actions: number; attest: AttestState | "none"; status: MeasureStatus | "none" }[] }) {
  const { open } = useDrawer();
  useFigures(["f:owners"]);
  return (
    <Table
      title="Risk owners"
      right={<span className="text-xs text-slate-500">{rows.length} owners</span>}
      cols="grid-cols-[minmax(180px,1.6fr)_88px_80px_96px_minmax(140px,1fr)_130px]"
      head={["Risk owner", "Board measures", "Off track", "Actions open", "Attestation this month", "Status"]}
      rightCols={[1, 2, 3, 5]}
      rows={rows.map((o) => ({
        key: o.role,
        rail: o.status === "red" ? "red" : o.status === "amber" ? "amber" : undefined,
        onClick: (el) => open(`owner:${o.role}`, el),
        cells: [
          <b key="r" className="font-semibold text-slate-900">
            {o.role}
          </b>,
          <b key="m" className="font-semibold">{o.measures.length}</b>,
          <b key="o" className="font-semibold">{o.offTrack}</b>,
          <b key="a" className="font-semibold">{o.actions}</b>,
          <AttestPill key="t" a={o.attest} />,
          o.status === "none" ? (
            <span key="s" className="text-xs text-slate-400">
              No board measure
            </span>
          ) : (
            <StatusPill key="s" status={o.status} />
          ),
        ],
      }))}
    />
  );
}

/* ── Chart card ──────────────────────────────────────────────────────── */

export function ChartCard({ id, title, right, children }: { id: string; title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <Card title={title} right={right}>
      <div data-chart={id}>{children}</div>
    </Card>
  );
}

/** Horizontal bars (themes, routes, tuning): label · bar · right-aligned number. */
/** `wide` gives the value column room for a pair such as "94 · +2,100" on one line. */
export function BarRows({ rows, max, wide }: { rows: { label: string; value: number; display?: string; tag?: ReactNode }[]; max: number; wide?: boolean }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className={`grid min-h-9 ${wide ? "grid-cols-[minmax(120px,0.9fr)_minmax(0,1.4fr)_112px]" : "grid-cols-[minmax(120px,0.9fr)_minmax(0,1.4fr)_56px]"} items-center gap-3 border-t border-slate-100 py-1 text-[13px]`}>
          <span className="text-slate-700">
            {r.label}
            {r.tag ? <span className="ml-1.5 align-middle">{r.tag}</span> : null}
          </span>
          <span className="h-2 rounded-full bg-slate-100">
            <span className="block h-2 rounded-full bg-slate-500" style={{ width: `${max ? (r.value / max) * 100 : 0}%` }} />
          </span>
          <b className="whitespace-nowrap text-right font-semibold tabular-nums text-slate-900">{r.display ?? r.value}</b>
        </div>
      ))}
    </>
  );
}
