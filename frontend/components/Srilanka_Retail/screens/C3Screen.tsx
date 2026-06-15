"use client";

import { AlertTriangle, CheckCircle2, Lock, Truck } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import type { DispatchLoad } from "@/lib/Srilanka_Retail/types";
import { Card } from "../primitives/ui";
import { SourceChip, RangeValue, LivePilotBadge, KS } from "../primitives";

/** Licence status colours — exact mapping from reference JSX statusMeta. */
function licenceMeta(load: DispatchLoad): { color: string; label: string } {
  if (load.licenceStatus === "LAPSED") {
    return { color: KS.red, label: "Licence expired" };
  }
  if (load.licenceStatus === "EXPIRING" || load.sltdaChainStatus === "LAPSED") {
    return { color: KS.amber, label: "SLTDA lapsed" };
  }
  return { color: KS.green, label: "FL valid" };
}

export function C3Screen() {
  const loads = useKeystoneStore((s) => s.dispatchLoads);
  const posCount = useKeystoneStore((s) => s.company.posCount);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck size={18} style={{ color: KS.dim }} />
            <div>
              <div className="text-sm font-semibold">Dispatch queue</div>
              <div className="text-[11px]" style={{ color: KS.faint }}>
                Distribution / Sales Operations
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: KS.dim }}>
            POS base{" "}
            <span className="tabular-nums" style={{ color: KS.text }}>
              <RangeValue range={posCount.range} kind="number" />
            </span>
            <SourceChip tag={posCount.sourceTag} />
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {loads.map((load) => {
            const meta = licenceMeta(load);
            const isBlock = load.licenceStatus === "LAPSED";
            const Icon = meta.label === "FL valid" ? CheckCircle2 : AlertTriangle;

            return (
              <div
                key={load.id}
                className="rounded-lg p-3.5"
                style={{
                  background: KS.panelAlt,
                  border: `1px solid ${isBlock ? KS.redEdge : KS.borderSoft}`,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[13px] font-semibold">{load.id}</span>
                    <span className="text-[12px]" style={{ color: KS.dim }}>
                      {load.posRef}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: KS.raise, color: KS.faint }}
                    >
                      {load.flCategory}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: meta.color }}>
                    <Icon size={14} /> {meta.label}
                  </span>
                </div>

                {isBlock && (
                  <div
                    className="mt-3 rounded-md p-3"
                    style={{
                      background: "transparent",
                      border: `1px dashed ${KS.accentEdge}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-2 text-[12px] font-medium"
                        style={{ color: KS.red }}
                      >
                        <Lock size={13} /> Dispatch should not ship
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
                        style={{
                          background: KS.accentDim,
                          color: KS.accent,
                          border: `1px solid ${KS.accentEdge}`,
                        }}
                      >
                        ◌ PILOT
                      </span>
                    </div>
                    <div className="mt-1.5 text-[11px] leading-relaxed" style={{ color: KS.faint }}>
                      Auto-block hard-stop requires Excise licence-register integration — confirm in pilot [
                      {load.autoBlock.gapRef}].
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5" style={{ color: KS.dim }}>
            <span className="h-2 w-2 rounded-full" style={{ background: KS.green }} /> Validate + Alert:{" "}
            <span style={{ color: KS.green }}>Live now</span>
          </span>
          <span className="flex items-center gap-1.5" style={{ color: KS.dim }}>
            <span className="h-2 w-2 rounded-full" style={{ background: KS.accent }} /> Auto-block:{" "}
            <span style={{ color: KS.accent }}>Pilot-dependent</span>
          </span>
        </div>
      </Card>
    </div>
  );
}
