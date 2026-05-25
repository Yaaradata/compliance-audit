"use client";

import { Children, useMemo, type ReactNode } from "react";
import type { ExecutiveQuickNav, NavViewId, Scope3MockData } from "./types";

function formatInt(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

export function ExecutiveKpiDeepDrill({
  id,
  data,
  allowed,
  onQuickNav,
  onSelectCategory,
  onClose,
}: {
  id: "total" | "primary" | "brsr" | "verified";
  data: Scope3MockData;
  allowed: Set<NavViewId>;
  onQuickNav: (nav: ExecutiveQuickNav) => void;
  onSelectCategory: (id: number) => void;
  onClose: () => void;
}) {
  const { executive, company, scope3Categories: cats, suppliers, auditReadiness, inventoryMeta, trend } = data;

  const catSumKt = useMemo(
    () => cats.reduce((a, c) => a + c.tCO2e, 0) / 1000,
    [cats],
  );
  const upstreamKt = useMemo(
    () => cats.filter((c) => c.stream === "Upstream").reduce((a, c) => a + c.tCO2e, 0) / 1000,
    [cats],
  );
  const downstreamKt = useMemo(
    () => cats.filter((c) => c.stream === "Downstream").reduce((a, c) => a + c.tCO2e, 0) / 1000,
    [cats],
  );

  const topCategories = useMemo(() => {
    return [...cats].sort((a, b) => b.tCO2e - a.tCO2e).slice(0, 10);
  }, [cats]);

  const qualityRollup = useMemo(() => {
    const total = cats.reduce((a, c) => a + c.tCO2e, 0);
    const map = new Map<string, number>();
    for (const c of cats) {
      map.set(c.dataQuality, (map.get(c.dataQuality) ?? 0) + c.tCO2e);
    }
    const rows = Array.from(map.entries())
      .map(([tier, tCO2e]) => ({
        tier,
        tCO2e,
        pctMass: total > 0 ? (tCO2e / total) * 100 : 0,
      }))
      .sort((a, b) => b.tCO2e - a.tCO2e);
    return { total, rows };
  }, [cats]);

  const submissionRollup = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of suppliers) {
      const k = s.submissionStatus;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [suppliers]);

  const topSuppliersByTonnes = useMemo(() => {
    return [...suppliers].sort((a, b) => b.scope3ContributionTCO2e - a.scope3ContributionTCO2e).slice(0, 8);
  }, [suppliers]);

  const latestTrend = trend[trend.length - 1];

  if (id === "total") {
    const execKt = executive.totalScope3TCO2e / 1000;
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <DrillMetricTile label="Executive Scope 3 (KPI)" value={`${formatInt(execKt)} kt`} hint="Reported headline total" />
          <DrillMetricTile
            label="Category worksheet roll-up"
            value={`${formatInt(catSumKt)} kt`}
            hint="Sum of category lines (QA reconciliation)"
          />
          <DrillMetricTile
            label="YoY change"
            value={`${executive.yoyScope3Pct >= 0 ? "+" : ""}${executive.yoyScope3Pct}%`}
            hint={inventoryMeta.reportingYearLabel}
          />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Upstream vs downstream (category split)
          </h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--foreground-muted)]">Upstream (Categories 1–8)</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-[var(--foreground)]">{upstreamKt.toFixed(1)} kt</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--foreground-muted)]">Downstream (Categories 9–15)</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-[var(--foreground)]">{downstreamKt.toFixed(1)} kt</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--foreground-muted)]">Check total</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-[var(--foreground)]">{(upstreamKt + downstreamKt).toFixed(1)} kt</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-[var(--foreground-muted)]">
            Material categories drive volatility — purchased goods, fuel &amp; energy-related activities, and outbound logistics typically dominate Indian pharma footprints.
            {latestTrend ? (
              <>
                {" "}
                Latest FY Scope 3 in trend series:{" "}
                <span className="font-medium text-[var(--foreground)]">{(latestTrend.scope3 / 1000).toFixed(1)} kt</span>.
              </>
            ) : null}
          </p>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Top categories by emissions (ktCO₂e)
          </h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2.5">Cat</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5 text-right">kt</th>
                  <th className="px-3 py-2.5 text-right">% total</th>
                  <th className="px-3 py-2.5">Quality</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-[var(--foreground)]" title={c.name}>
                      {c.name}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{(c.tCO2e / 1000).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.pctOfTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{c.dataQuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DrillActions>
          {allowed.has("categories") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              onClick={() => {
                onSelectCategory(topCategories[0]?.id ?? 1);
                onClose();
              }}
            >
              Open top category
            </button>
          ) : null}
          {allowed.has("categories") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "categories" });
                onClose();
              }}
            >
              Category explorer
            </button>
          ) : null}
          {allowed.has("ghg_gases") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "ghg_gases" });
                onClose();
              }}
            >
              GHG species view
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  if (id === "primary") {
    const primaryTonnes = qualityRollup.rows.find((r) => r.tier === "Primary")?.tCO2e ?? 0;
    const primaryShareCalc = qualityRollup.total > 0 ? (primaryTonnes / qualityRollup.total) * 100 : 0;
    return (
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
          Executive KPI uses a <span className="font-medium text-[var(--foreground)]">mass-weighted</span> share of inventory lines tied to{" "}
          <span className="font-medium text-[var(--foreground)]">primary-tier</span> evidence (supplier-specific activity, metered utilities,
          product carbon footprints). The table below rolls up{" "}
          <span className="font-medium text-[var(--foreground)]">category tonnes</span> by stated data-quality tier — useful for assurance scoping.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <DrillMetricTile
            label="Headline primary coverage (KPI)"
            value={`${executive.primaryDataCoveragePct}%`}
            hint="Portfolio-level governance metric"
          />
          <DrillMetricTile
            label="Primary tier (category roll-up)"
            value={`${primaryShareCalc.toFixed(1)}%`}
            hint="Mass share · Primary-labelled categories"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2.5">Data quality tier</th>
                <th className="px-3 py-2.5 text-right">tCO₂e</th>
                <th className="px-3 py-2.5 text-right">Share of mass</th>
              </tr>
            </thead>
            <tbody>
              {qualityRollup.rows.map((r) => (
                <tr key={r.tier} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium text-[var(--foreground)]">{r.tier}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatInt(r.tCO2e)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.pctMass.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3 text-xs leading-relaxed text-[var(--foreground-muted)]">
          <span className="font-semibold text-[var(--foreground)]">Assurance tip: </span>
          chase secondary and spend-based categories where procurement has leverage (Category 1 packaging, Category 4 upstream logistics) before inventory lock.
        </div>
        <DrillActions>
          {allowed.has("controls_audit") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "controls_audit" });
                onClose();
              }}
            >
              Control tests &amp; lineage
            </button>
          ) : null}
          {allowed.has("submitted_evidences") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "submitted_evidences" });
                onClose();
              }}
            >
              Evidence index
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  if (id === "brsr") {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <DrillMetricTile label="Executive readiness (KPI)" value={`${executive.brsrReadinessPct}%`} hint="Disclosure pack score" />
          <DrillMetricTile
            label="Assurance composite"
            value={`${auditReadiness.overallPct}%`}
            hint="Control &amp; evidence dimensions"
          />
          <DrillMetricTile
            label="Data traceability"
            value={`${auditReadiness.dataTraceabilityPct}%`}
            hint="Activity rows with documented trail"
          />
        </div>
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
          BRSR readiness blends <span className="font-medium text-[var(--foreground)]">Core</span>,{" "}
          <span className="font-medium text-[var(--foreground)]">value-chain</span>, and{" "}
          <span className="font-medium text-[var(--foreground)]">evidence posture</span> for the India filing narrative. Dimension scores below mirror the Risk &amp; Compliance workspace.
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2.5">Dimension</th>
                <th className="px-3 py-2.5 text-right">Score</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditReadiness.dimensions.map((dim) => (
                <tr key={dim.key} className="border-t border-[var(--border)] align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--foreground)]">{dim.label}</div>
                    <p className="mt-1 text-[11px] leading-snug text-[var(--foreground-muted)]">{dim.missing}</p>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{dim.score}%</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">{dim.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DrillActions>
          {allowed.has("reports") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "reports" });
                onClose();
              }}
            >
              Reporting &amp; BRSR packs
            </button>
          ) : null}
          {allowed.has("controls_audit") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "controls_audit" });
                onClose();
              }}
            >
              Open Risk &amp; Compliance
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  if (id === "verified") {
    const pctDone = executive.totalSuppliers > 0 ? (executive.verifiedSuppliers / executive.totalSuppliers) * 100 : 0;
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <DrillMetricTile
            label="Verified / in scope"
            value={`${executive.verifiedSuppliers} / ${executive.totalSuppliers}`}
            hint="Desk-reviewed or portal-verified"
          />
          <DrillMetricTile label="Coverage" value={`${pctDone.toFixed(0)}%`} hint="Share of supplier rows cleared" />
          <DrillMetricTile label="Inventory close" value={company.lastInventoryClose} hint="Submission cut-off (illustrative)" />
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Submission status distribution
          </h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Suppliers</th>
                </tr>
              </thead>
              <tbody>
                {submissionRollup.map(([status, n]) => (
                  <tr key={status} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--foreground)]">{status}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Largest attributed Scope 3 contributors (tCO₂e)
          </h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--muted)]/50 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2.5">Supplier</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">ktCO₂e</th>
                  <th className="px-3 py-2.5 text-right">ESG</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliersByTonnes.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--border)]">
                    <td className="max-w-[180px] truncate px-3 py-2 font-medium text-[var(--foreground)]" title={s.name}>
                      {s.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">{s.submissionStatus}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{(s.scope3ContributionTCO2e / 1000).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.esgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
          Escalate <span className="font-medium text-[var(--foreground)]">Overdue</span> and{" "}
          <span className="font-medium text-[var(--foreground)]">Pending</span> rows before assurance fieldwork; align with procurement priority flags in the supplier workspace.
        </p>
        <DrillActions>
          {allowed.has("suppliers") ? (
            <button
              type="button"
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "suppliers" });
                onClose();
              }}
            >
              Suppliers &amp; buyers
            </button>
          ) : null}
          {allowed.has("supplier_portal") ? (
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium hover:bg-[var(--muted)]"
              onClick={() => {
                onQuickNav({ kind: "view", view: "supplier_portal" });
                onClose();
              }}
            >
              Supplier portal (preview)
            </button>
          ) : null}
        </DrillActions>
      </div>
    );
  }

  return null;
}

function DrillMetricTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--foreground-muted)]">{hint}</div>
    </div>
  );
}

function DrillActions({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">{items}</div>;
}
