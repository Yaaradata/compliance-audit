"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  boardSubtitle,
  buildControlStrip,
  buildFirmBanner,
  buildGlanceTrends,
  buildIncidentStrip,
  buildRedSpotlight,
  buildRiskAppetiteStrip,
  buildWhatChanged,
  buildWhatHasNotChanged,
} from "@/lib/ukbankingaudit/v8/boardView";
import { buildWhatMoved } from "@/lib/ukbankingaudit/v8/controlsIncidentsView";
import { RISK_DOMAINS_V4 } from "@/lib/ukbankingaudit/v8/riskDomainsV8";
import { buildTopLineTiles, type TopLineTile } from "@/lib/ukbankingaudit/v8/croReportView";
import { runBoardDetectors } from "@/lib/ukbankingaudit/v8/detectors";
import { personas } from "@/components/UKBankingAudit/ukTraceRuntime";
import { BoardRoleContext } from "./boardRoleContext";
import { HorizonScanningPanel } from "./HorizonScanningPanel";
import { FirmRiskPosturePanel } from "./cro/FirmRiskPosturePanel";
import { PathToGreenDrawer, type PathTarget } from "./PathToGreenDrawer";
import { RedSpotlight } from "./cro/RedSpotlight";
import { TopLineSummary } from "./cro/TopLineSummary";
import { useRiskState } from "./useRiskStore";
import { RiskAtAGlance } from "./cro/RiskAtAGlance";
import { RiskCategoriesPanel } from "./cro/RiskCategoriesPanel";
import { JurisdictionContext } from "./jurisdictionContext";
import { WhatChangedFromLastReview } from "./WhatChangedFromLastReview";
import { WhatHasNotChanged } from "./WhatHasNotChanged";
import { v8RefKind } from "@/lib/ukbankingaudit/v8/refRouter";

type Props = {
  openDrawer?: (entityType: string, entityId: string, sourceScreen: string) => void;
  setActiveScreen?: (screen: string) => void;
};

/** v6 CRO board — 9-domain mockup (Categories + inline drill + What Changed). */
export function CROBoardViewV8({ openDrawer, setActiveScreen }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const signals = runBoardDetectors("UK");
  const persona = personas.find((p: { id: string }) => p.id === "cro");

  const router = useRouter();
  const { data } = useRiskState();
  const period = data.config.currentPeriod;
  const [pathTarget, setPathTarget] = useState<PathTarget | null>(null);
  const appetiteStrip = buildRiskAppetiteStrip(period, data);
  const controlStrip = buildControlStrip(period, data);
  const incidentStrip = buildIncidentStrip(period, data);
  const glanceTrends = buildGlanceTrends(period, data);
  const spotlightRows = buildRedSpotlight(period, 100, data);
  const topAppetite = spotlightRows.find((row) => row.kind === "ram");
  const topMove = buildWhatMoved(period, data)[0];

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));
  const onOpenEvidence = (ref: string) => openDrawer?.(v8RefKind(ref), ref, "croBoard");
  const openTopLineTile = ({ target }: TopLineTile) => {
    if (target.kind === "category") setExpandedId(target.categoryId);
    if (target.kind === "screen") setActiveScreen?.(target.screen);
    if (target.kind === "evidence") onOpenEvidence(target.ref);
  };

  return (
    <BoardRoleContext.Provider value="second-line">
    <JurisdictionContext.Provider value="UK">
    <div className="space-y-5">
      <style>{`
        @keyframes ukV4SlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .uk-v4-slide-down { animation: ukV4SlideDown 0.3s ease; }
        .uk-v4-slide-down-mid { animation: ukV4SlideDown 0.25s ease; }
        .uk-v4-slide-down-fast { animation: ukV4SlideDown 0.2s ease; }
      `}</style>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {persona?.label ?? "CRO (SMF4)"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {boardSubtitle(data)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/UKBankingAudit/v8/report")}
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Generate CRO Report
        </button>
      </div>

      <TopLineSummary tiles={buildTopLineTiles(period, data)} onOpen={openTopLineTile} />

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <FirmRiskPosturePanel
            banner={buildFirmBanner(period, data)}
            onOpenCategory={setExpandedId}
            onOpenAssurance={() => setActiveScreen?.("controlsIncidents")}
          />
          <RiskCategoriesPanel
            domains={RISK_DOMAINS_V4}
            expandedId={expandedId}
            onToggle={toggle}
          />
        </div>
        <div className="min-w-0 xl:relative xl:col-span-4">
          <div className="xl:absolute xl:inset-0">
            <HorizonScanningPanel
              signals={signals}
              expandedId={expandedId}
              onClearDomain={() => setExpandedId(null)}
            />
          </div>
        </div>
      </div>

      <RiskAtAGlance
        appetite={appetiteStrip}
        controls={controlStrip}
        incidents={incidentStrip}
        trends={glanceTrends}
        keyPoints={{
          appetite: topAppetite ? `${topAppetite.name}: ${topAppetite.measure}.` : null,
          controls: topMove ? `${topMove.text.replace(" — ", ". ")}.` : null,
          incidents: glanceTrends.incidents.top[0]
            ? `${glanceTrends.incidents.top[0].severity}: ${glanceTrends.incidents.top[0].title}.`
            : null,
        }}
        thresholds={{
          amber: data.config.categoryRatingRule.amberThreshold,
          red: data.config.categoryRatingRule.redThreshold,
        }}
        onOpenAppetite={() => setActiveScreen?.("riskAppetite")}
        onOpenControls={() => setActiveScreen?.("controlsIncidents")}
        onOpenIncidents={() => setActiveScreen?.("controlsIncidents")}
      />

      <RedSpotlight
        rows={spotlightRows}
        onShowAll={() => setActiveScreen?.("riskAppetite")}
        onOpenPath={(row) =>
          setPathTarget({
            targetType: row.kind === "ram" ? "ram" : row.kind === "control" ? "control" : "incident",
            targetId: row.id,
            label: row.name,
            owner: row.owner,
          })
        }
      />

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <WhatChangedFromLastReview items={buildWhatChanged(period, data)} onOpenEvidence={onOpenEvidence} onShowAll={() => setActiveScreen?.("controlsIncidents")} />
        <WhatHasNotChanged rows={buildWhatHasNotChanged(period, data)} />
      </div>

      {pathTarget ? <PathToGreenDrawer target={pathTarget} onClose={() => setPathTarget(null)} /> : null}
    </div>
    </JurisdictionContext.Provider>
    </BoardRoleContext.Provider>
  );
}
