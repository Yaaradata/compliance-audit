'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { KRI_DASHBOARD_LAYER_COUNT } from './kriMonitoringLayout';

function getGridColumnCount(gridEl: HTMLElement): number {
  const template = getComputedStyle(gridEl).gridTemplateColumns;
  if (!template || template === 'none') return 1;
  return template.split(' ').filter((s) => s.trim().length > 0).length;
}

/**
 * Measures from the top of the first KRI tile to the bottom of the last tile
 * in the first N grid rows (3 layers × current column count).
 */
export function useKriThreeLayerHeight(layerCount = KRI_DASHBOARD_LAYER_COUNT) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState<number | undefined>();

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const measure = () => {
      const cards = grid.querySelectorAll<HTMLElement>('[data-ori-kri-card]');
      if (!cards.length) return;

      const cols = getGridColumnCount(grid);
      const lastIndex = Math.min(cols * layerCount - 1, cards.length - 1);
      const first = cards[0];
      const last = cards[lastIndex];
      const top = first.getBoundingClientRect().top;
      const bottom = last.getBoundingClientRect().bottom;
      const next = Math.round(bottom - top);
      if (next > 0) setHeightPx((prev) => (prev === next ? prev : next));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    grid.querySelectorAll('[data-ori-kri-card]').forEach((el) => ro.observe(el));

    return () => ro.disconnect();
  }, [layerCount]);

  return { gridRef, heightPx };
}
