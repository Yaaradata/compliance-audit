"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DomainHeader } from "@/components/layout/domain-header";
import { DomainLeftRail } from "@/components/layout/domain-left-rail";
import { DomainRightSidebar } from "@/components/layout/domain-right-sidebar";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import { EvaluationResults } from "@/components/domain/evaluation-results";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { EvidenceCriteriaSections } from "@/components/domain/evidence-criteria-sections";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import type { DomainConfig, EvidenceItem, AiEvaluationResult as AiEvalResultType } from "@/lib/types";

interface ApiDomain {
  id: string;
  name: string;
  color: string | null;
  accent_color: string | null;
  item_count: number;
  sort_order: number;
}

interface ApiEvidenceItem {
  id: string;
  domain_id: string;
  sort_order: number;
  name: string;
  priority: string;
  evidence_type: string;
  description: string;
  reduction_note: string | null;
  control_count: number;
  per_system: boolean;
  per_zone: boolean;
  per_quarter: boolean;
  per_access_point: boolean;
  is_advisory: boolean;
  is_conditional: boolean;
  controls?: { control_id: string; ma: string }[];
  evidence_description?: string | null;
  sufficiency_definition?: string | null;
  evaluation_criteria?: string | null;
}

interface ApiSubmission {
  id: string;
  evidence_item_id: string;
  status: string;
  form_data: Record<string, string>;
  completion_pct: number;
}

const GRADIENTS: Record<string, string> = {
  A: "linear-gradient(135deg, #0F4C75 0%, #1B6FA0 100%)",
  B: "linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)",
  C: "linear-gradient(135deg, #E65100 0%, #FB8C00 100%)",
  D: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)",
  E: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
  F: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
  G: "linear-gradient(135deg, #F57F17 0%, #FFB300 100%)",
  H: "linear-gradient(135deg, #BF360C 0%, #E64A19 100%)",
};

function toEvidenceItem(a: ApiEvidenceItem): EvidenceItem {
  const controls = (a.controls ?? []).map((c) => ({ id: c.control_id, name: "", ma: c.ma as "M" | "A" }));
  return {
    id: a.id,
    order: a.sort_order,
    name: a.name,
    priority: a.priority as EvidenceItem["priority"],
    type: a.evidence_type,
    controls,
    controlCount: a.control_count,
    description: a.description,
    evidenceDescription: a.evidence_description ?? null,
    sufficiencyDefinition: a.sufficiency_definition ?? null,
    evaluationCriteria: a.evaluation_criteria ?? null,
    inputs: [],
    sufficiency: [],
    reductionNote: a.reduction_note ?? "",
    perSystem: a.per_system,
    perZone: a.per_zone,
    perQuarter: a.per_quarter,
    perAccessPoint: a.per_access_point,
    isAdvisory: a.is_advisory,
    conditional: a.is_conditional,
  };
}

