"use client";

/**
 * UK Board v1 — S4 Escalation health, seen as the BRC chair (beat 4).
 * The removed item is the persistent amber (TC-10). Items cannot be removed from the face.
 * CRO actions appear only in the separate "CRO preview actions" strip (9C-OD-4).
 * No awareness-gap content and no individual SMF trails here (HF-9, HF-10).
 */
import { EVENTS, KRI_TILES, MANIFEST_ID, PACK_ITEMS, ROUTES, SERIES, UNITS } from "@/lib/ukboard/v1/data";
import { projectedCrossing } from "@/lib/ukboard/v1/selectors";
import type { KriTile, Status } from "@/lib/ukboard/v1/types";
import { AiExecutiveBand, DraftActionCard, GatedFaceLine } from "../ai";
import { BoardLayoutGrid, CardShell, Details, IntegrityBadge, MutedLine, PageTitle, PracticeLabel, RuleLine, SoWhat, StatGrid, StatusToken, TONE, type StatItem } from "../primitives";
import { agendaProposalCount, useBoard } from "../state/boardStore";
import { ui } from "../theme";
import { unitStatus, useNav } from "./shared";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function useLatestManifest() {
  const { state } = useBoard();
  const versions = state.session.manifestVersions;
  return versions[versions.length - 1];
}

/** Two labelled figures per governance KRI tile (DG-10 has the full detail). */
const KRI_STATS: Record<KriTile["variant"], (status: Status) => StatItem[]> = {
  backlog: (st) => [
    { label: "Projected clearance", value: "31 months", sub: "against 12 committed", status: st },
    { label: "Extensions", value: "3", sub: "against a limit of 2 · never in a BRC pack" },
  ],
  latency: (st) => [
    { label: "Median to BRC", value: "4.6 months", sub: "n = 23 high-severity issues", status: st },
    { label: "Unescalated", value: "3", sub: "material items after 12 months" },
  ],
  effectiveness: (st) => [
    { label: "Overdue CDD reviews", value: "26,900", sub: "against a 10,000 target", status: st },
    { label: "Actions closed", value: "42", sub: "this quarter; 2 issues downgraded" },
  ],
};

/* Z1 headline: T2-34 with the T2-35 state inline */
function EscalationHeadline() {
  const nav = useNav();
  const u = UNITS["u-vuln"];
  const redIn = projectedCrossing(SERIES["u-vuln"], 18);
  const open = () => nav.drill({ screen: "drill", kind: "manifest", manifestId: MANIFEST_ID, itemId: "pi-vuln" }, u.unitId);
  return (
    <CardShell
      id="s4-z1"
      title={u.title}
      status={unitStatus(u.unitId)}
      statusLabel="Persistent amber"
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-3">
          <IntegrityBadge badgeRef="s4-z1" snapshot={u.integrity} owner="Decides: BRC chair" />
          <DraftActionCard draftId="d-t234-options" canGate={false} />
          <GatedFaceLine draftIds={["d-t235-restore"]} />
        </div>
      }
    >
      <button type="button" onClick={open} className={`block rounded text-left ${ui.focus}`}>
        <p className="text-lg font-bold leading-snug text-[var(--ukb-text)]">1 qualifying item was removed at ERC on 14 October 2026 with no reason recorded</p>
      </button>
      <MutedLine>Vulnerable-customer exceptions per 10,000 contacts</MutedLine>
      <div className="mt-3">
        <StatGrid
          items={[
            { label: "Q3 2026", value: "16.9", sub: "Q2 15.8 · Q1 14.2", status: "amber", onClick: open },
            { label: "At amber", value: "3 quarters", sub: "persistence rule: 2 (practice)", status: "amber", onClick: open },
            { label: "Red projected", value: redIn ?? "—", sub: "red 18 · early warning, not a prediction", onClick: open },
            { label: "Recorded", value: "None", sub: "no action, decision or escalation", status: "red", onClick: open },
          ]}
        />
      </div>
      <SoWhat>Put it on the December agenda and decide remediation, a time-limited waiver or a recalibration review.</SoWhat>
      <Details>
        <RuleLine>{u.ruleLine}</RuleLine>
        <MutedLine>
          Persistence rule: 2 quarters at Level 2 <PracticeLabel kind="practice_not_rule" />. Amber 14, red 18. This proves nothing was recorded, not that nothing was discussed.
        </MutedLine>
      </Details>
    </CardShell>
  );
}

