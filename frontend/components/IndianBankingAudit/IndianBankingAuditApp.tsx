'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MainNavigation,
  PERSONA_DEFAULT_SCREEN,
  ScreenContainer,
  TopBar,
  type PersonaCode,
  type ScreenCode,
} from './AppShell';
import { DetailDrawer } from './DetailDrawer';
import { auditPacks, controls, screens, testExecutions } from './dataModel';
import type { DrawerEntityType, DrawerState } from './types';
import { initialDrawer } from './types';

import { AccountabilityLedger } from './screens/AccountabilityLedger';
import { AiInsightsReviewQueue } from './screens/AiInsightsReviewQueue';
import { ControlDrillDown } from './screens/ControlDrillDown';
import { ControlUniverse } from './screens/ControlUniverse';
import { EvidenceWorkbench } from './screens/EvidenceWorkbench';
import { ExecutiveRiskPostureCockpit } from './screens/ExecutiveRiskPostureCockpit';
import { InspectionReadiness } from './screens/InspectionReadiness';
import { IssueRemediationBoard } from './screens/IssueRemediationBoard';
import { ObligationCoverageMap } from './screens/ObligationCoverageMap';
import { PopulationTesting } from './screens/PopulationTesting';
import { ProcessHealth } from './screens/ProcessHealth';
import { SourceLineagePage } from './screens/SourceLineagePage';
import { WhatChangedThisWeek } from './screens/WhatChangedThisWeek';
import { WorkpaperAuditPackBuilder } from './screens/WorkpaperAuditPackBuilder';

export default function IndianBankingAuditApp() {
  const [activePersona, setActivePersonaState] = useState<PersonaCode>('cro');
  const [activeScreen, setActiveScreen] = useState<ScreenCode>('riskPosture');
  const [drawer, setDrawer] = useState<DrawerState>(initialDrawer());

  // Local selection state lifted for screens that take selected ids as props
  const [selectedControlId, setSelectedControlId] = useState<string>(controls[0]?.control_id || '');
  const [selectedTestId, setSelectedTestId] = useState<string>(testExecutions[0]?.test_id || '');
  const [, setSelectedPackId] = useState<string>(auditPacks[0]?.audit_pack_id || '');

  // Switching persona routes user to their default home
  const setActivePersona = useCallback((code: PersonaCode) => {
    setActivePersonaState(code);
    setActiveScreen(PERSONA_DEFAULT_SCREEN[code]);
  }, []);

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

  // Pre-select control/test on route changes for nicer demos
  useEffect(() => {
    if (activeScreen === 'controlDrillDown' && !selectedControlId && controls.length) {
      setSelectedControlId(controls[0].control_id);
    }
    if (activeScreen === 'populationTesting' && !selectedTestId && testExecutions.length) {
      setSelectedTestId(testExecutions[0].test_id);
    }
  }, [activeScreen, selectedControlId, selectedTestId]);

  const screenMeta = useMemo(() => {
    const s = screens.find((sc) => sc.code === activeScreen);
    return {
      title: s?.title || 'IndianBankingAudit',
      subtitle: s ? `${s.screen_id} · answers ${s.persona_question_answered} · anchor ${s.anchor_entity}` : undefined,
    };
  }, [activeScreen]);

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900">
      <TopBar activePersona={activePersona} setActivePersona={setActivePersona} activeScreen={activeScreen} />
      <div className="flex flex-1 overflow-hidden">
        <MainNavigation activePersona={activePersona} activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        <main className="flex-1 overflow-y-auto">
          <ScreenContainer title={screenMeta.title} subtitle={screenMeta.subtitle} persona={activePersona}>
            {renderScreen({
              activeScreen,
              openDrawer,
              setActiveScreen,
              selectedControlId,
              setSelectedControlId,
              selectedTestId,
              setSelectedTestId,
            })}
          </ScreenContainer>
        </main>
      </div>
      <DetailDrawer
        drawer={drawer}
        closeDrawer={closeDrawer}
        drillFromDrawer={drillFromDrawer}
        drillBack={drillBack}
        setActiveScreen={(s) => setActiveScreen(s as ScreenCode)}
        setSelectedPackId={setSelectedPackId}
      />
    </div>
  );
}

function renderScreen({
  activeScreen,
  openDrawer,
  setActiveScreen,
  selectedControlId,
  setSelectedControlId,
  selectedTestId,
  setSelectedTestId,
}: {
  activeScreen: ScreenCode;
  openDrawer: (t: DrawerEntityType, id: string, src: string) => void;
  setActiveScreen: (s: ScreenCode) => void;
  selectedControlId: string;
  setSelectedControlId: (id: string) => void;
  selectedTestId: string;
  setSelectedTestId: (id: string) => void;
}) {
  const setScreen = (s: string) => setActiveScreen(s as ScreenCode);

  switch (activeScreen) {
    case 'riskPosture':
      return <ExecutiveRiskPostureCockpit openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'whatChanged':
      return <WhatChangedThisWeek openDrawer={openDrawer} />;
    case 'inspectionReadiness':
      return <InspectionReadiness openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'accountability':
      return <AccountabilityLedger openDrawer={openDrawer} />;
    case 'obligationCoverage':
      return <ObligationCoverageMap openDrawer={openDrawer} setActiveScreen={setScreen} />;
    case 'controlUniverse':
      return (
        <ControlUniverse
          openDrawer={openDrawer}
          setActiveScreen={(s) => {
            if (s === 'controlDrillDown') {
              setActiveScreen('controlDrillDown');
            } else {
              setActiveScreen(s as ScreenCode);
            }
          }}
        />
      );
    case 'controlDrillDown':
      return (
        <ControlDrillDown
          selectedControlId={selectedControlId}
          setSelectedControlId={setSelectedControlId}
          openDrawer={openDrawer}
          setActiveScreen={setScreen}
        />
      );
    case 'aiInsights':
      return <AiInsightsReviewQueue openDrawer={openDrawer} />;
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
