"use client";

import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import { formatLKRCompact } from "@/lib/Srilanka_Retail/v2/format";
import type { DomainHealthScore } from "@/lib/Srilanka_Retail/v2/types";
import { useApp } from "../context/AppContext";
import {
  AiBadge,
  Card,
  CounterCard,
  OwnerChip,
  SectionHeading,
  SeverityBadge,
  StatusBadge,
  STATUS_VAR,
} from "../primitives";

const agg = mockData.derivedAggregates;
const domains = mockData.entities.domainHealthScores;
const insights = mockData.entities.aiInsights;

export function Dashboard() {
  const { navigate, openDomainDrill } = useApp();

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <ScreenTitle title="Risk Posture Dashboard" subtitle="Where am I exposed right now?" />

      {/* Status band */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PostureCard />
        <CounterCard
          label="Open Criticals"
          value={String(agg.openCriticalCount)}
          status="critical"
          caption="Sticker variance — Excise"
          onClick={() => openDomainDrill("EXCISE")}
        />
        <CounterCard
          label="Deadlines < 7 days"
          value={String(agg.deadlinesWithin7dCount)}
          status="watch"
          caption="2 findings + 1 expiring licence"
        />
        <CounterCard
          label="Duty position — Jun 2026"
          value={formatLKRCompact(agg.dutyPositionJune2026Lkr)}
          status="neutral"
          caption={`of ${formatLKRCompact(agg.annualLiabilityContextLkr)} annual`}
          onClick={() => navigate("excise")}
        />
      </div>

      {/* Split: domain grid + AI feed */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <SectionHeading>Domain Health</SectionHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {domains.map((d) => (
              <DomainTile key={d.domainId} d={d} onClick={() => openDomainDrill(d.domainId)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--ai-accent)" }}>
            <span aria-hidden>✦</span> What changed
          </div>
          <div className="flex flex-col gap-3">
            {insights.map((ins) => (
              <Card key={ins.insightId} accent={STATUS_VAR[ins.severity === "critical" ? "critical" : "watch"]} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    <span aria-hidden style={{ color: "var(--ai-accent)" }}>✦</span>
                    {ins.text}
                  </div>
                  <SeverityBadge severity={ins.severity} />
                </div>
                <div className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                  {ins.reasoning}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {ins.timeAgo}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDomainDrill(ins.domain)}
                    className="text-[11px] font-medium"
                    style={{ color: "var(--ai-accent)" }}
                  >
                    View →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostureCard() {
  return (
    <Card accent={STATUS_VAR.risk} className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Overall Compliance Posture
      </div>
      <div className="mt-1 flex items-center gap-3">
        <Gauge />
        <div>
          <div className="lion-mono text-[22px] font-bold leading-none" style={{ color: STATUS_VAR.risk }}>
            AT-RISK
          </div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
            1 critical · 2 watch
          </div>
        </div>
      </div>
      <div className="mt-2">
        <AiBadge reasoning="computed from 7 domains · 1 critical drives band">computed from 7 domains</AiBadge>
      </div>
    </Card>
  );
}

function Gauge() {
  // Semicircular arc, value ~ 38/100 (at-risk).
  const value = 38;
  const angle = Math.PI * (1 - value / 100);
  const cx = 34;
  const cy = 34;
  const r = 26;
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  return (
    <svg width={68} height={40} viewBox="0 0 68 40">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border-subtle)" strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`} fill="none" stroke="var(--status-risk)" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

function DomainTile({ d, onClick }: { d: DomainHealthScore; onClick: () => void }) {
  const TrendIcon = d.trend === "up" ? ArrowUp : d.trend === "down" ? ArrowDown : Minus;
  const trendColor = d.trend === "up" ? "var(--status-healthy)" : d.trend === "down" ? "var(--status-risk)" : "var(--text-secondary)";
  return (
    <Card accent={STATUS_VAR[d.status]} onClick={onClick} className="p-4 hover:brightness-110">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {d.label}
        </div>
        <StatusBadge status={d.status} />
      </div>
      <div className="mt-2 line-clamp-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {d.topFindingText}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <OwnerChip name={d.ownerName} />
        <div className="flex items-center gap-2">
          <span className="lion-mono text-[12px]" style={{ color: "var(--text-secondary)" }}>
            {d.score}
          </span>
          <TrendIcon size={14} style={{ color: trendColor }} />
          <ArrowRight size={14} style={{ color: "var(--text-secondary)" }} />
        </div>
      </div>
    </Card>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-[20px] font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
