/** RCSA Coverage figures: refresh cycle note and the major gaps tracker. */
import { formatDate } from "./boardView";
import { V8_CONFIG, type V8Config } from "./config";
import { MAJOR_GAP_PLANS, type MajorGapStatus } from "./data/majorGaps";

type ObligationRecord = {
  id: string;
  citationShort: string;
  regulator: string;
  linkedControlIds: string[];
  accountableSMFId: string;
  ocs?: { coverageStatus?: string };
};

type SmfRecord = { id: string; name: string; smfFunction: string };

export type MajorGapRow = {
  obligationId: string;
  citation: string;
  regulator: string;
  controlCount: number;
  coverage: "Thinly covered" | "Uncovered";
  owner: string;
  action: string | null;
  targetDate: string | null;
  status: MajorGapStatus | null;
};

/** "Mapping refreshed on the RCSA cycle · last: 30 Jun 2026 · next: 31 Dec 2026". */
export function rcsaCycleNote(config: V8Config = V8_CONFIG): string {
  const { lastRefresh, nextRefresh } = config.rcsaCycle;
  return `Mapping refreshed on the RCSA cycle · last: ${formatDate(lastRefresh)} · next: ${formatDate(nextRefresh)}`;
}

/** Every obligation not fully covered. Those with no control at all come first. */
export function buildMajorGaps(obligations: ObligationRecord[], smfHolders: SmfRecord[]): MajorGapRow[] {
  return obligations
    .filter((o) => o.ocs?.coverageStatus !== "fully_covered")
    .map((obligation): MajorGapRow => {
      const plan = MAJOR_GAP_PLANS.find((p) => p.obligationId === obligation.id);
      const holder = smfHolders.find((h) => h.id === obligation.accountableSMFId);
      const controlCount = obligation.linkedControlIds.length;
      return {
        obligationId: obligation.id,
        citation: obligation.citationShort,
        regulator: obligation.regulator,
        controlCount,
        coverage: controlCount === 0 ? "Uncovered" : "Thinly covered",
        owner: holder ? `${holder.smfFunction} · ${holder.name}` : "Not allocated",
        action: plan?.action ?? null,
        targetDate: plan?.targetDate ?? null,
        status: plan?.status ?? null,
      };
    })
    .sort(
      (a, b) =>
        Number(b.controlCount === 0) - Number(a.controlCount === 0) ||
        (a.targetDate ?? "").localeCompare(b.targetDate ?? "") ||
        a.citation.localeCompare(b.citation),
    );
}
