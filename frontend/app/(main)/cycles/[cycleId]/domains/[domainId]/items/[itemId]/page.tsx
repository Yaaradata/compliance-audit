"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ControlBadge } from "@/components/ui/control-badge";
import { PriorityBadge } from "@/components/ui/badge";
import { EvidenceInputRenderer } from "@/components/domain/evidence-input-renderer";
import { SufficiencyPanel } from "@/components/domain/sufficiency-panel";
import { PerControlPanel } from "@/components/domain/per-control-panel";
import { EvaluationResults } from "@/components/domain/evaluation-results";
import { EvidenceCriteriaSections } from "@/components/domain/evidence-criteria-sections";
import { AiEvaluationResult } from "@/components/domain/ai-evaluation-result";
import { getStatusColor, getStatusIcon } from "@/lib/utils";
import type { EvidenceItem, ControlRef, AiEvaluationResult as AiEvalResultType } from "@/lib/types";

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
  evidence_description?: string | null;
  sufficiency_definition?: string | null;
  evaluation_criteria?: string | null;
}

interface ItemDetailResponse {
  item: ApiEvidenceItem | null;
  controls: { evidence_item_id: string; control_id: string; is_primary: boolean }[];
}

const DOMAIN_COLORS: Record<string, { color: string; gradient: string }> = {
  A: { color: "#0F4C75", gradient: "linear-gradient(135deg,#0F4C75,#1B6FA0)" },
  B: { color: "#1B5E20", gradient: "linear-gradient(135deg,#1B5E20,#388E3C)" },
  C: { color: "#E65100", gradient: "linear-gradient(135deg,#E65100,#FB8C00)" },
  D: { color: "#B71C1C", gradient: "linear-gradient(135deg,#B71C1C,#E53935)" },
  E: { color: "#4A148C", gradient: "linear-gradient(135deg,#4A148C,#7B1FA2)" },
  F: { color: "#1565C0", gradient: "linear-gradient(135deg,#1565C0,#1E88E5)" },
  G: { color: "#F57F17", gradient: "linear-gradient(135deg,#F57F17,#FFB300)" },
  H: { color: "#BF360C", gradient: "linear-gradient(135deg,#BF360C,#E64A19)" },
};

