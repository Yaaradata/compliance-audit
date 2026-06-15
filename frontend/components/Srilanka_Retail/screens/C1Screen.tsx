"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Activity,
  FileCheck,
} from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d10HeadlineExposure } from "@/lib/Srilanka_Retail/derivations";
import { formatAmountCompact, formatRupeesCompact, formatRupeesFull } from "@/lib/Srilanka_Retail/format";
import { Card, Eyebrow, Btn } from "../primitives/ui";
import { SourceChip, RangeValue, NUM, formatLiveSource } from "../primitives";
import type { ReconStream } from "@/lib/Srilanka_Retail/types";

function StreamCard({ stream }: { stream: ReconStream }) {
  const danger = stream.status === "MISMATCH";
  const hasValue = stream.value.value !== null;

  return (
    <div
      className="rounded-lg p-3.5"
      style={{
        background: "var(--ks-panel-alt)",
        border: `1px solid ${danger ? "var(--ks-amber-edge)" : "var(--ks-border-soft)"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: "var(--ks-dim)" }}>
          {stream.label}
        </span>
        {danger ? (
          <AlertTriangle size={14} style={{ color: "var(--ks-amber)" }} />
        ) : (
          <CheckCircle2 size={14} style={{ color: "var(--ks-green)" }} />
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span
          className={`${NUM} text-2xl font-semibold tracking-tight`}
          style={{ color: danger ? "var(--ks-amber)" : "var(--ks-text)" }}
        >
          {hasValue ? stream.value.value!.toLocaleString("en-US") : "—"}
        </span>
        <span className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
          {hasValue ? stream.unit : "pending"}
        </span>
      </div>
      <div className="mt-1 text-[10px]" style={{ color: "var(--ks-faint)" }}>
        {formatLiveSource(stream.liveSource)}
      </div>
    </div>
  );
}

function VarianceHero({ amount, atRisk }: { amount: number; atRisk: boolean }) {
  const count = useMotionValue(amount);
  const display = useTransform(count, (v) => {
    if (v === 0) return "Rs 0";
    return formatAmountCompact(v);
  });

  useEffect(() => {
    const controls = animate(count, amount, { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] });
    return () => controls.stop();
  }, [count, amount]);

  return (
    <motion.div className={`${NUM} text-4xl font-bold tracking-tight`} style={{ color: atRisk ? "var(--ks-red)" : "var(--ks-green)" }}>
      {display}
    </motion.div>
  );
}

export function C1Screen() {
  const reconciliation = useKeystoneStore((s) => s.reconciliation);
  const company = useKeystoneStore((s) => s.company);
  const exposure = useKeystoneStore(d10HeadlineExposure);
  const reconcileVariance = useKeystoneStore((s) => s.reconcileVariance);
  const [investigating, setInvestigating] = useState(false);

  const atRisk = reconciliation.nodeState === "AT_RISK";
  const varianceAmount = reconciliation.variance.amount.amount;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* context band */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Excise exposure under live reconciliation</Eyebrow>
            <div className="mt-1 flex items-center gap-2.5">
              <span className={`${NUM} text-3xl font-semibold tracking-tight`}>
                <RangeValue range={exposure.range} kind="rupee" />
              </span>
              <SourceChip tag={exposure.sourceTag} />
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div>
              <div className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
                on base
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`${NUM} font-medium`} style={{ color: "var(--ks-dim)" }}>
                  {formatRupeesCompact(company.exciseBase.value)}
                </span>
                <SourceChip tag={company.exciseBase.sourceTag} />
              </div>
            </div>
            <div>
              <div className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
                penalty
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`${NUM} font-medium`} style={{ color: "var(--ks-dim)" }}>
                  up to {company.dutyPenaltyPct.value}%
                </span>
                <SourceChip tag={company.dutyPenaltyPct.sourceTag} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* tie-out */}
      <Card className="p-5">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {reconciliation.streams.map((s) => (
              <StreamCard key={s.key} stream={s} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <ArrowRight className="hidden lg:block" size={18} style={{ color: "var(--ks-faint)" }} />
            <div
              className="rounded-xl px-5 py-4 text-center"
              style={{
                background: atRisk ? "var(--ks-red-dim)" : "var(--ks-green-dim)",
                border: `1px solid ${atRisk ? "var(--ks-red-edge)" : "var(--ks-green-edge)"}`,
                minWidth: 150,
              }}
            >
              <Eyebrow>Tie-out</Eyebrow>
              <div
                className="mt-1 text-sm font-semibold"
                style={{ color: atRisk ? "var(--ks-red)" : "var(--ks-green)" }}
              >
                {atRisk ? "AT RISK" : "RECONCILED"}
              </div>
              <div className="mt-1 text-[11px]" style={{ color: "var(--ks-faint)" }}>
                expected duty
              </div>
              <div className={`${NUM} text-[13px] font-medium`} style={{ color: "var(--ks-dim)" }}>
                {formatRupeesCompact(reconciliation.expectedDuty.value)}
              </div>
            </div>
            <ArrowRight className="hidden lg:block" size={18} style={{ color: "var(--ks-faint)" }} />
          </div>

          <div
            className="rounded-xl p-4 lg:w-64"
            style={{
              background: atRisk ? "var(--ks-red-dim)" : "var(--ks-green-dim)",
              border: `1px solid ${atRisk ? "var(--ks-red-edge)" : "var(--ks-green-edge)"}`,
            }}
          >
            <div className="flex items-center gap-2">
              {atRisk ? (
                <AlertTriangle size={15} style={{ color: "var(--ks-red)" }} />
              ) : (
                <CheckCircle2 size={15} style={{ color: "var(--ks-green)" }} />
              )}
              <span
                className="text-[12px] font-semibold uppercase tracking-wider"
                style={{ color: atRisk ? "var(--ks-red)" : "var(--ks-green)" }}
              >
                {atRisk ? "Variance" : "Reconciled"}
              </span>
            </div>
            <div className="mt-2">
              <VarianceHero amount={varianceAmount} atRisk={atRisk} />
            </div>
            <div className="mt-1 text-[11px]" style={{ color: atRisk ? "var(--ks-red)" : "var(--ks-green)" }}>
              {atRisk ? "AT RISK" : "evidence generated"}
            </div>
            <div className="mt-2">
              <SourceChip tag={reconciliation.variance.sourceTag} />
            </div>
            {atRisk && !investigating && (
              <div className="mt-3">
                <Btn onClick={() => setInvestigating(true)} icon={ChevronRight}>
                  Investigate
                </Btn>
              </div>
            )}
          </div>
        </div>

        {investigating && atRisk && (
          <div
            className="mt-4 rounded-lg p-4"
            style={{ background: "var(--ks-panel-alt)", border: "1px solid var(--ks-accent-edge)" }}
          >
            <Eyebrow>Root cause</Eyebrow>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ks-dim)" }}>
              {reconciliation.variance.rootCause}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Btn onClick={reconcileVariance} icon={CheckCircle2}>
                Reconcile
              </Btn>
              <Btn kind="ghost" onClick={() => setInvestigating(false)}>
                Dismiss
              </Btn>
            </div>
          </div>
        )}

        {!atRisk && (
          <div
            className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm"
            style={{
              background: "var(--ks-green-dim)",
              border: "1px solid var(--ks-green-edge)",
              color: "var(--ks-green)",
            }}
          >
            <FileCheck size={15} /> Reconciled — duty-defensibility evidence generated and added to the
            Excise pack.
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--ks-faint)" }}>
        <Activity size={13} /> Detection latency:{" "}
        <span style={{ color: "var(--ks-dim)" }}>{reconciliation.detectionLatency.value}</span>{" "}
        <SourceChip tag={reconciliation.detectionLatency.sourceTag} />
      </div>
    </div>
  );
}
