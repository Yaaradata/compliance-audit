'use client';

import { AcronymLabel, ACRONYM_TOOLTIPS } from '../../../../ori/AcronymExpansion';
import { COCKPIT, COCKPIT_SURFACE } from '../cockpitTokens';
import type { GovernanceMetric } from './buildZone2PostureData';

const GOV_LABELS: Record<string, { short: string; expanded: string; tooltip: string }> = {
  rts: { short: 'RTS', expanded: 'RTS (Reporting Timeliness Score)', tooltip: ACRONYM_TOOLTIPS.rts },
  saes: { short: 'SAES', expanded: 'SAES (Senior Accountability Evidence Score)', tooltip: ACRONYM_TOOLTIPS.saes },
  aites: { short: 'AITES', expanded: 'AITES (AI Trust & Evidence Score)', tooltip: ACRONYM_TOOLTIPS.aites },
};

function DeepLinkIcon() {
  return (
    <svg className="h-3 w-3 text-indigo-500" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4 2h6v6M10 2 2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function GovernanceHealthStrip({
  metrics,
  rtsContextLine,
}: {
  metrics: GovernanceMetric[];
  rtsContextLine: string;
}) {
  return (
    <div
      style={{ backgroundColor: COCKPIT.cardBg, borderColor: COCKPIT.cardBorder }}
      className={`${COCKPIT_SURFACE.card} ${COCKPIT_SURFACE.cardPad}`}
    >
      <h3 className="mb-2 text-sm font-semibold text-[#111827]">Governance health</h3>
      <div className="flex items-stretch divide-x divide-[#DDE1E8] rounded-lg border border-[#DDE1E8]">
        {metrics.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={m.onNavigate}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-2 text-left hover:bg-[#EFF1F4]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
              {GOV_LABELS[m.id] ? (
                <AcronymLabel
                  id={`gov-${m.id}`}
                  short={GOV_LABELS[m.id].short}
                  expanded={GOV_LABELS[m.id].expanded}
                  tooltip={GOV_LABELS[m.id].tooltip}
                />
              ) : (
                m.label
              )}
            </span>
            <span className="font-mono text-sm font-bold text-[#111827]">{m.value}</span>
            <span className="text-xs text-[#6B7280]" aria-label="Week-over-week trend">
              {m.trend}
            </span>
            <DeepLinkIcon />
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs italic leading-snug text-[#6B7280]">{rtsContextLine}</p>
    </div>
  );
}
