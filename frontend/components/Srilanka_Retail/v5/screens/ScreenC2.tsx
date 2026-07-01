"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Coins, FlaskConical, Lock } from "lucide-react";
import type { KeystoneDataV5 } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Btn, Card, Chip, Eyebrow, SourceLabel, ValidateField } from "../primitives/ui";

export function ScreenC2({ store }: { store: KeystoneDataV5 }) {
  const C = useKeystoneV5Colors();
  const b = store.batch;
  const d = b.dutyAtStake;
  const chain: [string, number, boolean][] = [
    ["Lab-measured", b.abv.lab, false],
    ["Label-declared", b.abv.label, true],
    ["Excise-basis", b.abv.excise, true],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 text-[13px]" style={{ color: C.dim }}>
        <ArrowRight size={15} color={C.accent} className="mt-0.5 shrink-0" />
        <span>
          This batch&apos;s ABV <span style={{ color: C.text }}>is</span> the duty basis — a quality number becomes a tax misstatement on the excise return. The gate stops it before it ships.
        </span>
      </div>

      <Card className="p-5" style={{ borderColor: C.amberEdge }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.amberDim, border: `1px solid ${C.amberEdge}` }}>
              <Coins size={20} color={C.amber} />
            </div>
            <div>
              <Eyebrow>Duty at stake — caught at the gate</Eyebrow>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="tabular-nums text-3xl font-semibold tracking-tight" style={{ color: C.text }}>
                  ≈ Rs {d.amount}{d.unit}
                </span>
                <Chip tag={d.tag} />
              </div>
              <div className="mt-1 text-[12px]" style={{ color: C.dim }}>
                +{b.abv.delta.toFixed(1)} ABV pts understated → duty understated. Held before it reached the excise return.
              </div>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-2 self-start rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}
          >
            <Lock size={13} /> HELD · B-{b.id.split("-")[1]}
          </span>
        </div>
        <div className="mt-3 text-[11px]" style={{ color: C.faint }}>
          Basis: {d.basis}. Exact figure <ValidateField note="Jehan to confirm" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Eyebrow>ABV triple-check</Eyebrow>
          <Chip tag={b.abv.tag} />
        </div>
        <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {chain.map(([label, val, isBasis], i) => (
            <div key={label} className="contents">
              {i > 0 && <ArrowRight size={16} color={C.faint} className="mx-auto rotate-90 sm:rotate-0" />}
              <div
                className="flex-1 rounded-lg px-3.5 py-3"
                style={{ background: C.panelAlt, border: `1px solid ${i === 0 ? C.amberEdge : C.borderSoft}` }}
              >
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
                  {label}
                  {isBasis && (
                    <span className="rounded px-1 py-0.5 text-[9px] font-semibold" style={{ background: C.chipBg, color: C.dim }}>
                      DUTY BASIS
                    </span>
                  )}
                </div>
                <div className="tabular-nums text-2xl font-semibold" style={{ color: i === 0 ? C.amber : C.text }}>
                  {val.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: C.red }}>
          <AlertTriangle size={14} /> The lab number ({b.abv.lab}%) disagrees with the duty basis ({b.abv.excise}%) by {b.abv.delta.toFixed(1)} pts.
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
            <FlaskConical size={14} /> Release checks · Batch {b.id}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            {b.panel.map(([name, st]) => (
              <span key={name} className="inline-flex items-center gap-1.5" style={{ color: st === "PASS" ? C.green : C.amber }}>
                {st === "PASS" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {name}
              </span>
            ))}
            <span style={{ color: C.faint }}>· release gated on ABV</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-[12px]" style={{ color: C.faint }}>
        <SourceLabel src={b.src} /> · validation logic runs live <Chip tag="ASSUMPTION" />
      </div>
    </div>
  );
}
