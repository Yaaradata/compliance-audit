/**
 * UK Board v1 — selectors. Integrity is evaluated before status (Stage 5 section 4.4):
 * not assessed → any failed badge check (Unverified) → red → amber → within appetite.
 */
import type { IntegritySnapshot, ReportRoute, ScorecardRow, SeriesPoint, Status, Unit, Viewer, VisibilityScope } from "./types";

export const CHECK_ORDER = ["owner", "feed", "attestation", "mapping"] as const;

export function integrityPasses(snapshot: IntegritySnapshot): boolean {
  return CHECK_ORDER.every((k) => snapshot[k].pass);
}

export function failedChecks(snapshot: IntegritySnapshot) {
  return CHECK_ORDER.filter((k) => !snapshot[k].pass).map((k) => snapshot[k]);
}

/** Face status. Never returns a RAG value when any integrity check fails. */
export function selectStatus(unit: Unit): Status {
  if (unit.rawStatus === "not_assessed") return "not_assessed";
  if (!integrityPasses(unit.integrity)) return "unverified";
  return unit.rawStatus;
}

const RANK: Record<Status, number> = {
  red: 0,
  unverified: 1,
  amber: 2,
  within_appetite: 4,
  not_assessed: 5,
};

/** Ranked by urgency: red → unverified → amber → early warning → within appetite. Stable on seed order. */
export function rankScorecard(rows: ScorecardRow[], units: Record<string, Unit>): ScorecardRow[] {
  const score = (r: ScorecardRow) => {
    const s = selectStatus(units[r.unitId]);
    if (s === "within_appetite" && r.marker) return 3;
    return RANK[s];
  };
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => score(a.r) - score(b.r) || a.i - b.i)
    .map((x) => x.r);
}

export function statusCounts(rows: ScorecardRow[], units: Record<string, Unit>) {
  const counts = { within_appetite: 0, amber: 0, red: 0, unverified: 0, not_assessed: 0 } as Record<Status, number>;
  rows.forEach((r) => {
    counts[selectStatus(units[r.unitId])] += 1;
  });
  return counts;
}

export function verifiedCount(rows: ScorecardRow[], units: Record<string, Unit>) {
  return rows.filter((r) => integrityPasses(units[r.unitId].integrity)).length;
}

/** Rule-based least-squares fit (no ML). */
export function leastSquares(points: SeriesPoint[]) {
  const n = points.length;
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.value);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    den += (x - mx) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

/** Minimum history before a trajectory is shown (S5-OD-4; firm practice). */
export const MIN_TRAJECTORY_POINTS = 4;

/**
 * Periods after the last point until the straight line from the last value, at the fitted
 * slope, reaches `threshold`. Null when history is too short or the line moves away.
 */
export function periodsToThreshold(points: SeriesPoint[], threshold: number): number | null {
  if (points.length < MIN_TRAJECTORY_POINTS) return null;
  const { slope } = leastSquares(points);
  const gap = threshold - points[points.length - 1].value;
  if (slope === 0 || Math.sign(gap) !== Math.sign(slope)) return null;
  return Math.ceil(gap / slope - 1e-9);
}

/** "Q3 2026" + n quarters → "Q2 2027". */
export function addQuarters(label: string, n: number): string {
  const m = /^Q([1-4]) (\d{4})$/.exec(label);
  if (!m) return label;
  const idx = Number(m[2]) * 4 + (Number(m[1]) - 1) + n;
  return `Q${(idx % 4) + 1} ${Math.floor(idx / 4)}`;
}

export function projectedCrossing(points: SeriesPoint[], threshold: number): string | null {
  const p = periodsToThreshold(points, threshold);
  if (p === null) return null;
  return addQuarters(points[points.length - 1].label, p);
}

export function isVisible(scope: VisibilityScope, viewer: Viewer): boolean {
  if (scope === "cro_and_deciding_smf") return viewer === "cro";
  return true;
}

export function routesDecided(eventId: string, routes: ReportRoute[]) {
  const eventRoutes = routes.filter((r) => r.eventId === eventId);
  const decided = eventRoutes.filter((r) => r.status === "decided").length;
  return { decided, total: eventRoutes.length };
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-GB");
}
