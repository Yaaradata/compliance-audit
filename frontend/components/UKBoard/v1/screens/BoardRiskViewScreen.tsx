"use client";

/**
 * UK Board v1 — S1 Board Risk View (beats 1 and 2). Post-9C layout:
 * row 0 AI band · row 1 headline + strip | Z2 above Z5 · row 2 boxed scorecard · row 3 horizon.
 * Each value renders once on S1 (V-5).
 */
import { HeadroomGauge } from "../cards/charts";
import { BoardLayoutGrid, CardShell, DeltaValue, IntegrityBadge, PracticeLabel, PrecedentLine, RuleLine, StatusToken } from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { AiExecutiveBand } from "../ai";
import { ActionList, SoWhat, unitStatus, useNav } from "./shared";
import { CAPACITY, FIRM, HORIZON, OBJECTIVES, PEOPLE, PROMOTION, SCORECARD, THRESHOLDS, UNITS } from "@/lib/ukboard/v1/data";
import { BANK_FED_UNITS } from "@/lib/ukboard/v1/widgetRegistry";
import { rankScorecard, statusCounts, verifiedCount } from "@/lib/ukboard/v1/selectors";
import type { ObjectiveTile as ObjectiveTileVM, ScorecardRow as ScorecardRowVM, ZoneId } from "@/lib/ukboard/v1/types";

const ZONE_ANCHOR: Record<ZoneId, string> = { Z1: "zone-z1", Z2: "zone-z2", Z5: "zone-z5" };

function scrollToZone(z: ZoneId) {
  document.getElementById(ZONE_ANCHOR[z])?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* Z1 headline + strategy strip (CMP-12, CMP-10, CMP-11) */
function HeadlineAndStrip() {
  const nav = useNav();
  const u = UNITS["u-hltv"];
  const t = THRESHOLDS["u-hltv"];
  const counts = statusCounts(SCORECARD, UNITS);
  const verified = verifiedCount(SCORECARD, UNITS);
  return (
    <CardShell id="zone-z1" title={u.title} status={unitStatus(u.unitId)} statusLabel="Within appetite · amber projected" highlight={nav.highlightRef === u.unitId}>
      <button type="button" onClick={() => nav.toRisk("credit", u.unitId)} className={`block w-full rounded-md text-left ${ui.focus}`}>
        <DeltaValue value="88%" denominator="of high-LTV appetite used: £96m headroom on a £4.0bn new-lending plan" delta="+1.5 pts vs Q2 2026" size="xl" />
        <span className="ml-1 text-[10px] uppercase text-[var(--ukb-subtle)]">[illustrative]</span>
      </button>
      <div className="mt-2">
        <HeadroomGauge actual={17.6} amber={t.amber} red={t.red} max={t.capacity ?? 24} unit="%" mode="compact" />
      </div>
      <p className="text-xs text-[var(--ukb-muted)]">Amber projected Q2 2027 · early warning, not a prediction</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ukb-text)]">
        {verified} of {SCORECARD.length} board headlines verified · {counts.unverified} unverified
      </p>
      <div className="mt-1">
        <IntegrityBadge badgeRef="z1" snapshot={u.integrity} onOpenEvidence={() => nav.toRisk("credit", u.unitId)} />
      </div>
      <SoWhat>
        Room to grow in mortgages to Q2 2027 at plan volumes. Savings and onboarding growth is not inside its controls: decide pace or capacity, and caveat two figures before the pack locks.
      </SoWhat>
      <div className="mt-2 space-y-1">
        <RuleLine>{u.ruleLine}</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Owner: {u.ownerRole}</p>
      </div>
      <ActionList draftIds={u.draftIds} canGate={nav.canGate} />

      <div className="mt-4 border-t border-[var(--ukb-border)] pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Strategy strip</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OBJECTIVES.filter((o) => !(o.statutoryLine && FIRM.firmType !== "building_society")).map((o) => (
            <ObjectiveTile key={o.objectiveId} tile={o} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => nav.toRisk("fincrime", "u-unmapped")}
          className={`mt-2 inline-flex rounded-full border border-dashed border-[var(--ukb-track)] px-2 py-0.5 text-xs text-[var(--ukb-muted)] ${ui.focus}`}
        >
          {UNITS["u-unmapped"].stateSentence}
        </button>
      </div>
    </CardShell>
  );
}

