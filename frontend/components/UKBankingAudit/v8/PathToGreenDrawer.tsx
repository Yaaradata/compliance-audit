"use client";

import { useEffect, useState, type ReactNode } from "react";
import { savePathToGreen } from "@/lib/ukbankingaudit/v8/riskStore";
import type { PathToGreenRecord } from "@/lib/ukbankingaudit/v8/types";
import { useRiskState } from "./useRiskStore";

export type PathTarget = {
  targetType: PathToGreenRecord["targetType"];
  targetId: string;
  label: string;
  owner?: string | null;
};

const FIELD =
  "mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-[13px] text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const LABEL = "block text-[11px] font-semibold text-slate-600";

const HORIZONS: { value: PathToGreenRecord["horizon"]; label: string }[] = [
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** Governed path to green: first line plan, second line view, committee decision. */
export function PathToGreenDrawer({ target, onClose }: { target: PathTarget; onClose: () => void }) {
  const { data } = useRiskState();
  const existing = data.pathsToGreen.find(
    (p) => p.targetType === target.targetType && p.targetId === target.targetId,
  );
  const [form, setForm] = useState<PathToGreenRecord>(
    existing ?? {
      id: `PTG-${target.targetType.toUpperCase()}-${target.targetId}`,
      targetType: target.targetType,
      targetId: target.targetId,
      cause: "",
      actions: [],
      owner: target.owner ?? "",
      targetDate: "",
      horizon: "3m",
      secondLineVerdict: "pending",
      secondLineReviewer: null,
      secondLineComment: null,
      committee: data.config.committees[0],
      committeeDecision: "pending",
      decisionDate: null,
    },
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof PathToGreenRecord>(key: K, value: PathToGreenRecord[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const overdue = !!form.targetDate && form.targetDate < data.config.asOf;
  const canSave = form.cause.trim() !== "" && form.owner.trim() !== "" && form.targetDate !== "";

  const save = () => {
    if (!canSave) return;
    savePathToGreen({ ...form, actions: form.actions.map((a) => a.trim()).filter(Boolean) });
    setSaved(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Path to green: ${target.label}`}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[520px]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Path to green</div>
            <h2 className="mt-0.5 text-base font-bold leading-snug text-slate-900">{target.label}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] text-slate-500">{target.targetId}</span>
              {overdue ? (
                <span className="rounded bg-red-100 px-1.5 py-px text-[10px] font-bold text-red-700">Overdue</span>
              ) : null}
              {form.secondLineVerdict === "challenged" ? (
                <span className="rounded bg-orange-100 px-1.5 py-px text-[10px] font-bold text-orange-700">
                  Challenged
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            ✕ Close
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Section title="First line: risk owner">
            <label className={LABEL}>
              Cause
              <textarea className={FIELD} rows={2} value={form.cause} onChange={(e) => set("cause", e.target.value)} />
            </label>
            <label className={LABEL}>
              Actions (one per line)
              <textarea
                className={FIELD}
                rows={3}
                value={form.actions.join("\n")}
                onChange={(e) => set("actions", e.target.value.split("\n"))}
              />
            </label>
            <label className={LABEL}>
              Owner
              <input className={FIELD} value={form.owner} onChange={(e) => set("owner", e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={LABEL}>
                Target date
                <input
                  type="date"
                  className={FIELD}
                  value={form.targetDate}
                  onChange={(e) => set("targetDate", e.target.value)}
                />
              </label>
              <label className={LABEL}>
                Horizon
                <select
                  className={FIELD}
                  value={form.horizon}
                  onChange={(e) => set("horizon", e.target.value as PathToGreenRecord["horizon"])}
                >
                  {HORIZONS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Section>

          <Section title="Second line: risk steward">
            <div className="flex gap-2" role="group" aria-label="Second line view">
              {(["accepted", "challenged"] as const).map((verdict) => (
                <button
                  key={verdict}
                  type="button"
                  aria-pressed={form.secondLineVerdict === verdict}
                  onClick={() => set("secondLineVerdict", verdict)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    form.secondLineVerdict === verdict
                      ? verdict === "accepted"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-orange-500 bg-orange-500 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {verdict === "accepted" ? "Accept" : "Challenge"}
                </button>
              ))}
              {form.secondLineVerdict === "pending" ? (
                <span className="self-center text-xs text-slate-500">Awaiting review</span>
              ) : null}
            </div>
            <label className={LABEL}>
              Reviewer
              <input
                className={FIELD}
                value={form.secondLineReviewer ?? ""}
                onChange={(e) => set("secondLineReviewer", e.target.value || null)}
              />
            </label>
            <label className={LABEL}>
              Comment
              <textarea
                className={FIELD}
                rows={2}
                value={form.secondLineComment ?? ""}
                onChange={(e) => set("secondLineComment", e.target.value || null)}
              />
            </label>
          </Section>

          <Section title="Committee">
            <label className={LABEL}>
              Committee
              <select
                className={FIELD}
                value={form.committee}
                onChange={(e) => set("committee", e.target.value as PathToGreenRecord["committee"])}
              >
                {data.config.committees.map((committee) => (
                  <option key={committee} value={committee}>
                    {committee}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={LABEL}>
                Decision
                <select
                  className={FIELD}
                  value={form.committeeDecision}
                  onChange={(e) => set("committeeDecision", e.target.value as PathToGreenRecord["committeeDecision"])}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="sent_back">Sent back</option>
                  <option value="bring_forward">Bring forward</option>
                </select>
              </label>
              <label className={LABEL}>
                Decision date
                <input
                  type="date"
                  className={FIELD}
                  value={form.decisionDate ?? ""}
                  onChange={(e) => set("decisionDate", e.target.value || null)}
                />
              </label>
            </div>
          </Section>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">
          {saved ? (
            <span role="status" className="text-xs font-medium text-emerald-700">
              Saved to the Reasonable Steps Trail
            </span>
          ) : null}
          {!canSave ? <span className="text-xs text-slate-500">Cause, owner and target date are required</span> : null}
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Save path to green
          </button>
        </footer>
      </aside>
    </>
  );
}
