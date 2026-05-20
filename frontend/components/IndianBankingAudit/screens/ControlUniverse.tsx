'use client';

import { featuresForVersion } from '../ori/oriVersionConfig';
import { useOriVersion } from '../ori/OriVersionProvider';
import { ControlUniverseClassic } from './v1/ControlUniverseClassic';
import { ControlUniverseV2 } from './ControlUniverseV2';
import type { OpenDrawer, SetActiveScreen } from '../types';

type Props = {
  openDrawer: OpenDrawer;
  selectedControlId: string | null;
  setSelectedControlId: (id: string | null) => void;
  setActiveScreen?: SetActiveScreen;
};

/** Routes to v1 RCM table or v2 inline detail pane. */
export function ControlUniverse({ openDrawer, selectedControlId, setSelectedControlId, setActiveScreen }: Props) {
  const { version } = useOriVersion();
  if (!featuresForVersion(version).controlUniverseInlineDetail) {
    if (!setActiveScreen) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Control universe requires navigation context on this version.
        </div>
      );
    }
    return (
      <ControlUniverseClassic openDrawer={openDrawer} setActiveScreen={setActiveScreen} />
    );
  }
  return (
    <ControlUniverseV2
      openDrawer={openDrawer}
      selectedControlId={selectedControlId}
      setSelectedControlId={setSelectedControlId}
    />
  );
}
