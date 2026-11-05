"use client";

import type { ReactNode } from "react";
import type { ControlStrip, GlanceTrends, IncidentStrip, RiskAppetiteStrip, TrendPoint } from "@/lib/ukbankingaudit/v8/boardView";
import { FigureTrend, Gauge, type Tone } from "../TrendCharts";

type Props = {
  appetite: RiskAppetiteStrip;
  controls: ControlStrip;
  incidents: IncidentStrip;
  trends: GlanceTrends;
  /** One sentence each, from the records behind the card. */
  keyPoints: { appetite: string | null; controls: string | null; incidents: string | null };
  /** Control effectiveness thresholds from the category rating rule. */
  thresholds: { amber: number; red: number };
  onOpenAppetite: () => void;
  onOpenControls: () => void;
  onOpenIncidents: () => void;
};

const TONE_STYLE: Record<Tone, { frame: string; rail: string; text: string }> = {
  red: { frame: "hover:border-red-300", rail: "border-l-red-500", text: "text-red-600" },
  amber: { frame: "hover:border-amber-300", rail: "border-l-amber-500", text: "text-amber-700" },
  green: { frame: "hover:border-emerald-300", rail: "border-l-emerald-500", text: "text-emerald-700" },
  neutral: { frame: "hover:border-slate-300", rail: "border-l-slate-400", text: "text-slate-700" },
};

