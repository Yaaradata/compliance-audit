"use client";

import { useMemo, useState } from "react";
import { formatGbp } from "@/lib/ukbankingaudit/v6/precedentCorpus";
import { CRSA_DATA, RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import type { CrsaControl, Precedent, RagStatus } from "@/lib/ukbankingaudit/v6/types";
import {
  attestationCutoffForSmf,
  precedentsSinceAttestation,
  unacknowledgedPrecedentRows,
  type PrecedentAwarenessRow,
  type SmcrTrailEvent,
} from "@/lib/ukbankingaudit/v6/smcrPrecedentAwareness";
import { ClaimLine, ClaimLegend } from "@/components/UKBankingAudit/v6/ClaimLine";
import { useBoardRole } from "@/components/UKBankingAudit/v6/boardRoleContext";
import { canDisposition } from "@/lib/ukbankingaudit/v6/dispositions";

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

const STATUS_TEXT: Record<RagStatus, string> = {
  RED: "text-red-600",
  AMBER: "text-amber-600",
  GREEN: "text-emerald-600",
};

/** "2025-12-11" -> "11 Dec 2025". Falls back to the raw ISO string on a bad date. */
function formatUkDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Collapsed-row consequence: settled figure only, or the non-monetary consequence — never a blank row. */
function collapsedConsequence(p: Precedent): string {
  if (p.penalty != null) return formatGbp(p.penalty);
  if (p.nonMonetaryConsequence != null) return p.nonMonetaryConsequence;
  return "No financial penalty";
}

/** The pre-discount figure, expanded-row only, or null when there is none to show. */
function preDiscountNote(p: Precedent): string | null {
  if (
    p.penalty != null &&
    p.penaltyPreDiscount != null &&
    p.penaltyPreDiscount !== p.penalty &&
    p.admissionPosture === "settled-no-admission"
  ) {
    return `(from ${formatGbp(p.penaltyPreDiscount)})`;
  }
  return null;
}

function findCrsaControl(ref: string): CrsaControl | undefined {
  for (const controls of Object.values(CRSA_DATA)) {
    const hit = controls.find((c) => c.ref === ref);
    if (hit) return hit;
  }
  return undefined;
}

/** What the matched ref means to an SMF: its plain-English objective and its current RAG status. */
function refContext(ref: string, kind: "crsa" | "control"): { objective: string; status: RagStatus } {
  if (kind === "crsa") {
    const control = findCrsaControl(ref);
    if (control) return { objective: control.objective, status: control.status };
  }
  const domain = RISK_DOMAINS_V4.find((d) => d.id === ref);
  if (domain) return { objective: domain.name, status: domain.status };
  return { objective: "control owned", status: "AMBER" };
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
  const ackedCount = allRows.length - unacked.length;
  const cutoff = attestationCutoffForSmf(smf.id, smf.lastAttestationDate);

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Enforcement read-across</h3>
          <p className="mt-0.5 text-[11px] text-slate-600">
            Published since you attested on {formatUkDate(cutoff)} · touching controls you own.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {unacked.length > 0 ? (
            <span className="rounded border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
              {unacked.length} outstanding · {ackedCount === 0 ? "none recorded" : `${ackedCount} recorded`}
            </span>
          ) : null}
          <ClaimLegend />
        </div>
      </div>

      {unacked.length > 0 ? (
        <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2">
          <ClaimLine derivation="RULE" evidenceRef="PREC-AWARENESS-POP" onOpenEvidence={onOpenEvidence}>
            Population filter: noticeDate after your attestation cutoff, then mechanism ∩ your mapped
            domains. No model ranks the list.
          </ClaimLine>
        </div>
      ) : null}

      {unacked.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-6 text-center">
          <p className="text-sm font-medium text-emerald-900">Nothing published since you attested.</p>
          <p className="mt-1 text-xs text-emerald-800">
            The population is closed and countable — this is a genuine all-clear for the period.
          </p>
          <ClaimLine derivation="RULE" evidenceRef="PREC-CORPUS-CLOSED" onOpenEvidence={onOpenEvidence}>
            {allRows.length === 0
              ? "Zero UK Final Notices in corpus with noticeDate after attestation cutoff map to your accountability boundary."
              : `${allRows.length} notice(s) in scope are already recorded on your reasonable-steps trail.`}
          </ClaimLine>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-indigo-100 rounded-lg border border-indigo-100 bg-white">
          {unacked.map((row) => (
            <AwarenessRow
              key={row.precedent.id}
              row={row}
              mayAct={mayAct}
              isRecording={pendingId === row.precedent.id}
              isExpanded={expandedId === row.precedent.id}
              rationale={rationale}
              onToggleRecord={() => {
                setPendingId((cur) => (cur === row.precedent.id ? null : row.precedent.id));
                setRationale("");
              }}
              onToggleExpand={() =>
                setExpandedId((cur) => (cur === row.precedent.id ? null : row.precedent.id))
              }
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
      )}
    </section>
  );
}

function AwarenessRow({
  row,
  mayAct,
  isRecording,
  isExpanded,
  rationale,
  onToggleRecord,
  onToggleExpand,
  onRationaleChange,
  onSubmit,
  onOpenEvidence,
}: {
  row: PrecedentAwarenessRow;
  mayAct: boolean;
  isRecording: boolean;
  isExpanded: boolean;
  rationale: string;
  onToggleRecord: () => void;
  onToggleExpand: () => void;
  onRationaleChange: (v: string) => void;
  onSubmit: () => void;
  onOpenEvidence?: (ref: string) => void;
}) {
  const { precedent, matchedRef, evidenceRef } = row;
  const { objective, status } = refContext(matchedRef, row.matchedRefKind);
  const preDiscount = preDiscountNote(precedent);

  return (
    <li className="px-4 py-3">
      {/* line 1 — regulator · date · respondent, right-aligned penalty, posture chip */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-800">{precedent.regulator}</span>
        <span className="text-slate-300">·</span>
        <span title={precedent.noticeDate}>{formatUkDate(precedent.noticeDate)}</span>
        <span className="text-slate-300">·</span>
        <span>{precedent.respondent}</span>
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${POSTURE_STYLE[precedent.admissionPosture]}`}
        >
          {precedent.admissionPosture}
        </span>
        <span className="ml-auto shrink-0 font-semibold text-slate-800">{collapsedConsequence(precedent)}</span>
      </div>

      {/* line 2 — the hook, one clause, LLM-derived */}
      <ClaimLine derivation="LLM" evidenceRef={evidenceRef} onOpenEvidence={onOpenEvidence}>
        {precedent.hook}
      </ClaimLine>

      {/* line 3 — why it's on this SMF's list, deterministic, plus the actions */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="min-w-0 flex-1">
          <ClaimLine derivation="RULE" evidenceRef={matchedRef} onOpenEvidence={onOpenEvidence}>
            <>
              → your <span className="font-semibold text-slate-800">{matchedRef}</span> · {objective} ·{" "}
              <span className={`font-bold ${STATUS_TEXT[status]}`}>{status}</span>
            </>
          </ClaimLine>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {mayAct ? (
            <button
              type="button"
              onClick={onToggleRecord}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {isRecording ? "Cancel" : "Record read-across"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse detail" : "Expand detail"}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          >
            {isExpanded ? "︿" : "⌄"}
          </button>
        </div>
      </div>

      {isRecording ? (
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

      {isExpanded ? (
        <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-[12px] leading-relaxed text-slate-700">
          <p>{precedent.mechanism}</p>
          {preDiscount ? <p className="text-slate-500">Pre-discount figure {preDiscount}</p> : null}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
            <span className="font-mono">{evidenceRef}</span>
            {precedent.sourceUrl ? (
              <a
                href={precedent.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-800"
              >
                Source notice ↗
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
