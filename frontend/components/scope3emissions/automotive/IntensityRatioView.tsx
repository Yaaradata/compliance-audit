"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import { IntensityRatioDrillBody } from "./IntensityRatioDrillBody";
import {
  drillForEfficiency,
  drillForLens,
  drillForMetric,
  drillForProduct,
  drillForReturn,
} from "./intensity-ratio-drills";
import { InvestmentAiDrillDrawer } from "./InvestmentAiDrillDrawer";
import type { IntensityDrill } from "./intensity-ratio-types";
import {
  AutoChartBox,
  AutoKpiCard,
  AutoKpiGrid,
  type AutoKpiTone,
  autoCallout,
  autoPage,
  autoSegmentGroup,
  autoSegmentTabButtonProps,
  autoSegmentTabStyle,
  autoTable,
  autoTableShell,
  autoTd,
  autoTh,
  autoTrInteractive,
  formatTCO2e,
  riskColor,
} from "./automotive-ui";
import {
  INTENSITY_EFFICIENCY,
  INTENSITY_INCOME,
  INTENSITY_INVEST,
  INTENSITY_OUTCOME,
  INTENSITY_PRODUCTS,
  INTENSITY_RETURNS,
  INTENSITY_TONE_HEX,
  INTENSITY_YEARS,
  activeInvestCount,
  climateInvestSharePct,
  totalClimateInvestSpend,
  totalClimateSavedT,
  totalCompanyInvestSpend,
  totalInvestCount,
  type IntensityInvestCategory,
  type IntensityInvestmentRow,
  type IntensityProductRow,
  type IntensityTone,
} from "./intensity-ratio-data";
import { ProcurementScorecardPanel } from "./BusinessPanels";
import type { AutomotiveScope3MockData, AutoPersonaId } from "./types";
import {
  defaultIntensityTabForPersona,
  intensityTabsForPersona,
  isProcurementIntensityPersona,
  type IntensityRatioTabId,
} from "./personaAccess";

export type IntensityRatioTab = IntensityRatioTabId;

export { defaultIntensityTabForPersona, intensityTabsForPersona };

function pctDelta(a: number, b: number): number {
  return Number((((a - b) / b) * 100).toFixed(1));
}

function intensityDrillSubtitle(drill: IntensityDrill): string | undefined {
  switch (drill.kind) {
    case "product":
      return drill.drill.powertrain;
    case "efficiency":
      return drill.drill.spendOrVolumeNote;
    case "investment":
      return drill.drill.owner;
    case "return":
      return drill.drill.quantifiedValue;
    case "metric": {
      const last = drill.drill.series.at(-1);
      return last ? `Latest FY25: ${last.value}${last.unit ? ` ${last.unit}` : ""}` : undefined;
    }
    case "lens":
      return "Procurement lens";
    default:
      return undefined;
  }
}

function ToneTag({ children, tone }: { children: ReactNode; tone: IntensityTone }) {
  const hex = INTENSITY_TONE_HEX[tone];
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: hex, backgroundColor: `${hex}18`, border: `1px solid ${hex}35` }}
    >
      {children}
    </span>
  );
}

function DeltaBadge({ val, invert = false }: { val: number; invert?: boolean }) {
  const bad = invert ? val > 0 : val < 0;
  const color = bad ? "var(--danger)" : "var(--success)";
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {val > 0 ? "▲" : "▼"} {Math.abs(val)}%
    </span>
  );
}

function ProgressBar({ val, max, tone }: { val: number; max: number; tone: IntensityTone }) {
  const hex = INTENSITY_TONE_HEX[tone];
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div className="h-full rounded-full transition-all" style={{ width: `${(val / max) * 100}%`, backgroundColor: hex }} />
    </div>
  );
}

