"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { getArchitecture } from "@/lib/data/architectures";
import { getDomainsForArchitecture } from "@/lib/data/domains";
import { OverallProgress } from "@/components/dashboard/overall-progress";
import { DomainCard } from "@/components/dashboard/domain-card";
import { ControlHeatmap } from "@/components/dashboard/control-heatmap";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState } from "@/components/ui/loading-state";
import { scoreColor } from "@/lib/utils";
import type { Control, Domain } from "@/lib/types";

interface DomainScore {
  id: string;
  name: string;
  completed: number;
  total: number;
  score: number;
}

interface ControlScore {
  id: string;
  name: string;
  type: string;
  score: number;
  status: string;
  evidence_count: number;
}

interface DashboardData {
  overall_score: number;
  mandatory_controls: number;
  total_controls: number;
  evidence_items: number;
  total_evidence_items: number;
  gaps_identified: number;
  domain_scores: DomainScore[];
  control_scores: ControlScore[];
  gaps: { control_id: string; name: string; score: number }[];
  suggestions: string[];
}

export default function CycleDashboardPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const { selectedArchitectureId } = useAuth();
  const arch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const staticDomains = getDomainsForArchitecture(arch?.domainIds);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  useEffect(() => {
    if (!cycleId) {
      setDashboard(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<DashboardData>(`/assessments/${cycleId}/dashboard`)
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, [cycleId]);

  
  const domainsForCards: Domain[] = useMemo(() => {
    const byId = new Map(dashboard?.domain_scores?.map((s) => [s.id, s]) ?? []);
    return staticDomains.map((d) => {
      const score = byId.get(d.id);
      return {
        ...d,
        completed: score?.completed ?? 0,
        items: score?.total ?? d.items,
        gap: null,
      };
    });
  }, [dashboard?.domain_scores, staticDomains]);

  const controlsForHeatmap: Control[] = useMemo(() => {
    if (!dashboard?.control_scores?.length) return [];
    return dashboard.control_scores.map((c) => ({
      id: c.id,
      name: c.name,
      type: (c.type === "M" ? "M" : "A") as "M" | "A",
      objective: 0,
      score: Math.round(c.score),
      evidenceCount: c.evidence_count ?? 0,
      status: (c.status as Control["status"]) ?? "gap",
    }));
  }, [dashboard?.control_scores]);

  const mandatoryApproved = useMemo(() => {
    if (!dashboard?.control_scores) return 0;
    return dashboard.control_scores.filter((c) => c.type === "M" && c.score >= 99).length;
  }, [dashboard?.control_scores]);

  if (loading) return <LoadingState message="Loading dashboard…" />;

  if (!cycleId || !dashboard) {
    return (
      <div className="card rounded-xl p-8 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No assessment selected. Open an assessment from Your Assessment Cycles.</p>
      </div>
    );
  }

  return (
    <div>
      <OverallProgress
        overallPct={Math.round(dashboard.overall_score)}
        mandatoryApproved={mandatoryApproved}
        mandatoryTotal={dashboard.mandatory_controls}
        completedItems={dashboard.evidence_items}
        totalItems={dashboard.total_evidence_items}
        gaps={dashboard.gaps_identified}
      />
      {arch && (
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{arch.id}</span>
          <span>{arch.subtitle}</span>
          <span className="text-slate-400">·</span>
          <span>{arch.mandatoryControls.length}M + {arch.advisoryControls.length}A controls</span>
          <span className="text-slate-400">·</span>
          <span>{domainsForCards.length} domains</span>
        </div>
      )}
      <div className="grid grid-cols-[1fr_260px] gap-5">
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Evidence Domains</div>
          <div className="grid grid-cols-2 gap-3">
            {domainsForCards.map((d) => (
              <DomainCard key={d.id} domain={d} cycleId={cycleId} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Control Sufficiency ({controlsForHeatmap.length})</div>
          <div className="card rounded-xl p-3">
            {controlsForHeatmap.length > 0 ? (
              <>
                <ControlHeatmap controls={controlsForHeatmap} onSelect={setSelectedControl} selected={selectedControl} />
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
              </>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No controls in scope yet. Complete architecture selection to see control sufficiency.</p>
            )}
          </div>
          <div className="mt-4">
            <AiSuggestions suggestions={dashboard.suggestions ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
