"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Scope3DrilldownDrawer } from "../Pharma/scope3-ui";
import { autoBtnPrimary, autoBtnSecondary, formatTCO2e, riskColor } from "./automotive-ui";
import { getInvestmentAiDossier } from "./intensity-investment-ai";
import { INTENSITY_INVEST, INTENSITY_TONE_HEX, type IntensityTone } from "./intensity-ratio-data";
import { drillForInvestment } from "./intensity-ratio-drills";
import { IntensityCategoryImpactBar } from "./intensity-ratio-charts";
import { IntensityInvestmentAiSections } from "./IntensityInvestmentAiSections";

type Props = {
  programmeName: string | null;
  onClose: () => void;
};

function ImpactTag({ tone, children }: { tone: IntensityTone; children: ReactNode }) {
  const hex = INTENSITY_TONE_HEX[tone];
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: hex, backgroundColor: `${hex}18`, border: `1px solid ${hex}35` }}
    >
      {children}
    </span>
  );
}

export function InvestmentAiDrillDrawer({ programmeName, onClose }: Props) {
  const [generated, setGenerated] = useState<Set<string>>(() => new Set());
  const [generating, setGenerating] = useState<string | null>(null);

  const row = programmeName ? INTENSITY_INVEST.find((r) => r.name === programmeName) : undefined;
  const ai = programmeName ? getInvestmentAiDossier(programmeName) : undefined;
  const investmentDrill = (() => {
    if (!programmeName) return undefined;
    const d = drillForInvestment(programmeName);
    return d?.kind === "investment" ? d.drill : undefined;
  })();
  const hasGenerated = programmeName ? generated.has(programmeName) : false;
  const isGenerating = programmeName === generating;

  const runGenerate = () => {
    if (!programmeName || !ai || hasGenerated || isGenerating) return;
    setGenerating(programmeName);
    window.setTimeout(() => {
      setGenerated((prev) => new Set(prev).add(programmeName));
      setGenerating(null);
    }, 1100);
  };

  const clearGenerated = () => {
    if (!programmeName) return;
    setGenerated((prev) => {
      const next = new Set(prev);
      next.delete(programmeName);
      return next;
    });
  };

  return (
    <Scope3DrilldownDrawer
      open={programmeName != null}
      onClose={onClose}
      size="lg"
      title={row?.name ?? "Programme"}
      subtitle={
        row
          ? `${row.category} · ${row.investType} · ${row.businessUnit} · ₹${row.spend} Cr`
          : undefined
      }
      footer={
        hasGenerated ? (
          <button type="button" className={autoBtnSecondary} onClick={clearGenerated}>
            Clear & regenerate
          </button>
        ) : (
          <p className="text-xs text-[var(--foreground-muted)]">
            AI output is illustrative — validate with procurement and finance before commercial use.
          </p>
        )
      }
    >
      {row ? (
        <div className="space-y-5 text-sm">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-[var(--border)] p-2">
              <p className="text-[10px] uppercase text-[var(--foreground-muted)]">Spend</p>
              <p className="mt-1 font-bold tabular-nums">₹{row.spend} Cr</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-2">
              <p className="text-[10px] uppercase text-[var(--foreground-muted)]">Avoided</p>
              <p className="mt-1 font-bold tabular-nums">{row.saved > 0 ? formatTCO2e(row.saved, true) : "—"}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-2">
              <p className="text-[10px] uppercase text-[var(--foreground-muted)]">ROI</p>
              <p className="mt-1 font-bold tabular-nums">{row.roi != null ? `${row.roi}×` : "Enabler"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)]">Status</span>
            <span className="text-xs font-semibold" style={{ color: riskColor(row.status === "Complete" ? "On track" : row.status) }}>
              {row.status}
            </span>
            <ImpactTag tone={row.tone}>{row.impact}</ImpactTag>
            {row.climateLinked ? (
              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700 dark:text-teal-300">
                Climate-linked
              </span>
            ) : null}
          </div>

          {investmentDrill?.categoryImpact?.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                Category impact
              </p>
              <IntensityCategoryImpactBar items={investmentDrill.categoryImpact} />
            </div>
          ) : null}

          {!hasGenerated ? (
            <div className="rounded-xl border border-dashed border-violet-400/40 bg-violet-500/[0.04] p-6 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">AI insights</p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[var(--foreground-muted)]">
                Generate risk analysis, cost cut-off ideas, purchasing strategies, and contract levers for this programme.
              </p>
              <button
                type="button"
                disabled={!ai || isGenerating}
                className={`${autoBtnPrimary} mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm disabled:opacity-60`}
                onClick={runGenerate}
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating…
                  </>
                ) : (
                  <>✦ Generate insights</>
                )}
              </button>
            </div>
          ) : ai ? (
            <IntensityInvestmentAiSections ai={ai} />
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">No AI model available for this programme.</p>
          )}
        </div>
      ) : null}
    </Scope3DrilldownDrawer>
  );
}
