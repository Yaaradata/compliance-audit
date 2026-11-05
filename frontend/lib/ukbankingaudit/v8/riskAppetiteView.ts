/** Risk Appetite tab figures: one row per metric, all derived from v8 records. */
import { categoryLabel } from "./config";
import { computeRamStatus, previousPeriod, V8_ENGINE_DATA, type EngineData } from "./engine";
import type { PathToGreenRecord, Period, RatingColour } from "./types";

export type RamTrend = "worse" | "better" | "flat";

export type RamRow = {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  owner: string;
  unit: string;
  value: number;
  valueText: string;
  limitText: string;
  toleranceText: string;
  status: RatingColour;
  trend: RamTrend;
  /** Monthly values, oldest first. */
  series: { period: Period; value: number }[];
  path: PathToGreenRecord | null;
  forNextBoardRiskCommittee: boolean;
};

const STATUS_ORDER: Record<RatingColour, number> = { red: 0, amber: 1, green: 2 };

/** "3 open", "2.3%", "4,380 cases". */
export function formatRamValue(value: number, unit: string): string {
  const text = value.toLocaleString("en-GB");
  if (unit === "%") return `${text}%`;
  return `${text} ${unit}`;
}

/** A limit reads as a bare number on non-percentage metrics: "3 open vs limit 0". */
function thresholdText(value: number, unit: string): string {
  const text = value.toLocaleString("en-GB");
  return unit === "%" ? `${text}%` : text;
}

export function buildRamRows(
  period: Period = V8_ENGINE_DATA.config.currentPeriod,
  data: EngineData = V8_ENGINE_DATA,
): RamRow[] {
  const previous = previousPeriod(period, data.config);
  return data.rams
    .flatMap((ram): RamRow[] => {
      const values = data.ramValues.filter((v) => v.ramId === ram.id && v.period <= period);
      const current = values.find((v) => v.period === period);
      if (!current) return [];
      const before = values.find((v) => v.period === previous)?.value;
      const moved = before === undefined ? 0 : current.value - before;
      const worse = ram.direction === "higherIsWorse" ? moved > 0 : moved < 0;
      const status = computeRamStatus(ram, current.value);
      return [
        {
          id: ram.id,
          name: ram.name,
          categoryId: ram.categoryId,
          categoryLabel: categoryLabel(ram.categoryId, data.config),
          owner: ram.owner,
          unit: ram.unit,
          value: current.value,
          valueText: formatRamValue(current.value, ram.unit),
          limitText: thresholdText(ram.limit, ram.unit),
          toleranceText: thresholdText(ram.tolerance, ram.unit),
          status,
          trend: moved === 0 ? "flat" : worse ? "worse" : "better",
          series: values.map((v) => ({ period: v.period, value: v.value })),
          path: data.pathsToGreen.find((p) => p.targetType === "ram" && p.targetId === ram.id) ?? null,
          forNextBoardRiskCommittee: status === "red",
        },
      ];
    })
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        a.categoryLabel.localeCompare(b.categoryLabel) ||
        a.name.localeCompare(b.name),
    );
}
