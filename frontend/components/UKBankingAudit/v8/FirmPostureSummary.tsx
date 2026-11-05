"use client";

import { DOMAIN_EVIDENCE, RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v8/riskDomainsV8";
import type { FirmBannerView } from "@/lib/ukbankingaudit/v8/boardView";
import type { StatusEvidence } from "@/lib/ukbankingaudit/v8/types";
import { RAG_STYLES } from "./ragTokens";
import { RatingTrendChip } from "./RatingTrendChip";
import type { RagStatus } from "./types";

/** RAG status of the target a StatusEvidence row describes (sub-category if set, else domain). */
function statusOfEvidence(evidence: StatusEvidence): RagStatus | undefined {
  const domain = RISK_DOMAINS_V4.find((d) => d.id === evidence.domainId);
  if (!domain) return undefined;
  if (evidence.subCategory) {
    return domain.subCategories.find((s) => s.name === evidence.subCategory)?.status;
  }
  return domain.status;
}

/** GREEN statuses that are armed yet carry no artefact — the "unevidenced green" the product exists to surface. */
const UNEVIDENCED_GREEN = DOMAIN_EVIDENCE.filter(
  (e) => e.cadenceSource === "human-confirmed" && e.artefactId === null && statusOfEvidence(e) === "GREEN",
).length;

export function RagBadge({ status }: { status: RagStatus }) {
  const band = status === "RED" ? "red" : status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  return (
    <span
      className={`shrink-0 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${rag.badge} ${rag.badgeText}`}
    >
      {status}
    </span>
  );
}

export function FirmPostureBanner({
  banner,
  onOpenCategory,
  onOpenAssurance,
}: {
  banner: FirmBannerView;
  onOpenCategory: (categoryId: string) => void;
  onOpenAssurance: () => void;
}) {
  const rag = RAG_STYLES[banner.colour];
  return (
    <div className={`rounded-xl border-[1.5px] p-5 ${rag.bg} ${rag.border}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className={`h-3.5 w-3.5 rounded-full ${rag.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${rag.text}`}>
          Firm Risk Posture
        </span>
        <span className={`text-2xl font-extrabold tracking-tight ${rag.text}`}>
          {banner.colour.toUpperCase()}
        </span>
        <RatingTrendChip trend={banner.trend} showText />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">Rule: {banner.ruleDescription}</p>

      {banner.drivingCategories.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-700">Driven by:</span>
          {banner.drivingCategories.map((category) => {
            const chip = RAG_STYLES[category.colour];
            return (
              <button
                key={category.categoryId}
                type="button"
                onClick={() => onOpenCategory(category.categoryId)}
                className={`rounded-full border bg-white px-2.5 py-1 text-xs font-semibold transition hover:shadow-sm ${chip.border} ${chip.text}`}
              >
                {category.label} — {category.colour.toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : null}

      {banner.assuranceGapCategoryIds.length > 0 ? (
        <p className="mt-3 text-[13px] font-semibold text-slate-600">
          Assurance:{" "}
          <button
            type="button"
            onClick={onOpenAssurance}
            className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
          >
            {banner.assuranceText}
          </button>
        </p>
      ) : null}
    </div>
  );
}

export function RagCountPills({ counts }: { counts: Record<RagStatus, number> }) {
  const pills: { key: RagStatus; hint: string }[] = [
    { key: "GREEN", hint: "within appetite" },
    { key: "AMBER", hint: "monitor closely" },
    { key: "RED", hint: "action required" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {pills.map(({ key, hint }) => {
        const band = key === "RED" ? "red" : key === "AMBER" ? "amber" : "green";
        const rag = RAG_STYLES[band];
        return (
          <div
            key={key}
            className={`flex items-center gap-2 rounded-lg border px-4 py-1.5 ${rag.bg}`}
            style={{ borderColor: `${band === "green" ? "#16a34a" : band === "amber" ? "#d97706" : "#dc2626"}22` }}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${rag.dot}`} />
            <span className={`text-sm font-semibold ${rag.text}`}>{counts[key]}</span>
            <span className="text-xs text-slate-500">— {hint}</span>
          </div>
        );
      })}
      <div
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-1.5"
        title="GREEN status asserted without an evidence artefact within cadence — an unknown, not a failure"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
        <span className="text-sm font-semibold text-slate-500">{UNEVIDENCED_GREEN}</span>
        <span className="text-xs text-slate-500">— unevidenced</span>
      </div>
    </div>
  );
}
