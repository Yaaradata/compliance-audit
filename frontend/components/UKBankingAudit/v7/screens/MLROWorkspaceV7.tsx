// @ts-nocheck
'use client';

import { useState } from 'react';
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
  FinancialCrimeTrainingPosture,
} from './_shared';
import { RISK_DOMAINS_V4 } from '@/lib/ukbankingaudit/v7/riskDomainsV7';
import { MLRO_DASHBOARD_LENSES } from '@/lib/ukbankingaudit/v7/mlroOperationalData';
import { ExposureLens } from '@/components/UKBankingAudit/v7/ExposureLens';
import { FraudLossPanel } from '@/components/UKBankingAudit/v7/mlro/FraudLossPanel';
import { LensToggle } from '@/components/UKBankingAudit/v7/LensToggle';

/**
 * v7 MLRO Workspace — two tabs (Operational Dashboard, Client Risk View).
 * FraudLossPanel is a widget on the Operational Dashboard, not a third tab.
 */
export function MLROWorkspaceV7({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const persona = personas.find((p) => p.id === 'smf17');
  if (!persona) return <EmptyState message="MLRO persona not configured." />;

  const fincrimeDomain = RISK_DOMAINS_V4.find((d) => d.id === 'fincrime');

  const [lens, setLens] = useState(MLRO_DASHBOARD_LENSES[0].id);

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
    <div className="space-y-5">
      {/* Compact header — title + subhead left; lens toggle top-right */}
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">{persona.label}</h1>
          <p className="mt-1 text-sm leading-snug text-slate-600">{persona.subhead}</p>
        </div>
        <LensToggle
          options={[...MLRO_DASHBOARD_LENSES]}
          value={lens}
          onChange={setLens}
          className="w-fit shrink-0"
        />
      </header>

      {lens === 'assurance' ? (
        <>
          {/* Header strip — KRI ribbon */}
          <div id="mlro-panel-kri-strip">
            <FinancialCrimeKRIStrip kriList={fcKRIs} openDrawer={openDrawer} />
          </div>

          {/* Top zone — primary widget (L1/L2/L3 backlog + nested capacity + SAR conversion) */}
          <div id="mlro-panel-alert-backlog">
            <AlertBacklogVsAppetite
              alertSeries={amlAlertsByWeek || []}
              appetiteMetric={amlAppetite}
              capacitySeries={capacityVsDemandSeries || []}
              onDrill={() => drillTo('alertBacklog')}
            />
          </div>

          {/* Mid 2-up — SAR timeliness + EDD pipeline */}
          <div id="mlro-panel-sar-edd" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SARTimelinessBand
              series={sarFilingsByWeek || []}
              onDrill={() => drillTo('sarTimeliness')}
            />
            <EDDPipelineStatus
              items={eddPipelineItems || []}
              onDrill={() => drillTo('eddPipeline')}
            />
          </div>

          {/* Sanctions — capacity gauge now nested inside alert backlog widget */}
          <div id="mlro-panel-sanctions">
            <SanctionsScreeningPosture metrics={sanctionsScreeningMetrics} />
          </div>

          {/* Financial crime training — firm-wide % from AP-MLRO-2025 narrative */}
          <div id="mlro-panel-fc-training">
            <FinancialCrimeTrainingPosture />
          </div>

          {/* Fraud risk (collapsed summary; expands to full table) */}
          <div id="mlro-panel-fraud">
            <FraudLossPanel />
          </div>

          <p className="pt-2 text-center text-[10px] text-slate-400">
            Walk-through line: alert backlog rising → capacity stress is the why → AML.01.05.02
            evidence completeness degrading is the consequence on the CRSA.
          </p>
        </>
      ) : null}

      {lens === 'exposure' ? (
        fincrimeDomain ? (
          <section>
            <header className="mb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                Client Risk View
              </div>
              <h2 className="mt-0.5 text-base font-bold text-slate-900">
                Client concentration · Fraud &amp; Financial Crime
              </h2>
            </header>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ExposureLens domain={fincrimeDomain} />
            </div>
          </section>
        ) : null
      ) : null}
    </div>
  );
}
