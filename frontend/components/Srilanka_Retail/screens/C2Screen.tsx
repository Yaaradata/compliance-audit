"use client";

import { AlertTriangle, CheckCircle2, Lock, ArrowRight, FlaskConical } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d5AbvReconciled, d6GateState } from "@/lib/Srilanka_Retail/derivations";
import { Card, Eyebrow } from "../primitives/ui";
import { SourceChip, NUM, KS } from "../primitives";

const QC_LABELS: Record<string, string> = {
  micro: "Microbiological",
  sensory: "Sensory panel",
  abv: "ABV verification",
};

const ABV_ROWS = [
  { key: "lab", label: "Lab-measured" },
  { key: "label", label: "Label-declared" },
  { key: "excise", label: "Excise-basis" },
] as const;

export function C2Screen() {
  const batch = useKeystoneStore((s) => s.batch);
  const tolerance = useKeystoneStore((s) => s.assumptions.abvTolerancePct);
  const data = useKeystoneStore((s) => s);
  const gateState = d6GateState(data);
  const { mismatchDelta } = d5AbvReconciled(data);
  const held = gateState === "HELD";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical size={18} style={{ color: KS.dim }} />
            <div>
              <div className="text-sm font-semibold">Batch {batch.id}</div>
              <div className="text-[11px]" style={{ color: KS.faint }}>
                Release gate · QA / Laboratory Manager
              </div>
            </div>
          </div>
          {/* JSX: HELD badge uses redDim / red / redEdge */}
          <span
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{
              background: KS.redDim,
              color: KS.red,
              border: `1px solid ${KS.redEdge}`,
            }}
          >
            <Lock size={13} /> {gateState}
          </span>
        </div>

        {/* QC rows — stacked list; FAIL border = amberEdge (JSX) */}
        <div className="mt-4 space-y-2">
          {batch.qcPanel.map((qc) => {
            const pass = qc.status === "PASS";
            const label = QC_LABELS[qc.key] ?? qc.label;
            return (
              <div
                key={qc.key}
                className="flex items-center justify-between rounded-lg px-3.5 py-3"
                style={{
                  background: KS.panelAlt,
                  border: `1px solid ${pass ? KS.borderSoft : KS.amberEdge}`,
                }}
              >
                <span className="text-[12px]" style={{ color: KS.dim }}>
                  {label}
                </span>
                {pass ? (
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: KS.green }}>
                    <CheckCircle2 size={14} /> Pass
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: KS.amber }}>
                    <AlertTriangle size={14} /> Fail
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-lg p-4"
          style={{ background: KS.panelAlt, border: `1px solid ${KS.borderSoft}` }}
        >
          <div className="flex items-center justify-between">
            <Eyebrow>ABV triple-check</Eyebrow>
            <SourceChip tag={batch.abv.lab.sourceTag} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {ABV_ROWS.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-md px-3 py-2.5"
                style={{ background: KS.panel, border: `1px solid ${KS.borderSoft}` }}
              >
                <div className="text-[11px]" style={{ color: KS.faint }}>
                  {label}
                </div>
                <div className={`${NUM} text-xl font-semibold`}>
                  {batch.abv[key].value.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          {/* JSX: mismatch line uses C.red */}
          {!batch.abv.reconciled && (
            <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: KS.red }}>
              <AlertTriangle size={14} /> Mismatch {mismatchDelta.toFixed(1)} pts — lab {batch.abv.lab.value}%
              vs label {batch.abv.label.value}%.
            </div>
          )}
        </div>

        {/* JSX: release blocked banner uses redDim / redEdge / red */}
        {held && (
          <div
            className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm"
            style={{
              background: KS.redDim,
              border: `1px solid ${KS.redEdge}`,
              color: KS.red,
            }}
          >
            <Lock size={15} /> Release blocked — ABV must reconcile to label and duty before this batch can
            ship.
          </div>
        )}
        <div className="mt-2.5 flex items-center gap-2 text-[12px]" style={{ color: KS.faint }}>
          <ArrowRight size={13} /> This ABV is the same figure that drives the duty basis on the Excise
          four-way tie-out (C1).
        </div>
      </Card>
      <div className="text-[12px]" style={{ color: KS.faint }}>
        Validation runs <span style={{ color: KS.green }}>live</span> on QC data in-system{" "}
        <SourceChip tag={tolerance.sourceTag} />
      </div>
    </div>
  );
}
