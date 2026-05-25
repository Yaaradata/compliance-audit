"use client";

import { useEffect, useMemo, useState } from "react";
import type { BankPersonaId, BankScope3MockData, BorrowerRow } from "./types";
import { DEMO_RM_FOCUS_SECTOR, filterBorrowersForPersona, isExternalAuditor } from "./personaAccess";
import {
  Scope3DrilldownDrawer,
  Scope3Panel,
  Scope3SectionLabel,
  scope3InputClass,
  scope3SelectClass,
  scope3ToolbarSurface,
} from "../Pharma/scope3-ui";
import {
  bankCallout,
  bankPage,
  bankSegmentGroup,
  bankSegmentTabButtonProps,
  bankTable,
  bankTableShell,
  bankTd,
  bankTh,
  bankTrInteractive,
} from "./banking-ui";
import { Scope3KpiStrip } from "../scope3-kpi";

function formatCr(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

type TabId = "borrowers" | "sectors";

export function FinancedEmissionsView({
  data,
  persona,
  initialSector,
  onClearInitialSector,
  readOnly,
}: {
  data: BankScope3MockData;
  persona: BankPersonaId;
  initialSector: string | null;
  onClearInitialSector: () => void;
  readOnly?: boolean;
}) {
  const [tab, setTab] = useState<TabId>("borrowers");
  const [sectorFilter, setSectorFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"exposure" | "attributed" | "intensity" | "esg">("attributed");
  const [borrower, setBorrower] = useState<BorrowerRow | null>(null);

  useEffect(() => {
    if (!initialSector) return;
    setSectorFilter(initialSector);
    setTab("borrowers");
  }, [initialSector]);

  const baseBorrowers = useMemo(() => filterBorrowersForPersona(persona, data.borrowers), [data.borrowers, persona]);

  const sectors = useMemo(() => ["All", ...data.sectors.map((s) => s.sector)], [data.sectors]);

  const filtered = useMemo(() => {
    const s = sectorFilter;
    return baseBorrowers.filter((b) => {
      if (s !== "All" && b.sector !== s) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.sector.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [baseBorrowers, sectorFilter, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortKey === "exposure") return b.loanOutstandingINRCr - a.loanOutstandingINRCr;
      if (sortKey === "attributed") return b.attributedTCO2e - a.attributedTCO2e;
      if (sortKey === "intensity") return b.emissionIntensity - a.emissionIntensity;
      return a.esgRating.localeCompare(b.esgRating);
    });
    return arr;
  }, [filtered, sortKey]);

  const attributedTotal = sorted.reduce((s, b) => s + b.attributedTCO2e, 0);
  const coveragePct = data.company.pcafCoveragePct;

  const top50DialoguePct = 62;

  const portfolioAlignment = useMemo(() => {
    const on = data.sectors.filter((x) => x.pathwayStatus === "On Track").reduce((s, x) => s + x.attributedTCO2e, 0);
    const tot = data.sectors.reduce((s, x) => s + x.attributedTCO2e, 0);
    return Math.round((on / tot) * 1000) / 10;
  }, [data.sectors]);

  const topRiskSectors = useMemo(() => {
    return [...data.sectors]
      .map((s) => ({ s, score: s.transitionRisk1to10 * s.exposureINRCr }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.s);
  }, [data.sectors]);

  function openSector(s: string) {
    setSectorFilter(s);
    setTab("borrowers");
    onClearInitialSector();
  }

  return (
    <div className={bankPage}>
      <div className={bankSegmentGroup} role="tablist" aria-label="Financed emissions views">
        {(
          [
            ["borrowers", "Borrower registry"],
            ["sectors", "Sectoral decarbonization"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            {...bankSegmentTabButtonProps(tab === id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "borrowers" ? (
        <section className="space-y-4">
          <Scope3SectionLabel
            title="Borrower ESG & emissions registry"
            description="Corporate lending book — PCAF attribution, engagement, and risk flags (mock FY24–25)."
          />
          <div className={`${scope3ToolbarSurface} flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between`}>
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-[var(--foreground-muted)]">
                Sector
                <select
                  className={`${scope3SelectClass} mt-1 w-full`}
                  value={sectorFilter}
                  onChange={(e) => {
                    setSectorFilter(e.target.value);
                    onClearInitialSector();
                  }}
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--foreground-muted)]">
                Sort
                <select className={`${scope3SelectClass} mt-1 w-full`} value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)}>
                  <option value="attributed">Attributed CO₂e</option>
                  <option value="exposure">Exposure</option>
                  <option value="intensity">Emission intensity</option>
                  <option value="esg">ESG rating</option>
                </select>
              </label>
              <label className="text-xs text-[var(--foreground-muted)] sm:col-span-2">
                Search borrower / sector
                <input className={`${scope3InputClass} mt-1`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. IndoSteel, cement…" />
              </label>
            </div>
          </div>

          <div className={bankCallout}>
            Showing <strong>{sorted.length}</strong> of <strong>{data.company.corporateBorrowers.toLocaleString("en-IN")}</strong> corporate borrowers
            {persona === "corporate_rm" ? (
              <>
                {" "}
                — <strong>{DEMO_RM_FOCUS_SECTOR}</strong> RM book (demo filter)
              </>
            ) : null}
            {" · "}
            Attributed CO₂e (visible): <strong>{(attributedTotal / 1e6).toFixed(2)} Mt</strong> · PCAF coverage (bank):{" "}
            <strong>{coveragePct.toFixed(1)}%</strong>
          </div>

          <div className={bankTableShell}>
            <table className={`min-w-[980px] ${bankTable}`}>
              <thead>
                <tr>
                  {["Borrower", "Sector", "Loan ₹cr", "ESG", "Scope 1+2 (t)", "Attributed (t)", "Intensity", "PCAF", "SBTi", "Engagement", "Flags"].map((h) => (
                    <th key={h} className={bankTh}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((b) => (
                  <tr
                    key={b.id}
                    className={bankTrInteractive}
                    onClick={() => setBorrower(b)}
                  >
                    <td className={`${bankTd} font-medium`}>{b.name}</td>
                    <td className={`${bankTd} text-[var(--foreground-muted)]`}>{b.sector}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{formatCr(b.loanOutstandingINRCr)}</td>
                    <td className={bankTd}>{b.esgRating}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{formatT(b.scope12TCO2e)}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{formatT(b.attributedTCO2e)}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{b.emissionIntensity.toFixed(0)}</td>
                    <td className={`${bankTd} font-mono text-xs`}>{b.pcafScore}</td>
                    <td className={bankTd}>{b.sbtiCommitted ? "Yes" : "No"}</td>
                    <td className={`${bankTd} text-xs`}>{b.engagement}</td>
                    <td className={`${bankTd} text-xs capitalize`}>{b.redFlags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <Scope3SectionLabel
            title="Sectoral decarbonization tracker"
            description="IEA pathway alignment, transition plan coverage, and top emitters by sector."
          />
          <Scope3KpiStrip
            cols="md:grid-cols-3"
            items={[
              {
                label: "Portfolio alignment",
                value: `${portfolioAlignment}%`,
                sub: "On-track share of emissions",
                tone: "emerald",
                barPct: portfolioAlignment,
              },
              {
                label: "Engagement progress",
                value: `${top50DialoguePct}%`,
                sub: "Top-50 emitters in active dialogue (mock)",
                tone: "blue",
                barPct: top50DialoguePct,
              },
              {
                label: "Transition risk sectors",
                value: String(topRiskSectors.length),
                sub: topRiskSectors.map((s) => s.sector).join(" · ") || "—",
                tone: "amber",
              },
            ]}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {topRiskSectors.map((s) => (
              <button
                key={s.sector}
                type="button"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                onClick={() => openSector(s.sector)}
              >
                {s.sector}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.sectors.map((s) => {
              const top3 = [...data.borrowers]
                .filter((b) => b.sector === s.sector)
                .sort((a, b) => b.attributedTCO2e - a.attributedTCO2e)
                .slice(0, 3);
              const gap = s.waciTCO2ePerCr - s.ieaBenchmarkWaci;
              return (
                <Scope3Panel key={s.sector} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)]">{s.sector}</div>
                      <div className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Exposure ₹{formatCr(s.exposureINRCr)} cr · {s.borrowers} borrowers
                      </div>
                    </div>
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--foreground-muted)]">{s.pathwayStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-[var(--foreground-muted)]">Attributed</div>
                    <div className="text-right font-mono">{(s.attributedTCO2e / 1e6).toFixed(2)} Mt</div>
                    <div className="text-[var(--foreground-muted)]">WACI vs IEA bench</div>
                    <div className="text-right font-mono">
                      {s.waciTCO2ePerCr} vs {s.ieaBenchmarkWaci} ({gap > 0 ? "+" : ""}
                      {gap.toFixed(0)})
                    </div>
                    <div className="text-[var(--foreground-muted)]">Transition plans</div>
                    <div className="text-right font-mono">
                      {s.transitionPlansCount}/{s.borrowers}
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--foreground-muted)]">
                    Top emitters: {top3.map((b) => b.name).join(" · ") || "—"}
                  </div>
                  <div className="flex h-10 items-end gap-0.5">
                    {s.sparkTrend.map((v, i) => {
                      const h = 8 + (v / Math.max(...s.sparkTrend)) * 32;
                      return <div key={i} className="w-2 rounded-sm bg-[var(--primary)]/70" style={{ height: h }} title={`${v}`} />;
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-semibold hover:bg-[var(--muted)]" onClick={() => openSector(s.sector)}>
                      View borrowers
                    </button>
                    <button type="button" className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-semibold hover:bg-[var(--muted)]">
                      NZBA pathway compare
                    </button>
                  </div>
                </Scope3Panel>
              );
            })}
          </div>
        </section>
      )}

      <Scope3DrilldownDrawer
        open={borrower != null}
        title={borrower?.name ?? ""}
        onClose={() => setBorrower(null)}
        footer={
          readOnly || isExternalAuditor(persona) ? (
            <span className="text-xs text-[var(--foreground-muted)]">Read-only view for this persona.</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white">
                Log engagement
              </button>
              <button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                Request ESG disclosure
              </button>
              <button type="button" className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                Flag for credit review
              </button>
            </div>
          )
        }
      >
        {borrower ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-[var(--foreground-muted)]">{borrower.sector}</div>
                <div className="text-lg font-bold text-[var(--foreground)]">{borrower.name}</div>
              </div>
              <div className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold">ESG {borrower.esgRating}</div>
            </div>
            <div className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
              <div>
                <strong>Facility:</strong> {borrower.facilityType} · <strong>Maturity:</strong> {borrower.maturity}
              </div>
              <div>
                <strong>Outstanding:</strong> ₹{formatCr(borrower.loanOutstandingINRCr)} cr · <strong>BRSR:</strong>{" "}
                {borrower.brsrDisclosed ? "Disclosed" : "Not disclosed"}
              </div>
              <div>
                <strong>Rating provider:</strong> {borrower.ratingAgency}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">Emissions</div>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Scope 1+2 reported/estimated: {formatT(borrower.scope12TCO2e)} tCO₂e
                {borrower.scope3TCO2e != null ? ` · Scope 3 (where available): ${formatT(borrower.scope3TCO2e)} tCO₂e` : ""}
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">PCAF attribution</div>
              <p className="mt-1 rounded-md bg-[var(--muted)]/50 p-2 font-mono text-[11px] text-[var(--foreground)]">
                Attributed = Borrower Scope 1+2 × (Bank Exposure ÷ (Total Equity + Debt)) — mock attribution factor{" "}
                <strong>{borrower.attributionFactorPct}%</strong>
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Data quality: PCAF score <strong>{borrower.pcafScore}</strong> — primary vs estimated flags per engagement tier.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] p-3 text-xs">
                <div className="font-semibold text-[var(--foreground)]">Physical risk</div>
                <p className="mt-1 text-[var(--foreground-muted)]">Flood belt exposure; heat stress on plant ops (illustrative).</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3 text-xs">
                <div className="font-semibold text-[var(--foreground)]">Transition risk</div>
                <p className="mt-1 text-[var(--foreground-muted)]">Carbon price sensitivity medium; technology disruption index 6/10 (mock).</p>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">Engagement history</div>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">Last contact: 2025-11-02 — questionnaire + follow-up call. Next: request verified SBTi letter.</p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
              onClick={() => {
                setBorrower(null);
                setTab("sectors");
              }}
            >
              Show sector decarbonization context
            </button>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}