export default function CycleItemIntakePage() {
  const params = useParams();
  const cycleId = params.cycleId as string;
  const domainId = (params.domainId as string)?.toUpperCase();
  const itemId = (params.itemId as string)?.toUpperCase();
  const domainStyle = DOMAIN_COLORS[domainId] || DOMAIN_COLORS.A;

  const [item, setItem] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({});
  const [evaluated, setEvaluated] = useState(false);
  const [aiEvaluationLoading, setAiEvaluationLoading] = useState(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AiEvalResultType | null>(null);

  useEffect(() => {
    api.get<ItemDetailResponse>(`/ref/evidence-items/${itemId}`)
      .then((data) => {
        if (data.item) {
          const controls: ControlRef[] = data.controls.map((c) => ({
            id: c.control_id,
            name: c.control_id,
            ma: c.is_primary ? "M" : "A",
          }));
          setItem({
            id: data.item.id,
            order: data.item.sort_order,
            name: data.item.name,
            priority: data.item.priority as EvidenceItem["priority"],
            type: data.item.evidence_type,
            controls,
            controlCount: data.item.control_count,
            description: data.item.description,
            evidenceDescription: data.item.evidence_description ?? null,
            sufficiencyDefinition: data.item.sufficiency_definition ?? null,
            evaluationCriteria: data.item.evaluation_criteria ?? null,
            inputs: [],
            sufficiency: [],
            reductionNote: data.item.reduction_note || "",
            perSystem: data.item.per_system,
            perZone: data.item.per_zone,
            perQuarter: data.item.per_quarter,
            perAccessPoint: data.item.per_access_point,
            isAdvisory: data.item.is_advisory,
            conditional: data.item.is_conditional,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [itemId]);

  const updateField = useCallback((key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setEvaluated(false);
    setAiEvaluationResult(null);
  }, []);

  const markFileUploaded = useCallback((key: string) => {
    setUploadedFiles((p) => ({ ...p, [key]: true }));
    setEvaluated(false);
    setAiEvaluationResult(null);
  }, []);

  const handleEvaluateEvidence = useCallback(() => {
    if (!item || !cycleId) return;
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
        { evidence_item_id: item.id, submission_id: null }
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
  }, [item, cycleId]);

  const completionPct = useMemo(() => {
    if (!item || !item.inputs.length) return 0;
    const filled = item.inputs.filter((inp) => formData[inp.id] || uploadedFiles[inp.id]).length;
    return Math.round((filled / item.inputs.length) * 100);
  }, [item, formData, uploadedFiles]);

  const controlScores = useMemo(() => {
    if (!item) return {};
    const scores: Record<string, number> = {};
    item.controls.forEach((c) => { scores[c.id] = completionPct; });
    return scores;
  }, [item, completionPct]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  if (!item) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Item not found or not in your architecture scope.</p>
        {cycleId && domainId && (
          <Link href={`/cycles/${cycleId}/domains/${domainId}`} className="text-blue-600 text-sm mt-2 inline-block">Back to Domain {domainId}</Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        {cycleId && (
          <Link href={`/cycles/${cycleId}/dashboard`} className="hover:text-blue-600">Dashboard</Link>
        )}
        {cycleId && domainId && (
          <>
            <span>/</span>
            <Link href={`/cycles/${cycleId}/domains/${domainId}`} className="hover:text-blue-600">Domain {domainId}</Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-gray-700">{item.id} — {item.name}</span>
      </div>
      <div className="rounded-xl p-5 text-white mb-5" style={{ background: domainStyle.gradient }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative" style={{ width: 56, height: 56 }}>
            <svg width={56} height={56} className="-rotate-90">
              <circle cx={28} cy={28} r={24} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={4} />
              <circle cx={28} cy={28} r={24} fill="none" stroke="white" strokeWidth={4}
                strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - completionPct / 100)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{completionPct}%</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold">{item.id}</span>
              <span className="text-base font-semibold">{item.name}</span>
              <PriorityBadge priority={item.priority} />
            </div>
            <p className="text-xs opacity-80 mt-1">{item.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.controls.map((c) => <ControlBadge key={c.id} id={c.id} ma={c.ma} />)}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="space-y-3">
          <EvidenceCriteriaSections
            evidenceDescription={item.evidenceDescription}
            sufficiencyDefinition={item.sufficiencyDefinition}
            evaluationCriteria={item.evaluationCriteria}
            evaluationState={!evaluated ? "idle" : aiEvaluationLoading ? "loading" : "done"}
            sufficiencyResults={aiEvaluationResult?.sufficiency_results ?? null}
            criteriaResults={aiEvaluationResult?.criteria ?? null}
          />
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Evidence Inputs</div>
            <div className="space-y-4">
              {item.inputs.length > 0 ? (
                item.inputs.map((input) => (
                  <EvidenceInputRenderer key={input.id} input={input}
                    value={formData[input.id] || ""}
                    onChangeValue={(val) => updateField(input.id, val)}
                    onFileUpload={(key) => markFileUploaded(key)} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Evidence inputs are configured at the detailed intake level.</p>
                  <p className="text-xs mt-1">Upload files and fill in evidence details to proceed.</p>
                </div>
              )}
            </div>
          </div>
          <button onClick={handleEvaluateEvidence}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors"
            style={{ background: domainStyle.color }}>
            🤖 Evaluate Evidence Sufficiency
          </button>
          {evaluated && (
            <>
              <AiEvaluationResult
                result={aiEvaluationResult}
                loading={aiEvaluationLoading}
                placeholder={!aiEvaluationLoading && !aiEvaluationResult}
              />
              <EvaluationResults score={completionPct} />
            </>
          )}
        </div>
        <div className="space-y-3">
          <SufficiencyPanel dimensions={item.sufficiency} color={domainStyle.color} />
          <PerControlPanel items={item.perControlSufficiency} />
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Control Impact</div>
            {item.controls.map((c) => {
              const score = controlScores[c.id] ?? 0;
              return (
                <div key={c.id} className="flex items-center gap-2 py-1 text-[11px]">
                  <ControlBadge id={c.id} ma={c.ma} />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: getStatusColor(score) }} />
                  </div>
                  <span className="font-bold w-8 text-right" style={{ color: getStatusColor(score) }}>{score}%</span>
                  <span className="w-3" style={{ color: getStatusColor(score) }}>{getStatusIcon(score)}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
            <span className="font-semibold">Effort Saving:</span> {item.reductionNote}
          </div>
        </div>
      </div>
    </div>
  );
}
