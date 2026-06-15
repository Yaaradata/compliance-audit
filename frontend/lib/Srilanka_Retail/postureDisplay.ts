/**
 * C5 posture heat-map display (reference JSX wireframe).
 *
 * The JSX sparse grid marks cells not in scope as NA (empty dark cell, no icon).
 * Live status for in-scope cells still comes from postureGrid in the store.
 */
import type { Control, PostureCell, PostureStatus, Regulator } from "./types";

/** Short column headers — exact labels from reference JSX REGULATORS array. */
export const REGULATOR_SHORT_LABEL: Record<string, string> = {
  EXCISE: "Excise",
  SLSI: "SLSI",
  FCAU: "FCAU",
  CUSTOMS: "Customs",
  CEA: "CEA",
  LABOUR: "Labour",
};

/** Cells left blank in the reference wireframe (regulatorKey|controlKey). */
const NA_CELLS = new Set([
  "SLSI|DUTY",
  "SLSI|DISPATCH",
  "FCAU|DUTY",
  "FCAU|DISPATCH",
  "CEA|DUTY",
  "CEA|QUALITY",
  "CEA|DISPATCH",
  "LABOUR|DUTY",
  "LABOUR|QUALITY",
  "LABOUR|DISPATCH",
  "CUSTOMS|QUALITY",
]);

export type PostureDisplayStatus = PostureStatus | "NA";

export interface PostureDisplayCell {
  regulatorId: string;
  controlId: string;
  regulatorKey: string;
  controlKey: string;
  displayStatus: PostureDisplayStatus;
  postureCellId?: string;
}

export function buildPostureDisplayGrid(
  regulators: Regulator[],
  controls: Control[],
  postureGrid: PostureCell[],
): PostureDisplayCell[][] {
  return controls.map((ctrl) =>
    regulators.map((reg) => {
      const composite = `${reg.key}|${ctrl.key}`;
      const storeCell = postureGrid.find(
        (c) => c.regulatorId === reg.id && c.controlId === ctrl.id,
      );

      const displayStatus: PostureDisplayStatus = NA_CELLS.has(composite)
        ? "NA"
        : (storeCell?.status ?? "OK");

      return {
        regulatorId: reg.id,
        controlId: ctrl.id,
        regulatorKey: reg.key,
        controlKey: ctrl.key,
        displayStatus,
        postureCellId: storeCell?.id,
      };
    }),
  );
}
