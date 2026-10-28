"use client";

/**
 * UK Board v2 — the one board page: B headline, C where can we grow, D what is off track,
 * E what must the board decide, F four compact panels. Faces carry figures, not paragraphs;
 * every row, tile, card and panel opens the drawer. Status colour sits only on pills,
 * dial zones, delta arrows and a 3px left edge.
 */
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ChevronRight, Unlink } from "lucide-react";
import { CAPACITY, DRAFTS, HORIZON, PEOPLE, ROUTES } from "@/lib/ukboard/v1/data";
import type { Status } from "@/lib/ukboard/v1/types";
import {
  DECISION_COUNT,
  EMERGING,
  headlineCounts,
  headlineSentence,
  HEADLINE_COUNT,
  METRICS,
  OBJECTIVES,
  offTrackByTier,
  onTrack,
  rowState,
  TIER_LABEL,
  verdict,
  VERDICT_LABEL,
  VERDICT_STATUS,
  type DrawerKey,
  type MetricMeta,
} from "@/lib/ukboard/v2/board";
import { useBoard } from "../v1/state/boardStore";
import { ui } from "../v1/theme";
import AppetiteDial from "./AppetiteDial";
import LineChart from "./LineChart";
import { useDrawer } from "./drawerContext";

/* ── Small shared pieces ─────────────────────────────────────────────── */

const PILL: Record<Status | "projected", string> = {
  within_appetite: "border-[var(--ukb-green-solid)] text-[var(--ukb-green)]",
  amber: "border-[var(--ukb-amber-solid)] bg-[var(--ukb-amber-solid)] text-white",
  red: "border-[var(--ukb-red-solid)] bg-[var(--ukb-red-solid)] text-white",
  unverified: "border-[var(--ukb-grey)] text-[var(--ukb-grey)]",
  not_assessed: "border-dashed border-[var(--ukb-grey)] text-[var(--ukb-grey)]",
  projected: "border-[var(--ukb-amber-solid)] text-[var(--ukb-amber)]",
};

export function Pill({ state, label, outline }: { state: Status | "projected"; label: string; outline?: boolean }) {
  const cls = outline
    ? state === "red"
      ? "border-[var(--ukb-red-solid)] text-[var(--ukb-red)]"
      : state === "amber"
        ? "border-[var(--ukb-amber-solid)] text-[var(--ukb-amber)]"
        : PILL[state]
    : PILL[state];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] ${cls}`}>
      {state === "unverified" ? <Unlink className="h-3 w-3" aria-hidden /> : null}
      {label}
    </span>
  );
}

const EDGE: Partial<Record<Status | "projected", string>> = {
  red: "border-l-[3px] border-l-[var(--ukb-red-solid)]",
  amber: "border-l-[3px] border-l-[var(--ukb-amber-solid)]",
};

export function Card({ children, edge, className = "" }: { children: ReactNode; edge?: Status | "projected"; className?: string }) {
  return (
    <div className={`rounded-[10px] border border-[var(--ukb-border)] bg-[var(--ukb-surface)] p-4 ${edge ? (EDGE[edge] ?? "") : ""} ${className}`}>{children}</div>
  );
}

function SectionTitle({ id, title, right }: { id: string; title: string; right?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-sm font-semibold text-[var(--ukb-text)]">
        {title}
      </h2>
      {right}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ukb-subtle)]">{children}</span>;
}

/** Whole-surface button that opens a drawer. */
function Opener({ drawer, children, className = "", label }: { drawer: DrawerKey; children: ReactNode; className?: string; label: string }) {
  const { open } = useDrawer();
  return (
    <button type="button" aria-label={label} onClick={(e) => open(drawer, e.currentTarget)} className={`block w-full text-left ${ui.focus} ${className}`}>
      {children}
    </button>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── B  Board headline (rule-built) ──────────────────────────────────── */

export function BoardHeadline() {
  const c = headlineCounts();
  const chip = (text: string, target: string, state: Status) => (
    <button
      type="button"
      onClick={() => scrollToId(target)}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--ukb-border)] bg-[var(--ukb-surface)] px-2 py-1 text-xs font-semibold text-[var(--ukb-text)] hover:bg-[var(--ukb-surface-2)] ${ui.focus}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${state === "within_appetite" ? "bg-[var(--ukb-green-solid)]" : state === "amber" ? "bg-[var(--ukb-amber-solid)]" : "border border-[var(--ukb-grey)]"}`}
        aria-hidden
      />
      {text}
    </button>
  );
  return (
    <section aria-labelledby="b-title" className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 id="b-title" className="text-lg font-semibold text-[var(--ukb-text)]">
          {headlineSentence()}
        </h1>
        <p className="text-xs text-[var(--ukb-subtle)]" title="Generated from the 12 headline measures. Adds no figures.">
          From the data as at 30 Sep 2026
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {chip(`${c.within_appetite} of ${HEADLINE_COUNT} within appetite`, "d-title", "within_appetite")}
        {chip(`${DECISION_COUNT} decisions due`, "e-title", "amber")}
        {chip(`${c.unverified} figures not yet verified`, "e-unverified", "unverified")}
      </div>
    </section>
  );
}

