import type {
  UkAutomationLevel,
  UkControlNature,
  UkControlStatus,
  UkResidualRisk,
} from "@/lib/UK_Process_Audit/types";

const RESIDUAL_TONE: Record<UkResidualRisk, { chip: string; dot: string; hex: string }> = {
  Critical: { chip: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500", hex: "#ef4444" },
  High: { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", hex: "#f59e0b" },
  Medium: { chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500", hex: "#0ea5e9" },
  Low: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", hex: "#10b981" },
};

const STATUS_TONE: Record<UkControlStatus, { label: string; chip: string }> = {
  effective: { label: "Effective", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "needs-attention": { label: "Needs attention", chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  deficient: { label: "Deficient", chip: "bg-red-50 text-red-700 ring-red-200" },
  "not-tested": { label: "Not tested", chip: "bg-slate-100 text-slate-500 ring-slate-200" },
};

const NATURE_TONE: Record<UkControlNature, string> = {
  Preventive: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Detective: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Corrective: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
};

const AUTOMATION_TONE: Record<UkAutomationLevel, string> = {
  Automated: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Semi-automated": "bg-sky-50 text-sky-700 ring-sky-200",
  Manual: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function residualHex(risk: UkResidualRisk): string {
  return RESIDUAL_TONE[risk].hex;
}
export function residualDot(risk: UkResidualRisk): string {
  return RESIDUAL_TONE[risk].dot;
}

export function ResidualPill({ risk }: { risk: UkResidualRisk }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${RESIDUAL_TONE[risk].chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${RESIDUAL_TONE[risk].dot}`} aria-hidden />
      {risk}
    </span>
  );
}

export function StatusPill({ status }: { status: UkControlStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone.chip}`}
    >
      {tone.label}
    </span>
  );
}

export function NaturePill({ nature }: { nature: UkControlNature }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${NATURE_TONE[nature]}`}
    >
      {nature}
    </span>
  );
}

export function AutomationPill({ level }: { level: UkAutomationLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${AUTOMATION_TONE[level]}`}
    >
      {level}
    </span>
  );
}
