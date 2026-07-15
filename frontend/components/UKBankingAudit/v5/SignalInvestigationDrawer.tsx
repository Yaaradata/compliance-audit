"use client";

import { useMemo, useState } from "react";
import { signalFooter } from "@/lib/ukbankingaudit/v5/copy";
import { DOMAIN_EVIDENCE, getAccountability } from "@/lib/ukbankingaudit/v5/riskDomainsV5";
import {
  canDisposition,
  recordDisposition,
  type AuditEntry,
  type DispositionKind,
} from "@/lib/ukbankingaudit/v5/dispositions";
import type { BoardSignal, Precedent } from "@/lib/ukbankingaudit/v5/types";
import { useBoardRole } from "./boardRoleContext";
import { ClaimLine, ClaimLegend } from "./ClaimLine";
import { useJurisdiction } from "./jurisdictionContext";
import { PrecedentBanner } from "./PrecedentBanner";

type Props = {
  signal: BoardSignal;
  precedent?: Precedent;
  auditEntries: AuditEntry[];
  initialAction?: DispositionKind | null;
  onRecord: (entry: AuditEntry) => void;
  onClose: () => void;
};

const ACTIONS: { kind: DispositionKind; label: string }[] = [
  { kind: "accept", label: "Accept" },
  { kind: "reject", label: "Reject" },
  { kind: "escalate", label: "Escalate" },
  { kind: "override", label: "Override" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{children}</h4>
  );
}

