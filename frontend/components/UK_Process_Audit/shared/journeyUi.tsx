import {
  CheckCircle2,
  Clock,
  MinusCircle,
  UserRound,
  XCircle,
} from "lucide-react";
import type { UkControlStatus, UkTrailStatus } from "@/lib/UK_Process_Audit/types";

/** Colour a compliance / pass-rate percentage. */
export function ComplianceCell({ v }: { v: number }) {
  const cls = v >= 95 ? "text-emerald-700" : v >= 90 ? "text-amber-700" : "text-red-700";
  return <span className={`font-semibold tabular-nums ${cls}`}>{v.toFixed(1)}%</span>;
}

const STATUS_BADGE: Record<UkControlStatus, { label: string; cls: string }> = {
  effective: { label: "Effective", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "needs-attention": { label: "Needs attention", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  deficient: { label: "Deficient", cls: "bg-red-50 text-red-700 ring-red-200" },
  "not-tested": { label: "Not tested", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export function StatusBadge({ status }: { status: UkControlStatus }) {
  const s = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

const HEALTH: Record<"ok" | "attention" | "critical", { cls: string; label: string }> = {
  ok: { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Clean" },
  attention: { cls: "bg-amber-50 text-amber-700 ring-amber-200", label: "Attention" },
  critical: { cls: "bg-red-50 text-red-700 ring-red-200", label: "Miss" },
};

export function StageHealthPill({ health }: { health: "ok" | "attention" | "critical" }) {
  const s = HEALTH[health];
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

const AUDIT_PILL: Record<"compliant" | "exception" | "critical", { cls: string; label: string }> = {
  compliant: { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Completed" },
  exception: { cls: "bg-amber-50 text-amber-700 ring-amber-200", label: "Exception" },
  critical: { cls: "bg-red-50 text-red-700 ring-red-200", label: "Critical" },
};

export function JourneyAuditPill({ category }: { category: "compliant" | "exception" | "critical" }) {
  const s = AUDIT_PILL[category];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function Avatar({ name }: { name?: string | null }) {
  if (!name) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <UserRound className="h-3.5 w-3.5" />
      </div>
    );
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-semibold text-white ring-1 ring-slate-300">
      {initials}
    </div>
  );
}

/** One cell in the journey matrix. Accepted/rejected cells are clickable. */
export function JourneyStageCell({
  status,
  stageName,
  onSelect,
  isSelected,
}: {
  status: UkTrailStatus;
  stageName: string;
  onSelect?: () => void;
  isSelected?: boolean;
}) {
  const title = `${stageName} — ${status}`;
  const clickable = (status === "accepted" || status === "rejected") && Boolean(onSelect);
  const selectRing = isSelected ? "ring-2 ring-indigo-500 ring-offset-1" : "ring-1";
  const hoverRing = clickable && !isSelected ? "hover:ring-2 hover:ring-indigo-300" : "";

  const inner =
    status === "accepted" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.25} />
    ) : status === "rejected" ? (
      <XCircle className="h-4 w-4 text-red-600" strokeWidth={2.25} />
    ) : status === "pending" ? (
      <span className="text-[11px] font-bold text-sky-700">R</span>
    ) : (
      <MinusCircle className="h-4 w-4 text-slate-400" strokeWidth={2} />
    );

  const tone =
    status === "accepted"
      ? "bg-emerald-50 ring-emerald-200"
      : status === "rejected"
        ? "bg-red-50 ring-red-200"
        : status === "pending"
          ? "bg-sky-50 ring-sky-200"
          : "bg-slate-100 ring-slate-200";

  const className = `inline-flex h-8 w-8 items-center justify-center rounded-md ${selectRing} ${hoverRing} ${tone} ${clickable ? "cursor-pointer" : ""}`;

  if (clickable) {
    return (
      <button
        type="button"
        title={`${title} — click for stage detail`}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        aria-pressed={isSelected}
      >
        {inner}
      </button>
    );
  }
  return (
    <div title={title} className={className}>
      {inner}
    </div>
  );
}

export const TRAIL_STATUS_CHIP: Record<
  UkTrailStatus,
  { bg: string; fg: string; ring: string; label: string; icon: typeof CheckCircle2 }
> = {
  accepted: { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200", label: "Evidence accepted", icon: CheckCircle2 },
  rejected: { bg: "bg-red-50", fg: "text-red-700", ring: "ring-red-200", label: "Failed — rejected", icon: XCircle },
  pending: { bg: "bg-amber-50", fg: "text-amber-700", ring: "ring-amber-200", label: "Evidence pending", icon: Clock },
  blocked: { bg: "bg-slate-50", fg: "text-slate-500", ring: "ring-slate-200", label: "Blocked — upstream", icon: MinusCircle },
};

export function StageStatusChip({ status }: { status: UkTrailStatus }) {
  const s = TRAIL_STATUS_CHIP[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ${s.bg} ${s.fg} ${s.ring}`}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}
