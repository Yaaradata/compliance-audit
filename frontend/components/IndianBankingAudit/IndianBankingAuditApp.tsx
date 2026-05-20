'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MainNavigation,
  PERSONA_DEFAULT_SCREEN,
  SCREEN,
  SCREEN_FUNCTIONAL_SUBTITLE,
  ScreenContainer,
  TopBar,
  type PersonaCode,
  type ScreenCode,
} from './AppShell';
import { AcronymExpansionProvider } from './ori/AcronymExpansion';
import { OriBreadcrumb } from './ori/OriBreadcrumb';
import { DetailDrawer } from './DetailDrawer';
import { auditPacks, controls, screens, testExecutions } from './dataModel';
import type { DrawerEntityType, DrawerState, DrillFromDrawer, OrmCrossNavIntent } from './types';
import { initialDrawer } from './types';

import { AccountabilityLedger } from './screens/AccountabilityLedger';
import { AiInsightsReviewQueue } from './screens/AiInsightsReviewQueue';
import { ControlUniverse } from './screens/ControlUniverse';
import { EvidenceWorkbench } from './screens/EvidenceWorkbench';
import { IncidentRegister } from './screens/IncidentRegister';
import { ExecutiveRiskPostureCockpit } from './screens/ExecutiveRiskPostureCockpit';
import { InspectionReadiness } from './screens/InspectionReadiness';
import { IssueRemediationBoard } from './screens/IssueRemediationBoard';
import { KriMonitoring } from './screens/KriMonitoring';
import { LossDataRegister } from './screens/LossDataRegister';
import { ObligationCoverageMap } from './screens/ObligationCoverageMap';
import { PopulationTesting } from './screens/PopulationTesting';
import { ProcessHealth } from './screens/ProcessHealth';
import { RcaWorkspace } from './screens/RcaWorkspace';
import { RcsaWorkspace } from './screens/RcsaWorkspace';
import { RiskRegister } from './screens/RiskRegister';
import { SourceLineagePage } from './screens/SourceLineagePage';
import { WhatChangedThisWeek } from './screens/WhatChangedThisWeek';
import { PacNoteApprovals } from './screens/PacNoteApprovals';
import { WorkpaperAuditPackBuilder } from './screens/WorkpaperAuditPackBuilder';
import { RegulatoryIntelligenceInbox } from './screens/RegulatoryIntelligenceInbox';
import { DemoModeBar } from './DemoModeBar';
import { DEMO_STEP_COUNT, DEMO_STEPS, DEMO_STORY } from './demoGuidedStory';
import { OriDemoProvider, type OriDemoUiHints } from './OriDemoContext';
import { useOriVersion } from './ori/OriVersionProvider';

export type IndianBankingAuditAppProps = {
  initialPersona?: PersonaCode;
  initialScreen?: ScreenCode;
};

/** Legacy screen code → merged into Control Universe (inline drill-down). */
function normalizeScreen(screen: ScreenCode): ScreenCode {
  return screen === 'controlDrillDown' ? 'controlUniverse' : screen;
}

