/** SVG viewBox width for KRI tile sparklines. */
export const KRI_SPARKLINE_WIDTH = 240;

/** Compact sparkline height — sits close under the value row. */
export const KRI_SPARKLINE_HEIGHT = 40;

export type KriSparklineScale = {
  min: number;
  max: number;
  amberY: number | null;
  redY: number | null;
};

/**
 * Y domain anchored on observed data so flat series (e.g. 520 UCICs) fill the chart.
 * Threshold lines are drawn only when they fall inside the padded domain.
 */
export function buildKriSparklineScale(
  data: number[],
  thresholds: { amber: number; red: number },
  height: number = KRI_SPARKLINE_HEIGHT,
): KriSparklineScale {
  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  const span = dataMax - dataMin;
  const pad = Math.max(span * 0.15, Math.abs(dataMax) * 0.04, 0.5);

  const min = dataMin - pad;
  const max = dataMax + pad;
  const range = max - min || 1;
  const plotH = height - 4;

  const yFor = (v: number) => height - ((v - min) / range) * plotH - 2;

  const inRange = (y: number) => y >= 2 && y <= height - 2;

  const amberY = thresholds.amber >= min && thresholds.amber <= max ? yFor(thresholds.amber) : null;
  const redY = thresholds.red >= min && thresholds.red <= max ? yFor(thresholds.red) : null;

  return {
    min,
    max,
    amberY: amberY != null && inRange(amberY) ? amberY : null,
    redY: redY != null && inRange(redY) ? redY : null,
  };
}
