"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Layers,
  Lock,
  TrendingDown,
  Truck,
  Wallet,
} from "lucide-react";
import type { AgeingBucket, KeystoneDataV4 } from "@/lib/Srilanka_Retail/v4/types";
import { fmtRs } from "@/lib/Srilanka_Retail/v4/format";
import { useKeystoneV4Colors } from "../theme/KeystoneV4ThemeProvider";
import { Card, Chip, Eyebrow, Range, SourceLabel, ValidateField } from "../primitives/ui";

function AgeingBar({ ageing }: { ageing: AgeingBucket[] }) {
  const C = useKeystoneV4Colors();
  const col: Record<string, string> = { LOW: C.green, MED: C.amber, HIGH: C.red };
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ background: C.panelAlt }}>
        {ageing.map((a) => (
          <div key={a.bucket} style={{ width: `${a.pct}%`, background: col[a.sev] }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ageing.map((a) => (
          <div key={a.bucket} className="rounded-md px-2.5 py-2" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: C.faint }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: col[a.sev] }} />
              {a.bucket}
            </div>
            <div className="tabular-nums text-[13px] font-semibold" style={{ color: C.text }}>{fmtRs(a.amt)}</div>
            <div className="tabular-nums text-[10px]" style={{ color: C.faint }}>{a.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { AgeingBar };

export function ScreenC3({ store }: { store: KeystoneDataV4 }) {
  const C = useKeystoneV4Colors();
  const rec = store.receivables;
  const dp = rec.distributorPoints;
  const [filter, setFilter] = useState("ALL");
  const meta = {
    VALID: { color: C.green, label: "FL valid" },
    EXPIRING: { color: C.amber, label: "SLTDA lapsed" },
    LAPSED: { color: C.red, label: "Licence expired" },
  };
  const TABS = [
    ["ALL", "All"],
    ["CLEARED", "Cleared"],
    ["FLAGGED", "Needs attention"],
    ["BLOCKED", "Blocked"],
  ] as const;
  const shown = store.loads.filter((l) =>
    filter === "ALL"
      ? true
      : filter === "CLEARED"
        ? l.state !== "BLOCKED"
        : filter === "FLAGGED"
          ? l.state === "FLAGGED"
          : l.state === "BLOCKED",
  );
  const blocked = store.loads.find((l) => l.state === "BLOCKED");

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}>
              <Wallet size={20} color={C.accent} />
            </div>
            <div>
              <Eyebrow>Group trade receivables · order-to-cash</Eyebrow>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="tabular-nums text-3xl font-semibold tracking-tight">{fmtRs(rec.fy2026)}</span>
                <Chip tag="SOURCED" />
                <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: C.green }}>
                  <TrendingDown size={13} /> down ~{rec.yoyPct}% YoY
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>
              Credit-days (DSO) <ValidateField />
            </div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>
              ECL ageing <Chip tag="OPEN" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[11px]" style={{ color: C.faint }}>Book shrinking</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="tabular-nums text-[15px] font-semibold" style={{ color: C.text }}>
                {fmtRs(rec.fy2025)} → {fmtRs(rec.fy2026)}
              </span>
              <Chip tag="SOURCED" />
            </div>
            <div className="text-[11px]" style={{ color: C.faint }}>less cash exposed year on year</div>
          </div>
          <div className="rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[11px]" style={{ color: C.faint }}>Write-off risk</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="tabular-nums text-[15px] font-semibold" style={{ color: C.text }}>bad-debt {fmtRs(rec.badDebt)}</span>
              <Chip tag="SOURCED" />
            </div>
            <div className="text-[11px]" style={{ color: C.faint }}>&lt;{rec.badDebtPctOfBook}% of book — tight credit control</div>
          </div>
        </div>

        <div className="mt-4 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} color={C.dim} />
              <Eyebrow>Ageing</Eyebrow>
            </div>
            <Chip tag="ILLUSTRATIVE" />
          </div>
          <div className="mt-3">
            <AgeingBar ageing={rec.ageing} />
          </div>
          <div className="mt-2 text-[11px]" style={{ color: C.faint }}>
            Illustrative split — Jehan to confirm actual buckets on the call.
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Truck size={18} color={C.dim} />
            <div>
              <div className="text-sm font-semibold">Dispatch queue · distributor tier</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Distribution / Commercial · FL-3 wholesale</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.dim }}>
            Distribution points{" "}
            <span className="tabular-nums" style={{ color: C.text }}>
              <Range low={dp.low} high={dp.high} />
            </span>
            <Chip tag="OPEN" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {TABS.map(([k, label]) => {
            const on = filter === k;
            const count =
              k === "ALL"
                ? store.loads.length
                : store.loads.filter((l) => (k === "CLEARED" ? l.state !== "BLOCKED" : l.state === k)).length;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
                style={{
                  background: on ? C.raise : "transparent",
                  color: on ? C.text : C.dim,
                  border: `1px solid ${on ? C.border : "transparent"}`,
                }}
              >
                {label} <span className="tabular-nums" style={{ color: C.faint }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-2.5">
          {shown.map((l) => {
            const m = meta[l.status];
            const isBlocked = l.state === "BLOCKED";
            return (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
                style={{ background: C.panelAlt, border: `1px solid ${isBlocked ? C.redEdge : C.borderSoft}` }}
              >
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-[12px] font-semibold" style={{ color: C.faint }}>{l.id}</span>
                  <div>
                    <div className="text-[13px]" style={{ color: C.text }}>{l.pos}</div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} />
                        {l.date}
                      </span>
                      <span className="tabular-nums">{fmtRs(l.value)}</span>
                      <span>
                        {l.fl}
                        {l.sltda === "LAPSED" ? " · SLTDA chain lapsed" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: m.color }}>
                    {l.status === "VALID" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {m.label}
                  </span>
                  {isBlocked ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}
                    >
                      <Lock size={12} /> Dispatch blocked
                    </span>
                  ) : l.state === "FLAGGED" ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]"
                      style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amberEdge}` }}
                    >
                      Cleared — flagged
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]"
                      style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}
                    >
                      Cleared
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <div
              className="rounded-lg px-4 py-6 text-center text-[12px]"
              style={{ color: C.faint, background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}
            >
              No loads in this view.
            </div>
          )}
        </div>

        {blocked && (
          <div className="mt-4 flex items-start gap-2 rounded-lg p-3.5" style={{ background: C.redDim, border: `1px solid ${C.redEdge}` }}>
            <Wallet size={15} color={C.red} className="mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold" style={{ color: C.red }}>
                {fmtRs(blocked.value)} of dispatch held this period on a lapsed licence{" "}
                <span className="font-normal">
                  <Chip tag="ILLUSTRATIVE" />
                </span>
              </div>
              <div className="text-[12px]" style={{ color: C.dim }}>
                Blocked dispatch is also blocked revenue — the control protects cash, not just compliance.
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel src={rec.src} managed />
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
            <span style={{ color: C.green }}>Validate + expiry alert</span> live · auto-block{" "}
            <span className="rounded px-1.5 py-0.5" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>
              wired during onboarding
            </span>
          </span>
        </div>
      </Card>
    </div>
  );
}
