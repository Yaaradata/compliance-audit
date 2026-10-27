"use client";

/**
 * UK Board v1 — S2 Principal-risk drill (Layer 2). Sections a–i in spine order; no lens
 * toggle (X-1). Fraud is a filter on the financial crime detail only (X-3). The underlying
 * RAG of an Unverified figure is shown here only. No further drill layer.
 */
import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  ASSURANCE_VERDICTS,
  CAPACITY,
  CONSTRAINT_LADDER,
  CONTRIBUTORS,
  DOMAIN_DETAIL,
  OBJECTIVES,
  PEOPLE,
  PLAN_VERSIONS,
  PRINCIPAL_RISKS,
  SCREENING,
  SERIES,
  TENSION_PAIR,
  THRESHOLDS,
  TM_ATTESTATIONS,
  TM_COHORTS,
  TM_READ_ACROSS,
  TM_RULED_OUT,
  TM_RUNS,
  TM_TOLERANCE,
  UNITS,
  WAIVER,
} from "@/lib/ukboard/v1/data";
import { getPrecedent } from "@/lib/ukboard/v1/precedents";
import { leastSquares, MIN_TRAJECTORY_POINTS, projectedCrossing } from "@/lib/ukboard/v1/selectors";
import type { PrincipalRiskId, Unit } from "@/lib/ukboard/v1/types";
import { AuditTrailInline, CanTellCannotTell, DraftActionCard, ProcessGapBlock } from "../ai";
import { HeadroomGauge, SeriesChart } from "../cards/charts";
import { BackToOrigin, DeltaValue, IntegrityBadge, PracticeLabel, PrecedentLine, RuleLine, StatusToken } from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { unitStatus, useNav } from "./shared";

/** Governance KRI units belong to Escalation health, not the principal-risk chain list. */
const S4_UNITS = ["u-vuln", "u-kri-backlog", "u-kri-latency", "u-kri-effect"];

type SectionId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i";

const SECTIONS: { id: SectionId; title: string; spine: string }[] = [
  { id: "a", title: "a. Position and thresholds", spine: "RAS → Level 1 → thresholds" },
  { id: "b", title: "b. Chain integrity", spine: "Feed → owner → attestation" },
  { id: "c", title: "c. Indicators and contributors", spine: "Level 2/3 → Level 1" },
  { id: "d", title: "d. Owners", spine: "Accountable owner" },
  { id: "e", title: "e. Tensions and waivers", spine: "RAS → Level 1 pair → floor" },
  { id: "f", title: "f. Domain detail", spine: "Per principal risk" },
  { id: "g", title: "g. Precedent", spine: "Precedent → control" },
  { id: "h", title: "h. Can tell / cannot tell", spine: "Honesty line" },
  { id: "i", title: "i. Drafts and audit trail", spine: "Escalation" },
];

/** Which section opens for the clicked unit (its drill signature). */
function focusSections(unit: Unit): SectionId[] {
  switch (unit.unitId) {
    case "u-capacity":
      return ["f", "i"];
    case "u-tm":
    case "u-sanctions":
    case "u-o4":
    case "u-unmapped":
    case "u-horizon":
    case "u-restriction":
      return ["b", "i"];
    case "u-tension":
      return ["e", "i"];
    default:
      return ["a", "c", "i"];
  }
}

