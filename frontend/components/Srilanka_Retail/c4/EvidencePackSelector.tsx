"use client";

import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { getRegulator } from "@/lib/Srilanka_Retail/derivations";
import { NUM } from "../primitives";

/**
 * Regulator selector for the evidence packs. Item counts read from the store, so
 * the EXCISE count increments live once the C1 reconciliation item is appended.
 */
export function EvidencePackSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (regulatorId: string) => void;
}) {
  const packs = useKeystoneStore((s) => s.evidencePacks);
  const data = useKeystoneStore((s) => s);

  return (
    <div className="flex flex-col gap-2">
      {packs.map((pack) => {
        const reg = getRegulator(data, pack.regulatorId);
        const active = pack.regulatorId === selectedId;
        return (
          <button
            key={pack.regulatorId}
            type="button"
            onClick={() => onSelect(pack.regulatorId)}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
              active
                ? "border-sky-500/60 bg-sky-950/30"
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">{reg?.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                {pack.readyState}
              </span>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${NUM} ${
                active ? "bg-sky-500/20 text-sky-200" : "bg-slate-800 text-slate-400"
              }`}
            >
              {pack.items.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
