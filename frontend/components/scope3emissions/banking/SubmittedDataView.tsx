"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileStack,
  Filter,
  Layers,
  Link2,
  Package,
  Scale,
  Shield,
} from "lucide-react";
import type {
  BankEvidenceReviewState,
  BankPersonaId,
  BankScope3MockData,
  BankSubmittedDataRecord,
  BankSubmittedDataStream,
} from "./types";
import { isExternalAuditor } from "./personaAccess";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, scope3InputClass, scope3SelectClass } from "../Pharma/scope3-ui";
import {
  bankBtnSecondary,
  bankPage,
  bankSegmentGroup,
  bankSegmentTabButtonProps,
  bankTable,
  bankTableShell,
  bankTd,
  bankTh,
  bankTrInteractive,
} from "./banking-ui";

const STREAMS: Array<BankSubmittedDataStream | "all"> = ["all", "upstream", "downstream", "internal"];

const REVIEW: Array<BankEvidenceReviewState | "All"> = [
  "All",
  "Indexed — accepted",
  "Under review",
  "Clarification requested",
  "Superseded by resubmission",
];

function reviewBadgeClass(state: BankEvidenceReviewState): string {
  if (state === "Indexed — accepted") return "bg-emerald-500/15 text-emerald-400";
  if (state === "Clarification requested") return "bg-amber-500/15 text-amber-400";
  if (state === "Superseded by resubmission") return "bg-[var(--muted)] text-[var(--foreground-muted)]";
  return "bg-sky-500/15 text-sky-400";
}

function streamLabel(s: BankSubmittedDataStream): string {
  if (s === "upstream") return "Upstream";
  if (s === "downstream") return "Downstream";
  return "Internal";
}

function streamTone(s: BankSubmittedDataStream): string {
  if (s === "upstream") return "text-sky-400";
  if (s === "downstream") return "text-amber-400";
  return "text-violet-400";
}

