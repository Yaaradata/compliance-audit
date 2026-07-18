"use client";

import { useMemo } from "react";
import { riskAppetiteMetrics } from "@/components/UKBankingAudit/ukTraceRuntime";
import { fincrimeAppetiteBreachNoPlan } from "@/lib/ukbankingaudit/v6/appetiteBreachNoPlan";
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { StatusBadge } from "@/components/UKBankingAudit/v6/screens/_shared";
import { AppetiteBreachNoPlan } from "./AppetiteBreachNoPlan";

type AppetiteMetric = {
  id: string;
  metric: string;
  current: number;
  currentBand: string;
  rasVersion: number;
  accountableSMFId: string;
};

type Props = {
  onOpenEvidence?: (ref: string) => void;
};

/**
 * RAS appetite metrics alongside domain KRI breaches — AppetiteBreachNoPlan beside fincrime breach.
 */
export function AppetiteFrameworkPanel({ onOpenEvidence }: Props) {
  const breachedMetrics = useMemo(
    () =>
      ((riskAppetiteMetrics || []) as AppetiteMetric[]).filter(
        (m) => m.currentBand === "red" || m.currentBand === "amber",
      ),
    [],
  );

  const fincrimeSignal = useMemo(() => fincrimeAppetiteBreachNoPlan(), []);
  const fincrime = RISK_DOMAINS_V4.find((d) => d.id === "fincrime");

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
          Appetite framework
        </div>
        <h2 className="mt-0.5 text-base font-bold text-slate-900">RAS metrics &amp; KRI universe</h2>
        <p className="mt-1 text-[11px] text-slate-600">
          Breached appetite metrics and domain KRIs — remediation join surfaced when a plan stalls.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {breachedMetrics.map((m: AppetiteMetric) => (
          <div
            key={m.id}
            className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-slate-500">{m.id}</div>
                <div className="text-xs font-semibold text-slate-900">{m.metric}</div>
              </div>
              <StatusBadge tone={m.currentBand} label={m.currentBand.toUpperCase()} size="xs" />
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              {m.current}
              {m.metric.includes("%") ? "%" : ""}
            </div>
            <div className="text-[10px] text-slate-500">
              RAS v{m.rasVersion} · accountable {m.accountableSMFId}
            </div>
          </div>
        ))}
      </div>

      {fincrime && fincrimeSignal ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Breached domain · {fincrime.name}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">{fincrime.summary}</p>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-600">
              {fincrimeSignal.breachedKris.map((k) => (
                <li key={k.label}>
                  {k.label}: {k.unit === "%" ? `${k.value}%` : k.value.toLocaleString("en-GB")} (target{" "}
                  {k.target}
                  {k.unit === "%" ? "%" : ""})
                </li>
              ))}
            </ul>
          </div>
          <AppetiteBreachNoPlan signal={fincrimeSignal} onOpenEvidence={onOpenEvidence} />
        </div>
      ) : null}
    </section>
  );
}
