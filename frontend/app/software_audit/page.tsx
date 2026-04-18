"use client";

import { useState } from "react";
import { KeyRound, Rocket } from "lucide-react";
import AccessManagementDashboard from "@/components/software_audit/access-management/access-management-dashboard";
import ChangeManagementDashboard from "@/components/software_audit/change-management/change-management-dashboard";

const MODULES = [
  {
    id: "access",
    label: "Access Management & Identity Governance",
    icon: <KeyRound className="h-4 w-4" />,
  },
  {
    id: "change",
    label: "Change Management & Release Controls",
    icon: <Rocket className="h-4 w-4" />,
  },
] as const;

type ModuleId = (typeof MODULES)[number]["id"];

export default function SoftwareAuditPage() {
  const [moduleId, setModuleId] = useState<ModuleId>("access");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-100/80">
      <div className="sticky top-0 z-30 w-full border-b border-indigo-200/60 bg-white/80 backdrop-blur-md">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:px-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700/80">
            Software Audit · Modules
          </span>
          <div className="rounded-2xl border border-indigo-100/90 bg-white/70 p-1 shadow-inner shadow-indigo-950/5 backdrop-blur-sm">
            <div className="flex w-full flex-wrap gap-1">
              {MODULES.map((m) => {
                const active = m.id === moduleId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModuleId(m.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                        : "text-slate-600 hover:bg-white/80 hover:text-indigo-700"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {moduleId === "access" ? (
        <AccessManagementDashboard />
      ) : (
        <ChangeManagementDashboard />
      )}
    </div>
  );
}
