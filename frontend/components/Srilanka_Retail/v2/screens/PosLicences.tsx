"use client";

import { useMemo, useState } from "react";
import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatPct } from "@/lib/Srilanka_Retail/v2/format";
import type { CustomerLicence, FlCategory } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import { AiBadge, Btn, Card, CounterCard, EligibilityChip, Mono, SectionHeading } from "../primitives";
import { Modal } from "../overlays/Shells";
import { ScreenTitle } from "./Dashboard";

const agg = mockData.derivedAggregates;
const FL_FILTERS: (FlCategory | "all")[] = ["all", "FL3", "FL4", "FL7", "FL11"];
const STATUS_FILTERS = ["all", "active", "amber", "suspended"] as const;

export function PosLicences() {
  const { licences, holdDispatch } = useApp();
  const [flFilter, setFlFilter] = useState<FlCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [ineligibleOnly, setIneligibleOnly] = useState(false);
  const [confirm, setConfirm] = useState<CustomerLicence | null>(null);

  const rows = useMemo(() => {
    let list = [...licences];
    if (flFilter !== "all") list = list.filter((l) => l.flCategory === flFilter);
    if (statusFilter !== "all") {
      list = list.filter((l) =>
        statusFilter === "amber" ? l.eligibility === "amber" : statusFilter === "suspended" ? l.status === "suspended" : l.status === "active",
      );
    }
    if (ineligibleOnly) list = list.filter((l) => l.eligibility === "amber" && l.hasOrderToday);
    // Sort: ineligible-with-order first, then amber, then by expiry.
    return list.sort((a, b) => rank(a) - rank(b));
  }, [licences, flFilter, statusFilter, ineligibleOnly]);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <ScreenTitle title="POS Licence Monitor" subtitle="2,800 active outlets · FL register synced 06:00 today" />

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <CounterCard label="Compliance rate" value={formatPct(agg.posLicenceComplianceRate)} status="watch" caption="2,792 / 2,800 active" />
        <CounterCard label="Suspended" value={String(agg.posTotals.suspended)} status="risk" />
        <CounterCard label="Expiring < 7 days" value={String(agg.posTotals.expiringWithin7d + 1)} status="watch" />
        <CounterCard label="Dispatches to ineligible today" value={String(agg.posTotals.ineligibleWithOrderToday)} status="critical" onClick={() => setIneligibleOnly((v) => !v)} caption={ineligibleOnly ? "filtered ✓" : "click to filter"} />
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterGroup label="FL" options={FL_FILTERS} value={flFilter} onChange={(v) => setFlFilter(v as FlCategory | "all")} />
        <FilterGroup label="Status" options={[...STATUS_FILTERS]} value={statusFilter} onChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])} />
      </div>

      <SectionHeading>Outlet status</SectionHeading>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1.6fr_0.6fr_0.9fr_0.9fr_0.7fr_1fr] gap-2 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>Licence no.</div>
          <div>Outlet</div>
          <div>FL</div>
          <div>District</div>
          <div>Expiry</div>
          <div>Days</div>
          <div>Actions</div>
        </div>
        {rows.map((l) => (
          <div
            key={l.flNo}
            className="grid grid-cols-[1.4fr_1.6fr_0.6fr_0.9fr_0.9fr_0.7fr_1fr] items-center gap-2 px-3 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)", borderLeft: `3px solid ${l.eligibility === "hold" ? "var(--status-critical)" : l.eligibility === "amber" ? "var(--status-watch)" : "transparent"}` }}
          >
            <Mono className="text-[12px]" style={{ color: "var(--text-primary)" }}>{l.flNo}</Mono>
            <div className="text-[12px]" style={{ color: "var(--text-primary)" }}>{l.holderName}</div>
            <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{l.flCategory}</div>
            <div className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{l.district}</div>
            <Mono className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{l.validTo}</Mono>
            <div>
              <span className="lion-mono text-[12px]" style={{ color: l.daysToExpiry <= 7 ? "var(--status-watch)" : l.daysToExpiry < 0 ? "var(--status-critical)" : "var(--text-secondary)" }}>
                {l.daysToExpiry}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {l.dispatchDecision === "hold" ? (
                <EligibilityChip eligibility="hold" />
              ) : l.eligibility === "amber" && l.hasOrderToday ? (
                <Btn size="sm" variant="danger" onClick={() => setConfirm(l)}>Hold dispatch</Btn>
              ) : (
                <EligibilityChip eligibility={l.eligibility} />
              )}
            </div>
          </div>
        ))}
      </Card>

      {confirm ? (
        <Modal
          title={`Block dispatch to ${confirm.holderName}?`}
          subtitle={`Reason: FL licence expires in ${confirm.daysToExpiry} days (${confirm.validTo})`}
          width={520}
          onClose={() => setConfirm(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Btn onClick={() => setConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => { holdDispatch(confirm.flNo); setConfirm(null); }}>Confirm block</Btn>
            </div>
          }
        >
          <div className="p-6">
            <AiBadge reasoning="This will log a compliance event and notify Roshan Fernando.">
              Auto-detected licence expiry risk
            </AiBadge>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function rank(l: CustomerLicence): number {
  if (l.eligibility === "amber" && l.hasOrderToday) return 0;
  if (l.eligibility === "amber") return 1;
  if (l.status === "suspended") return 2;
  return 3 + l.daysToExpiry / 1000;
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className="rounded px-2 py-1 text-[11px] capitalize transition-colors"
          style={{ backgroundColor: value === o ? "var(--ai-accent)" : "var(--surface-raised)", color: value === o ? "#fff" : "var(--text-secondary)" }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