export function SignalInvestigationDrawer({
  signal,
  precedent,
  auditEntries,
  initialAction = null,
  onRecord,
  onClose,
}: Props) {
  const role = useBoardRole();
  const jurisdiction = useJurisdiction();
  const canAct = canDisposition(role);

  const [action, setAction] = useState<DispositionKind | null>(initialAction);
  const [actorId, setActorId] = useState("");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const artefacts = useMemo(
    () => DOMAIN_EVIDENCE.filter((e) => e.domainId === signal.domainId && e.artefactId !== null),
    [signal.domainId],
  );

  const submit = () => {
    if (!action) return;
    const result = recordDisposition({
      role,
      actorId,
      kind: action,
      signalId: signal.id,
      reason,
      expiry: expiry || undefined,
      target: target || undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onRecord(result.entry);
    setError(null);
    setReason("");
    setExpiry("");
    setTarget("");
    setAction(null);
  };

  const acc = getAccountability(signal.domainId, jurisdiction);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close investigation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
      />
      <aside className="relative flex h-full w-[560px] max-w-[92vw] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Signal investigation
          </span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          {/* a · soWhat at 17px */}
          <p className="text-[17px] font-semibold leading-snug text-slate-900">{signal.soWhat}</p>

          {/* b · Expected vs Observed — two literal columns, equal width */}
          <div>
            <SectionHeading>Expected vs Observed</SectionHeading>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Expected</div>
                <p className="text-[12px] leading-snug text-slate-700">{signal.expected}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Observed</div>
                <p className="text-[12px] leading-snug text-slate-700">{signal.observed}</p>
              </div>
            </div>
          </div>

          {/* c · Trigger logic + raw rule */}
          <div>
            <SectionHeading>Trigger logic</SectionHeading>
            <p className="text-[12px] leading-snug text-slate-700">{signal.trigger}</p>
            <details className="mt-1.5">
              <summary className="cursor-pointer text-[11px] text-indigo-600">raw rule</summary>
              <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-2 font-mono text-[10px] leading-relaxed text-slate-100">
                {signal.detectionVersion}
                {"\n"}
                {signal.trigger}
              </pre>
            </details>
          </div>

          {/* d · Evidence chain */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <SectionHeading>Evidence chain</SectionHeading>
              <ClaimLegend />
            </div>
            {signal.claims && signal.claims.length > 0 ? (
              signal.claims.map((c) => (
                <ClaimLine key={`${c.derivation}:${c.evidenceRef}`} derivation={c.derivation} evidenceRef={c.evidenceRef}>
                  {c.text}
                </ClaimLine>
              ))
            ) : signal.evidenceRefs.length > 0 ? (
              signal.evidenceRefs.map((ref) => (
                <ClaimLine key={ref} derivation={signal.derivation} evidenceRef={ref}>
                  Evidence reference
                </ClaimLine>
              ))
            ) : (
              <p className="text-[11.5px] italic text-slate-400">
                No evidence artefact on record — see missing evidence below.
              </p>
            )}
            {artefacts.length > 0 ? (
              <div className="mt-2 flex flex-col gap-1">
                {artefacts.map((a) => (
                  <div key={a.artefactId} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500">
                    {a.artefactId} · {a.sourceSystem ?? "—"} · {a.artefactTs ?? "—"} · {a.sha256 ?? "—"}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* e · Missing evidence — its own heading, ring-2, never greyed, never collapsed */}
          <div className="rounded-lg border border-slate-200 p-3 ring-2 ring-amber-400/70">
            <SectionHeading>Missing evidence</SectionHeading>
            {signal.missingEvidence.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-[12px] text-slate-800">
                {signal.missingEvidence.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-slate-700">None outstanding — evidence is complete for this signal.</p>
            )}
          </div>

          {/* f · Accountability */}
          <div>
            <SectionHeading>Accountability</SectionHeading>
            {"unowned" in acc ? (
              <p className="text-[12px] font-semibold text-slate-500">
                UNOWNED — no accountable individual is mapped to this domain.
              </p>
            ) : acc.regime === "UK" ? (
              <p className="text-[12px] text-slate-700">
                <span className="font-semibold text-violet-700">{acc.smf} · {acc.holder}</span>
                <br />
                <span className="text-slate-500">{acc.prescribedResponsibility}</span>
              </p>
            ) : (
              <p className="text-[12px] text-slate-700">
                <span className="font-semibold text-sky-700">Owner · {acc.owner}</span>
                {acc.mraRef ? <span className="text-slate-500"> · {acc.mraRef}</span> : null}
              </p>
            )}
          </div>

          {/* g · Matched precedent */}
          {precedent ? (
            <div>
              <SectionHeading>Matched precedent</SectionHeading>
              <PrecedentBanner precedent={precedent} />
            </div>
          ) : null}

          {/* h · Confidence + alternative TESTED AND RULED OUT */}
          <div>
            <SectionHeading>Confidence</SectionHeading>
            <p className="text-[12px] text-slate-700">
              <span className="font-semibold uppercase text-slate-800">{signal.confidence.level}</span>
              {" — "}
              {signal.confidence.basis}
            </p>
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
                  Tested and ruled out
                </span>
              </div>
              <p className="text-[12px] leading-snug text-slate-600">{signal.alternativeExplanation}</p>
            </div>
          </div>

          {/* i · Actions — disable, never hide. No action without a named actor. */}
          <div>
            <SectionHeading>Disposition</SectionHeading>
            {!canAct ? (
              <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11.5px] font-medium text-amber-800">
                Internal Audit is read-only. Third line assures controls it does not operate.
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.kind}
                  type="button"
                  disabled={!canAct}
                  onClick={() => {
                    setAction(a.kind);
                    setError(null);
                  }}
                  className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${
                    !canAct
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                      : action === a.kind
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {canAct && action ? (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label className="text-[11px] font-semibold text-slate-600">
                  Actor ID (required — named human, never a system actor)
                  <input
                    value={actorId}
                    onChange={(e) => setActorId(e.target.value)}
                    placeholder="Named individual"
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
                  />
                </label>
                {action !== "escalate" ? (
                  <label className="text-[11px] font-semibold text-slate-600">
                    Reason (required)
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
                    />
                  </label>
                ) : null}
                {action === "accept" ? (
                  <label className="text-[11px] font-semibold text-slate-600">
                    Expiry (required)
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
                    />
                  </label>
                ) : null}
                {action === "escalate" ? (
                  <label className="text-[11px] font-semibold text-slate-600">
                    Escalate to (required)
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="Committee or individual"
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-[12px]"
                    />
                  </label>
                ) : null}
                {error ? <p className="text-[11px] font-medium text-red-600">{error}</p> : null}
                <button
                  type="button"
                  onClick={submit}
                  className="self-start rounded-lg bg-indigo-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700"
                >
                  Record {action}
                </button>
              </div>
            ) : null}
          </div>

          {/* j · Audit history — append-only */}
          <div>
            <SectionHeading>Audit history</SectionHeading>
            {auditEntries.length === 0 ? (
              <p className="text-[11.5px] italic text-slate-400">No disposition recorded against this signal.</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {auditEntries.map((e) => (
                  <li key={e.id} className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600">
                    <span className="font-semibold uppercase text-slate-800">{e.kind}</span> · {e.actorId} · {e.ts}
                    {e.expiry ? <> · expiry {e.expiry}</> : null}
                    {e.target ? <> · to {e.target}</> : null}
                    <div className="text-slate-500">{e.reason}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Footer — on every drawer, generated from the Predicate enum */}
          <p className="border-t border-slate-200 pt-3 text-[10.5px] leading-relaxed text-slate-400">
            {signalFooter()}
          </p>
        </div>
      </aside>
    </div>
  );
}
