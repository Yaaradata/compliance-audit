"use client";

import type { RagStatus } from "@/components/UKBankingAudit/v6/types";
import { FirmPostureBanner } from "@/components/UKBankingAudit/v6/FirmPostureSummary";

type Props = {
  status: RagStatus;
  narrative: string;
};

/**
 * CRO firm-level posture zone.
 * Uses the same outer panel boundary as the Board Signals zone.
 */
export function FirmRiskPosturePanel({ status, narrative }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <FirmPostureBanner status={status} narrative={narrative} />
    </section>
  );
}
