import React, { useMemo, useState } from 'react';
import { FastTagAiLogo } from '@/app/Indian_Process_Audit/_shared/FastTagAiLogo';
import { DrillOpsKpiGrid } from './fastTagDrillOpsKpi';
import { cxJourneyTheme } from './fastTagDrilldownTheme';
import {
  DrillCrumbBar,
  DrillPeriodFilter,
  InsightSectionHead,
  sortHeroTopicPanels,
} from './fastTagDrilldownUi';
import { DRILL_PERIOD_OPTIONS } from './fastTagDrillPeriod';
import { buildCxJourneyPeriodSnapshot } from './fastTagCxJourneyPeriodData';
import {
  CxChannelDropoff,
  CxComplaintRatioTrack,
  CxContactMixDonut,
  CxImpactAndActions,
  CxStageFrictionChart,
  CxStageHotspotBadges,
  CxStruggleRankCard,
} from './fastTagCxJourneyViz';

/**
 * FASTag — Head of CX / HoB journey friction drill-down
 *
 * Four distinct executive questions — each with one visualization type:
 *   1. Top 5 customer struggles — compact ranked list (#1–#5)
 *   2. Stage friction + contact share (combo chart)
 *   3. Contact mix (donut) + channel drop-off (bars)
 *   4. Business impact KPIs + P0 action cards
 */

const { C, styleTag } = cxJourneyTheme();

const HERO_AI_BY_TOPIC = {
  positive: {
    title: 'Positives',
    toneClass: 'jx-hero-ai-positive',
    blocks: [
      {
        tone: 'ok',
        label: 'Self-serve',
        points: [
          'Self-served contacts at 57% (+3 pts WoW) — toll queries mostly deflected in-app',
          'Eligibility struggle index 18 — smoothest top-of-funnel NETC stage this period',
          'Activation-stage effort flat after FAQ push — no new spike vs prior month',
        ],
      },
      {
        tone: 'ok',
        label: 'Channels',
        points: [
          'Branch-assisted path lowest drop-off at 14% — best completion rate',
          'Mapper stage index 36 — lowest friction mid-funnel',
          'Web portal abandonment 22% — below IVR and app on journey exits',
        ],
      },
      {
        tone: 'info',
        label: 'Watch',
        points: [
          'Contact rate 2.1% of active tags — within band but trending up',
          'Annual Pass holders less affected by wallet-recharge friction',
          '#FASTagFail social volume monitored — blacklist narrative contained so far',
        ],
      },
    ],
  },
  negative: {
    title: 'Negatives',
    toneClass: 'jx-hero-ai-negative',
    blocks: [
      {
        tone: 'warn',
        label: 'Stage hotspots',
        points: [
          'KYC index 81 — #1 struggle; 34% of all journey contacts',
          'Wallet index 67 — #2 hotspot; min-balance & recharge failures dominate VoC',
          'KYC + Wallet together = 56% of contacts — fix both, not one',
        ],
      },
      {
        tone: 'warn',
        label: 'Friction volume',
        points: [
          'KYC reject loop 1,240/day (+34%) — steepest volume rise this period',
          'Recharge not credited 980/day (+24%) — second-largest daily intake',
          'Blacklist surprise +62% — fastest-growing toll-stage complaint theme',
        ],
      },
      {
        tone: 'warn',
        label: 'Effort & channels',
        points: [
          'High-effort contacts 43% (+7 pts WoW) — outpacing self-serve gains',
          'IVR abandonment 41% at recharge step — voice cannot carry wallet failures',
          'App KYC upload step 34% drop — OCR reject loop confirmed in tickets',
        ],
      },
    ],
  },
  critical: {
    title: 'Critical',
    toneClass: 'jx-hero-ai-critical',
    blocks: [
      {
        tone: 'warn',
        label: 'P0 fixes',
        points: [
          'Ship KYC inline validation + assisted-KYC nudge before next peak window',
          'Live recharge status UI + auto-reconcile — closes #2 friction loop',
          'Auto-recharge default + 2-stage low-balance alerts on blacklist path',
        ],
      },
      {
        tone: 'warn',
        label: 'Business cost',
        points: [
          '412 stuck in onboarding — ~28K lost activations/mo if trend holds',
          '₹86Cr idle float in dormant wallets tied to journey drop-off',
          'High-effort users 2.4× churn risk vs low-effort cohort',
        ],
      },
      {
        tone: 'info',
        label: 'Owners',
        points: [
          'Product / Onboarding owns KYC loop — 34% of friction volume',
          'Payments owns recharge-not-reflected — 24% contact reduction potential',
          'Lifecycle / CRM on blacklist alerts — fastest complaint reduction lever',
        ],
      },
    ],
  },
};

