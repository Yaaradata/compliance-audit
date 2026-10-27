"use client";

/**
 * UK Board v1 — S1 Board Risk View (beats 1 and 2). Post-9C layout:
 * row 0 AI band · row 1 headline + strip | Z2 above Z5 · row 2 boxed scorecard · row 3 horizon.
 * Each value renders once on S1 (V-5). Faces carry one number and one line; the rule line,
 * owner detail and precedents sit under Details.
 */
import { CAPACITY, FIRM, HORIZON, OBJECTIVES, PEOPLE, PROMOTION, SCORECARD, THRESHOLDS, UNITS } from "@/lib/ukboard/v1/data";
import { rankScorecard, statusCounts, verifiedCount } from "@/lib/ukboard/v1/selectors";
import type { ObjectiveTile as ObjectiveTileVM, ScorecardRow as ScorecardRowVM, ZoneId } from "@/lib/ukboard/v1/types";
import { BANK_FED_UNITS } from "@/lib/ukboard/v1/widgetRegistry";
import { AiExecutiveBand } from "../ai";
import { HeadroomGauge } from "../cards/charts";
import {
  BoardLayoutGrid,
  CardShell,
  DeltaValue,
  Details,
  IntegrityBadge,
  MutedLine,
  PageTitle,
  PracticeLabel,
  PrecedentLine,
  RuleLine,
  SoWhat,
  StatusToken,
  TILE_TINT,
  TONE,
} from "../primitives";
import { useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { ActionList, unitStatus, useNav } from "./shared";

const ZONE_ANCHOR: Record<ZoneId, string> = { Z1: "zone-z1", Z2: "zone-z2", Z5: "zone-z5" };

function scrollToZone(z: ZoneId) {
  document.getElementById(ZONE_ANCHOR[z])?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Short face line per strip tile (the status token carries the state). */
const TILE_LINE: Record<string, string> = {
  O1: "Headroom shown in the headline",
  O2: "2 of 3 bounds exceeded · review 27 days overdue",
  O3: "Statutory cap 50% (building society)",
  O4: "2 coverage figures unverified",
};

/* Z1 headline + strategy strip (CMP-12, CMP-10, CMP-11) */
function HeadlineAndStrip() {
  const nav = useNav();
  const u = UNITS["u-hltv"];
  const t = THRESHOLDS["u-hltv"];
  const counts = statusCounts(SCORECARD, UNITS);
  const verified = verifiedCount(SCORECARD, UNITS);
  return (
    <CardShell
      id="zone-z1"
      title={u.title}
      status={unitStatus(u.unitId)}
      statusLabel="Within appetite · amber projected"
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-3">
          <IntegrityBadge badgeRef="z1" snapshot={u.integrity} owner={u.ownerRole} onOpenEvidence={() => nav.toRisk("credit", u.unitId)} />
          <ActionList draftIds={u.draftIds} canGate={nav.canGate} />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <button type="button" onClick={() => nav.toRisk("credit", u.unitId)} className={`block rounded text-left ${ui.focus}`}>
            <DeltaValue value="88%" denominator="of high-LTV appetite used" delta="+1.5 pts vs Q2 2026" size="xl" />
          </button>
          <MutedLine>
            £96m headroom on a £4.0bn new-lending plan · amber projected Q2 2027 (early warning, not a prediction) <PracticeLabel kind="illustrative" />
          </MutedLine>
        </div>
        <span className="inline-flex items-center gap-1 self-start rounded-md border border-dashed border-[var(--ukb-grey-line)] bg-[var(--ukb-grey-tint)] px-2 py-1 text-xs font-semibold text-[var(--ukb-text)] md:self-end">
          {verified} of {SCORECARD.length} headlines verified · {counts.unverified} unverified
        </span>
      </div>
      <div className="mt-3">
        <HeadroomGauge actual={17.6} amber={t.amber} red={t.red} max={t.capacity ?? 24} unit="%" mode="compact" />
      </div>
      <SoWhat>Room to grow in mortgages to Q2 2027. Savings growth is outside its controls: decide pace or capacity, and caveat two figures before the pack locks.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>Owner: {u.ownerRole}. Projection assumes plan volumes and the current mix.</MutedLine>
      </Details>

      <div className="mt-5 border-t border-[var(--ukb-border)] pt-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ukb-subtle)]">Strategy strip</h3>
          <button type="button" onClick={() => nav.toRisk("fincrime", "u-unmapped")} className={`text-xs ${ui.link} ${ui.focus}`}>
            1 plan initiative has no appetite statement
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {OBJECTIVES.filter((o) => !(o.statutoryLine && FIRM.firmType !== "building_society")).map((o) => (
            <ObjectiveTile key={o.objectiveId} tile={o} />
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function ObjectiveTile({ tile }: { tile: ObjectiveTileVM }) {
  const nav = useNav();
  const u = UNITS[tile.unitId];
  const status = unitStatus(u.unitId);
  const highlighted = nav.highlightRef === tile.drill.focusUnitId;
  return (
    <div
      className={`flex min-h-[112px] flex-col rounded-lg border p-3 ${TILE_TINT[status]} ${highlighted ? "ring-2 ring-[var(--ukb-focus)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => nav.toRisk(tile.drill.principalRiskId, tile.drill.focusUnitId)}
          title={tile.tooltip.join("\n")}
          aria-describedby={`tip-${tile.objectiveId}`}
          className={`rounded text-left text-[13px] font-bold leading-snug text-[var(--ukb-text)] hover:underline ${ui.focus}`}
        >
          {tile.objective}
        </button>
        <StatusToken status={status} label={tile.objectiveId === "O2" ? "Outside terms" : undefined} />
      </div>
      <span id={`tip-${tile.objectiveId}`} className="sr-only">
        {tile.tooltip.join(". ")}
      </span>
      <p className="mt-1.5 text-xs leading-snug text-[var(--ukb-muted)]">{TILE_LINE[tile.objectiveId]}</p>
      {tile.floorRow ? (
        <p className="mt-1 text-xs font-semibold leading-snug text-[var(--ukb-red)]">Floor breach: pre-CDD transacting (not a trade-off)</p>
      ) : null}
      <div className="mt-auto pt-2">
        <IntegrityBadge badgeRef={`tile-${tile.objectiveId}`} snapshot={u.integrity} compact onOpenEvidence={() => nav.toRisk(tile.drill.principalRiskId, tile.drill.focusUnitId)} />
      </div>
    </div>
  );
}

/* Z2 growth against capacity (CMP-13) */
function CapacityCard() {
  const nav = useNav();
  const u = UNITS["u-capacity"];
  return (
    <CardShell
      id="zone-z2"
      title={u.title}
      status={unitStatus(u.unitId)}
      integration={u.integration}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-3">
          <IntegrityBadge badgeRef="z2" snapshot={u.integrity} owner="Head of Financial Crime" onOpenEvidence={() => nav.toRisk("fincrime", u.unitId)} />
          <ActionList draftIds={["d-t25-choice", "d-t25-paper"]} canGate={nav.canGate} />
        </div>
      }
    >
      <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`block rounded text-left ${ui.focus}`}>
        <DeltaValue value="19 days" denominator="queue age · amber 14" delta="+7 vs Q2" size="lg" />
      </button>
      <MutedLine>
        Members +31% · qualified handlers +9% · {CAPACITY.membersPerHandler.to.toLocaleString("en-GB")} members per handler
      </MutedLine>
      <SoWhat>Next savings campaign in 6 weeks; no resourcing decision recorded.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>
          Alerts cleared within SLA {CAPACITY.slaCleared.value} ({CAPACITY.slaCleared.denominator}). Detection from counts; growth is not claimed as the cause.
        </MutedLine>
        {u.precedentIds.map((p) => (
          <PrecedentLine key={p} id={p} />
        ))}
      </Details>
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
    <CardShell
      id="zone-z5"
      title={u.title}
      status={unitStatus(u.unitId)}
      integration={u.integration}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-3">
          <IntegrityBadge badgeRef="z5" snapshot={u.integrity} owner="Feed owner" onOpenEvidence={() => nav.toRisk("fincrime", u.unitId)} />
          <ActionList draftIds={["d-t214-caveat", "d-t214-remed", "d-t217-challenge", "d-t214-triage"]} canGate={nav.canGate} />
        </div>
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ukb-subtle)]">Transaction monitoring coverage</p>
      <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`mt-1 block rounded text-left ${ui.focus}`}>
        <DeltaValue value="94.0%" denominator="records reconciled (2,256,000 of 2,400,000)" size="lg" />
      </button>
      <MutedLine>Same-day accounts 0% monitored · attestation signed 3 hours before the run finished</MutedLine>
      {caveat ? (
        <p className="mt-2 rounded-md bg-[var(--ukb-surface-2)] px-2 py-1 text-xs font-semibold text-[var(--ukb-text)]">
          Caveat accepted by {PEOPLE[caveat.byPersonId].name} on {caveat.on}; in pack with caveat
        </p>
      ) : null}
      <SoWhat>Caveat or withhold before the pack locks, and ask the feed owner to re-attest.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <RuleLine>The attestation must reference a finished run. The month 2 signature preceded the run by 3 hours.</RuleLine>
        <MutedLine>Last run 26 October 2026; other cohorts 99.97%. Proves records were not monitored, not that suspicion was missed.</MutedLine>
        <PrecedentLine id="uk-metro-2024" onOpen={() => nav.toRisk("fincrime", u.unitId)} />
      </Details>
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
      <div className="hidden grid-cols-[28px_1fr_240px_150px_64px] gap-3 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)] md:grid">
        <span>#</span>
        <span>Headline</span>
        <span>Position</span>
        <span>Status</span>
        <span>Checks</span>
      </div>
      <div className="max-h-[232px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Board headlines">
        {ranked.map((r, i) => (
          <ScorecardRow key={r.unitId} row={r} rank={i + 1} highlighted={nav.highlightRef === r.unitId} />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--ukb-muted)]">
        {counts.within_appetite} of {SCORECARD.length} within appetite · {FIRM.headlineCap} of {FIRM.level1Count} Level 1 metrics
        <PracticeLabel kind="practice_not_rule" />
      </p>
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[var(--ukb-brand)]/30 bg-[var(--ukb-brand-soft)] p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold text-[var(--ukb-text)]">
            {state.session.promoted ? "Promoted to the board view: NSFR" : "Proposed for the board view: NSFR"}
          </p>
          <button type="button" onClick={() => nav.toRisk("liquidity", nsfr.unitId)} className={`rounded text-left ${ui.focus}`} title={nsfr.ruleLine}>
            <DeltaValue value={nsfr.position!.value} denominator="against amber 115% · 10 → 2 pts above amber in one quarter" />
          </button>
        </div>
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
      title={u.ruleLine}
      className={`grid min-h-[58px] grid-cols-[28px_1fr] items-center gap-x-3 gap-y-1 border-b border-l-4 border-b-[var(--ukb-border)] px-3 py-2 last:border-b-0 md:grid-cols-[28px_1fr_240px_150px_64px] ${TONE[status].edge} ${
        highlighted ? "bg-[var(--ukb-highlight)]" : status === "red" || status === "amber" ? `${TONE[status].tint}` : "hover:bg-[var(--ukb-surface-2)]"
      }`}
    >
      <span className="text-xs tabular-nums text-[var(--ukb-subtle)]">{rank}</span>
      <div className="min-w-0">
        <button type="button" onClick={open} className={`rounded text-left text-[13px] font-semibold text-[var(--ukb-text)] hover:underline ${ui.focus}`}>
          {row.name}
        </button>
        {bankFeed ? (
          <span className="ml-1 align-middle text-[var(--ukb-subtle)]" title={`Needs the society's ${bankFeed} access`}>
            <span className="sr-only">Bank feed: needs the society&apos;s {bankFeed} access</span>
            <span aria-hidden>★</span>
          </span>
        ) : null}
        <p className="text-[11px] text-[var(--ukb-subtle)]">
          {row.domainLabel}
          {row.marker ? ` · ${row.marker}` : ""}
        </p>
      </div>
      <div className="col-start-2 text-xs md:col-start-auto">
        {row.shownAbove ? (
          <button type="button" onClick={() => scrollToZone(row.shownAbove!)} className={`${ui.link} ${ui.focus}`}>
            Shown above
          </button>
        ) : u.position ? (
          <span className="block truncate" title={`${u.position.value} ${u.position.denominator} ${u.position.delta ?? ""}`}>
            <span className={`font-bold tabular-nums ${TONE[status].number}`}>{u.position.value}</span>{" "}
            <span className="text-[var(--ukb-muted)]">{u.position.denominator}</span>
          </span>
        ) : null}
      </div>
      <div className="col-start-2 md:col-start-auto">
        <StatusToken status={status} />
      </div>
      <div className="col-start-2 md:col-start-auto">
        <IntegrityBadge badgeRef={`row-${u.unitId}`} snapshot={u.integrity} compact onOpenEvidence={() => nav.toRisk(u.principalRiskId, u.unitId)} />
      </div>
    </div>
  );
}

/* Z6 horizon line (below the fold) */
function HorizonLine() {
  const nav = useNav();
  const u = UNITS["u-horizon"];
  return (
    <CardShell id="zone-z6" title={u.title} status={unitStatus(u.unitId)} notAssessedReason="1 risk unmeasured">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <button type="button" onClick={() => nav.toRisk("fincrime", u.unitId)} className={`rounded text-left text-sm text-[var(--ukb-text)] hover:underline ${ui.focus}`}>
            {u.stateSentence}
          </button>
          <MutedLine>
            {HORIZON.daysToIncidentRules} days to the new incident reporting rules ({HORIZON.incidentRulesDate}) · {HORIZON.disclosureHold} disclosure figure under hold review
          </MutedLine>
        </div>
        <ActionList draftIds={u.draftIds} canGate={nav.canGate} />
      </div>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>
          {HORIZON.trialClassified.classified} of {HORIZON.trialClassified.total} incidents this year classified under the new rules in a trial run.
        </MutedLine>
      </Details>
    </CardShell>
  );
}

export default function BoardRiskViewScreen() {
  const nav = useNav();
  const counts = statusCounts(SCORECARD, UNITS);
  return (
    <BoardLayoutGrid
      band={
        <>
          <PageTitle title="Board Risk View" subtitle="Appetite used against plan, and whether each board figure can be defended. Q3 2026 against Q2 2026." />
          <AiExecutiveBand
            critical={{
              text: `Restriction breached: 112 of 9,400 tested · ${counts.unverified} of ${SCORECARD.length} headlines unverified`,
              onClick: () => nav.peer("restrictions"),
            }}
            due={{
              text: `${counts.amber} amber, ${counts.red} red · 1 promotion proposed · 13 items qualify`,
              onClick: () => nav.peer("escalation"),
            }}
            steady={{ text: `${counts.within_appetite} of ${SCORECARD.length} within appetite` }}
            aiLine="Summarised from the 12 headlines and the BRC exception feed as at 30 September 2026, with evidence to 26 October 2026. It adds no figures of its own."
          />
        </>
      }
      rows={[
        { key: "r1", left: <HeadlineAndStrip />, rightStack: [<CapacityCard key="z2" />, <DefensibilityCard key="z5" />] },
        { key: "r2", full: <RasScorecard /> },
        { key: "r3", full: <HorizonLine /> },
      ]}
    />
  );
}
