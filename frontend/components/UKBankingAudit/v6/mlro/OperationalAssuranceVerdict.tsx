"use client";

import { ClaimLine } from "../ClaimLine";
import { RAG_STYLES } from "../ragTokens";
import type { DomainKri, RiskDomainV4 } from "../types";

type Props = {
  domain: RiskDomainV4;
};

/** Which existing panel below best evidences a given KRI's breach — for the "why" row's links. */
const PANEL_ANCHOR: Record<string, string> = {
  "KYC Periodic Review Backlog": "mlro-panel-kri-strip",
  "High-Risk Reviews Overdue": "mlro-panel-kri-strip",
  "TM Alerts Closed in SLA": "mlro-panel-alert-backlog",
  "EDD Completed on Time": "mlro-panel-sar-edd",
};

/** Values/targets read straight off the KRI — nothing here is a literal, all of it is data-driven. */
function breachText(kri: DomainKri): string {
  const value = typeof kri.value === "number" ? kri.value.toLocaleString() : kri.value;
  const target = typeof kri.target === "number" ? kri.target.toLocaleString() : kri.target;
  if (kri.label === "KYC Periodic Review Backlog") {
    return `KYC review backlog ${value} vs <${target}`;
  }
  if (kri.label === "TM Alerts Closed in SLA") {
    return `TM alerts closed in SLA ${value}% vs >=${target}%`;
  }
  if (kri.label === "High-Risk Reviews Overdue") {
    return `High-risk reviews overdue ${value}% vs ${target}%`;
  }
  return kri.unit === "%" ? `${kri.label} ${value}% vs ${target}%` : `${kri.label} ${value} vs ${target}`;
}

function scrollToPanel(anchor: string) {
  document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Verdict-first banner for the MLRO's Operational Assurance lens: "am I keeping
 * up, yes or no." Computed entirely from `domain.kris` already on screen — no
 * new dataset. Fires BEHIND when any operational KRI sits outside its
 * SLA/appetite.
 *
 * The "leading indicator of enforcement" line below is a risk INTERPRETATION,
 * not a measured fact, so it renders through ClaimLine with derivation="LLM"
 * (hollow dot) — the same inferred-signal treatment used everywhere else,
 * kept off the RAG severity axis.
 */
export function OperationalAssuranceVerdict({ domain }: Props) {
  const breached = domain.kris.filter((k) => k.status !== "GREEN");
  const behind = breached.length > 0;
  const band = behind ? (breached.some((k) => k.status === "RED") ? "red" : "amber") : "green";
  const rag = RAG_STYLES[band];

  return (
    <div className={`rounded-xl border-[1.5px] p-5 ${rag.bg} ${rag.border}`}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`h-3.5 w-3.5 rounded-full ${rag.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${rag.text}`}>
          Operational Assurance
        </span>
        <span className={`text-xl font-extrabold tracking-tight ${rag.text}`}>
          {behind ? "BEHIND" : "KEEPING UP"}
        </span>
        <span className="text-sm font-semibold text-slate-600">
          on {breached.length} of {domain.kris.length} controls
        </span>
      </div>

      {breached.length > 0 ? (
        <div className="mb-3 space-y-0.5">
          {breached.map((k) => {
            const anchor = PANEL_ANCHOR[k.label];
            return (
              <ClaimLine
                key={k.label}
                derivation="RULE"
                evidenceRef={`KRI-${k.label.replace(/[^A-Za-z0-9]+/g, "-")}`}
              >
                {anchor ? (
                  <button
                    type="button"
                    onClick={() => scrollToPanel(anchor)}
                    className="text-left text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-900"
                  >
                    {breachText(k)}
                  </button>
                ) : (
                  <span>{breachText(k)}</span>
                )}
              </ClaimLine>
            );
          })}
        </div>
      ) : null}

      <ClaimLine derivation="LLM" evidenceRef="INFERRED-OPS-LAG-ENFORCEMENT">
        <span className="italic text-slate-600">
          Sustained operational lag is a leading indicator of enforcement — it is why firms
          get fined, not just how.
        </span>
      </ClaimLine>
    </div>
  );
}
