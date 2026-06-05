import React, { useEffect, useMemo, useState } from "react";
import { FastTagAiLogo } from "@/app/Indian_Process_Audit/_shared/FastTagAiLogo";
import { DrillOpsKpiGrid } from './fastTagDrillOpsKpi';
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
  IssuesAttritionChart,
  IssuesLowRatingChart,
  IssuesComplaintSpikeChart,
  IssuesCxDirectionChart,
  IssuesResolutionThroughputChart,
} from './fastTagIssuesCharts';
import {
  IssuesComplaintFilterToggle,
  IssuesCxDirectionLegend,
  IssuesLossViewToggle,
  IssuesRatingBandToggle,
} from './fastTagIssuesViz';

/**
 * FASTag — Head of Business · Customer & partner experience
 *
 * Four executive questions, each with dedicated data + visualization:
 *  1) Is customer experience improving or getting worse?
 *  2) Are complaints increasing in any region/channel?
 *  3) Where are we losing customers & partners?
 *  4) Complaints vs resolving — are we keeping up with time?
 *  5) What % of users are giving low ratings (1–2 stars)?
 */

const { C, styleTag } = issuesTheme();

const Q1 = "Is customer experience improving or getting worse?";
const Q2 = "Are complaints increasing in any region/channel?";
const Q3 = "Where are we losing customers & Partners?";
const Q4 = "Complaints vs resolving and how we keep up with time?";
const Q5 = "What % of users are giving low ratings (1–2 stars)?";

