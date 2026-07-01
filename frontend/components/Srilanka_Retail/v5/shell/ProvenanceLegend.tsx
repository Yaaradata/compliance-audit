"use client";

import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";

export function ProvenanceLegend() {
  const C = useKeystoneV5Colors();
  return (
    <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] leading-relaxed" style={{ color: C.faint }}>
      Figures carry their provenance; most are now sourced.
      <span className="inline-flex items-center gap-1">
        <span style={{ color: C.green }}>●</span> Sourced / verified
      </span>
      <span className="inline-flex items-center gap-1">
        <span style={{ color: C.amber }}>●</span> Illustrative
      </span>
      <span className="inline-flex items-center gap-1">
        <span style={{ color: C.faint }}>●</span> Assumption / validate
      </span>
      <span className="inline-flex items-center gap-1">
        <span style={{ color: C.open }}>●</span> Open range
      </span>
    </p>
  );
}
