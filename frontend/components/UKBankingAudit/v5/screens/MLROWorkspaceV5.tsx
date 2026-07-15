// @ts-nocheck
'use client';

import {
  personas,
  kris,
  risks,
  riskAppetiteMetrics,
  amlAlertsByWeek,
  sarFilingsByWeek,
  eddPipelineItems,
  sanctionsScreeningMetrics,
  capacityVsDemandSeries,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import {
  EmptyState,
  MLRO_DRILL_TARGETS,
  FinancialCrimeKRIStrip,
  AlertBacklogVsAppetite,
  SARTimelinessBand,
  EDDPipelineStatus,
  SanctionsScreeningPosture,
  CapacityVsDemandGauge,
} from './_shared';
import {
  SuppressionLedger,
  DispositionDispersion,
  ScreeningDenominator,
  CadenceFeasibility,
} from '@/components/UKBankingAudit/v5/mlro';

export function MLROWorkspaceV5({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const persona = personas.find(p => p.id === "smf17");
  if (!persona) return <EmptyState message="MLRO persona not configured." />;

  const fcKRIs = (kris || []).filter(k => {
    const r = (risks || []).find(rr => rr.id === k.riskId);
    return r && (r.croCategoryId === "fraud_financial_crime" || r.id === "R-FC-AML" || r.id === "R-FC-OFSI" || r.id === "R-FC-KYC");
  });

  const amlAppetite = (riskAppetiteMetrics || []).find(a => a.id === "APP-FC-002");

  const drillTo = (target) => {
    const t = MLRO_DRILL_TARGETS[target];
    if (!t) return;
    setSelectedGSRId && setSelectedGSRId(t.gsrId, t.cycleId);
    setActiveScreen && setActiveScreen("perRequirementAttestation");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold">{persona.smfDesignation}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{persona.label}</h1>
          <p className="text-sm text-slate-600 mt-1">{persona.subhead}</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          AML programme posture · POCA / MLR 2017 / OFSI
        </div>
      </div>

      {/* Header strip — KRI ribbon */}
      <FinancialCrimeKRIStrip kriList={fcKRIs} openDrawer={openDrawer} />

      {/* Top zone — primary widget */}
      <AlertBacklogVsAppetite
        alertSeries={amlAlertsByWeek || []}
        appetiteMetric={amlAppetite}
        onDrill={() => drillTo("alertBacklog")}
      />

      <SuppressionLedger
        alertSeries={amlAlertsByWeek || []}
        onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'mlroWorkspace')}
      />

      {/* SAR timeliness beside disposition dispersion; EDD with cadence feasibility below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SARTimelinessBand series={sarFilingsByWeek || []} onDrill={() => drillTo("sarTimeliness")} />
        <DispositionDispersion
          onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'mlroWorkspace')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <EDDPipelineStatus items={eddPipelineItems || []} onDrill={() => drillTo("eddPipeline")} />
          <CadenceFeasibility
            onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'mlroWorkspace')}
          />
        </div>
        <div className="space-y-5">
          <SanctionsScreeningPosture metrics={sanctionsScreeningMetrics} />
          <ScreeningDenominator
            onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'mlroWorkspace')}
          />
        </div>
      </div>

      <CapacityVsDemandGauge series={capacityVsDemandSeries || []} />

      <p className="text-[10px] text-slate-400 text-center pt-2">
        Walk-through line: alert backlog rising → capacity stress is the why → AML.01.05.02 evidence completeness degrading is the consequence on the CRSA.
      </p>
    </div>
  );
}
