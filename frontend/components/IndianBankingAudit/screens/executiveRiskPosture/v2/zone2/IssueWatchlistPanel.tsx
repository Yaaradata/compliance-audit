'use client';

import { SeverityBadge } from '../../../../primitives';
import type { OpenDrawer } from '../../../../types';
import { COCKPIT, COCKPIT_SURFACE } from '../cockpitTokens';
import { RISK_SCORE_TOOLTIP } from './computeIssueRiskScore';
import { expandOwnerRole, formatIssueDisplayTitle, truncateWords } from './issueWatchlistFormat';
import { RiskScoreIndicator } from './RiskScoreIndicator';
import type { WatchlistIssueRow } from './buildZone2PostureData';

export function IssueWatchlistPanel({
  topIssues,
  resolveOwnerRole,
  openDrawer,
}: {
  topIssues: WatchlistIssueRow[];
  resolveOwnerRole: (issue: WatchlistIssueRow['issue']) => string;
  openDrawer: OpenDrawer;
}) {
  return (
    <div
      style={{ backgroundColor: COCKPIT.cardBg, borderColor: COCKPIT.cardBorder }}
      className={`${COCKPIT_SURFACE.card} ${COCKPIT_SURFACE.cardPad}`}
    >
      <h3 className="mb-2 text-sm font-semibold text-[#111827]">Issue watchlist · top 3</h3>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
            <th className="pb-2 text-left font-semibold">Issue</th>
            <th className="pb-2 text-left font-semibold">Owner</th>
            <th className="pb-2 text-center font-semibold">Sev</th>
            <th className="pb-2 text-right font-semibold" title={RISK_SCORE_TOOLTIP}>
              Risk score
            </th>
          </tr>
        </thead>
        <tbody>
          {topIssues.map(({ issue, riskScore }) => {
            const fullTitle = formatIssueDisplayTitle(issue);
            const displayTitle = truncateWords(fullTitle, 8);
            const owner = expandOwnerRole(resolveOwnerRole(issue) || '—');

            return (
              <tr
                key={issue.issue_id}
                className="cursor-pointer border-t border-[#DDE1E8] hover:bg-[#EFF1F4]"
                style={{ height: 50 }}
                onClick={() => openDrawer('issue', issue.issue_id, 'riskPosture')}
              >
                <td className="py-2 pr-3 align-middle" title={fullTitle}>
                  <div className="font-medium text-[#374151]">{displayTitle}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#9CA3AF]">{issue.issue_id}</div>
                </td>
                <td className="py-2 pr-3 align-middle">
                  <span className="block text-xs text-[#111827]">{owner.title}</span>
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{owner.code}</span>
                </td>
                <td className="py-2 align-middle">
                  <div className="flex w-[60px] justify-center">
                    <SeverityBadge severity={issue.severity} />
                  </div>
                </td>
                <td className="py-2 align-middle">
                  <RiskScoreIndicator score={riskScore} className="ml-auto w-full" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
