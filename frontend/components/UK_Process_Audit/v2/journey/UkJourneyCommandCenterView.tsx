'use client';

import { useMemo, useState } from 'react';
import { buildUkDomainIntel } from '@/lib/UK_Process_Audit/v2/domainIntel';
import { getUkRccDomain } from '@/lib/UK_Process_Audit/v2/riskCommandCenter';
import { JourneyCaseDrawer, type JourneyDrawerState } from '@/components/Indian_Process_Audit/journey/v3/JourneyCaseDrawer';
import { JourneyDomainKpiRibbon } from '@/components/Indian_Process_Audit/journey/v3/JourneyDomainKpiRibbon';
import { JourneyFunnelLegend } from '@/components/Indian_Process_Audit/journey/v3/JourneyFunnelLegend';
import { JourneyStageFunnel } from '@/components/Indian_Process_Audit/journey/v3/JourneyStageFunnel';
import { UkJourneyActionQueue } from '@/components/UK_Process_Audit/v2/journey/intel/UkJourneyActionQueue';
import { UkStageHotspotStrip } from '@/components/UK_Process_Audit/v2/journey/intel/UkStageHotspotStrip';
import { UkControlFailurePanel } from '@/components/UK_Process_Audit/v2/journey/intel/UkControlFailurePanel';
import { UkEvidenceReadinessPanel } from '@/components/UK_Process_Audit/v2/journey/intel/UkEvidenceReadinessPanel';
import { UkJourneyAiSummaryWall } from '@/components/UK_Process_Audit/v2/journey/intel/UkJourneyAiSummaryWall';
import { UkOwnerAccountabilityPanel } from '@/components/UK_Process_Audit/v2/journey/intel/UkOwnerAccountabilityPanel';
import { UkRegulatoryExposurePanel } from '@/components/UK_Process_Audit/v2/journey/intel/UkRegulatoryExposurePanel';

type Props = {
  domainId: string;
};

/**
 * UK v2 domain journey tab — the exact Indian Process Audit v3 command centre
 * (funnel + AI wall + intel panels + clickable stage/case drill drawer), driven
 * entirely by UK Process Audit data.
 */
export default function UkJourneyCommandCenterView({ domainId }: Props) {
  const domain = useMemo(() => getUkRccDomain(domainId), [domainId]);
  const intel = useMemo(() => (domain ? buildUkDomainIntel(domain) : null), [domain]);
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
            <UkStageHotspotStrip
              hotspots={intel.hotspots}
              selectedStage={selectedStage}
              onSelectStage={selectStage}
            />
          </div>
        </section>

        <UkJourneyAiSummaryWall
          insights={intel.aiInsights}
          domainName={domain.short}
          onOpenCase={openCase}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UkControlFailurePanel failures={intel.controlFailures} />
        <UkOwnerAccountabilityPanel owners={intel.ownerLoads} />
        <UkEvidenceReadinessPanel evidence={intel.evidence} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.7fr]">
        <UkRegulatoryExposurePanel
          regulatory={intel.regulatoryExposure}
          slaAtRisk={intel.slaAtRisk}
          onOpenCase={openCase}
        />
        <UkJourneyActionQueue
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
