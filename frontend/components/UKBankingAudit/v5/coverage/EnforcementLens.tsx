"use client";

import { useMemo, useState } from "react";
import { formatConsequence } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import type { Precedent } from "@/lib/ukbankingaudit/v5/types";
import type { EnforcementNoticeItem } from "@/lib/ukbankingaudit/v5/enforcementCoverage";

const POSTURE_STYLE: Record<Precedent["admissionPosture"], string> = {
  admitted: "border-slate-300 bg-slate-100 text-slate-700",
  "settled-no-admission": "border-slate-300 bg-slate-100 text-slate-600",
  alleged: "border-amber-300 bg-amber-50 text-amber-700",
  "criminal-conviction": "border-slate-400 bg-slate-200 text-slate-800",
  "guilty-plea": "border-slate-400 bg-slate-200 text-slate-800",
  "consent-order": "border-slate-300 bg-slate-100 text-slate-700",
  "undertaking-only": "border-slate-300 bg-slate-100 text-slate-600",
  "open-investigation": "border-amber-300 bg-amber-50 text-amber-700",
  "tribunal-varied": "border-slate-300 bg-slate-100 text-slate-600",
};

type Props = {
  notices: EnforcementNoticeItem[];
  openDrawer?: (entityType: string, entityId: string, sourceScreen: string) => void;
};

/**
 * Sixth lens — reuses the reg-change lineage layout with enforcement notices as root nodes.
 * Traversal: Precedent → mechanism tags → CRSA → GSR → controls.
 */
export function EnforcementLens({ notices, openDrawer }: Props) {
  const [pickedId, setPickedId] = useState(notices[0]?.id ?? null);
  const item = useMemo(() => notices.find((n) => n.id === pickedId), [notices, pickedId]);

  const LineageRow = ({
    label,
    ids,
    onClickId,
    count,
  }: {
    label: string;
    ids: string[];
    onClickId?: (id: string) => void;
    count?: number;
  }) => (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-[10px] font-bold text-slate-700">{count ?? ids.length}</span>
      </div>
      {ids.length === 0 ? (
        <p className="text-[10px] italic text-slate-400">— no impact</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onClickId?.(id)}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] hover:border-indigo-200 hover:bg-indigo-50"
            >
              {id}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!notices.length) {
    return (
      <p className="text-sm text-slate-500">
        No enforcement notices in the last 12 months reach controls you own.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Enforcement notice:</span>
          <select
            value={pickedId ?? ""}
            onChange={(e) => setPickedId(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          >
            {notices.map((n) => (
              <option key={n.id} value={n.id}>
                {n.regulatorBody} — {n.publishedDate}
              </option>
            ))}
          </select>
        </div>

        {item ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">{item.precedent.regulator}</span>
              <span className="text-slate-300">·</span>
              <span>{item.publishedDate}</span>
              <span className="text-slate-300">·</span>
              <span>{item.precedent.respondent}</span>
              <span className="text-slate-300">·</span>
              <span className="font-medium text-slate-700">{formatConsequence(item.precedent)}</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${POSTURE_STYLE[item.precedent.admissionPosture]}`}
              >
                {item.precedent.admissionPosture}
              </span>
              <span className="font-semibold text-indigo-700">
                {item.controlCount} control{item.controlCount === 1 ? "" : "s"} reached
              </span>
              {item.precedent.sourceUrl ? (
                <a
                  href={item.precedent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
                >
                  source
                </a>
              ) : (
                <span className="text-[10px] italic text-slate-400">source pending</span>
              )}
            </div>

            {item.precedent.confidence === "unverified" ? (
              <div className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                Penalty and date unresolved. Do not use in client material.
              </div>
            ) : null}

            <h3 className="mt-2 text-sm font-bold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{item.summary}</p>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Published {item.publishedDate} · Applicability {item.applicabilityStatus.replace(/_/g, " ")}
            </div>
          </>
        ) : null}
      </div>

      {item ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <LineageRow label="Failure mechanisms" ids={item.impactedMechanismTags} />
          <LineageRow label="CRSA requirements reached" ids={item.impactedCrsaRefs} />
          <LineageRow label="Group set requirements" ids={item.impactedGsrIds} />
          <LineageRow
            label="Controls reached"
            ids={item.impactedControlIds}
            onClickId={(id) => openDrawer?.("control", id, "coverageMap")}
          />
          <LineageRow
            label="Domain scope"
            ids={item.precedent.domainScope}
          />
        </div>
      ) : null}
    </div>
  );
}
