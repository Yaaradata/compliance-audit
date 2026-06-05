import React, { useMemo, useState } from "react";
import { FastTagAiLogo } from "@/app/Indian_Process_Audit/_shared/FastTagAiLogo";
import { issuesTheme } from './fastTagDrilldownTheme';
import {
  DrillCrumbBar,
  DrillPeriodFilter,
  InsightSectionHead,
  sortHeroTopicPanels,
} from './fastTagDrilldownUi';
import { DRILL_PERIOD_OPTIONS } from './fastTagDrillPeriod';
import { buildIssuesPeriodSnapshot } from './fastTagIssuesPeriodData';
import {
  IssuesChurnRiskChart,
  IssuesComplaintMixChart,
  IssuesHappinessChart,
  IssuesImpactChart,
  IssuesPartnerScorecardChart,
  IssuesRootCauseActionsChart,
  IssuesSentimentChart,
} from './fastTagIssuesCharts';

/**
 * FASTag — Head of Business
 * Drill-down page for the card: "Is Customer and Partners are happy?"
 *
 * Opens when the happiness card's chevron is clicked. Every section ladders up to
 * whether customers and partners are satisfied with the FASTag experience.
 */

const { C, styleTag } = issuesTheme();

const ISSUES_TOPIC_PANELS = [
  {
    id: "positive",
    buttonLabel: "Positives",
    title: "Positives",
    tone: "positive",
    items: [
      { label: "Happy partners", detail: "Issuing Bank B at 88% partner happiness — lowest strain in the network." },
      { label: "Faster refunds", detail: "Auto-reverse pilot lifted customer satisfaction on duplicate-charge cases 12% WoW." },
      { label: "Retention touch", detail: "8 of 12 unhappy fleet accounts already in KAM happiness outreach." },
    ],
  },
  {
    id: "negative",
    buttonLabel: "Negative",
    title: "Negatives",
    tone: "negative",
    items: [
      { label: "Unhappy fleets", detail: "12 accounts likely to leave; ₹4.2M relationship value at risk." },
      { label: "Strained acquirer", detail: "Acquirer A at 62% partner happiness; 640 cases eroding trust." },
      { label: "Slow refunds", detail: "Refund queue is the top reason customers say they are not happy." },
    ],
  },
  {
    id: "critical",
    buttonLabel: "Critical",
    title: "Critical",
    tone: "critical",
    items: [
      { label: "Double deduction", detail: "1,420 complaints (+38%); ₹47L spend at risk; high churn link." },
      { label: "Blacklist disputes", detail: "980 cases (+62%) on low-balance blocks — reputation drag." },
      { label: "Recharge failure", detail: "1,180 wallet failures (+24%) affecting 4,800 wallets." },
    ],
  },
];

const HERO_AI_BY_TOPIC = {
  positive: {
    title: "Positives",
    toneClass: "dd-hero-ai-positive",
    blocks: [
      {
        tone: "ok",
        label: "Partners",
        points: [
          "Issuing Bank B at 88% partner happiness — lowest strain in the network",
          "Co-brand referral SLA holding above 85% for 3 consecutive weeks",
          "Plaza mis-read rate down 2 pts on top-10 corridors",
        ],
      },
      {
        tone: "ok",
        label: "CX wins",
        points: [
          "Auto-reverse pilot lifted duplicate-charge satisfaction 12% WoW",
          "8 of 12 at-risk fleet accounts already in KAM outreach",
          "First-response SLA improved to 4.2h on wallet failures",
        ],
      },
      {
        tone: "info",
        label: "Retention",
        points: [
          "Would-recommend proxy stable at 41% despite complaint spike",
          "Refund queue clearing faster on UPI rail after gateway fail-over",
          "BPO Vendor Beta reroute freeing 310 backlog cases",
        ],
      },
    ],
  },
  negative: {
    title: "Negatives",
    toneClass: "dd-hero-ai-negative",
    blocks: [
      {
        tone: "warn",
        label: "Customers",
        points: [
          "Happiness fell 9 pts because recharge failures and blacklist disputes dominate",
          "Only 41% would recommend FASTag this week",
          "4.9K open complaints — +38% vs prior period",
        ],
      },
      {
        tone: "warn",
        label: "Partners",
        points: [
          "18 partners sit below the happiness bar",
          "Acquirer recon delays eroding issuer and toll-partner confidence",
          "Plaza mis-reads driving duplicate-deduction narrative",
        ],
      },
      {
        tone: "warn",
        label: "Exposure",
        points: [
          "₹47L spend at risk on double-deduction alone",
          "12 fleet accounts signal closure intent",
          "Social mentions accelerating after week-8 outage",
        ],
      },
    ],
  },
  critical: {
    title: "Critical",
    toneClass: "dd-hero-ai-critical",
    blocks: [
      {
        tone: "warn",
        label: "Double deduction",
        points: [
          "1,420 complaints (+38%); high churn link on 8,900 tags",
          "₹47L spend at risk — top happiness drag",
          "Auto-reverse + acquirer recon SLA is P0",
        ],
      },
      {
        tone: "warn",
        label: "Recharge",
        points: [
          "1,180 wallet failures (+24%) affecting 4,800 wallets",
          "Gateway timeouts are #2 root cause at 26% share",
          "Fail-over gateway + proactive notify needed this week",
        ],
      },
      {
        tone: "info",
        label: "Next steps",
        points: [
          "Stabilise recharge paths and close partner recon gaps first",
          "KAM touch 12 at-risk fleets within 48h",
          "Publish blacklist FAQ to dampen social flare",
        ],
      },
    ],
  },
};