function ObjectiveTile({ tile }: { tile: ObjectiveTileVM }) {
  const nav = useNav();
  const u = UNITS[tile.unitId];
  const status = unitStatus(u.unitId);
  return (
    <div
      className={`rounded-lg border border-[var(--ukb-border)] p-2.5 ${nav.highlightRef === tile.drill.focusUnitId ? "ring-2 ring-[var(--ukb-focus)]" : ""}`}
      title={tile.tooltip.join("\n")}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => nav.toRisk(tile.drill.principalRiskId, tile.drill.focusUnitId)}
          className={`text-left text-xs font-bold text-[var(--ukb-text)] ${ui.focus} rounded`}
          aria-describedby={`tip-${tile.objectiveId}`}
        >
          {tile.objective}
        </button>
        <StatusToken status={status} label={tile.objectiveId === "O2" ? "Outside agreed terms" : undefined} />
      </div>
      <span id={`tip-${tile.objectiveId}`} className="sr-only">
        {tile.tooltip.join(". ")}
      </span>
      <div className="mt-1">
        <IntegrityBadge badgeRef={`tile-${tile.objectiveId}`} snapshot={u.integrity} onOpenEvidence={() => nav.toRisk(tile.drill.principalRiskId, tile.drill.focusUnitId)} />
      </div>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">{tile.statutoryLine ?? tile.inlineState}</p>
      {tile.floorRow ? (
        <p className="mt-1 text-xs font-semibold text-[var(--ukb-red)]">
          <StatusToken status="red" label="Breach" /> {tile.floorRow}
        </p>
      ) : null}
      {tile.objectiveId === "O2" ? (
        <ActionList draftIds={["d-t26-redecide"]} canGate={nav.canGate} />
      ) : (
        <button type="button" onClick={() => nav.toRisk(tile.drill.principalRiskId, tile.drill.focusUnitId)} className={`mt-1 text-xs ${ui.link} ${ui.focus}`}>
          Open evidence
        </button>
      )}
    </div>
  );
}

/* Z2 growth against capacity (CMP-13) */
function CapacityCard() {
  const nav = useNav();
  const u = UNITS["u-capacity"];
  return (
    <CardShell id="zone-z2" title={u.title} status={unitStatus(u.unitId)} integration={u.integration} highlight={nav.highlightRef === u.unitId}>
      <p className="text-sm text-[var(--ukb-text)]">{u.stateSentence}</p>
      <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`mt-1 block rounded text-left ${ui.focus}`}>
        <DeltaValue value="19 days" denominator="queue median age against amber 14" delta="+7 days vs Q2 2026" size="lg" />
      </button>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">
        {CAPACITY.membersPerHandler.to.toLocaleString("en-GB")} members per qualified handler (1.90m ÷ 63; was {CAPACITY.membersPerHandler.from.toLocaleString("en-GB")}) · alerts cleared within SLA {CAPACITY.slaCleared.value} ({CAPACITY.slaCleared.denominator})
      </p>
      <div className="mt-1">
        <IntegrityBadge badgeRef="z2" snapshot={u.integrity} onOpenEvidence={() => nav.toRisk("fincrime", u.unitId)} />
      </div>
      <SoWhat>The next savings campaign starts in 6 weeks and no resourcing decision is recorded.</SoWhat>
      <div className="mt-2 space-y-1">
        <RuleLine>{u.ruleLine}</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Owner: {u.ownerRole} · detection from counts; growth is not claimed as the cause</p>
        {u.precedentIds.map((p) => (
          <PrecedentLine key={p} id={p} />
        ))}
      </div>
      <ActionList draftIds={["d-t25-choice", "d-t25-paper"]} canGate={nav.canGate} />
    </CardShell>
  );
}

