'use client';

import React, { useEffect } from 'react';
import { EntityTypeBadge } from './primitives';
import type { DrawerEntityType, DrawerState, DrillFromDrawer, SetActiveScreen } from './types';
import { oriFocusRing } from './theme';
import {
  AIInsightDetailPanel,
  AuditPackDetailPanel,
  ControlDetailPanel,
  ControlInstanceDetailPanel,
  CorrelationDetailPanel,
  EvidenceDetailPanel,
  ExceptionDetailPanel,
  IncidentDetailPanel,
  IssueDetailPanel,
  KriDetailPanel,
  ObligationDetailPanel,
  PreventiveActionDetailPanel,
  ProcessDetailPanel,
  ProcessExecutionDetailPanel,
  RegulationDetailPanel,
  RemediationDetailPanel,
  RiskDetailPanel,
  RcaDetailPanel,
  SeniorManagerDetailPanel,
  SourceRecordDetailPanel,
  SourceSystemDetailPanel,
  TestExecutionDetailPanel,
  WorkpaperDetailPanel,
} from './drawer/detailPanels';

export function DetailDrawer({
  drawer,
  closeDrawer,
  drillFromDrawer,
  drillBack,
  setActiveScreen,
  setSelectedPackId,
  onOpenRcaWorkspace,
}: {
  drawer: DrawerState;
  closeDrawer: () => void;
  drillFromDrawer: DrillFromDrawer;
  drillBack: () => void;
  setActiveScreen: SetActiveScreen;
  setSelectedPackId: (id: string) => void;
  onOpenRcaWorkspace: (rcaId: string) => void;
}) {
  const { entityType, entityId, drillPath, sourceScreen } = drawer;
  const parentCrumb = drillPath.length ? drillPath[drillPath.length - 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  if (!entityType || !entityId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={closeDrawer} role="presentation" aria-hidden />
      <div
        className="ori-drawer-panel fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl md:w-[60%] xl:w-[55%] 2xl:w-[50%]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ori-drawer-title"
      >
        <div className="flex-shrink-0 border-b border-slate-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <EntityTypeBadge type={entityType} />
                <span id="ori-drawer-title" className="font-mono text-[11px] font-medium text-slate-600">
                  {entityId}
                </span>
              </div>
              {(sourceScreen || drillPath.length > 0) && (
                <nav className="mb-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-600" aria-label="Drill trail">
                  {sourceScreen && <span className="capitalize">{sourceScreen.replace(/([A-Z])/g, ' $1').trim()}</span>}
                  {drillPath.map((p, i) => (
                    <React.Fragment key={`${p.type}-${p.id}-${i}`}>
                      <span className="text-slate-300" aria-hidden>
                        ›
                      </span>
                      <span className="font-medium text-slate-700">{p.label}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-slate-300" aria-hidden>
                    ›
                  </span>
                  <span className="font-semibold text-slate-900">Current</span>
                </nav>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {drillPath.length > 0 && parentCrumb && (
                <button
                  type="button"
                  onClick={drillBack}
                  className={`rounded px-2 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 ${oriFocusRing}`}
                >
                  ← Back to {parentCrumb.label}
                </button>
              )}
              <button
                type="button"
                onClick={closeDrawer}
                className={`rounded px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 ${oriFocusRing}`}
                aria-label="Close drawer"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderPanel(entityType, entityId, drillFromDrawer, setActiveScreen, setSelectedPackId, closeDrawer, onOpenRcaWorkspace)}
        </div>
      </div>
    </>
  );
}

function renderPanel(
  type: DrawerEntityType,
  id: string,
  drillFromDrawer: DrillFromDrawer,
  setActiveScreen: SetActiveScreen,
  setSelectedPackId: (id: string) => void,
  closeDrawer: () => void,
  onOpenRcaWorkspace: (rcaId: string) => void
) {
  switch (type) {
    case 'risk':
      return <RiskDetailPanel riskId={id} drillFromDrawer={drillFromDrawer} />;
    case 'control':
      return <ControlDetailPanel controlId={id} drillFromDrawer={drillFromDrawer} />;
    case 'controlInstance':
      return <ControlInstanceDetailPanel ciId={id} drillFromDrawer={drillFromDrawer} />;
    case 'evidence':
      return <EvidenceDetailPanel evidenceId={id} drillFromDrawer={drillFromDrawer} />;
    case 'obligation':
      return <ObligationDetailPanel obligationId={id} drillFromDrawer={drillFromDrawer} />;
    case 'regulation':
      return <RegulationDetailPanel regulationId={id} drillFromDrawer={drillFromDrawer} />;
    case 'incident':
      return (
        <IncidentDetailPanel
          incidentId={id}
          drillFromDrawer={drillFromDrawer}
          onOpenRcaWorkspace={onOpenRcaWorkspace}
          closeDrawer={closeDrawer}
        />
      );
    case 'kri':
      return <KriDetailPanel kriId={id} drillFromDrawer={drillFromDrawer} />;
    case 'rca':
      return <RcaDetailPanel rcaId={id} drillFromDrawer={drillFromDrawer} />;
    case 'preventiveAction':
      return <PreventiveActionDetailPanel paId={id} drillFromDrawer={drillFromDrawer} />;
    case 'issue':
      return <IssueDetailPanel issueId={id} drillFromDrawer={drillFromDrawer} />;
    case 'aiInsight':
      return <AIInsightDetailPanel insightId={id} drillFromDrawer={drillFromDrawer} />;
    case 'seniorManager':
      return <SeniorManagerDetailPanel smId={id} drillFromDrawer={drillFromDrawer} />;
    case 'auditPack':
      return (
        <AuditPackDetailPanel
          packId={id}
          drillFromDrawer={drillFromDrawer}
          setActiveScreen={setActiveScreen}
          setSelectedPackId={setSelectedPackId}
          closeDrawer={closeDrawer}
        />
      );
    case 'process':
      return <ProcessDetailPanel processId={id} drillFromDrawer={drillFromDrawer} />;
    case 'processExecution':
      return <ProcessExecutionDetailPanel peId={id} drillFromDrawer={drillFromDrawer} />;
    case 'testExecution':
      return <TestExecutionDetailPanel testId={id} drillFromDrawer={drillFromDrawer} />;
    case 'workpaper':
      return <WorkpaperDetailPanel workpaperId={id} drillFromDrawer={drillFromDrawer} />;
    case 'sourceSystem':
      return <SourceSystemDetailPanel systemId={id} />;
    case 'sourceRecord':
      return <SourceRecordDetailPanel srId={id} drillFromDrawer={drillFromDrawer} />;
    case 'correlationRecord':
      return <CorrelationDetailPanel correlationId={id} />;
    case 'exception':
      return <ExceptionDetailPanel exceptionId={id} drillFromDrawer={drillFromDrawer} />;
    case 'remediationAction':
      return <RemediationDetailPanel actionId={id} drillFromDrawer={drillFromDrawer} />;
    default:
      return <div className="text-xs text-slate-500">Detail panel for {type} not yet implemented.</div>;
  }
}
