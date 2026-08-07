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
import { RISK_DOMAINS_V4 } from '@/lib/ukbankingaudit/v8/riskDomainsV8';
import { MLRO_DASHBOARD_LENSES } from '@/lib/ukbankingaudit/v8/mlroOperationalData';
import { ExposureLens } from '@/components/UKBankingAudit/v8/ExposureLens';
import { FraudLossPanel } from '@/components/UKBankingAudit/v8/mlro/FraudLossPanel';
import { LensToggle } from '@/components/UKBankingAudit/v8/LensToggle';

const MLRO_WALKTHROUGH_LINE =
  'Walk-through line: alert backlog rising → capacity stress is the why → AML.01.05.02 evidence completeness degrading is the consequence on the CRSA.';

/**
 * v8 MLRO Workspace — two tabs (Operational Dashboard, Client Risk View).
 * FraudLossPanel is a widget on the Operational Dashboard, not a third tab.
 *
 * Operational Dashboard layout (12-col zones):
 *   A — full-width posture strip
 *   B — 7/5 alert primary + SAR/EDD/Fraud rail
 *   C — 7/5 Sanctions + Training
 */
export function MLROWorkspaceV8({ openDrawer, setActiveScreen, setSelectedGSRId }) {
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
    <div className="min-w-0 space-y-4">
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
        <div className="min-w-0 space-y-4">
          {/* ZONE A — full-width posture strip; walk-through "i" on the eyebrow */}
          <div id="mlro-panel-kri-strip" className="min-w-0">
            <FinancialCrimeKRIStrip
              kriList={fcKRIs}
              openDrawer={openDrawer}
              alertSeries={amlAlertsByWeek || []}
              sarSeries={sarFilingsByWeek || []}
              eddItems={eddPipelineItems || []}
              walkthroughLine={MLRO_WALKTHROUGH_LINE}
            />
          </div>

          {/* Ops cards — one 7/5 region. flex-col stacks (no stretch).
              Mobile order via order-*: TM → SAR → EDD → Sanctions → Training → Fraud.
              lg: left = TM / Sanctions / Fraud; right = SAR+EDD / Training. */}
          <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start">
            <div className="contents min-w-0 lg:col-span-7 lg:flex lg:flex-col lg:gap-4">
              <div id="mlro-panel-alert-backlog" className="order-1 min-w-0 lg:order-none">
                <AlertBacklogVsAppetite
                  alertSeries={amlAlertsByWeek || []}
                  appetiteMetric={amlAppetite}
                  capacitySeries={capacityVsDemandSeries || []}
                  onDrill={() => drillTo('alertBacklog')}
                  compact
                />
              </div>
              <div
                id="mlro-panel-sanctions"
                className="order-3 min-w-0 overflow-hidden lg:order-none"
              >
                <SanctionsScreeningPosture
                  metrics={sanctionsScreeningMetrics}
                  density="compact"
                />
              </div>
              <div id="mlro-panel-fraud" className="order-5 min-w-0 lg:order-none">
                <FraudLossPanel />
              </div>
            </div>

            <div className="contents min-w-0 lg:col-span-5 lg:flex lg:flex-col lg:gap-4">
              <div
                id="mlro-panel-sar-edd"
                className="order-2 flex min-w-0 flex-col gap-4 lg:order-none"
              >
                <SARTimelinessBand
                  series={sarFilingsByWeek || []}
                  onDrill={() => drillTo('sarTimeliness')}
                  density="compact"
                />
                <EDDPipelineStatus
                  items={eddPipelineItems || []}
                  onDrill={() => drillTo('eddPipeline')}
                  density="compact"
                />
              </div>
              <div
                id="mlro-panel-fc-training"
                className="order-4 min-w-0 overflow-hidden lg:order-none"
              >
                <FinancialCrimeTrainingPosture density="compact" />
              </div>
            </div>
          </div>
        </div>
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
