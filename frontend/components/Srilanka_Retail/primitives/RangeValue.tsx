import type { Range } from "@/lib/Srilanka_Retail/types";
import { formatNumberRange, formatRupeeRange } from "@/lib/Srilanka_Retail/format";
import { NUM } from "./tokens";

export function RangeValue({
  range,
  kind = "number",
  unit,
  className = "",
}: {
  range: Range;
  kind?: "rupee" | "number";
  unit?: string;
  className?: string;
}) {
  const text = kind === "rupee" ? formatRupeeRange(range) : formatNumberRange(range);
  return (
    <span className={`${NUM} ${className}`}>
      {text}
      {unit ? <span style={{ color: "var(--ks-faint)" }}> {unit}</span> : null}
    </span>
  );
}
