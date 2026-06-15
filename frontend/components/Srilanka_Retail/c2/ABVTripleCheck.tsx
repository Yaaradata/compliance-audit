import type { AbvTriple, Tagged } from "@/lib/Srilanka_Retail/types";
import { SourceChip, NUM } from "../primitives";

function AbvCell({ name, reading }: { name: string; reading: Tagged<number> }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{name}</span>
      <span className={`text-2xl font-semibold text-slate-100 ${NUM}`}>
        {reading.value.toFixed(1)}
        <span className="ml-1 text-xs text-slate-500">% ABV</span>
      </span>
      <SourceChip tag={reading.sourceTag} className="self-start" />
    </div>
  );
}

/**
 * Three ABV readings (lab / label / excise) compared against tolerance.
 * A mismatch beyond tolerance renders amber — the gate it drives is attention,
 * not a rupees-at-risk event, so no red here.
 */
export function ABVTripleCheck({
  abv,
  tolerance,
  reconciled,
  mismatchDelta,
}: {
  abv: AbvTriple;
  tolerance: number;
  reconciled: boolean;
  mismatchDelta: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <AbvCell name="Lab" reading={abv.lab} />
        <AbvCell name="Label" reading={abv.label} />
        <AbvCell name="Excise" reading={abv.excise} />
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${
          reconciled
            ? "border-emerald-800/70 bg-emerald-950/30"
            : "border-amber-800/70 bg-amber-950/30"
        }`}
      >
        <span className="text-xs text-slate-400">
          Tolerance ±<span className={NUM}>{tolerance.toFixed(1)}</span> · Δ{" "}
          <span className={NUM}>{mismatchDelta.toFixed(1)}</span>
        </span>
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            reconciled ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {reconciled ? "Within tolerance" : "Mismatch — outside tolerance"}
        </span>
      </div>
    </div>
  );
}
