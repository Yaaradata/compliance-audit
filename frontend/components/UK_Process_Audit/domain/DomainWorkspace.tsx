"use client";

import { useState } from "react";
import { ListChecks, UserRound, Workflow } from "lucide-react";
import type {
  UkAuditControl,
  UkDomainEntity,
  UkDomainSop,
  UkJourneyCase,
} from "@/lib/UK_Process_Audit/types";
import { ControlRegister } from "./ControlRegister";
import { JourneyMatrix } from "./JourneyMatrix";
import { ProcessFlowView } from "./ProcessFlowView";

type WorkspaceView = "sop" | "cases" | "register";

export function DomainWorkspace({
  controls,
  sop,
  cases,
  entity,
  journeyTitle,
  controlExceptionLabelById,
  onOpenEvidence,
}: {
  controls: UkAuditControl[];
  sop: UkDomainSop;
  cases: UkJourneyCase[];
  entity: UkDomainEntity;
  journeyTitle: string;
  controlExceptionLabelById: Record<string, string>;
  onOpenEvidence: (control: UkAuditControl) => void;
}) {
  const [view, setView] = useState<WorkspaceView>("sop");

  const tabs: { id: WorkspaceView; label: string; icon: typeof Workflow }[] = [
    { id: "sop", label: "Process flow", icon: Workflow },
    { id: "cases", label: `${entity.plural} — Journey matrix`, icon: UserRound },
    { id: "register", label: "Control register", icon: ListChecks },
  ];

  return (
    <div className="space-y-5">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-white p-1.5 ring-1 ring-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                view === tab.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {view === "sop" && (
        <ProcessFlowView sop={sop} controls={controls} onOpenEvidence={onOpenEvidence} />
      )}

      {view === "cases" && (
        <JourneyMatrix
          sop={sop}
          cases={cases}
          entity={entity}
          journeyTitle={journeyTitle}
          controls={controls}
          controlExceptionLabelById={controlExceptionLabelById}
          onOpenEvidence={onOpenEvidence}
        />
      )}

      {view === "register" && (
        <ControlRegister controls={controls} onOpenEvidence={onOpenEvidence} />
      )}
    </div>
  );
}
