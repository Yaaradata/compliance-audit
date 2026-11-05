"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import {
  buildCategoryEffectiveness,
  buildControlRows,
  buildEvidenceWarnings,
  buildIncidentCounts,
  buildIncidentRows,
  buildOverdueTests,
  buildWhatMoved,
  linkEffectNote,
  type IncidentRow,
} from "@/lib/ukbankingaudit/v8/controlsIncidentsView";
import { getRiskState, linkIncidentToControl } from "@/lib/ukbankingaudit/v8/riskStore";
import type { ControlResult, IncidentControlLink } from "@/lib/ukbankingaudit/v8/types";
import { useRiskState } from "../useRiskStore";

const RESULT: Record<ControlResult, { label: string; className: string }> = {
  effective: { label: "Effective", className: "text-emerald-700" },
  partially_effective: { label: "Partially effective", className: "text-amber-700" },
  not_effective: { label: "Not effective", className: "font-bold text-red-700" },
};

const WORKED: Record<IncidentControlLink["controlWorked"], { label: string; className: string }> = {
  worked: { label: "Worked", className: "text-emerald-700" },
  partial: { label: "Partially", className: "text-amber-700" },
  failed: { label: "Failed", className: "font-bold text-red-700" },
};

const MOVE = {
  down: { arrow: "▼", className: "text-red-700", label: "Down from last period" },
  up: { arrow: "▲", className: "text-emerald-700", label: "Up from last period" },
  flat: { arrow: "▬", className: "text-slate-500", label: "No change from last period" },
};

const CARD = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const H2 = "text-base font-bold text-slate-900";

