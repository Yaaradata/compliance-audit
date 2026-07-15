"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { UK_PRECEDENTS, type UkSignal } from "@/lib/UK_Process_Audit/signals";
import {
  bucketSignalsForInbox,
  type UkSignalDisposition,
} from "@/lib/UK_Process_Audit/v3/dispositionStore";
import { UkSignalCard, type UkSignalCardPrecedent } from "./signal/UkSignalCard";
import { useUkpaV3Session } from "./UkpaV3SessionProvider";

const EMPTY_COPY =
  "No signals in 24 hours. 23 controls unarmed — cadence unconfirmed.";

type SectionKind = "detected" | "accepted" | "confirmed";

const SECTION_META: Record<
  SectionKind,
  { title: string; subtitle: string; shell: string; header: string }
> = {
  detected: {
    title: "DETECTED SIGNAL",
    subtitle: "Fired, undispositioned",
    shell: "border-slate-200 bg-white shadow-sm",
    header: "bg-slate-900 text-white",
  },
  accepted: {
    title: "ACCEPTED EXCEPTION",
    subtitle: "Accepted — reason + expiry",
    shell: "border-slate-200 bg-slate-50/80 opacity-90",
    header: "bg-slate-400 text-white",
  },
  confirmed: {
    title: "CONFIRMED ISSUE",
    subtitle: "Promoted to the exception register",
    shell: "border-2 border-slate-800 bg-white",
    header: "bg-white text-slate-900 border-b-2 border-slate-800",
  },
};

export function SignalsInbox({
  signals,
}: {
  signals: UkSignal[];
}) {
  const router = useRouter();
  const { overlaySignals, dispositionFor, dispositionEnabled, commitDisposition } =
    useUkpaV3Session();

  const buckets = useMemo(
    () => bucketSignalsForInbox(overlaySignals(signals)),
    [overlaySignals, signals],
  );

  const total =
    buckets.detected.length + buckets.accepted.length + buckets.confirmed.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Signals Inbox</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Three disposition bands — never merged. Severity, then newest evaluation first.
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-[14px] text-slate-600">
          {EMPTY_COPY}
        </div>
      ) : null}

      <InboxSection
        kind="detected"
        signals={buckets.detected}
        dispositionFor={dispositionFor}
        dispositionEnabled={dispositionEnabled}
        onOpenControl={() => undefined}
        onOpenEvidence={() => undefined}
        onOpenInvestigation={(id) =>
          router.push(`/UK_Process_Audit/v3/signal/${encodeURIComponent(id)}`)
        }
        onAccept={(id) => {
          if (!dispositionEnabled) return;
          const expiry = window.prompt("Accept expiry (YYYY-MM-DD)");
          const reason = window.prompt("Accept reason");
          if (!expiry || !reason) return;
          try {
            commitDisposition({
              signalId: id,
              status: "ACCEPTED_EXCEPTION",
              reason,
              expiry,
              actorId: "actor:a-whitfield",
            });
          } catch {
            /* data layer refused */
          }
        }}
      />

      <InboxSection
        kind="accepted"
        signals={buckets.accepted}
        dispositionFor={dispositionFor}
        dispositionEnabled={dispositionEnabled}
        onOpenControl={() => undefined}
        onOpenEvidence={() => undefined}
        onOpenInvestigation={(id) =>
          router.push(`/UK_Process_Audit/v3/signal/${encodeURIComponent(id)}`)
        }
        onAccept={() => undefined}
      />

      <InboxSection
        kind="confirmed"
        signals={buckets.confirmed}
        dispositionFor={dispositionFor}
        dispositionEnabled={dispositionEnabled}
        onOpenControl={() => undefined}
        onOpenEvidence={() => undefined}
        onOpenInvestigation={(id) =>
          router.push(`/UK_Process_Audit/v3/signal/${encodeURIComponent(id)}`)
        }
        onAccept={() => undefined}
      />
    </div>
  );
}

function InboxSection({
  kind,
  signals,
  dispositionFor,
  dispositionEnabled,
  onOpenControl,
  onOpenEvidence,
  onOpenInvestigation,
  onAccept,
}: {
  kind: SectionKind;
  signals: UkSignal[];
  dispositionFor: (id: string) => UkSignalDisposition | undefined;
  dispositionEnabled: boolean;
  onOpenControl: (controlId: string) => void;
  onOpenEvidence: (ref: string) => void;
  onOpenInvestigation: (signalId: string) => void;
  onAccept: (signalId: string) => void;
}) {
  const meta = SECTION_META[kind];

  return (
    <section className={`overflow-hidden rounded-xl border ${meta.shell}`}>
      <header className={`flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 ${meta.header}`}>
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-wide">{meta.title}</h2>
          <p
            className={`mt-0.5 text-[11px] ${
              kind === "confirmed" ? "text-slate-500" : "text-white/70"
            }`}
          >
            {meta.subtitle}
          </p>
        </div>
        <span
          className={`text-[11px] font-semibold tabular-nums ${
            kind === "confirmed" ? "text-slate-600" : "text-white/80"
          }`}
        >
          {signals.length}
        </span>
      </header>

      {signals.length === 0 ? (
        <div className="px-4 py-6 text-[13px] text-slate-500">None in this band.</div>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {signals.map((s) => {
            const precedent = s.precedentId
              ? (UK_PRECEDENTS.find((p) => p.id === s.precedentId) as
                  | UkSignalCardPrecedent
                  | undefined) ?? null
              : null;
            if (s.precedentId && (!precedent || precedent.admissionPosture == null)) {
              return null;
            }
            const disp = dispositionFor(s.id);
            return (
              <div key={s.id} className={kind === "accepted" ? "opacity-90" : undefined}>
                <UkSignalCard
                  signal={s}
                  precedent={precedent}
                  onOpenControl={onOpenControl}
                  onOpenEvidence={onOpenEvidence}
                  onOpenInvestigation={onOpenInvestigation}
                  onAcceptWithReason={onAccept}
                  showDispositionActions={dispositionEnabled && kind === "detected"}
                  acceptedExpiry={kind === "accepted" ? disp?.expiry ?? null : null}
                  acceptedReason={kind === "accepted" ? disp?.reason ?? null : null}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
