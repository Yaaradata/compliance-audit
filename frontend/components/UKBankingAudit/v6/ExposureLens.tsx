"use client";

import { getDomainExposure } from "@/lib/ukbankingaudit/v6/exposureData";
import type { ExposureCount } from "@/lib/ukbankingaudit/v6/exposureTypes";
import { ClaimLine } from "./ClaimLine";
import { PathToGreenStrip } from "./PathToGreenStrip";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
};

const BAND_COLOR: Record<string, string> = {
  high: "bg-rose-400",
  medium: "bg-amber-300",
  low: "bg-emerald-300",
};

const BAND_LABEL: Record<string, string> = {
  high: "High risk",
  medium: "Medium risk",
  low: "Low risk",
};

function claimRef(domainId: string, suffix: string) {
  return `EXP-${domainId.toUpperCase()}-${suffix}`;
}

/** Thin under-bar for a stat tile with an appetite tick (only when appetite is set). */
function AppetiteBar({ value, appetite }: { value: number; appetite: number }) {
  const scale = Math.max(value, appetite) * 1.3;
  const fillPct = Math.min(100, (value / scale) * 100);
  const tickPct = Math.min(100, (appetite / scale) * 100);
  return (
    <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={value > appetite ? "h-full rounded-full bg-rose-400" : "h-full rounded-full bg-slate-400"}
        style={{ width: `${fillPct}%` }}
      />
      <div className="absolute top-0 bottom-0 w-px bg-slate-900" style={{ left: `${tickPct}%` }} />
    </div>
  );
}

