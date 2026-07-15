"use client";

import type { ReactNode } from "react";
import type { UkAuditClaim } from "@/lib/UK_Process_Audit/v3";
import { EvidenceBoundClaim } from "./EvidenceBoundClaim";

export function SignalBoard({
  claims,
  onOpenEvidence,
}: {
  claims: UkAuditClaim[];
  onOpenEvidence: (controlId: string) => void;
}) {
  const rule = claims.filter((c) => c.origin === "RULE");
  const llm = claims.filter((c) => c.origin === "LLM");

  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Signal board</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Permitted predicates only · every claim carries an evidence reference · RULE vs LLM always
          labelled
        </p>
      </div>
      <div className="grid gap-4 p-4 xl:grid-cols-2">
        <Column title={`RULE · ${rule.length}`} subtitle="Deterministic evaluation">
          {rule.slice(0, 12).map((claim) => (
            <EvidenceBoundClaim
              key={claim.id}
              claim={claim}
              evidence={claim.evidence}
              onOpenEvidence={onOpenEvidence}
            />
          ))}
          {rule.length === 0 ? <Empty /> : null}
        </Column>
        <Column title={`LLM · ${llm.length}`} subtitle="Interpretive overlay — not a determination">
          {llm.slice(0, 8).map((claim) => (
            <EvidenceBoundClaim
              key={claim.id}
              claim={claim}
              evidence={claim.evidence}
              onOpenEvidence={onOpenEvidence}
            />
          ))}
          {llm.length === 0 ? <Empty /> : null}
        </Column>
      </div>
    </section>
  );
}

function Column({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-[12px] font-semibold text-slate-800">{title}</div>
        <div className="text-[11px] text-slate-500">{subtitle}</div>
      </div>
      <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function Empty() {
  return <div className="rounded-lg bg-slate-50 px-3 py-4 text-[12px] text-slate-500">No signals.</div>;
}
