import React, { type ReactElement, type ReactNode } from "react";

export type SummaryAccent =
  | "neutral"
  | "red"
  | "orange"
  | "clean"
  | "indigo"
  | "amber";

const ICON_STYLES: Record<SummaryAccent, string> = {
  neutral: "bg-slate-100 text-slate-600",
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600",
  clean: "bg-emerald-100 text-emerald-600",
  indigo: "bg-indigo-100 text-indigo-600",
  amber: "bg-amber-100 text-amber-700",
};

const BAR_STYLES: Record<SummaryAccent, string> = {
  neutral: "from-slate-400 to-slate-500",
  red: "from-rose-500 to-orange-500",
  orange: "from-amber-500 to-orange-500",
  clean: "from-emerald-500 to-teal-500",
  indigo: "from-indigo-500 to-violet-500",
  amber: "from-amber-500 to-orange-500",
};

export default function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent = "neutral",
}: {
  icon: ReactElement<{ className?: string }>;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: SummaryAccent;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/90 p-4 shadow-md shadow-indigo-950/5 ring-1 ring-white/50 backdrop-blur-sm transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90 ${BAR_STYLES[accent]}`}
        aria-hidden
      />
      <div className="mb-3 flex items-center justify-between pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/55">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${ICON_STYLES[accent]}`}
        >
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs font-medium text-slate-500">{sub}</div>
      )}
    </div>
  );
}
