"use client";

import { CategoryTileGrid } from "@/components/UKBankingAudit/v5/CategoryTileGrid";
import type { RiskDomainV4 } from "@/components/UKBankingAudit/v5/types";

type Props = {
  domains: RiskDomainV4[];
  expandedId: string | null;
  onToggle: (id: string) => void;
};

/**
 * CRO nine-domain category zone.
 * Uses the same outer panel boundary as the Board Signals zone.
 */
export function RiskCategoriesPanel({ domains, expandedId, onToggle }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
      <CategoryTileGrid
        domains={domains}
        expandedId={expandedId}
        onToggle={onToggle}
      />
    </section>
  );
}