export default function IndianBankingAuditApp({
  initialPersona = 'cro',
  initialScreen = 'riskPosture',
}: IndianBankingAuditAppProps = {}) {
  const [activePersona, setActivePersonaState] = useState<PersonaCode>(initialPersona);
  const [activeScreen, setActiveScreenState] = useState<ScreenCode>(() => normalizeScreen(initialScreen));
  const setActiveScreen = useCallback((screen: ScreenCode) => {
    setActiveScreenState(normalizeScreen(screen));
  }, []);
  const [drawer, setDrawer] = useState<DrawerState>(initialDrawer());

  // Local selection state lifted for screens that take selected ids as props
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>(testExecutions[0]?.test_id || '');
  const [, setSelectedPackId] = useState<string>(auditPacks[0]?.audit_pack_id || '');
  const [selectedRcaId, setSelectedRcaId] = useState<string | null>(null);
  const [ormCrossNav, setOrmCrossNav] = useState<OrmCrossNavIntent | null>(null);

  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [personaOpenRequested, setPersonaOpenRequested] = useState(false);

  const exitDemo = useCallback(() => {
    setDemoMode(false);
    setDemoStep(1);
    setDrawer(initialDrawer());
    setSelectedRcaId(null);
    setOrmCrossNav(null);
    setActivePersonaState('cro');
    setActiveScreen('riskPosture');
  }, [setActiveScreen]);

  const consumeOrmCrossNav = useCallback(() => setOrmCrossNav(null), []);

  const goOrm = useCallback(
    (intent: OrmCrossNavIntent) => {
      if (demoMode) {
        exitDemo();
        return;
      }
      setOrmCrossNav(intent);
      setActiveScreen(intent.target);
    },
    [demoMode, exitDemo, setActiveScreen]
  );

  // Switching persona routes user to their default home
  const setActivePersona = useCallback((code: PersonaCode) => {
    setActivePersonaState(code);
    setActiveScreen(PERSONA_DEFAULT_SCREEN[code]);
  }, [setActiveScreen]);

  // Drawer helpers
  const openDrawer = useCallback(
    (entityType: DrawerEntityType, entityId: string, sourceScreen: string) => {
      setDrawer({
        isOpen: true,
        entityType,
        entityId,
        sourceScreen,
        drillPath: [],
      });
    },
    []
  );

  const closeDrawer = useCallback(() => setDrawer(initialDrawer()), []);

  const onOpenRcaWorkspace = useCallback((rcaId: string) => {
    setSelectedRcaId(rcaId);
    setActiveScreen('rcaWorkspace');
  }, [setActiveScreen]);

  const drillFromDrawer = useCallback(
    (entityType: DrawerEntityType, entityId: string) => {
      setDrawer((prev) => {
        if (!prev.entityType || !prev.entityId) {
          return {
            isOpen: true,
            entityType,
            entityId,
            sourceScreen: activeScreen,
            drillPath: [],
          };
        }
        return {
          ...prev,
          entityType,
          entityId,
          drillPath: [
            ...prev.drillPath,
            { type: prev.entityType, id: prev.entityId, label: `${prev.entityType} ${prev.entityId}` },
          ],
        };
      });
    },
    [activeScreen]
  );

  const drillBack = useCallback(() => {
    setDrawer((prev) => {
      if (!prev.drillPath.length) return prev;
      const next = prev.drillPath[prev.drillPath.length - 1];
      return {
        ...prev,
        entityType: next.type,
        entityId: next.id,
        drillPath: prev.drillPath.slice(0, -1),
      };
    });
  }, []);

  useEffect(() => {
    if (activeScreen === 'populationTesting' && !selectedTestId && testExecutions.length) {
      setSelectedTestId(testExecutions[0].test_id);
    }
  }, [activeScreen, selectedControlId, selectedTestId]);

  useEffect(() => {
    if (activeScreen !== 'rcaWorkspace' && !demoMode) setSelectedRcaId(null);
  }, [activeScreen, demoMode]);

  const demoHints: OriDemoUiHints | null = useMemo(() => {
    if (!demoMode) return null;
    const minTs = Date.now() - 30 * 86400000;
    return {
      step: demoStep,
      scrollToKriId: demoStep === 2 ? DEMO_STORY.kriId : null,
      incidentFilter:
        demoStep === 3 || demoStep === 4 ? { incidentTypes: ['operational_loss'], minDiscoveredTs: minTs } : null,
      forcedPacNoteId: demoStep === 6 ? DEMO_STORY.pacNoteId : null,
      scrollPacBlocking: demoStep === 6,
      highlightPreventiveActionId: demoStep === 7 ? DEMO_STORY.preventiveActionIds[0] : null,
    };
  }, [demoMode, demoStep]);

  useEffect(() => {
    if (!demoMode) return;
    const cfg = DEMO_STEPS[demoStep - 1];
    if (!cfg) return;
    setActivePersonaState(cfg.persona);
    setActiveScreen(cfg.screen as ScreenCode);
    if (demoStep === 5 || demoStep === 7) {
      setSelectedRcaId(DEMO_STORY.rcaId);
    } else if (demoStep !== 6) {
      setSelectedRcaId(null);
    }
    if (demoStep !== 4) {
      setDrawer(initialDrawer());
    }
  }, [demoMode, demoStep]);

  useEffect(() => {
    if (!demoMode || demoStep !== 4) return;
    const t = window.setTimeout(() => {
      setDrawer({
        isOpen: true,
        entityType: 'incident',
        entityId: DEMO_STORY.incidentId,
        sourceScreen: 'incidentRegister',
        drillPath: [],
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [demoMode, demoStep]);

  useEffect(() => {
    if (!demoMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        exitDemo();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [demoMode, exitDemo]);

  const screenMeta = useMemo(() => {
    const list = Array.isArray(screens) ? screens : [];
    const s = list.find((sc) => sc.code === activeScreen);
    const strap = SCREEN_FUNCTIONAL_SUBTITLE[activeScreen];
    return {
      title: s?.title || SCREEN[activeScreen]?.label || 'Indian Banking Audit',
      subtitle: strap || undefined,
    };
  }, [activeScreen]);

  const { version } = useOriVersion();

  /** Viewport-locked split panes (list/detail): main column uses overflow-hidden + flex fill. */
  const splitFillLayout =
    activeScreen === 'rcaWorkspace' || activeScreen === 'pacNoteApprovals' || activeScreen === 'controlUniverse';
  const cockpitV2Layout =
    version === 'v2' && (activeScreen === 'riskPosture' || activeScreen === 'whatChanged');
  const screenLayout = splitFillLayout ? 'splitFill' : cockpitV2Layout ? 'cockpitV2' : 'default';

  return (
    <OriDemoProvider value={demoHints}>
      <div className={`flex h-screen flex-col bg-slate-100 text-slate-900 ${demoMode ? 'pb-14' : ''}`} data-ori-root>
        <TopBar
          activePersona={activePersona}
          setActivePersona={setActivePersona}
          activeScreen={activeScreen}
          demoMode={demoMode}
          personaOpenRequested={personaOpenRequested}
          onPersonaOpenConsumed={() => setPersonaOpenRequested(false)}
        />
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <MainNavigation
            activePersona={activePersona}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            demoMode={demoMode}
          />
          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${
              splitFillLayout
                ? 'overflow-hidden'
                : 'overflow-y-auto overflow-x-hidden'
            }`}
          >
            <OriBreadcrumb
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              crumbs={
                version === 'v2' && activeScreen === 'whatChanged'
                  ? [{ label: 'What Changed This Week' }]
                  : []
              }
            />
            <AcronymExpansionProvider screenKey={activeScreen}>
              <ScreenContainer
                title={screenMeta.title}
                subtitle={screenMeta.subtitle}
                persona={activePersona}
                layout={screenLayout}
              >
                {renderScreen({
                activeScreen,
                openDrawer,
                drillFromDrawer,
                setActiveScreen,
                selectedControlId,
                setSelectedControlId,
                selectedTestId,
                setSelectedTestId,
                selectedRcaId,
                setSelectedRcaId,
                onOpenRcaWorkspace,
                ormCrossNav,
                consumeOrmCrossNav,
                goOrm,
                })}
              </ScreenContainer>
            </AcronymExpansionProvider>
          </main>
        </div>
        <DetailDrawer
          drawer={drawer}
          closeDrawer={closeDrawer}
          drillFromDrawer={drillFromDrawer}
          drillBack={drillBack}
          setActiveScreen={(s) => setActiveScreen(s as ScreenCode)}
          setSelectedPackId={setSelectedPackId}
          onOpenRcaWorkspace={onOpenRcaWorkspace}
        />
        {demoMode ? (
          <DemoModeBar
            step={demoStep}
            onBack={() => setDemoStep((s) => Math.max(1, s - 1))}
            onNext={() => setDemoStep((s) => Math.min(DEMO_STEP_COUNT, s + 1))}
            onExit={exitDemo}
            onReplay={() => setDemoStep(1)}
          />
        ) : null}
      </div>
    </OriDemoProvider>
  );
}

function renderScreen({
  activeScreen,
  openDrawer,
  drillFromDrawer,
  setActiveScreen,
  selectedControlId,
  setSelectedControlId,
  selectedTestId,
  setSelectedTestId,
  selectedRcaId,
  setSelectedRcaId,
  onOpenRcaWorkspace,
  ormCrossNav,
  consumeOrmCrossNav,
  goOrm,
}: {
  activeScreen: ScreenCode;
  openDrawer: (t: DrawerEntityType, id: string, src: string) => void;
  drillFromDrawer: DrillFromDrawer;
  setActiveScreen: (s: ScreenCode) => void;
  selectedControlId: string | null;
  setSelectedControlId: (id: string | null) => void;
  selectedTestId: string;
  setSelectedTestId: (id: string) => void;
  selectedRcaId: string | null;
  setSelectedRcaId: (id: string | null) => void;
  onOpenRcaWorkspace: (rcaId: string) => void;
  ormCrossNav: OrmCrossNavIntent | null;
  consumeOrmCrossNav: () => void;
  goOrm: (intent: OrmCrossNavIntent) => void;
}) {
  const setScreen = (s: string) => setActiveScreen(s as ScreenCode);

  switch (activeScreen) {
    case 'regulatoryIntelligence':
      return <RegulatoryIntelligenceInbox />;
    case 'riskPosture':
      return <ExecutiveRiskPostureCockpit openDrawer={openDrawer} setActiveScreen={setScreen} goOrm={goOrm} />;
    case 'whatChanged':
      return <WhatChangedThisWeek openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'inspectionReadiness':
      return <InspectionReadiness openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'accountability':
      return <AccountabilityLedger openDrawer={openDrawer} />;
    case 'lossData':
      return <LossDataRegister openDrawer={openDrawer} />;
    case 'kriMonitoring':
      return <KriMonitoring openDrawer={openDrawer} drillFromDrawer={drillFromDrawer} />;
    case 'incidentRegister':
      return (
        <IncidentRegister
          openDrawer={openDrawer}
          ormCrossNav={ormCrossNav}
          consumeOrmCrossNav={consumeOrmCrossNav}
        />
      );
    case 'rcaWorkspace':
      return (
        <RcaWorkspace
          openDrawer={openDrawer}
          selectedRcaId={selectedRcaId}
          setSelectedRcaId={setSelectedRcaId}
          ormCrossNav={ormCrossNav}
          consumeOrmCrossNav={consumeOrmCrossNav}
        />
      );
    case 'rcsaWorkspace':
      return <RcsaWorkspace openDrawer={openDrawer} />;
    case 'riskRegister':
      return <RiskRegister openDrawer={openDrawer} />;
    case 'obligationCoverage':
      return <ObligationCoverageMap openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'controlUniverse':
      return (
        <ControlUniverse
          openDrawer={openDrawer}
          selectedControlId={selectedControlId}
          setSelectedControlId={setSelectedControlId}
        />
      );
    case 'aiInsights':
      return <AiInsightsReviewQueue openDrawer={openDrawer} />;
    case 'pacNoteApprovals':
      return (
        <PacNoteApprovals
          openDrawer={openDrawer}
          onOpenRcaWorkspace={onOpenRcaWorkspace}
          ormCrossNav={ormCrossNav}
          consumeOrmCrossNav={consumeOrmCrossNav}
        />
      );
    case 'issueBoard':
      return <IssueRemediationBoard openDrawer={openDrawer} />;
    case 'sourceLineage':
      return <SourceLineagePage openDrawer={openDrawer} />;
    case 'evidenceWorkbench':
      return <EvidenceWorkbench openDrawer={openDrawer} />;
    case 'populationTesting':
      return (
        <PopulationTesting
          selectedTestId={selectedTestId}
          setSelectedTestId={setSelectedTestId}
          openDrawer={openDrawer}
          setActiveScreen={setScreen}
        />
      );
    case 'workpaperAuditPackBuilder':
      return <WorkpaperAuditPackBuilder openDrawer={openDrawer} />;
    case 'processHealth':
      return <ProcessHealth openDrawer={openDrawer} />;
    default:
      return <div className="text-sm text-slate-500">Screen &quot;{activeScreen}&quot; not implemented.</div>;
  }
}
