"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import type {
  UkAuditControl,
  UkProcessAuditDomainDef,
  UkProcessAuditDomainId,
  UkProcessAuditTabId,
} from "@/lib/UK_Process_Audit/types";

export function DomainSidebar({
  domains,
  activeTab,
  onSelect,
  controlsByDomain,
}: {
  domains: UkProcessAuditDomainDef[];
  activeTab: UkProcessAuditTabId;
  onSelect: (id: UkProcessAuditTabId) => void;
  controlsByDomain: Record<UkProcessAuditDomainId, UkAuditControl[]>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`flex min-h-0 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[1px_0_0_rgba(15,23,42,0.04)] transition-[width] duration-200 ease-out ${
        open ? "w-60" : "w-14"
      }`}
      aria-label="Domains"
    >
      <div className="flex min-h-[44px] items-center justify-center overflow-hidden border-b border-slate-100 px-2 py-3">
        {open ? (
          <div className="w-full pl-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Domains
          </div>
        ) : (
          <ListChecks className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        {domains.map((d) => {
          const Icon = d.icon;
          const isActive = activeTab === d.id;
          const count =
            d.id === "overview"
              ? null
              : (controlsByDomain[d.id as UkProcessAuditDomainId] || []).length;

          return (
            <button
              key={d.id}
              type="button"
              title={d.label}
              onClick={() => onSelect(d.id)}
              className={`flex w-full items-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                open ? "justify-start px-2" : "justify-center px-0"
              } ${
                isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                style={!isActive ? { color: d.color } : { color: "#fff" }}
              />
              {open && (
                <>
                  <span className="flex-1 truncate text-left text-[13px] leading-tight">{d.label}</span>
                  {count !== null && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                        isActive ? "bg-white/15 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
