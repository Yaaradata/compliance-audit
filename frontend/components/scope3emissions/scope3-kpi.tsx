"use client";

import type { LucideIcon } from "lucide-react";
import {
  AutoKpiCard,
  AutoKpiGrid,
  autoKpiToneAt,
  type AutoKpiTone,
} from "./automotive/automotive-ui";

export {
  AutoKpiCard,
  AutoKpiGrid,
  autoKpiToneAt,
  AUTO_KPI_TONES,
  formatTCO2e,
} from "./automotive/automotive-ui";
export type { AutoKpiTone } from "./automotive/automotive-ui";

export type Scope3ComplianceKpiTone = "positive" | "negative" | "neutral" | "warn";

export function scope3ToneFromCompliance(tone?: Scope3ComplianceKpiTone): AutoKpiTone {
  switch (tone) {
    case "positive":
      return "emerald";
    case "negative":
      return "rose";
    case "warn":
      return "amber";
    default:
      return "blue";
  }
}

export type Scope3KpiItem = {
  label: string;
  value: string;
  sub?: string;
  tone?: AutoKpiTone;
  icon?: LucideIcon;
  delta?: number;
  deltaInvert?: boolean;
  quality?: string;
  confidence?: number;
  barPct?: number;
  barColor?: string;
  accentColor?: string;
  onClick?: () => void;
};

/** Standard Scope 3 KPI row — hero cards with rotating colour tones (automotive format). */
export function Scope3KpiStrip({
  items,
  cols = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
}: {
  items: Scope3KpiItem[];
  cols?: string;
}) {
  return (
    <AutoKpiGrid cols={cols}>
      {items.map((k, i) => (
        <AutoKpiCard
          key={k.label}
          variant="hero"
          label={k.label}
          value={k.value}
          sub={k.sub}
          tone={k.tone ?? autoKpiToneAt(i)}
          icon={k.icon}
          delta={k.delta}
          deltaInvert={k.deltaInvert}
          quality={k.quality}
          confidence={k.confidence}
          barPct={k.barPct}
          barColor={k.barColor}
          accentColor={k.accentColor}
          onClick={k.onClick}
        />
      ))}
    </AutoKpiGrid>
  );
}

export type Scope3CompliancePageKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: Scope3ComplianceKpiTone;
};

/** Compliance & audit summary KPIs — clickable hero cards. */
export function Scope3ComplianceKpiStrip({
  kpis,
  onKpiClick,
  cols = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
}: {
  kpis: Scope3CompliancePageKpi[];
  onKpiClick: (kpi: Scope3CompliancePageKpi) => void;
  cols?: string;
}) {
  return (
    <Scope3KpiStrip
      cols={cols}
      items={kpis.map((kpi, i) => ({
        label: kpi.label,
        value: kpi.value,
        sub: kpi.hint,
        tone: scope3ToneFromCompliance(kpi.tone),
        onClick: () => onKpiClick(kpi),
      }))}
    />
  );
}
