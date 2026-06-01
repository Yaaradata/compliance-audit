'use client';

import type { CockpitDrillNav } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { domainById } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { DomainJourneyDrillPanel } from '@/components/Indian_Process_Audit/journey/v3/DomainJourneyDrillPanel';
import { JourneyCaseDrawer } from '@/components/Indian_Process_Audit/journey/v3/JourneyCaseDrawer';
import type { JourneyDrawerState } from '@/components/Indian_Process_Audit/journey/v3/JourneyCaseDrawer';

type Props = {
  nav: CockpitDrillNav;
  onClose: () => void;
  onNavChange: (nav: CockpitDrillNav) => void;
};

export function CockpitDomainDrawer({ nav, onClose, onNavChange }: Props) {
  if (!nav) return null;

  const domain = domainById[nav.domainId];
  if (!domain) {
    return (
      <div className="fixed inset-0 z-[60]">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-slate-900/40"
          onClick={onClose}
        />
        <aside className="absolute right-0 top-0 h-full w-[min(620px,94vw)] bg-white p-6 shadow-2xl">
          <p className="text-center text-sm text-slate-400">No linked process journey for this item.</p>
        </aside>
      </div>
    );
  }

  const drawerState: JourneyDrawerState =
    nav.view === 'case'
      ? { type: 'case', caseId: nav.caseId, from: 'stage' }
      : nav.stageKey
        ? { type: 'stage', stageKey: nav.stageKey }
        : null;

  if (nav.view === 'case') {
    return (
      <JourneyCaseDrawer
        domain={domain}
        state={drawerState}
        onClose={onClose}
        onOpenCase={(caseId) => onNavChange({ view: 'case', domainId: nav.domainId, caseId })}
        onBackToStage={() => onNavChange({ view: 'domain', domainId: nav.domainId, stageKey: null })}
      />
    );
  }

  const selectedStage = nav.view === 'domain' ? nav.stageKey : null;

  const selectStage = (key: string) => {
    const next = selectedStage === key ? null : key;
    onNavChange({
      view: 'domain',
      domainId: nav.domainId,
      stageKey: next,
    });
  };

  const closeStageDrill = () => {
    onNavChange({ view: 'domain', domainId: nav.domainId, stageKey: null });
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]">
        <button
          type="button"
          aria-label="Close drawer"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          onClick={onClose}
        />
        <aside className="absolute right-0 top-0 flex h-full w-[min(620px,94vw)] flex-col overflow-y-auto bg-white p-5 shadow-2xl">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="mt-1.5">
            <DomainJourneyDrillPanel
              domain={domain}
              selectedStage={selectedStage}
              onSelectStage={selectStage}
              onOpenCase={(caseId) =>
                onNavChange({ view: 'case', domainId: nav.domainId, caseId })
              }
            />
          </div>
        </aside>
      </div>

      {selectedStage ? (
        <JourneyCaseDrawer
          domain={domain}
          state={{ type: 'stage', stageKey: selectedStage }}
          layerClass="z-[70]"
          onClose={closeStageDrill}
          onOpenCase={(caseId) =>
            onNavChange({ view: 'case', domainId: nav.domainId, caseId })
          }
          onBackToStage={() =>
            onNavChange({
              view: 'domain',
              domainId: nav.domainId,
              stageKey: selectedStage,
            })
          }
        />
      ) : null}
    </>
  );
}
