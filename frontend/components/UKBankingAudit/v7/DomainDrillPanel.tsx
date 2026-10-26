"use client";

import { useMemo, useState } from "react";
import { getDomainNarrative } from "@/lib/ukbankingaudit/riskDomainsV4";
import { getOwnershipState } from "@/lib/ukbankingaudit/v7/ownershipData";
import { matchPrecedents } from "@/lib/ukbankingaudit/v7/precedentCorpus";
import {
  CRSA_DATA,
  CRSA_MECHANISM_TAGS,
  DOMAIN_ACCOUNTABILITY,
} from "@/lib/ukbankingaudit/v7/riskDomainsV7";
import type { Precedent } from "@/lib/ukbankingaudit/v7/types";
import { CrsaTable } from "./CrsaTable";
import { KriBar } from "./KriBar";
import { RagBadge } from "./FirmPostureSummary";
import { PrecedentBanner } from "./PrecedentBanner";
import { RemediationTimeline } from "./RemediationTimeline";
import { RAG_STYLES } from "./ragTokens";
import type { RiskDomainV4 } from "./types";
import { DefensibilityLens } from "./DefensibilityLens";
import { ExposureLens } from "./ExposureLens";
import { MomentumLens } from "./MomentumLens";
import { OwnerChip } from "./OwnerChip";
import { PathToGreenStrip } from "./PathToGreenStrip";
import { LensToggle } from "./LensToggle";

type Props = {
  domain: RiskDomainV4;
  onClose: () => void;
};

type DrillLens = "assurance" | "exposure" | "momentum" | "defensibility";
type DrillTier = "strategic" | "operational" | "both";

const TIER_OPTIONS: { id: DrillTier; label: string }[] = [
  { id: "strategic", label: "Strategic" },
  { id: "operational", label: "Operational" },
  { id: "both", label: "Both" },
];

/** Lenses visible for each tier — order is display order. */
const LENSES_BY_TIER: Record<DrillTier, readonly DrillLens[]> = {
  strategic: ["exposure"],
  operational: ["assurance", "momentum", "defensibility"],
  both: ["exposure", "assurance", "momentum", "defensibility"],
};

const LENS_LABELS: Record<DrillLens, string> = {
  assurance: "Assurance",
  exposure: "Exposure",
  momentum: "Momentum",
  defensibility: "Defensibility",
};

function lensOptionsForTier(tier: DrillTier): { id: DrillLens; label: string }[] {
  return LENSES_BY_TIER[tier].map((id) => ({ id, label: LENS_LABELS[id] }));
}

function firstLensForTier(tier: DrillTier): DrillLens {
  return LENSES_BY_TIER[tier][0];
}

/** Plain header fact — ownership state for the open domain (not a lens). */
function DomainOwnershipHeaderLine({ domainId }: { domainId: string }) {
  const own = getOwnershipState(domainId);
  const acc = DOMAIN_ACCOUNTABILITY[domainId];

  switch (own.state) {
    case "UNALLOCATED":
      return (
        <p className="mt-2 text-[11.5px] leading-snug text-slate-600">
          Owner:{" "}
          <span className="font-semibold text-red-600">unallocated</span>
          {" — SYSC 26 requires an allocated holder"}
        </p>
      );
    case "OWNED_STALE":
    case "OWNED_CURRENT":
      return (
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] leading-snug text-slate-600">
          <span>Owner:</span>
          {acc ? <OwnerChip accountability={acc} /> : null}
          {own.trailAgeDays !== null ? (
            <>
              <span className="text-slate-400" aria-hidden>
                ·
              </span>
              <span>
                last step{" "}
                <span
                  className={
                    own.state === "OWNED_STALE" ? "font-semibold text-amber-600" : undefined
                  }
                >
                  {own.trailAgeDays} days ago
                </span>
              </span>
            </>
          ) : null}
        </p>
      );
    default: {
      const _exhaustive: never = own.state;
      return _exhaustive;
    }
  }
}

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
  const [tier, setTier] = useState<DrillTier>("both");
  const [lens, setLens] = useState<DrillLens>("assurance");
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const [showRemediation, setShowRemediation] = useState(false);
  const [showCrsa, setShowCrsa] = useState(false);
  const band = domain.status === "RED" ? "red" : domain.status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  const lensOptions = useMemo(() => lensOptionsForTier(tier), [tier]);
  const activeLens = LENSES_BY_TIER[tier].includes(lens) ? lens : firstLensForTier(tier);
  const precedentMatches = useMemo(
    () => (domain.crsa ? crsaPrecedentMatches(domain.crsa, domain.id) : []),
    [domain.crsa, domain.id],
  );

  const selectTier = (next: DrillTier) => {
    setTier(next);
    if (!LENSES_BY_TIER[next].includes(lens)) {
      setLens(firstLensForTier(next));
    }
  };

  const toggleSub = (idx: number) => {
    setExpandedSub(expandedSub === idx ? null : idx);
    setShowRemediation(false);
    setShowCrsa(false);
  };

  return (
    <div
      className={`uk-v4-slide-down overflow-hidden rounded-b-[10px] border-[1.5px] border-t-0 bg-white ${rag.border}`}
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-1.5">
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
        <div className="mt-2.5 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-10 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Tier
            </span>
            <LensToggle options={TIER_OPTIONS} value={tier} onChange={selectTier} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-10 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Lens
            </span>
            <LensToggle options={lensOptions} value={activeLens} onChange={setLens} />
          </div>
        </div>
        <DomainOwnershipHeaderLine domainId={domain.id} />
      </div>

      {activeLens === "assurance" ? (
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
                    {sub.status === "RED" || sub.status === "AMBER" ? (
                      <PathToGreenStrip entityRef={sub.name} />
                    ) : null}
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
      ) : activeLens === "exposure" ? (
        <ExposureLens domain={domain} />
      ) : activeLens === "momentum" ? (
        <MomentumLens domain={domain} />
      ) : (
        <DefensibilityLens domain={domain} />
      )}
    </div>
  );
}
