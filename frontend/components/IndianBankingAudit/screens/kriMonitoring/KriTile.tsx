'use client';

import { useMemo } from 'react';
import type { KRI } from '../../dataModel';
import { oriFocusRing } from '../../theme';
import { buildKriTileModel } from './buildKriTileModel';
import { isTrendImproving } from './kriCardLogic';
import { KRI_BAND_TOKEN, KRI_C } from './kriMonitoringTokens';
import { KriTileMetricBlock } from './KriTileMetricBlock';

export function KriTile({
  kri,
  onOpen,
  onRiskClick,
  onOwnerClick,
}: {
  kri: KRI;
  onOpen: () => void;
  onRiskClick: (riskId: string) => void;
  onOwnerClick: (seniorManagerId: string) => void;
}) {
  const model = useMemo(() => buildKriTileModel(kri), [kri]);
  const bandTok = KRI_BAND_TOKEN[model.band];
  const trendTok = model.trend === 'flat' ? KRI_C.gray : isTrendImproving(model.trend) ? KRI_C.green : KRI_C.red;

  return (
    <div
      role="button"
      tabIndex={0}
      data-ori-kri-card={kri.kri_id}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-left shadow-sm transition-all duration-150 hover:border-[#D1D5DB] hover:shadow-md ${oriFocusRing}`}
    >
      <div className="h-[2px] shrink-0" style={{ background: bandTok.solid }} />

      <div className="flex items-center gap-1.5 border-b border-[#F3F4F6] px-3 py-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">{model.riskCode}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#111827]">{model.domain}</span>
        <span
          className="shrink-0 rounded px-1.5 py-px text-[8px] font-extrabold uppercase tracking-wide"
          style={{
            background: bandTok.bg,
            color: bandTok.fg,
            border: `1px solid ${bandTok.border}`,
          }}
        >
          {model.band}
        </span>
      </div>

      <div className="px-3 pt-1.5">
        <p className="line-clamp-1 text-[11px] font-medium leading-tight text-[#374151]">{model.name}</p>
        <button
          type="button"
          className={`mt-1 inline-flex max-w-full items-center rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-px text-[9px] font-semibold text-indigo-800 hover:bg-indigo-100 ${oriFocusRing}`}
          onClick={(e) => {
            e.stopPropagation();
            onRiskClick(model.linkedRiskId);
          }}
        >
          <span className="truncate">{model.linkedRiskId}</span>
        </button>
      </div>

      <KriTileMetricBlock model={model} kri={kri} bandFg={bandTok.fg} trendTok={trendTok} />

      {model.insight && (model.band === 'amber' || model.band === 'red') && (
        <p className="line-clamp-1 border-t border-[#F3F4F6] px-3 py-1 text-[10px] leading-snug text-[#6B7280]">
          {model.insight}
        </p>
      )}

      <div className="flex items-center gap-1 border-t border-[#F3F4F6] bg-[#FAFAFA] px-3 py-1.5">
        <button
          type="button"
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[8px] font-bold text-[#4338CA] ${oriFocusRing}`}
          onClick={(e) => {
            e.stopPropagation();
            onRiskClick(model.linkedRiskId);
          }}
          title={model.linkedRiskId}
        >
          {model.code.split('-').slice(1).join('').slice(0, 2) || 'KR'}
        </button>
        {model.seniorManagerId ? (
          <button
            type="button"
            className={`min-w-0 flex-1 truncate text-left text-[10px] text-[#6B7280] hover:text-indigo-700 hover:underline ${oriFocusRing}`}
            onClick={(e) => {
              e.stopPropagation();
              onOwnerClick(model.seniorManagerId!);
            }}
          >
            {model.owner}
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[10px] text-[#6B7280]">{model.owner}</span>
        )}
        <span
          className="shrink-0 rounded px-1 py-px text-[9px] font-bold"
          style={{
            color: trendTok.fg,
            background: trendTok.bg,
            border: `1px solid ${trendTok.border}`,
          }}
        >
          {model.wow.label}
        </span>
      </div>
    </div>
  );
}
