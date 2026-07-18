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
import { RISK_DOMAINS_V4 } from '@/lib/ukbankingaudit/v6/riskDomainsV6';
import { ExposureLens } from '@/components/UKBankingAudit/v6/ExposureLens';

/**
 * v6 MLRO Workspace — same structure and layout as v4.
 * SMF17 landing: KRI ribbon, alert backlog, SAR / EDD, sanctions / capacity.
 */
export function MLROWorkspaceV6({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const persona = personas.find((p) => p.id === 'smf17');
  if (!persona) return <EmptyState message="MLRO persona not configured." />;

  const fincrimeDomain = RISK_DOMAINS_V4.find((d) => d.id === 'fincrime');

  const fcKRIs = (kris || []).filter((k) => {
    const r = (risks || []).find((rr) => rr.id === k.riskId);
    return (
      r &&
      (r.croCategoryId === 'fraud_financial_crime' ||
        r.id === 'R-FC-AML' ||
        r.id === 'R-FC-OFSI' ||
        r.id === 'R-FC-KYC')
    );
  });

  const amlAppetite = (riskAppetiteMetrics || []).find((a) => a.id === 'APP-FC-002');

  const drillTo = (target) => {
    const t = MLRO_DRILL_TARGETS[target];
    if (!t) return;
    setSelectedGSRId && setSelectedGSRId(t.gsrId, t.cycleId);
    setActiveScreen && setActiveScreen('perRequirementAttestation');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            {persona.smfDesignation}
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900">{persona.label}</h1>
          <p className="mt-1 text-sm text-slate-600">{persona.subhead}</p>
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          AML programme posture · POCA / MLR 2017 / OFSI
        </div>
      </div>

      {/* Exposure — standing panel, not a toggle. The MLRO builds the exposure
          view before it reaches the CRO. */}
      {fincrimeDomain ? (
        <section>
          <header className="mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
              Exposure
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-900">
              Client concentration · Fraud &amp; Financial Crime
            </h2>
          </header>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <ExposureLens domain={fincrimeDomain} />
          </div>
        </section>
      ) : null}

      {/* Header strip — KRI ribbon */}
      <FinancialCrimeKRIStrip kriList={fcKRIs} openDrawer={openDrawer} />

      {/* Top zone — primary widget */}
      <AlertBacklogVsAppetite
        alertSeries={amlAlertsByWeek || []}
        appetiteMetric={amlAppetite}
        onDrill={() => drillTo('alertBacklog')}
      />

      {/* Mid 2-up — SAR timeliness + EDD pipeline */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SARTimelinessBand
          series={sarFilingsByWeek || []}
          onDrill={() => drillTo('sarTimeliness')}
        />
        <EDDPipelineStatus
          items={eddPipelineItems || []}
          onDrill={() => drillTo('eddPipeline')}
        />
      </div>

      {/* Bottom 2-up — Sanctions + Capacity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SanctionsScreeningPosture metrics={sanctionsScreeningMetrics} />
        <CapacityVsDemandGauge series={capacityVsDemandSeries || []} />
      </div>

      <p className="pt-2 text-center text-[10px] text-slate-400">
        Walk-through line: alert backlog rising → capacity stress is the why → AML.01.05.02
        evidence completeness degrading is the consequence on the CRSA.
      </p>
    </div>
  );
}
