"use client";

import { useMemo } from "react";
import { ClaimLine } from "@/components/UKBankingAudit/v5/ClaimLine";
import {
  buildFrozenStatePack,
  signedLinesWithoutPack,
  type AttestationLineShape,
  type GsrShape,
} from "@/lib/ukbankingaudit/v5/crsaAttestation";

type CycleShape = {
  id: string;
  completionPct?: number;
  exceptionsCount?: number;
  ownerSMFId?: string;
};

type Props = {
  cycle: CycleShape;
  lines: AttestationLineShape[];
  gsrById: Record<string, GsrShape>;
  onOpenEvidence?: (ref: string) => void;
};

/**
 * CONSTRUCTION — builds the frozen state pack that should have accompanied a signature.
 * Not detection: proof the signatory saw the state at the moment of signing.
 *
 * COMPLIANCE FLAG: this creates a personal record for a named Senior Manager. The adoption
 * cost is real and it is not technical. Surface it in the demo rather than discovering it
 * in a pilot.
 */
export function AttestationWithoutPack({ cycle, lines, gsrById, onOpenEvidence }: Props) {
  const unsignedPackRecords = useMemo(
    () => signedLinesWithoutPack(lines, gsrById),
    [lines, gsrById],
  );

  const packs = useMemo(() => {
    return unsignedPackRecords.map((record) => {
      const line = lines.find((l) => l.id === record.lineId);
      return line ? buildFrozenStatePack(record, line) : null;
    }).filter(Boolean);
  }, [unsignedPackRecords, lines]);

  if (!packs.length) return null;

  return (
    <section className="rounded-xl border-2 border-indigo-300 bg-indigo-50/40 p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
        Attestation without frozen pack
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
        {packs.length} line{packs.length === 1 ? "" : "s"} signed with no state snapshot attached.
        Reconstructed pack — the seven numbers that were true at signing:
      </p>

      {packs.map((pack) => (
        <div key={pack!.lineId} className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
            <span className="font-mono font-semibold">{pack!.racmRef}</span>
            <span className="text-slate-300">·</span>
            <span>{pack!.signedBy}</span>
            <span className="text-slate-300">·</span>
            <span>{new Date(pack!.signedAt).toLocaleString("en-GB")}</span>
          </div>

          <ClaimLine derivation="RULE" evidenceRef={`PACK-${pack!.lineId}`} onOpenEvidence={onOpenEvidence}>
            Cycle {cycle.id}: completion {pack!.numbers.cycleCompletionPct}%, exceptions{" "}
            {pack!.numbers.cycleExceptions}, line evidence {pack!.numbers.lineEvidencePct}%, backlog{" "}
            {pack!.numbers.alertOpenBacklog.toLocaleString("en-GB")}, population n=
            {pack!.numbers.populationSize.toLocaleString("en-GB")}
            {pack!.numbers.coveredCount != null
              ? `, covered ${pack!.numbers.coveredCount.toLocaleString("en-GB")}`
              : ""}
            , capacity gap +{pack!.numbers.capacityDemandGap}/wk.
          </ClaimLine>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {(
              [
                ["Completion", `${pack!.numbers.cycleCompletionPct}%`],
                ["Exceptions", String(pack!.numbers.cycleExceptions)],
                ["Line evidence", `${pack!.numbers.lineEvidencePct}%`],
                ["Backlog", pack!.numbers.alertOpenBacklog.toLocaleString("en-GB")],
                ["Population", pack!.numbers.populationSize.toLocaleString("en-GB")],
                ["Covered", pack!.numbers.coveredCount?.toLocaleString("en-GB") ?? "—"],
                ["Capacity gap", `+${pack!.numbers.capacityDemandGap}`],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded border border-slate-100 bg-slate-50 px-2 py-1.5 text-center">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
                <div className="text-sm font-bold text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="mt-3 text-[10px] italic text-indigo-800">
        Personal accountability record — named SM signature without frozen pack. Adoption cost is
        organisational, not technical.
      </p>
    </section>
  );
}
