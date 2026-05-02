'use client';

import React, { useState } from 'react';
import {
  findById,
  getAuditPack,
  getControl,
  getEvidence,
  getInsight,
  getIssue,
  getObligation,
  getProcess,
  getRisk,
  getSMF,
  navigationItems,
  personas,
  smfHolders,
} from './dataModel';
import { DetailDrawer } from './DetailDrawer';
import { AuditPackBuilder } from './screens/AuditPackBuilder';
import { AiInsightExplorer } from './screens/AiInsightExplorer';
import { ComplianceAuditWorkspace } from './screens/ComplianceAuditWorkspace';
import { CroRiskPostureCockpit } from './screens/CroRiskPostureCockpit';
import { LeadershipControlUniverse } from './screens/LeadershipControlUniverse';
import { PopulationTestWorkspace } from './screens/PopulationTestWorkspace';
import { SmcrReasonableStepsWorkspace } from './screens/SmcrReasonableStepsWorkspace';
import { initialDrawer } from './types';
import type { DrawerState } from './types';

function resolveEntity(type: string | null, id: string | null) {
  if (!type || !id) return null;
  const map: Record<string, (x: string) => unknown> = {
    risk: getRisk,
    control: getControl,
    obligation: getObligation,
    issue: getIssue,
    evidence: getEvidence,
    smf: getSMF,
    auditPack: getAuditPack,
    aiInsight: getInsight,
    process: getProcess,
  };
  const fn = map[type];
  return fn ? fn(id) : null;
}

