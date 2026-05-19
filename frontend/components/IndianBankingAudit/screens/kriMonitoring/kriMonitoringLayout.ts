/** How many KRI grid rows the AI wall should span (same vertical plane). */
export const KRI_DASHBOARD_LAYER_COUNT = 3;

/** Dashboard grid: title row 1 · cards + wall share row 2. */
export const KRI_DASHBOARD_GRID_CLASS =
  'grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_min(20rem,22rem)] xl:items-start xl:gap-x-6';

export const KRI_DASHBOARD_TITLE_CELL = 'xl:col-start-1 xl:row-start-1';
export const KRI_DASHBOARD_GRID_CELL = 'min-w-0 xl:col-start-1 xl:row-start-2';
/** Wall aligns to top of the KRI grid row; height set from measured 3-layer stack. */
export const KRI_DASHBOARD_WALL_CELL =
  'flex min-h-0 min-w-0 shrink-0 flex-col xl:col-start-2 xl:row-start-2 xl:self-start';
