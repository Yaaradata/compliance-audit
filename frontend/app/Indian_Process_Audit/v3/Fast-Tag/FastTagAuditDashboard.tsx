'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Headphones, Landmark } from 'lucide-react';
import {
  DomainAuditWorkspace,
  type DomainWorkspaceExtraTab,
} from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import { getFastTagAuditorFocus } from './fastTagAuditContent';
import { buildFastTagEvidence } from './buildFastTagEvidence';
import {
  getFastTagAuditBundle,
  getFastTagCaseRegion,
  getFastTagOverviewStrip,
} from './auditData';
import { getRegionOptions } from './fastTagExecutiveMetrics';
import type { FastTagExecutiveContext, FastTagWorkspaceNavigate } from './fastTagExecutiveTypes';
import FastTagTollSettlementView from './FastTagTollSettlementView';
import FastTagHoBView from './FastTagHoBView';
import FastTagCOHView from './FastTagCOHView';
import FastTagJourneyCasesView from './FastTagJourneyCasesView';
import FastTagHoBGatewayDrill from './FastTagHoBGatewayDrill';
import {
  isFastTagHoBGatewayDrill,
  type FastTagGatewayTileId,
} from './fastTagGatewayData';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';

type Props = {
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
  /** Hide FASTag page header + workspace tabs when performance gateway drill is open. */
  onImmersiveChange?: (active: boolean) => void;
};

const FAST_TAG_SEVERITY_BADGES = [
  {
    key: 'Critical' as const,
    label: 'Critical',
    shell: 'bg-red-50 text-red-700 ring-red-200/80',
    count: 'text-red-600',
  },
  {
    key: 'High' as const,
    label: 'High',
    shell: 'bg-orange-50 text-orange-700 ring-orange-200/80',
    count: 'text-orange-600',
  },
  {
    key: 'Medium' as const,
    label: 'Medium',
    shell: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    count: 'text-sky-600',
  },
  {
    key: 'Low' as const,
    label: 'Low',
    shell: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    count: 'text-emerald-600',
  },
] as const;

const POSTURE_EMPHASIS: Record<string, string> = {
  Critical: 'text-red-600',
  High: 'text-orange-600',
  Medium: 'text-amber-600',
  Low: 'text-emerald-600',
};

const METRIC_PILL =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 sm:text-sm';

