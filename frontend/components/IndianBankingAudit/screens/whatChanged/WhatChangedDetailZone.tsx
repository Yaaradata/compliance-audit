'use client';

import { Chip } from '../../primitives';
import { bandText } from '../../theme';
import type { OpenDrawer } from '../../types';
import {
  buildWcwControlFailureDetails,
  buildWcwEvidenceQualityFlags,
  buildWcwFullIssueList,
  buildWcwKriBandRows,
} from './buildWcwDetailZoneData';
import { severityBadgeStyle } from './formatWcwIssues';
import { formatRelativeAgeFromDays } from './formatWcwRelativeTime';

function scrollToZone1() {
  document.getElementById('wcw-zone1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Pass 6 — Scroll Zone 2 one-down detail layer. */
export function WhatChangedDetailZone({ openDrawer }: { openDrawer: OpenDrawer }) {
  const controlDetails = buildWcwControlFailureDetails();
  const evidenceFlags = buildWcwEvidenceQualityFlags();
  const { issues: fullIssues, total: issueTotal } = buildWcwFullIssueList();
  const kriRows = buildWcwKriBandRows();

  return (
    <section id="wcw-detail-zone" className="wcw-detail-zone w-full min-w-0 overflow-x-hidden bg-[#FAFAFA]">
      <header className="wcw-detail-sticky-header">
        <span className="truncate font-medium text-[#374151]">
          Detail view — for Head of Operational Risk
        </span>
        <button
          type="button"
          onClick={scrollToZone1}
          className="wcw-link shrink-0 border-0 bg-transparent p-0 hover:underline"
        >
          Back to top ↑
        </button>
      </header>

      <div className="wcw-detail-content">
        {/* Section A — control testing detail */}
        <section className="wcw-detail-section" aria-labelledby="wcw-control-detail-heading">
          <h2 id="wcw-control-detail-heading" className="wcw-section-header">
            Control testing detail — Head of Operational Risk view
          </h2>
          <p className="wcw-section-subtext">Full CES movement data with system references</p>
          {controlDetails.length ? (
            <ul className="mt-4 space-y-3">
              {controlDetails.map((ci) => (
                <li key={ci.control_instance_id}>
                  <button
                    type="button"
                    onClick={() => openDrawer('controlInstance', ci.control_instance_id, 'whatChanged')}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:border-violet-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip label={ci.control_id} tone="indigo" size="xs" />
                      <span className="text-[10px] font-bold text-[#DC2626]">FAIL</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#6B7280]">
                      {ci.control_instance_id}
                      {ci.subject_id ? ` · ${ci.subject_id}` : ''}
                    </div>
                    <p className="mt-2 text-[13px] font-medium text-[#111827]">{ci.fail_reason || 'Control effectiveness failure'}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="wcw-detail-empty">No control failures recorded this week.</p>
          )}
        </section>

        {/* Section B — evidence quality */}
        <section className="wcw-detail-section" aria-labelledby="wcw-evidence-quality-heading">
          <h2 id="wcw-evidence-quality-heading" className="wcw-section-header">
            Evidence quality · AI Tier 2 signals
          </h2>
          {evidenceFlags.length ? (
            <ul className="mt-4 space-y-3">
              {evidenceFlags.map((flag) => (
                <li key={flag.insight.ai_insight_id}>
                  <button
                    type="button"
                    onClick={() => openDrawer('aiInsight', flag.insight.ai_insight_id, 'whatChanged')}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-left transition-colors hover:border-sky-300"
                    title={flag.detailTooltip}
                  >
                    <span className="text-[13px] font-medium text-[#111827]">{flag.displayText}</span>
                    <span className="mt-1 block font-mono text-[11px] text-[#9CA3AF]">
                      {flag.insight.ai_insight_id} · {flag.insight.signal_id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="wcw-detail-empty">No Tier 2 evidence quality signals this week.</p>
          )}
        </section>

        {/* Section C — full issue list */}
        <section className="wcw-detail-section" aria-labelledby="wcw-full-issues-heading">
          <h2 id="wcw-full-issues-heading" className="wcw-section-header">
            All new issues · {issueTotal} this week
          </h2>
          {fullIssues.length ? (
            <ul className="mt-4 space-y-3">
              {fullIssues.map((issue) => {
                const sev = severityBadgeStyle(issue.severity);
                return (
                  <li key={issue.issue_id}>
                    <button
                      type="button"
                      onClick={() => openDrawer('issue', issue.issue_id, 'whatChanged')}
                      className="flex w-full min-w-0 flex-col rounded-lg border border-[#E5E7EB] px-4 py-3 text-left transition-colors hover:border-[#DC2626]/40"
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: sev.accent,
                        backgroundColor: sev.tint,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}
                        >
                          {sev.label}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF]">
                          {formatRelativeAgeFromDays(issue.ageing_days)}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] font-semibold leading-snug text-[#111827]">{issue.displayTitle}</p>
                      <p className="mt-0.5 font-mono text-[11px] font-medium text-[#6B7280]">{issue.issue_id}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="wcw-detail-empty">No new issues opened this week.</p>
          )}
        </section>

        {/* Section D — KRI bands */}
        <section className="wcw-detail-section" aria-labelledby="wcw-kri-bands-heading">
          <h2 id="wcw-kri-bands-heading" className="wcw-section-header">
            KRI bands · All indicators
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">
                  <th className="px-4 py-2.5">KRI</th>
                  <th className="px-4 py-2.5">Domain</th>
                  <th className="px-4 py-2.5">Current band</th>
                  <th className="px-4 py-2.5">WoW change</th>
                </tr>
              </thead>
              <tbody>
                {kriRows.map((row) => (
                  <tr key={row.kriId} className="border-b border-[#F3F4F6] last:border-b-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-[#111827]">{row.name}</div>
                      <div className="font-mono text-[11px] text-[#9CA3AF]">{row.kriId}</div>
                    </td>
                    <td className="px-4 py-2.5 text-[#374151]">{row.domainLabel}</td>
                    <td className={`px-4 py-2.5 font-semibold capitalize ${bandText(row.currentBand)}`}>
                      {row.currentBand}
                    </td>
                    <td className="px-4 py-2.5 text-[#374151]">{row.wowChange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
