"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Clock, Download, Share2 } from "lucide-react";
import { REGS } from "@/lib/Srilanka_Retail/v5/constants";
import type { KeystoneDataV5 } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Btn, Card, Chip, Eyebrow } from "../primitives/ui";

export function ScreenC4({
  store,
  justAppended,
  onToast,
}: {
  store: KeystoneDataV5;
  justAppended: boolean;
  onToast: (msg: string) => void;
}) {
  const C = useKeystoneV5Colors();
  const [sel, setSel] = useState("EXCISE");
  const [open, setOpen] = useState<string | null>(null);
  const items = store.evidence[sel] || [];
  const total = items.length;
  const current = items.filter((it) => it.status !== "PENDING").length;
  const ready = current === total;
  const regEntry = REGS.find(([k]) => k === sel);
  const regLabel = regEntry ? regEntry[1] : sel;

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {REGS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setSel(k);
                setOpen(null);
              }}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                background: sel === k ? C.raise : "transparent",
                color: sel === k ? C.text : C.dim,
                border: `1px solid ${sel === k ? C.border : "transparent"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-4"
          style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}
        >
          <div>
            <Eyebrow>{regLabel} pack</Eyebrow>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="tabular-nums text-lg font-semibold tracking-tight" style={{ color: C.text }}>
                {current}/{total} items current
              </span>
              {ready ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}
                >
                  <CheckCircle2 size={12} /> Audit-ready
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amberEdge}` }}
                >
                  <Clock size={12} /> {total - current} pending
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: C.faint }}>
              If {regLabel} requested an audit today, this file is already built.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn kind="neutral" icon={Download} onClick={() => onToast(`${regLabel} pack exported — regulator-ready PDF`)}>
              Export pack (PDF)
            </Btn>
            <Btn kind="ghost" icon={Share2} onClick={() => onToast(`${regLabel} pack shared with the regulator desk`)}>
              Share
            </Btn>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {items.map((it) => {
            const isNew = justAppended && it.id === "appended";
            const expanded = open === it.id;
            const pending = it.status === "PENDING";
            return (
              <div
                key={it.id}
                className="rounded-lg"
                style={{ background: C.panelAlt, border: `1px solid ${isNew ? C.greenEdge : C.borderSoft}` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : it.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left focus:outline-none focus-visible:ring-2"
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronRight
                      size={14}
                      color={C.faint}
                      style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}
                    />
                    {pending ? <Clock size={15} color={C.amber} /> : <CheckCircle2 size={15} color={C.green} />}
                    <span className="text-[13px]" style={{ color: C.text }}>{it.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}
                      >
                        just added
                      </span>
                    )}
                    <span
                      className="rounded px-2 py-0.5 text-[10px]"
                      style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}
                    >
                      from {it.from}
                    </span>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t px-4 py-3" style={{ borderColor: C.borderSoft }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
                      Underlying records
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {it.records.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: C.dim }}>
                          <CheckCircle2 size={12} color={C.green} className="mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: C.faint }}>
                      <span>
                        Signed: <span style={{ color: C.dim }}>{it.signedBy}</span>
                      </span>
                      <span>·</span>
                      <span>{it.ts}</span>
                      <span>·</span>
                      <span>
                        lineage <span style={{ color: C.dim }}>{it.from}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <ArrowRight size={13} /> Every assembled pack feeds the monthly board report (C6). Prep baseline ~weeks → on-demand{" "}
          <Chip tag="ASSUMPTION" />
        </div>
      </Card>
    </div>
  );
}
