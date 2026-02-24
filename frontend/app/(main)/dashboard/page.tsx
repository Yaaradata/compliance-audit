"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getArchitecture } from "@/lib/data/architectures";
import { getDomainsForArchitecture } from "@/lib/data/domains";
import { CONTROLS } from "@/lib/data/controls";
import { OverallProgress } from "@/components/dashboard/overall-progress";
import { DomainCard } from "@/components/dashboard/domain-card";
import { ControlHeatmap } from "@/components/dashboard/control-heatmap";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { ProgressBar } from "@/components/ui/progress-bar";
import { scoreColor } from "@/lib/utils";
import type { Control } from "@/lib/types";

export default function DashboardPage() {
  const { selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const domains = getDomainsForArchitecture(arch?.domainIds);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const scopeControlIds = useMemo(() => {
    if (!arch) return new Set(CONTROLS.map((c) => c.id));
    return new Set([...arch.mandatoryControls, ...arch.advisoryControls]);
  }, [arch]);
  const scopedControls = useMemo(() => CONTROLS.filter((c) => scopeControlIds.has(c.id)), [scopeControlIds]);

  return (
    <div>
      <OverallProgress />
      {arch && (
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{arch.id}</span>
          <span>{arch.subtitle}</span>
          <span className="text-slate-400">·</span>
          <span>{arch.mandatoryControls.length}M + {arch.advisoryControls.length}A controls</span>
          <span className="text-slate-400">·</span>
          <span>{domains.length} domains</span>
        </div>
      )}
      <div className="grid grid-cols-[1fr_260px] gap-5">
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-3">Evidence Domains</div>
          <div className="grid grid-cols-2 gap-3">
            {domains.map((d) => <DomainCard key={d.id} domain={d} />)}
          </div>
          <div className="mt-4">
            <FileUploadZone />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-3">Control Sufficiency ({scopedControls.length})</div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <ControlHeatmap controls={scopedControls} onSelect={setSelectedControl} selected={selectedControl} />
            {selectedControl && (
              <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-xs">
                <div className="font-bold text-gray-800">{selectedControl.id} {selectedControl.name}</div>
                <div className="flex gap-2 mt-1.5 items-center">
                  <ProgressBar pct={selectedControl.score} h={6} className="flex-1" />
                  <span className="font-bold min-w-[36px]" style={{ color: scoreColor(selectedControl.score) }}>{selectedControl.score}%</span>
                </div>
                <div className="mt-1 text-gray-500">
                  {selectedControl.evidenceCount} evidence items · {selectedControl.type === "M" ? "Mandatory" : "Advisory"}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <AiSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
}
