"use client";

import type { ReactNode } from "react";
import { INTENSITY_TONE_HEX } from "./intensity-ratio-data";
import type { IntensityDrill } from "./intensity-ratio-types";
import { formatTCO2e } from "./automotive-ui";
import {
  IntensityCategoryBarChart,
  IntensityCategoryImpactBar,
  IntensitySeriesLineChart,
  IntensitySupplierSpendBarChart,
} from "./intensity-ratio-charts";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{title}</h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

export function IntensityRatioDrillBody({ drill }: { drill: IntensityDrill }) {
  if (drill.kind === "product") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--border)] bg-[var(--muted)]/40 px-2 py-0.5 font-semibold">
            {d.powertrain}
          </span>
          {d.plants.map((p) => (
            <span key={p} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--foreground-muted)]">
              {p}
            </span>
          ))}
        </div>

        <Section title="Intensity trend (production)">
          <IntensitySeriesLineChart data={d.emitTrend} name="tCO₂e / vehicle" color="#2563eb" yLabel="t/veh" />
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">tCO₂e / vehicle</th>
                </tr>
              </thead>
              <tbody>
                {d.emitTrend.map((t) => (
                  <tr key={t.year} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium">{t.year}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{t.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Category split (production)">
          <IntensityCategoryBarChart items={d.categorySplit} />
        </Section>

        {d.topSuppliers.length > 0 ? (
          <Section title="Top suppliers (Cat 1)">
            <IntensitySupplierSpendBarChart suppliers={d.topSuppliers} />
            <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                  <tr>
                    <th className="px-3 py-2">Supplier</th>
                    <th className="px-3 py-2 text-right">Spend</th>
                    <th className="px-3 py-2 text-right">Emissions</th>
                    <th className="px-3 py-2">PCF</th>
                  </tr>
                </thead>
                <tbody>
                  {d.topSuppliers.map((s) => (
                    <tr key={s.name} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">₹{s.spendCr} Cr</td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.emissionsKt} kt</td>
                      <td className="px-3 py-2">{s.pcfStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {d.topSuppliers.some((s) => s.action) ? (
              <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200">
                {d.topSuppliers.filter((s) => s.action).map((s) => (
                  <li key={s.name}>
                    <strong>{s.name}:</strong> {s.action}
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        ) : null}

        <Section title="Benchmarks">
          <ul className="space-y-2">
            {d.benchmarks.map((b) => (
              <li key={b.label} className="flex justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs">
                <span className="text-[var(--foreground-muted)]">{b.label}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    color: b.status === "ok" ? "var(--success)" : b.status === "warning" ? "var(--warning)" : "var(--danger)",
                  }}
                >
                  {b.value}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Decarbonisation levers">
          <BulletList items={d.levers} />
        </Section>
        {d.risks.length > 0 ? (
          <Section title="Risks & watch items">
            <BulletList items={d.risks} />
          </Section>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "efficiency") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <p className="text-xs text-[var(--foreground-muted)]">
          <strong>Gap to target:</strong> {d.gapToTarget} pp · <strong>Scope:</strong> {d.spendOrVolumeNote}
        </p>

        <Section title="FY21–FY25 trend">
          <IntensitySeriesLineChart
            data={d.fyTrend}
            name="Coverage"
            color="#0d9488"
            yLabel={d.fyTrend[0]?.unit === "%" ? "%" : undefined}
          />
        </Section>

        <Section title="Remediation queue">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.topGaps.map((g) => (
                  <tr key={g.item} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium">{g.item}</td>
                    <td className="px-3 py-2">{g.owner}</td>
                    <td className="px-3 py-2 tabular-nums">{g.due}</td>
                    <td className="px-3 py-2">{g.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {d.linkedSuppliers?.length ? (
          <Section title="Linked suppliers">
            <BulletList items={d.linkedSuppliers} />
          </Section>
        ) : null}

        <Section title="Controls">
          <BulletList items={d.controls} />
        </Section>
      </div>
    );
  }

  if (drill.kind === "investment") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <p className="text-xs text-[var(--foreground-muted)]">
          <strong>Owner:</strong> {d.owner} · <strong>Status:</strong> {d.status}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-[10px] uppercase text-[var(--foreground-muted)]">Spend</p>
            <p className="mt-1 font-bold tabular-nums">₹{d.spendCr} Cr</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-[10px] uppercase text-[var(--foreground-muted)]">Avoided</p>
            <p className="mt-1 font-bold tabular-nums">{d.savedT > 0 ? formatTCO2e(d.savedT, true) : "—"}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-[10px] uppercase text-[var(--foreground-muted)]">ROI</p>
            <p className="mt-1 font-bold tabular-nums">{d.roi != null ? `${d.roi}×` : "Enabler"}</p>
          </div>
        </div>

        <Section title="Milestones">
          <ul className="space-y-2">
            {d.milestones.map((m) => (
              <li key={m.label} className="flex items-start gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs">
                <span className={m.done ? "text-emerald-600" : "text-[var(--foreground-muted)]"}>{m.done ? "✓" : "○"}</span>
                <div>
                  <span className="font-mono text-[10px] text-[var(--foreground-muted)]">{m.date}</span>
                  <p className="font-medium text-[var(--foreground)]">{m.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Category impact (illustrative)">
          <IntensityCategoryImpactBar items={d.categoryImpact} />
        </Section>

        {d.risks.length > 0 ? (
          <Section title="Programme risks">
            <BulletList items={d.risks} />
          </Section>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "return") {
    const d = drill.drill;
    return (
      <div className="space-y-4 text-sm">
        <p className="text-lg font-bold tabular-nums text-[var(--foreground)]">{d.quantifiedValue}</p>
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <Section title="Assumptions">
          <BulletList items={d.assumptions} />
        </Section>
        <Section title="Linked programmes">
          <BulletList items={d.linkedProgrammes} />
        </Section>
      </div>
    );
  }

  if (drill.kind === "metric") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <Section title="5-year series">
          <IntensitySeriesLineChart
            data={d.series}
            name={d.label}
            color="#2563eb"
            yLabel={d.series[0]?.unit}
          />
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {d.series.map((t) => (
                  <tr key={t.year} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">{t.year}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {t.value.toLocaleString("en-IN")}
                      {t.unit ? ` ${t.unit}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Bridge drivers">
          <ul className="space-y-2">
            {d.drivers.map((x) => (
              <li
                key={x.label}
                className="flex justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs"
              >
                <span className="font-medium text-[var(--foreground)]">{x.label}</span>
                <span className="font-semibold" style={{ color: INTENSITY_TONE_HEX[x.tone] }}>
                  {x.impact}
                </span>
              </li>
            ))}
          </ul>
        </Section>
        {d.benchmarks?.length ? (
          <Section title="Benchmarks & covenants">
            <BulletList items={d.benchmarks} />
          </Section>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "lens") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <Section title="Evidence">
          <BulletList items={d.evidence} />
        </Section>
        <Section title="Recommended actions">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Due</th>
                </tr>
              </thead>
              <tbody>
                {d.actions.map((a) => (
                  <tr key={a.action} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium">{a.owner}</td>
                    <td className="px-3 py-2">{a.action}</td>
                    <td className="px-3 py-2 tabular-nums">{a.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    );
  }

  return null;
}

