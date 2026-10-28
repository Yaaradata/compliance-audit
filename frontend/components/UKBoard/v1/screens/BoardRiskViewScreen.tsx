"use client";

/**
 * UK Board v1 — S1 Board Risk View (beats 1 and 2). Post-9C layout:
 * row 0 AI band · row 1 headline + strip | Z2 above Z5 · row 2 boxed scorecard · row 3 horizon.
 * Each value renders once on S1 (V-5). Every figure sits in a labelled stat box; the rule
 * line, owner detail and precedents sit under Details.
 */
import { CAPACITY, FIRM, HORIZON, OBJECTIVES, PEOPLE, PROMOTION, SCORECARD, THRESHOLDS, UNITS } from "@/lib/ukboard/v1/data";
import { rankScorecard, statusCounts, verifiedCount } from "@/lib/ukboard/v1/selectors";
import type { ObjectiveTile as ObjectiveTileVM, ScorecardRow as ScorecardRowVM, ZoneId } from "@/lib/ukboard/v1/types";
import { BANK_FED_UNITS } from "@/lib/ukboard/v1/widgetRegistry";
import { AiExecutiveBand } from "../ai";
import { HeadroomGauge } from "../cards/charts";
import {
  BoardLayoutGrid,
  CardFooter,
  CardShell,
  Details,
  IntegrityBadge,
  MutedLine,
  PageTitle,
  PracticeLabel,
  PrecedentLine,
  RuleLine,
  SoWhat,
  StatGrid,
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
  const open = () => nav.toRisk("credit", u.unitId);
  return (
    <CardShell
      id="zone-z1"
      title={u.title}
      status={unitStatus(u.unitId)}
      statusLabel="Within appetite · amber projected"
      highlight={nav.highlightRef === u.unitId}
      footer={
        <CardFooter
          meta={<IntegrityBadge badgeRef="z1" snapshot={u.integrity} owner={u.ownerRole} onOpenEvidence={open} />}
          actions={<ActionList draftIds={u.draftIds} canGate={nav.canGate} />}
        />
      }
    >
      <StatGrid
        items={[
          { label: "Appetite used", value: "88%", sub: "17.6% of 20% · +1.5 pts vs Q2", status: "within_appetite", onClick: open },
          { label: "Headroom", value: "£96m", sub: "on a £4.0bn new-lending plan", onClick: open },
          { label: "Amber projected", value: "Q2 2027", sub: "Early warning, not a prediction", status: "amber", onClick: open },
          { label: "Headlines verified", value: `${verified} of ${SCORECARD.length}`, sub: `${counts.unverified} unverified`, status: "unverified", onClick: () => scrollToZone("Z5") },
        ]}
      />

      <div className="mt-4 rounded-lg border border-[var(--ukb-border)] px-3 py-3">
        <div className="mb-1 flex items-baseline justify-between text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-subtle)]">
          <span>High-LTV share of new lending</span>
          <PracticeLabel kind="illustrative" />
        </div>
        <HeadroomGauge actual={17.6} amber={t.amber} red={t.red} max={t.capacity ?? 24} unit="%" mode="compact" />
        <div className="mt-1 grid grid-cols-3 text-[11px] text-[var(--ukb-muted)]">
          <span>
            Actual <span className="font-bold text-[var(--ukb-text)]">17.6%</span>
          </span>
          <span className="text-center">
            Amber <span className="font-bold text-[var(--ukb-amber)]">{t.amber}%</span>
          </span>
          <span className="text-right">
            Red (appetite) <span className="font-bold text-[var(--ukb-red)]">{t.red}%</span>
          </span>
        </div>
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
    <div className={`flex min-h-[132px] flex-col rounded-lg border p-3 ${TILE_TINT[status]} ${highlighted ? "ring-2 ring-[var(--ukb-focus)]" : ""}`}>
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
      <p className="mt-2 text-xs leading-snug text-[var(--ukb-muted)]">{TILE_LINE[tile.objectiveId]}</p>
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
  const open = () => nav.toRisk("fincrime", u.unitId);
  return (
    <CardShell
      id="zone-z2"
      title={u.title}
      status={unitStatus(u.unitId)}
      integration={u.integration}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <CardFooter
          meta={<IntegrityBadge badgeRef="z2" snapshot={u.integrity} owner="Head of Financial Crime" onOpenEvidence={open} />}
          actions={<ActionList draftIds={["d-t25-choice", "d-t25-paper"]} canGate={nav.canGate} />}
        />
      }
    >
      <StatGrid
        cols={3}
        dense
        items={[
          { label: "Queue age", value: "19 days", sub: "Amber 14 · +7 vs Q2", status: "amber", onClick: open },
          { label: "Per handler", value: CAPACITY.membersPerHandler.to.toLocaleString("en-GB"), sub: `members · was ${CAPACITY.membersPerHandler.from.toLocaleString("en-GB")}`, onClick: open },
          { label: "Growth", value: "+31%", sub: "members · handlers +9%", onClick: open },
        ]}
      />
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
  const open = () => nav.toRisk("fincrime", u.unitId);
  return (
    <CardShell
      id="zone-z5"
      title="Can I defend this figure?"
      status={unitStatus(u.unitId)}
      integration={u.integration}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <CardFooter
          meta={<IntegrityBadge badgeRef="z5" snapshot={u.integrity} owner="Feed owner" onOpenEvidence={open} />}
          actions={<ActionList draftIds={["d-t214-caveat", "d-t214-remed", "d-t217-challenge", "d-t214-triage"]} canGate={nav.canGate} />}
        />
      }
    >
      <StatGrid
        cols={3}
        dense
        items={[
          { label: "TM coverage", value: "94.0%", sub: "2,256,000 of 2,400,000 records", status: "unverified", onClick: open },
          { label: "Same-day", value: "0%", sub: "accounts monitored", status: "unverified", onClick: open },
          { label: "Attestation", value: "3 hrs", sub: "signed before the run ended", status: "unverified", onClick: open },
        ]}
      />
      {caveat ? (
        <p className="mt-3 rounded-md border border-dashed border-[var(--ukb-grey-line)] bg-[var(--ukb-grey-tint)] px-3 py-2 text-xs font-semibold text-[var(--ukb-text)]">
          Still Unverified · caveat accepted by {PEOPLE[caveat.byPersonId].name} on {caveat.on}; in pack with caveat
        </p>
      ) : null}
      <SoWhat>Caveat or withhold before the pack locks, and ask the feed owner to re-attest.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <RuleLine>The attestation must reference a finished run. The month 2 signature preceded the run by 3 hours.</RuleLine>
        <MutedLine>Other cohorts 99.97% (2,256,677 records). Proves records were not monitored, not that suspicious activity was missed.</MutedLine>
        <PrecedentLine id="uk-metro-2024" onOpen={open} />
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
      <div className="mb-3 flex flex-wrap gap-2">
        <StatusToken status="red" label={`${counts.red} red`} />
        <StatusToken status="unverified" label={`${counts.unverified} unverified`} />
        <StatusToken status="amber" label={`${counts.amber} amber`} />
        <StatusToken status="within_appetite" label={`${counts.within_appetite} within appetite`} />
      </div>
      <div className="hidden grid-cols-[28px_1fr_260px_150px_64px] gap-3 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ukb-subtle)] md:grid">
        <span>#</span>
        <span>Headline</span>
        <span>Position</span>
        <span>Status</span>
        <span>Checks</span>
      </div>
      <div className="max-h-[236px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Board headlines">
        {ranked.map((r, i) => (
          <ScorecardRow key={r.unitId} row={r} rank={i + 1} highlighted={nav.highlightRef === r.unitId} />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-[var(--ukb-muted)]">
        {FIRM.headlineCap} of {FIRM.level1Count} Level 1 metrics shown as board headlines
        <PracticeLabel kind="practice_not_rule" />
      </p>
      <div className="mt-4 grid grid-cols-1 items-center gap-3 rounded-lg border border-[var(--ukb-brand)]/30 bg-[var(--ukb-brand-soft)] p-3 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-accent)]">
            {state.session.promoted ? "Promoted to the board view" : "Proposed for the board view"}
          </p>
          <button type="button" onClick={() => nav.toRisk("liquidity", nsfr.unitId)} className={`mt-0.5 block rounded text-left ${ui.focus}`} title={nsfr.ruleLine}>
            <span className="text-sm font-bold text-[var(--ukb-text)]">NSFR {nsfr.position!.value}</span>{" "}
            <span className="text-xs text-[var(--ukb-muted)]">against amber 115% · from 10 to 2 points above amber in one quarter</span>
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
      className={`grid min-h-[58px] grid-cols-[28px_1fr] items-center gap-x-3 gap-y-1 border-b border-l-4 border-b-[var(--ukb-border)] px-3 py-2 last:border-b-0 md:grid-cols-[28px_1fr_260px_150px_64px] ${TONE[status].edge} ${
        highlighted ? "bg-[var(--ukb-highlight)]" : status === "red" || status === "amber" ? TONE[status].tint : "hover:bg-[var(--ukb-surface-2)]"
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
  const open = () => nav.toRisk("fincrime", u.unitId);
  return (
    <CardShell
      id="zone-z6"
      title={u.title}
      status={unitStatus(u.unitId)}
      notAssessedReason="1 risk unmeasured"
      footer={<CardFooter meta={<IntegrityBadge badgeRef="z6" snapshot={u.integrity} owner="Head of Financial Crime" compact />} actions={<ActionList draftIds={u.draftIds} canGate={nav.canGate} />} />}
    >
      <StatGrid
        items={[
          { label: "Emerging risks", value: String(HORIZON.emergingRisks), sub: "in the register", onClick: open },
          { label: "Within 12 months", value: String(HORIZON.withinTwelveMonths), sub: "expected to crystallise", onClick: open },
          { label: "With no metric", value: "1", sub: HORIZON.unmapped, status: "amber", onClick: open },
          { label: "Days to new rules", value: String(HORIZON.daysToIncidentRules), sub: `Incident reporting from ${HORIZON.incidentRulesDate}` },
        ]}
      />
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>
          {HORIZON.trialClassified.classified} of {HORIZON.trialClassified.total} incidents this year classified under the new rules in a trial run · {HORIZON.disclosureHold} disclosure figure under
          hold review.
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
        { key: "r1", left: <HeadlineAndStrip />, rightStack: [<CapacityCard key="z2" />, <DefensibilityCard key="z5" />], stretch: true },
        { key: "r2", full: <RasScorecard /> },
        { key: "r3", full: <HorizonLine /> },
      ]}
    />
  );
}
