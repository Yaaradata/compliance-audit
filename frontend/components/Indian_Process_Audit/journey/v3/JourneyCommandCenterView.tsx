'use client';

import { useMemo, useState } from 'react';
import type { ProcessAuditDomainId } from '@/lib/Indian_Process_Audit/types';
import {
  buildDomainIntel,
  getRiskCommandCenterDomain,
} from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { JourneyCaseDrawer, type JourneyDrawerState } from './JourneyCaseDrawer';
import { JourneyDomainKpiRibbon } from './JourneyDomainKpiRibbon';
import { JourneyFunnelLegend } from './JourneyFunnelLegend';
import { JourneyStageFunnel } from './JourneyStageFunnel';
import {
  ControlFailurePanel,
  EvidenceReadinessPanel,
  JourneyActionQueue,
  JourneyAiSummaryWall,
  OwnerAccountabilityPanel,
  RegulatoryExposurePanel,
  StageHotspotStrip,
} from './intel';

type Props = {
  domainId: ProcessAuditDomainId;
};

/**
 * V3 domain tab — funnel + AI wall; stage/case drill opens in the right slide-out drawer.
 */
export default function JourneyCommandCenterView({ domainId }: Props) {
  const domain = useMemo(() => getRiskCommandCenterDomain(domainId), [domainId]);
  const intel = useMemo(() => (domain ? buildDomainIntel(domain) : null), [domain]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<JourneyDrawerState>(null);

  if (!domain || !intel) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
        Journey command center data is not configured for this domain.
      </div>
    );
  }

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedStage(null);
  };

  const openCase = (caseId: string) =>
    setDrawer({
      type: 'case',
      caseId,
      from: selectedStage ? 'stage' : 'queue',
    });

  const selectStage = (key: string) => {
    if (selectedStage === key) {
      closeDrawer();
      return;
    }
    setSelectedStage(key);
    setDrawer({ type: 'stage', stageKey: key });
  };

  const stageLabel = selectedStage
    ? (domain.stages.find((s) => s.key === selectedStage)?.label ?? null)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <JourneyDomainKpiRibbon domain={domain} intel={intel} />

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-slate-900">
                {domain.name} · journey control funnel
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Click a stage bar or hotspot to open details in the side panel.
              </p>
            </div>
            <JourneyFunnelLegend />
          </div>

          <div className="h-[min(280px,38vh)] min-h-[220px] px-2 py-2">
            <JourneyStageFunnel
              domain={domain}
              selectedKey={selectedStage}
              onSelect={selectStage}
            />
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <StageHotspotStrip
              hotspots={intel.hotspots}
              selectedStage={selectedStage}
              onSelectStage={selectStage}
            />
          </div>
        </section>

        <JourneyAiSummaryWall
          insights={intel.aiInsights}
          domainName={domain.short}
          onOpenCase={openCase}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ControlFailurePanel failures={intel.controlFailures} />
        <OwnerAccountabilityPanel owners={intel.ownerLoads} />
        <EvidenceReadinessPanel evidence={intel.evidence} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.7fr]">
        <RegulatoryExposurePanel
          regulatory={intel.regulatoryExposure}
          slaAtRisk={intel.slaAtRisk}
          onOpenCase={openCase}
        />
        <JourneyActionQueue
          domain={domain}
          selectedStage={selectedStage}
          stageLabel={stageLabel}
          onOpenCase={openCase}
        />
      </div>

      <JourneyCaseDrawer
        domain={domain}
        state={drawer}
        onClose={closeDrawer}
        onOpenCase={openCase}
        onBackToStage={() => {
          if (selectedStage) setDrawer({ type: 'stage', stageKey: selectedStage });
        }}
      />
    </div>
  );
}
