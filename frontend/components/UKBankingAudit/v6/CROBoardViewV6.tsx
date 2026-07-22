"use client";

import { useState } from "react";
import { FIRM_POSTURE_V4 } from "@/lib/ukbankingaudit/riskDomainsV4";
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { runBoardDetectors } from "@/lib/ukbankingaudit/v6/detectors";
import { WHAT_CHANGED_V6 } from "@/lib/ukbankingaudit/v6/whatChangedV6";
import { BoardRoleContext } from "./boardRoleContext";
import { BoardSignalsStrip } from "./BoardSignalsStrip";
import { FirmRiskPosturePanel } from "./cro/FirmRiskPosturePanel";
import { RiskCategoriesPanel } from "./cro/RiskCategoriesPanel";
import { JurisdictionContext } from "./jurisdictionContext";
import { WhatChangedFromLastReview } from "./WhatChangedFromLastReview";
import { WhatHasNotChanged } from "./WhatHasNotChanged";
import { v6RefKind } from "@/lib/ukbankingaudit/v6/refRouter";

type Props = {
  openDrawer?: (entityType: string, entityId: string, sourceScreen: string) => void;
};

/** v6 CRO board — 9-domain mockup (Categories + inline drill + What Changed). */
export function CROBoardViewV6({ openDrawer }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const signals = runBoardDetectors("UK");

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));
  const onOpenEvidence = (ref: string) => openDrawer?.(v6RefKind(ref), ref, "croBoard");

  return (
    <BoardRoleContext.Provider value="second-line">
    <JurisdictionContext.Provider value="UK">
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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">CRO</h1>
          <p className="mt-1 text-sm text-slate-600">
            Firm-level risk posture across {RISK_DOMAINS_V4.length} UK CRO categories. Ten-minute board read.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <FirmRiskPosturePanel
            status={FIRM_POSTURE_V4.firmStatus}
            narrative={FIRM_POSTURE_V4.narrative}
          />
          <RiskCategoriesPanel
            domains={RISK_DOMAINS_V4}
            expandedId={expandedId}
            onToggle={toggle}
          />
        </div>
        <div className="min-w-0 xl:relative xl:col-span-4">
          <div className="xl:absolute xl:inset-0">
            <BoardSignalsStrip signals={signals} />
          </div>
        </div>
      </div>

      <WhatChangedFromLastReview items={WHAT_CHANGED_V6} onOpenEvidence={onOpenEvidence} />

      <WhatHasNotChanged />
    </div>
    </JurisdictionContext.Provider>
    </BoardRoleContext.Provider>
  );
}
