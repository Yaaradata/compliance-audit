"use client";

/**
 * Defensibility lens — CRO board face. Numbers first (scoreboard), then map,
 * then producibility, then feed. Methodology lives on the marker hover.
 */
import {
  getDefensibility,
  getPackIntegrity,
  type DefensibilityResult,
  type DefensibilityState,
  type FeedState,
} from "@/lib/ukbankingaudit/v6/defensibilityData";
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

/** One clause + state. Counts live on the scoreboard. */
function buildVerdict(d: DefensibilityResult): string {
  const state = stateLabel(d.state);
  if (d.obligationGaps > 0) {
    return (
      `DEFENSIBILITY · ${d.obligationGaps} of ${d.totalObligations} obligations ` +
      `have no mapped control · ${state}`
    );
  }
  if (d.missingManifest.length > 0) {
    return (
      `DEFENSIBILITY · ${d.missingManifest.length} artefacts not producible · ${state}`
    );
  }
  if (d.feedState === "UNATTRIBUTED") {
    return `DEFENSIBILITY · data feed has no named source system · ${state}`;
  }
  if (d.feedState === "STALE") {
    return `DEFENSIBILITY · data feed is outside expected cadence · ${state}`;
  }
  return `DEFENSIBILITY · all three checks clean · ${state}`;
}

function unmappedTone(n: number): string {
  if (n > 2) return "text-rose-700";
  if (n >= 1) return "text-amber-700";
  return "text-slate-700";
}

function ObligationScoreboard({ d }: { d: DefensibilityResult }) {
  const cells: { value: number; label: string; valueClass: string }[] = [
    { value: d.totalObligations, label: "Obligations", valueClass: "text-slate-900" },
    { value: d.controlsInScope, label: "Controls", valueClass: "text-slate-900" },
    { value: d.mappedToControl, label: "Mapped", valueClass: "text-slate-900" },
    {
      value: d.obligationGaps,
      label: "Unmapped",
      valueClass: unmappedTone(d.obligationGaps),
    },
  ];
  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[10px] border border-slate-200 bg-slate-200">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-white px-2 py-3 text-center">
          <div className={`text-[22px] font-bold tabular-nums leading-none ${cell.valueClass}`}>
            {cell.value}
          </div>
          <div className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DefensibilityLens({ domain }: Props) {
  const d = getDefensibility(domain.id);
  const pack = getPackIntegrity();
  const verdict = buildVerdict(d);

  const notProduced = d.missingManifest.filter((m) => classifyManifestItem(m) === "not-produced");
  const notRetrievable = d.missingManifest.filter(
    (m) => classifyManifestItem(m) === "not-retrievable",
  );

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

      <ObligationScoreboard d={d} />

      <section>
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Obligation → control map
        </h3>
        <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3.5">
          {d.obligationGaps > 0 ? (
            <>
              <p className="text-[13px] font-semibold text-slate-800">
                {d.mappedToControl} of {d.totalObligations} obligations map to at least one of{" "}
                {d.controlsInScope} controls.
              </p>
              <p className="mt-2 text-[12px] font-medium text-slate-700">
                {d.obligationGaps} obligation{d.obligationGaps === 1 ? "" : "s"} have no control
                mapped:
              </p>
              <ul className="mt-2 space-y-1.5">
                {d.unmappedRefs.map((ref) => (
                  <li key={ref} className="flex gap-2 text-[12px] leading-snug text-slate-700">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-500" aria-hidden />
                    <span className="font-mono text-[11px]">{ref}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[13px] font-semibold text-slate-800">
              All {d.totalObligations} obligations map to a control.
            </p>
          )}
        </div>
      </section>

      <section>
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

      <section>
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
