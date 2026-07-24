"use client";

/**
 * Momentum lens — CRO board face. Surfaces only what the RAG badge cannot say.
 * Observed = solid (stated); projection = dotted (inferred). No chart library.
 */
import { useState } from "react";
import { RISK_DOMAINS_V4 as BASE_DOMAINS } from "@/lib/ukbankingaudit/riskDomainsV4";
import { REVIEW_DATES } from "@/lib/ukbankingaudit/v6/riskDomainsV6";
import { AS_OF, getOwnershipState } from "@/lib/ukbankingaudit/v6/ownershipData";
import {
  getKriMomentum,
  KRI_HISTORY,
  MOMENTUM_APPETITE,
  type KriMomentumResult,
} from "@/lib/ukbankingaudit/v6/momentumData";
import { ClaimLine } from "./ClaimLine";
import {
  APPETITE_RULE_STROKE,
  formatUkDate,
  METHOD_HOVER,
  momentumBreachTint,
  momentumSeriesStroke,
  momentumVerdictTone,
  trendSense,
  type TrendSense,
} from "./lensChrome";
import type { RiskDomainV4 } from "./types";

type Props = {
  domain: RiskDomainV4;
};

type Row = { label: string; momentum: KriMomentumResult; unit: string };

function addDaysIso(iso: string, days: number): string {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00.000Z`) + days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function kriUnit(domainId: string, label: string): string {
  const domain = BASE_DOMAINS.find((d) => d.id === domainId);
  return domain?.kris.find((k) => k.label === label)?.unit ?? "";
}

function formatGap(gap: number, unit: string): string {
  const n = gap >= 10 ? gap.toFixed(0) : gap >= 1 ? gap.toFixed(1) : gap.toFixed(2);
  if (!unit || unit === "count" || unit === "cases") return n;
  if (unit === "%") return `${n}%`;
  if (unit === "days") return `${n} days`;
  return `${n} ${unit}`;
}

function isActionable(m: KriMomentumResult): boolean {
  return (
    m.state === "ALREADY_BREACHED" ||
    m.state === "PROJECTED_BREACH_RED" ||
    m.state === "PROJECTED_BREACH_AMBER"
  );
}

function senseOf(m: KriMomentumResult): TrendSense {
  return trendSense(m.slopePerMonth, m.direction);
}

function captionFor(m: KriMomentumResult, unit: string): string {
  const current = m.values[m.values.length - 1]!;
  const gap = Math.abs(current - m.target);
  const sense = senseOf(m);
  switch (m.state) {
    case "ALREADY_BREACHED": {
      const head =
        sense === "worsening" ? "Worsening" : sense === "recovering" ? "Recovering" : "Flat";
      return `${head} · ${formatGap(gap, unit)} outside appetite`;
    }
    case "PROJECTED_BREACH_RED":
    case "PROJECTED_BREACH_AMBER": {
      if (m.daysToBreach === null) return "Projected to breach appetite";
      const when = formatUkDate(addDaysIso(AS_OF, m.daysToBreach));
      return `Breaches ${when} · ${m.daysToBreach} days`;
    }
    case "IMPROVING":
      return `Improving · ${formatGap(gap, unit)} inside appetite`;
    case "AT_TARGET_NO_HEADROOM":
      return "At target · no headroom";
    case "STABLE":
      return "Stable";
    default: {
      const _exhaustive: never = m.state;
      return _exhaustive;
    }
  }
}

function buildVerdict(rows: Row[]): { text: string; toneState: KriMomentumResult["state"] } {
  const projected = rows
    .filter(
      (r) =>
        r.momentum.state === "PROJECTED_BREACH_RED" ||
        r.momentum.state === "PROJECTED_BREACH_AMBER",
    )
    .sort(
      (a, b) => (a.momentum.daysToBreach ?? 1e9) - (b.momentum.daysToBreach ?? 1e9),
    );
  const breached = rows.filter((r) => r.momentum.state === "ALREADY_BREACHED");
  const horizon = MOMENTUM_APPETITE.amberHorizonDays;

  if (projected.length > 0) {
    const lead = projected[0]!;
    const days = lead.momentum.daysToBreach;
    let text =
      `MOMENTUM · ${lead.label} is inside appetite today and projected to breach in ${days} days`;
    if (breached.length > 0) {
      text += ` · plus ${breached.length} already outside appetite`;
    }
    return { text, toneState: lead.momentum.state };
  }

  if (breached.length > 0) {
    const worsening = breached.filter((r) => senseOf(r.momentum) === "worsening");
    const recovering = breached.filter((r) => senseOf(r.momentum) === "recovering");
    if (worsening.length > 0) {
      const worst = worsening.sort(
        (a, b) => Math.abs(b.momentum.slopePerMonth) - Math.abs(a.momentum.slopePerMonth),
      )[0]!;
      return {
        text: `MOMENTUM · ${breached.length} indicators outside appetite · ${worst.label} worsening`,
        toneState: "ALREADY_BREACHED",
      };
    }
    if (recovering.length > 0) {
      const lead = recovering[0]!;
      const sinceIso = REVIEW_DATES[REVIEW_DATES.length - 3] ?? REVIEW_DATES[0]!;
      const sinceMonth = formatUkDate(sinceIso).replace(/^\d+\s/, "");
      return {
        text: `MOMENTUM · ${breached.length} outside appetite · ${lead.label} recovering since ${sinceMonth}`,
        toneState: "ALREADY_BREACHED",
      };
    }
    return {
      text: `MOMENTUM · ${breached.length} indicators outside appetite · flat`,
      toneState: "ALREADY_BREACHED",
    };
  }

  const noHeadroom = rows.find((r) => r.momentum.state === "AT_TARGET_NO_HEADROOM");
  if (noHeadroom && rows.every((r) => r.momentum.state === "AT_TARGET_NO_HEADROOM" || r.momentum.state === "STABLE")) {
    return {
      text: "MOMENTUM · at target with no headroom",
      toneState: "AT_TARGET_NO_HEADROOM",
    };
  }

  return {
    text: `MOMENTUM · no indicator projected to breach within ${horizon} days · stable`,
    toneState: "STABLE",
  };
}

function OwnerLine({ domainId }: { domainId: string }) {
  const own = getOwnershipState(domainId);
  if (own.state === "UNALLOCATED") {
    return (
      <p className="text-[12px] font-medium text-rose-700">No named Senior Manager</p>
    );
  }
  return (
    <p className="text-[12px] text-slate-600">
      Owner: {own.smf} · {own.holder}
    </p>
  );
}

function KriSparkline({ label, momentum, unit }: Row) {
  const { values, target, direction, slopePerMonth, daysToBreach, state } = momentum;
  const sense = senseOf(momentum);
  const stroke = momentumSeriesStroke(state, sense);
  const tint = momentumBreachTint(state);
  const n = values.length;
  const w = 320;
  const h = 64;
  const padX = 8;
  const padY = 8;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const caption = captionFor(momentum, unit);
  const slopeTitle = `slope ${slopePerMonth >= 0 ? "+" : ""}${slopePerMonth.toFixed(3)} / month`;

  /** Quiet states: one straight line at current — no series, no appetite apparatus. */
  if (state === "STABLE" || state === "AT_TARGET_NO_HEADROOM") {
    const midY = padY + innerH / 2;
    return (
      <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5" title={slopeTitle}>
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-[12px] font-semibold text-slate-800">{label}</h4>
          <span className="text-[10px] text-slate-400">
            appetite {target}
            {unit === "%" ? "%" : ""}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="mt-1.5 w-full"
          role="img"
          aria-label={`${label} · ${caption}`}
        >
          <line
            x1={padX}
            x2={padX + innerW}
            y1={midY}
            y2={midY}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
        <p className="mt-1 text-[11px] leading-snug text-slate-600">{caption}</p>
      </div>
    );
  }

  const monthsToBreach =
    daysToBreach !== null && daysToBreach > 0 ? daysToBreach / (365 / 12) : 0;
  const showProjection =
    (state === "PROJECTED_BREACH_RED" || state === "PROJECTED_BREACH_AMBER") &&
    monthsToBreach > 0;

  const xStep = innerW / Math.max(n - 1 + (showProjection ? monthsToBreach : 0), 1);
  const xs = values.map((_, i) => padX + i * xStep);
  const xProj = showProjection ? padX + (n - 1 + monthsToBreach) * xStep : xs[n - 1]!;

  const yCandidates = [...values, target];
  const yMin = Math.min(...yCandidates);
  const yMax = Math.max(...yCandidates);
  const ySpan = yMax - yMin || 1;
  const yAt = (v: number) => padY + innerH - ((v - yMin) / ySpan) * innerH;

  const observedPoints = values.map((v, i) => `${xs[i]},${yAt(v)}`).join(" ");
  const lastX = xs[n - 1]!;
  const lastY = yAt(values[n - 1]!);
  const appetiteY = yAt(target);
  const ruleX2 = showProjection ? xProj : padX + innerW;

  const breachRect =
    tint === null
      ? null
      : direction === "lower-is-better"
        ? { x: padX, y: padY, width: ruleX2 - padX, height: Math.max(0, appetiteY - padY) }
        : {
            x: padX,
            y: appetiteY,
            width: ruleX2 - padX,
            height: Math.max(0, padY + innerH - appetiteY),
          };

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5" title={slopeTitle}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[12px] font-semibold text-slate-800">{label}</h4>
        <span className="text-[10px] text-slate-400">
          appetite {target}
          {unit === "%" ? "%" : ""}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-1.5 w-full"
        role="img"
        aria-label={`${label} · ${caption}`}
      >
        {breachRect && tint ? (
          <rect
            x={breachRect.x}
            y={breachRect.y}
            width={breachRect.width}
            height={breachRect.height}
            fill={tint}
            opacity={0.85}
          />
        ) : null}
        <line
          x1={padX}
          x2={ruleX2}
          y1={appetiteY}
          y2={appetiteY}
          stroke={APPETITE_RULE_STROKE}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeOpacity={0.15}
          strokeWidth={3.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={observedPoints}
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={observedPoints}
        />
        <circle cx={lastX} cy={lastY} r={3} fill={stroke} />
        {showProjection ? (
          <>
            <line
              x1={lastX}
              y1={lastY}
              x2={xProj}
              y2={yAt(target)}
              stroke={stroke}
              strokeWidth={1.25}
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
            <circle
              cx={xProj}
              cy={yAt(target)}
              r={3.5}
              fill="none"
              stroke={stroke}
              strokeWidth={1.25}
            />
          </>
        ) : null}
      </svg>

      <p className="mt-1 text-[11px] leading-snug text-slate-600">{caption}</p>
    </div>
  );
}

export function MomentumLens({ domain }: Props) {
  const histories = KRI_HISTORY.filter((h) => h.domainId === domain.id);
  const rows: Row[] = histories.map((h) => ({
    label: h.kriLabel,
    momentum: getKriMomentum(domain.id, h.kriLabel),
    unit: kriUnit(domain.id, h.kriLabel),
  }));

  const actionable = rows
    .filter((r) => isActionable(r.momentum))
    .sort((a, b) => {
      const rank = (s: KriMomentumResult["state"]) => {
        switch (s) {
          case "PROJECTED_BREACH_RED":
            return 3;
          case "PROJECTED_BREACH_AMBER":
            return 2;
          case "ALREADY_BREACHED":
            return 1;
          case "IMPROVING":
          case "STABLE":
          case "AT_TARGET_NO_HEADROOM":
            return 0;
          default: {
            const _exhaustive: never = s;
            return _exhaustive;
          }
        }
      };
      const dr = rank(b.momentum.state) - rank(a.momentum.state);
      if (dr !== 0) return dr;
      return (a.momentum.daysToBreach ?? 1e9) - (b.momentum.daysToBreach ?? 1e9);
    });
  const quiet = rows.filter((r) => !isActionable(r.momentum));
  const allQuiet = actionable.length === 0;
  const [stableOpen, setStableOpen] = useState(allQuiet);

  const verdict = buildVerdict(rows);

  return (
    <div className="space-y-3 p-[18px]">
      <ClaimLine
        layout="stack"
        derivation="LLM"
        evidenceRef={`KRI-HIST-${domain.id.toUpperCase()}-VERDICT`}
        hideEvidenceRef
        markerTitle={METHOD_HOVER}
      >
        <span className={`text-[13px] font-bold ${momentumVerdictTone(verdict.toneState)}`}>
          {verdict.text}
        </span>
      </ClaimLine>

      <OwnerLine domainId={domain.id} />

      {actionable.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {actionable.map((row) => (
            <KriSparkline key={row.label} {...row} />
          ))}
        </div>
      ) : null}

      {quiet.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setStableOpen((v) => !v)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:bg-slate-100"
          >
            {quiet.length} indicator{quiet.length === 1 ? "" : "s"} stable · none projected to
            breach within {MOMENTUM_APPETITE.amberHorizonDays} days
            <span className="ml-1.5 text-slate-400">{stableOpen ? "▴" : "▾"}</span>
          </button>
          {stableOpen ? (
            <div className="mt-2 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {quiet.map((row) => (
                <KriSparkline key={row.label} {...row} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        SYSC 7.1.2 · ICAAP/ILAAP early warning indicators
      </p>
    </div>
  );
}
