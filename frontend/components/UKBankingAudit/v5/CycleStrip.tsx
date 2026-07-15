"use client";

import { DOMAIN_HISTORY } from "@/lib/ukbankingaudit/v5/riskDomainsV5";
import { RAG_STYLES } from "./ragTokens";

/**
 * A PRESENCE STRIP: 12 cells, one per board cycle, oldest left. Each cell is the
 * RAG dot for the status at that review. This is NOT a heat map — no colour scale,
 * no gradient. It exists because v4's `delta: 0` cannot say "amber for seven cycles".
 */
export function CycleStrip({ domainId }: { domainId: string }) {
  const history = DOMAIN_HISTORY.find((h) => h.domainId === domainId);
  if (!history) return null;

  return (
    <div className="flex items-center gap-0.5" aria-label="Status by board cycle, oldest first">
      {history.cycles.map((cycle, i) => {
        const band = cycle.status === "RED" ? "red" : cycle.status === "AMBER" ? "amber" : "green";
        return (
          <span
            key={`${cycle.reviewDate}-${i}`}
            className={`h-1.5 w-1.5 rounded-full ${RAG_STYLES[band].dot}`}
            title={`${cycle.reviewDate} · ${cycle.status}`}
          />
        );
      })}
    </div>
  );
}
