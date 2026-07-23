"use client";

/**
 * Momentum lens — early warning indicators from board-cycle KRI history.
 * Observed series is STATED (solid); projection is INFERRED (dotted / hollow).
 * Hand-rolled SVG sparklines only — no chart library.
 */
import { AS_OF } from "@/lib/ukbankingaudit/v6/ownershipData";
import {
  getDomainMomentum,
  getKriMomentum,
  KRI_HISTORY,
  MOMENTUM_APPETITE,
  type KriMomentumResult,
  type MomentumState,
} from "@/lib/ukbankingaudit/v6/momentumData";
import { REVIEW_DATES } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { ClaimLine } from "./ClaimLine";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
};

function addDaysIso(iso: string, days: number): string {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00.000Z`) + days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function formatSlope(slope: number): string {
  const abs = Math.abs(slope);
  const rounded = abs >= 10 ? slope.toFixed(0) : abs >= 1 ? slope.toFixed(2) : slope.toFixed(3);
  const sign = slope > 0 ? "+" : "";
  return `${sign}${rounded}`;
}

function verdictLine(
  domainId: string,
  state: MomentumState,
  worstKri: string,
  daysToBreach: number | null,
): string {
  switch (state) {
    case "ALREADY_BREACHED": {
      const n = KRI_HISTORY.filter((h) => h.domainId === domainId).filter(
        (h) => getKriMomentum(domainId, h.kriLabel).state === "ALREADY_BREACHED",
      ).length;
      return `MOMENTUM · already outside appetite on ${n} indicators · BREACHED`;
    }
    case "PROJECTED_BREACH_RED":
      return `MOMENTUM · ${worstKri} projected to breach in ${daysToBreach} days · RED`;
    case "PROJECTED_BREACH_AMBER":
      return `MOMENTUM · ${worstKri} projected to breach in ${daysToBreach} days · AMBER`;
    case "AT_TARGET_NO_HEADROOM":
      return "MOMENTUM · at target with no headroom · MONITOR";
    case "STABLE":
    case "IMPROVING":
      return `MOMENTUM · no indicator projected to breach within ${MOMENTUM_APPETITE.amberHorizonDays} days · STABLE`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function verdictTone(state: MomentumState): string {
  switch (state) {
    case "ALREADY_BREACHED":
    case "PROJECTED_BREACH_RED":
      return "text-rose-700";
    case "PROJECTED_BREACH_AMBER":
      return "text-amber-700";
    case "AT_TARGET_NO_HEADROOM":
      return "text-slate-700";
    case "STABLE":
    case "IMPROVING":
      return "text-emerald-700";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function rankKey(m: KriMomentumResult): number {
  if (m.state === "ALREADY_BREACHED") return -1;
  if (m.daysToBreach === null) return Number.POSITIVE_INFINITY;
  return m.daysToBreach;
}

type SparkProps = {
  label: string;
  momentum: KriMomentumResult;
};

/**
 * 12-point observed polyline (solid, heavy) + appetite rule + projection
 * (dotted, lighter). Observed and projected NEVER share the same stroke weight.
 */
function KriSparkline({ label, momentum }: SparkProps) {
  const { values, target, direction, slopePerMonth, daysToBreach, state } = momentum;
  const n = values.length;
  const w = 320;
  const h = 72;
  const padX = 8;
  const padY = 10;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const monthsToBreach =
    daysToBreach !== null && daysToBreach > 0 ? daysToBreach / (365 / 12) : 0;
  const showProjection =
    (state === "PROJECTED_BREACH_RED" || state === "PROJECTED_BREACH_AMBER") &&
    monthsToBreach > 0;

  const xStep = innerW / Math.max(n - 1 + (showProjection ? monthsToBreach : 0), 1);
  const xs = values.map((_, i) => padX + i * xStep);
  const xProj = showProjection ? padX + (n - 1 + monthsToBreach) * xStep : xs[n - 1]!;

  const yCandidates = [...values, target];
  if (showProjection) yCandidates.push(target);
  const yMin = Math.min(...yCandidates);
  const yMax = Math.max(...yCandidates);
  const ySpan = yMax - yMin || 1;
  const yAt = (v: number) => padY + innerH - ((v - yMin) / ySpan) * innerH;

  const observedPoints = values.map((v, i) => `${xs[i]},${yAt(v)}`).join(" ");
  const lastX = xs[n - 1]!;
  const lastY = yAt(values[n - 1]!);
  const appetiteY = yAt(target);

  const breachDate =
    daysToBreach !== null ? addDaysIso(AS_OF, daysToBreach) : null;

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[12px] font-semibold text-slate-800">{label}</h4>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          risk appetite {target}
          {direction === "lower-is-better" ? " (lower better)" : " (higher better)"}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 w-full"
        role="img"
        aria-label={`${label} board-cycle series with early warning projection`}
      >
        {/* Appetite — horizontal rule */}
        <line
          x1={padX}
          x2={showProjection ? xProj : padX + innerW}
          y1={appetiteY}
          y2={appetiteY}
          stroke="#0f172a"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        {/* Observed — SOLID, heavy */}
        <polyline
          fill="none"
          stroke="#334155"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={observedPoints}
        />
        <circle cx={lastX} cy={lastY} r={3} fill="#334155" />
        {/* Projection — DOTTED, lighter weight (never same as observed) */}
        {showProjection ? (
          <line
            x1={lastX}
            y1={lastY}
            x2={xProj}
            y2={yAt(target)}
            stroke="#e11d48"
            strokeWidth={1.25}
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        ) : null}
        {showProjection ? (
          <circle
            cx={xProj}
            cy={yAt(target)}
            r={3.5}
            fill="none"
            stroke="#e11d48"
            strokeWidth={1.25}
          />
        ) : null}
      </svg>

      <p className="mt-1.5 text-[11px] leading-snug text-slate-600">
        {formatSlope(slopePerMonth)} per month
        {breachDate && daysToBreach !== null
          ? ` · projected breach ${breachDate} · ${daysToBreach} days`
          : state === "ALREADY_BREACHED"
            ? " · already outside risk appetite"
            : state === "AT_TARGET_NO_HEADROOM"
              ? " · at target with no headroom"
              : " · no early warning within horizon"}
      </p>
    </div>
  );
}

export function MomentumLens({ domain }: Props) {
  const domainMom = getDomainMomentum(domain.id);
  const histories = KRI_HISTORY.filter((h) => h.domainId === domain.id);
  const rows = histories
    .map((h) => ({
      label: h.kriLabel,
      momentum: getKriMomentum(domain.id, h.kriLabel),
    }))
    .sort((a, b) => rankKey(a.momentum) - rankKey(b.momentum));

  return (
    <div className="space-y-5 p-[18px]">
      {/* Verdict-first */}
      <ClaimLine
        layout="stack"
        derivation="RULE"
        evidenceRef={`KRI-HIST-${domain.id.toUpperCase()}-VERDICT`}
      >
        <span className={`text-[13px] font-bold ${verdictTone(domainMom.state)}`}>
          {verdictLine(domain.id, domainMom.state, domainMom.worstKri, domainMom.daysToBreach)}
        </span>
      </ClaimLine>

      {/* Evidence model — stated vs inferred */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-700" aria-hidden />
          Observed series · STATED
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full border border-slate-500 bg-transparent"
            aria-hidden
          />
          Early warning projection · INFERRED — least-squares over the trailing three
          board cycles · deterministic · no model
        </span>
      </div>

      {/* Block 1 — per-KRI sparklines */}
      <section className="space-y-3">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Board-cycle early warning indicators
        </h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <KriSparkline key={row.label} label={row.label} momentum={row.momentum} />
          ))}
        </div>
        <p className="text-[10px] text-slate-400">
          {REVIEW_DATES[0]} → {REVIEW_DATES[REVIEW_DATES.length - 1]} · {REVIEW_DATES.length}{" "}
          board cycles
        </p>
      </section>

      {/* Block 2 — days-to-breach ranking */}
      <section>
        <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-wide text-slate-600">
          Days to breach · ranked
        </h3>
        <div className="divide-y divide-slate-100 rounded-[10px] border border-slate-200 bg-white">
          {rows.map((row) => {
            const m = row.momentum;
            const slug = row.label.replace(/[^a-zA-Z0-9]+/g, "-").toUpperCase();
            let detail: string;
            if (m.state === "ALREADY_BREACHED") {
              detail = "Already outside risk appetite";
            } else if (m.daysToBreach !== null) {
              detail = `${m.daysToBreach} days to risk appetite`;
            } else if (m.state === "AT_TARGET_NO_HEADROOM") {
              detail = "At target · no headroom";
            } else {
              detail = `No early warning within ${MOMENTUM_APPETITE.amberHorizonDays} days`;
            }
            return (
              <div key={row.label} className="px-3.5 py-2.5">
                <ClaimLine
                  layout="stack"
                  derivation="RULE"
                  evidenceRef={`KRI-HIST-${domain.id}-${slug}`}
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="text-[12px] font-semibold text-slate-800">{row.label}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        m.state === "ALREADY_BREACHED" || m.state === "PROJECTED_BREACH_RED"
                          ? "text-rose-700"
                          : m.state === "PROJECTED_BREACH_AMBER"
                            ? "text-amber-700"
                            : "text-slate-600"
                      }`}
                    >
                      {detail}
                    </span>
                  </span>
                </ClaimLine>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          Solid marker = observed (stated). Hollow marker = early warning projection
          (inferred). Method: least-squares over the trailing three board cycles ·
          deterministic · no model.
        </p>
      </section>

      <p className="border-t border-slate-100 pt-3 text-[10px] text-slate-400">
        SYSC 7.1.2 · ICAAP/ILAAP early warning indicators
      </p>
    </div>
  );
}
