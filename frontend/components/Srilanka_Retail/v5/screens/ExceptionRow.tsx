"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ComplianceException } from "@/lib/Srilanka_Retail/v5/types";
import { useKeystoneV5Colors } from "../theme/KeystoneV5ThemeProvider";
import { Chip } from "../primitives/ui";

export function ExceptionRow({ exc }: { exc: ComplianceException }) {
  const C = useKeystoneV5Colors();
  const cured = exc.status === "CURED";
  return (
    <div className="rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${cured ? C.greenEdge : C.redEdge}` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-[11px] font-semibold" style={{ color: C.faint }}>{exc.ruleRef}</span>
          <span className="text-[13px]" style={{ color: C.text }}>{exc.title}</span>
          <Chip tag={exc.tag} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium line-through"
            style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}
          >
            {exc.gap}
          </span>
          <ArrowRight size={13} color={C.faint} />
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}
          >
            <CheckCircle2 size={12} /> Cured · compliant
          </span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-[11px] sm:grid-cols-2" style={{ color: C.faint }}>
        <div>
          Disclosure: <span style={{ color: C.dim }}>{exc.disclosureRef}</span>
        </div>
        <div>
          Cure: <span style={{ color: C.dim }}>{exc.cure}</span>
        </div>
        <div>
          Raised: <span style={{ color: C.dim }}>{exc.raisedOn}</span>
        </div>
        <div>
          Cured: <span style={{ color: C.dim }}>{exc.curedOn}</span>
        </div>
      </div>
    </div>
  );
}
