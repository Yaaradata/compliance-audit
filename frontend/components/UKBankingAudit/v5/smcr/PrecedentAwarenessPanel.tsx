"use client";

import { useMemo, useState } from "react";
import { formatConsequence } from "@/lib/ukbankingaudit/v5/precedentCorpus";
import type { Precedent } from "@/lib/ukbankingaudit/v5/types";
import {
  precedentsSinceAttestation,
  unacknowledgedPrecedentRows,
  type PrecedentAwarenessRow,
  type SmcrTrailEvent,
} from "@/lib/ukbankingaudit/v5/smcrPrecedentAwareness";
import { ClaimLine, ClaimLegend } from "@/components/UKBankingAudit/v5/ClaimLine";
import { useBoardRole } from "@/components/UKBankingAudit/v5/boardRoleContext";
import { canDisposition } from "@/lib/ukbankingaudit/v5/dispositions";

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

type SmfShape = {
  id: string;
  smfFunction: string;
  lastAttestationDate: string;
  accountableControlIds: string[];
};

type Props = {
  smf: SmfShape;
  trail: SmcrTrailEvent[];
  onAcknowledge: (precedentId: string, rationale: string) => void;
  onOpenEvidence?: (ref: string) => void;
};

export function PrecedentAwarenessPanel({ smf, trail, onAcknowledge, onOpenEvidence }: Props) {
  const role = useBoardRole();
  const mayAct = canDisposition(role);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");

  const allRows = useMemo(
    () =>
      precedentsSinceAttestation({
        smfId: smf.id,
        smfFunction: smf.smfFunction,
        lastAttestationDate: smf.lastAttestationDate,
        accountableControlIds: smf.accountableControlIds,
      }),
    [smf],
  );

  const unacked = useMemo(() => unacknowledgedPrecedentRows(allRows, trail), [allRows, trail]);

  const headline =
    unacked.length === 0
      ? null
      : `${unacked.length} Final Notice${unacked.length === 1 ? "" : "s"} published since your last attestation describe mechanisms mapped to controls you own. You have acknowledged none.`;

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
            Regulatory awareness · personal liability
          </div>
          <h3 className="mt-0.5 text-sm font-semibold text-slate-900">Final Notices since last attestation</h3>
        </div>
        <ClaimLegend />
      </div>

      {unacked.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-6 text-center">
          <p className="text-sm font-medium text-emerald-900">No notices published since your last attestation.</p>
          <p className="mt-1 text-xs text-emerald-800">
            The population is closed and countable — this is a genuine all-clear for the period.
          </p>
          <ClaimLine derivation="RULE" evidenceRef="PREC-CORPUS-CLOSED" onOpenEvidence={onOpenEvidence}>
            {allRows.length === 0
              ? "Zero UK Final Notices in corpus with noticeDate after attestation cutoff map to your accountability boundary."
              : `${allRows.length} notice(s) in scope are already acknowledged on your reasonable-steps trail.`}
          </ClaimLine>
        </div>
      ) : (
        <>
          <ClaimLine derivation="RULE" evidenceRef="PREC-AWARENESS-POP" onOpenEvidence={onOpenEvidence}>
            {headline}
          </ClaimLine>

          <ul className="mt-4 divide-y divide-indigo-100 rounded-lg border border-indigo-100 bg-white">
            {unacked.map((row) => (
              <AwarenessRow
                key={row.precedent.id}
                row={row}
                mayAct={mayAct}
                isExpanded={pendingId === row.precedent.id}
                rationale={rationale}
                onToggle={() => {
                  setPendingId((cur) => (cur === row.precedent.id ? null : row.precedent.id));
                  setRationale("");
                }}
                onRationaleChange={setRationale}
                onSubmit={() => {
                  const trimmed = rationale.trim();
                  if (!trimmed) return;
                  onAcknowledge(row.precedent.id, trimmed);
                  setPendingId(null);
                  setRationale("");
                }}
                onOpenEvidence={onOpenEvidence}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function AwarenessRow({
  row,
  mayAct,
  isExpanded,
  rationale,
  onToggle,
  onRationaleChange,
  onSubmit,
  onOpenEvidence,
}: {
  row: PrecedentAwarenessRow;
  mayAct: boolean;
  isExpanded: boolean;
  rationale: string;
  onToggle: () => void;
  onRationaleChange: (v: string) => void;
  onSubmit: () => void;
  onOpenEvidence?: (ref: string) => void;
}) {
  const { precedent, matchedRef, matchedRefKind, evidenceRef } = row;
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-800">{precedent.regulator}</span>
        <span className="text-slate-300">·</span>
        <span>{precedent.noticeDate}</span>
        <span className="text-slate-300">·</span>
        <span>{precedent.respondent}</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium text-slate-700">{formatConsequence(precedent)}</span>
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${POSTURE_STYLE[precedent.admissionPosture]}`}
        >
          {precedent.admissionPosture}
        </span>
        <span className="font-mono text-[10px] text-indigo-700">
          {matchedRefKind === "crsa" ? "CRSA" : "CTRL"} {matchedRef}
        </span>
      </div>

      <ClaimLine derivation="LLM" evidenceRef={evidenceRef} onOpenEvidence={onOpenEvidence}>
        {precedent.mechanism}
      </ClaimLine>

      {mayAct ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            {isExpanded ? "Cancel" : "Acknowledge with rationale"}
          </button>
          {isExpanded ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={rationale}
                onChange={(e) => onRationaleChange(e.target.value)}
                placeholder="What you knew, when you knew it, and what reasonable steps you took or will take…"
                className="w-full rounded border border-slate-200 p-2 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!rationale.trim()}
                  className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Lodge awareness entry
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
