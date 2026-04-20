"use client";

import { useState } from "react";
import { KeyRound, Rocket, PanelLeftClose } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-slate-50">
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-200 ${
          sidebarOpen ? "w-80" : "w-16"
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <PanelLeftClose className="h-4 w-4 text-indigo-700" />
            {sidebarOpen && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700/80">
                Software Audit · Modules
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {MODULES.map((m) => {
              const active = m.id === moduleId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModuleId(m.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  title={m.label}
                >
                  {m.icon}
                  {sidebarOpen && <span className="truncate text-left">{m.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div
        className={`relative min-h-screen transition-all duration-200 ${
          sidebarOpen ? "pl-80" : "pl-16"
        }`}
      >
        {moduleId === "access" ? (
          <AccessManagementDashboard />
        ) : (
          <ChangeManagementDashboard />
        )}
      </div>
    </div>
  );
}