/* Z5 defensibility (CMP-16) with T2-17 inline */
function DefensibilityCard() {
  const nav = useNav();
  const { state } = useBoard();
  const u = UNITS["u-tm"];
  const caveat = state.session.caveats[u.unitId];
  return (
    <CardShell id="zone-z5" title={u.title} status={unitStatus(u.unitId)} integration={u.integration} highlight={nav.highlightRef === u.unitId}>
      <p className="text-sm font-semibold text-[var(--ukb-text)]">{u.stateSentence}</p>
      <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`mt-1 block rounded text-left ${ui.focus}`}>
        <DeltaValue value="94.0%" denominator="of records reconciled (2,256,000 of 2,400,000)" delta="−3.1 pts vs previous run" size="lg" />
      </button>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">Same-day accounts 0% monitored; other cohorts 99.97%; last run 26 October 2026 [illustrative]</p>
      {caveat ? (
        <p className="mt-1 text-xs font-semibold text-[var(--ukb-text)]">
          Caveat accepted by {PEOPLE[caveat.byPersonId].name} on {caveat.on}; in pack with caveat
        </p>
      ) : null}
      <div className="mt-1">
        <IntegrityBadge badgeRef="z5" snapshot={u.integrity} onOpenEvidence={() => nav.toRisk("fincrime", u.unitId)} />
      </div>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">
        <span className="font-semibold">Attestation precedes a completed run:</span> {u.integrity.attestation.evidence}.
      </p>
      <SoWhat>Caveat or withhold this figure before the pack locks, and ask the feed owner to remediate and re-attest.</SoWhat>
      <div className="mt-2 space-y-1">
        <RuleLine>{u.ruleLine}</RuleLine>
        <RuleLine>The attestation must reference a finished run. The month 2 signature preceded the run by 3 hours.</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Owner: {u.ownerRole} · proves records not monitored, not missed suspicion</p>
        <PrecedentLine id="uk-metro-2024" onOpen={() => nav.toRisk("fincrime", u.unitId)} />
      </div>
      <ActionList draftIds={["d-t214-caveat", "d-t214-remed", "d-t217-challenge", "d-t214-triage"]} canGate={nav.canGate} />
    </CardShell>
  );
}

