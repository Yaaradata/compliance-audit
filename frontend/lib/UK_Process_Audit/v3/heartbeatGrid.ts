/**
 * Heartbeat grid — presence map of last 12 expected operations × 104 controls.
 * Three cell states only: FILLED | EMPTY | HATCHED. No colour scale.
 */
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import {
  buildDetectorSnapshot,
  runAllDetectors,
  type UkExpectedOperation,
  type UkSignal,
} from "@/lib/UK_Process_Audit/signals";
import type { UkAuditControl, UkProcessAuditDomainId } from "@/lib/UK_Process_Audit/types";

const AS_OF = "2026-06-30";
const PERIODS = 12;

export type HeartbeatCellState = "FILLED" | "EMPTY" | "HATCHED";

export type HeartbeatCell = {
  controlId: string;
  periodIndex: number;
  expectedBy: string;
  state: HeartbeatCellState;
  /** Investigation id when the cell represents a finding (EMPTY → silence signal). */
  signalId: string | null;
};

export type HeartbeatControlRow = {
  controlId: string;
  domainCode: UkProcessAuditDomainId;
  cells: HeartbeatCell[];
};

export type HeartbeatDomainGroup = {
  domainCode: UkProcessAuditDomainId;
  domainLabel: string;
  rows: HeartbeatControlRow[];
};

export type HeartbeatGrid = {
  asOf: string;
  periodHeaders: string[];
  groups: HeartbeatDomainGroup[];
  /** Flat count — must be 104. */
  controlCount: number;
};

function cellState(op: UkExpectedOperation | undefined): HeartbeatCellState {
  if (!op || op.cadenceSource !== "human-confirmed") return "HATCHED";
  if (op.evidenceArtefactIds.length > 0) return "FILLED";
  return "EMPTY";
}

function signalIdForControl(
  controlId: string,
  state: HeartbeatCellState,
  signalsByControl: Map<string, UkSignal[]>,
): string | null {
  if (state !== "EMPTY") return null;
  const list = signalsByControl.get(controlId) ?? [];
  const silence = list.find((s) => s.detectionVersion.startsWith("silence-rule"));
  return silence?.id ?? list[0]?.id ?? null;
}

export function buildHeartbeatGrid(): HeartbeatGrid {
  const data = getUkProcessAuditData();
  const controls = Object.values(data.controlsByDomain).flat();
  const snapshot = buildDetectorSnapshot(controls, { asOf: AS_OF, periods: PERIODS });
  const signals = runAllDetectors(snapshot);

  const signalsByControl = new Map<string, UkSignal[]>();
  for (const s of signals) {
    const list = signalsByControl.get(s.controlId) ?? [];
    list.push(s);
    signalsByControl.set(s.controlId, list);
  }

  let periodHeaders: string[] = [];
  for (const c of controls) {
    const ops = snapshot.expectedOpsByControlId[c.controlId] ?? [];
    if (ops.length === PERIODS) {
      periodHeaders = ops.map((o) => o.expectedBy.slice(0, 7));
      break;
    }
  }
  if (periodHeaders.length === 0) {
    periodHeaders = Array.from({ length: PERIODS }, (_, i) => `P${i + 1}`);
  }

  const groups: HeartbeatDomainGroup[] = data.domains
    .filter((d) => d.id !== "overview")
    .map((d) => {
      const domainId = d.id as UkProcessAuditDomainId;
      const domainControls = (data.controlsByDomain[domainId] ?? [])
        .slice()
        .sort((a, b) => a.controlId.localeCompare(b.controlId));
      const rows: HeartbeatControlRow[] = domainControls.map((control: UkAuditControl) => {
        const ops = snapshot.expectedOpsByControlId[control.controlId] ?? [];
        const cells: HeartbeatCell[] = [];
        for (let i = 0; i < PERIODS; i++) {
          const op = ops[i];
          const state = cellState(op);
          cells.push({
            controlId: control.controlId,
            periodIndex: i,
            expectedBy: op?.expectedBy ?? "",
            state,
            signalId: signalIdForControl(control.controlId, state, signalsByControl),
          });
        }
        return { controlId: control.controlId, domainCode: domainId, cells };
      });
      return {
        domainCode: domainId,
        domainLabel: d.label,
        rows,
      };
    });

  const controlCount = groups.reduce((n, g) => n + g.rows.length, 0);

  return { asOf: AS_OF, periodHeaders, groups, controlCount };
}
