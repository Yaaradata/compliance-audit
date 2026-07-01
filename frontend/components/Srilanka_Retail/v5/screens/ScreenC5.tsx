"use client";

import { AlertTriangle, CheckCircle2, ChevronRight, FileText, LayoutGrid, Scale, ShieldAlert } from "lucide-react";
import { CTRLS, REGS, rollupItems } from "@/lib/Srilanka_Retail/v5/constants";
import type { HeadlineMetric, KeystoneDataV5 } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Card, Chip, SevPill, Trend } from "../primitives/ui";
import { ExceptionRow } from "./ExceptionRow";

function MetricTile({ m }: { m: HeadlineMetric }) {
  const C = useKeystoneV5Colors();
  return (
    <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="text-[11px] leading-snug" style={{ color: C.faint }}>{m.label}</div>
      <div className="mt-1 tabular-nums text-xl font-semibold tracking-tight" style={{ color: C.text }}>{m.value}</div>
      <div className="mt-1.5">
        <Chip tag={m.tag} />
      </div>
      {m.note && (
        <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.faint }}>
          {m.note}
        </div>
      )}
    </div>
  );
}

export function ScreenC5({ store }: { store: KeystoneDataV5 }) {
  const C = useKeystoneV5Colors();
  const rm = store.riskMatrix;
  const exc = store.complianceExceptions[0];
  const items = rollupItems(store.posture);
  const cellColor: Record<string, string> = { OK: C.green, ATTENTION: C.amber, BREACH: C.red };

  return (
    <div className="space-y-5">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
        style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}
      >
        <div className="flex items-center gap-3">
          <FileText size={18} color={C.accent} />
          <div>
            <div className="text-[13px] font-semibold" style={{ color: C.text }}>
              Monthly board pack: multi-day build → one-click export
            </div>
            <div className="text-[11px]" style={{ color: C.dim }}>
              The audit-committee grind becomes a review. Days saved confirmed on the call.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tag="LION_VALIDATE" />
          <span className="text-[11px]" style={{ color: C.accent }}>
            → generate on C6
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {store.headlineMetrics.map((m) => (
          <MetricTile key={m.key} m={m} />
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Scale size={16} color={C.dim} />
          <span className="text-sm font-semibold">Risk matrix</span>
        </div>
        <div
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg p-3"
          style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
            Escalation path
          </span>
          {rm.escalation.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>
              {i > 0 && <ChevronRight size={13} color={C.faint} />}
              {s}
            </span>
          ))}
          <span className="ml-1">
            <Chip tag={rm.escalation.tag} />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr style={{ color: C.faint }}>
                {["Risk", "Inherent", "Control", "Residual", "KRI", "Trend"].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rm.rows.map((row) => (
                <tr key={row.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td className="px-2 py-3 align-top" style={{ maxWidth: 260 }}>
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: C.text }}>{row.category}</span>
                      <Chip tag={row.catTag} />
                    </div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.faint }}>
                      {row.mitigation}
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: C.faint }}>
                      ↳ {row.domain}
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <div className="flex items-center gap-1">
                      <SevPill level={row.inherent.i} />
                      <span style={{ color: C.faint }}>/</span>
                      <SevPill level={row.inherent.l} />
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: C.faint }}>
                      impact / likelihood
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top" style={{ color: row.control ? C.dim : C.faint }}>
                    {row.control || "—"}
                  </td>
                  <td className="px-2 py-3 align-top">
                    <SevPill level={row.residual} />
                    <div className="mt-1">
                      <Chip tag="ILLUSTRATIVE" />
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top" style={{ maxWidth: 200 }}>
                    {row.kri ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="tabular-nums font-medium" style={{ color: C.text }}>
                            {row.kri.value}
                          </span>
                          <Chip tag={row.kri.tag} />
                        </div>
                        <div className="mt-0.5 text-[10px]" style={{ color: C.faint }}>
                          {row.kri.label}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: C.faint }}>—</span>
                    )}
                  </td>
                  <td className="px-2 py-3 align-top">
                    <Trend dir={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert size={16} color={C.dim} />
          <span className="text-sm font-semibold">Compliance exceptions</span>
          <span className="text-[11px]" style={{ color: C.faint }}>
            · every 7.10 / Section-9 line tracked
          </span>
        </div>
        <ExceptionRow exc={exc} />
        <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
          <CheckCircle2 size={12} color={C.green} /> Governance posture: green — the one exception in the period was disclosed and cured. The same record drives the board report (C6).
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <LayoutGrid size={16} color={C.dim} />
          <span className="text-sm font-semibold">Posture — if every regulator walked in tomorrow</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[12px]">
            <thead>
              <tr>
                <th />
                {REGS.map(([k, l]) => (
                  <th key={k} className="px-2 py-1.5 font-medium" style={{ color: C.faint }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CTRLS.map(([ck, cl]) => (
                <tr key={ck}>
                  <td className="px-2 py-1.5 text-left font-medium" style={{ color: C.dim }}>
                    {cl}
                  </td>
                  {REGS.map(([rk]) => {
                    const st = store.posture[`${rk}|${ck}`];
                    return (
                      <td key={rk} className="px-2 py-1.5">
                        <div
                          className="mx-auto flex h-7 w-7 items-center justify-center rounded-md"
                          style={{
                            background: st === "NA" ? "transparent" : C.panelAlt,
                            border:
                              st === "NA"
                                ? `1px solid ${C.borderSoft}`
                                : `1px solid ${st === "OK" ? C.greenEdge : st === "ATTENTION" ? C.amberEdge : C.redEdge}`,
                          }}
                        >
                          {st !== "NA" &&
                            (st === "OK" ? (
                              <CheckCircle2 size={13} color={cellColor[st]} />
                            ) : (
                              <AlertTriangle size={13} color={cellColor[st]} />
                            ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="mt-4 rounded-lg p-3.5"
          style={{
            background: items.length ? C.amberDim : C.greenDim,
            border: `1px solid ${items.length ? C.amberEdge : C.greenEdge}`,
          }}
        >
          <div className="flex items-center gap-2">
            {items.length ? <AlertTriangle size={15} color={C.amber} /> : <CheckCircle2 size={15} color={C.green} />}
            <span className="text-[12px] font-semibold" style={{ color: items.length ? C.amber : C.green }}>
              {items.length} item{items.length !== 1 ? "s" : ""} → Audit Committee remit
            </span>
          </div>
          {items.map((it) => (
            <div key={it.cell} className="mt-1 pl-6 text-[12px]" style={{ color: C.dim }}>
              {it.label}
            </div>
          ))}
          {!items.length && (
            <div className="mt-1 pl-6 text-[12px]" style={{ color: C.dim }}>
              All cells clear this period.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
