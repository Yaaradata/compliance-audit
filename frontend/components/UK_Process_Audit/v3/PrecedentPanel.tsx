"use client";

import type { AdmissionPosture, UkEnforcementPrecedent } from "@/lib/UK_Process_Audit/v3";

const POSTURE_LABEL: Record<AdmissionPosture, string> = {
  "settled-no-admission": "Settled · no admission",
  "criminal-conviction": "Criminal conviction",
  "guilty-plea": "Guilty plea",
  admitted: "Admitted",
  contested: "Contested",
};

function formatGbp(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/**
 * Real public enforcement precedents only.
 * Rows without admissionPosture are filtered upstream and must not render.
 */
export function PrecedentPanel({ precedents }: { precedents: UkEnforcementPrecedent[] }) {
  const rows = precedents.filter((p) => p.admissionPosture != null);

  return (
    <section className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Enforcement precedents</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Public UK notices / judgments only · never synthesised · admission posture required
          </p>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
          Real · public record
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((p) => (
          <article key={p.id} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-[13px] font-semibold text-slate-900">
                {p.firm}{" "}
                <span className="font-normal text-slate-500">
                  · {p.regulator} · {p.date}
                </span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                  {formatGbp(p.amountGbp)}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  {POSTURE_LABEL[p.admissionPosture]}
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-slate-600">{p.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.matchedDomainIds.map((d) => (
                <span
                  key={d}
                  className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 ring-1 ring-indigo-100"
                >
                  {d}
                </span>
              ))}
              {p.matchedThemes.map((t) => (
                <span
                  key={t}
                  className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <div className="px-5 py-6 text-[12px] text-slate-500">No renderable precedents.</div>
        ) : null}
      </div>
    </section>
  );
}
