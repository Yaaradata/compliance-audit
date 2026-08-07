"use client";

type Props = {
  trend?: string;
  delta?: number;
};

export function TrendMarker({ trend, delta }: Props) {
  const arrow =
    trend === "worsening" || trend === "up" ? "↗" : trend === "improving" || trend === "down" ? "↘" : "→";
  const tone =
    trend === "worsening" || trend === "up"
      ? "text-red-600"
      : trend === "improving" || trend === "down"
        ? "text-emerald-600"
        : "text-slate-500";
  const label =
    typeof delta === "number" ? (delta > 0 ? `+${delta}` : `${delta}`) : "0";

  return (
    <span className={`text-[13px] font-semibold tabular-nums ${tone}`}>
      {arrow} {label}
    </span>
  );
}
