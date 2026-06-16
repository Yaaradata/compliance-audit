"use client";

import { mockData, reconciliationRowById } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatLKR, formatLKRCompact, formatNumber, formatSigned } from "@/lib/Srilanka_Retail/v2/format";
import type { ReconciliationRow } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { AiBadge, AiReasoningBlock, Btn, Card, CounterCard, EvidenceLink, Mono, SectionHeading, STATUS_VAR } from "../primitives";
import { ScreenTitle } from "./Dashboard";

const rows = mockData.entities.reconciliationRows;
const decl = mockData.entities.exciseDeclarations.find((d) => d.period === "2026-06")!;
const agg = mockData.derivedAggregates;

export function ExciseWorkbench() {
  const { selectedRowId, setSelectedRowId, navigate, setActiveBatchId, openEvidencePack, openReturnDraft } = useApp();
  const row = reconciliationRowById[selectedRowId] ?? rows[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <ScreenTitle title="Excise Reconciliation Workbench" subtitle="June 2026 · Biyagama · four-way tie-out" />

      {/* Status band */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <CounterCard
          label="Live duty position"
          value={formatLKRCompact(decl.dutyAmountLkr)}
          status="neutral"
          ai={{ text: "computed from 1,287 removals × rate v2026.3", reasoning: "Rate sourced from Obligation Registry C36" }}
        />
        <CounterCard
          label="Expected − declared variance"
          value={formatLKRCompact(agg.totalVarianceLkr)}
          status="risk"
          caption="Rs 0.9M sticker + Rs 1.1M ABV + Rs 0.34M timing"
        />
        <CounterCard
          label="Reconciliation state"
          value={`Breaks: ${agg.reconciliationBreakCount}`}
          status="critical"
          caption={`${agg.reconciliationCriticalCount} Critical`}
        />
      </div>

      {/* Diff grid + context */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
        <div>
          <SectionHeading>Four-way diff grid · 1,287 removals</SectionHeading>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.9fr] gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div>① Removal / Gate pass</div>
              <div>② Stickers applied</div>
              <div>③ Duty declared</div>
              <div>④ Permit</div>
            </div>
            {rows.map((r) => (
              <DiffRow key={r.removalId} r={r} selected={r.removalId === selectedRowId} onSelect={() => setSelectedRowId(r.removalId)} />
            ))}
          </Card>
        </div>

        {/* Context panel */}
        <div>
          <SectionHeading>Break — {row.removalId}</SectionHeading>
          <Card className="p-4">
            <AiReasoningBlock
              reasoning={
                row.status === "critical"
                  ? "28,800 units dispatched but only 27,600 sticker serials (FPS-2026-AB…) linked. 1,200 units unaccounted ≈ Rs 0.9 M duty at risk."
                  : row.note ?? "All four streams reconcile. No duty at risk on this removal."
              }
              confidence={row.status === "critical" ? "hypothesis" : "fact"}
              hypothesis={row.status === "critical" ? "Likely cause: stickers from order FPS-2026-AB not yet scanned at Line 2." : undefined}
              metric={{ label: "Duty at risk", value: formatLKRCompact(row.dutyAtRiskLkr) }}
            />

            <div className="mt-4">
              <SectionHeading>Variance waterfall</SectionHeading>
              <Waterfall />
              <div className="mt-1.5">
                <AiBadge>AI-attributed by removal event</AiBadge>
              </div>
            </div>

            <div className="mt-4">
              <SectionHeading>Evidence links</SectionHeading>
              <div className="flex flex-col gap-2">
                <EvidenceLink link={{ id: "e1", label: `Sticker order ${row.stickerOrderRef}`, sourceSystem: "STICKER_PORTAL", entityType: "Sticker" }} />
                <EvidenceLink link={{ id: "e2", label: `Batch ${row.batchId}`, sourceSystem: "SAP", entityType: "Batch" }} onOpen={() => { setActiveBatchId(row.batchId); navigate("batches"); }} />
                <EvidenceLink link={{ id: "e3", label: `Gate pass ${row.removalId}`, sourceSystem: "SAP", entityType: "RemovalEvent" }} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action rail */}
      <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <Btn onClick={() => navigate("excise")}>Resolve break — add note</Btn>
        <Btn>Acknowledge variance</Btn>
        <div className="flex gap-2">
          <Btn onClick={() => openEvidencePack({ type: "period", ref: "2026-06" }, "EXCISE")}>Generate Excise pack</Btn>
          <Btn variant="primary" onClick={openReturnDraft}>Sign &amp; file Excise return</Btn>
        </div>
      </Card>
    </div>
  );
}

function DiffRow({ r, selected, onSelect }: { r: ReconciliationRow; selected: boolean; onSelect: () => void }) {
  const stickerColor = r.stickerDelta < 0 ? "var(--status-critical)" : "var(--text-primary)";
  return (
    <button
      type="button"
      onClick={onSelect}
      className="grid w-full grid-cols-[1.6fr_1fr_0.8fr_0.9fr] items-center gap-2 px-3 py-3 text-left transition-colors"
      style={{
        borderLeft: `3px solid ${STATUS_VAR[r.status]}`,
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: selected ? "var(--surface-raised)" : "transparent",
      }}
    >
      <div>
        <Mono className="text-[12px]" style={{ color: "var(--text-primary)" }}>{r.removalId}</Mono>
        <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {formatNumber(r.unitsRemoved)} units · {formatNumber(r.volumeL)} L
        </div>
      </div>
      <div>
        <Mono className="text-[13px] font-semibold" style={{ color: stickerColor }}>
          {formatNumber(r.stickersApplied)}
        </Mono>
        {r.stickerDelta !== 0 ? (
          <span className="ml-1.5 lion-mono text-[11px]" style={{ color: "var(--status-critical)" }}>
            ({formatSigned(r.stickerDelta)})
          </span>
        ) : (
          <span className="ml-1.5 text-[11px]" style={{ color: "var(--status-healthy)" }}>✓</span>
        )}
        {r.stickerDelta < 0 ? (
          <div className="text-[10px]" style={{ color: "var(--status-critical)" }}>
            {formatLKRCompact(r.dutyAtRiskLkr)} at risk
          </div>
        ) : null}
      </div>
      <div>
        {r.abvActual && r.abvActual !== r.abvDeclared ? (
          <span className="lion-mono text-[12px]" style={{ color: "var(--status-watch)" }}>{r.abvDeclared}%→{r.abvActual}%</span>
        ) : (
          <Mono className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{formatLKRCompact(r.dutyDeclaredLkr)}</Mono>
        )}
      </div>
      <div className="text-[12px]" style={{ color: r.hasPermit ? "var(--status-healthy)" : "var(--status-watch)" }}>
        {r.hasPermit ? "✓ permit" : "missing"}
      </div>
    </button>
  );
}

function Waterfall() {
  const bars = [
    { label: "Expected", value: 5.41, color: "var(--ai-accent)" },
    { label: "Declared", value: 5.39, color: "var(--ai-accent)" },
    { label: "Gap", value: 0.02, color: "var(--status-risk)" },
  ];
  const max = 5.41;
  return (
    <div className="flex items-end gap-3" style={{ height: 92 }}>
      {bars.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center justify-end">
          <div className="lion-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>Rs {b.value}bn</div>
          <div className="mt-1 w-full rounded-t" style={{ height: `${(b.value / max) * 64 + 6}px`, backgroundColor: b.color }} />
          <div className="mt-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

// Re-export for the return modal totals.
export { decl as juneDeclaration };
export function exciseReturnTotals() {
  return { decl, formattedDuty: formatLKR(decl.dutyAmountLkr) };
}