function shortHeroKpiLabel(label) {
  if (/high effort/i.test(label)) return 'High effort';
  if (/self-served/i.test(label)) return 'Self-served';
  if (/stuck/i.test(label)) return 'Stuck';
  if (/contact rate/i.test(label)) return 'Contact rate';
  return label;
}

function Header({ snap }) {
  const [activeTopic, setActiveTopic] = useState('critical');
  const topicPanels = sortHeroTopicPanels([
    { id: 'positive', buttonLabel: 'Positives', tone: 'positive' },
    { id: 'negative', buttonLabel: 'Negative', tone: 'negative' },
    { id: 'critical', buttonLabel: 'Critical', tone: 'critical' },
  ]);
  const aiReadout = HERO_AI_BY_TOPIC[activeTopic] ?? HERO_AI_BY_TOPIC.critical;

  return (
    <div className="jx-panel jx-hero-panel">
      <div className="jx-hero-layout">
        <div className="jx-hero-left">
          <div className="jx-hero-metrics">
            <DrillOpsKpiGrid prefix="jx" kpis={snap.headline} shortLabel={shortHeroKpiLabel} />
          </div>
        </div>

        <div
          className={`jx-hero-ai jx-hero-ai-expanded ${aiReadout.toneClass}`}
          aria-label={`AI Insights — ${aiReadout.title}`}
        >
          <div className="jx-hero-ai-head">
            <div className="jx-hero-ai-head-main">
              <span className="jx-label jx-hero-ai-title inline-flex items-center gap-1.5">
                <FastTagAiLogo />
                AI Insights
              </span>
              <div className="jx-hero-ai-topic-btns" role="group" aria-label="Journey signal topics">
                {topicPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    className={`jx-hero-topic-btn jx-hero-topic-btn-${panel.tone}${
                      activeTopic === panel.id ? ' active' : ''
                    }`}
                    aria-pressed={activeTopic === panel.id}
                    onClick={() => setActiveTopic(panel.id)}
                  >
                    {panel.buttonLabel}
                  </button>
                ))}
              </div>
            </div>
            <span className="jx-faint jx-hero-ai-confidence">IA read-out · 87% confidence</span>
          </div>
          <p className="jx-hero-ai-verdict">{snap.verdict}</p>
          <div className="jx-hero-ai-grid">
            {aiReadout.blocks.map((block) => (
              <div key={block.label} className={`jx-hero-ai-card ${block.tone}`}>
                <b>{block.label}</b>
                <ul className="jx-hero-ai-points">
                  {block.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FastagCXJourneyDrilldown({ onBack = () => {} }) {
  const [period, setPeriod] = useState('month');
  const snap = useMemo(() => buildCxJourneyPeriodSnapshot(period), [period]);

  return (
    <div className="jx-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <DrillCrumbBar
        prefix="jx"
        onBack={onBack}
        periodFilter={
          <DrillPeriodFilter
            prefix="jx"
            value={period}
            onChange={setPeriod}
            options={DRILL_PERIOD_OPTIONS}
          />
        }
      >
        <span className="jx-crumb-icon" aria-hidden>
          ◔
        </span>
        <span className="jx-crumb-text">Where are customers struggling in the journey?</span>
      </DrillCrumbBar>

      <div className="jx-stack">
        <Header snap={snap} />

        <div className="jx-grid2">
          <div className="jx-col-stack">
            <div className="jx-panel jx-panel--board">
              <CxStruggleRankCard prefix="jx" rows={snap.struggles} period={period} caption={snap.caption} />
            </div>

            <div className="jx-panel">
              <InsightSectionHead
                prefix="jx"
                n="2"
                accent={C.amber}
                insight={snap.q2}
                right={<CxStageHotspotBadges prefix="jx" stages={snap.stages} />}
              />
              <CxStageFrictionChart prefix="jx" C={C} stages={snap.stages} />
            </div>
          </div>

          <div className="jx-col-stack">
            <div className="jx-panel">
              <InsightSectionHead prefix="jx" n="3" accent={C.teal} insight={snap.q3} />
              <CxComplaintRatioTrack prefix="jx" C={C} data={snap.complaintRatio} stages={snap.stages} />
              <div className="jx-jx-channel-split">
                <CxContactMixDonut prefix="jx" stages={snap.stages} />
                <CxChannelDropoff prefix="jx" rows={snap.channels} />
              </div>
            </div>

            <div className="jx-panel">
              <InsightSectionHead prefix="jx" n="4" accent={C.violet} insight={snap.q4} />
              <CxImpactAndActions
                prefix="jx"
                C={C}
                impact={snap.impact}
                actions={snap.actions}
                struggles={snap.struggles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
