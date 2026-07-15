// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import {
  groupSetRequirements,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import {
  ForwardCoverageLens,
  CRSACoverageLens,
  ReverseCoverageQuery,
  RegChangeImpactLineage,
} from './_shared';
import {
  EnforcementLens,
  UnassessedNoticeStrip,
  CoverageGapPanelV5,
} from '@/components/UKBankingAudit/v5/coverage';
import { buildEnforcementNotices } from '@/lib/ukbankingaudit/v5/enforcementCoverage';

/** v5-only lens catalog — sixth enforcement tab; shared _shared COVERAGE_LENSES untouched. */
const COVERAGE_LENSES_V5 = [
  { id: 'forward',   label: 'Forward',        sub: 'Obligation → Controls' },
  { id: 'crsa',      label: 'CRSA Coverage',  sub: 'Group Set Requirement → Controls' },
  { id: 'reverse',   label: 'Reverse',        sub: 'Control → Obligations + GSRs' },
  { id: 'gaps',      label: 'Coverage Gaps',  sub: 'Single weak control' },
  { id: 'regchange', label: 'Reg-change Impact', sub: 'Horizon item → downstream lineage' },
  { id: 'enforcement', label: 'Enforcement', sub: 'Notice → mechanism → your controls' },
];

export function ObligationCoverageMapV5({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const [activeLens, setActiveLens] = useState('forward');

  const enforcementNotices = useMemo(
    () => buildEnforcementNotices({ groupSetRequirements: groupSetRequirements || [] }),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cross-persona shared screen</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Obligation Coverage Map</h1>
          <p className="text-sm text-slate-600 mt-1">Forward and reverse traversal of the regulation → obligation → CRSA requirement → control graph.  Pick a lens.</p>
        </div>
      </div>

      <UnassessedNoticeStrip
        notices={enforcementNotices}
        onOpenEvidence={(ref) => openDrawer?.('evidence', ref, 'coverageMap')}
      />

      {/* Lens tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {COVERAGE_LENSES_V5.map(lens => (
          <button key={lens.id} onClick={() => setActiveLens(lens.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap ${
              activeLens === lens.id
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}>
            <div>{lens.label}</div>
            <div className={`text-[10px] font-normal mt-0.5 ${activeLens === lens.id ? "text-indigo-500" : "text-slate-400"}`}>
              {lens.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Active lens body */}
      {activeLens === 'forward'   && <ForwardCoverageLens openDrawer={openDrawer} />}
      {activeLens === 'crsa'      && <CRSACoverageLens openDrawer={openDrawer} setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'reverse'   && <ReverseCoverageQuery openDrawer={openDrawer} setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'gaps'      && <CoverageGapPanelV5 setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'regchange' && <RegChangeImpactLineage openDrawer={openDrawer} />}
      {activeLens === 'enforcement' && <EnforcementLens notices={enforcementNotices} openDrawer={openDrawer} />}
    </div>
  );
}
