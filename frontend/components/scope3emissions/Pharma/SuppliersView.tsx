"use client";

import { startTransition, useEffect, useMemo, useState, useId } from "react";
import { ArrowRight, Building2, ChevronRight, Store, Truck, X } from "lucide-react";
import type {
  BuyerRow,
  EsgDataRequest,
  EsgDataRequestFieldId,
  PersonaId,
  ProcurementPriorityLevel,
  RfqVendorResponse,
  Scope3MockData,
  SupplierRow,
} from "./types";
import { isReadOnlyAuditor } from "./personaAccess";
import { deriveContractNegotiationPoints, derivePurchasingStrategies } from "./scope3-procurement";
import { useScope3Toast } from "./scope3-feedback";
import { Scope3DrilldownDrawer, scope3InputClass, scope3SelectClass } from "./scope3-ui";

type RiskFilter = "All" | "Low" | "Medium" | "High";
type SupplierQualityFilter = "All" | SupplierRow["dataQuality"];
type BuyerQualityFilter = "All" | BuyerRow["dataQuality"];

const COST_OPTIMIZING_STRATEGIES = [
  "Bundle annual volumes into fewer release orders with this supplier to cut freight cost per tonne while improving PCF refresh cadence.",
  "Negotiate a shared third-party verification of key SKUs so you split assurance fees and lock lower unit cost on verified low-carbon inputs.",
  "Move high-spend lines to a vendor-managed inventory lane to reduce working capital and align emissions data updates with stock turns.",
  "Standardize packaging grades across sites to raise order sizes and trim logistics spend without weakening Category 4 data quality.",
  "Pilot a dual-sourcing split: 70% primary supplier + 30% alternate with comparable ESG score to create pricing leverage on renewals.",
  "Shift from spot buys to a 24-month framework with inflation caps tied to verified intensity targets — stabilizes cost and Scope 3 factors.",
  "Consolidate tail spend through a preferred integrator to capture volume rebates and one consolidated emissions submission per quarter.",
  "Offer longer payment terms in exchange for supplier-funded LCA refresh on top SKUs — lowers your direct project cost while refreshing data.",
] as const;

/** Deterministic “random” pick per supplier so the scorecard stays stable when reopened. */
function costOptimizingStrategyForSupplier(supplierId: string): string {
  let h = 0;
  for (let i = 0; i < supplierId.length; i++) {
    h = (h * 33 + supplierId.charCodeAt(i)) >>> 0;
  }
  return COST_OPTIMIZING_STRATEGIES[h % COST_OPTIMIZING_STRATEGIES.length];
}

const ESG_REQUEST_FIELD_OPTIONS: { id: EsgDataRequestFieldId; label: string; hint: string }[] = [
  { id: "emissions_data", label: "GHG emissions data", hint: "Facility- or product-level activity data supporting Category 1–4 inventory lines." },
  { id: "certifications", label: "Certifications & schemes", hint: "ISCC, ISO 50001, green power certificates, or equivalent assurance artifacts." },
  { id: "energy_usage", label: "Energy usage", hint: "Metered electricity, steam, and fuel splits aligned to GHG Protocol Scope 2 market-based reporting." },
  { id: "lifecycle_data", label: "Lifecycle / PCF data", hint: "Cradle-to-gate or cradle-to-grave LCA outputs for PCF refresh and Category 12 linkage." },
];

function ProcurementPriorityBadge({ level }: { level: SupplierRow["procurementPriority"] }) {
  const cls =
    level === "High"
      ? "border-[var(--danger)]/35 bg-[var(--danger-bg)] text-[var(--danger)]"
      : level === "Medium"
        ? "border-[var(--warning)]/35 bg-[var(--warning-bg)] text-[var(--warning)]"
        : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground-muted)]";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>{level}</span>
  );
}

function Scope3RequiredLabel({ v }: { v: SupplierRow["scope3Required"] }) {
  const label = v === "Yes" ? "Yes" : v === "Partial" ? "Partial" : "No";
  return (
    <span className={v === "No" ? "text-[var(--foreground-muted)]" : "font-medium text-[var(--foreground)]"}>{label}</span>
  );
}

function EvaluationScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className="tabular-nums font-semibold text-[var(--foreground)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function ValueChainVision({ data }: { data: Scope3MockData }) {
  const upstreamT = data.suppliers.reduce((a, s) => a + s.scope3ContributionTCO2e, 0);
  const downstreamT = data.buyers.reduce((a, b) => a + b.downstreamScope3TCO2e, 0);
  const fmtKt = (tCO2e: number) =>
    (tCO2e / 1000).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--surface)] to-[var(--muted)]/35 p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
        Value chain at a glance
      </p>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--foreground-muted)]">
        <span className="font-medium text-[var(--foreground)]">Suppliers</span> sit upstream (purchased goods, logistics to you, capital goods — GHG Categories 1–8).{" "}
        <span className="font-medium text-[var(--foreground)]">Buyers</span> sit downstream (distribution after sale, processing, use, end-of-life — Categories 9–12). Both
        tables on this page roll into the same Scope 3 inventory and BRSR value-chain narrative.
      </p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <div className="flex w-full flex-col rounded-xl border border-[var(--border)] bg-[var(--success-bg)]/15 p-4 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
          <div className="flex items-center gap-2 text-[var(--success)]">
            <Truck className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wide">Upstream</span>
          </div>
          <div className="mt-2 text-base font-semibold text-[var(--foreground)]">Suppliers</div>
          <p className="mt-1 text-xs leading-snug text-[var(--foreground-muted)]">Spend-weighted; PCFs & submissions</p>
          <div className="mt-3 text-2xl font-bold tabular-nums text-[var(--foreground)]">{fmtKt(upstreamT)}</div>
          <div className="text-[11px] text-[var(--foreground-muted)]">ktCO₂e attributed · {data.suppliers.length} in scope</div>
        </div>

        <div className="flex shrink-0 items-center justify-center py-0.5 text-[var(--primary)]" aria-hidden>
          <ArrowRight className="h-6 w-6 rotate-90" />
        </div>

        <div className="flex w-full flex-col rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Building2 className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wide">Reporting boundary</span>
          </div>
          <div className="mt-2 text-base font-semibold text-[var(--foreground)]">{data.company.shortName}</div>
          <p className="mt-1 text-xs leading-snug text-[var(--foreground-muted)]">Operational control · India</p>
          <div className="mt-3 text-xs leading-relaxed text-[var(--foreground-muted)]">
            Inventory close {data.company.lastInventoryClose}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center py-0.5 text-[var(--primary)]" aria-hidden>
          <ArrowRight className="h-6 w-6 rotate-90" />
        </div>

        <div className="flex w-full flex-col rounded-xl border border-[var(--border)] bg-[var(--info-bg)]/25 p-4 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]">
          <div className="flex items-center gap-2 text-[var(--info)]">
            <Store className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wide">Downstream</span>
          </div>
          <div className="mt-2 text-base font-semibold text-[var(--foreground)]">Buyers & channels</div>
          <p className="mt-1 text-xs leading-snug text-[var(--foreground-muted)]">Sales-attributed; TMS & surveys</p>
          <div className="mt-3 text-2xl font-bold tabular-nums text-[var(--foreground)]">{fmtKt(downstreamT)}</div>
          <div className="text-[11px] text-[var(--foreground-muted)]">ktCO₂e modelled · {data.buyers.length} in scope</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#upstream-suppliers"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
        >
          Jump to suppliers <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </a>
        <a
          href="#downstream-buyers"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
        >
          Jump to buyers <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function SuppliersView({
  data,
  persona,
  initialSupplierId,
  initialBuyerId,
  onClearInitialSupplier,
  onClearInitialBuyer,
  onSelectCategory,
  onCreateEsgRequest,
}: {
  data: Scope3MockData;
  persona: PersonaId;
  initialSupplierId: string | null;
  initialBuyerId: string | null;
  onClearInitialSupplier: () => void;
  onClearInitialBuyer: () => void;
  onSelectCategory: (id: number) => void;
  onCreateEsgRequest?: (draft: Omit<EsgDataRequest, "id" | "createdAt">) => void;
}) {
  const [supplierSegment, setSupplierSegment] = useState<string>("All");
  const [supplierRisk, setSupplierRisk] = useState<RiskFilter>("All");
  const [supplierQuality, setSupplierQuality] = useState<SupplierQualityFilter>("All");
  const [supplierStatus, setSupplierStatus] = useState<string>("All");
  const [supplierProcurementPrio, setSupplierProcurementPrio] = useState<"All" | ProcurementPriorityLevel>("All");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierDetail, setSupplierDetail] = useState<SupplierRow | null>(null);
  const [supplierTab, setSupplierTab] = useState<"overview" | "timeline" | "signals" | "scope3_assessment">("overview");

  const [buyerSegment, setBuyerSegment] = useState<string>("All");
  const [buyerRisk, setBuyerRisk] = useState<RiskFilter>("All");
  const [buyerQuality, setBuyerQuality] = useState<BuyerQualityFilter>("All");
  const [buyerStatus, setBuyerStatus] = useState<string>("All");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerDetail, setBuyerDetail] = useState<BuyerRow | null>(null);
  const [buyerTab, setBuyerTab] = useState<"overview" | "timeline" | "signals">("overview");

  const [rfqDrill, setRfqDrill] = useState<RfqVendorResponse | null>(null);
  const [esgModalOpen, setEsgModalOpen] = useState(false);
  const [esgRequestNote, setEsgRequestNote] = useState("");
  const [esgFields, setEsgFields] = useState<Record<EsgDataRequestFieldId, boolean>>({
    emissions_data: true,
    certifications: true,
    energy_usage: false,
    lifecycle_data: false,
  });

  const readOnly = isReadOnlyAuditor(persona);
  const { pushToast } = useScope3Toast();

  const supplierSegments = useMemo(() => {
    const s = new Set(data.suppliers.map((x) => x.segment));
    return ["All", ...Array.from(s).sort()];
  }, [data.suppliers]);

  const supplierRows = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    return data.suppliers.filter((s) => {
      if (supplierSegment !== "All" && s.segment !== supplierSegment) return false;
      if (supplierRisk !== "All" && s.risk !== supplierRisk) return false;
      if (supplierQuality !== "All" && s.dataQuality !== supplierQuality) return false;
      if (supplierStatus !== "All" && s.submissionStatus !== supplierStatus) return false;
      if (supplierProcurementPrio !== "All" && s.procurementPriority !== supplierProcurementPrio) return false;
      if (q) {
        const hay = `${s.name} ${s.segment} ${s.productPurchased} ${s.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    data.suppliers,
    supplierSegment,
    supplierRisk,
    supplierQuality,
    supplierStatus,
    supplierProcurementPrio,
    supplierSearch,
  ]);

  const buyerSegments = useMemo(() => {
    const s = new Set(data.buyers.map((x) => x.segment));
    return ["All", ...Array.from(s).sort()];
  }, [data.buyers]);

  const buyerRows = useMemo(() => {
    const q = buyerSearch.trim().toLowerCase();
    return data.buyers.filter((b) => {
      if (buyerSegment !== "All" && b.segment !== buyerSegment) return false;
      if (buyerRisk !== "All" && b.risk !== buyerRisk) return false;
      if (buyerQuality !== "All" && b.dataQuality !== buyerQuality) return false;
      if (buyerStatus !== "All" && b.collaborationStatus !== buyerStatus) return false;
      if (q) {
        const hay = `${b.name} ${b.segment} ${b.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.buyers, buyerSegment, buyerRisk, buyerQuality, buyerStatus, buyerSearch]);

  const supplierFromNav = useMemo(() => {
    if (!initialSupplierId) return null;
    return data.suppliers.find((s) => s.id === initialSupplierId) ?? null;
  }, [data.suppliers, initialSupplierId]);

  const buyerFromNav = useMemo(() => {
    if (!initialBuyerId) return null;
    return data.buyers.find((b) => b.id === initialBuyerId) ?? null;
  }, [data.buyers, initialBuyerId]);

  const effectiveSupplier = supplierDetail ?? supplierFromNav;
  const effectiveBuyer = buyerDetail ?? buyerFromNav;

  useEffect(() => {
    if (!effectiveSupplier) return;
    startTransition(() => {
      setSupplierTab("overview");
    });
  }, [effectiveSupplier]);

  useEffect(() => {
    if (!effectiveBuyer) return;
    startTransition(() => {
      setBuyerTab("overview");
    });
  }, [effectiveBuyer]);

  return (
    <div className="relative space-y-10">
      <ValueChainVision data={data} />

      <section id="upstream-suppliers" className="scroll-mt-24 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Upstream — suppliers</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--foreground-muted)]">
            Vendors and service providers where you have spend and emissions factors — strongest lever for Category 1 and upstream logistics.
          </p>
          {persona === "procurement_gm" ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--primary-muted)]/15 p-4 text-sm leading-relaxed text-[var(--foreground-muted)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">Scope 3 trigger engine (procurement)</p>
              <p className="mt-2">
                Classification uses whether <span className="font-medium text-[var(--foreground)]">GHG Protocol Category 1–8</span> tracking is required (Yes / Partial / No)
                from deterministic rules: <span className="font-medium text-[var(--foreground)]">spend materiality</span>,{" "}
                <span className="font-medium text-[var(--foreground)]">emission-intensity segment</span> (e.g. API, logistics, cold chain), and{" "}
                <span className="font-medium text-[var(--foreground)]">supplier criticality</span> (risk tier proxy). Priority flags the follow-up intensity for data assurance and
                RFQ gates. Open a scorecard to see the obligation flag. Use filters below to focus high-obligation suppliers before inventory lock.
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Find suppliers
          </p>
          <div className="space-y-4">
            <div className="max-w-xl">
              <label htmlFor="scope3-supplier-search" className="block text-xs font-medium text-[var(--foreground-muted)]">
                Search
              </label>
              <input
                id="scope3-supplier-search"
                type="search"
                placeholder="Name, segment, product, or ID…"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className={`mt-1.5 w-full ${scope3InputClass}`}
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
              <FilterSelect label="Segment" value={supplierSegment} options={supplierSegments} onChange={setSupplierSegment} />
              <FilterSelect
                label="Risk"
                value={supplierRisk}
                options={["All", "Low", "Medium", "High"]}
                onChange={(v) => setSupplierRisk(v as RiskFilter)}
              />
              <FilterSelect
                label="Data quality"
                value={supplierQuality}
                options={["All", "Primary", "Secondary", "Spend-Based", "Not Assessed"]}
                onChange={(v) => setSupplierQuality(v as SupplierQualityFilter)}
              />
              <FilterSelect
                label="Submission"
                value={supplierStatus}
                options={["All", "Verified", "Submitted", "Pending", "Overdue"]}
                onChange={setSupplierStatus}
              />
              <FilterSelect
                label="Priority"
                value={supplierProcurementPrio}
                options={["All", "High", "Medium", "Low"]}
                onChange={(v) => setSupplierProcurementPrio(v as "All" | ProcurementPriorityLevel)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 md:hidden" aria-label="Supplier list (compact)">
          {supplierRows.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              No suppliers match the current filters or search.
            </p>
          ) : (
            supplierRows.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition-[border-color,box-shadow,transform] hover:border-[var(--primary)]/40 hover:shadow-lg hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dashboard-canvas)] dark:ring-white/[0.06]"
                onClick={() => {
                  setSupplierDetail(s);
                  setBuyerDetail(null);
                  setSupplierTab("overview");
                  onClearInitialSupplier();
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--foreground)]">{s.name}</div>
                    <div className="mt-0.5 text-xs text-[var(--foreground-muted)]">{s.segment}</div>
                    <div className="mt-1 line-clamp-2 text-[11px] text-[var(--foreground-muted)]">
                      <span className="font-medium text-[var(--foreground)]">Product: </span>
                      {s.productPurchased}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ProcurementPriorityBadge level={s.procurementPriority} />
                    </div>
                  </div>
                  <RiskDot risk={s.risk} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--foreground-muted)]">Spend (₹ Cr)</span>
                    <div className="font-medium tabular-nums text-[var(--foreground)]">{s.annualSpendCr.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">Scope 3 (t)</span>
                    <div className="font-medium tabular-nums text-[var(--foreground)]">
                      {Math.round(s.scope3ContributionTCO2e).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">ESG (%)</span>
                    <div className="font-medium text-[var(--foreground)]">{s.esgScore}</div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">Quality</span>
                    <div className="font-medium text-[var(--foreground)]">{s.dataQuality}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--foreground-muted)]">
                  <span>{s.submissionStatus}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)]">
                    Scorecard <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[1220px] w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)] shadow-sm">
                <tr>
                  <th className="px-3 py-2">Supplier</th>
                  <th className="px-3 py-2">Segment</th>
                  <th className="px-3 py-2">Product purchased</th>
                  <th className="px-3 py-2 text-right">Spend (₹ Cr)</th>
                  <th className="px-3 py-2 text-right">Scope 3 (tCO₂e)</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2 text-right">ESG (%)</th>
                  <th className="px-3 py-2">Quality</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">BRSR</th>
                  <th className="px-3 py-2">Assessed</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {supplierRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-3 py-10 text-center text-sm text-[var(--foreground-muted)]">
                      No suppliers match the current filters or search. Clear filters or adjust the search query.
                    </td>
                  </tr>
                ) : (
                  supplierRows.map((s, idx) => (
                    <tr
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                        idx % 2 === 1 ? "bg-[var(--muted)]/15" : ""
                      }`}
                      onClick={() => {
                        setSupplierDetail(s);
                        setBuyerDetail(null);
                        setSupplierTab("overview");
                        onClearInitialSupplier();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSupplierDetail(s);
                          setBuyerDetail(null);
                          setSupplierTab("overview");
                          onClearInitialSupplier();
                        }
                      }}
                    >
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.name}</td>
                      <td className="px-3 py-2 text-[var(--foreground-muted)]">{s.segment}</td>
                      <td className="max-w-[240px] px-3 py-2 text-xs leading-snug text-[var(--foreground)]">
                        {s.productPurchased}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.annualSpendCr.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Math.round(s.scope3ContributionTCO2e).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2">
                        <ProcurementPriorityBadge level={s.procurementPriority} />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{s.esgScore}</td>
                      <td className="px-3 py-2 text-xs">{s.dataQuality}</td>
                      <td className="px-3 py-2 text-xs">{s.submissionStatus}</td>
                      <td className="px-3 py-2 text-xs">{s.brsrMapped ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{s.lastAssessed}</td>
                      <td className="px-3 py-2">
                        <RiskDot risk={s.risk} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSupplierDetail(s);
                            setBuyerDetail(null);
                            setSupplierTab("overview");
                            onClearInitialSupplier();
                          }}
                        >
                          Scorecard <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Live RFQ — normalized comparison</h3>
              <p className="text-xs text-[var(--foreground-muted)]">
                {data.rfq.title} · {data.rfq.commodity} · Due {data.rfq.dueDate}
              </p>
            </div>
            {!readOnly && (
              <span className="text-xs text-[var(--foreground-muted)]">Upload complete — 8 vendor scorecards ingested.</span>
            )}
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[880px] w-full border-collapse text-sm">
              <thead className="bg-[var(--muted)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2 text-right">Scope 3 score</th>
                  <th className="px-3 py-2">Data quality</th>
                  <th className="px-3 py-2 text-right">Verified %</th>
                  <th className="px-3 py-2">Evidence pack</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[...data.rfq.responses]
                  .sort((a, b) => b.scope3Score - a.scope3Score)
                  .map((r) => (
                    <tr
                      key={r.vendorName}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
                      onClick={() => setRfqDrill(r)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setRfqDrill(r);
                        }
                      }}
                    >
                      <td className="px-3 py-2 font-medium">{r.vendorName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.scope3Score}</td>
                      <td className="px-3 py-2 text-xs">{r.dataQuality}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.verifiedPct}%</td>
                      <td className="px-3 py-2 text-xs">{r.evidencePackReady ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{r.notes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="downstream-buyers" className="scroll-mt-24 space-y-6 border-t border-[var(--border)] pt-10">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Downstream — buyers & channels</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--foreground-muted)]">
            Customers and distributors where attributed sales and logistics samples drive Categories 9–12. Cooperation scores reflect how willingly they share TMS slices, hospital
            surveys, and use-phase assumptions.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Find buyers & channels
          </p>
          <div className="space-y-4">
            <div className="max-w-xl">
              <label htmlFor="scope3-buyer-search" className="block text-xs font-medium text-[var(--foreground-muted)]">
                Search
              </label>
              <input
                id="scope3-buyer-search"
                type="search"
                placeholder="Name, segment, or ID…"
                value={buyerSearch}
                onChange={(e) => setBuyerSearch(e.target.value)}
                className={`mt-1.5 w-full ${scope3InputClass}`}
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
              <FilterSelect label="Segment" value={buyerSegment} options={buyerSegments} onChange={setBuyerSegment} />
              <FilterSelect
                label="Risk"
                value={buyerRisk}
                options={["All", "Low", "Medium", "High"]}
                onChange={(v) => setBuyerRisk(v as RiskFilter)}
              />
              <FilterSelect
                label="Data quality"
                value={buyerQuality}
                options={["All", "Primary", "Secondary", "Spend-Based", "Not Assessed"]}
                onChange={(v) => setBuyerQuality(v as BuyerQualityFilter)}
              />
              <FilterSelect
                label="Collaboration"
                value={buyerStatus}
                options={["All", "Verified", "Submitted", "Pending", "Overdue"]}
                onChange={setBuyerStatus}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 md:hidden" aria-label="Buyer list (compact)">
          {buyerRows.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
              No buyers match the current filters or search.
            </p>
          ) : (
            buyerRows.map((b) => (
              <button
                key={b.id}
                type="button"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] transition-[border-color,box-shadow,transform] hover:border-[var(--primary)]/40 hover:shadow-lg hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dashboard-canvas)] dark:ring-white/[0.06]"
                onClick={() => {
                  setBuyerDetail(b);
                  setSupplierDetail(null);
                  setBuyerTab("overview");
                  onClearInitialBuyer();
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--foreground)]">{b.name}</div>
                    <div className="mt-0.5 text-xs text-[var(--foreground-muted)]">{b.segment}</div>
                  </div>
                  <RiskDot risk={b.risk} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--foreground-muted)]">Sales (₹ Cr)</span>
                    <div className="font-medium tabular-nums text-[var(--foreground)]">{b.annualSalesCr.toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">Downstream Scope 3 (t)</span>
                    <div className="font-medium tabular-nums text-[var(--foreground)]">
                      {Math.round(b.downstreamScope3TCO2e).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">Cooperation</span>
                    <div className="font-medium text-[var(--foreground)]">{b.disclosureCooperationScore}</div>
                  </div>
                  <div>
                    <span className="text-[var(--foreground-muted)]">Quality</span>
                    <div className="font-medium text-[var(--foreground)]">{b.dataQuality}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--foreground-muted)]">
                  <span>{b.collaborationStatus}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--primary)]">
                    Scorecard <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)] shadow-sm">
                <tr>
                  <th className="px-3 py-2">Buyer / channel</th>
                  <th className="px-3 py-2">Segment</th>
                  <th className="px-3 py-2 text-right">Sales (₹ Cr)</th>
                  <th className="px-3 py-2 text-right">Downstream Scope 3 (tCO₂e)</th>
                  <th className="px-3 py-2 text-right">Cooperation</th>
                  <th className="px-3 py-2">Quality</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Value chain</th>
                  <th className="px-3 py-2">Reviewed</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {buyerRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 py-10 text-center text-sm text-[var(--foreground-muted)]">
                      No buyers match the current filters or search. Clear filters or adjust the search query.
                    </td>
                  </tr>
                ) : (
                  buyerRows.map((b, idx) => (
                    <tr
                      key={b.id}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                        idx % 2 === 1 ? "bg-[var(--muted)]/15" : ""
                      }`}
                      onClick={() => {
                        setBuyerDetail(b);
                        setSupplierDetail(null);
                        setBuyerTab("overview");
                        onClearInitialBuyer();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setBuyerDetail(b);
                          setSupplierDetail(null);
                          setBuyerTab("overview");
                          onClearInitialBuyer();
                        }
                      }}
                    >
                      <td className="px-3 py-2 font-medium text-[var(--foreground)]">{b.name}</td>
                      <td className="px-3 py-2 text-[var(--foreground-muted)]">{b.segment}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{b.annualSalesCr.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Math.round(b.downstreamScope3TCO2e).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{b.disclosureCooperationScore}</td>
                      <td className="px-3 py-2 text-xs">{b.dataQuality}</td>
                      <td className="px-3 py-2 text-xs">{b.collaborationStatus}</td>
                      <td className="px-3 py-2 text-xs">{b.valueChainMapped ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs text-[var(--foreground-muted)]">{b.lastReviewed}</td>
                      <td className="px-3 py-2">
                        <RiskDot risk={b.risk} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBuyerDetail(b);
                            setSupplierDetail(null);
                            setBuyerTab("overview");
                            onClearInitialBuyer();
                          }}
                        >
                          Scorecard <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!readOnly && (
          <p className="text-center text-xs text-[var(--foreground-muted)] md:text-left">
            Open a buyer scorecard to jump into downstream GHG categories and BRSR value-chain mapping.
          </p>
        )}
      </section>

      {effectiveSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 p-4" role="dialog" aria-modal>
          <div className="flex h-full w-full max-w-lg flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--success)]">Supplier</div>
                <div className="text-base font-semibold text-[var(--foreground)]">{effectiveSupplier.name}</div>
                <div className="text-xs text-[var(--foreground-muted)]">{effectiveSupplier.segment}</div>
                <p className="mt-1 text-xs leading-snug text-[var(--foreground)]">
                  <span className="text-[var(--foreground-muted)]">Product purchased · </span>
                  {effectiveSupplier.productPurchased}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--muted)]"
                aria-label="Close"
                onClick={() => {
                  setSupplierDetail(null);
                  onClearInitialSupplier();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-[var(--border)] px-4 pt-2">
              <div className="flex gap-1 rounded-lg bg-[var(--muted)]/50 p-1 text-xs">
                {(
                  [
                    ["overview", "Overview"],
                    ["scope3_assessment", "Scope 3 Assessment"],
                    ["timeline", "Timeline"],
                    ["signals", "Signals"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`flex-1 rounded-md px-2 py-1.5 font-medium ${
                      supplierTab === id ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-muted)]"
                    }`}
                    onClick={() => setSupplierTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
              {supplierTab === "overview" ? (
                <>
                  <dl className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Annual spend</dt>
                      <dd className="font-medium tabular-nums">₹ {effectiveSupplier.annualSpendCr.toFixed(1)} Cr</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Scope 3 contribution</dt>
                      <dd className="font-medium tabular-nums">
                        {Math.round(effectiveSupplier.scope3ContributionTCO2e).toLocaleString("en-IN")} tCO₂e
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">ESG (%)</dt>
                      <dd className="font-medium">{effectiveSupplier.esgScore}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Data quality</dt>
                      <dd className="font-medium">{effectiveSupplier.dataQuality}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Scope 3 required</dt>
                      <dd>
                        <Scope3RequiredLabel v={effectiveSupplier.scope3Required} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Priority</dt>
                      <dd>
                        <ProcurementPriorityBadge level={effectiveSupplier.procurementPriority} />
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Category footprint</div>
                    <ul className="mt-2 space-y-1">
                      {effectiveSupplier.primaryCategories.map((cid) => {
                        const c = data.scope3Categories.find((x) => x.id === cid);
                        return (
                          <li key={cid}>
                            <button
                              type="button"
                              className="text-left text-sm text-[var(--primary)] hover:underline"
                              onClick={() => {
                                onSelectCategory(cid);
                                setSupplierDetail(null);
                                onClearInitialSupplier();
                              }}
                            >
                              Cat {cid}: {c?.name ?? "—"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Data gaps</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground)]">
                      {effectiveSupplier.dataGaps.length ? (
                        effectiveSupplier.dataGaps.map((g) => <li key={g}>{g}</li>)
                      ) : (
                        <li className="text-[var(--foreground-muted)]">No material gaps flagged.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">AI insights</div>
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Suggested actions</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                        {effectiveSupplier.aiSuggestedActions.map((g) => (
                          <li key={g} className="text-[var(--foreground)]">
                            {g}
                          </li>
                        ))}
                        <li className="text-[var(--foreground)]">
                          <span className="font-medium text-[var(--foreground)]">Cost optimizing strategy · </span>
                          <span className="text-[var(--foreground-muted)]">{costOptimizingStrategyForSupplier(effectiveSupplier.id)}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                        Purchasing strategies
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-[var(--foreground-muted)]">
                        Tailored to this supplier&apos;s spend, Scope 3 obligation, data quality, submission status, and risk tier — not legal or commercial advice.
                      </p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[var(--foreground)]">
                        {derivePurchasingStrategies(effectiveSupplier).map((line, idx) => (
                          <li key={idx} className="leading-snug text-[var(--foreground-muted)]">
                            <span className="text-[var(--foreground)]">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                        Contract negotiation
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-[var(--foreground-muted)]">
                        Illustrative clause and leverage themes for Scope 3–linked commercial terms — requires legal review before use.
                      </p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[var(--foreground)]">
                        {deriveContractNegotiationPoints(effectiveSupplier).map((line, idx) => (
                          <li key={`cn-${idx}`} className="leading-snug text-[var(--foreground-muted)]">
                            <span className="text-[var(--foreground)]">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {!readOnly && onCreateEsgRequest ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-[var(--primary)] px-3 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] sm:w-auto"
                        onClick={() => {
                          setEsgRequestNote("");
                          setEsgModalOpen(true);
                        }}
                      >
                        Request Scope 3 Data
                      </button>
                      <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">
                        Opens a governed request pack for GHG evidence — routed to the supplier portal queue.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : supplierTab === "scope3_assessment" ? (
                <div className="space-y-4">
                  <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
                    Structured Scope 3 evaluation for procurement decisions: scores reflect vendor posture, material data gaps,
                    process quality of submissions, and modeled inventory impact for GHG Protocol Category 1–8 coverage.
                  </p>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                      Overall assurance risk
                    </p>
                    <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{effectiveSupplier.scope3Evaluation.overallRisk}</p>
                    <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                      Composite sourcing index{" "}
                      <span className="font-semibold tabular-nums text-[var(--foreground)]">{effectiveSupplier.scope3Evaluation.compositeIndex}</span>
                      <span className="text-[var(--foreground-muted)]"> / 100</span> — deterministic blend of vendor, material, process, and inventory-impact signals.
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--foreground-muted)]">
                      Derived from evaluation dimensions below — use alongside control testing in Risk &amp; Compliance.
                    </p>
                  </div>
                  <EvaluationScoreBar label="Vendor Reputation" value={effectiveSupplier.scope3Evaluation.vendorScore} />
                  <EvaluationScoreBar label="Material & data gaps" value={effectiveSupplier.scope3Evaluation.materialScore} />
                  <EvaluationScoreBar label="Process & submission quality" value={effectiveSupplier.scope3Evaluation.processScore} />
                  <EvaluationScoreBar label="Inventory impact weighting" value={effectiveSupplier.scope3Evaluation.impactScore} />
                </div>
              ) : supplierTab === "timeline" ? (
                <ol className="space-y-3 text-sm text-[var(--foreground-muted)]">
                  <li className="border-l-2 border-[var(--primary)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Desk review</div>
                    <div>{effectiveSupplier.lastAssessed} — ESG questionnaire + spend tie-out.</div>
                  </li>
                  <li className="border-l-2 border-[var(--border)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Submission</div>
                    <div>
                      Status {effectiveSupplier.submissionStatus}; BRSR mapping {effectiveSupplier.brsrMapped ? "linked" : "pending"}.
                    </div>
                  </li>
                  <li className="border-l-2 border-[var(--border)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Next gate</div>
                    <div>PCF refresh or export consignment evidence if DGFT pilot SKUs apply.</div>
                  </li>
                </ol>
              ) : (
                <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
                  {(() => {
                    const match = (i: { linkedSupplier?: string; linkedCategoryId?: number }) =>
                      i.linkedSupplier === effectiveSupplier.name ||
                      (i.linkedCategoryId != null && effectiveSupplier.primaryCategories.includes(i.linkedCategoryId));
                    const base = data.aiInsights.filter(match);
                    const extra = persona === "procurement_gm" ? data.procurementGmInsights.filter(match) : [];
                    const merged = [...extra, ...base];
                    const seen = new Set<string>();
                    return merged.filter((i) => {
                      if (seen.has(i.id)) return false;
                      seen.add(i.id);
                      return true;
                    });
                  })().map((i) => (
                    <li key={i.id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2">
                      <span className="text-xs font-semibold text-[var(--foreground)]">{i.severity}</span>
                      <div className="mt-0.5 text-[var(--foreground)]">{i.title}</div>
                      <div className="mt-1 text-xs">{i.detail}</div>
                    </li>
                  ))}
                  {(() => {
                    const match = (i: { linkedSupplier?: string; linkedCategoryId?: number }) =>
                      i.linkedSupplier === effectiveSupplier.name ||
                      (i.linkedCategoryId != null && effectiveSupplier.primaryCategories.includes(i.linkedCategoryId));
                    const base = data.aiInsights.filter(match);
                    const extra = persona === "procurement_gm" ? data.procurementGmInsights.filter(match) : [];
                    const merged = [...extra, ...base];
                    const seen = new Set<string>();
                    return merged.filter((i) => {
                      if (seen.has(i.id)) return false;
                      seen.add(i.id);
                      return true;
                    });
                  })().length === 0 ? (
                    <li className="text-[var(--foreground-muted)]">No linked AI signals for this supplier.</li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {esgModalOpen && effectiveSupplier ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal aria-labelledby="esg-req-title">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)]">
            <h2 id="esg-req-title" className="text-base font-semibold text-[var(--foreground)]">
              Request Scope 3 data — {effectiveSupplier.name}
            </h2>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Select evidence fields for the supplier portal queue. Aligns with GHG Protocol data-quality hierarchy and BRSR assurance expectations.
            </p>
            <ul className="mt-4 space-y-3">
              {ESG_REQUEST_FIELD_OPTIONS.map((f) => (
                <li key={f.id}>
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-3 text-sm hover:bg-[var(--muted)]/40">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-[var(--border)]"
                      checked={esgFields[f.id]}
                      onChange={(e) => setEsgFields((prev) => ({ ...prev, [f.id]: e.target.checked }))}
                    />
                    <span>
                      <span className="font-medium text-[var(--foreground)]">{f.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--foreground-muted)]">{f.hint}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <details className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/15 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--primary)] outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                Add a note — request specific data (optional)
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">
                Describe SKUs, sites, periods, file formats, or calculations you need beyond the checkboxes above. This text is shown to the supplier with the portal request.
              </p>
              <label htmlFor="esg-req-note" className="sr-only">
                Additional request details for supplier
              </label>
              <textarea
                id="esg-req-note"
                rows={4}
                value={esgRequestNote}
                onChange={(e) => setEsgRequestNote(e.target.value)}
                placeholder="e.g. FY25 Q3 electricity for Vadodara formulation line B; ISO 50001 cert for site code VD-02; PCF for SKU SP-API-4412 (cradle-to-gate)…"
                className={`mt-2 min-h-[5rem] w-full resize-y ${scope3InputClass}`}
              />
            </details>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                onClick={() => {
                  setEsgModalOpen(false);
                  setEsgRequestNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
                onClick={() => {
                  const requestedFields = (Object.keys(esgFields) as EsgDataRequestFieldId[]).filter((k) => esgFields[k]);
                  if (!requestedFields.length) {
                    pushToast("Select at least one data field for the Scope 3 request.", "warning");
                    return;
                  }
                  onCreateEsgRequest?.({
                    supplierId: effectiveSupplier.id,
                    supplierName: effectiveSupplier.name,
                    requestedFields,
                    requesterNote: esgRequestNote.trim() || undefined,
                    status: "Sent",
                    dueBy: "2026-03-31",
                  });
                  pushToast("Request queued for supplier portal — Pending ESG Requests.", "success");
                  setEsgRequestNote("");
                  setEsgModalOpen(false);
                }}
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {effectiveBuyer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 p-4" role="dialog" aria-modal>
          <div className="flex h-full w-full max-w-lg flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--info)]">Buyer / channel</div>
                <div className="text-base font-semibold text-[var(--foreground)]">{effectiveBuyer.name}</div>
                <div className="text-xs text-[var(--foreground-muted)]">{effectiveBuyer.segment}</div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--muted)]"
                aria-label="Close"
                onClick={() => {
                  setBuyerDetail(null);
                  onClearInitialBuyer();
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-b border-[var(--border)] px-4 pt-2">
              <div className="flex gap-1 rounded-lg bg-[var(--muted)]/50 p-1 text-xs">
                {(
                  [
                    ["overview", "Overview"],
                    ["timeline", "Timeline"],
                    ["signals", "Signals"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`flex-1 rounded-md px-2 py-1.5 font-medium ${
                      buyerTab === id ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-muted)]"
                    }`}
                    onClick={() => setBuyerTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
              {buyerTab === "overview" ? (
                <>
                  <dl className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Attributed sales</dt>
                      <dd className="font-medium tabular-nums">₹ {effectiveBuyer.annualSalesCr.toFixed(1)} Cr</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Downstream Scope 3</dt>
                      <dd className="font-medium tabular-nums">
                        {Math.round(effectiveBuyer.downstreamScope3TCO2e).toLocaleString("en-IN")} tCO₂e
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Disclosure cooperation</dt>
                      <dd className="font-medium">{effectiveBuyer.disclosureCooperationScore}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--foreground-muted)]">Data quality</dt>
                      <dd className="font-medium">{effectiveBuyer.dataQuality}</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                      Category footprint (downstream)
                    </div>
                    <ul className="mt-2 space-y-1">
                      {effectiveBuyer.primaryCategories.map((cid) => {
                        const c = data.scope3Categories.find((x) => x.id === cid);
                        return (
                          <li key={cid}>
                            <button
                              type="button"
                              className="text-left text-sm text-[var(--primary)] hover:underline"
                              onClick={() => {
                                onSelectCategory(cid);
                                setBuyerDetail(null);
                                onClearInitialBuyer();
                              }}
                            >
                              Cat {cid}: {c?.name ?? "—"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Data gaps</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground)]">
                      {effectiveBuyer.dataGaps.length ? (
                        effectiveBuyer.dataGaps.map((g) => <li key={g}>{g}</li>)
                      ) : (
                        <li className="text-[var(--foreground-muted)]">No material gaps flagged.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Recommended actions</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {effectiveBuyer.recommendedActions.length ? (
                        effectiveBuyer.recommendedActions.map((g) => <li key={g}>{g}</li>)
                      ) : (
                        <li className="text-[var(--foreground-muted)]">None.</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : buyerTab === "timeline" ? (
                <ol className="space-y-3 text-sm text-[var(--foreground-muted)]">
                  <li className="border-l-2 border-[var(--primary)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Last review</div>
                    <div>{effectiveBuyer.lastReviewed} — value-chain survey + logistics sample check.</div>
                  </li>
                  <li className="border-l-2 border-[var(--border)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Collaboration</div>
                    <div>
                      Status {effectiveBuyer.collaborationStatus}; BRSR value-chain mapping{" "}
                      {effectiveBuyer.valueChainMapped ? "linked" : "pending"}.
                    </div>
                  </li>
                  <li className="border-l-2 border-[var(--border)] pl-3">
                    <div className="text-xs font-semibold text-[var(--foreground)]">Next gate</div>
                    <div>Refresh TMS / sell-through samples for FY26 inventory close.</div>
                  </li>
                </ol>
              ) : (
                <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
                  {data.aiInsights
                    .filter(
                      (i) => i.linkedCategoryId != null && effectiveBuyer.primaryCategories.includes(i.linkedCategoryId),
                    )
                    .map((i) => (
                      <li key={i.id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2">
                        <span className="text-xs font-semibold text-[var(--foreground)]">{i.severity}</span>
                        <div className="mt-0.5 text-[var(--foreground)]">{i.title}</div>
                        <div className="mt-1 text-xs">{i.detail}</div>
                      </li>
                    ))}
                  {data.aiInsights.filter(
                    (i) => i.linkedCategoryId != null && effectiveBuyer.primaryCategories.includes(i.linkedCategoryId),
                  ).length === 0 ? (
                    <li className="text-[var(--foreground-muted)]">No linked AI signals for these categories.</li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <Scope3DrilldownDrawer
        open={rfqDrill != null}
        onClose={() => setRfqDrill(null)}
        title={rfqDrill ? `RFQ response — ${rfqDrill.vendorName}` : ""}
        subtitle={data.rfq.title}
      >
        {rfqDrill ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--foreground-muted)]">Scope 3 score</dt>
                <dd className="font-semibold tabular-nums">{rfqDrill.scope3Score}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--foreground-muted)]">Verified %</dt>
                <dd className="tabular-nums">{rfqDrill.verifiedPct}%</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--foreground-muted)]">Data quality</dt>
                <dd>{rfqDrill.dataQuality}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--foreground-muted)]">Evidence pack</dt>
                <dd>{rfqDrill.evidencePackReady ? "Yes" : "No"}</dd>
              </div>
            </dl>
            <p className="text-sm text-[var(--foreground-muted)]">{rfqDrill.notes}</p>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Normalisation</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground-muted)]">
                <li>Spend and mass proxies aligned to FY inventory boundary</li>
                <li>Outliers winsorised at 95th percentile within commodity cohort</li>
              </ul>
            </div>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function FilterSelect({
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
  const uid = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={uid} className="text-xs font-medium leading-tight text-[var(--foreground-muted)]">
        {label}
      </label>
      <select
        id={uid}
        className={`w-full min-w-0 ${scope3SelectClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function RiskDot({ risk }: { risk: SupplierRow["risk"] }) {
  const color =
    risk === "High" ? "var(--danger)" : risk === "Medium" ? "var(--warning)" : "var(--success)";
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {risk}
    </span>
  );
}
