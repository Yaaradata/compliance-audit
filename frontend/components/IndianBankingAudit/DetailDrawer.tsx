'use client';

import React from 'react';
import { EntityTypeBadge } from './primitives';
import type { DrawerEntityType, DrawerState, DrillFromDrawer, SetActiveScreen } from './types';
import {
  AIInsightDetailPanel,
  AuditPackDetailPanel,
  ControlDetailPanel,
  ControlInstanceDetailPanel,
  CorrelationDetailPanel,
  EvidenceDetailPanel,
  ExceptionDetailPanel,
  IssueDetailPanel,
  ObligationDetailPanel,
  ProcessDetailPanel,
  ProcessExecutionDetailPanel,
  RemediationDetailPanel,
  RiskDetailPanel,
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
}: {
  drawer: DrawerState;
  closeDrawer: () => void;
  drillFromDrawer: DrillFromDrawer;
  drillBack: () => void;
  setActiveScreen: SetActiveScreen;
  setSelectedPackId: (id: string) => void;
}) {
  const { entityType, entityId, drillPath, sourceScreen } = drawer;
  if (!entityType || !entityId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={closeDrawer} role="presentation" />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[60%] xl:w-[55%] 2xl:w-[50%]">
        <div className="flex-shrink-0 border-b border-slate-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <EntityTypeBadge type={entityType} />
                <span className="font-mono text-xs text-slate-500">{entityId}</span>
              </div>
              {(sourceScreen || drillPath.length > 0) && (
                <div className="mb-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                  {sourceScreen && <span className="capitalize">{sourceScreen.replace(/([A-Z])/g, ' $1').trim()}</span>}
                  {drillPath.map((p, i) => (
                    <React.Fragment key={i}>
                      <span className="text-slate-300">›</span>
                      <span className="font-medium">{p.label}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-slate-300">›</span>
                  <span className="font-medium text-slate-700">current</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {drillPath.length > 0 && (
                <button type="button" onClick={drillBack} className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">
                  ← Back
                </button>
              )}
              <button type="button" onClick={closeDrawer} className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{renderPanel(entityType, entityId, drillFromDrawer, setActiveScreen, setSelectedPackId, closeDrawer)}</div>
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
  closeDrawer: () => void
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
