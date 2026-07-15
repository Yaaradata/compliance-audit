"use client";

import { EmptyState, StatusBadge } from "./_shared";
import { ClaimLegend } from "@/components/UKBankingAudit/v5/ClaimLine";
import {
  confidenceBandLabel,
  type AIInsightV5,
} from "@/lib/ukbankingaudit/v5/aiContract";

function DerivationDot({ derivation }: { derivation: "RULE" | "LLM" }) {
  return derivation === "RULE" ? (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" aria-hidden />
  ) : (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-slate-500 bg-transparent" aria-hidden />
  );
}

function KVRow({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{k}</span>
      <span className={`font-medium text-right ${tone === "green" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-slate-800"}`}>
        {v}
      </span>
    </div>
  );
}

type Props = {
  insight?: AIInsightV5;
  drillFromDrawer?: (type: string, id: string) => void;
};

/** v5 insight drawer — citation contract with confidence band, never a bare %. */
export function AIInsightDetailV5({ insight, drillFromDrawer }: Props) {
  if (!insight) return <EmptyState message="Insight not found." />;

  const lineage = insight.independenceLineage;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <DerivationDot derivation={insight.derivation} />
          <span className="text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded">
            AI · {insight.type.replace(/_/g, " ")}
          </span>
          <StatusBadge
            tone={insight.severity === "high" ? "red" : insight.severity === "medium" ? "amber" : "green"}
            label={insight.severity.toUpperCase()}
            size="xs"
          />
          <span className="text-[10px] font-semibold text-slate-600">
            {confidenceBandLabel(insight.confidenceBand)}
          </span>
        </div>
        <ClaimLegend />
        <h2 className="text-lg font-bold text-slate-900 mt-2">{insight.title}</h2>
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{insight.summary}</p>
        {insight.confidenceBasis ? (
          <p className="mt-2 text-[10px] text-slate-500">Basis: {insight.confidenceBasis}</p>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Model Lineage</h3>
        <div className="rounded-lg border border-slate-200 p-3 space-y-1 text-xs">
          <KVRow k="Model" v={insight.modelId} />
          <KVRow k="Version" v={insight.modelVersion} />
          <KVRow k="Derivation" v={insight.derivation} />
          <KVRow k="Generated" v={new Date(insight.generatedAt).toLocaleString("en-GB")} />
          {lineage ? (
            <KVRow
              k="Independence"
              v={
                !lineage.inputsFromLOD1 && !lineage.inputsFromLOD2
                  ? "✓ 3LoD-clean"
                  : "Mixed"
              }
              tone={!lineage.inputsFromLOD1 && !lineage.inputsFromLOD2 ? "green" : "amber"}
            />
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Methodology</h3>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 leading-relaxed">
          {insight.methodology}
        </div>
      </div>

      {insight.sourceRecordIds?.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold mb-2">Source Records ({insight.sourceRecordIds.length})</h3>
          <div className="space-y-1">
            {insight.sourceRecordIds.map((s) => (
              <button
                key={`${s.type}:${s.id}`}
                type="button"
                onClick={() => drillFromDrawer?.(s.type, s.id)}
                className="w-full text-left p-2 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-xs flex items-center gap-2"
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{s.type}</span>
                <span className="font-mono text-slate-600">{s.id}</span>
                <span className="text-slate-700 truncate flex-1">{s.label}</span>
                <span className="text-indigo-600">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {insight.counterfactual ? (
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
          <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 mb-1">
            Alternative explanation
          </div>
          <div className="text-xs text-emerald-900 leading-relaxed">{insight.counterfactual}</div>
        </div>
      ) : null}

      {insight.inputsNotSeen?.length ? (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-800 mb-1">
            Missing evidence
          </div>
          <ul className="text-xs text-amber-900 space-y-0.5">
            {insight.inputsNotSeen.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
