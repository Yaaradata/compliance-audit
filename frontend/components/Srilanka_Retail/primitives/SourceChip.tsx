import type { SourceTag } from "@/lib/Srilanka_Retail/types";
import { SOURCE_DOT, SOURCE_LABEL } from "./tokens";
import { KS } from "./palette";

export function SourceChip({
  tag,
  className = "",
}: {
  tag: SourceTag;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${className}`}
      style={{
        background: KS.chipBg,
        border: `1px solid ${KS.borderSoft}`,
        color: KS.dim,
      }}
      title={`Provenance: ${SOURCE_LABEL[tag]}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: SOURCE_DOT[tag] }}
        aria-hidden
      />
      {SOURCE_LABEL[tag]}
    </span>
  );
}