/* ── C  Where can we grow? ───────────────────────────────────────────── */

export function WhereCanWeGrow() {
  const { open } = useDrawer();
  return (
    <section aria-labelledby="c-title">
      <SectionTitle
        id="c-title"
        title="Where can we grow?"
        right={
          <button type="button" onClick={(e) => open("unmapped", e.currentTarget)} className={`text-xs ${ui.link} ${ui.focus}`}>
            1 plan item has no appetite statement ›
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {OBJECTIVES.map((o) => {
          const v = verdict(o);
          const m = o.dialUnitId ? METRICS.find((x) => x.unitId === o.dialUnitId) : undefined;
          return (
            <Opener key={o.id} drawer={o.drawer} label={`${o.name}: ${VERDICT_LABEL[v]}. ${o.line}`} className="rounded-[10px]">
              <Card edge={v === "fix_first" ? "red" : v === "hold" ? "amber" : undefined} className="flex h-[112px] flex-col justify-between hover:border-[var(--ukb-track)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[var(--ukb-text)]">{o.name}</span>
                  <Pill state={VERDICT_STATUS[v]} label={VERDICT_LABEL[v]} outline />
                </div>
                {m?.dial ? (
                  <div className="flex items-center gap-3">
                    <AppetiteDial dial={m.dial} direction={m.direction} className="flex-1" />
                    <span className="whitespace-nowrap text-base font-semibold tabular-nums text-[var(--ukb-text)]">{o.dialLabel}</span>
                  </div>
                ) : (
                  <span className="text-base font-semibold tabular-nums text-[var(--ukb-text)]">{o.figure}</span>
                )}
                <span className="truncate text-xs text-[var(--ukb-muted)]">{o.line}</span>
              </Card>
            </Opener>
          );
        })}
      </div>
    </section>
  );
}

/* ── D  What is off track? ───────────────────────────────────────────── */

const ROW_GRID = "grid grid-cols-[12px_minmax(150px,1.3fr)_minmax(80px,0.75fr)_minmax(0,1.2fr)_60px_38px_minmax(0,1.3fr)_auto] items-center gap-2.5";

function Glyph({ state }: { state: Status | "projected" }) {
  const cls =
    state === "red"
      ? "bg-[var(--ukb-red-solid)]"
      : state === "amber"
        ? "bg-[var(--ukb-amber-solid)]"
        : state === "projected"
          ? "border-2 border-[var(--ukb-amber-solid)]"
          : state === "within_appetite"
            ? "bg-[var(--ukb-green-solid)]"
            : "border border-dashed border-[var(--ukb-grey)]";
  return <span className={`h-2.5 w-2.5 rounded-full ${cls}`} aria-hidden />;
}

function pillFor(m: MetricMeta) {
  const s = rowState(m);
  if (s === "projected") return <Pill state="projected" label={m.projectionText === "amber in about 9 weeks" ? "Amber ~9 weeks" : (m.projectionText?.replace("amber ", "Amber ") ?? "Amber soon")} />;
  if (s === "within_appetite") return <Pill state="within_appetite" label="Within" />;
  return <Pill state={s} label={s === "unverified" ? "Unverified" : s === "red" ? "Red" : "Amber"} />;
}

function MetricRow({ m }: { m: MetricMeta }) {
  const s = rowState(m);
  return (
    <Opener drawer={`metric:${m.unitId}`} label={`${m.name}: ${m.value} ${m.denominator}`} className="hover:bg-[var(--ukb-surface-2)]">
      <div className={`${ROW_GRID} h-[50px] border-b border-[var(--ukb-border)] px-2 text-[13px]`}>
        <Glyph state={s} />
        <span className="truncate font-medium text-[var(--ukb-text)]">{m.name}</span>
        <span className="max-w-[180px]">{m.dial ? <AppetiteDial dial={m.dial} direction={m.direction} /> : <span className="text-[var(--ukb-subtle)]">—</span>}</span>
        <span className="truncate tabular-nums">
          <span className="font-semibold text-[var(--ukb-text)]">{m.value}</span> <span className="text-xs text-[var(--ukb-subtle)]">{m.denominator}</span>
        </span>
        <span className={`inline-flex items-center gap-0.5 whitespace-nowrap text-xs tabular-nums ${m.delta?.worse ? "text-[var(--ukb-red)]" : "text-[var(--ukb-green)]"}`}>
          {m.delta ? (
            <>
              {m.delta.text.startsWith("+") ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />}
              {m.delta.text.replace(/^[+−-]/, "")}
            </>
          ) : (
            <span className="text-[var(--ukb-subtle)]">—</span>
          )}
        </span>
        <span className="rounded border border-[var(--ukb-border)] px-1 text-center text-[10px] font-medium text-[var(--ukb-muted)]">{m.indicatorType === "leading" ? "Lead" : "Lag"}</span>
        <span className="truncate text-xs text-[var(--ukb-muted)]">{m.owner}</span>
        <span className="justify-self-end">{pillFor(m)}</span>
      </div>
    </Opener>
  );
}

export function OffTrack() {
  const [showGreens, setShowGreens] = useState(false);
  const groups = offTrackByTier();
  const greens = onTrack();
  return (
    <section aria-labelledby="d-title" className="flex h-full flex-col">
      <SectionTitle id="d-title" title="What is off track?" />
      <Card className="flex flex-1 flex-col px-2 py-1">
        <div className={`${ROW_GRID} px-2 pb-1 pt-2`}>
          <span />
          <Label>Measure</Label>
          <Label>Appetite</Label>
          <Label>Now</Label>
          <Label>vs Q2</Label>
          <Label>Type</Label>
          <Label>Owner</Label>
          <span className="justify-self-end">
            <Label>Status</Label>
          </span>
        </div>
        {groups.map((g) => (
          <div key={g.tier}>
            <p className="px-2 pb-1 pt-3">
              <Label>{TIER_LABEL[g.tier]}</Label>
            </p>
            {g.rows.map((m) => (
              <MetricRow key={m.unitId} m={m} />
            ))}
            {g.tier === "emerging"
              ? EMERGING.map((e) => (
                  <Opener key={e.unitId} drawer="panel:F4" label={`${e.name}: not measured`} className="hover:bg-[var(--ukb-surface-2)]">
                    <div className={`${ROW_GRID} h-[50px] border-b border-[var(--ukb-border)] px-2 text-[13px]`}>
                      <Glyph state="not_assessed" />
                      <span className="truncate font-medium text-[var(--ukb-text)]">{e.name}</span>
                      <span className="text-[var(--ukb-subtle)]">—</span>
                      <span className="text-xs text-[var(--ukb-subtle)]">not measured</span>
                      <span className="text-[var(--ukb-subtle)]">—</span>
                      <span className="text-center text-[10px] text-[var(--ukb-subtle)]">—</span>
                      <span className="truncate text-xs text-[var(--ukb-muted)]">{e.owner}</span>
                      <span className="justify-self-end">
                        <Pill state="not_assessed" label="No metric" />
                      </span>
                    </div>
                  </Opener>
                ))
              : null}
          </div>
        ))}
        <button
          type="button"
          aria-expanded={showGreens}
          onClick={() => setShowGreens(!showGreens)}
          className={`mt-auto flex h-10 w-full items-center gap-2 px-2 text-left text-[13px] text-[var(--ukb-text)] hover:bg-[var(--ukb-surface-2)] ${ui.focus}`}
        >
          <Check className="h-4 w-4 text-[var(--ukb-green)]" aria-hidden />
          {greens.length} more within appetite
          <span className={`${ui.link}`}>· {showGreens ? "hide" : "show"}</span>
        </button>
        {showGreens ? greens.map((m) => <MetricRow key={m.unitId} m={m} />) : null}
      </Card>
    </section>
  );
}

/* ── E  What must the board decide? ──────────────────────────────────── */

interface DecisionDef {
  n: 1 | 2 | 3;
  title: string;
  key: string;
  keyState: Status;
  support: string;
  decider: string;
  drawer: DrawerKey;
}

const DECISIONS: DecisionDef[] = [
  { n: 1, title: "Savings growth vs crime checks", key: "Queue 19 days (amber 14)", keyState: "amber", support: "30,160 members per handler (was 25,000)", decider: "CEO and board · before 08 Dec campaign", drawer: "decision:1" },
  { n: 2, title: "Restriction breach: report or not?", key: "112 accounts of 9,400 tested", keyState: "red", support: "24,000 openings untested", decider: "Head of Compliance · FCA and PRA: immediate", drawer: "decision:2" },
  { n: 3, title: "Issue dropped from board pack", key: "Amber 3 quarters", keyState: "amber", support: "Removed at ERC 14 Oct, no reason", decider: "BRC chair · 15 Dec BRC", drawer: "decision:3" },
];

function Confirm({ text, onConfirm, onCancel }: { text: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="mt-2 rounded-md border border-[var(--ukb-border)] bg-[var(--ukb-surface-2)] p-2 text-xs">
      <p className="text-[var(--ukb-text)]">{text}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onConfirm} className={`${ui.primaryButton} ${ui.focus}`}>
          Confirm
        </button>
        <button type="button" onClick={onCancel} className={`${ui.button} ${ui.focus}`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function DecisionActions({ d }: { d: DecisionDef }) {
  const { state, dispatch } = useBoard();
  const { open } = useDrawer();
  const [pending, setPending] = useState<string | null>(null);
  const [chairChoice, setChairChoice] = useState<string | null>(null);
  const chair = state.viewer === "brc_chair_preview";

  if (d.n === 1) {
    const ds = state.session.drafts["d-t25-choice"];
    if (ds.status !== "ai_draft") {
      const opt = DRAFTS["d-t25-choice"].options?.find((o) => o.id === ds.chosenOptionId)?.label;
      return <p className="text-xs font-semibold text-[var(--ukb-text)]">Proposed: {opt} · decision pending</p>;
    }
    if (chair) return <p className="text-xs text-[var(--ukb-subtle)]">With CRO · proposal pending</p>;
    return (
      <>
        <div className="flex gap-2">
          {DRAFTS["d-t25-choice"].options!.map((o) => (
            <button key={o.id} type="button" onClick={() => setPending(o.id)} className={`${ui.button} ${ui.focus} flex-1`}>
              {o.id === "pace" ? "Pace growth" : o.label}
            </button>
          ))}
        </div>
        {pending ? (
          <Confirm
            text={`Propose "${DRAFTS["d-t25-choice"].options!.find((o) => o.id === pending)!.label}" to the CEO and board? It is recorded as proposed; they decide.`}
            onConfirm={() => {
              dispatch({ type: "GATE_ACCEPT", draftId: "d-t25-choice", optionId: pending });
              setPending(null);
            }}
            onCancel={() => setPending(null)}
          />
        ) : null}
      </>
    );
  }

  if (d.n === 2) {
    const sent = ROUTES.filter((r) => r.caseDraftId && state.session.drafts[r.caseDraftId]?.status === "sent_to_owner").length;
    if (chair) return <p className="text-xs text-[var(--ukb-subtle)]">With CRO · proposal pending</p>;
    return (
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={(e) => open("decision:2", e.currentTarget)} className={`${ui.button} ${ui.focus}`}>
          Open prepared case
        </button>
        {sent ? <span className="text-xs text-[var(--ukb-muted)]">{sent} sent to Head of Compliance</span> : null}
      </div>
    );
  }

  // Decision 3: CRO proposes restoring the item; the chair records the agenda decision.
  const restore = state.session.drafts["d-t235-restore"];
  const chairDraft = DRAFTS["d-t234-options"];
  const chairState = state.session.drafts["d-t234-options"];
  if (chair) {
    if (chairState.status !== "ai_draft") {
      const opt = chairDraft.options?.find((o) => o.id === chairState.chosenOptionId)?.label;
      return <p className="text-xs font-semibold text-[var(--ukb-text)]">Recorded by {PEOPLE.chair.name}: {opt}</p>;
    }
    return (
      <fieldset>
        <legend className="sr-only">Decision for the BRC chair</legend>
        <div className="flex flex-col gap-1">
          {chairDraft.options!.map((o) => (
            <label key={o.id} className="inline-flex items-center gap-2 text-xs text-[var(--ukb-text)]">
              <input type="radio" name="chair-d3" value={o.id} checked={chairChoice === o.id} onChange={() => setChairChoice(o.id)} className={ui.focus} />
              {o.label}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={!chairChoice}
          onClick={() => chairChoice && dispatch({ type: "CHAIR_RECORD", draftId: "d-t234-options", optionId: chairChoice })}
          className={`${ui.primaryButton} ${ui.focus} mt-2`}
        >
          Record decision
        </button>
      </fieldset>
    );
  }
  if (restore.status !== "ai_draft") return <p className="text-xs font-semibold text-[var(--ukb-text)]">Restored to the draft pack · awaiting pack approval</p>;
  return (
    <>
      <button type="button" onClick={() => setPending("restore")} className={`${ui.button} ${ui.focus}`}>
        Restore to agenda
      </button>
      {pending ? (
        <Confirm
          text="Propose restoring this item to the BRC pack? A new draft pack version is created; the chair decides."
          onConfirm={() => {
            dispatch({ type: "GATE_ACCEPT", draftId: "d-t235-restore" });
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      ) : null}
    </>
  );
}

export function Decisions() {
  const { open } = useDrawer();
  return (
    <section aria-labelledby="e-title">
      <SectionTitle id="e-title" title="What must the board decide?" />
      <div className="flex flex-col gap-2.5">
        {DECISIONS.map((d) => (
          <Card key={d.n} edge={d.keyState} className="!py-3">
            <button type="button" onClick={(e) => open(d.drawer, e.currentTarget)} className={`block w-full text-left ${ui.focus} rounded`}>
              <div className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ukb-accent)] text-[11px] font-semibold text-[var(--ukb-surface)]">{d.n}</span>
                <span className="text-[13px] font-semibold text-[var(--ukb-text)]">{d.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[var(--ukb-subtle)]" aria-hidden />
              </div>
              <p className={`mt-1 text-2xl font-semibold leading-tight tabular-nums ${d.keyState === "red" ? "text-[var(--ukb-red)]" : "text-[var(--ukb-amber)]"}`}>{d.key}</p>
              <p className="text-xs text-[var(--ukb-muted)]">{d.support}</p>
              <p className="text-xs text-[var(--ukb-subtle)]">{d.decider}</p>
            </button>
            <div className="mt-2">
              <DecisionActions d={d} />
            </div>
          </Card>
        ))}
        <Card className="!py-3">
          <p id="e-unverified" className="mb-0.5">
            <Label>Not yet verified (2)</Label>
          </p>
          {[
            { unitId: "u-tm", text: "Monitoring coverage 94.0% · same-day 0%" },
            { unitId: "u-sanctions", text: "Sanctions list cover 1.3% (39 of 3,088)" },
          ].map((r) => (
            <Opener key={r.unitId} drawer={`metric:${r.unitId}`} label={r.text} className="rounded hover:bg-[var(--ukb-surface-2)]">
              <span className="flex h-7 items-center justify-between gap-2 px-1 text-xs text-[var(--ukb-text)]">
                <span className="truncate">{r.text}</span>
                <Pill state="unverified" label="Unverified" />
              </span>
            </Opener>
          ))}
        </Card>
      </div>
    </section>
  );
}

/* ── F  Four compact panels ──────────────────────────────────────────── */

function Panel({ drawer, title, children }: { drawer: DrawerKey; title: string; children: ReactNode }) {
  return (
    <Opener drawer={drawer} label={title} className="h-full rounded-[10px]">
      <Card className="h-[136px] overflow-hidden hover:border-[var(--ukb-track)]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--ukb-text)]">{title}</span>
          <ChevronRight className="h-4 w-4 text-[var(--ukb-subtle)]" aria-hidden />
        </div>
        <div className="mt-2 space-y-1">{children}</div>
      </Card>
    </Opener>
  );
}

function Fig({ value, text }: { value: string; text: string }) {
  return (
    <p className="truncate text-xs text-[var(--ukb-muted)]">
      <span className="text-sm font-semibold tabular-nums text-[var(--ukb-text)]">{value}</span> {text}
    </p>
  );
}

export function Panels() {
  const decided = ROUTES.filter((r) => r.status === "decided").length;
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  const mi = base(CAPACITY.membersM);
  const hi = base(CAPACITY.handlers);
  const f1 = (
    <Panel key="F1" drawer="panel:F1" title="Is bad news reaching us?">
      <Fig value="4.6 months" text="median to BRC (n = 23)" />
      <Fig value="3" text="not escalated after 12 months" />
      <Fig value="26,900" text="CDD overdue vs 10,000 target" />
    </Panel>
  );
  const panels = [
    f1,
    <Panel key="F2" drawer="panel:F2" title="Growth vs capacity">
      <LineChart
        title="Members index against handlers index"
        height={64}
        axes={false}
        series={[
          { name: "Members", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: mi[i] })) },
          { name: "Handlers", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: hi[i] })), dashed: true },
        ]}
      />
      <p className="text-xs text-[var(--ukb-muted)]">Members +31% · Handlers +9%</p>
    </Panel>,
    <Panel key="F3" drawer="panel:F3" title="Reporting clocks">
      <Fig value={`${decided} of ${ROUTES.length}`} text="routes decided" />
      <Fig value="12 days" text="to attestation (08 Nov)" />
    </Panel>,
    <Panel key="F4" drawer="panel:F4" title="What is coming?">
      <Fig value={String(HORIZON.emergingRisks)} text={`emerging · ${HORIZON.withinTwelveMonths} within 12 months`} />
      <Fig value={`${HORIZON.daysToIncidentRules} days`} text="to new incident rules" />
    </Panel>,
  ];
  // F1 is pinned first for the BRC chair; it is first for both viewers.
  return (
    <section aria-label="Board panels" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {panels}
    </section>
  );
}