/** "▼ from 96% in Oct". Red when the move is worse, green when it is better. */
function Delta({ series, higherIsWorse, suffix = "" }: { series: TrendPoint[]; higherIsWorse: boolean; suffix?: string }) {
  const now = series.at(-1);
  const previous = series.at(-2);
  if (!now || !previous) return null;
  if (now.value === previous.value) {
    return <span className="text-xs font-semibold text-slate-500">same as {previous.label}</span>;
  }
  const rising = now.value > previous.value;
  return (
    <span className={`whitespace-nowrap text-xs font-semibold ${rising === higherIsWorse ? "text-red-600" : "text-emerald-700"}`}>
      {rising ? "▲" : "▼"} from {previous.value}
      {suffix} in {previous.label}
    </span>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9.5px] font-medium uppercase leading-tight tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-xs font-bold leading-tight ${TONE_STYLE[tone].text}`}>{value}</dd>
    </div>
  );
}

function GlanceCard({
  question,
  scope,
  tone,
  headline,
  note,
  delta,
  chart,
  gauges,
  facts,
  keyPoint,
  onClick,
}: {
  question: string;
  scope: string;
  tone: Tone;
  headline: string;
  note: string;
  delta: ReactNode;
  chart: ReactNode;
  gauges: ReactNode;
  facts: ReactNode;
  keyPoint: string | null;
  onClick: () => void;
}) {
  const style = TONE_STYLE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:shadow-md ${style.frame}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span>
          <span className="block text-sm font-bold leading-tight text-slate-900">{question}</span>
          <span className="block text-[11px] text-slate-500">{scope}</span>
        </span>
        <span aria-hidden="true" className="text-lg leading-none text-slate-400">›</span>
      </span>

      <span className="mt-3 grid grid-cols-2 gap-4">
        <span className="flex min-w-0 flex-col">
          <span className="text-2xl font-extrabold leading-none tracking-tight text-slate-900">{headline}</span>
          <span className="mt-1 text-[11px] leading-tight text-slate-600">{note}</span>
          <span className="mt-1">{delta}</span>
          <span className="mt-2 block">{chart}</span>
        </span>
        <span className="flex min-w-0 flex-col justify-between gap-3">
          <span className="grid grid-cols-2 gap-1">{gauges}</span>
          <dl className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">{facts}</dl>
        </span>
      </span>

      {keyPoint ? (
        <span className={`mt-3 block rounded-r-lg border-l-[3px] bg-slate-50 px-2.5 py-1.5 ${style.rail}`}>
          <span className={`block text-[9.5px] font-bold uppercase tracking-wider ${style.text}`}>Key point</span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-700">{keyPoint}</span>
        </span>
      ) : null}
    </button>
  );
}

/** Three matching cards, each answering one question: the figure, its move, its trend and what is behind it. */
export function RiskAtAGlance({
  appetite,
  controls,
  incidents,
  trends,
  keyPoints,
  thresholds,
  onOpenAppetite,
  onOpenControls,
  onOpenIncidents,
}: Props) {
  const appetiteTone: Tone = appetite.red > 0 ? "red" : appetite.amber > 0 ? "amber" : "green";
  const controlTone: Tone = controls.pct < thresholds.red ? "red" : controls.pct < thresholds.amber ? "amber" : "green";
  const incidentTone: Tone = incidents.sevOne > 0 ? "red" : incidents.sevTwo > 0 ? "amber" : "green";
  const [lowest, nextLowest] = trends.controls.lowest;
  const incidentTotal = incidents.sevOne + incidents.sevTwo;

  return (
    <section aria-label="Risk at a glance">
      <h2 className="mb-3 text-base font-bold text-slate-900">Risk at a Glance</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <GlanceCard
          question="Are we within risk appetite?"
          scope="Metrics · limits · tolerances"
          tone={appetiteTone}
          headline={`${appetite.red + appetite.amber} of ${appetite.total}`}
          note="metrics outside appetite"
          delta={<Delta series={trends.appetite.series} higherIsWorse />}
          chart={<FigureTrend points={trends.appetite.series} tone={appetiteTone} low={0} />}
          gauges={
            <>
              <Gauge pct={trends.appetite.withinPct} label="Metrics green" tone={appetiteTone} />
              <Gauge pct={trends.appetite.categoriesClearPct} label="Categories clear" tone={appetiteTone} />
            </>
          }
          facts={
            <>
              <Fact label="Red" value={`${appetite.red} metrics`} tone="red" />
              <Fact label="Amber" value={`${appetite.amber} metrics`} tone="amber" />
            </>
          }
          keyPoint={keyPoints.appetite}
          onClick={onOpenAppetite}
        />
        <GlanceCard
          question="Are our controls working?"
          scope="Critical controls · month on month"
          tone={controlTone}
          headline={`${controls.pct}%`}
          note="critical controls effective"
          delta={<Delta series={trends.controls.series} higherIsWorse={false} suffix="%" />}
          chart={<FigureTrend points={trends.controls.series} tone={controlTone} suffix="%" high={100} />}
          gauges={
            <>
              <Gauge pct={lowest?.pct ?? null} label="Lowest category" tone={controlTone} />
              <Gauge pct={trends.controls.categoriesClearPct} label="Categories at 100%" tone={controlTone} />
            </>
          }
          facts={
            <>
              <Fact label="Lowest" value={lowest?.label ?? "None"} tone={controlTone} />
              <Fact
                label="Next lowest"
                value={nextLowest ? `${nextLowest.label} ${nextLowest.pct}%` : "None"}
                tone="neutral"
              />
            </>
          }
          keyPoint={keyPoints.controls}
          onClick={onOpenControls}
        />
        <GlanceCard
          question="What has gone wrong?"
          scope="Sev-1 and Sev-2 incidents"
          tone={incidentTone}
          headline={String(incidentTotal)}
          note={`serious incidents open or raised this ${incidents.cadenceWord}`}
          delta={<Delta series={trends.incidents.series} higherIsWorse />}
          chart={<FigureTrend points={trends.incidents.series} tone={incidentTone} low={0} />}
          gauges={
            <>
              <Gauge pct={trends.incidents.withPathPct} label="With path to green" tone={incidentTone} />
              <Gauge pct={trends.incidents.controlsWorkedPct} label="Linked controls worked" tone={incidentTone} />
            </>
          }
          facts={
            <>
              <Fact label="This month" value={`${incidents.sevOne} Sev-1 · ${incidents.sevTwo} Sev-2`} tone={incidentTone} />
              <Fact
                label="Last month"
                value={`${trends.incidents.prevSevOne} Sev-1 · ${trends.incidents.prevSevTwo} Sev-2`}
                tone="neutral"
              />
            </>
          }
          keyPoint={keyPoints.incidents}
          onClick={onOpenIncidents}
        />
      </div>
    </section>
  );
}
