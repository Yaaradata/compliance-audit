'use client';

import { featuresForVersion } from '../ori/oriVersionConfig';
import { useOriVersion } from '../ori/OriVersionProvider';
import { EvidenceWorkbenchClassic } from './v1/EvidenceWorkbenchClassic';
import { EvidenceWorkbenchV2 } from './EvidenceWorkbenchV2';
import type { OpenDrawer } from '../types';

/** Routes to v1 table or v2 centralized evidence repository. */
export function EvidenceWorkbench({ openDrawer }: { openDrawer: OpenDrawer }) {
  const { version } = useOriVersion();
  if (!featuresForVersion(version).evidenceRepositoryV2) {
    return <EvidenceWorkbenchClassic openDrawer={openDrawer} />;
  }
  return <EvidenceWorkbenchV2 openDrawer={openDrawer} />;
}
