/**
 * @deprecated Import from `kpiVisualSemantics` / `kpiMetricSpec` instead.
 * Re-exports kept for any legacy imports.
 */
export {
  isImprovingTrend as isImprovingDirection,
  kpiPolarity as kpiMetricPolarity,
  resolveWowArrow,
  trendColorsForDirection as colorsForDirection,
  kpiSparklineStrokeColor,
  kpiWowArrowVisual,
} from './kpiVisualSemantics';

export type { KpiTrendColors } from './kpiVisualSemantics';
