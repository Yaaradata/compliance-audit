import type { LiveState } from "@/lib/Srilanka_Retail/types";
import { KS } from "./palette";

/** LIVE vs PILOT — exact badge styling from reference JSX. */
export function LivePilotBadge({
  liveState,
  gapRef,
  className = "",
}: {
  liveState: LiveState;
  gapRef?: string;
  className?: string;
}) {
  if (liveState === "LIVE") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${className}`}
        style={{
          background: KS.greenDim,
          color: KS.green,
          border: `1px solid ${KS.greenEdge}`,
        }}
      >
        Live
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${className}`}
      style={{
        background: KS.accentDim,
        color: KS.accent,
        border: `1px solid ${KS.accentEdge}`,
      }}
      title={gapRef ? `Pilot-gated (${gapRef})` : "Pilot-gated"}
    >
      ◌ PILOT{gapRef ? ` · ${gapRef}` : ""}
    </span>
  );
}
