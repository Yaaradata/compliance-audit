import type { ReactNode } from "react";
import type { SourceTag } from "@/lib/Srilanka_Retail/types";
import { SourceChip, NUM } from "../primitives";

export function MetricCard({
  label,
  tag,
  primary,
  children,
}: {
  label: string;
  tag: SourceTag;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-3.5"
      style={{ background: "var(--ks-panel-alt)", border: "1px solid var(--ks-border-soft)" }}
    >
      <div className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
        {label}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span
          className={`${NUM} font-semibold tracking-tight ${primary ? "text-xl" : "text-base"}`}
        >
          {children}
        </span>
        <SourceChip tag={tag} />
      </div>
    </div>
  );
}
