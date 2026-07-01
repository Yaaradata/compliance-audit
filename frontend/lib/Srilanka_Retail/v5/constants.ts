import type { PostureStatus, RollupItem } from "./types";

export const REGS: [string, string][] = [
  ["EXCISE", "Excise"],
  ["SLSI", "SLSI"],
  ["FCAU", "FCAU"],
  ["CUSTOMS", "Customs"],
  ["CEA", "CEA"],
  ["LABOUR", "Labour"],
];

export const CTRLS: [string, string][] = [
  ["DUTY", "Duty"],
  ["QUALITY", "Quality"],
  ["DISPATCH", "Dispatch"],
  ["EVIDENCE", "Evidence"],
];

export const V5_NAV = [
  ["C1", "Four-Way Reconciliation"],
  ["C2", "Quality Gate + ABV"],
  ["C3", "Dispatch + Receivables"],
  ["C4", "Evidence Packs"],
  ["C5", "Risk Matrix + Exceptions"],
  ["C6", "Board Report"],
] as const;

export const ROLLUP_LABELS: Record<string, string> = {
  "EXCISE|DUTY": "Excise · Duty — four-way tie-out variance pending reconciliation",
  "CUSTOMS|DISPATCH": "Customs · Dispatch — lapsed-licence load L-442 blocked; manual resolution pending",
};

export function buildPosture(): Record<string, PostureStatus> {
  const g: Record<string, PostureStatus> = {};
  REGS.forEach(([r]) => CTRLS.forEach(([c]) => { g[`${r}|${c}`] = "OK"; }));
  g["EXCISE|DUTY"] = "ATTENTION";
  g["CUSTOMS|DISPATCH"] = "ATTENTION";
  [
    "SLSI|DUTY", "SLSI|DISPATCH", "FCAU|DUTY", "FCAU|DISPATCH", "CEA|DUTY", "CEA|QUALITY", "CEA|DISPATCH",
    "LABOUR|DUTY", "LABOUR|QUALITY", "LABOUR|DISPATCH", "CUSTOMS|QUALITY",
  ].forEach((k) => { g[k] = "NA"; });
  return g;
}

export function rollupItems(posture: Record<string, PostureStatus>): RollupItem[] {
  return Object.entries(posture)
    .filter(([k, v]) => (v === "ATTENTION" || v === "BREACH") && ROLLUP_LABELS[k])
    .map(([k, v]) => ({
      cell: k,
      label: ROLLUP_LABELS[k],
      severity: v === "BREACH" ? "HIGH" : "MED",
    }));
}
