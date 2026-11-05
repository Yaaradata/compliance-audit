"use client";

import type { FirmBannerView } from "@/lib/ukbankingaudit/v8/boardView";
import { FirmPostureBanner } from "@/components/UKBankingAudit/v8/FirmPostureSummary";

type Props = {
  banner: FirmBannerView;
  onOpenCategory: (categoryId: string) => void;
  onOpenAssurance: () => void;
};

/**
 * CRO firm-level posture zone.
 * Uses the same outer panel boundary as the Board Signals zone.
 */
export function FirmRiskPosturePanel({ banner, onOpenCategory, onOpenAssurance }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <FirmPostureBanner banner={banner} onOpenCategory={onOpenCategory} onOpenAssurance={onOpenAssurance} />
    </section>
  );
}
