"use client";

import { useMemo } from "react";
import {
  groupSetRequirements,
  crsaAttestationLines,
} from "@/components/UKBankingAudit/ukTraceRuntime";
import { RACMRefBadge, StatusBadge } from "@/components/UKBankingAudit/v5/screens/_shared";
import {
  hasCompletenessClaim,
  lineAgeingForCycle,
  resolveLineAgeing,
  type GsrShape,
} from "@/lib/ukbankingaudit/v5/crsaAttestation";
import { AttestationDenominatorStrip } from "./AttestationDenominatorStrip";
import { LineAgeing } from "./LineAgeing";

type CycleShape = { id: string };

type Props = {
  cycle: CycleShape;
  onDrillLine?: (gsrId: string) => void;
  onOpenEvidence?: (ref: string) => void;
};

export function AttestationLinesTableV5({ cycle, onDrillLine, onOpenEvidence }: Props) {
  const gsrById = useMemo(() => {
    const m: Record<string, GsrShape> = {};
    for (const g of groupSetRequirements || []) {
      m[g.id] = { id: g.id, racmRef: g.racmRef, requirementText: g.requirementText };
    }
    return m;
  }, []);

  const rows = useMemo(() => {
    const lines = (crsaAttestationLines || []).filter((l) => l.cycleId === cycle.id);
    const ageingRank = new Map(
      lineAgeingForCycle(lines, gsrById).map((a, i) => [a.lineId, i]),
    );

    return lines
      .map((line) => {
        const gsr = gsrById[line.groupSetRequirementId];
        const ageing = resolveLineAgeing(line, gsr);
        const showDenominator = hasCompletenessClaim(line, gsr);
        return { line, gsr, ageing, showDenominator, ageingRank: ageingRank.get(line.id) };
      })
      .sort((a, b) => {
        const ar = a.ageingRank ?? 999;
        const br = b.ageingRank ?? 999;
        if (ar !== br) return ar - br;
        return (a.gsr?.racmRef ?? "").localeCompare(b.gsr?.racmRef ?? "");
      });
  }, [cycle.id, gsrById]);

  if (!rows.length) {
    return <p className="text-[11px] italic text-slate-400">No attestation lines for this cycle.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Attestation lines</h3>
        <p className="text-[11px] text-slate-500">
          Assertion denominator on completeness claims · line ageing sorted by duration descending
        </p>
      </div>

      <div className="hidden border-b border-slate-100 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:grid md:grid-cols-12 md:gap-3">
        <div className="col-span-2">RACM</div>
        <div className="col-span-6">Requirement</div>
        <div className="col-span-2 text-center">Evidence</div>
        <div className="col-span-2 text-right">Ageing</div>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.map(({ line, gsr, ageing, showDenominator }) => (
          <div key={line.id} className="px-5 py-3">
            <button
              type="button"
              onClick={() => gsr && onDrillLine?.(gsr.id)}
              className="grid w-full grid-cols-1 gap-2 text-left transition hover:opacity-90 md:grid-cols-12 md:items-start md:gap-3"
            >
              <div className="col-span-2">
                {gsr ? <RACMRefBadge racmRef={gsr.racmRef} size="xs" /> : "—"}
              </div>
              <div className="col-span-6 text-xs leading-snug text-slate-800">
                {gsr?.requirementText ?? "—"}
              </div>
              <div className="col-span-2 flex justify-center">
                <StatusBadge
                  tone={line.evidenceCompletenessBand}
                  label={`${line.evidenceCompletenessPct ?? "—"}%`}
                  size="xs"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <LineAgeing record={ageing} compact />
              </div>
            </button>

            {ageing?.fires ? (
              <div className="mt-2 md:ml-[16.666%]">
                <LineAgeing record={ageing} />
              </div>
            ) : null}

            {showDenominator && gsr ? (
              <div className="mt-2 md:ml-[16.666%]">
                <AttestationDenominatorStrip line={line} gsr={gsr} onOpenEvidence={onOpenEvidence} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
