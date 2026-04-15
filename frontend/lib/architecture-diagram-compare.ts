import type { AwsDiagramCompareResource } from "@/lib/aws-api";

export function normalizeCompareToken(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function resourceMatchNames(r: AwsDiagramCompareResource): string[] {
  const out = new Set<string>();
  const d = normalizeCompareToken(r.display_name);
  const id = normalizeCompareToken(r.id);
  if (d) out.add(d);
  if (id) out.add(id);
  return [...out];
}

function labelsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 2 || b.length < 2) return false;
  if (a.length >= 3 && b.length >= 3) {
    return a.includes(b) || b.includes(a);
  }
  return a === b;
}

export type CompareRow =
  | { status: "matched"; diagramLine: string; resource: AwsDiagramCompareResource }
  | { status: "missing"; diagramLine: string }
  | { status: "extra"; resource: AwsDiagramCompareResource };

export function compareDiagramLinesToResources(
  diagramLines: string[],
  resources: AwsDiagramCompareResource[],
): CompareRow[] {
  const lines = diagramLines.map((l) => l.trim()).filter(Boolean);
  const usedIdx = new Set<number>();
  const rows: CompareRow[] = [];

  for (const line of lines) {
    const norm = normalizeCompareToken(line);
    if (!norm) continue;
    let hit = -1;
    for (let i = 0; i < resources.length; i++) {
      if (usedIdx.has(i)) continue;
      const names = resourceMatchNames(resources[i]!);
      const ok = names.some((n) => labelsMatch(n, norm));
      if (ok) {
        hit = i;
        break;
      }
    }
    if (hit >= 0) {
      usedIdx.add(hit);
      rows.push({ status: "matched", diagramLine: line, resource: resources[hit]! });
    } else {
      rows.push({ status: "missing", diagramLine: line });
    }
  }

  for (let i = 0; i < resources.length; i++) {
    if (!usedIdx.has(i)) {
      rows.push({ status: "extra", resource: resources[i]! });
    }
  }

  return rows;
}

export function summarizeCompare(rows: CompareRow[]) {
  let matched = 0;
  let missing = 0;
  let extra = 0;
  for (const r of rows) {
    if (r.status === "matched") matched += 1;
    else if (r.status === "missing") missing += 1;
    else extra += 1;
  }
  return { matched, missing, extra };
}

export function filterCompareRows(rows: CompareRow[], applicationFilter: string): CompareRow[] {
  const f = applicationFilter.trim().toLowerCase();
  if (!f) return rows;
  return rows.filter((row) => {
    if (row.status === "missing") return true;
    const app = (row.resource.application || "").trim().toLowerCase();
    return app === f;
  });
}

export function uniqueApplications(resources: AwsDiagramCompareResource[]): string[] {
  const s = new Set<string>();
  for (const r of resources) {
    const a = (r.application || "").trim();
    if (a) s.add(a);
  }
  return [...s].sort((x, y) => x.localeCompare(y));
}