/* Z2 exception feed + override log (CMP-26), boxed; removed item pinned first */
function ExceptionFeed() {
  const nav = useNav();
  const latest = useLatestManifest();
  const ordered = [...PACK_ITEMS].sort((a, b) => Number(!!b.removal) - Number(!!a.removal));
  const inPack = latest.itemIds.length;
  return (
    <CardShell id="s4-z2" title="What qualified for this BRC?">
      <StatGrid
        cols={2}
        items={[
          { label: "In the pack", value: `${inPack} of ${PACK_ITEMS.length}`, sub: `qualifying items · v${latest.version} ${latest.state}`, status: inPack < PACK_ITEMS.length ? "amber" : "within_appetite" },
          {
            label: "Removed, no reason",
            value: inPack < PACK_ITEMS.length ? "1" : "0",
            sub: inPack < PACK_ITEMS.length ? "at ERC, 14 October 2026" : `restored in draft v${latest.version}`,
            status: inPack < PACK_ITEMS.length ? "red" : "within_appetite",
          },
        ]}
      />
      <p className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-wide text-[var(--ukb-subtle)]">Exception feed and override log</p>
      <div className="max-h-[236px] overflow-y-auto rounded-lg border border-[var(--ukb-border)]" role="list" aria-label="Exception feed">
        {ordered.map((i) => {
          const removedNow = !latest.itemIds.includes(i.itemId);
          return (
            <button
              key={i.itemId}
              type="button"
              role="listitem"
              title={`Routing rule: ${i.routingRule}`}
              onClick={() => nav.drill({ screen: "drill", kind: "manifest", manifestId: MANIFEST_ID, itemId: i.itemId }, i.itemId)}
              className={`flex w-full items-start justify-between gap-2 border-b border-l-4 border-b-[var(--ukb-border)] px-3 py-2 text-left text-xs last:border-b-0 ${ui.focus} ${
                i.removal && removedNow ? `${TONE.red.edge} ${TONE.red.tint}` : i.removal ? `${TONE.amber.edge} ${TONE.amber.tint}` : `${TONE.within_appetite.edge} hover:bg-[var(--ukb-surface-2)]`
              } ${nav.highlightRef === i.itemId ? "ring-2 ring-inset ring-[var(--ukb-focus)]" : ""}`}
            >
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--ukb-text)]">{i.label}</span>
                {i.removal ? (
                  <span className="block text-[11px] text-[var(--ukb-muted)]">
                    Approver: {i.removal.approver ?? "none recorded"} · reason: {i.removal.reason ?? "no reason recorded"}
                  </span>
                ) : null}
              </span>
              <StatusToken
                status={i.removal ? (removedNow ? "red" : "amber") : "within_appetite"}
                label={i.removal ? (removedNow ? "Removed" : "Restored · draft") : "In pack"}
              />
            </button>
          );
        })}
      </div>
      <Details>
        <RuleLine>Items are placed by the firm&apos;s routing rules and cannot be removed without a named approver and a reason code.</RuleLine>
      </Details>
    </CardShell>
  );
}

const KRI_STATUS_LABEL = { backlog: "Overdue", latency: "Slow", effectiveness: "No effect" } as const;

/* Z3 governance KRI tiles (CMP-27) */
function GovernanceKriTile({ tile }: { tile: KriTile }) {
  const nav = useNav();
  const u = UNITS[tile.unitId];
  return (
    <CardShell
      id={`s4-${tile.unitId}`}
      title={tile.title}
      status={unitStatus(u.unitId)}
      statusLabel={KRI_STATUS_LABEL[tile.variant]}
      highlight={nav.highlightRef === u.unitId}
      footer={
        <div className="flex flex-col gap-2">
          <IntegrityBadge badgeRef={`s4-${tile.unitId}`} snapshot={u.integrity} compact />
          <GatedFaceLine draftIds={[tile.draftId]} />
        </div>
      }
    >
      <StatGrid
        cols={2}
        items={KRI_STATS[tile.variant](unitStatus(u.unitId)).map((it) => ({ ...it, onClick: () => nav.drill({ screen: "drill", kind: "kri", unitId: tile.unitId }, tile.unitId) }))}
      />
      <Details>
        <RuleLine>{tile.ruleLine}</RuleLine>
      </Details>
    </CardShell>
  );
}

/* Separate labelled strip for CRO actions on the chair preview (9C-OD-4) */
function CroPreviewStrip() {
  return (
    <section aria-label="CRO preview actions" className="rounded-xl border border-[var(--ukb-brand)]/30 bg-[var(--ukb-brand-soft)] p-5">
      <h2 className="text-sm font-bold text-[var(--ukb-text)]">CRO preview actions</h2>
      <MutedLine>For the CRO as pack owner. Not part of the chair&apos;s view; the chair decides.</MutedLine>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {["d-t235-restore", "d-pg5", "d-t236-agenda", "d-t237-review", "d-t238-reopen"].map((id) => (
          <DraftActionCard key={id} draftId={id} canGate />
        ))}
      </div>
    </section>
  );
}

export default function EscalationHealthScreen() {
  const { state } = useBoard();
  const latest = useLatestManifest();
  const proposals = agendaProposalCount(state);
  const decided = ROUTES.filter((r) => r.status === "decided").length;
  const events = EVENTS.length + state.session.ledgerDrafts.length;
  return (
    <div className="space-y-5">
      <BoardLayoutGrid
        band={
          <>
            <PageTitle title="Escalation health" subtitle="Viewing as the BRC chair (preview): is bad news reaching the committee?" />
            <AiExecutiveBand
              critical={{
                text: latest.itemIds.length < PACK_ITEMS.length ? "1 qualifying item removed at ERC with no reason recorded" : "Removed item restored in draft; awaiting CRO pack approval",
                onClick: () => scrollTo("s4-z1"),
              }}
              due={{ text: `December agenda items proposed: ${proposals}`, onClick: () => scrollTo("s4-u-kri-backlog") }}
              steady={{ text: `${latest.itemIds.length} of ${PACK_ITEMS.length} qualifying items in the pack (v${latest.version})`, onClick: () => scrollTo("s4-z2") }}
              aiLine="Summarised from the BRC exception feed, the override log and the governance KRIs for this cycle. It adds no figures of its own."
            />
          </>
        }
        rows={[
          { key: "r1", left: <EscalationHeadline />, rightStack: [<ExceptionFeed key="z2" />], stretch: true },
          {
            key: "r2",
            full: (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {KRI_TILES.map((t) => (
                  <GovernanceKriTile key={t.unitId} tile={t} />
                ))}
              </div>
            ),
          },
        ]}
      />
      <CroPreviewStrip />
      <footer className="text-xs text-[var(--ukb-muted)]">
        Reportability (counts only): {events} events; {decided} of {ROUTES.length} routes decided. Detail on Restrictions and reportability.
      </footer>
    </div>
  );
}
