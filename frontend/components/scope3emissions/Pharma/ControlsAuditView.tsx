"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { AuditDimension, ControlRegisterRow, PersonaId, Scope3MockData } from "./types";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel, scope3SelectClass } from "./scope3-ui";

type ControlsDrill =
  | { kind: "control"; row: ControlRegisterRow }
  | { kind: "dimension"; d: AuditDimension }
  | { kind: "metric"; label: string; value: string; hint: string };

/** Stable column order for assurance dimension rows (matches inventory workflow). */
const AUDIT_DIMENSION_ORDER = ["completeness", "methodology", "trail", "factors", "verification"] as const;

export function ControlsAuditView({ data, persona }: { data: Scope3MockData; persona: PersonaId }) {
  void persona;
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setChartsReady(true);
    });
  }, []);

  const [fw, setFw] = useState<string>("All");
  const [st, setSt] = useState<string>("All");
  const [owner, setOwner] = useState<string>("All");
  const [drill, setDrill] = useState<ControlsDrill | null>(null);
  const [procurementLinkFilter, setProcurementLinkFilter] = useState<"all" | "high_risk_suppliers">("all");

  const highScope3RiskSupplierIds = useMemo(
    () =>
      new Set(
        data.suppliers
          .filter((s) => s.procurementPriority === "High" || (s.scope3Required === "Yes" && s.risk === "High"))
          .map((s) => s.id),
      ),
    [data.suppliers],
  );

  const owners = useMemo(() => {
    const o = new Set(data.controls.map((c) => c.owner));
    return ["All", ...Array.from(o).sort()];
  }, [data.controls]);

  const frameworks = useMemo(() => {
    const f = new Set<string>();
    data.controls.forEach((c) => c.frameworks.forEach((x) => f.add(x)));
    return ["All", ...Array.from(f).sort()];
  }, [data.controls]);

  const filtered = useMemo(() => {
    return data.controls.filter((c) => {
      if (st !== "All" && c.status !== st) return false;
      if (owner !== "All" && c.owner !== owner) return false;
      if (fw !== "All" && !c.frameworks.includes(fw)) return false;
      if (procurementLinkFilter === "high_risk_suppliers") {
        const linked = c.linkedSupplierIds ?? [];
        if (!linked.some((id) => highScope3RiskSupplierIds.has(id))) return false;
      }
      return true;
    });
  }, [data.controls, fw, st, owner, procurementLinkFilter, highScope3RiskSupplierIds]);

  const sortedFilteredControls = useMemo(() => {
    return [...filtered].sort((a, b) => a.controlId.localeCompare(b.controlId, undefined, { numeric: true }));
  }, [filtered]);

  const sortedAuditDimensions = useMemo(() => {
    const rank = new Map<string, number>(AUDIT_DIMENSION_ORDER.map((k, i) => [k, i]));
    return [...data.auditReadiness.dimensions].sort(
      (a, b) => (rank.get(a.key) ?? 999) - (rank.get(b.key) ?? 999),
    );
  }, [data.auditReadiness.dimensions]);

  const donut = useMemo(() => {
    const counts: Record<string, number> = {};
    data.controls.forEach((c) => {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.controls]);

  const statusSummary = useMemo(() => {
    const m: Record<string, number> = {};
    data.controls.forEach((c) => {
      m[c.status] = (m[c.status] ?? 0) + 1;
    });
    return m;
  }, [data.controls]);

  const trend = data.auditReadiness.quarterlyTrend;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] md:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Scope 3 reporting period</p>
          <p className="mt-1 font-medium text-[var(--foreground)]">{data.inventoryMeta.reportingYearLabel}</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Inventory close {data.company.lastInventoryClose} (illustrative).</p>
        </div>
        <div className="md:border-l md:border-[var(--border)] md:pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Methodology &amp; standard</p>
          <p className="mt-1 text-xs leading-snug text-[var(--foreground)]">{data.inventoryMeta.methodologyVersion}</p>
        </div>
        <div className="border-t border-[var(--border)] pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Organizational boundary (governance)</p>
          <p className="mt-1 line-clamp-4 text-xs leading-snug text-[var(--foreground-muted)]">{data.inventoryMeta.organizationalBoundary}</p>
        </div>
      </div>

      {data.inventoryMeta.dataFreshnessNote ? (
        <p className="text-xs text-[var(--foreground-muted)]">{data.inventoryMeta.dataFreshnessNote}</p>
      ) : null}

      <Scope3Panel>
        <Scope3SectionLabel title="Compliance snapshot" />
        <div className="mt-2 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Control test results</h3>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">Counts by last test rating</p>
            <div className="mx-auto mt-3 h-[200px] w-full max-w-[280px]">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {donut.map((entry) => (
                        <Cell key={entry.name} fill={statusColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--foreground-muted)]">…</div>
              )}
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-[var(--foreground-muted)]">
              {donut.map((d) => (
                <li key={d.name} className="flex justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColor(d.name) }} />
                    {d.name}
                  </span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Assurance composite &amp; trend</h3>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--border)] pb-3">
              <p className="text-xs text-[var(--foreground-muted)]">Composite readiness score</p>
              <p className="text-3xl font-semibold tabular-nums text-[var(--primary)]">{data.auditReadiness.overallPct}%</p>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Last four quarters</p>
            <div className="mt-2 h-[200px] w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "var(--foreground-muted)" }} />
                    <YAxis domain={[60, "auto"]} tick={{ fontSize: 10, fill: "var(--foreground-muted)" }} width={28} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--foreground-muted)]">…</div>
              )}
            </div>
          </div>
        </div>
      </Scope3Panel>

      <Scope3Panel>
        <Scope3SectionLabel title="Control register" />
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Filter label="Reporting / assurance" value={fw} options={frameworks} onChange={setFw} />
            <Filter label="Status" value={st} options={["All", "Effective", "Partially Effective", "Deficient", "Not Assessed"]} onChange={setSt} />
            <Filter label="Owner" value={owner} options={owners} onChange={setOwner} />
            <Filter
              label="Procurement linkage"
              value={procurementLinkFilter === "all" ? "All" : "High Scope 3 risk suppliers"}
              options={["All", "High Scope 3 risk suppliers"]}
              onChange={(v) => setProcurementLinkFilter(v === "All" ? "all" : "high_risk_suppliers")}
            />
          </div>
          {procurementLinkFilter === "high_risk_suppliers" ? (
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Controls linked to suppliers with{" "}
              <span className="font-medium text-[var(--foreground)]">High</span> procurement priority or{" "}
              <span className="font-medium text-[var(--foreground)]">Yes</span> Scope 3 tracking and{" "}
              <span className="font-medium text-[var(--foreground)]">High</span> risk.
            </p>
          ) : null}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
            <table className="min-w-[1120px] w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)] shadow-sm">
                <tr>
                  <th className="px-3 py-2.5">Control ID</th>
                  <th className="px-3 py-2.5">Control objective</th>
                  <th className="px-3 py-2.5">GHG categories</th>
                  <th className="px-3 py-2.5">Linked suppliers</th>
                  <th className="px-3 py-2.5">Reporting map</th>
                  <th className="px-3 py-2.5">Owner</th>
                  <th className="px-3 py-2.5">Frequency</th>
                  <th className="px-3 py-2.5">Last tested</th>
                  <th className="px-3 py-2.5">Result</th>
                  <th className="px-3 py-2.5">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {sortedFilteredControls.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-sm text-[var(--foreground-muted)]">
                      No controls match the filters.
                    </td>
                  </tr>
                ) : (
                  sortedFilteredControls.map((c, idx) => (
                    <tr
                      key={c.controlId}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                        idx % 2 === 1 ? "bg-[var(--muted)]/10" : ""
                      }`}
                      onClick={() => setDrill({ kind: "control", row: c })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDrill({ kind: "control", row: c });
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{c.controlId}</td>
                      <td className="px-3 py-2.5 text-[var(--foreground)]">{c.description}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[var(--foreground-muted)]">
                        {c.scope3Categories ?? "—"}
                      </td>
                      <td className="max-w-[200px] px-3 py-2.5 text-xs text-[var(--foreground-muted)]">
                        {(c.linkedSupplierIds ?? [])
                          .map((id) => data.suppliers.find((s) => s.id === id)?.name)
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[var(--foreground-muted)]">{c.frameworks.join(", ")}</td>
                      <td className="px-3 py-2.5 text-xs">{c.owner}</td>
                      <td className="px-3 py-2.5 text-xs">{c.frequency}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--foreground-muted)]">{c.lastTested}</td>
                      <td className="px-3 py-2.5 text-xs font-medium">{c.status}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--primary)]">{c.evidenceLink}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[var(--foreground-muted)]">
            Showing {sortedFilteredControls.length} of {data.controls.length} (sorted by control ID) · Effective {statusSummary["Effective"] ?? 0} · Partially{" "}
            {statusSummary["Partially Effective"] ?? 0} · Deficient {statusSummary["Deficient"] ?? 0} · Not assessed{" "}
            {statusSummary["Not Assessed"] ?? 0}
          </p>
        </div>
      </Scope3Panel>

      <Scope3Panel>
        <Scope3SectionLabel title="Assurance readiness by dimension" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)] shadow-sm">
              <tr>
                <th className="px-3 py-2.5">Dimension</th>
                <th className="px-3 py-2.5 text-right">Score</th>
                <th className="px-3 py-2.5">Rating</th>
                <th className="px-3 py-2.5">Primary gap</th>
              </tr>
            </thead>
            <tbody>
              {sortedAuditDimensions.map((d, idx) => (
                <tr
                  key={d.key}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                    idx % 2 === 1 ? "bg-[var(--muted)]/10" : ""
                  }`}
                  onClick={() => setDrill({ kind: "dimension", d })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDrill({ kind: "dimension", d });
                    }
                  }}
                >
                  <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">{d.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[var(--foreground)]">{d.score}%</td>
                  <td className="px-3 py-2.5 text-xs">{d.status}</td>
                  <td className="max-w-md px-3 py-2.5 text-xs text-[var(--foreground-muted)]">{d.missing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">Rows follow completeness → methodology → trail → factors → verification. Open a row for remediation detail.</p>
      </Scope3Panel>

      <Scope3Panel>
        <Scope3SectionLabel title="Lineage & compliance signals" />
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Key metrics</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <Metric
              label="GHG record traceability"
              value={`${data.auditReadiness.dataTraceabilityPct}%`}
              hint="Activity rows with source, owner, and method documented."
              onDrill={() =>
                setDrill({
                  kind: "metric",
                  label: "GHG record traceability",
                  value: `${data.auditReadiness.dataTraceabilityPct}%`,
                  hint: "Activity rows with source, owner, and method documented.",
                })
              }
            />
            <Metric
              label="Methodology pack completeness"
              value={`${data.auditReadiness.methodologyDocCompletenessPct}%`}
              hint="Calculation manual, EF registry, GWP, and allocation rules."
              onDrill={() =>
                setDrill({
                  kind: "metric",
                  label: "Methodology pack completeness",
                  value: `${data.auditReadiness.methodologyDocCompletenessPct}%`,
                  hint: "Calculation manual, EF registry, GWP, and allocation rules.",
                })
              }
            />
            <Metric
              label="Controls in register"
              value={String(data.controls.length)}
              hint="Registered Scope 3 controls in this inventory cycle."
              onDrill={() =>
                setDrill({
                  kind: "metric",
                  label: "Controls in register",
                  value: String(data.controls.length),
                  hint: "Registered Scope 3 controls in this inventory cycle.",
                })
              }
            />
          </div>
        </div>
      </Scope3Panel>

      <Scope3DrilldownDrawer
        open={drill != null}
        onClose={() => setDrill(null)}
        title={drill ? controlsDrillTitle(drill) : ""}
        subtitle={drill ? controlsDrillSubtitle(drill) : undefined}
      >
        {drill ? <ControlsDrillBody drill={drill} data={data} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function controlsDrillTitle(d: ControlsDrill): string {
  switch (d.kind) {
    case "control":
      return d.row.controlId;
    case "dimension":
      return d.d.label;
    case "metric":
      return d.label;
  }
}

function controlsDrillSubtitle(d: ControlsDrill): string | undefined {
  switch (d.kind) {
    case "control":
      return d.row.description.length > 120 ? `${d.row.description.slice(0, 118)}…` : d.row.description;
    case "dimension":
      return `Score ${d.d.score}% · ${d.d.status}`;
    default:
      return undefined;
  }
}

function ControlsDrillBody({ drill, data }: { drill: ControlsDrill; data: Scope3MockData }) {
  if (drill.kind === "control") {
    const c = drill.row;
    return (
      <div className="space-y-4 text-sm">
        <p className="text-[var(--foreground-muted)]">{c.description}</p>
        {c.scope3Categories ? (
          <p className="text-xs text-[var(--foreground-muted)]">
            <span className="font-semibold text-[var(--foreground)]">GHG Protocol categories: </span>
            {c.scope3Categories}
          </p>
        ) : null}
        {(c.linkedSupplierIds?.length ?? 0) > 0 ? (
          <p className="text-xs text-[var(--foreground-muted)]">
            <span className="font-semibold text-[var(--foreground)]">Linked upstream suppliers: </span>
            {c.linkedSupplierIds!.map((id) => data.suppliers.find((s) => s.id === id)?.name ?? id).join("; ")}
          </p>
        ) : null}
        {(c.linkedCategoryIds?.length ?? 0) > 0 ? (
          <p className="text-xs text-[var(--foreground-muted)]">
            <span className="font-semibold text-[var(--foreground)]">Inventory category linkage: </span>
            {c.linkedCategoryIds!.map((cid) => {
              const row = data.scope3Categories.find((x) => x.id === cid);
              return `Cat ${cid} (${row?.name ?? "—"})`;
            }).join(" · ")}
          </p>
        ) : null}
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Control owner (governance)</dt>
            <dd>{c.owner}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Frequency</dt>
            <dd>{c.frequency}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Last tested</dt>
            <dd>{c.lastTested}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Last test result</dt>
            <dd>{c.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--foreground-muted)]">Reporting / assurance map</dt>
            <dd>{c.frameworks.join(", ")}</dd>
          </div>
        </dl>
        <div>
          <h3 className="text-xs font-semibold uppercase text-[var(--foreground-muted)]">Scope 3 test procedure</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--foreground-muted)]">
            <li>Sample category activity records linked to this control; confirm mapping to GHG Protocol Scope 3 category definitions.</li>
            <li>Verify evidence hash / retention for supplier or internal source documents supporting sampled quantities.</li>
            <li>Re-perform or independently recalculate emissions for two sampled records using the locked EF version and GWP set.</li>
            <li>Confirm management review or committee minutes reference exceptions found in the reporting period.</li>
          </ol>
        </div>
        <p className="text-xs text-[var(--primary)]">Evidence ref: {c.evidenceLink}</p>
      </div>
    );
  }
  if (drill.kind === "dimension") {
    const d = drill.d;
    return (
      <div className="space-y-3 text-sm text-[var(--foreground-muted)]">
        <p>
          <span className="font-medium text-[var(--foreground)]">{d.score}%</span> · {d.status}
        </p>
        <p>
          <span className="font-semibold text-[var(--foreground)]">Gap: </span>
          {d.missing}
        </p>
        <p>
          <span className="font-semibold text-[var(--foreground)]">Suggested action: </span>
          {d.recommendedAction}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm text-[var(--foreground-muted)]">
      <p>
        <span className="text-2xl font-semibold tabular-nums text-[var(--foreground)]">{drill.value}</span>
      </p>
      <p>{drill.hint}</p>
      <p className="text-xs">
        Workpaper path: /governance/scope3_inventory/fy25/
        {drill.label.replace(/\s+/g, "_").toLowerCase()}
      </p>
    </div>
  );
}

function statusColor(status: string): string {
  if (status === "Effective") return "var(--success)";
  if (status === "Partially Effective") return "var(--warning)";
  if (status === "Deficient") return "var(--danger)";
  return "var(--foreground-subtle)";
}

function Metric({ label, value, hint, onDrill }: { label: string; value: string; hint: string; onDrill?: () => void }) {
  const inner = (
    <>
      <div className="text-xs text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-xs text-[var(--foreground-muted)]">{hint}</div>
      {onDrill ? <p className="mt-2 text-[11px] font-semibold text-[var(--primary)]">Details →</p> : null}
    </>
  );
  if (onDrill) {
    return (
      <button
        type="button"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-left transition-colors hover:bg-[var(--primary-muted)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dashboard-canvas)]"
        onClick={onDrill}
      >
        {inner}
      </button>
    );
  }
  return <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">{inner}</div>;
}

function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
      <span className="font-medium">{label}</span>
      <select className={scope3SelectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