function Section({ id, open, onToggle, children }: { id: SectionId; open: boolean; onToggle: () => void; children: ReactNode }) {
  const meta = SECTIONS.find((s) => s.id === id)!;
  return (
    <section className={`${ui.card}`} aria-labelledby={`sec-${id}`}>
      <h2 id={`sec-${id}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left ${ui.focus} rounded-xl`}
        >
          <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--ukb-text)]">
            {open ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronRight className="h-4 w-4" aria-hidden />}
            {meta.title}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-[var(--ukb-subtle)]">Spine: {meta.spine}</span>
        </button>
      </h2>
      {open ? <div className="space-y-3 border-t border-[var(--ukb-border)] px-4 py-3">{children}</div> : null}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold text-[var(--ukb-text)]">{title}</h3>
      {children}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-[var(--ukb-subtle)]">
            {head.map((h) => (
              <th key={h} className="py-1 pr-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--ukb-muted)]">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--ukb-border)]">
              {r.map((c, j) => (
                <td key={j} className="py-1 pr-3 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* a. Position (DG-1): full gauge, cascade (CMP-18), trajectory */
function PositionSection({ unit }: { unit: Unit }) {
  const t = THRESHOLDS[unit.unitId];
  const series = SERIES[unit.unitId];
  const crossing = series && t ? projectedCrossing(series, t.amber) : null;
  return (
    <>
      {unit.position ? <DeltaValue value={unit.position.value} denominator={unit.position.denominator} delta={unit.position.delta} size="lg" /> : null}
      {unit.unitId === "u-hltv" && t ? (
        <>
          <HeadroomGauge actual={17.6} amber={t.amber} red={t.red} max={t.capacity ?? 24} unit="%" mode="full" operatingLimit={t.operatingLimit} projection={{ value: t.amber, label: "amber Q2 2027" }} />
          <p className="text-xs text-[var(--ukb-muted)]">
            Range at plan volumes: 17.9% to 18.8% by Q2 2027; under the BRC lending stress, 19.2% <PracticeLabel kind="illustrative" />
          </p>
          <Sub title="Detail moved off the strip tile">
            <ul className="list-disc pl-4 text-xs text-[var(--ukb-muted)]">
              {OBJECTIVES[0].tooltip.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Sub>
        </>
      ) : null}
      {t ? (
        <Sub title="Threshold cascade">
          <Table
            head={["Level", "Value", "Rationale and calibration"]}
            rows={[
              ...(t.capacity !== undefined ? [["Capacity", `${t.capacity}${t.unit}`, "Maximum the society could bear"]] : []),
              ["Red (appetite)", `${t.red}${t.unit}`, t.calibration],
              ["Amber (trigger)", `${t.amber}${t.unit}`, t.rationale],
              ...(t.operatingLimit !== undefined ? [["Operating limit", `${t.operatingLimit}${t.unit}`, "First-line operating limit"]] : []),
            ]}
          />
        </Sub>
      ) : (
        <p className="text-xs text-[var(--ukb-muted)]">Thresholds: {unit.spine.find((s) => s.segment === "Thresholds")?.label ?? "as set in the RAS statement"}</p>
      )}
      {series ? (
        <Sub title="Trajectory">
          {series.length >= MIN_TRAJECTORY_POINTS && t ? (
            <>
              <SeriesChart series={{ name: unit.title, points: series }} threshold={t.amber} thresholdLabel={`amber ${t.amber}`} />
              <p className="text-xs text-[var(--ukb-muted)]">
                Least-squares over {series.length} points; slope {leastSquares(series).slope.toFixed(2)} a quarter;{" "}
                {crossing ? `amber reached in ${crossing}` : "not moving towards amber"}. Early warning, not a prediction. Window 6 points, minimum 4
                <PracticeLabel kind="practice_not_rule" />
              </p>
            </>
          ) : (
            <p className="text-xs text-[var(--ukb-muted)]">History under 4 points: trajectory withheld.</p>
          )}
        </Sub>
      ) : null}
      {unit.unitId === "u-lcr" ? (
        <RuleLine>Time to amber about 9 weeks; weeks to the BRC 7; ALCO lead time 6. 9 &lt; 7 + 6, so the owner needs to act before the BRC.</RuleLine>
      ) : null}
      {unit.unitId === "u-hltv" ? (
        <>
          <Sub title="Binding-constraint ladder at plan volumes">
            <ol className="list-decimal pl-4 text-xs text-[var(--ukb-muted)]">
              {CONSTRAINT_LADDER.map((c) => (
                <li key={c.name}>
                  <span className="font-semibold">{c.name}:</span> {c.projectedBind}
                </li>
              ))}
            </ol>
          </Sub>
          <Sub title="Plan versions">
            <ul className="list-disc pl-4 text-xs text-[var(--ukb-muted)]">
              {PLAN_VERSIONS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Sub>
        </>
      ) : null}
      <p className="text-xs text-[var(--ukb-muted)]">
        Roll-up rule used: worst-of
        <PracticeLabel kind="practice_not_rule" />
      </p>
      <RuleLine>{unit.ruleLine}</RuleLine>
    </>
  );
}

/* DG-3 lineage chain (CMP-17) */
function LineageChain() {
  const u = UNITS["u-tm"];
  return (
    <div className="space-y-3">
      <Sub title="Lineage">
        <p className="text-xs text-[var(--ukb-muted)]">
          Transaction monitoring coverage (FC-L1-02) → payments to monitoring feed (TM-04) → last 3 reconciliation runs → cohort breakdown → attestation per cycle
        </p>
      </Sub>
      <Sub title="Last 3 reconciliation runs">
        <Table
          head={["Run", "Result ID", "Completed", "Reconciled", "Share"]}
          rows={TM_RUNS.map((r) => [r.runDate, r.runId, r.completed, `${r.reconciled.toLocaleString("en-GB")} of ${r.source.toLocaleString("en-GB")}`, r.pct])}
        />
        <p className="mt-1 text-[11px] text-[var(--ukb-subtle)]">
          {TM_TOLERANCE}
        </p>
      </Sub>
      <Sub title="Cohort breakdown (26 October 2026 run)">
        <Table head={["Cohort", "Records", "Reconciled", "Share"]} rows={TM_COHORTS.map((c) => [c.cohort, c.records.toLocaleString("en-GB"), c.reconciled.toLocaleString("en-GB"), c.pct])} />
      </Sub>
      <Sub title="Attestation timeline">
        <Table head={["Cycle", "Signed", "Run completed", "Statement", "Check"]} rows={TM_ATTESTATIONS.map((a) => [a.cycle, a.signed, a.runCompleted, a.statement, a.gap])} />
      </Sub>
      <Sub title="Ruled-out alternatives">
        <ul className="list-disc pl-4 text-xs text-[var(--ukb-muted)]">
          {TM_RULED_OUT.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Sub>
      <p className="rounded-md bg-[var(--ukb-surface-2)] px-2 py-1 text-xs text-[var(--ukb-text)]">
        Underlying position: would read <StatusToken status={u.rawStatus === "not_assessed" ? "not_assessed" : u.rawStatus} /> if verified. Shown here only; the face stays Unverified.
      </p>
      <Sub title={`Read-across: ${TM_READ_ACROSS.line}`}>
        <p className="text-xs text-[var(--ukb-muted)]">{TM_READ_ACROSS.feeds.join(" · ")}</p>
      </Sub>
      <ProcessGapBlock
        gapType="Data-feed design gap"
        text="Same-day accounts are 0% monitored in all 3 runs: a timestamp or cut-off rule excludes a cohort from the monitoring feed."
        owner="COO and CTO (feed owner); Head of Financial Crime"
        draftId="d-t214-remed"
      />
      <ProcessGapBlock
        gapType="Workflow-sequencing gap"
        text="The September attestation was signed 3 hours before the run completed: the workflow allows signing before evidence exists."
        owner="Second line (attestation process owner); COO"
        draftId="d-t217-challenge"
      />
    </div>
  );
}

/* T2-15 screening denominator (own build for this product) */
function ScreeningDenominatorPanel() {
  return (
    <div className="space-y-1 rounded-lg border border-[var(--ukb-border)] p-3 text-xs">
      <p className="font-bold text-[var(--ukb-text)]">Sanctions list rule coverage</p>
      <p className="text-[var(--ukb-muted)]">List: {SCREENING.list} · As at: {SCREENING.asAt}</p>
      <DeltaValue value={SCREENING.coverage} denominator={`${SCREENING.ruleRecords} active rule records against ${SCREENING.listEntries.toLocaleString("en-GB")} list entries`} />
      <div className="h-2 w-full max-w-sm rounded bg-[var(--ukb-surface-2)]" aria-hidden>
        <div className="h-2 rounded bg-[var(--ukb-grey)]" style={{ width: `${(SCREENING.ruleRecords / SCREENING.listEntries) * 100}%`, minWidth: 2 }} />
      </div>
      <p className="text-[var(--ukb-muted)]">
        Alerts: {SCREENING.alertsLast3Weeks} in the last 3 weeks against an expected {SCREENING.expectedPerWeek} a week (control gone quiet)
      </p>
      <p className="text-[var(--ukb-subtle)]">{SCREENING.customerScreeningCoverage}</p>
      <PrecedentLine id="uk-starling-2024" />
    </div>
  );
}

/* T2-23 operational assurance verdict (own build for this product) */
function AssuranceVerdictPanel() {
  return (
    <Sub title="Rating against latest test">
      <Table head={["Control", "Rating", "Latest test", "Verdict (rule)"]} rows={ASSURANCE_VERDICTS.map((v) => [v.control, v.rating, v.latestTest, v.verdict])} />
      <RuleLine>A control rated effective is checked against its latest test; a failed or overdue test means the rating is not supported.</RuleLine>
    </Sub>
  );
}

function MappingGapChain({ unit }: { unit: Unit }) {
  return (
    <Sub title={`Mapping: ${unit.title}`}>
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {unit.spine.map((s, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            <span
              className={`rounded px-1.5 py-0.5 ${
                s.missing ? "border border-dashed border-[var(--ukb-grey)] text-[var(--ukb-grey)]" : "bg-[var(--ukb-surface-2)] text-[var(--ukb-text)]"
              }`}
            >
              {s.segment}: {s.missing ? "missing" : s.label}
            </span>
            {i < unit.spine.length - 1 ? <span className="text-[var(--ukb-subtle)]">→</span> : null}
          </li>
        ))}
      </ol>
    </Sub>
  );
}

/* DG-2 capacity block */
function CapacityBlock({ canGate }: { canGate: boolean }) {
  const base = (arr: number[]) => arr.map((v) => Math.round((v / arr[0]) * 1000) / 10);
  const mi = base(CAPACITY.membersM);
  const hi = base(CAPACITY.handlers);
  return (
    <div className="space-y-3 rounded-lg border border-[var(--ukb-border)] p-3">
      <p className="text-xs font-bold text-[var(--ukb-text)]">Growth against capacity</p>
      <SeriesChart
        series={{ name: "Members index (Q2 2025 = 100)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: mi[i] })) }}
        secondSeries={{ name: "Qualified handlers index (Q2 2025 = 100)", points: CAPACITY.quarters.map((q, i) => ({ label: q, value: hi[i] })) }}
      />
      <p className="text-xs text-[var(--ukb-muted)]">
        Solid: members index (1.45m → 1.90m, +31%). Dashed: qualified handlers index (58 → 63, +9%). One time axis, one scale.
      </p>
      <p className="text-xs text-[var(--ukb-muted)]">
        Members per qualified handler {CAPACITY.membersPerHandler.from.toLocaleString("en-GB")} → {CAPACITY.membersPerHandler.to.toLocaleString("en-GB")} · alerts cleared within SLA{" "}
        {CAPACITY.slaCleared.value} ({CAPACITY.slaCleared.denominator}; {CAPACITY.slaCleared.delta})
      </p>
      <SeriesChart series={{ name: "Alert queue median age (days)", points: CAPACITY.queueAge }} threshold={CAPACITY.queueAmber} thresholdLabel="amber 14 days" valueSuffix="d" />
      <p className="text-xs text-[var(--ukb-muted)]">
        Next savings campaign: {CAPACITY.campaignDate} (in {CAPACITY.campaignWeeks} weeks). {CAPACITY.decisionSearch}.
      </p>
      <PrecedentLine id="uk-starling-2024" />
      <PrecedentLine id="uk-monzo-2025" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Two-option proposal (no third option)</p>
      <DraftActionCard draftId="d-t25-choice" canGate={canGate} />
      <ProcessGapBlock
        gapType="Planning-governance gap"
        text="Campaigns are planned without a control-capacity check: the next campaign is in 6 weeks with no resourcing decision recorded."
        owner="CEO and ExCo (planning); Head of Financial Crime"
        draftId="d-pg4"
        canGate={canGate}
      />
    </div>
  );
}

export default function PrincipalRiskDrillScreen({ principalRiskId, focusUnitId }: { principalRiskId: PrincipalRiskId; focusUnitId: string }) {
  const { state, dispatch } = useBoard();
  const nav = useNav();
  const focus = UNITS[focusUnitId];
  const [open, setOpen] = useState<SectionId[]>(focus ? focusSections(focus) : ["a"]);

  if (!focus || focus.principalRiskId !== principalRiskId) {
    return (
      <div className="space-y-3">
        <BackToOrigin />
        <p className={`${ui.card} p-4 text-sm`}>Evidence not available for this period.</p>
      </div>
    );
  }

  const risk = PRINCIPAL_RISKS[principalRiskId];
  const riskUnits = Object.values(UNITS).filter((u) => u.principalRiskId === principalRiskId && u.visibility === "all_board");
  const toggle = (id: SectionId) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const status = unitStatus(focus.unitId);
  // Drafts shown elsewhere in this drill (capacity block, process gaps, precedent) are not repeated in section i.
  const shownInline = principalRiskId === "fincrime" ? ["d-t25-choice", "d-pg4", "d-t214-remed", "d-t217-challenge", "d-t232-readacross", "d-t26-floor"] : [];
  const draftIds = focus.draftIds.filter((id) => !shownInline.includes(id));
  const precedentIds = [...new Set(riskUnits.flatMap((u) => u.precedentIds))];
  const contributors = [...(CONTRIBUTORS[principalRiskId] ?? [])].sort((a, b) => ({ red: 0, amber: 1, within_appetite: 2 })[a.status] - ({ red: 0, amber: 1, within_appetite: 2 })[b.status]);
  const detail = (DOMAIN_DETAIL[principalRiskId] ?? []).filter((d) => !state.fraudFilter || d.fraud);

  return (
    <div className="space-y-4">
      <BackToOrigin />
      <div className={`${ui.card} p-5 shadow-sm`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Principal-risk drill · {risk.name}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-snug text-[var(--ukb-text)]">{focus.stateSentence}</h1>
          <StatusToken status={status} reason={focus.notAssessedReason} />
        </div>
        <p className="mt-0.5 text-xs text-[var(--ukb-muted)]">{focus.title}</p>
        <div className="mt-2">
          <IntegrityBadge badgeRef={`s2-${focus.unitId}`} snapshot={focus.integrity} owner={focus.ownerRole} />
        </div>

      </div>

      <Section id="a" open={open.includes("a")} onToggle={() => toggle("a")}>
        <PositionSection unit={focus.position || THRESHOLDS[focus.unitId] ? focus : riskUnits.find((u) => THRESHOLDS[u.unitId]) ?? focus} />
      </Section>

      <Section id="b" open={open.includes("b")} onToggle={() => toggle("b")}>
        {riskUnits
          .filter((u) => (u.position || u.rawStatus !== "not_assessed") && !S4_UNITS.includes(u.unitId))
          .map((u) => (
            <div key={u.unitId} className={u.unitId === focus.unitId ? "rounded-md bg-[var(--ukb-highlight)] p-2" : "p-2"}>
              <p className="text-xs font-semibold text-[var(--ukb-text)]">{u.title}</p>
              <IntegrityBadge badgeRef={`s2b-${u.unitId}`} snapshot={u.integrity} />
              <p className="mt-0.5 text-[11px] text-[var(--ukb-subtle)]">
                References: {u.spine.filter((s) => s.ref).map((s) => `${s.label} (${s.ref})`).join(" · ") || "none"}
              </p>
            </div>
          ))}
        {principalRiskId === "fincrime" ? (
          <>
            <LineageChain />
            <ScreeningDenominatorPanel />
            <AssuranceVerdictPanel />
            <MappingGapChain unit={UNITS["u-unmapped"]} />
            <MappingGapChain unit={UNITS["u-horizon"]} />
            <p className="text-xs text-[var(--ukb-muted)]">Change log: no unapproved parameter changes on these feeds in the window.</p>
          </>
        ) : null}
        {principalRiskId === "regulatory" ? (
          <p className="text-xs text-[var(--ukb-muted)]">
            TC-4: the unowned clause (R-05.2) and the clause with no executable test belong to the s166 remediation, not to restriction R-03.
          </p>
        ) : null}
      </Section>

      <Section id="c" open={open.includes("c")} onToggle={() => toggle("c")}>
        {contributors.length ? (
          <>
            <div className="max-h-[220px] space-y-1 overflow-y-auto">
              {contributors.map((c) => (
                <div key={c.name} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ukb-border)] py-1 text-xs last:border-b-0">
                  <span className="text-[var(--ukb-text)]">{c.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[var(--ukb-muted)]">{c.value}</span>
                    <StatusToken status={c.status} />
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--ukb-muted)]">
              Ranked worst first under the worst-of roll-up
              <PracticeLabel kind="practice_not_rule" />. Leading-indicator pairs are declared, not causal.
            </p>
          </>
        ) : (
          <p className="text-xs text-[var(--ukb-muted)]">No contributors held for this period.</p>
        )}
      </Section>

      <Section id="d" open={open.includes("d")} onToggle={() => toggle("d")}>
        <p className="text-xs text-[var(--ukb-muted)]">
          Accountable SMF: {PEOPLE[risk.accountablePersonId].name} <PracticeLabel kind="fictional" />, {PEOPLE[risk.accountablePersonId].role}
        </p>
        <ul className="space-y-0.5 text-xs text-[var(--ukb-muted)]">
          {riskUnits
            .filter((u) => u.ownerPersonId)
            .map((u) => (
              <li key={u.unitId}>
                {u.title}: {PEOPLE[u.ownerPersonId!].name}, {PEOPLE[u.ownerPersonId!].role}
              </li>
            ))}
        </ul>
        <p className="text-xs text-[var(--ukb-muted)]">Management Responsibilities Map version 7, effective 01 April 2026 [illustrative]</p>
        <p className="text-xs text-[var(--ukb-muted)]">
          Segregation of duties: {principalRiskId === "fincrime" ? "the feed owner attests the feed; the second line challenges; the SMF decides" : "maker and checker are different people"}.
          {principalRiskId === "regulatory" ? " 1 metric is owned and attested by the same person." : ""}
        </p>
      </Section>

      <Section id="e" open={open.includes("e")} onToggle={() => toggle("e")}>
        {principalRiskId === "fincrime" ? (
          <>
            <Sub title={TENSION_PAIR.pair}>
              <Table
                head={["Bound", "Agreed", "Actual", "State"]}
                rows={[
                  ...TENSION_PAIR.bounds.map((b) => [b.bound, b.agreed, b.actual, <StatusToken key={b.bound} status={b.exceeded ? "amber" : "within_appetite"} label={b.exceeded ? "Bound exceeded" : "Within bound"} />]),
                  [TENSION_PAIR.floor, "Regulatory floor", "Pre-CDD transacting found", <StatusToken key="floor" status="red" label="Breach" />],
                ]}
              />
            </Sub>
            <p className="text-xs text-[var(--ukb-muted)]">
              Review due {TENSION_PAIR.reviewDue}. Keyed by {TENSION_PAIR.keyedBy} on {TENSION_PAIR.keyedOn}; source decision {TENSION_PAIR.sourceDecisionRef}. Bounds are only as good as the keying.
            </p>
            <p className="text-xs font-semibold text-[var(--ukb-text)]">Floor row → breach path (never a trade-off):</p>
            <DraftActionCard draftId="d-t26-floor" canGate={nav.canGate} />
          </>
        ) : principalRiskId === "credit" ? (
          <Sub title={`Waiver: ${WAIVER.title}`}>
            <p className="text-xs text-[var(--ukb-muted)]">{WAIVER.text}</p>
            <p className="text-xs text-[var(--ukb-muted)]">
              Keyed by {WAIVER.keyedBy}; decision {WAIVER.decisionRef}. The headline is shown against the permanent 20% appetite.
            </p>
          </Sub>
        ) : (
          <p className="text-xs text-[var(--ukb-muted)]">No guardrail pair or waiver held for this principal risk.</p>
        )}
      </Section>

      <Section id="f" open={open.includes("f")} onToggle={() => toggle("f")}>
        {principalRiskId === "fincrime" ? <CapacityBlock canGate={nav.canGate} /> : null}
        {principalRiskId === "fincrime" ? (
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ukb-text)]">
            <input type="checkbox" checked={state.fraudFilter} onChange={(e) => dispatch({ type: "SET_FRAUD_FILTER", on: e.target.checked })} className={ui.focus} />
            Fraud filter (show fraud items only)
          </label>
        ) : null}
        {detail.length ? (
          <ul className="space-y-1 text-xs text-[var(--ukb-muted)]">
            {detail.map((d) => (
              <li key={d.label}>
                <span className="font-semibold">{d.label}:</span> {d.text}
              </li>
            ))}
          </ul>
        ) : principalRiskId !== "fincrime" ? (
          <p className="text-xs text-[var(--ukb-muted)]">Evidence not available for this period.</p>
        ) : null}
      </Section>

      <Section id="g" open={open.includes("g")} onToggle={() => toggle("g")}>
        {precedentIds.length ? (
          precedentIds.map((id) => {
            const p = getPrecedent(id);
            return p ? (
              <div key={id} className="space-y-0.5">
                <PrecedentLine id={id} />
                <p className="text-xs text-[var(--ukb-muted)]">
                  {p.mechanism}
                  {p.penalty ? ` Penalty: ${p.penalty}.` : ""}
                </p>
              </div>
            ) : null;
          })
        ) : (
          <p className="text-xs text-[var(--ukb-muted)]">No linked precedent.</p>
        )}
        <p className="text-xs font-semibold text-[var(--ukb-text)]">Did our read-across test the population?</p>
        {principalRiskId === "fincrime" ? <DraftActionCard draftId="d-t232-readacross" canGate={nav.canGate} /> : null}
      </Section>

      <Section id="h" open={open.includes("h")} onToggle={() => toggle("h")}>
        <CanTellCannotTell canTell={focus.canTell} cannotTell={focus.cannotTell} />
      </Section>

      <Section id="i" open={open.includes("i")} onToggle={() => toggle("i")}>
        {draftIds.length ? (
          draftIds.map((id) => <DraftActionCard key={id} draftId={id} canGate={nav.canGate} />)
        ) : (
          <p className="text-xs text-[var(--ukb-muted)]">No drafts for this item.</p>
        )}
        <AuditTrailInline objectRefs={riskUnits.map((u) => u.unitId)} />
      </Section>
    </div>
  );
}
