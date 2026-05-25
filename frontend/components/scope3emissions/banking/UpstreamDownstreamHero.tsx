"use client";

import { useCallback, useState } from "react";
import type { UpstreamDownstreamHeroMock } from "./types";

function fmtIN(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

type HeroLane = "upstream" | "downstream";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ShareBar({ upstreamPct, downstreamPct, active }: { upstreamPct: number; downstreamPct: number; active: HeroLane | null }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)] ring-1 ring-[var(--border)]">
      <div
        className={`absolute inset-y-0 left-0 rounded-l-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 transition-opacity duration-300 ${
          active === "downstream" ? "opacity-40" : "opacity-100"
        }`}
        style={{ width: `${upstreamPct}%` }}
      />
      <div
        className={`absolute inset-y-0 right-0 rounded-r-full bg-gradient-to-l from-rose-600 to-rose-500/80 transition-opacity duration-300 dark:from-rose-500 dark:to-rose-400/80 ${
          active === "upstream" ? "opacity-40" : "opacity-100"
        }`}
        style={{ width: `${downstreamPct}%` }}
      />
      <div
        className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--card)] bg-[var(--foreground)] shadow-md"
        style={{ left: `${upstreamPct}%` }}
        title="Operational vs financed boundary"
      />
    </div>
  );
}

function EntityChip({
  name,
  note,
  expanded,
  onToggle,
  accent,
}: {
  name: string;
  note?: string;
  expanded: boolean;
  onToggle: () => void;
  accent: "upstream" | "downstream";
}) {
  const accentRing =
    accent === "upstream"
      ? "ring-[var(--primary)]/30 hover:ring-[var(--primary)]/50 data-[expanded=true]:border-[var(--primary)]/40 data-[expanded=true]:bg-[var(--primary-muted)]/25"
      : "ring-rose-500/25 hover:ring-rose-500/45 data-[expanded=true]:border-rose-500/35 data-[expanded=true]:bg-rose-500/10";

  return (
    <button
      type="button"
      data-expanded={expanded}
      onClick={onToggle}
      className={`group w-full rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-3 text-left shadow-sm ring-1 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${accentRing}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug text-[var(--foreground)]">{name}</span>
        <span
          className={`mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-wide transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          } ${accent === "upstream" ? "text-[var(--primary)]" : "text-rose-600 dark:text-rose-400"}`}
          aria-hidden
        >
          ▾
        </span>
      </div>
      {note ? (
        <p
          className={`mt-1.5 text-xs leading-relaxed text-[var(--foreground-muted)] transition-all duration-200 ${
            expanded ? "max-h-24 opacity-100" : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          {note}
        </p>
      ) : null}
      {!expanded && note ? (
        <p className="mt-1 truncate text-[11px] text-[var(--foreground-muted)]/80 group-hover:text-[var(--foreground-muted)]">
          {note}
        </p>
      ) : null}
    </button>
  );
}

