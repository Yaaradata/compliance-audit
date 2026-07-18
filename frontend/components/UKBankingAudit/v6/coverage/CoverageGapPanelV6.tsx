"use client";

import { useMemo } from "react";
import {
  groupSetRequirements,
  controls,
  controlObjectives,
  riskAreas,
  crsaAttestationCycles,
  coverageGaps,
} from "@/components/UKBankingAudit/ukTraceRuntime";
import { RACMRefBadge } from "@/components/UKBankingAudit/v6/screens/_shared";
import { resolveGapPrecedent } from "@/lib/ukbankingaudit/v6/enforcementCoverage";
import { PrecedentGapBadge } from "./PrecedentGapBadge";

type GsrItem = {
  id: string;
  thinCoverageFlag?: boolean;
  controlIds?: string[];
  controlObjectiveId: string;
  racmRef?: string;
  requirementText?: string;
};

type ControlItem = {
  id: string;
  ces?: { band?: string; current?: number };
};

type CoverageGapItem = {
  id: string;
  gapType: string;
  entityId: string;
  recommendedRemediation: string;
  severity: string;
  ageDays: number;
};

type Props = {
  setSelectedGSRId?: (gsrId: string, cycleId: string) => void;
  setActiveScreen?: (screen: string) => void;
};

/** v6 gaps lens — thin GSR surfacing plus coverageGaps register with precedent badges. */
export function CoverageGapPanelV6({ setSelectedGSRId, setActiveScreen }: Props) {
  const all = (groupSetRequirements || []) as GsrItem[];
  const total = all.length;

  const thin = useMemo(() => {
    return all.filter((g: GsrItem) => {
      if (g.thinCoverageFlag) return true;
      const cIds = g.controlIds || [];
      if (cIds.length !== 1) return false;
      const c = (controls || []).find((cc: ControlItem) => cc.id === cIds[0]);
      return c && (c.ces?.band === "amber" || c.ces?.band === "red");
    });
  }, [all]);

  const drill = (g: GsrItem) => {
    const co = (controlObjectives || []).find((c: { id: string; riskAreaId?: string }) => c.id === g.controlObjectiveId);
    const area = co ? (riskAreas || []).find((a: { id: string }) => a.id === co.riskAreaId) : null;
    const cycle = area ? (crsaAttestationCycles || []).find((c: { riskAreaId?: string; id: string }) => c.riskAreaId === area.id) : null;
    if (cycle) {
      setSelectedGSRId?.(g.id, cycle.id);
      setActiveScreen?.("perRequirementAttestation");
    }
  };

  const gaps = (coverageGaps || []) as CoverageGapItem[];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50/40 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-amber-800">{thin.length}</span>
          <span className="text-sm text-amber-900">
            of {total} requirements covered by a single weak control or thin-coverage flag
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-amber-900">
          Coverage-gap surfacing is the regulator-credible analysis — the AML.01.13.01 / AML-C006
          thin-coverage anchor against the UK CRSA requirement universe.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Coverage gap register</h3>
          <p className="text-[11px] text-slate-500">
            Firm severity and enforcement precedent shown side by side — never silently rewritten.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {gaps.length === 0 ? (
            <p className="p-4 text-[11px] italic text-slate-400">No coverage gaps in register.</p>
          ) : (
            gaps.map((g: CoverageGapItem) => {
              const precedent = resolveGapPrecedent(g);
              return (
                <div key={g.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {g.gapType.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{g.entityId}</div>
                      <div className="mt-1 line-clamp-2 text-[10px] text-slate-600">{g.recommendedRemediation}</div>
                    </div>
                    <span className="text-[10px] text-slate-500">{g.ageDays}d</span>
                  </div>
                  {precedent ? (
                    <PrecedentGapBadge firmSeverity={g.severity} precedent={precedent} />
                  ) : (
                    <div className="mt-2 text-[10px] text-slate-400">severity: {g.severity} · no precedent match</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Thin-coverage requirements</h3>
          <p className="text-[11px] text-slate-500">
            Click a row to open the Per-Requirement Attestation view.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {thin.length === 0 ? (
            <p className="p-4 text-[11px] italic text-slate-400">No coverage gaps surfaced.</p>
          ) : (
            thin.map((g: GsrItem) => {
              const cIds = g.controlIds || [];
              const c = cIds.length ? (controls || []).find((cc: ControlItem) => cc.id === cIds[0]) : null;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => drill(g)}
                  className="grid w-full grid-cols-12 items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="col-span-2">
                    <RACMRefBadge racmRef={g.racmRef} size="xs" />
                  </div>
                  <div className="col-span-6 line-clamp-2 text-xs leading-snug text-slate-800">
                    {g.requirementText}
                  </div>
                  <div className="col-span-2 text-center">
                    {c ? (
                      <div className="text-[10px]">
                        <div className="font-semibold text-slate-900">{c.id}</div>
                        <div className="text-slate-500">
                          CES {c.ces?.current ?? "—"} {c.ces?.band ? `· ${c.ces.band}` : ""}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500">no controls mapped</div>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {g.thinCoverageFlag ? "THIN" : "SINGLE-WEAK"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