export default function CycleDomainPage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const domainId = (params.domainId as string)?.toUpperCase();
  const { activeCycleId } = useAuth();

  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState(false);
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AiEvalResultType | null>(null);

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    api.get<{ domain: ApiDomain | null; evidence_items: ApiEvidenceItem[] }>(`/ref/domains/${domainId}`)
      .then((res) => {
        if (!res.domain) { setConfig(null); return; }
        const d = res.domain;
        const evidenceItems = res.evidence_items.map(toEvidenceItem);
        const allControls = [...new Set(evidenceItems.flatMap((i) => i.controls.map((c) => c.id)))];
        setConfig({
          id: d.id,
          name: d.name,
          color: d.color ?? "#666",
          gradient: GRADIENTS[d.id] ?? "linear-gradient(135deg, #666 0%, #999 100%)",
          accentColor: d.accent_color ?? "#eee",
          evidenceItems,
          allControls,
          subGroups: [],
          weights: {},
        });
        if (evidenceItems.length > 0) setActiveItem(evidenceItems[0].id);
      })
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [domainId]);

  useEffect(() => {
    if (!cycleId || !domainId) return;
    api.get<ApiSubmission[]>(`/assessments/${cycleId}/evidence?domain=${domainId}`)
      .then((subs) => {
        const data: Record<string, string> = {};
        subs.forEach((s) => {
          if (s.form_data) {
            Object.entries(s.form_data).forEach(([k, v]) => {
              data[`${s.evidence_item_id}_${k}`] = String(v);
            });
          }
        });
        setFormData(data);
      })
      .catch(() => {});
  }, [cycleId, domainId]);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
    setAiEvaluationResult(null);
  }, []);

  const currentItem = useMemo(() => config?.evidenceItems.find((e) => e.id === activeItem), [config, activeItem]);

  const getItemCompletion = useCallback((itemId: string) => {
    const item = config?.evidenceItems.find((e) => e.id === itemId);
    if (!item || !item.inputs.length) return 0;
    const filled = item.inputs.filter((inp) => formData[`${itemId}_${inp.id}`]).length;
    return Math.round((filled / item.inputs.length) * 100);
  }, [config, formData]);

  const overallCompletion = useMemo(() => {
    if (!config) return 0;
    const total = config.evidenceItems.reduce((a, i) => a + Math.max(i.inputs.length, 1), 0);
    const filled = config.evidenceItems.reduce((a, item) => a + item.inputs.filter((inp) => formData[`${item.id}_${inp.id}`]).length, 0);
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [config, formData]);

  const controlScores = useMemo(() => {
    if (!config) return {};
    const scores: Record<string, number> = {};
    config.allControls.forEach((c) => {
      const relevantItems = config.evidenceItems.filter((e) => e.controls.some((ctrl) => ctrl.id === c));
      if (relevantItems.length === 0) { scores[c] = 0; return; }
      const avg = relevantItems.reduce((a, i) => a + getItemCompletion(i.id), 0) / relevantItems.length;
      scores[c] = Math.round(avg);
    });
    return scores;
  }, [config, getItemCompletion]);

  const handleEvaluateEvidence = useCallback(() => {
    if (!currentItem || !cycleId) return;
    setAiEvaluationLoading(true);
    setEvaluated(true);
    setAiEvaluationResult(null);
    api
      .post<{
        evidence_item_id: string;
        overall_met: boolean;
        sufficiency_results: { id: string; label: string; met: boolean; description?: string | null }[];
        criteria: { id: string; label: string; met: boolean; description?: string | null }[];
        summary?: string | null;
      }>(
        `/assessments/${cycleId}/evidence/evaluate`,
        { evidence_item_id: currentItem.id, submission_id: null }
      )
      .then((res) => {
        setAiEvaluationResult({
          evidence_item_id: res.evidence_item_id,
          overall_met: res.overall_met,
          sufficiency_results: res.sufficiency_results?.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })) ?? [],
          criteria: res.criteria.map((c) => ({ id: c.id, label: c.label, met: c.met, description: c.description ?? null })),
          summary: res.summary ?? null,
        });
      })
      .catch(() => setAiEvaluationResult(null))
      .finally(() => setAiEvaluationLoading(false));
  }, [currentItem, cycleId]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-sm">Loading domain…</div>;
  }

  if (!config) {
    const backCycleId = cycleId || activeCycleId;
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-2">Domain not found or not in your selected architecture scope.</p>
        <p className="text-xs text-gray-400 mb-4">Ensure the backend reference data is seeded (evidence_domains, canonical_evidence_items).</p>
        {backCycleId ? (
          <Link href={`/cycles/${backCycleId}/dashboard`} className="text-blue-600 text-sm font-medium hover:underline inline-block">← Back to Dashboard</Link>
        ) : (
          <Link href="/assessments/new" className="text-blue-600 text-sm font-medium hover:underline inline-block">← Your Assessment Cycles</Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <DomainHeader config={config} completionPct={overallCompletion} />
      <div className="flex gap-4">
        <DomainLeftRail config={config} activeItem={activeItem} onSelectItem={setActiveItem} />
        <div className="flex-1 min-w-0 space-y-3">
          {currentItem && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold" style={{ color: config.color }}>{currentItem.id}</span>
                    <span className="text-sm font-semibold">{currentItem.name}</span>
                    <PriorityBadge priority={currentItem.priority} />
                  </div>
                  {cycleId && (
                    <Link href={`/cycles/${cycleId}/domains/${domainId}/items/${currentItem.id}`}
                      className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 hover:bg-blue-100 transition-colors">
                      Open Full Intake →
                    </Link>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">{currentItem.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentItem.controls.map((c) => <ControlBadge key={c.id} id={c.id} ma={c.ma} />)}
                </div>
                <div className="text-[11px] text-green-700 font-medium bg-green-50 rounded px-2 py-1">
                  {currentItem.reductionNote}
                </div>
              </div>
              <EvidenceCriteriaSections
                evidenceDescription={currentItem.evidenceDescription}
                sufficiencyDefinition={currentItem.sufficiencyDefinition}
                evaluationCriteria={currentItem.evaluationCriteria}
                evaluationState={
                  !evaluated ? "idle" : aiEvaluationLoading ? "loading" : "done"
                }
                sufficiencyResults={aiEvaluationResult?.sufficiency_results ?? null}
                criteriaResults={aiEvaluationResult?.criteria ?? null}
              />
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-xs font-semibold text-gray-700 mb-3">Quick Evidence Upload</div>
                <FileUploadZone label={`Upload evidence for ${currentItem.id} — ${currentItem.name}`} />
              </div>
              {currentItem.sufficiency.length > 0 && (
                <SufficiencyPanel dimensions={currentItem.sufficiency} color={config.color} />
              )}
              {evaluated && (
                <>
                  <AiEvaluationResult
                    result={aiEvaluationResult}
                    loading={aiEvaluationLoading}
                    placeholder={!aiEvaluationLoading && !aiEvaluationResult}
                  />
                  <EvaluationResults score={getItemCompletion(currentItem.id)} />
                </>
              )}
              <button onClick={handleEvaluateEvidence}
                className="w-full py-2.5 rounded-lg text-white text-xs font-semibold transition-colors"
                style={{ background: config.color }}>
                🤖 Evaluate Evidence for {currentItem.id}
              </button>
            </>
          )}
        </div>
        <DomainRightSidebar controls={config.allControls} controlScores={controlScores} />
      </div>
    </div>
  );
}
