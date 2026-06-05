'use client';

import { useState } from 'react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { FastTagExecutiveContext } from './fastTagExecutiveTypes';
import type { ExecDrillState } from './fastTagExecutiveTypes';
import FastTagExecutiveDrillDrawer from './FastTagExecutiveDrillDrawer';
import { FastTagCOHFrontPage } from './FastTagGatewayFront';
type Props = {
  ctx: FastTagExecutiveContext;
  cases: FastTagCaseLike[];
  allCases: FastTagCaseLike[];
  controls: AuditControl[];
  sop: FastTagSop;
  getStageHeader: (stage: { id: string; name: string }) => string;
};

export default function FastTagCOHExecutiveLayout({
  ctx,
  cases,
  allCases,
  controls,
  sop,
  getStageHeader,
}: Props) {
  const [drill, setDrill] = useState<ExecDrillState>(null);
  const [regionCode] = useState<string | null>(null);
  const { onOpenEvidence, onNavigate } = ctx;

  return (
    <div className="w-full space-y-6">
      <section aria-label="Head of CX — operations console">
        <FastTagCOHFrontPage
          onNavigate={(req) => onNavigate({ ...req, caseRegion: regionCode ?? req.caseRegion })}
        />
      </section>

      <FastTagExecutiveDrillDrawer
        drill={drill}
        controls={controls}
        cases={cases}
        regionCode={regionCode}
        persona="coh"
        onClose={() => setDrill(null)}
        onOpenDrill={setDrill}
        onOpenEvidence={onOpenEvidence}
        onNavigate={(req) => {
          setDrill(null);
          onNavigate(req);
        }}
      />
    </div>
  );
}
