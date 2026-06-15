import type { SourceTag } from "@/lib/Srilanka_Retail/types";
import { SOURCE_DOT, SOURCE_LABEL } from "./tokens";

const ORDER: SourceTag[] = ["SOURCED", "ASSUMPTION", "ILLUSTRATIVE", "OPEN"];

const NOTE: Record<SourceTag, string> = {
  SOURCED: "From a system of record",
  ASSUMPTION: "Working assumption for the model",
  ILLUSTRATIVE: "Derived / illustrative figure",
  OPEN: "Open range — not yet pinned",
};

/**
 * Provenance legend. Explains the dot colours used by every <SourceChip>.
 */
export function ProvenanceFootnote() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 text-[11px] text-slate-500">
      <span className="font-semibold uppercase tracking-wide text-slate-400">
        Provenance
      </span>
      {ORDER.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT[tag]}`} aria-hidden />
          <span className="text-slate-300">{SOURCE_LABEL[tag]}</span>
          <span className="text-slate-600">— {NOTE[tag]}</span>
        </span>
      ))}
    </div>
  );
}