function LinkControlForm({ incident, onDone }: { incident: IncidentRow; onDone: (savedControlId: string | null) => void }) {
  const { data } = useRiskState();
  const options = useMemo(
    () =>
      [...data.controls].sort(
        (a, b) =>
          Number(b.categoryId === incident.categoryId) - Number(a.categoryId === incident.categoryId) ||
          a.id.localeCompare(b.id),
      ),
    [data.controls, incident.categoryId],
  );
  const firstFree = options.find((c) => !incident.links.some((l) => l.controlId === c.id));
  const [controlId, setControlId] = useState(firstFree?.id ?? options[0]?.id ?? "");
  const [worked, setWorked] = useState<IncidentControlLink["controlWorked"] | null>(null);

  const save = () => {
    if (!worked) return;
    linkIncidentToControl({ incidentId: incident.id, controlId, controlWorked: worked });
    onDone(worked === "failed" ? controlId : null);
  };

  return (
    <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
      <label className="block text-[11px] font-semibold text-slate-700">
        Control
        <select
          value={controlId}
          onChange={(e) => setControlId(e.target.value)}
          className="mt-1 block w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
        >
          {options.map((control) => (
            <option key={control.id} value={control.id}>
              {control.id} {control.name}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="mt-2">
        <legend className="text-[11px] font-semibold text-slate-700">Did the control work?</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(["worked", "failed", "partial"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={worked === option}
              onClick={() => setWorked(option)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
                worked === option
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {WORKED[option].label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          disabled={!worked}
          onClick={save}
          className="rounded-md bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Save link
        </button>
        <button
          type="button"
          onClick={() => onDone(null)}
          className="rounded-md px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Whether controls actually work, with every major incident linked to a control. */
export function ControlsIncidentsTabV8() {
  const { data } = useRiskState();
  const period = data.config.currentPeriod;
  const [criticalOnly, setCriticalOnly] = useState(true);
  const [showSevThree, setShowSevThree] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const categories = buildCategoryEffectiveness(period, data);
  const moves = buildWhatMoved(period, data);
  const controls = buildControlRows(period, data).filter((row) => !criticalOnly || row.tier === "critical");
  const overdue = buildOverdueTests(data);
  const warnings = buildEvidenceWarnings(period, data);
  const counts = buildIncidentCounts(period, data);
  const incidents = buildIncidentRows(data, showSevThree);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Controls &amp; Incidents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Whether critical controls work this {counts.periodWord}, and what incidents say about them.
        </p>
      </div>

      <section aria-label="Control effectiveness by category">
        <h2 className={`mb-3 ${H2}`}>Critical control effectiveness</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const move = MOVE[category.direction];
            return (
              <div key={category.categoryId} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className="text-[12px] font-semibold leading-tight text-slate-700">{category.label}</div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{category.pct}%</span>
                  <span title={move.label} aria-label={move.label} className={`text-xs font-bold ${move.className}`}>
                    {move.arrow}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {category.prevPct === null ? "No earlier result" : `Previous: ${category.prevPct}%`}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={CARD}>
          <h2 className={`mb-2 ${H2}`}>What moved</h2>
          {moves.length === 0 ? (
            <p className="text-sm text-slate-500">No critical control result changed this {counts.periodWord}.</p>
          ) : (
            <ul className="space-y-1.5 text-[13px] text-slate-700">
              {moves.map((move) => (
                <li key={move.controlId}>{move.text}</li>
              ))}
            </ul>
          )}
        </section>
        <section className={CARD}>
          <h2 className={`mb-2 ${H2}`}>Overdue tests and evidence gaps</h2>
          {warnings.map((warning) => (
            <p key={warning} className="mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-[12px] font-medium text-amber-900">
              ⚠ {warning}
            </p>
          ))}
          {overdue.length === 0 ? (
            <p className="text-sm text-slate-500">No tests overdue.</p>
          ) : (
            <ul className="space-y-1 text-[13px] text-slate-700">
              {overdue.map((row) => (
                <li key={row.id}>
                  <span className="font-mono text-[11px] text-slate-500">{row.id}</span> {row.name}, {row.categoryLabel}:{" "}
                  <span className="font-semibold text-red-700">due {formatDate(row.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={CARD}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className={H2}>Controls ({controls.length})</h2>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={criticalOnly} onChange={(e) => setCriticalOnly(e.target.checked)} />
            Critical only
          </label>
        </div>
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full min-w-[1040px] text-left text-[12.5px]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-3">ID</th>
                <th scope="col" className="pr-3">Name</th>
                <th scope="col" className="pr-3">Category</th>
                <th scope="col" className="pr-3">Tier</th>
                <th scope="col" className="pr-3">Owner</th>
                <th scope="col" className="pr-3">Test frequency</th>
                <th scope="col" className="pr-3">Last tested</th>
                <th scope="col" className="pr-3">Result</th>
                <th scope="col" className="pr-3">Next due</th>
                <th scope="col">Linked incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controls.map((row) => {
                const result = row.result ? RESULT[row.result] : null;
                return (
                  <tr key={row.id}>
                    <td className="py-1.5 pr-3 font-mono text-[11px] text-slate-600">{row.id}</td>
                    <td className="pr-3 font-medium text-slate-900">{row.name}</td>
                    <td className="pr-3 text-slate-600">{row.categoryLabel}</td>
                    <td className="pr-3 capitalize text-slate-600">{row.tier}</td>
                    <td className="pr-3 text-slate-600">{row.owner}</td>
                    <td className="pr-3 capitalize text-slate-600">{row.testFrequency}</td>
                    <td className="pr-3 text-slate-600">{row.lastTested ? formatDate(row.lastTested) : "Not tested"}</td>
                    <td className={`pr-3 ${result?.className ?? "text-slate-500"}`}>
                      {result?.label ?? "No result"}
                      {row.reRated ? <span className="block text-[10px] font-medium text-red-700">Re-rated by incident</span> : null}
                    </td>
                    <td className={`pr-3 ${row.overdue ? "font-semibold text-red-700" : "text-slate-600"}`}>
                      {row.nextDue ? formatDate(row.nextDue) : "Not scheduled"}
                      {row.overdue ? " · overdue" : ""}
                    </td>
                    <td className="font-mono text-[11px] text-slate-600">{row.linkedIncidentIds.join(", ") || "None"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={CARD}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={H2}>Incidents</h2>
            <p className="mt-0.5 text-[13px] text-slate-600">
              Raised this {counts.periodWord}: Sev-1: {counts.sevOne} (last {counts.periodWord}: {counts.prevSevOne}) · Sev-2:{" "}
              {counts.sevTwo} (last {counts.periodWord}: {counts.prevSevTwo})
            </p>
          </div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={showSevThree} onChange={(e) => setShowSevThree(e.target.checked)} />
            Show Sev-3
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-3">Date</th>
                <th scope="col" className="pr-3">Title</th>
                <th scope="col" className="pr-3">Severity</th>
                <th scope="col" className="pr-3">Category</th>
                <th scope="col" className="pr-3">Impact</th>
                <th scope="col" className="pr-3">Owner</th>
                <th scope="col" className="pr-3">Status</th>
                <th scope="col">Linked controls and whether each worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-600">{formatDate(incident.date)}</td>
                  <td className="pr-3 font-medium text-slate-900">{incident.title}</td>
                  <td className="pr-3 font-bold text-slate-800">{incident.severity}</td>
                  <td className="pr-3 text-slate-600">{incident.categoryLabel}</td>
                  <td className="pr-3 text-slate-600">{incident.impact}</td>
                  <td className="pr-3 text-slate-600">{incident.owner}</td>
                  <td className="pr-3 capitalize text-slate-600">{incident.status}</td>
                  <td className="min-w-[17rem]">
                    <ul className="space-y-0.5">
                      {incident.links.map((link) => (
                        <li key={link.controlId}>
                          <span className="font-mono text-[11px] text-slate-600">{link.controlId}</span>{" "}
                          <span className={WORKED[link.worked].className}>{WORKED[link.worked].label}</span>
                        </li>
                      ))}
                    </ul>
                    {notes[incident.id] ? (
                      <p role="status" className="mt-1 text-[11px] text-slate-600">{notes[incident.id]}</p>
                    ) : null}
                    {linking === incident.id ? (
                      <LinkControlForm
                        incident={incident}
                        onDone={(savedControlId) => {
                          setLinking(null);
                          if (!savedControlId) return;
                          // Read after the save: the note depends on the updated links.
                          const note = linkEffectNote(incident.id, savedControlId, period, getRiskState().data);
                          setNotes((prev) => ({ ...prev, [incident.id]: note ?? "" }));
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLinking(incident.id)}
                        className="mt-1 text-[11px] font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                      >
                        Link to control
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
