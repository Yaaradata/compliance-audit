"use client";

import { FileCheck2 } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { getEvidencePack, getRegulator } from "@/lib/Srilanka_Retail/derivations";
import { SourceChip } from "../primitives";
import { EvidencePackItemRow } from "./EvidencePackItemRow";

/** Id of the runtime-appended C1 reconciliation item (highlighted when present). */
const C1_RECONCILE_ITEM_ID = "ep-excise-c1-recon";

/**
 * Assembled evidence pack for the selected regulator. When the EXCISE pack is
 * shown after the C1 reconcile, the appended four-way item appears here — this
 * is the C1 → C4 ripple.
 */
export function EvidencePackAssembler({ regulatorId }: { regulatorId: string }) {
  const data = useKeystoneStore((s) => s);
  const pack = getEvidencePack(data, regulatorId);
  const reg = getRegulator(data, regulatorId);

  if (!pack || !reg) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="h-5 w-5 text-sky-300" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-100">{reg.label}</span>
            <span className="text-xs text-slate-500">Evidence pack · {pack.items.length} artefacts</span>
          </div>
        </div>
        <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          {pack.readyState}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {pack.items.map((item) => (
          <EvidencePackItemRow
            key={item.id}
            item={item}
            isNew={item.id === C1_RECONCILE_ITEM_ID}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
        <span className="text-xs text-slate-500">Prep baseline: {pack.prepBaseline.value}</span>
        <SourceChip tag={pack.prepBaseline.sourceTag} />
      </div>
    </div>
  );
}
