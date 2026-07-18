"use client";

import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import {
  MLRO_SCREENING_CLAIMS,
  starlingScreeningPrecedent,
  type ScreeningDenominatorClaim,
} from "@/lib/ukbankingaudit/v6/mlroSignals";

type Props = {
  claims?: ScreeningDenominatorClaim[];
  onOpenEvidence?: (ref: string) => void;
};

function CoverageBar({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function ClaimRow({
  claim,
  onOpenEvidence,
}: {
  claim: ScreeningDenominatorClaim;
  onOpenEvidence?: (ref: string) => void;
}) {
  const undefinedPopulation = !claim.populationDefined || !claim.populationLabel || !claim.listName;

  return (
    <div
      className={`rounded-lg border p-3 ${undefinedPopulation ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"}`}
    >
      <ClaimLine derivation="RULE" evidenceRef={`SCR-CLAIM-${claim.id.toUpperCase()}`} onOpenEvidence={onOpenEvidence}>
        {claim.claim}
        {claim.coveragePct != null ? ` (${claim.coveragePct}%)` : ""}
      </ClaimLine>

      <CoverageBar pct={claim.coveragePct} />

      <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
        <div>
          <span className="font-semibold text-slate-700">List:</span>{" "}
          {claim.listName ?? <span className="italic text-amber-700">not named in register</span>}
        </div>
        <div>
          <span className="font-semibold text-slate-700">Population:</span>{" "}
          {claim.populationLabel ?? (
            <span className="italic text-amber-700">no population definition on record</span>
          )}
        </div>
        <div>
          <span className="font-semibold text-slate-700">As at:</span> {claim.asOfDate}
        </div>
      </div>

      {undefinedPopulation ? (
        <p className="mt-2 text-[10px] font-medium text-amber-800">
          Coverage percentage asserted without a named list or population — that absence is the finding.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Names the denominator behind sanctions coverage claims.
 * Where no population definition exists, the absence is surfaced as the finding.
 */
export function ScreeningDenominator({ claims = MLRO_SCREENING_CLAIMS, onOpenEvidence }: Props) {
  const starling = starlingScreeningPrecedent();
  const hasGap = claims.some((c) => !c.populationDefined || !c.listName || !c.populationLabel);

  return (
    <section className="mt-3 space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Screening denominator
      </div>

      {claims.map((c) => (
        <ClaimRow key={c.id} claim={c} onOpenEvidence={onOpenEvidence} />
      ))}

      {hasGap && starling ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Precedent</div>
          <ClaimLine derivation="RULE" evidenceRef="PREC-STARLING-2024" onOpenEvidence={onOpenEvidence}>
            {starling.respondent} — screening ran against a fraction of the Consolidated List from 2017
            and reported as functioning for six years. {formatConsequence(starling)}, settled-no-admission.
          </ClaimLine>
        </div>
      ) : null}
    </section>
  );
}
