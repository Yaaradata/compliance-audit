"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { buildHeartbeatGrid, type HeartbeatCellState } from "@/lib/UK_Process_Audit/v3/heartbeatGrid";

/**
 * Presence map — FILLED / EMPTY / HATCHED only. No colour scale.
 */
export function HeartbeatGridView() {
  const router = useRouter();
  const grid = useMemo(() => buildHeartbeatGrid(), []);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Heartbeat Grid</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {grid.controlCount} controls · last {grid.periodHeaders.length} expected operations · as
          of {grid.asOf}. Presence map — not a heat map.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
          <Legend swatch="filled" label="FILLED — evidence artefact exists" />
          <Legend swatch="empty" label="EMPTY — armed, no artefact (silence)" />
          <Legend swatch="hatched" label="HATCHED — cadence unconfirmed (UNARMED)" />
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Control
              </th>
              {grid.periodHeaders.map((h) => (
                <th
                  key={h}
                  className="px-1 py-2 text-center text-[9px] font-semibold tabular-nums text-slate-500"
                >
                  {h.slice(5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.groups.map((group) => (
              <DomainBlock
                key={group.domainCode}
                domainLabel={group.domainLabel}
                colSpan={grid.periodHeaders.length + 1}
                rows={group.rows}
                onCellClick={(signalId) => {
                  if (!signalId) return;
                  router.push(`/UK_Process_Audit/v3/signal/${encodeURIComponent(signalId)}`);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DomainBlock({
  domainLabel,
  colSpan,
  rows,
  onCellClick,
}: {
  domainLabel: string;
  colSpan: number;
  rows: ReturnType<typeof buildHeartbeatGrid>["groups"][number]["rows"];
  onCellClick: (signalId: string | null) => void;
}) {
  return (
    <>
      <tr className="border-t border-slate-200 bg-slate-100">
        <td colSpan={colSpan} className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
          {domainLabel}
          <span className="ml-2 font-normal normal-case text-slate-500">{rows.length} controls</span>
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.controlId} className="border-t border-slate-100 hover:bg-slate-50/80">
          <td className="sticky left-0 z-10 bg-white px-3 py-1 font-mono text-[11px] font-semibold text-slate-800">
            {row.controlId}
          </td>
          {row.cells.map((cell) => (
            <td key={`${row.controlId}-${cell.periodIndex}`} className="px-0.5 py-1 text-center">
              <HeartbeatCellButton
                state={cell.state}
                signalId={cell.signalId}
                title={`${row.controlId} · ${cell.expectedBy || "n/a"} · ${cell.state}`}
                onClick={() => onCellClick(cell.signalId)}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function HeartbeatCellButton({
  state,
  signalId,
  title,
  onClick,
}: {
  state: HeartbeatCellState;
  signalId: string | null;
  title: string;
  onClick: () => void;
}) {
  const clickable = signalId != null;
  return (
    <button
      type="button"
      title={title}
      disabled={!clickable}
      onClick={onClick}
      className={`inline-block h-4 w-4 rounded-[2px] ${
        clickable ? "cursor-pointer hover:ring-2 hover:ring-slate-400" : "cursor-default"
      }`}
      style={cellStyle(state)}
      aria-label={title}
    />
  );
}

function cellStyle(state: HeartbeatCellState): CSSProperties {
  switch (state) {
    case "FILLED":
      return { backgroundColor: "#334155" }; // slate-700 — presence, not severity
    case "EMPTY":
      return {
        backgroundColor: "#ffffff",
        boxShadow: "inset 0 0 0 1px #94a3b8",
      };
    case "HATCHED":
      return {
        backgroundColor: "#f1f5f9",
        backgroundImage:
          "repeating-linear-gradient(135deg, #94a3b8 0 1px, transparent 1px 4px)",
      };
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

function Legend({
  swatch,
  label,
}: {
  swatch: "filled" | "empty" | "hatched";
  label: string;
}) {
  const state: HeartbeatCellState =
    swatch === "filled" ? "FILLED" : swatch === "empty" ? "EMPTY" : "HATCHED";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-3.5 w-3.5 rounded-[2px]" style={cellStyle(state)} />
      {label}
    </span>
  );
}
