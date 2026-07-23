"use client";

/**
 * Defensibility lens — CRO board face. Hero is what is not producible today.
 * Checks lead with the failing one. Methodology lives on the marker hover.
 */
import {
  getDefensibility,
  getPackIntegrity,
  type DefensibilityState,
  type FeedState,
} from "@/lib/ukbankingaudit/v6/defensibilityData";
import type { ReactNode } from "react";
import { ClaimLine } from "./ClaimLine";
import {
  defensibilityVerdictTone,
  DEFENSIBILITY_METHOD_HOVER,
  formatUkDate,
} from "./lensChrome";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
};

type ManifestFailure = "not-produced" | "not-retrievable";

type CheckKind = "map" | "manifest" | "feed";

function classifyManifestItem(item: string): ManifestFailure {
  const lower = item.toLowerCase();
  if (lower.includes("not produced")) return "not-produced";
  return "not-retrievable";
}

function stateLabel(state: DefensibilityState): string {
  switch (state) {
    case "INDEFENSIBLE":
      return "INDEFENSIBLE";
    case "AT_RISK":
      return ["AT", "RISK"].join(" ");
    case "DEFENSIBLE":
      return "DEFENSIBLE";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function feedLabel(feedState: FeedState): string {
  switch (feedState) {
    case "FRESH":
      return "FRESH";
    case "STALE":
      return "STALE";
    case "UNATTRIBUTED":
      return "UNATTRIBUTED";
    default: {
      const _exhaustive: never = feedState;
      return _exhaustive;
    }
  }
}

function checkSeverity(
  kind: CheckKind,
  d: ReturnType<typeof getDefensibility>,
): number {
  switch (kind) {
    case "manifest":
      return d.missingManifest.length > 0 ? 3 : 0;
    case "map":
      return d.unmappedRefs.length > 0 || d.obligationGaps > 0 ? 2 : 0;
    case "feed":
      return d.feedState === "FRESH" ? 0 : 1;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function DefensibilityLens({ domain }: Props) {
  const d = getDefensibility(domain.id);
  const pack = getPackIntegrity();

  const verdict =
    `DEFENSIBILITY · ${d.obligationGaps} obligations unmapped · ` +
    `feed ${feedLabel(d.feedState)} · ${stateLabel(d.state)}`;

  const notProduced = d.missingManifest.filter((m) => classifyManifestItem(m) === "not-produced");
  const notRetrievable = d.missingManifest.filter(
    (m) => classifyManifestItem(m) === "not-retrievable",
  );

  const checkOrder = (["manifest", "map", "feed"] as const)
    .map((kind) => ({ kind, severity: checkSeverity(kind, d) }))
    .sort((a, b) => b.severity - a.severity)
    .map((c) => c.kind);

  const sections: Record<CheckKind, ReactNode> = {
    map: (
      <section key="map">
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Obligation → control map
        </h3>
        <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3.5">
          <p className="text-[13px] font-semibold text-slate-800">
            {d.mappedToControl} of {d.totalObligations} obligations map to a control.
          </p>
          {d.unmappedRefs.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
              {d.unmappedRefs.map((ref) => (
                <li key={ref} className="flex gap-2 text-[12px] leading-snug text-slate-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-500" aria-hidden />
                  <span className="font-mono text-[11px]">{ref}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-slate-100 pt-3 text-[12px] text-emerald-700">
              No unmapped obligations — control map is complete for this domain.
            </p>
          )}
        </div>
      </section>
    ),
    manifest: (
      <section key="manifest">
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Requested and not producible
        </h3>
        <div
          className={`rounded-[10px] border px-4 py-3.5 ${
            d.missingManifest.length > 0
              ? "border-rose-300 bg-rose-50/40"
              : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Skilled person request · artefacts not producible today
          </p>
          {d.missingManifest.length === 0 ? (
            <p className="mt-3 text-[13px] font-semibold text-emerald-800">
              All required artefacts producible.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {notProduced.length > 0 ? (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
                    Not produced — never existed
                  </div>
                  <ul className="mt-1.5 space-y-2">
                    {notProduced.map((item) => (
                      <li
                        key={item}
                        className="border-l-[3px] border-rose-600 bg-rose-50/80 py-1.5 pl-3 text-[13px] font-semibold leading-snug text-rose-950"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {notRetrievable.length > 0 ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Recorded · no retrievable link
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {notRetrievable.map((item) => (
                      <li
                        key={item}
                        className="border-l border-amber-300 py-1 pl-2.5 text-[12px] font-normal leading-snug text-slate-600"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    ),
    feed: (
      <section key="feed">
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Feed integrity
        </h3>
        <div
          className={`rounded-[10px] border px-4 py-3.5 ${
            d.feedState === "FRESH"
              ? "border-slate-200 bg-white"
              : "border-amber-300 bg-amber-50/40"
          }`}
        >
          {d.sourceSystem === null ? (
            <p className="text-[13px] font-bold text-amber-900">
              UNATTRIBUTED — no named source system
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-slate-800">{d.sourceSystem}</p>
          )}
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Last refresh</dt>
              <dd className="font-medium text-slate-800">{formatUkDate(d.lastRefresh)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expected cadence</dt>
              <dd className="font-medium text-slate-800">{d.expectedCadenceDays} days</dd>
            </div>
            <div>
              <dt className="text-slate-500">Age</dt>
              <dd className="font-medium text-slate-800">{d.feedAgeDays} days</dd>
            </div>
            <div>
              <dt className="text-slate-500">Feed state</dt>
              <dd
                className={`font-bold uppercase tracking-wide ${
                  d.feedState === "FRESH" ? "text-emerald-700" : "text-amber-800"
                }`}
              >
                {feedLabel(d.feedState)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    ),
  };

  return (
    <div className="space-y-4 p-[18px]">
      <ClaimLine
        layout="stack"
        derivation="RULE"
        evidenceRef={`DEF-${domain.id.toUpperCase()}-VERDICT`}
        hideEvidenceRef
        markerTitle={DEFENSIBILITY_METHOD_HOVER}
      >
        <span className={`text-[13px] font-bold ${defensibilityVerdictTone(d.state)}`}>
          {verdict}
        </span>
      </ClaimLine>

      {checkOrder.map((kind) => sections[kind])}

      <p className="text-[10px] text-slate-500">
        Firm pack integrity: {pack.withinCadence} of {pack.total} domain feeds within
        cadence — readiness of the MI pack, not an assurance of review outcome.
      </p>

      <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        s.166 FSMA · SYSC 9 · MLR 2017 reg 40 · SYSC 6.1.1R
      </p>
    </div>
  );
}
