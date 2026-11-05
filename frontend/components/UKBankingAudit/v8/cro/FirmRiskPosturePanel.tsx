"use client";

import type { FirmBannerView } from "@/lib/ukbankingaudit/v8/boardView";
import { FirmPostureBanner } from "@/components/UKBankingAudit/v8/FirmPostureSummary";

type Props = {
  banner: FirmBannerView;
  onOpenCategory: (categoryId: string) => void;
  onOpenAssurance: () => void;
};

/** CRO firm-level posture zone. The banner is its own frame, so it has no outer panel. */
export function FirmRiskPosturePanel({ banner, onOpenCategory, onOpenAssurance }: Props) {
  return (
    <section>
      <FirmPostureBanner banner={banner} onOpenCategory={onOpenCategory} onOpenAssurance={onOpenAssurance} />
    </section>
  );
}