export function SubmittedDataView({
  data,
  persona,
  onOpenBorrower,
  onOpenUpstreamDownstream,
}: {
  data: BankScope3MockData;
  persona: BankPersonaId;
  onOpenBorrower?: (borrowerId: string) => void;
  onOpenUpstreamDownstream?: (tab?: "upstream" | "downstream") => void;
}) {
  const readOnly = isExternalAuditor(persona);
  const page = data.submittedData;

  const [q, setQ] = useState("");
  const [stream, setStream] = useState<(typeof STREAMS)[number]>("all");
  const [sector, setSector] = useState<string>("All");
  const [review, setReview] = useState<(typeof REVIEW)[number]>("All");
  const [selected, setSelected] = useState<BankSubmittedDataRecord | null>(null);
  const [viewMode, setViewMode] = useState<"register" | "sector">("sector");

  const sectors = useMemo(() => ["All", ...page.sectorRollups.map((s) => s.sector)], [page.sectorRollups]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return page.records.filter((ev) => {
      if (stream !== "all" && ev.stream !== stream) return false;
      if (sector !== "All") {
        const sectorKey = ev.stream === "internal" ? "Bank operations — internal" : ev.stream === "upstream" ? "Bank operations — upstream" : ev.sector;
        if (sectorKey !== sector) return false;
      }
      if (review !== "All" && ev.reviewState !== review) return false;
      if (needle) {
        const hay =
          `${ev.id} ${ev.title} ${ev.counterpartyName} ${ev.sector} ${ev.submitterOrg} ${ev.linkedControlIds.join(" ")} ${ev.assertionSummary}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [page.records, stream, sector, review, q]);

  const stats = useMemo(() => {
    const all = page.records;
    return {
      total: all.length,
      upstream: all.filter((e) => e.stream === "upstream").length,
      downstream: all.filter((e) => e.stream === "downstream").length,
      accepted: all.filter((e) => e.reviewState === "Indexed — accepted").length,
      open: all.filter((e) => e.reviewState === "Under review" || e.reviewState === "Clarification requested").length,
    };
  }, [page.records]);

  const groupedBySector = useMemo(() => {
    const map = new Map<string, BankSubmittedDataRecord[]>();
    for (const r of rows) {
      const key = r.stream === "internal" ? "Bank operations — internal" : r.sector;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  const groupedByCompany = useMemo(() => {
    const map = new Map<string, BankSubmittedDataRecord[]>();
    for (const r of rows) {
      const key = r.counterpartyName;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  return (
    <div className={bankPage}>
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-muted)] text-[var(--primary)]">
            <FileStack className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Evidence register — upstream &amp; downstream</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
              Governed packages from <span className="font-medium text-[var(--foreground)]">suppliers</span> (Categories 1–8) and{" "}
              <span className="font-medium text-[var(--foreground)]">borrowers</span> (Category 15) indexed with SHA-256 hashes, linked to PCAF
              runs and BRSR disclosures. Sector roll-ups show coverage vs. the financed book.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenUpstreamDownstream ? (
              <button type="button" className={bankBtnSecondary} onClick={() => onOpenUpstreamDownstream()}>
                <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Scope 3 boundaries
              </button>
            ) : null}
          </div>
        </div>
        <ol className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4 sm:grid-cols-5">
          {page.lineage.map((step) => (
            <li
              key={step.step}
              className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-2.5 py-2 text-[11px] leading-snug text-[var(--foreground-muted)]"
            >
              <span className="font-bold text-[var(--primary)]">{step.step}.</span>{" "}
              <span className="font-medium text-[var(--foreground)]">{step.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <Scope3KpiStrip
        items={[
          { label: "Packages indexed", value: String(stats.total), sub: "FY25 register slice", tone: "teal" },
          { label: "Upstream (Cat 1–8)", value: String(stats.upstream), sub: "Bank-as-buyer evidence", tone: "blue" },
          { label: "Downstream (Cat 15)", value: String(stats.downstream), sub: "Borrower / financed emissions", tone: "violet" },
          { label: "Accepted", value: String(stats.accepted), sub: "Ready for inventory citation", tone: "emerald" },
          { label: "Open review", value: String(stats.open), sub: "QA or clarification", tone: "amber" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className={bankSegmentGroup}>
          {(["sector", "register"] as const).map((m) => (
            <button key={m} type="button" {...bankSegmentTabButtonProps(viewMode === m)} onClick={() => setViewMode(m)}>
              {m === "sector" ? "By sector" : "Full register"}
            </button>
          ))}
        </div>
        <div className={`${bankSegmentGroup} ml-auto max-w-2xl`}>
          {STREAMS.map((s) => (
            <button key={s} type="button" {...bankSegmentTabButtonProps(stream === s)} onClick={() => setStream(s)}>
              {s === "all" ? "All streams" : streamLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(240px,280px)_1fr]">
        <aside className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              Sector coverage
            </h3>
            <ul className="mt-3 max-h-[420px] space-y-1 overflow-y-auto">
              {sectors.map((s) => {
                const rollup = page.sectorRollups.find((r) => r.sector === s);
                const active = sector === s;
                return (
                  <li key={s}>
                    <button
                      type="button"
                      className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${
                        active ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]" : "hover:bg-[var(--muted)]"
                      }`}
                      onClick={() => setSector(s)}
                    >
                      <span className="font-semibold">{s}</span>
                      {rollup ? (
                        <span className="mt-0.5 block text-[10px] opacity-80">
                          {rollup.companiesWithSubmission}/{rollup.companiesInSector} cos ·{" "}
                          {(rollup.attributedTCO2eCovered / 1e6).toFixed(2)} Mt covered
                        </span>
                      ) : s === "All" ? (
                        <span className="mt-0.5 block text-[10px] opacity-80">All sectors</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-3">
              <Filter className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Filters</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="sd-q" className="text-xs font-medium text-[var(--foreground-muted)]">
                  Search
                </label>
                <input
                  id="sd-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Package ID, company, control…"
                  className={`mt-1 w-full ${scope3InputClass}`}
                />
              </div>
              <div>
                <label htmlFor="sd-review" className="text-xs font-medium text-[var(--foreground-muted)]">
                  Review state
                </label>
                <select
                  id="sd-review"
                  value={review}
                  onChange={(e) => setReview(e.target.value as (typeof REVIEW)[number])}
                  className={`mt-1 w-full ${scope3SelectClass}`}
                >
                  {REVIEW.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {viewMode === "sector" ? (
            <div className="space-y-6">
              {groupedBySector.map(([sec, items]) => {
                const rollup = page.sectorRollups.find((r) => r.sector === sec);
                return (
                  <section key={sec} className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--foreground)]">{sec}</h3>
                        {rollup ? (
                          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">
                            {rollup.downstreamPackages} downstream · {rollup.upstreamPackages} upstream · {rollup.acceptedPackages}{" "}
                            accepted · {(rollup.attributedTCO2eCovered / 1e6).toFixed(2)} MtCO₂e attributed coverage
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">{items.length} packages</p>
                        )}
                      </div>
                    </header>
                    <CompanyEvidenceGroups items={items} onSelect={setSelected} onOpenBorrower={onOpenBorrower} />
                  </section>
                );
              })}
              {groupedBySector.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
                  No packages match the current filters.
                </p>
              ) : null}
            </div>
          ) : (
            <div className={bankTableShell}>
              <table className={bankTable}>
                <thead>
                  <tr>
                    <th className={bankTh}>Package</th>
                    <th className={bankTh}>Stream</th>
                    <th className={bankTh}>Company</th>
                    <th className={bankTh}>Sector</th>
                    <th className={bankTh}>Review</th>
                    <th className={bankTh}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((ev) => (
                    <tr key={ev.id} className={bankTrInteractive} onClick={() => setSelected(ev)}>
                      <td className={bankTd}>
                        <span className="font-mono text-[11px] text-[var(--primary)]">{ev.id}</span>
                        <p className="mt-0.5 max-w-md text-xs font-medium text-[var(--foreground)]">{ev.title}</p>
                      </td>
                      <td className={`${bankTd} text-xs font-semibold ${streamTone(ev.stream)}`}>{streamLabel(ev.stream)}</td>
                      <td className={bankTd}>{ev.counterpartyName}</td>
                      <td className={`${bankTd} text-xs text-[var(--foreground-muted)]`}>{ev.sector}</td>
                      <td className={bankTd}>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${reviewBadgeClass(ev.reviewState)}`}>
                          {ev.reviewState}
                        </span>
                      </td>
                      <td className={`${bankTd} text-xs tabular-nums text-[var(--foreground-muted)]`}>{ev.submittedAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === "register" ? (
            <p className="text-center text-[11px] text-[var(--foreground-muted)]">
              Showing {rows.length} of {page.records.length} packages · Click a row for assurance drill-down
            </p>
          ) : (
            <p className="text-center text-[11px] text-[var(--foreground-muted)]">
              {groupedByCompany.length} companies · {rows.length} packages in view
            </p>
          )}
        </div>
      </div>

      <Scope3DrilldownDrawer
        open={selected != null}
        title={selected?.title ?? "Evidence package"}
        subtitle={selected ? `${selected.id} · ${selected.counterpartyName}` : ""}
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected ? (
          <SubmittedDataDetailBody
            ev={selected}
            readOnly={readOnly}
            onOpenBorrower={onOpenBorrower}
            onOpenUpstreamDownstream={onOpenUpstreamDownstream}
          />
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function CompanyEvidenceGroups({
  items,
  onSelect,
  onOpenBorrower,
}: {
  items: BankSubmittedDataRecord[];
  onSelect: (ev: BankSubmittedDataRecord) => void;
  onOpenBorrower?: (id: string) => void;
}) {
  const byCompany = useMemo(() => {
    const map = new Map<string, BankSubmittedDataRecord[]>();
    for (const r of items) {
      const list = map.get(r.counterpartyName) ?? [];
      list.push(r);
      map.set(r.counterpartyName, list);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <ul className="divide-y divide-[var(--border)]">
      {byCompany.map(([name, pkgs]) => {
        const first = pkgs[0]!;
        return (
          <li key={name} className="px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{name}</p>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {first.counterpartyKind === "borrower" ? "Borrower" : first.counterpartyKind === "supplier" ? "Supplier" : "Internal"} ·{" "}
                  {pkgs.length} package{pkgs.length > 1 ? "s" : ""}
                </p>
              </div>
              {first.counterpartyKind === "borrower" && onOpenBorrower ? (
                <button
                  type="button"
                  className={bankBtnSecondary}
                  onClick={() => onOpenBorrower(first.counterpartyId)}
                >
                  <Building2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Sector explorer
                </button>
              ) : null}
            </div>
            <ul className="mt-3 space-y-2">
              {pkgs.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-left transition hover:bg-[var(--muted)]/40"
                    onClick={() => onSelect(ev)}
                  >
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground-muted)]" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={`text-[10px] font-bold uppercase ${streamTone(ev.stream)}`}>{streamLabel(ev.stream)}</span>
                      <span className="mt-0.5 block text-xs font-medium text-[var(--foreground)]">{ev.title}</span>
                      <span className="mt-1 flex flex-wrap gap-2 text-[10px] text-[var(--foreground-muted)]">
                        <span className="font-mono">{ev.id}</span>
                        <span className={`rounded-full px-1.5 py-0.5 font-semibold ${reviewBadgeClass(ev.reviewState)}`}>
                          {ev.reviewState}
                        </span>
                        <span>{ev.artifacts.length} files</span>
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

function SubmittedDataDetailBody({
  ev,
  readOnly,
  onOpenBorrower,
  onOpenUpstreamDownstream,
}: {
  ev: BankSubmittedDataRecord;
  readOnly: boolean;
  onOpenBorrower?: (id: string) => void;
  onOpenUpstreamDownstream?: (tab?: "upstream" | "downstream") => void;
}) {
  const d = ev.drilldown;

  return (
    <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
      <div className="flex flex-wrap gap-2">
        {ev.counterpartyKind === "borrower" && onOpenBorrower ? (
          <button type="button" className={bankBtnSecondary} onClick={() => onOpenBorrower(ev.counterpartyId)}>
            <Building2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Open in Sectors
          </button>
        ) : null}
        {onOpenUpstreamDownstream ? (
          <button
            type="button"
            className={bankBtnSecondary}
            onClick={() => onOpenUpstreamDownstream(ev.stream === "upstream" ? "upstream" : "downstream")}
          >
            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {ev.stream === "upstream" ? "Upstream" : "Downstream"} boundary view
          </button>
        ) : null}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Stream</dt>
          <dd className={`mt-0.5 font-semibold ${streamTone(ev.stream)}`}>{streamLabel(ev.stream)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Sector</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.sector}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Intake channel</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.channel}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Review state</dt>
          <dd className="mt-0.5 font-medium text-[var(--foreground)]">{ev.reviewState}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Submitted</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.submittedAt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Indexed</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.indexedAt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Data quality tier</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.intendedDataQualityTier}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">GHG categories</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">Cat {ev.scope3CategoryIds.join(", ")}</dd>
        </div>
      </dl>

      {d.pcafOption ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-xs leading-relaxed">
          <span className="font-semibold text-[var(--foreground)]">PCAF: </span>
          Option {d.pcafOption}
          {d.pcafScoreAtSubmission != null ? ` · Score ${d.pcafScoreAtSubmission}` : ""}
          {d.attributionFactorPct != null ? ` · Attribution ${d.attributionFactorPct}%` : ""}
          {d.facilityRefs?.length ? ` · ${d.facilityRefs.join(" · ")}` : ""}
        </p>
      ) : null}

      <details open className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/10 px-3 py-2">
        <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
            Technical traceability
          </span>
        </summary>
        <dl className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-[var(--foreground-muted)]">Inventory object lock</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-[var(--foreground)]">{d.inventoryObjectLockId}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-[var(--foreground-muted)]">Calculation engine path</dt>
            <dd className="mt-0.5 break-all font-mono text-[11px] text-[var(--foreground)]">{d.calculationEngineJobPath}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-[var(--foreground-muted)]">Boundary &amp; period</dt>
            <dd className="mt-1 leading-relaxed text-[var(--foreground)]">{d.boundaryAndPeriodNote}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-[var(--foreground-muted)]">Data-quality rationale</dt>
            <dd className="mt-1 leading-relaxed text-[var(--foreground)]">{d.dataQualityRationale}</dd>
          </div>
        </dl>
      </details>

      <div>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
          Assertion
        </h3>
        <p className="mt-2 leading-relaxed text-[var(--foreground)]">{ev.assertionSummary}</p>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          <Scale className="h-3.5 w-3.5" aria-hidden />
          Verification focus
        </h3>
        <p className="mt-2 leading-relaxed">{ev.verificationFocus}</p>
      </div>

      {d.clarificationsRaised?.length ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--foreground)]">Clarifications: </span>
          {d.clarificationsRaised.join(" ")}
        </div>
      ) : null}

      <div>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          Artifacts ({ev.artifacts.length})
        </h3>
        <ul className="mt-2 space-y-2">
          {ev.artifacts.map((a) => (
            <li key={a.fileName} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
              <p className="font-medium text-[var(--foreground)]">{a.fileName}</p>
              <p className="mt-0.5 text-[var(--foreground-muted)]">
                {a.format} · {a.sizeLabel} · SHA-256 {a.sha256Prefix}…
                {a.virusScan ? ` · ${a.virusScan}` : ""}
              </p>
              {a.contentSummary ? <p className="mt-1 leading-relaxed">{a.contentSummary}</p> : null}
            </li>
          ))}
        </ul>
      </div>

      {d.regulatoryCrosswalk.length > 0 ? (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Regulatory crosswalk
          </h3>
          <ul className="mt-2 space-y-1.5 text-xs">
            {d.regulatoryCrosswalk.map((r, i) => (
              <li key={i} className="rounded border border-[var(--border)] px-2 py-1.5">
                <span className="font-semibold text-[var(--foreground)]">{r.instrument}</span> — {r.clauseOrSection}: {r.relevance}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {readOnly ? (
        <p className="text-xs italic text-[var(--foreground-muted)]">Read-only view for external auditor persona.</p>
      ) : null}
    </div>
  );
}
