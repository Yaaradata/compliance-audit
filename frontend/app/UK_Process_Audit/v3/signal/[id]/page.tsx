import type { Metadata } from "next";
import Link from "next/link";
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import { SignalInvestigationClient } from "@/components/UK_Process_Audit/v3/signal/SignalInvestigationClient";
import { getUkSignalInvestigation } from "@/lib/UK_Process_Audit/v3/signalLookup";

export const metadata: Metadata = {
  title: "Signal investigation",
};

export default async function UkSignalInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = getUkSignalInvestigation(id);
  const cycleLabel = getUkProcessAuditData().overview.lastAuditCycle;

  if (!bundle) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Signal not found</h1>
          <p className="mt-2 text-[14px] text-slate-600">
            No detector output matches{" "}
            <span className="font-mono text-[13px]">{decodeURIComponent(id)}</span>.
          </p>
          <Link
            href="/UK_Process_Audit/v3"
            className="mt-4 inline-block text-[13px] font-medium text-slate-700 underline-offset-2 hover:underline"
          >
            Back to Signals Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SignalInvestigationClient
      signal={bundle.signal}
      control={bundle.control}
      precedent={bundle.precedent}
      artefacts={bundle.artefacts}
      cycleLabel={cycleLabel}
    />
  );
}