function LanePanel({
  lane,
  title,
  flowLabel,
  pct,
  tco2e,
  tco2eLabel,
  entities,
  active,
  expandedKey,
  onExpand,
  onFocus,
  onBlur,
  exploreTargetId,
  exploreLabel,
}: {
  lane: HeroLane;
  title: string;
  flowLabel: string;
  pct: number;
  tco2e: number;
  tco2eLabel: string;
  entities: { name: string; note?: string }[];
  active: boolean;
  expandedKey: string | null;
  onExpand: (key: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  exploreTargetId: string;
  exploreLabel: string;
}) {
  const isUp = lane === "upstream";
  const shell = isUp
    ? "bg-gradient-to-br from-[var(--primary-muted)]/20 via-[var(--card)] to-[var(--card)] md:rounded-l-2xl"
    : "bg-gradient-to-bl from-rose-500/[0.07] via-[var(--card)] to-[var(--card)] md:rounded-r-2xl";
  const titleColor = isUp ? "text-[var(--primary)]" : "text-rose-700 dark:text-rose-300";
  const pctColor = isUp ? "text-[var(--primary)]" : "text-rose-700 dark:text-rose-300";
  const flowIcon = isUp ? "←" : "→";

  return (
    <div
      className={`relative flex h-full min-h-0 min-w-0 flex-col border-[var(--border)] p-5 transition-all duration-300 sm:p-6 ${shell} ${
        isUp ? "border-b md:border-b-0 md:border-r" : ""
      } ${active ? "ring-2 ring-inset " + (isUp ? "ring-[var(--primary)]/25" : "ring-rose-500/20") : ""}`}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${titleColor}`}>{title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                isUp ? "bg-[var(--primary-muted)]/50 text-[var(--primary)]" : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              }`}
            >
              {flowIcon}
            </span>
            {flowLabel}
          </p>
        </div>
        <div
          className={`rounded-xl border px-3 py-2 text-right shadow-sm ${
            isUp ? "border-[var(--primary)]/20 bg-[var(--primary-muted)]/15" : "border-rose-500/20 bg-rose-500/10"
          }`}
        >
          <p className={`text-2xl font-bold tabular-nums leading-none sm:text-3xl ${pctColor}`}>{pct}%</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--foreground-muted)]">of Scope 3</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">{tco2eLabel}</dt>
          <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-[var(--foreground)]">{fmtIN(tco2e)} tCO₂e</dd>
        </div>
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Categories</dt>
          <dd className="mt-0.5 text-xs font-medium text-[var(--foreground)]">{isUp ? "Scope 3 · Cat 1–8" : "Cat 15 · Financed"}</dd>
        </div>
      </dl>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
        {isUp ? "Key suppliers" : "Illustrative borrowers"}
      </p>
      <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-2">
        {entities.map((e) => {
          const key = `${lane}:${e.name}`;
          return (
            <li key={key}>
              <EntityChip
                name={e.name}
                note={e.note}
                expanded={expandedKey === key}
                onToggle={() => onExpand(expandedKey === key ? "" : key)}
                accent={lane}
              />
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => scrollToSection(exploreTargetId)}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isUp
            ? "border-[var(--primary)]/30 bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]"
            : "border-rose-600/30 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500"
        }`}
      >
        {exploreLabel}
        <span aria-hidden>↓</span>
      </button>
    </div>
  );
}

export function UpstreamDownstreamHero({
  legalName,
  bankTicker,
  hero,
}: {
  legalName: string;
  bankTicker: string;
  hero: UpstreamDownstreamHeroMock;
}) {
  const [activeLane, setActiveLane] = useState<HeroLane | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const onExpand = useCallback((key: string) => {
    setExpandedKey(key || null);
  }, []);

  return (
    <div className="overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--muted)]/25 px-5 py-5 sm:px-6">
        <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          {legalName} <span className="text-[var(--foreground-muted)]">({bankTicker})</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Value-chain lens — upstream operations vs downstream financed emissions (illustrative FY25 mock).
        </p>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            <span className={activeLane === "downstream" ? "opacity-50" : "text-[var(--primary)]"}>Upstream {hero.upstreamPctScope3}%</span>
            <span className={activeLane === "upstream" ? "opacity-50" : "text-rose-700 dark:text-rose-300"}>Downstream {hero.downstreamPctScope3}%</span>
          </div>
          <ShareBar upstreamPct={hero.upstreamPctScope3} downstreamPct={hero.downstreamPctScope3} active={activeLane} />
        </div>
      </div>

      <div className="relative grid min-h-0 grid-cols-1 md:grid-cols-2 md:min-h-[520px] md:items-stretch">
        <LanePanel
          lane="upstream"
          title="Upstream"
          flowLabel={hero.rupeeFlowLeftLabel}
          pct={hero.upstreamPctScope3}
          tco2e={hero.insideTCO2e}
          tco2eLabel="Inside the bank (operational)"
          entities={hero.upstreamSuppliers}
          active={activeLane === "upstream"}
          expandedKey={expandedKey}
          onExpand={onExpand}
          onFocus={() => setActiveLane("upstream")}
          onBlur={() => setActiveLane(null)}
          exploreTargetId="ud-upstream"
          exploreLabel="Explore upstream detail"
        />
        <LanePanel
          lane="downstream"
          title="Downstream"
          flowLabel={hero.rupeeFlowRightLabel}
          pct={hero.downstreamPctScope3}
          tco2e={hero.outsideTCO2e}
          tco2eLabel="Outside the bank (financed)"
          entities={hero.downstreamBorrowers}
          active={activeLane === "downstream"}
          expandedKey={expandedKey}
          onExpand={onExpand}
          onFocus={() => setActiveLane("downstream")}
          onBlur={() => setActiveLane(null)}
          exploreTargetId="ud-downstream"
          exploreLabel="Explore downstream detail"
        />
      </div>
    </div>
  );
}
