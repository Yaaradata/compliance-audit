"use client";

/**
 * Defensibility lens — evidential defensibility to a hostile third party
 * (skilled person / s.166), not Assurance-style evidence completeness.
 * The hero is the list of artefacts that are not producible today.
 */
import {
  DEFENSIBILITY_APPETITE,
  getDefensibility,
  getPackIntegrity,
  type DefensibilityState,
  type FeedState,
} from "@/lib/ukbankingaudit/v6/defensibilityData";
import { ClaimLine } from "./ClaimLine";
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

function verdictTone(state: DefensibilityState): string {
  switch (state) {
    case "INDEFENSIBLE":
      return "text-rose-700";
    case "AT_RISK":
      return "text-amber-700";
    case "DEFENSIBLE":
      return "text-emerald-700";
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

export function DefensibilityLens({ domain }: Props) {
  const d = getDefensibility(domain.id);
  const pack = getPackIntegrity();

  const verdict =
    `DEFENSIBILITY · ${d.obligationGaps} obligations unmapped · ` +
    `${d.retrievabilityPct}% of evidence retrievable · feed ${feedLabel(d.feedState)} · ` +
    stateLabel(d.state);

  const notProduced = d.missingManifest.filter((m) => classifyManifestItem(m) === "not-produced");
  const notRetrievable = d.missingManifest.filter(
    (m) => classifyManifestItem(m) === "not-retrievable",
  );

  return (
    <div className="space-y-5 p-[18px]">
      {/* Verdict-first */}
      <ClaimLine
        layout="stack"
        derivation="RULE"
        evidenceRef={`DEF-${domain.id.toUpperCase()}-VERDICT`}
      >
        <span className={`text-[13px] font-bold ${verdictTone(d.state)}`}>{verdict}</span>
      </ClaimLine>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Evidential defensibility to a skilled person review (s.166) — readiness of what
        you could produce today, not Assurance completeness.
      </p>

      {/* Block 1 — Is there a control at all? */}
      <section>
        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Obligation → control map
        </h3>
        <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3.5">
          <p className="text-[13px] font-semibold text-slate-800">
            {d.mappedToControl} of {d.totalObligations} obligations map to a control.
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Appetite: {DEFENSIBILITY_APPETITE.unmappedMaterialObligations} unmapped material
            obligations (SYSC 6.1.1R).
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

      {/* Block 2 — THE HERO: could you produce the evidence? */}
      <section>
        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
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
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    Not produced — never existed
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {notProduced.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 border-l-2 border-rose-400 pl-2.5 text-[12px] leading-snug text-slate-800"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {notRetrievable.length > 0 ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Recorded, no retrievable link — exists, cannot locate
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {notRetrievable.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 border-l-2 border-amber-400 pl-2.5 text-[12px] leading-snug text-slate-800"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
          <p className="mt-3 border-t border-slate-200/80 pt-2 text-[10px] text-slate-500">
            Retrievability {d.retrievabilityPct}% · floor{" "}
            {DEFENSIBILITY_APPETITE.retrievabilityFloor}% · evidence gap is location and
            production, not a completeness score.
          </p>
        </div>
      </section>

      {/* Block 3 — Is the data behind it trustworthy? */}
      <section>
        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
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
              <dd className="font-medium text-slate-800">{d.lastRefresh}</dd>
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
        cadence ({pack.pct}%) — readiness of the MI pack, not an assurance of review
        outcome.
      </p>

      <p className="border-t border-slate-100 pt-3 text-[10px] text-slate-400">
        s.166 FSMA · SYSC 9 · MLR 2017 reg 40 · SYSC 6.1.1R
      </p>
    </div>
  );
}
