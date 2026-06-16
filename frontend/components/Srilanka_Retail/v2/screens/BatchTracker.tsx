"use client";

import { useState } from "react";
import { Check, CircleDashed, Lock } from "lucide-react";
import { batchById, mockData, qcResultsByBatchId, stickerByBatchId } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatDateTime, formatNumber } from "@/lib/Srilanka_Retail/v2/format";
import { useApp } from "../context/AppContext";
import { AiBadge, Btn, Card, Mono, SectionHeading, StatusBadge } from "../primitives";
import { ScreenTitle } from "./Dashboard";

interface Checkpoint {
  id: string;
  label: string;
  state: "complete" | "blocked" | "pending";
  sub?: string;
  ai?: { text: string; reasoning: string };
}

function checkpointsFor(batchId: string): Checkpoint[] {
  const b = batchById[batchId];
  const held = b?.releaseStatus === "held";
  return [
    { id: "intake", label: "Raw material intake / COA", state: "complete" },
    { id: "mash", label: "Mash & brew", state: "complete" },
    { id: "ferment", label: "Fermentation (ABV origin)", state: "complete", ai: { text: "ABV origin confirmed", reasoning: "gravity log matches" } },
    { id: "filter", label: "Filtration", state: "complete" },
    { id: "release", label: "Bright-beer release", state: held ? "blocked" : "complete", sub: held ? "Micro retest pending — blocked by Nilanthi Perera" : undefined },
    { id: "pack", label: "Packaging (label + sticker)", state: held ? "pending" : "complete" },
    { id: "bond", label: "Bright-beer → bonded warehouse", state: held ? "pending" : "complete" },
    { id: "removal", label: "Removal & transport permit", state: held ? "pending" : "complete" },
  ];
}

