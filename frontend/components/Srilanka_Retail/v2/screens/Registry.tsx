"use client";

import { useMemo, useState } from "react";
import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import type { ObligationControl } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { AiBadge, Btn, Card, Mono, SectionHeading } from "../primitives";
import { ScreenTitle } from "./Dashboard";

const ALL = mockData.entities.obligationControls;

export function Registry() {
  const { pushToast } = useApp();
  const [industry, setIndustry] = useState<"Brewing" | "Distilling">("Brewing");
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState("56.19");

  const rows = useMemo(() => ALL.filter((o) => o.industry === industry), [industry]);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <ScreenTitle title="Obligation & Control Registry" subtitle="Ruleset v2026.3 · effective 2026-06-01" />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Industry</span>
        {(["Brewing", "Distilling"] as const).map((ind) => (
          <button
            key={ind}
            type="button"
            onClick={() => setIndustry(ind)}
            className="rounded px-3 py-1.5 text-[12px] transition-colors"
            style={{ backgroundColor: industry === ind ? "var(--ai-accent)" : "var(--surface-raised)", color: industry === ind ? "#fff" : "var(--text-secondary)" }}
          >
            {ind}
          </button>
        ))}
        <span className="ml-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {rows.length} obligations · adaptability proof: switching swaps the rule set, not the screen
        </span>
      </div>

      <SectionHeading>Obligation matrix</SectionHeading>
      <Card className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[1.6fr_1fr_1.6fr_1fr_0.9fr_0.7fr_1.2fr] gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div>Obligation</div><div>Regulator</div><div>Control</div><div>Owner</div><div>Freq</div><div>Cap</div><div>Config</div>
          </div>
          {rows.map((o) => (
            <ObligationRow key={o.obligationId} o={o} editing={editing && o.obligationId === "OC-EXC-001"} rate={rate} setRate={setRate} onEdit={() => setEditing(true)} onUpdate={() => { setEditing(false); pushToast("Rate updated to v2026.4 — Excise Workbench reflects new totals on next load"); }} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ObligationRow({ o, editing, rate, setRate, onEdit, onUpdate }: { o: ObligationControl; editing: boolean; rate: string; setRate: (v: string) => void; onEdit: () => void; onUpdate: () => void }) {
  const failing = o.controlStatus === "failing";
  const editable = o.obligationId === "OC-EXC-001";
  return (
    <div className="border-b" style={{ borderColor: "var(--border-subtle)", borderLeft: `3px solid ${failing ? "var(--status-critical)" : "transparent"}` }}>
      <div className="grid grid-cols-[1.6fr_1fr_1.6fr_1fr_0.9fr_0.7fr_1.2fr] items-center gap-2 px-3 py-3 text-[12px]">
        <div style={{ color: "var(--text-primary)" }}>
          {o.obligationText}
          {failing ? <span className="ml-1.5 text-[10px] font-bold" style={{ color: "var(--status-critical)" }}>FAILING</span> : null}
        </div>
        <div style={{ color: "var(--text-secondary)" }}>{o.regulator}</div>
        <div style={{ color: "var(--text-secondary)" }}>{o.control}</div>
        <div style={{ color: "var(--text-secondary)" }}>{o.ownerRole.replace("_", " ")}</div>
        <div style={{ color: "var(--text-secondary)" }}>{o.frequency}</div>
        <Mono style={{ color: "var(--text-secondary)" }}>{o.capabilityIds.join(",")}</Mono>
        <div className="flex items-center justify-between gap-2">
          <span style={{ color: "var(--text-secondary)" }}>{o.configValue ?? "—"}</span>
          {editable ? (
            <Btn size="sm" onClick={onEdit}>Edit</Btn>
          ) : (
            <Btn size="sm">View</Btn>
          )}
        </div>
      </div>
      {editing ? (
        <div className="px-4 pb-4">
          <div className="rounded-lg p-3.5" style={{ backgroundColor: "var(--surface-raised)" }}>
            <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Duty rate per LPA (beer &lt;5% ABV)</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Rs</span>
              <input value={rate} onChange={(e) => setRate(e.target.value)} className="w-24 rounded-md px-2 py-1.5 text-[13px] lion-mono outline-none" style={{ backgroundColor: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }} />
              <Btn variant="primary" size="sm" onClick={onUpdate}>Update</Btn>
            </div>
            <div className="mt-2">
              <AiBadge reasoning="Version-controlled: current = v2026.3, effective 2026-04-01">
                Changing this rate recalculates all June 2026 duty positions across 1,287 removals
              </AiBadge>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
