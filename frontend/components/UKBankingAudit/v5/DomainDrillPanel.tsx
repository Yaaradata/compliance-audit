"use client";

import { useMemo, useState } from "react";
import { getDomainNarrative } from "@/lib/ukbankingaudit/riskDomainsV4";
import { matchPrecedents } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import { CRSA_DATA, CRSA_MECHANISM_TAGS } from "@/lib/ukbankingaudit/v5/riskDomainsV5";
import type { Precedent } from "@/lib/ukbankingaudit/v5/types";
import { CrsaTable } from "./CrsaTable";
import { KriBar } from "./KriBar";
import { RagBadge } from "./FirmPostureSummary";
import { PrecedentBanner } from "./PrecedentBanner";
import { RemediationTimeline } from "./RemediationTimeline";
import { RAG_STYLES } from "./ragTokens";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
  onClose: () => void;
};

/** For a CRSA area, the precedents matched by any control's mechanism tags (deduped by precedent). */
function crsaPrecedentMatches(
  area: string,
  domainId: string,
): { precedent: Precedent; crsaRef: string }[] {
  const rows = CRSA_DATA[area] ?? [];
  const seen = new Set<string>();
  const matches: { precedent: Precedent; crsaRef: string }[] = [];
  for (const row of rows) {
    const tags = CRSA_MECHANISM_TAGS[row.ref];
    if (!tags) continue;
    for (const precedent of matchPrecedents(tags, "UK", domainId)) {
      if (seen.has(precedent.id)) continue;
      seen.add(precedent.id);
      matches.push({ precedent, crsaRef: row.ref });
    }
  }
  return matches;
}

/** Inline domain drill attached below expanded tile (v4 mockup). */
export function DomainDrillPanel({ domain, onClose }: Props) {
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const [showRemediation, setShowRemediation] = useState(false);
  const [showCrsa, setShowCrsa] = useState(false);
  const band = domain.status === "RED" ? "red" : domain.status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  const precedentMatches = useMemo(
    () => (domain.crsa ? crsaPrecedentMatches(domain.crsa, domain.id) : []),
    [domain.crsa, domain.id],
  );

  const toggleSub = (idx: number) => {
    setExpandedSub(expandedSub === idx ? null : idx);
    setShowRemediation(false);
    setShowCrsa(false);
  };

  return (
    <div
      className={`uk-v4-slide-down overflow-hidden rounded-b-[10px] border-[1.5px] border-t-0 bg-white ${rag.border}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-[11.5px] text-slate-400 hover:text-slate-600"
        >
          Enterprise Risk Profile
        </button>
        <span className="text-[11px] text-slate-300">›</span>
        <span className="text-[11.5px] font-semibold text-slate-700">{domain.name}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500">
          Overall Residual: <RagBadge status={domain.status} />
        </span>
      </div>

      <div className="p-[18px]">
        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Risk Decomposition
        </h3>
        <div className="mb-5 flex flex-col gap-1">
          {domain.subCategories.map((sub, idx) => {
            const sb = sub.status === "RED" ? "red" : sub.status === "AMBER" ? "amber" : "green";
            const srag = RAG_STYLES[sb];
            const open = expandedSub === idx;
            return (
              <div key={sub.name}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSub(idx);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                    open ? `${srag.bg} ${srag.border} rounded-b-none` : "border-slate-200 bg-stone-50/80"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${srag.dot}`} />
                  <span className="flex-1 text-[13px] font-semibold text-slate-900">{sub.name}</span>
                  <RagBadge status={sub.status} />
                  <span
                    className={`text-[11px] text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {open ? (
                  <div
                    className={`uk-v4-slide-down-fast rounded-b-lg border border-t-0 bg-white px-3.5 py-3 ${srag.border}`}
                  >
                    <p className="text-xs leading-relaxed text-slate-600">{sub.desc}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Key Risk Indicators vs Appetite
        </h3>
        <div className="mb-5 rounded-[10px] border border-slate-200 bg-slate-50 p-3.5">
          {domain.kris.map((kri) => (
            <KriBar key={kri.label} {...kri} />
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {domain.remediation ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRemediation((v) => !v);
                setShowCrsa(false);
              }}
              className={`rounded-lg border border-violet-600 px-4 py-1.5 text-xs font-semibold transition-colors ${
                showRemediation ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"
              }`}
            >
              {showRemediation ? "▴ Hide Remediation Plan" : "▾ View Remediation Plan"}
            </button>
          ) : null}
          {domain.crsa ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCrsa((v) => !v);
                setShowRemediation(false);
              }}
              className={`rounded-lg border border-teal-700 px-4 py-1.5 text-xs font-semibold transition-colors ${
                showCrsa ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-800"
              }`}
            >
              {showCrsa ? "▴ Hide CRSA Controls" : "▾ View CRSA Controls"}
            </button>
          ) : null}
        </div>

        {showRemediation && domain.remediation ? (
          <RemediationTimeline domainName={domain.name} plan={domain.remediation} />
        ) : null}

        {showCrsa && domain.crsa ? (
          <>
            {precedentMatches.map((m) => (
              <PrecedentBanner key={m.precedent.id} precedent={m.precedent} crsaRef={m.crsaRef} />
            ))}
            <CrsaTable area={domain.crsa} domainName={domain.name} />
          </>
        ) : null}

        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-xs italic leading-relaxed text-slate-600">{getDomainNarrative(domain)}</p>
        </div>
      </div>
    </div>
  );
}
