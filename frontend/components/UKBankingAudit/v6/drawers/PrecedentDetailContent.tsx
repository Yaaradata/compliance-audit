"use client";

import { ClaimLegend } from "@/components/UKBankingAudit/v6/ClaimLine";
import {
  crsaControlsMatchingPrecedent,
  getV6Precedent,
  formatConsequence,
} from "@/lib/ukbankingaudit/v6/resolveV6Entity";
import { formatGbp } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import type { Precedent } from "@/lib/ukbankingaudit/v6/types";

const POSTURE_STYLE: Record<Precedent["admissionPosture"], string> = {
  admitted: "border-emerald-400 bg-emerald-50 text-emerald-900",
  "settled-no-admission": "border-amber-400 bg-amber-50 text-amber-900",
  alleged: "border-slate-300 bg-slate-50 text-slate-700",
  "criminal-conviction": "border-rose-500 bg-rose-50 text-rose-900",
  "guilty-plea": "border-rose-400 bg-rose-50 text-rose-900",
  "consent-order": "border-indigo-400 bg-indigo-50 text-indigo-900",
  "undertaking-only": "border-slate-300 bg-slate-50 text-slate-700",
  "open-investigation": "border-slate-300 bg-slate-50 text-slate-500",
  "tribunal-varied": "border-violet-400 bg-violet-50 text-violet-900",
};

function formatUkDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Props = { entityId: string };

/**
 * Primary-source drawer for a real Final Notice / enforcement record.
 * admissionPosture is required — without it the drawer does not render.
 */
export function PrecedentDetailContent({ entityId }: Props) {
  const p = getV6Precedent(entityId);
  if (!p || !p.admissionPosture) {
    return (
      <p className="text-sm text-slate-600">Precedent not found for this reference.</p>
    );
  }

  const matches = crsaControlsMatchingPrecedent(p);
  const consequence = formatConsequence(p);
  const tribunalNote =
    p.tribunalReducedTo != null && p.penalty != null
      ? `Tribunal reduced to ${formatGbp(p.tribunalReducedTo)}`
      : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span
          className={`inline-flex rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${POSTURE_STYLE[p.admissionPosture]}`}
        >
          {p.admissionPosture}
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{p.regulator}</span>
          <span className="text-slate-300">·</span>
          <span>{formatUkDate(p.noticeDate)}</span>
          <span className="text-slate-300">·</span>
          <span>{p.respondent}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{consequence}</h2>
        {tribunalNote ? (
          <p className="text-xs font-medium text-violet-800">{tribunalNote}</p>
        ) : null}
        {p.instrument && p.instrument.length > 0 ? (
          <p className="font-mono text-[11px] text-slate-700">{p.instrument.join(" · ")}</p>
        ) : null}
      </div>

      {p.confidence === "unverified" ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-900">
          Penalty and date unresolved. Do not use in client material.
        </div>
      ) : null}

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Finding</div>
        <p className="mt-1 text-sm font-semibold text-slate-900">{p.hook}</p>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Mechanism (verbatim)
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-800">{p.mechanism}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {p.domainScope.map((d) => (
          <span
            key={d}
            className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
          >
            {d}
          </span>
        ))}
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Failure mechanism tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.failureMechanismTags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[10px] text-indigo-800"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Matches your controls
        </div>
        {matches.length === 0 ? (
          <p className="text-xs text-slate-500">No tagged CRSA control intersects these mechanisms.</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((m) => (
              <li
                key={m.ref}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs"
              >
                <span className="font-mono font-semibold text-slate-900">{m.ref}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="text-slate-700">{m.objective}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="font-bold text-slate-800">{m.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {p.sourceUrl ? (
        <a
          href={p.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
        >
          Read the Final Notice →
        </a>
      ) : (
        <p className="text-xs text-slate-500">No primary source URL confirmed for this record.</p>
      )}

      <ClaimLegend />
    </div>
  );
}
