import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Control, PostureCell, Regulator } from "@/lib/Srilanka_Retail/types";
import {
  REGULATOR_SHORT_LABEL,
  buildPostureDisplayGrid,
  type PostureDisplayStatus,
} from "@/lib/Srilanka_Retail/postureDisplay";
import { KS } from "../primitives/palette";

const HERO_CELL_ID = "pg-excise-duty";

function cellStyle(status: PostureDisplayStatus) {
  if (status === "NA") {
    return {
      background: "transparent",
      border: KS.borderSoft,
      color: "transparent",
    };
  }
  if (status === "OK") {
    return { background: KS.greenDim, border: KS.greenEdge, color: KS.green };
  }
  if (status === "ATTENTION") {
    return { background: KS.amberDim, border: KS.amberEdge, color: KS.amber };
  }
  return { background: KS.redDim, border: KS.redEdge, color: KS.red };
}

/**
 * Regulator × control heat map — reference JSX table layout with NA blanks,
 * short column headers, and live store status on in-scope cells.
 */
export function PostureGridTable({
  regulators,
  controls,
  postureGrid,
}: {
  regulators: Regulator[];
  controls: Control[];
  postureGrid: PostureCell[];
}) {
  const rows = buildPostureDisplayGrid(regulators, controls, postureGrid);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] table-fixed border-collapse text-[12px]">
        <colgroup>
          <col style={{ width: "88px" }} />
          {regulators.map((reg) => (
            <col key={reg.id} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="p-2 text-left font-medium" style={{ color: KS.faint }} />
            {regulators.map((reg) => (
              <th
                key={reg.id}
                className="p-2 text-center text-[11px] font-medium"
                style={{ color: KS.dim }}
              >
                {REGULATOR_SHORT_LABEL[reg.key] ?? reg.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {controls.map((ctrl, rowIdx) => (
            <tr key={ctrl.id}>
              <td className="p-2 text-left font-medium" style={{ color: KS.dim }}>
                {ctrl.label}
              </td>
              {rows[rowIdx].map((cell) => {
                const style = cellStyle(cell.displayStatus);
                const highlight =
                  cell.postureCellId === HERO_CELL_ID && cell.displayStatus === "ATTENTION";
                return (
                  <td key={cell.regulatorId} className="p-1.5">
                    <div
                      className="mx-auto flex h-7 w-full items-center justify-center rounded"
                      style={{
                        background: style.background,
                        border: `1px solid ${style.border}`,
                        boxShadow: highlight ? `0 0 0 2px ${KS.amber}` : undefined,
                      }}
                    >
                      {cell.displayStatus !== "NA" &&
                        (cell.displayStatus === "OK" ? (
                          <CheckCircle2 size={13} style={{ color: style.color }} />
                        ) : (
                          <AlertTriangle size={13} style={{ color: style.color }} />
                        ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
