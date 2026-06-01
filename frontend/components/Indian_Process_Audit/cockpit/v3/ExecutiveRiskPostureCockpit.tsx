'use client';

import { useState } from 'react';
import type { CockpitDrillNav } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { getIpaIdFromRccDomainId, meta } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import type { ProcessAuditTabId } from '@/lib/Indian_Process_Audit/types';
import { AiSummaryWallPanel } from './AiSummaryWallPanel';
import { CockpitDomainDrawer } from './CockpitDomainDrawer';
import { IncidentsPanel } from './IncidentsPanel';
import {
  GovernanceHealthPanel,
  IssueWatchlistPanel,
  RegDeadlinesPanel,
  SupervisoryPanel,
} from './GovernancePanels';
import { PostureKpisPanel } from './PostureKpisPanel';
import { RiskAppetitePanel } from './RiskAppetitePanel';
import { RiskDomainHeatmapPanel } from './RiskDomainHeatmapPanel';
import { TopMoversPanel } from './TopMoversPanel';

type Props = {
  /** Navigate to a domain tab (optional — drawer is primary drill). */
  onNavigateDomain?: (domainId: ProcessAuditTabId) => void;
};

/**
 * V3 Overview — Executive Risk Posture Cockpit (CRO / MD&CEO landing).
 * Heatmap and AI wall drill into SOP journey funnel via side drawer.
 */
export default function ExecutiveRiskPostureCockpit({ onNavigateDomain }: Props) {
  const [persona, setPersona] = useState(meta.personas[0]);
  const [nav, setNav] = useState<CockpitDrillNav>(null);

  const drill = (linkId: string | null) => {
    if (!linkId) return;
    setNav({ view: 'domain', domainId: linkId, stageKey: null });
  };

  const band = 'mb-4 grid gap-4';

  return (
    <div className="-mx-1 font-sans text-slate-900">
      <div className="mb-5">
        <h1 className="m-0 text-[26px] font-bold text-slate-900">{meta.title}</h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Acting as <b>{persona}</b> · Data as of {meta.asOf} · {meta.period}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
          <span className="text-[10px] font-bold tracking-wide text-indigo-400">ACTING AS</span>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="cursor-pointer border-0 bg-transparent text-[13px] font-bold text-indigo-900 outline-none"
          >
            {meta.personas.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${band} lg:grid-cols-[1.35fr_1fr]`}>
        <PostureKpisPanel />
        <AiSummaryWallPanel onDrill={drill} />
      </div>

      <div className={`${band} lg:grid-cols-[1.5fr_1fr]`}>
        <RiskAppetitePanel />
        <TopMoversPanel />
      </div>

      <div className={`${band} lg:grid-cols-[1.5fr_1fr]`}>
        <div className="grid gap-4">
          <GovernanceHealthPanel />
          <RegDeadlinesPanel />
        </div>
        <SupervisoryPanel />
      </div>

      <div className={`${band} lg:grid-cols-[1.4fr_1fr]`}>
        <IssueWatchlistPanel onDrill={() => drill(null)} />
        <IncidentsPanel />
      </div>

      <div className={band}>
        <RiskDomainHeatmapPanel onDrill={drill} />
      </div>

      {nav && onNavigateDomain ? (
        <div className="mt-2 text-right">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-600 hover:underline"
            onClick={() => {
              const ipa = getIpaIdFromRccDomainId(nav.domainId);
              if (ipa) onNavigateDomain(ipa);
              setNav(null);
            }}
          >
            Open full domain workspace →
          </button>
        </div>
      ) : null}

      <CockpitDomainDrawer nav={nav} onClose={() => setNav(null)} onNavChange={setNav} />
    </div>
  );
}
