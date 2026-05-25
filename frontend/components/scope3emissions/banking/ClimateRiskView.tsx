"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BankScope3MockData } from "./types";
import { Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import { Scope3KpiStrip, autoKpiToneAt } from "../scope3-kpi";
import { BankChartBox, bankPage } from "./banking-ui";

export function ClimateRiskView({ data }: { data: BankScope3MockData }) {
  const [riskType, setRiskType] = useState<string>("All");
  const [horizon, setHorizon] = useState<string>("All");

  const matrix = data.sectorScenarioMatrix.map((r) => ({
    name: r.sector,
    netZero: r.netZero,
    steps: r.steps,
    rbi: r.rbiAdverse,
  }));

  const filteredRisks = useMemo(() => {
    return data.climateRisks.filter((x) => {
      if (riskType !== "All" && !x.riskType.toLowerCase().includes(riskType.toLowerCase())) return false;
      if (horizon !== "All" && x.horizon !== horizon) return false;
      return true;
    });
  }, [data.climateRisks, riskType, horizon]);

  return (
    <div className={bankPage}>
      <Scope3SectionLabel
        title="Climate risk (TCFD-aligned)"
        description="Scenario analysis, physical collateral hotspots, and transition risk register — mapped to RBI climate risk disclosure expectations (mock)."
      />

      <section>
        <Scope3SectionLabel title="TCFD four pillars — disclosure readiness" />
        <Scope3KpiStrip
          cols="md:grid-cols-4"
          items={data.tcfdPillars.map((p, i) => ({
            label: p.pillar,
            value: `${p.completenessPct}%`,
            sub: "TCFD disclosure completeness",
            tone: autoKpiToneAt(i),
            barPct: p.completenessPct,
          }))}
        />
      </section>

      <section>
        <Scope3SectionLabel
          title="Climate risk scenario analysis"
          description="Loan-at-risk, NPA sensitivity, and CET1 impact — illustrative. RBI Climate Risk Circular (March 2024), Para 7.3 — scenario analysis expectation."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {data.scenarioRows.map((s) => (
            <Scope3Panel key={s.scenario} className="!p-4">
              <div className="text-sm font-bold text-[var(--foreground)]">{s.scenario}</div>
              <dl className="mt-3 space-y-2 text-xs text-[var(--foreground-muted)]">
                <div className="flex justify-between gap-2">
                  <dt>Loan-at-risk</dt>
                  <dd className="font-mono text-[var(--foreground)]">₹{s.loanAtRiskINRCr.toLocaleString("en-IN")} cr</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>NPA Δ (est.)</dt>
                  <dd className="font-mono text-[var(--foreground)]">+{s.npaDeltaPct}%</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>CET1 impact</dt>
                  <dd className="font-mono text-[var(--foreground)]">{s.cet1ImpactBps} bps</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Horizon</dt>
                  <dd className="font-mono text-[var(--foreground)]">{s.horizon}</dd>
                </div>
              </dl>
            </Scope3Panel>
          ))}
        </div>
        <Scope3Panel className="min-h-[280px]">
          <div className="mb-2 text-xs font-semibold text-[var(--foreground-muted)]">Sector × scenario heatmap (1–10 illustrative intensity)</div>
          <BankChartBox heightClass="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matrix} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} interval={0} angle={-18} textAnchor="end" height={70} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="netZero" name="IEA NZE stress" fill="var(--primary)" />
                <Bar dataKey="steps" name="IEA STEPS" fill="var(--warning)" />
                <Bar dataKey="rbi" name="RBI adverse" fill="var(--danger)" />
              </BarChart>
            </ResponsiveContainer>
          </BankChartBox>
        </Scope3Panel>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Scope3Panel>
          <Scope3SectionLabel
            title="Physical risk — district collateral hotspots"
            description="High flood / heat / cyclone overlap in CRE & infra collateral (mock)."
          />
          <ul className="max-h-[360px] space-y-2 overflow-y-auto text-sm">
            {data.physicalDistricts.map((d) => (
              <li key={`${d.district}-${d.state}`} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2">
                <div>
                  <div className="font-medium text-[var(--foreground)]">
                    {d.district}, {d.state}
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">{d.hazard}</div>
                </div>
                <div className="text-right font-mono text-xs text-[var(--foreground)]">₹{d.collateralINRCr.toLocaleString("en-IN")} cr</div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--foreground-muted)]">
            Collateral at risk (high physical bands):{" "}
            <strong>₹{data.executive.physicalCollateralHighHazardINRCr.toLocaleString("en-IN")} cr</strong>{" "}
            (sum of districts in this list — same figure referenced from executive physical-risk KPI).
          </p>
        </Scope3Panel>

        <Scope3Panel>
          <Scope3SectionLabel title="Climate stress test summary (RBI-style)" description="Board Risk Committee sign-off." />
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--foreground-muted)]">
            {data.stressTest.scenarios.map((s) => (
              <li key={s}>
                <strong className="text-[var(--foreground)]">{s}</strong> — macro overlay + sector shocks (mock).
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--foreground-muted)]">NPA ratio change</dt>
              <dd className="font-mono font-semibold text-[var(--foreground)]">+{data.stressTest.npaRatioChangePct}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--foreground-muted)]">Capital adequacy impact</dt>
              <dd className="font-mono font-semibold text-[var(--foreground)]">{data.stressTest.capitalAdequacyBps}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--foreground-muted)]">Board sign-off</dt>
              <dd className="text-right text-[var(--foreground)]">{data.stressTest.boardSignOff}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--foreground-muted)]">Date</dt>
              <dd className="font-mono text-[var(--foreground)]">{data.stressTest.signOffDate}</dd>
            </div>
          </dl>
        </Scope3Panel>
      </div>

      <section>
        <Scope3SectionLabel title="Transition & physical risk register" description="Filter by risk family and horizon." />
        <div className="mb-3 flex flex-wrap gap-3">
          <label className="text-xs text-[var(--foreground-muted)]">
            Risk type
            <select
              className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
              value={riskType}
              onChange={(e) => setRiskType(e.target.value)}
            >
              {["All", "Physical", "Transition"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[var(--foreground-muted)]">
            Horizon
            <select
              className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            >
              {["All", "Short-term <3yr", "Medium 3–10yr", "Long-term >10yr"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Scope3Panel className="overflow-x-auto !p-0">
          <table className="min-w-[960px] w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                {["Risk", "Sectors", "Exposure ₹cr", "Magnitude", "Horizon", "RBI TCFD", "Disclosed in AR", "Mitigation"].map((h) => (
                  <th key={h} className="border-b border-[var(--border)] px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2 font-medium">{r.riskType}</td>
                  <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{r.sectors.join(", ")}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.exposureINRCr.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2">{r.magnitude}</td>
                  <td className="px-3 py-2 text-xs">{r.horizon}</td>
                  <td className="px-3 py-2">{r.rbiTcfdDisclosure ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{r.disclosedInAnnualReport ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scope3Panel>
      </section>
    </div>
  );
}
