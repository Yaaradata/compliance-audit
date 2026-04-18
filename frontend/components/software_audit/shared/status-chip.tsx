import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export type ControlStatus = "met" | "not_met" | "requires_review";

const STATUS_STYLES: Record<
  ControlStatus,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    solid: string;
    icon: ReactNode;
    label: string;
    gradient: string;
  }
> = {
  met: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    solid: "bg-emerald-600",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Met",
    gradient: "from-emerald-500 to-teal-500",
  },
  not_met: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    solid: "bg-rose-600",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Not Met",
    gradient: "from-rose-500 to-red-500",
  },
  requires_review: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    solid: "bg-amber-600",
    icon: <CircleAlert className="h-3.5 w-3.5" />,
    label: "Requires Review",
    gradient: "from-amber-500 to-orange-500",
  },
};

export function statusStyles(status: ControlStatus) {
  return STATUS_STYLES[status];
}

export default function StatusChip({
  status,
  size = "sm",
  withIcon = true,
}: {
  status: ControlStatus;
  size?: "sm" | "md";
  withIcon?: boolean;
}) {
  const s = STATUS_STYLES[status];
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${pad} ${s.bg} ${s.text} ${s.border}`}
    >
      {withIcon ? s.icon : <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {s.label}
    </span>
  );
}

export { STATUS_STYLES };
