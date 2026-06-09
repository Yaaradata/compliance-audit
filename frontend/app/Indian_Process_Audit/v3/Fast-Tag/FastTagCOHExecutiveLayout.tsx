'use client';

import { useState } from 'react';
import type { AuditControl } from '@/lib/Indian_Process_Audit/types';
import type { FastTagCaseLike } from './fastTagExecutiveMetrics';
import type { FastTagSop } from './fastTagCaseBuilder';
import type { FastTagExecutiveContext } from './fastTagExecutiveTypes';
import FastTagExecutiveDrillDrawer from './FastTagExecutiveDrillDrawer';
import type { ExecDrillState } from './fastTagExecutiveTypes';
import { FastTagCOHFrontPage } from './FastTagGatewayFront';
import type { FastTagGatewayTileId } from './fastTagGatewayData';
import FastTagCOHGatewayDrill, { isCohGatewayDrillAvailable } from './FastTagCOHGatewayDrill';

type Props = {
  ctx: FastTagExecutiveContext;
  cases: FastTagCaseLike[];
  allCases: FastTagCaseLike[];
  controls: AuditControl[];
  sop: FastTagSop;
  getStageHeader: (stage: { id: string; name: string }) => string;
  /** Gateway drills render at dashboard level (immersive — no workspace chrome). */
  onGatewayDrill?: (tileId: FastTagGatewayTileId) => void;
};

export default function FastTagCOHExecutiveLayout({
  ctx,
  cases,
  allCases,
  controls,
  sop,
  getStageHeader,
  onGatewayDrill,
}: Props) {
  const [drill, setDrill] = useState<ExecDrillState>(null);
  const [localGatewayDrill, setLocalGatewayDrill] = useState<FastTagGatewayTileId | null>(null);
  const [regionCode] = useState<string | null>(null);
  const { onOpenEvidence, onNavigate } = ctx;

  const handleTileOpen = (tileId: FastTagGatewayTileId) => {
    if (!isCohGatewayDrillAvailable(tileId)) {
      const nav =
        tileId === 'sales_issuance'
          ? { view: 'cases' as const, caseStage: 'wallet' as const }
          : tileId === 'ecosystem_partner'
            ? { view: 'register' as const, registerFilter: 'needs-attention' as const }
            : { view: 'cases' as const };
      onNavigate({ ...nav, caseRegion: regionCode ?? undefined });
      return;
    }
    if (onGatewayDrill) {
      onGatewayDrill(tileId);
      return;
    }
    setLocalGatewayDrill(tileId);
  };

  if (localGatewayDrill) {
    return (
      <div className="w-full">
        <FastTagCOHGatewayDrill
          drillId={localGatewayDrill}
          cases={allCases}
          onBack={() => setLocalGatewayDrill(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <section aria-label="Head of CX — operations console">
        <FastTagCOHFrontPage
          onNavigate={(req) => onNavigate({ ...req, caseRegion: regionCode ?? req.caseRegion })}
          onTileOpen={handleTileOpen}
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