function shortHeroKpiLabel(label) {
  if (/customer happy/i.test(label)) return "Customer";
  if (/partner happy/i.test(label)) return "Partner";
  if (/open complaints/i.test(label)) return "Complaints";
  if (/would recommend/i.test(label)) return "Recommend";
  return label;
}

function heroKpiDeltaTone(delta) {
  if (!delta) return "flat";
  if (/tgt|proxy|vs/i.test(delta)) return "flat";
  if (/▼|↓|−|-\s*\d|flat|0%/i.test(delta)) return "down";
  if (/▲|↑|\+/.test(delta)) return "up";
  return "flat";
}

function heroKpiSparkData(label, snap) {
  if (/customer/i.test(label)) return snap.trend.map((v) => Math.round(v * 0.88));
  if (/partner/i.test(label)) return snap.trend.map((v) => Math.round(v * 0.76));
  if (/complaints/i.test(label)) return [32, 35, 38, 36, 40, 42, 45, 44, 46, 48, 49];
  if (/recommend/i.test(label)) return [48, 47, 46, 45, 44, 43, 42, 42, 41, 41, 41];
  return snap.trend;
}

function KpiMicroSpark({ data, color, prefix }) {
  const w = 120;
  const h = 14;
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const sx = w / Math.max(1, data.length - 1);
  const y = (v) => h - 1.5 - ((v - min) / span) * (h - 3);
  const pts = data.map((v, i) => `${(i * sx).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <div className={`${prefix}-kpi-micro-spark-wrap ${prefix}-kpi-micro-spark-wrap--flex`}>
      <svg
        className={`${prefix}-kpi-micro-spark`}
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Header({ snap }) {
  const [activeTopic, setActiveTopic] = useState("negative");
  const topicPanels = sortHeroTopicPanels(ISSUES_TOPIC_PANELS);
  const aiReadout = HERO_AI_BY_TOPIC[activeTopic] ?? HERO_AI_BY_TOPIC.negative;

  return (
    <div className="dd-panel dd-hero-panel">
      <div className="dd-hero-layout">
        <div className="dd-hero-left">
          <span className="dd-hero-icon" aria-hidden>♥</span>
          <div className="dd-hero-title-stack">
            <div className="dd-hero-title-text">Is Customer and Partners are happy?</div>
            <div className="dd-label dd-hero-subtitle">
              Customers · Partners · Satisfaction · {snap.caption}
            </div>
          </div>
          <div className="dd-hero-metrics">
            <div className="dd-hero-kpis">
              {snap.headline.map((k) => {
                const deltaTone = heroKpiDeltaTone(k.d);
                const sparkData = heroKpiSparkData(k.label, snap);
                return (
                  <div className={`dd-kpi dd-kpi-stat dd-kpi--${k.tone}`} key={k.label}>
                    <span className="dd-kpi-stat-accent" aria-hidden />
                    <div className="dd-kpi-stat-body">
                      <div className="dd-kpi-stat-label-row">
                        <span className="dd-kpi-stat-label" title={k.label}>
                          {shortHeroKpiLabel(k.label)}
                        </span>
                        <span className={`dd-kpi-delta dd-kpi-delta--${deltaTone}`}>{k.d}</span>
                      </div>
                      <div className="dd-kpi-stat-value-row">
                        <span className="dd-kpi-stat-value" style={{ color: k.color }}>
                          {k.v}
                        </span>
                        <KpiMicroSpark data={sparkData} color={k.color} prefix="dd" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`dd-hero-ai dd-hero-ai-expanded ${aiReadout.toneClass}`}
          aria-label={`AI Insights — ${aiReadout.title}`}
        >
          <div className="dd-hero-ai-head">
            <div className="dd-hero-ai-head-main">
              <span className="dd-label dd-hero-ai-title inline-flex items-center gap-1.5">
                <FastTagAiLogo />
                AI Insights
              </span>
              <div className="dd-hero-ai-topic-btns" role="group" aria-label="Happiness signal topics">
                {topicPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    className={`dd-hero-topic-btn dd-hero-topic-btn-${panel.tone}${
                      activeTopic === panel.id ? " active" : ""
                    }`}
                    aria-pressed={activeTopic === panel.id}
                    onClick={() => setActiveTopic(panel.id)}
                  >
                    {panel.buttonLabel}
                  </button>
                ))}
              </div>
            </div>
            <span className="dd-faint dd-hero-ai-confidence">IA read-out · 87% confidence</span>
          </div>
          <div className="dd-hero-ai-grid">
            {aiReadout.blocks.map((block) => (
              <div key={block.label} className={`dd-hero-ai-card ${block.tone}`}>
                <b>{block.label}</b>
                <ul className="dd-hero-ai-points">
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

function ImpactMap({ snap }) {
  return (
    <div className="dd-panel dd-panel--highlight dd-panel--impact">
      <InsightSectionHead
        prefix="dd"
        n="1"
        accent={C.red}
        insight={snap.impactInsight}
        right={<span className="dd-faint" style={{ fontSize: 10 }}>ranked by exposure</span>}
      />
      <IssuesImpactChart rows={snap.impact} />
    </div>
  );
}

function ComplaintBreakdown({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead prefix="dd" n="2" accent={C.amber} insight={snap.complaintInsight} />
      <IssuesComplaintMixChart slices={snap.complaints} />
    </div>
  );
}

function HappinessGauges({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead prefix="dd" n="3" accent={C.red} insight={snap.happinessInsight} />
      <IssuesHappinessChart metrics={snap.happiness} />
    </div>
  );
}

function PartnerScorecard({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead
        prefix="dd"
        n="4"
        accent={C.blue}
        insight={snap.partnerInsight}
        right={<span className="dd-faint" style={{ fontSize: 10 }}>partner happiness</span>}
      />
      <IssuesPartnerScorecardChart partners={snap.partners} />
    </div>
  );
}

function ChurnLinkage({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead prefix="dd" n="5" accent={C.amber} insight={snap.churnInsight} />
      <IssuesChurnRiskChart metrics={snap.churn} note={snap.churnNote} />
    </div>
  );
}

function Reputation({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead prefix="dd" n="6" accent={C.amber} insight={snap.sentimentInsight} />
      <IssuesSentimentChart points={snap.sentiment} tag={snap.sentimentTag} />
    </div>
  );
}

function RootCauseActions({ snap }) {
  return (
    <div className="dd-panel">
      <InsightSectionHead prefix="dd" n="7" accent={C.green} insight={snap.actionsInsight} />
      <IssuesRootCauseActionsChart rootCauses={snap.rootCauses} actions={snap.actions} />
    </div>
  );
}

export default function FastagIssuesDrilldown({ onBack = () => {} }) {
  const [period, setPeriod] = useState("month");
  const snap = useMemo(() => buildIssuesPeriodSnapshot(period), [period]);
  const periodLabel = DRILL_PERIOD_OPTIONS.find((o) => o.id === period)?.label ?? "Month";

  return (
    <div className="dd-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <DrillCrumbBar
        prefix="dd"
        color={C.amber}
        onBack={onBack}
        periodFilter={
          <DrillPeriodFilter
            prefix="dd"
            value={period}
            onChange={setPeriod}
            options={DRILL_PERIOD_OPTIONS}
          />
        }
      >
        ⚡ FASTag · customer & partner happiness · {periodLabel}
      </DrillCrumbBar>

      <div className="dd-stack">
        <Header snap={snap} />

        <div className="dd-grid2">
          <div className="dd-col-stack">
            <ImpactMap snap={snap} />
            <ComplaintBreakdown snap={snap} />
            <PartnerScorecard snap={snap} />
          </div>
          <div className="dd-col-stack">
            <HappinessGauges snap={snap} />
            <ChurnLinkage snap={snap} />
            <Reputation snap={snap} />
            <RootCauseActions snap={snap} />
          </div>
        </div>
      </div>
    </div>
  );
}
