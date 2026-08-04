/**
 * Sort precedents strongest first: POSTURE_RANK ascending, then noticeDate descending.
 * Cap is applied by callers (dedupe merges at 3).
 */
import type { Precedent } from "./types";
import { POSTURE_RANK } from "./types";

export function sortPrecedents(precedents: Precedent[]): Precedent[] {
  return [...precedents].sort((a, b) => {
    const byPosture = POSTURE_RANK[a.admissionPosture] - POSTURE_RANK[b.admissionPosture];
    if (byPosture !== 0) return byPosture;
    return b.noticeDate.localeCompare(a.noticeDate);
  });
}

/** Dedupe by id, sort, cap at `limit` (default 3). */
export function rankPrecedents(precedents: Precedent[], limit = 3): Precedent[] {
  const seen = new Set<string>();
  const unique: Precedent[] = [];
  for (const p of sortPrecedents(precedents)) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
    if (unique.length >= limit) break;
  }
  return unique;
}

export function primaryPrecedent(precedents: Precedent[]): Precedent | null {
  return precedents[0] ?? null;
}
