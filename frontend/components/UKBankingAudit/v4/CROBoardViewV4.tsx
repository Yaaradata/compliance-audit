"use client";

import { useState } from "react";
import {
  FIRM_POSTURE_V4,
  RISK_DOMAINS_V4,
  WHAT_CHANGED_V4,
} from "@/lib/ukbankingaudit/riskDomainsV4";
import { CategoryTileGrid } from "./CategoryTileGrid";
import { FirmPostureBanner, RagCountPills } from "./FirmPostureSummary";
import { WhatChangedFromLastReview } from "./WhatChangedFromLastReview";

type Props = {
  openDrawer?: (entityType: string, entityId: string, sourceScreen: string) => void;
};

/** v4 CRO board — 9-domain mockup (Categories + inline drill + What Changed). */
export function CROBoardViewV4({ openDrawer: _openDrawer }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ukV4SlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .uk-v4-slide-down { animation: ukV4SlideDown 0.3s ease; }
        .uk-v4-slide-down-mid { animation: ukV4SlideDown 0.25s ease; }
        .uk-v4-slide-down-fast { animation: ukV4SlideDown 0.2s ease; }
      `}</style>
      <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">SMF4</div>
          <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">CRO (SMF4)</h1>
          <p className="mt-1 text-sm text-slate-600">
            Firm-level risk posture across {RISK_DOMAINS_V4.length} UK CRO categories. Ten-minute board read.
          </p>
        </div>

      <FirmPostureBanner status={FIRM_POSTURE_V4.firmStatus} narrative={FIRM_POSTURE_V4.narrative} />

      <RagCountPills counts={FIRM_POSTURE_V4.counts} />

      <CategoryTileGrid domains={RISK_DOMAINS_V4} expandedId={expandedId} onToggle={toggle} />

      <WhatChangedFromLastReview items={WHAT_CHANGED_V4} />
    </div>
  );
}
