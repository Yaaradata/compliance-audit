"use client";

import { ClaimLegend } from "@/components/UKBankingAudit/v6/ClaimLine";
import { getDerivation } from "@/lib/ukbankingaudit/v6/derivations";

type Props = { entityId: string };

function KindMarker({ kind }: { kind: "RULE" | "LLM" }) {
  return kind === "RULE" ? (
    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" aria-hidden />
  ) : (
    <span
      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full border border-slate-500 bg-transparent"
      aria-hidden
    />
  );
}

/**
 * Working-paper drawer for RULE / LLM derivations — method, not evidence.
 */
export function DerivationDetailContent({ entityId }: Props) {
  const d = getDerivation(entityId);

  if (d.missing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700">No derivation recorded for this reference.</p>
        <p className="font-mono text-[11px] text-slate-500">{entityId}</p>
        <ClaimLegend />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <KindMarker kind={d.kind} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {d.kind} derivation
          </div>
          <h2 className="mt-0.5 text-base font-bold text-slate-900">{d.question}</h2>
          <p className="mt-1 font-mono text-[10px] text-slate-500">{entityId}</p>
        </div>
      </div>

      <ClaimLegend />

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Method</div>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-800">{d.method}</p>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Inputs</div>
        <dl className="space-y-1.5">
          {d.inputs.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 rounded border border-slate-200 bg-slate-50/80 px-3 py-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <dt className="text-[11px] font-medium text-slate-500">{row.label}</dt>
              <dd className="text-[12px] text-slate-900 sm:max-w-[65%] sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Output</div>
        <p className="mt-1 text-sm font-semibold text-slate-900">{d.output}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
        <span className="font-mono">{d.version}</span>
        <span>evaluated {d.evaluatedAt}</span>
      </div>
    </div>
  );
}