export default function UKBankingControlTrace() {
  const [activePersona, setActivePersona] = useState('cro');
  const [activeScreen, setActiveScreen] = useState('riskPosture');
  const [activeViewMode, setActiveViewMode] = useState('controls');
  const [drawer, setDrawer] = useState<DrawerState>(initialDrawer);
  const [selectedTestId, setSelectedTestId] = useState('TEST-Q2-AML-002');
  const [selectedSMFId, setSelectedSMFId] = useState('SMF17-PRIYA-PATEL');
  const [selectedPackId, setSelectedPackId] = useState('AP-S165-FCC-001');
  const [timeTravel, setTimeTravel] = useState<{ mode: string; asOfDate: string | null }>({ mode: 'live', asOfDate: null });
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
  const [smfTrails, setSMFTrails] = useState(() => {
    const map: Record<
      string,
      {
        awaiting: { targetType: string; targetId: string; daysOpen: number; raisedDate: string }[];
        trail: { timestamp: string; eventType: string; label: string; evidenceId: string | null }[];
        rss: { score: number; band: string; components: Record<string, number> };
      }
    > = {};
    smfHolders.forEach((s) => {
      map[s.id] = {
        awaiting: [...s.awaitingAcknowledgements],
        trail: [...s.reasonableStepsTrail],
        rss: { ...s.rss, components: { ...s.rss.components } },
      };
    });
    return map;
  });
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);
  const [decisionRationale, setDecisionRationale] = useState('');

  const switchPersona = (id: string) => {
    const p = findById(personas, id);
    setActivePersona(id);
    if (p) setActiveScreen((p as { defaultScreen: string }).defaultScreen);
    setDrawer(initialDrawer());
  };

  const openDrawer = (entityType: string, entityId: string, sourceScreen: string) => {
    setDrawer({ isOpen: true, entityType, entityId, sourceScreen, drillPath: [] });
  };

  const drillFromDrawer = (entityType: string, entityId: string) => {
    setDrawer((prev) => {
      const currentEntity = resolveEntity(prev.entityType, prev.entityId) as { title?: string; name?: string } | null;
      const label = currentEntity?.title || currentEntity?.name || prev.entityId || '';
      return {
        ...prev,
        drillPath: [...prev.drillPath, { type: prev.entityType!, id: prev.entityId!, label }],
        entityType,
        entityId,
      };
    });
  };

  const drillBack = () => {
    setDrawer((prev) => {
      if (!prev.drillPath.length) return { ...prev, isOpen: false };
      const last = prev.drillPath[prev.drillPath.length - 1];
      return { ...prev, entityType: last.type, entityId: last.id, drillPath: prev.drillPath.slice(0, -1) };
    });
  };

  const closeDrawer = () => setDrawer(initialDrawer());

  const captureSMFDecision = (smfId: string, awaiting: { targetType: string; targetId: string }) => {
    if (!decisionRationale.trim()) return;
    setSMFTrails((prev) => {
      const next = { ...prev };
      const cur = { ...next[smfId] };
      cur.awaiting = cur.awaiting.filter((a) => a.targetId !== awaiting.targetId);
      const newEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'acknowledgement',
        label: `Acknowledged ${awaiting.targetType === 'issue' ? awaiting.targetId : awaiting.targetType + ' ' + awaiting.targetId}: ${decisionRationale.slice(0, 80)}`,
        evidenceId: null as string | null,
      };
      cur.trail = [newEvent, ...cur.trail];
      cur.rss = {
        ...cur.rss,
        components: { ...cur.rss.components, issueAwareness: Math.min(100, cur.rss.components.issueAwareness + 14) },
      };
      cur.rss.score = Math.round(Object.values(cur.rss.components).reduce((s, v) => s + v, 0) / 7);
      cur.rss.band = cur.rss.score >= 80 ? 'green' : cur.rss.score >= 60 ? 'amber' : 'red';
      next[smfId] = cur;
      return next;
    });
    setPendingDecisionId(null);
    setDecisionRationale('');
  };

  const navItems = navigationItems.filter((n) => n.visibleForPersonas.includes(activePersona));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-6 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 text-sm font-bold text-white">
              RC
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">
                RiskTrace<span className="text-indigo-600">.uk</span>
              </div>
              <div className="-mt-0.5 text-[10px] text-slate-500">UK Banking Risk · Compliance · Audit</div>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => switchPersona(p.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activePersona === p.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="max-w-md flex-1">
            <input
              type="text"
              placeholder="Search risks, controls, obligations, SMFs…"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setTimeTravel((t) => (t.mode === 'live' ? { mode: 'asOf', asOfDate: '2026-03-31' } : { mode: 'live', asOfDate: null }))
            }
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${timeTravel.mode === 'live' ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
            {timeTravel.mode === 'live' ? 'Live · now' : `As of ${timeTravel.asOfDate}`}
          </button>

          {activePersona === 'doer' && (
            <span className="rounded border border-violet-200 bg-violet-100 px-2 py-1 text-[10px] font-bold tracking-wider text-violet-800">
              2LoD COMPLIANCE
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1 border-t border-slate-100 px-6">
          {navItems.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActiveScreen(n.screen)}
              className={`border-b-2 px-4 py-2 text-xs font-medium transition ${
                activeScreen === n.screen ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-6 py-6">
        {activeScreen === 'riskPosture' && (
          <CroRiskPostureCockpit openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedSMFId={setSelectedSMFId} smfTrails={smfTrails} />
        )}
        {activeScreen === 'controlUniverse' && (
          <LeadershipControlUniverse
            activeViewMode={activeViewMode}
            setActiveViewMode={setActiveViewMode}
            openDrawer={openDrawer}
            filterDomain={filterDomain}
            setFilterDomain={setFilterDomain}
          />
        )}
        {activeScreen === 'complianceWorkspace' && (
          <ComplianceAuditWorkspace setActiveScreen={setActiveScreen} setSelectedTestId={setSelectedTestId} setSelectedPackId={setSelectedPackId} />
        )}
        {activeScreen === 'populationTesting' && (
          <PopulationTestWorkspace
            selectedTestId={selectedTestId}
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            setSelectedPackId={setSelectedPackId}
          />
        )}
        {activeScreen === 'smcrWorkspace' && (
          <SmcrReasonableStepsWorkspace
            selectedSMFId={selectedSMFId}
            setSelectedSMFId={setSelectedSMFId}
            smfTrails={smfTrails}
            pendingDecisionId={pendingDecisionId}
            setPendingDecisionId={setPendingDecisionId}
            decisionRationale={decisionRationale}
            setDecisionRationale={setDecisionRationale}
            captureSMFDecision={captureSMFDecision}
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            setSelectedPackId={setSelectedPackId}
          />
        )}
        {activeScreen === 'auditPackBuilder' && (
          <AuditPackBuilder selectedPackId={selectedPackId} setSelectedPackId={setSelectedPackId} openDrawer={openDrawer} />
        )}
        {activeScreen === 'aiInsights' && <AiInsightExplorer openDrawer={openDrawer} />}
      </main>

      {drawer.isOpen && (
        <DetailDrawer
          drawer={drawer}
          closeDrawer={closeDrawer}
          drillFromDrawer={drillFromDrawer}
          drillBack={drillBack}
          setActiveScreen={setActiveScreen}
          setSelectedSMFId={setSelectedSMFId}
          setSelectedPackId={setSelectedPackId}
        />
      )}
    </div>
  );
}
