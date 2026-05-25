'use client';

import { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import {
  DomainAuditWorkspace,
  type DomainWorkspaceExtraTab,
} from '@/components/Indian_Process_Audit/ProcessAuditDashboard';
import { getFastTagAuditorFocus } from './fastTagAuditContent';
import { buildFastTagEvidence } from './buildFastTagEvidence';
import { getFastTagAuditBundle, getFastTagOverviewStrip } from './auditData';
import FastTagTollSettlementView from './FastTagTollSettlementView';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';

type Props = {
  onOpenEvidence: (control: AuditControl, domainLabel: string) => void;
};

function FastTagResidualStrip() {
  const { compliance, severityCounts: c, posture } = getFastTagOverviewStrip();

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/50 sm:px-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-xs text-slate-700 sm:text-sm">
        <span>
          Domain compliance{' '}
          <strong className="text-lg tabular-nums text-emerald-600 sm:text-xl">{compliance}%</strong>
        </span>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <span className="tabular-nums">
          Critical <strong className="text-red-600">{c.Critical}</strong>
        </span>
        <span className="tabular-nums">
          High <strong className="text-amber-600">{c.High}</strong>
        </span>
        <span className="tabular-nums">
          Medium <strong className="text-sky-600">{c.Medium}</strong>
        </span>
        <span className="tabular-nums">
          Low <strong className="text-emerald-600">{c.Low}</strong>
        </span>
        <span className="w-full text-sm font-semibold text-slate-900 sm:ml-auto sm:w-auto">
          Posture: {posture}
        </span>
      </div>
    </div>
  );
}

export default function FastTagAuditDashboard({ onOpenEvidence }: Props) {
  const bundle = getFastTagAuditBundle();
  const ft11 = useMemo(() => bundle.controls.find((c) => c.id === 'FT-11'), [bundle.controls]);

  const extraTabs = useMemo<DomainWorkspaceExtraTab[]>(
    () => [
      {
        id: 'toll',
        label: 'Toll settlement',
        icon: Landmark,
        content: (
          <FastTagTollSettlementView ft11Control={ft11} onOpenEvidence={onOpenEvidence} />
        ),
      },
    ],
    [ft11, onOpenEvidence],
  );

  return (
    <div className="space-y-5">
      <FastTagResidualStrip />
      <DomainAuditWorkspace
        domainId={bundle.domainId}
        domainLabel={bundle.domainLabel}
        controls={bundle.controls}
        sop={bundle.sop}
        cases={bundle.cases}
        entity={bundle.entity}
        journeyTitle={bundle.journeyTitle}
        getStageHeader={bundle.getStageHeader}
        controlExceptionLabels={bundle.controlExceptionLabels}
        getAuditorFocusForControl={getFastTagAuditorFocus}
        buildEvidence={buildFastTagEvidence}
        onOpenEvidence={onOpenEvidence}
        defaultView="register"
        registerControlsFirst
        extraTabs={extraTabs}
      />
    </div>
  );
}
