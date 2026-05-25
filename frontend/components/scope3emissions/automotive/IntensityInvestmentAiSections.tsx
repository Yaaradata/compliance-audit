"use client";

import type { ReactNode } from "react";
import type { IntensityInvestmentAiDossier } from "./intensity-ratio-types";
import { formatTCO2e } from "./automotive-ui";
import { IntensityCostCutBarChart, IntensityRiskBarChart } from "./intensity-ratio-charts";

function AiSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/15 p-4 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function sevClass(s: IntensityInvestmentAiDossier["severity"]): string {
  if (s === "Critical") return "bg-[var(--danger-bg)] text-[var(--danger)]";
  if (s === "High") return "bg-[var(--warning-bg)] text-[var(--warning)]";
  if (s === "Medium") return "bg-[var(--info-bg)] text-[var(--info)]";
  return "bg-[var(--muted)] text-[var(--foreground-muted)]";
}

export function IntensityInvestmentAiSections({
  ai,
  embedded = false,
}: {
  ai: IntensityInvestmentAiDossier;
  embedded?: boolean;
}) {
  return (
    <div className={embedded ? "space-y-4 border-t border-[var(--border)] pt-5" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
          ✦ AI insights
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sevClass(ai.severity)}`}>{ai.severity}</span>
        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] text-[var(--foreground-muted)]">{ai.category}</span>
        <span className="text-[10px] text-[var(--foreground-muted)]">Confidence {ai.confidencePct}%</span>
      </div>
      <p className="text-sm font-medium leading-relaxed text-[var(--foreground)]">{ai.headline}</p>

      <AiSection title="Risk analysis">
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[var(--foreground-muted)]">Overall assurance risk</span>
            <span className="text-lg font-bold text-[var(--foreground)]">{ai.riskAnalysis.overallRisk}</span>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Composite index{" "}
            <span className="font-semibold tabular-nums text-[var(--foreground)]">{ai.riskAnalysis.compositeIndex}</span>
            <span> / 100 — investment, supplier, and disclosure signals blended for this programme.</span>
          </p>
          <IntensityRiskBarChart dimensions={ai.riskAnalysis.dimensions} />
          {ai.riskAnalysis.dimensions.map((d) => (
            <p key={`${d.label}-note`} className="text-[11px] text-[var(--foreground-muted)]">
              <span className="font-medium text-[var(--foreground)]">{d.label}: </span>
              {d.note}
            </p>
          ))}
          {ai.riskAnalysis.flags.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-xs text-amber-800 dark:text-amber-200">
              {ai.riskAnalysis.flags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </AiSection>

      <AiSection title="Cost cut-off ideas">
        <IntensityCostCutBarChart ideas={ai.costCutIdeas} />
        <ul className="mt-3 space-y-3">
          {ai.costCutIdeas.map((c) => (
            <li key={c.title} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="font-semibold text-[var(--foreground)]">{c.title}</span>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">
                  {c.effort} effort
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">{c.detail}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold tabular-nums">
                {c.annualSavingCr != null ? (
                  <span className="text-emerald-700 dark:text-emerald-300">₹{c.annualSavingCr} Cr/yr</span>
                ) : null}
                {c.annualSavingT != null ? (
                  <span className="text-teal-700 dark:text-teal-300">−{formatTCO2e(c.annualSavingT, true)}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </AiSection>

      <AiSection title="Purchasing strategies">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--foreground-muted)]">
          {ai.purchasingStrategies.map((s) => (
            <li key={s} className="leading-snug">
              <span className="text-[var(--foreground)]">{s}</span>
            </li>
          ))}
        </ul>
      </AiSection>

      <AiSection title="Contract negotiation levers">
        <p className="mb-2 text-[11px] leading-snug text-[var(--foreground-muted)]">
          Illustrative commercial themes for Scope 3–linked terms — requires legal review before use.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--foreground-muted)]">
          {ai.contractLevers.map((s) => (
            <li key={s} className="leading-snug">
              <span className="text-[var(--foreground)]">{s}</span>
            </li>
          ))}
        </ul>
      </AiSection>

      <AiSection title="Suggested actions">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--foreground)]">
          {ai.recommendedActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </AiSection>

      <details className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 px-3 py-2 text-xs">
        <summary className="cursor-pointer font-semibold text-[var(--primary)]">Model trace</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--foreground-muted)]">
          {ai.modelTrace.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
