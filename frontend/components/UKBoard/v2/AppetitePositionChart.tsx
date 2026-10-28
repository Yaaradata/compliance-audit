"use client";

/**
 * UK Board v2 — Appetite position: the one appetite visual on the Board member Briefing.
 * All 12 measures on one scale ("% of appetite used", 0–120%; further right = worse for every
 * row: lower-is-worse measures are normalised as limit ÷ value). Amber trigger and limit are thin
 * lines; actual is a solid marker, projection a hollow one. Within rows are muted; unconfirmed
 * rows show a grey dashed bar with no marker. Rows open the measure drawer.
 */
import { EMERGING_UNMEASURED, FIG, measuresByTier, position, type Measure } from "@/lib/ukboard/v2/boardStore";
import { useDrawer } from "./drawerContext";
import { DeltaMark, StatusPill, useFigures } from "./present";
import { focus } from "./ui";

const SCALE_MAX = 120;
const at = (v: number) => `${(Math.min(v, SCALE_MAX) / SCALE_MAX) * 100}%`;
const TIER_LABEL = { obligatory: "Obligatory", top: "Top", emerging: "Emerging" } as const;

const OWNER_SHORT: Record<string, string> = {
  "Head of Financial Crime": "Financial crime",
  "Data owner (payments)": "Payments data",
  "Chief Customer Officer": "Customer",
  Treasurer: "Treasurer",
  "Chief Credit Officer": "Credit",
  "Chief Financial Officer": "Finance",
  "Chief Operating Officer": "Operations",
};

const COLS = "grid h-9 grid-cols-[minmax(150px,1.15fr)_minmax(150px,1.5fr)_minmax(150px,1.35fr)_70px_100px_128px] items-center gap-3 px-2";

function Bar({ m }: { m: Measure }) {
  const p = position(m);
  if (m.status === "unconfirmed") return <span className="block h-2 rounded-full border border-dashed border-slate-400" aria-label="Unconfirmed: no position shown" />;
  if (m.direction === "status" && m.id !== "u-restriction") {
    return <span className="block h-2 rounded-full bg-amber-100" aria-label="Status from outcomes; no numeric scale" />;
  }
  const muted = m.status === "within";
  return (
    <span className="relative block h-3" role="img" aria-label={`${Math.round(p.actual ?? 0)}% of appetite used`}>
      <span className={`absolute inset-x-0 top-1 h-1 rounded-full ${muted ? "bg-slate-100" : "bg-slate-200"}`} />
      {p.amber !== undefined ? <span className="absolute -top-0.5 h-4 w-px bg-amber-500" style={{ left: at(p.amber) }} /> : null}
      <span className="absolute -top-0.5 h-4 w-px bg-red-500" style={{ left: at(p.limit) }} />
      {p.projection !== undefined ? <span className="absolute top-0 h-3 w-2 -translate-x-1/2 rounded-sm border-2 border-slate-700 bg-white" style={{ left: at(p.projection) }} /> : null}
      {p.actual !== undefined ? <span className={`absolute top-0 h-3 w-2 -translate-x-1/2 rounded-sm ${muted ? "bg-slate-400" : "bg-slate-900"}`} style={{ left: at(p.actual) }} /> : null}
    </span>
  );
}

export default function AppetitePositionChart({ onEmerging }: { onEmerging: () => void }) {
  const { open } = useDrawer();
  const groups = measuresByTier();
  useFigures(groups.flatMap((g) => g.rows.map((m) => `m:${m.id}`)));
  return (
    <div data-chart="appetite-position">
      <div className={`${COLS} h-7 text-[10px] font-bold uppercase tracking-wider text-slate-500`}>
        <span>Measure</span>
        <span>% of appetite used</span>
        <span>Value</span>
        <span className="text-right">vs Q2</span>
        <span>Owner</span>
        <span className="text-right">Status</span>
      </div>
      {groups.map((g) => (
        <div key={g.tier}>
          <p className="border-t border-slate-200 px-2 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{TIER_LABEL[g.tier]}</p>
          {g.rows.map((m) => {
            const muted = m.status === "within";
            return (
              <button key={m.id} type="button" onClick={(e) => open(`metric:${m.id}`, e.currentTarget)} className={`block w-full text-left hover:bg-slate-50 ${focus}`}>
                <span className={`${COLS} text-[13px] ${muted ? "text-slate-500" : "text-slate-900"}`}>
                  <span className={muted ? "" : "font-semibold"}>{m.name}</span>
                  <Bar m={m} />
                  <span className="tabular-nums leading-tight">
                    {m.value}
                    {m.comparator ? <span className="text-xs text-slate-500"> · {m.comparator}</span> : null}
                  </span>
                  <span className="text-right">
                    <DeltaMark d={m.delta} />
                  </span>
                  <span className="truncate text-xs text-slate-500">{OWNER_SHORT[m.owner] ?? m.owner}</span>
                  <span className="justify-self-end">
                    <StatusPill status={m.status} />
                  </span>
                </span>
              </button>
            );
          })}
          {g.tier === "emerging" ? (
            <button type="button" onClick={onEmerging} className={`mx-2 mt-1 rounded text-xs font-semibold text-indigo-700 hover:underline ${focus}`}>
              {EMERGING_UNMEASURED.length} emerging risks not yet measured ›
            </button>
          ) : null}
        </div>
      ))}
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-2 pt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-2 rounded-sm bg-slate-900" /> Where we are
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-2 rounded-sm border-2 border-slate-700" /> Projection
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-px bg-amber-500" /> Amber trigger
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-px bg-red-500" /> Limit (100%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full border border-dashed border-slate-400" /> Unconfirmed: no position
        </span>
        <span>Further right is worse · measures as at {FIG.dates.asAt}</span>
      </p>
    </div>
  );
}
