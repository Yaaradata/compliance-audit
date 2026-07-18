"use client";

import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { KriBar } from "@/components/UKBankingAudit/v6/KriBar";
import { RemediationTimeline } from "@/components/UKBankingAudit/v6/RemediationTimeline";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import { getPrecedentById } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import type { AppetiteBreachNoPlanSignal } from "@/lib/ukbankingaudit/v6/appetiteBreachNoPlan";
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v6/riskDomainsV6";

type Props = {
  signal: AppetiteBreachNoPlanSignal;
  onOpenEvidence?: (ref: string) => void;
};

const MONZO_PRECEDENT_ID = "uk-monzo-2025";

/**
 * KRI outside appetite while remediation is stalled — KriBar and RemediationTimeline
 * joined side by side (v4 never connected them).
 */
export function AppetiteBreachNoPlan({ signal, onOpenEvidence }: Props) {
  const domain = RISK_DOMAINS_V4.find((d) => d.id === signal.domainId);
  const monzo = getPrecedentById(MONZO_PRECEDENT_ID);

  if (!domain?.remediation) return null;

  const worst = signal.worstKri;
  const worstLabel =
    worst.unit === "%"
      ? `${worst.value}% vs target ${worst.target}%`
      : `${worst.value.toLocaleString("en-GB")} vs appetite ${worst.target.toLocaleString("en-GB")}`;

  return (
    <section className="rounded-xl border-2 border-rose-300 bg-rose-50/40 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
        Appetite breach without remediation progress
      </div>

            <ClaimLine derivation="RULE" evidenceRef={`APPETITE-BREACH-${signal.domainId.toUpperCase()}`} onOpenEvidence={onOpenEvidence}>
        {signal.breachedKris.length} KRI(s) outside appetite (worst: {worst.label} at {worstLabel}) while step
        &quot;{signal.stalledStepTitle}&quot; is {signal.stalledStepStatus} at {signal.stalledStepProgress}%
        progress.
      </ClaimLine>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            KRIs vs appetite
          </div>
          {signal.breachedKris.map((kri) => (
            <KriBar key={kri.label} {...kri} />
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Remediation plan
          </div>
          <RemediationTimeline domainName={domain.name} plan={domain.remediation} />
        </div>
      </div>

      {monzo ? (
        <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
          Precedent · {monzo.respondent} — a requirement the firm applied for itself, breached for 22 months.{" "}
          {formatConsequence(monzo)}, settled-no-admission.
        </p>
      ) : null}
    </section>
  );
}
