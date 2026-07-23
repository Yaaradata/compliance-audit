"use client";

/**
 * Ownership lens — CRO board face. Surfaces SMF allocation and trail age —
 * what the RAG badge cannot say. Names the orphan, never a person as culpable.
 */
import {
  DOMAIN_ACCOUNTABILITY,
  RISK_DOMAINS_V4,
} from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import {
  getOwnershipState,
  OWNERSHIP_APPETITE,
  type OwnershipState,
  type OwnershipStateResult,
} from "@/lib/ukbankingaudit/v6/ownershipData";
import { ClaimLine } from "./ClaimLine";
import {
  ownershipBarFill,
  ownershipVerdictTone,
  OWNERSHIP_METHOD_HOVER,
} from "./lensChrome";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
};

function verdictLine(own: OwnershipStateResult): string {
  switch (own.state) {
    case "UNALLOCATED":
      return "OWNERSHIP · No named Senior Manager · UNALLOCATED";
    case "OWNED_STALE":
      return `OWNERSHIP · ${own.smf} · ${own.holder} · last recorded step ${own.trailAgeDays} days ago · STALE`;
    case "OWNED_CURRENT":
      return `OWNERSHIP · ${own.smf} · ${own.holder} · last recorded step ${own.trailAgeDays} days ago · CURRENT`;
    default: {
      const _exhaustive: never = own.state;
      return _exhaustive;
    }
  }
}

function stepTypeLabel(stepType: OwnershipStateResult["stepType"]): string {
  switch (stepType) {
    case "attestation":
      return "Attestation";
    case "escalation":
      return "Escalation";
    case "challenge":
      return "Challenge";
    case "decision":
      return "Decision";
    case null:
      return "Step";
    default: {
      const _exhaustive: never = stepType;
      return _exhaustive;
    }
  }
}

/** Days-since-step bar — state colour, 90-day appetite marker. */
function TrailAgeBar({
  ageDays,
  state,
}: {
  ageDays: number;
  state: OwnershipState;
}) {
  const appetite = OWNERSHIP_APPETITE.maxTrailAgeDays;
  const scale = Math.max(ageDays, appetite) * 1.15;
  const fillPct = Math.min(100, (ageDays / scale) * 100);
  const tickPct = Math.min(100, (appetite / scale) * 100);
  const fill = ownershipBarFill(state);
  return (
    <div className="mt-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${fillPct}%`, backgroundColor: fill }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-slate-400"
          style={{ left: `${tickPct}%` }}
          title={`Appetite — ${appetite} days`}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
        <span>{ageDays} days since last recorded step</span>
        <span>appetite {appetite} days</span>
      </div>
    </div>
  );
}

function FirmOwnershipGrid({ activeDomainId }: { activeDomainId: string }) {
  return (
    <div>
      <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
        Management Responsibilities Map · nine domains
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
        {RISK_DOMAINS_V4.map((d) => {
          const own = getOwnershipState(d.id);
          const active = d.id === activeDomainId;
          if (own.state === "UNALLOCATED") {
            return (
              <div
                key={d.id}
                className={`flex min-h-[72px] flex-col justify-center rounded-lg border border-dashed border-rose-300 bg-transparent px-2.5 py-2 ${
                  active ? "ring-2 ring-rose-400 ring-offset-1" : ""
                }`}
                aria-label={`${d.name}: unallocated Senior Management Function`}
              >
                <div className="text-[11px] font-semibold text-slate-700">{d.name}</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-rose-600">
                  Unallocated
                </div>
              </div>
            );
          }
          return (
            <div
              key={d.id}
              className={`flex min-h-[72px] flex-col justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 ${
                active ? "ring-2 ring-slate-400 ring-offset-1" : ""
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-700">{d.name}</div>
              <div className="mt-0.5 text-[11px] font-medium text-slate-800">
                {own.smf} · {own.holder}
              </div>
              <div
                className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${
                  own.state === "OWNED_STALE" ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {own.state === "OWNED_STALE" ? "Stale trail" : "Current trail"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OwnershipLens({ domain }: Props) {
  const own = getOwnershipState(domain.id);
  const acc = DOMAIN_ACCOUNTABILITY[domain.id];

  return (
    <div className="space-y-4 p-[18px]">
      <ClaimLine
        layout="stack"
        derivation="RULE"
        evidenceRef={own.stepRef ?? `OWN-${domain.id.toUpperCase()}-MAP`}
        hideEvidenceRef
        markerTitle={OWNERSHIP_METHOD_HOVER}
      >
        <span className={`text-[13px] font-bold ${ownershipVerdictTone(own.state)}`}>
          {verdictLine(own)}
        </span>
      </ClaimLine>

      <section>
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Senior Management Function
        </h3>
        {own.state === "UNALLOCATED" || !acc || ("unowned" in acc && acc.unowned) ? (
          <div className="rounded-[10px] border border-dashed border-rose-300 bg-rose-50/30 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-slate-800">
              No Senior Management Function is mapped to this domain in the Management
              Responsibilities Map.
            </p>
          </div>
        ) : (
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[15px] font-bold text-slate-900">{own.smf}</span>
              <span className="text-[13px] font-semibold text-slate-800">{own.holder}</span>
            </div>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Prescribed responsibility
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-700">
              {"prescribedResponsibility" in acc ? acc.prescribedResponsibility : null}
            </p>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Reasonable steps trail
        </h3>
        {own.state === "UNALLOCATED" ? (
          <div className="rounded-[10px] border border-dashed border-slate-300 bg-white px-4 py-3">
            <p className="text-[13px] text-slate-700">
              No trail is possible without an allocated Senior Manager.
            </p>
          </div>
        ) : (
          <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-3">
            {own.trailAgeDays !== null ? (
              <TrailAgeBar ageDays={own.trailAgeDays} state={own.state} />
            ) : null}
            {own.stepRef ? (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <ClaimLine
                  layout="stack"
                  derivation="RULE"
                  evidenceRef={own.stepRef}
                  hideEvidenceRef
                >
                  <span className="text-[12px] text-slate-700">
                    Last recorded step · {stepTypeLabel(own.stepType)}
                  </span>
                </ClaimLine>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <FirmOwnershipGrid activeDomainId={domain.id} />

      <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        SYSC 25 · SYSC 26 · s.66A(5) FSMA
      </p>
    </div>
  );
}
