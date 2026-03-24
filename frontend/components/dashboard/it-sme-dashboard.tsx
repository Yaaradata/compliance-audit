"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { getArchitectureTypeFromApi } from "@/lib/api-architecture";
import { getArchitecture, getDomainsForArchitecture } from "@/lib/frameworks/swift-cscf";
import { OverallProgress } from "@/components/dashboard/overall-progress";
import { DomainCard } from "@/components/dashboard/domain-card";
import { LoadingState } from "@/components/ui/loading-state";
import type { Domain } from "@/lib/types";

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
}

export function ITSmeDashboard({ cycleId }: { cycleId: string }) {
  const { selectedArchitectureId } = useAuth();
  const fallbackArch = selectedArchitectureId ? getArchitecture(selectedArchitectureId) : null;
  const staticDomains = getDomainsForArchitecture(fallbackArch?.domainIds);

  const [archMeta, setArchMeta] = useState<{ id: string; name: string; subtitle: string } | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedArchitectureId) {
      setArchMeta(null);
      return;
    }
    getArchitectureTypeFromApi(selectedArchitectureId)
      .then((a) => setArchMeta(a ? { id: a.id, name: a.name, subtitle: a.subtitle } : null))
      .catch(() => setArchMeta(null));
  }, [selectedArchitectureId]);

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

  const mandatoryApproved = useMemo(() => {
    if (!dashboard?.control_scores) return 0;
    return dashboard.control_scores.filter((c) => c.type === "M" && c.score >= 99).length;
  }, [dashboard?.control_scores]);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (!dashboard) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <section aria-label="Overall progress">
        <OverallProgress
        overallPct={Math.round(dashboard.overall_score)}
        mandatoryApproved={mandatoryApproved}
        mandatoryTotal={dashboard.mandatory_controls}
        completedItems={dashboard.evidence_items}
        totalItems={dashboard.total_evidence_items}
        gaps={dashboard.gaps_identified}
        />
      </section>
      {(archMeta || fallbackArch) && (
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{archMeta?.id ?? fallbackArch?.id}</span>
          <span>{archMeta?.subtitle ?? fallbackArch?.subtitle}</span>
          <span className="text-slate-400">·</span>
          <span>{domainsForCards.length} domains</span>
        </div>
      )}
      <section aria-label="Evidence domains">
        <div className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Evidence Domains</div>
        <div className="grid grid-cols-2 gap-3">
          {domainsForCards.map((d) => (
            <DomainCard key={d.id} domain={d} cycleId={cycleId} />
          ))}
        </div>
      </section>
    </div>
  );
}