/** Enterprise header: context (left) · metrics + posture (right, single row) */
export function FastTagPageHeader() {
  const { compliance, severityCounts: c, posture } = getFastTagOverviewStrip();
  const postureCls = POSTURE_EMPHASIS[posture] ?? 'text-slate-900';

  return (
    <header className="mb-5 border-b border-slate-200/80 pb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h1 className="shrink-0 text-[22px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            FASTag
          </h1>
          <p className="min-w-0 text-[13px] font-normal leading-snug text-slate-500 sm:text-sm">
            FASTag issuance &amp; toll lifecycle audit · NETC / NPCI OV1T · Q1 2026
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5 lg:ml-auto lg:justify-end">
          <span
            className={`${METRIC_PILL} bg-emerald-50 text-emerald-800 ring-emerald-200/80`}
          >
            <span className="text-slate-600">Domain Compliance</span>
            <span className="tabular-nums text-sm font-bold text-emerald-600 sm:text-base">
              {compliance}%
            </span>
          </span>
          {FAST_TAG_SEVERITY_BADGES.map(({ key, label, shell, count }) => (
            <span key={key} className={`${METRIC_PILL} ${shell}`}>
              {label}
              <span className={`tabular-nums text-sm font-bold sm:text-base ${count}`}>
                {c[key]}
              </span>
            </span>
          ))}
          <p className="ml-1 whitespace-nowrap text-sm text-slate-600 sm:ml-2">
            <span className="font-medium text-slate-700">Posture:</span>{' '}
            <span className={`font-semibold ${postureCls}`}>{posture}</span>
          </p>
        </div>
      </div>
    </header>
  );
}

export default function FastTagAuditDashboard({ onOpenEvidence, onImmersiveChange }: Props) {
  const bundle = getFastTagAuditBundle();
  const ft11 = useMemo(() => bundle.controls.find((c) => c.id === 'FT-11'), [bundle.controls]);

  const [workspaceNav, setWorkspaceNav] = useState<FastTagWorkspaceNavigate | null>(null);
  const [tollPlazaBreakId, setTollPlazaBreakId] = useState<string | null>(null);
  const [gatewayDrill, setGatewayDrill] = useState<FastTagGatewayTileId | null>(null);

  useEffect(() => {
    onImmersiveChange?.(isFastTagHoBGatewayDrill(gatewayDrill));
    return () => onImmersiveChange?.(false);
  }, [gatewayDrill, onImmersiveChange]);

  const handleExecutiveNav = useCallback((req: FastTagWorkspaceNavigate) => {
    if (req.tollPlazaBreakId) setTollPlazaBreakId(req.tollPlazaBreakId);
    setWorkspaceNav(req);
  }, []);

  const handleGatewayDrill = useCallback((tileId: FastTagGatewayTileId) => {
    setWorkspaceNav({ view: 'hob' });
    setGatewayDrill(tileId);
  }, []);

  const execCtx = useMemo<FastTagExecutiveContext>(
    () => ({
      controls: bundle.controls,
      onOpenEvidence,
      onNavigate: handleExecutiveNav,
      regionCode: null,
      setRegionCode: () => {},
      deficientOnly: false,
      setDeficientOnly: () => {},
    }),
    [bundle.controls, onOpenEvidence, handleExecutiveNav],
  );

  const caseRegionOptions = useMemo(
    () => getRegionOptions().map((r) => ({ id: r.code, label: r.label })),
    [],
  );

  const journeyStageFilterOptions = useMemo(
    () =>
      bundle.sop.stages.map((s) => ({
        id: s.id,
        label: bundle.getStageHeader(s),
      })),
    [bundle.sop.stages, bundle.getStageHeader],
  );

  const workspaceNavigatePayload = useMemo(() => {
    if (!workspaceNav) return null;
    return {
      view: workspaceNav.view,
      registerFilter: workspaceNav.registerFilter,
      caseRegion: workspaceNav.caseRegion,
      caseStage: workspaceNav.caseStage,
      controlId: workspaceNav.controlId,
    };
  }, [workspaceNav]);

  const extraTabs = useMemo<DomainWorkspaceExtraTab[]>(
    () => [
      {
        id: 'toll',
        label: 'Toll settlement',
        icon: Landmark,
        content: (
          <FastTagTollSettlementView
            ft11Control={ft11}
            onOpenEvidence={onOpenEvidence}
            initialPlazaBreakId={tollPlazaBreakId}
            onInitialPlazaBreakHandled={() => setTollPlazaBreakId(null)}
          />
        ),
      },
      {
        id: 'hob',
        label: 'Operations',
        icon: BarChart3,
        content: (
          <FastTagHoBView
            ctx={execCtx}
            cases={bundle.cases}
            allCases={bundle.cases}
            controls={bundle.controls}
            sop={bundle.sop}
            getStageHeader={bundle.getStageHeader}
            onGatewayDrill={handleGatewayDrill}
          />
        ),
      },
      {
        id: 'coh',
        label: 'User Complaints',
        icon: Headphones,
        content: (
          <FastTagCOHView
            ctx={execCtx}
            cases={bundle.cases}
            allCases={bundle.cases}
            controls={bundle.controls}
            sop={bundle.sop}
            getStageHeader={bundle.getStageHeader}
          />
        ),
      },
    ],
    [ft11, onOpenEvidence, execCtx, bundle, tollPlazaBreakId, setGatewayDrill],
  );

  const gatewayDrillOpen = isFastTagHoBGatewayDrill(gatewayDrill);

  return (
    <div className="space-y-5">
      {gatewayDrillOpen ? (
        <FastTagHoBGatewayDrill
          drillId={gatewayDrill}
          cases={bundle.cases}
          onBack={() => setGatewayDrill(null)}
          immersive
        />
      ) : null}
      <div hidden={gatewayDrillOpen}>
      <DomainAuditWorkspace
        domainId={bundle.domainId}
        domainLabel={bundle.domainLabel}
        controls={bundle.controls}
        sop={bundle.sop}
        cases={bundle.cases}
        entity={bundle.entity}
        journeyTitle={bundle.journeyTitle}
        getStageHeader={bundle.getStageHeader}
        controlExceptionLabels={bundle.controlExceptionLabels}
        getAuditorFocusForControl={getFastTagAuditorFocus}
        buildEvidence={buildFastTagEvidence}
        onOpenEvidence={onOpenEvidence}
        defaultView="sop"
        registerControlsFirst
        extraTabs={extraTabs}
        caseRegionResolver={getFastTagCaseRegion}
        caseRegionFilterOptions={caseRegionOptions}
        journeyStageFilterOptions={journeyStageFilterOptions}
        workspaceNavigate={workspaceNavigatePayload}
        onWorkspaceNavigateHandled={() => setWorkspaceNav(null)}
        renderCasesView={() => (
          <FastTagJourneyCasesView
            domainId={bundle.domainId}
            domainLabel={bundle.domainLabel}
            sop={bundle.sop}
            cases={bundle.cases}
            entity={bundle.entity}
            controls={bundle.controls}
            journeyTitle={bundle.journeyTitle}
            getStageHeader={bundle.getStageHeader}
            controlExceptionLabels={bundle.controlExceptionLabels}
            onOpenEvidence={onOpenEvidence}
          />
        )}
      />
      </div>
    </div>
  );
}
