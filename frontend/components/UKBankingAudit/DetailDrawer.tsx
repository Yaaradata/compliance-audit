'use client';

import React from 'react';
import { getAuditPack, getControl, getInsight, getIssue, getObligation, getProcess, getRisk, getSMF } from './dataModel';
import { EmptyState, EntityTypeBadge } from './primitives';
import type { DrawerState } from './types';
import {
  AiInsightDetailContent,
  AuditPackDetailContent,
  ControlDetailContent,
  EvidenceDetailContent,
  IssueDetailContent,
  ObligationDetailContent,
  RiskDetailContent,
  SmfDetailContent,
} from './drawer/detailPanels';

export function DetailDrawer({
  drawer,
  closeDrawer,
  drillFromDrawer,
  drillBack,
  setActiveScreen,
  setSelectedSMFId,
  setSelectedPackId,
}: {
  drawer: DrawerState;
  closeDrawer: () => void;
  drillFromDrawer: (entityType: string, entityId: string) => void;
  drillBack: () => void;
  setActiveScreen: (s: string) => void;
  setSelectedSMFId: (id: string) => void;
  setSelectedPackId: (id: string) => void;
}) {
  const { entityType, entityId, drillPath, sourceScreen } = drawer;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={closeDrawer} role="presentation" />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[60%] xl:w-[55%]">
        <div className="flex-shrink-0 border-b border-slate-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <EntityTypeBadge type={entityType} />
                <span className="font-mono text-xs text-slate-500">{entityId}</span>
              </div>
              {(sourceScreen || drillPath.length > 0) && (
                <div className="mb-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                  {sourceScreen && <span className="capitalize">{sourceScreen.replace(/([A-Z])/g, ' $1')}</span>}
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {entityType === 'risk' && <RiskDetailContent risk={getRisk(entityId || '')} drillFromDrawer={drillFromDrawer} />}
          {entityType === 'control' && <ControlDetailContent control={getControl(entityId || '')} drillFromDrawer={drillFromDrawer} />}
          {entityType === 'obligation' && <ObligationDetailContent obligation={getObligation(entityId || '')} drillFromDrawer={drillFromDrawer} />}
          {entityType === 'issue' && <IssueDetailContent issue={getIssue(entityId || '')} drillFromDrawer={drillFromDrawer} />}
          {entityType === 'evidence' && <EvidenceDetailContent entityId={entityId || ''} />}
          {entityType === 'smf' && (
            <SmfDetailContent smf={getSMF(entityId || '')} setSelectedSMFId={setSelectedSMFId} setActiveScreen={setActiveScreen} closeDrawer={closeDrawer} />
          )}
          {entityType === 'auditPack' && (
            <AuditPackDetailContent pack={getAuditPack(entityId || '')} setSelectedPackId={setSelectedPackId} setActiveScreen={setActiveScreen} closeDrawer={closeDrawer} />
          )}
          {entityType === 'aiInsight' && (() => {
            const ins = getInsight(entityId || '');
            return ins ? <AiInsightDetailContent insight={ins} drillFromDrawer={drillFromDrawer} /> : null;
          })()}
          {entityType === 'process' &&
            (() => {
              const proc = getProcess(entityId || '');
              if (!proc) return <EmptyState message="Process not found." />;
              return (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900">{proc.name}</h2>
                  <p className="text-xs leading-relaxed text-slate-600">{proc.description}</p>
                  <p className="font-mono text-[10px] text-slate-500">{proc.id}</p>
                </div>
              );
            })()}
        </div>
      </div>
    </>
  );
}
