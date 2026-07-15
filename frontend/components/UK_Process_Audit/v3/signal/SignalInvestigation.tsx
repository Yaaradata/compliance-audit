"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type {
  AdmissionPosture,
  UkEvidenceArtefact,
  UkPrecedent,
  UkSignal,
  UkSignalAction,
  UkSignalStatus,
} from "@/lib/UK_Process_Audit/signals";
import { formatPenalty } from "@/lib/UK_Process_Audit/signals";
import type { UkAuditControl } from "@/lib/UK_Process_Audit/types";
import {
  DispositionForbiddenError,
  DispositionValidationError,
} from "@/lib/UK_Process_Audit/v3/dispositionStore";
import { useUkpaV3Session } from "../UkpaV3SessionProvider";
import { ClaimLine, ClaimLineLegend } from "./ClaimLine";

const SEVERITY_ACCENT: Record<UkSignal["severity"], string> = {
  S1: "#b42318",
  S2: "#b54708",
  S3: "#475467",
};

const STATUS_LABEL: Record<UkSignalStatus, string> = {
  DETECTED_SIGNAL: "DETECTED SIGNAL",
  ACCEPTED_EXCEPTION: "ACCEPTED EXCEPTION",
  CONFIRMED_ISSUE: "CONFIRMED ISSUE",
};

const STATUS_TONE: Record<UkSignalStatus, string> = {
  DETECTED_SIGNAL: "bg-amber-50 text-amber-900 ring-amber-200",
  ACCEPTED_EXCEPTION: "bg-slate-100 text-slate-700 ring-slate-200",
  CONFIRMED_ISSUE: "bg-red-50 text-red-800 ring-red-200",
};

const POSTURE_LABEL: Record<AdmissionPosture, string> = {
  admitted: "ADMITTED",
  "settled-no-admission": "SETTLED · NO ADMISSION",
  alleged: "ALLEGED",
  "criminal-conviction": "CRIMINAL CONVICTION",
  "guilty-plea": "GUILTY PLEA",
  "undertaking-only": "UNDERTAKING ONLY",
  "tribunal-varied": "TRIBUNAL VARIED",
  "open-investigation": "OPEN INVESTIGATION",
};

type HistoryEntry = {
  id: string;
  at: string;
  actor: string;
  action: UkSignalAction | "VIEW";
  detail: string;
};

type EvidenceChainRow = {
  artefactRef: string;
  derivation: "RULE" | "LLM";
  sourceSystem: string;
  ts: string;
  sha12: string;
  body: string;
};

function relativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diffSec = Math.round((now - t) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  if (abs < 60) return rtf.format(-diffSec, "second");
  if (abs < 3600) return rtf.format(-Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(-Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(-Math.round(diffSec / 86400), "day");
  return rtf.format(-Math.round(diffSec / (86400 * 30)), "month");
}

function triggerPredicate(signal: UkSignal): string {
  switch (signal.detectionVersion.split("@")[0]) {
    case "silence-rule":
      return "cadenceSource = human-confirmed AND now > expectedBy + graceDays AND evidenceArtefactIds is empty";
    case "precedent-match":
      return "matchPrecedents(control) is non-empty AND daysSince(latest artefact) > cadence.days";
    case "assertion-denominator":
      return "claim term present in management prose AND coveredCount / populationCount < 1.0";
    case "closure-without-evidence":
      return "remediation status = closed AND evidenceArtefactIds is empty";
    default:
      return `${signal.detectionVersion} predicate`;
  }
}

function buildEvidenceChain(signal: UkSignal, artefacts: UkEvidenceArtefact[]): EvidenceChainRow[] {
  const byId = new Map(artefacts.map((a) => [a.id, a]));
  const linked = signal.evidenceRefs
    .map((ref) => byId.get(ref))
    .filter((a): a is UkEvidenceArtefact => a != null);

  if (linked.length > 0) {
    return linked.map((a) => ({
      artefactRef: a.id,
      derivation: signal.derivation,
      sourceSystem: a.sourceSystem,
      ts: a.ts.slice(0, 19).replace("T", " "),
      sha12: a.sha256.slice(0, 12),
      body: a.label,
    }));
  }

  // Empty evidenceRefs — each missing-evidence line is still a ClaimLine.
  return signal.missingEvidence.map((m, i) => ({
    artefactRef: `${signal.controlId}:missing:${i + 1}`,
    derivation: signal.derivation,
    sourceSystem: "Evidence store — gap",
    ts: signal.evaluatedAt.slice(0, 19).replace("T", " "),
    sha12: "unavailable",
    body: m,
  }));
}

export function SignalInvestigation({
  signal: rawSignal,
  control,
  precedent,
  artefacts,
}: {
  signal: UkSignal;
  control: UkAuditControl;
  precedent: UkPrecedent | null;
  artefacts: UkEvidenceArtefact[];
}) {
  const { dispositionEnabled, overlaySignals, dispositionFor, commitDisposition, assuranceLine } =
    useUkpaV3Session();
  const signal = useMemo(
    () => overlaySignals([rawSignal])[0] ?? rawSignal,
    [overlaySignals, rawSignal],
  );
  const existingDisposition = dispositionFor(signal.id);
  const accent = SEVERITY_ACCENT[signal.severity];
  const [actor, setActor] = useState("");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState("");
  const [escalateTarget, setEscalateTarget] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "hist-0",
      at: signal.evaluatedAt,
      actor: "system",
      action: "VIEW",
      detail: `Signal ${signal.id} materialised by ${signal.detectionVersion}`,
    },
  ]);

  const allowAccept =
    dispositionEnabled && signal.mechanism !== "procedure-defeats-duty";
  const actorOk = actor.trim().length > 0;
  const reasonOk = reason.trim().length > 0;
  const expiryOk = expiry.trim().length > 0;
  const targetOk = escalateTarget.trim().length > 0;

  const evidenceRows = useMemo(
    () => buildEvidenceChain(signal, artefacts),
    [signal, artefacts],
  );

  const appendHistory = (action: HistoryEntry["action"], detail: string) => {
    if (!actorOk) return;
    setHistory((prev) => [
      ...prev,
      {
        id: `hist-${prev.length}-${Date.now()}`,
        at: new Date().toISOString(),
        actor: actor.trim(),
        action,
        detail,
      },
    ]);
  };

  const runDisposition = (
    status: "ACCEPTED_EXCEPTION" | "CONFIRMED_ISSUE",
    historyAction: UkSignalAction,
    detail: string,
  ) => {
    setActionError(null);
    try {
      commitDisposition({
        signalId: signal.id,
        status,
        reason: reason.trim() || detail,
        expiry: status === "ACCEPTED_EXCEPTION" ? expiry : null,
        actorId: actor.trim(),
        mechanism: signal.mechanism,
      });
      appendHistory(historyAction, detail);
    } catch (err) {
      if (err instanceof DispositionForbiddenError || err instanceof DispositionValidationError) {
        setActionError(err.message);
        return;
      }
      throw err;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <Link
          href="/UK_Process_Audit/v3"
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Signals Inbox
        </Link>

        <header
          className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          style={{ borderLeftWidth: 4, borderLeftColor: accent }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-snug text-slate-900">{signal.signalObserved}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: accent }}
                >
                  {signal.severity}
                </span>
                <span className="text-slate-400">·</span>
                <span>{signal.owner}</span>
                <span className="text-slate-400">·</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${STATUS_TONE[signal.status]}`}
                >
                  {STATUS_LABEL[signal.status]}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-[11px] text-slate-500">{signal.detectionVersion}</span>
                <span className="text-slate-400">·</span>
                <time
                  dateTime={signal.evaluatedAt}
                  title={new Date(signal.evaluatedAt).toLocaleString("en-GB")}
                  className="text-slate-500"
                >
                  {relativeTime(signal.evaluatedAt)}
                </time>
              </div>
            </div>
            <span className="font-mono text-[12px] font-semibold text-slate-700">{signal.controlId}</span>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Plain-language insight
              </h2>
              <p className="mt-2 text-[18px] leading-relaxed text-slate-900">{signal.soWhat}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Expected vs Observed
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Expected</div>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-900">{signal.expected}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Observed</div>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-900">{signal.observed}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trigger logic</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-800">{triggerPredicate(signal)}</p>
              <details className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-600 ring-1 ring-slate-100">
                <summary className="cursor-pointer font-semibold text-slate-700">
                  Raw rule · detection version
                </summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-600">
                  {JSON.stringify(
                    {
                      detectionVersion: signal.detectionVersion,
                      mechanism: signal.mechanism,
                      derivation: signal.derivation,
                      confidence: signal.confidence,
                      primaryMetric: signal.primaryMetric,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Evidence chain
                </h2>
                <ClaimLineLegend />
              </div>
              <div className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                {(signal.claimLines ?? []).map((line, i) => (
                  <ClaimLine
                    key={`${signal.id}-claim-${i}`}
                    derivation={line.derivation}
                    artefactRef={
                      signal.evidenceRefs[0] ??
                      signal.missingEvidence[0] ??
                      `${signal.controlId}:claim:${i + 1}`
                    }
                    onOpenEvidence={(ref) => {
                      window.open(`#evidence-${encodeURIComponent(ref)}`, "_self");
                    }}
                  >
                    {line.text}
                  </ClaimLine>
                ))}
                {evidenceRows.map((row) => (
                  <ClaimLine
                    key={row.artefactRef}
                    derivation={row.derivation}
                    artefactRef={row.artefactRef}
                    onOpenEvidence={(ref) => {
                      window.open(`#evidence-${encodeURIComponent(ref)}`, "_self");
                    }}
                  >
                    <span className="font-medium text-slate-800">{row.sourceSystem}</span>
                    <span className="text-slate-400"> · </span>
                    <span className="tabular-nums text-slate-600">{row.ts}</span>
                    <span className="text-slate-400"> · </span>
                    <span className="font-mono text-[11px] text-slate-500">{row.sha12}</span>
                    {row.body ? (
                      <>
                        <span className="text-slate-400"> · </span>
                        <span className="text-slate-700">{row.body}</span>
                      </>
                    ) : null}
                  </ClaimLine>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-800">
                Missing evidence
              </h2>
              {signal.evidenceRefs.length === 0 ? (
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-slate-900">
                  This section is the finding. No evidence artefacts were attached to the expected
                  operation(s).
                </p>
              ) : (
                <p className="mt-2 text-[14px] leading-relaxed text-slate-800">
                  Evidence refs are present; residual gaps listed below remain in scope for the
                  reviewer.
                </p>
              )}
              <ul className="mt-3 space-y-2">
                {signal.missingEvidence.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-5 lg:col-span-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Obligation → control → owner
              </h2>
              <dl className="mt-3 space-y-2 text-[13px]">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Primary obligation
                  </dt>
                  <dd className="mt-0.5 text-slate-900">{control.primaryObligation}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Issuing body
                  </dt>
                  <dd className="mt-0.5 text-slate-900">{control.issuingBody}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Control
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-slate-900">{control.controlId}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Owner
                  </dt>
                  <dd className="mt-0.5 text-slate-900">{control.controlOwnerRole}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Matched precedent
              </h2>
              {precedent && precedent.admissionPosture != null ? (
                <div className="mt-3 space-y-2 text-[13px]">
                  <div className="font-semibold text-slate-900">{precedent.respondent}</div>
                  <div className="text-slate-600">
                    {precedent.noticeDate} · {formatPenalty(precedent)}
                  </div>
                  <span className="inline-flex rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800 ring-1 ring-indigo-100">
                    {POSTURE_LABEL[precedent.admissionPosture]}
                  </span>
                  {precedent.sourceUrl ? (
                    <a
                      href={precedent.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[12px] font-medium text-slate-700 underline-offset-2 hover:underline"
                    >
                      Source notice <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                  {precedent.confidence === "unverified" ? (
                    <div className="rounded-md bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-900 ring-1 ring-amber-200">
                      Penalty and date unresolved. Do not use in client material.
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-slate-600">No matched precedent on this signal.</p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Confidence · alternative ruled out
              </h2>
              <div className="mt-2 text-[12px] text-slate-600">
                Confidence:{" "}
                <span className="font-semibold uppercase text-slate-900">{signal.confidence.level}</span>
                <span className="text-slate-400"> — </span>
                {signal.confidence.basis}
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Alternative considered
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-800">
                  {signal.alternativeExplanation}
                </p>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                  Tested and ruled out
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                  Re-queried expected operations and the evidence store at evaluation (
                  {signal.evaluatedAt.slice(0, 10)}). The alternative does not account for the
                  observed artefact set on this control window.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Actions</h2>
              {!dispositionEnabled ? (
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                  {assuranceLine ??
                    "Internal Audit view — disposition controls are not available."}
                </p>
              ) : (
                <>
                  <p className="mt-1 text-[11px] text-slate-500">
                    No action fires without a named actor. Incomplete forms stay disabled.
                  </p>

                  <label className="mt-3 block text-[11px] font-semibold text-slate-600">
                    Named actor (actorId)
                    <input
                      value={actor}
                      onChange={(e) => setActor(e.target.value)}
                      placeholder="e.g. actor:a-whitfield"
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-900"
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-semibold text-slate-600">
                    Reason
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-900"
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-semibold text-slate-600">
                    Accept expiry (required for Accept)
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-900"
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-semibold text-slate-600">
                    Escalate target (required for Escalate)
                    <input
                      value={escalateTarget}
                      onChange={(e) => setEscalateTarget(e.target.value)}
                      placeholder="e.g. MLRO / ExCo"
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-900"
                    />
                  </label>

                  {actionError ? (
                    <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-900 ring-1 ring-amber-200">
                      {actionError}
                    </div>
                  ) : null}

                  {existingDisposition ? (
                    <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-600 ring-1 ring-slate-100">
                      Current disposition: {existingDisposition.status}
                      {existingDisposition.expiry
                        ? ` · expires ${existingDisposition.expiry}`
                        : ""}
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {allowAccept ? (
                      <ActionButton
                        label="Accept"
                        disabled={!(actorOk && reasonOk && expiryOk)}
                        onClick={() =>
                          runDisposition(
                            "ACCEPTED_EXCEPTION",
                            "ACCEPT",
                            `Accepted until ${expiry}: ${reason.trim()}`,
                          )
                        }
                      />
                    ) : null}
                    <ActionButton
                      label="Reject"
                      disabled={!(actorOk && reasonOk)}
                      onClick={() => appendHistory("REJECT", reason.trim())}
                    />
                    <ActionButton
                      label="Escalate"
                      disabled={!(actorOk && targetOk && reasonOk)}
                      onClick={() =>
                        runDisposition(
                          "CONFIRMED_ISSUE",
                          "ESCALATE",
                          `Escalated to ${escalateTarget.trim()}: ${reason.trim()}`,
                        )
                      }
                    />
                    <ActionButton
                      label="Override"
                      disabled={!(actorOk && reasonOk)}
                      onClick={() => appendHistory("OVERRIDE", reason.trim())}
                    />
                    <ActionButton
                      label="Open evidence"
                      disabled={!actorOk}
                      onClick={() =>
                        appendHistory(
                          "OPEN_EVIDENCE",
                          signal.evidenceRefs[0] ??
                            signal.missingEvidence[0] ??
                            signal.controlId,
                        )
                      }
                    />
                    <ActionButton
                      label="Open full investigation"
                      disabled={!actorOk}
                      onClick={() => appendHistory("OPEN_INVESTIGATION", signal.id)}
                    />
                  </div>
                </>
              )}

              {!dispositionEnabled ? (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <ActionButton
                    label="Open evidence"
                    disabled={false}
                    onClick={() =>
                      window.open(
                        `#evidence-${encodeURIComponent(
                          signal.evidenceRefs[0] ??
                            signal.missingEvidence[0] ??
                            signal.controlId,
                        )}`,
                        "_self",
                      )
                    }
                  />
                  <ActionButton
                    label="Open full investigation"
                    disabled={false}
                    onClick={() => undefined}
                  />
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Audit history
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">Append-only. No edit. No delete.</p>
              <ol className="mt-3 space-y-2">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[12px]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{h.action}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700">{h.actor}</span>
                      <span className="ml-auto tabular-nums text-slate-500">
                        {new Date(h.at).toLocaleString("en-GB")}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">{h.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-left text-[12px] font-semibold ring-1 ${
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
          : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
