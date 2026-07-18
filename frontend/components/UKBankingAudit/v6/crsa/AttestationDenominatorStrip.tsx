"use client";

import { ClaimLine } from "@/components/UKBankingAudit/v6/ClaimLine";
import { formatConsequence } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import {
  computeAssertionDenominator,
  extractCompletenessClaimTerms,
  nationwideAssertionPrecedent,
  lineAssertionText,
  type AttestationLineShape,
  type GsrShape,
} from "@/lib/ukbankingaudit/v6/crsaAttestation";

type Props = {
  line: AttestationLineShape;
  gsr?: GsrShape;
  onOpenEvidence?: (ref: string) => void;
};

function CoverageBar({ pct }: { pct: number }) {
  const tone = pct < 10 ? "bg-rose-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

/**
 * Assertion denominator strip — LLM claim extraction (hollow dot) + RULE arithmetic (solid dot).
 * Two dots on one strip; that distinction is the product's credibility.
 */
export function AttestationDenominatorStrip({ line, gsr, onOpenEvidence }: Props) {
  const result = computeAssertionDenominator(line, gsr);
  if (!result) return null;

  const precedent = nationwideAssertionPrecedent();
  const textTerms = extractCompletenessClaimTerms(lineAssertionText(line, gsr));
  const llmTerms = result.extractedTerms.length ? result.extractedTerms : textTerms;

  return (
    <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
        Assertion denominator
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-slate-800">{result.claimSentence}</p>
      <CoverageBar pct={result.coveragePct} />

      <div className="mt-2 space-y-0">
        <ClaimLine derivation="LLM" evidenceRef={`LLM-CLAIM-${result.racmRef}`} onOpenEvidence={onOpenEvidence}>
          Extracted claim terms: {llmTerms.join(", ") || "—"}
        </ClaimLine>
        <ClaimLine derivation="RULE" evidenceRef={`RULE-DENOM-${result.racmRef}`} onOpenEvidence={onOpenEvidence}>
          coveredCount / populationCount = {result.coveredCount.toLocaleString("en-GB")} /{" "}
          {result.populationCount.toLocaleString("en-GB")} = {result.coveragePct.toFixed(1)}%
        </ClaimLine>
      </div>

      {precedent && result.racmRef === "AML.01.05.02" ? (
        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
          Precedent · {precedent.respondent}: MLRO report recorded CDD as &quot;enhanced&quot;; uplift reached
          888,618 of ~18 million customers. High-risk relationships ~2,000; after remediation, 18,000+.{" "}
          {formatConsequence(precedent)}.
        </p>
      ) : null}
    </div>
  );
}
