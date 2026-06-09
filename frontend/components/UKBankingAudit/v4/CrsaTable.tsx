"use client";

import { CRSA_DATA } from "@/lib/ukbankingaudit/riskDomainsV4";
import { RAG_STYLES } from "./ragTokens";
import type { CrsaControl } from "./types";

function StatusBadge({ status }: { status: CrsaControl["status"] }) {
  const band = status === "RED" ? "red" : status === "AMBER" ? "amber" : "green";
  const rag = RAG_STYLES[band];
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${rag.bg} ${rag.text} ${rag.border}`}>
      {status}
    </span>
  );
}

type Props = {
  area: string;
  domainName: string;
};

/** CRSA control status table keyed by domain area (v4 mockup). */
export function CrsaTable({ area, domainName }: Props) {
  const controls = CRSA_DATA[area] ?? [];
  if (!controls.length) {
    return (
      <p className="px-3 py-2 text-xs text-slate-400">No CRSA controls mapped for this domain.</p>
    );
  }

  return (
    <div className="uk-v4-slide-down-mid mb-4 rounded-[10px] border border-slate-200 bg-stone-50 p-4">
      <div className="mb-2 text-[11.5px] text-slate-400">
        Enterprise Risk Profile › {domainName} ›{" "}
        <span className="font-semibold text-slate-600">CRSA Control Status</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-left">
              {["Ref", "Control Objective", "Requirement", "Status"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b-2 border-slate-200 px-2.5 py-2 font-semibold text-slate-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr key={c.ref} className="border-b border-slate-100">
                <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] text-slate-500">{c.ref}</td>
                <td className="max-w-[280px] px-2.5 py-1.5 text-slate-700">{c.objective}</td>
                <td className="max-w-[340px] px-2.5 py-1.5 text-slate-500">{c.requirement}</td>
                <td className="px-2.5 py-1.5">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
