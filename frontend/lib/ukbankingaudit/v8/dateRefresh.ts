/**
 * v8 date refresh for data inherited from shared files (mockDataV2–V6,
 * riskDomainsV4). Those files are used by older versions and are never edited,
 * so v8 moves their dates forward on a copy when it reads them.
 *
 * Shared mock data runs on a fixed clock of 30 Apr 2026. Moving it 189 days puts
 * that clock on 5 Nov 2026, so every "days open" and ageing figure stays exact.
 * Dates inside identifiers (for example ISS-2026-009) are left alone.
 */
const SHARED_SHIFT_DAYS = 189;
const DAY_MS = 86_400_000;

const ISO_2026 = /(?<![\w-])2026-(?:0[1-9]|1[0-2])-[0-3]\d/g;

/** The cyber closure date is one event, so it maps to the same day everywhere. */
const EXACT_ISO: Record<string, string> = { "2026-07-18": "2026-11-13" };

/** Dates written in prose. Longest first, so a dated form wins over a short form. */
const PROSE: ReadonlyArray<readonly [RegExp, string]> = [
  [/14-Apr-2026/g, "10-Aug-2026"],
  [/22-Apr-2026/g, "28-Oct-2026"],
  [/14-Apr/g, "10-Aug"],
  [/18-Apr/g, "14-Aug"],
  [/30-Jun/g, "26-Oct"],
  [/10-Jul/g, "5-Nov"],
  [/18-Jul/g, "13-Nov"],
  [/30-May/g, "5-Dec"],
  [/\bFeb 2026\b/g, "Jun 2026"],
  [/\bafter May release\b/g, "after September release"],
  // Not a date, but the same copy step: the v8 display label for the cyber category.
  [/Cyber & Op Resilience/g, "Cyber & Information Security"],
];

function shiftIso(iso: string): string {
  const exact = EXACT_ISO[iso];
  if (exact) return exact;
  const ms = Date.parse(`${iso}T00:00:00.000Z`) + SHARED_SHIFT_DAYS * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Refresh one string: ISO dates plus the known prose dates. Pure. */
export function refreshText(text: string): string {
  let out = text.replace(ISO_2026, shiftIso);
  for (const [pattern, replacement] of PROSE) out = out.replace(pattern, replacement);
  return out;
}

function refreshLabel(label: string): string {
  return label.replace(/\bQ1\b/g, "Q3").replace(/\bQ2\b/g, "Q4");
}

/** Deep copy with every date moved forward. The input is never mutated. */
export function refreshSharedData<T>(value: T, key?: string): T {
  if (typeof value === "string") {
    const text = refreshText(value);
    return (key === "label" ? refreshLabel(text) : text) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => refreshSharedData(item, key)) as T;
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = refreshSharedData(v, k);
    return out as T;
  }
  return value;
}
