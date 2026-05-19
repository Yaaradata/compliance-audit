'use client';

import { useOriVersion } from '../ori/OriVersionProvider';
import { aggregateARS } from '../dataModel';
import { SectionCard } from '../primitives';
import type { OpenDrawer, SetActiveScreen } from '../types';
import { WhatChangedDeltaLanes } from './whatChanged/WhatChangedDeltaLanes';
import { WhatChangedThisWeekV2 } from './whatChanged/WhatChangedThisWeekV2';

export function WhatChangedThisWeek({
  openDrawer,
  setActiveScreen,
}: {
  openDrawer: OpenDrawer;
  setActiveScreen: SetActiveScreen;
}) {
  const { version } = useOriVersion();

  if (version === 'v2') {
    return <WhatChangedThisWeekV2 openDrawer={openDrawer} setActiveScreen={setActiveScreen} />;
  }

  return (
    <div className="min-w-0 space-y-5">
      <WhatChangedDeltaLanes openDrawer={openDrawer} />

      <SectionCard title="Weekly narrative · auto-drafted" subtitle="AI-generated period summary; human-editable before BRMC">
        <p className="text-sm leading-relaxed text-slate-700">
          This week, the bank&apos;s residual posture moved on three fronts. <strong>R-FC-001 (AML / STR)</strong>{' '}
          deteriorated as KRI-FC-001 (L1 backlog) crossed into red at 287 alerts; this is concentrated at the
          VEND-2024-00203 BPO floor and is being triaged via ISS-2026-009. <strong>R-CD-001 (Digital Lending Conduct)</strong>{' '}
          shows 11,118 KFS-after-acceptance instances on DSA-Newgen — see ISS-2026-085 and AI-013, with CIO veto DE-003
          halting new product launch on that channel. On the positive side, RTS held at on-time for CIMS Q1
          (RS-CIMS-2025-Q1) and CERT-In dry runs continue to clear within 6h. Supervisory readiness aggregate ARS sits
          at <em>{aggregateARS()}</em>; PMLA / FIU lens needs the most attention.
        </p>
      </SectionCard>
    </div>
  );
}
