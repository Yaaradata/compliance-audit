"use client";

import { getCrsaRefEntity } from "@/lib/ukbankingaudit/v6/resolveV6Entity";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";

type Props = { entityId: string };

/** Minimal CRSA drawer when attestationLine / gsr do not resolve. */
export function CrsaRefDetailContent({ entityId }: Props) {
  const row = getCrsaRefEntity(entityId);
  if (!row) {
    return <p className="text-sm text-slate-600">CRSA reference not found.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CRSA ref</div>
        <h2 className="mt-0.5 font-mono text-lg font-bold text-slate-900">{row.ref}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-800">{row.objective}</p>
        <p className="mt-1 text-[13px] text-slate-700">{row.requirement}</p>
        <p className="mt-2 text-xs font-bold text-slate-900">Status · {row.status}</p>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Failure mechanism tags
        </div>
        {row.failureMechanismTags.length === 0 ? (
          <p className="text-xs text-slate-500">Untagged — no confident mechanism mapping.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {row.failureMechanismTags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[10px] text-indigo-800"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Matched precedents
        </div>
        {row.matchedPrecedents.length === 0 ? (
          <p className="text-xs text-slate-500">No corpus notice shares these mechanism tags.</p>
        ) : (
          <ul className="space-y-2">
            {row.matchedPrecedents.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs"
              >
                <div className="font-semibold text-slate-900">{p.respondent}</div>
                <div className="mt-0.5 text-slate-600">
                  {p.regulator} · {p.noticeDate} · {formatConsequence(p)}
                </div>
                <div className="mt-1 text-slate-800">{p.hook}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
