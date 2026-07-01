"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UkAuditControl, UkControlStatus } from "@/lib/UK_Process_Audit/types";
import { ControlTable } from "./ControlTable";

type Filter = "all" | UkControlStatus;

export function ControlRegister({
  controls,
  onOpenEvidence,
}: {
  controls: UkAuditControl[];
  onOpenEvidence: (control: UkAuditControl) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const totals = useMemo(
    () => ({
      count: controls.length,
      effective: controls.filter((c) => c.status === "effective").length,
      needsAtt: controls.filter((c) => c.status === "needs-attention").length,
      deficient: controls.filter((c) => c.status === "deficient").length,
    }),
    [controls],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return controls.filter((c) => {
      const matchStatus = filter === "all" || c.status === filter;
      const matchQ =
        !q ||
        c.controlId.toLowerCase().includes(q) ||
        c.sopStep.toLowerCase().includes(q) ||
        c.primaryObligation.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [controls, filter, query]);

  const chartData = useMemo(
    () => controls.map((c) => ({ id: c.controlId, compliance: c.compliance, violations: c.violations, exceptions: c.exceptions })),
    [controls],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 ring-1 ring-slate-200 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Control-level compliance</h3>
          <p className="mb-4 text-xs text-slate-500">Each bar is one control. Click a row below to see its evidence.</p>
          <div style={{ height: Math.max(300, controls.length * 26) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[75, 100]} fontSize={11} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="id" fontSize={10} stroke="#64748b" width={64} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, "Compliance"]} />
                <Bar dataKey="compliance" radius={[0, 4, 4, 0]}>
                  {chartData.map((p, i) => (
                    <Cell key={i} fill={p.compliance >= 95 ? "#10b981" : p.compliance >= 90 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 ring-1 ring-slate-200">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Violations vs exceptions</h3>
          <p className="mb-3 text-xs text-slate-500">Per control in this domain</p>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" fontSize={9} stroke="#64748b" angle={-40} textAnchor="end" interval={0} height={54} />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="violations" stackId="a" fill="#ef4444" name="Violations" />
                <Bar dataKey="exceptions" stackId="a" fill="#f59e0b" name="Exceptions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
        <div className="flex w-80 items-center gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-sm ring-1 ring-slate-200">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search control ID, step or obligation…"
            className="flex-1 border-0 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {(
            [
              { k: "all", label: `All (${totals.count})`, cls: "bg-slate-900 text-white" },
              { k: "effective", label: `Effective (${totals.effective})`, cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
              { k: "needs-attention", label: `Needs attention (${totals.needsAtt})`, cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
              { k: "deficient", label: `Deficient (${totals.deficient})`, cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
            ] as { k: Filter; label: string; cls: string }[]
          ).map((b) => (
            <button
              key={b.k}
              type="button"
              onClick={() => setFilter(b.k)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                filter === b.k ? b.cls : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> / {totals.count} controls
        </div>
      </div>

      <ControlTable controls={filtered} onOpenEvidence={onOpenEvidence} />
    </div>
  );
}
