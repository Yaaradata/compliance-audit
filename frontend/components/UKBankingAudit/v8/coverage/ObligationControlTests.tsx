"use client";

import { useMemo } from "react";
import { buildSmfRiskView } from "@/lib/ukbankingaudit/v8/reasonableStepsView";
import { OwnedControlsList } from "../smcr/SmfRiskCards";
import { useRiskState } from "../useRiskStore";

/** v8 addition to the obligation drawer: test status of each mapped control. */
export function ObligationControlTests({ controlIds }: { controlIds: string[] }) {
  const { data } = useRiskState();
  const rows = useMemo(
    () => buildSmfRiskView("", controlIds, data.config.currentPeriod, data).controls,
    [controlIds, data],
  );
  return (
    <section className="mt-5">
      <h3 className="text-sm font-semibold text-slate-900">Mapped control testing</h3>
      {rows.length === 0 ? (
        <p className="mt-1 text-xs text-slate-600">No controls are mapped to this obligation.</p>
      ) : (
        <OwnedControlsList rows={rows} />
      )}
    </section>
  );
}