function StatusChip({ status }: { status: ExposureCount["status"] }) {
  if (status === "INFO") {
    return <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Informational</span>;
  }
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wider ${
        status === "OVER" ? "text-rose-600" : "text-emerald-600"
      }`}
    >
      {status}
    </span>
  );
}

function CountTile({ domainId, count }: { domainId: string; count: ExposureCount }) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-3.5">
      <div className="text-2xl font-bold tabular-nums text-slate-900">
        {count.value}
        {count.unit === "%" ? "%" : ""}
      </div>
      <div className="mt-0.5 text-[11px] font-medium leading-snug text-slate-600">{count.label}</div>
      {count.unit !== "%" ? (
        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{count.unit}</div>
      ) : null}

      {count.appetite != null ? (
        <>
          <AppetiteBar value={count.value} appetite={count.appetite} />
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[9px] text-slate-400">appetite {count.appetite}</span>
            <StatusChip status={count.status} />
          </div>
        </>
      ) : (
        <div className="mt-2">
          <StatusChip status={count.status} />
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 pt-1.5">
        <ClaimLine
          layout="stack"
          derivation="RULE"
          evidenceRef={claimRef(domainId, count.id.toUpperCase())}
        >
          <span className="block text-[10px] leading-snug text-slate-500">{count.sourceLabel}</span>
        </ClaimLine>
      </div>
    </div>
  );
}

/** Honest empty state, shared by the full lens and the standalone Block 1 card. */
function NotConnected({ domain }: Props) {
  return (
    <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-xs font-semibold text-slate-600">
        Client-level exposure data not connected for {domain.name}.
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        This lens is live for Fraud &amp; Financial Crime in this build.
      </p>
    </div>
  );
}

/**
 * BLOCK 1 — Concentration vs Appetite (the verdict card), standalone so it can
 * sit beside the ERM AppetiteFrameworkPanel without pulling in Blocks 2/3.
 */
export function ExposureConcentrationCard({ domain }: Props) {
  const exposure = getDomainExposure(domain.id);

  if (!exposure || !exposure.dataAvailable) {
    return <NotConnected domain={domain} />;
  }

  const { distribution } = exposure;
  const highBand = distribution.bands.find((b) => b.band === "high");

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
      <ClaimLine layout="stack" derivation="RULE" evidenceRef={claimRef(domain.id, "DIST-HIGH")}>
        <span className={`text-[13px] font-bold ${distribution.status === "OVER" ? "text-rose-700" : "text-emerald-700"}`}>
          EXPOSURE · High-risk clients {highBand?.pctOfBook ?? 0}% vs {distribution.appetitePctHigh}% appetite ·{" "}
          {distribution.status}
        </span>
      </ClaimLine>

      <div className="relative mt-3 flex h-6 w-full overflow-hidden rounded-md">
        {distribution.bands.map((b) => (
          <div
            key={b.band}
            className={BAND_COLOR[b.band] ?? "bg-slate-300"}
            style={{ width: `${b.pctOfBook}%` }}
            title={`${BAND_LABEL[b.band] ?? b.band} — ${b.pctOfBook}%`}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-px bg-slate-900"
          style={{ left: `${distribution.appetitePctHigh}%` }}
          title={`Appetite line — ${distribution.appetitePctHigh}%`}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        {distribution.bands.map((b) => (
          <span key={b.band} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className={`inline-block h-2 w-2 shrink-0 rounded-sm ${BAND_COLOR[b.band] ?? "bg-slate-300"}`} />
            {BAND_LABEL[b.band] ?? b.band}: {b.pctOfBook}% · {b.clientCount} clients
          </span>
        ))}
      </div>

      {distribution.status === "OVER" ? (
        <PathToGreenStrip entityRef={`exposure:${domain.id}`} />
      ) : null}
    </div>
  );
}

export function ExposureLens({ domain }: Props) {
  const exposure = getDomainExposure(domain.id);

  if (!exposure || !exposure.dataAvailable) {
    return (
      <div className="p-[18px]">
        <NotConnected domain={domain} />
      </div>
    );
  }

  const { counts, exitCandidates } = exposure;

  return (
    <div className="space-y-5 p-[18px]">
      {/* BLOCK 1 — Concentration vs Appetite (the verdict card) */}
      <ExposureConcentrationCard domain={domain} />

      {/* BLOCK 2 — The four counts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((count) => (
          <CountTile key={count.id} domainId={domain.id} count={count} />
        ))}
      </div>

      {/* BLOCK 3 — Exit candidates (the drill) */}
      <div className="overflow-x-auto rounded-[10px] border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-600">Exit Candidate Clusters</h3>
        <p className="mt-0.5 text-[10.5px] text-slate-500">
          Ranked by contribution to appetite breach. The firm decides any action.
        </p>

        <table className="mt-3 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th scope="col" className="w-[30%] pb-2 pr-6 font-semibold">
                Cluster
              </th>
              <th scope="col" className="whitespace-nowrap pb-2 pr-5 text-right font-semibold">
                High-risk wt.
              </th>
              <th scope="col" className="whitespace-nowrap pb-2 pr-5 text-right font-semibold">
                Contribution
              </th>
              <th scope="col" className="whitespace-nowrap pb-2 pr-8 text-right font-semibold">
                Clients
              </th>
              <th scope="col" className="pb-2 pl-2 text-left font-semibold">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {exitCandidates.map((cluster) => {
              const ref = claimRef(domain.id, cluster.id.toUpperCase());
              return (
                <tr key={cluster.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-3 pr-6 align-middle">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700"
                        title="RULE · matched deterministically"
                        aria-label="RULE"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium leading-snug text-slate-900">
                          {cluster.label}
                        </div>
                        <div className="mt-0.5 font-mono text-[9.5px] text-slate-400" title={ref}>
                          {ref}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5 align-middle text-right text-[12px] tabular-nums text-slate-700">
                    {cluster.highRiskWeightPct}%
                  </td>
                  <td className="whitespace-nowrap py-3 pr-5 align-middle text-right text-[12px] font-semibold tabular-nums text-slate-900">
                    {cluster.contributionToBreachPct}%
                  </td>
                  <td className="whitespace-nowrap py-3 pr-8 align-middle text-right text-[12px] tabular-nums text-slate-700">
                    {cluster.clientCount}
                  </td>
                  <td className="py-3 pl-2 align-middle text-[12px] leading-snug text-slate-500">
                    {cluster.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
