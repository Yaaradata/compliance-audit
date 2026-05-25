"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Database,
  FileStack,
  Filter,
  Gavel,
  History,
  Link2,
  Package,
  Scale,
  Shield,
} from "lucide-react";
import type {
  EvidenceIntakeChannel,
  EvidenceReviewState,
  PersonaId,
  Scope3MockData,
  SubmittedEvidenceRecord,
} from "./types";
import { isReadOnlyAuditor } from "./personaAccess";
import { useScope3Toast } from "./scope3-feedback";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, scope3InputClass, scope3SelectClass } from "./scope3-ui";

const CHANNELS: Array<EvidenceIntakeChannel | "All"> = [
  "All",
  "Supplier portal",
  "Secure SFTP / data room",
  "Email + checksum registry",
  "Internal — ESG / Finance",
  "Assurance PBC bundle",
];

const REVIEW: Array<EvidenceReviewState | "All"> = [
  "All",
  "Indexed — accepted",
  "Under review",
  "Clarification requested",
  "Superseded by resubmission",
];

export function SubmittedEvidencesView({
  data,
  persona,
  onOpenSupplier,
  onOpenCategory,
  onOpenGovernance,
}: {
  data: Scope3MockData;
  persona: PersonaId;
  onOpenSupplier: (supplierId: string) => void;
  onOpenCategory: (categoryId: number) => void;
  onOpenGovernance: () => void;
}) {
  const { pushToast } = useScope3Toast();
  const readOnly = isReadOnlyAuditor(persona);
  const [q, setQ] = useState("");
  const [supplierId, setSupplierId] = useState<string>("All");
  const [categoryId, setCategoryId] = useState<string>("All");
  const [controlId, setControlId] = useState<string>("All");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("All");
  const [review, setReview] = useState<(typeof REVIEW)[number]>("All");
  const [selected, setSelected] = useState<SubmittedEvidenceRecord | null>(null);

  const controlIds = useMemo(() => {
    const s = new Set<string>();
    data.controls.forEach((c) => s.add(c.controlId));
    return ["All", ...Array.from(s).sort()];
  }, [data.controls]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.submittedEvidences.filter((ev) => {
      if (supplierId !== "All") {
        if (supplierId === "__internal__") {
          if (ev.supplierId) return false;
        } else if (ev.supplierId !== supplierId) {
          return false;
        }
      }
      if (categoryId !== "All") {
        const cid = Number(categoryId);
        if (!ev.scope3CategoryIds.includes(cid)) return false;
      }
      if (controlId !== "All" && !ev.linkedControlIds.includes(controlId)) return false;
      if (channel !== "All" && ev.channel !== channel) return false;
      if (review !== "All" && ev.reviewState !== review) return false;
      if (needle) {
        const d = ev.drilldown;
        const drillHay = d
          ? `${d.inventoryObjectLockId} ${d.calculationEngineJobPath} ${d.activityLineRefs.map((x) => x.inventoryJobId).join(" ")} ${d.regulatoryCrosswalk.map((x) => x.instrument).join(" ")}`
          : "";
        const hay =
          `${ev.id} ${ev.title} ${ev.submitterOrg} ${ev.assertionSummary} ${ev.linkedControlIds.join(" ")} ${drillHay}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data.submittedEvidences, supplierId, categoryId, controlId, channel, review, q]);

  const stats = useMemo(() => {
    const all = data.submittedEvidences;
    return {
      total: all.length,
      accepted: all.filter((e) => e.reviewState === "Indexed — accepted").length,
      open: all.filter((e) => e.reviewState === "Under review").length,
      clarify: all.filter((e) => e.reviewState === "Clarification requested").length,
    };
  }, [data.submittedEvidences]);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-muted)] text-[var(--primary)]">
            <FileStack className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">How this fits the Scope 3 inventory cycle</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">
              Each row is a <span className="font-medium text-[var(--foreground)]">governed evidence package</span> your organisation (or a supplier) put forward to
              support activity data, factors, or disclosures. Packages are indexed with integrity hashes, linked to{" "}
              <span className="font-medium text-[var(--foreground)]">GHG Protocol categories</span> and{" "}
              <span className="font-medium text-[var(--foreground)]">internal control IDs</span>, then consumed in calculation runs and assurance — the same path
              described under <span className="font-medium text-[var(--foreground)]">Risk &amp; Compliance → lineage</span>.
            </p>
          </div>
        </div>
        <ol className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4 sm:grid-cols-5">
          {data.lineage.map((step) => (
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
        cols="sm:grid-cols-2 lg:grid-cols-4"
        items={[
          { label: "Packages indexed", value: String(stats.total), sub: "FY25 register slice", tone: "teal" },
          { label: "Accepted", value: String(stats.accepted), sub: "Ready for citation in inventory", tone: "emerald" },
          { label: "Under review", value: String(stats.open), sub: "QA / category owner", tone: "amber" },
          { label: "Clarifications", value: String(stats.clarify), sub: "Supplier or internal follow-up", tone: "violet" },
        ]}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] sm:p-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-3">
          <Filter className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Evidence register filters</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="ev-q" className="text-xs font-medium text-[var(--foreground-muted)]">
              Search
            </label>
            <input
              id="ev-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, ID, submitter, control…"
              className={`mt-1 w-full ${scope3InputClass}`}
            />
          </div>
          <div>
            <label htmlFor="ev-supplier" className="text-xs font-medium text-[var(--foreground-muted)]">
              Submitter / supplier
            </label>
            <select
              id="ev-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className={`mt-1 w-full ${scope3SelectClass}`}
            >
              <option value="All">All</option>
              <option value="__internal__">Internal (SunPharma)</option>
              {data.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ev-cat" className="text-xs font-medium text-[var(--foreground-muted)]">
              GHG category
            </label>
            <select
              id="ev-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`mt-1 w-full ${scope3SelectClass}`}
            >
              <option value="All">All</option>
              {data.scope3Categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  Cat {c.id} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ev-ctl" className="text-xs font-medium text-[var(--foreground-muted)]">
              Linked control
            </label>
            <select
              id="ev-ctl"
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              className={`mt-1 w-full ${scope3SelectClass}`}
            >
              {controlIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ev-ch" className="text-xs font-medium text-[var(--foreground-muted)]">
              Intake channel
            </label>
            <select
              id="ev-ch"
              value={channel}
              onChange={(e) => setChannel(e.target.value as (typeof CHANNELS)[number])}
              className={`mt-1 w-full ${scope3SelectClass}`}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ev-rev" className="text-xs font-medium text-[var(--foreground-muted)]">
              Review state
            </label>
            <select
              id="ev-rev"
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

        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <table className="min-w-[1080px] w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--muted)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2.5">Evidence ID</th>
                <th className="px-3 py-2.5">Package title</th>
                <th className="px-3 py-2.5">Submitter</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Categories</th>
                <th className="px-3 py-2.5">Controls</th>
                <th className="px-3 py-2.5">Tier intent</th>
                <th className="px-3 py-2.5">State</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-[var(--foreground-muted)]">
                    No evidence packages match the filters.
                  </td>
                </tr>
              ) : (
                rows.map((ev, idx) => (
                  <tr
                    key={ev.id}
                    className={`cursor-pointer border-t border-[var(--border)] transition-colors hover:bg-[var(--primary-muted)]/20 ${
                      idx % 2 === 1 ? "bg-[var(--muted)]/10" : ""
                    }`}
                    onClick={() => setSelected(ev)}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-[var(--foreground)]">{ev.id}</td>
                    <td className="max-w-[280px] px-3 py-2.5 font-medium text-[var(--foreground)]">{ev.title}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--foreground-muted)]">{ev.submitterOrg}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[var(--foreground-muted)]">
                      {ev.submittedAt.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--foreground-muted)]">
                      {ev.scope3CategoryIds.map((id) => `Cat ${id}`).join(", ")}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[var(--foreground-muted)]">{ev.linkedControlIds.join(", ")}</td>
                    <td className="px-3 py-2.5 text-xs">{ev.intendedDataQualityTier}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-[var(--foreground)]">{ev.reviewState}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-medium text-[var(--primary)]">Details</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">
          Showing {rows.length} of {data.submittedEvidences.length} packages · Integrity hashes are abbreviated (first 12 hex) for cross-check with the calculation job
          manifest and assurance PBC index.
        </p>
      </div>

      <Scope3DrilldownDrawer
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.reportingPeriodLabel}` : undefined}
        size="lg"
      >
        {selected ? (
          <EvidenceDetailBody
            ev={selected}
            data={data}
            readOnly={readOnly}
            onCopyHash={(prefix) => {
              void navigator.clipboard.writeText(prefix).then(
                () => pushToast(`SHA-256 prefix copied: ${prefix}…`, "success"),
                () => pushToast(`Prefix: ${prefix}`, "warning"),
              );
            }}
            onOpenSupplier={onOpenSupplier}
            onOpenCategory={onOpenCategory}
            onOpenGovernance={onOpenGovernance}
          />
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function EvidenceDetailBody({
  ev,
  data,
  readOnly,
  onCopyHash,
  onOpenSupplier,
  onOpenCategory,
  onOpenGovernance,
}: {
  ev: SubmittedEvidenceRecord;
  data: Scope3MockData;
  readOnly: boolean;
  onCopyHash: (prefix: string) => void;
  onOpenSupplier: (supplierId: string) => void;
  onOpenCategory: (categoryId: number) => void;
  onOpenGovernance: () => void;
}) {
  const supplier = ev.supplierId ? data.suppliers.find((s) => s.id === ev.supplierId) : null;
  const lineage = ev.lineageStep != null ? data.lineage.find((l) => l.step === ev.lineageStep) : null;
  const esg = ev.linkedEsgRequestId ? data.pendingEsgRequests.find((r) => r.id === ev.linkedEsgRequestId) : null;
  const d = ev.drilldown;

  const consignments =
    d?.relatedExportConsignmentIds?.map((id) => data.exportConsignmentQueue.find((c) => c.id === id)).filter(Boolean) ?? [];
  const aiRefs = d?.linkedAiInsightIds?.map((id) => data.aiInsights.find((i) => i.id === id)).filter(Boolean) ?? [];
  const alertRefs =
    d?.relatedComplianceAlertIds?.map((id) => data.complianceAlerts.find((a) => a.id === id)).filter(Boolean) ?? [];

  return (
    <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
      <div className="flex flex-wrap gap-2">
        {ev.supplierId ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
            onClick={() => onOpenSupplier(ev.supplierId!)}
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            Supplier scorecard
          </button>
        ) : null}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
          onClick={() => onOpenGovernance()}
        >
          <Shield className="h-3.5 w-3.5" aria-hidden />
          Risk &amp; Compliance
        </button>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
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
        {ev.submitterRole ? (
          <div>
            <dt className="text-xs font-medium text-[var(--foreground-muted)]">Submitter role</dt>
            <dd className="mt-0.5 text-[var(--foreground)]">{ev.submitterRole}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium text-[var(--foreground-muted)]">Reviewer</dt>
          <dd className="mt-0.5 text-[var(--foreground)]">{ev.reviewer ?? "—"}</dd>
        </div>
      </dl>

      {supplier ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-xs leading-relaxed">
          <span className="font-semibold text-[var(--foreground)]">Supplier context: </span>
          {supplier.segment} · Scope 3 required <span className="font-medium">{supplier.scope3Required}</span> · Procurement priority{" "}
          <span className="font-medium">{supplier.procurementPriority}</span> · Recorded data quality{" "}
          <span className="font-medium">{supplier.dataQuality}</span> · Submission <span className="font-medium">{supplier.submissionStatus}</span>
        </p>
      ) : null}

      {lineage ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--info-bg)]/20 px-3 py-2 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-[var(--info)]" aria-hidden />
            Lineage step {lineage.step}: {lineage.label}
          </div>
          <p className="mt-1">{lineage.detail}</p>
        </div>
      ) : null}

      {esg ? (
        <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-bg)]/25 px-3 py-2 text-xs leading-relaxed">
          <span className="font-semibold text-[var(--foreground)]">Linked ESG / Scope 3 data request: </span>
          {esg.id} ({esg.status}) · Due {esg.dueBy}. Requested fields: {esg.requestedFields.join(", ")}.
        </div>
      ) : null}

      {d ? (
        <details open className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/10 px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
              Technical traceability (inventory lock &amp; engine)
            </span>
          </summary>
          <dl className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">Evidence package version</dt>
              <dd className="mt-0.5 font-mono text-xs text-[var(--foreground)]">{d.evidencePackageVersion}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">Inventory object lock</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-[var(--foreground)]">{d.inventoryObjectLockId}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">GWP standard</dt>
              <dd className="mt-0.5 text-[var(--foreground)]">{d.gwpStandard}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">EF registry version</dt>
              <dd className="mt-0.5 font-mono text-xs text-[var(--foreground)]">{d.emissionFactorRegistryVersion}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">Calculation engine path</dt>
              <dd className="mt-0.5 break-all font-mono text-[11px] leading-snug text-[var(--foreground)]">{d.calculationEngineJobPath}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">Boundary &amp; period</dt>
              <dd className="mt-1 leading-relaxed text-[var(--foreground)]">{d.boundaryAndPeriodNote}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[var(--foreground-muted)]">Data-quality rationale (GHG Protocol hierarchy)</dt>
              <dd className="mt-1 leading-relaxed text-[var(--foreground)]">{d.dataQualityRationale}</dd>
            </div>
          </dl>
        </details>
      ) : null}

      {d?.supersedesEvidenceId || d?.supersededByEvidenceId ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--foreground)]">Version chain: </span>
          {d.supersedesEvidenceId ? <>Supersedes {d.supersedesEvidenceId}. </> : null}
          {d.supersededByEvidenceId ? <>Superseded by {d.supersededByEvidenceId}.</> : null}
        </div>
      ) : null}

      <div>
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
          Assertion (what was presented)
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

      {d?.samplingPlan ? (
        <details open className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            Assurance sampling &amp; materiality
          </summary>
          <dl className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
            <div>
              <dt className="font-medium text-[var(--foreground-muted)]">Population</dt>
              <dd className="mt-0.5 text-[var(--foreground)]">{d.samplingPlan.populationDescription}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--foreground-muted)]">Sample rule</dt>
              <dd className="mt-0.5 text-[var(--foreground)]">{d.samplingPlan.sampleSizeRule}</dd>
            </div>
            {d.samplingPlan.materialityNote ? (
              <div>
                <dt className="font-medium text-[var(--foreground-muted)]">Materiality note</dt>
                <dd className="mt-0.5 text-[var(--foreground)]">{d.samplingPlan.materialityNote}</dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}

      {d && d.activityLineRefs.length > 0 ? (
        <details open className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
              Inventory activity lines supported
            </span>
          </summary>
          <div className="mt-3 overflow-x-auto border-t border-[var(--border)] pt-3">
            <table className="w-full min-w-[520px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--foreground-muted)]">
                  <th className="py-2 pr-2 font-medium">Activity class</th>
                  <th className="py-2 pr-2 font-medium">Job ID</th>
                  <th className="py-2 pr-2 font-medium">GWP</th>
                  <th className="py-2 pr-2 font-medium">EF version</th>
                  <th className="py-2 text-right font-medium">Approx. tCO₂e</th>
                </tr>
              </thead>
              <tbody>
                {d.activityLineRefs.map((row) => (
                  <tr key={row.inventoryJobId} className="border-b border-[var(--border)]/70">
                    <td className="py-2 pr-2 font-mono text-[10px] text-[var(--foreground)]">{row.activityClass}</td>
                    <td className="py-2 pr-2 font-mono text-[10px] text-[var(--foreground-muted)]">{row.inventoryJobId}</td>
                    <td className="py-2 pr-2 text-[var(--foreground-muted)]">{row.gwpSet}</td>
                    <td className="py-2 pr-2 font-mono text-[10px] text-[var(--foreground-muted)]">{row.emissionFactorRegistryVersion}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--foreground)]">
                      {row.coveredTCO2eApprox != null ? `${Math.round(row.coveredTCO2eApprox).toLocaleString("en-IN")}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      {d && d.regulatoryCrosswalk.length > 0 ? (
        <details open className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <Gavel className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
              Regulatory &amp; disclosure cross-walk
            </span>
          </summary>
          <ul className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
            {d.regulatoryCrosswalk.map((rw, rwIdx) => (
              <li key={`${rw.instrument}-${rwIdx}`} className="rounded-md border border-[var(--border)] bg-[var(--muted)]/15 px-2.5 py-2">
                <div className="font-medium text-[var(--foreground)]">{rw.instrument}</div>
                <div className="mt-0.5 text-[var(--foreground-muted)]">{rw.clauseOrSection}</div>
                <p className="mt-1 leading-relaxed text-[var(--foreground)]">{rw.relevance}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {(consignments.length > 0 || aiRefs.length > 0 || alertRefs.length > 0) ? (
        <details open className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            Linked operational objects (exports, AI signals, compliance)
          </summary>
          <div className="mt-3 space-y-3 border-t border-[var(--border)] pt-3 text-xs">
            {consignments.length > 0 ? (
              <div>
                <div className="font-medium text-[var(--foreground-muted)]">Export consignment queue</div>
                <ul className="mt-1 space-y-1.5">
                  {consignments.map((c) =>
                    c ? (
                      <li key={c.id} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
                        <span className="font-mono font-semibold text-[var(--foreground)]">{c.batchRef}</span> · {c.product} · {c.status}
                        <span className="block text-[var(--foreground-muted)]">CN {c.cnCode} → {c.destination} · Due {c.due}</span>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ) : null}
            {aiRefs.length > 0 ? (
              <div>
                <div className="font-medium text-[var(--foreground-muted)]">AI insights</div>
                <ul className="mt-1 space-y-1">
                  {aiRefs.map((i) =>
                    i ? (
                      <li key={i.id} className="text-[var(--foreground)]">
                        <span className="font-semibold">{i.severity}</span> — {i.title}
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ) : null}
            {alertRefs.length > 0 ? (
              <div>
                <div className="font-medium text-[var(--foreground-muted)]">Compliance alerts</div>
                <ul className="mt-1 space-y-1">
                  {alertRefs.map((a) =>
                    a ? (
                      <li key={a.id} className="text-[var(--foreground)]">
                        <span className="font-semibold uppercase">{a.severity}</span> — {a.title}
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      {d?.clarificationsRaised && d.clarificationsRaised.length > 0 ? (
        <div className="rounded-lg border border-[var(--warning)]/35 bg-[var(--warning-bg)]/20 px-3 py-2 text-xs">
          <div className="font-semibold text-[var(--foreground)]">Clarifications raised</div>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-[var(--foreground)]">
            {d.clarificationsRaised.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {d?.attestations && d.attestations.length > 0 ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Sign-offs &amp; attestations</h3>
          <ul className="mt-2 space-y-2">
            {d.attestations.map((at) => (
              <li key={at.signerName + at.signedAt} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/15 px-3 py-2 text-xs">
                <div className="font-medium text-[var(--foreground)]">
                  {at.signerName} · {at.signerTitle}
                </div>
                <div className="text-[var(--foreground-muted)]">Signed {at.signedAt}</div>
                <p className="mt-1 leading-relaxed text-[var(--foreground)]">{at.scopeStatement}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {d?.technicalContact ? (
        <div className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--foreground)]">Technical contact (submitter): </span>
          {d.technicalContact.name} · {d.technicalContact.email}
          {d.technicalContact.phone ? ` · ${d.technicalContact.phone}` : ""}
        </div>
      ) : null}

      {d && d.versionHistory.length > 0 ? (
        <details className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="cursor-pointer list-none py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
              Index &amp; version history
            </span>
          </summary>
          <ol className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
            {d.versionHistory.map((v, idx) => (
              <li key={`${v.at}-${idx}`} className="border-l-2 border-[var(--primary)]/40 pl-3">
                <div className="font-mono text-[10px] text-[var(--foreground-muted)]">{v.at}</div>
                <div className="font-medium text-[var(--foreground)]">{v.actor}</div>
                <div>{v.event}</div>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      {d ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <FileStack className="h-3.5 w-3.5" aria-hidden />
            Legal retention &amp; storage
          </div>
          <p className="mt-1">
            Minimum <span className="font-medium">{d.legalRetention.minRetentionYears} years</span> · Tier{" "}
            <span className="font-mono text-[11px]">{d.legalRetention.storageTier}</span>
          </p>
          <p className="mt-1 text-[var(--foreground-muted)]">{d.legalRetention.jurisdictionNote}</p>
        </div>
      ) : null}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Disclosure / workbook use</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--foreground)]">
          {ev.disclosureUse.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">GHG categories</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ev.scope3CategoryIds.map((cid) => {
            const cat = data.scope3Categories.find((c) => c.id === cid);
            return (
              <li key={cid}>
                <button
                  type="button"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
                  onClick={() => onOpenCategory(cid)}
                >
                  Cat {cid}: {cat?.name ?? "—"}
                  <ArrowRight className="ml-1 inline h-3 w-3 align-middle" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Linked controls</h3>
        <ul className="mt-2 space-y-2">
          {ev.linkedControlIds.map((cid) => {
            const ctl = data.controls.find((c) => c.controlId === cid);
            return (
              <li key={cid} className="rounded-md border border-[var(--border)] bg-[var(--muted)]/15 px-3 py-2 text-xs">
                <span className="font-mono font-semibold text-[var(--foreground)]">{cid}</span>
                {ctl ? (
                  <span className="mt-1 block leading-relaxed text-[var(--foreground-muted)]">
                    {ctl.description} · Owner {ctl.owner} · Last tested {ctl.lastTested} ({ctl.status})
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Artifacts &amp; integrity</h3>
        <ul className="mt-2 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
          {ev.artifacts.map((a) => (
            <li key={a.fileName} className="px-3 py-2.5 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[var(--foreground)]">{a.fileName}</div>
                  <div className="text-[var(--foreground-muted)]">
                    {a.format} · {a.sizeLabel}
                    {a.virusScan ? ` · Scan: ${a.virusScan}` : null}
                  </div>
                  {a.contentSummary ? <p className="mt-1 leading-relaxed text-[var(--foreground)]">{a.contentSummary}</p> : null}
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded border border-[var(--border)] px-2 py-1 font-mono text-[10px] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  title="Copy SHA-256 prefix"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyHash(a.sha256Prefix);
                  }}
                >
                  sha256:{a.sha256Prefix}…
                </button>
              </div>
            </li>
          ))}
        </ul>
        {readOnly ? <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">Auditor view: evidence index is read-only.</p> : null}
      </div>
    </div>
  );
}