const ISSUES_TOPIC_PANELS = [
  {
    id: "positive",
    buttonLabel: "Positives",
    title: "Positives",
    tone: "positive",
    items: [
      { label: "First response", detail: "Median first response at 4.2h — within 4h target on wallet failures." },
      { label: "Stable issuer", detail: "Issuing Bank B health 88% — only partner not signalling attrition." },
      { label: "East region", detail: "East complaints +12% — slowest regional acceleration." },
    ],
  },
  {
    id: "negative",
    buttonLabel: "Negative",
    title: "Negatives",
    tone: "negative",
    items: [
      { label: "CX deteriorating", detail: "Customer score down 11 pts since W1; partner score tracking lower in parallel." },
      { label: "Regional spikes", detail: "West +42% and social channel +61% — both crossed +30% alert threshold." },
      { label: "B2B exposure", detail: "12 fleet accounts at risk with ₹4.2M annual spend exposure." },
    ],
  },
  {
    id: "critical",
    buttonLabel: "Critical",
    title: "Critical",
    tone: "critical",
    items: [
      { label: "Resolution gap", detail: "Inflow beat outflow every week since W5 — 18 days to clear backlog." },
      { label: "Acquirer attrition", detail: "Acquirer Bank A health 62% — recon SLA breach eroding issuer trust." },
      { label: "SLA breach", detail: "18% of cases past committed window; median resolve 3.8d vs 2.5d target." },
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
        label: "CX holding",
        points: [
          "First-response SLA within target on wallet-failure corridor",
          "East region slowest complaint acceleration at +12%",
          "Issuing Bank B stable — no attrition signal",
        ],
      },
      {
        tone: "ok",
        label: "Channels",
        points: [
          "B2B fleet portal +14% — only channel below +30% threshold",
          "Central region +8% — lowest regional pressure",
          "≤4h resolution bucket holds 42% of closed cases",
        ],
      },
      {
        tone: "info",
        label: "Watch",
        points: [
          "Retail wallet segment: 34 at-risk but only 9 churned in 30d",
          "Annual Pass holders: blacklist disputes containable with FAQ push",
          "Social flare moderating after W10 but still elevated",
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
        label: "Q1 · Experience",
        points: [
          "Customer CX score fell from 70 → 59 — experience is getting worse",
          "CSAT, NPS proxy, and FCR all down 7–9 pts vs prior period",
          "Partner CX tracking customer decline — joint SLA pressure",
        ],
      },
      {
        tone: "warn",
        label: "Q2 · Complaints",
        points: [
          "4 of 5 regions rising; West +42% led by double deduction",
          "Social / email +61% — fastest channel acceleration",
          "Partner / issuer channel +48% — acquirer recon surfacing",
        ],
      },
      {
        tone: "warn",
        label: "Q3 · Loss",
        points: [
          "12 B2B fleet accounts at risk — ₹4.2M spend exposure",
          "Acquirer A and BPO Beta in critical attrition zone",
          "Retail wallet: 34 at-risk on recharge failure loop",
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
        label: "Q4 · Resolution",
        points: [
          "Complaints in exceed resolved out every week since W5",
          "Backlog 3.4K — 18 days to clear at current resolve rate",
          "Median resolution 3.8d vs 2.5d target; 18% SLA breached",
        ],
      },
      {
        tone: "warn",
        label: "Root cause",
        points: [
          "Acquirer recon delays drive both complaint spike and slow close",
          "Gateway timeouts on recharge — second-largest inflow source",
          "BPO queue overflow — KYC cases aging past SLA",
        ],
      },
      {
        tone: "info",
        label: "P0",
        points: [
          "Surge resolve capacity on West double-deduction queue",
          "Auto-reverse + acquirer recon SLA within 48h",
          "KAM outreach to 12 at-risk fleets before churn window closes",
        ],
      },
    ],
  },
};

function shortHeroKpiLabel(label) {
  if (/cx score/i.test(label)) return "CX score";
  if (/complaint inflow/i.test(label)) return "Inflow";
  if (/at-risk/i.test(label)) return "At risk";
  if (/backlog/i.test(label)) return "Backlog";
  return label;
}

function Header({ snap }) {
  const [activeTopic, setActiveTopic] = useState("negative");
  const topicPanels = sortHeroTopicPanels(ISSUES_TOPIC_PANELS);
  const aiReadout = HERO_AI_BY_TOPIC[activeTopic] ?? HERO_AI_BY_TOPIC.negative;

  return (
    <div className="dd-panel dd-hero-panel">
      <div className="dd-hero-layout">
        <div className="dd-hero-left">
          <div className="dd-hero-metrics">
            <DrillOpsKpiGrid prefix="dd" kpis={snap.headline} shortLabel={shortHeroKpiLabel} />
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
              <div className="dd-hero-ai-topic-btns" role="group" aria-label="Experience signal topics">
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

export default function FastagIssuesDrilldown({ onBack = () => {} }) {
  const [period, setPeriod] = useState("month");
  const [q3View, setQ3View] = useState("customers");
  const [q4Filter, setQ4Filter] = useState("all");
  const [q5Band, setQ5Band] = useState("low");
  const snap = useMemo(() => buildIssuesPeriodSnapshot(period), [period]);

  useEffect(() => {
    setQ3View("customers");
    setQ4Filter("all");
    setQ5Band("low");
  }, [period]);

  return (
    <div className="dd-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <DrillCrumbBar
        prefix="dd"
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
        <span className="dd-crumb-icon" aria-hidden>
          ♥
        </span>
        <span className="dd-crumb-text">Is Customer and Partners are happy?</span>
      </DrillCrumbBar>

      <div className="dd-stack">
        <Header snap={snap} />

        <div className="dd-grid2">
          <div className="dd-col-stack">
            <div className="dd-panel dd-panel--highlight">
              <InsightSectionHead
                prefix="dd"
                n="1"
                accent={C.red}
                insight={Q1}
                right={<IssuesCxDirectionLegend prefix="dd" />}
              />
              <IssuesCxDirectionChart data={snap.q1} />
            </div>

            <div className="dd-panel">
              <InsightSectionHead
                prefix="dd"
                n="3"
                accent={C.red}
                insight={Q3}
                right={
                  <IssuesLossViewToggle prefix="dd" view={q3View} onViewChange={setQ3View} />
                }
              />
              <IssuesAttritionChart data={snap.q3} view={q3View} />
            </div>

            <div className="dd-panel">
              <InsightSectionHead
                prefix="dd"
                n="5"
                accent={C.violet}
                insight={Q5}
                right={
                  <IssuesRatingBandToggle prefix="dd" band={q5Band} onBandChange={setQ5Band} />
                }
              />
              <IssuesLowRatingChart data={snap.q5} band={q5Band} />
            </div>
          </div>

          <div className="dd-col-stack">
            <div className="dd-panel">
              <InsightSectionHead
                prefix="dd"
                n="2"
                accent={C.amber}
                insight={Q2}
              />
              <IssuesComplaintSpikeChart data={snap.q2} />
            </div>

            <div className="dd-panel">
              <InsightSectionHead
                prefix="dd"
                n="4"
                accent={C.green}
                insight={Q4}
                right={
                  <IssuesComplaintFilterToggle prefix="dd" filter={q4Filter} onFilterChange={setQ4Filter} />
                }
              />
              <IssuesResolutionThroughputChart data={snap.q4} filter={q4Filter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
