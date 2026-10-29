/**
 * Shared CRO-lens colour system — Momentum / Ownership / Defensibility.
 * One map so the three lenses cannot drift.
 */

export type TrendSense = "worsening" | "flat" | "recovering";

export type MomentumPaintState =
  | "ALREADY_BREACHED"
  | "PROJECTED_BREACH_RED"
  | "PROJECTED_BREACH_AMBER"
  | "IMPROVING"
  | "STABLE"
  | "AT_TARGET_NO_HEADROOM";

export type OwnershipPaintState = "UNALLOCATED" | "OWNED_STALE" | "OWNED_CURRENT";

export type DefensibilityPaintState = "INDEFENSIBLE" | "AT_RISK" | "DEFENSIBLE";

/** Slope sense against KRI direction. */
export function trendSense(
  slopePerMonth: number,
  direction: "lower-is-better" | "higher-is-better",
): TrendSense {
  const eps = 1e-9;
  if (Math.abs(slopePerMonth) < eps) return "flat";
  if (direction === "lower-is-better") {
    return slopePerMonth > 0 ? "worsening" : "recovering";
  }
  return slopePerMonth < 0 ? "worsening" : "recovering";
}

/** Observed / projected series stroke for Momentum sparklines. */
export function momentumSeriesStroke(
  state: MomentumPaintState,
  sense: TrendSense,
): string {
  switch (state) {
    case "ALREADY_BREACHED":
      if (sense === "worsening") return "#e11d48";
      if (sense === "recovering") return "#f59e0b";
      return "#f43f5e";
    case "PROJECTED_BREACH_RED":
      return "#e11d48";
    case "PROJECTED_BREACH_AMBER":
      return "#f59e0b";
    case "IMPROVING":
      return "#059669";
    case "STABLE":
    case "AT_TARGET_NO_HEADROOM":
      return "#94a3b8";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/** Breach-zone tint behind the series (none when quiet). */
export function momentumBreachTint(
  state: MomentumPaintState,
): string | null {
  switch (state) {
    case "ALREADY_BREACHED":
    case "PROJECTED_BREACH_RED":
      return "#fff1f2";
    case "PROJECTED_BREACH_AMBER":
      return "#fffbeb";
    case "IMPROVING":
    case "STABLE":
    case "AT_TARGET_NO_HEADROOM":
      return null;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export const APPETITE_RULE_STROKE = "#cbd5e1";

export function ownershipBarFill(state: OwnershipPaintState): string {
  switch (state) {
    case "UNALLOCATED":
      return "#e11d48";
    case "OWNED_STALE":
      return "#f59e0b";
    case "OWNED_CURRENT":
      return "#94a3b8";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function lensVerdictTextClass(
  kind: "rose" | "amber" | "emerald" | "slate",
): string {
  switch (kind) {
    case "rose":
      return "text-rose-700";
    case "amber":
      return "text-amber-700";
    case "emerald":
      return "text-emerald-700";
    case "slate":
      return "text-slate-700";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function momentumVerdictTone(state: MomentumPaintState): string {
  switch (state) {
    case "ALREADY_BREACHED":
    case "PROJECTED_BREACH_RED":
      return lensVerdictTextClass("rose");
    case "PROJECTED_BREACH_AMBER":
      return lensVerdictTextClass("amber");
    case "IMPROVING":
      return lensVerdictTextClass("emerald");
    case "STABLE":
    case "AT_TARGET_NO_HEADROOM":
      return lensVerdictTextClass("slate");
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function ownershipVerdictTone(state: OwnershipPaintState): string {
  switch (state) {
    case "UNALLOCATED":
      return lensVerdictTextClass("rose");
    case "OWNED_STALE":
      return lensVerdictTextClass("amber");
    case "OWNED_CURRENT":
      return lensVerdictTextClass("emerald");
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function defensibilityVerdictTone(state: DefensibilityPaintState): string {
  switch (state) {
    case "INDEFENSIBLE":
      return lensVerdictTextClass("rose");
    case "AT_RISK":
      return lensVerdictTextClass("amber");
    case "DEFENSIBLE":
      return lensVerdictTextClass("emerald");
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/** UK board date: "22 Dec 2026". */
export function formatUkDate(iso: string): string {
  const ms = Date.parse(`${iso.slice(0, 10)}T00:00:00.000Z`);
  const d = new Date(ms);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ] as const;
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const METHOD_HOVER =
  "Early warning projection · inferred · least-squares over the trailing three board cycles · deterministic · no model";

export const OWNERSHIP_METHOD_HOVER =
  "Trail age · days since last recorded reasonable-steps entry against SYSC 25 / SYSC 26 · role-level record signal";

export const DEFENSIBILITY_METHOD_HOVER =
  "Evidential defensibility to a skilled person (s.166) · producibility today, not assurance completeness";