export function BatchTracker() {
  const { activeBatchId, setActiveBatchId, pushToast } = useApp();
  const batch = batchById[activeBatchId] ?? mockData.entities.batches[0];
  const checkpoints = checkpointsFor(batch.batchId);
  const defaultSel = checkpoints.find((c) => c.state === "blocked")?.id ?? "release";
  const [selected, setSelected] = useState(defaultSel);
  const cp = checkpoints.find((c) => c.id === selected) ?? checkpoints[4];
  const sticker = stickerByBatchId[batch.batchId];
  const qc = qcResultsByBatchId[batch.batchId] ?? [];
  const micro = qc.find((q) => q.parameter === "micro");
  const blocked = batch.releaseStatus === "held";

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <ScreenTitle title="Batch Compliance Tracker" />
        <select
          value={batch.batchId}
          onChange={(e) => { setActiveBatchId(e.target.value); }}
          className="rounded-md px-3 py-2 text-[12px] lion-mono outline-none"
          style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
        >
          {mockData.entities.batches.map((b) => (
            <option key={b.batchId} value={b.batchId}>{b.batchId}</option>
          ))}
        </select>
      </div>

      {/* Status band */}
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
        <BandCell label="Batch ID" value={<Mono className="text-[13px]">{batch.batchId}</Mono>} />
        <BandCell label="SKU" value={batch.skuName} />
        <BandCell label="SAP order" value={<Mono className="text-[13px]">{batch.sapProcessOrderNo}</Mono>} />
        <BandCell
          label="ABV"
          value={<AiBadge reasoning={batch.abvSignedByName ? `${batch.measuredAbvPct}% — signed by ${batch.abvSignedByName} ${formatDateTime(batch.abvSignedAt)}` : "Canonical ABV pending QA sign-off"}>{batch.measuredAbvPct}%</AiBadge>}
        />
        <BandCell label="Release status" value={<StatusBadge status={blocked ? "watch" : batch.releaseStatus === "released" ? "healthy" : batch.releaseStatus === "rejected" ? "critical" : "neutral"} label={batch.releaseStatus.toUpperCase()} />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        {/* Pipeline */}
        <div>
          <SectionHeading>Checkpoint pipeline</SectionHeading>
          <Card className="p-4">
            {checkpoints.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className="flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left transition-colors"
                style={{ backgroundColor: selected === c.id ? "var(--surface-raised)" : "transparent" }}
              >
                <StepIcon state={c.state} last={i === checkpoints.length - 1} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium" style={{ color: c.state === "pending" ? "var(--text-secondary)" : "var(--text-primary)" }}>
                    {c.label}
                  </div>
                  {c.sub ? <div className="text-[11px]" style={{ color: "var(--status-watch)" }}>{c.sub}</div> : null}
                  {c.ai ? <div className="mt-1"><AiBadge reasoning={c.ai.reasoning}>{c.ai.text}</AiBadge></div> : null}
                </div>
              </button>
            ))}
          </Card>
        </div>

        {/* Context */}
        <div>
          <SectionHeading>{cp.label} — {cp.state.toUpperCase()}</SectionHeading>
          <Card className="p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>QC test results</div>
            <div className="overflow-hidden rounded-md" style={{ border: "1px solid var(--border-subtle)" }}>
              <QcRow t="TPC micro" r={micro?.value === "pending" ? "pending" : "48 CFU/ml"} s="<50 CFU/ml" ok={micro?.value !== "pending"} pending={micro?.value === "pending"} />
              <QcRow t="Coliforms" r="<1" s="<1" ok />
              <QcRow t="Yeasts/moulds" r="2" s="<10" ok />
              <QcRow t="Sensory" r="Pass" s="Pass" ok />
            </div>

            <div className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>ABV triple-check</div>
            <div className="grid grid-cols-3 gap-2">
              <TripleCell label="Lab result" value={`${batch.measuredAbvPct}%`} />
              <TripleCell label="Label declaration" value={`${batch.targetAbvPct}%`} />
              <TripleCell label="Excise basis" value={`${batch.targetAbvPct}%`} />
            </div>
            <div className="mt-2">
              <AiBadge reasoning="Monitor: if lab result is used, duty recalculation applies">
                {batch.abvVariancePct.toFixed(1)}% drift — within tolerance
              </AiBadge>
            </div>

            {sticker ? (
              <div className="mt-4 rounded-md p-3" style={{ backgroundColor: "var(--surface-raised)" }}>
                <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Sticker application</div>
                <div className="mt-1 text-[13px]" style={{ color: "var(--text-primary)" }}>
                  <Mono>{formatNumber(sticker.qtyApplied)}</Mono> applied of <Mono>{formatNumber(batch.unitsPackaged)}</Mono>
                  {batch.stickerGap ? <span className="ml-2 lion-mono" style={{ color: "var(--status-critical)" }}>gap {formatNumber(batch.stickerGap)}</span> : null}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Btn variant="primary" disabled={blocked} onClick={() => pushToast("Batch released — audit event logged")}>
                {blocked ? "Approve release (blocked)" : "Approve release"}
              </Btn>
              <Btn onClick={() => pushToast("Escalated to Plant Manager", "info")}>Escalate</Btn>
              <Btn onClick={() => pushToast("Opening full lab report", "info")}>View lab report</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BandCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{label}</div>
      <div className="mt-1 text-[13px]" style={{ color: "var(--text-primary)" }}>{value}</div>
    </Card>
  );
}

function StepIcon({ state, last }: { state: Checkpoint["state"]; last: boolean }) {
  const color = state === "complete" ? "var(--status-healthy)" : state === "blocked" ? "var(--status-watch)" : "var(--status-neutral)";
  return (
    <div className="flex flex-col items-center">
      <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ border: `1.5px solid ${color}` }}>
        {state === "complete" ? <Check size={13} style={{ color }} /> : state === "blocked" ? <Lock size={12} style={{ color }} /> : <CircleDashed size={12} style={{ color }} />}
      </span>
      {!last ? <span style={{ width: 1.5, height: 18, backgroundColor: "var(--border-subtle)" }} /> : null}
    </div>
  );
}

function QcRow({ t, r, s, ok, pending }: { t: string; r: string; s: string; ok: boolean; pending?: boolean }) {
  const color = pending ? "var(--status-watch)" : ok ? "var(--status-healthy)" : "var(--status-critical)";
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr] items-center gap-2 px-3 py-2 text-[12px]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ color: "var(--text-primary)" }}>{t}</span>
      <Mono style={{ color: "var(--text-secondary)" }}>{r}</Mono>
      <Mono style={{ color: "var(--text-secondary)" }}>{s}</Mono>
      <span className="text-right text-[11px] font-semibold" style={{ color }}>{pending ? "⚠ RETEST" : ok ? "✓" : "✗"}</span>
    </div>
  );
}

function TripleCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md p-2.5 text-center" style={{ backgroundColor: "var(--surface-raised)" }}>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{label}</div>
      <Mono className="mt-1 block text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>{value}</Mono>
    </div>
  );
}