function IntensityGauge({
  val,
  target,
  tone,
  inv = false,
}: {
  val: number;
  target: number;
  tone: IntensityTone;
  inv?: boolean;
}) {
  const size = 72;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(val / target, 1.4);
  const dash = circ * Math.min(pct, 1);
  const good = inv ? val <= target : val >= target * 0.85;
  const stroke = good ? INTENSITY_TONE_HEX[tone] : "var(--danger)";
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function intensityToAutoTone(t: IntensityTone): AutoKpiTone {
  const map: Record<IntensityTone, AutoKpiTone> = {
    teal: "teal",
    blue: "blue",
    amber: "amber",
    red: "rose",
    purple: "violet",
    slate: "slate",
    violet: "violet",
  };
  return map[t];
}

const PROCUREMENT_LENS_CARDS = [
  {
    title: "BEV mix is the primary lever",
    body: "BEV share rose from 8% (FY20) to 41% (FY24). Each +1pp BEV shift reduces intensity by ~0.9 tCO₂e/vehicle.",
    tone: "blue" as IntensityTone,
  },
  {
    title: "Cat 1 spend cuts cost",
    body: "Category 1 intensity fell 34% via green steel, recycled aluminium, and battery supplier engagement.",
    tone: "teal" as IntensityTone,
  },
  {
    title: "ICE SUV is a rising liability",
    body: "Urban ICE SUV emission intensity rising — Tier 2 data gaps. PCF declarations at next renewal recommended.",
    tone: "amber" as IntensityTone,
  },
] as const;

function ProcurementLensCards({ onDrill }: { onDrill: (d: IntensityDrill) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {PROCUREMENT_LENS_CARDS.map((c) => {
        const lensDrill = drillForLens(c.title);
        return (
          <button
            key={c.title}
            type="button"
            disabled={!lensDrill}
            onClick={() => lensDrill && onDrill(lensDrill)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition hover:ring-2 hover:ring-[var(--primary)]/25 disabled:cursor-default"
          >
            <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: INTENSITY_TONE_HEX[c.tone] }} />
            <p className="text-sm font-semibold text-[var(--foreground)]">{c.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">{c.body}</p>
            {lensDrill ? <p className="mt-2 text-[10px] font-semibold text-[var(--primary)]">View analysis →</p> : null}
          </button>
        );
      })}
    </div>
  );
}

function ProcurementOverviewTab({ onDrill }: { onDrill: (d: IntensityDrill) => void }) {
  const procureDelta = pctDelta(INTENSITY_INCOME.procureSpend[4], INTENSITY_INCOME.procureSpend[3]);
  const intRevDelta = pctDelta(INTENSITY_OUTCOME.intensityRev[4], INTENSITY_OUTCOME.intensityRev[3]);
  const cat1 = INTENSITY_EFFICIENCY.find((e) => e.label.includes("Cat 1"));
  const sbti = INTENSITY_EFFICIENCY.find((e) => e.label.includes("SBTi"));
  const air = INTENSITY_EFFICIENCY.find((e) => e.label.includes("Air"));
  const pcf = INTENSITY_EFFICIENCY.find((e) => e.label.includes("PCF"));
  const greenSpend = INTENSITY_EFFICIENCY.find((e) => e.label.includes("Green spend"));

  return (
    <>
      <Scope3SectionLabel
        title="Procurement performance"
        description="Operational KPIs governing supplier data, spend coverage, and inbound logistics. Click any card for drill-down."
      />
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-4">
        <AutoKpiCard
          label="Cat 1 data coverage"
          value={cat1 ? `${cat1.val}%` : "—"}
          sub={cat1 ? `Target ${cat1.target}%` : undefined}
          tone="blue"
          onClick={() => cat1 && onDrill(drillForEfficiency(cat1.label)!)}
        />
        <AutoKpiCard
          label="Supplier SBTi coverage"
          value={sbti ? `${sbti.val}%` : "—"}
          sub={sbti ? `Target ${sbti.target}%` : undefined}
          tone="teal"
          onClick={() => sbti && onDrill(drillForEfficiency(sbti.label)!)}
        />
        <AutoKpiCard
          label="Procure spend FY25"
          value="₹3,580 Cr"
          sub="Tier-1 + inbound"
          delta={procureDelta}
          tone="amber"
          onClick={() => {
            const m = drillForMetric("procureSpend");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard
          label="Air freight share"
          value={air ? `${air.val}%` : "—"}
          sub={air ? `Target <${air.target}%` : undefined}
          tone="rose"
          onClick={() => air && onDrill(drillForEfficiency(air.label)!)}
        />
      </AutoKpiGrid>

      <Scope3SectionLabel title="GM procurement lens" description="Key signals for sourcing decisions this cycle. Click a card for evidence and actions." />
      <ProcurementLensCards onDrill={onDrill} />

      <Scope3SectionLabel title="Commercial context" description="Light P&L backdrop — full finance view available under CFO persona." />
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-3">
        <AutoKpiCard
          label="Intensity / ₹ Cr revenue"
          value="843 t/Cr"
          sub="tCO₂e per ₹Cr rev"
          delta={intRevDelta}
          tone="blue"
          onClick={() => {
            const m = drillForMetric("intensityRev");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard
          label="PCF declarations"
          value={pcf ? `${pcf.val}%` : "—"}
          sub={pcf ? `Target ${pcf.target}%` : undefined}
          tone="violet"
          onClick={() => pcf && onDrill(drillForEfficiency(pcf.label)!)}
        />
        <AutoKpiCard
          label="Green spend ratio"
          value={greenSpend ? `${greenSpend.val}%` : "29%"}
          sub={greenSpend ? `Target ${greenSpend.target}%` : "Low-carbon materials & logistics"}
          tone="teal"
          onClick={() => greenSpend && onDrill(drillForEfficiency(greenSpend.label)!)}
        />
      </AutoKpiGrid>
    </>
  );
}

function FinanceOverviewTab({ onDrill }: { onDrill: (d: IntensityDrill) => void }) {
  const trendData = useMemo(
    () =>
      INTENSITY_YEARS.map((yr, i) => ({
        year: yr,
        intensityRev: INTENSITY_OUTCOME.intensityRev[i],
        intensityUnit: INTENSITY_OUTCOME.intensityUnit[i],
      })),
    [],
  );

  const revDelta = pctDelta(INTENSITY_INCOME.revenue[4], INTENSITY_INCOME.revenue[3]);
  const ebitdaDelta = pctDelta(INTENSITY_INCOME.ebitda[4], INTENSITY_INCOME.ebitda[3]);
  const marginDelta = pctDelta(INTENSITY_INCOME.grossMargin[4], INTENSITY_INCOME.grossMargin[3]);
  const procureDelta = pctDelta(INTENSITY_INCOME.procureSpend[4], INTENSITY_INCOME.procureSpend[3]);
  const scope3Delta = pctDelta(INTENSITY_OUTCOME.scope3Total[4], INTENSITY_OUTCOME.scope3Total[3]);
  const intRevDelta = pctDelta(INTENSITY_OUTCOME.intensityRev[4], INTENSITY_OUTCOME.intensityRev[3]);
  const intUnitDelta = pctDelta(INTENSITY_OUTCOME.intensityUnit[4], INTENSITY_OUTCOME.intensityUnit[3]);
  const carbonDelta = pctDelta(INTENSITY_OUTCOME.carbonCost[4], INTENSITY_OUTCOME.carbonCost[3]);

  return (
    <>
      <Scope3SectionLabel title="Business income" description="Revenue, margin, and procurement spend driving the emission story." />
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-4">
        <AutoKpiCard
          label="Revenue FY25"
          value="₹5,720 Cr"
          sub="Audited turnover"
          delta={revDelta}
          tone="teal"
          onClick={() => {
            const m = drillForMetric("revenue");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard label="EBITDA FY25" value="₹620 Cr" sub="Operating earnings" delta={ebitdaDelta} tone="blue" />
        <AutoKpiCard label="Gross margin" value="28.6%" sub="Product-level margin" delta={marginDelta} tone="violet" />
        <AutoKpiCard
          label="Procure spend"
          value="₹3,580 Cr"
          sub="Tier-1 + inbound"
          delta={procureDelta}
          tone="amber"
          onClick={() => {
            const m = drillForMetric("procureSpend");
            if (m) onDrill(m);
          }}
        />
      </AutoKpiGrid>

      <Scope3SectionLabel title="Emission outcome" description="Scope 3 intensity, absolute load, and embedded carbon cost." />
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-4">
        <AutoKpiCard
          label="Scope 3 absolute"
          value="4.82 Mt"
          sub="tCO₂e FY25 total"
          delta={scope3Delta}
          deltaInvert
          tone="rose"
          onClick={() => {
            const m = drillForMetric("scope3");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard
          label="Intensity / revenue"
          value="843 t/Cr"
          sub="tCO₂e per ₹Cr rev"
          delta={intRevDelta}
          tone="blue"
          onClick={() => {
            const m = drillForMetric("intensityRev");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard
          label="Intensity / vehicle"
          value="15.4 t"
          sub="tCO₂e per unit produced"
          delta={intUnitDelta}
          tone="teal"
          onClick={() => {
            const m = drillForMetric("intensityUnit");
            if (m) onDrill(m);
          }}
        />
        <AutoKpiCard
          label="Carbon cost (shadow)"
          value="₹443 Cr"
          sub="At ₹920/tCO₂e"
          delta={carbonDelta}
          deltaInvert
          tone="amber"
          onClick={() => {
            const m = drillForMetric("carbonCost");
            if (m) onDrill(m);
          }}
        />
      </AutoKpiGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Scope3Panel className="lg:col-span-2">
          <Scope3SectionLabel
            title="Intensity decoupling"
            description="Revenue growth vs. scope 3 load — intensity falling as revenue scales. Click chart for trend drill-down."
          />
          <AutoChartBox>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="intensityRev" name="tCO₂e / ₹Cr revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="intensityUnit" name="tCO₂e / vehicle" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </AutoChartBox>
          <p className="mt-2 text-right">
            <button
              type="button"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
              onClick={() => {
                const m = drillForMetric("decoupling");
                if (m) onDrill(m);
              }}
            >
              View trend drill-down →
            </button>
          </p>
        </Scope3Panel>

        <Scope3Panel>
          <Scope3SectionLabel title="5-year business outcome" description="What decarbonisation delivered to P&L." />
          <ul className="divide-y divide-[var(--border)] text-sm">
            {[
              { label: "Revenue growth", val: "+67%", sub: "FY20→FY24", tone: "teal" as IntensityTone },
              { label: "Absolute scope 3 rise", val: "+13.5%", sub: "FY20→FY24", tone: "red" as IntensityTone },
              { label: "Intensity improvement", val: "−32%", sub: "per ₹Cr revenue", tone: "blue" as IntensityTone },
              { label: "Carbon cost avoidance", val: "₹~280 Cr", sub: "cumulative shadow", tone: "amber" as IntensityTone },
              { label: "EBITDA expansion", val: "+148%", sub: "FY20→FY24", tone: "purple" as IntensityTone },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="font-medium text-[var(--foreground)]">{r.label}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{r.sub}</p>
                </div>
                <span className="text-base font-bold tabular-nums" style={{ color: INTENSITY_TONE_HEX[r.tone] }}>
                  {r.val}
                </span>
              </li>
            ))}
          </ul>
          <div className={`mt-4 ${autoCallout} border-emerald-600/20 bg-emerald-500/5`}>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">Decoupling achieved</p>
            <p className="mt-1 text-xs">
              Revenue grew faster than absolute emissions — intensity reduction is structural, not cyclical.
            </p>
          </div>
        </Scope3Panel>
      </div>

      <Scope3SectionLabel title="GM procurement lens" description="Key signals for sourcing decisions this cycle. Click a card for evidence and actions." />
      <ProcurementLensCards onDrill={onDrill} />
    </>
  );
}

function OverviewTab({ variant, onDrill }: { variant: "finance" | "procurement"; onDrill: (d: IntensityDrill) => void }) {
  return variant === "procurement" ? <ProcurementOverviewTab onDrill={onDrill} /> : <FinanceOverviewTab onDrill={onDrill} />;
}

function ProductsTab({
  defaultSort = "emit",
  onDrill,
}: {
  defaultSort?: "emit" | "rev" | "procure";
  onDrill: (d: IntensityDrill) => void;
}) {
  const [sort, setSort] = useState<"emit" | "rev" | "procure">(defaultSort);

  const sorted = useMemo(() => {
    const rows = [...INTENSITY_PRODUCTS];
    if (sort === "emit") return rows.sort((a, b) => b.emit - a.emit);
    if (sort === "rev") return rows.sort((a, b) => b.rev - a.rev);
    return rows.sort((a, b) => b.procure - a.procure);
  }, [sort]);

  return (
    <>
      <Scope3SectionLabel
        title="Product line analysis"
        description="Emission intensity mapped to commercial performance — click a row or bubble for supplier and category drill-down."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)]">Sort by</span>
            {(
              [
                ["emit", "Emission intensity"],
                ["rev", "Revenue"],
                ["procure", "Procure spend"],
              ] as const
            ).map(([id, lbl]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSort(id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  sort === id
                    ? "border-transparent text-white shadow-md"
                    : "border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--muted)]"
                }`}
                style={sort === id ? autoSegmentTabStyle(true) : undefined}
              >
                {lbl}
              </button>
            ))}
          </div>
        }
      />

      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              {["Product", "Units", "tCO₂e/veh", "Revenue", "Procure", "Cat 1 %", "YoY"].map((h) => (
                <th key={h} className={autoTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <ProductRow key={p.id} row={p} onDrill={() => onDrill(drillForProduct(p))} />
            ))}
          </tbody>
        </table>
      </div>

      <Scope3Panel>
        <Scope3SectionLabel
          title="Revenue vs. emission intensity"
          description="Bubble size reflects units sold — preferred zone: high revenue, low intensity."
        />
        <ProductScatter products={INTENSITY_PRODUCTS} onProductClick={(p) => onDrill(drillForProduct(p))} />
      </Scope3Panel>
    </>
  );
}

function ProductRow({ row: p, onDrill }: { row: IntensityProductRow; onDrill: () => void }) {
  const hex = INTENSITY_TONE_HEX[p.tone];
  return (
      <tr className={autoTrInteractive} onClick={onDrill}>
        <td className={autoTd}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: hex }} />
            <div>
              <span className="font-medium">{p.name}</span>
              <span className="text-[var(--foreground-muted)]"> ({p.model})</span>
              <div className="mt-1">
                <ToneTag tone={p.tone}>{p.risk} risk</ToneTag>
              </div>
            </div>
          </div>
        </td>
        <td className={`${autoTd} tabular-nums`}>{(p.units / 1000).toFixed(0)}k</td>
        <td className={autoTd}>
          <span className="font-bold tabular-nums" style={{ color: hex }}>
            {p.emit}
          </span>
          <ProgressBar val={p.emit} max={55} tone={p.tone} />
        </td>
        <td className={`${autoTd} tabular-nums`}>₹{p.rev}k Cr</td>
        <td className={`${autoTd} tabular-nums`}>₹{p.procure}k Cr</td>
        <td className={autoTd}>
          <ProgressBar val={p.cat1} max={100} tone="blue" />
          <span className="text-xs text-[var(--foreground-muted)]">{p.cat1}%</span>
        </td>
        <td className={autoTd}>
          <DeltaBadge val={p.yoy} />
        </td>
      </tr>
  );
}

function ProductScatter({
  products,
  onProductClick,
}: {
  products: IntensityProductRow[];
  onProductClick?: (p: IntensityProductRow) => void;
}) {
  const W = 560;
  const H = 240;
  const pad = { l: 54, r: 18, t: 16, b: 36 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const revValues = products.map((p) => p.rev);
  const emitValues = products.map((p) => p.emit);
  const revMin = Math.min(...revValues);
  const revMax = Math.max(...revValues);
  const emitMin = Math.min(...emitValues);
  const emitMax = Math.max(...emitValues);
  const revPad = Math.max((revMax - revMin) * 0.1, 40);
  const emitPad = Math.max((emitMax - emitMin) * 0.1, 1.5);
  const xMin = revMin - revPad;
  const xMax = revMax + revPad;
  const yMin = emitMin - emitPad;
  const yMax = emitMax + emitPad;
  const unitsMax = Math.max(...products.map((p) => p.units), 1);

  const xScale = (rev: number) => pad.l + ((rev - xMin) / (xMax - xMin)) * plotW;
  const yScale = (emit: number) => pad.t + plotH - ((emit - yMin) / (yMax - yMin)) * plotH;

  const axisY = pad.t + plotH;
  const revTicks = [revMin, Math.round((revMin + revMax) / 2), revMax];
  const emitTicks = [emitMax, Math.round((emitMin + emitMax) / 2), emitMin];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[240px] w-full" role="img" aria-label="Revenue versus emission intensity by product">
      <line x1={pad.l} y1={axisY} x2={pad.l + plotW} y2={axisY} stroke="var(--border)" />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={axisY} stroke="var(--border)" />

      {/* Preferred zone: high revenue (right), low intensity (bottom) */}
      <rect
        x={pad.l + plotW * 0.52}
        y={pad.t + plotH * 0.48}
        width={plotW * 0.48}
        height={plotH * 0.52}
        fill="#0d948812"
        rx={4}
      />
      <text x={pad.l + plotW * 0.76} y={pad.t + plotH * 0.92} fontSize={8} fill="#0d9488" textAnchor="middle" opacity={0.85}>
        Preferred zone
      </text>

      {revTicks.map((t) => (
        <g key={`rev-${t}`}>
          <line x1={xScale(t)} y1={axisY} x2={xScale(t)} y2={axisY + 4} stroke="var(--border)" />
          <text x={xScale(t)} y={H - 8} fontSize={8} fill="var(--foreground-muted)" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      {emitTicks.map((t) => (
        <g key={`emit-${t}`}>
          <line x1={pad.l - 4} y1={yScale(t)} x2={pad.l} y2={yScale(t)} stroke="var(--border)" />
          <text x={pad.l - 8} y={yScale(t) + 3} fontSize={8} fill="var(--foreground-muted)" textAnchor="end">
            {t}
          </text>
        </g>
      ))}

      <text x={pad.l + plotW / 2} y={H - 2} fontSize={9} fill="var(--foreground-muted)" textAnchor="middle">
        Revenue (₹k Cr) →
      </text>
      <text
        x={12}
        y={pad.t + plotH / 2}
        fontSize={9}
        fill="var(--foreground-muted)"
        textAnchor="middle"
        transform={`rotate(-90 12 ${pad.t + plotH / 2})`}
      >
        tCO₂e / vehicle ↑
      </text>

      {products.map((p) => {
        const cx = xScale(p.rev);
        const cy = yScale(p.emit);
        const r = 9 + (p.units / unitsMax) * 12;
        const hex = INTENSITY_TONE_HEX[p.tone];
        return (
          <g
            key={p.id}
            className={onProductClick ? "cursor-pointer" : undefined}
            onClick={() => onProductClick?.(p)}
            onKeyDown={(e) => {
              if (onProductClick && (e.key === "Enter" || e.key === " ")) onProductClick(p);
            }}
            role={onProductClick ? "button" : undefined}
            tabIndex={onProductClick ? 0 : undefined}
          >
            <circle cx={cx} cy={cy} r={r} fill={hex} fillOpacity={0.28} stroke={hex} strokeWidth={1.5} />
            <text x={cx} y={cy - r - 5} fontSize={8} fill={hex} textAnchor="middle" fontWeight={600}>
              {p.model}
            </text>
            <title>
              {p.name} ({p.model})
              {"\n"}
              Revenue ₹{p.rev}k Cr · {p.emit} tCO₂e/veh · {(p.units / 1000).toFixed(0)}k units
            </title>
          </g>
        );
      })}
    </svg>
  );
}

type InvestFilter = "all" | "climate" | IntensityInvestCategory;

function InvestmentTableRow({ row, onOpen }: { row: IntensityInvestmentRow; onOpen: () => void }) {
  return (
    <tr className={autoTrInteractive} onClick={onOpen}>
      <td className={autoTd}>
        <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_TONE_HEX[row.tone] }} />
        <span className="font-medium">{row.name}</span>
        {row.climateLinked ? (
          <span className="ml-2 rounded bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-teal-700 dark:text-teal-300">
            Sustainability
          </span>
        ) : null}
      </td>
      <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>{row.category}</td>
      <td className={autoTd}>
        <span className="rounded bg-[var(--muted)]/60 px-1.5 py-0.5 text-[10px] font-semibold">{row.investType}</span>
      </td>
      <td className={`${autoTd} text-xs text-[var(--foreground-muted)]`}>{row.businessUnit}</td>
      <td className={`${autoTd} tabular-nums font-medium`}>₹{row.spend.toLocaleString("en-IN")}</td>
      <td className={`${autoTd} tabular-nums text-xs`}>
        {row.saved > 0 ? formatTCO2e(row.saved, true) : "—"}
      </td>
      <td className={autoTd}>{row.roi != null ? `${row.roi}×` : "—"}</td>
      <td className={autoTd}>
        <span className="text-xs font-semibold" style={{ color: riskColor(row.status === "Complete" ? "On track" : row.status) }}>
          {row.status}
        </span>
      </td>
    </tr>
  );
}

function investFilterCount(id: InvestFilter): number {
  if (id === "all") return totalInvestCount;
  if (id === "climate") return INTENSITY_INVEST.filter((r) => r.climateLinked).length;
  return INTENSITY_INVEST.filter((r) => r.category === id).length;
}

function InvestmentTab({ onDrill }: { onDrill: (d: IntensityDrill) => void }) {
  const [aiDrillProgramme, setAiDrillProgramme] = useState<string | null>(null);
  const [filter, setFilter] = useState<InvestFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return INTENSITY_INVEST;
    if (filter === "climate") return INTENSITY_INVEST.filter((r) => r.climateLinked);
    return INTENSITY_INVEST.filter((r) => r.category === filter);
  }, [filter]);

  const filteredSpendCr = useMemo(() => filtered.reduce((s, r) => s + r.spend, 0), [filtered]);

  const filterTabs: { id: InvestFilter; label: string }[] = [
    { id: "all", label: `All programmes (${totalInvestCount})` },
    { id: "climate", label: `Sustainability (${investFilterCount("climate")})` },
    { id: "Product & R&D", label: `Product (${investFilterCount("Product & R&D")})` },
    { id: "Manufacturing", label: `Mfg (${investFilterCount("Manufacturing")})` },
    { id: "Commercial & distribution", label: `Commercial (${investFilterCount("Commercial & distribution")})` },
    { id: "IT & digital", label: `IT (${investFilterCount("IT & digital")})` },
    { id: "M&A & partnerships", label: `M&A (${investFilterCount("M&A & partnerships")})` },
    { id: "Corporate & compliance", label: `Corporate (${investFilterCount("Corporate & compliance")})` },
  ];

  return (
    <>
      <AutoKpiGrid cols="sm:grid-cols-2 lg:grid-cols-4">
        <AutoKpiCard
          label="Total spend"
          value={`₹${totalCompanyInvestSpend.toLocaleString("en-IN")} Cr`}
          sub={`${totalInvestCount} programmes · FY24`}
          tone="blue"
        />
        <AutoKpiCard
          label="Sustainability spend"
          value={`₹${totalClimateInvestSpend} Cr`}
          sub={`${climateInvestSharePct}% of total spend`}
          tone="teal"
        />
        <AutoKpiCard
          label="CO₂e saved"
          value={`${(totalClimateSavedT / 1000).toFixed(0)} kt`}
          sub="Sustainability programmes"
          tone="amber"
        />
        <AutoKpiCard
          label="Active now"
          value={String(activeInvestCount)}
          sub={`of ${totalInvestCount} programmes`}
          tone="violet"
        />
      </AutoKpiGrid>

      <div className={`${autoSegmentGroup} mb-2 w-full max-w-none`} role="tablist" aria-label="Filter investment register">
        {filterTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={filter === t.id}
            onClick={() => setFilter(t.id)}
            title={t.id === "climate" ? "Sustainability programmes with tracked Scope 3 / carbon impact" : undefined}
            {...autoSegmentTabButtonProps(filter === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filter !== "all" ? (
        <p className="mb-3 text-xs text-[var(--foreground-muted)]">
          Showing <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span> of {totalInvestCount}{" "}
          programmes · ₹{filteredSpendCr.toLocaleString("en-IN")} Cr spend ·{" "}
          <button type="button" className="font-semibold text-[var(--primary)] hover:underline" onClick={() => setFilter("all")}>
            View all programmes
          </button>
        </p>
      ) : (
        <p className="mb-3 text-xs text-[var(--foreground-muted)]">
          Full register — {totalInvestCount} programmes · ₹{totalCompanyInvestSpend.toLocaleString("en-IN")} Cr total approved
          spend
        </p>
      )}

      <div className={autoTableShell}>
        <table className={autoTable}>
          <thead>
            <tr>
              {["Investment", "Category", "Type", "Business unit", "Spend (₹Cr)", "Scope 3 (tCO₂e)", "Financial ROI", "Status"].map((h) => (
                <th key={h} className={autoTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <InvestmentTableRow key={r.id} row={r} onOpen={() => setAiDrillProgramme(r.name)} />
            ))}
          </tbody>
        </table>
      </div>

      <InvestmentAiDrillDrawer programmeName={aiDrillProgramme} onClose={() => setAiDrillProgramme(null)} />

      <Scope3SectionLabel title="Business returns unlocked" description="Beyond carbon — regulatory, commercial, and financing value." />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {INTENSITY_RETURNS.map((r) => (
          <button
            key={r.title}
            type="button"
            onClick={() => {
              const d = drillForReturn(r.title);
              if (d) onDrill(d);
            }}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition hover:ring-2 hover:ring-[var(--primary)]/25"
          >
            <p className="text-lg">{r.icon}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{r.title}</p>
            <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: INTENSITY_TONE_HEX[r.tone] }}>
              {r.val}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">{r.desc}</p>
            <p className="mt-2 text-[10px] font-semibold text-[var(--primary)]">View breakdown →</p>
          </button>
        ))}
      </div>
    </>
  );
}

function EfficiencyTab({ onDrill }: { onDrill: (d: IntensityDrill) => void }) {
  return (
    <>
      <Scope3SectionLabel
        title="Procurement efficiency KPIs"
        description="Operational metrics governing data quality, spend, and supplier engagement. Click a card for gaps, owners, and controls."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTENSITY_EFFICIENCY.map((e) => {
          const effDrill = drillForEfficiency(e.label);
          return (
            <button
              key={e.label}
              type="button"
              disabled={!effDrill}
              onClick={() => effDrill && onDrill(effDrill)}
              className="w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition hover:ring-2 hover:ring-[var(--primary)]/25 disabled:cursor-default"
            >
            <div className="flex items-start gap-4">
              <div className="relative flex shrink-0 items-center justify-center">
                <IntensityGauge val={e.val} target={e.target} tone={e.tone} inv={e.inv} />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-[var(--foreground)]">
                  {e.val}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">{e.label}</p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">{e.desc}</p>
                <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">
                  Target: <span className="font-semibold text-[var(--foreground)]">{e.target}%</span>
                  {e.inv ? " (lower is better)" : null}
                </p>
                <div className="mt-3">
                  <ProgressBar val={e.val} max={e.inv ? e.val : 100} tone={e.tone} />
                </div>
                  <p className="mt-2 text-[10px] font-semibold text-[var(--primary)]">View drill-down →</p>
              </div>
            </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function IntensityRatioTabSwitcher({
  value,
  onChange,
  persona,
}: {
  value: IntensityRatioTab;
  onChange: (tab: IntensityRatioTab) => void;
  persona: AutoPersonaId;
}) {
  const tabs = intensityTabsForPersona(persona);
  return (
    <div className={`${autoSegmentGroup} w-full max-w-none`} role="tablist" aria-label="Finance View sections">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            {...autoSegmentTabButtonProps(active)}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function IntensityRatioView({
  tab,
  persona,
  data,
  onOpenSupplyChain,
}: {
  tab: IntensityRatioTab;
  persona: AutoPersonaId;
  data: AutomotiveScope3MockData;
  onOpenSupplyChain?: () => void;
}) {
  const [drill, setDrill] = useState<IntensityDrill | null>(null);
  const isProcurement = isProcurementIntensityPersona(persona);
  const overviewVariant = isProcurement ? "procurement" : "finance";

  return (
    <div className={autoPage}>
      {isProcurement ? (
        <>
          <ProcurementScorecardPanel data={data} />
          {onOpenSupplyChain ? (
            <p className="-mt-2 mb-2 text-right">
              <button
                type="button"
                onClick={onOpenSupplyChain}
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Full supply chain register →
              </button>
            </p>
          ) : null}
        </>
      ) : null}

      {tab === "efficiency" ? <EfficiencyTab onDrill={setDrill} /> : null}
      {tab === "products" ? <ProductsTab defaultSort={isProcurement ? "procure" : "emit"} onDrill={setDrill} /> : null}
      {tab === "overview" ? <OverviewTab variant={overviewVariant} onDrill={setDrill} /> : null}
      {tab === "investment" && !isProcurement ? <InvestmentTab onDrill={setDrill} /> : null}

      <Scope3DrilldownDrawer
        open={drill != null}
        onClose={() => setDrill(null)}
        size="lg"
        title={drill?.title ?? ""}
        subtitle={drill ? intensityDrillSubtitle(drill) : undefined}
      >
        {drill ? <IntensityRatioDrillBody drill={drill} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}
