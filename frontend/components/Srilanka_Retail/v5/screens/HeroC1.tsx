"use client";

import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Database, FileCheck } from "lucide-react";
import type { KeystoneDataV5 } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Btn, Card, Chip, Eyebrow, Range } from "../primitives/ui";
import type { ReconStream } from "@/lib/Srilanka_Retail/v5/types";

function StreamCard({ s }: { s: ReconStream }) {
  const C = useKeystoneV5Colors();
  const danger = s.status === "MISMATCH";
  return (
    <div className="rounded-lg p-3.5" style={{ background: C.panelAlt, border: `1px solid ${danger ? C.amberEdge : C.borderSoft}` }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: C.dim }}>{s.label}</span>
        {danger ? <AlertTriangle size={14} color={C.amber} /> : <CheckCircle2 size={14} color={C.green} />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="tabular-nums text-2xl font-semibold tracking-tight" style={{ color: danger ? C.amber : C.text }}>
          {s.value === null ? "—" : s.value.toLocaleString("en-US")}
        </span>
        <span className="text-[11px]" style={{ color: C.faint }}>{s.value === null ? "pending" : s.unit}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: C.faint }}>
        <Database size={10} />
        {s.src}
      </div>
    </div>
  );
}

export function HeroC1({
  store,
  varianceDisp,
  investigating,
  setInvestigating,
  onReconcile,
}: {
  store: KeystoneDataV5;
  varianceDisp: number;
  investigating: boolean;
  setInvestigating: (v: boolean) => void;
  onReconcile: () => void;
}) {
  const C = useKeystoneV5Colors();
  const r = store.reconciliation;
  const atRisk = r.nodeState === "AT_RISK";
  const eb = store.company.exposureBand;
  const co = store.company;

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>Excise exposure under live reconciliation</Eyebrow>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="tabular-nums text-3xl font-semibold tracking-tight">
                Rs <Range low={eb.low} high={eb.high} unit={eb.unit} />
              </span>
              <Chip tag={eb.tag} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {(
              [
                ["excise paid", `Rs ${co.exciseBase.amount}${co.exciseBase.unit}`, co.exciseBase.tag],
                ["taxes to govt", `Rs ${co.totalTaxes.amount}${co.totalTaxes.unit}`, co.totalTaxes.tag],
                ["FY2026 revenue", `Rs ${co.fy2026Revenue.amount}${co.fy2026Revenue.unit}`, co.fy2026Revenue.tag],
                ["penalty", `up to ${co.penaltyPct.value}%`, co.penaltyPct.tag],
              ] as const
            ).map(([k, v, tag]) => (
              <div key={k}>
                <div className="text-[11px]" style={{ color: C.faint }}>{k}</div>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums font-medium" style={{ color: C.dim }}>{v}</span>
                  <Chip tag={tag} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {r.streams.map((s) => <StreamCard key={s.key} s={s} />)}
          </div>
          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <ArrowRight className="hidden lg:block" size={18} color={C.faint} />
            <div
              className="rounded-xl px-5 py-4 text-center"
              style={{ background: atRisk ? C.redDim : C.greenDim, border: `1px solid ${atRisk ? C.redEdge : C.greenEdge}`, minWidth: 150 }}
            >
              <Eyebrow>Tie-out</Eyebrow>
              <div className="mt-1 text-sm font-semibold" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "AT RISK" : "RECONCILED"}</div>
              <div className="mt-1 text-[11px]" style={{ color: C.faint }}>expected duty</div>
              <div className="tabular-nums text-[13px] font-medium" style={{ color: C.dim }}>Rs {r.expectedDuty}M</div>
            </div>
            <ArrowRight className="hidden lg:block" size={18} color={C.faint} />
          </div>
          <div className="rounded-xl p-4 lg:w-64" style={{ background: atRisk ? C.redDim : C.greenDim, border: `1px solid ${atRisk ? C.redEdge : C.greenEdge}` }}>
            <div className="flex items-center gap-2">
              {atRisk ? <AlertTriangle size={15} color={C.red} /> : <CheckCircle2 size={15} color={C.green} />}
              <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "Variance" : "Reconciled"}</span>
            </div>
            <div className="mt-2 tabular-nums text-4xl font-bold tracking-tight" style={{ color: atRisk ? C.red : C.green }}>
              Rs {varianceDisp === 0 ? "0" : `${varianceDisp.toFixed(varianceDisp < 1 ? 2 : 1)}M`}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "AT RISK" : "evidence generated"}</div>
            <div className="mt-2"><Chip tag="ILLUSTRATIVE" /></div>
            {atRisk && !investigating && (
              <div className="mt-3">
                <Btn onClick={() => setInvestigating(true)} icon={ChevronRight}>Investigate</Btn>
              </div>
            )}
          </div>
        </div>

        {investigating && atRisk && (
          <div className="mt-4 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.accentEdge}` }}>
            <Eyebrow>Root cause</Eyebrow>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.dim }}>{r.variance.rootCause}</p>
            <div className="mt-3 flex items-center gap-3">
              <Btn onClick={onReconcile} icon={CheckCircle2}>Reconcile</Btn>
              <Btn kind="ghost" onClick={() => setInvestigating(false)}>Dismiss</Btn>
            </div>
          </div>
        )}
        {!atRisk && (
          <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: C.greenDim, border: `1px solid ${C.greenEdge}`, color: C.green }}>
            <FileCheck size={15} /> Reconciled — duty-defensibility evidence generated; added to the Excise pack (C4) and the board report (C6).
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
        <Activity size={13} /> Detection latency: <span style={{ color: C.dim }}>{r.detection.value}</span> <Chip tag={r.detection.tag} />
      </div>
    </div>
  );
}