/* Z4 RAS scorecard (CMP-15), boxed at 4 visible rows (V-8) */
function RasScorecard() {
  const nav = useNav();
  const { state } = useBoard();
  const ranked = rankScorecard(SCORECARD, UNITS);
  const counts = statusCounts(SCORECARD, UNITS);
  const nsfr = UNITS[PROMOTION.unitId];
  return (
    <CardShell id="zone-z4" title="Which board headlines need attention?">
      <p className="mb-2 text-xs text-[var(--ukb-muted)]">Ranked by urgency: red → unverified → amber → early warning → within appetite. The top rows are the agenda.</p>
      <div className="max-h-[248px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Board headlines">
        {ranked.map((r, i) => (
          <ScorecardRow key={r.unitId} row={r} rank={i + 1} highlighted={nav.highlightRef === r.unitId} />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--ukb-text)]">
        {counts.within_appetite} of {SCORECARD.length} within appetite · {FIRM.headlineCap} of {FIRM.level1Count} Level 1 metrics
        <PracticeLabel kind="practice_not_rule" />
      </p>
      <div className="mt-3 rounded-lg border border-dashed border-[var(--ukb-track)] p-2.5">
        <p className="text-xs font-bold text-[var(--ukb-text)]">
          {state.session.promoted ? "Promoted to the board view: NSFR" : "Proposed for the board view: NSFR"}
        </p>
        <button type="button" onClick={() => nav.toRisk("liquidity", nsfr.unitId)} className={`mt-0.5 block rounded text-left ${ui.focus}`}>
          <DeltaValue value={nsfr.position!.value} denominator={nsfr.position!.denominator} delta={nsfr.position!.delta} />
        </button>
        <RuleLine>{nsfr.ruleLine}</RuleLine>
        <p className="text-xs text-[var(--ukb-muted)]">Rotation-out candidate: {PROMOTION.rotateOutNote} (cap of 12 is a firm choice)</p>
        <ActionList draftIds={nsfr.draftIds} canGate={nav.canGate} />
      </div>
    </CardShell>
  );
}

function ScorecardRow({ row, rank, highlighted }: { row: ScorecardRowVM; rank: number; highlighted: boolean }) {
  const nav = useNav();
  const u = UNITS[row.unitId];
  const status = unitStatus(u.unitId);
  const bankFeed = BANK_FED_UNITS[u.unitId];
  const open = () => (row.linkTo === "restrictions" ? nav.peer("restrictions") : nav.toRisk(u.principalRiskId, u.unitId));
  return (
    <div
      role="listitem"
      className={`flex min-h-[60px] flex-col gap-1 border-b border-[var(--ukb-border)] px-3 py-2 last:border-b-0 sm:flex-row sm:items-center sm:gap-3 ${
        highlighted ? "bg-[var(--ukb-highlight)]" : ""
      }`}
    >
      <span className="w-5 shrink-0 text-xs tabular-nums text-[var(--ukb-subtle)]">{rank}</span>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={open} className={`text-left text-xs font-semibold text-[var(--ukb-text)] ${ui.focus} rounded`}>
          {row.name}
        </button>
        {bankFeed ? (
          <span className="ml-1 align-middle" title={`Needs the society's ${bankFeed} access`}>
            <span className="sr-only">Bank feed: needs the society&apos;s {bankFeed} access</span>
            <span aria-hidden className="text-[var(--ukb-subtle)]">★</span>
          </span>
        ) : null}
        <p className="text-[11px] text-[var(--ukb-subtle)]">{row.domainLabel}</p>
        {row.marker ? <p className="text-[11px] text-[var(--ukb-muted)]">Early warning: {row.marker}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <StatusToken status={status} />
        {row.shownAbove ? (
          <button type="button" onClick={() => scrollToZone(row.shownAbove!)} className={`text-xs ${ui.link} ${ui.focus}`}>
            Shown above
          </button>
        ) : u.position ? (
          <span className="text-xs">
            <DeltaValue value={u.position.value} denominator={u.position.denominator} delta={u.position.delta} />
          </span>
        ) : null}
      </div>
      <div className="sm:w-48">
        <IntegrityBadge badgeRef={`row-${u.unitId}`} snapshot={u.integrity} onOpenEvidence={() => nav.toRisk(u.principalRiskId, u.unitId)} />
      </div>
    </div>
  );
}

/* Z6 horizon line (below the fold) */
function HorizonLine() {
  const nav = useNav();
  const u = UNITS["u-horizon"];
  return (
    <CardShell id="zone-z6" title={u.title} status={unitStatus(u.unitId)} notAssessedReason="1 risk with no linked metric">
      <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`block rounded text-left text-sm text-[var(--ukb-text)] ${ui.focus}`}>
        {u.stateSentence}
      </button>
      <p className="mt-1 text-xs text-[var(--ukb-muted)]">
        Days to the new incident and third-party reporting rules ({HORIZON.incidentRulesDate}): {HORIZON.daysToIncidentRules} · {HORIZON.trialClassified.classified} of{" "}
        {HORIZON.trialClassified.total} incidents this year classified under the new rules in a trial run · {HORIZON.disclosureHold} disclosure figure under hold review
      </p>
      <RuleLine>{u.ruleLine}</RuleLine>
      <ActionList draftIds={u.draftIds} canGate={nav.canGate} />
    </CardShell>
  );
}

export default function BoardRiskViewScreen() {
  const nav = useNav();
  const counts = statusCounts(SCORECARD, UNITS);
  return (
    <BoardLayoutGrid
      band={
        <AiExecutiveBand
          critical={{
            text: `Restriction on new high-risk customers breached: 112 of 9,400 tested · ${counts.unverified} of ${SCORECARD.length} headlines unverified`,
            onClick: () => nav.peer("restrictions"),
          }}
          due={{
            text: `${counts.amber} amber, ${counts.red} red · 1 promotion proposed · 13 items qualify`,
            onClick: () => nav.peer("escalation"),
          }}
          steady={{ text: `${counts.within_appetite} of ${SCORECARD.length} within appetite` }}
          aiLine="Summarised from the 12 headlines and the BRC exception feed as at 30 September 2026, with evidence to 26 October 2026. It adds no figures of its own."
        />
      }
      rows={[
        { key: "r1", left: <HeadlineAndStrip />, rightStack: [<CapacityCard key="z2" />, <DefensibilityCard key="z5" />] },
        { key: "r2", full: <RasScorecard /> },
        { key: "r3", full: <HorizonLine /> },
      ]}
    />
  );
}

