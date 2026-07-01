"use client";

import {
  Activity,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Mail,
  RotateCcw,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { KeystoneDataV5 } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Btn, Card, Chip, Eyebrow, SevPill, Trend, ValidateField } from "../primitives/ui";
import { ExceptionRow } from "./ExceptionRow";

export function ScreenC6({
  store,
  generated,
  generating,
  onGenerate,
  onToast,
}: {
  store: KeystoneDataV5;
  generated: boolean;
  generating: boolean;
  onGenerate: (regen?: boolean) => void;
  onToast: (msg: string) => void;
}) {
  const C = useKeystoneV5Colors();
  const br = store.boardReport;
  const exc = store.complianceExceptions[0];

  if (!generated) {
    return (
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}
            >
              <FileText size={20} color={C.accent} />
            </div>
            <div className="flex-1">
              <Eyebrow>Monthly Audit-Committee Report · May 2026</Eyebrow>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                The pack assembles itself from what the plant already produced.
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.dim }}>
                Committee remits, composition, the 7.10 / Section-9 compliance lines, the risk matrix and the closing assurance — all derived from the live store. The multi-day team scramble becomes a one-click review.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {br.sectionOrder.map((s, i) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px]"
                    style={{ background: C.panelAlt, color: C.dim, border: `1px solid ${C.borderSoft}` }}
                  >
                    <span className="tabular-nums" style={{ color: C.faint }}>
                      {i + 1}
                    </span>
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <Btn onClick={() => onGenerate()} icon={generating ? Activity : FileText}>
                  {generating ? "Assembling pack…" : "Generate report"}
                </Btn>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <Activity size={13} /> Board-pack prep: <span style={{ color: C.dim }}>multi-day build → one-click export</span>{" "}
          <Chip tag="LION_VALIDATE" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}
            >
              <FileText size={18} color={C.accent} />
            </div>
            <div>
              <div className="text-sm font-semibold">Audit-Committee Report — May 2026</div>
              <div className="text-[11px]" style={{ color: C.faint }}>
                Lion Brewery (Ceylon) PLC · derived from live data · board-ready
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn kind="neutral" icon={Download} onClick={() => onToast("Exported — board-ready PDF")}>
              Export PDF
            </Btn>
            <Btn icon={Mail} onClick={() => onToast("Emailed to the Audit Committee")}>
              Email to committee
            </Btn>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {br.sectionOrder.map((s, i) => (
            <span
              key={s}
              className="rounded px-2 py-0.5 text-[10px]"
              style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} color={C.dim} />
          <span className="text-sm font-semibold">Board committees</span>
          <span className="text-[11px]" style={{ color: C.faint }}>
            (function via Carson Cumberbatch PLC)
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {br.committees.map((cm) => (
            <div key={cm.id} className="rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                  {cm.name}
                </span>
                <span className="text-[10px]" style={{ color: C.faint }}>
                  via Carson Cumberbatch PLC
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug" style={{ color: C.dim }}>
                {cm.remit} <Chip tag={cm.remitTag} />
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cm.composition.map((p) => (
                  <span
                    key={p}
                    className="rounded px-2 py-0.5 text-[10px]"
                    style={{ background: C.panel, color: C.dim, border: `1px solid ${C.borderSoft}` }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
                Meetings this year: <ValidateField note="Jehan to confirm" /> · matters <Chip tag="OPEN" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck size={16} color={C.dim} />
          <span className="text-sm font-semibold">Listing Rule 7.10 / Section-9 compliance</span>
        </div>
        <ExceptionRow exc={exc} />
        <div className="mt-2.5 text-[11px]" style={{ color: C.faint }}>
          Full line-by-line table structure tracked; remaining lines <Chip tag="OPEN" /> pending the FY2025 governance report.
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Scale size={16} color={C.dim} />
          <span className="text-sm font-semibold">Risk matrix</span>
          <span className="text-[11px]" style={{ color: C.faint }}>
            · reused from C5
          </span>
        </div>
        <div className="space-y-2">
          {store.riskMatrix.rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3.5 py-2.5"
              style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px]" style={{ color: C.text }}>
                  {row.category}
                </span>
                <Chip tag={row.catTag} />
              </div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: C.faint }}>
                residual <SevPill level={row.residual} />
                {row.kri && (
                  <span className="tabular-nums" style={{ color: C.dim }}>
                    {row.kri.value}
                  </span>
                )}
                <Trend dir={row.trend} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: C.faint }}>
          <span className="uppercase tracking-wider">Escalation</span>
          {store.riskMatrix.escalation.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2" style={{ color: C.dim }}>
              {i > 0 && <ChevronRight size={12} color={C.faint} />}
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={16} color={C.green} />
          <span className="text-sm font-semibold">Closing assurance</span>
          <Chip tag={br.assurance.tag} />
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>
          {br.assurance.companiesAct}
        </p>
        <p className="mt-2 text-[13px] italic leading-relaxed" style={{ color: C.dim }}>
          &ldquo;{br.assurance.thanks}&rdquo;
        </p>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-[13px] italic" style={{ color: C.faint }}>
          The monthly grind becomes a review.
        </div>
        <Btn kind="ghost" icon={RotateCcw} onClick={() => onGenerate(true)}>
          Regenerate
        </Btn>
      </div>
    </div>
  );
}
